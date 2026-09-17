#!/usr/bin/env python3
"""Limited Liability Company Agreement of Nosebleed Sports LLC (Delaware) - merged rev. 3.

Reconciliation of the prior "Version 2.0" binder LLC Agreement (structure, article order and
numbering, Schedules A-E) with the superseding deal terms:

  * member-managed with officers (prior binder structure retained; no manager role)
  * two classes drawn from 10,000,000 authorized Common Units:
      Class A Common Units - voting; founders; 50% vested at the Effective Date, 50% monthly
                             over 48 months, no cliff, Officer Service condition
      Class B Common Units - non-voting; service providers; vest/forfeit solely per the
                             holder's Service Agreement
  * all Units issued for services are profits interests (Rev. Proc. 93-27 / 2001-43) with a
    Threshold Value; Original Cost is $0, so the prior binder's option-based repurchase of
    Unvested Units operates as a forfeiture and cancellation
  * 9,050,000 issued / 950,000 unissued (450,000 pre-approved Brock Reserve + 500,000 unallocated)

Schedules: A Members & Capitalization | B Officers | C Assigned Assets | D JGN Retained Assets
           E JGN Ownership Context | F Class A Vesting Ledger | G Form of Joinder
"""

import os
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib.enums import TA_CENTER
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable, PageBreak)

OUT = os.environ.get("OUT_PDF", "nosebleed-sports-llc-operating-agreement.pdf")

# =============================== FILL-INS ===============================
# PUBLIC TEMPLATE: member names, JGN ownership, EIN and emails are placeholders. Fill from the private master record.
COMPANY_NAME     = "Nosebleed Sports LLC"
FORMATION_DATE   = "August 7, 2026"           # Certificate of Formation filed 1:13 PM, Delaware SR 20263996710
DE_FILE_NUMBER   = "10727267"
REG_OFFICE       = "611 South DuPont Highway, Suite 102, Dover, Delaware 19901"
REG_AGENT        = "ZenBusiness Inc."
EFFECTIVE_DATE   = "____________, 2026"       # date all Class A Members sign
PRINCIPAL_OFFICE = "105 Broadway, Rockville Centre, New York 11570"
EIN              = "__-_______"
CEO_NAME         = "Nicholas Restivo"
CEO_TITLE        = "Chief Executive Officer"
AUTHORIZED_UNITS = 10_000_000
SPEND_THRESHOLD  = "$3,000"
DEBT_THRESHOLD   = "$25,000"
AFFILIATE_ROLLING = "ten thousand dollars"     # rolling 12-month related-party aggregate
BROCK_RESERVE    = 450_000                     # Class B reserved for the [Class B Member] Service Agreement milestones

# ("Name", "Class", units, "Notice email")  -- Class A = founders (voting); Class B = service providers (non-voting)
MEMBERS = [
    ("Nicholas Restivo",  "A", 2_000_000, "______________________"),
    ("[Founder B]",   "A", 2_000_000, "______________________"),
    ("[Founder C]",  "A", 1_300_000, "______________________"),
    ("[Founder D]",    "A", 1_300_000, "______________________"),
    ("[Founder E]",   "A", 1_300_000, "______________________"),
    ("[Founder F]",      "A", 1_100_000, "______________________"),
    ("[Class B Member]",       "B",    50_000, "______________________"),
]
OFFICERS = [
    ("Nicholas Restivo", "Chief Executive Officer"),
    ("[Founder B]",  "Chief Technology Officer"),
    ("[Founder E]",  "Chief Operating Officer"),
    ("[Founder D]",   "Chief AI Officer"),
    ("[Founder C]", "Chief Information Officer"),
    ("[Founder F]",     "Business Development Officer"),
]
BANK_SIGNERS = ["Nicholas Restivo", "[Founder B]", "[Founder E]", "[Founder C]", "[Founder D]"]
JGN_OWNERSHIP = [("Nicholas Restivo", "__%"), ("[JGN member]", "__%"), ("[JGN member]", "__%"), ("[JGN member]", "__%"), ("[JGN member]", "__%")]  # fill from the private record
BROCK_SERVICE_AGREEMENT = "Talent, Handicapping, and Content Services Agreement among JGN Media LLC, the Company, and [Class B Member]"
# ========================================================================

ISSUED = sum(m[2] for m in MEMBERS)
UNISSUED = AUTHORIZED_UNITS - ISSUED
VOTING = sum(m[2] for m in MEMBERS if m[1] == "A")
def fmt(n): return f"{n:,}"
def pct(n, d): return f"{100.0 * n / d:.2f}%"
DASH = "—"

styles = getSampleStyleSheet()
title_style = ParagraphStyle("T", parent=styles["Title"], fontName="Helvetica-Bold", fontSize=15, leading=19, alignment=TA_CENTER, spaceAfter=2)
subtitle_style = ParagraphStyle("S", parent=styles["Normal"], fontName="Helvetica", fontSize=10.5, leading=14, alignment=TA_CENTER, textColor=colors.HexColor("#444444"), spaceAfter=10)
article_style = ParagraphStyle("A", parent=styles["Heading2"], fontName="Helvetica-Bold", fontSize=12, leading=15, spaceBefore=14, spaceAfter=6, alignment=TA_CENTER, textColor=colors.HexColor("#111111"))
body_style = ParagraphStyle("B", parent=styles["Normal"], fontName="Helvetica", fontSize=10, leading=14.5, spaceAfter=7)
bullet_style = ParagraphStyle("Bu", parent=body_style, leftIndent=16, bulletIndent=5, spaceAfter=2.5)
sig_style = ParagraphStyle("Sig", parent=body_style, spaceAfter=2)
def P(t, s=body_style): return Paragraph(t, s)
def ART(t): return Paragraph(t, article_style)
def BUL(t): return Paragraph(t, bullet_style, bulletText="•")
GRID = TableStyle([("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"), ("FONTSIZE", (0, 0), (-1, -1), 8.6),
                   ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#EFEFEF")), ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#BBBBBB")),
                   ("TOPPADDING", (0, 0), (-1, -1), 4), ("BOTTOMPADDING", (0, 0), (-1, -1), 4), ("LEFTPADDING", (0, 0), (-1, -1), 5),
                   ("VALIGN", (0, 0), (-1, -1), "MIDDLE")])

s = []
s.append(P("LIMITED LIABILITY COMPANY AGREEMENT", title_style))
s.append(P("of", subtitle_style))
s.append(P(COMPANY_NAME.upper(), title_style))
s.append(P("a Delaware limited liability company", subtitle_style))
s.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#999999"), spaceAfter=12))
s.append(P("This Limited Liability Company Agreement (this \"Agreement\") of %s (the \"Company\") is entered into and made "
           "effective as of <b>%s</b> (the \"Effective Date\") by and among the Company and the persons listed as Members on "
           "<b>Schedule A</b>, as amended from time to time in accordance with this Agreement. This Agreement is the "
           "\"limited liability company agreement\" of the Company within the meaning of the Act." % (COMPANY_NAME, EFFECTIVE_DATE)))

s.append(P("<b>Recitals</b>"))
s.append(P("A. The Company is a Delaware member-managed limited liability company formed by the filing of a Certificate of "
           "Formation with the Delaware Secretary of State on %s (Delaware file number %s). Its registered agent is %s at %s, "
           "and its Employer Identification Number is %s." % (FORMATION_DATE, DE_FILE_NUMBER, REG_AGENT, REG_OFFICE, EIN)))
s.append(P("B. The Members have agreed that all Units issued as of the Effective Date are issued in consideration of services "
           "rendered and to be rendered to the Company and, for the Class A Members, the assignment of intellectual property "
           "under their Proprietary Information and Inventions Assignment Agreements. No Member is required to contribute cash "
           "for Units. Such Units are structured as profits interests with a Threshold Value under Section 3.5."))
s.append(P("C. The Members intend the Company to own the Nosebleed Sports technology, product, digital community, subscription "
           "and future Nosebleed Sports product business, while preserving JGN Media LLC as a legally separate entity with its "
           "own legacy social-media business, the master NOSEBLEED SPORTS brand and its other retained assets."))
s.append(P("D. The parties' commercial strategy may be to market JGN Media LLC and the Company together in a future strategic "
           "transaction, but neither entity is legally required by this Agreement to sell only together."))
s.append(P("E. This Agreement supersedes in its entirety the pre-formation binder circulated among the founders as "
           "\"Version 2.0,\" including its capitalization, valuation, unit-purchase, payment and tax-election materials, and all "
           "other prior oral or written understandings among the Members regarding the Company."))

