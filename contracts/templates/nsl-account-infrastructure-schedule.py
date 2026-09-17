#!/usr/bin/env python3
# TEMPLATE — public repository copy. Names, EIN and JGN ownership are placeholders; fill from the
# private master record before generating a signing copy. Never commit a filled copy.
"""Company Account and Infrastructure Schedule of Nosebleed Sports LLC.

Update of prior-binder document 17. The prior draft was written before formation and carried
"TBD" on every line. This version fills in what is now known - Delaware formation complete, file
number, registered agent confirmed, EIN issued - states the target owner of each account by
reference to Schedules C and D of the LLC Agreement and to the brand switch, and keeps "TBD" only
where the status genuinely is unknown (accounts not yet opened, transfers not yet executed,
the nosebleedsport.com registrar not yet recorded).

The Control Standard is stated once, in Section 2, instead of being repeated on every row.

Brand-kit rows follow nbs_style.BRAND_KIT_OWNER.
"""

import os
from nbs_style import (  # fill-in constants and style helpers
    JGN_MODE, BRAND_KIT_OWNER, WORKDIR, JGN_NAME, COMPANY_NAME, COMPANY_STATE, FORMATION_DATE,
    DE_FILE_NUMBER, REG_AGENT, PRINCIPAL_OFFICE, EIN, CEO_NAME, CEO_TITLE, EFFECTIVE_DATE, MARK,
    T_MASTER, T_SECOND, T_ASSIGN, T_MKTG, T_TSA, T_OA, T_INFRA, DASH,
    Spacer, Table, TableStyle, HRFlowable, PageBreak, colors, inch, P, H, BUL, GRID,
    masthead, build, sig_style, body_style, Paragraph)

# =============================== FILL-INS ===============================
OUT = os.environ.get("OUT_PDF", os.path.join(
    WORKDIR, "NSL_Company_Account_and_Infrastructure_Schedule.pdf"))
NSL = COMPANY_NAME
JGN = JGN_NAME
TBD = "TBD"
CONFIRMED = "Confirmed"
PENDING = "Not yet opened"
TRANSFER = "Transfer pending"
BRAND_OWNER_ENTITY = JGN if JGN_MODE else NSL
# ========================================================================

cell = body_style.clone("cell")
cell.fontSize = 8.6
cell.leading = 11
cell.spaceAfter = 0


def C(t):
    return Paragraph(t, cell)


# (account / system, target owner, status)
ROWS_FORMATION = [
    ("Delaware registered-agent account and filing records " + DASH + " " + REG_AGENT,
     NSL,
     CONFIRMED + ": Certificate of Formation filed " + FORMATION_DATE + ", file number " +
     DE_FILE_NUMBER + "; registered agent engaged and to be maintained; Delaware annual tax on the "
     "compliance calendar"),
    ("IRS EIN records", NSL,
     CONFIRMED + ": EIN " + EIN + " issued to the Company and ratified in the organizational consent"),
    ("New York foreign qualification and state and local tax accounts", NSL,
     TBD + ": qualification in New York, where the principal office at " + PRINCIPAL_OFFICE +
     " is located, and related tax registrations are directed but not yet completed"),
    ("Company bank account and, when opened, the Company's own payment-processing account", NSL,
     PENDING + ": authorized in the organizational consent; signers appointed; no account opened as "
     "of the date of this Schedule"),
]

ROWS_DOMAINS = [
    ("Domain nosebleedsport.com " + DASH + " registrar account", NSL,
     TRANSFER + "; registrar " + TBD + ": the registrar for this domain is not recorded in the "
     "Company's records and must be identified before transfer"),
    ("Domain nosebleedsportsmedia.com and all subdomains " + DASH + " GoDaddy registrar account", NSL,
     TRANSFER + ": listed on Schedule C to the " + T_OA + "; GoDaddy account transfer or domain "
     "push to a Company-controlled registrar account not yet executed"),
    ("Google Workspace for nosebleedsportsmedia.com", NSL,
     TRANSFER + ": listed on Schedule C; administrative transfer to a Company-controlled super "
     "administrator not yet executed"),
    ("Product repositories currently housed in the GitHub organization GT-Product-Studio "
     "(nosebleedsportsmedia, nosebleed-app, nosebleed-picks, nosebleed-runner, nosebleed-dashboard, "
     "nosebleed-odds-archive)", NSL,
     TRANSFER + "; organization ownership " + TBD + ": the repositories are listed on Schedule C; "
     "control of the GT-Product-Studio organization itself is unconfirmed, and unrelated projects in "
     "it are not Company assets"),
]

