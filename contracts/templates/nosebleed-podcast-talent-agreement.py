#!/usr/bin/env python3
# TEMPLATE — public repository copy. Names, EIN and JGN ownership are placeholders; fill from the
# private master record before generating a signing copy. Never commit a filled copy.
"""Podcast, Handicapping, and Content Services Agreement - JGN Media LLC + Nosebleed Sports LLC
(Delaware) / [Contractor].

Adapted from make_brock_smith.py. Pure revenue share: no monthly fee, no equity.
Section numbering is 1-13 (Brock's Section 5 equity block is deleted and everything after it
is renumbered down by one).
"""

import os
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib.enums import TA_CENTER
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable, PageBreak, KeepTogether
)

OUT = os.environ.get("OUT_PDF", os.path.join(os.path.dirname(os.path.abspath(__file__)),
                                             "Nosebleed_Podcast_Talent_Agreement.pdf"))

# ---------------------------------------------------------------------------
# FAIRNESS SWITCH
#
# False: the Contractor shares only in (i) Brand Deals he sourced or
#   referred and (ii) Podcast Revenue.  A Brand Deal the COMPANY sold that he merely performs is
#   NOT Shared Revenue unless the money is Podcast Revenue.
# True (THE DEAL, set 2026-09-18): adds limb (d) - any Brand Deal he personally creates, appears
#   in, or delivers is shared, however it was sourced. A casino stream the Company sells and hands
#   him to host is part of the 50/50.
# ---------------------------------------------------------------------------
SHARE_PERFORMED_DEALS = True
if os.environ.get("SHARE_PERFORMED_DEALS"):
    SHARE_PERFORMED_DEALS = os.environ["SHARE_PERFORMED_DEALS"].strip().lower() in ("1", "true", "yes", "on")

# ---- Exhibit A values ----
EFFECTIVE_DATE         = ""
CONTRACTOR_NAME        = ""
CONTRACTOR_ADDRESS     = ""
CONTRACTOR_PHONE       = ""
CONTRACTOR_EMAIL       = ""
MANAGED_ACCOUNTS       = ("The Nosebleed Gambling podcast, its feeds, show listings, channels and "
                          "social media accounts on every platform, and any other account, channel, "
                          "feed, profile or destination a Company Party creates, owns or controls and "
                          "designates for the podcast or for the Contractor's streams from time to "
                          "time. No account the Contractor owns or controls is a Managed Account "
                          "(Section 2.1(a))")
PODCAST_MINIMUM        = "two (2) episodes per calendar week"
REV_SHARE              = "fifty percent (50%)"
REV_SHARE_SUMMARY      = "50% of Shared Revenue (Section 4.1)"
LIQUIDATED_DAMAGES     = "$_________ (blank = Section 8.5 tiers apply)"
COMPANY_NOTICE_EMAIL   = "______________________"
PAYMENT_METHOD         = ("Select one at signing and initial:  [ ] Zelle   [ ] wire transfer   "
                          "[ ] PayPal.  Account, handle or routing details: ______________________ "
                          "(or such other method as the Parties agree in writing). If no box is checked, "
                          "payment is made by Zelle to the Contractor email stated above, or to such "
                          "other Zelle-enrolled email address or mobile number as the Contractor "
                          "provides in writing. If a payment by the default method is returned or "
                          "cannot be delivered, the Company will notify the Contractor within two (2) "
                          "business days and the Parties will agree on an alternative method promptly; "
                          "a payment is timely if initiated by the date stated in Section 4.3")

styles = getSampleStyleSheet()
title_style = ParagraphStyle("T", parent=styles["Title"], fontName="Helvetica-Bold",
                             fontSize=15, leading=19, alignment=TA_CENTER, spaceAfter=2)
subtitle_style = ParagraphStyle("S", parent=styles["Normal"], fontName="Helvetica", fontSize=10.5,
                                leading=14, alignment=TA_CENTER, textColor=colors.HexColor("#444444"), spaceAfter=10)
heading_style = ParagraphStyle("H", parent=styles["Heading2"], fontName="Helvetica-Bold", fontSize=11.5,
                               leading=15, spaceBefore=13, spaceAfter=5, textColor=colors.HexColor("#111111"))
body_style = ParagraphStyle("B", parent=styles["Normal"], fontName="Helvetica", fontSize=10, leading=14.5, spaceAfter=7,
                            allowWidows=0, allowOrphans=0)
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
story.append(P("PODCAST, HANDICAPPING, AND CONTENT SERVICES AGREEMENT", title_style))
story.append(P("Nosebleed Gambling &mdash; Independent Contractor Services", subtitle_style))
story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#999999"), spaceAfter=12))

story.append(P('This Podcast, Handicapping, and Content Services Agreement (this "Agreement") is entered '
               'into as of the Effective Date set forth on Exhibit A by and among:'))
story.append(B('<bullet>&bull;</bullet><b>JGN Media LLC</b>, a New York limited liability company with a mailing '
               'address of 105 Broadway, Rockville Centre, New York 11570 ("JGN");'))
story.append(B('<bullet>&bull;</bullet><b>Nosebleed Sports LLC</b>, a Delaware limited liability company with a '
               'mailing address of 105 Broadway, Rockville Centre, New York 11570 ("NSL" and, together with JGN, '
               'the "Company," each a "Company Party"); and'))
story.append(B('<bullet>&bull;</bullet><b>[Contractor]</b>, the individual identified on Exhibit A (the "Contractor").'))
story.append(P('The Company and the Contractor may each be referred to as a "Party" and together as the "Parties." '
               'Obligations of "the Company" under this Agreement are obligations of both Company Parties; the '
               'Company Parties may designate between themselves which of them performs any payment or other '
               'obligation, and notice or consent given by either Company Party is effective for the Company.'))

# ---------------------------------------------------------------- 1
story.append(P("1. Purpose; the Brand; the Platform", heading_style))
story.append(P(
    "JGN owns and operates the \"Nosebleed Sports\" sports media brand, including the \"Nosebleed Gambling\" "
    "podcast and that show's name, podcast feeds, video channels, and social media accounts, together with "
    "all related names, logos, content, audiences, and goodwill (collectively, the \"Brand\"). NSL owns and "
    "operates the Nosebleed Sports mobile application, website, and Discord community, and the Company's "
    "premium picks offering (the \"Premium Offering\") (collectively, the \"Platform\"). The Company wishes "
    "to engage the Contractor to produce and appear on the Nosebleed Gambling podcast, to appear on Company "
    "live streams, to provide handicapping for the Premium Offering when called on, to host sponsored "
    "gambling streams, and to support the Brand and the Platform in the Discord community, and the "
    "Contractor wishes to provide those services, on the terms set out in this Agreement."))

# ---------------------------------------------------------------- 2
story.append(P("2. Services", heading_style))
story.append(P(
    "<b>2.1 Monthly Deliverables.</b> The Contractor will provide the following services (the \"Services\"). "
    "Items (a) through (f) are the \"Monthly Deliverables\" for each calendar month during the Term:"))
story.append(B("<bullet>(a)</bullet><b>Podcast.</b> Produce and appear on at least <b>two (2) episodes per "
               "calendar week</b> of the Nosebleed Gambling podcast, published on the Company's podcast "
               "feeds and show listings, the Company's video and audio channels, and the Nosebleed Gambling "
               "social media accounts, on the Company's schedule and in the Company's format. The "
               "<b>\"Managed Accounts\"</b> are all of the foregoing feeds, listings, channels and accounts on "
               "every platform, together with any other account, channel, feed, profile or destination that a "
               "Company Party creates, owns, or controls and designates for the podcast or for the "
               "Contractor's streams from time to time. No account, channel, feed or profile owned or "
               "controlled by the Contractor is a Managed Account or a Company Account, and nothing in this "
               "Agreement gives either Company Party any interest in, or control over, any such account. The "
               "Company may add, move, rename, consolidate or retire any of them at any time, and the "
               "Contractor's obligations follow the podcast to wherever the Company publishes it."))
story.append(B("<bullet>(b)</bullet><b>Live streams.</b> Join the Company's live streams on Discord, "
               "YouTube, TikTok, Instagram, X, or any other platform or destination the Company uses or "
               "designates from time to time, as reasonably scheduled by the Company with reasonable "
               "advance notice. The Contractor may decline any individual live stream without the "
               "declined stream being a shortfall under Section 5, provided the Contractor joins at "
               "least eighty percent (80%) of the streams scheduled in a calendar month or, where fewer "
               "than five (5) streams are scheduled in that month, all but one of them. Streams the "
               "Contractor declines under Section 9.2 are excluded from this calculation."))
story.append(B("<bullet>(c)</bullet><b>Handicapping on call.</b> When the Company requests, deliver picks "
               "with accompanying research write-ups, in the Company's system and format and on the "
               "Company's delivery schedule, for use in the Premium Offering, subject to Section 2.5. "
               "The Company will not request more than five (5) pick sets in any calendar week and will "
               "give at least twenty-four (24) hours' notice; the Contractor may decline any individual "
               "request without the declined request being a shortfall under Section 5."))
story.append(B("<bullet>(d)</bullet><b>Sponsored gambling streams.</b> Host live streams featuring casino "
               "or sportsbook operators on Discord or any other platform the Company designates, in each "
               "case only under a Brand Deal approved and contracted under Section 4.2 and subject to "
               "Section 2.9."))