# =========================== ARTICLE 1 ===========================
s.append(ART("ARTICLE 1 %s DEFINITIONS" % DASH))
defs = [
    ("Act", "the Delaware Limited Liability Company Act, 6 Del. C. Section 18-101 et seq., as amended."),
    ("Affiliate", "a Person controlling, controlled by or under common control with another Person."),
    ("Agreement", "this Limited Liability Company Agreement, including its Schedules and exhibits."),
    ("Bad Leaver", "a Member whose Service ends for Cause or who materially breaches IP, confidentiality, data-security, "
                   "non-solicitation, account-transition or acquisition-cooperation obligations."),
    ("Brock Reserve", "the %s Class B Units reserved and pre-approved under Section 3.4 for issuance to [Class B Member] under the "
                      "milestone terms of his Service Agreement." % fmt(BROCK_RESERVE)),
    ("Capital Account", "the account maintained for each Member under Section 3.7."),
    ("Capital Contribution", "cash or property expressly accepted by the Company as a capital contribution and recorded as such "
                             "on Schedule A. Services are not Capital Contributions, and no Member has made a cash Capital "
                             "Contribution as of the Effective Date."),
    ("Cause", "fraud, theft, embezzlement, material dishonesty, willful misconduct, felony conviction or plea, material breach of "
              "this Agreement or another Company agreement, failure to assign Company IP, unauthorized use of Company data or "
              "accounts, harassment, discrimination, or repeated willful failure to perform material duties after written notice "
              "and reasonable cure opportunity where cure is possible."),
    ("Change of Control", "a sale of equity resulting in acquisition of control, a merger or consolidation in which the Company is "
                          "not the surviving entity or in which the Members immediately before the transaction hold less than a "
                          "majority of the surviving entity, a sale of all or substantially all Company assets, or a transaction or "
                          "series of related transactions resulting in acquisition of control of the Company. Change of Control does "
                          "not include a minority financing, ordinary equity financing, internal reorganization, permitted Member "
                          "transfer, admission of a minority investor, or recapitalization that does not transfer control."),
    ("Class A Units", "the voting Common Units described in Section 3.2, and \"Class A Member\" means a Member holding Class A Units."),
    ("Class B Units", "the non-voting Common Units described in Section 3.3, and \"Class B Member\" means a Member holding Class B Units."),
    ("Code", "the Internal Revenue Code of 1986, as amended, and the Treasury Regulations under it."),
    ("Common Units", "the limited liability company interests issued by the Company as Common Units, of which %s are authorized, "
                     "consisting of Class A Units and Class B Units." % fmt(AUTHORIZED_UNITS)),
    ("Company Accounts", "the Company's bank, payment-processing, platform, developer, repository, domain, infrastructure and "
                         "administrative accounts."),
    ("Company Assets", "the assigned technology platform, source code, databases, APIs, app, website, Discord server, domains, "
                       "product-brand and design assets, product-related email lists if any, Company Accounts and post-formation Company IP."),
    ("Company IP", "all intellectual property owned, assigned or required to be assigned to the Company, including post-formation "
                   "technology products developed under the Nosebleed Sports brand."),
    ("Deadlock", "a failure to approve a material Reserved Matter after required good-faith consideration, and not an ordinary-course "
                 "operational disagreement."),
    ("Fair Market Value", "the value determined in good faith by the Members under Section 4.13."),
    ("Fully Diluted Percentage", "for each Member, the Units held by that Member divided by all %s authorized Common Units, expressed "
                                 "as a percentage, as shown on Schedule A. It is used for disclosure and for any agreement that "
                                 "expresses an interest on a fully diluted basis, including the Service Agreement of [Class B Member]."
                                 % fmt(AUTHORIZED_UNITS)),
    ("Good Leaver", "a Member whose Service ends other than as a Bad Leaver."),
    ("JGN", "JGN Media LLC, a separate limited liability company whose ownership is shown for context on Schedule E."),
    ("JGN Advances", "approximately $2,000 of documented July 2026 AI and development expenses, primarily OpenAI and "
                     "Anthropic/Claude development expenses, paid by JGN on the Company's behalf before formation, together with "
                     "any further such advances recorded by the Chief Executive Officer. JGN Advances are obligations of the Company "
                     "to JGN under Section 3.8. They are not Capital Contributions, are not founder advances, and do not entitle "
                     "JGN or any Member to Units."),
    ("JGN Retained Assets", "the JGN assets listed on Schedule D, including legacy social accounts, historical content, legacy media "
                            "IP, the master NOSEBLEED SPORTS brand, existing Apple Developer accounts and existing Stripe accounts."),
    ("Majority Approval", "approval by Members holding more than fifty percent (50%) of the outstanding Class A Units. Class B Units "
                          "and authorized but unissued Units do not vote and are disregarded."),
    ("Material Related-Party Transaction", "any related-party transaction over %s individually or over %s in aggregate during a "
                                           "rolling twelve-month period, unless already specifically approved through an approved "
                                           "budget, an approved agreement or prior Member approval."
                                           % (SPEND_THRESHOLD, AFFILIATE_ROLLING)),
    ("Officer Service", "a Class A Member's continued active service as an officer of the Company or under another written service "
                        "arrangement approved by the Members."),
    ("Original Cost", "for each Unit, the cash Capital Contribution actually paid for that Unit as recorded on Schedule A. Units "
                      "issued in consideration of services have an Original Cost of $0."),
    ("Partnership Representative", "Nicholas Restivo, as the initial partnership representative for federal tax purposes under "
                                   "Section 6223 of the Code unless changed by the Members as permitted by law."),
    ("Percentage Interest", "for each Member, the Units held by that Member divided by all Units then issued and outstanding, "
                            "expressed as a percentage, as shown on Schedule A. Authorized but unissued Units are excluded."),
    ("Permanent Disability", "a disability that prevents continued Service, as determined in good faith by the Members under Company "
                             "policy, including a Member's inability due to physical or mental impairment to perform the essential "
                             "functions of the Member's Service for one hundred eighty (180) consecutive days."),
    ("Person", "an individual, entity, trust, estate or other legal person."),
    ("Reserved Matters", "the material actions listed in Section 5.4, which require Supermajority Approval."),
    ("Service", "for a Class A Member, Officer Service; and for a Class B Member, performance of services under that Member's "
                "Service Agreement."),
    ("Service Agreement", "a written agreement between the Company (alone or together with an Affiliate) and a Member under which "
                          "Units are issued for services, including its vesting, milestone and forfeiture terms. For [Class B Member], "
                          "the Service Agreement is the %s." % BROCK_SERVICE_AGREEMENT),
    ("Supermajority Approval", "approval by Members holding at least sixty-six and two-thirds percent (66 2/3%) of the outstanding "
                               "Class A Units. Class B Units and authorized but unissued Units do not vote and are disregarded."),
    ("Threshold Value", "for each issuance of Units in consideration of services, the amount determined under Section 3.5."),
    ("Transfer", "any sale, assignment, gift, pledge, encumbrance or other disposition of Units or any interest in Units, whether "
                 "voluntary or by operation of law."),
    ("Unvested Units", "Units that have not vested under Article 4 or under the holder's Service Agreement, and \"Vested Units\" "
                       "means Units that have vested."),
]
for term, meaning in defs:
    s.append(P("<b>\"%s\"</b> means %s" % (term, meaning)))

# =========================== ARTICLE 2 ===========================
s.append(ART("ARTICLE 2 %s FORMATION; PURPOSE; OFFICES" % DASH))
s.append(P("<b>2.1 Formation; name.</b> The Company was formed as a Delaware limited liability company by the filing of its "
           "Certificate of Formation with the Delaware Secretary of State on %s under Delaware file number %s. The name of the "
           "Company is \"%s.\" The Members ratify and adopt the filing and all acts taken by the authorized person in connection "
           "with it." % (FORMATION_DATE, DE_FILE_NUMBER, COMPANY_NAME)))
s.append(P("<b>2.2 Principal business address.</b> The Company's initial principal business address and mailing address are %s, "
           "or such other place as the Members designate. The New York address does not change the Company's Delaware "
           "jurisdiction of organization." % PRINCIPAL_OFFICE))
s.append(P("<b>2.3 Registered agent and registered office.</b> The Company's Delaware registered agent is %s and its registered "
           "office is %s. The Chief Executive Officer will maintain the registered agent and pay the Delaware annual tax when "
           "due, and may change the registered agent or registered office by filing with the Delaware Secretary of State."
           % (REG_AGENT, REG_OFFICE)))
s.append(P("<b>2.4 Business purpose.</b> The Company may engage in any lawful business permitted under the Act, including owning, "
           "developing, operating, licensing, commercializing and monetizing the following, in each case under the Nosebleed "
           "Sports brand as licensed from JGN:"))
for item in ["mobile app", "website", "Discord", "subscription products", "premium sports picks", "sports prediction models",
             "sports analytics products", "AI systems", "databases", "backend infrastructure", "APIs",
             "product-related email lists", "push-notification systems when confirmed and lawfully implemented", "trivia",
             "leaderboards", "simulated betting and game mechanics that do not constitute real-money wagering",
             "community functionality", "future merchandise", "future podcasts", "future newsletters", "future events",
             "future betting or prediction-market-related technology products", "future premium communities",
             "future educational products", "future data products", "future digital products", "product-specific content",
             "all other new businesses or additions operating under the Nosebleed Sports brand"]:
    s.append(BUL(item))
s.append(Spacer(1, 4))
s.append(P("The Company does not take, place, broker or route real-money wagers."))
s.append(P("<b>2.5 Core ownership rule.</b> Anything newly created under the Nosebleed Sports brand after formation belongs to the "
           "Company unless expressly approved otherwise in writing under this Agreement. The Company owns the Nosebleed Sports "
           "mobile application, website and Discord community, the technology and product intellectual property underlying them, "
           "subscription and premium-offering revenue, product-specific logo, design and visual-identity assets (including assets "
           "assigned to the Company by Members under their Proprietary Information and Inventions Assignment Agreements), and all "
           "new product assets. JGN owns the master NOSEBLEED SPORTS name and brand, the historical and common-law rights and "
           "goodwill in it, and the legacy social-media accounts and legacy media assets, all as provided in Article 11."))
s.append(P("<b>2.6 Term.</b> The Company continues perpetually unless dissolved under Article 13."))

# =========================== ARTICLE 3 ===========================
s.append(ART("ARTICLE 3 %s MEMBERS; UNITS; ISSUANCE FOR SERVICES; CAPITAL" % DASH))
s.append(P("<b>3.1 Authorized and issued Units; Schedule A.</b> The Company is authorized to issue %s Common Units. As of the "
           "Effective Date, <b>%s</b> Common Units are issued and outstanding and <b>%s</b> Common Units are authorized but "
           "unissued, as shown on Schedule A. Authorized but unissued Units are not owned by any Person, do not vote and do not "
           "share in distributions. The Chief Executive Officer will update Schedule A without further Member consent to reflect "
           "any issuance, vesting, forfeiture, repurchase, cancellation or Transfer made in accordance with this Agreement, and "
           "the updated Schedule A is binding on all Members." % (fmt(AUTHORIZED_UNITS), fmt(ISSUED), fmt(UNISSUED))))
