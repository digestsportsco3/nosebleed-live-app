#!/usr/bin/env python3
"""Initial Member and Organizational Written Consent of Nosebleed Sports LLC (Delaware) - merged rev. 3.

Merges the prior "Version 2.0" binder organizational consent (organizational actions, officers,
ledgers, IP transfers and asset assignment from JGN, JGN agreements, banking signers, spending
limits, closing records) with the superseding changes:

  * no unit-purchase, payment-receipt, valuation or Section 83 election resolutions
  * Units issued for services as profits interests under Section 3.5 of the LLC Agreement
  * [Class B Member] Service Agreement, 50,000 Class B Initial Units and the 450,000-Unit Brock
    Reserve approved at Supermajority
  * former participants confirmed to hold nothing
  * EIN ratification, New York foreign qualification, superseding of the v2.0 binder

Section references track the merged LLC Agreement (make_nsl_operating_agreement.py).
"""

import os
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib.enums import TA_CENTER
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable)

OUT = os.environ.get("OUT_PDF", "nosebleed-sports-llc-organizational-consent.pdf")

# =============================== FILL-INS ===============================
# PUBLIC TEMPLATE: member names, JGN ownership, EIN and emails are placeholders. Fill from the private master record.
COMPANY_NAME     = "Nosebleed Sports LLC"
EFFECTIVE_DATE   = "____________, 2026"
FORMATION_DATE   = "August 7, 2026"
DE_FILE_NUMBER   = "10727267"
REG_AGENT        = "ZenBusiness Inc., 611 South DuPont Highway, Suite 102, Dover, Delaware 19901"
PRINCIPAL_OFFICE = "105 Broadway, Rockville Centre, New York 11570"
EIN              = "__-_______"
CEO_NAME         = "Nicholas Restivo"
CEO_TITLE        = "Chief Executive Officer"
AUTHORIZED_UNITS = 10_000_000
BROCK_UNITS      = 50_000
BROCK_RESERVE    = 450_000
SPEND_THRESHOLD  = "$3,000"
DEBT_THRESHOLD   = "$25,000"
AFFILIATE_ROLLING = "ten thousand dollars"
BROCK_SA         = "Talent, Handicapping, and Content Services Agreement among JGN Media LLC, the Company, and [Class B Member]"

MEMBERS = [("Nicholas Restivo", 2_000_000), ("[Founder B]", 2_000_000), ("[Founder C]", 1_300_000),
           ("[Founder D]", 1_300_000), ("[Founder E]", 1_300_000), ("[Founder F]", 1_100_000)]
OFFICERS = [("Nicholas Restivo", "Chief Executive Officer"), ("[Founder B]", "Chief Technology Officer"),
            ("[Founder E]", "Chief Operating Officer"), ("[Founder D]", "Chief AI Officer"),
            ("[Founder C]", "Chief Information Officer"), ("[Founder F]", "Business Development Officer")]
BANK_SIGNERS = ["Nicholas Restivo", "[Founder B]", "[Founder E]", "[Founder C]", "[Founder D]"]
# ========================================================================

ISSUED = sum(u for _, u in MEMBERS) + BROCK_UNITS
UNISSUED = AUTHORIZED_UNITS - ISSUED
VOTING = sum(u for _, u in MEMBERS)
def fmt(n): return f"{n:,}"
def pct(n, d): return f"{100.0 * n / d:.2f}%"
DASH = "—"

