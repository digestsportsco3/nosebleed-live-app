'use strict';
// Nosebleed Sports LLC founder closing binder, generator v2.
// Shared constants, the member table, CSS and the blocks every document uses.
// Modeled on the TLNT Connect v8.2 binder (read only; never edited here).

const CO = 'Nosebleed Sports LLC';
const CO_UP = 'NOSEBLEED SPORTS LLC';
const FORMED = 'August 7, 2026';
const DEFILE = '10727267';
const EIN = '42-4477699';
const RA = 'ZenBusiness Inc., 611 South DuPont Highway, Suite 102, Dover, DE 19901';
const ADDR = '105 Broadway, Rockville Centre, NY 11570';
const TALENT_DATE = 'September 24, 2026';
const TALENT_DEADLINE = 'January 22, 2027'; // 120 days after the Talent Agreement Effective Date (Talent Agreement Section 5.6)
const REDEMPTION_DATE = 'November 11, 2026'; // JGN Membership Interest Redemption and Release Agreement (Jacob Glover)
const BANK = 'JPMorgan Chase Bank, N.A. ("Chase")';

const AUTH_UNITS = 10000000;
const RESERVE = 1950000;
const VOTE = 70;                 // uniform approval threshold, percent of outstanding Class A Units
const VP = VOTE + '%';

// Historical operating expenses, all paid by JGN, as reported by the CEO on 2026-11-12. Amounts are approximate.
const HIST = [
  { cat: 'AI development subscriptions', what: 'Codex and Claude subscriptions for Nicholas Restivo, Christian Clark and Gabriel DiDario, used for work on the Platform', math: 'Approximately $1,000 per month for seven months (May through November 2026)', amount: 7000, when: 'May through November 2026' },
  { cat: 'Sports-data API', what: 'Subscription to the Ball Don\'t Lie sports-data API', math: 'Approximately $300 per month for seven months (May through November 2026)', amount: 2100, when: 'May through November 2026' },
  { cat: 'Odds-data API', what: 'Subscription for the sportsbook odds shown in the app', math: 'Approximately $300 per month for four months (May through August 2026), then approximately $30 per month for three months (September through November 2026)', amount: 1290, when: 'May through November 2026' },
  { cat: 'Hosting, storage and developer infrastructure', what: 'Hosting, storage and code-repository services for the app, including Railway and GitHub', math: 'Approximately $250 per month for seven months (May through November 2026)', amount: 1750, when: 'May through November 2026' },
  { cat: 'App-store costs', what: 'App-store developer costs for the app', math: 'One charge of approximately $250 in 2026', amount: 250, when: '2026' },
  { cat: 'Interface assets', what: 'Jerseys and helmets purchased as visual assets for the app\'s interface', math: 'One purchase of approximately $100 in November 2026', amount: 100, when: 'November 2026' },
];
const HIST_TOTAL = HIST.reduce((s, h) => s + h.amount, 0);                // $12,490
if (HIST_TOTAL !== 12490) throw new Error('historical expense math does not tie');