s.append(P("<b>3.2 Class A Units.</b> Class A Units carry all voting, consent and approval rights of Members under this Agreement "
           "and the Act, one vote per Unit, and full economic rights subject to Section 3.5. Class A Units are held by the "
           "founding Members and are subject to the vesting terms of Article 4."))
s.append(P("<b>3.3 Class B Units.</b> Class B Units are non-voting Common Units issued to Persons who provide services to the "
           "Company or its Affiliates under a Service Agreement. Class B Units carry no voting, consent, approval or management "
           "rights on any matter, except to the extent the Act grants a right that cannot be waived, and Class B Members are not "
           "entitled to notice of or attendance at any meeting of Members. Class B Units have the same economic rights per Unit as "
           "Class A Units, subject to Section 3.5, and vest or are forfeited solely as the holder's Service Agreement provides."))
s.append(P("<b>3.4 Issuance of Units; Brock Reserve.</b> No Units, options, warrants, SAFE-like convertible instruments, "
           "convertible debt or other rights to acquire Units may be issued, no new class or series of equity may be created, and "
           "no equity or option incentive pool may be created or materially expanded, except with Supermajority Approval; provided "
           "that the Members hereby approve, and no further approval is required for, the issuance of up to <b>%s Class B Units</b> "
           "to [Class B Member] in accordance with the milestone terms of his Service Agreement (the \"Brock Reserve\"). The remaining "
           "%s authorized but unissued Units are unallocated, are reserved for future Company action and are not allocated or "
           "promised to any Person." % (fmt(BROCK_RESERVE), fmt(UNISSUED - BROCK_RESERVE))))
s.append(P("<b>3.5 Units issued for services; Threshold Value.</b> All Units issued as of the Effective Date, and any Units later "
           "issued for services, are issued in consideration of services rendered and to be rendered to the Company (and, for "
           "Class A Members, the assignment of intellectual property under their Proprietary Information and Inventions Assignment "
           "Agreements), without cash consideration. Each such issuance is assigned a Threshold Value equal to the aggregate "
           "positive Capital Account balances of all Members immediately before the issuance (or such greater amount as the "
           "Members determine in good faith is necessary to reflect the liquidation value of the Company at that time), recorded "
           "on Schedule A. The aggregate positive Capital Account balances immediately before the issuances made on the Effective "
           "Date are $0, and the Threshold Value of those issuances is accordingly $0. Units issued for services participate in "
           "distributions only to the extent provided in Article 6, so that on the issuance date they would receive nothing if the "
           "Company were liquidated at their Threshold Value. Such Units are intended to be \"profits interests\" within the "
           "meaning of Revenue Procedures 93-27 and 2001-43. The Company and each recipient will treat the recipient as the owner "
           "of the Units, and as a partner of the Company for federal income tax purposes, from the date of issuance whether or "
           "not the Units are then vested, and will allocate the recipient's distributive share accordingly; neither the Company "
           "nor any recipient will claim a deduction for the issuance. Each Member is solely responsible for the tax consequences "
           "of the Member's Units, and the Company makes no representation regarding tax treatment."))
s.append(P("<b>3.6 Separate obligations.</b> Member services, pre-formation contributions, post-formation services, IP "
           "assignments, JGN-paid expenses, reimbursements, future expenses, confidentiality obligations, non-solicitation "
           "obligations and acquisition cooperation are separate obligations under this Agreement and the Members' other written "
           "agreements with the Company. They are not Capital Contributions, do not create any additional Unit entitlement, and "
           "are not reduced or satisfied by the issuance of Units under Section 3.5."))
s.append(P("<b>3.7 Capital Contributions and Capital Accounts.</b> Capital Contributions, if any, are recorded on Schedule A. No "
           "Member is required to make any Capital Contribution or loan to the Company. No interest accrues on Capital "
           "Contributions, and no Member may withdraw or demand the return of capital except as this Agreement provides. A Capital "
           "Account will be maintained for each Member in accordance with Treasury Regulation Section 1.704-1(b)(2)(iv), and the "
           "Members may adjust Capital Accounts as that Regulation permits, including on any issuance of Units in consideration of "
           "services."))
s.append(P("<b>3.8 JGN Advances.</b> The Members acknowledge the JGN Advances, being approximately $2,000 of documented July 2026 "
           "AI and development expenses paid by JGN on the Company's behalf, to be reconciled and recorded by the Chief Executive "
           "Officer. The JGN Advances are unsecured, non-interest-bearing obligations of the Company to JGN, repayable when the "
           "Members determine that cash is reasonably available. They are not Capital Contributions, are not founder advances, and "
           "do not entitle JGN or any Member to any Units or other interest in the Company."))
s.append(P("<b>3.9 Member admission; joinder.</b> Each Person listed on Schedule A is admitted as a Member as of the Effective Date "
           "upon notation on Schedule A. Additional Class A Members may be admitted only with Supermajority Approval. Class B "
           "Members are admitted upon issuance under Section 3.4 and execution of a joinder in the form of Schedule G. Every new "
           "Member is bound by this Agreement as if an original signatory."))
s.append(P("<b>3.10 Limited liability; no certificates.</b> No Member or officer is personally liable for any debt, obligation or "
           "liability of the Company solely by reason of that status. Units are uncertificated, and Schedule A is the record of "
           "ownership."))

# =========================== ARTICLE 4 ===========================
s.append(ART("ARTICLE 4 %s VESTING; FORFEITURE; REPURCHASE" % DASH))
s.append(P("<b>4.1 Vesting of Class A Units.</b> For each Class A Member, fifty percent (50%) of that Member's Class A Units are "
           "Vested Units on the Effective Date. The remaining fifty percent (50%) vest in forty-eight (48) equal monthly "
           "installments on the last day of each calendar month beginning with the month in which the Effective Date falls. There "
           "is no cliff. The Vesting Commencement Date is the Effective Date. Schedule F records each Class A Member's vesting."))
s.append(P("<b>4.2 Officer Service condition.</b> Vesting is conditioned on continued Officer Service through each vesting date. If "
           "a Class A Member ceases Officer Service, vesting stops on the cessation date unless otherwise approved in writing by "
           "the required Members."))
s.append(P("<b>4.3 Option-based repurchase right.</b> Upon cessation of Officer Service, vesting stops, the Company determines the "
           "remaining Unvested Units, and the Company has ninety (90) days after receiving actual knowledge of the cessation event "
           "to exercise its repurchase option by written notice. The amount payable for the repurchased Unvested Units equals the "
           "Original Cost allocable to those Units. Because the Class A Units are issued in consideration of services, the Original "
           "Cost is $0 and a valid exercise operates as a forfeiture and cancellation of the Unvested Units without payment. Where "
           "any amount is payable, payment may be made by electronic funds transfer, check, lawful offset of an undisputed amount "
           "or another lawful method. The repurchase becomes effective upon valid exercise and, where an amount is payable, upon "
           "valid payment or tender; the Company then updates Schedules A and F, and the Member shall execute reasonable transfer "
           "documentation. If the Member fails to cooperate following valid exercise, the Company may update its records to "
           "reflect the repurchase to the extent legally enforceable."))
s.append(P("<b>4.4 No automatic cancellation.</b> Unvested Units do not automatically cancel solely because Officer Service ends. "
           "The Company must affirmatively exercise the repurchase option under Section 4.3."))
s.append(P("<b>4.5 Full single-trigger Change of Control acceleration.</b> Upon consummation of a Change of Control, one hundred "
           "percent (100%) of each Class A Member's then-unvested Class A Units immediately vest."))
s.append(P("<b>4.6 Death or Permanent Disability acceleration.</b> Upon a Class A Member's death or Permanent Disability while in "
           "Officer Service, one hundred percent (100%) of that Member's then-unvested Class A Units immediately vest."))
s.append(P("<b>4.7 Bad Leaver.</b> A Bad Leaver retains Vested Units subject to this Agreement's transfer restrictions, right of "
           "first refusal, confidentiality, IP, restrictive covenant and enforcement provisions. The Company does not receive a "
           "punitive forfeiture right or below-value repurchase right over already Vested Units merely because the Member is a Bad "
           "Leaver. The Company retains claims for damages, injunctive relief and other appropriate contractual remedies."))
s.append(P("<b>4.8 Good Leaver.</b> If a Class A Member is a Good Leaver, Vested Units remain outstanding subject to the transfer "
           "restrictions of Article 7. Unvested Units remain subject to Company repurchase at Original Cost through the option "
           "process in Section 4.3."))
s.append(P("<b>4.9 Death, disability, divorce, bankruptcy.</b> Vested Units may pass only as economic interests unless the "
           "transferee is admitted as a Member by Majority Approval. Death or Permanent Disability may permit an optional Company "
           "purchase of Vested Units at Fair Market Value determined under Section 4.13, if approved and documented. Any "
           "involuntary transfer, divorce order, bankruptcy estate claim or creditor process is subject to this Agreement and "
           "applicable law."))
s.append(P("<b>4.10 Class B Units; vesting and forfeiture.</b> Class B Units vest, and are forfeited and cancelled, solely as the "
           "holder's Service Agreement provides, and not under Sections 4.1 through 4.9. The Company has no obligation to "
           "repurchase Class B Units. If a Class B Member's Service Agreement terminates for any reason, the Company has the right, "
           "but not the obligation, exercisable by written notice within ninety (90) days after receiving actual knowledge of the "
           "termination, to repurchase all or any portion of that Member's Vested Class B Units at the amount determined under "
           "Section 4.11."))