story.append(B("<bullet>(e)</bullet><b>Community.</b> Maintain a regular and active presence in the Discord "
               "community, engaging members on sports betting as a Brand ambassador, and respond to team "
               "communications within a reasonable time, ordinarily within one (1) business day."))
story.append(B("<bullet>(f)</bullet><b>Brand representation.</b> Throughout the Term, identify Nosebleed "
               "Gambling and Nosebleed Sports in the Contractor's personal social media bios, and represent "
               "the Brand professionally in public."))
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
    "content; and (f) specify the format, cadence, and delivery deadlines for episodes, picks, and "
    "write-ups, without directing the manner, means, hours, or location of the Contractor's work. The "
    "Contractor will comply with such direction promptly, and compliance with the Company's direction is not "
    "a breach of this Agreement by the Contractor."))
story.append(P(
    "<b>2.4 Prohibited conduct.</b> The Contractor will not: (a) purchase followers or engagement, or use "
    "bots, engagement pods, or other artificial engagement methods; (b) post content that infringes any "
    "third party's copyright, trademark, or other intellectual-property or publicity rights; (c) post "
    "illegal, defamatory, or knowingly false material; (d) impersonate any person or entity or claim "
    "affiliation with or endorsement by any league, team, or rights holder without the Company's written "
    "authorization; (e) make endorsements or run paid or sponsored promotions on any Company Account "
    "(Section 8.1), or in any content featuring the Brand or the Platform, except through a Brand Deal "
    "approved under Section 4.2, or violate FTC endorsement and disclosure rules; (f) violate platform "
    "terms of service in a manner that places any Company Account at risk; or (g) engage in conduct "
    "reasonably likely to bring the Brand, the Platform, or the Company into public disrepute, recognizing "
    "that the Contractor is a public face of the Brand. Clauses (a) through (f) apply to the Contractor's "
    "activity on Company Accounts and to any content that features or references the Brand or the "
    "Platform. Clause (g) applies to the Contractor's conduct in public generally, and is limited to "
    "conduct that is criminal, violent, dishonest, or of a nature that would reasonably be expected to "
    "cause a sponsor or platform to terminate its relationship with the Company."))
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
    "affiliate offer through the Brand or the Platform without the Company's prior written approval, and "
    "disclose to the Company all affiliate, sponsorship, or compensation relationships with any sportsbook, "
    "betting operator, or picks service; and (g) not engage in any conduct relating to wagering or sports "
    "integrity that violates applicable law or league or platform rules."))
story.append(P(
    "<b>2.6 Category exclusivity; no other restriction on the Contractor.</b> During the Term, the "
    "Contractor will not, without the Company's prior written consent: (a) sell, publish, or provide "
    "handicapping picks or analysis through any paid picks service other than the Premium Offering; "
    "(b) serve as on-camera talent, podcast host, ambassador, or spokesperson for any other sports media, "
    "picks, or sports betting brand; or (c) publish, post, or distribute handicapping picks, betting "
    "selections, or wagering analysis for any game or event on any account or destination that is not a "
    "Company Account, other than (i) promotional excerpts the Company approves in writing and "
    "(ii) picks the Contractor prepared for the Premium Offering, republished on the Contractor's own "
    "accounts no earlier than the later of (A) the commencement of the event to which the pick relates "
    "and (B) forty-eight (48) hours after the pick was released to Premium Offering subscribers. The "
    "Company grants the Contractor a limited, non-exclusive, revocable licence to republish such picks "
    "on those terms, notwithstanding Section 7.1."))
story.append(P(
    "Apart from clauses (a), (b) and (c) above, the ownership provisions of Section 7.1, the referral "
    "obligation for Nosebleed Opportunities in "
    "Section 4.2, the bio requirement in Section 2.1(f), and the conduct and content rules in Sections "
    "2.4, 2.5, 2.8 and 2.9 (which apply to the Contractor wherever they state that they do), this "
    "Agreement does not restrict the Contractor's personal activities, personal social "
    "media accounts, personal content, outside work, or other sources of income, whether or not paid, and "
    "the Contractor may pursue them without notice to or approval from the Company. The Company claims no "
    "interest in them, except as Section 7.1 provides as to content that reproduces, excerpts, or is "
    "derived from Work Product."))
story.append(P(
    "<b>No existing obligations.</b> The Contractor represents that entering into and performing this "
    "Agreement does not breach any agreement with, or obligation to, any third party, and that as of the "
    "Effective Date the Contractor has no sponsorship, endorsement, affiliate, ambassador, paid-promotion, "
    "or paid picks agreement in effect with any third party under which the Contractor receives, or is "
    "entitled to receive, any payment or other consideration. No agreement, relationship, or opportunity "
    "of the Contractor entered into or arising before "
    "the Effective Date is a Brand Deal or a Nosebleed Opportunity (each as defined in Section 4), generates "
    "Shared Revenue, or is otherwise subject to this Agreement, and the Company claims no interest in any of "
    "them. Except for Sections 6, 7, 10, 12.4 and 12.5, which apply according to their terms, nothing in "
    "this Agreement restricts the Contractor from providing services to, working for, or accepting "
    "engagements from any person after the Term."))
story.append(P(
    "<b>2.7 Personal performance; assistants.</b> The podcast, live-stream, on-camera, handicapping, and "
    "community elements of the Services are personal to the Contractor and will be performed by the "
    "Contractor personally. The Contractor may, at the Contractor's own expense and discretion, engage "
    "assistants for behind-the-scenes work such as audio and video editing, research, and scheduling, "
    "provided that no assistant is given access to any Company Account or Company credentials, each "
    "assistant is bound by written confidentiality obligations at least as protective as Section 10, and "
    "the Contractor remains fully responsible for their work and conduct."))
story.append(P(
    "<b>2.8 Third-party media; content policies.</b> The Contractor will comply with the Company's content "
    "and copyright policies as reasonably issued and updated from time to time. Access to the Company "
    "Accounts is not a license to copy, upload, or repost copyrighted broadcasts, game footage, "
    "photographs, graphics, articles, music, or other third-party material, and the fact that similar "
    "material appears elsewhere on social media is not authorization to post it. The Company's approval of "
    "a general content category is not direction to post any specific item, and the Contractor remains "
    "responsible for the Contractor's own selection of specific third-party material."))
story.append(P(
    "<b>2.9 Sponsored gambling streams; operator compliance.</b> This Section applies to every live stream, "
    "episode, segment, or other content in which the Contractor features, promotes, plays on, or wagers "
    "with a casino, sportsbook, daily-fantasy, sweepstakes, or other gambling operator (each, an "
    "\"Operator\"), on any platform, in each case where the content is published on a Company Account, "
    "features or references the Brand or the Platform, or is performed under a Brand Deal (each, a "
    "\"Sponsored Gambling Stream\"). In connection with every Sponsored Gambling "
    "Stream, the Contractor will:"))
story.append(B("<bullet>(a)</bullet>feature only Operators the Company has <b>approved in writing</b>, and "
               "only Operators that are licensed or otherwise lawfully offered in each jurisdiction the "
               "stream targets; the Company may refuse approval of any Operator, and may withdraw approval "
               "of any previously approved Operator, at any time and in its sole discretion, effective on "
               "notice to the Contractor; except that the Contractor is not in breach of this clause (a) "
               "as to an Operator the Company has approved in writing for the jurisdiction in question "
               "where the Contractor conducted the stream in accordance with the Company's written "
               "instructions;"))
story.append(B("<bullet>(b)</bullet>conduct the Sponsored Gambling Stream only under a Brand Deal approved "
               "and contracted under Section 4.2, and not promote, advertise, or provide an affiliate or "
               "referral link for any Operator through the Brand or the Platform outside such an approved "
               "Brand Deal (see also Section 2.5(f));"))
story.append(B("<bullet>(c)</bullet>comply with the gambling-content, promotion, and advertising policies "
               "of each platform used, including those of YouTube, Twitch, TikTok, Instagram, X, and "
               "Discord, as they exist from time to time, and immediately end, pause, or take down a stream "
               "when the Company or the platform directs the Contractor to do so;"))
story.append(B("<bullet>(d)</bullet>apply the age and jurisdiction gating that the Company or the Operator "
               "requires, including any age-restriction setting, geographic or jurisdictional restriction, "
               "and eligibility statement; and not target, or knowingly permit or admit to a Sponsored "
               "Gambling Stream, any person below the legal gambling age in the applicable jurisdiction and "
               "in no event any person under eighteen (18) years of age;"))
story.append(B("<bullet>(e)</bullet>include responsible-gambling messaging and problem-gambling helpline "
               "references as the Company directs, in the form, placement, and frequency the Company "
               "specifies;"))
story.append(B("<bullet>(f)</bullet>clearly and conspicuously disclose the sponsorship, in a manner "
               "compliant with FTC endorsement and disclosure rules, and separately disclose any bonus, "
               "promotional code, affiliate or referral link, deposit match, free bet, rake-back, credits, "
               "or \"play money\" the Operator provides to the Contractor or makes available to viewers, "
               "together with any material terms, eligibility conditions, and wagering requirements the "
               "Company or the Operator provides;"))
