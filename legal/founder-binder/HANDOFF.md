# Founder binder handoff

## Current state (2026-11-12)

- v1 first full draft built, zipped and verified: `Nosebleed Sports LLC - Founder Closing Documents v1.zip` (36 PDFs, 153 pages; md5 of every PDF in the zip matches `_binder-source/v1/pdf/`).
- Generator: `_binder-source/v1/` (helpers.js, oa.js, schedule_f.js, core_a.js, core_b.js, founder_docs.js, main.js, build_pdf.sh). README.txt there has the build steps and Chromium notes.
- Review passes run on v1: scripted layout audit of every page (audit_layout.py), banned-word and TLNT-leftover battery, cross-reference audit (every "Section N.N" cited anywhere resolves to a real OA heading; audit_refs.py), figure audit (every dollar, unit and percentage figure is in the allowed set), and a full visual pass of every page image at 72 dpi. Fixed during the pass: Chrome shrinking the page because of over-wide tables; missing footers (string-set unsupported); figures breaking mid-number; narrow first columns in docs 00, 02, 03, 15, 22, 24 and Schedule A; one wrong cross-reference in Schedule C (JGN Funding Ledger is Section 7.1 of the JGN Agreement); the signature index listing Nick on company blocks Christian signs.
- Not yet run: scenario tracing (quit, firing, death, sale, failed closing, dispute, transfer), a hostile founder-side read, and a second independent line read. Nick's answers to the 14 open questions are needed before the next build.
- Companions: Decisions and Questions for Nick (the ledger of every default used), Binder Guide (Nick only) with the math, Founder Summary, Email to Founders. All are v1 and fact-checked against the v1 binder text by hand; the guide, summary and decisions ledger also exist as PDFs (built with `_binder-source/v1/md2pdf.py`).
- Open decisions that change the documents most: whether the platform tech is assigned to NSL (current draft) or only licensed; whether JGN's money is a loan (current) or forgiven; the 75% vote math; Christian's consent on JGN-deal changes; confirmation that JGN has four 25% owners (Glover out); Brock's 1.5% on top of, not instead of, his milestone units.
- Deadline from Brock's talent agreement: the Operating Agreement must be adopted by January 22, 2027 and his Initial Units issued within 30 days after.
- TLNT material: the TLNT binder zip and the handoff PDF were read in the session and are not stored in this repo (they belong to a different company). The TLNT generator source was not available; this generator was written fresh from the TLNT PDFs.

## Next session

1. Read `Nosebleed Sports LLC - Decisions and Questions for Nick.md` and get Nick's answers, five at a time.
2. Apply answers to `_binder-source/v1/helpers.js` (facts), `oa.js` (rules), `core_b.js` doc 19 (JGN terms) and the JGN Funding Ledger figures in docs 14 and Schedule C; bump to v2 in README.txt.
3. Rebuild (README.txt), run the three audits and the visual pass on the unzipped zip, then run the scenario-tracing and hostile-read passes.
4. Commit and push after every build.
