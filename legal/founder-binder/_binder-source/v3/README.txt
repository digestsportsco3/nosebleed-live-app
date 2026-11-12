Nosebleed Sports LLC – Founder Closing Binder – generator source v2
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
00–24 fixed. With N Founders (5) and C Contributing Founders (4): Restricted Unit
Issuance Agreements are 25..(25+N−1) = 25–29; the Brock Smith Class B Unit Issuance
Record is 25+N = 30; the First Amendment to the Talent Agreement is 26+N = 31;
Capital Contribution receipts are (27+N)..(26+N+C) = 32–35 (the Service Founder has
no receipt). The numbers are computed in helpers.js and every cross-reference reads
them from there.

Build
-----
1. node main.js                       -> html/
2. ./build_pdf.sh                     -> pdf/   (CHROME=/path/to/chrome to override)
3. cd pdf && zip -X "../../../Nosebleed Sports LLC - Founder Closing Documents v2.zip" *.pdf
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

Chromium trap found in v2: a <strong> run-in heading at the start of a multi-line
justified paragraph makes Chrome lay the whole document out one pixel too wide
(text and table borders reach x=540.7pt instead of 540.0, and table right borders
are clipped). Section headings are therefore plain weight, as in the TLNT binder.
After every build, check that no line or table edge exceeds 540.3pt.

History
-------
v1 (2026-11-12): first full draft, 153 pages. Founders bought units for cash at
$0.001; JGN funding was a no-interest loan; 75% votes; Brock admitted without
signing. Superseded.

v2 (2026-11-12): rebuilt from Nick's answers to the 14 questions and the Glover
redemption agreement.
 - No cash purchase. JGN's payments (about $12,490, itemized) are the Capital
   Contributions of the four JGN owners, about $3,122.50 each, returned first under
   OA 10.5(a); no loan. Cost-based FMV equal to that amount.
 - Christian Clark's Class A units and Brock Smith's Class B units are profits
   interests issued for services ("Service Units").
 - 70% uniform vote (any four of five founders). JGN ownership never disqualifies.
 - Spending: CEO $5,000; officers $2,000; $5,000–$25,000 CEO plus two founders;
   above $25,000 a vote. CEO sole bank signer; Chase; account not a closing condition.
 - OA 6.12: 100% acceleration and full payout if a buyer ends a founder's service.
 - Brock: 150,000 Class B units fully vested; First Amendment to his Talent Agreement
   added as document 31 (he signs it; contains his joinder); milestones restated.
 - Glover redemption (effective 2026-11-11) reflected: JGN is four owners at 25%;
   the JGN Agreement licenses and never sells the brand, transfers no social account,
   handle or brand domain, and has the company collect platform revenue directly.
 - Nicholas Restivo signs the JGN Agreement and the Talent Amendment for both JGN
   and the company; Christian Clark countersigns only the CEO's own unit agreement
   and receipt. All references to other companies removed.
 - Definitions in the OA are now numbered automatically (oa.js TERMS / R()).
Review passes on v2: scripted layout, cross-reference and figure audits; banned-word
battery; two full visual passes (every page image) and a full line read with
cross-document consistency check on Sonnet reviewers; scenario tracing and hostile
reads on a Sonnet reviewer.

