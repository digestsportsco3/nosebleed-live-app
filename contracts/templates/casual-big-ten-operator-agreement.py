#!/usr/bin/env python3
"""Blank master template: Casual Big Ten Account Operator Agreement (JGN Media LLC).

Fill Exhibit A per operator, then run. NEVER commit a filled copy or a generated
PDF - this repository is public. See ../README.md for terms and clause rationale.

Requires: pip install reportlab
Usage:    OUT_PDF=/path/to/out.pdf python3 casual-big-ten-operator-agreement.py

Section 7.5 below uses the FOUR-TIER liquidated damages schedule
($2,500 / $10,000 / $25,000 / $50,000). Operators papered before that revision are
on a three-tier schedule with a $10,000 floor - see ../README.md.
"""

import os

from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib.enums import TA_CENTER
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable, PageBreak
)

OUT = os.environ.get("OUT_PDF", "Casual_Big_Ten_Account_Operator_Agreement.pdf")

# ---------------------------------------------------------------------------
# EXHIBIT A VALUES - edit these per operator. Leave "" to print a blank row.
# Leave LIQUIDATED_DAMAGES as "" so the Section 7.5 tiers apply (recommended).
# ---------------------------------------------------------------------------
EFFECTIVE_DATE      = ""
OPERATOR_NAME       = ""
OPERATOR_ADDRESS    = ""
OPERATOR_PHONE      = ""
OPERATOR_EMAIL      = ""
ASSIGNED_ACCOUNT    = "@"
SCHOOL_FOCUS        = ""
POSTING_VOLUME      = "42 posts per week"
X_REV_SHARE         = "50% to Operator"
BRAND_REV_SHARE     = "50% to Operator"
LIQUIDATED_DAMAGES  = "$_________ (blank = Section 7.5 tiers apply)"
PAYMENT_METHOD      = "Zelle, wire transfer, or PayPal"

styles = getSampleStyleSheet()

title_style = ParagraphStyle(
    "AgreementTitle", parent=styles["Title"], fontName="Helvetica-Bold",
    fontSize=16, leading=20, alignment=TA_CENTER, spaceAfter=2,
)
subtitle_style = ParagraphStyle(
    "AgreementSubtitle", parent=styles["Normal"], fontName="Helvetica",
    fontSize=10.5, leading=14, alignment=TA_CENTER,
    textColor=colors.HexColor("#444444"), spaceAfter=10,
)
heading_style = ParagraphStyle(
    "SectionHeading", parent=styles["Heading2"], fontName="Helvetica-Bold",
    fontSize=11.5, leading=15, spaceBefore=14, spaceAfter=5,
    textColor=colors.HexColor("#111111"),
)
body_style = ParagraphStyle(
    "Body", parent=styles["Normal"], fontName="Helvetica", fontSize=10,
    leading=14.5, spaceAfter=7,
)
list_style = ParagraphStyle(
    "ListBody", parent=body_style, leftIndent=22, bulletIndent=8, spaceAfter=5,
)
sig_style = ParagraphStyle("Sig", parent=body_style, spaceAfter=2)


def P(text, style=body_style):
    return Paragraph(text, style)


def B(text):
    return Paragraph(text, list_style)


story = []

story.append(P("ACCOUNT OPERATOR AGREEMENT", title_style))
story.append(P("Casual Big Ten Network &mdash; Independent Contractor Services", subtitle_style))
story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#999999"), spaceAfter=12))

story.append(P(
    'This Account Operator Agreement (this "Agreement") is entered into as of the Effective Date '
    'set forth on Exhibit A by and between:'
))
story.append(B(
    '<bullet>&bull;</bullet><b>JGN Media LLC</b>, a New York limited liability company with a '
    'mailing address of 105 Broadway, Rockville Centre, New York 11570 (the "Company"); and'
))
story.append(B(
    '<bullet>&bull;</bullet>the individual identified as the Operator on Exhibit A (the "Operator").'
))
story.append(P(
    'The Company and the Operator may each be referred to as a "Party" and together as the "Parties."'
))

# --- 1. Purpose; the Brand ---
story.append(P("1. Purpose; the Brand", heading_style))
story.append(P(
    "The Company owns and operates the \"Casual Big Ten\" sports media brand and its network of "
    "school-specific social media accounts on X (formerly Twitter), together with all related "
    "names, handles, logos, trade dress, content, audiences, and goodwill (collectively, the "
    "\"Brand\"). The Company wishes to engage the Operator to run one of the Brand's school "
    "accounts, and the Operator wishes to provide those services, on the terms set out in this "
    "Agreement."
))

