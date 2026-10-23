#!/usr/bin/env python3
# TEMPLATE — public repository copy. Names, EIN and JGN ownership are placeholders; fill from the
# private master record before generating a signing copy. Never commit a filled copy.
"""Founder PIIAs for Nosebleed Sports LLC - one sign-ready PDF per Class A founder.

    python3 make_founder_piia.py                 -> builds all six
    FOUNDER=christian python3 make_founder_piia.py -> builds one (key from FOUNDERS below)
    BRAND_KIT_OWNER=NSL python3 make_founder_piia.py

This is the document Section 9.2 of the LLC Agreement calls the "PIIA". It is the updated,
post-formation replacement for the prior pre-formation "Version 2.0" founder form: every section
and every protection of that form is carried forward in the same order, with the summary prose
written out as operative clauses, the formation facts stated as confirmed, and the two statutory
notices the prior form only pointed at added as Exhibits 1 and 2.
"""

import os
import re

from nbs_style import (
    KeepTogether,  # fill-in constants and style helpers
    JGN_MODE, BRAND_KIT_OWNER, WORKDIR, JGN_NAME, COMPANY_NAME, COMPANY_STATE, FORMATION_DATE,
    DE_FILE_NUMBER, REG_AGENT, PRINCIPAL_OFFICE, EIN, CEO_NAME, CEO_TITLE, CTO_NAME,
    EFFECTIVE_DATE, MARK, T_OA, T_PIIA, DASH, body_style, heading_style, bullet_style, sig_style, title_style,
    subtitle_style, Spacer, HRFlowable, PageBreak, colors, P, H, BUL, masthead, build)

# =============================== FILL-INS ===============================
# One list, so the names can be placeholder-scrubbed later. (name, officer title, key)
FOUNDERS = [
    ("Nicholas Restivo", "Chief Executive Officer", "nick"),
    ("[Founder B]", "Chief Technology Officer", "christian"),
    ("[Founder E]", "Chief Operating Officer", "gabriel"),
    ("[Founder D]", "Chief AI Officer", "stephen"),
    ("[Founder C]", "Chief Information Officer", "michael"),
    ("[Founder F]", "Business Development Officer", "jacob"),
]

NONSOLICIT_PERIOD = "twelve (12) months"
NO_NONCOMPETE = "does not impose a general non-compete"
NEGOTIATION_DAYS = "fifteen (15)"
MEDIATION_DAYS = "thirty (30)"
RETURN_DAYS = "five (5) business"

# Kept tight so each agreement lands in the 5-7 page target (body + signatures + Schedule A and
# the two Exhibits).
FS = float(os.environ.get("PIIA_FONT", "8.4"))
body_style.fontSize = FS
body_style.leading = FS * 1.30
body_style.spaceAfter = 3.5
bullet_style.fontSize = FS
bullet_style.leading = FS * 1.30
bullet_style.spaceAfter = 1.5
bullet_style.leftIndent = 14
heading_style.fontSize = FS + 0.8
heading_style.leading = FS * 1.35
heading_style.spaceBefore = 6
heading_style.spaceAfter = 2
sig_style.fontSize = FS
sig_style.leading = FS * 1.30
title_style.fontSize = 12
title_style.leading = 15
subtitle_style.fontSize = 9.5
subtitle_style.leading = 12
subtitle_style.spaceAfter = 6
# ========================================================================

TITLE = ("FOUNDER PROPRIETARY INFORMATION, INVENTIONS ASSIGNMENT, CONFIDENTIALITY, "
         "DATA SECURITY AND NON-SOLICITATION AGREEMENT")

# The four categories of the prior form, kept verbatim in substance.
COVERED_WORK_PRODUCT = [
    "Source code and object code, and the Company repositories and any Company-controlled GitHub "
    "organization, including repository rights, branches, commits, workflows, Actions, issues, "
    "releases, repository documentation and repository-level secrets and deploy keys, to the "
    "extent transferable.",
    "APIs, databases and schemas; models, sports prediction systems and picks systems; prompt "
    "libraries, AI prompts, AI agents, AI workflows, automation and any Company MCP-related "
    "systems later created.",
    "Deployments and infrastructure configuration, including Vercel, Supabase, Clerk, CI/CD, "
    "deployment scripts, dashboards, analytics implementations, website integrations, application "
    "integrations and Discord integrations.",
    "Analytics, documentation, designs, graphics, video and content created within Company scope, "
    "together with brand assets, derivative works, domain-related materials, credentials, Company "
    "Accounts, improvements, transition deliverables and future Company work product.",
]

# Founder-specific confirmatory sentence for the generic form.
TAILORED = {
    "christian": "product, design and technology work, including application source code, website "
                 "and Discord work, backend, databases, APIs, deployment configuration, "
                 "infrastructure, designs, graphics, AI workflows and documentation prepared for "
                 "the Nosebleed Sports business",
    "gabriel": "operations documentation, workflows and processes, community and subscriber "
               "operations materials, vendor and platform setup work and related records prepared "
               "for the Nosebleed Sports business",
    "stephen": "AI systems, prompts and prompt libraries, model and agent configurations, "
               "automation and evaluation workflows and related documentation prepared for the "
               "Nosebleed Sports business",
    "michael": "information systems and infrastructure work, account and environment "
               "configuration, data organization, integrations, analytics implementations and "
               "related documentation prepared for the Nosebleed Sports business",
    "jacob": "business development materials, partner, sponsor and affiliate outreach materials "
             "and pipeline records prepared for the Nosebleed Sports business, and the Company "
             "relationships developed through them",
}


