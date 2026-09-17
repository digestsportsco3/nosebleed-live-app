#!/usr/bin/env python3
"""Operating Agreement of Nosebleed Sports LLC (New York) - two-class structure built to support
service-provider profits interests (Class B) as referenced in the talent/handicapper agreement."""

import os
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib.enums import TA_CENTER
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable, PageBreak)

OUT = os.environ.get("OUT_PDF", "Nosebleed_Sports_LLC_Operating_Agreement.pdf")

# =============================== FILL-INS ===============================
COMPANY_NAME     = "Nosebleed Sports LLC"
STATE            = "New York"
FORMATION_DATE   = "____________, 2026"          # date Articles of Organization were filed with NY DOS
EFFECTIVE_DATE   = "____________, 2026"          # date this Agreement is signed by all Members
PRINCIPAL_OFFICE = "105 Broadway, Rockville Centre, New York 11570"
EIN              = "__-_______"   # from the IRS CP575B letter (kept out of the public repo)
MANAGER_NAME     = "Nicholas Restivo"
MANAGER_TITLE    = "Chief Executive Officer"
CLASS_B_POOL_PCT = "ten percent (10%)"            # max Class B issuable without a Class A vote
DEBT_THRESHOLD   = "$25,000"                      # Major Decision threshold for borrowing
AFFILIATE_THRESHOLD = "$10,000"                   # Major Decision threshold for related-party deals

# Schedule A - Class A Members. ("Name", "Address", "Capital Contribution", "Class A Units", "Percentage Interest")
CLASS_A_MEMBERS = [
    ("Nicholas Restivo", "105 Broadway, Rockville Centre, NY 11570", "$__________", "__________", "_____%"),
    ("______________________", "______________________________________", "$__________", "__________", "_____%"),
    ("______________________", "______________________________________", "$__________", "__________", "_____%"),
]
# Schedule A - Class B Members (issued profits interests). Leave empty until issued.
CLASS_B_MEMBERS = [
    ("______________________", "Service Agreement dated __________", "__________", "_____%", "$__________"),
]
# ========================================================================

styles = getSampleStyleSheet()
title_style = ParagraphStyle("T", parent=styles["Title"], fontName="Helvetica-Bold", fontSize=15, leading=19,
                             alignment=TA_CENTER, spaceAfter=2)
subtitle_style = ParagraphStyle("S", parent=styles["Normal"], fontName="Helvetica", fontSize=10.5, leading=14,
                                alignment=TA_CENTER, textColor=colors.HexColor("#444444"), spaceAfter=10)
article_style = ParagraphStyle("A", parent=styles["Heading2"], fontName="Helvetica-Bold", fontSize=12, leading=15,
                               spaceBefore=14, spaceAfter=6, alignment=TA_CENTER, textColor=colors.HexColor("#111111"))
body_style = ParagraphStyle("B", parent=styles["Normal"], fontName="Helvetica", fontSize=10, leading=14.5, spaceAfter=7)
sig_style = ParagraphStyle("Sig", parent=body_style, spaceAfter=2)

def P(t, s=body_style): return Paragraph(t, s)
def ART(t): return Paragraph(t, article_style)

GRID = TableStyle([
    ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"), ("FONTSIZE", (0, 0), (-1, -1), 9),
    ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#EFEFEF")),
    ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#BBBBBB")),
    ("TOPPADDING", (0, 0), (-1, -1), 5), ("BOTTOMPADDING", (0, 0), (-1, -1), 5), ("LEFTPADDING", (0, 0), (-1, -1), 6),
    ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
])

s = []
s.append(P("OPERATING AGREEMENT", title_style))
s.append(P("of", subtitle_style))
s.append(P(COMPANY_NAME.upper(), title_style))
s.append(P("a %s limited liability company" % STATE, subtitle_style))
s.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#999999"), spaceAfter=12))

s.append(P(
    "This Operating Agreement (this \"Agreement\") of %s (the \"Company\") is entered into and made effective as of "
    "<b>%s</b> (the \"Effective Date\") by and among the Company and the persons listed as Members on "
    "<b>Schedule A</b>, as it may be amended from time to time in accordance with this Agreement." % (COMPANY_NAME, EFFECTIVE_DATE)))
s.append(P(
    "The Company was formed as a limited liability company under the New York Limited Liability Company Law (the "
    "\"Act\") by the filing of Articles of Organization with the New York Department of State on %s. The Members "
    "adopt this Agreement as the operating agreement of the Company under Section 417 of the Act, and it supersedes "
    "all prior oral or written understandings among the Members regarding the Company." % FORMATION_DATE))