# --- 2. Assigned Account ---
story.append(P("2. Assigned Account", heading_style))
story.append(P(
    "The Operator will manage the X account identified on Exhibit A (the \"Assigned Account\"). "
    "Additional accounts may be assigned only by written agreement of both Parties (email is "
    "sufficient), and any account so assigned will be an \"Assigned Account\" for all purposes of "
    "this Agreement. The Operator receives only a limited, revocable, non-transferable right to "
    "access the Assigned Account solely to perform the Services, and acquires no ownership, "
    "possessory, equitable, audience, goodwill, monetization, or other proprietary interest of any "
    "kind in the Assigned Account or the Brand. The Company owns the Assigned Account and retains "
    "full access to it at all times, and may itself post to or otherwise use the Assigned Account "
    "whenever it sees fit, including for network-wide campaigns, cross-promotion, and internal "
    "operational needs. Such Company use is not a breach of this Agreement, does not count toward "
    "the Operator's minimum posting volume, and the Company will use reasonable efforts to "
    "coordinate so as not to materially disrupt the Operator's performance of the Services."
))

# --- 3. Services ---
story.append(P("3. Services", heading_style))
story.append(P(
    '<b>3.1 Scope.</b> The Operator will provide the following services (the "Services"): '
    "regular original posting on the Assigned Account at no less than the minimum posting volume "
    "set forth on Exhibit A; content centered on audience growth, community building, engagement "
    "with the school's fan base, and building brand affinity for Casual Big Ten; and reasonable "
    "ongoing engagement with followers, replies, and relevant conversations."
))
story.append(P(
    "<b>3.2 Standard of performance.</b> The Operator will perform the Services professionally, "
    "diligently, and in good faith, using commercially reasonable efforts and skill consistent with "
    "generally accepted standards for professional social media management, and in compliance with "
    "applicable law and the applicable terms of service of X. This Section is a standard of care "
    "and does not constitute a guarantee of any particular follower growth, engagement, or revenue "
    "outcome."
))
story.append(P(
    "<b>3.3 Creative discretion; Company approval rights.</b> The Operator has creative discretion "
    "in day-to-day content decisions within the Brand's voice and any reasonable written guidelines "
    "the Company provides. The Company reserves the right, exercisable in good faith, to: "
    "(a) direct overall content strategy for the Brand; (b) issue and update brand and content "
    "guidelines; (c) require prior approval of major campaigns; (d) prohibit specified categories "
    "of content; (e) require the prompt removal of any post; and (f) require correction of content "
    "inconsistent with the Brand or the Company's guidelines. The Operator will comply with any "
    "such direction promptly, and compliance with the Company's direction will not be a breach of "
    "this Agreement by the Operator."
))
story.append(P(
    "<b>3.4 Prohibited conduct.</b> In performing the Services, the Operator will not: "
    "(a) purchase followers or engagement, or use bots, engagement pods, or other artificial "
    "engagement methods; (b) post content that infringes any third party's copyright, trademark, "
    "or other intellectual-property or publicity rights; (c) post illegal, defamatory, or knowingly "
    "false material; (d) impersonate any person or entity; hold the Assigned Account out as "
    "affiliated with, sponsored, operated, endorsed, or approved by any university, athletic "
    "department, team, athletic conference, athlete, or other rights holder unless the Company has "
    "expressly authorized that representation; or adopt any official university, conference, or "
    "team logo or other protected branding as Account branding without the Company's prior written "
    "approval; (e) make endorsements or run paid or sponsored promotions on the Assigned Account "
    "except through a Brand Deal approved under Section 6, or violate FTC advertising and "
    "endorsement disclosure rules; (f) violate X's terms of service or monetization program terms "
    "in a manner that places the Assigned Account or its monetization eligibility at risk; or "
    "(g) engage in conduct reasonably likely to materially damage the Brand or the Company's "
    "reputation."
))
story.append(P(
    "<b>3.5 No subcontracting.</b> The Services are personal to the Operator. The Operator will "
    "not subcontract or delegate the Services, or permit any other person to access the Assigned "
    "Account or any Company credentials, without the Company's prior written consent."
))
story.append(P(
    "<b>3.6 Third-party media; content policies.</b> The Operator will comply with the Company's "
    "content and copyright policies as reasonably issued and updated from time to time. Access to "
    "the Assigned Account is not a license to copy, upload, or repost copyrighted broadcasts, game "
    "footage, photographs, graphics, articles, music, or other third-party material, and the fact "
    "that similar material appears elsewhere on social media is not authorization to post it. "
    "Nothing in this Section prohibits uses of third-party material that are authorized by the "
    "rights holder or permitted by applicable law. For clarity, the Company's approval of a "
    "general content category or policy is not direction to post any specific item, and the "
    "Operator remains responsible for the Operator's own selection of specific third-party "
    "material."
))