# ======================================================================
#  Section engine: numbers are assigned at render time and every
#  cross-reference {{key}} follows automatically. Every founder's
#  agreement has the same sections in the same order.
# ======================================================================
def render(sections, story):
    numbers = {}
    for i, sec in enumerate(sections, start=1):
        numbers[sec["key"]] = str(i)

    def sub(text):
        return re.sub(r"\{\{(\w+)\}\}", lambda m: numbers[m.group(1)], text)

    for sec in sections:
        n = numbers[sec["key"]]
        story.append(H("%s. %s" % (n, sub(sec["title"]))))
        m = 0
        for item in sec["body"]:
            if isinstance(item, tuple) and item[0] == "BUL":
                story.append(BUL(sub(item[1])))
            elif isinstance(item, tuple):
                m += 1
                story.append(P("<b>%s.%d %s</b> %s" % (n, m, sub(item[0]), sub(item[1]))))
            else:
                story.append(P(sub(item)))


def build_sections(name, officer, key):
    S = []

    # ------------------------------------------------ 1. Definitions
    S.append(dict(key="defs", title="Definitions", body=[
        ("Defined terms from the LLC Agreement.",
         "Capitalized terms used but not defined in this Agreement have the meanings given to them "
         "in the LLC Agreement, including \"Class A Units,\" \"Class A Member,\" \"Company "
         "Accounts,\" \"Company Assets,\" \"Company IP,\" \"Officer Service,\" \"Service,\" \"Good "
         "Leaver,\" \"Bad Leaver,\" \"Cause,\" \"Change of Control\" and \"JGN Retained Assets.\" "
         "\"Officer Service\" means Founder's continued active service as an officer of the "
         "Company or under another written service arrangement approved by the Members, and "
         "Officer Service ends on the date that service ceases for any reason."),
        ("Confidential Information.",
         "\"Confidential Information\" means all non-public information of the Company, in any "
         "form, that Founder learns, receives, accesses or creates in connection with the Company, "
         "including source code and object code, product plans and roadmaps, customer and "
         "subscriber information and data, user and community data, pricing, models, prediction "
         "and picks methodologies, databases, credentials, financial information, business plans, "
         "diligence materials, the terms of this Agreement and of the LLC Agreement, and "
         "non-public information of JGN Media LLC (\"JGN\"), of a Company customer, partner, "
         "platform or contractor received under a duty of confidence. Confidential Information "
         "includes all Company trade secrets."),
        ("Company Work Product.",
         "\"Company Work Product\" means the inventions, works of authorship, software, source "
         "code, object code, data products, AI products, designs, documentation, databases, APIs, "
         "workflows, content systems and other work product described in Section {{assign}}.1 and "
         "listed in Section {{assign}}.2."),
        ("Pre-Formation Contributions.",
         "\"Pre-Formation Contributions\" means any right, title or interest Founder personally "
         "owns or may own in Nosebleed Sports work product, technology, software, code, "
         "documentation, designs, models, databases, workflows, inventions, copyright rights, "
         "improvements or other Company-related intellectual property created or acquired before "
         "the Effective Date."),
    ]))

    # ------------------------------------------------ 2. Confidentiality
    S.append(dict(key="conf", title="Confidentiality", body=[
        ("Obligation.",
         "Founder will hold Confidential Information in confidence, will protect it using at least "
         "reasonable care, will use it only for the Company's benefit and in the performance of "
         "Officer Service, and will not disclose it to any person other than a Company officer, "
         "Member, contractor or advisor who needs it for the Company's business and is bound by "
         "confidentiality obligations. Founder will not misuse Confidential Information, will not "
         "use it to compete with the Company or to divert a Company opportunity, and will not "
         "copy, store or transmit it outside Company-approved systems except as reasonably "
         "necessary for Company business."),
        ("Exclusions.",
         "These obligations do not apply to information Founder can establish, by contemporaneous "
         "written or electronic records, (a) has become public other than through a breach of an "
         "obligation owed to the Company, (b) was lawfully known to Founder without a "
         "confidentiality restriction before disclosure by the Company, (c) was lawfully received "
         "by Founder from a third party who owed no duty of confidence, or (d) was independently "
         "developed by Founder without use of or reference to Confidential Information."),
        ("Compelled disclosure.",
         "Founder may disclose Confidential Information to the extent required by applicable law, "
         "subpoena, court order or governmental or regulatory process. Where lawful and "
         "practicable, Founder will give the Company prompt notice before disclosing so that the "
         "Company may seek a protective order, will cooperate with the Company at the Company's "
         "expense, and will disclose only the portion legally required."),
        ("Trade secrets; duration.",
         "Confidentiality obligations continue for as long as the information retains commercial "
         "value from not being generally known, and as to trade secrets for as long as the "
         "information qualifies as a trade secret under applicable law. Nothing in this Section "
         "limits Section {{whistle}} or Exhibit 1."),
        ("Third-party information.",
         "Founder will not disclose to the Company, or use in Company Work Product, confidential "
         "information or materials belonging to a former employer or any other third party, and "
         "will not bring onto Company systems any such materials."),
    ]))

    # ------------------------------------------------ 3. Inventions assignment
    assign_body = [
        ("Present assignment.",
         "Founder hereby irrevocably assigns and transfers to the Company, and to the extent any "
         "right cannot be assigned in advance, agrees to assign and hereby assigns upon creation, "
         "all right, title and interest Founder lawfully owns, throughout the world and in "
         "perpetuity, in and to all inventions, works of authorship, software, source code, object "
         "code, data products, AI products, designs, documentation, databases, APIs, workflows, "
         "content systems and other work product created on or after the Effective Date that: (a) "
         "relates to the Company's actual or demonstrably anticipated business, research or "
         "development; (b) results from work performed for the Company; (c) is created using "
         "material Confidential Information or Company resources; or (d) is expressly commissioned "
         "for Company use. This assignment includes all patent, copyright, trade secret, design, "
         "database, trademark and other intellectual property rights in the foregoing, all "
         "registrations and applications for them, and all rights to sue for and recover for past, "
         "present and future infringement. Works of authorship created within the scope of Officer "
         "Service are works made for hire to the extent applicable law so permits, and to the "
         "extent they are not, they are assigned under this Section."),
        ("Covered Company Work Product.",
         "Without limiting Section {{assign}}.1, Company Work Product includes:"),
    ]
    for it in COVERED_WORK_PRODUCT:
        assign_body.append(("BUL", it))
    assign_body.append(
        ("Pre-Formation Contributions.",
         "To the extent Founder personally owns or may own any Pre-Formation Contributions, "
         "Founder hereby irrevocably assigns those rights directly to the Company, effective as of "
         "the Effective Date, on the same terms as Section {{assign}}.1. This does not represent "
         "that Founder personally owned assets already owned by JGN Media LLC, and nothing in this "
         "Agreement transfers, limits or calls into question JGN's ownership of the " + MARK +
         " name and master brand, the common-law rights and goodwill in it, the legacy social "
         "media accounts or the other JGN Retained Assets listed on Schedule D to the LLC "
         "Agreement."))

    # ---- founder-specific confirmatory paragraph
    if key == "nick":
        assign_body.append(
            ("Confirmatory assignment; live_hit_props.",
             "Founder's confirmatory assignment under Section {{assign}}.3 expressly includes all "
             "right, title and interest Founder personally owns in the live_hit_props code, "
             "models, scripts, configuration and related materials, to the extent that material is "
             "incorporated into, adapted into, derived from or necessary to operate nosebleed-runner "
             "or any other Nosebleed Sports product, repository or system, including the hit-props "
             "model runner ported from the live_hit_props handoff and listed on Schedule C to the "
             "LLC Agreement. That assignment is effective now and is not conditioned on any further "
             "act. The chain of title to those portions of live_hit_props is resolved by this "
             "Section and is no longer an open item. Portions of live_hit_props that are not "
             "incorporated into, adapted into, derived from or necessary to operate a Nosebleed "
             "Sports product remain Founder's property, are listed on Schedule A, and are licensed "
             "to the Company on the terms stated there; this Section does not sweep unrelated "
             "personal software of Founder into the assignment."))
    else:
        assign_body.append(
            ("Confirmatory assignment.",
             "Founder's confirmatory assignment under Section {{assign}}.3 expressly covers, to the "
             "extent personally owned, any pre-formation " + TAILORED[key] + ", together with all "
             "documentation, files, records and derivative works of them."))

    assign_body.append(
        ("Excluded Prior IP.",
         "Schedule A lists the prior intellectual property Founder excludes from the assignment "
         "made by Section {{assign}}.3. Anything not listed on Schedule A is assigned. Schedule A "
         "may be supplemented only in a writing signed by Founder and accepted by the Company "
         "before execution of this Agreement. If Founder incorporates, or permits the "
         "incorporation of, any Excluded Prior IP into a Company product, service, repository or "
         "system, Founder grants the Company a perpetual, irrevocable, worldwide, royalty-free, "
         "fully paid-up, non-exclusive license, with the right to sublicense through multiple "
         "tiers to the Company's contractors, licensees and successors, to make, have made, use, "
         "reproduce, modify, create derivative works of, distribute, publicly perform and display "
         "and otherwise exploit that Excluded Prior IP as part of or in connection with that "
         "product, service, repository or system."))
    assign_body.append(
        ("Mandatory-law carve-out.",
         "This Agreement does not require the assignment of any invention that applicable "
         "non-waivable law prohibits the Company from requiring to be assigned, and the assignment "
         "in this Section is limited accordingly. Exhibit 1 sets out the federal trade-secret "
         "immunity notice under 18 U.S.C. Section 1833(b). Exhibit 2 sets out the state "
         "invention-assignment carve-out and its statutory notice, which applies to Founder to the "
         "extent the law of a state that has such a statute governs Founder's inventions. Founder "
         "acknowledges receipt of both Exhibits, which are part of this Agreement."))

    S.append(dict(key="assign", title="Inventions Assignment", body=assign_body))


    # ------------------------------------------------ Moral rights
    S.append(dict(key="moral", title="Moral Rights", body=[
        ("Waiver.",
         "To the maximum extent permitted by applicable law, Founder waives, and agrees never to "
         "assert, all moral rights and all rights of paternity, integrity, disclosure, withdrawal, "
         "attribution and reputation Founder may have in Company Work Product and in the "
         "Pre-Formation Contributions assigned under Section {{assign}}.3, in every jurisdiction, "
         "in favor of the Company and its successors, assigns and licensees."),
        ("Covenant not to assert.",
         "Where a waiver of those rights is not permitted by applicable law, Founder irrevocably "
         "covenants not to assert them against the Company or against its successors, assigns or "
         "licensees, or against anyone acting with their authority, in connection with any use, "
         "reproduction, modification, adaptation, combination, translation, distribution, display, "
         "performance or other exploitation of properly assigned work. Founder consents to use of "
         "the assigned work without attribution and to its modification. This Section is intended "
         "to benefit the Company's successors, assigns and licensees directly, and each of them may "
         "enforce it."),
    ]))

    # ------------------------------------------------ Further assurances
    S.append(dict(key="further", title="Further Assurances; Limited Ministerial Appointment", body=[
        ("Further assurances.",
         "Founder will promptly sign the instruments and take the actions the Company reasonably "
         "requests, during and after Officer Service, to apply for, prosecute, perfect, record, "
         "maintain, defend and enforce the rights assigned under this Agreement, including "
         "confirmatory assignments, copyright registrations and recordations, trademark "
         "applications and declarations, patent applications, oaths and declarations of inventorship, "
         "domain transfers, GitHub and other platform transfers, application-store transfers, "
         "database and account transfers, foreign instruments, and reasonable cooperation in "
         "financing diligence, acquisition diligence and registration or enforcement proceedings. "
         "The Company will pay Founder's reasonable, documented out-of-pocket costs of doing so."),
        ("Limited ministerial appointment.",
         "If, after making reasonable efforts to obtain Founder's signature on a document described "
         "in Section {{further}}.1, the Company is unable to obtain it because Founder cannot be "
         "located, is unable to sign or does not sign within a reasonable period after written "
         "request, Founder irrevocably designates and appoints the Company as Founder's limited "
         "agent for the sole and exclusive purpose of signing, filing and recording that document "
         "on Founder's behalf. This appointment is narrowly tailored and ministerial, is coupled "
         "with an interest, may be exercised only for acts necessary to apply for, perfect, record "
         "or maintain rights already assigned under this Agreement, and may never be used to "
         "transfer Units, incur an obligation of Founder, settle a claim, or take any act beyond "
         "the perfection of assigned intellectual property rights. No general or unlimited agency "
         "or authority is granted."),
    ]))

    # ------------------------------------------------ Data security
    S.append(dict(key="data", title="Data Security and Company Accounts", body=[
        ("Security practices.",
         "Founder will use Company-approved credential storage, multi-factor authentication where "
         "available, secure coding and secure configuration practices, least-privilege access "
         "controls and Company-approved devices and systems for Company data; will not share "
         "credentials except through Company-approved mechanisms; will keep Company Accounts on "
         "Company-controlled email, billing and recovery mechanisms where reasonably practicable "
         "and with at least two Company-approved administrators; and will report any suspected "
         "compromise, unauthorized access or loss of Company data or credentials promptly after "
         "becoming aware of it."),
        ("Return and transfer.",
         "On the Company's request, and in any event promptly and no later than " + RETURN_DAYS +
         " days after Officer Service ends, Founder will transfer or return, as applicable, all "
         "credentials, API keys, recovery codes, tokens, SSH keys, signing certificates, "
         "environment variables, deployment secrets, database credentials, domain credentials, "
         "administrative rights, backup copies, locally stored repositories, Company data, Company "
         "records, Confidential Information and Company devices, and will transfer administrative "
         "control of Company Accounts to the person the Company designates. Founder will not retain "
         "any copy except a copy of Founder's own personal records that Founder is required or "
         "permitted by law to keep, which remains subject to Section {{conf}}."),
        ("Certification.",
         "On the Company's request, Founder will confirm in writing that Founder has complied with "
         "Section {{data}}.2."),
    ]))

    # ------------------------------------------------ Open source / AI
    S.append(dict(key="oss", title="Open Source, Third-Party IP and AI-Assisted Development", body=[
        ("Open source.",
         "Founder may use ordinary permissively licensed open-source software in Company Work "
         "Product, but will not knowingly incorporate into Company Work Product any code governed "
         "by terms that would require the disclosure, licensing or distribution of proprietary "
         "Company source code, or that would restrict the Company's ability to license its products "
         "commercially, without the Company's prior approval. Founder will reasonably document "
         "material open-source dependencies and their licenses."),
        ("Third-party intellectual property.",
         "Founder represents, to Founder's knowledge where knowledge is the applicable standard, "
         "that Founder will not knowingly use the confidential information of a prior employer, "
         "contribute to Company Work Product code or materials owned by someone else, breach a "
         "prior intellectual property assignment or confidentiality obligation, or introduce "
         "unauthorized third-party proprietary materials into Company Work Product. Founder is "
         "under no obligation to any other person that conflicts with this Agreement."),
        ("AI-assisted development.",
         "Known AI tools used in the Company's development include OpenAI and Anthropic Claude and "
         "Claude Code. Founder will reasonably comply with the Company's approved AI tools and "
         "usage practices, with the applicable service terms of those tools and with the "
         "confidentiality requirements of this Agreement; will not knowingly submit third-party "
         "confidential information to an AI tool without authorization; will preserve material "
         "development history where reasonably available; and will disclose to the Company any "
         "material restriction, term or circumstance known to Founder that impairs the Company's "
         "ownership of, or rights in, AI-assisted work product. The assignment in Section "
         "{{assign}} covers whatever rights Founder lawfully owns in AI-assisted work product. "
         "Neither party states that all AI-generated output is automatically copyrightable."),
    ]))

    # ------------------------------------------------ Non-solicitation
    S.append(dict(key="nonsolicit", title="Non-Solicitation", body=[
        ("Covenant.",
         "During Officer Service and for " + NONSOLICIT_PERIOD + " after Officer Service ends, to "
         "the maximum extent permitted by applicable law, Founder will not knowingly and directly "
         "solicit, for the purpose of competitive diversion, (a) any employee, contractor, service "
         "provider or other personnel of the Company with whom Founder materially worked or about "
         "whom Founder obtained Confidential Information, to end or reduce that person's engagement "
         "with the Company, or (b) any current Company customer, subscriber or active prospect with "
         "whom Founder had material Company contact or about whom Founder obtained material "
         "Confidential Information, to end, reduce or divert that relationship. This covenant "
         "mirrors Section 10.2 of the LLC Agreement and runs for the same " + NONSOLICIT_PERIOD +
         " period measured from the end of Officer Service."),
        ("Exclusions.",
         "General advertising and general job postings not targeted at Company personnel, "
         "responding to an unsolicited approach not encouraged by Founder in breach of Section "
         "{{nonsolicit}}.1, hiring a person whose engagement with the Company ended at least six "
         "(6) months earlier without Founder's encouragement, and activity protected by applicable "
         "law are all excluded from this Section."),
        ("Reasonableness; reformation.",
         "Founder agrees that this Section is reasonable in scope, geography and duration and is no "
         "broader than necessary to protect Confidential Information, Company Work Product and "
         "Company relationships. If a court or other tribunal of competent jurisdiction finds any "
         "part of it unenforceable, that part is to be reformed to the maximum enforceable scope "
         "rather than struck."),
    ]))

    # ------------------------------------------------ No non-compete
    S.append(dict(key="noncompete", title="No General Non-Compete; Company Opportunities", body=[
        ("No general non-compete.",
         "This Agreement " + NO_NONCOMPETE + " covenant. Founder is not restricted from working, "
         "investing or engaging in any lawful business or profession after Officer Service ends, "
         "and nothing in this Agreement is to be read as a covenant against competition."),
        ("Company opportunities.",
         "Founder's obligations with respect to business opportunities are limited to actual "
         "Company opportunities learned through Officer Service, opportunities the Company is "
         "actively pursuing, and opportunities whose exploitation would involve the misuse of "
         "Confidential Information or Company Assets, in each case subject to the LLC Agreement and "
         "to fiduciary duties as modified by it. This Agreement restricts the misuse of Company "
         "intellectual property, Confidential Information, Company Accounts, opportunities and "
         "relationships, and nothing else."),
    ]))

    # ------------------------------------------------ Whistleblower
    S.append(dict(key="whistle", title="Whistleblower and Protected Activity", body=[
        ("Protected activity.",
         "Nothing in this Agreement prohibits or limits Founder from reporting possible violations "
         "of law to a federal, state or local government agency or regulator, from filing a charge "
         "or participating in an investigation or proceeding conducted by such an agency, from "
         "engaging in lawful whistleblower activity, from making disclosures protected by law, or "
         "from communicating about wages, hours or working conditions where that communication is "
         "protected by law. Founder is not required to notify the Company before doing so, and no "
         "provision of this Agreement may be applied to interfere with any of it."),
        ("Trade-secret immunity notice.",
         "Exhibit 1 contains the notice of immunity required by 18 U.S.C. Section 1833(b) and is "
         "given to Founder with this Agreement. Nothing in this Agreement limits that immunity."),
    ]))

    # ------------------------------------------------ Relationship to LLC Agreement
    S.append(dict(key="rel", title="Relationship to the LLC Agreement", body=[
        ("Supplement, not amendment.",
         "This Agreement supplements, and does not amend, modify, waive or supersede, the LLC "
         "Agreement. It is the \"PIIA\" referred to in Section 9.2 of the LLC Agreement, and "
         "Founder's execution of it satisfies the requirement of that Section. Founder's Class A "
         "Units, their vesting, the Officer Service condition and the Company's repurchase and "
         "forfeiture rights are governed solely by Article 4 of the LLC Agreement and are not "
         "changed by this Agreement. A breach of this Agreement may make Founder a Bad Leaver under "
         "the LLC Agreement, with the consequences stated there."),
        ("Conflicts.",
         "If a provision of this Agreement conflicts with a provision of the LLC Agreement "
         "concerning intellectual property, work product, confidentiality or their assignment or "
         "protection, the provision that gives the Company broader rights or greater protection "
         "governs as between the Company and Founder. In every other respect the LLC Agreement "
         "governs."),
        ("Beneficiaries.",
         "The Company's successors, assigns and licensees, including JGN as an assignee of Company "
         "IP under the intercompany agreements described in Section 11.2 of the LLC Agreement, are "
         "intended beneficiaries of Sections {{assign}}, {{moral}} and {{further}} and may enforce "
         "them. There are no other third-party beneficiaries."),
    ]))

    # ------------------------------------------------ General
    S.append(dict(key="gen", title="General", body=[
        ("Governing law; disputes.",
         "This Agreement is governed by the laws of the State of Delaware, without regard to "
         "conflict-of-law principles and subject to mandatory applicable law. Consistent with "
         "Section 13.5 of the LLC Agreement, the parties will attempt in good faith to resolve any "
         "dispute through direct negotiation for at least " + NEGOTIATION_DAYS + " days after "
         "written notice, and then through confidential nonbinding mediation before a mutually "
         "agreed mediator, which may be conducted remotely. If the dispute remains unresolved " +
         MEDIATION_DAYS + " days after mediation begins, or a party refuses to mediate, either "
         "party may bring it in the Court of Chancery of the State of Delaware or, where that court "
         "lacks jurisdiction, in the state or federal courts located in the State of New York, and "
         "each party consents to their jurisdiction and venue. Nothing in this Section prevents "
         "either party from seeking injunctive or other equitable relief at any time, including in "
         "the Court of Chancery of the State of Delaware."),
        ("Equitable relief; cumulative remedies.",
         "Founder agrees that damages would be an inadequate remedy for a breach of Sections "
         "{{conf}}, {{assign}}, {{moral}}, {{further}}, {{data}} or {{nonsolicit}}, and that the "
         "Company is entitled to specific performance and to temporary, preliminary and permanent "
         "injunctive relief to enforce them, without posting bond and without proving actual "
         "damages. The Company's rights and remedies under this Agreement are cumulative and are in "
         "addition to every other right and remedy available at law, in equity or under the LLC "
         "Agreement, and the exercise of one does not preclude the exercise of another."),
        ("Mandatory-law savings; severability.",
         "No provision of this Agreement applies to the extent applicable non-waivable law "
         "prohibits it, and each provision is to be applied and enforced only to the maximum extent "
         "that law permits. If a provision is held invalid or unenforceable, it is to be modified "
         "to the minimum extent necessary to make it enforceable and, if it cannot be modified, "
         "severed, and the remainder of this Agreement continues in full force."),
        ("Entire agreement.",
         "This Agreement, with its Schedule A and Exhibits 1 and 2, is the entire agreement between "
         "the Company and Founder on its subject matter and supersedes all prior and "
         "contemporaneous understandings, term sheets, drafts and binder documents on that subject "
         "matter, including the pre-formation founder proprietary information form previously "
         "circulated to Founder. The LLC Agreement remains in full force in accordance with Section "
         "{{rel}}."),
        ("Amendment; waiver.",
         "This Agreement may be amended only by a written instrument signed by Founder and by an "
         "authorized officer of the Company other than Founder. No waiver is effective unless in "
         "writing and signed by the party giving it. A party's failure or delay in exercising a "
         "right is not a waiver of that right, and a single or partial exercise does not preclude "
         "any further exercise."),
        ("Successors and assigns.",
         "This Agreement binds and benefits the Company and its successors and assigns. The Company "
         "may assign this Agreement, in whole or in part, and may assign the rights and work "
         "product acquired under it, without Founder's consent, in connection with a financing, "
         "reorganization, merger, sale of all or substantially all of its assets, Change of Control "
         "or other acquisition, and to JGN under the intercompany agreements described in Section "
         "11.2 of the LLC Agreement. Founder may not assign or delegate this Agreement or any right "
         "or obligation under it, and any purported assignment by Founder is void. This Agreement "
         "binds Founder's heirs, executors and legal representatives."),
        ("Notices.",
         "Notices under this Agreement must be in writing and are effective when sent by email to "
         "the Company at the email address of the Chief Executive Officer maintained in the Company "
         "records, or to Founder at the notice email address stated in Founder's signature block or "
         "as later updated by notice, in each case absent a bounce or error message, or on delivery "
         "to the recipient's address shown in the Company records. Each party will keep its notice "
         "email address current."),
        ("Counterparts; electronic signature.",
         "This Agreement may be signed in counterparts, each of which is an original and all of "
         "which together are one instrument, and may be signed and delivered by electronic "
         "signature or by transmission of a signed image, which have the same effect as an original "
         "signature."),
        ("No employment commitment; construction.",
         "This Agreement does not create any right to continued Officer Service or to any "
         "particular office, and does not guarantee any compensation. Section headings are for "
         "convenience only. \"Including\" means \"including without limitation.\" This Agreement is "
         "the product of negotiation between the parties and is not to be construed against either "
         "of them as drafter."),
    ]))

    # ------------------------------------------------ Survival
    S.append(dict(key="surv", title="Survival", body=[
        "The assignment of intellectual property under Section {{assign}} is permanent and survives the end of Officer Service, the transfer of Founder's Units and "
        "the termination of this Agreement. The waivers and covenants in Section {{moral}} are "
        "permanent. Section {{further}} survives as long as reasonably necessary to perfect and "
        "enforce the assigned rights. Section {{conf}} survives according to the nature of the "
        "information and, as to trade secrets, for as long as the information qualifies as a trade "
        "secret. Section {{data}} survives until performance is complete. Section {{nonsolicit}} "
        "survives for " + NONSOLICIT_PERIOD + " after Officer Service ends, subject to applicable "
        "law. Sections {{whistle}}, {{rel}}, {{gen}} and this Section survive indefinitely. "
        "Cooperation in financing and acquisition diligence survives on a reasonable basis.",
    ]))

    return S