story.append(B("<bullet>(g)</bullet>not state or imply that gambling is a way to make money, earn an "
               "income, or resolve financial difficulty; not guarantee or promise any outcome, payout, or "
               "return; not misrepresent the Contractor's own or any other person's results, balance, or "
               "wagering history; and not encourage viewers to chase losses, to wager more than they can "
               "afford to lose, or to borrow in order to wager;"))
story.append(B("<bullet>(h)</bullet>not wager funds of either Company Party, and promptly disclose to the "
               "Company all funds, credits, coins, promotional balances, affiliate commissions, and other "
               "consideration any Operator provides to the Contractor, whether or not received through a "
               "Brand Deal;"))
story.append(B("<bullet>(i)</bullet>remain solely responsible for the Contractor's own personal wagering, "
               "for any losses the Contractor incurs, and for all taxes on the Contractor's own winnings, "
               "none of which is an expense, obligation, or liability of either Company Party;"))
story.append(B("<bullet>(k)</bullet>not enter into, and not accept payment under, any revenue-share, "
               "cost-per-acquisition, or other affiliate arrangement with an Operator unless the "
               "Contractor and the arrangement are registered or licensed as required in each "
               "jurisdiction the arrangement targets, and provide evidence of that registration to the "
               "Company on request; and"))
story.append(B("<bullet>(l)</bullet>not place, and not direct any person to place, any wager contrary to "
               "a pick the Contractor has published on a Company Account or delivered for the Premium "
               "Offering, and not wager on any event before the Contractor's pick on that event has been "
               "released to Premium Offering subscribers."))
story.append(B("<bullet>(j)</bullet>remit to the Company, within ten (10) days of receipt, any cash, "
               "affiliate commission, or other monetary consideration an Operator pays directly to the "
               "Contractor in connection with a Sponsored Gambling Stream or the Brand, which will be "
               "treated as Shared Revenue received by a Company Party under Section 4.1 and shared with "
               "the Contractor accordingly. This clause survives termination of this Agreement as to any "
               "consideration paid at any time in connection with a Sponsored Gambling Stream conducted, "
               "or a Brand Deal performed, during the Term, whether the Contractor receives it during the "
               "Term, during the Tail Period, or afterwards."))
story.append(P(
    "<b>Suspension.</b> If the Company reasonably believes that a Sponsored Gambling Stream, a particular "
    "Operator, or the Contractor's conduct on a stream creates legal, regulatory, platform, or reputational "
    "risk, the Company may suspend or cancel Sponsored Gambling Streams immediately, with or without prior "
    "notice, in addition to and without limiting its rights under Section 8.4. A suspension or cancellation "
    "under this Section is not a shortfall under Section 5, does not reduce any amount otherwise payable to "
    "the Contractor for work already performed, and does not by itself terminate this Agreement. Nothing in "
    "this Agreement requires the Contractor to wager the Contractor's own funds."))
story.append(P(
    "<b>2.10 Guests.</b> A <b>\"Guest\"</b> is any person the Contractor invites, brings, books, or arranges to "
    "appear on or take part in a podcast episode, live stream, Sponsored Gambling Stream, or any Company event, "
    "meetup, watch party, appearance, or other Company-branded content or activity (each, a \"Company Event\"), "
    "including a co-host, panelist, caller, or on-air contributor. Subject to the following paragraph as to "
    "unscreened live callers and audience participants, every Guest is a direct extension of the "
    "Contractor for purposes of this Agreement. The Contractor is responsible and liable to the Company for the "
    "acts, omissions, statements, and content of each Guest in connection with Company content and Company "
    "Events as if they were the Contractor's own, and conduct by a Guest that would breach Section 2.4, 2.5, "
    "2.9, 7, or 10 if done by the Contractor is treated as the Contractor's breach."))
story.append(P(
    "Before a Guest appears, the Contractor will: (a) give the Company reasonable advance notice of the Guest; "
    "(b) obtain the Guest's consent to being recorded and to the Company's use of the resulting content and "
    "of the Guest's name, image, likeness, and voice in it, in the form the Company provides or a form "
    "reasonably equivalent to it, and provide that consent to the Company on request; (c) inform the Guest of "
    "the content, disclosure, and gambling-compliance rules that apply to the appearance; and (d) confirm "
    "that the Guest is at least eighteen (18) years of age and, for a Sponsored Gambling Stream, of legal "
    "gambling age in the applicable jurisdiction. Clauses (a) through (d) do not apply to an unscreened live "
    "caller or audience participant. For such a person, the Contractor's obligation is to use reasonable "
    "efforts to moderate, to mute or remove the participant promptly on becoming aware of non-compliant "
    "conduct, and to notify the Company; the Contractor is not liable under this Agreement for conduct of "
    "such a person that the Contractor could not reasonably have anticipated and could not have addressed "
    "more promptly. "
    "The Company may decline any proposed Guest in advance, and "
    "may remove a Guest from any content or Company Event, or remove or edit any content featuring a Guest, "
    "at any time in its reasonable discretion; a removal under this Section is not a shortfall under Section "
    "5. The Contractor will not give any Guest access to any Company Account or Company credential. No Guest "
    "is a contractor, agent, or representative of either Company Party, and the Company owes no Guest any "
    "payment or other consideration; any fee, expense, or other consideration the Contractor promises a Guest "
    "is the Contractor's own obligation."))

# ---------------------------------------------------------------- 3
story.append(P("3. Term; Quarterly Review", heading_style))
story.append(P(
    "<b>3.1 Term.</b> This Agreement begins on the Effective Date and continues until terminated in "
    "accordance with Section 12 (the \"Term\")."))
story.append(P(
    "<b>3.2 Quarterly review.</b> The Parties will meet at least once each calendar quarter to review the "
    "Contractor's performance against the Monthly Deliverables, the Contractor's overall contribution to "
    "the Brand and the Platform, the scope of the Services, and the compensation in Section 4. Any change "
    "to this Agreement requires a written amendment signed by all Parties. No Party is obligated to agree "
    "to any change, and the absence or timing of any review does not affect any Party's rights under this "
    "Agreement."))

# ---------------------------------------------------------------- 4
story.append(P("4. Compensation", heading_style))

_share_limbs = (
    "(a) <b>Brand Deals the Contractor sourced</b> and introduced to the Company, including Sponsored "
    "Gambling Streams the Contractor brought in; (b) <b>Podcast Revenue</b>; and (c) Brand Deals that arise "
    "from a Nosebleed Opportunity the Contractor referred and a Company Party contracted under "
    "Section 4.2. ")
if SHARE_PERFORMED_DEALS:
    _share_limbs = (
        "(a) <b>Brand Deals the Contractor sourced</b> and introduced to the Company, including Sponsored "
        "Gambling Streams the Contractor brought in; (b) <b>Podcast Revenue</b>; (c) Brand Deals that arise "
        "from a Nosebleed Opportunity the Contractor referred and a Company Party contracted under "
        "Section 4.2; and (d) Brand Deals that directly involve the Contractor's work, meaning the "
        "Contractor personally creates, appears in, or delivers the sponsored content or appearance, but "
        "only to the extent of the portion of that Brand Deal allocated to the Contractor's elements under "
        "the following paragraph. ")

_share_exclusion = (
    "A Brand Deal that a Company Party sourced and that the Contractor merely performs &mdash; meaning a "
    "deal the Company sold in which the Contractor appears in or delivers the sponsored content &mdash; is "
    "<b>not</b> Shared Revenue unless the amounts received are Podcast Revenue. Put plainly: the Contractor "
    "shares in the deals the Contractor brings in and in the podcast, and not in the Company's own "
    "sponsorships that the Contractor is asked to appear in. Brand Deals the Contractor neither sourced nor "
    "referred generate no Shared Revenue except to the extent they are Podcast Revenue. ")
if SHARE_PERFORMED_DEALS:
    _share_exclusion = (
        "Brand Deals that the Contractor neither sourced, nor referred, nor personally performs generate no "
        "Shared Revenue except to the extent they are Podcast Revenue. ")

story.append(P(
    "<b>4.1 Revenue share.</b> The Company will pay the Contractor <b>" + REV_SHARE + "</b> of Shared "
    "Revenue. <b>\"Shared Revenue\"</b> means amounts actually received by either Company Party, net of "
    "platform fees, payment-processing fees, refunds, and chargebacks, from: " + _share_limbs +
    "A <b>\"Brand Deal\"</b> is a third-party sponsorship, advertising, brand partnership, affiliate, or "
    "paid collaboration agreement approved and contracted by a Company Party. <b>\"Podcast Revenue\"</b> "
    "means sponsorship, advertising, host-read advertising, platform advertising-revenue-share, and "
    "paid-subscription revenue attributable to episodes of the Nosebleed Gambling podcast, and to podcast "
    "live streams, that the Contractor hosts or appears on, excluding in all cases subscription revenue "
    "from the Premium Offering even where the Premium Offering includes podcast episodes or bonus "
    "content. Where the Contractor is one of two or more on-air participants on an episode or podcast "
    "live stream, the Company will first allocate the revenue for that episode or stream among the "
    "participants reasonably and in good faith under the allocation paragraph below, and Podcast Revenue "
    "as to the Contractor means only the portion so allocated to the Contractor. Absent the Contractor's "
    "written agreement to a different split, revenue for an episode or podcast live stream is allocated "
    "equally among the regular on-air hosts of that episode or stream. For this purpose a <b>\"regular "
    "on-air host\"</b> is a person the Company has designated in writing as a host of the show or of the "
    "stream in question and who appears in a hosting role on that episode or stream; a recurring "
    "analyst, handicapper, correspondent, or other on-air contributor who has not been so designated is "
    "not a regular on-air host and receives no allocation. The Company will notify the Contractor in "
    "writing before any additional person is designated as a regular on-air host of the Nosebleed "
    "Gambling podcast. Non-recurring Guests, unscreened callers, and members, officers and employees of "
    "either Company Party are not participants for this purpose and receive no allocation. " + _share_exclusion +
    "Subscription revenue from the Premium Offering is neither a Brand Deal the Contractor sourced nor "
    "Podcast Revenue and is not Shared Revenue, including as to picks the Contractor delivers under "
    "Section 2.1(c). Shared Revenue is counted once, without duplication where an amount falls within "
    "more than one of clauses (a) through " + ("(d)." if SHARE_PERFORMED_DEALS else "(c).")))