# --- 4. Term ---
story.append(P("4. Term", heading_style))
story.append(P(
    "This Agreement begins on the Effective Date and continues until terminated in accordance with "
    "Section 11 (the \"Term\")."
))

# --- 5. Ownership ---
story.append(P("5. Ownership of the Brand and Work Product", heading_style))
story.append(P(
    "<b>5.1 The Brand and the Accounts.</b> As between the Parties, the Company owns one hundred "
    "percent (100%) of all right, title, and interest in and to the Brand and every account in the "
    "Casual Big Ten network, including the Assigned Account, its handle, credentials, followers, "
    "audience data, analytics, monetization eligibility and payout rights, and all associated "
    "goodwill. Nothing in this Agreement transfers any ownership interest in any of the foregoing "
    "to the Operator, and the Operator will not register, claim, or assert any right in the Brand "
    "or any confusingly similar name, handle, or mark, during or after the Term."
))
story.append(P(
    "<b>5.2 Work Product.</b> All content created by the Operator for the Assigned Account under "
    "this Agreement, together with all other deliverables and materials developed by the Operator "
    "specifically for the Company or the Brand during the engagement &mdash; including campaign "
    "frameworks, posting systems, content calendars, templates, automation workflows, reporting "
    "dashboards, internal documentation, custom processes, and all improvements and derivative "
    "works of any of the foregoing (collectively, \"Work Product\") &mdash; is owned exclusively by "
    "the Company. The Operator hereby irrevocably assigns to the Company all right, title, and "
    "interest in and to all Work Product, effective upon creation; in addition, to the extent any "
    "Work Product qualifies as a work made for hire under applicable copyright law, it is owned by "
    "the Company as such. The Operator will execute any documents reasonably requested by the "
    "Company to confirm the foregoing."
))
story.append(P(
    "<b>5.3 Operator background materials.</b> The Operator retains ownership of the Operator's "
    "pre-existing know-how, skills, general experience, and tools or methods of general "
    "applicability developed outside of and not specifically for this engagement. To the extent any "
    "such background materials are incorporated into Work Product, the Operator grants the Company "
    "a perpetual, irrevocable, royalty-free license to use them as part of that Work Product. The "
    "Operator may reference the engagement and non-confidential results (e.g., growth metrics) in "
    "the Operator's own portfolio and professional materials."
))

