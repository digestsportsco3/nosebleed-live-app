'use strict';
// Nosebleed Sports LLC founder closing binder, generator v1.
// Shared constants, the member table, CSS and the blocks every document uses.
// Modeled on the TLNT Connect v8.2 binder (read only; never edited here).

const CO = 'Nosebleed Sports LLC';
const CO_UP = 'NOSEBLEED SPORTS LLC';
const FORMED = 'August 7, 2026';
const DEFILE = '10727267';
const EIN = process.env.NSL_EIN || '[EIN: from the private record]'; // never commit the real EIN; this repo is public
const RA = 'ZenBusiness Inc., 611 South DuPont Highway, Suite 102, Dover, DE 19901';
const ADDR = '105 Broadway, Rockville Centre, NY 11570';
const TALENT_DATE = 'September 24, 2026';
const TALENT_DEADLINE = 'January 22, 2027'; // 120 days after the Talent Agreement Effective Date (Talent Agreement Section 5.6)

const AUTH_UNITS = 10000000;
const RESERVE = 1950000;
const PRICE = 0.001;

// Class A Members (the five Founders who sign). Order follows Nick's list.
const FOUNDERS = [
  { name: 'Nicholas Restivo', first: 'Nicholas', last: 'Restivo', office: 'Chief Executive Officer', short: 'CEO', units: 2000000, jgn: true, id: 'NBS-CU-0001', he: 'his',
    lane: 'Executive leadership, business strategy, product direction, partnerships, approved hiring, JGN coordination and Company coordination.' },
  { name: 'Christian Clark', first: 'Christian', last: 'Clark', office: 'Chief Technology Officer', short: 'CTO', units: 2000000, jgn: false, id: 'NBS-CU-0002', he: 'his',
    lane: 'Product architecture, engineering, the app, the website and the Discord community platform, infrastructure, security and technical delivery.' },
  { name: 'Gabriel DiDario', first: 'Gabriel', last: 'DiDario', office: 'Chief Marketing Officer', short: 'CMO', units: 1300000, jgn: true, id: 'NBS-CU-0003', he: 'his',
    lane: 'Marketing, growth, audience funnels from the media network into the Platform, brand campaigns, sponsorship support and creator coordination.' },
  { name: 'Stephen Bickel', first: 'Stephen', last: 'Bickel', office: 'Chief Information Officer', short: 'CIO', units: 1300000, jgn: true, id: 'NBS-CU-0004', he: 'his',
    lane: 'Information systems, website operations, internal tooling, documentation, information governance and vendor systems.' },
  { name: 'Michael Del Bene', first: 'Michael', last: 'Del Bene', office: 'Chief Data Officer', short: 'CDO', units: 1300000, jgn: true, id: 'NBS-CU-0005', he: 'his',
    lane: 'Data engineering, sports-data and odds pipelines, picks records and grading, analytics, data operations and data-provider relationships.' },
];
// Class B Member (does not sign; admitted on issuance under the Talent Agreement).
const BROCK = { name: 'Brock Smith', first: 'Brock', last: 'Smith', units: 150000, id: 'NBS-CB-0001', role: 'Co-Founder; handicapper and on-camera talent under the Talent Agreement' };

const CLASS_A = FOUNDERS.reduce((s, f) => s + f.units, 0);           // 7,900,000
const CLASS_B = BROCK.units;                                            // 150,000
const OUTSTANDING = CLASS_A + CLASS_B;                                  // 8,050,000
if (CLASS_A + CLASS_B + RESERVE !== AUTH_UNITS) throw new Error('unit math does not tie');
const A_TOTAL_PRICE = Math.round(CLASS_A * PRICE);                       // $7,900
const FMV_TOTAL = A_TOTAL_PRICE;                                         // $7,900 total company equity FMV
const THRESHOLD = FMV_TOTAL;                                             // Class B Threshold Amount

const CEO = FOUNDERS[0];
const CTO = FOUNDERS[1];
const JGN_MEMBERS = FOUNDERS.filter(f => f.jgn);                         // Nick, Gabriel, Stephen, Michael (25% each)
const N_FOUNDERS = FOUNDERS.length;                                      // 5
const RUPIA_FIRST = 25;                                                  // docs 25-29
const BROCK_DOC = RUPIA_FIRST + N_FOUNDERS;                              // doc 30
const RECEIPT_FIRST = BROCK_DOC + 1;                                     // docs 31-35
const RECEIPT_LAST = RECEIPT_FIRST + N_FOUNDERS - 1;                     // 35
const N_DOCS = RECEIPT_LAST + 1;                                         // 36 documents, 00-35

