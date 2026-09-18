#!/usr/bin/env python3
# TEMPLATE — public repository copy. Names, EIN and JGN ownership are placeholders; fill from the
# private master record before generating a signing copy. Never commit a filled copy.
"""Signature Packet and Execution Order for Nosebleed Sports LLC.

    python3 make_signature_packet.py
    BRAND_KIT_OWNER=NSL python3 make_signature_packet.py

Post-formation replacement for the prior pre-formation "Signature Packet and Execution Order"
(binder document 62). The prior form's structure is kept - Execution Order, Founder Signature
Matrix, Company / JGN Signature Matrix, optional Spousal / Domestic Partner Consent, Company
signature block - and the content is rewritten to the closing set that actually exists:

  * formation facts stated as confirmed, no pre-formation banner and no placeholders
  * the execution order of INTERCOMPANY_MEMO.md section 5, extended with the six founder PIIAs
    (PIIA_MEMO.md), the ledgers, the [Class B Member] agreement, the operational transfers and the
    post-closing filings
  * units are issued for services as profits interests under the LLC Agreement, so the prior
    form's payment, collection and valuation steps are gone
  * only the six Class A founders appear; Jacob Skonieczny and Louis Stathis hold no interest
"""

import os

from reportlab.platypus import KeepTogether
from reportlab.lib.styles import ParagraphStyle

from nbs_style import (  # fill-in constants and style helpers
    JGN_MODE, BRAND_KIT_OWNER, WORKDIR, JGN_NAME, JGN_MEMBERS, COMPANY_NAME, COMPANY_STATE,
    FORMATION_DATE, DE_FILE_NUMBER, REG_AGENT, PRINCIPAL_OFFICE, EIN, CEO_NAME, CEO_TITLE,
    CTO_NAME, EFFECTIVE_DATE, T_OA, T_MASTER, T_LOGO, T_MKTG, T_TSA,
    T_INFRA, T_PIIA, T_BROCK, DASH,
    body_style, heading_style, bullet_style, sig_style, title_style, subtitle_style,
    Spacer, Table, TableStyle, HRFlowable, Paragraph, colors, inch, P, H, GRID, build)

# =============================== FILL-INS ===============================
OUT = os.environ.get(
    "OUT_PDF",
    os.path.join(WORKDIR, "Nosebleed_Sports_LLC_Signature_Packet_and_Execution_Order.pdf"))

PACKET_TITLE = "Signature Packet and Execution Order"

# The six Class A founders, in the order of make_founder_piia.py. (name, officer title)
FOUNDERS = [
    ("Nicholas Restivo", "Chief Executive Officer"),
    ("[Founder B]", "Chief Technology Officer"),
    ("[Founder E]", "Chief Operating Officer"),
    ("[Founder D]", "Chief AI Officer"),
    ("[Founder C]", "Chief Information Officer"),
    ("[Founder F]", "Business Development Officer"),
]

# Named in the prior form's matrix but holding no interest in the Company.
NO_INTEREST = ["Jacob Skonieczny", "Louis Stathis"]

# Class B Member, admitted by the Schedule G joinder when his Class B Units are issued.
CLASS_B_NAME = "[Class B Member]"

CONSENT_TITLE = "Initial Member and Organizational Written Consent"
JGN_CONSENT_TITLE = "Written Consent of the Members of " + JGN_NAME

# Tightened so the packet lands in the 4-5 page target.
FS = float(os.environ.get("PACKET_FONT", "9.2"))
body_style.fontSize = FS
body_style.leading = FS * 1.34
body_style.spaceAfter = 5
bullet_style.fontSize = FS
bullet_style.leading = FS * 1.34
bullet_style.spaceAfter = 3.5
bullet_style.leftIndent = 24
bullet_style.bulletIndent = 2
heading_style.fontSize = FS + 1.2
heading_style.leading = FS * 1.40
heading_style.spaceBefore = 9
heading_style.spaceAfter = 3
sig_style.fontSize = FS
sig_style.leading = FS * 1.34
title_style.fontSize = 13
title_style.leading = 16
subtitle_style.fontSize = 9.8
subtitle_style.leading = 12.5
subtitle_style.spaceAfter = 6
# ========================================================================