s.append(P("<b>4.11 Repurchase amount for Vested Class B Units.</b> The amount payable is Fair Market Value on the termination "
           "date, taking into account the Threshold Value; except that if the Service Agreement was terminated by the Company for "
           "the holder's material breach, for cause, or following an uncured performance or value notice as defined in that "
           "Service Agreement, or if the holder terminated the Service Agreement in breach of its terms, the amount is the lesser "
           "of Fair Market Value and the holder's Original Cost. The Company may pay in cash or by an unsecured promissory note "
           "bearing interest at the applicable federal rate, payable in equal quarterly installments over not more than "
           "twenty-four (24) months."))
s.append(P("<b>4.12 Authority to record.</b> Each Member irrevocably appoints the Chief Executive Officer as the Member's agent and "
           "lawful representative, coupled with an interest, solely to execute any instrument necessary to record a repurchase, "
           "forfeiture or cancellation validly effected under this Article."))
s.append(P("<b>4.13 Determination of Fair Market Value.</b> Fair Market Value is determined in good faith by Majority Approval, "
           "taking into account the Company's financial condition, revenue, prospects, comparable transactions and customary "
           "discounts for lack of marketability and control. A Member who disputes the determination within fifteen (15) days may, "
           "at that Member's expense, obtain an appraisal from an independent appraiser reasonably acceptable to the Members. If "
           "the appraised value exceeds the Members' determination by more than twenty percent (20%), the appraised value controls "
           "and the Company reimburses the appraisal cost; otherwise the Members' determination controls."))

# =========================== ARTICLE 5 ===========================
s.append(ART("ARTICLE 5 %s MANAGEMENT; OFFICERS; VOTING" % DASH))
s.append(P("<b>5.1 Member-managed company.</b> The Company is member-managed within the meaning of the Act. No board and no "
           "separate manager position is created by this Agreement, and no Person holds the office of manager. Management is "
           "vested in the Class A Members, who act through the approval thresholds in this Article and through the officers they "
           "appoint."))
s.append(P("<b>5.2 Officers; authority of the Chief Executive Officer.</b> The Members appoint the officers listed on Schedule B. "
           "Officers serve at the pleasure of the Members. Officer titles do not constitute employment guarantees, salary "
           "guarantees, guaranteed payments or contractual terms of employment, and no Member is entitled to salary or guaranteed "
           "payments as of the Effective Date. <b>%s is the Chief Executive Officer of the Company</b> and, within the approval "
           "limits of this Article and any approved budget, has authority to act for and bind the Company, including to negotiate, "
           "execute, deliver and perform contracts and other instruments on the Company's behalf; to engage and terminate "
           "independent contractors and talent; to open and operate Company Accounts consistent with Section 5.9; to issue Units "
           "within the Brock Reserve; to record Threshold Values; to approve sponsorship and brand arrangements; to retain "
           "advisors; to commence, defend and settle claims; and to take any other action in the ordinary course of the Company's "
           "business. The Chief Executive Officer signs Company agreements under the signature block \"%s, Chief Executive "
           "Officer,\" and Persons dealing with the Company may rely on that authority without inquiry, subject to the internal "
           "approval requirements of this Article." % (CEO_NAME, CEO_NAME)))
s.append(P("<b>5.3 Majority vote matters.</b> Majority Approval governs ordinary business decisions and other matters not requiring "
           "a different approval threshold under this Agreement or mandatory law, including approval of any annual budget, "
           "distributions under Section 6.1, officer compensation under Section 5.15 and removal of an officer under Section 5.8. "
           "Admission of a new Member requires Majority Approval unless the issuance also triggers a Reserved Matter."))
s.append(P("<b>5.4 Reserved Matters requiring Supermajority Approval.</b> The following require Supermajority Approval:"))
for item in ["merger", "consolidation", "sale of the Company", "sale of substantially all Company assets", "Change of Control",
             "dissolution", "creation of a new class or series of equity", "preferred Units",
             "issuance of additional Common Units of either class, other than issuances within the Brock Reserve",
             "issuance of other equity interests", "options", "warrants", "SAFE-like convertible instruments", "convertible debt",
             "other rights to acquire Units", "creation of an employee or equity incentive pool",
             "material expansion of an approved equity pool", "amendment materially affecting capitalization",
             "sale or exclusive disposition of material Company IP outside the ordinary course",
             "borrowing, guarantees or indebtedness exceeding %s outside an already approved budget" % DEBT_THRESHOLD,
             "Material Related-Party Transactions", "material change in tax classification",
             "admission of a Class A Member", "filing for bankruptcy or making an assignment for the benefit of creditors",
             "amendments to this Agreement generally"]:
    s.append(BUL(item))
s.append(Spacer(1, 4))
s.append(P("<b>5.5 No equity incentive pool.</b> There is currently no equity incentive pool, and this Agreement does not create "
           "one. The Brock Reserve is a specific pre-approved reservation for a single named Service Agreement and is not an "
           "incentive pool. If a pool is later approved by Supermajority Approval, individual grants within that approved pool may "
           "be delegated separately."))
s.append(P("<b>5.6 Admission and issuance.</b> Admission of a new Member receiving newly issued Company equity must satisfy the "
           "approval threshold governing the equity issuance."))
s.append(P("<b>5.7 Amendments.</b> Amendments to this Agreement generally require Supermajority Approval, as further provided in "
           "Section 13.1. Any amendment that disproportionately and adversely changes a particular Member's vested economic rights "
           "also requires that affected Member's consent to the extent appropriate under Delaware law."))
s.append(P("<b>5.8 Officer removal and Member expulsion.</b> An officer may be removed by Majority Approval. Actual involuntary "
           "expulsion of a Member requires unanimous approval of all other disinterested Members, with the affected Member not "
           "voting on that Member's own expulsion for Cause, and may not confiscate already Vested Units except pursuant to an "
           "enforceable contractual repurchase provision of this Agreement or a Service Agreement."))
s.append(P("<b>5.9 Banking authority.</b> The authorized banking signers are %s. Each may act individually at the bank; however, "
           "bank-facing authority does not override the internal governance requirements of this Agreement. Company funds will be "
           "held in accounts in the Company's name and will not be commingled with the funds of any Member or Affiliate."
           % (", ".join(BANK_SIGNERS[:-1]) + " and " + BANK_SIGNERS[-1])))
s.append(P("<b>5.10 Spending limits and anti-circumvention.</b> Any expenditure, contract or commitment of %s or more that is "
           "outside an already approved budget requires Majority Approval. Ordinary expenditures under %s may be approved by an "
           "authorized officer within that officer's delegated responsibilities. Transactions may not be artificially divided into "
           "multiple smaller payments or contracts to avoid approval. Debt or guarantees over %s outside approved authority "
           "require Supermajority Approval." % (SPEND_THRESHOLD, SPEND_THRESHOLD, DEBT_THRESHOLD)))
s.append(P("<b>5.11 Related-party transactions.</b> Material Related-Party Transactions require Supermajority Approval unless "
           "already specifically approved through an approved budget, an approved agreement or prior Member approval. The Members "
           "acknowledge that several Members are also members of JGN. The intercompany license agreements described in Section "
           "11.2, the JGN Advances under Section 3.8, and the Service Agreement of [Class B Member] and the issuances within the Brock "
           "Reserve, have each been specifically approved by the Members in the Company's organizational written consent and do "
           "not require further approval under this Section."))
s.append(P("<b>5.12 Delegation by the Chief Executive Officer.</b> The Chief Executive Officer may appoint subordinate non-member "
           "officers or agents, and may delegate authority to any officer, consistent with approved authority and budget and "
           "without amending this Agreement."))
s.append(P("<b>5.13 Fiduciary and contractual duties.</b> Members and officers shall act in good faith, protect Company Assets, "
           "preserve Company opportunities, safeguard Company Accounts and comply with their written agreements. The Company does "
           "not eliminate, and the Members do not waive, the fiduciary duties of Members and officers to the Company and to each "
           "other; no election is made under Section 18-1101(c) of the Act to eliminate those duties. The implied contractual "
           "covenant of good faith and fair dealing may not be eliminated."))
s.append(P("<b>5.14 Action by Members.</b> Members may act at a meeting or by written consent without a meeting, and consent given "
           "by email is sufficient. Approval thresholds are measured against the Class A Units issued and outstanding at the time "
           "of the action; Class B Units and authorized but unissued Units are disregarded for all voting, consent, quorum and "
           "approval purposes."))
s.append(P("<b>5.15 Compensation; reimbursement.</b> Compensation of officers, if any, requires Majority Approval. Officers and "
           "Members will be reimbursed for reasonable documented expenses incurred on the Company's behalf within approved "
           "authority."))
s.append(P("<b>5.16 Indemnification and exculpation.</b> The Company will indemnify and hold harmless each officer and each Member "
           "from any loss, claim or expense (including reasonable legal fees and expenses) arising from any act or omission taken "
           "in good faith on the Company's behalf within the scope of that Person's authority, except to the extent finally "
           "determined to result from bad faith, willful misconduct, knowing violation of law, breach of the duty of loyalty, a "
           "transaction from which the Person derived an improper personal benefit, or a material breach of this Agreement or "
           "another Company agreement. Indemnification is payable only from Company assets, and no Member is required to "
           "contribute capital to fund it. The Company may advance defense costs on receipt of an undertaking to repay if "
           "indemnification is ultimately not permitted. This Section does not limit Section 5.13."))
s.append(P("<b>5.17 Other business activities.</b> A Member or officer may engage in other business activities, and neither the "
           "Company nor any other Member has any right to those activities or their income, except as required by Section 5.13, "
           "Article 9, Article 10 and that Person's separate written agreements with the Company, including any Proprietary "
           "Information and Inventions Assignment Agreement or Service Agreement."))