ROWS_PRODUCT = [
    ("Vercel " + DASH + " hosting and deployment", NSL, TRANSFER + ": listed on Schedule C"),
    ("Supabase " + DASH + " database and backend", NSL, TRANSFER + ": listed on Schedule C"),
    ("Clerk " + DASH + " authentication", NSL, TRANSFER + ": listed on Schedule C"),
    ("Whop " + DASH + " subscription and community commerce", NSL, TRANSFER + ": listed on Schedule C"),
    ("Resend " + DASH + " transactional email", NSL, TRANSFER + ": listed on Schedule C"),
    ("PostHog " + DASH + " product analytics", NSL, TRANSFER + ": listed on Schedule C"),
    ("Nosebleed Discord server, bots, channels, integrations and member data", NSL,
     TRANSFER + ": listed on Schedule C; server ownership transfer subject to Discord platform terms, "
     "privacy requirements and transferable rights"),
]

ROWS_JGN = [
    ("Apple Developer account", JGN,
     "JGN-retained (Schedule D). The Company uses it temporarily under the " + T_TSA + " where Apple "
     "rules permit. Company-owned account: " + PENDING + ". Application transfer to the Company's "
     "account on migration"),
    ("Stripe and other payment infrastructure", JGN,
     "JGN-retained (Schedule D). The Company uses it temporarily under the " + T_TSA + " where Stripe "
     "rules permit, with remittance of Company receipts " + DASH + " see Section 5.3 of that "
     "agreement. Company-owned account: " + PENDING),
    ("Legacy social media accounts (X, TikTok @NosebleedSportsMedia, Instagram "
     "@NosebleedSportsMedia and others)", JGN,
     "JGN-retained (Schedule D). Not transferred. The Company's distribution rights come from the " +
     T_MKTG),
    ("OpenAI, Anthropic and other AI development accounts and histories", JGN,
     "JGN-retained (Schedule D). Not represented as Company-owned unless a platform-compliant "
     "transfer or export is confirmed; none is confirmed"),
]

if JGN_MODE:
    ROWS_BRAND = [
        (MARK + " word mark, common-law rights and goodwill", JGN,
         "JGN-owned (Schedule D). Licensed to the Company in the Product Field under the " +
         T_MASTER),
        ("United States Patent and Trademark Office application and, when issued, registration for " +
         MARK, JGN,
         TBD + ": authorized in the " + JGN_NAME + " Written Consent; application not yet filed. To "
         "be filed and maintained in JGN's name under Section 5.2 of the " + T_MASTER),
        ("Brand kit " + DASH + " logo artwork and source files, logo variations, visual identity, "
         "design system and product-brand design assets", JGN,
         "Assigned by the Company to JGN under the " + T_ASSIGN + " and licensed back to the Company "
         "in the Product Field under the " + T_MASTER + ". Source and design files to be delivered "
         "to JGN; the Company retains working copies"),
        ("Design and brand file storage holding the brand kit", JGN,
         TBD + ": JGN to hold the master files; the Company to hold working copies. Administrative "
         "access arrangements not yet implemented"),
    ]
else:
    ROWS_BRAND = [
        (MARK + " word mark, common-law rights and goodwill", JGN,
         "JGN-owned (Schedule D). Licensed to the Company in the Product Field under the " +
         T_MASTER),
        ("United States Patent and Trademark Office application and, when issued, registration for " +
         MARK, JGN,
         TBD + ": authorized in the " + JGN_NAME + " Written Consent; application not yet filed. To "
         "be filed and maintained in JGN's name under Section 5.2 of the " + T_MASTER),
        ("Brand kit " + DASH + " logo artwork and source files, logo variations, visual identity, "
         "design system and product-brand design assets", NSL,
         "Company-owned through [Founder B]'s assignment agreement and licensed to JGN for the "
         "Media Field under the " + T_SECOND),
        ("Design and brand file storage holding the brand kit", NSL,
         TBD + ": the Company to hold the master files and give JGN access for Media Field use. "
         "Administrative access arrangements not yet implemented"),
    ]

SECTIONS = [
    ("3. Formation, Tax and Banking", ROWS_FORMATION),
    ("4. Domains, Workspace and Repositories", ROWS_DOMAINS),
    ("5. Product Infrastructure and Community", ROWS_PRODUCT),
    ("6. Brand Assets and Trademark", ROWS_BRAND),
    ("7. JGN Retained Accounts", ROWS_JGN),
]

s = []
masthead(s, [T_INFRA.upper(),
             "of " + COMPANY_NAME + " " + DASH + " a " + COMPANY_STATE + " limited liability company",
             "Effective as of " + EFFECTIVE_DATE])