// Class A Members (the five Founders who sign). Order follows Nick's list.
const FOUNDERS = [
  { name: 'Nicholas Restivo', first: 'Nicholas', last: 'Restivo', office: 'Chief Executive Officer', short: 'CEO', units: 2000000, jgn: true, id: 'NBS-CU-0001', he: 'his',
    lane: 'Executive leadership, business strategy, product direction, partnerships, approved hiring, banking, JGN coordination and Company coordination.' },
  { name: 'Christian Clark', first: 'Christian', last: 'Clark', office: 'Chief Technology Officer', short: 'CTO', units: 2000000, jgn: false, id: 'NBS-CU-0002', he: 'his',
    lane: 'Completing the build of the app, the website and the Discord community platform; product architecture, engineering, infrastructure, security and technical delivery.' },
  { name: 'Gabriel DiDario', first: 'Gabriel', last: 'DiDario', office: 'Chief Marketing Officer', short: 'CMO', units: 1300000, jgn: true, id: 'NBS-CU-0003', he: 'his',
    lane: 'Marketing, growth, audience funnels from the media network into the Platform, brand campaigns, sponsorship support and creator coordination.' },
  { name: 'Stephen Bickel', first: 'Stephen', last: 'Bickel', office: 'Chief Information Officer', short: 'CIO', units: 1300000, jgn: true, id: 'NBS-CU-0004', he: 'his',
    lane: 'Information systems, website operations, internal tooling, documentation, information governance and vendor systems.' },
  { name: 'Michael Del Bene', first: 'Michael', last: 'Del Bene', office: 'Chief Data Officer', short: 'CDO', units: 1300000, jgn: true, id: 'NBS-CU-0005', he: 'his',
    lane: 'Data engineering, sports-data and odds pipelines, picks records and grading, analytics, data operations and data-provider relationships.' },
];
// Class B Member (does not sign; admitted on issuance under the Talent Agreement).
const BROCK = { name: 'Brock Smith', first: 'Brock', last: 'Smith', units: 150000, id: 'NBS-CB-0001', role: 'Co-Founder; handicapper and on-camera talent under the Talent Agreement' };
const CONTRIB = FOUNDERS.filter(f => f.jgn);                            // Contributing Founders: Nick, Gabriel, Stephen, Michael
const SERVICE = FOUNDERS.find(f => !f.jgn);                             // Service Founder: Christian Clark
const CONTRIB_EACH = HIST_TOTAL / CONTRIB.length;                       // $3,122.50
if (CONTRIB_EACH * CONTRIB.length !== HIST_TOTAL) throw new Error('contribution split does not tie');

const CLASS_A = FOUNDERS.reduce((s, f) => s + f.units, 0);           // 7,900,000
const CLASS_B = BROCK.units;                                            // 150,000
const OUTSTANDING = CLASS_A + CLASS_B;                                  // 8,050,000
if (CLASS_A + CLASS_B + RESERVE !== AUTH_UNITS) throw new Error('unit math does not tie');
const FMV_TOTAL = HIST_TOTAL;                                            // total company equity FMV = aggregate Capital Contributions

const CEO = FOUNDERS[0];
const CTO = FOUNDERS[1];
const JGN_MEMBERS = FOUNDERS.filter(f => f.jgn);                         // Nick, Gabriel, Stephen, Michael (25% each)
const N_FOUNDERS = FOUNDERS.length;                                      // 5
const RUPIA_FIRST = 25;                                                  // docs 25-29: Restricted Unit Issuance Agreements
const BROCK_DOC = RUPIA_FIRST + N_FOUNDERS;                              // doc 30: Class B Unit Issuance Record
const TALENT_AMEND_DOC = BROCK_DOC + 1;                                  // doc 31: First Amendment to the Talent Agreement
const RECEIPT_FIRST = TALENT_AMEND_DOC + 1;                              // docs 32-35: one receipt per Contributing Founder
const RECEIPT_LAST = RECEIPT_FIRST + CONTRIB.length - 1;                 // 35
const N_DOCS = RECEIPT_LAST + 1;                                         // 36 documents, 00-35