styles = getSampleStyleSheet()
title_style = ParagraphStyle("T", parent=styles["Title"], fontName="Helvetica-Bold", fontSize=14, leading=18, alignment=TA_CENTER, spaceAfter=2)
subtitle_style = ParagraphStyle("S", parent=styles["Normal"], fontName="Helvetica", fontSize=10.5, leading=14, alignment=TA_CENTER, textColor=colors.HexColor("#444444"), spaceAfter=10)
heading_style = ParagraphStyle("H", parent=styles["Heading2"], fontName="Helvetica-Bold", fontSize=11, leading=14, spaceBefore=11, spaceAfter=4)
body_style = ParagraphStyle("B", parent=styles["Normal"], fontName="Helvetica", fontSize=10, leading=14.5, spaceAfter=7)
bullet_style = ParagraphStyle("Bu", parent=body_style, leftIndent=16, bulletIndent=5, spaceAfter=3)
sig_style = ParagraphStyle("Sig", parent=body_style, spaceAfter=2)
def P(t, s=body_style): return Paragraph(t, s)
def H(t): return Paragraph(t, heading_style)
def BUL(t): return Paragraph(t, bullet_style, bulletText="•")
GRID = TableStyle([("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"), ("FONTSIZE", (0, 0), (-1, -1), 8.8),
                   ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#EFEFEF")), ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#BBBBBB")),
                   ("TOPPADDING", (0, 0), (-1, -1), 4), ("BOTTOMPADDING", (0, 0), (-1, -1), 4), ("LEFTPADDING", (0, 0), (-1, -1), 6),
                   ("VALIGN", (0, 0), (-1, -1), "MIDDLE")])

s = []
s.append(P("INITIAL MEMBER AND ORGANIZATIONAL WRITTEN CONSENT", title_style))
s.append(P("of", subtitle_style)); s.append(P(COMPANY_NAME.upper(), title_style))
s.append(P("a Delaware limited liability company %s in lieu of an organizational meeting" % DASH, subtitle_style))
s.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#999999"), spaceAfter=12))
s.append(P("The undersigned, being all of the Class A Members of %s (the \"Company\"), acting by written consent without a meeting "
           "under Section 18-302(d) of the Delaware Limited Liability Company Act and the Company's Limited Liability Company "
           "Agreement, adopt the following resolutions effective as of <b>%s</b> (the \"Effective Date\"). The undersigned hold "
           "one hundred percent (100%%) of the outstanding Class A Units and therefore constitute both Majority Approval and "
           "Supermajority Approval for every matter below. Capitalized terms not defined here have the meanings given in the "
           "Limited Liability Company Agreement (the \"LLC Agreement\")." % (COMPANY_NAME, EFFECTIVE_DATE)))

# ---------------------------------------------------------------- 1
s.append(H("1. Formation and Certificate of Formation"))
s.append(P("RESOLVED, that the formation of the Company as a Delaware limited liability company, and the filing of its Certificate "
           "of Formation with the Delaware Secretary of State on %s under Delaware file number %s, are ratified, confirmed and "
           "approved in all respects, together with all acts of the authorized person in connection with the filing; that %s is "
           "confirmed as the Company's registered agent and registered office; that the Company's principal business address is "
           "%s; and that the Chief Executive Officer is directed to maintain the registered agent and to pay the Delaware annual "
           "tax when due." % (FORMATION_DATE, DE_FILE_NUMBER, REG_AGENT, PRINCIPAL_OFFICE)))

# ---------------------------------------------------------------- 2
s.append(H("2. Limited Liability Company Agreement"))
s.append(P("RESOLVED, that the Limited Liability Company Agreement of the Company dated as of the Effective Date, in the form "
           "executed by the undersigned concurrently with this consent, is adopted as the limited liability company agreement of "
           "the Company within the meaning of the Act; that the Company is member-managed with officers as provided in Article 5 "
           "of the LLC Agreement, and no manager position is created; and that each of the undersigned is admitted as a Class A "
           "Member as of the Effective Date upon notation on Schedule A to the LLC Agreement."))

# ---------------------------------------------------------------- 3
s.append(H("3. Authorized Units; Issuance of Class A Units for Services"))
s.append(P("RESOLVED, that the Company's authorized capitalization is <b>%s Common Units</b>, consisting of voting Class A Units "
           "and non-voting Class B Units as provided in Sections 3.2 and 3.3 of the LLC Agreement; and that the Company issues the "
           "following Class A Units to the following persons, in consideration of services rendered and to be rendered to the "
           "Company and the assignment of intellectual property under each person's Proprietary Information and Inventions "
           "Assignment Agreement, without cash consideration, subject to the vesting terms of Article 4 of the LLC Agreement:"
           % fmt(AUTHORIZED_UNITS)))
