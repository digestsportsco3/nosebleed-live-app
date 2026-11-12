# Founder binder handoff

## Current state (2026-11-12)

- **v2 is the current binder.** Generator: `_binder-source/v2/` (helpers.js, oa.js, schedule_f.js, core_a.js, core_b.js, founder_docs.js, main.js, build_pdf.sh, audit_layout.py, audit_refs.py, md2pdf.py). README.txt there has build steps, the Chromium traps and the change history. `_binder-source/v1/` is the superseded first draft, kept only as history.
- Deliverable: `Nosebleed Sports LLC - Founder Closing Documents v2.zip` (36 PDFs, flat). Every PDF in the zip is md5-identical to `_binder-source/v2/pdf/` at the time of the last build (the `pdf/`, `html/` and `txt/` folders are gitignored; rebuild with `node main.js && ./build_pdf.sh`).
- v2 structure, from Nick's answers of 2026-11-12: no cash purchase; JGN's payments (about $12,490, itemized in Schedule C and document 14) are the capital of the four JGN owners, about $3,122.50 each, returned first (OA 10.5(a)), never a loan; Christian Clark's Class A units and Brock Smith's Class B units are profits interests; 70% vote (any four of five); votes about one person need three of the other four (65% of Disinterested Ownership); spending CEO $5,000 / officers $2,000 / $5,000–$25,000 CEO plus two / above that a vote; OA 6.12 full payout if a buyer ends a founder's service; Brock gets 150,000 fully vested Class B units through a First Amendment to his talent agreement (document 31), which he signs; Nick signs the JGN Agreement and the amendment for both JGN and the company; Christian has no role in JGN matters; no other company is mentioned anywhere.
- Glover redemption agreement (effective 2026-11-11) shapes document 19: the brand is licensed and never sold; no social account, handle or brand domain moves; platform revenue is collected by the company directly.
- Review passes run on v2: scripted layout audit, cross-reference audit, figure audit, margin-extent check, banned-word battery; two full visual passes of every page image; a full line read with cross-document consistency check; scenario tracing (13 scenarios) plus hostile reads from four sides and a tax-coherence read; then a focused re-check of every provision changed in response. Reviewers ran on Sonnet.
- Companions (all v2): Binder Guide (Nick only), Founder Summary, Email to Founders, Decisions and Questions for Nick. The guide, summary and decisions ledger also exist as PDFs built with `_binder-source/v2/md2pdf.py`.

## Open with Nick (see the Decisions document, Parts 4 to 6)

1. His own veto: keep "any four of five" or add Nick's consent to the big decisions.
2. Brock's 1.5%: vested now (current) or forfeitable for 12 months.
3. Whether Glover or anyone else wrote code or content for the platform (needs an IP assignment if so).
4. Whether formation or registered-agent fees paid by JGN are missing from the $12,490; which domain the app runs on.
5. Confirm or flip the five stress-test choices (Decisions Part 5), and read the five risks drafting cannot remove (Part 6): Glover and JGN creditors, the cost-based valuation, no acceleration for a good leaver before a sale, Brock's floating percentages, base documents not in the binder.

Schedule F was sent to Nick in chat for comments; none received yet.

## Rules that still apply

- Never touch Nosebleed production, never rotate or regenerate any key or credential, never put credentials in documents, never mention AI or automation in anything published, never edit another company's files.
- No status labels on documents, no "pending review" language in documents; raise legal risk in chat and in the Decisions document.
- Target closing date: Friday, November 20, 2026. Brock's agreement requires the Operating Agreement to be adopted by January 22, 2027.

## Next session

1. Get Nick's answers to the open items; apply them in `_binder-source/v2/` (facts in helpers.js, rules in oa.js, JGN terms in core_b.js doc 19, Brock in founder_docs.js).
2. Rebuild, run `audit_layout.py`, `audit_refs.py`, the margin-extent check and the word battery, look at every changed page, re-zip (`zip -X -j`), unzip to a temp folder and compare md5s with `pdf/`.
3. Regenerate the companion PDFs with md2pdf.py and re-check them against the binder text.
4. Commit and push after every build; report the commit hash.