# ---------------- ARTICLE 1 ----------------
s.append(ART("ARTICLE 1 &mdash; ORGANIZATION"))
s.append(P("<b>1.1 Name.</b> The name of the Company is \"%s.\" The Company may conduct business under that name or "
           "any assumed name the Manager selects." % COMPANY_NAME))
s.append(P("<b>1.2 Principal office.</b> The principal office of the Company is %s, or such other place as the Manager "
           "designates." % PRINCIPAL_OFFICE))
s.append(P("<b>1.3 Purpose.</b> The Company's purpose is to own and operate the Nosebleed Sports mobile application, "
           "website, and Discord community, the Company's premium sports picks offering, and any other lawful business "
           "the Manager determines, and to do all things necessary or convenient to those purposes. The Company does "
           "not take, place, broker, or route real-money wagers."))
s.append(P("<b>1.4 Term.</b> The Company continues perpetually unless dissolved under Article 9."))
s.append(P("<b>1.5 Tax classification.</b> The Company is classified as a partnership for federal and state income tax "
           "purposes (Employer Identification Number %s). No election to be classified as a corporation may be made "
           "without the approval required for a Major Decision. No provision of this Agreement is intended to create "
           "a partnership for any purpose other than tax." % EIN))
s.append(P("<b>1.6 Service of process; publication.</b> The Secretary of State is designated as agent for service of "
           "process as stated in the Articles of Organization. The Manager will cause the Company to satisfy the "
           "publication requirements of Section 206 of the Act."))

# ---------------- ARTICLE 2 ----------------
s.append(ART("ARTICLE 2 &mdash; DEFINITIONS"))
s.append(P("Capitalized terms have the meanings given where defined, and the following terms have these meanings:"))
defs = [
    ("Capital Account", "the account maintained for each Member under Section 3.5."),
    ("Capital Contribution", "the cash and the agreed value of property a Member contributes to the Company."),
    ("Class A Member / Class A Units", "a Member holding Class A Units, and the voting Units of the Company described in Section 3.2."),
    ("Class B Member / Class B Units", "a Member holding Class B Units, and the non-voting profits-interest Units described in Section 3.3."),
    ("Code", "the Internal Revenue Code of 1986, as amended, and the Treasury Regulations under it."),
    ("Fair Market Value", "the price a willing buyer would pay a willing seller for the Company or the relevant Units in an arm's-length transaction, neither being under compulsion, as determined under Section 7.3."),
    ("Major Decision", "any matter listed in Section 4.3."),
    ("Member", "each person admitted as a member of the Company and listed on Schedule A, for so long as that person holds Units."),
    ("Percentage Interest", "for each Member, the number of Units (Class A and Class B combined) held by that Member divided by the total number of Units outstanding, expressed as a percentage, as shown on Schedule A."),
    ("Sale of the Company", "a sale of all or substantially all of the Company's assets, a sale or exchange of a majority of the outstanding Units, or a merger or consolidation in which the Company is not the surviving entity."),
    ("Service Agreement", "a written agreement between the Company (or the Company and an affiliate) and a Class B Member under which Class B Units are issued, including any vesting, forfeiture, and milestone terms."),
    ("Threshold Value", "for each issuance of Class B Units, the amount determined under Section 3.3(b)."),
    ("Transfer", "any sale, assignment, gift, pledge, encumbrance, or other disposition of Units or any interest in Units, voluntary or by operation of law."),
    ("Units", "the units of membership interest in the Company, consisting of Class A Units and Class B Units."),
]
for term, meaning in defs:
    s.append(P("<b>\"%s\"</b> means %s" % (term, meaning)))

# ---------------- ARTICLE 3 ----------------
s.append(ART("ARTICLE 3 &mdash; MEMBERS, UNITS, AND CAPITAL"))
s.append(P("<b>3.1 Units; Schedule A.</b> Membership interests in the Company are represented by Units. The Members, "
           "their Units, Capital Contributions, and Percentage Interests are set forth on Schedule A. The Manager will "
           "update Schedule A without further Member consent to reflect any issuance, forfeiture, repurchase, or "
           "Transfer of Units made in accordance with this Agreement, and the updated Schedule A is binding on all Members."))
s.append(P("<b>3.2 Class A Units.</b> Class A Units carry all voting, consent, and approval rights of Members under this "
           "Agreement and the Act, and full economic rights. Class A Units may be issued only as a Major Decision."))
