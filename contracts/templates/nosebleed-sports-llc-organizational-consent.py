#!/usr/bin/env python3
"""Unanimous Written Consent of the Members and Manager of Nosebleed Sports LLC (Delaware) in lieu of an
organizational meeting: ratifies formation, adopts the LLC Agreement, issues Class A Units, approves the Brock Smith
Service Agreement and Brock Reserve, confirms Manager and officers, EIN/tax, banking, foreign qualification, JGN
advances, intercompany licenses, PIIAs, and supersedes the pre-formation binder / FMV / 83(b) materials."""

import os
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib.enums import TA_CENTER
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable)

OUT = os.environ.get("OUT_PDF", "nosebleed-sports-llc-organizational-consent.pdf")

COMPANY_NAME   = "Nosebleed Sports LLC"
EFFECTIVE_DATE = "____________, 2026"
FORMATION_DATE = "August 7, 2026"
DE_FILE_NUMBER = "10727267"
REG_AGENT      = "ZenBusiness Inc., 611 South DuPont Highway, Suite 102, Dover, Delaware 19901"
EIN = "__-_______"  # from the IRS CP575B letter; kept out of the public repo
EIN_DATE       = "August 17, 2026"
MANAGER_NAME   = "Nicholas Restivo"
MANAGER_TITLE  = "Chief Executive Officer"
BROCK_RESERVE  = 450_000
BROCK_SA       = "Talent, Handicapping, and Content Services Agreement among JGN Media LLC, the Company, and Brock Smith"
MEMBERS = [
    # fill from the private master record: ("Name", units) or ("Name", "A"|"B", units, "email")
]
OFFICERS = [
    # fill from the private master record: ("Name", "Title")
]
def fmt(n): return f"{n:,}"

styles = getSampleStyleSheet()
title_style = ParagraphStyle("T", parent=styles["Title"], fontName="Helvetica-Bold", fontSize=14, leading=18, alignment=TA_CENTER, spaceAfter=2)
subtitle_style = ParagraphStyle("S", parent=styles["Normal"], fontName="Helvetica", fontSize=10.5, leading=14, alignment=TA_CENTER, textColor=colors.HexColor("#444444"), spaceAfter=10)
heading_style = ParagraphStyle("H", parent=styles["Heading2"], fontName="Helvetica-Bold", fontSize=11, leading=14, spaceBefore=11, spaceAfter=4)
body_style = ParagraphStyle("B", parent=styles["Normal"], fontName="Helvetica", fontSize=10, leading=14.5, spaceAfter=7)
sig_style = ParagraphStyle("Sig", parent=body_style, spaceAfter=2)
def P(t, s=body_style): return Paragraph(t, s)
def H(t): return Paragraph(t, heading_style)
GRID = TableStyle([("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"), ("FONTSIZE", (0, 0), (-1, -1), 9),
                   ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#EFEFEF")), ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#BBBBBB")),
                   ("TOPPADDING", (0, 0), (-1, -1), 4), ("BOTTOMPADDING", (0, 0), (-1, -1), 4), ("LEFTPADDING", (0, 0), (-1, -1), 6)])

s = []
s.append(P("UNANIMOUS WRITTEN CONSENT OF THE MEMBERS AND MANAGER", title_style))
s.append(P("of", subtitle_style)); s.append(P(COMPANY_NAME.upper(), title_style))
s.append(P("a Delaware limited liability company &mdash; in lieu of an organizational meeting", subtitle_style))
s.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#999999"), spaceAfter=12))
s.append(P("The undersigned, being all of the Class A Members and the Manager of %s (the \"Company\"), acting by written consent without a "
           "meeting under Section 18-302(d) of the Delaware Limited Liability Company Act and the Company's Limited Liability Company "
           "Agreement, adopt the following resolutions effective as of <b>%s</b> (the \"Effective Date\"). Capitalized terms not defined "
           "here have the meanings given in the Limited Liability Company Agreement." % (COMPANY_NAME, EFFECTIVE_DATE)))

s.append(H("1. Formation"))
s.append(P("RESOLVED, that the filing of the Certificate of Formation of the Company with the Delaware Secretary of State on %s "
           "(File Number %s) by %s as authorized person is ratified and approved; that %s is confirmed as the Company's registered "
           "agent; and that the Manager is directed to maintain the registered agent and pay the Delaware annual tax when due."
           % (FORMATION_DATE, DE_FILE_NUMBER, MANAGER_NAME, REG_AGENT)))

s.append(H("2. Limited Liability Company Agreement"))
s.append(P("RESOLVED, that the Limited Liability Company Agreement of the Company dated as of the Effective Date, in the form executed by the "
           "undersigned concurrently with this consent (the \"LLC Agreement\"), is adopted as the limited liability company agreement of "
           "the Company; and that all prior drafts, term sheets, binders, and understandings concerning the Company's ownership or "
           "governance are superseded in their entirety."))