# =========================== ARTICLE 6 ===========================
s.append(ART("ARTICLE 6 %s DISTRIBUTIONS; ALLOCATIONS; TAX" % DASH))
s.append(P("<b>6.1 Distributions.</b> Distributions require Majority Approval and shall be made pro rata by Percentage Interest, "
           "except that Units issued in consideration of services share only in distributions attributable to value in excess of "
           "their Threshold Value, as reasonably determined by the Members; amounts those Units would otherwise have received that "
           "are attributable to value at or below their Threshold Value are distributed to the other Members in proportion to "
           "their Percentage Interests. Unvested Units share in distributions on the same basis as Vested Units. Distributions are "
           "the agreed economic payment mechanism, subject to Company approval, solvency and applicable tax law, except approved "
           "reimbursements."))
s.append(P("<b>6.2 Capital accounts.</b> The Company shall maintain capital accounts in accordance with Section 3.7 and applicable "
           "tax rules. No Member has made a cash Capital Contribution as of the Effective Date, and the aggregate positive Capital "
           "Account balances immediately before the Effective Date issuances are $0."))
s.append(P("<b>6.3 Tax classification.</b> The Company is classified as a partnership for federal and applicable state income tax "
           "purposes and files Internal Revenue Service Form 1065. The Company's Employer Identification Number is %s. No election "
           "to be classified as a corporation or otherwise may be made without Supermajority Approval, and the Company will not "
           "file Form 8832 unless it affirmatively elects another classification. Nothing in this Agreement creates a partnership "
           "for any purpose other than tax." % EIN))
s.append(P("<b>6.4 Partnership Representative.</b> Nicholas Restivo is designated as the initial Partnership Representative under "
           "Section 6223 of the Code, with authority to act for the Company in any tax proceeding, to make any election (including "
           "under Sections 754, 6221(b) and 6226 of the Code) and to bind the Members. No other Person is designated. Each Member "
           "will cooperate and is responsible for its share of any imputed underpayment, including after ceasing to be a Member."))
s.append(P("<b>6.5 Tax year and accounting method.</b> The tax year and fiscal year is the calendar year ending December 31. The "
           "accounting method is the cash method to the extent the Company is eligible to use it."))
s.append(P("<b>6.6 Tax elections.</b> Any material change in tax classification requires Supermajority Approval. Other tax "
           "elections may be approved by Majority Approval unless they constitute Reserved Matters."))
s.append(P("<b>6.7 Allocations.</b> After the regulatory allocations in Section 6.8, net income and net loss (and each item of "
           "income, gain, loss and deduction) for each fiscal year are allocated among the Members so that each Member's Capital "
           "Account, as nearly as possible, equals the amount the Member would receive if the Company sold its assets for book "
           "value, paid its liabilities and distributed the remainder under Section 6.9."))
s.append(P("<b>6.8 Regulatory allocations.</b> The allocations in this Article are intended to comply with Section 704(b) of the "
           "Code and the Regulations under it, including the qualified income offset, minimum gain chargeback and nonrecourse "
           "deduction rules, which are incorporated by reference and control over Section 6.7 to the extent required. Tax items "
           "follow book items except as Section 704(c) of the Code requires. The Members may make such other allocations as are "
           "necessary to comply with the Code, including allocations that preserve the intended treatment of Units issued in "
           "consideration of services under Section 3.5."))
s.append(P("<b>6.9 Distributions on a Change of Control or liquidation.</b> Net proceeds of a Change of Control or of liquidation, "
           "after payment of liabilities (including the JGN Advances under Section 3.8) and reasonable reserves, are distributed "
           "(a) first, to the Members in proportion to, and to the extent of, their unreturned cash Capital Contributions, if any; "
           "and (b) then to all Members in proportion to their Percentage Interests, subject to the Threshold Value limitation in "
           "Section 6.1."))
s.append(P("<b>6.10 Tax distributions.</b> To the extent cash is reasonably available and consistent with the Company's "
           "obligations, reserves and solvency, the Company will use reasonable efforts to distribute to each Member, no later "
           "than April 10 of each year, an amount sufficient to cover the Member's estimated federal, state and local income tax on "
           "the net taxable income allocated to that Member for the prior year, at an assumed combined rate set by Majority "
           "Approval and applied uniformly to all Members. Tax distributions are discretionary, are advances against, and reduce, "
           "the Member's later distributions."))
s.append(P("<b>6.11 Withholding; limitations.</b> The Company may withhold from distributions any amount required by law and treat "
           "it as distributed to the Member. No distribution may be made in violation of Section 18-607 of the Act."))

# =========================== ARTICLE 7 ===========================
s.append(ART("ARTICLE 7 %s TRANSFERS; ROFR; TAG; DRAG" % DASH))
s.append(P("<b>7.1 Transfer restrictions.</b> No Member may Transfer any Units except as permitted by this Agreement. Any attempted "
           "Transfer in violation of this Agreement is void to the maximum extent permitted by law, and the Company will not "
           "recognize the transferee for any purpose. Unvested Units may not be Transferred."))
s.append(P("<b>7.2 Right of first refusal.</b> Before Transferring Vested Units to a third party, a Member must deliver written "
           "notice to the Company and the other Class A Members stating the proposed transferee, price and terms. The Company has "
           "a first right, exercisable within thirty (30) days, to purchase the offered Units on the same terms."))
s.append(P("<b>7.3 Secondary Member right of first refusal.</b> If the Company does not exercise its right of first refusal in full "
           "within the period in Section 7.2, the remaining Class A Members may exercise a secondary right of first refusal, within "
           "a further fifteen (15) days, pro rata among those electing or as otherwise agreed. If the offered Units are not "
           "purchased in full, the selling Member may Transfer them to the named transferee, on terms no more favorable to the "
           "transferee than those offered, within sixty (60) days, subject to Sections 7.6 and 7.11."))
s.append(P("<b>7.4 Tag-along.</b> If Members holding more than fifty percent (50%) of the outstanding Units propose to sell Units to "
           "a third party in a transaction not structured as a Company sale approved under Section 5.4, each other Member may "
           "elect, by written notice within fifteen (15) days after receiving notice of the proposed Transfer, to participate pro "
           "rata with that Member's Vested Units on the same per-Unit terms."))
s.append(P("<b>7.5 Drag-along.</b> If a sale of the Company or a Change of Control is approved by Supermajority Approval, all "
           "Members (including each Class B Member) shall cooperate with the transaction, consent to it, raise no objection, sign "
           "required customary documents, participate on the same per-Unit terms as the approving Class A Members (subject to "
           "Sections 6.1 and 6.9) and waive appraisal or analogous rights to the maximum extent permitted by Delaware law."))
s.append(P("<b>7.6 Equal treatment and acquisition liability protections.</b> Each holder of the same class must receive the same "
           "consideration per Unit, subject only to expressly authorized preferences, the Threshold Value limitation applicable to "
           "Units issued in consideration of services, proportional escrow, proportional holdback, customary tax-election "
           "differences and individual service or rollover arrangements separately negotiated and not deducted from other holders' "
           "consideration. Member liability for sale representations is several and not joint, generally capped at consideration "
           "actually received, with fraud and individual covenant breaches treated as customary exceptions. No Member is "
           "responsible for another Member's representations, is required to make representations other than as to title, "
           "authority and non-contravention, or is required to contribute more than the sale proceeds actually received."))
s.append(P("<b>7.7 Permitted family and estate transfers.</b> Vested Units may be Transferred to revocable trusts, estate-planning "
           "trusts, wholly owned family entities or estates following death if the transferee signs a joinder in the form of "
           "Schedule G, the Transfer does not circumvent the restrictions of this Agreement and the transferee receives only "
           "economic rights until properly admitted as a Member."))
s.append(P("<b>7.8 Transfers to existing Members.</b> Transfers of Vested Units to existing Members may occur with Majority "
           "Approval without a full third-party right-of-first-refusal process."))
s.append(P("<b>7.9 No pledge without consent.</b> A Member may not pledge, hypothecate or encumber Units without Majority Approval."))
s.append(P("<b>7.10 Access termination.</b> Upon cessation of Service or upon Company request, Company system, source-code, "
           "database, payment, admin, credential, API key, token, SSH key, signing certificate, environment variable, deployment "
           "secret, recovery code and domain access must be returned or disabled promptly based on role and transition needs."))
s.append(P("<b>7.11 Class B Units; transferee status; securities compliance.</b> Class B Units may not be Transferred to any Person "
           "other than the Company, except by will or the laws of descent and distribution, in which case the transferee holds only "
           "the economic rights of the Units and remains subject to Article 4. A transferee of any Units becomes a Member only upon "
           "executing a joinder in the form of Schedule G and, for Class A Units, upon Supermajority Approval; otherwise the "
           "transferee holds only the economic rights of an assignee under Section 18-702 of the Act. Every Transfer is subject to "
           "compliance with applicable securities laws."))

# =========================== ARTICLE 8 ===========================
s.append(ART("ARTICLE 8 %s DEADLOCK" % DASH))
s.append(P("<b>8.1 Scope.</b> These deadlock provisions apply only to material Reserved Matters, and not to routine operational "
           "disagreements."))
s.append(P("<b>8.2 Process.</b> The Members shall first engage in a thirty (30) day good-faith negotiation period. If the matter "
           "remains unresolved, it proceeds to confidential nonbinding mediation, which may occur remotely. If unresolved after "
           "mediation, the status quo remains unless this Agreement otherwise permits action."))
s.append(P("<b>8.3 Delaware court.</b> The Delaware Court of Chancery remains available for fiduciary, equitable, injunctive, "
           "books-and-records and other matters properly within its jurisdiction."))
s.append(P("<b>8.4 No forced rewrite.</b> No mediator, arbitrator or deadlock process may rewrite ownership, compel capital "
           "contributions, force a sale, alter vesting or change the required voting threshold."))

