Nosebleed Sports LLC – Founder Closing Binder – generator source v1
===================================================================

Built 2026-11-12 in a Claude Code cloud session, modeled on the TLNT Connect LLC
v8.2 binder (37 PDFs, read only; TLNT's generator source was not available, so this
generator was written from the TLNT PDFs). Nosebleed's binder keeps its own version
history from v1.

Files
-----
helpers.js      company constants, the member table and all cap-table math, CSS,
                the page footer, shared table and signature blocks
oa.js           document 01, the Operating Agreement (Articles 1–16, Schedules A–F)
schedule_f.js   Schedule F, the business description and product scope
core_a.js       documents 00 and 02–13
core_b.js       documents 14–24
founder_docs.js documents 25–29 (RUPIAs), 30 (Brock Smith Class B record), 31–35 (receipts)
main.js         writes html/ and html/manifest.txt
build_pdf.sh    prints every HTML file to pdf/ with headless Chromium
audit_layout.py scripted layout audit of every page (stranded lines, split signature blocks)
audit_refs.py   every "Section N.N" citation checked against the OA headings; every
                dollar, unit and percentage figure checked against the allowed set

Document numbering (36 documents, 00–35)
----------------------------------------
00–24 fixed. With N signing Founders: RUPIAs are 25..(25+N−1), the Brock Smith
Class B Unit Issuance Record is 25+N, receipts are (26+N)..(25+2N). N = 5 here,
so 25–29, 30, 31–35. The numbers are computed in helpers.js (RUPIA_FIRST,
BROCK_DOC, RECEIPT_FIRST, RECEIPT_LAST) and every cross-reference in documents
00, 21 and 24 reads them from there.

Build
-----
1. node main.js                       -> html/
2. ./build_pdf.sh                     -> pdf/   (CHROME=/path/to/chrome to override)
3. cd pdf && zip -X "../../../Nosebleed Sports LLC - Founder Closing Documents v1.zip" *.pdf
4. unzip to a temp folder and compare md5s with pdf/ before calling it done.
5. python3 -I audit_layout.py pdf/ ; pdftotext each PDF to txt/ ; python3 -I audit_refs.py

Chromium notes (Chrome for Testing 153): @page margin boxes work and carry the
"COMPANY – TITLE – Page X of Y" footer; CSS string-set/string() is not supported and
silently kills the whole @page rule, so the footer title is embedded literally per
document. A table wider than the page makes Chrome shrink the whole document, so
every wide table has explicit column widths (table.scheda, table.cap, .w, .w3) and
figures are wrapped in .nb so they never break mid-number.

Fonts: Georgia is not installed in the cloud container; the stack falls back to
Liberation Serif. On a machine with Georgia the PDFs will use Georgia and run a
little longer; rebuild and re-run the visual pass there.

Rules carried from TLNT
-----------------------
No status labels (no Draft/Final/Execution Version/Confidential/version numbers) in
any document. No "pending attorney/CPA review" language. Credentials and API keys
never appear; the account schedule lists categories and owners only. Founders'
personal details stay out. Each per-founder agreement gets its own signature page.

v1 history
----------
v1 (2026-11-12): first full draft. 153 pages. Structure decisions are listed in
"../../Nosebleed Sports LLC - Decisions and Questions for Nick.md"; nothing in the
documents is a guessed fact, but several terms are defaults Nick has to confirm.
Review passes run on v1: scripted layout audit (every page), banned-word and
leftover battery, cross-reference audit (every OA citation resolves), figure audit,
and a full visual pass of every page image at 72 dpi. The zip md5 matches the build.
