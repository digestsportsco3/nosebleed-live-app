#!/usr/bin/env python3
# TEMPLATE — public repository copy. Names, EIN and JGN ownership are placeholders; fill from the
# private master record before generating a signing copy. Never commit a filled copy.
"""Written Consent of the Members of JGN Media LLC.

Update of prior-binder document 20. This is the JGN-side approval that has to exist before
Nicholas Restivo can sign anything for JGN. All five members hold 20% each; JGN's governing
documents may require 80% approval, so all five sign and the consent recites that threshold.

Approves, by name: the Schedule C asset assignment to Nosebleed Sports LLC, the Master Brand and
Trademark License, the second brand document (the Brand Asset Assignment in "JGN" mode, the Logo
and Visual Identity License in "NSL" mode), the Marketing and Audience License, the Transition
Services Agreement, the [Class B Member] Talent Agreement to which JGN is a co-party, the treatment of
JGN's pre-formation advances as a Company obligation rather than equity, the USPTO filing, and
Nicholas Restivo's authority to sign.

Removed from the prior draft: the pre-formation TBD banner, the CPA/tax-counsel confirmation step
in the signing sequence, and the reference to a final "tax-structured transfer document".
"""

import os
from nbs_style import (  # fill-in constants and style helpers
    JGN_MODE, BRAND_KIT_OWNER, WORKDIR, JGN_NAME, JGN_STATE, JGN_ADDRESS, JGN_SIGNER,
    JGN_SIGNER_TITLE, JGN_MEMBERS, JGN_MEMBER_PCT, JGN_THRESHOLD, JGN_ADVANCES,
    COMPANY_NAME, COMPANY_STATE, FORMATION_DATE, DE_FILE_NUMBER, PRINCIPAL_OFFICE, EIN,
    CEO_NAME, CEO_TITLE, CTO_NAME, EFFECTIVE_DATE, MARK,
    T_MASTER, T_ASSIGN, T_LOGO, T_SECOND, T_MKTG, T_TSA, T_INFRA, T_OA, T_BROCK, DASH,
    Spacer, Table, TableStyle, HRFlowable, colors, inch, P, H, BUL, GRID, build,
    sig_style, title_style, subtitle_style, Paragraph)

# =============================== FILL-INS ===============================
OUT = os.environ.get("OUT_PDF", os.path.join(WORKDIR, "JGN_Media_LLC_Written_Consent.pdf"))
CONSENT_TITLE = "Written Consent of the Members of " + JGN_NAME
# ========================================================================

s = []
s.append(P("WRITTEN CONSENT OF THE MEMBERS", title_style))
s.append(P("of", subtitle_style))
s.append(P(JGN_NAME.upper(), title_style))
s.append(P("approving the " + COMPANY_NAME + " asset assignment and the intercompany agreements",
           subtitle_style))
s.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#999999"), spaceAfter=12))

s.append(P("The undersigned, being all of the members of <b>" + JGN_NAME + "</b>, a " + JGN_STATE +
           " limited liability company with its principal office at " + JGN_ADDRESS + " (\"JGN\"), "
           "acting by written consent without a meeting, adopt the following resolutions effective "
           "as of <b>" + EFFECTIVE_DATE + "</b> (the \"Effective Date\")."))

# ---------------------------------------------------------------- 1
s.append(H("1. Members, Ownership and Approval Threshold"))
s.append(P("The members of JGN and their ownership are:"))
rows = [["JGN member", "Ownership"]] + [[m, JGN_MEMBER_PCT] for m in JGN_MEMBERS]
rows.append(["TOTAL", "100%"])
t = Table(rows, colWidths=[3.4 * inch, 1.6 * inch])
t.setStyle(GRID)
t.setStyle(TableStyle([("FONTNAME", (0, len(JGN_MEMBERS) + 1), (-1, len(JGN_MEMBERS) + 1),
                        "Helvetica-Bold")]))
s.append(t)
s.append(Spacer(1, 6))
s.append(P("RESOLVED, that JGN's governing documents may require the approval of members holding at "
           "least " + JGN_THRESHOLD + " of the membership interests for the actions approved below; "
           "that all five members, holding one hundred percent (100%) in the aggregate, sign this "
           "consent, so that any applicable threshold, including " + JGN_THRESHOLD + " and "
           "unanimity, is satisfied; and that this consent is the JGN approval required by Schedule "
           "E to the " + COMPANY_NAME + " " + T_OA + " (the \"" + T_OA + "\") and by the resolutions "
           "of " + COMPANY_NAME + " approving the same agreements."))