v2 stress-test fixes (2026-11-12, after the scenario and hostile-read report):
 - Votes measured by Disinterested Ownership: at least three Members holding 65%
   (helpers.js DVOTE), which is any three of the other four founders. 70% was 20,000
   units short for a vote about a 13% holder.
 - Repurchase mechanics: Original Cost is measured at the repurchase; Unreturned
   Capital falls only by the price actually paid; capital follows transferred Units;
   repurchase price carved out of OA 3.6 and JGN Agreement 7.3; deferred payment when
   6 Del. C. 18-607 or cash prevents it; "termination date" defined.
 - OA 4.8 added (vacancies, acting officers, emergency credential changes).
 - OA 6.12 / 7.5: death or Disability after a sale covered; post-sale Cause needs
   notice and cure; independent escrow; no set-off; acquirer must be bound.
 - OA 12.1: 90 days, decided by the disinterested founders.
 - Threshold Amount rewritten (what counts, where diverted amounts go, order,
   recipient's valuation right); 350,000 Reserved Units set aside for Milestone Units.
 - Later JGN Contributions credited equally unless all four agree; must be approved
   expenses and reported. Quarterly budget by Supermajority Approval (OA 4.3).
 - Talent Amendment takes effect on the Issuance Date (the Actual Closing Date) and
   lapses with a failed closing; Brock receives the OA before signing.
 - JGN Agreement: units removed from the consideration recital; handles removed from
   the Brand definition; DNS wording narrowed; stray Field revenue held in trust;
   funding-stop notice to every Class A Member; creditor/solvency statement and
   indemnity; section 6 survives.
 - Not changed (business terms, listed for Nick in the Decisions document): no
   acceleration for a Good Leaver before a sale; Brock's percentages measured on
   fully diluted units at issuance under his base agreement; no cap on JGN funding.
 - A focused re-check of every changed provision followed; its 15 conforming fixes
   are applied (price stated in total, Disability after a sale, doc 17 and 4.8,
   summaries in docs 00, 12, 14, 16, 20, Talent Amendment 5.6).

v3 (2026-11-12): Nick's second round of answers. The generator folder was renamed
from v2 to v3 (git history has v2).
 - OA 5.7: Nicholas Restivo's written consent is also required for a sale, merger or
   dissolution; new units, members or authorized units; any OA amendment; and any
   change of the CEO. Personal, ends with his Continuous Service and at a sale.
 - OA 4.8: Gabriel DiDario (CMO) acts as CEO if the CEO cannot, then Christian Clark.
 - $500 formation and registered-agent cost added to the expense list: total $12,990,
   $3,247.50 per Contributing Founder (helpers.js HIST).
 - The former JGN member is no longer named anywhere and the JGN Agreement no longer
   defines his redemption agreement; the three protections it requires remain, worded
   generally (brand licensed not sold; no social account or handle moves; the company
   collects Field revenue directly). The reasoning lives in the Decisions document and
   the Nick-only guide, not in the binder.
 - Schedule F: Nosebleed Sports Fantasy added as a planned Company product (not added
   to OA 11.5); planned podcast noted; OA 2.5 covers paid-entry or prize fantasy
   contests; "fantasy sports leagues and games" added to the Field in document 19.
 - Brock Smith's Initial Units stay fully vested (Nick left the choice open).
Traps met in v3: audit_refs.py reads txt/, which must be regenerated after every
build (pdftotext -layout each PDF into txt/); and the 1px Chromium widening returned in
document 03 from an ordinary sentence, fixed by rewording it. Always rerun the
margin-extent check after any text change.
A focused re-check of the v3 changes followed; its eight fixes are applied (OA 4.8
rewritten so each office has its own stand-in rule, Section 5.7 referenced in 5.2,
11.5(c), 13.1 and the Reserved Units rows of documents 00, 10 and 22, document 03
wording for the formation cost, Schedule F product count).

v3, third round of answers (2026-11-12): backup CTO is the CIO, then the CDO (OA 4.8);
the company owns Brock's planned podcast (Schedule F; document 19 adds company podcasts
to the Field and excludes the Field from the Reserved Field); OA 11.5 adds clause (d),
fantasy leagues and contests; Brock may sign the Talent Amendment with the OA available on
request, and receives a copy within 10 days after closing (OA 3.7(b), documents 07, 21,
30, 31).

Full review before signing (2026-11-12): six Sonnet reviewers (two OA line reads, record
documents, agreements 18-35 against the base talent agreement, two full visual passes of all
162 page images) plus a scripted grammar battery. About 60 fixes applied (apply6-9 in the
session scratchpad); notable: 10.5 vote not needed for sale or wind-up proceeds, 1.64(iii)
capital extinguished on fair-value purchases, 4.8 resumption and vacancy, 1.11 restructured,
doc 31 deadline extension and forum carve-out. The 1px Chromium widening recurred from a
6.5 sentence and was fixed by rewording; td/th break-inside: avoid and .sigpage.flow added.

Document 36 added (2026-11-12): Nicholas Restivo Member Proxy and Limited Power of Attorney
naming Gabriel DiDario (founder_docs.js memberProxy; helpers POA_DOC, GABE; N_DOCS 37). OA 5.3
now permits proxies; OA 5.7 consent may be exercised by that attorney-in-fact. Listed in
documents 00, 07 and 21. Signature page flows (.sigpage.flow) to avoid a near-empty page.