story.append(P(
    "Where a Brand Deal or a podcast revenue stream includes elements beyond the podcast or the "
    "Contractor's work, or spans multiple Brand accounts, shows, or Company properties, the Company will "
    "allocate the revenue &mdash; and any related refund, reversal, clawback, or chargeback &mdash; among "
    "the elements reasonably and in good faith using objective factors where practicable (such as "
    "contracted deliverables, episodes delivered, impressions, or element-specific pricing). The allocation "
    "will be shown on the statement under Section 4.3 and is binding unless the Contractor objects in "
    "writing within thirty (30) days, in which case the Parties will confer in good faith and the Company "
    "will provide the contracted deliverables schedule and element pricing for that Brand Deal. If the "
    "Parties do not agree within thirty (30) days after the objection, the Company's allocation stands for "
    "payment purposes and the objection is preserved as a dispute under Section 13.2; the Company will pay "
    "the undisputed portion on the normal schedule."))
story.append(P(
    "<b>4.2 Nosebleed Opportunities; Brand Deals through the Company.</b> A <b>\"Nosebleed Opportunity\"</b> "
    "is any sponsorship, endorsement, affiliate, advertising, brand-partnership, appearance, or other paid "
    "opportunity offered to or obtained by the Contractor that arises from the Contractor's association "
    "with the Brand or the Platform. An opportunity is a Nosebleed Opportunity if any of the following is "
    "true: (a) it is offered to the Contractor in the Contractor's capacity as Nosebleed Gambling or "
    "Nosebleed Sports talent, podcast host, or handicapper, or the counterparty identifies the Brand, the "
    "Platform, or the Contractor's role with them as a reason for the offer; (b) it reaches the Contractor "
    "through a Company Account, a Company channel, the Company's audience, or an introduction by a Company "
    "Party; (c) its deliverables include content posted to a Company Account, content featuring the Brand "
    "or the Platform, or the Contractor's Nosebleed picks, Nosebleed persona, or Nosebleed handicapping "
    "record; or (d) the counterparty is a sportsbook, betting operator, casino, daily-fantasy operator, "
    "odds or picks service, or sports media company, and the opportunity is directed to the Contractor by "
    "reason of the Contractor's handicapping profile or sports audience. An opportunity that meets none of "
    "(a) through (d) is the Contractor's own, is not subject to this Agreement, and the Company claims no "
    "interest in it or in any amount the Contractor receives from it."))
story.append(P(
    "<b>Referral; Company election.</b> The Contractor will promptly refer each Nosebleed Opportunity to "
    "the Company and will not enter into it, or post content under it, without the Company's prior written "
    "approval. Each Nosebleed Opportunity the Company elects to pursue is contracted through a Company "
    "Party, is a Brand Deal, and is shared with the Contractor under Section 4.1. The Company will respond "
    "to a referral within <b>ten (10) business days</b>. If the Company declines a Nosebleed Opportunity or "
    "does not respond within that period, the Contractor may pursue it individually, subject to the "
    "following sentence and its provisos, and keep all amounts "
    "from it, provided that, where the Company did not respond within that period, the Contractor "
    "will give the Company written notice of intent to pursue the opportunity and will not enter "
    "into it until ten (10) business days after that notice have elapsed; "
    "it is not a Brand Deal and generates no Shared Revenue. For the avoidance of doubt, the "
    "Company's consent under Section 2.6 is deemed given for, and Sections 2.6(a), 2.6(b), 2.6(c), 2.9(a), "
    "2.9(b) "
    "and 2.9(j) do not apply to, an opportunity the Company has declined or has not responded to within "
    "that period, and the Contractor keeps all amounts from it, provided that (i) the deemed consent "
    "extends only to the specific opportunity as described in the Contractor's referral, and not to any "
    "extension, renewal, expansion, or successor arrangement; (ii) the deemed consent lapses if the "
    "Contractor has not entered into the opportunity within ninety (90) days; (iii) no consent is deemed "
    "given under Section 2.6(b) where (A) the Company's written response states that it declined because "
    "the counterparty competes or conflicts with an existing Brand Deal or with a sponsorship, "
    "advertising, brand-partnership, affiliate or paid-collaboration arrangement a Company Party is "
    "actively negotiating, or (B) the Company did not respond within the period and, within ten (10) "
    "business days after the Contractor gives written notice of intent to pursue the opportunity under "
    "this paragraph, the Company gives written notice stating such a conflict, in each case acting in "
    "good faith and identifying the conflicting or prospective arrangement in reasonable detail, subject "
    "to Section 10; in either case Section 2.6(b) continues to apply; and (iv) the Contractor performs "
    "it off "
    "the Company Accounts, without use of the Brand, the Platform, or any Company credential or Company "
    "property, and in compliance with Sections 2.4 and 2.5 and, as if the opportunity were a Sponsored "
    "Gambling Stream, Sections 2.9(c) through (i). The Contractor has no "
    "authority to bind either Company Party to any "
    "Brand Deal."))
story.append(P(
    "<b>4.3 Collection; payment; statements.</b> All Shared Revenue is collected exclusively into accounts "
    "owned and controlled by a Company Party. Within fifteen (15) days after the end of each calendar "
    "month, the Company will pay the Contractor's share of Shared Revenue actually received in that month, "
    "accompanied by a statement showing the amounts received, any allocations, and the calculation of the "
    "Contractor's share. Amounts are calculated net of platform fees, payment-processing fees, and any "
    "refunds or chargebacks. If a counterparty claws back, reverses, or reduces a payment, the "
    "corresponding share may be deducted from the next payment(s) to the Contractor, limited to the portion "
    "previously allocated to the Contractor. No separate invoice, time sheet, or list of services is "
    "required from the Contractor for the Company's calculation or payment of compensation under this "
    "Agreement. Payment is made by the method identified on Exhibit A."))
story.append(P(
    "<b>4.4 Records.</b> The Company will keep reasonable records of Shared Revenue and, on the "
    "Contractor's reasonable request (no more than twice per year), will make available documentation "
    "reasonably necessary to verify the Contractor's share. This Section does not entitle the Contractor to "
    "review Company-wide financial information, other contractors' compensation, or sponsor information "
    "unrelated to the Contractor."))
story.append(P(
    "<b>4.5 Taxes.</b> The Contractor is an independent contractor and is responsible for all taxes on "
    "amounts paid under this Agreement. No amount is withheld from payments to the Contractor, and the "
    "Contractor is not treated as an employee for tax or benefits purposes. The Company may require a "
    "completed IRS Form W-9 before making payments and may report payments on IRS Form 1099-NEC."))
story.append(P(
    "<b>4.6 Sole compensation.</b> The revenue share in Section 4.1 is the Contractor's sole compensation "
    "under this Agreement. No monthly fee, base pay, salary, benefits, minimum payment, equity, or expense "
    "reimbursement is owed unless separately agreed in writing or required by applicable law. The Parties "
    "acknowledge that the Contractor's compensation is entirely contingent, that picks requested under "
    "Section 2.1(c) are provided on an as-requested basis as part of the integrated bundle of Services "
    "for which the revenue share in Section 4.1 is the agreed consideration, that the Parties have "
    "allocated no separate fee to them, and that the Contractor accepts the revenue share in Section 4.1 "
    "as full consideration for all Services including those picks. Revenue from "
    "Premium Offering subscriptions, events, merchandise, or other sources is not shared with the "
    "Contractor except as expressly stated in Section 4.1."))
story.append(P(
    "<b>4.7 Freelance Isn't Free Act.</b> This Agreement is a contract under New York City Administrative "
    "Code Section 20-927 and following and New York General Obligations Law Article 44-A. The value of the "
    "Services is the Contractor's fifty percent (50%) share of Shared Revenue calculated under "
    "Section 4.1 and accrued under Section 5.2(a), which is variable and contingent, and which the "
    "Parties agree is the value of the Services for purposes of those statutes. Compensation that is "
    "subject to Section 5.2(a) and does not accrue under it is not earned compensation, is not "
    "contracted compensation for "
    "purposes of those statutes, and its non-accrual is not a failure or delay in payment. "
    "The Contractor is not required to submit an invoice, "
    "timesheet, or list of services rendered in order to be paid, and no internal processing deadline "
    "applies; payment is due on the date stated in Section 4.3. Nothing in Section 13.2 delays or "
    "conditions the Contractor's right to bring a claim under those statutes, and no provision of this "
    "Agreement waives any right under them."))