# --- 6. Compensation ---
story.append(P("6. Compensation &mdash; Revenue Share", heading_style))
story.append(P(
    "<b>6.1 Revenue share.</b> As full compensation for the Services, the Company will pay the "
    "Operator <b>fifty percent (50%)</b> of: (a) \"X Monetization Revenue,\" meaning amounts "
    "actually received by the Company from X Corp. under X's creator monetization programs "
    "(including ad revenue sharing and subscriptions) that are attributable to the Assigned Account "
    "for periods during the Term; and (b) \"Brand Deal Revenue,\" meaning amounts actually received "
    "by the Company from third-party sponsorship, advertising, or brand partnership agreements "
    "approved and contracted by the Company &mdash; regardless of whether the underlying "
    "opportunity originated with the Company, the Operator, an inbound inquiry, an agency, or "
    "another source &mdash; to the extent directly and specifically attributable to sponsored "
    "content the Operator actually posts on the Assigned Account (each, a \"Brand Deal\"). Where a "
    "Brand Deal spans multiple Brand accounts or Company properties, the Company will allocate the "
    "revenue &mdash; and any related refund, reversal, clawback, or chargeback &mdash; among the "
    "participating accounts reasonably and in good faith using objective factors where practicable "
    "(such as contracted deliverables, impressions, posting volume, or account-specific pricing). "
    "The applicable allocation will be shown on the statement described in Section 6.3 and will be "
    "binding absent manifest error. For clarity, revenue from merchandise, affiliate programs, the "
    "Company's other properties, and network- or Company-level revenue streams not directly "
    "attributable to content posted on the Assigned Account is not shared unless the Company "
    "expressly designates otherwise in writing. This revenue share is the Operator's sole "
    "compensation under this Agreement; no base fee, salary, minimum payment, or expense "
    "reimbursement is owed unless separately agreed in writing or required by applicable law."
))
story.append(P(
    "<b>6.2 Brand Deals through the Company.</b> All Brand Deals are contracted through the "
    "Company. The Operator will refer sponsorship inquiries for the Assigned Account to the Company "
    "and will not enter into, or post content under, any sponsorship or paid promotion without the "
    "Company's prior written approval. The source of a sponsorship lead does not affect "
    "eligibility: the Operator's revenue share applies to every Brand Deal approved and contracted "
    "by the Company that is executed through sponsored content the Operator actually posts on the "
    "Assigned Account, subject to the allocation and exclusion provisions of Section 6.1."
))
story.append(P(
    "<b>6.3 Collection; payment; statements.</b> All X Monetization Revenue and Brand Deal Revenue "
    "is collected exclusively into payment and payout accounts owned and controlled by the Company "
    "(including the Company's Stripe and bank accounts), and the Assigned Account's monetization "
    "and payout settings will remain linked to Company-controlled accounts at all times. Within "
    "fifteen (15) days after the end of each calendar month, the Company will pay the Operator's "
    "share of X Monetization Revenue and Brand Deal Revenue actually received in that month, "
    "accompanied by a statement showing the amounts received, any allocations, and the calculation "
    "of the Operator's share. Amounts are calculated net of platform fees, payment-processing fees, "
    "and any refunds or chargebacks. If X or a Brand Deal counterparty claws back, reverses, or "
    "reduces a payment, the corresponding share may be deducted from the next payment(s) to the "
    "Operator; for a Brand Deal spanning multiple accounts, any such deduction is limited to the "
    "portion of the refund, reversal, clawback, or chargeback corresponding to revenue previously "
    "allocated to the Assigned Account under Section 6.1. No separate invoice, time sheet, or list "
    "of services is required from the Operator for the Company's calculation or payment of "
    "compensation under this Section 6. Revenue received after termination for periods during the "
    "Term is shared per this Section 6; revenue attributable to periods after the Term is not "
    "shared."
))
story.append(P(
    "<b>6.4 Records.</b> The Company will keep reasonable records of X Monetization Revenue and "
    "Brand Deal Revenue for the Assigned Account and, on the Operator's reasonable request (no more "
    "than twice per year), will make available documentation reasonably necessary to verify the "
    "Operator's share for the Assigned Account. This Section does not entitle the Operator to "
    "review Company-wide financial information, other operators' compensation, or sponsor "
    "information unrelated to the Assigned Account."
))
story.append(P(
    "<b>6.5 Taxes.</b> The Operator is an independent contractor and is responsible for all taxes "
    "on amounts paid under this Agreement. The Company may require a completed IRS Form W-9 (or "
    "equivalent) before making payments."
))