# ---------------------------------------------------------------- 1
s.append(H("1. Formation Status"))
s.append(P("Formation is complete. " + COMPANY_NAME + " is a " + COMPANY_STATE + " limited liability "
           "company whose Certificate of Formation was filed with the Delaware Secretary of State on " +
           FORMATION_DATE + " under file number " + DE_FILE_NUMBER + ". Its registered agent and "
           "registered office are " + REG_AGENT + ". Its Employer Identification Number is " + EIN +
           ". Its principal office is " + PRINCIPAL_OFFICE + ". The Company is member-managed with "
           "officers, and " + CEO_NAME + " is its " + CEO_TITLE + "."))
s.append(P("This Schedule records, for each account and system the Company's business depends on, "
           "who is intended to own it and what its status is today. It is a factual record adopted "
           "under Section 9.5 of the " + T_OA + " (the \"" + T_OA + "\"). It does not itself transfer "
           "anything: assignments are governed by Schedule C to the " + T_OA + ", retained assets by "
           "Schedule D, brand rights by the " + T_MASTER + " and the " + T_SECOND + ", audience "
           "rights by the " + T_MKTG + ", and temporary use of JGN infrastructure by the " + T_TSA +
           ". Where a status reads " + TBD + ", the status is genuinely unknown or the step is "
           "genuinely not done; it is not a placeholder for a term that has been agreed."))

# ---------------------------------------------------------------- 2
s.append(H("2. Control Standard"))
s.append(P("Each account and system whose target owner is " + COMPANY_NAME + " is to be brought to "
           "the following standard (the \"Control Standard\"), which applies to every row of this "
           "Schedule without being repeated on each row:"))
for b in [
    "Company-controlled email address as the account owner and recovery address, not a personal "
    "address",
    "Company billing information and Company payment method",
    "Company-controlled recovery mechanisms, including recovery codes held in the Company's "
    "credential vault",
    "Credentials stored in a secure Company credential vault, never shared by message or document",
    "Multi-factor authentication enabled wherever the platform offers it",
    "At least two Company-approved administrators wherever practical, so that no single person can "
    "lock the Company out",
    "Administrative access does not create personal ownership, and a person with access holds it for "
    "the Company and must surrender it on request or on leaving Service",
]:
    s.append(BUL(b))
s.append(Spacer(1, 3))
s.append(P("Target control must be distinguished from current implementation status. A row's target "
           "owner states where the account is intended to sit; its status states where it actually "
           "is today. The " + CEO_TITLE + " maintains this Schedule and updates a row when a "
           "transfer, opening or migration completes."))

# ---------------------------------------------------------------- tables
for heading, rows in SECTIONS:
    s.append(H(heading))
    data = [[C("<b>Account / system</b>"), C("<b>Target owner</b>"), C("<b>Status</b>")]]
    for a, o, st in rows:
        data.append([C(a), C(o), C(st)])
    t = Table(data, colWidths=[2.35 * inch, 1.35 * inch, 3.1 * inch], repeatRows=1)
    t.setStyle(GRID)
    s.append(t)

# ---------------------------------------------------------------- 8
s.append(H("8. Negative Confirmations"))
s.append(P("There is no Beehiiv account and no Substack account. This Schedule does not assert "
           "ownership or control of any platform or account beyond those expressly listed. No "
           "account listed as JGN-retained is a Company asset, and no account listed with a " + TBD +
           " status is represented as transferred, opened or migrated. The Company has no employees; "
           "persons with administrative access are Members, officers or independent contractors."))

# ---------------------------------------------------------------- 9
s.append(H("9. Open Items"))
for b in [
    "Registrar for nosebleedsport.com is not recorded and must be identified before the domain can "
    "be transferred",
    "Control of the GitHub organization GT-Product-Studio is unconfirmed; the Company's repositories "
    "are identified, the organization is not",
    "Company bank account and Company-owned payment-processing account are not yet opened, which is "
    "what keeps the " + T_TSA + " in force",
    "New York foreign qualification and related tax registrations are directed but not completed",
    "The " + MARK + " trademark application has been authorized but not filed",
    "Platform-by-platform confirmation that each transfer listed as pending is permitted by that "
    "platform's terms has not been completed",
]:
    s.append(BUL(b))

# ---------------------------------------------------------------- adoption
s.append(Spacer(1, 10))
s.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#999999"), spaceAfter=8))
s.append(P("Adopted by the Company and certified as accurate as of the date signed below, subject to "
           "the open items in Section 9."))
s.append(Spacer(1, 10))
s.append(P(COMPANY_NAME, sig_style))
s.append(P("By: _________________________________________", sig_style))
s.append(P("Name: " + CEO_NAME, sig_style))
s.append(P("Title: " + CEO_TITLE, sig_style))
s.append(P("Date signed: __________________________________", sig_style))

build(s, OUT, T_INFRA + " " + DASH + " " + COMPANY_NAME)