s.append(P("<b>3.3 Class B Units (profits interests).</b>"))
s.append(P("(a) <i>Nature.</i> Class B Units are non-voting, economic-only Units issued to individuals or entities that "
           "provide services to the Company or its affiliates, under a Service Agreement. Class B Units carry no "
           "voting, consent, approval, or management rights on any matter, except to the extent the Act grants a "
           "right that cannot be waived, and Class B Members are not entitled to notice of or attendance at any "
           "meeting of Members."))
s.append(P("(b) <i>Threshold Value.</i> Each issuance of Class B Units is assigned a Threshold Value equal to the Fair "
           "Market Value of the Company on the issuance date, as determined in good faith by the Manager and recorded "
           "on Schedule A. Class B Units participate in distributions only to the extent provided in Article 5, so "
           "that on the issuance date the Class B Units would receive nothing if the Company were liquidated at their "
           "Threshold Value. The Class B Units are intended to be \"profits interests\" within the meaning of Revenue "
           "Procedures 93-27 and 2001-43, and this Agreement will be interpreted consistently with that intent."))
s.append(P("(c) <i>Tax treatment from issuance.</i> The Company and each Class B Member will treat the Class B Member as "
           "the owner of the Class B Units, and as a partner for tax purposes, from the date of issuance, whether or "
           "not the Class B Units are then vested, and the Company will allocate the Class B Member's distributive "
           "share of income, gain, loss, and deduction accordingly. Neither the Company nor any Class B Member will "
           "claim a deduction for the issuance of Class B Units."))
s.append(P("(d) <i>Authorized pool.</i> The Manager may issue Class B Units representing, in the aggregate, up to %s of "
           "the Company's fully diluted Units without Member approval. Issuances above that pool require approval as "
           "a Major Decision." % CLASS_B_POOL_PCT))
s.append(P("(e) <i>Vesting and forfeiture.</i> Class B Units are subject to the vesting, milestone, and forfeiture terms "
           "of the applicable Service Agreement. Class B Units that are forfeited under a Service Agreement are "
           "automatically cancelled for no consideration on the date of forfeiture, without further action by the "
           "Company or the holder. Each Class B Member irrevocably appoints the Manager as attorney-in-fact, coupled "
           "with an interest, solely to execute any instrument necessary to record a forfeiture or cancellation "
           "under this Section or a repurchase under Article 7."))
s.append(P("(f) <i>Joinder.</i> A person receiving Class B Units becomes a Class B Member on executing a joinder in the "
           "form of Schedule B and is bound by this Agreement as if an original signatory."))
s.append(P("<b>3.4 Capital Contributions.</b> The Class A Members have made the Capital Contributions shown on "
           "Schedule A. No Member is required to make any additional Capital Contribution or to lend money to the "
           "Company. No interest accrues on Capital Contributions, and no Member may withdraw or demand the return "
           "of a Capital Contribution except as expressly provided in this Agreement. Class B Units are issued for "
           "services and without a Capital Contribution."))
s.append(P("<b>3.5 Capital Accounts.</b> A Capital Account will be maintained for each Member in accordance with "
           "Treasury Regulation Section 1.704-1(b)(2)(iv), credited with the Member's Capital Contributions and "
           "allocations of income and gain, and debited with distributions and allocations of loss and deduction. "
           "The Manager may adjust Capital Accounts as permitted by that Regulation, including on the issuance of "
           "Class B Units."))
s.append(P("<b>3.6 Admission of Members.</b> Additional Class A Members may be admitted only as a Major Decision. "
           "Class B Members are admitted under Section 3.3. Every new Member must execute a joinder to this Agreement."))
s.append(P("<b>3.7 Limited liability.</b> No Member or Manager is personally liable for any debt, obligation, or "
           "liability of the Company solely by reason of being a Member or Manager. The failure of the Company to "
           "observe formalities is not a ground for imposing personal liability on any Member or Manager."))
s.append(P("<b>3.8 No certificates.</b> Units are uncertificated. Schedule A is the record of ownership."))

# ---------------- ARTICLE 4 ----------------
s.append(ART("ARTICLE 4 &mdash; MANAGEMENT"))
s.append(P("<b>4.1 Manager-managed.</b> The Company is managed by one Manager. The initial Manager is <b>%s</b>, who "
           "holds the title <b>%s</b> and may sign for the Company under that title. The Manager serves until "
           "resignation, death, incapacity, or removal and replacement by Class A Members holding a majority of the "
           "outstanding Class A Units (a \"Class A Majority\")." % (MANAGER_NAME, MANAGER_TITLE)))