# An empty checkbox that survives text extraction. DejaVu carries U+2610; the base-14 fonts do
# not, so fall back to a bracket pair rather than print a notdef block.
_DEJAVU = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
try:
    from reportlab.pdfbase import pdfmetrics
    from reportlab.pdfbase.ttfonts import TTFont
    pdfmetrics.registerFont(TTFont("DejaVuSans", _DEJAVU))
    BOX = '<font name="DejaVuSans">☐</font>'
except Exception:  # pragma: no cover - font not installed
    BOX = "[ &nbsp; ]"

GREY = colors.HexColor("#999999")


def NUM(n, t):
    """One numbered step of the Execution Order."""
    return Paragraph(t, bullet_style, bulletText="(%d)" % n)


cell_style = ParagraphStyle("cell", parent=sig_style, fontSize=8.8, leading=11.5, spaceAfter=0)
head_style = ParagraphStyle("cellh", parent=cell_style, fontName="Helvetica-Bold")


def matrix(rows, widths):
    rows = [[Paragraph(c, head_style if i == 0 else cell_style) if isinstance(c, str) else c for c in r]
            for i, r in enumerate(rows)]
    t = Table(rows, colWidths=widths, repeatRows=1)
    t.setStyle(GRID)
    return t


s = []

# ---------------------------------------------------------------- masthead
s.append(P("SIGNATURE PACKET AND EXECUTION ORDER", title_style))
s.append(P("of", subtitle_style))
s.append(P(COMPANY_NAME.upper(), title_style))
s.append(P("a " + COMPANY_STATE + " limited liability company " + DASH +
           " closing signature schedule", subtitle_style))
s.append(HRFlowable(width="100%", thickness=1, color=GREY, spaceAfter=10))

# ---------------------------------------------------------------- preamble
s.append(P("This Signature Packet and Execution Order (this \"Packet\") records the order in which "
           "the closing documents of <b>" + COMPANY_NAME + "</b> (the \"Company\") are signed, who "
           "signs each of them and in what capacity, and the optional consent form that is used "
           "only where it applies. It replaces the pre-formation signature packet circulated among "
           "the founders in the prior binder. This Packet is a closing instruction and a record of "
           "signing sequence; it does not amend any document it lists, and if it differs from a "
           "signed document, that document governs."))
s.append(P("<b>Formation facts, confirmed.</b> The Company is a " + COMPANY_STATE + " limited "
           "liability company formed on <b>" + FORMATION_DATE + "</b> by the filing of a Certificate "
           "of Formation with the " + COMPANY_STATE + " Secretary of State under file number <b>" +
           DE_FILE_NUMBER + "</b>. Its registered agent is " + REG_AGENT + ". Its Employer "
           "Identification Number is <b>" + EIN + "</b> and its principal office is " +
           PRINCIPAL_OFFICE + ". The Company exists, and nothing in this Packet is conditional on "
           "its formation."))
s.append(P("<b>Brand structure.</b> This Packet is prepared in <b>" + BRAND_KIT_OWNER + "</b> mode. " +
           (JGN_NAME + " owns the NOSEBLEED SPORTS brand, including the brand kit, and licenses it "
            "to the Company for the Product Field under the <b>" + T_MASTER + "</b>. No separate "
            "brand transfer document is part of this closing." if JGN_MODE else
            JGN_NAME + " owns the NOSEBLEED SPORTS word mark and licenses it to the Company for the "
            "Product Field under the <b>" + T_MASTER + "</b>; the Company holds the logo and visual "
            "identity and licenses them to " + JGN_NAME + " for the Media Field under the <b>" +
            T_LOGO + "</b>.")))

# ---------------------------------------------------------------- 1
s.append(H("1. Execution Order"))
s.append(P("The documents are signed in this sequence. A step is completed before the next step is "
           "signed, except where a step expressly says otherwise."))

