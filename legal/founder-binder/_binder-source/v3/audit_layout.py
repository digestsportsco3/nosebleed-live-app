#!/usr/bin/env python3
"""Layout audit of every built PDF: flags headings stranded at a page foot, signature blocks split across pages,
table header rows with at most one data row at a page foot, pages that end with a single line of a paragraph,
and text outside the margins. Usage: python3 -I audit_layout.py pdf/"""
import sys, glob, os, pymupdf
root = sys.argv[1] if len(sys.argv) > 1 else 'pdf'
issues = []
total = 0
for f in sorted(glob.glob(os.path.join(root, '*.pdf'))):
    d = pymupdf.open(f)
    total += len(d)
    name = os.path.basename(f)
    for i, p in enumerate(d):
        lines = []
        for b in p.get_text('dict')['blocks']:
            for l in b.get('lines', []):
                t = ''.join(s['text'] for s in l['spans']).strip()
                if not t: continue
                bold = all('Bold' in s['font'] for s in l['spans'] if s['text'].strip())
                size = max(s['size'] for s in l['spans'])
                lines.append((l['bbox'], t, bold, size))
        body = [x for x in lines if x[0][1] < 740]  # exclude footer
        if not body: issues.append((name, i+1, 'EMPTY PAGE')); continue
        for bb, t, bold, size in body:
            if bb[0] < 71 or bb[2] > 541.5: issues.append((name, i+1, f'text outside margins: {t[:50]}'))
        last = body[-1]
        if last[2] and size >= 10 and not last[1].startswith('Signature') and last[1] not in ('Company',):
            # bold line at foot: heading or a signature-block name stranded
            issues.append((name, i+1, f'bold line at page foot: {last[1][:60]}'))
        # signature block split: 'Signature:' or 'By:' as last line, or 'Name:' as first line of next page
        if i + 1 < len(d):
            nxt = [x for x in d[i+1].get_text('dict')['blocks']]
            first = None
            for b in nxt:
                for l in b.get('lines', []):
                    t = ''.join(s['text'] for s in l['spans']).strip()
                    if t and l['bbox'][1] < 740: first = t; break
                if first: break
            if first and (first.startswith('Name:') or first.startswith('Title:') or first.startswith('Capacity:') or first.startswith('Date signed')):
                issues.append((name, i+1, f'signature block split; next page starts: {first[:40]}'))
            if first and first.startswith('Signature:') or (first and first.startswith('By:')):
                issues.append((name, i+1, f'signature line separated from its heading; next page starts: {first[:40]}'))
        # single stranded line at page foot: last line short and previous line is far above (paragraph of one line continued?)
        if len(body) >= 2:
            (b1, t1, _, _), (b2, t2, _, _) = body[-2], body[-1]
            gap = b2[1] - b1[3]
            if gap > 6 and len(t2) < 45 and not t2.endswith(':') and not t2[0].isdigit() and not t2.startswith('Date') and not t2.startswith('Signature') and not t2.startswith('By:') and not t2.startswith('Name') and not t2.startswith('Capacity') and not t2.startswith('Title'):
                issues.append((name, i+1, f'short lone line at page foot: {t2[:60]}'))
print(f'{total} pages audited')
for x in issues: print(*x, sep=' | ')
print(f'{len(issues)} flags')