# =========================== ARTICLE 9 ===========================
s.append(ART("ARTICLE 9 %s INTELLECTUAL PROPERTY; DATA; ACCOUNTS" % DASH))
s.append(P("<b>9.1 Company ownership.</b> All Company IP and post-formation work product created by Members, officers, contractors "
           "or other service providers within the scope of Company activities belongs exclusively to the Company."))
s.append(P("<b>9.2 Member PIIA.</b> Each Class A Member must sign a Proprietary Information, Inventions Assignment, "
           "Confidentiality, Data Security and Non-Solicitation Agreement (a \"PIIA\") containing direct confirmatory present "
           "assignments of any residual personally held pre-formation Company-related rights. [Founder B]'s PIIA expressly "
           "assigns to the Company, to the extent personally owned, the current Nosebleed logo artwork and source files, logo "
           "variations, current visual identity, new design system, product-brand design assets and derivative works. All such "
           "assignments run to the Company and not to JGN; JGN's use of Company-owned logo and design assets is governed solely by "
           "the Logo and Visual Identity License described in Section 11.2(b). A Class B Member's intellectual property and "
           "confidentiality obligations are governed by that Member's Service Agreement."))
s.append(P("<b>9.3 Asset assignment.</b> The Company shall receive assignments of the JGN-owned Assigned Assets listed on Schedule "
           "C, subject to third-party platform terms. Domain, repository, database, Discord and account transfers must be "
           "completed as post-closing operational steps where third-party platforms require separate action."))
s.append(P("<b>9.4 JGN Retained Assets.</b> JGN retains the JGN Retained Assets listed on Schedule D. The Company receives only the "
           "assignment, license or transition rights expressly granted in the JGN agreements described in Section 11.2."))
s.append(P("<b>9.5 Account security.</b> Company Accounts should, where reasonably practicable, use Company-controlled email, "
           "Company billing information, Company recovery mechanisms, secure credentials, multi-factor authentication where "
           "available and at least two Company-approved administrators. Target control and policy must be distinguished from "
           "current implementation status."))
s.append(P("<b>9.6 AI development history.</b> AI tools used during development include OpenAI and Anthropic Claude and Claude "
           "Code. Generative AI was used during development. AI-related history exists within JGN-controlled AI history and "
           "accounts unless and until a platform-compliant transfer or documentation occurs. The Company does not state that all "
           "AI-generated output is automatically copyrightable."))
s.append(P("<b>9.7 Privacy status.</b> Privacy, data-processing, app-store and platform compliance are not represented as fully "
           "audited until [Founder B]'s remaining privacy and data responses are incorporated."))
s.append(P("<b>9.8 Brand use.</b> The Company will use the NOSEBLEED SPORTS name and master brand only in accordance with the Master "
           "Brand and Trademark License described in Section 11.2(a), and will not challenge JGN's ownership of the master brand."))

# =========================== ARTICLE 10 ===========================
s.append(ART("ARTICLE 10 %s CONFIDENTIALITY; NON-SOLICITATION" % DASH))
s.append(P("<b>10.1 Confidentiality.</b> Members shall protect Company confidential information, source code, data, financial "
           "information, customer information, product plans, credentials, strategies and diligence materials, and the terms of "
           "this Agreement, subject to customary exclusions for information a Member can establish becomes public without breach, "
           "was lawfully known without confidentiality restriction, was lawfully received from a third party without duty, or was "
           "independently developed without Company confidential information. This obligation survives a Member's departure and, "
           "as to trade secrets and credentials, for as long as the information remains protected."))
s.append(P("<b>10.2 Non-solicitation.</b> During Service and for twelve (12) months thereafter, to the maximum extent permitted by "
           "applicable law, a Member may not knowingly and directly solicit for competitive diversion Company contractors, service "
           "providers or personnel with whom the Member materially worked or about whom the Member obtained confidential "
           "information, or current Company customers or active prospects with whom the Member had material Company contact or "
           "about whom the Member obtained material confidential information. General advertising, unsolicited approaches and "
           "legally protected activity are excluded."))
s.append(P("<b>10.3 No general non-compete; protected activity.</b> This Agreement does not impose a general non-compete covenant, "
           "but it restricts misuse of Company IP, confidential information, accounts, opportunities and relationships. Nothing in "
           "this Agreement prohibits reports to regulators, participation in government investigations, lawful whistleblower "
           "activity, legally protected communications or disclosures protected by law."))

# =========================== ARTICLE 11 ===========================
s.append(ART("ARTICLE 11 %s JGN / NOSEBLEED LEGAL SEPARATION AND COMBINED SALE" % DASH))
s.append(P("<b>11.1 Separate entities.</b> The Company and JGN remain separate legal entities with distinct ownership, assets, "
           "capitalization, approvals and records. JGN's ownership is shown for approval context on Schedule E. Nothing in this "
           "Agreement transfers any interest in JGN to the Company or any interest in the Company to JGN."))
s.append(P("<b>11.2 Intercompany agreements.</b> The relationship between the Company and JGN with respect to brand, identity and "
           "audience is governed by three separate written agreements, which are distinct and are not to be consolidated:"))
s.append(BUL("<b>(a) Master Brand and Trademark License (JGN to the Company).</b> JGN owns the master NOSEBLEED SPORTS brand and "
             "trademark, the historical goodwill in it, and the legacy media assets, and licenses to the Company the exclusive "
             "right to use the brand in the field of the Company's app, website, Discord, subscription and premium offerings and "
             "related technology products. The license survives a bona fide Change of Control of the Company, subject to "
             "reasonable successor and quality-control terms."))
s.append(BUL("<b>(b) Logo and Visual Identity License (the Company to JGN).</b> The Company owns the product logo, design and "
             "visual-identity assets, including those assigned under Section 9.2, and licenses to JGN the right to use them on "
             "JGN's retained media properties."))
s.append(BUL("<b>(c) Marketing and Audience License (JGN to the Company).</b> JGN retains ownership of the legacy social media "
             "accounts and legacy media assets and grants the Company a nonexclusive, royalty-free license to distribute Company "
             "content and offers through those social properties."))
s.append(Spacer(1, 4))
s.append(P("<b>11.3 Combined sale strategy.</b> The parties may seek a future transaction in which a strategic buyer purchases both "
           "JGN and the Company. That strategy is not a binding obligation, and neither entity is required by this Agreement to be "
           "sold only together."))
s.append(P("<b>11.4 Allocation protections.</b> Because the entities have different ownership structures, any future combined "
           "acquisition must be separately approved by each entity under its own governing documents. A buyer should separately "
           "state consideration allocated to each entity whenever practicable. If a buyer proposes one lump-sum amount with no "
           "reliable entity allocation, the allocation between JGN and the Company must be approved separately by each entity "
           "after consideration of an independent valuation or other commercially reasonable valuation methodology. No overlapping "
           "Member may unilaterally shift value from one entity to the other."))
s.append(P("<b>11.5 Negotiation authority.</b> Transaction negotiations on behalf of the Company are led by %s as Chief Executive "
           "Officer. Any Change of Control, sale of the Company or sale of substantially all Company assets requires Supermajority "
           "Approval under Section 5.4, and the Chief Executive Officer has no authority to bind the Company to any such "
           "transaction without it." % CEO_NAME))

# =========================== ARTICLE 12 ===========================
s.append(ART("ARTICLE 12 %s RECORDS; COMPLIANCE; DILIGENCE" % DASH))
s.append(P("<b>12.1 Books and records.</b> The Company shall keep complete books and records at its principal office, including the "
           "filed Certificate of Formation, this Agreement and its Schedules, Member and officer consents, the membership interest "
           "ledger, capitalization table, vesting ledger, joinders, Service Agreements, PIIAs, IP records, the JGN agreements, tax "
           "records, banking records and compliance items. The fiscal year is the calendar year."))
s.append(P("<b>12.2 New York compliance.</b> Because the Company's principal office is in New York, the Chief Executive Officer is "
           "directed to cause the Company to qualify to do business as a foreign limited liability company in New York, to satisfy "
           "any related publication requirement, to register for applicable state and local tax accounts, and to qualify in any "
           "other jurisdiction where the Company's activities require it. Delaware annual tax and annual compliance obligations "
           "must be satisfied using then-current requirements."))
s.append(P("<b>12.3 Acquisition cooperation.</b> Members shall provide reasonable cooperation for financing, acquisition, "
           "diligence, audit, tax, IP-chain-of-title, account-transition and record-book completion matters."))
s.append(P("<b>12.4 Insurance.</b> The Company is not purchasing insurance as of the Effective Date. Future insurance may be "
           "authorized by Majority Approval, but this Agreement does not state or imply that the Company currently maintains "
           "directors and officers, cyber, errors and omissions, general liability or any other insurance policy."))
s.append(P("<b>12.5 Current personnel.</b> The Company has no employees. The Company engages independent contractors, including "
           "[Class B Member] under his Service Agreement. All other known contributors are Class A Members serving as officers. No "
           "officer title, Unit issuance or Service Agreement creates an employment relationship, and the Company does not "
           "withhold employment taxes for independent contractors."))
s.append(P("<b>12.6 Information rights.</b> Class A Members have the information and inspection rights provided by Section 18-305 "
           "of the Act. Class B Members are entitled to their Internal Revenue Service Schedule K-1 and an annual summary of the "
           "Company's revenue and distributions, and have no other information or inspection rights except as the Act provides and "
           "cannot be waived."))
s.append(P("<b>12.7 Tax returns and Schedules K-1.</b> The Company will cause its partnership returns to be prepared and filed and "
           "will use reasonable efforts to deliver a Schedule K-1 to each Member within ninety (90) days after each year end."))