# ---------------------------------------------------------------- 5
story.append(P("5. Performance and Shortfalls", heading_style))
story.append(P(
    "<b>5.1 Condition.</b> The Company is engaging the Contractor to perform the Monthly Deliverables and "
    "the Services, and the revenue share in Section 4 is consideration for actually performing them. "
    "<b>The Contractor's share of Podcast Revenue for a month is subject to reduction only under "
    "Section 5.2, which states the Company's sole remedy, as to compensation, for a shortfall in the "
    "Monthly Deliverables.</b>"))
story.append(P(
    "<b>5.2 Shortfall.</b> If the Contractor fails to substantially perform the Monthly Deliverables in any "
    "month, the Company may, on written notice identifying the shortfall (a \"Shortfall Notice\") and in "
    "its reasonable discretion: (a) treat the Contractor's share of Podcast Revenue for a month in which the "
    "Contractor did not substantially perform the podcast deliverable in Section 2.1(a) as accruing, and "
    "becoming earned compensation, only in the proportion that the episodes the Contractor produced and "
    "appeared on bears to the episodes required for that month; any portion that does not so accrue is "
    "not earned compensation and is not withheld; (b) decline to "
    "schedule the Contractor for live streams, Sponsored Gambling Streams, or handicapping assignments; "
    "and/or (c) terminate this Agreement under Section 12.1. Clause (a) applies only to "
    "a shortfall in the podcast deliverable in Section 2.1(a). Shortfalls include missed or late episodes, "
    "missed scheduled live streams (other than a live stream the Contractor declines under Section 2.1(b) "
    "or Section 9.2), missed or late picks deliveries after a request under Section 2.1(c) that the "
    "Contractor has not declined under Section 2.1(c), "
    "and sustained inactivity in the Discord community. The Contractor's share of Shared Revenue from Brand "
    "Deals the Contractor sourced or referred is not affected by a Shortfall Notice. Where the Contractor "
    "fails to deliver the contracted elements of a specific Brand Deal, the Company may withhold the "
    "Contractor's share of that Brand Deal in proportion to the undelivered elements, and that, together "
    "with clause (a), is the Company's only reduction of Shared Revenue for a shortfall in performance. "
    "This sentence does not affect the netting, allocation, refund, chargeback, reversal and clawback "
    "provisions of Sections 4.1 and 4.3, which determine the amount of Shared Revenue before any "
    "reduction under this Section."))
story.append(P(
    "<b>5.3 Excused non-performance.</b> Documented illness, family emergency, or time off approved in "
    "advance in writing by the Company will not be treated as a shortfall, and the Parties will reasonably "
    "adjust the affected Monthly Deliverables."))
story.append(P(
    "<b>5.4 No waiver.</b> Payment of a revenue share, or the absence of a Shortfall Notice, in any period "
    "is not a waiver of the Company's rights under this Section 5 for any other period."))

# ---------------------------------------------------------------- 6
story.append(P("6. Name, Image, and Likeness", heading_style))
story.append(P(
    "<b>6.1 License.</b> The Contractor grants each Company Party a worldwide, royalty-free, sublicensable "
    "license to use the Contractor's name, image, likeness, voice, signature, social media handles, and "
    "biographical information (collectively, \"Likeness\") in and in connection with the Content (as "
    "defined in Section 7.1), the "
    "Brand, the Platform, and the Company's advertising, marketing, and promotion, in all media now known "
    "or later developed, during the Term and, as to Content and advertising created or committed during "
    "the Term, irrevocably and perpetually thereafter on the terms of Section 6.2. This license is a "
    "written consent for purposes of New York Civil Rights Law Sections 50 and 51 and is not revocable. "
    "The compensation in Section 4 fully compensates the Contractor for this license."))
story.append(P(
    "<b>6.2 Post-Term use.</b> After the Term, the Company may continue to use, display, distribute, and "
    "exploit all Content and advertising created during the Term that incorporates the Contractor's "
    "Likeness, including podcast episodes remaining available in the Company's feeds and archives and paid "
    "campaigns then running or that reuse existing creative, without further compensation; provided that "
    "the Company will not create new Content featuring the Contractor's Likeness after the Term other than "
    "archival, historical, or factual references. The Contractor is not entitled to require removal of "
    "Content published during the Term."))
story.append(P(
    "<b>6.3 Waiver.</b> To the fullest extent permitted by law, the Contractor waives any right to inspect "
    "or approve uses consistent with this Section 6, and any claim (including for rights of publicity, "
    "privacy, or moral rights) arising from such uses."))

# ---------------------------------------------------------------- 7
story.append(P("7. Ownership of Content and Work Product", heading_style))
story.append(P(
    "<b>7.1 Company ownership.</b> All content the Contractor creates for the Brand or the Platform under "
    "this Agreement &mdash; including podcast episodes and recordings, posts, videos, live-stream "
    "recordings, picks, write-ups, analysis, advertising concepts and hooks, and all other deliverables "
    "developed specifically for the Company (collectively, \"Content\"), together with related frameworks, "
    "systems, documentation, and all improvements and derivative works (with the Content, \"Work "
    "Product\") &mdash; is owned exclusively by the Company Parties. The Contractor hereby irrevocably "
    "assigns all right, title, and interest in and to all Work Product, effective upon creation, to the "
    "Company Party the Company Parties designate in writing and, absent designation, to JGN as to Work "
    "Product relating to the Brand, the podcast, and the Managed Accounts and to NSL as to Work Product "
    "relating to the Platform and the Premium Offering; in addition, to the extent any Work Product "
    "qualifies as a work made for hire under applicable copyright law, it is owned by the applicable "
    "Company Party as such. The Contractor will execute any documents reasonably requested by the Company "
    "to confirm the foregoing. Work Product does not include content the Contractor creates and publishes "
    "on the Contractor's own accounts that is not a Monthly Deliverable, is not created at the Company's "
    "request or direction, and does not incorporate Confidential Information (Section 10.1) of either "
    "Company Party; identifying the "
    "Brand in the Contractor's bios under Section 2.1(f) does not make such content Work Product. This "
    "exclusion does not apply to content that reproduces, excerpts, or is derived from Work Product, or "
    "to picks or analysis prepared for or delivered to the Premium Offering."))
story.append(P(
    "<b>7.2 Background materials.</b> The Contractor retains ownership of pre-existing know-how, skills, "
    "general experience, and handicapping methods of general applicability developed outside of and not "
    "specifically for this engagement. To the extent any such materials are incorporated into Work "
    "Product, the Contractor grants the Company Parties a perpetual, irrevocable, royalty-free license to "
    "use them as part of that Work Product. The Contractor may reference the engagement and "
    "non-confidential results in the Contractor's own portfolio and professional materials."))
story.append(P(
    "<b>7.3 The Brand and the Platform.</b> Nothing in this Agreement transfers any interest in the Brand "
    "or the Platform to the Contractor, and the Contractor will not register, claim, or assert any right in "
    "the Brand, the Platform, the Nosebleed Gambling show name, or any confusingly similar name, handle, or "
    "mark, during or after the Term."))

# ---------------------------------------------------------------- 8
story.append(P("8. Account Access and Security", heading_style))
story.append(P(
    "<b>8.1 Company Accounts.</b> The Managed Accounts and every other account, platform, or system of "
    "either Company Party to which the Contractor is given access (including the podcast hosting and "
    "distribution accounts, the Discord server, the Premium Offering platform, and any advertising "
    "accounts) (collectively, \"Company Accounts\") are the sole property of the applicable Company Party. "
    "No account, channel, feed or profile owned or controlled by the Contractor is a Company Account. "
    "The Contractor receives only a limited, revocable, non-transferable right of access solely to perform "
    "the Services, and acquires no ownership, possessory, audience, goodwill, monetization, or other "
    "interest in any Company Account."))
story.append(P(
    "<b>8.2 Safeguarding.</b> The Contractor will keep all credentials strictly confidential, will not "
    "share them with any third party, and will use the Company Accounts only to perform the Services."))
story.append(P(
    "<b>8.3 Account integrity.</b> The Contractor will not, without the Company's prior written consent: "
    "(a) change any Company Account's password, linked email address, phone number, two-factor "
    "authentication settings, or linked payout or monetization settings; (b) transfer, sell, rename, "
    "deactivate, or delete any Company Account, podcast feed, or show listing; (c) lock or restrict the "
    "Company's access to any Company Account; or (d) take any other action intended to harm a Company "
    "Account, its audience, or its monetization eligibility. The Company may change credentials at any "
    "time."))
story.append(P(
    "<b>8.4 Emergency suspension.</b> The Company may immediately suspend the Contractor's access to any "
    "Company Account if the Company reasonably believes that continued access presents a security risk, a "
    "risk of loss of or damage to an account, a risk of significant reputational harm to the Brand or the "
    "Platform, or unauthorized use of Company assets. The Company will promptly notify the Contractor of "
    "the suspension and its reason. A suspension does not by itself terminate this Agreement; Monthly "
    "Deliverables that a suspension not caused by the Contractor's breach makes impossible are excused for "
    "its duration and will not be treated as a shortfall under Section 5."))