steps = [
    ("<b>" + JGN_CONSENT_TITLE + ".</b> Signed by all five " + JGN_NAME + " members " + DASH + " " +
     ", ".join(JGN_MEMBERS[:-1]) + " and " + JGN_MEMBERS[-1] + ". Nothing is signed for " +
     JGN_NAME + " until this consent exists, and no document in this Packet is dated before it."),

    ("<b>" + T_OA + "</b> of the Company. Signed by all six Class A Members named in Section 2 and "
     "acknowledged by the Company. This is the document that admits each founder as a Class A "
     "Member and issues the Class A Units recorded on its Schedule A."),

    ("<b>" + CONSENT_TITLE + "</b> of the Company. Signed by the same six Class A Members, who "
     "together hold one hundred percent (100%) of the outstanding Class A Units."),

    ("<b>The six founder " + T_PIIA + "s</b> (each a \"PIIA\", the agreement required by Section 9.2 "
     "of the " + T_OA + "). Each founder signs his own PIIA, and the Company counter-signs by the " +
     CEO_TITLE + " " + DASH + " except the " + CEO_TITLE + "'s own PIIA, which " + CTO_NAME + ", " +
     "Chief Technology Officer, counter-signs for the Company as the disinterested signer "
     "authorized by Section 17 of the " + CONSENT_TITLE + ", because no one counter-signs his own "
     "agreement. All six PIIAs are collected before step 5 is dated."),

    ("<b>" + T_MASTER + "</b>" + (" from " + JGN_NAME + " to the Company." if JGN_MODE else
     " from " + JGN_NAME + " to the Company and, in this mode, also the <b>" + T_LOGO + "</b> from "
     "the Company to " + JGN_NAME + ", which are delivered together and dated the same day.")),

    ("<b>" + T_MKTG + ".</b> Signed at the same sitting as step 5 or immediately after it."),

    ("<b>" + T_TSA + ".</b> Signed after step 6; the migration steps it describes run from the "
     "Effective Date."),

    ("<b>Schedule A, the Membership Ledger and the Schedule F Vesting Ledger</b> are confirmed as "
     "of the Effective Date and signed or initialled by the " + CEO_TITLE + ". All Units issued at "
     "closing are issued for services as profits interests under the " + T_OA + ", so there is no "
     "purchase payment, no payment collected or confirmed, and no valuation step in this sequence; "
     "vesting under Article 4 commences on the Effective Date."),

    ("<b>" + T_BROCK + ".</b> Signed by both entities and by " + CLASS_B_NAME + " at any point "
     "after step 3, together with his joinder in the form of Schedule G to the " + T_OA + " on "
     "issuance of his Class B Units."),

    ("<b>Operational and platform transfers</b> " + DASH + " domains, repositories, the Discord "
     "server, databases and the infrastructure and product service accounts " + DASH + " are "
     "completed in the order and to the owners shown on the <b>" + T_INFRA + "</b>, which is "
     "updated as each transfer completes."),

    ("<b>Post-closing filings.</b> Foreign qualification in the State of New York, where the "
     "principal office is located, any related publication requirement, state and local tax account "
     "registrations, and the remaining post-formation actions, in each case as the " +
     CONSENT_TITLE + " directs."),
]
for i, t in enumerate(steps, 1):
    s.append(NUM(i, t))

s.append(Spacer(1, 3))
s.append(P("<b>One Effective Date.</b> A single Effective Date is chosen at the closing and written "
           "identically into every document in this sequence " + DASH + " the " + T_OA + ", the " +
           CONSENT_TITLE + ", all six PIIAs, the intercompany agreements, the ledgers and the " +
           T_BROCK + ". Each document currently carries the blank <b>" + EFFECTIVE_DATE + "</b> for "
           "that purpose. Vesting, the non-solicitation period and the transition timetable all key "
           "off that one date. <b>No document is dated earlier than the day the " +
           JGN_CONSENT_TITLE + " is signed.</b> Every document may be signed in counterparts and by "
           "electronic signature."))