s.append(P("<b>4.2 Authority of the Manager.</b> Except for Major Decisions, the Manager has full, exclusive, and "
           "complete authority to manage and control the business and affairs of the Company, including to: enter "
           "into and perform contracts; engage and terminate contractors, talent, and employees; open and operate "
           "bank and payment accounts; issue Class B Units within the pool in Section 3.3(d) and set Threshold "
           "Values; approve sponsorship and brand deals; determine and make distributions under Article 5; retain "
           "advisors; commence, defend, and settle claims; and take any other action in the ordinary course. Persons "
           "dealing with the Company may rely on the Manager's authority without inquiry."))
s.append(P("<b>4.3 Major Decisions.</b> The following require the prior written approval of a Class A Majority: "
           "(a) a Sale of the Company; (b) issuing Class A Units or admitting a Class A Member; (c) issuing Class B "
           "Units above the pool in Section 3.3(d); (d) amending this Agreement, except as Section 10.1 permits the "
           "Manager to do; (e) dissolving the Company; (f) incurring indebtedness or guaranties exceeding %s in the "
           "aggregate outstanding; (g) any transaction between the Company and the Manager, a Member, or their "
           "affiliates involving more than %s, other than compensation approved under Section 4.6; (h) changing the "
           "Company's tax classification; and (i) filing for bankruptcy or making an assignment for the benefit of "
           "creditors." % (DEBT_THRESHOLD, AFFILIATE_THRESHOLD)))
s.append(P("<b>4.4 Action by Class A Members.</b> Class A Members act by written consent (email is sufficient) of a Class "
           "A Majority, without a meeting. Each Class A Unit carries one vote. Class B Units carry no vote."))
s.append(P("<b>4.5 Officers.</b> The Manager may appoint officers with such titles and authority as the Manager "
           "determines, and may remove them at any time."))
s.append(P("<b>4.6 Compensation; reimbursement.</b> The Manager and any officer may receive compensation approved by a "
           "Class A Majority, and will be reimbursed for reasonable expenses incurred on the Company's behalf."))
s.append(P("<b>4.7 Standard of conduct; exculpation.</b> The Manager will perform in good faith and in a manner the "
           "Manager reasonably believes to be in the best interests of the Company. The Manager is not liable to the "
           "Company or any Member for any act or omission in that capacity except for acts or omissions constituting "
           "bad faith, willful misconduct, knowing violation of law, or a transaction from which the Manager derived "
           "an improper personal benefit. To the fullest extent permitted by Section 417(a) of the Act, the Members "
           "waive any fiduciary duties of the Manager other than the implied contractual covenant of good faith and "
           "fair dealing, provided this waiver does not eliminate liability for the excepted conduct above."))
s.append(P("<b>4.8 Indemnification.</b> The Company will indemnify and hold harmless the Manager, each officer, and "
           "each Member from any loss, claim, or expense (including reasonable attorneys' fees) arising from any act "
           "or omission on behalf of the Company, except to the extent finally determined to result from conduct "
           "excepted under Section 4.7. Indemnification is payable only from Company assets, and no Member is "
           "required to contribute capital to fund it. The Company may advance defense costs on receipt of an "
           "undertaking to repay if indemnification is ultimately not permitted."))
s.append(P("<b>4.9 Other activities.</b> Any Member or Manager may engage in other business activities, and neither "
           "the Company nor any other Member has any right to those activities or their income, except as that "
           "person's separate written agreement with the Company provides."))

# ---------------- ARTICLE 5 ----------------
s.append(ART("ARTICLE 5 &mdash; ALLOCATIONS AND DISTRIBUTIONS"))
s.append(P("<b>5.1 Allocations.</b> After giving effect to the regulatory allocations in Section 5.2, the net income and "
           "net loss of the Company for each fiscal year (and each item of income, gain, loss, and deduction) are "
           "allocated among the Members in a manner that causes each Member's Capital Account, as nearly as possible, "
           "to equal the amount that Member would receive if the Company sold all its assets for their book values, "
           "paid its liabilities, and distributed the remainder under Section 5.4 (the \"target\" allocation method)."))
s.append(P("<b>5.2 Regulatory allocations.</b> The allocations in this Article are intended to comply with Section "
           "704(b) of the Code and the Regulations under it, including the qualified income offset, minimum gain "
           "chargeback, and nonrecourse deduction rules, which are incorporated by reference and control over "
           "Section 5.1 to the extent required. The Manager may make such other allocations as are necessary to "
           "comply with the Code, and tax items will follow book items except as Section 704(c) of the Code requires."))