# =========================== ARTICLE 13 ===========================
s.append(ART("ARTICLE 13 %s AMENDMENTS; DISSOLUTION; MISCELLANEOUS" % DASH))
s.append(P("<b>13.1 Amendments.</b> This Agreement may be amended only by a written instrument approved by Supermajority Approval, "
           "unless a higher or additional affected-Member approval is required under this Agreement or Delaware law; provided that "
           "the Chief Executive Officer may, without further Member approval, (a) update Schedules A, B, C, D, E and F to reflect "
           "actions taken in accordance with this Agreement, (b) make amendments required to comply with the Code or the Act or to "
           "preserve the tax treatment intended by Section 3.5, and (c) correct clerical errors. No amendment may reduce a "
           "Member's Vested Units or the economic rights of Vested Units in a manner disproportionate to the other Members of the "
           "same class without that Member's written consent."))
s.append(P("<b>13.2 Dissolution.</b> Dissolution requires Supermajority Approval or occurs as required by the Act, including on "
           "entry of a decree of judicial dissolution under Section 18-802 of the Act. The death, withdrawal, bankruptcy or "
           "dissolution of a Member does not dissolve the Company."))
s.append(P("<b>13.3 Winding up.</b> Upon dissolution the Chief Executive Officer will wind up the Company's affairs and apply the "
           "assets first to liabilities (including Members and JGN as creditors), then to reasonable reserves, and then to the "
           "Members under Section 6.9 and applicable law. No Member is obligated to restore a negative Capital Account. A "
           "certificate of cancellation will be filed when winding up is complete."))
s.append(P("<b>13.4 Governing law.</b> This Agreement and the internal affairs of the Company are governed by the laws of the State "
           "of Delaware, without regard to conflict-of-law principles."))
s.append(P("<b>13.5 Dispute resolution.</b> For matters other than Reserved Matter deadlocks governed by Article 8, the parties "
           "will attempt in good faith to resolve any dispute through direct negotiation for at least fifteen (15) days after "
           "written notice, and then through nonbinding mediation before a mutually agreed mediator. If the dispute remains "
           "unresolved thirty (30) days after mediation begins, or a party refuses to mediate, any party may bring the dispute in "
           "the Court of Chancery of the State of Delaware or, where that court lacks jurisdiction, in the state or federal courts "
           "located in the State of New York, and each party consents to their jurisdiction and venue. Nothing in this Section "
           "prevents a party from seeking injunctive relief at any time to enforce Articles 3, 4, 7, 9 or 10."))
s.append(P("<b>13.6 Specific performance.</b> Damages would be an inadequate remedy for breach of Articles 3, 4, 7, 9 or 10, and "
           "the Company and the Members are entitled to specific performance and injunctive relief to enforce them, without "
           "posting bond."))
s.append(P("<b>13.7 Notices.</b> Notices may be given by email to the address shown on Schedule A, or as updated by notice, and are "
           "effective when sent absent a bounce or error message."))
s.append(P("<b>13.8 Entire agreement; severability; binding effect; third-party beneficiaries.</b> This Agreement, with its "
           "Schedules, is the entire agreement among the Members regarding the Company and supersedes all prior understandings, "
           "term sheets, binders and drafts, including the \"Version 2.0\" pre-formation binder. If any provision is held "
           "unenforceable, it will be modified to the minimum extent necessary and the remainder will continue in effect. This "
           "Agreement binds and benefits the Members and their permitted successors and assigns. There are no third-party "
           "beneficiaries, except that JGN may enforce Sections 2.5, 3.8, 9.4, 9.8 and 11.2."))
s.append(P("<b>13.9 Counterparts; electronic signatures.</b> This Agreement and any joinder may be signed in counterparts and by "
           "electronic signature, each of which is valid and binding."))

# =========================== SIGNATURES ===========================
s.append(Spacer(1, 10))
s.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#999999"), spaceAfter=10))
s.append(P("IN WITNESS WHEREOF, the undersigned Class A Members have executed this Limited Liability Company Agreement as of the "
           "Effective Date."))
s.append(Spacer(1, 12))

def sigcol(name):
    return [Paragraph("<b>CLASS A MEMBER</b>", sig_style), Spacer(1, 20),
            Paragraph("Signature: ____________________________", sig_style),
            Paragraph("Name: %s" % name, sig_style), Paragraph("Date: __________________", sig_style), Spacer(1, 8)]
founders = [m[0] for m in MEMBERS if m[1] == "A"]
cols = [sigcol(n) for n in founders]
for i in range(0, len(cols), 2):
    pair = cols[i:i + 2]
    n = max(len(c) for c in pair)
    rows = [[c[j] if j < len(c) else "" for c in pair] + ([""] if len(pair) == 1 else []) for j in range(n)]
    t = Table(rows, colWidths=[3.15 * inch, 3.15 * inch])
    t.setStyle(TableStyle([("VALIGN", (0, 0), (-1, -1), "TOP"), ("LEFTPADDING", (0, 0), (-1, -1), 0)]))
    s.append(t)
s.append(Spacer(1, 6))
s.append(P("<b>ACKNOWLEDGED AND AGREED by the Company:</b> &nbsp; %s &nbsp; By: _______________________________ &nbsp; %s, %s"
           % (COMPANY_NAME, CEO_NAME, CEO_TITLE)))
s.append(P("<b>Class B Member</b> (joins by executing the Schedule G joinder on issuance): [Class B Member] %s %s"
           % (DASH, BROCK_SERVICE_AGREEMENT)))

# =========================== SCHEDULE A ===========================
s.append(PageBreak())
s.append(P("SCHEDULE A", title_style))
s.append(P("Members and Capitalization %s Membership Interest Ledger as of %s" % (DASH, EFFECTIVE_DATE), subtitle_style))
s.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#999999"), spaceAfter=12))
rows = [["Member", "Class", "Units", "Percentage\nInterest\n(% of outstanding)", "Fully Diluted\nPercentage\n(% of authorized)",
         "Cash Capital\nContribution", "Original\nCost", "Threshold\nValue", "Notice email"]]
for name, cls, units, email in MEMBERS:
    rows.append([name, cls, fmt(units), pct(units, ISSUED), pct(units, AUTHORIZED_UNITS), "$0", "$0", "$0 (Sec. 3.5)", email])
rows.append(["TOTAL ISSUED AND OUTSTANDING", "", fmt(ISSUED), "100.00%", pct(ISSUED, AUTHORIZED_UNITS), "$0", "", "", ""])
rows.append(["Authorized but unissued (not owned; no vote)", "", fmt(UNISSUED), "n/a", pct(UNISSUED, AUTHORIZED_UNITS), "", "", "", ""])
rows.append(["  of which Brock Reserve (Sec. 3.4)", "B", fmt(BROCK_RESERVE), "n/a", pct(BROCK_RESERVE, AUTHORIZED_UNITS), "", "", "", ""])
rows.append(["  of which unallocated", "", fmt(UNISSUED - BROCK_RESERVE), "n/a", pct(UNISSUED - BROCK_RESERVE, AUTHORIZED_UNITS), "", "", "", ""])
rows.append(["TOTAL AUTHORIZED", "", fmt(AUTHORIZED_UNITS), "", "100.00%", "", "", "", ""])
ta = Table(rows, colWidths=[1.5 * inch, 0.4 * inch, 0.72 * inch, 1.0 * inch, 0.95 * inch, 0.7 * inch, 0.48 * inch, 0.62 * inch, 1.15 * inch], repeatRows=1)
ta.setStyle(GRID)
ta.setStyle(TableStyle([("FONTNAME", (0, len(MEMBERS) + 1), (-1, len(MEMBERS) + 1), "Helvetica-Bold"),
                        ("FONTNAME", (0, -1), (-1, -1), "Helvetica-Bold"), ("FONTSIZE", (0, 0), (-1, -1), 7.4)]))
s.append(ta); s.append(Spacer(1, 8))
s.append(P("<b>Reconciliation.</b> %s issued and outstanding + %s authorized but unissued = %s authorized. Issued Units represent "
           "<b>%s</b> of authorized Units; authorized but unissued Units represent <b>%s</b>, of which the Brock Reserve is %s "
           "Class B Units (Section 3.4) and %s Units are unallocated. The capitalization is deliberately not forced to one hundred "
           "percent (100%%) of authorized Units."
           % (fmt(ISSUED), fmt(UNISSUED), fmt(AUTHORIZED_UNITS), pct(ISSUED, AUTHORIZED_UNITS), pct(UNISSUED, AUTHORIZED_UNITS),
              fmt(BROCK_RESERVE), fmt(UNISSUED - BROCK_RESERVE))))