# ======================================================================
#  Document
# ======================================================================
def make(name, officer, key):
    filename = "Nosebleed_Sports_LLC_PIIA_%s.pdf" % name.split(None, 1)[1].replace(" ", "_")
    out = os.path.join(WORKDIR, filename)

    s = []
    masthead(s, [TITLE,
                 COMPANY_NAME + " and " + name,
                 "Founder, Class A Member and " + officer])

    # ---------------- Preamble
    s.append(P("This " + T_PIIA + " (this \"Agreement\") is made effective as of <b>" +
               EFFECTIVE_DATE + "</b> (the \"Effective Date\") between <b>" + COMPANY_NAME +
               "</b>, a " + COMPANY_STATE + " limited liability company formed on " +
               FORMATION_DATE + " by the filing of its Certificate of Formation with the Delaware "
               "Secretary of State under Delaware file number " + DE_FILE_NUMBER + ", whose "
               "registered agent and registered office in Delaware are " + REG_AGENT + ", holding "
               "Employer Identification Number " + EIN + ", and having its principal office at " +
               PRINCIPAL_OFFICE + " (the \"Company\"), and <b>" + name + "</b> (\"Founder\"). The "
               "Company and Founder are each a \"party\" and together the \"parties.\""))

    s.append(H("Recitals"))
    s.append(P("<b>A. Admission and Units.</b> Founder is admitted as a Class A Member of the "
               "Company and is issued Class A Units under the Company's " + T_OA + " dated as of "
               "the Effective Date (the \"" + T_OA + "\" or \"LLC Agreement\"). Founder's Class A "
               "Units are subject to the vesting, Officer Service, forfeiture and repurchase terms "
               "of Article 4 of the LLC Agreement."))
    s.append(P("<b>B. Office.</b> Founder serves the Company as its " + officer + " and in that "
               "capacity will create, receive and have access to Confidential Information, Company "
               "IP, Company Accounts and Company data."))
    s.append(P("<b>C. Consideration.</b> Founder's admission as a Class A Member, the issuance of "
               "Founder's Class A Units, Founder's appointment as " + officer + " and Founder's "
               "access to Confidential Information are the consideration for this Agreement, the "
               "receipt and sufficiency of which Founder acknowledges. No cash consideration is "
               "paid or payable by either party for this Agreement."))
    s.append(P("<b>D. Required agreement.</b> Section 9.2 of the LLC Agreement requires each Class "
               "A Member to sign a Proprietary Information, Inventions Assignment, Confidentiality, "
               "Data Security and Non-Solicitation Agreement containing direct confirmatory present "
               "assignments of any residual personally held pre-formation Company-related rights. "
               "This Agreement is the \"PIIA\" referred to in the LLC Agreement, and every "
               "assignment made in it runs to the Company. It replaces in full the pre-formation "
               "founder proprietary information form previously circulated to Founder."))
    s.append(P("The parties agree as follows."))

    render(build_sections(name, officer, key), s)

    # ---------------- Signatures
    _sig = []
    _sig.append(Spacer(1, 6))
    _sig.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#999999"), spaceAfter=7))
    _sig.append(P("IN WITNESS WHEREOF, the parties have executed this Agreement as of the Effective "
               "Date."))

    # Nick signs for the Company everywhere else, so his own PIIA is countersigned by the CTO.
    co_name, co_title = (CTO_NAME, "Chief Technology Officer") if key == "nick" else (CEO_NAME, CEO_TITLE)

    _sig.append(Spacer(1, 4))
    _sig.append(P("<b>COMPANY</b>", sig_style))
    _sig.append(P(COMPANY_NAME, sig_style))
    _sig.append(P("By: _________________________________________", sig_style))
    _sig.append(P("Name: " + co_name, sig_style))
    _sig.append(P("Title: " + co_title, sig_style))
    _sig.append(P("Date signed: __________________________________", sig_style))

    _sig.append(Spacer(1, 8))
    _sig.append(P("<b>FOUNDER</b>", sig_style))
    _sig.append(P("Signature: ____________________________________", sig_style))
    _sig.append(P("Name: " + name, sig_style))
    _sig.append(P("Capacity: Founder, Class A Member and " + officer, sig_style))
    _sig.append(P("Date signed: __________________________________", sig_style))
    _sig.append(P("Notice email: ______________________________", sig_style))
    s.append(KeepTogether(_sig))

    # ---------------- Schedule A
    s.append(PageBreak())
    s.append(P("SCHEDULE A", title_style))
    s.append(P("Excluded Prior IP " + DASH + " " + name, subtitle_style))
    s.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#999999"), spaceAfter=10))
    if key == "nick":
        s.append(P("The following prior intellectual property is excluded from the confirmatory "
                   "assignment made by Founder:"))
        s.append(BUL("<b>live_hit_props (unrelated portions only).</b> Those portions of the "
                     "live_hit_props code, models, scripts, configuration and related materials "
                     "that are <b>not</b> incorporated into, adapted into, derived from or "
                     "necessary to operate nosebleed-runner or any other Nosebleed Sports product, "
                     "repository or system. All other portions of live_hit_props are assigned to "
                     "the Company and are Company IP."))
        s.append(P("<b>License to the Company.</b> Founder grants the Company a perpetual, "
                   "irrevocable, worldwide, royalty-free, fully paid-up, non-exclusive license, "
                   "with the right to sublicense through multiple tiers to the Company's "
                   "contractors, licensees and successors, to make, have made, use, reproduce, "
                   "modify, create derivative works of, distribute, publicly perform and display "
                   "and otherwise exploit any Excluded Prior IP listed above that is embedded in, "
                   "linked into, delivered with or otherwise used in any Company product, service, "
                   "repository or system, for any purpose and without further consent or payment. "
                   "Founder will not assert any intellectual property right against the Company, "
                   "its contractors, licensees or successors on account of that use."))
        s.append(P("<b>No other exclusions.</b> No other prior intellectual property of Founder is "
                   "excluded from the assignment."))
    else:
        s.append(P("<b>None.</b> Founder has no prior intellectual property excluded from the "
                   "assignment made by this Agreement. This Schedule may be supplemented only in a "
                   "writing signed by Founder and accepted by the Company before execution."))

    # ---------------- Exhibit 1
    s.append(Spacer(1, 16))
    s.append(P("EXHIBIT 1", title_style))
    s.append(P("Notice of Immunity Under the Defend Trade Secrets Act of 2016, "
               "18 U.S.C. Section 1833(b)", subtitle_style))
    s.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#999999"), spaceAfter=10))
    s.append(P("<b>Immunity from liability for confidential disclosure of a trade secret to the "
               "government or in a court filing.</b> An individual shall not be held criminally or "
               "civilly liable under any Federal or State trade secret law for the disclosure of a "
               "trade secret that (A) is made (i) in confidence to a Federal, State or local "
               "government official, either directly or indirectly, or to a lawyer, and (ii) solely "
               "for the purpose of reporting or investigating a suspected violation of law; or (B) "
               "is made in a complaint or other document filed in a lawsuit or other proceeding, if "
               "such filing is made under seal."))
    s.append(P("<b>Use of trade secret information in an anti-retaliation lawsuit.</b> An "
               "individual who files a lawsuit for retaliation by an employer for reporting a "
               "suspected violation of law may disclose the trade secret to that individual's "
               "lawyer and use the trade secret information in the court proceeding, if the "
               "individual (A) files any document containing the trade secret under seal; and (B) "
               "does not disclose the trade secret, except pursuant to court order."))
    s.append(P("This notice is given under 18 U.S.C. Section 1833(b). Nothing in this Agreement is "
               "intended to, and nothing in it may be read to, limit or waive this immunity, and "
               "the confidentiality obligations of this Agreement are subject to it."))

    # ---------------- Exhibit 2
    s.append(Spacer(1, 16))
    s.append(P("EXHIBIT 2", title_style))
    s.append(P("State Invention-Assignment Carve-Out and Statutory Notice", subtitle_style))
    s.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#999999"), spaceAfter=10))
    s.append(P("<b>Scope of this Exhibit.</b> Several states limit by statute the inventions an "
               "employer or company may require to be assigned, and require that a notice of that "
               "limitation be given. Those statutes include California Labor Code Section 2870, "
               "Delaware 19 Del. C. Section 805, Illinois 765 ILCS 1060/2, Minnesota Statutes "
               "Section 181.78, New York Labor Law Section 203-f, and similar statutes of other "
               "states. This carve-out and notice apply to Founder under whichever of those "
               "statutes, if any, governs Founder's inventions, and the assignment made by this "
               "Agreement is limited accordingly to the extent that statute applies."))
    s.append(P("<b>Notice.</b> The assignment of inventions made by this Agreement does not apply "
               "to, and Founder is not required to assign, any invention that Founder developed "
               "entirely on Founder's own time without using the Company's equipment, supplies, "
               "facilities, or trade secret information, except for those inventions that either:"))
    s.append(BUL("relate at the time of conception or reduction to practice of the invention to the "
                 "Company's business, or to the Company's actual or demonstrably anticipated "
                 "research or development; or"))
    s.append(BUL("result from any work performed by Founder for the Company."))
    s.append(P("<b>Effect.</b> To the extent a statute described above applies to Founder, this "
               "Agreement is to be read as containing the limitation that statute requires, and any "
               "provision of this Agreement that would otherwise require assignment of an invention "
               "excluded by that statute is unenforceable as to that invention and is limited "
               "accordingly. This Exhibit does not state, and the Company does not assert, that "
               "Founder resides in or is subject to the law of any particular state; Founder's "
               "state of residence is to be confirmed at execution and the applicable statute "
               "applies of its own force."))
    s.append(P("<b>Disclosure of excluded inventions.</b> An invention Founder claims is excluded "
               "by this Exhibit must be identified on Schedule A or disclosed to the Company in "
               "writing when it is created, so that the parties can record which inventions are "
               "assigned and which are not."))

    build(s, out, "Founder PIIA " + DASH + " " + name + " " + DASH + " " + COMPANY_NAME)
    return out


def main():
    want = os.environ.get("FOUNDER")
    outs = []
    for name, officer, key in FOUNDERS:
        if want and want.lower() not in (key, name.lower(), name.split()[-1].lower()):
            continue
        outs.append(make(name, officer, key))
    if not outs:
        raise SystemExit("FOUNDER=%r matched no founder in FOUNDERS" % want)
    return outs


if __name__ == "__main__":
    main()