s.append(P("<b>5.3 Operating distributions.</b> The Manager determines the amount and timing of distributions of cash "
           "not reasonably needed for the Company's operations, reserves, and obligations. Distributions are made to "
           "the Members in proportion to their Percentage Interests, except that with respect to each series of Class "
           "B Units, the Class B Member shares only in distributions attributable to value in excess of that series' "
           "Threshold Value, as reasonably determined by the Manager; amounts a Class B Member would otherwise have "
           "received that are attributable to value at or below its Threshold Value are instead distributed to the "
           "other Members in proportion to their Percentage Interests."))
s.append(P("<b>5.4 Distributions on a Sale of the Company or liquidation.</b> Net proceeds of a Sale of the Company or "
           "of liquidation, after payment of liabilities and reasonable reserves, are distributed in the following "
           "order: (a) to the Class A Members in proportion to their unreturned Capital Contributions, until "
           "returned in full; and (b) the balance to all Members in proportion to their Percentage Interests, "
           "subject to the Threshold Value limitation in Section 5.3 for each series of Class B Units."))
s.append(P("<b>5.5 Tax distributions.</b> To the extent cash is reasonably available, the Manager will use reasonable "
           "efforts to distribute to each Member, no later than April 10 of each year, an amount sufficient to cover "
           "the Member's estimated federal, state, and local income tax on the net taxable income allocated to that "
           "Member for the prior year, calculated at an assumed combined rate the Manager sets for all Members. Tax "
           "distributions are advances against, and reduce, the Member's subsequent distributions under this Article."))
s.append(P("<b>5.6 Withholding; limitations.</b> The Company may withhold from distributions any amount required by law "
           "and treat it as distributed to the Member. No distribution may be made that would violate Section 508 of "
           "the Act or leave the Company unable to pay its debts as they come due."))

# ---------------- ARTICLE 6 ----------------
s.append(ART("ARTICLE 6 &mdash; TRANSFERS OF UNITS"))
s.append(P("<b>6.1 General restriction.</b> No Member may Transfer any Units except as expressly permitted by this "
           "Article. Any purported Transfer in violation of this Article is void, and the Company will not recognize "
           "the transferee for any purpose."))
s.append(P("<b>6.2 Class B Units.</b> Class B Units may not be Transferred by the holder to any person other than the "
           "Company, except by will or the laws of descent and distribution, in which case the transferee receives "
           "only the economic rights of the Units and is subject to Article 7."))
s.append(P("<b>6.3 Class A Units; right of first refusal.</b> A Class A Member wishing to Transfer Class A Units to a "
           "third party must first deliver written notice to the Company and the other Class A Members stating the "
           "proposed transferee, price, and terms. The Company has thirty (30) days, and if the Company declines, the "
           "other Class A Members have a further fifteen (15) days (pro rata among those electing), to purchase all "
           "(but not less than all) of the offered Units on the same terms. If the Units are not purchased, the "
           "Member may Transfer them to the named transferee, on terms no more favorable than those offered, within "
           "sixty (60) days, subject to Sections 6.5 and 6.7."))
s.append(P("<b>6.4 Permitted Transfers.</b> With the Manager's written consent, a Class A Member may Transfer Units to a "
           "trust or entity wholly owned by and for the benefit of that Member or the Member's immediate family for "
           "estate-planning purposes, provided the transferee executes a joinder and the Member remains bound."))
s.append(P("<b>6.5 Drag-along.</b> If a Class A Majority approves a Sale of the Company, every Member (including each "
           "Class B Member) will consent to, vote for, and raise no objection to the transaction; will Transfer their "
           "Units or otherwise participate on the same per-Unit terms as the Class A Majority (subject to the "
           "Threshold Value limitation in Section 5.3); will execute customary transaction documents; and will not "
           "exercise any appraisal or dissenters' rights. No Member is required to make representations other than "
           "as to title, authority, and non-contravention, or to bear indemnity liability exceeding that Member's "
           "share of proceeds."))
s.append(P("<b>6.6 Tag-along.</b> If Class A Members propose to Transfer Class A Units representing more than fifty "
           "percent (50%) of all Units to a third party (other than in a Sale of the Company under Section 6.5), each "
           "other Member may elect, by written notice within fifteen (15) days after receiving notice of the proposed "
           "Transfer, to include a pro rata portion of that Member's Units on the same per-Unit terms."))
s.append(P("<b>6.7 Transferees.</b> A transferee of Units becomes a Member only on executing a joinder and, in the case of "
           "Class A Units, on approval as a Major Decision; otherwise the transferee holds only the economic rights of "
           "an assignee under the Act. Every Transfer is subject to compliance with securities laws."))