# --- 7. Account Access and Security ---
story.append(P("7. Account Access and Security", heading_style))
story.append(P(
    "<b>7.1 Access.</b> The Company will provide the Operator with login credentials for the "
    "Assigned Account. The Assigned Account, its credentials, its followers, and all associated "
    "data remain the sole property of the Company at all times."
))
story.append(P(
    "<b>7.2 Safeguarding.</b> The Operator will keep all credentials strictly confidential, will "
    "not share them with any third party (consistent with Section 3.5), and will use the Assigned "
    "Account only to perform the Services."
))
story.append(P(
    "<b>7.3 Account integrity.</b> The Operator will not, without the Company's prior written "
    "consent: (a) change the Assigned Account's password, linked email address, phone number, "
    "two-factor authentication settings, or linked payout or monetization settings; (b) transfer, "
    "sell, rename, deactivate, or delete the Assigned Account; (c) lock or restrict the Company's "
    "access to the Assigned Account; or (d) take any other action intended to harm the Assigned "
    "Account, its audience, or its monetization eligibility. The Company may change credentials at "
    "any time and will promptly provide the Operator updated credentials so the Services can "
    "continue."
))
story.append(P(
    "<b>7.4 Emergency suspension.</b> The Company may immediately suspend the Operator's access to "
    "the Assigned Account if the Company reasonably believes that continued access presents a "
    "security risk, a risk of loss of or damage to the Assigned Account, a risk of significant "
    "reputational harm to the Brand or the Company, or unauthorized use of Company assets. The "
    "Company will promptly notify the Operator of any suspension and the reason for it, and the "
    "Parties will work in good faith to resolve the issue. A suspension under this Section does not "
    "by itself terminate this Agreement; if a suspension not caused by the Operator's breach "
    "prevents performance, the affected posting obligations are excused for the duration of the "
    "suspension and the Operator's revenue share continues to accrue during that period."
))
story.append(P(
    "<b>7.5 Liquidated damages for account misappropriation.</b> The Parties agree that the "
    "Assigned Account is a uniquely valuable Company asset whose loss would cause the Company harm "
    "that is real and substantial but difficult to quantify precisely, including loss of audience, "
    "goodwill, monetization, and Brand network value. If the Operator materially breaches "
    "Section 7.3 &mdash; including by changing credentials to exclude the Company, transferring or "
    "attempting to transfer the Assigned Account, or otherwise misappropriating it &mdash; the "
    "Operator will immediately restore the Company's full access and control upon notice. If full "
    "access and control are not restored within forty-eight (48) hours of notice, or the Assigned "
    "Account is lost, transferred, or destroyed as a result of such a breach, the Operator will pay "
    "the Company, as liquidated damages for each affected account, the amount specified for the "
    "Assigned Account on Exhibit A or, if no amount is specified there, the amount determined by "
    "the Assigned Account's follower count at the time of the breach: <b>$2,500.00</b> if fewer "
    "than 1,000 followers; <b>$10,000.00</b> if at least 1,000 but fewer than 10,000 followers; "
    "<b>$25,000.00</b> if at least 10,000 but fewer than 50,000 followers; and <b>$50,000.00</b> "
    "if 50,000 or more followers. Any Exhibit A amount may be changed only by mutual written "
    "agreement of the Parties before any breach. The Parties agree the applicable amount is a "
    "genuine and reasonable pre-estimate of the Company's minimum probable loss from such a breach "
    "&mdash; scaled to objective characteristics of the Assigned Account existing before the breach "
    "&mdash; given the difficulty of valuing a branded account and its audience, and is not a "
    "penalty. This Section does not limit the Company's right to injunctive or other equitable "
    "relief to recover the Assigned Account itself, and does not apply to ordinary content "
    "decisions made in good faith, actions taken at the Company's direction, or events outside the "
    "Operator's reasonable control (such as platform outages, hacks not caused by the Operator's "
    "breach of this Agreement, or actions taken by X). The forty-eight (48) hour restoration period "
    "applies only to this liquidated-damages remedy; it does not limit the Company's right to "
    "suspend access under Section 7.4 or to terminate immediately under Section 11.1 for a breach "
    "of Section 7.3."
))
story.append(P(
    "<b>7.6 Return of Company property.</b> Upon expiration or termination of this Agreement, or "
    "upon the Company's earlier request, the Operator will cease using the Assigned Account; "
    "confirm that no credentials or account settings have been changed; and promptly return to the "
    "Company, or at the Company's election permanently delete and confirm deletion of, all Company "
    "property and Confidential Information in the Operator's possession or control, including "
    "passwords and credentials, media assets and design files, drafts and unpublished content, "
    "analytics exports, AI prompts and workflows created for Company work, spreadsheets, content "
    "calendars, and internal documents. The Operator may retain materials embodying the Operator's "
    "own pre-existing know-how and general experience as described in Section 5.3."
))

# --- 8. Independent Contractor ---
story.append(P("8. Independent Contractor", heading_style))
story.append(P(
    "The Operator is an independent contractor, not an employee, partner, joint venturer, or agent "
    "of the Company. The revenue share in Section 6 is a compensation mechanism only and does not "
    "create any partnership, ownership, or profit interest in the Company or the Brand. The "
    "Operator controls the manner and means of performing the Services, may use the Operator's own "
    "equipment and schedule, and is not entitled to employee benefits. Nothing in this Agreement "
    "restricts the Operator from providing services to other clients. Neither Party may bind the "
    "other except as expressly set out in this Agreement. Without limiting the foregoing, the "
    "Operator has no authority to execute agreements on the Company's behalf, accept or negotiate "
    "sponsorships or advertising commitments, incur Company expenses, or make official statements "
    "for the Company or the Brand; sponsorship inquiries must be referred to the Company under "
    "Section 6.2. The Operator represents that the Operator is at least eighteen (18) years of age "
    "and has full legal capacity to enter into this Agreement."
))

