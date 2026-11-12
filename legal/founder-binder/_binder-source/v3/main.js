'use strict';
// Builds html/NN - Title.html for every document in the Nosebleed Sports LLC founder closing binder.
// Document numbers: 00-24 fixed; 25..(25+N-1) Restricted Unit Issuance Agreements; 25+N Brock Smith Class B record;
// 26+N First Amendment to the Talent Agreement; then one receipt per Contributing Founder.
const fs = require('fs');
const path = require('path');
const H = require('./helpers.js');
const A = require('./core_a.js');
const B = require('./core_b.js');
const F = require('./founder_docs.js');
const oa = require('./oa.js');

const out = path.join(__dirname, 'html');
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });

const docs = [
  ['00', 'Master Record Book Index', A.doc00],
  ['01', 'Operating Agreement', oa],
  ['02', 'Initial Member and Organizational Written Consent', A.doc02],
  ['03', 'Founder Equity FMV Determination Memorandum', A.doc03],
  ['04', 'Founder Capital Contribution Instructions', A.doc04],
  ['05', 'Aggregate Founder Issuance Closing Statement', A.doc05],
  ['06', 'Founder Capital Contribution Ledger', A.doc06],
  ['07', 'Company Officer Certificate - Founder Equity Closing', A.doc07],
  ['08', 'Officer Appointment Record and Authority Certificate', A.doc08],
  ['09', 'Banking Resolution', A.doc09],
  ['10', 'Official Unit Ledger', A.doc10],
  ['11', 'Capitalization Table', A.doc11],
  ['12', 'Founder Equity and Vesting Ledger', A.doc12],
  ['13', 'Founder Contribution and Separation Schedule', A.doc13],
  ['14', 'Historical Company Operating Expense and JGN Contribution Schedule', B.doc14],
  ['15', 'Company Asset Schedule', B.doc15],
  ['16', 'IP Assignment Schedule and Chain of Title Register', B.doc16],
  ['17', 'Company Account Schedule', B.doc17],
  ['18', 'Founder PIIA and Data Security Agreement', B.doc18],
  ['19', 'JGN Platform Contribution, Brand License, Funding and Account Transition Agreement', B.doc19],
  ['20', 'JGN Member Consent Approving Nosebleed Agreement', B.doc20],
  ['21', 'Closing Checklist and Signature Index', B.doc21],
  ['22', 'Organization and Governance Summary', B.doc22],
  ['23', 'Capitalization Reconciliation Report', B.doc23],
  ['24', 'Record Book Certification', B.doc24],
];
H.FOUNDERS.forEach((f, i) => docs.push([String(H.RUPIA_FIRST + i), `${f.name} - Restricted Unit Issuance Agreement`, () => F.ruia(i)]));
docs.push([String(H.BROCK_DOC), `${H.BROCK.name} - Class B Unit Issuance Record`, F.brockRecord]);
docs.push([String(H.TALENT_AMEND_DOC), `${H.BROCK.name} - First Amendment to Talent Agreement`, F.talentAmendment]);
H.CONTRIB.forEach((f, i) => docs.push([String(H.RECEIPT_FIRST + i), `${f.name} - Founder Capital Contribution Receipt`, () => F.receipt(i)]));

if (docs.length !== H.N_DOCS) throw new Error(`expected ${H.N_DOCS} documents, built ${docs.length}`);
const manifest = [];
for (const [n, title, fn] of docs) {
  const html = fn();
  const file = `${n} - ${title}.html`;
  fs.writeFileSync(path.join(out, file), html, 'utf8');
  manifest.push(file);
}
fs.writeFileSync(path.join(out, 'manifest.txt'), manifest.join('\n') + '\n', 'utf8');
console.log(`built ${manifest.length} documents into ${out}`);