s.append(H("3. Issuance of Class A Units"))
s.append(P("RESOLVED, that the Company issues the following Class A Units to the following persons, each of whom is admitted as a Class A "
           "Member, in consideration of services rendered and to be rendered to the Company and the assignment of intellectual property "
           "under each person's Proprietary Information and Inventions Assignment Agreement, without a cash purchase price, subject to "
           "the vesting terms of Section 3.6 of the LLC Agreement and with a Threshold Value determined under Section 3.5 (which, no "
           "cash Capital Contributions having been made, is $0 as of the Effective Date):"))
rows = [["Class A Member", "Class A Units", "% of Outstanding", "% of Authorized", "Vested at issuance"]]
issued = sum(u for _, u in MEMBERS) + 50_000
for n, u in MEMBERS:
    rows.append([n, fmt(u), f"{100*u/issued:.2f}%", f"{100*u/10_000_000:.2f}%", fmt(u // 2)])
t = Table(rows, colWidths=[1.9 * inch, 1.1 * inch, 1.15 * inch, 1.15 * inch, 1.1 * inch]); t.setStyle(GRID); s.append(t)
s.append(Spacer(1, 6))
s.append(P("RESOLVED FURTHER, that the Manager is directed to record the issuances on Schedules A and C of the LLC Agreement, and that "
           "the Company and each recipient will treat the recipient as the owner of the Units for tax purposes from the Effective Date "
           "in accordance with Section 3.5 of the LLC Agreement."))

s.append(H("4. Brock Smith &mdash; Service Agreement, Initial Units, and Brock Reserve"))
s.append(P("RESOLVED, that the %s (the \"Brock Service Agreement\") is approved, and the Manager is authorized to execute it on the "
           "Company's behalf; that upon Brock Smith's execution of a joinder in the form of Schedule B to the LLC Agreement, the Company "
           "will issue to him <b>50,000 Class B Units</b> as the Initial Units under Section 5.1 of the Brock Service Agreement, "
           "non-voting and subject to forfeiture until vested solely as Section 5.4 of that agreement provides; and that, for purposes "
           "of Section 3.4 of the LLC Agreement, the undersigned (constituting Supermajority Approval) approve the reservation of up to "
           "<b>%s Class B Units</b> (the \"Brock Reserve\") for issuance to Brock Smith in accordance with the milestone terms of "
           "Section 5.2 of the Brock Service Agreement, with no further Member approval required for those issuances. Brock Smith is "
           "not an officer of the Company and holds no title." % (BROCK_SA, fmt(BROCK_RESERVE))))

s.append(H("5. Manager and Officers"))
s.append(P("RESOLVED, that %s is confirmed as the sole Manager of the Company with the title %s; and that the following persons are "
           "appointed to the offices set opposite their names, to serve at the pleasure of the Manager under Section 4.6 of the LLC "
           "Agreement:" % (MANAGER_NAME, MANAGER_TITLE)))
to = Table([["Name", "Office"]] + [list(o) for o in OFFICERS], colWidths=[2.2 * inch, 4.2 * inch]); to.setStyle(GRID); s.append(to)
s.append(Spacer(1, 6))
s.append(P("RESOLVED FURTHER, that no other officer positions exist as of the Effective Date; that the positions of Chief Marketing "
           "Officer and Chief Creative Officer contemplated in prior drafts are not created; and that an officer's title does not by "
           "itself confer authority to bind the Company beyond the authority the Manager delegates."))

s.append(H("6. Former Participants"))
s.append(P("RESOLVED, that the Members confirm that [former participant] and [former participant] are not Members, hold no Units or rights to "
           "acquire Units, hold no office, and are not parties to any equity, vesting, purchase, or assignment document of the Company; "
           "and that any prior draft naming either of them in any such capacity is superseded and of no force or effect. Nothing in this "
           "resolution prevents the Company from admitting either person in the future by proper action under the LLC Agreement."))

s.append(H("7. Tax Matters"))
s.append(P("RESOLVED, that the Company's Employer Identification Number %s, assigned by the Internal Revenue Service on %s, is ratified; "
           "that the Company is classified as a partnership for federal and applicable state income tax purposes and will file Form 1065; "
           "that the Manager is designated partnership representative under Section 6223 of the Internal Revenue Code; that the fiscal "
           "year is the calendar year; and that the Company is not adopting any Section 83(b) election process or any fair-market-value "
           "determination memorandum in connection with the issuances approved in this consent, the Units issued for services being "
           "structured as profits interests under Section 3.5 of the LLC Agreement." % (EIN, EIN_DATE)))

s.append(H("8. Banking and Payments"))
s.append(P("RESOLVED, that the Manager is authorized to open and maintain bank, payment-processing (including Stripe), and similar accounts "
           "in the Company's name with such institutions as the Manager selects, to designate signatories, and to execute the standard "
           "account documentation of those institutions, which is incorporated by reference; and that Company funds will not be "
           "commingled with the funds of any Member or affiliate."))

s.append(H("9. Foreign Qualification"))
s.append(P("RESOLVED, that the Manager is authorized and directed to cause the Company to qualify to do business as a foreign limited "
           "liability company in the State of New York, where its principal office is located, to satisfy any related publication "
           "requirement, and to qualify in any other jurisdiction where the Company's activities require it."))

s.append(H("10. JGN Media LLC &mdash; Advances and Intercompany Agreements"))
s.append(P("RESOLVED, that the Members acknowledge that JGN Media LLC (\"JGN\") has advanced development and related expenses on the "
           "Company's behalf (approximately $2,000 as of July 2026, to be reconciled and recorded by the Manager); that such advances are "
           "unsecured, non-interest-bearing obligations of the Company repayable when the Manager determines cash is reasonably "
           "available, are not Capital Contributions, and do not entitle JGN to any Units or other interest in the Company, all as "
           "provided in Section 3.8 of the LLC Agreement."))
s.append(P("RESOLVED FURTHER, that the Company is authorized to enter into the following agreements with JGN, and the Manager is authorized "
           "to execute them on the Company's behalf: (a) a Master Brand and Trademark License from JGN to the Company granting the Company "
           "exclusive rights to the NOSEBLEED SPORTS name and master brand in the field of the Company's app, website, Discord, premium "
           "offering, and related products; (b) a Logo and Visual Identity License from the Company to JGN permitting JGN to use "
           "Company-owned logo, design, and visual-identity assets on JGN's retained media properties; and (c) a Marketing and Audience "
           "License from JGN to the Company granting nonexclusive rights to distribute Company content and offers through JGN's social "
           "media properties. The Members acknowledge that the Manager is a member of JGN, and this approval by all Class A Members "
           "satisfies Section 4.3(b) of the LLC Agreement with respect to those agreements."))

s.append(H("11. Proprietary Information and Inventions Assignment Agreements"))
s.append(P("RESOLVED, that each Class A Member will execute a Proprietary Information and Inventions Assignment Agreement in the Company's "
           "standard form as a condition of holding Units; that the designer-founder's agreement will expressly assign to the Company, to the "
           "extent personally owned, the current Nosebleed logo artwork, source files, logo variations, current visual identity, new "
           "design system, product-brand design assets, and derivative works; and that all such assignments run to the Company and not "
           "to JGN, whose use of Company-owned design assets is governed solely by the Logo and Visual Identity License."))

s.append(H("12. Superseded Materials"))
s.append(P("RESOLVED, that the \"Version 2.0 Master Change Log, Interim Institutional Audit Report and Record Book Index &mdash; Pre-Formation "
           "Delaware LLC Binder\" and its component documents, including any Founder Equity Fair Market Value Determination Memorandum, "
           "any Section 83(b) election packages, instructions, control logs, or Form 15620 materials, any founder purchase agreements "
           "reciting a purchase price derived from a $10,000 valuation or $0.001 per Unit, and any capitalization, vesting, officer, or "
           "signature schedule listing any former participant or reflecting 100% issuance of authorized Units, are superseded "
           "in their entirety, are not operative, and may be retained only as historical records marked \"SUPERSEDED &mdash; NOT OPERATIVE.\""))

s.append(H("13. General Authority"))
s.append(P("RESOLVED, that the Manager is authorized to take all actions, execute all documents, make all filings, and pay all fees "
           "necessary or advisable to carry out the foregoing resolutions, and that all actions previously taken by %s on the Company's "
           "behalf consistent with these resolutions are ratified and confirmed." % MANAGER_NAME))
s.append(P("This consent may be signed in counterparts, and electronic signatures are valid and binding. It will be filed with the "
           "Company's records."))

s.append(Spacer(1, 8)); s.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#999999"), spaceAfter=8))
s.append(P("IN WITNESS WHEREOF, the undersigned have executed this consent as of the Effective Date."))
s.append(Spacer(1, 8))
def col(n): return [Paragraph("<b>CLASS A MEMBER</b>", sig_style), Spacer(1, 18), Paragraph("Signature: ____________________________", sig_style),
                    Paragraph("Name: %s" % n, sig_style), Paragraph("Date: __________________", sig_style), Spacer(1, 6)]
cols = [col(n) for n, _ in MEMBERS]
for i in range(0, len(cols), 2):
    pair = cols[i:i + 2]; n = max(len(c) for c in pair)
    rows = [[c[j] if j < len(c) else "" for c in pair] for j in range(n)]
    t = Table(rows, colWidths=[3.15 * inch, 3.15 * inch]); t.setStyle(TableStyle([("VALIGN", (0, 0), (-1, -1), "TOP"), ("LEFTPADDING", (0, 0), (-1, -1), 0)])); s.append(t)
s.append(P("<b>MANAGER:</b> &nbsp; Signature: _______________________________ &nbsp; %s, %s &nbsp; Date: ______________" % (MANAGER_NAME, MANAGER_TITLE)))

doc = SimpleDocTemplate(OUT, pagesize=letter, leftMargin=0.85 * inch, rightMargin=0.85 * inch, topMargin=0.8 * inch, bottomMargin=0.8 * inch,
                        title="Organizational Consent of %s" % COMPANY_NAME, author=COMPANY_NAME)
doc.build(s)
print("Wrote", OUT)