# --- 9. Confidentiality ---
story.append(P("9. Confidentiality", heading_style))
story.append(P(
    "<b>9.1 Definition.</b> \"Confidential Information\" means all non-public information disclosed "
    "by or on behalf of one Party to the other in connection with this Agreement, whether oral, "
    "written, or electronic, including, in the case of the Company: credentials; business and "
    "strategic plans; sponsorship and advertising relationships and terms; partnership discussions; "
    "creator and operator relationships and compensation terms; unpublished campaigns and content; "
    "community strategy; app and website plans and information; AI prompts and workflows; internal "
    "documentation and operating procedures; analytics; growth strategies; monetization methods and "
    "payout data; financial information (including the terms of this Agreement); future products "
    "and features; proprietary systems; and any other non-public Company information. Confidential "
    "Information does not include information that: (a) is or becomes publicly available through no "
    "breach of this Agreement; (b) was lawfully known to the receiving Party before disclosure; "
    "(c) is lawfully received from a third party without confidentiality obligations; or (d) is "
    "independently developed without use of the disclosing Party's Confidential Information."
))
story.append(P(
    "<b>9.2 Obligations.</b> Each Party will keep the other Party's Confidential Information "
    "confidential, will use it only for purposes of this Agreement, and will protect it with at "
    "least reasonable care. A Party may disclose Confidential Information to the extent required by "
    "law or court order, provided it gives the other Party prompt notice where legally permitted. "
    "These obligations survive for three (3) years after this Agreement ends, except that "
    "obligations with respect to credentials and trade secrets survive for as long as the "
    "information remains protected."
))

# --- 10. Indemnification ---
story.append(P("10. Indemnification; Limitation of Liability", heading_style))
story.append(P(
    "<b>10.1 By the Operator.</b> The Operator will indemnify and hold harmless the Company and "
    "its affiliates and their respective members, managers, officers, employees, and agents from "
    "and against third-party claims, demands, proceedings, and investigations, and resulting "
    "losses, damages, judgments, settlements, and reasonable attorneys' fees and defense costs, to "
    "the extent arising from: (a) infringement or misappropriation of any third party's copyright "
    "(including in broadcasts, game footage, photographs, graphics, or music), trademark, "
    "publicity, likeness, privacy, or NIL-related rights by content the Operator creates, selects, "
    "reposts, edits, or publishes; (b) unlawful, defamatory, or knowingly false content posted by "
    "the Operator; (c) the Operator's violation of FTC endorsement or disclosure rules, or "
    "unauthorized advertisements or sponsorships; (d) the Operator's material breach of this "
    "Agreement; or (e) the Operator's negligence or willful misconduct. This Section does not "
    "apply to content created and posted solely by the Company, or to content the Operator posts "
    "at the Company's specific written direction without material deviation."
))
story.append(P(
    "<b>10.2 By the Company.</b> The Company will indemnify and hold harmless the Operator from "
    "and against third-party claims, and resulting losses, damages, and reasonable attorneys' fees, "
    "to the extent arising solely from materials provided by the Company or content posted at the "
    "Company's specific written direction."
))
story.append(P(
    "<b>10.3 Procedure.</b> The indemnified Party will give prompt notice of any claim, reasonable "
    "cooperation, and control of the defense and settlement to the indemnifying Party; no "
    "settlement imposing obligations on the indemnified Party may be made without its consent, not "
    "to be unreasonably withheld."
))
story.append(P(
    "<b>10.4 Limitation of liability.</b> Except for the Company's payment obligations under "
    "Section 6, the Company's aggregate liability arising out of or relating to this Agreement "
    "will not exceed the total amounts paid and payable to the Operator under this Agreement in "
    "the six (6) months preceding the event giving rise to the claim, and the Company will not be "
    "liable for indirect, incidental, special, consequential, or exemplary damages or for lost "
    "profits or lost opportunities. This Section does not limit the Operator's obligations or "
    "liability under Section 7.5 (liquidated damages), Section 9 (confidentiality), or "
    "Section 10.1 (indemnification), or the Operator's liability for fraud, willful misconduct, or "
    "misappropriation of the Assigned Account or the Brand. Notwithstanding the foregoing, the "
    "Operator's aggregate liability for indemnified claims arising solely from the Operator's "
    "ordinary negligence &mdash; and not from knowing, intentional, fraudulent, or willful conduct "
    "or from a breach of Section 7.3 or Section 9 &mdash; will not exceed the greater of (i) the "
    "total amounts paid and payable to the Operator under this Agreement in the twelve (12) months "
    "preceding the claim and (ii) twenty-five thousand dollars ($25,000.00)."
))