s.append(P("RESOLVED FURTHER, that the members acknowledge that each of them other than " + CTO_NAME +
           ", who holds no interest in JGN, is also a Class A Member of " + COMPANY_NAME +
           " (the \"Company\"), a " + COMPANY_STATE + " limited liability company formed on " +
           FORMATION_DATE + " under file number " + DE_FILE_NUMBER + " holding Employer "
           "Identification Number " + EIN + " with its principal office at " + PRINCIPAL_OFFICE +
           "; that every approval below is given with that overlap fully disclosed and after "
           "consideration of it; and that no member is disqualified from voting on it."))

# ---------------------------------------------------------------- 2
s.append(H("2. Assignment of the Assigned Assets to the Company"))
s.append(P("RESOLVED, that JGN is authorized to assign, and hereby approves the assignment to the "
           "Company of, the Assigned Assets listed on Schedule C to the " + T_OA + ", including the "
           "identified Nosebleed Sports product repositories, the domains nosebleedsport.com and "
           "nosebleedsportsmedia.com and their subdomains, the Nosebleed Discord server with its "
           "bots, integrations and member data, the confirmed infrastructure and product service "
           "accounts (Vercel, Supabase, Clerk, Whop, Resend, PostHog and Google Workspace), and the "
           "website, application, backend, APIs, databases, picks systems, prediction models, AI "
           "systems and product-specific content created for the Nosebleed Sports product business, "
           "in each case subject to third-party platform terms and to completion of post-closing "
           "operational transfer steps; and that JGN approves the domain, repository, database, "
           "Discord and account transfers required to complete it."))
s.append(P("RESOLVED FURTHER, that the assignment is made without cash consideration, that no "
           "promissory note, equity interest, unit, option or other security of the Company is "
           "issued or promised to JGN for it, and that the consideration to JGN is the intercompany "
           "arrangement approved in this consent taken as a whole."))

# ---------------------------------------------------------------- 3
s.append(H("3. JGN Retained Assets"))
s.append(P("RESOLVED, that JGN confirms it retains, and does not assign, the JGN Retained Assets "
           "listed on Schedule D to the " + T_OA + ", including the master " + MARK + " name, brand "
           "and trademark and the common-law rights and historical goodwill in it, the legacy social "
           "media accounts, the legacy media assets and historical content, the historical "
           "sponsorship, advertising and affiliate agreements, historical revenue, and JGN's Apple "
           "Developer, Stripe, payment and AI-history accounts" +
           (", together with the brand kit acquired under the " + T_ASSIGN + " approved in Section 5"
            if JGN_MODE else "") +
           "; and that the Company receives only the assignment, license and transition rights "
           "expressly granted in the agreements approved in this consent."))

# ---------------------------------------------------------------- 4
s.append(H("4. " + T_MASTER))
s.append(P("RESOLVED, that the <b>" + T_MASTER + "</b> from JGN to the Company is approved in the "
           "form presented, under which JGN grants the Company an exclusive, royalty-free, fully "
           "paid-up, perpetual license to use the " + MARK + " brand" +
           (", including the brand kit," if JGN_MODE else "") + " in the Product Field, being digital "
           "products and services offered under the brand, and JGN retains the Media Field, being "
           "social media accounts and content, editorial and media publishing, sponsorships and "
           "brand deals on JGN properties, and advertising; that the license survives a bona fide "
           "change of control of the Company automatically and for the benefit of the successor, at "
           "no royalty; that the Company may sublicense within the Product Field to its contractors; "
           "that JGN may terminate the license only for the Company's uncured material breach of the "
           "quality-control standards, after sixty (60) days' notice and opportunity to cure; and "
           "that JGN covenants not to license the " + MARK + " mark to any third party in the "
           "Product Field while the license is in effect and not to abandon the mark."))

# ---------------------------------------------------------------- 5
s.append(H("5. " + T_SECOND))
if JGN_MODE:
    s.append(P("RESOLVED, that JGN <b>accepts</b> the <b>" + T_ASSIGN + "</b> from the Company to "
               "JGN in the form presented, under which the Company assigns to JGN the logo artwork "
               "and source files, logo variations, visual identity, design system and product-brand "
               "design assets created by " + CTO_NAME + " and assigned to the Company under his "
               "assignment agreement, together with all copyrights, design rights and goodwill in "
               "them; that the sole consideration given by JGN is the grant of the " + T_MASTER +
               ", and no cash, note or equity is paid or issued by either party; that JGN takes the "
               "assigned assets subject to the " + T_MASTER + "; that JGN assumes no liability or "
               "contract of the Company by reason of the assignment; and that the chain of title "
               "runs " + CTO_NAME + " to the Company under his assignment agreement, and the "
               "Company to JGN under the " + T_ASSIGN + "."))
    s.append(P("RESOLVED FURTHER, that the members determine that holding the entire brand " + DASH +
               " the word mark, the common-law rights and goodwill, the legacy accounts and the "
               "brand kit " + DASH + " in a single entity is in JGN's interest, because it allows a "
               "single owner to file and maintain the trademark application approved in Section 9 "
               "and removes the risk of a split brand in a future transaction."))
