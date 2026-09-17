#!/usr/bin/env python3
"""Limited Liability Company Agreement of Nosebleed Sports LLC (Delaware) - rev. 2.

Two classes drawn from 10,000,000 authorized Common Units:
  Class A Common Units  - voting; founders; 50% vested at issuance, 50% over 48 months, no cliff
  Class B Common Units  - non-voting; service providers; vesting/forfeiture per each holder's Service Agreement
All service-issued Units are structured as profits interests (Rev. Proc. 93-27 / 2001-43) with a
Threshold Value, so no valuation memorandum and no Section 83(b) election is required.
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
COMPANY_NAME     = "Nosebleed Sports LLC"
FORMATION_DATE   = "August 7, 2026"           # Certificate of Formation filed 1:13 PM, Delaware SR 20263996710
DE_FILE_NUMBER   = "10727267"
REG_OFFICE       = "611 South DuPont Highway, Suite 102, Dover, Delaware 19901"
REG_AGENT        = "ZenBusiness Inc."
EFFECTIVE_DATE   = "____________, 2026"       # date all Class A Members sign
PRINCIPAL_OFFICE = "105 Broadway, Rockville Centre, New York 11570"
EIN              = "__-_______"  # from the IRS CP575B letter; kept out of the public repo
MANAGER_NAME     = "Nicholas Restivo"
MANAGER_TITLE    = "Chief Executive Officer"
AUTHORIZED_UNITS = 10_000_000
DEBT_THRESHOLD   = "$25,000"
AFFILIATE_THRESHOLD = "$10,000"
BROCK_RESERVE    = 450_000                     # Class B reserved for the Brock Smith Service Agreement milestones

# ("Name", "Class", units, "Notice email")  -- Class A = founders (voting); Class B = service providers (non-voting)
MEMBERS = [
    # ("Name", "A"|"B", units, "notice email")  -- fill from the private master record
]
OFFICERS = [
    # ("Name", "Title")  -- fill from the private master record
]
BROCK_SERVICE_AGREEMENT = "Talent, Handicapping, and Content Services Agreement among JGN Media LLC, the Company, and Brock Smith"
# ========================================================================

ISSUED = sum(m[2] for m in MEMBERS)
UNISSUED = AUTHORIZED_UNITS - ISSUED
VOTING = sum(m[2] for m in MEMBERS if m[1] == "A")
def fmt(n): return f"{n:,}"
def pct(n, d): return f"{100.0 * n / d:.2f}%"

styles = getSampleStyleSheet()
title_style = ParagraphStyle("T", parent=styles["Title"], fontName="Helvetica-Bold", fontSize=15, leading=19, alignment=TA_CENTER, spaceAfter=2)
subtitle_style = ParagraphStyle("S", parent=styles["Normal"], fontName="Helvetica", fontSize=10.5, leading=14, alignment=TA_CENTER, textColor=colors.HexColor("#444444"), spaceAfter=10)
article_style = ParagraphStyle("A", parent=styles["Heading2"], fontName="Helvetica-Bold", fontSize=12, leading=15, spaceBefore=14, spaceAfter=6, alignment=TA_CENTER, textColor=colors.HexColor("#111111"))
body_style = ParagraphStyle("B", parent=styles["Normal"], fontName="Helvetica", fontSize=10, leading=14.5, spaceAfter=7)
sig_style = ParagraphStyle("Sig", parent=body_style, spaceAfter=2)
def P(t, s=body_style): return Paragraph(t, s)
def ART(t): return Paragraph(t, article_style)
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
           "<b>Schedule A</b>, as amended from time to time in accordance with this Agreement." % (COMPANY_NAME, EFFECTIVE_DATE)))
s.append(P("The Company was formed as a limited liability company under the Delaware Limited Liability Company Act, 6 Del. C. "
           "&sect; 18-101 et seq. (the \"Act\"), by the filing of a Certificate of Formation with the Delaware Secretary of State on "
           "%s (Delaware file number %s). This Agreement is the \"limited liability company agreement\" of the Company within the "
           "meaning of the Act and supersedes all prior oral or written understandings among the Members regarding the Company." % (FORMATION_DATE, DE_FILE_NUMBER)))

# ---------------- ARTICLE 1 ----------------
s.append(ART("ARTICLE 1 &mdash; ORGANIZATION"))
s.append(P("<b>1.1 Name.</b> The name of the Company is \"%s.\"" % COMPANY_NAME))
s.append(P("<b>1.2 Registered office and agent.</b> The Company's registered office in Delaware is %s, and its registered agent at that "
           "address is %s, as set forth in the Certificate of Formation and as the Manager may change from time to time by filing with "
           "the Delaware Secretary of State. The Manager will maintain the registered agent and pay the Delaware annual tax when due." % (REG_OFFICE, REG_AGENT)))
s.append(P("<b>1.3 Principal office; qualification.</b> The principal office of the Company is %s, or such other place as the Manager "
           "designates. The Manager will cause the Company to qualify to do business as a foreign limited liability company in New York "
           "and in any other jurisdiction where qualification is required, and to satisfy any related publication requirement." % PRINCIPAL_OFFICE))
s.append(P("<b>1.4 Purpose.</b> The Company's purpose is to own and operate the Nosebleed Sports mobile application, website, and Discord "
           "community, the Company's premium sports picks offering, related technology and product assets, and any other lawful business "
           "the Manager determines. The Company does not take, place, broker, or route real-money wagers."))
s.append(P("<b>1.5 Term.</b> The Company continues perpetually unless dissolved under Article 10."))
s.append(P("<b>1.6 Tax classification.</b> The Company is classified as a partnership for federal and applicable state income tax purposes "
           "(Employer Identification Number %s). No election to be classified as a corporation may be made without Supermajority Approval. "
           "Nothing in this Agreement creates a partnership for any purpose other than tax." % EIN))
s.append(P("<b>1.7 Company assets; the Brand.</b> The Company owns the Nosebleed Sports mobile application, website, and Discord community, "
           "the technology and product intellectual property underlying them, subscription and premium-offering revenue, product-specific "
           "logo, design, and visual-identity assets (including assets assigned to the Company by Members under their Proprietary "
           "Information and Inventions Assignment Agreements), and all new product assets. The Members acknowledge that JGN Media LLC "
           "(\"JGN\") owns the NOSEBLEED SPORTS name and master brand, the historical and common-law rights and goodwill in it, and the "
           "legacy social-media accounts and media assets, and that the Company's use of the brand and JGN's use of Company-owned design "
           "assets are governed by separate written license agreements between the Company and JGN. Nothing in this Agreement transfers "
           "any interest in the master brand to the Company or any interest in the Company to JGN."))

# ---------------- ARTICLE 2 ----------------
s.append(ART("ARTICLE 2 &mdash; DEFINITIONS"))
defs = [
    ("Capital Account", "the account maintained for each Member under Section 3.7."),
    ("Capital Contribution", "the cash and the agreed value of property a Member actually contributes to the Company, as recorded on Schedule A. Services are not Capital Contributions."),
    ("Change of Control", "a sale of all or substantially all of the Company's assets, a Transfer or issuance after which any person or group other than the Class A Members as of the Effective Date holds more than fifty percent (50%) of the outstanding Units, or a merger or consolidation in which the Company is not the surviving entity or the Members immediately before it hold less than a majority of the surviving entity."),
    ("Class A Member / Class A Units", "a Member holding Class A Units, and the voting Common Units described in Section 3.2."),
    ("Class B Member / Class B Units", "a Member holding Class B Units, and the non-voting Common Units described in Section 3.3."),
    ("Code", "the Internal Revenue Code of 1986, as amended, and the Treasury Regulations under it."),
    ("Common Units", "the units of limited liability company interest in the Company, of which %s are authorized, consisting of Class A Units and Class B Units." % fmt(AUTHORIZED_UNITS)),
    ("Fair Market Value", "the value determined under Section 8.3."),
    ("Majority Approval", "the written approval of Class A Members holding more than fifty percent (50%) of the Class A Units then issued and outstanding. Unissued Units and Class B Units are disregarded."),
    ("Original Cost", "the cash Capital Contribution, if any, a Member actually paid for the Units in question, as recorded on Schedule A. Units issued for services have an Original Cost of zero."),
    ("Percentage Interest", "for each Member, the Units held by that Member divided by all Units then issued and outstanding, expressed as a percentage. Unissued Units are excluded. Schedule A also shows each Member's Fully Diluted Percentage, being Units held divided by all %s authorized Units, which is used for disclosure and for any agreement that expresses an interest on a fully diluted basis." % fmt(AUTHORIZED_UNITS)),
    ("Permanent Disability", "a Member's inability, due to physical or mental impairment, to perform the essential functions of the Member's Service for one hundred eighty (180) consecutive days, as reasonably determined by the Manager."),
    ("Reserved Matter", "any matter listed in Section 4.4."),
    ("Service", "for a Class A Member, continuous service to the Company as an officer or in another substantial ongoing capacity approved by the Manager; and for a Class B Member, performance of services under that Member's Service Agreement."),
    ("Service Agreement", "a written agreement between the Company (alone or with an affiliate) and a Member under which Units are issued for services, including its vesting, milestone, and forfeiture terms. For Brock Smith, the Service Agreement is the %s." % BROCK_SERVICE_AGREEMENT),
    ("Supermajority Approval", "the written approval of Class A Members holding at least sixty-six and two-thirds percent (66 2/3%) of the Class A Units then issued and outstanding. Unissued Units and Class B Units are disregarded."),
    ("Threshold Value", "for each issuance of Units for services, the amount determined under Section 3.5."),
    ("Transfer", "any sale, assignment, gift, pledge, encumbrance, or other disposition of Units or any interest in Units, voluntary or by operation of law."),
    ("Unvested Units / Vested Units", "Units that have not vested, or have vested, under Section 3.6 or the applicable Service Agreement."),
]
for term, meaning in defs:
    s.append(P("<b>\"%s\"</b> means %s" % (term, meaning)))

# ---------------- ARTICLE 3 ----------------
s.append(ART("ARTICLE 3 &mdash; UNITS, MEMBERS, AND CAPITAL"))
s.append(P("<b>3.1 Authorized and issued Units; Schedule A.</b> The Company is authorized to issue %s Common Units. As of the Effective Date, "
           "<b>%s</b> Units are issued and outstanding and <b>%s</b> Units are authorized but unissued, as shown on Schedule A. Unissued Units "
           "are not owned by any Member, do not vote, and do not share in distributions. The Manager will update Schedule A without further "
           "Member consent to reflect any issuance, vesting, forfeiture, repurchase, or Transfer made in accordance with this Agreement, and "
           "the updated Schedule A is binding on all Members." % (fmt(AUTHORIZED_UNITS), fmt(ISSUED), fmt(UNISSUED))))
s.append(P("<b>3.2 Class A Units.</b> Class A Units carry all voting, consent, and approval rights of Members under this Agreement and the "
           "Act, one vote per Unit, and full economic rights subject to Section 3.5. Class A Units are held by the founding Members and are "
           "subject to the vesting terms in Section 3.6."))
s.append(P("<b>3.3 Class B Units.</b> Class B Units are non-voting Common Units issued to persons who provide services to the Company or its "
           "affiliates under a Service Agreement. Class B Units carry no voting, consent, approval, or management rights on any matter, "
           "except to the extent the Act grants a right that cannot be waived; Class B Members are not entitled to notice of or attendance "
           "at any meeting of Members. Class B Units have the same economic rights per Unit as Class A Units, subject to Section 3.5, and "
           "vest or are forfeited solely as their Service Agreement provides."))
s.append(P("<b>3.4 Issuance of Units; Reserved Units.</b> No Units, options, warrants, SAFEs, convertible instruments, or other rights to "
           "acquire Units may be issued, and no incentive or option pool may be created, except with Supermajority Approval; provided that "
           "the Members hereby approve, and no further approval is required for, the issuance of up to <b>%s Class B Units</b> to Brock "
           "Smith in accordance with the milestone terms of his Service Agreement (the \"Brock Reserve\"). The remaining unissued Units are "
           "reserved for future Company action and are not allocated to any person." % fmt(BROCK_RESERVE)))
s.append(P("<b>3.5 Units issued for services; Threshold Value.</b> All Units issued as of the Effective Date, and any Units later issued "
           "for services, are issued in consideration of services rendered and to be rendered to the Company (and, for Class A Members, "
           "the assignment of intellectual property under their Proprietary Information and Inventions Assignment Agreements), without a "
           "cash purchase price. Each such issuance is assigned a Threshold Value equal to the aggregate positive Capital Account balances "
           "of all Members immediately before the issuance (or such greater amount as the Manager determines in good faith is necessary "
           "to reflect the liquidation value of the Company at that time), recorded on Schedule A. Units issued for services participate "
           "in distributions only to the extent provided in Article 5, so that on the issuance date they would receive nothing if the "
           "Company were liquidated at their Threshold Value. Such Units are intended to be \"profits interests\" within the meaning of "
           "Revenue Procedures 93-27 and 2001-43. The Company and each recipient will treat the recipient as the owner of the Units, and "
           "as a partner for tax purposes, from the date of issuance whether or not the Units are then vested, and will allocate the "
           "recipient's distributive share accordingly; neither the Company nor any recipient will claim a deduction for the issuance. "
           "Each Member is solely responsible for the tax consequences of the Member's Units, and the Company makes no representation "
           "regarding tax treatment."))
s.append(P("<b>3.6 Vesting of Class A Units.</b> (a) <i>Schedule.</i> Fifty percent (50%) of each Class A Member's Units are Vested Units "
           "on the Effective Date. The remaining fifty percent (50%) vest in forty-eight (48) equal monthly installments on the last day "
           "of each calendar month beginning with the month in which the Effective Date falls, with no cliff, provided the Member remains "
           "in Service through each vesting date. Schedule C records each Class A Member's vesting. (b) <i>Acceleration.</i> All of a Class "
           "A Member's Unvested Units become Vested Units immediately on (i) a Change of Control, or (ii) the Member's death or Permanent "
           "Disability while in Service. (c) <i>Cessation of Service.</i> If a Class A Member's Service ceases for any reason other than "
           "death or Permanent Disability, vesting stops on the cessation date and the Company has the right, exercisable by written "
           "notice within one hundred eighty (180) days, to repurchase all Unvested Units at their Original Cost; because the Class A Units "
           "were issued for services, the Original Cost is zero and the repurchase operates as a forfeiture and cancellation of the "
           "Unvested Units. Vested Units are retained subject to Articles 6 and 7. (d) <i>Power of attorney.</i> Each Class A Member "
           "irrevocably appoints the Manager as attorney-in-fact, coupled with an interest, solely to execute any instrument necessary "
           "to record a repurchase, forfeiture, or cancellation under this Section."))
s.append(P("<b>3.7 Capital Contributions and Capital Accounts.</b> Capital Contributions, if any, are recorded on Schedule A. No Member is "
           "required to make any Capital Contribution or loan. No interest accrues on Capital Contributions, and no Member may withdraw or "
           "demand the return of capital except as this Agreement provides. A Capital Account will be maintained for each Member in "
           "accordance with Treasury Regulation Section 1.704-1(b)(2)(iv), and the Manager may adjust Capital Accounts as that "
           "Regulation permits, including on any issuance of Units for services."))
s.append(P("<b>3.8 Advances by JGN.</b> The Members acknowledge that JGN has advanced development and related expenses on the Company's "
           "behalf, in an amount to be reconciled and recorded by the Manager (approximately $2,000 as of July 2026). Such advances are "
           "unsecured, non-interest-bearing obligations of the Company repayable when the Manager determines cash is reasonably available, "
           "are not Capital Contributions, and do not entitle JGN to any Units or other interest in the Company."))
s.append(P("<b>3.9 Admission; joinder.</b> Additional Class A Members may be admitted only with Supermajority Approval. Class B Members are "
           "admitted on issuance under Section 3.4 and execution of a joinder in the form of Schedule B. Every new Member is bound by this "
           "Agreement as if an original signatory."))
s.append(P("<b>3.10 Limited liability; no certificates.</b> No Member, Manager, or officer is personally liable for any debt, obligation, or "
           "liability of the Company solely by reason of that status. Units are uncertificated; Schedule A is the record of ownership."))

# ---------------- ARTICLE 4 ----------------
s.append(ART("ARTICLE 4 &mdash; MANAGEMENT"))
s.append(P("<b>4.1 Manager.</b> The Company is managed by one Manager within the meaning of Section 18-101 of the Act. The initial Manager "
           "is <b>%s</b>, who holds the title <b>%s</b>. The Manager serves until resignation, death, Permanent Disability, or removal and "
           "replacement with Supermajority Approval." % (MANAGER_NAME, MANAGER_TITLE)))
s.append(P("<b>4.2 Authority of the Manager.</b> Except for Reserved Matters and Major Decisions, the Manager has full, exclusive, and complete "
           "authority to manage and control the business and affairs of the Company, including to enter into and perform contracts; engage "
           "and terminate contractors, talent, and employees; open and operate bank and payment accounts; issue Units within the Brock "
           "Reserve; set Threshold Values; approve sponsorship and brand deals; make distributions under Article 5; retain advisors; "
           "commence, defend, and settle claims; and take any other action in the ordinary course. Persons dealing with the Company may "
           "rely on the Manager's authority without inquiry."))
s.append(P("<b>4.3 Major Decisions (Majority Approval).</b> The following require Majority Approval: (a) incurring indebtedness or guaranties "
           "exceeding %s in the aggregate outstanding; (b) any transaction between the Company and the Manager, an officer, a Member, or any "
           "of their affiliates (including JGN) involving more than %s, other than the license agreements described in Section 1.7, "
           "advances under Section 3.8, and compensation approved under Section 4.7; (c) approving the Company's annual budget, if one is "
           "adopted; and (d) any other matter the Manager elects to submit." % (DEBT_THRESHOLD, AFFILIATE_THRESHOLD)))
s.append(P("<b>4.4 Reserved Matters (Supermajority Approval).</b> The following require Supermajority Approval: (a) any issuance described "
           "in Section 3.4 other than the Brock Reserve; (b) a Change of Control or any sale of all or substantially all of the Company's "
           "assets; (c) amending or restating the Certificate of Formation or this Agreement, except as Section 11.1 permits the Manager "
           "to do; (d) admitting a Class A Member; (e) dissolving the Company; (f) changing the Company's tax classification; (g) removing "
           "or replacing the Manager; (h) filing for bankruptcy or making an assignment for the benefit of creditors; and (i) transferring "
           "or exclusively licensing the Company's core technology or product intellectual property outside the ordinary course."))
s.append(P("<b>4.5 Action by Class A Members.</b> Class A Members act by written consent (email is sufficient) without a meeting. Approval "
           "thresholds are measured against Class A Units issued and outstanding at the time of the action; unissued Units and Class B "
           "Units are disregarded."))
s.append(P("<b>4.6 Officers.</b> The Manager may appoint and remove officers and define their authority. The initial officers are listed on "
           "Schedule D. Officers serve at the pleasure of the Manager. An officer's title does not by itself confer authority to bind the "
           "Company beyond the authority the Manager delegates."))
s.append(P("<b>4.7 Compensation; reimbursement.</b> Compensation of the Manager and officers, if any, requires Majority Approval. The Manager "
           "and officers will be reimbursed for reasonable expenses incurred on the Company's behalf."))
s.append(P("<b>4.8 Duties; exculpation.</b> To the fullest extent permitted by Section 18-1101(c) of the Act, the Members eliminate all "
           "fiduciary duties of the Manager and officers to the Company and the Members, other than the implied contractual covenant of "
           "good faith and fair dealing; provided that the Manager and officers remain liable for acts or omissions constituting bad faith, "
           "willful misconduct, knowing violation of law, or a transaction from which they derived an improper personal benefit. The "
           "Manager and officers may rely in good faith on the Company's records and on advisors."))
s.append(P("<b>4.9 Indemnification.</b> The Company will indemnify and hold harmless the Manager, each officer, and each Member from any "
           "loss, claim, or expense (including reasonable attorneys' fees) arising from any act or omission on behalf of the Company, "
           "except to the extent finally determined to result from conduct excepted under Section 4.8. Indemnification is payable only "
           "from Company assets. The Company may advance defense costs on receipt of an undertaking to repay if indemnification is "
           "ultimately not permitted."))
s.append(P("<b>4.10 Other activities.</b> Any Member, Manager, or officer may engage in other business activities, and neither the Company "
           "nor any other Member has any right to those activities or their income, except as that person's separate written agreement "
           "with the Company (including a Proprietary Information and Inventions Assignment Agreement or Service Agreement) provides."))

# ---------------- ARTICLE 5 ----------------
s.append(ART("ARTICLE 5 &mdash; ALLOCATIONS AND DISTRIBUTIONS"))
s.append(P("<b>5.1 Allocations.</b> After the regulatory allocations in Section 5.2, net income and net loss (and each item of income, gain, "
           "loss, and deduction) for each fiscal year are allocated among the Members so that each Member's Capital Account, as nearly as "
           "possible, equals the amount the Member would receive if the Company sold its assets for book value, paid its liabilities, and "
           "distributed the remainder under Section 5.4."))
s.append(P("<b>5.2 Regulatory allocations.</b> The allocations in this Article are intended to comply with Section 704(b) of the Code and "
           "the Regulations under it, including the qualified income offset, minimum gain chargeback, and nonrecourse deduction rules, "
           "which are incorporated by reference and control over Section 5.1 to the extent required. Tax items follow book items except "
           "as Section 704(c) of the Code requires. The Manager may make such other allocations as are necessary to comply with the Code."))
s.append(P("<b>5.3 Operating distributions.</b> The Manager determines the amount and timing of distributions of cash not reasonably needed "
           "for operations, reserves, and obligations. Distributions are made to the Members in proportion to their Percentage Interests, "
           "except that Units issued for services share only in distributions attributable to value in excess of their Threshold Value, "
           "as reasonably determined by the Manager; amounts those Units would otherwise have received that are attributable to value at "
           "or below their Threshold Value are distributed to the other Members in proportion to their Percentage Interests. Unvested "
           "Units share in distributions on the same basis as Vested Units."))
s.append(P("<b>5.4 Distributions on a Change of Control or liquidation.</b> Net proceeds of a Change of Control or of liquidation, after "
           "payment of liabilities (including advances under Section 3.8) and reasonable reserves, are distributed: (a) first, to the "
           "Members in proportion to, and to the extent of, their unreturned cash Capital Contributions; and (b) then to all Members in "
           "proportion to their Percentage Interests, subject to the Threshold Value limitation in Section 5.3."))
s.append(P("<b>5.5 Tax distributions.</b> To the extent cash is reasonably available, the Manager will use reasonable efforts to distribute "
           "to each Member, no later than April 10 of each year, an amount sufficient to cover the Member's estimated federal, state, and "
           "local income tax on the net taxable income allocated to that Member for the prior year, at an assumed combined rate the "
           "Manager sets for all Members. Tax distributions are advances against, and reduce, the Member's later distributions."))
s.append(P("<b>5.6 Withholding; limitations.</b> The Company may withhold from distributions any amount required by law and treat it as "
           "distributed to the Member. No distribution may be made in violation of Section 18-607 of the Act."))

# ---------------- ARTICLE 6 ----------------
s.append(ART("ARTICLE 6 &mdash; TRANSFERS OF UNITS"))
s.append(P("<b>6.1 General restriction.</b> No Member may Transfer any Units except as this Article expressly permits. Any purported Transfer "
           "in violation of this Article is void, and the Company will not recognize the transferee for any purpose. Unvested Units may not "
           "be Transferred."))
s.append(P("<b>6.2 Class B Units.</b> Class B Units may not be Transferred to any person other than the Company, except by will or the laws of "
           "descent and distribution, in which case the transferee holds only the economic rights of the Units and is subject to Article 7."))
s.append(P("<b>6.3 Class A Units; right of first refusal.</b> A Class A Member wishing to Transfer Vested Class A Units to a third party must "
           "first deliver written notice to the Company and the other Class A Members stating the proposed transferee, price, and terms. "
           "The Company has thirty (30) days, and if the Company declines, the other Class A Members have a further fifteen (15) days (pro "
           "rata among those electing), to purchase all (but not less than all) of the offered Units on the same terms. If the Units are "
           "not purchased, the Member may Transfer them to the named transferee, on terms no more favorable than those offered, within "
           "sixty (60) days, subject to Sections 6.5 and 6.7."))
s.append(P("<b>6.4 Permitted Transfers.</b> With the Manager's written consent, a Class A Member may Transfer Vested Units to a trust or entity "
           "wholly owned by and for the benefit of the Member or the Member's immediate family for estate-planning purposes, provided the "
           "transferee executes a joinder and the Member remains bound."))
s.append(P("<b>6.5 Drag-along.</b> If a Change of Control receives Supermajority Approval, every Member (including each Class B Member) will "
           "consent to, vote for, and raise no objection to the transaction; will Transfer their Units or otherwise participate on the "
           "same per-Unit terms as the approving Class A Members (subject to Section 5.4); will execute customary transaction documents; "
           "and will not exercise any appraisal or dissenters' rights. No Member is required to make representations other than as to "
           "title, authority, and non-contravention, or to bear indemnity liability exceeding that Member's share of proceeds."))
s.append(P("<b>6.6 Tag-along.</b> If Class A Members propose to Transfer Class A Units representing more than fifty percent (50%) of all "
           "outstanding Units to a third party (other than under Section 6.5), each other Member may elect, by written notice within "
           "fifteen (15) days after receiving notice of the proposed Transfer, to include a pro rata portion of that Member's Vested "
           "Units on the same per-Unit terms."))
s.append(P("<b>6.7 Transferees.</b> A transferee of Units becomes a Member only on executing a joinder and, for Class A Units, on Supermajority "
           "Approval; otherwise the transferee holds only the economic rights of an assignee under Section 18-702 of the Act. Every Transfer "
           "is subject to compliance with securities laws."))

# ---------------- ARTICLE 7 ----------------
s.append(ART("ARTICLE 7 &mdash; REPURCHASE AND CERTAIN EVENTS"))
s.append(P("<b>7.1 Class B Units on termination of Service.</b> If a Class B Member's Service Agreement terminates for any reason, the Company "
           "has the right, but not the obligation, exercisable by written notice within one hundred eighty (180) days after the termination "
           "date, to repurchase all or any portion of that Member's Vested Class B Units at the price in Section 7.2. Unvested Class B Units "
           "are forfeited and cancelled as the Service Agreement provides, and each Class B Member grants the Manager the same power of "
           "attorney described in Section 3.6(d) for that purpose."))
s.append(P("<b>7.2 Repurchase price for Class B Units.</b> The price is Fair Market Value on the termination date, taking into account the "
           "Threshold Value; except that if the Service Agreement was terminated by the Company for the holder's material breach, for cause, "
           "or following an uncured performance or value notice as defined in the Service Agreement, or if the holder terminated the "
           "Service Agreement in breach of its terms, the price is the lesser of Fair Market Value and the holder's Original Cost. The "
           "Company may pay in cash or by an unsecured promissory note bearing interest at the applicable federal rate, payable in equal "
           "quarterly installments over not more than twenty-four (24) months."))
s.append(P("<b>7.3 No withdrawal.</b> No Member may voluntarily withdraw from the Company or demand a return of capital or a distribution "
           "except as this Agreement provides."))
s.append(P("<b>7.4 Death, incapacity, or bankruptcy.</b> On the death, Permanent Disability, or bankruptcy of a Member, the Member's successor "
           "holds only the economic rights of an assignee, and (other than for a Class A Member's Vested Units following death or Permanent "
           "Disability, which pass to the Member's estate or successor subject to Article 6) the Company has the right, exercisable within "
           "one hundred eighty (180) days after notice of the event, to repurchase the Units at Fair Market Value on the payment terms in "
           "Section 7.2."))

# ---------------- ARTICLE 8 ----------------
s.append(ART("ARTICLE 8 &mdash; BOOKS, RECORDS, AND TAX MATTERS"))
s.append(P("<b>8.1 Books; fiscal year.</b> The Company will keep complete books and records at its principal office. The fiscal year is the "
           "calendar year. Company funds will be kept in accounts in the Company's name and not commingled."))
s.append(P("<b>8.2 Information rights.</b> Class A Members have the rights provided by Section 18-305 of the Act. Class B Members are entitled "
           "to their Schedule K-1 and an annual summary of the Company's revenue and distributions, and have no other information or "
           "inspection rights except as the Act provides and cannot be waived."))
s.append(P("<b>8.3 Fair Market Value.</b> Fair Market Value is determined in good faith by the Manager, taking into account the Company's "
           "financial condition, revenue, prospects, comparable transactions, and customary discounts for lack of marketability and control. "
           "A Member who disputes the determination within fifteen (15) days may, at the Member's expense, obtain an appraisal from an "
           "independent appraiser reasonably acceptable to the Manager. If the appraised value exceeds the Manager's determination by more "
           "than twenty percent (20%), the appraised value controls and the Company reimburses the appraisal cost; otherwise the Manager's "
           "determination controls."))
s.append(P("<b>8.4 Tax returns; partnership representative.</b> The Manager will cause the Company's partnership returns to be prepared and filed "
           "and will use reasonable efforts to deliver Schedule K-1 to each Member within ninety (90) days after year end. The Manager is "
           "the \"partnership representative\" under Section 6223 of the Code, with authority to act for the Company in any tax proceeding, "
           "to make any election (including under Sections 754, 6221(b), and 6226 of the Code), and to bind the Members. Each Member will "
           "cooperate and is responsible for its share of any imputed underpayment, including after ceasing to be a Member."))
s.append(P("<b>8.5 Confidentiality.</b> Each Member will keep confidential all non-public information concerning the Company, its business, "
           "finances, Members, contractors, and this Agreement, and will use it only in connection with the Member's interest in the "
           "Company. This obligation survives a Member's departure for three (3) years and, as to trade secrets and credentials, for as "
           "long as the information remains protected."))

# ---------------- ARTICLE 9 ----------------
s.append(ART("ARTICLE 9 &mdash; INTELLECTUAL PROPERTY AND FOUNDER COVENANTS"))
s.append(P("<b>9.1 Assignment agreements.</b> Each Class A Member will execute, as a condition of holding Units, a Proprietary Information and "
           "Inventions Assignment Agreement in the Company's standard form, assigning to the Company all intellectual property created in "
           "the course of Service or relating to the Company's business, including (for Christian Clark) the current Nosebleed logo artwork, "
           "source files, variations, visual identity, design system, and derivative works to the extent personally owned. Such assignments "
           "run to the Company and not to JGN; JGN's use of Company-owned design assets is governed solely by the license agreements "
           "described in Section 1.7."))
s.append(P("<b>9.2 Brand use.</b> The Company will use the NOSEBLEED SPORTS name and master brand only in accordance with its license from JGN, "
           "and will not challenge JGN's ownership of the master brand."))

# ---------------- ARTICLE 10 ----------------
s.append(ART("ARTICLE 10 &mdash; DISSOLUTION"))
s.append(P("<b>10.1 Events.</b> The Company dissolves only on (a) Supermajority Approval of dissolution, (b) a Change of Control after which "
           "the Class A Members elect by Supermajority Approval to dissolve, or (c) entry of a decree of judicial dissolution under Section "
           "18-802 of the Act. The death, withdrawal, bankruptcy, or dissolution of a Member does not dissolve the Company."))
s.append(P("<b>10.2 Winding up.</b> On dissolution the Manager will wind up the Company's affairs and apply the proceeds first to creditors "
           "(including Members and JGN as creditors), then to reasonable reserves, and then to the Members under Section 5.4. No Member is "
           "obligated to restore a negative Capital Account. The Manager will file a certificate of cancellation when winding up is complete."))

# ---------------- ARTICLE 11 ----------------
s.append(ART("ARTICLE 11 &mdash; GENERAL PROVISIONS"))
s.append(P("<b>11.1 Amendments.</b> This Agreement may be amended only by a written instrument approved with Supermajority Approval, except "
           "that the Manager may, without Member approval, (a) update Schedules A, C, and D under this Agreement, (b) make amendments "
           "required to comply with the Code or the Act or to preserve the tax treatment intended by Section 3.5, and (c) correct clerical "
           "errors. No amendment may reduce a Member's Vested Units or the economic rights of Vested Units in a manner disproportionate to "
           "the other Members of the same class without that Member's written consent."))
s.append(P("<b>11.2 Governing law; disputes.</b> This Agreement and the internal affairs of the Company are governed by the laws of the State "
           "of Delaware, without regard to conflict-of-laws rules. Before filing any action, the parties will attempt in good faith to "
           "resolve any dispute through direct negotiation for at least fifteen (15) days after written notice, and then through "
           "non-binding mediation before a mutually agreed mediator. If unresolved within thirty (30) days after mediation begins (or a "
           "party refuses to mediate), any party may bring the dispute in the state or federal courts located in the State of New York or "
           "the Court of Chancery of the State of Delaware, and each party consents to their jurisdiction and venue. Nothing in this Section "
           "prevents a party from seeking injunctive relief at any time to enforce Articles 3, 6, 7, 8, or 9."))
s.append(P("<b>11.3 Specific performance.</b> Damages would be an inadequate remedy for breach of Articles 3, 6, 7, or 9, and the Company and "
           "the Members are entitled to specific performance and injunctive relief to enforce them, without posting bond."))
s.append(P("<b>11.4 Notices.</b> Notices may be given by email to the address on Schedule A (or as updated by notice) and are effective when "
           "sent absent a bounce or error message."))
s.append(P("<b>11.5 Entire agreement; severability; binding effect.</b> This Agreement, with its Schedules, is the entire agreement among the "
           "Members regarding the Company and supersedes all prior understandings, term sheets, and drafts. If any provision is held "
           "unenforceable, it will be modified to the minimum extent necessary and the remainder will continue in effect. This Agreement "
           "binds and benefits the Members and their permitted successors and assigns. There are no third-party beneficiaries, except that "
           "JGN may enforce Sections 1.7, 3.8, and 9.2."))
s.append(P("<b>11.6 Counterparts; electronic signatures.</b> This Agreement and any joinder may be signed in counterparts, and electronic "
           "signatures are valid and binding."))

s.append(Spacer(1, 10))
s.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#999999"), spaceAfter=10))
s.append(P("IN WITNESS WHEREOF, the undersigned Class A Members have executed this Limited Liability Company Agreement as of the Effective Date."))
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
           % (COMPANY_NAME, MANAGER_NAME, MANAGER_TITLE)))
s.append(P("<b>Class B Member</b> (joins by executing the Schedule B joinder on issuance): Brock Smith &mdash; %s" % BROCK_SERVICE_AGREEMENT))

# ---------------- SCHEDULE A ----------------
s.append(PageBreak())
s.append(P("SCHEDULE A", title_style))
s.append(P("Capitalization Table and Membership Ledger &mdash; as of %s" % EFFECTIVE_DATE, subtitle_style))
s.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#999999"), spaceAfter=12))
rows = [["Member", "Class", "Units", "% of Outstanding\n(Percentage Interest)", "% of Authorized\n(Fully Diluted)", "Cash Capital\nContribution", "Original\nCost", "Threshold\nValue", "Notice email"]]
for name, cls, units, email in MEMBERS:
    rows.append([name, cls, fmt(units), pct(units, ISSUED), pct(units, AUTHORIZED_UNITS), "$0", "$0", "Sec. 3.5", email])
rows.append(["TOTAL ISSUED AND OUTSTANDING", "", fmt(ISSUED), "100.00%", pct(ISSUED, AUTHORIZED_UNITS), "$0", "", "", ""])
rows.append(["Authorized but unissued (reserved; not owned)", "", fmt(UNISSUED), "n/a", pct(UNISSUED, AUTHORIZED_UNITS), "", "", "", ""])
rows.append(["  of which Brock Reserve (Sec. 3.4)", "B", fmt(BROCK_RESERVE), "n/a", pct(BROCK_RESERVE, AUTHORIZED_UNITS), "", "", "", ""])
rows.append(["  of which unallocated", "", fmt(UNISSUED - BROCK_RESERVE), "n/a", pct(UNISSUED - BROCK_RESERVE, AUTHORIZED_UNITS), "", "", "", ""])
rows.append(["TOTAL AUTHORIZED", "", fmt(AUTHORIZED_UNITS), "", "100.00%", "", "", "", ""])
ta = Table(rows, colWidths=[1.55 * inch, 0.4 * inch, 0.72 * inch, 0.95 * inch, 0.85 * inch, 0.7 * inch, 0.5 * inch, 0.55 * inch, 1.2 * inch], repeatRows=1)
ta.setStyle(GRID)
ta.setStyle(TableStyle([("FONTNAME", (0, len(MEMBERS) + 1), (-1, len(MEMBERS) + 1), "Helvetica-Bold"),
                        ("FONTNAME", (0, -1), (-1, -1), "Helvetica-Bold"), ("FONTSIZE", (0, 0), (-1, -1), 7.6)]))
s.append(ta); s.append(Spacer(1, 8))
s.append(P("Voting Units outstanding (Class A): <b>%s</b>. Majority Approval requires more than %s Class A Units; Supermajority Approval "
           "requires at least %s Class A Units. Class B Units (%s) and unissued Units (%s) do not vote." %
           (fmt(VOTING), fmt(VOTING // 2), fmt(-(-VOTING * 2 // 3)), fmt(ISSUED - VOTING), fmt(UNISSUED))))
s.append(P("Reconciliation: %s issued + %s unissued = %s authorized. Issued Units represent %s of authorized Units; unissued Units "
           "represent %s and are not allocated to any person. No Units are held by Jacob Skonieczny or Louis Stathis." %
           (fmt(ISSUED), fmt(UNISSUED), fmt(AUTHORIZED_UNITS), pct(ISSUED, AUTHORIZED_UNITS), pct(UNISSUED, AUTHORIZED_UNITS))))

# ---------------- SCHEDULE B ----------------
s.append(PageBreak())
s.append(P("SCHEDULE B", title_style)); s.append(P("Form of Joinder Agreement", subtitle_style))
s.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#999999"), spaceAfter=12))
s.append(P("The undersigned is being issued Units of %s (the \"Company\") and, as a condition of that issuance, agrees as follows:" % COMPANY_NAME))
s.append(P("1. The undersigned has received and read the Limited Liability Company Agreement of the Company dated as of %s (as amended, the "
           "\"Agreement\") and agrees to become a party to and be bound by it as a Member holding the class and number of Units stated below, "
           "as if an original signatory." % EFFECTIVE_DATE))
s.append(P("2. Units: &nbsp; Class: ________ &nbsp; Number: ______________ &nbsp; Percentage Interest at issuance: ________% &nbsp; Fully "
           "Diluted Percentage: ________% &nbsp; Threshold Value: $______________ &nbsp; Issuance date: ______________ &nbsp; Service "
           "Agreement: ______________________________________________."))
s.append(P("3. The undersigned acknowledges that the Units are subject to the vesting, forfeiture, transfer, drag-along, and repurchase "
           "provisions of the Agreement and any Service Agreement; that Class B Units are non-voting; that the Company and the undersigned "
           "will treat the undersigned as the owner of the Units for tax purposes from the issuance date; that the Units have not been "
           "registered under any securities law and are acquired for investment; and that the undersigned is solely responsible for the "
           "tax consequences of the Units."))
s.append(P("4. Notice email: ______________________________________."))
s.append(Spacer(1, 14))
jt = Table([[Paragraph("<b>NEW MEMBER</b>", sig_style), Paragraph("<b>%s</b>" % COMPANY_NAME.upper(), sig_style)],
            [Spacer(1, 22), Spacer(1, 22)],
            [Paragraph("Signature: _______________________________", sig_style), Paragraph("By: _______________________________", sig_style)],
            [Paragraph("Name: ____________________________", sig_style), Paragraph("Name: %s" % MANAGER_NAME, sig_style)],
            [Paragraph("Date: _______________________", sig_style), Paragraph("Title: %s" % MANAGER_TITLE, sig_style)]],
           colWidths=[3.15 * inch, 3.15 * inch])
jt.setStyle(TableStyle([("VALIGN", (0, 0), (-1, -1), "TOP"), ("LEFTPADDING", (0, 0), (-1, -1), 0)]))
s.append(jt)

# ---------------- SCHEDULE C ----------------
s.append(PageBreak())
s.append(P("SCHEDULE C", title_style)); s.append(P("Class A Vesting Ledger (Section 3.6)", subtitle_style))
s.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#999999"), spaceAfter=12))
vrows = [["Class A Member", "Total Units", "Vested at\nEffective Date (50%)", "Unvested at\nEffective Date (50%)", "Monthly tranche\n(48 months)", "Fully vested"]]
for name, cls, units, _ in MEMBERS:
    if cls != "A": continue
    vrows.append([name, fmt(units), fmt(units // 2), fmt(units - units // 2), fmt(round(units / 2 / 48)), "48th month-end after Effective Date"])
tv = Table(vrows, colWidths=[1.5 * inch, 0.9 * inch, 1.15 * inch, 1.15 * inch, 1.0 * inch, 1.6 * inch]); tv.setStyle(GRID); s.append(tv)
s.append(Spacer(1, 8))
s.append(P("Terms: no cliff; vesting conditioned on continuous Service; full acceleration on a Change of Control and on death or Permanent "
           "Disability while in Service; Unvested Units repurchased at Original Cost ($0) on cessation of Service, i.e., forfeited. "
           "Monthly tranches are rounded; the final tranche absorbs rounding so that 100%% vests at the 48th month-end. "
           "<b>Brock Smith (Class B):</b> not on this schedule &mdash; his 50,000 Initial Units vest and forfeit solely under Section 5.4 of his "
           "Service Agreement, and up to %s further Class B Units issue under its milestone terms from the Brock Reserve." % fmt(BROCK_RESERVE)))

# ---------------- SCHEDULE D ----------------
s.append(Spacer(1, 16))
s.append(P("SCHEDULE D", title_style)); s.append(P("Officers (Section 4.6)", subtitle_style))
s.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#999999"), spaceAfter=12))
to = Table([["Name", "Title"]] + [list(o) for o in OFFICERS] + [["Brock Smith", "No officer title (Class B Member; independent contractor under his Service Agreement)"]],
           colWidths=[2.2 * inch, 4.1 * inch]); to.setStyle(GRID); s.append(to)
s.append(Spacer(1, 6))
s.append(P("Manager: %s. Officers serve at the pleasure of the Manager under Section 4.6. No other officer positions are currently filled." % MANAGER_NAME))

doc = SimpleDocTemplate(OUT, pagesize=letter, leftMargin=0.85 * inch, rightMargin=0.85 * inch, topMargin=0.8 * inch, bottomMargin=0.8 * inch,
                        title="Limited Liability Company Agreement of %s" % COMPANY_NAME, author=COMPANY_NAME)
doc.build(s)
print("Wrote", OUT, "| issued", fmt(ISSUED), "| unissued", fmt(UNISSUED), "| voting", fmt(VOTING))