# ---------------- ARTICLE 7 ----------------
s.append(ART("ARTICLE 7 &mdash; REPURCHASE, WITHDRAWAL, AND CERTAIN EVENTS"))
s.append(P("<b>7.1 Company repurchase right for Class B Units.</b> If a Class B Member's Service Agreement terminates for "
           "any reason, the Company has the right, but not the obligation, exercisable by written notice within one "
           "hundred eighty (180) days after the termination date, to repurchase all or any portion of that Member's "
           "vested Class B Units at the price in Section 7.2. Unvested Class B Units are governed by Section 3.3(e). "
           "This right is in addition to any forfeiture or repurchase provision in the Service Agreement."))
s.append(P("<b>7.2 Repurchase price.</b> The price for vested Class B Units is their Fair Market Value on the termination "
           "date, taking into account the Threshold Value; except that if the Service Agreement was terminated by the "
           "Company for the holder's material breach, for cause, or following an uncured performance notice as "
           "defined in the Service Agreement, or if the holder terminated the Service Agreement in breach of its "
           "terms, the price is the lesser of Fair Market Value and the holder's unreturned Capital Contribution "
           "attributable to those Units. The Company may pay the price in cash or by an unsecured promissory note "
           "bearing interest at the applicable federal rate, payable in equal quarterly installments over not more "
           "than twenty-four (24) months."))
s.append(P("<b>7.3 Fair Market Value determination.</b> Fair Market Value is determined in good faith by the Manager, "
           "taking into account the Company's financial condition, revenue, prospects, comparable transactions, and "
           "customary discounts for lack of marketability and control. A Member who disputes the Manager's "
           "determination within fifteen (15) days may, at the Member's own expense, obtain an appraisal from an "
           "independent appraiser reasonably acceptable to the Manager. If the appraised value exceeds the Manager's "
           "determination by more than twenty percent (20%), the appraised value controls and the Company will "
           "reimburse the appraisal cost; otherwise the Manager's determination controls."))
s.append(P("<b>7.4 No withdrawal.</b> No Member may voluntarily withdraw from the Company or demand a return of capital "
           "or a distribution except as this Agreement provides."))
s.append(P("<b>7.5 Death, incapacity, bankruptcy of a Member.</b> On the death, adjudicated incapacity, or bankruptcy of "
           "a Member, the Member's successor holds only the economic rights of an assignee, and the Company has the "
           "right, exercisable within one hundred eighty (180) days after notice of the event, to repurchase the "
           "Units at Fair Market Value on the terms in Section 7.2 (other than the reduced-price provision)."))

# ---------------- ARTICLE 8 ----------------
s.append(ART("ARTICLE 8 &mdash; BOOKS, RECORDS, AND TAX MATTERS"))
s.append(P("<b>8.1 Books and fiscal year.</b> The Company will keep complete books and records at its principal office. "
           "The fiscal year is the calendar year."))
s.append(P("<b>8.2 Information rights.</b> Class A Members have the inspection rights provided by Section 1102 of the "
           "Act. Class B Members are entitled to receive their Schedule K-1 and an annual summary of the Company's "
           "revenue and distributions, and have no other information or inspection rights except as the Act "
           "provides and cannot be waived."))
s.append(P("<b>8.3 Tax returns; K-1s.</b> The Manager will cause the Company's federal and state partnership returns to "
           "be prepared and filed and will use reasonable efforts to deliver Schedule K-1 to each Member within "
           "ninety (90) days after the end of each fiscal year."))
s.append(P("<b>8.4 Partnership Representative.</b> The Manager is designated the \"partnership representative\" under "
           "Section 6223 of the Code, with authority to act for the Company in any tax audit or proceeding, to make "
           "any election (including under Sections 754, 6221(b), and 6226 of the Code), and to bind the Members. "
           "Each Member will cooperate with the partnership representative and will be responsible for its share of "
           "any imputed underpayment, including after ceasing to be a Member."))
s.append(P("<b>8.5 Bank accounts.</b> Company funds will be kept in accounts in the Company's name and not commingled "
           "with the funds of any Member or Manager."))
s.append(P("<b>8.6 Confidentiality.</b> Each Member will keep confidential all non-public information concerning the "
           "Company, its business, finances, Members, contractors, and this Agreement, and will use it only in "
           "connection with the Member's interest in the Company. This obligation survives the Member's withdrawal "
           "for three (3) years and, as to trade secrets and credentials, for as long as the information remains protected."))

# ---------------- ARTICLE 9 ----------------
s.append(ART("ARTICLE 9 &mdash; DISSOLUTION"))
s.append(P("<b>9.1 Events of dissolution.</b> The Company dissolves only on: (a) approval of dissolution as a Major "
           "Decision; (b) a Sale of the Company after which the Class A Majority elects to dissolve; or (c) entry of a "
           "judicial decree of dissolution under the Act. The death, withdrawal, bankruptcy, or dissolution of a "
           "Member does not dissolve the Company."))