function money(n) { return '$' + n.toLocaleString('en-US', Number.isInteger(n) ? {} : { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
const APPROX_TOTAL = 'approximately ' + money(HIST_TOTAL);              // approximately $12,490
const APPROX_EACH = 'approximately ' + money(CONTRIB_EACH);             // approximately $3,122.50
function consideration(f) { return f.jgn ? 'Capital Contribution through JGN, ' + APPROX_EACH : 'Services (profits interest); no Capital Contribution'; }
function num(n) { return n.toLocaleString('en-US'); }
function pct(n, units, d) { return (100 * n / units).toFixed(d === undefined ? 0 : d) + '%'; }
function fdPct(units) { return pct(units, AUTH_UNITS, Number.isInteger(100 * units / AUTH_UNITS) ? 0 : 1); } // 20%, 13%, 1.5%
function outPct(units) { return pct(units, OUTSTANDING, 3); }
function votePct(units) { return pct(units, CLASS_A, 3); }
function vested(f) { return f.units / 2; }
function monthly(f) { return Math.floor(f.units / 2 / 48); }
function nb(name) { return '<span class="nb">' + name + '</span>'; }
function nbName(f) { return nb(f.name); }
function heDoc(n) { return String(n).padStart(2, '0'); }
const FOUNDER_NAMES_LIST = FOUNDERS.map(f => f.name);
function listAnd(arr) { return arr.length <= 1 ? arr.join('') : arr.slice(0, -1).join(', ') + ' and ' + arr[arr.length - 1]; }
const FOUNDERS_AND = listAnd(FOUNDER_NAMES_LIST);
const JGN_AND = listAnd(JGN_MEMBERS.map(f => f.name));

function pageCss(footer) {
  return `@page { size: letter; margin: 1in 1in 1.05in 1in;
  @bottom-center { content: "${footer.replace(/"/g, '\\"')} – Page " counter(page) " of " counter(pages); font-family: Georgia, "Liberation Serif", serif; font-size: 7.5pt; color: #222; } }`;
}
const CSS = `
html { font-family: Georgia, "Liberation Serif", "DejaVu Serif", serif; font-size: 10.5pt; line-height: 1.42; color: #111; }
body { margin: 0; }
.cover { text-align: center; margin: 0.35in 0 0.55in 0; }
.cover .co { font-size: 15pt; font-weight: bold; margin: 0 0 0.22in 0; }
.cover .t { font-size: 13.5pt; font-weight: bold; line-height: 1.45; text-wrap: balance; max-width: 4.6in; margin: 0 auto; }
h1 { font-size: 12pt; font-weight: bold; margin: 0 0 0.08in 0; padding-bottom: 0.04in; border-bottom: 0.6pt solid #333; text-wrap: balance; break-after: avoid; }
h2 { font-size: 11pt; font-weight: bold; margin: 0.18in 0 0.06in 0; text-wrap: balance; break-after: avoid; }
h3 { font-size: 10.5pt; font-weight: bold; margin: 0.14in 0 0.05in 0; text-wrap: balance; break-after: avoid; }
p { margin: 0 0 0.09in 0; text-align: justify; orphans: 2; widows: 2; text-wrap: pretty; }
p.sub { break-after: avoid; }
ul { margin: 0 0 0.09in 0.25in; padding: 0; }
li { margin: 0 0 0.04in 0; text-align: justify; break-inside: avoid; }
ul.tight li { margin: 0; }
table { border-collapse: collapse; width: 100%; margin: 0.05in 0 0.14in 0; font-size: 9.5pt; line-height: 1.35; }
th, td { border: 0.6pt solid #444; padding: 0.045in 0.06in; vertical-align: top; text-align: left; text-wrap: pretty; overflow-wrap: anywhere; }
table.small { font-size: 8.5pt; }
table.small th, table.small td { padding: 0.035in 0.04in; }
.keepblock { break-inside: avoid; }
th { background: #ececec; font-weight: bold; overflow-wrap: normal; }
p.keep { break-inside: avoid; }
p.keep.sub, p.sub { break-after: avoid; }
thead { display: table-header-group; }
tr { break-inside: avoid; }
tbody tr:first-child { break-before: avoid; }
table.kv td:first-child { width: 2.55in; font-weight: bold; background: #f3f3f3; }
table.kv2 td:first-child { width: 2.1in; font-weight: bold; background: #f3f3f3; }
table.kv2, table.keep { break-inside: avoid; }
table.w td:first-child, table.w th:first-child { width: 1.2in; }
table.w3 td:first-child, table.w3 th:first-child { width: 1.05in; } table.w3 td:last-child, table.w3 th:last-child { width: 1.25in; }
table.cap col.c1 { width: 1.1in; } table.cap col.c2 { width: 1.35in; }
table.hist td:first-child, table.hist th:first-child { width: 1.15in; } table.hist td:nth-child(4), table.hist th:nth-child(4) { width: 0.85in; } table.hist td:nth-child(5), table.hist th:nth-child(5) { width: 0.4in; }
table.schedc td:nth-child(3), table.schedc th:nth-child(3) { width: 0.95in; } table.schedc td:nth-child(4), table.schedc th:nth-child(4) { width: 0.5in; } table.schedc td:first-child, table.schedc th:first-child { width: 2.3in; }
.nb { white-space: nowrap; }
.sig { break-inside: avoid; margin: 0.08in 0 0.14in 0; }
.sig p { margin: 0 0 0.11in 0; text-align: left; }
.sig .who { font-weight: bold; }
.sigpage { break-before: page; }
.note { font-size: 9.5pt; }
.sp { height: 0.12in; }
.center { text-align: center; }
strong.lbl { font-weight: bold; }
`;

function doc(n, title, body, opts) {
  opts = opts || {};
  const company = opts.company || CO_UP;
  const coverTitle = opts.coverTitle || title;
  const h1 = opts.h1 || (company + ' ' + title);
  const footTitle = opts.footTitle || title;
  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><title>${CO} – ${heDoc(n)} – ${title}</title><style>${pageCss(company + ' – ' + footTitle)}${CSS}</style></head>
<body>
<div class="cover"><div class="co">${company}</div><div class="t">${coverTitle}</div></div>
<h1>${h1}</h1>
${body}
</body></html>`;
}

const DEFINED = `Capitalized terms used but not defined in this document have the meanings given in the Limited Liability Company Agreement of ${CO} (the "Operating Agreement").`;
const EFF = `<p><strong>Effective date:</strong> this document is dated and becomes effective on the Actual Closing Date, after all required approvals, signatures, contribution records and issuance actions have occurred. Under Section 2.8 of the Operating Agreement, the Actual Closing Date, the Transfer Date, the Valuation Date and the vesting commencement date are the same date unless the Operating Agreement is amended under Article 16 to provide otherwise. ${DEFINED}</p>`;
const DEF_ONLY = `<p>${DEFINED}</p>`;

// A cell that is only a figure (units, money, a percentage, an entry ID) never wraps.
function cell(c) {
  c = c === undefined ? '' : String(c);
  const plain = c.replace(/<\/?strong>/g, '');
  return /^(approximately )?[\d,.$%×= –-]+$|^NBS-C[AB]-\d+$/.test(plain) && plain.length ? c.replace(plain, '<span class="nb">' + plain + '</span>') : c;
}
function kv(rows, cls) {
  return `<table class="${cls || 'kv'}"><tbody>` + rows.map(r => `<tr><td>${r[0]}</td><td>${cell(r[1])}</td></tr>`).join('') + `</tbody></table>`;
}
function tbl(head, rows, cls, colgroup) {
  return `<table class="${cls || ''}">${colgroup || ''}<thead><tr>` + head.map(h => `<th>${h.length <= 5 ? '<span class="nb">' + h + '</span>' : h}</th>`).join('') + `</tr></thead><tbody>` +
    rows.map(r => `<tr>` + r.map(c => `<td>${cell(c)}</td>`).join('') + `</tr>`).join('') + `</tbody></table>`;
}
function coSig(label, signer, title) {
  signer = signer || CEO;
  return `<div class="sig"><p class="who">${label || 'Certified by the Company'}</p><p>${CO}</p><p>By: _________________________________________</p><p>Name: ${signer.name}</p><p>Title: ${title || signer.office}</p><p>Date signed: __________________________________</p></div>`;
}
function personSig(name, capacity, heading) {
  return `<div class="sig"><p class="who">${heading || name}</p><p>Signature: ____________________________________</p><p>Name: ${name}</p><p>Capacity: ${capacity}</p><p>Date signed: __________________________________</p></div>`;
}
function memberSigs(capacity) {
  return FOUNDERS.map(f => personSig(f.name, capacity ? capacity(f) : 'Member')).join('');
}
const CAP_COLS = '<colgroup><col class="c1"><col class="c2"></colgroup>';

module.exports = { CO, CO_UP, FORMED, DEFILE, EIN, RA, ADDR, TALENT_DATE, TALENT_DEADLINE, REDEMPTION_DATE, BANK, AUTH_UNITS, RESERVE, VOTE, VP, HIST, HIST_TOTAL, CONTRIB, SERVICE, CONTRIB_EACH, APPROX_TOTAL, APPROX_EACH, consideration, FOUNDERS, BROCK, CLASS_A, CLASS_B, OUTSTANDING, FMV_TOTAL, CEO, CTO, JGN_MEMBERS, N_FOUNDERS, RUPIA_FIRST, BROCK_DOC, TALENT_AMEND_DOC, RECEIPT_FIRST, RECEIPT_LAST, N_DOCS,
  money, num, pct, fdPct, outPct, votePct, vested, monthly, nb, nbName, heDoc, listAnd, FOUNDERS_AND, JGN_AND, CSS, doc, DEFINED, EFF, DEF_ONLY, kv, tbl, coSig, personSig, memberSigs, CAP_COLS };
