# Founder binder handoff

## Current state (2026-11-12)

- **v3 is the current binder.** Generator: `_binder-source/v3/` (helpers.js, oa.js, schedule_f.js, core_a.js, core_b.js, founder_docs.js, main.js, build_pdf.sh, audit_layout.py, audit_refs.py, md2pdf.py). README.txt there has build steps, the Chromium traps and the change history. `_binder-source/v1/` is the superseded first draft, kept only as history; v2 is in git history (the folder was renamed to v3).
- Deliverable: `Nosebleed Sports LLC - Founder Closing Documents v3.zip` (37 PDFs, flat; document 36 is Nick's Member Proxy and Limited Power of Attorney naming Gabriel DiDario). Every PDF in the zip is md5-identical to `_binder-source/v3/pdf/` at the time of the last build (the `pdf/`, `html/` and `txt/` folders are gitignored; rebuild with `node main.js && ./build_pdf.sh`, then regenerate `txt/` with pdftotext -layout before running audit_refs.py).
- Structure, from Nick's two rounds of answers on 2026-11-12: no cash purchase; JGN's payments (about $12,990, itemized in Schedule C and document 14, including $500 of formation cost) are the capital of the four JGN owners, about $3,247.50 each, never a loan and, since 2026-11-13, carrying no preference (every distribution is pro rata by units); Christian Clark's Class A units and Brock Smith's Initial Class B units are issued for services with a small taxable value at closing (about $0.0016 a unit); Christian's unvested units are repurchased at fair value on any departure (OA 6.4); Brock's Milestone Units remain profits interests; 70% vote (any four of five); Nick's own consent also needed for a sale, new units, OA amendments and any change of CEO (OA 5.7); votes about one person need three of the other four (65% of Disinterested Ownership); if Nick cannot act, Gabriel then Christian acts as CEO (OA 4.8); spending CEO $5,000 / officers $2,000 / $5,000–$25,000 CEO plus two / above that a vote; OA 6.12 full payout if a buyer ends a founder's service; Brock gets 150,000 fully vested Class B units through a First Amendment to his talent agreement (document 31), which he signs; Nick signs the JGN Agreement and the amendment for both JGN and the company; Christian has no role in JGN matters; no other company is mentioned anywhere.
- The Glover redemption agreement (effective 2026-11-11) still shapes document 19 (brand licensed and never sold; no social account, handle or brand domain moves; platform revenue collected by the company directly), but at Nick's request his name and that agreement are not mentioned in any of the 36 documents. The reasoning and the disclosure risks are in the Decisions document, Part 3. Do not put his name back without Nick asking.
- Schedule F (approved by Nick) now includes the planned Nosebleed Sports Fantasy feature (also covered by the OA 11.5 non-compete as clause (d)) and Brock's planned podcast, which the company owns (document 19 puts company podcasts in the Field). Backup CTO: Stephen, then Michael (OA 4.8). Brock may sign document 31 without first being handed the OA; it is available on request and delivered within 10 days after closing.
- Review passes run on v2: scripted layout audit, cross-reference audit, figure audit, margin-extent check, banned-word battery; two full visual passes of every page image; a full line read with cross-document consistency check; scenario tracing (13 scenarios) plus hostile reads from four sides and a tax-coherence read; then a focused re-check of every provision changed in response, a second focused re-check of the v3 changes, and a full pre-signing review (two OA line reads, record documents, agreements against the base talent agreement, two full visual passes of all 162 pages; about 60 fixes, listed in the Decisions document Part 7 and README). Reviewers ran on Sonnet.
- Companions (all v3): Binder Guide (Nick only), Founder Summary, Email to Founders, Decisions and Questions for Nick. The guide, summary and decisions ledger also exist as PDFs built with `_binder-source/v3/md2pdf.py`.

## Open with Nick (see the Decisions document, Parts 4 to 6)

1. Brock's podcast contract (company and Brock), to be added to the record book once signed.
2. Which domain the app runs on (for the account schedule after closing).
3. CPA confirmation of the taxable value of Christian's and Brock's units (about $3,227.33 and $242.05) and Christian's 83(b) election within 30 days of closing.
5. Confirm Christian's fair-value buyback of unvested units on any departure (Decisions Part 4, item 0).
4. The five risks drafting cannot remove (Decisions Part 6).

Answered and built in: Nick's veto (yes); power of attorney naming Gabe (document 36); acting CEO (Gabriel, then Christian); acting CTO (Stephen, then Michael); podcast owned by the company; non-compete covers fantasy; Brock may sign without the OA in hand; Brock's 1.5% (left vested); Glover wrote nothing for the platform; $500 formation cost; Schedule F approved.

## Rules that still apply

- Never touch Nosebleed production, never rotate or regenerate any key or credential, never put credentials in documents, never mention AI or automation in anything published, never edit another company's files.
- No status labels on documents, no "pending review" language in documents; raise legal risk in chat and in the Decisions document.
- Target closing date: Friday, November 20, 2026. Brock's agreement requires the Operating Agreement to be adopted by January 22, 2027.

## Next session

1. Get Nick's answers to the open items; apply them in `_binder-source/v3/` (facts in helpers.js, rules in oa.js, JGN terms in core_b.js doc 19, Brock in founder_docs.js).
2. Rebuild, run `audit_layout.py`, `audit_refs.py`, the margin-extent check and the word battery, look at every changed page, re-zip (`zip -X -j`), unzip to a temp folder and compare md5s with `pdf/`.
3. Regenerate the companion PDFs with md2pdf.py and re-check them against the binder text.
4. Commit and push after every build; report the commit hash.