# --- 11. Termination ---
story.append(P("11. Termination", heading_style))
story.append(P(
    "<b>11.1 For material breach.</b> Either Party may terminate this Agreement if the other Party "
    "materially breaches it and fails to cure the breach within seven (7) days of written notice "
    "(email is sufficient). No cure period applies to a breach of Section 7.3."
))
story.append(P(
    "<b>11.2 For convenience.</b> Either Party may terminate this Agreement for any reason on "
    "fourteen (14) days' written notice."
))
story.append(P(
    "<b>11.3 Reputation protection.</b> The Company may terminate this Agreement immediately upon "
    "written notice if the Operator engages in illegal conduct, or in intentional public conduct, "
    "that is reasonably likely to cause substantial reputational harm to the Brand or the Company. "
    "This Section applies only to conduct of the kinds described and is not a general right to "
    "terminate for dissatisfaction with the Services."
))
story.append(P(
    "<b>11.4 Effect of termination.</b> Upon any termination, the Company will pay the Operator's "
    "revenue share under Section 6 for amounts actually received that are attributable to periods "
    "through the effective date of termination, on the normal monthly payment schedule. If the "
    "Company terminates under Section 11.1 for the Operator's uncured material breach, or under "
    "Section 11.3, the Company retains all other rights and remedies available under this Agreement "
    "and applicable law. Sections 5, 6.3 (as to post-termination payments), 7.5, 7.6, 9, 10, 11.4, "
    "11.5, and 12 survive termination."
))
story.append(P(
    "<b>11.5 Transition assistance.</b> For up to thirty (30) days after expiration or "
    "termination, the Operator will provide reasonable incidental cooperation to facilitate an "
    "orderly handover, limited to: returning or transferring drafts, scheduled and unpublished "
    "content, Company files, and outstanding campaign information; answering reasonable questions; "
    "and confirming account settings. This Section does not require continued content creation or "
    "account management after termination, and any substantial post-termination services require "
    "the Parties' separate written agreement on scope and compensation before the work is "
    "performed."
))

# --- 12. General ---
story.append(P("12. General", heading_style))
story.append(P(
    "<b>12.1 Governing law.</b> This Agreement is governed by the laws of the State of New York, "
    "without regard to conflict-of-laws rules."
))
story.append(P(
    "<b>12.2 Dispute resolution.</b> Before filing any action, the Parties will first attempt in "
    "good faith to resolve any dispute arising out of this Agreement through direct negotiation for "
    "at least fifteen (15) days after written notice of the dispute. If negotiation fails, the "
    "Parties will submit the dispute to non-binding mediation before a mutually agreed mediator, "
    "with the costs of the mediator shared equally. If the dispute is not resolved within thirty "
    "(30) days after mediation begins (or a Party refuses to mediate), either Party may bring the "
    "dispute exclusively in the state or federal courts located in the State of New York, and each "
    "Party consents to the personal jurisdiction and venue of those courts. Nothing in this Section "
    "prevents either Party from seeking urgent injunctive relief in those courts at any time "
    "(including under Section 7)."
))
story.append(P(
    "<b>12.3 Entire agreement; amendments.</b> This Agreement (including Exhibit A) is the entire "
    "agreement between the Parties regarding its subject matter and supersedes all prior "
    "discussions. It may be amended only in a writing (email is sufficient) agreed to by both "
    "Parties."
))
story.append(P(
    "<b>12.4 Assignment.</b> Neither Party may assign this Agreement without the other Party's "
    "written consent, except that the Company may assign it without consent to a successor in "
    "connection with a merger, acquisition, or sale of all or substantially all of its assets."
))
story.append(P(
    "<b>12.5 Notices.</b> Notices under this Agreement may be given by email to the addresses the "
    "Parties customarily use to communicate with each other, and are effective when sent absent a "
    "bounce or error message."
))
story.append(P(
    "<b>12.6 Severability; waiver.</b> If any provision of this Agreement is held unenforceable, "
    "it will be modified to the minimum extent necessary to make it enforceable, and the remainder "
    "of this Agreement will remain in effect. A Party's failure to enforce any provision is not a "
    "waiver of it. Nothing in this Agreement waives, or requires the Operator to waive, any right "
    "or protection that cannot be waived under applicable law."
))
story.append(P(
    "<b>12.7 Counterparts; electronic signatures.</b> This Agreement may be signed in "
    "counterparts, and electronic signatures are valid and binding."
))