# ---------------------------------------------------------------- 2
s.append(H("2. Founder Signature Matrix"))
rows = [["Founder", "Officer title", "Documents this founder signs"]]
for name, title in FOUNDERS:
    if name == CEO_NAME:
        docs = ("The " + T_OA + "; the " + CONSENT_TITLE + "; his own PIIA as Founder; and, in "
                "addition, every Company-side and " + JGN_NAME + "-side signature listed for him in "
                "Section 3.")
    elif name == CTO_NAME:
        docs = ("The " + T_OA + "; the " + CONSENT_TITLE + "; his own PIIA as Founder; and, in "
                "addition, the Company-side counter-signature on the " + CEO_TITLE + "'s PIIA, as "
                "set out in Section 3.")
    else:
        docs = "The " + T_OA + "; the " + CONSENT_TITLE + "; his own PIIA as Founder."
    rows.append([name, title, Paragraph(docs, sig_style)])
s.append(matrix(rows, [1.3 * inch, 1.65 * inch, 3.85 * inch]))
s.append(Spacer(1, 5))
s.append(P(NO_INTEREST[0] + " and " + NO_INTEREST[1] + " are not in this matrix and sign nothing in "
           "this closing, because neither holds any Unit or other interest in the Company, as the " +
           CONSENT_TITLE + " confirms."))

# ---------------------------------------------------------------- 3
s.append(H("3. Company / " + JGN_NAME + " Signature Matrix"))
inter = (T_MASTER + ", " + ("" if JGN_MODE else "the " + T_LOGO + ", ") + "the " + T_MKTG +
         " and the " + T_TSA)
rows = [["Signer and capacity", "Documents signed in that capacity"]]
rows.append([
    Paragraph("<b>" + CEO_NAME + "</b><br/>as " + CEO_TITLE + " of the Company", sig_style),
    Paragraph("The Company side of every founder PIIA except his own; the Company side of each "
              "intercompany agreement " + DASH + " the " + inter + "; the " + T_BROCK +
              " for the Company; the " + T_INFRA + "; and the post-closing certifications and "
              "filings authorized by the " + CONSENT_TITLE + ".", sig_style)])
rows.append([
    Paragraph("<b>" + CTO_NAME + "</b><br/>as Chief Technology Officer and disinterested Company "
              "signer", sig_style),
    Paragraph("The Company side of " + CEO_NAME + "'s PIIA only. He signs nothing else for the "
              "Company.", sig_style)])
rows.append([
    Paragraph("<b>" + CEO_NAME + "</b><br/>as Chief Executive Officer of " + JGN_NAME, sig_style),
    Paragraph("The " + JGN_NAME + " side of each intercompany agreement " + DASH + " the " + inter +
              " " + DASH + " and of the " + T_BROCK + ", in each case only after the " +
              JGN_CONSENT_TITLE + " has been signed by all five members.", sig_style)])
rows.append([
    Paragraph("<b>All five " + JGN_NAME + " members</b><br/>" + ", ".join(JGN_MEMBERS), sig_style),
    Paragraph("The " + JGN_CONSENT_TITLE + ". This is step 1 and precedes every other " + JGN_NAME +
              " signature.", sig_style)])
rows.append([
    Paragraph("<b>" + CLASS_B_NAME + "</b><br/>as contractor and Class B Member on issuance",
              sig_style),
    Paragraph("The " + T_BROCK + ", and his joinder in the form of Schedule G to the " + T_OA +
              " on issuance of his Class B Units.", sig_style)])
s.append(matrix(rows, [2.05 * inch, 4.75 * inch]))
s.append(Spacer(1, 5))
s.append(P(CEO_NAME + " signs on both sides of the intercompany agreements. That overlap is "
           "disclosed and approved on each side " + DASH + " by the " + JGN_CONSENT_TITLE + " for " +
           JGN_NAME + " and by the " + CONSENT_TITLE + " for the Company " + DASH + " and each "
           "signature is given in the stated capacity only."))