s.append(P("<b>Voting.</b> Class A Units outstanding: <b>%s</b>. Class B Units outstanding: %s (non-voting). Authorized but "
           "unissued Units: %s (non-voting). Majority Approval requires more than %s Class A Units; Supermajority Approval "
           "requires at least %s Class A Units."
           % (fmt(VOTING), fmt(ISSUED - VOTING), fmt(UNISSUED), fmt(VOTING // 2), fmt(-(-VOTING * 2 // 3)))))
s.append(P("<b>Consideration.</b> All Units shown were issued in consideration of services rendered and to be rendered to the "
           "Company and, for Class A Members, the assignment of intellectual property under their PIIAs. No Member has made a cash "
           "Capital Contribution, the Original Cost of every issued Unit is $0, and the Threshold Value of every issuance made on "
           "the Effective Date is $0, all as provided in Section 3.5."))

# =========================== SCHEDULE B ===========================
s.append(PageBreak())
s.append(P("SCHEDULE B", title_style)); s.append(P("Officers (Section 5.2)", subtitle_style))
s.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#999999"), spaceAfter=12))
to = Table([["Name", "Title"]] + [list(o) for o in OFFICERS] +
           [["[Class B Member]", "None; Class B Member and independent contractor under his Service Agreement"]],
           colWidths=[2.2 * inch, 4.1 * inch]); to.setStyle(GRID); s.append(to)
s.append(Spacer(1, 6))
s.append(P("The Company has no other officers. The offices of Chief Marketing Officer and Chief Creative Officer are not created "
           "and are not filled. Officers serve at the pleasure of the Members under Section 5.2 and may be removed by Majority "
           "Approval under Section 5.8. The Chief Executive Officer is the Company's signing officer and executes Company "
           "agreements as \"%s, Chief Executive Officer.\"" % CEO_NAME))
s.append(Spacer(1, 8))
s.append(P("<b>Authorized banking signers (Section 5.9):</b> %s. Each may act individually at the bank, subject to the internal "
           "approval thresholds of Sections 5.10 and 5.11." % (", ".join(BANK_SIGNERS[:-1]) + " and " + BANK_SIGNERS[-1])))

# =========================== SCHEDULE C ===========================
s.append(PageBreak())
s.append(P("SCHEDULE C", title_style)); s.append(P("Assigned Assets %s from JGN Media LLC to the Company (Section 9.3)" % DASH, subtitle_style))
s.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#999999"), spaceAfter=12))
for item in [
    "Identified Nosebleed Sports product repositories currently housed in GitHub organization GT-Product-Studio; organization "
    "ownership and control is to be confirmed, and unrelated projects are not assigned",
    "Repository nosebleedsportsmedia: server, website and Discord integrations; core product",
    "Repository nosebleed-app: iOS / Expo mobile application",
    "Repository nosebleed-picks: picks generation",
    "Repository nosebleed-runner: hit-props model runner ported from Nicholas Restivo's live_hit_props handoff",
    "Repository nosebleed-dashboard: internal dashboard",
    "Repository nosebleed-odds-archive: cold storage of banked historical odds lines",
    "Domain nosebleedsport.com",
    "Domain nosebleedsportsmedia.com and all associated subdomains (registrar GoDaddy)",
    "Nosebleed Discord server, bots, channels, integrations and member data, subject to Discord platform terms, privacy "
    "requirements and transferable rights",
    "Confirmed infrastructure and product services where account or project transfer is legally and contractually permitted: "
    "Vercel, Supabase, Clerk, Whop, Resend, PostHog and Google Workspace",
    "Product-specific logo, design and brand-kit assets and logo source files used for the Nosebleed Sports product business, "
    "excluding the master NOSEBLEED SPORTS brand and trademark retained by JGN under Schedule D and licensed under Section 11.2(a)",
    "Website, app, backend, APIs, databases, schemas, picks systems, prediction models, AI systems, product-specific content and "
    "related documentation created for the Nosebleed Sports product business",
]:
    s.append(BUL(item))

# =========================== SCHEDULE D ===========================
s.append(Spacer(1, 14))
s.append(P("SCHEDULE D", title_style)); s.append(P("JGN Retained Assets (Section 9.4)", subtitle_style))
s.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#999999"), spaceAfter=12))
for item in [
    "The master NOSEBLEED SPORTS name, brand and trademark, and the historical and common-law rights and goodwill in it, licensed "
    "to the Company under Section 11.2(a)",
    "All legacy social media accounts",
    "All legacy media assets",
    "Historical content",
    "Historical sponsorship agreements",
    "Historical advertising agreements",
    "Historical affiliate agreements",
    "Historical revenue",
    "Legacy social-media business rights not expressly transferred",
    "Any Apple Developer, Stripe, payment, OpenAI, Anthropic or AI-history account owned or controlled by JGN, unless a separate "
    "approved platform-compliant transfer occurs",
    "Any asset not expressly assigned, licensed or transitioned in a signed Nosebleed/JGN agreement",
]:
    s.append(BUL(item))

# =========================== SCHEDULE E ===========================
s.append(PageBreak())
s.append(P("SCHEDULE E", title_style)); s.append(P("JGN Media LLC Ownership and Approval Context (Section 11.1)", subtitle_style))
s.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#999999"), spaceAfter=12))
te = Table([["JGN member", "JGN ownership"]] + [list(r) for r in JGN_OWNERSHIP], colWidths=[3.0 * inch, 2.0 * inch])
te.setStyle(GRID); s.append(te)
s.append(Spacer(1, 8))
s.append(P("JGN Media LLC's governing documents may require eighty percent (80%) approval, and all five JGN members intend to "
           "approve the Nosebleed transaction unanimously. This Agreement does not assume that JGN approval has already occurred. "
           "This Schedule is provided for approval context only; JGN ownership is separate from, and does not affect, the "
           "capitalization of the Company shown on Schedule A."))

# =========================== SCHEDULE F ===========================
s.append(PageBreak())
s.append(P("SCHEDULE F", title_style)); s.append(P("Class A Vesting Ledger (Article 4)", subtitle_style))
s.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#999999"), spaceAfter=12))
vrows = [["Class A Member", "Total Units", "Vested at\nEffective Date (50%)", "Unvested at\nEffective Date (50%)",
          "Monthly tranche\n(48 months)", "Fully vested"]]
for name, cls, units, _ in MEMBERS:
    if cls != "A": continue
    vrows.append([name, fmt(units), fmt(units // 2), fmt(units - units // 2), fmt(round(units / 2 / 48)),
                  "48th month-end after Effective Date"])
tv = Table(vrows, colWidths=[1.5 * inch, 0.9 * inch, 1.15 * inch, 1.15 * inch, 1.0 * inch, 1.6 * inch])
tv.setStyle(GRID); s.append(tv)
s.append(Spacer(1, 8))
s.append(P("Terms: no cliff; vesting conditioned on continued Officer Service (Section 4.2); full acceleration on a Change of "
           "Control (Section 4.5) and on death or Permanent Disability while in Officer Service (Section 4.6); Unvested Units "
           "subject to the Company's option-based repurchase at Original Cost ($0) exercisable within ninety (90) days after "
           "actual knowledge of cessation of Officer Service (Section 4.3), which operates as a forfeiture and cancellation and "
           "is not automatic. Monthly tranches are rounded, and the final tranche absorbs rounding so that one hundred percent "
           "(100%) vests at the 48th month-end."))
s.append(P("<b>[Class B Member] (Class B):</b> not on this Schedule. His 50,000 Initial Units vest and are forfeited solely under "
           "Section 5.4 of his Service Agreement, and up to %s further Class B Units may be issued under the milestone terms of "
           "Section 5.2 of that agreement from the Brock Reserve, as pre-approved by Section 3.4." % fmt(BROCK_RESERVE)))

# =========================== SCHEDULE G ===========================
s.append(PageBreak())
s.append(P("SCHEDULE G", title_style)); s.append(P("Form of Joinder Agreement (Sections 3.9, 7.7 and 7.11)", subtitle_style))
s.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#999999"), spaceAfter=12))
s.append(P("The undersigned is being issued, or is receiving by permitted Transfer, Units of %s (the \"Company\") and, as a "
           "condition of that issuance or Transfer, agrees as follows:" % COMPANY_NAME))
s.append(P("1. The undersigned has received and read the Limited Liability Company Agreement of the Company dated as of %s (as "
           "amended, the \"Agreement\") and agrees to become a party to and be bound by it as a Member holding the class and "
           "number of Units stated below, as if an original signatory." % EFFECTIVE_DATE))
s.append(P("2. Units: &nbsp; Class: ________ &nbsp; Number: ______________ &nbsp; Percentage Interest at issuance: ________% "
           "&nbsp; Fully Diluted Percentage: ________% &nbsp; Threshold Value: $______________ &nbsp; Issuance or Transfer date: "
           "______________ &nbsp; Service Agreement (if any): ______________________________________________."))
s.append(P("3. The undersigned acknowledges that the Units are subject to the vesting, forfeiture, transfer, right of first "
           "refusal, tag-along, drag-along and repurchase provisions of the Agreement and any Service Agreement; that Class B "
           "Units are non-voting and carry no consent, approval, management or meeting rights; that the Company and the "
           "undersigned will treat the undersigned as the owner of the Units, and as a partner for federal income tax purposes, "
           "from the issuance date under Section 3.5 of the Agreement; that the Units have not been registered under any "
           "securities law and are acquired for investment; and that the undersigned is solely responsible for the tax "
           "consequences of the Units."))
s.append(P("4. Notice email: ______________________________________."))
s.append(Spacer(1, 14))
jt = Table([[Paragraph("<b>NEW MEMBER</b>", sig_style), Paragraph("<b>%s</b>" % COMPANY_NAME.upper(), sig_style)],
            [Spacer(1, 22), Spacer(1, 22)],
            [Paragraph("Signature: _______________________________", sig_style), Paragraph("By: _______________________________", sig_style)],
            [Paragraph("Name: ____________________________", sig_style), Paragraph("Name: %s" % CEO_NAME, sig_style)],
            [Paragraph("Date: _______________________", sig_style), Paragraph("Title: %s" % CEO_TITLE, sig_style)]],
           colWidths=[3.15 * inch, 3.15 * inch])
jt.setStyle(TableStyle([("VALIGN", (0, 0), (-1, -1), "TOP"), ("LEFTPADDING", (0, 0), (-1, -1), 0)]))
s.append(jt)

doc = SimpleDocTemplate(OUT, pagesize=letter, leftMargin=0.85 * inch, rightMargin=0.85 * inch, topMargin=0.8 * inch, bottomMargin=0.8 * inch,
                        title="Limited Liability Company Agreement of %s" % COMPANY_NAME, author=COMPANY_NAME)
doc.build(s)
print("Wrote", OUT, "| issued", fmt(ISSUED), "| unissued", fmt(UNISSUED), "| voting", fmt(VOTING),
      "| Brock Reserve", fmt(BROCK_RESERVE), "| unallocated", fmt(UNISSUED - BROCK_RESERVE))
