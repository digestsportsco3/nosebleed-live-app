# Stat Desk brand brief: items -> HTML -> PDF (headless Chromium).
# Lives in the repo so a container reset can't lose it (the scratchpad copy was
# wiped on 2026-10-16). Fonts are inlined from statdesk/fonts/fonts.css because
# the cloud Chromium can't reach Google Fonts.
#
#   from brief_pdf import page, table, SPLIT, POST, LOG, BOX
#   page(title, h1, sub, meta, flag, items, out_html, extra_html="")
#   then: chromium --headless --print-to-pdf=out.pdf file://out.html
import html, os

HERE = os.path.dirname(os.path.abspath(__file__))
fonts = open(os.path.join(HERE, "fonts", "fonts.css")).read()

SPLIT = "<span class='src'>MLB Stats API, regular-season career split.</span>"
POST = "<span class='src'>MLB Stats API postseason splits, one round at a time (Wild Card, Division, LCS, World Series), this October included.</span>"
LOG = "<span class='src'>MLB Stats API 2026 game log.</span>"
BOX = "<span class='src'>MLB Stats API official box scores, 2026 postseason.</span>"
STAND = "<span class='src'>MLB Stats API final 2026 standings splits.</span>"

css = """
:root{ --paper:#EFECE3; --ink:#141414; --red:#C8102E; --rule:#C9C3B4; --muted:#5A564C; }
@page{ size:Letter; margin:0.45in 0.5in; }
*{ box-sizing:border-box; }
html,body{ background:var(--paper); }
body{ margin:0; color:var(--ink); font-family:'Source Serif 4',Georgia,serif; font-size:9.4pt; line-height:1.38;
  -webkit-print-color-adjust:exact; print-color-adjust:exact; }
header{ display:flex; justify-content:space-between; align-items:flex-end; gap:18px;
  border-bottom:3px solid var(--ink); padding-bottom:9px; margin-bottom:10px; }
.eyebrow{ font-family:Oswald,sans-serif; font-weight:700; letter-spacing:.22em; text-transform:uppercase; font-size:8pt; color:var(--red); }
h1{ font-family:Oswald,sans-serif; font-weight:700; text-transform:uppercase; font-size:30pt; line-height:.95; margin:4px 0 5px; letter-spacing:.01em; }
h1 .r, .r{ color:var(--red); }
.sub{ font-style:italic; color:var(--muted); font-size:9.6pt; }
.meta{ text-align:right; font-family:Oswald,sans-serif; font-size:7.4pt; letter-spacing:.08em; text-transform:uppercase; color:var(--muted); line-height:1.55; max-width:2.9in; }
.meta b{ color:var(--ink); font-weight:600; }
.flag{ border:1px solid var(--rule); border-left:4px solid var(--red); padding:7px 10px; margin:0 0 12px; font-size:8.4pt; background:#F6F4EE; }
.flag b{ font-family:Oswald,sans-serif; font-weight:600; letter-spacing:.08em; text-transform:uppercase; font-size:7.8pt; }
.item{ border-top:1px solid var(--rule); padding:8px 0 9px; break-inside:avoid; page-break-inside:avoid; }
.top{ display:flex; align-items:baseline; gap:10px; }
.num{ font-family:Oswald,sans-serif; font-weight:700; font-size:17pt; color:var(--red); min-width:26px; line-height:1; }
.who{ font-family:Oswald,sans-serif; font-weight:600; font-size:12.2pt; text-transform:uppercase; letter-spacing:.02em; }
.team{ font-family:Oswald,sans-serif; font-size:7.6pt; letter-spacing:.12em; text-transform:uppercase; color:var(--muted); margin-left:9px; }
.body{ margin-left:36px; }
.stat{ font-family:Oswald,sans-serif; font-weight:500; font-size:14pt; margin:2px 0 4px; }
.stat em{ font-style:normal; color:var(--red); }
.verified{ font-size:8.6pt; margin-bottom:3px; }
.src{ color:var(--muted); font-style:italic; }
.tag{ display:inline-block; font-family:Oswald,sans-serif; font-size:6.4pt; letter-spacing:.12em; text-transform:uppercase;
  color:#fff; background:var(--ink); border-radius:2px; padding:1px 4px; margin-right:4px; vertical-align:1px; }
.row{ font-size:8.8pt; margin:2px 0; }
.lbl{ font-family:Oswald,sans-serif; font-weight:600; font-size:7.2pt; letter-spacing:.1em; text-transform:uppercase; color:var(--red); margin-right:6px; }
.kick{ white-space:pre-line; margin-top:5px; padding:5px 8px; background:#fff; border:1px solid var(--rule); font-size:9.6pt; font-weight:600; }
.kick .tag{ background:var(--red); }
.pb{ break-before:page; page-break-before:always; }
h2{ font-family:Oswald,sans-serif; font-weight:700; text-transform:uppercase; font-size:15pt; margin:6px 0 2px; }
h2 + .note{ font-size:8.2pt; color:var(--muted); font-style:italic; margin-bottom:6px; }
table.lu{ width:100%; border-collapse:collapse; font-size:8.6pt; margin-bottom:14px; }
table.lu th{ font-family:Oswald,sans-serif; font-weight:600; font-size:7.4pt; letter-spacing:.1em; text-transform:uppercase;
  text-align:right; border-bottom:2px solid var(--ink); padding:3px 5px; }
table.lu th:first-child, table.lu td:first-child{ text-align:left; }
table.lu td{ text-align:right; padding:3px 5px; border-bottom:1px solid var(--rule); font-variant-numeric:tabular-nums; }
table.lu tr.tot td{ font-weight:600; border-top:2px solid var(--ink); border-bottom:none; }
table.lu tr.never td{ color:var(--muted); font-style:italic; }
"""


