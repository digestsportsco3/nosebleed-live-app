#!/usr/bin/env python3
"""Visual QA for generated agreement PDFs. MUST pass before any PDF is delivered.

Checks every page of every PDF given (or every *.pdf in the directory):
  1. text outside the page margins (right/left overflow of table cells or long lines)
  2. overlapping words (text drawn on top of other text, e.g. a fixed-height table row
     that is too short for its wrapped contents)
  3. orphan underscore lines (a signature/date line that wrapped onto its own line)
  4. any word clipped by the page edge
  5. near-empty pages (a stray page holding only a heading or a few words)
Renders every flagged page to qa_out/<pdf>-p<N>.png for a human look, and always renders the
last two pages of each PDF (signature pages) so they can be eyeballed.

Usage:  python3 qa_pdf.py [file.pdf ...]      exit 1 if anything is flagged.
"""
import glob
import os
import sys

import fitz  # pymupdf

LEFT_MARGIN_MIN = 0.75 * 72   # generators use 0.85"–0.9" margins; allow a little slack
RIGHT_MARGIN_MIN = 0.75 * 72
TOL = 2.0
OUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "qa_out")


def page_issues(page):
    issues = []
    W, H = page.rect.width, page.rect.height
    words = page.get_text("words")  # x0, y0, x1, y1, word, block, line, wordno
    if len(words) < 12 and page.number > 0:
        issues.append("near-empty page (%d words)" % len(words))
    for x0, y0, x1, y1, w, *_ in words:
        if x1 > W - RIGHT_MARGIN_MIN + TOL:
            issues.append("right overflow: %r ends at %.0fpt (limit %.0f)" % (w, x1, W - RIGHT_MARGIN_MIN))
        if x0 < LEFT_MARGIN_MIN - TOL:
            issues.append("left overflow: %r starts at %.0fpt" % (w, x0))
        if x1 > W - 4 or x0 < 4 or y1 > H - 4 or y0 < 4:
            issues.append("clipped at page edge: %r" % w)
    # overlapping words (skip same line)
    rects = [(fitz.Rect(x0, y0, x1, y1), w, b, l) for x0, y0, x1, y1, w, b, l, _ in words]
    for i in range(len(rects)):
        ri, wi, bi, li = rects[i]
        for j in range(i + 1, len(rects)):
            rj, wj, bj, lj = rects[j]
            if bi == bj and li == lj:
                continue
            inter = ri & rj
            if inter.is_empty:
                continue
            small = min(ri.get_area(), rj.get_area())
            if small > 0 and inter.get_area() / small > 0.35:
                issues.append("overlapping text: %r / %r" % (wi, wj))
    # orphan underscore lines
    for block in page.get_text("dict")["blocks"]:
        for line in block.get("lines", []):
            txt = "".join(sp["text"] for sp in line["spans"]).strip()
            if txt and set(txt) <= set("_ ") and len(txt) >= 4:
                issues.append("orphan underscore line (a signature/date line wrapped): %r" % txt[:20])
    # de-duplicate, keep order
    seen, out = set(), []
    for it in issues:
        if it not in seen:
            seen.add(it); out.append(it)
    return out


def render(doc, pno, tag):
    os.makedirs(OUT_DIR, exist_ok=True)
    pix = doc[pno].get_pixmap(dpi=80)
    path = os.path.join(OUT_DIR, "%s-p%d.png" % (tag, pno + 1))
    pix.save(path)
    return path


def main(paths):
    bad = 0
    for path in paths:
        doc = fitz.open(path)
        tag = os.path.splitext(os.path.basename(path))[0]
        flagged = {}
        for page in doc:
            iss = page_issues(page)
            if iss:
                flagged[page.number] = iss
        for pno in range(max(0, len(doc) - 2), len(doc)):
            render(doc, pno, tag)
        for pno, iss in flagged.items():
            render(doc, pno, tag)
        status = "FAIL" if flagged else "ok  "
        print("%s %-70s %2d pp" % (status, os.path.basename(path), len(doc)))
        for pno, iss in flagged.items():
            bad += 1
            for it in iss[:8]:
                print("       p%-3d %s" % (pno + 1, it))
            if len(iss) > 8:
                print("       p%-3d ... %d more" % (pno + 1, len(iss) - 8))
    print("\n%s — renders in %s" % ("ALL CLEAN" if not bad else "%d PAGE(S) FLAGGED" % bad, OUT_DIR))
    return 1 if bad else 0


if __name__ == "__main__":
    args = sys.argv[1:] or sorted(glob.glob(os.path.join(os.path.dirname(os.path.abspath(__file__)), "*.pdf")))
    sys.exit(main(args))