else:
    s.append(P("RESOLVED, that the <b>" + T_LOGO + "</b> from the Company to JGN is approved in the "
               "form presented, under which the Company, which owns the logo artwork and source "
               "files, logo variations, visual identity, design system and product-brand design "
               "assets created by " + CTO_NAME + " and assigned to it under his assignment "
               "agreement, grants JGN a nonexclusive, royalty-free, worldwide license to use those "
               "assets in the Media Field on JGN's retained media properties, sublicensable to JGN's "
               "contractors, talent, agencies and sponsors; that JGN will not challenge the "
               "Company's ownership of those assets and the Company will not challenge JGN's "
               "ownership of the " + MARK + " word mark; and that JGN acknowledges the license is "
               "terminable as provided in it and does not affect the " + T_MASTER + "."))

# ---------------------------------------------------------------- 6
s.append(H("6. " + T_MKTG))
s.append(P("RESOLVED, that the <b>" + T_MKTG + "</b> from JGN to the Company is approved in the form "
           "presented, under which JGN grants the Company a nonexclusive, royalty-free right during "
           "its term to distribute Company content and offers through JGN's legacy social media "
           "properties, subject to JGN's reasonable approval, brand and editorial guidelines, "
           "platform rules and JGN's existing sponsorship commitments; that JGN transfers no "
           "account, handle, follower list or historical media asset; that JGN makes no minimum "
           "posting, reach or performance commitment and may promote competing products; that the "
           "license is terminable on thirty (30) days' notice and does not automatically transfer "
           "to a purchaser of the Company standing alone; and that this license is separate from the " +
           T_MASTER + " and its termination does not affect that license."))

# ---------------------------------------------------------------- 7
s.append(H("7. " + T_TSA))
s.append(P("RESOLVED, that the <b>" + T_TSA + "</b> between JGN and the Company is approved in the "
           "form presented, under which JGN permits the Company temporary use of JGN's Apple "
           "Developer, Stripe and other production infrastructure where platform rules permit, until "
           "the Company's own accounts are live; that no service fee, markup, royalty or overhead "
           "allocation is payable to JGN, and the Company reimburses only documented third-party "
           "costs; that JGN will remit any Company revenue it receives every two weeks, net only of "
           "documented deductions, with supporting records; that JGN is not the merchant of record "
           "for the Company beyond what a platform requires during the transition and has no "
           "obligation to continue in that role afterwards; that the migration target is sixty (60) "
           "days after the Effective Date and the agreement ends no later than twelve (12) months "
           "after it; and that if a platform prohibits the arrangement the parties will discontinue "
           "it immediately."))
s.append(P("RESOLVED FURTHER, that the <b>" + T_INFRA + "</b> of the Company is noted, and that JGN "
           "confirms the accounts it is shown as retaining on that schedule are JGN's and are not "
           "Company assets."))

# ---------------------------------------------------------------- 8
s.append(H("8. [Class B Member] Talent Agreement"))
s.append(P("RESOLVED, that the <b>" + T_BROCK + "</b>, to which JGN is a co-party with the Company, "
           "is approved in the form presented, and that JGN's obligations under it, including as to "
           "brand deals contracted through a Company party and the use of JGN's social accounts for "
           "the contractor's services, are approved; that " + JGN_SIGNER + " is authorized to execute "
           "and deliver it for JGN; and that nothing in that agreement gives the contractor any "
           "membership interest, unit, option or other interest in JGN, whose equity remains held "
           "entirely by the five members listed in Section 1."))

# ---------------------------------------------------------------- 9
s.append(H("9. Trademark Application"))
s.append(P("RESOLVED, that JGN is authorized and directed to file an application to register the <b>" +
           MARK + "</b> mark with the United States Patent and Trademark Office in JGN's name, "
           "covering among other goods and services the goods and services in the Product Field; to "
           "prosecute that application, respond to office actions and pay the required fees; to "
           "maintain any resulting registration, including by filing declarations of use and "
           "renewals when due; and not to abandon, cancel, surrender or allow the mark or any "
           "application or registration for it to lapse while the " + T_MASTER + " is in effect; and "
           "that " + JGN_SIGNER + " is authorized to sign the application and related filings and to "
           "engage a filing service, and to use the Company's specimens and evidence of use provided "
           "under that license."))

