#!/usr/bin/env python3
"""Minimal Markdown to print-HTML/PDF for the companion documents (headings, paragraphs, bullets, numbered lists,
pipe tables, bold, italic, code). Usage: python3 -I md2pdf.py in.md out.pdf [chrome]"""
import sys, re, html, subprocess, os, tempfile, urllib.parse
src, out = sys.argv[1], sys.argv[2]
chrome = sys.argv[3] if len(sys.argv) > 3 else '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome'
def inline(s):
    s = html.escape(s, quote=False)
    s = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', s)
    s = re.sub(r'`(.+?)`', r'<code>\1</code>', s)
    s = re.sub(r'(?<![\w*])\*(?!\s)(.+?)(?<!\s)\*(?![\w*])', r'<em>\1</em>', s)
    return s
lines = open(src, encoding='utf-8').read().split('\n')
o = []; i = 0; title = ''
while i < len(lines):
    l = lines[i]
    if l.startswith('#'):
        n = len(l) - len(l.lstrip('#')); t = l[n:].strip()
        if n == 1 and not title: title = t
        o.append(f'<h{n}>{inline(t)}</h{n}>'); i += 1; continue
    if l.startswith('|'):
        rows = []
        while i < len(lines) and lines[i].startswith('|'):
            cells = [c.strip() for c in lines[i].strip().strip('|').split('|')]
            if not all(re.fullmatch(r':?-+:?', c) for c in cells): rows.append(cells)
            i += 1
        o.append('<table><thead><tr>' + ''.join(f'<th>{inline(c)}</th>' for c in rows[0]) + '</tr></thead><tbody>' +
                 ''.join('<tr>' + ''.join(f'<td>{inline(c)}</td>' for c in r) + '</tr>' for r in rows[1:]) + '</tbody></table>'); continue
    m = re.match(r'^(\s*)([-*]|\d+\.)\s+(.*)', l)
    if m:
        tag = 'ol' if m.group(2)[0].isdigit() else 'ul'; items = []
        while i < len(lines):
            m2 = re.match(r'^(\s*)([-*]|\d+\.)\s+(.*)', lines[i])
            if m2 and (m2.group(2)[0].isdigit()) == (tag == 'ol'):
                items.append([m2.group(3)]); i += 1
                while i < len(lines) and lines[i].startswith('   ') and not re.match(r'^\s*([-*]|\d+\.)\s', lines[i]):
                    items[-1].append(lines[i].strip()); i += 1
                # nested bullets under a numbered item
                sub = []
                while i < len(lines) and re.match(r'^\s{2,}[-*]\s', lines[i]) and tag == 'ol':
                    sub.append(re.sub(r'^\s*[-*]\s+', '', lines[i])); i += 1
                if sub: items[-1].append('<ul>' + ''.join(f'<li>{inline(s)}</li>' for s in sub) + '</ul>')
            else: break
        def li(parts):
            body = ' '.join(inline(p) if not p.startswith('<ul>') else '' for p in parts)
            tail = ''.join(p for p in parts if p.startswith('<ul>'))
            return f'<li>{body}{tail}</li>'
        o.append(f'<{tag}>' + ''.join(li(p) for p in items) + f'</{tag}>'); continue
    if l.strip() == '': i += 1; continue
    para = [l]; i += 1
    while i < len(lines) and lines[i].strip() and not lines[i].startswith(('#', '|')) and not re.match(r'^\s*([-*]|\d+\.)\s', lines[i]):
        para.append(lines[i]); i += 1
    o.append('<p>' + inline(' '.join(p.strip() for p in para)) + '</p>')
foot = html.escape(title).replace('"', '')
css = f'''@page {{ size: letter; margin: 1in; @bottom-center {{ content: "{foot} – Page " counter(page) " of " counter(pages); font-family: Georgia, "Liberation Serif", serif; font-size: 7.5pt; color: #222; }} }}
html {{ font-family: Georgia, "Liberation Serif", serif; font-size: 10.5pt; line-height: 1.42; color: #111; }} body {{ margin: 0; }}
h1 {{ font-size: 15pt; margin: 0 0 0.15in 0; }} h2 {{ font-size: 12pt; margin: 0.2in 0 0.08in 0; border-bottom: 0.6pt solid #333; padding-bottom: 0.03in; break-after: avoid; }} h3 {{ font-size: 11pt; margin: 0.14in 0 0.05in 0; break-after: avoid; }}
p {{ margin: 0 0 0.09in 0; text-align: justify; orphans: 2; widows: 2; }} li {{ margin: 0 0 0.04in 0; break-inside: avoid; }} ul, ol {{ margin: 0 0 0.09in 0.25in; padding: 0; }}
table {{ border-collapse: collapse; width: 100%; margin: 0.05in 0 0.14in 0; font-size: 9.5pt; }} th, td {{ border: 0.6pt solid #444; padding: 0.04in 0.06in; vertical-align: top; text-align: left; overflow-wrap: anywhere; }} th {{ background: #ececec; }} thead {{ display: table-header-group; }} tr {{ break-inside: avoid; }}
code {{ font-family: "Liberation Mono", monospace; font-size: 9pt; }}'''
doc = f'<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>{html.escape(title)}</title><style>{css}</style></head><body>' + '\n'.join(o) + '</body></html>'
tmp = os.path.join(tempfile.mkdtemp(), 'doc.html'); open(tmp, 'w', encoding='utf-8').write(doc)
subprocess.run([chrome, '--headless', '--disable-gpu', '--no-sandbox', '--no-pdf-header-footer', f'--print-to-pdf={out}', 'file://' + urllib.parse.quote(tmp)], check=True, capture_output=True)
print('wrote', out)