story.append(P(
    "<b>8.5 Liquidated damages for account misappropriation.</b> The Parties agree that each Managed "
    "Account is a uniquely valuable Company asset whose loss would cause harm that is real and substantial "
    "but difficult to quantify precisely. If the Contractor materially breaches Section 8.3 &mdash; "
    "including by changing credentials to exclude the Company, transferring or attempting to transfer an "
    "account or podcast feed, or otherwise misappropriating it &mdash; the Contractor will immediately "
    "restore the Company's full access and control upon notice. If full access and control are not restored "
    "within seven (7) days of notice, or an account is lost, transferred, or destroyed as a result "
    "of such a breach, the Contractor will pay the Company, as liquidated damages for each affected "
    "account, the amount specified on Exhibit A or, if none is specified, the amount determined by the "
    "account's follower or subscriber count on the day immediately preceding the first act constituting "
    "the breach, as evidenced by a dated screenshot or platform analytics export the Company provides "
    "with its notice or, if that count cannot be established, the count on the date the Company gives "
    "notice under this Section or, if neither count can be established, the most recent count the "
    "Company can document from its own analytics records or from a public third-party archive: "
    "<b>$2,500.00</b> if fewer than 1,000 "
    "followers or subscribers; <b>$10,000.00</b> if at least 1,000 but fewer than 10,000; <b>$25,000.00</b> "
    "if at least 10,000 but fewer than 50,000; and <b>$50,000.00</b> if 50,000 or more. No amount is "
    "payable under this Section if full access and control are restored within that period and the "
    "affected account suffers no material monetization loss, no loss of more than two percent (2%) of "
    "its followers or subscribers, and no platform penalty. Where no liquidated-damages amount is payable "
    "for a breach of Section 8.3 solely because full access and control were restored within that period "
    "and the conditions stated in the preceding sentence are met, the Company may instead recover its "
    "actual documented loss from that breach, and the sole-remedy sentence below does not bar that "
    "recovery. In no other case may the Company recover actual damages for a breach of Section 8.3 "
    "except as clause (iv) below provides, and no actual damages are recoverable in addition to, or in "
    "excess of, the amounts payable under this Section or the aggregate cap stated below. The "
    "aggregate of all amounts payable under this Section for any single breach or series of related "
    "breaches will not exceed one hundred thousand dollars ($100,000.00); breaches are related if they "
    "arise from the same act, the same course of conduct, or the same Company Account, and each "
    "unrelated breach is subject to a separate application of this Section and of that cap. For a "
    "Company Account that has no follower or subscriber count, the amount is <b>$25,000.00</b>. Subject "
    "only to the following, this Section states the Company's sole monetary remedy for the Contractor's "
    "breach of Section 8.3 as to the Company's own direct loss of the affected account: it does not "
    "limit (i) the Company's rights under Section 11.1 as to third-party claims, (ii) its rights under "
    "Section 10 as to Confidential Information other than the credentials of the affected account and "
    "other than for the Company's loss of that account, (iii) its right to injunctive or other equitable "
    "relief to recover an account, or "
    "(iv) the Company's right to recover actual damages where the breach of Section 8.3 involved the "
    "Contractor's fraud or willful misconduct, in which case this Section does not apply. Section 12.3 "
    "is subject to this Section as to a breach of Section 8.3 not involving fraud or willful misconduct. "
    "Any Exhibit A "
    "amount may be changed only by mutual written agreement before any breach. The Parties agree the "
    "applicable amount is a genuine and reasonable pre-estimate of the Company's minimum probable loss, "
    "scaled to objective characteristics of the account existing before the breach, and is not a penalty. "
    "This Section does not apply to ordinary content decisions made in good faith, actions taken at the "
    "Company's direction, or events outside the Contractor's reasonable control. The seven (7)-day "
    "restoration period applies only to this liquidated-damages remedy and does not limit suspension under Section 8.4 "
    "or termination under Section 12.1."))
story.append(P(
    "<b>8.6 Return of Company property.</b> Upon termination of this Agreement, or upon the Company's "
    "earlier request, the Contractor will cease using the Company Accounts; confirm that the Contractor "
    "has made no change to any credential or setting other than a change the Company consented to in "
    "writing; and promptly return to the Company, or at the Company's election "
    "permanently delete and confirm deletion of, all Company property and Confidential Information (Section 10.1) in the "
    "Contractor's possession or control, including credentials, media assets, raw and edited audio and "
    "video, drafts and unpublished content, picks records, analytics exports, subscriber data, and internal "
    "documents."))

# ---------------------------------------------------------------- 9
story.append(P("9. Independent Contractor", heading_style))
story.append(P(
    "<b>9.1 Relationship.</b> The Contractor is an independent contractor, not an employee, partner, joint "
    "venturer, or agent of either Company Party. The revenue share under Section 4 is a compensation "
    "mechanism only and creates no partnership, ownership, equity, or profit interest in either Company "
    "Party, the Brand, or the Platform. The Contractor is not entitled to employee benefits from either "
    "Company Party and is not required to form or maintain any entity to perform this Agreement."))
story.append(P(
    "<b>9.2 Control of the work.</b> The Contractor controls the manner, means, and methods of performing "
    "the Services. Other than agreed delivery deadlines, the publication schedule and format for episodes, "
    "and appearances and streams scheduled by the Company on reasonable advance notice, which the "
    "Contractor may decline for a genuine scheduling conflict on prompt notice to the Company, the "
    "Parties using good faith to find an alternative time &mdash; each of which relates to the results "
    "of the engagement &mdash; the Company does not control the manner, "
    "means, hours, or location of the Contractor's work. "
    "The Contractor furnishes the Contractor's own equipment, workspace, and tools, and bears the "
    "Contractor's own business expenses. Subject to Section 2.6, the Contractor is free to provide services "
    "to others and to operate the Contractor's own business and personal brand."))
story.append(P(
    "<b>9.3 Performance through an entity.</b> On written notice to the Company, the Contractor may "
    "perform this Agreement through a limited liability company or other entity wholly owned by the "
    "Contractor, in which case the Company will pay the revenue share to that entity, the entity will be "
    "bound by this Agreement, and the Contractor will remain personally bound by Sections 2.4 through 2.10, "
    "6, 7, 8, 10, and 11 and will personally perform the Services, provided that the entity first "
    "executes a joinder to this Agreement in the form the Company provides and the Contractor executes "
    "a personal guaranty of the entity's obligations. Nothing in this Agreement requires the "
    "Contractor to form any entity."))
story.append(P(
    "<b>9.4 No authority to bind.</b> Neither Party may bind the other except as expressly set out in this "
    "Agreement, and the Contractor has no authority to execute agreements on behalf of either Company "
    "Party, accept or negotiate sponsorships or advertising commitments, incur Company expenses, or make "
    "official statements for the Company. The Contractor represents that the Contractor is at least "
    "eighteen (18) years of age and has full legal capacity to enter into this Agreement."))

# ---------------------------------------------------------------- 10
story.append(P("10. Confidentiality", heading_style))
story.append(P(
    "<b>10.1 Definition.</b> \"Confidential Information\" means all non-public information disclosed by or "
    "on behalf of one Party to another, or otherwise learned, accessed, observed, generated, or derived "
    "by a Party, in connection with this Agreement, including, in the case of the "
    "Company: credentials; business and strategic plans; sponsorship, advertising, and partnership "
    "relationships and terms; contractor and talent relationships and compensation terms; unpublished "
    "campaigns, episodes, and content; picks methodology and unpublished picks; subscriber and customer "
    "data; advertising and download performance data; app, website, and Discord plans and code; analytics; "
    "growth and monetization strategies; financial information (including the terms of this Agreement and "
    "the capitalization of either Company Party); and any other non-public Company information. "
    "Confidential Information does not include information that (a) is or becomes publicly available "
    "through no breach of this Agreement; (b) was lawfully known to the receiving Party before disclosure; "
    "(c) is lawfully received from a third party without confidentiality obligations; or (d) is "
    "independently developed without use of the disclosing Party's Confidential Information."))
story.append(P(
    "<b>10.2 Obligations.</b> Each Party will keep the other Parties' Confidential Information "
    "confidential, will use it only for purposes of this Agreement, and will protect it with at least "
    "reasonable care. A Party may disclose Confidential Information to the extent required by law or court "
    "order, with prompt notice to the disclosing Party where legally permitted. These obligations survive "
    "for three (3) years after this Agreement ends, except that obligations with respect to credentials, "
    "subscriber data, and trade secrets survive (i) as to trade secrets, for so long as the information "
    "remains a trade secret under applicable law, and (ii) as to credentials and subscriber data, for so "
    "long as the Company maintains it as confidential, each limb applying independently. A Party may "
    "also disclose Confidential Information to its attorneys, "
    "accountants, and tax advisors who are bound by professional or written confidentiality "
    "obligations."))
story.append(P(
    "<b>10.3 Immunity notice.</b> The following notice is required by 18 U.S.C. Section 1833(b) and is "
    "quoted from that statute; it does not create or imply an employment relationship, and Section 9.1 "
    "governs the Parties' relationship. Under 18 U.S.C. Section 1833(b), an individual is not held criminally "
    "or civilly liable under any federal or state trade secret law for disclosure of a trade secret that "
    "is made (i) in confidence to a federal, state, or local government official, either directly or "
    "indirectly, or to an attorney, and solely for the purpose of reporting or investigating a suspected "
    "violation of law, or (ii) in a complaint or other document filed under seal in a lawsuit or other "
    "proceeding. An individual suing an employer for retaliation for reporting a suspected violation of "
    "law may disclose the trade secret to the individual's attorney and use the trade secret information "
    "in the court proceeding, if the individual files any document containing the trade secret under "
    "seal and does not disclose the trade secret except pursuant to court order."))