s.append(P("<b>9.2 Winding up.</b> On dissolution the Manager will wind up the Company's affairs, liquidate its assets, "
           "and apply the proceeds first to creditors (including Members who are creditors), then to reasonable "
           "reserves, and then to the Members under Section 5.4. No Member is obligated to restore a negative "
           "Capital Account. The Manager will file articles of dissolution when winding up is complete."))

# ---------------- ARTICLE 10 ----------------
s.append(ART("ARTICLE 10 &mdash; GENERAL PROVISIONS"))
s.append(P("<b>10.1 Amendments.</b> This Agreement may be amended only by a written instrument approved by a Class A "
           "Majority, except that the Manager may, without Member approval, (a) update Schedule A under Section 3.1, "
           "(b) make amendments required to comply with the Code or the Act or to preserve the tax treatment intended "
           "by Section 3.3, and (c) correct clerical errors. No amendment may reduce a Class B Member's vested "
           "economic rights in a manner disproportionate to the Class A Members without that Class B Member's "
           "written consent."))
s.append(P("<b>10.2 Governing law; disputes.</b> This Agreement is governed by the laws of the State of New York, "
           "without regard to conflict-of-laws rules. Before filing any action, the parties will attempt in good faith "
           "to resolve any dispute through direct negotiation for at least fifteen (15) days after written notice, "
           "and then through non-binding mediation before a mutually agreed mediator. If unresolved within thirty "
           "(30) days after mediation begins (or a party refuses to mediate), any party may bring the dispute "
           "exclusively in the state or federal courts located in the State of New York, and each party consents "
           "to their jurisdiction and venue. Nothing in this Section prevents a party from seeking injunctive relief "
           "at any time to enforce Articles 6 or 8."))
s.append(P("<b>10.3 Specific performance.</b> The Members agree that damages would be an inadequate remedy for breach of "
           "Articles 3, 6, or 7 and that the Company and the Members are entitled to specific performance and "
           "injunctive relief to enforce them, without posting bond."))
s.append(P("<b>10.4 Notices.</b> Notices may be given by email to the address on Schedule A (or as updated by notice) and "
           "are effective when sent absent a bounce or error message."))
s.append(P("<b>10.5 Entire agreement; severability; binding effect.</b> This Agreement, with its Schedules, is the entire "
           "agreement among the Members regarding the Company and supersedes all prior understandings. If any "
           "provision is held unenforceable, it will be modified to the minimum extent necessary and the remainder "
           "will continue in effect. This Agreement binds and benefits the Members and their permitted successors and "
           "assigns. There are no third-party beneficiaries."))
s.append(P("<b>10.6 Counterparts; electronic signatures.</b> This Agreement and any joinder may be signed in counterparts, "
           "and electronic signatures are valid and binding."))

s.append(Spacer(1, 10))
s.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#999999"), spaceAfter=10))
s.append(P("IN WITNESS WHEREOF, the undersigned have executed this Operating Agreement as of the Effective Date."))
s.append(Spacer(1, 14))

def member_sig_rows(names):
    rows = []
    for n in names:
        rows.append([Paragraph("<b>MEMBER</b>", sig_style)])
        rows.append([Spacer(1, 22)])
        rows.append([Paragraph("Signature: _______________________________", sig_style)])
        rows.append([Paragraph("Name: %s" % n, sig_style)])
        rows.append([Paragraph("Date: _______________________", sig_style)])
        rows.append([Spacer(1, 10)])
    return rows

names = [m[0] for m in CLASS_A_MEMBERS]
half = (len(names) + 1) // 2
left, right = member_sig_rows(names[:half]), member_sig_rows(names[half:])
n = max(len(left), len(right))
rows = [[left[i] if i < len(left) else "", right[i] if i < len(right) else ""] for i in range(n)]
t = Table(rows, colWidths=[3.15 * inch, 3.15 * inch])
t.setStyle(TableStyle([("VALIGN", (0, 0), (-1, -1), "TOP"), ("LEFTPADDING", (0, 0), (-1, -1), 0)]))
s.append(t)
s.append(Spacer(1, 8))
s.append(P("<b>ACKNOWLEDGED AND AGREED by the Company and the Manager:</b>"))
s.append(P("%s &nbsp;&nbsp; By: _______________________________ &nbsp;&nbsp; %s, %s &nbsp;&nbsp; Date: ______________"
           % (COMPANY_NAME, MANAGER_NAME, MANAGER_TITLE)))