rows = [["Class A Member", "Office", "Class A Units", "Percentage\nInterest", "Fully Diluted\nPercentage", "Vested at\nissuance (50%)"]]
titles = dict(OFFICERS)
for n, u in MEMBERS:
    rows.append([n, titles[n], fmt(u), pct(u, ISSUED), pct(u, AUTHORIZED_UNITS), fmt(u // 2)])
rows.append(["[Class B Member] (Class B, non-voting)", "None", fmt(BROCK_UNITS), pct(BROCK_UNITS, ISSUED),
             pct(BROCK_UNITS, AUTHORIZED_UNITS), "Per Service Agreement"])
rows.append(["TOTAL ISSUED AND OUTSTANDING", "", fmt(ISSUED), "100.00%", pct(ISSUED, AUTHORIZED_UNITS), ""])
rows.append(["Authorized but unissued", "", fmt(UNISSUED), "n/a", pct(UNISSUED, AUTHORIZED_UNITS), ""])
t = Table(rows, colWidths=[1.85 * inch, 1.5 * inch, 0.85 * inch, 0.8 * inch, 0.85 * inch, 0.95 * inch])
t.setStyle(GRID)
t.setStyle(TableStyle([("FONTNAME", (0, len(MEMBERS) + 2), (-1, len(MEMBERS) + 2), "Helvetica-Bold"),
                       ("FONTSIZE", (0, 0), (-1, -1), 8.0)]))
s.append(t); s.append(Spacer(1, 6))
s.append(P("RESOLVED FURTHER, that the Company's capitalization reconciles as <b>%s issued and outstanding + %s authorized but "
           "unissued = %s authorized</b>, being <b>%s</b> issued and <b>%s</b> unissued; that of the unissued Units, <b>%s</b> "
           "constitute the Brock Reserve approved in Section 6 of this consent and <b>%s</b> are unallocated and are not promised "
           "to any person; and that the capitalization is deliberately not forced to one hundred percent (100%%) of authorized "
           "Units." % (fmt(ISSUED), fmt(UNISSUED), fmt(AUTHORIZED_UNITS), pct(ISSUED, AUTHORIZED_UNITS),
                       pct(UNISSUED, AUTHORIZED_UNITS), fmt(BROCK_RESERVE), fmt(UNISSUED - BROCK_RESERVE))))
s.append(P("RESOLVED FURTHER, that the Class A Units outstanding are <b>%s</b>, that Majority Approval requires more than %s "
           "Class A Units and Supermajority Approval requires at least %s Class A Units, and that Class B Units and authorized "
           "but unissued Units do not vote on any matter."
           % (fmt(VOTING), fmt(VOTING // 2), fmt(-(-VOTING * 2 // 3)))))

# ---------------------------------------------------------------- 4
s.append(H("4. Units Issued for Services; Threshold Value; Profits-Interest Treatment"))
s.append(P("RESOLVED, that all Units issued under this consent are issued in consideration of services and are structured as "
           "profits interests within the meaning of Revenue Procedures 93-27 and 2001-43 under Section 3.5 of the LLC Agreement; "
           "that the aggregate positive Capital Account balances of all Members immediately before these issuances are $0, so that "
           "the Threshold Value assigned to each issuance made on the Effective Date is <b>$0</b>; that the Original Cost of each "
           "issued Unit is <b>$0</b>; that no Member is required to contribute cash for Units and no cash Capital Contribution has "
           "been made; that the Company and each recipient will treat the recipient as the owner of the Units, and as a partner of "
           "the Company for federal income tax purposes, from the date of issuance whether or not then vested; and that neither "
           "the Company nor any recipient will claim a deduction for the issuances."))
s.append(P("RESOLVED FURTHER, that the Company is not adopting any valuation memorandum, per-Unit price determination or election "
           "process under Section 83 of the Internal Revenue Code in connection with these issuances, none being required for "
           "profits interests issued with a Threshold Value; and that each recipient is solely responsible for the tax "
           "consequences of the recipient's Units."))

# ---------------------------------------------------------------- 5
s.append(H("5. Vesting; Option-Based Repurchase of Unvested Units"))
s.append(P("RESOLVED, that the Class A vesting terms of Article 4 of the LLC Agreement are approved, being fifty percent (50%) "
           "vested at the Effective Date and the remaining fifty percent (50%) vesting in forty-eight (48) equal monthly "
           "installments with no cliff, conditioned on continued Officer Service, with full single-trigger acceleration on a "
           "Change of Control and full acceleration on death or Permanent Disability while in Officer Service."))
s.append(P("RESOLVED FURTHER, that the option-based process for Unvested Units in Section 4.3 of the LLC Agreement is approved, "
           "under which vesting stops on cessation of Officer Service, the Company determines the remaining Unvested Units, the "
           "Company has ninety (90) days after actual knowledge of the cessation event to exercise by written notice, the amount "
           "payable equals Original Cost ($0 for Units issued for services, so that a valid exercise operates as a forfeiture and "
           "cancellation), and the Company then updates its ledgers; and that Unvested Units do not automatically cancel solely "
           "because Officer Service ends."))

# ---------------------------------------------------------------- 6
s.append(H("6. [Class B Member] %s Service Agreement, Initial Units and Brock Reserve" % DASH))
s.append(P("RESOLVED, that the %s (the \"Brock Service Agreement\") is approved in the form presented, and the Chief Executive "
           "Officer is authorized to execute and deliver it on the Company's behalf; that upon [Class B Member]'s execution of a "
           "joinder in the form of Schedule G to the LLC Agreement the Company will issue to him <b>%s Class B Units</b> as the "
           "Initial Units under Section 5.1 of the Brock Service Agreement, non-voting and subject to forfeiture until vested "
           "solely as Section 5.4 of that agreement provides; and that [Class B Member] is not an officer of the Company, holds no "
           "title, and has no voting, consent, approval, management or meeting rights."
           % (BROCK_SA, fmt(BROCK_UNITS))))
s.append(P("RESOLVED FURTHER, that for purposes of Section 3.4 of the LLC Agreement the undersigned, constituting Supermajority "
           "Approval, approve the reservation of up to <b>%s Class B Units</b> (the \"Brock Reserve\") for issuance to [Class B Member] "
           "in accordance with the milestone terms of Section 5.2 of the Brock Service Agreement, so that his aggregate interest "
           "under that agreement may reach 500,000 Units, with no further Member approval required for those issuances; and that "
           "the Brock Reserve is a specific pre-approved reservation for a single named Service Agreement and is not an equity "
           "incentive pool." % fmt(BROCK_RESERVE)))

# ---------------------------------------------------------------- 7
s.append(H("7. Former Participants"))
s.append(P("RESOLVED, that the Members confirm that [former participant 1] and [former participant 2] are not Members of the Company, hold no "
           "Units and no right to acquire Units, hold no office and have no title, are not parties to any equity, vesting, "
           "assignment or other document of the Company, and have no economic, voting, information or approval rights of any kind; "
           "and that any prior draft naming either of them in any such capacity is superseded and of no force or effect. Nothing "
           "in this resolution prevents the Company from admitting either person in the future by proper action under the LLC "
           "Agreement."))

# ---------------------------------------------------------------- 8
s.append(H("8. Ledgers, Cap Table and Records"))
s.append(P("RESOLVED, that the membership interest ledger, capitalization table (Schedule A to the LLC Agreement), vesting ledger "
           "(Schedule F), officer schedule (Schedule B), assigned-asset schedule (Schedule C), JGN retained-asset schedule "
           "(Schedule D), JGN ownership context schedule (Schedule E), form of joinder (Schedule G) and capital-account records "
           "are approved and adopted; that the Chief Executive Officer is directed to maintain them and to record every issuance, "
           "vesting event, forfeiture, cancellation, repurchase and Transfer; and that the Company's record book will be "
           "maintained at the principal office in accordance with Section 12.1 of the LLC Agreement."))

# ---------------------------------------------------------------- 9
s.append(H("9. Officers"))
s.append(P("RESOLVED, that the following persons are appointed to the offices set opposite their names, to serve at the pleasure "
           "of the Members under Section 5.2 of the LLC Agreement and subject to removal by Majority Approval under Section 5.8:"))
to = Table([["Name", "Office"]] + [list(o) for o in OFFICERS], colWidths=[2.3 * inch, 4.1 * inch]); to.setStyle(GRID); s.append(to)
s.append(Spacer(1, 6))
s.append(P("RESOLVED FURTHER, that %s, as Chief Executive Officer, has authority within the approval limits of Article 5 of the "
           "LLC Agreement to act for and bind the Company, including to negotiate, execute, deliver and perform contracts and "
           "other instruments on the Company's behalf, to engage and terminate independent contractors and talent, to operate "
           "Company accounts, to issue Units within the Brock Reserve, to approve sponsorship and brand arrangements and to "
           "commence, defend and settle claims; that he executes Company agreements under the signature block \"%s, Chief "
           "Executive Officer\"; and that he may appoint subordinate non-member officers or agents and delegate authority under "
           "Section 5.12 of the LLC Agreement." % (CEO_NAME, CEO_NAME)))
s.append(P("RESOLVED FURTHER, that no other officer positions exist as of the Effective Date; that the offices of Chief Marketing "
           "Officer and Chief Creative Officer contemplated in prior drafts are not created and are not filled; and that an "
           "officer's title does not by itself confer authority to bind the Company beyond the authority provided in the LLC "
           "Agreement or delegated by the Chief Executive Officer."))

# ---------------------------------------------------------------- 10
s.append(H("10. Banking Authority"))
s.append(P("RESOLVED, that the Company is authorized to open and maintain bank, payment-processing (including Stripe) and similar "
           "accounts in the Company's name with such institutions as the Chief Executive Officer selects, and to execute the "
           "standard account documentation of those institutions, which is incorporated by reference; that the authorized banking "
           "signers are <b>%s</b>, each of whom may act individually at the bank, provided that bank-facing authority does not "
           "override the internal approval thresholds of the LLC Agreement; and that Company funds will not be commingled with "
           "the funds of any Member or affiliate." % (", ".join(BANK_SIGNERS[:-1]) + " and " + BANK_SIGNERS[-1])))

# ---------------------------------------------------------------- 11
s.append(H("11. Spending Limits and Approval Thresholds"))
s.append(P("RESOLVED, that the following internal controls in Sections 5.10 and 5.11 of the LLC Agreement are approved: any "
           "expenditure, contract or commitment of %s or more outside an already approved budget requires Majority Approval; "
           "expenditures under %s may be approved by an authorized officer within that officer's delegated responsibilities; "
           "transactions may not be artificially divided into multiple smaller payments or contracts to avoid approval; debt or "
           "guarantees over %s outside approved authority require Supermajority Approval; and Material Related-Party "
           "Transactions, being related-party transactions over %s individually or over %s in aggregate during a rolling "
           "twelve-month period, require Supermajority Approval unless already specifically approved."
           % (SPEND_THRESHOLD, SPEND_THRESHOLD, DEBT_THRESHOLD, SPEND_THRESHOLD, AFFILIATE_ROLLING)))

# ---------------------------------------------------------------- 12
s.append(H("12. Reserved Matters and Approval Definitions"))
s.append(P("RESOLVED, that Majority Approval means approval by Members holding more than fifty percent (50%) of the outstanding "
           "Class A Units, and Supermajority Approval means approval by Members holding at least sixty-six and two-thirds percent "
           "(66 2/3%) of the outstanding Class A Units, in each case disregarding Class B Units and authorized but unissued "
           "Units; and that Supermajority Approval is required for the Reserved Matters listed in Section 5.4 of the LLC "
           "Agreement, including merger, consolidation, sale of the Company, sale of substantially all Company assets, Change of "
           "Control, drag-along, dissolution, creation of a new class or series of equity, any issuance of Units, options, "
           "warrants, SAFE-like convertible instruments, convertible debt or other rights to acquire Units other than issuances "
           "within the Brock Reserve, creation or material expansion of an equity incentive pool, sale or exclusive disposition of "
           "material Company IP outside the ordinary course, Material Related-Party Transactions, material change in tax "
           "classification, admission of a Class A Member and amendments to the LLC Agreement generally."))

# ---------------------------------------------------------------- 13
s.append(H("13. Asset Assignment from JGN; JGN Retained Assets"))
s.append(P("RESOLVED, that the Company is authorized to receive, and the Chief Executive Officer is authorized to accept and "
           "execute all documents necessary to complete, the assignment from JGN Media LLC (\"JGN\") of the Assigned Assets "
           "listed on Schedule C to the LLC Agreement, including the identified product repositories, the domains "
           "nosebleedsport.com and nosebleedsportsmedia.com and their subdomains, the Nosebleed Discord server and its "
           "integrations and member data, the confirmed infrastructure and product service accounts (Vercel, Supabase, Clerk, "
           "Whop, Resend, PostHog and Google Workspace), the product-specific logo, design and brand-kit assets, and the website, "
           "app, backend, APIs, databases, picks systems, prediction models, AI systems and product-specific content created for "
           "the Nosebleed Sports product business, in each case subject to third-party platform terms and to completion of "
           "post-closing operational transfer steps."))
s.append(P("RESOLVED FURTHER, that the Members confirm that JGN retains the JGN Retained Assets listed on Schedule D to the LLC "
           "Agreement, including the master NOSEBLEED SPORTS name, brand and trademark and the historical goodwill in it, the "
           "legacy social media accounts, legacy media assets, historical content, historical sponsorship, advertising and "
           "affiliate agreements, historical revenue, and JGN's Apple Developer, Stripe, payment and AI-history accounts; and "
           "that the Company receives only the assignment, license or transition rights expressly granted in the JGN agreements "
           "approved in Section 15 of this consent."))

# ---------------------------------------------------------------- 14
s.append(H("14. JGN Advances"))
s.append(P("RESOLVED, that the Members acknowledge that JGN paid approximately <b>$2,000</b> of documented July 2026 AI and "
           "development expenses, primarily OpenAI and Anthropic/Claude development expenses, on the Company's behalf before "
           "formation; that those amounts, together with any further such advances recorded by the Chief Executive Officer, are "
           "unsecured, non-interest-bearing obligations of the Company to JGN repayable when the Members determine cash is "
           "reasonably available, all as provided in Section 3.8 of the LLC Agreement; and that they are not Capital "
           "Contributions, are not founder advances, are not consideration for any Unit, and do not entitle JGN or any Member to "
           "any Units or other interest in the Company."))

# ---------------------------------------------------------------- 15
s.append(H("15. JGN Intercompany Agreements"))
s.append(P("RESOLVED, that the Company is authorized to enter into the following three separate agreements with JGN, which are "
           "distinct and are not to be consolidated, and that the Chief Executive Officer is authorized to execute and deliver "
           "them on the Company's behalf:"))
s.append(BUL("<b>(a) Master Brand and Trademark License</b> from JGN to the Company, granting the Company the exclusive right to "
             "use the NOSEBLEED SPORTS name, master brand and trademark in the field of the Company's app, website, Discord, "
             "subscription and premium offerings and related technology products, and surviving a bona fide Change of Control of "
             "the Company subject to reasonable successor and quality-control terms;"))
s.append(BUL("<b>(b) Logo and Visual Identity License</b> from the Company to JGN, permitting JGN to use the Company-owned logo, "
             "design and visual-identity assets on JGN's retained media properties; and"))
s.append(BUL("<b>(c) Marketing and Audience License</b> from JGN to the Company, granting the Company a nonexclusive, "
             "royalty-free license to distribute Company content and offers through JGN's legacy social media properties."))
s.append(Spacer(1, 4))
s.append(P("RESOLVED FURTHER, that a transition services arrangement with JGN for temporary use of JGN infrastructure is approved "
           "in principle, subject to Apple Developer, Stripe, app-store and payment-processor terms; that these agreements remain "
           "subject to JGN's own separate required approval under its governing documents; and that, the undersigned being aware "
           "that several Members are also members of JGN, this approval by all Class A Members satisfies Section 5.11 of the LLC "
           "Agreement for these agreements, for the JGN Advances and for the Brock Service Agreement and the issuances within the "
           "Brock Reserve, so that no further related-party approval is required for them."))

# ---------------------------------------------------------------- 16
s.append(H("16. Proprietary Information and Inventions Assignment Agreements"))
s.append(P("RESOLVED, that each Class A Member will execute a Proprietary Information, Inventions Assignment, Confidentiality, "
           "Data Security and Non-Solicitation Agreement in the Company's standard form as a condition of holding Units; that "
           "[Founder B]'s agreement will expressly assign to the Company, to the extent personally owned, the current "
           "Nosebleed logo artwork and source files, logo variations, current visual identity, new design system, product-brand "
           "design assets and derivative works; that all such assignments run to the Company and not to JGN, whose use of "
           "Company-owned logo and design assets is governed solely by the Logo and Visual Identity License; and that the "
           "intellectual property and confidentiality obligations of [Class B Member] are governed by the Brock Service Agreement."))

# ---------------------------------------------------------------- 17
s.append(H("17. Disinterested Signature Authority"))
s.append(P("RESOLVED, that [Founder B], or [Founder E] if [Founder B] is unavailable, is authorized to sign "
           "Company-side documents relating to Nicholas Restivo's individual Member documents where a disinterested Company "
           "signer is reasonably practical; and that Nicholas Restivo is authorized to sign Company-side documents for Members "
           "other than himself."))

# ---------------------------------------------------------------- 18
s.append(H("18. Tax Matters"))
s.append(P("RESOLVED, that the Company's Employer Identification Number <b>%s</b> is ratified and confirmed; that the Company is "
           "classified as a partnership for federal and applicable state income tax purposes and will file Internal Revenue "
           "Service Form 1065 and furnish a Schedule K-1 to each Member; that the Company will not file Form 8832 unless it "
           "affirmatively elects another classification, which requires Supermajority Approval; that the tax year and fiscal year "
           "is the calendar year ending December 31 and the accounting method is the cash method to the extent the Company is "
           "eligible; that %s is designated the Partnership Representative under Section 6223 of the Internal Revenue Code; and "
           "that tax distributions may be made by April 10 of each year on the discretionary basis and subject to the cash "
           "availability provided in Section 6.10 of the LLC Agreement." % (EIN, CEO_NAME)))

# ---------------------------------------------------------------- 19
s.append(H("19. Foreign Qualification and Post-Formation Compliance"))
s.append(P("RESOLVED, that the Chief Executive Officer is authorized and directed to cause the Company to qualify to do business "
           "as a foreign limited liability company in the State of New York, where its principal office is located, to satisfy any "
           "related publication requirement, to register for applicable state and local tax accounts, and to qualify in any other "
           "jurisdiction where the Company's activities require it; and to complete the remaining post-formation actions, "
           "including banking, insurance evaluation under Section 12.4 of the LLC Agreement, privacy and data review, platform and "
           "app-store compliance, and the Delaware annual tax and annual compliance calendar."))
s.append(P("RESOLVED FURTHER, that the Members confirm that the Company has no employees, that it engages independent contractors "
           "including [Class B Member], and that no officer title, Unit issuance or Service Agreement creates an employment "
           "relationship."))

# ---------------------------------------------------------------- 20
s.append(H("20. Superseded Materials"))
s.append(P("RESOLVED, that the \"Version 2.0 Master Change Log, Interim Institutional Audit Report and Record Book Index %s "
           "Pre-Formation Delaware LLC Binder\" and its component documents are superseded in their entirety and are not "
           "operative, including without limitation any founder equity fair market value determination memorandum, any election "
           "materials, instructions or control logs under Section 83 of the Internal Revenue Code and any Form 15620 materials, "
           "any founder unit purchase agreements or payment instructions, closing statements, payment ledgers or payment receipts, "
           "and any capitalization, vesting, officer or signature schedule that recites a per-Unit or aggregate valuation, lists "
           "[former participant 1] or [former participant 2] as a holder, officer or party, or reflects issuance of one hundred percent (100%%) "
           "of the authorized Units; and that such materials may be retained only as historical records clearly marked "
           "\"SUPERSEDED %s NOT OPERATIVE.\"" % (DASH, DASH)))

# ---------------------------------------------------------------- 21
s.append(H("21. General Authority and Ratification"))
s.append(P("RESOLVED, that the Chief Executive Officer is authorized to take all actions, execute all documents, make all filings "
           "and pay all fees necessary or advisable to carry out the foregoing resolutions; and that all actions previously taken "
           "by %s or any other officer on the Company's behalf that are consistent with these resolutions are ratified, confirmed "
           "and approved." % CEO_NAME))
s.append(P("This consent may be signed in counterparts and by electronic signature, each of which is valid and binding, and will "
           "be filed with the Company's records."))

# ---------------------------------------------------------------- signatures
s.append(Spacer(1, 8)); s.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#999999"), spaceAfter=8))
s.append(P("IN WITNESS WHEREOF, the undersigned have executed this Initial Member and Organizational Written Consent as of the "
           "Effective Date."))
s.append(Spacer(1, 8))
def col(n): return [Paragraph("<b>CLASS A MEMBER</b>", sig_style), Spacer(1, 18),
                    Paragraph("Signature: ____________________________", sig_style),
                    Paragraph("Name: %s" % n, sig_style), Paragraph("Date: __________________", sig_style), Spacer(1, 6)]
cols = [col(n) for n, _ in MEMBERS]
for i in range(0, len(cols), 2):
    pair = cols[i:i + 2]; n = max(len(c) for c in pair)
    rows = [[c[j] if j < len(c) else "" for c in pair] for j in range(n)]
    t = Table(rows, colWidths=[3.15 * inch, 3.15 * inch])
    t.setStyle(TableStyle([("VALIGN", (0, 0), (-1, -1), "TOP"), ("LEFTPADDING", (0, 0), (-1, -1), 0)])); s.append(t)
s.append(P("<b>ACKNOWLEDGED by the Company:</b> &nbsp; %s &nbsp; By: _______________________________ &nbsp; %s, %s &nbsp; "
           "Date: ______________" % (COMPANY_NAME, CEO_NAME, CEO_TITLE)))

doc = SimpleDocTemplate(OUT, pagesize=letter, leftMargin=0.85 * inch, rightMargin=0.85 * inch, topMargin=0.8 * inch, bottomMargin=0.8 * inch,
                        title="Initial Member and Organizational Written Consent of %s" % COMPANY_NAME, author=COMPANY_NAME)
doc.build(s)
print("Wrote", OUT, "| issued", fmt(ISSUED), "| unissued", fmt(UNISSUED), "| voting", fmt(VOTING))
