#!/usr/bin/env python3
"""Blank master template: Talent, Handicapping, and Content Services Agreement (JGN Media LLC d/b/a Nosebleed Sports).

For on-camera talent / handicapper roles with a monthly fee, brand-deal revenue share, and milestone equity.
Fill the Exhibit A constants per contractor. NEVER commit a filled copy - this repo is public.
See ../README.md for terms, rationale, and the open legal items (equity issuance needs the Operating Agreement).
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

OUT = os.environ.get("OUT_PDF", "Nosebleed_Talent_Handicapper_Agreement.pdf")

# ---- Exhibit A values ----
EFFECTIVE_DATE     = ""
CONTRACTOR_NAME    = ""
CONTRACTOR_ADDRESS = ""
CONTRACTOR_PHONE   = ""
CONTRACTOR_EMAIL   = ""
TIKTOK_HANDLE      = "Nosebleed Sports TikTok  (@__________)"
INSTAGRAM_HANDLE   = "Nosebleed Sports Instagram  (@__________)"
MONTHLY_FEE        = "$800.00 per month, in arrears (Section 4.1)"
BRAND_DEAL_SHARE   = "50% of Brand Deal Revenue (Section 4.2)"
EQUITY_SUMMARY     = "1% / 2.5% / 3.75% / 5% at $25K / $60K / $110K / $175K (Section 5)"
LIQUIDATED_DAMAGES = "$_________ (blank = Section 9.5 tiers apply)"
PAYMENT_METHOD     = "Zelle, wire transfer, or PayPal"

styles = getSampleStyleSheet()
title_style = ParagraphStyle("T", parent=styles["Title"], fontName="Helvetica-Bold",
                             fontSize=15, leading=19, alignment=TA_CENTER, spaceAfter=2)
subtitle_style = ParagraphStyle("S", parent=styles["Normal"], fontName="Helvetica", fontSize=10.5,
                                leading=14, alignment=TA_CENTER, textColor=colors.HexColor("#444444"), spaceAfter=10)
heading_style = ParagraphStyle("H", parent=styles["Heading2"], fontName="Helvetica-Bold", fontSize=11.5,
                               leading=15, spaceBefore=13, spaceAfter=5, textColor=colors.HexColor("#111111"))
body_style = ParagraphStyle("B", parent=styles["Normal"], fontName="Helvetica", fontSize=10, leading=14.5, spaceAfter=7)
list_style = ParagraphStyle("L", parent=body_style, leftIndent=22, bulletIndent=8, spaceAfter=5)
sig_style = ParagraphStyle("Sig", parent=body_style, spaceAfter=2)

def P(t, s=body_style): return Paragraph(t, s)
def B(t): return Paragraph(t, list_style)

GRID = TableStyle([
    ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
    ("FONTSIZE", (0, 0), (-1, -1), 9.5),
    ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#EFEFEF")),
    ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#BBBBBB")),
    ("TOPPADDING", (0, 0), (-1, -1), 5), ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ("LEFTPADDING", (0, 0), (-1, -1), 8),
])

story = []
story.append(P("TALENT, HANDICAPPING, AND CONTENT SERVICES AGREEMENT", title_style))
story.append(P("Nosebleed Sports &mdash; Independent Contractor Services", subtitle_style))
story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#999999"), spaceAfter=12))

story.append(P('This Talent, Handicapping, and Content Services Agreement (this "Agreement") is entered '
               'into as of the Effective Date set forth on Exhibit A by and between:'))
story.append(B('<bullet>&bull;</bullet><b>JGN Media LLC</b>, a New York limited liability company doing '
               'business as Nosebleed Sports, with a mailing address of 105 Broadway, Rockville Centre, '
               'New York 11570 (the "Company"); and'))
story.append(B('<bullet>&bull;</bullet>the individual identified as the Contractor on Exhibit A (the "Contractor").'))
story.append(P('The Company and the Contractor may each be referred to as a "Party" and together as the "Parties."'))

# 1
story.append(P("1. Purpose; the Brand", heading_style))
story.append(P(
    "The Company owns and operates the \"Nosebleed Sports\" sports media brand, including its social media "
    "accounts, its premium picks offering, its Discord community, and its related properties, together with "
    "all related names, logos, content, audiences, and goodwill (collectively, the \"Brand\"). The Company "
    "wishes to engage the Contractor as its handicapper and on-camera brand talent and to manage certain "
    "Brand social media accounts, and the Contractor wishes to provide those services, on the terms set out "
    "in this Agreement."))

# 2
story.append(P("2. Services", heading_style))
story.append(P(
    "<b>2.1 Monthly Deliverables.</b> The Contractor will provide the following services (the \"Services\"). "
    "Items (a) through (f) are the \"Monthly Deliverables\" for each calendar month during the Term:"))
story.append(B("<bullet>(a)</bullet><b>Managed Accounts.</b> Manage the Nosebleed Sports TikTok account and "
               "the Nosebleed Sports Instagram account identified on Exhibit A (the \"Managed Accounts\"), "
               "publishing a minimum of three (3) original posts per day on each Managed Account."))
story.append(B("<bullet>(b)</bullet><b>Handicapping.</b> Deliver daily picks with accompanying research "
               "write-ups, in the Company's system and format and on the Company's delivery schedule, for use "
               "in the Company's premium picks offering (the \"Premium Offering\")."))
story.append(B("<bullet>(c)</bullet><b>Live sessions.</b> During the NFL regular season and postseason, host "
               "a live session of at least thirty (30) minutes on each NFL Sunday, beginning before the "
               "1:00 p.m. Eastern game slate, on TikTok, Instagram, X, YouTube, or Discord as the Company "
               "directs; and host live sessions for major games and events across all sports as reasonably "
               "designated by the Company with reasonable advance notice."))
story.append(B("<bullet>(d)</bullet><b>Creative and on-camera.</b> Contribute creative concepts and "
               "advertising hooks, and appear as on-camera talent in the Company's organic and paid content, "
               "including user-generated-style advertisements."))
story.append(B("<bullet>(e)</bullet><b>Team participation.</b> Attend one (1) weekly team sync; participate "
               "actively in the Company's Discord community on a daily basis; and respond to and engage with "
               "team communications regarding strategy, growth, and marketing within one (1) business day."))
story.append(B("<bullet>(f)</bullet><b>Brand representation.</b> Identify Nosebleed Sports in the "
               "Contractor's personal social media bios during the Term and represent the Brand "
               "professionally in public."))
story.append(P(
    "<b>2.2 Standard of performance.</b> The Contractor will perform the Services professionally, diligently, "
    "and in good faith, using commercially reasonable efforts and skill consistent with generally accepted "
    "standards for professional sports media talent and handicapping content, and in compliance with "
    "applicable law and platform terms of service. This Section is a standard of care and is not a guarantee "
    "of any particular growth, engagement, subscription, or wagering outcome."))
story.append(P(
    "<b>2.3 Company direction.</b> The Contractor has creative discretion in day-to-day execution within the "
    "Brand's voice and any reasonable written guidelines the Company provides. The Company reserves the "
    "right, exercisable in good faith, to: (a) direct overall content and picks strategy; (b) issue and "
    "update brand, content, and compliance guidelines; (c) require prior approval of major campaigns; "
    "(d) prohibit specified categories of content; (e) require the prompt removal or correction of any "
    "content; and (f) set the format, cadence, and delivery schedule for picks and write-ups. The Contractor "
    "will comply with such direction promptly, and compliance with the Company's direction is not a breach "
    "of this Agreement by the Contractor."))
story.append(P(
    "<b>2.4 Prohibited conduct.</b> The Contractor will not: (a) purchase followers or engagement, or use "
    "bots, engagement pods, or other artificial engagement methods; (b) post content that infringes any "
    "third party's copyright, trademark, or other intellectual-property or publicity rights; (c) post "
    "illegal, defamatory, or knowingly false material; (d) impersonate any person or entity or claim "
    "affiliation with or endorsement by any league, team, or rights holder without the Company's written "
    "authorization; (e) make endorsements or run paid or sponsored promotions except through a Brand Deal "
    "approved under Section 4.3, or violate FTC endorsement and disclosure rules; (f) violate platform "
    "terms of service in a manner that places any Company Account at risk; or (g) engage in conduct "
    "reasonably likely to bring the Brand or the Company into public disrepute, recognizing that the "
    "Contractor is a public face of the Brand."))
story.append(P(
    "<b>2.5 Handicapping standards and compliance.</b> In connection with the Premium Offering and all "
    "picks content, the Contractor will: (a) provide picks and analysis that are the Contractor's own "
    "genuine work; (b) include the Company's standard disclaimers (including that picks are for "
    "informational and entertainment purposes, are not financial advice, and carry no guarantee of any "
    "outcome) and responsible-gambling messaging as the Company directs; (c) not describe any pick as a "
    "guarantee, \"lock,\" or certainty, and not misstate the Contractor's record or results; (d) maintain "
    "accurate records of picks and results and make them available to the Company on request; (e) comply "
    "with all applicable laws and platform policies governing gambling-related content and advertising, "
    "including age and jurisdiction restrictions; (f) not promote any sportsbook, betting operator, or "
    "affiliate offer through the Brand without the Company's prior written approval, and disclose to the "
    "Company all affiliate, sponsorship, or compensation relationships with any sportsbook, betting "
    "operator, or picks service; and (g) not engage in any conduct relating to wagering or sports "
    "integrity that violates applicable law or league or platform rules."))
story.append(P(
    "<b>2.6 Conflicts; existing obligations.</b> During the Term, the Contractor will not, without the "
    "Company's prior written consent: (a) sell, publish, or provide handicapping picks or analysis through "
    "any paid picks service other than the Premium Offering; or (b) serve as on-camera talent, ambassador, "
    "or spokesperson for any other sports media, picks, or sports betting brand. The Contractor represents "
    "that entering into and performing this Agreement does not breach any agreement with, or obligation to, "
    "any third party, and that the Contractor has disclosed to the Company all existing agreements and "
    "relationships with any sportsbook, betting operator, picks service, or sports media company. Nothing "
    "in this Agreement restricts the Contractor's activities after the Term."))
story.append(P(
    "<b>2.7 No subcontracting.</b> The Services are personal to the Contractor. The Contractor will not "
    "subcontract or delegate the Services, or permit any other person to access any Company Account or "
    "Company credentials, without the Company's prior written consent."))
story.append(P(
    "<b>2.8 Third-party media; content policies.</b> The Contractor will comply with the Company's content "
    "and copyright policies as reasonably issued and updated from time to time. Access to the Company "
    "Accounts is not a license to copy, upload, or repost copyrighted broadcasts, game footage, "
    "photographs, graphics, articles, music, or other third-party material, and the fact that similar "
    "material appears elsewhere on social media is not authorization to post it. The Company's approval of "
    "a general content category is not direction to post any specific item, and the Contractor remains "
    "responsible for the Contractor's own selection of specific third-party material."))

# 3
story.append(P("3. Term; Quarterly Review", heading_style))
story.append(P(
    "<b>3.1 Term.</b> This Agreement begins on the Effective Date and continues until terminated in "
    "accordance with Section 13 (the \"Term\")."))
story.append(P(
    "<b>3.2 Quarterly review.</b> The Parties will meet at least once each calendar quarter to review the "
    "Contractor's performance against the Monthly Deliverables, the scope of the Services, the compensation "
    "in Section 4, and the Milestone Equity structure in Section 5. Any change to this Agreement requires a "
    "written amendment signed by both Parties. Neither Party is obligated to agree to any change, and the "
    "absence or timing of any review does not affect either Party's rights under this Agreement."))

# 4
story.append(P("4. Compensation", heading_style))
story.append(P(
    "<b>4.1 Monthly Fee.</b> Subject to Section 6, the Company will pay the Contractor <b>eight hundred "
    "dollars ($800.00)</b> per calendar month (the \"Monthly Fee\"), payable in arrears within ten (10) "
    "days after the end of each calendar month for which it is earned. The Monthly Fee for any partial "
    "month is prorated."))
story.append(P(
    "<b>4.2 Brand Deal Revenue share.</b> The Company will pay the Contractor <b>fifty percent (50%)</b> "
    "of Brand Deal Revenue. \"Brand Deal Revenue\" means amounts actually received by the Company from "
    "third-party sponsorship, advertising, brand partnership, or paid collaboration agreements approved and "
    "contracted by the Company (each, a \"Brand Deal\") that either (a) the Contractor sourced and "
    "introduced to the Company, or (b) directly involve the Contractor's work, meaning the Contractor "
    "personally creates, appears in, or delivers the sponsored content or appearance. Brand Deals that the "
    "Contractor neither sourced nor personally performs are not shared. Where a Brand Deal includes elements "
    "beyond the Contractor's work or spans multiple Brand accounts or Company properties, the Company will "
    "allocate the revenue &mdash; and any related refund, reversal, clawback, or chargeback &mdash; among "
    "the elements reasonably and in good faith using objective factors where practicable (such as "
    "contracted deliverables, impressions, or element-specific pricing). The allocation will be shown on the "
    "statement under Section 4.4 and is binding absent manifest error."))
story.append(P(
    "<b>4.3 Brand Deals through the Company.</b> All Brand Deals are contracted through the Company. The "
    "Contractor will refer all sponsorship and partnership inquiries to the Company and will not enter "
    "into, or post content under, any sponsorship or paid promotion without the Company's prior written "
    "approval. The Contractor has no authority to bind the Company to any Brand Deal."))
story.append(P(
    "<b>4.4 Collection; payment; statements.</b> All Brand Deal Revenue and Qualifying Revenue is collected "
    "exclusively into accounts owned and controlled by the Company. Within fifteen (15) days after the end "
    "of each calendar month, the Company will pay the Contractor's share of Brand Deal Revenue actually "
    "received in that month, accompanied by a statement showing the amounts received, any allocations, the "
    "calculation of the Contractor's share, and Cumulative Qualifying Revenue under Section 5. Amounts are "
    "calculated net of platform fees, payment-processing fees, and any refunds or chargebacks. If a "
    "counterparty claws back, reverses, or reduces a payment, the corresponding share may be deducted from "
    "the next payment(s) to the Contractor, limited to the portion previously allocated to the Contractor. "
    "No separate invoice, time sheet, or list of services is required from the Contractor for the "
    "Company's calculation or payment of compensation under this Agreement."))
story.append(P(
    "<b>4.5 Records.</b> The Company will keep reasonable records of Brand Deal Revenue and Qualifying "
    "Revenue and, on the Contractor's reasonable request (no more than twice per year), will make available "
    "documentation reasonably necessary to verify the Contractor's share and Cumulative Qualifying Revenue. "
    "This Section does not entitle the Contractor to review Company-wide financial information, other "
    "contractors' compensation, or sponsor information unrelated to the Contractor."))
story.append(P(
    "<b>4.6 Taxes.</b> The Contractor is an independent contractor and is responsible for all taxes on "
    "amounts paid or equity issued under this Agreement. The Company may require a completed IRS Form W-9 "
    "before making payments."))
story.append(P(
    "<b>4.7 Sole compensation.</b> The Monthly Fee, the Brand Deal Revenue share, and the Milestone Equity "
    "are the Contractor's sole compensation under this Agreement. No base salary, benefits, minimum "
    "payment, or expense reimbursement is owed unless separately agreed in writing or required by "
    "applicable law. Revenue from Premium Offering subscriptions, events, or other sources is not shared "
    "with the Contractor except as expressly stated in Section 4.2; such revenue counts only toward "
    "Qualifying Revenue under Section 5."))

# 5
story.append(P("5. Milestone Equity", heading_style))
story.append(P(
    "<b>5.1 Milestone Equity.</b> Subject to this Section 5, when Cumulative Qualifying Revenue first "
    "reaches each threshold in the table below while the Contractor is actively performing the Services in "
    "good standing, the Company will issue to the Contractor non-voting membership interests in the Company "
    "(\"Milestone Units\") representing the corresponding percentage (each threshold, a \"Milestone\"):"))
eq = Table([
    ["Milestone (Cumulative Qualifying Revenue)", "Milestone Units issued", "Cumulative total"],
    ["$25,000", "1.00%", "1.00%"],
    ["$60,000", "1.50%", "2.50%"],
    ["$110,000", "1.25%", "3.75%"],
    ["$175,000", "1.25%", "5.00%"],
], colWidths=[3.0 * inch, 1.7 * inch, 1.6 * inch])
eq.setStyle(GRID)
story.append(eq); story.append(Spacer(1, 6))
story.append(P(
    "Each percentage is measured against the Company's fully diluted membership interests as of the "
    "applicable issuance date and, once issued, is subject to dilution on the same basis as all other "
    "members. The aggregate Milestone Units issuable under this Agreement will not exceed five percent (5%)."))
story.append(P(
    "<b>5.2 Qualifying Revenue.</b> \"Qualifying Revenue\" means gross amounts actually received by the "
    "Company, net of refunds, chargebacks, and platform and payment-processing fees, that the Contractor "
    "directly generated, consisting of: (a) all Brand Deal Revenue; (b) revenue from events that the "
    "Contractor sourced or for which the Contractor was the principal driver; (c) subscription revenue "
    "from the Premium Offering attributable to subscribers the Contractor specifically drove, as tracked "
    "through a Company-provided referral link, promo code, or other documented attribution method; and "
    "(d) any other revenue the Contractor demonstrably brought to the Company, as reasonably determined by "
    "the Company in good faith based on documented attribution. Qualifying Revenue is counted once, before "
    "deduction of the Contractor's share under Section 4.2, and accumulates across the Term (the running "
    "total, \"Cumulative Qualifying Revenue\"). The Company will report Cumulative Qualifying Revenue on "
    "the monthly statement under Section 4.4, and that report is binding absent manifest error."))
story.append(P(
    "<b>5.3 No time limit; good-standing condition.</b> There is no deadline to reach any Milestone. "
    "However, a Milestone is reached only if, at the time Cumulative Qualifying Revenue first equals or "
    "exceeds the threshold, the Contractor is actively performing the Services and is not in material "
    "breach of this Agreement or subject to an uncured Shortfall Notice under Section 6. If the Contractor "
    "is in material breach or under an uncured Shortfall Notice at that time, the Milestone is deferred "
    "until the breach or shortfall is cured to the Company's reasonable satisfaction; if this Agreement "
    "terminates before cure, the deferred Milestone is forfeited."))
story.append(P(
    "<b>5.4 Issuance mechanics.</b> Within sixty (60) days after a Milestone is reached, the Company will "
    "issue the corresponding Milestone Units, conditioned on the Contractor's execution of a joinder to "
    "the Company's operating agreement (as amended from time to time, the \"Operating Agreement\") and "
    "such other customary documents as the Company reasonably requires, and on compliance with applicable "
    "securities laws. The Company may structure Milestone Units as profits interests or another class of "
    "non-voting economic interest in its reasonable discretion."))
story.append(P(
    "<b>5.5 Nature of Milestone Units.</b> Milestone Units are non-voting and carry no management, "
    "consent, approval, or information rights other than those the Operating Agreement expressly grants "
    "to holders of that class. They are subject in all respects to the Operating Agreement, including "
    "transfer restrictions, drag-along and tag-along provisions, and any repurchase rights, and to the "
    "rights of any senior classes of interests. Until Milestone Units are actually issued, the Contractor "
    "has no rights as a member of the Company; this Section 5 creates a contractual right to future "
    "issuance only, not a present grant of any interest."))
story.append(P(
    "<b>5.6 Tax matters.</b> The Contractor is solely responsible for all tax consequences of the Milestone "
    "Units, may make an election under Section 83(b) of the Internal Revenue Code at the Contractor's own "
    "discretion and expense, and acknowledges that the Company makes no representation regarding tax "
    "treatment."))
story.append(P(
    "<b>5.7 Termination and change of control.</b> On termination of this Agreement for any reason: "
    "(a) Milestone Units already issued are retained by the Contractor, subject to the Operating Agreement; "
    "and (b) all Milestones not yet reached terminate, except that Qualifying Revenue received during the "
    "Tail Period (Section 13.4) counts toward the next Milestone and, if that Milestone is thereby reached, "
    "the corresponding Milestone Units will be issued notwithstanding the termination. If a sale of all or "
    "substantially all of the Company's assets or equity, or a merger in which the Company is not the "
    "surviving entity, occurs, all Milestones not yet reached terminate unless assumed by the acquirer."))
story.append(P(
    "<b>5.8 No other rights.</b> Except as expressly provided in this Section 5, the Contractor has no "
    "right to any equity, profits interest, option, or other ownership interest in the Company or the Brand."))

# 6
story.append(P("6. Performance Is a Condition of Payment and Equity", heading_style))
story.append(P(
    "<b>6.1 Condition.</b> The Company is engaging the Contractor to perform the Monthly Deliverables and "
    "the Services, and the Monthly Fee, the Brand Deal Revenue share, and the Milestone Equity are "
    "consideration for actually performing them. <b>The Monthly Fee for a month is earned only if the "
    "Contractor substantially performs the Monthly Deliverables for that month. Milestone Equity is earned "
    "only while the Contractor is actively performing the Services in good standing (Section 5.3).</b>"))
story.append(P(
    "<b>6.2 Shortfall.</b> If the Contractor fails to substantially perform the Monthly Deliverables in any "
    "month, the Company may, on written notice identifying the shortfall (a \"Shortfall Notice\") and in "
    "its reasonable discretion: (a) reduce that month's Monthly Fee in proportion to the Monthly "
    "Deliverables not performed; (b) withhold that month's Monthly Fee entirely where the shortfall is "
    "material &mdash; including missed live sessions, missed or late picks deliveries, missed team syncs, "
    "or sustained inactivity in the Discord community or on the Managed Accounts; and/or (c) terminate "
    "this Agreement under Section 13.1. The Brand Deal Revenue share under Section 4.2 is not affected by a "
    "Shortfall Notice except as to any Brand Deal the Contractor failed to perform."))
story.append(P(
    "<b>6.3 Excused non-performance.</b> Documented illness, family emergency, or time off approved in "
    "advance in writing by the Company will not be treated as a shortfall, and the Parties will reasonably "
    "adjust the affected Monthly Deliverables."))
story.append(P(
    "<b>6.4 No waiver.</b> Payment of a Monthly Fee, or the absence of a Shortfall Notice, in any month is "
    "not a waiver of the Company's rights under this Section 6 for any other month."))
story.append(P(
    "<b>6.5 Acknowledgment.</b> The Contractor acknowledges that the Company's rights under this Section 6 "
    "and its right to terminate at any time under Section 13.1 are fundamental terms of this Agreement, "
    "without which the Company would not have entered into it."))

# 7
story.append(P("7. Name, Image, and Likeness", heading_style))
story.append(P(
    "<b>7.1 License.</b> The Contractor grants the Company a worldwide, royalty-free, sublicensable license "
    "to use the Contractor's name, image, likeness, voice, signature, social media handles, and "
    "biographical information (collectively, \"Likeness\") in and in connection with the Content, the "
    "Brand, and the Company's advertising, marketing, and promotion, in all media now known or later "
    "developed, during the Term. The compensation in Section 4 fully compensates the Contractor for this "
    "license."))
story.append(P(
    "<b>7.2 Post-Term use.</b> After the Term, the Company may continue to use, display, distribute, and "
    "exploit all Content and advertising created during the Term that incorporates the Contractor's "
    "Likeness, including in paid campaigns then running or that reuse existing creative, without further "
    "compensation; provided that the Company will not create new Content featuring the Contractor's "
    "Likeness after the Term other than archival, historical, or factual references. The Contractor is not "
    "entitled to require removal of Content published during the Term."))
story.append(P(
    "<b>7.3 Waiver.</b> To the fullest extent permitted by law, the Contractor waives any right to inspect "
    "or approve uses consistent with this Section 7, and any claim (including for rights of publicity, "
    "privacy, or moral rights) arising from such uses."))

# 8
story.append(P("8. Ownership of Content and Work Product", heading_style))
story.append(P(
    "<b>8.1 Company ownership.</b> All content the Contractor creates for the Brand under this Agreement "
    "&mdash; including posts, videos, live-session recordings, picks, write-ups, analysis, advertising "
    "concepts and hooks, and all other deliverables developed specifically for the Company (collectively, "
    "\"Content\"), together with related frameworks, systems, documentation, and all improvements and "
    "derivative works (with the Content, \"Work Product\") &mdash; is owned exclusively by the Company. "
    "The Contractor hereby irrevocably assigns to the Company all right, title, and interest in and to all "
    "Work Product, effective upon creation; in addition, to the extent any Work Product qualifies as a "
    "work made for hire under applicable copyright law, it is owned by the Company as such. The Contractor "
    "will execute any documents reasonably requested by the Company to confirm the foregoing."))
story.append(P(
    "<b>8.2 Background materials.</b> The Contractor retains ownership of pre-existing know-how, skills, "
    "general experience, and handicapping methods of general applicability developed outside of and not "
    "specifically for this engagement. To the extent any such materials are incorporated into Work "
    "Product, the Contractor grants the Company a perpetual, irrevocable, royalty-free license to use them "
    "as part of that Work Product. The Contractor may reference the engagement and non-confidential results "
    "in the Contractor's own portfolio and professional materials."))
story.append(P(
    "<b>8.3 The Brand.</b> Nothing in this Agreement transfers any interest in the Brand to the Contractor, "
    "and the Contractor will not register, claim, or assert any right in the Brand or any confusingly "
    "similar name, handle, or mark, during or after the Term."))

# 9
story.append(P("9. Account Access and Security", heading_style))
story.append(P(
    "<b>9.1 Company Accounts.</b> The Managed Accounts and every other Company account, platform, or "
    "system to which the Contractor is given access (including the Discord server, the Premium Offering "
    "platform, and any advertising accounts) (collectively, \"Company Accounts\") are the sole property of "
    "the Company. The Contractor receives only a limited, revocable, non-transferable right of access "
    "solely to perform the Services, and acquires no ownership, possessory, audience, goodwill, "
    "monetization, or other interest in any Company Account."))
story.append(P(
    "<b>9.2 Safeguarding.</b> The Contractor will keep all credentials strictly confidential, will not "
    "share them with any third party, and will use the Company Accounts only to perform the Services."))
story.append(P(
    "<b>9.3 Account integrity.</b> The Contractor will not, without the Company's prior written consent: "
    "(a) change any Company Account's password, linked email address, phone number, two-factor "
    "authentication settings, or linked payout or monetization settings; (b) transfer, sell, rename, "
    "deactivate, or delete any Company Account; (c) lock or restrict the Company's access to any Company "
    "Account; or (d) take any other action intended to harm a Company Account, its audience, or its "
    "monetization eligibility. The Company may change credentials at any time."))
story.append(P(
    "<b>9.4 Emergency suspension.</b> The Company may immediately suspend the Contractor's access to any "
    "Company Account if the Company reasonably believes that continued access presents a security risk, a "
    "risk of loss of or damage to an account, a risk of significant reputational harm to the Brand, or "
    "unauthorized use of Company assets. The Company will promptly notify the Contractor of the suspension "
    "and its reason. A suspension does not by itself terminate this Agreement; Monthly Deliverables that a "
    "suspension not caused by the Contractor's breach makes impossible are excused for its duration and "
    "will not be treated as a shortfall under Section 6."))
story.append(P(
    "<b>9.5 Liquidated damages for account misappropriation.</b> The Parties agree that each Managed "
    "Account is a uniquely valuable Company asset whose loss would cause harm that is real and substantial "
    "but difficult to quantify precisely. If the Contractor materially breaches Section 9.3 &mdash; "
    "including by changing credentials to exclude the Company, transferring or attempting to transfer an "
    "account, or otherwise misappropriating it &mdash; the Contractor will immediately restore the "
    "Company's full access and control upon notice. If full access and control are not restored within "
    "forty-eight (48) hours of notice, or an account is lost, transferred, or destroyed as a result of such "
    "a breach, the Contractor will pay the Company, as liquidated damages for each affected account, the "
    "amount specified on Exhibit A or, if none is specified, the amount determined by the account's "
    "follower count at the time of the breach: <b>$2,500.00</b> if fewer than 1,000 followers; "
    "<b>$10,000.00</b> if at least 1,000 but fewer than 10,000; <b>$25,000.00</b> if at least 10,000 but "
    "fewer than 50,000; and <b>$50,000.00</b> if 50,000 or more. Any Exhibit A amount may be changed only "
    "by mutual written agreement before any breach. The Parties agree the applicable amount is a genuine "
    "and reasonable pre-estimate of the Company's minimum probable loss, scaled to objective "
    "characteristics of the account existing before the breach, and is not a penalty. This Section does "
    "not limit the Company's right to injunctive or other equitable relief to recover an account, and does "
    "not apply to ordinary content decisions made in good faith, actions taken at the Company's direction, "
    "or events outside the Contractor's reasonable control. The 48-hour restoration period applies only to "
    "this liquidated-damages remedy and does not limit suspension under Section 9.4 or termination under "
    "Section 13.1."))
story.append(P(
    "<b>9.6 Return of Company property.</b> Upon termination of this Agreement, or upon the Company's "
    "earlier request, the Contractor will cease using the Company Accounts; confirm that no credentials or "
    "settings have been changed; and promptly return to the Company, or at the Company's election "
    "permanently delete and confirm deletion of, all Company property and Confidential Information in the "
    "Contractor's possession or control, including credentials, media assets, drafts and unpublished "
    "content, picks records, analytics exports, subscriber data, and internal documents."))

# 10
story.append(P("10. Independent Contractor", heading_style))
story.append(P(
    "The Contractor is an independent contractor, not an employee, partner, joint venturer, or agent of "
    "the Company. The Brand Deal Revenue share and the Milestone Equity are compensation mechanisms only "
    "and, except for Milestone Units actually issued under Section 5, create no partnership, ownership, or "
    "profit interest in the Company or the Brand. The Contractor controls the manner and means of "
    "performing the Services and, except for scheduled live sessions, team syncs, and picks delivery "
    "deadlines that are themselves Monthly Deliverables, the time and place of performance; may use the "
    "Contractor's own equipment; and is not entitled to employee benefits. Subject to Section 2.6, nothing "
    "in this Agreement restricts the Contractor from providing services to others. Neither Party may bind "
    "the other except as expressly set out in this Agreement, and the Contractor has no authority to "
    "execute agreements on the Company's behalf, accept or negotiate sponsorships or advertising "
    "commitments, incur Company expenses, or make official statements for the Company. The Contractor "
    "represents that the Contractor is at least eighteen (18) years of age and has full legal capacity to "
    "enter into this Agreement."))

# 11
story.append(P("11. Confidentiality", heading_style))
story.append(P(
    "<b>11.1 Definition.</b> \"Confidential Information\" means all non-public information disclosed by or "
    "on behalf of one Party to the other in connection with this Agreement, including, in the case of the "
    "Company: credentials; business and strategic plans; sponsorship, advertising, and partnership "
    "relationships and terms; contractor and talent relationships and compensation terms; unpublished "
    "campaigns and content; picks methodology and unpublished picks; subscriber and customer data; "
    "advertising performance data; Discord, app, and website plans; analytics; growth and monetization "
    "strategies; financial information (including the terms of this Agreement and the Company's "
    "capitalization); and any other non-public Company information. Confidential Information does not "
    "include information that (a) is or becomes publicly available through no breach of this Agreement; "
    "(b) was lawfully known to the receiving Party before disclosure; (c) is lawfully received from a "
    "third party without confidentiality obligations; or (d) is independently developed without use of "
    "the disclosing Party's Confidential Information."))
story.append(P(
    "<b>11.2 Obligations.</b> Each Party will keep the other Party's Confidential Information confidential, "
    "will use it only for purposes of this Agreement, and will protect it with at least reasonable care. A "
    "Party may disclose Confidential Information to the extent required by law or court order, with prompt "
    "notice to the other Party where legally permitted. These obligations survive for three (3) years "
    "after this Agreement ends, except that obligations with respect to credentials, subscriber data, and "
    "trade secrets survive for as long as the information remains protected."))

# 12
story.append(P("12. Indemnification; Limitation of Liability", heading_style))
story.append(P(
    "<b>12.1 By the Contractor.</b> The Contractor will indemnify and hold harmless the Company and its "
    "affiliates and their respective members, managers, officers, employees, and agents from and against "
    "third-party claims, demands, proceedings, and investigations, and resulting losses, damages, "
    "judgments, settlements, and reasonable attorneys' fees and defense costs, to the extent arising from: "
    "(a) infringement or misappropriation of any third party's copyright (including in broadcasts, game "
    "footage, photographs, graphics, or music), trademark, publicity, likeness, privacy, or NIL-related "
    "rights by content the Contractor creates, selects, reposts, edits, or publishes; (b) unlawful, "
    "defamatory, or knowingly false content posted by the Contractor; (c) the Contractor's violation of "
    "FTC endorsement or disclosure rules, gambling-related advertising laws, or platform policies, or any "
    "misstatement of the Contractor's picks record; (d) any breach of the representations in Section 2.6; "
    "(e) the Contractor's material breach of this Agreement; or (f) the Contractor's negligence or willful "
    "misconduct. This Section does not apply to content created and posted solely by the Company, or to "
    "content the Contractor posts at the Company's specific written direction without material deviation."))
story.append(P(
    "<b>12.2 By the Company.</b> The Company will indemnify and hold harmless the Contractor from and "
    "against third-party claims, and resulting losses, damages, and reasonable attorneys' fees, to the "
    "extent arising solely from materials provided by the Company or content posted at the Company's "
    "specific written direction."))
story.append(P(
    "<b>12.3 Procedure.</b> The indemnified Party will give prompt notice of any claim, reasonable "
    "cooperation, and control of the defense and settlement to the indemnifying Party; no settlement "
    "imposing obligations on the indemnified Party may be made without its consent, not to be unreasonably "
    "withheld."))
story.append(P(
    "<b>12.4 Limitation of liability.</b> Except for the Company's payment and issuance obligations under "
    "Sections 4 and 5, the Company's aggregate liability arising out of or relating to this Agreement will "
    "not exceed the total amounts paid and payable to the Contractor under this Agreement in the six (6) "
    "months preceding the event giving rise to the claim, and the Company will not be liable for indirect, "
    "incidental, special, consequential, or exemplary damages or for lost profits or opportunities. This "
    "Section does not limit the Contractor's obligations or liability under Section 9.5, Section 11, or "
    "Section 12.1, or the Contractor's liability for fraud, willful misconduct, or misappropriation of any "
    "Company Account or the Brand. Notwithstanding the foregoing, the Contractor's aggregate liability for "
    "indemnified claims arising solely from the Contractor's ordinary negligence &mdash; and not from "
    "knowing, intentional, fraudulent, or willful conduct or a breach of Section 9.3 or Section 11 &mdash; "
    "will not exceed the greater of (i) the total amounts paid and payable to the Contractor under this "
    "Agreement in the twelve (12) months preceding the claim and (ii) twenty-five thousand dollars "
    "($25,000.00)."))

# 13
story.append(P("13. Termination", heading_style))
story.append(P(
    "<b>13.1 By the Company.</b> The Company may terminate this Agreement at any time, for any reason or "
    "for no reason, by written notice to the Contractor (email is sufficient), effective immediately or on "
    "any later date the notice states."))
story.append(P(
    "<b>13.2 By the Contractor.</b> The Contractor may terminate this Agreement for any reason on fourteen "
    "(14) days' written notice."))
story.append(P(
    "<b>13.3 Effect of termination.</b> Upon termination: (a) the Company will pay the Monthly Fee earned "
    "and prorated through the termination date, subject to Section 6; (b) the Company will pay the Brand "
    "Deal Revenue share on amounts received through the termination date and during the Tail Period, on "
    "the normal schedule; (c) Milestones are governed by Section 5.7; (d) the Contractor will comply with "
    "Section 9.6; and (e) Section 7.2 governs use of the Contractor's Likeness. If the Company terminates "
    "following a Shortfall Notice or for the Contractor's material breach, the Company retains all other "
    "rights and remedies available under this Agreement and applicable law."))
story.append(P(
    "<b>13.4 Tail Period.</b> The \"Tail Period\" is the sixty (60) days following the termination date. "
    "Brand Deal Revenue received during the Tail Period from Brand Deals contracted before the termination "
    "date is shared under Section 4.2 and counts as Qualifying Revenue. No share is owed on Brand Deals "
    "contracted after the termination date or on revenue received after the Tail Period."))
story.append(P(
    "<b>13.5 Transition assistance.</b> For up to thirty (30) days after termination, the Contractor will "
    "provide reasonable incidental cooperation to facilitate an orderly handover, limited to returning or "
    "transferring drafts, scheduled content, picks records, Company files, and outstanding campaign "
    "information; answering reasonable questions; and confirming account settings. This does not require "
    "continued content creation or handicapping after termination."))
story.append(P(
    "<b>13.6 Survival.</b> Sections 5.5 through 5.8, 7, 8, 9.5, 9.6, 11, 12, 13.3 through 13.6, and 14 "
    "survive termination."))

# 14
story.append(P("14. General", heading_style))
story.append(P("<b>14.1 Governing law.</b> This Agreement is governed by the laws of the State of New York, "
               "without regard to conflict-of-laws rules."))
story.append(P(
    "<b>14.2 Dispute resolution.</b> Before filing any action, the Parties will first attempt in good faith "
    "to resolve any dispute arising out of this Agreement through direct negotiation for at least fifteen "
    "(15) days after written notice of the dispute. If negotiation fails, the Parties will submit the "
    "dispute to non-binding mediation before a mutually agreed mediator, with the mediator's costs shared "
    "equally. If the dispute is not resolved within thirty (30) days after mediation begins (or a Party "
    "refuses to mediate), either Party may bring the dispute exclusively in the state or federal courts "
    "located in the State of New York, and each Party consents to the personal jurisdiction and venue of "
    "those courts. Nothing in this Section prevents either Party from seeking urgent injunctive relief in "
    "those courts at any time (including under Sections 7, 8, and 9)."))
story.append(P(
    "<b>14.3 Entire agreement; amendments.</b> This Agreement (including Exhibit A) is the entire agreement "
    "between the Parties regarding its subject matter and supersedes all prior discussions, proposals, and "
    "term sheets, whether written or oral. It may be amended only in a writing signed by both Parties."))
story.append(P(
    "<b>14.4 Assignment.</b> Neither Party may assign this Agreement without the other Party's written "
    "consent, except that the Company may assign it without consent to a successor in connection with a "
    "merger, acquisition, or sale of all or substantially all of its assets."))
story.append(P(
    "<b>14.5 Notices.</b> Notices may be given by email to the addresses the Parties customarily use to "
    "communicate with each other, and are effective when sent absent a bounce or error message."))
story.append(P(
    "<b>14.6 Severability; waiver.</b> If any provision of this Agreement is held unenforceable, it will be "
    "modified to the minimum extent necessary to make it enforceable, and the remainder will remain in "
    "effect. A Party's failure to enforce any provision is not a waiver of it. Nothing in this Agreement "
    "waives, or requires the Contractor to waive, any right that cannot be waived under applicable law."))
story.append(P(
    "<b>14.7 Counterparts; electronic signatures.</b> This Agreement may be signed in counterparts, and "
    "electronic signatures are valid and binding."))

story.append(Spacer(1, 10))
story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#999999"), spaceAfter=10))
story.append(P("IN WITNESS WHEREOF, the Parties have executed this Agreement as of the Effective Date set "
               "forth on Exhibit A."))
story.append(Spacer(1, 18))

def sig(compact=False):
    gap = 26 if compact else 30
    rows = [
        [Paragraph("<b>JGN MEDIA LLC</b> (d/b/a Nosebleed Sports)", sig_style), Paragraph("<b>CONTRACTOR</b>", sig_style)],
        [Spacer(1, gap), Spacer(1, gap)],
        [Paragraph("Signature: _______________________________", sig_style),
         Paragraph("Signature: _______________________________", sig_style)],
        [Spacer(1, 12), Spacer(1, 12)],
        [Paragraph("Name: Nicholas Restivo", sig_style), Paragraph("Name: %s" % (CONTRACTOR_NAME or "____________________________"), sig_style)],
    ]
    if not compact:
        rows += [[Spacer(1, 12), Spacer(1, 12)],
                 [Paragraph("Title: Chief Executive Officer", sig_style), Paragraph("Title: Independent Contractor", sig_style)],
                 [Spacer(1, 12), Spacer(1, 12)],
                 [Paragraph("Date: _______________________", sig_style), Paragraph("Date: _______________________", sig_style)]]
    t = Table(rows, colWidths=[3.15 * inch, 3.15 * inch])
    t.setStyle(TableStyle([("VALIGN", (0, 0), (-1, -1), "TOP"), ("LEFTPADDING", (0, 0), (-1, -1), 0),
                           ("RIGHTPADDING", (0, 0), (-1, -1), 12)]))
    return t

story.append(sig())

# Exhibit A
story.append(PageBreak())
story.append(P("EXHIBIT A", title_style))
story.append(P("Engagement Terms", subtitle_style))
story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#999999"), spaceAfter=12))
rows = [
    ["Effective Date", EFFECTIVE_DATE],
    ["Contractor (full legal name)", CONTRACTOR_NAME],
    ["Contractor mailing address", CONTRACTOR_ADDRESS],
    ["Contractor phone", CONTRACTOR_PHONE],
    ["Contractor email", CONTRACTOR_EMAIL],
    ["Managed Account 1", TIKTOK_HANDLE],
    ["Managed Account 2", INSTAGRAM_HANDLE],
    ["Minimum posting volume", "3 original posts per day on each Managed Account"],
    ["Monthly Fee", MONTHLY_FEE],
    ["Brand Deal Revenue share", BRAND_DEAL_SHARE],
    ["Milestone Equity", EQUITY_SUMMARY],
    ["Liquidated damages amount (Section 9.5)", LIQUIDATED_DAMAGES],
    ["Payment method", PAYMENT_METHOD],
]
ex = Table(rows, colWidths=[2.9 * inch, 3.4 * inch], rowHeights=[0.42 * inch] * len(rows))
ex.setStyle(TableStyle([
    ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"), ("FONTNAME", (1, 0), (1, -1), "Helvetica"),
    ("FONTSIZE", (0, 0), (-1, -1), 9.5), ("BACKGROUND", (0, 0), (0, -1), colors.HexColor("#EFEFEF")),
    ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#BBBBBB")), ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ("LEFTPADDING", (0, 0), (-1, -1), 8),
]))
story.append(ex); story.append(Spacer(1, 10))
story.append(P("This Exhibit A is incorporated into and forms part of the Talent, Handicapping, and Content "
               "Services Agreement between JGN Media LLC and the Contractor named above. In the event of a "
               "conflict between this Exhibit and the body of the Agreement, the body of the Agreement controls."))
story.append(Spacer(1, 16))
story.append(sig(compact=True))

doc = SimpleDocTemplate(OUT, pagesize=letter, leftMargin=0.9 * inch, rightMargin=0.9 * inch,
                        topMargin=0.8 * inch, bottomMargin=0.8 * inch,
                        title="Talent, Handicapping, and Content Services Agreement — JGN Media LLC",
                        author="JGN Media LLC")
doc.build(story)
print("Wrote", OUT)