story.append(Spacer(1, 10))
story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#999999"), spaceAfter=10))
story.append(P(
    "IN WITNESS WHEREOF, the Parties have executed this Agreement as of the Effective Date set "
    "forth on Exhibit A."
))
story.append(Spacer(1, 18))


def signature_block(operator_name, compact=False):
    gap = 26 if compact else 30
    rows = [
        [Paragraph("<b>JGN MEDIA LLC</b>", sig_style),
         Paragraph("<b>OPERATOR</b>", sig_style)],
        [Spacer(1, gap), Spacer(1, gap)],
        [Paragraph("Signature: _______________________________", sig_style),
         Paragraph("Signature: _______________________________", sig_style)],
        [Spacer(1, 12), Spacer(1, 12)],
        [Paragraph("Name: Nicholas Restivo", sig_style),
         Paragraph("Name: %s" % (operator_name or "____________________________"), sig_style)],
    ]
    if not compact:
        rows += [
            [Spacer(1, 12), Spacer(1, 12)],
            [Paragraph("Title: Chief Executive Officer", sig_style),
             Paragraph("Title: Independent Contractor", sig_style)],
            [Spacer(1, 12), Spacer(1, 12)],
            [Paragraph("Date: _______________________", sig_style),
             Paragraph("Date: _______________________", sig_style)],
        ]
    t = Table(rows, colWidths=[3.15 * inch, 3.15 * inch])
    t.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 12),
    ]))
    return t


story.append(signature_block(OPERATOR_NAME))

# --- Exhibit A ---
story.append(PageBreak())
story.append(P("EXHIBIT A", title_style))
story.append(P("Engagement Terms", subtitle_style))
story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#999999"), spaceAfter=12))

exhibit_rows = [
    ["Effective Date", EFFECTIVE_DATE],
    ["Operator (full legal name)", OPERATOR_NAME],
    ["Operator mailing address", OPERATOR_ADDRESS],
    ["Operator phone", OPERATOR_PHONE],
    ["Operator email", OPERATOR_EMAIL],
    ["Assigned Account (X handle)", ASSIGNED_ACCOUNT],
    ["School / focus", SCHOOL_FOCUS],
    ["Minimum posting volume", POSTING_VOLUME],
    ["Revenue share — X Monetization Revenue", X_REV_SHARE],
    ["Revenue share — Brand Deal Revenue", BRAND_REV_SHARE],
    ["Liquidated damages amount (Section 7.5)", LIQUIDATED_DAMAGES],
    ["Payment method", PAYMENT_METHOD],
]
exhibit_table = Table(
    exhibit_rows, colWidths=[2.9 * inch, 3.4 * inch],
    rowHeights=[0.42 * inch] * len(exhibit_rows),
)
exhibit_table.setStyle(TableStyle([
    ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
    ("FONTNAME", (1, 0), (1, -1), "Helvetica"),
    ("FONTSIZE", (0, 0), (-1, -1), 9.5),
    ("BACKGROUND", (0, 0), (0, -1), colors.HexColor("#EFEFEF")),
    ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#BBBBBB")),
    ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ("LEFTPADDING", (0, 0), (-1, -1), 8),
]))
story.append(exhibit_table)
story.append(Spacer(1, 10))
story.append(P(
    "This Exhibit A is incorporated into and forms part of the Account Operator Agreement between "
    "JGN Media LLC and the Operator named above. In the event of a conflict between this Exhibit "
    "and the body of the Agreement, the body of the Agreement controls."
))
story.append(Spacer(1, 16))
story.append(signature_block(OPERATOR_NAME, compact=True))

doc = SimpleDocTemplate(
    OUT, pagesize=letter,
    leftMargin=0.9 * inch, rightMargin=0.9 * inch,
    topMargin=0.8 * inch, bottomMargin=0.8 * inch,
    title="Account Operator Agreement — Casual Big Ten Network (JGN Media LLC)",
    author="JGN Media LLC",
)
doc.build(story)
print("Wrote %s" % OUT)