def item(i, it, pb=False):
    return f"""<div class="item{' pb' if pb else ''}">
  <div class="top"><div class="num">{i}</div>
    <div><span class="who">{html.escape(it['who'])}</span><span class="team">{html.escape(it['team'])}</span></div></div>
  <div class="body">
    <div class="stat">{it['stat']}</div>
    <div class="verified"><span class="tag">Verified</span> {it['ver']}</div>
    <div class="row"><span class="lbl">Why it posts</span>{html.escape(it['why'])}</div>
    <div class="row"><span class="lbl">Also true</span>{html.escape(it['also'])}</div>
    <div class="kick"><span class="tag">Post as written</span> {html.escape(it['kick'])}</div>
  </div>
</div>"""


def table(title, note, head, rows, total=None):
    """rows: list of lists (strings). A row whose 2nd cell is 'never faced' renders muted."""
    th = "".join(f"<th>{html.escape(h)}</th>" for h in head)
    body = ""
    for r in rows:
        cls = " class='never'" if len(r) > 1 and r[1] == "never faced" else ""
        if cls:
            body += f"<tr{cls}><td>{html.escape(r[0])}</td><td colspan='{len(head) - 1}' style='text-align:left'>never faced</td></tr>"
        else:
            body += "<tr>" + "".join(f"<td>{html.escape(str(c))}</td>" for c in r) + "</tr>"
    if total:
        body += "<tr class='tot'>" + "".join(f"<td>{html.escape(str(c))}</td>" for c in total) + "</tr>"
    return f"<h2>{title}</h2><div class='note'>{note}</div><table class='lu'><tr>{th}</tr>{body}</table>"


def page(title, h1, sub, meta, flag, items, out, extra_html="", breaks=()):
    body = "".join(item(i + 1, it, (i + 1) in breaks) for i, it in enumerate(items))
    doc = f"""<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><title>{title}</title>
<style>{fonts}</style><style>{css}</style></head><body>
<header>
  <div>
    <div class="eyebrow">Big League Digest &middot; Stat Desk</div>
    <h1>{h1}</h1>
    <div class="sub">{sub}</div>
  </div>
  <div class="meta">{meta}</div>
</header>
<div class="flag">{flag}</div>
{body}
{extra_html}
</body></html>"""
    open(out, "w").write(doc)
    return out