# ---------------------------------------------------------------- 11
story.append(P("11. Indemnification; Limitation of Liability", heading_style))
story.append(P(
    "<b>11.1 By the Contractor.</b> The Contractor will indemnify and hold harmless each Company Party and "
    "its affiliates and their respective members, managers, officers, employees, and agents from and "
    "against third-party claims, demands, proceedings, and investigations, and resulting losses, damages, "
    "judgments, settlements, and reasonable legal fees and defense costs, to the extent arising from: "
    "(a) infringement or misappropriation of any third party's copyright (including in broadcasts, game "
    "footage, photographs, graphics, or music), trademark, publicity, likeness, privacy, or name, image, "
    "and likeness (NIL) rights by content the Contractor creates, selects, reposts, edits, or publishes; "
    "(b) unlawful, "
    "defamatory, or knowingly false content posted by the Contractor; (c) the Contractor's violation of "
    "FTC endorsement or disclosure rules, gambling-related advertising laws, or platform policies, or any "
    "misstatement of the Contractor's picks record; (d) any breach of the Contractor's representations in "
    "Section 2.6, including those in the paragraph of Section 2.6 captioned \"No existing obligations\"; "
    "(e) the Contractor's breach of Section 2.9, or the Contractor's own wagering or gambling activity, "
    "including any claim relating to a Sponsored Gambling Stream conducted otherwise than in compliance "
    "with Section 2.9; (f) the acts, omissions, statements, or content of any Guest (Section 2.10), or the "
    "Contractor's failure to obtain a consent Section 2.10 requires, other than as to an unscreened live "
    "caller or audience participant whose conduct the Contractor could not reasonably have anticipated "
    "and could not have addressed more promptly, as provided in Section 2.10; (g) the Contractor's "
    "material breach of "
    "this Agreement; or (h) the Contractor's negligence or willful misconduct. This Section does not apply "
    "to a claim arising from an Operator's licensure or lawfulness in a jurisdiction where the Company "
    "approved that Operator in writing and the Contractor conducted the stream in accordance with the "
    "Company's written instructions. This Section does not apply "
    "to content created and posted solely by "
    "the Company, or to content the Contractor posts at the Company's specific written direction without "
    "material deviation."))
story.append(P(
    "<b>11.2 By the Company.</b> The Company will indemnify and hold harmless the Contractor from and "
    "against third-party claims, and resulting losses, damages, judgments, settlements, and reasonable "
    "legal fees and defense costs, to the extent arising from materials provided by the Company or "
    "content posted at the Company's specific written direction and not materially altered by the "
    "Contractor."))
story.append(P(
    "<b>11.3 Procedure.</b> The indemnified Party will give the indemnifying Party prompt written notice of "
    "any claim and reasonable cooperation; failure to give prompt notice relieves the indemnifying Party "
    "only to the extent it is materially prejudiced. The indemnifying Party may assume control of the "
    "defense and settlement on written acknowledgment of its indemnity obligation and with counsel "
    "reasonably acceptable to the indemnified Party, and the indemnified Party may participate with its "
    "own counsel at its own expense. If the indemnifying Party does not assume the defense within "
    "fifteen (15) days, fails to defend diligently, or a conflict of interest exists, the indemnified "
    "Party may assume the defense at the indemnifying Party's reasonable expense and settle the claim "
    "with the indemnifying Party's prior written consent, not to be unreasonably withheld, conditioned "
    "or delayed, without prejudice to indemnification. No settlement that imposes any obligation or "
    "liability on the "
    "indemnified Party, includes any admission of fault, or grants injunctive or other non-monetary "
    "relief may be made without the indemnified Party's prior written consent."))
story.append(P(
    "<b>11.4 Limitation of liability.</b> Except for the Company's payment obligations under Section 4 and "
    "except for the Company Parties' own fraud, gross negligence, or "
    "willful misconduct, and except for any remedy available to the Contractor under the statutes "
    "referenced in Section 4.7, the Company Parties' aggregate "
    "liability arising out of or relating to this Agreement, including under Section 11.2, "
    "will not exceed ten thousand dollars ($10,000.00), and the Company Parties' aggregate obligation "
    "under Section 11.2 is included within and subject to that amount. Neither Party will be liable to "
    "the other for indirect, incidental, "
    "special, consequential, or exemplary damages or for lost profits or opportunities, except for that "
    "Party's own fraud, gross negligence, or willful misconduct and except for any remedy available to "
    "the Contractor under the statutes referenced in Section 4.7. This Section does "
    "not limit the Contractor's obligations or liability under Section 2.9(j), Section 8.5, Section 10, "
    "Section 11.1, or the payment obligation in Section 12.4, or "
    "the Contractor's liability for fraud, willful misconduct, or misappropriation of any Company Account, "
    "the Brand, or the Platform. Notwithstanding the foregoing, the Contractor's aggregate liability "
    "arising out of or relating to this Agreement, including indemnified claims, to the extent arising "
    "solely from the Contractor's ordinary negligence &mdash; and not from the Contractor's fraud, gross "
    "negligence, or knowing, intentional, or reckless conduct, or any knowing or reckless breach of "
    "Section 2.9, Section 8.3, or Section 10 &mdash; will not exceed the greater of (i) the total amounts "
    "paid and payable to the Contractor under this Agreement in the twelve (12) months preceding the "
    "event giving rise to the claim and (ii) twenty-five thousand dollars ($25,000.00)."))

# ---------------------------------------------------------------- 12
story.append(P("12. Termination", heading_style))
story.append(P(
    "<b>12.1 By the Company.</b> The Company may terminate this Agreement at any time, for any reason or "
    "for no reason, by written notice to the Contractor (email is sufficient), effective immediately or on "
    "any later date the notice states."))
story.append(P(
    "<b>12.2 By the Contractor.</b> The Contractor may terminate this Agreement for any reason on fourteen "
    "(14) days' written notice."))
story.append(P(
    "<b>12.3 Effect of termination.</b> Upon termination: (a) the Company will pay the Contractor's share "
    "of Shared Revenue on amounts received through the termination date and during the Tail Period (as "
    "defined in Section 12.4), subject to Section 12.4, on the "
    "normal schedule; Section 5 applies to Monthly Deliverables for months ending on or before the "
    "termination date and, as to the calendar month in which the termination date falls, to the portion "
    "of that month through the termination date, with the podcast deliverable in Section 2.1(a) prorated "
    "to two (2) episodes for each full seven-day period elapsed in that month through the termination "
    "date, and with any reduction under Section 5.2(a) applied only to the portion of that month's "
    "Podcast Revenue share attributable to episodes published in that month through the termination "
    "date; no reduction is made under Section 5 for any period after the termination date; "
    "(b) the Contractor will comply with Section 8.6; and "
    "(c) Section 6.2 governs use of the Contractor's Likeness. If the Company terminates following a "
    "Shortfall Notice or for the Contractor's material breach, the Company retains all other rights and "
    "remedies available under this Agreement and applicable law, subject in each case to the exclusive "
    "remedies stated in Sections 5.1, 8.5 and 12.4."))
story.append(P(
    "<b>12.4 Tail Period.</b> The \"Tail Period\" is the sixty (60) days following the termination date. "
    "Shared Revenue received during the Tail Period from Brand Deals contracted before the termination "
    "date, and Podcast Revenue received during the Tail Period that is attributable to episodes published "
    "before the termination date, is shared under Section 4.1. No share is owed on Brand Deals contracted "
    "after the termination date, on episodes published after the termination date, or on revenue received "
    "after the Tail Period, other than amounts treated as Shared Revenue under Section 2.9(j)."))
story.append(P(
    "<b>Unreferred opportunities.</b> If a Nosebleed Opportunity was actually offered to or received by "
    "the Contractor during the Term, the Contractor did not refer it to the Company as Section 4.2 "
    "requires, and the Contractor enters into it during the Tail Period, the Contractor will pay the "
    "Company an amount equal to fifty percent (50%) of the gross consideration the Contractor actually "
    "receives under that opportunity, without deduction, within thirty (30) days of each receipt. The "
    "Company bears the burden of showing that the "
    "opportunity was offered to or received by the Contractor during the Term. This paragraph does not "
    "apply to an opportunity that first arises after the termination date, including a new opportunity "
    "from a counterparty the Contractor dealt with during the Term, and does not apply to an opportunity "
    "the Contractor referred that the Company declined or did not respond to within the period stated in "
    "Section 4.2. The Contractor remains free to enter into the opportunity; this paragraph creates a "
    "payment obligation only and imposes no restriction on the Contractor after the Term. If the "
    "Contractor enters into an unreferred Nosebleed Opportunity during the Term, the Contractor will "
    "likewise pay the Company an amount equal to fifty percent (50%) of the gross consideration the "
    "Contractor actually receives under that opportunity, without deduction, within thirty (30) days of "
    "each receipt. The payment obligations in this paragraph are the Company's sole monetary remedy for "
    "a failure to refer, whether the Contractor enters into the opportunity during the Term or during "
    "the Tail Period, and do not limit the Company's right to terminate under Section 12.1."))