function money(n) { return '$' + n.toLocaleString('en-US'); }
function num(n) { return n.toLocaleString('en-US'); }
function pct(n, units, d) { return (100 * n / units).toFixed(d === undefined ? 0 : d) + '%'; }
function fdPct(units) { return pct(units, AUTH_UNITS, Number.isInteger(100 * units / AUTH_UNITS) ? 0 : 1); } // 20%, 13%, 1.5%
function outPct(units) { return pct(units, OUTSTANDING, 3); }
function votePct(units) { return pct(units, CLASS_A, 3); }
function vested(f) { return f.units / 2; }
function monthly(f) { return Math.floor(f.units / 2 / 48); }
function price(f) { return money(Math.round(f.units * PRICE)); }
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
p { margin: 0 0 0.09in 0; text-align: justify; orphans: 2; widows: 2; }
p.sub { break-after: avoid; }
ul { margin: 0 0 0.09in 0.25in; padding: 0; }
li { margin: 0 0 0.04in 0; text-align: justify; break-inside: avoid; }
ul.tight li { margin: 0; }
table { border-collapse: collapse; width: 100%; margin: 0.05in 0 0.14in 0; font-size: 9.5pt; line-height: 1.35; }
th, td { border: 0.6pt solid #444; padding: 0.045in 0.06in; vertical-align: top; text-align: left; text-wrap: pretty; overflow-wrap: anywhere; }
table.small { font-size: 8.5pt; }
table.small th, table.small td { padding: 0.035in 0.04in; }
table.scheda col.c1 { width: 1.05in; } table.scheda col.c2 { width: 1.2in; } table.scheda col.c3 { width: 0.72in; } table.scheda col.c4, table.scheda col.c5, table.scheda col.c6 { width: 0.72in; } table.scheda col.c7 { width: 0.66in; } table.scheda col.c8, table.scheda col.c9 { width: 0.66in; }
.keepblock { break-inside: avoid; }
th { background: #ececec; font-weight: bold; overflow-wrap: normal; }
p.keep { break-inside: avoid; }
thead { display: table-header-group; }
tr { break-inside: avoid; }
tbody tr:first-child { break-before: avoid; }
table.kv td:first-child { width: 2.55in; font-weight: bold; background: #f3f3f3; }
table.kv2 td:first-child { width: 2.1in; font-weight: bold; background: #f3f3f3; }
table.w td:first-child, table.w th:first-child { width: 1.2in; }
table.w3 td:first-child, table.w3 th:first-child { width: 1.05in; } table.w3 td:last-child, table.w3 th:last-child { width: 1.25in; }
table.cap col.c1 { width: 1.1in; } table.cap col.c2 { width: 1.35in; }
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
const EFF = `<p><strong>Effective date:</strong> this document is dated and becomes effective on the Actual Closing Date, after all required approvals, signatures, purchase price payments and issuance actions have occurred. Under Section 2.8 of the Operating Agreement, the Actual Closing Date, the Transfer Date, the Valuation Date and the vesting commencement date are the same date unless the Operating Agreement is amended under Article 16 to provide otherwise. ${DEFINED}</p>`;
const DEF_ONLY = `<p>${DEFINED}</p>`;

// A cell that is only a figure (units, money, a percentage, an entry ID) never wraps.
function cell(c) {
  c = c === undefined ? '' : String(c);
  const plain = c.replace(/<\/?strong>/g, '');
  return /^[\d,.$%×= –-]+$|^NBS-C[AB]-\d+$/.test(plain) && plain.length ? c.replace(plain, '<span class="nb">' + plain + '</span>') : c;
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
// The standard cap table rows used by docs 00, 02 and Schedule A.
const CAP_COLS = '<colgroup><col class="c1"><col class="c2"></colgroup>';
function capRows(withBrock) {
  const rows = FOUNDERS.map(f => [nbName(f), f.office, num(f.units), fdPct(f.units), '$0.001', price(f), num(vested(f)), num(vested(f))]);
  if (withBrock) rows.push([nbName(BROCK), 'Co-Founder (Class B; no office)', num(BROCK.units), fdPct(BROCK.units), 'None (profits interest)', 'None', 'Per Talent Agreement Section 5.4', 'Per Talent Agreement Section 5.4']);
  return rows;
}

module.exports = { CO, CO_UP, FORMED, DEFILE, EIN, RA, ADDR, TALENT_DATE, TALENT_DEADLINE, AUTH_UNITS, RESERVE, PRICE, FOUNDERS, BROCK, CLASS_A, CLASS_B, OUTSTANDING, A_TOTAL_PRICE, FMV_TOTAL, THRESHOLD, CEO, CTO, JGN_MEMBERS, N_FOUNDERS, RUPIA_FIRST, BROCK_DOC, RECEIPT_FIRST, RECEIPT_LAST, N_DOCS,
  money, num, pct, fdPct, outPct, votePct, vested, monthly, price, nb, nbName, heDoc, listAnd, FOUNDERS_AND, JGN_AND, CSS, doc, DEFINED, EFF, DEF_ONLY, kv, tbl, coSig, personSig, memberSigs, capRows, CAP_COLS };