# ---------------------------------------------------------------- 4
s.append(H("4. Optional Spousal / Domestic Partner Consent and Acknowledgment"))
s.append(P("<b>Do not assume that any founder is married or has a domestic partner.</b> The form "
           "below is blank and unused. Use it only where a founder's marital or community-property "
           "situation makes it applicable; where it does not apply, leave it unsigned and note that "
           "it was not required. No spouse or partner name appears anywhere in this Packet."))

box = []
box.append(P("<b>SPOUSAL / DOMESTIC PARTNER CONSENT AND ACKNOWLEDGMENT</b> " + DASH +
             " optional, use only where applicable", sig_style))
box.append(Spacer(1, 3))
box.append(P("The undersigned is the spouse or domestic partner of the founder named below (the "
             "\"Founder\"), who holds Class A Units of " + COMPANY_NAME + ". The undersigned "
             "confirms that he or she has had the opportunity to read the " + T_OA +
             " and acknowledges its vesting schedule, the repurchase and forfeiture of unvested "
             "Units, the restrictions on transfer, the right of first refusal and the drag-along "
             "obligation, and that those terms apply to all of the Founder's Units.", sig_style))
box.append(P("The undersigned agrees that any community-property, marital-property or other "
             "interest he or she may have or acquire in the Founder's Units is subject to and bound "
             "by the " + T_OA + " on the same terms as the Founder's own interest, and that the "
             "Founder may act alone in every matter under that agreement without the further "
             "signature or approval of the undersigned.", sig_style))
box.append(Spacer(1, 6))
box.append(P("Signature: ______________________________________ &nbsp;&nbsp;&nbsp; "
             "Date signed: ____________________", sig_style))
box.append(P("Name: __________________________________________ &nbsp;&nbsp;&nbsp; "
             "Relationship: ____________________", sig_style))
box.append(P("Founder: ________________________________________", sig_style))
bt = Table([[box]], colWidths=[6.8 * inch])
bt.setStyle(TableStyle([("BOX", (0, 0), (-1, -1), 0.7, GREY),
                        ("TOPPADDING", (0, 0), (-1, -1), 7),
                        ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
                        ("LEFTPADDING", (0, 0), (-1, -1), 8),
                        ("RIGHTPADDING", (0, 0), (-1, -1), 8)]))
s.append(bt)

# ---------------------------------------------------------------- 5
# Kept on one page: the Company's signature and the checklist it signs against.
sec5 = [H("5. Company Signature and Closing Checklist"),
        P("The Company adopts this Packet as its closing instruction as of the Effective Date."),
        Spacer(1, 4),
        P("<b>" + COMPANY_NAME.upper() + "</b>", sig_style),
        P("By: _________________________________________", sig_style),
        P("Name: " + CEO_NAME, sig_style),
        P("Title: " + CEO_TITLE, sig_style),
        P("Date signed: __________________________________", sig_style),
        Spacer(1, 8)]
chk = [[P("<b>CLOSING CHECKLIST</b>", sig_style)],
       [P("Effective Date written on every document: ____", sig_style)],
       [P("All six PIIAs collected before the " + T_MASTER + " is dated: " + BOX, sig_style)],
       [P(JGN_NAME + " consent signed before any " + JGN_NAME + " agreement: " + BOX, sig_style)]]
ct = Table(chk, colWidths=[6.8 * inch])
ct.setStyle(TableStyle([("BOX", (0, 0), (-1, -1), 1.0, colors.HexColor("#555555")),
                        ("LINEBELOW", (0, 0), (-1, 0), 0.5, GREY),
                        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#EFEFEF")),
                        ("TOPPADDING", (0, 0), (-1, -1), 5),
                        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
                        ("LEFTPADDING", (0, 0), (-1, -1), 8)]))
sec5.append(ct)
s.append(KeepTogether(sec5))

build(s, OUT, PACKET_TITLE + " " + DASH + " " + COMPANY_NAME)