# ---------------------------------------------------------------- 10
s.append(H("10. JGN Advances"))
s.append(P("RESOLVED, that the members acknowledge that JGN paid " + JGN_ADVANCES + " of documented "
           "July 2026 AI and development expenses, primarily OpenAI and Anthropic development "
           "expenses, on the Company's behalf before the Company was formed; that those amounts, "
           "together with any further such advances the Company's " + CEO_TITLE + " records, are an "
           "unsecured, non-interest-bearing obligation of the Company to JGN, repayable when the "
           "Company's members determine cash is reasonably available, as provided in Section 3.8 of "
           "the " + T_OA + "; and that they are <b>not</b> a capital contribution to the Company, "
           "<b>not</b> equity, <b>not</b> consideration for any unit or other interest in the "
           "Company, and give JGN no ownership, voting, information or approval right in the "
           "Company."))
s.append(P("RESOLVED FURTHER, that JGN is authorized to accept repayment when offered, to record the "
           "obligation on its books as a receivable, and that " + JGN_SIGNER + " will reconcile the "
           "advances to documentation and record the final amount with the Company's " + CEO_TITLE +
           "."))

# ---------------------------------------------------------------- 11
s.append(H("11. Authority to Sign"))
s.append(P("RESOLVED, that <b>" + JGN_SIGNER + "</b> is authorized, as " + JGN_SIGNER_TITLE +
           " of JGN, to execute and deliver on JGN's behalf each agreement approved in this consent, "
           "namely the assignment of the Assigned Assets, the " + T_MASTER + ", the " + T_SECOND +
           ", the " + T_MKTG + ", the " + T_TSA + " and the " + T_BROCK + ", together with the "
           "assignments, transfer requests, platform forms, trademark filings, confirmatory "
           "instruments and further-assurance documents needed to carry them out; and that all "
           "actions he has already taken consistent with these resolutions are ratified."))
s.append(P("RESOLVED FURTHER, that he may agree non-material drafting changes to those documents, "
           "but that any change materially affecting the assets transferred, the consideration, the "
           "liabilities assumed, JGN's economics, JGN's ownership, JGN's retained assets or JGN's "
           "continuing rights requires a new approval by the members at the threshold stated in "
           "Section 1; and that the members acknowledge that " + JGN_SIGNER + " signs for both JGN "
           "and the Company on several of these documents, that this is approved with that fact "
           "disclosed, and that the Company has its own separate approval for its side."))

# ---------------------------------------------------------------- 12
s.append(H("12. Sequence and Effectiveness"))
s.append(P("RESOLVED, that the correct order of execution is: (a) this consent, signed by all five "
           "JGN members; (b) the Company's Initial Member and Organizational Written Consent and its " +
           T_OA + ", signed by the Company's Class A Members; (c) the " + T_MASTER + " and the " +
           T_SECOND + ", which are delivered together, and the " + T_MKTG + "; and (d) the " + T_TSA +
           " and the operational transfer steps; and that " + JGN_SIGNER + " will not sign a "
           "definitive agreement for JGN before this consent is signed."))
s.append(P("RESOLVED FURTHER, that these resolutions take effect on the Effective Date; that this "
           "consent may be signed in counterparts and by electronic signature, each of which is "
           "valid and binding; and that it will be filed with JGN's records and delivered to the "
           "Company as evidence of JGN's approval."))

# ---------------------------------------------------------------- signatures
s.append(Spacer(1, 8))
s.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#999999"), spaceAfter=8))
s.append(P("IN WITNESS WHEREOF, the undersigned, being all of the members of " + JGN_NAME +
           ", have executed this consent as of the Effective Date."))
s.append(Spacer(1, 6))


def memcol(n):
    return [Paragraph("<b>JGN MEMBER</b> " + DASH + " " + JGN_MEMBER_PCT, sig_style),
            Spacer(1, 16),
            Paragraph("Signature: ____________________________", sig_style),
            Paragraph("Name: " + n, sig_style),
            Paragraph("Date signed: __________________", sig_style),
            Spacer(1, 6)]


cols = [memcol(n) for n in JGN_MEMBERS]
for i in range(0, len(cols), 2):
    pair = cols[i:i + 2]
    nrow = max(len(c) for c in pair)
    rws = [[c[j] if j < len(c) else "" for c in pair] + ([""] if len(pair) == 1 else [])
           for j in range(nrow)]
    tt = Table(rws, colWidths=[3.15 * inch, 3.15 * inch])
    tt.setStyle(TableStyle([("VALIGN", (0, 0), (-1, -1), "TOP"),
                            ("LEFTPADDING", (0, 0), (-1, -1), 0)]))
    s.append(tt)

s.append(Spacer(1, 4))
s.append(P("<b>ACKNOWLEDGED by " + JGN_NAME + ":</b>", sig_style))
s.append(P("By: _________________________________________ &nbsp;&nbsp; Name: " + JGN_SIGNER +
           " &nbsp;&nbsp; Title: " + JGN_SIGNER_TITLE + " &nbsp;&nbsp; Date: ______________",
           sig_style))

build(s, OUT, CONSENT_TITLE)