# ---------------- SCHEDULE A ----------------
s.append(PageBreak())
s.append(P("SCHEDULE A", title_style))
s.append(P("Members, Units, Capital Contributions, and Percentage Interests &mdash; as of %s" % EFFECTIVE_DATE, subtitle_style))
s.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#999999"), spaceAfter=12))
s.append(P("<b>Class A Members (voting)</b>"))
ta = Table([["Name", "Address / notice email", "Capital Contribution", "Class A Units", "Percentage Interest"]] +
           [list(m) for m in CLASS_A_MEMBERS], colWidths=[1.45 * inch, 2.15 * inch, 1.05 * inch, 0.85 * inch, 0.9 * inch])
ta.setStyle(GRID); s.append(ta); s.append(Spacer(1, 12))
s.append(P("<b>Class B Members (non-voting profits interests)</b> &mdash; updated by the Manager on each issuance, "
           "vesting event, forfeiture, or repurchase under Section 3.1."))
tb = Table([["Name", "Service Agreement", "Class B Units", "Percentage Interest", "Threshold Value"]] +
           [list(m) for m in CLASS_B_MEMBERS], colWidths=[1.45 * inch, 1.9 * inch, 0.95 * inch, 1.0 * inch, 1.1 * inch])
tb.setStyle(GRID); s.append(tb); s.append(Spacer(1, 10))
s.append(P("Class B pool authorized under Section 3.3(d): %s of fully diluted Units. Percentage Interests are "
           "calculated on all Units outstanding (Class A plus issued Class B) and are subject to dilution on any "
           "further issuance under this Agreement." % CLASS_B_POOL_PCT))

# ---------------- SCHEDULE B ----------------
s.append(PageBreak())
s.append(P("SCHEDULE B", title_style))
s.append(P("Form of Joinder Agreement", subtitle_style))
s.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#999999"), spaceAfter=12))
s.append(P("The undersigned is being issued Units of %s (the \"Company\") and, as a condition of that issuance, "
           "agrees as follows:" % COMPANY_NAME))
s.append(P("1. The undersigned has received and read the Operating Agreement of the Company dated as of %s (as "
           "amended, the \"Operating Agreement\") and agrees to become a party to and be bound by it as a Member "
           "holding the class and number of Units stated below, as if an original signatory." % EFFECTIVE_DATE))
s.append(P("2. The Units are: &nbsp; Class: ____________ &nbsp; Number of Units: ____________ &nbsp; Percentage "
           "Interest at issuance: ________% &nbsp; Threshold Value (Class B only): $______________ &nbsp; Issuance "
           "date: ______________ &nbsp; Service Agreement (Class B only): ______________________________________."))
s.append(P("3. The undersigned acknowledges that Class B Units are non-voting profits interests subject to the "
           "vesting, forfeiture, transfer, drag-along, and repurchase provisions of the Operating Agreement and the "
           "Service Agreement; that the Company and the undersigned will treat the undersigned as the owner of the "
           "Units for tax purposes from the issuance date; that the Units have not been registered under any "
           "securities law and are acquired for investment; and that the undersigned is solely responsible for the "
           "tax consequences of the Units."))
s.append(P("4. Notice email for the undersigned: ______________________________________."))
s.append(Spacer(1, 16))
jt = Table([
    [Paragraph("<b>NEW MEMBER</b>", sig_style), Paragraph("<b>%s</b>" % COMPANY_NAME.upper(), sig_style)],
    [Spacer(1, 24), Spacer(1, 24)],
    [Paragraph("Signature: _______________________________", sig_style), Paragraph("By: _______________________________", sig_style)],
    [Paragraph("Name: ____________________________", sig_style), Paragraph("Name: %s" % MANAGER_NAME, sig_style)],
    [Paragraph("Date: _______________________", sig_style), Paragraph("Title: %s" % MANAGER_TITLE, sig_style)],
], colWidths=[3.15 * inch, 3.15 * inch])
jt.setStyle(TableStyle([("VALIGN", (0, 0), (-1, -1), "TOP"), ("LEFTPADDING", (0, 0), (-1, -1), 0)]))
s.append(jt)

doc = SimpleDocTemplate(OUT, pagesize=letter, leftMargin=0.9 * inch, rightMargin=0.9 * inch, topMargin=0.8 * inch,
                        bottomMargin=0.8 * inch, title="Operating Agreement of %s" % COMPANY_NAME, author=COMPANY_NAME)
doc.build(s)
print("Wrote", OUT)