story.append(P(
    "<b>12.5 Transition assistance.</b> For up to thirty (30) days after termination, the Contractor will "
    "provide reasonable incidental cooperation to facilitate an orderly handover, limited to returning or "
    "transferring drafts, recorded but unpublished episodes, scheduled content, picks records, Company "
    "files, and outstanding campaign information; answering reasonable questions; and confirming account "
    "settings. This does not require continued content creation, podcasting, or handicapping after "
    "termination. The Contractor's obligations under this Section are included in, and fully compensated "
    "by, the consideration payable under Section 4."))
story.append(P(
    "<b>12.6 Survival.</b> Sections 2.9(j), 2.10 (as to Guest appearances during the Term), 4.1 and 4.3 "
    "(in each case as to Shared Revenue received through the end of the Tail Period and as to any amount "
    "treated as Shared Revenue under Section 2.9(j), whenever received), 4.4 (for two (2) years after "
    "the end of the Tail Period), 4.5 through 4.7, "
    "5 (as to months ending on or before the termination date and the portion of the termination month "
    "through the termination date), 6, 7, "
    "8.1, 8.2, 8.3, 8.5, 8.6, 9.1, 10, 11, 12.3 through 12.6, and 13 survive termination."))

# ---------------------------------------------------------------- 13
story.append(P("13. General", heading_style))
story.append(P("<b>13.1 Governing law.</b> This Agreement is governed by the laws of the State of New York, "
               "without regard to conflict-of-laws rules."))
story.append(P(
    "<b>13.2 Dispute resolution.</b> Before filing any action, the Parties will first attempt in good faith "
    "to resolve any dispute arising out of this Agreement through direct negotiation for at least fifteen "
    "(15) days after written notice of the dispute. If negotiation fails, the Parties will submit the "
    "dispute to non-binding mediation before a mutually agreed mediator, with the mediator's costs shared "
    "equally. If the dispute is not resolved within thirty (30) days after mediation begins (or a Party "
    "refuses to mediate), any Party may bring the dispute exclusively in the state or federal courts "
    "located in the State of New York, and each Party consents to the personal jurisdiction and venue of "
    "those courts. Nothing in this Section prevents any Party from seeking urgent injunctive relief in "
    "those courts at any time (including under Sections 6, 7, 8 and 10)."))
story.append(P(
    "<b>13.3 Entire agreement; amendments.</b> This Agreement (including Exhibit A) is the entire agreement "
    "among the Parties regarding its subject matter and supersedes all prior discussions, proposals, and "
    "term sheets, whether written or oral. It may be amended only in a writing signed by all Parties."))
story.append(P(
    "<b>13.4 Assignment.</b> The Contractor may not assign or delegate this Agreement or any right or "
    "obligation under it. Section 9.3 permits performance through a wholly owned entity and is not an "
    "assignment. Either Company Party may assign its rights and obligations under this Agreement without "
    "consent to the other Company Party, to an affiliate, or to a successor in connection with a merger, "
    "acquisition, or sale of all or substantially all of its assets."))
story.append(P(
    "<b>13.5 Notices.</b> Notices are given in writing by email to the addresses stated on Exhibit A, or to "
    "any address a Party designates by notice given under this Section, and are effective when sent "
    "absent a bounce or error message. A notice under Section 8.5, 12.1 or 12.2 must be sent to the "
    "email address for the recipient stated on Exhibit A. As a courtesy the sender will also copy any "
    "other email address the recipient has used to communicate with the sender in the preceding sixty "
    "(60) days; failure to send a courtesy copy does not affect the effectiveness of the notice."))
story.append(P(
    "<b>13.6 Severability; waiver.</b> If any provision of this Agreement is held unenforceable, it will be "
    "modified to the minimum extent necessary to make it enforceable, and the remainder will remain in "
    "effect. A Party's failure to enforce any provision is not a waiver of it. Nothing in this Agreement "
    "waives, or requires the Contractor to waive, any right that cannot be waived under applicable law."))
story.append(P(
    "<b>13.7 Counterparts; electronic signatures.</b> This Agreement may be signed in counterparts, and "
    "electronic signatures are valid and binding."))
story.append(P(
    "<b>13.8 Force majeure.</b> Neither Party is liable for a delay or failure to perform caused by an "
    "event beyond its reasonable control, including a platform outage, suspension, or policy change, a "
    "regulatory action affecting the category, illness, or a natural disaster. The affected Party will "
    "notify the other promptly, and a failure so caused is not a shortfall under Section 5. This Section "
    "does not excuse or delay any payment obligation under Section 4 and does not affect the Contractor's "
    "rights under Section 4.7. Illness is excused under this Section only on the documentation basis "
    "stated in Section 5.3."))

story.append(Spacer(1, 10))
story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#999999"), spaceAfter=10))
story.append(P("IN WITNESS WHEREOF, the Parties have executed this Agreement as of the Effective Date set "
               "forth on Exhibit A."))
story.append(Spacer(1, 14))


def sigblock(compact=False):
    gap = 24 if compact else 28
    def col(entity, name, title):
        rows = [Paragraph("<b>%s</b>" % entity, sig_style), Spacer(1, gap),
                Paragraph("Signature: _________________", sig_style), Spacer(1, 10),
                Paragraph("Name: %s" % name, sig_style)]
        if not compact:
            if title:
                rows += [Spacer(1, 10), Paragraph("Title: %s" % title, sig_style)]
            rows += [Spacer(1, 10), Paragraph("Date: ___________________", sig_style)]
        return rows
    cols = [col("JGN MEDIA LLC", "Nicholas Restivo", "Chief Executive Officer"),
            col("NOSEBLEED SPORTS LLC", "Nicholas Restivo", "Chief Executive Officer"),
            col("CONTRACTOR", CONTRACTOR_NAME, None)]
    n = max(len(c) for c in cols)
    rows = [[c[i] if i < len(c) else "" for c in cols] for i in range(n)]
    t = Table(rows, colWidths=[2.15 * inch] * 3)
    t.setStyle(TableStyle([("VALIGN", (0, 0), (-1, -1), "TOP"), ("LEFTPADDING", (0, 0), (-1, -1), 0),
                           ("RIGHTPADDING", (0, 0), (-1, -1), 8)]))
    return t


# keep the witness line and the signature columns on one page
_sig_tail = [story.pop(), story.pop(), story.pop()][::-1]  # rule, witness paragraph, spacer
story.append(KeepTogether(_sig_tail + [sigblock()]))

# ---------------------------------------------------------------- Exhibit A
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
    ["Company notice email (JGN Media LLC and Nosebleed Sports LLC)", COMPANY_NOTICE_EMAIL],
    ["Managed Accounts (Section 2.1(a))", MANAGED_ACCOUNTS],
    ["Minimum podcast volume", PODCAST_MINIMUM],
    ["Revenue share", REV_SHARE_SUMMARY],
    ["Liquidated damages amount (Section 8.5)", LIQUIDATED_DAMAGES],
    ["Payment method", PAYMENT_METHOD],
]
cell_k = ParagraphStyle("CK", parent=body_style, fontName="Helvetica-Bold", fontSize=9.5, leading=12, spaceAfter=0)
cell_v = ParagraphStyle("CV", parent=body_style, fontSize=9.5, leading=12, spaceAfter=0)
rows = [[Paragraph(k, cell_k), Paragraph(v if v else "&nbsp;", cell_v)] for k, v in rows]
ex = Table(rows, colWidths=[2.6 * inch, 4.1 * inch])
ex.setStyle(TableStyle([
    ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"), ("FONTNAME", (1, 0), (1, -1), "Helvetica"),
    ("FONTSIZE", (0, 0), (-1, -1), 9.5), ("BACKGROUND", (0, 0), (0, -1), colors.HexColor("#EFEFEF")),
    ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#BBBBBB")), ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ("LEFTPADDING", (0, 0), (-1, -1), 8), ("RIGHTPADDING", (0, 0), (-1, -1), 8),
    ("TOPPADDING", (0, 0), (-1, -1), 6), ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
]))
story.append(ex); story.append(Spacer(1, 8))
story.append(P("Rows left blank above are completed by hand at signing and initialed by all Parties, except "
               "that the Liquidated damages amount row is intentionally left blank, in which case the tiers "
               "in Section 8.5 apply. This "
               "Exhibit A is incorporated into and forms part of the Podcast, Handicapping, and Content "
               "Services Agreement among JGN Media LLC, Nosebleed Sports LLC, and the Contractor named "
               "above. If this Exhibit and the body of the Agreement conflict, the body of the Agreement "
               "controls, except where the body expressly provides that an amount or term stated on this "
               "Exhibit governs."))
story.append(Spacer(1, 14))
story.append(P("Initials:&nbsp;&nbsp;JGN ________&nbsp;&nbsp;&nbsp;NSL ________&nbsp;&nbsp;&nbsp;"
               "Contractor ________"))

doc = SimpleDocTemplate(OUT, pagesize=letter, leftMargin=0.9 * inch, rightMargin=0.9 * inch,
                        topMargin=0.8 * inch, bottomMargin=0.8 * inch,
                        title="Podcast, Handicapping, and Content Services Agreement — JGN Media LLC, "
                              "Nosebleed Sports LLC & [Contractor]",
                        author="JGN Media LLC")
doc.build(story)
print("Wrote", OUT, "(SHARE_PERFORMED_DEALS=%s)" % SHARE_PERFORMED_DEALS)
