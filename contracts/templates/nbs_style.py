#!/usr/bin/env python3
# TEMPLATE — public repository copy. Names, EIN and JGN ownership are placeholders; fill from the
# private master record before generating a signing copy. Never commit a filled copy.
"""Shared fill-in constants and ReportLab style helpers for the JGN / Nosebleed intercompany
document set.

Every generator in this set imports from here so that (a) the BRAND_KIT_OWNER switch is read
from one place, (b) the agreement titles are spelled identically in every document that
cross-references them, and (c) the Product Field / Media Field definitions are literally the
same string everywhere.

Style helpers mirror make_nsl_org_consent.py.
"""

import os
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib.enums import TA_CENTER
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
                                HRFlowable, PageBreak)

# ============================= THE BRAND SWITCH =============================
# "JGN"  (default, recommended): the entire brand sits in JGN. The Brand Kit was developed for
#         the NOSEBLEED SPORTS brand by the Company's officers as part of their roles, so it is
#         brand property and part of the Licensed Brand under the Master Brand and Trademark
#         License, which the Company confirms in Section 3.5 of that License. There is no
#         second brand document in this mode.
# "NSL"  (fallback): NSL keeps the brand kit and licenses it to JGN under the Logo and Visual
#         Identity License. JGN still owns the word mark, goodwill and legacy accounts.
BRAND_KIT_OWNER = os.environ.get("BRAND_KIT_OWNER", "JGN").upper()
assert BRAND_KIT_OWNER in ("JGN", "NSL"), "BRAND_KIT_OWNER must be 'JGN' or 'NSL'"
JGN_MODE = BRAND_KIT_OWNER == "JGN"

# =============================== FILL-INS ===============================
WORKDIR          = os.path.dirname(os.path.abspath(__file__))

JGN_NAME         = "JGN Media LLC"
# JGN's state of formation: New York, confirmed by Nicholas Restivo 2026-09-17.
JGN_STATE        = "New York"
JGN_ADDRESS      = "105 Broadway, Rockville Centre, New York 11570"
JGN_SIGNER       = "Nicholas Restivo"
JGN_SIGNER_TITLE = "Chief Executive Officer"
JGN_MEMBERS      = ["Nicholas Restivo", "[JGN member]", "[JGN member]", "[JGN member]", "[JGN member]"]  # fill from the private record
JGN_MEMBER_PCT   = "__%"
JGN_THRESHOLD    = "eighty percent (80%)"
JGN_ADVANCES     = "approximately $5,000"

COMPANY_NAME     = "Nosebleed Sports LLC"
COMPANY_SHORT    = "the Company"
COMPANY_STATE    = "Delaware"
FORMATION_DATE   = "August 7, 2026"
DE_FILE_NUMBER   = "10727267"
REG_AGENT        = "ZenBusiness Inc., 611 South DuPont Highway, Suite 102, Dover, Delaware 19901"
PRINCIPAL_OFFICE = "105 Broadway, Rockville Centre, New York 11570"
EIN              = "__-_______"
CEO_NAME         = "Nicholas Restivo"
CEO_TITLE        = "Chief Executive Officer"
CTO_NAME         = "[Founder B]"
EFFECTIVE_DATE   = "____________, 2026"

MARK             = "NOSEBLEED SPORTS"
GOVERNING_LAW    = "State of New York"
VENUE            = "the state or federal courts located in Nassau County, New York"

# ------------------------- CANONICAL AGREEMENT TITLES -------------------------
# These strings are the single source of truth for how each document is named in every other
# document. Do not inline a variant spelling anywhere.
T_MASTER  = "Master Brand and Trademark License"
T_ASSIGN  = "Brand Asset Assignment"   # retained for reference only; not used in any output
T_LOGO    = "Logo and Visual Identity License"
T_MKTG    = "Marketing and Audience License"
T_TSA     = "Transition Services Agreement"
T_INFRA   = "Company Account and Infrastructure Schedule"
T_OA      = "Limited Liability Company Agreement"
T_PIIA    = ("Proprietary Information, Inventions Assignment, Confidentiality, Data Security "
             "and Non-Solicitation Agreement")
T_BROCK   = ("Talent, Handicapping, and Content Services Agreement among JGN Media LLC, the "
             "Company, and [Class B Member]")

# The second brand document exists only in "NSL" mode. In "JGN" mode the brand kit is JGN brand
# property under the Master Brand and Trademark License and there is no second brand document, so
# T_SECOND is None and every consumer must handle that.
T_SECOND  = T_LOGO if not JGN_MODE else None

# --------------------------- FIELD DEFINITIONS ---------------------------
# Identical text in every license. Verified string-for-string by verify_intercompany.py.
PRODUCT_FIELD = ("digital products and services offered under the NOSEBLEED SPORTS brand, including mobile and web "
                 "applications, websites, community platforms (including Discord), premium picks and "
                 "subscription offerings, in-product commerce, and successor products of any of the "
                 "foregoing")
MEDIA_FIELD = ("social media accounts and content, editorial and media publishing, sponsorships and "
               "brand deals on JGN properties, and advertising")

BRAND_KIT_DESC = ("the logo artwork and source files, logo variations, visual identity, design "
                  "system and product-brand design assets used by the Nosebleed Sports business, "
                  "together with all derivative works of them")
LEGACY_ACCOUNTS = ("the legacy X account, the TikTok account @NosebleedSportsMedia, the Instagram "
                   "account @NosebleedSportsMedia and JGN's other legacy social media accounts")

DASH = "—"

# =============================== STYLES ===============================
styles = getSampleStyleSheet()
title_style = ParagraphStyle("T", parent=styles["Title"], fontName="Helvetica-Bold", fontSize=14,
                             leading=18, alignment=TA_CENTER, spaceAfter=2)
subtitle_style = ParagraphStyle("S", parent=styles["Normal"], fontName="Helvetica", fontSize=10.5,
                                leading=14, alignment=TA_CENTER,
                                textColor=colors.HexColor("#444444"), spaceAfter=10)
heading_style = ParagraphStyle("H", parent=styles["Heading2"], fontName="Helvetica-Bold",
                               fontSize=11, leading=14, spaceBefore=11, spaceAfter=4)
body_style = ParagraphStyle("B", parent=styles["Normal"], fontName="Helvetica", fontSize=10,
                            leading=14.5, spaceAfter=7)
bullet_style = ParagraphStyle("Bu", parent=body_style, leftIndent=16, bulletIndent=5, spaceAfter=3)
sig_style = ParagraphStyle("Sig", parent=body_style, spaceAfter=2)


def P(t, s=body_style):
    return Paragraph(t, s)


def H(t):
    return Paragraph(t, heading_style)


def BUL(t):
    return Paragraph(t, bullet_style, bulletText="•")


GRID = TableStyle([("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                   ("FONTSIZE", (0, 0), (-1, -1), 8.8),
                   ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#EFEFEF")),
                   ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#BBBBBB")),
                   ("TOPPADDING", (0, 0), (-1, -1), 4),
                   ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
                   ("LEFTPADDING", (0, 0), (-1, -1), 6),
                   ("VALIGN", (0, 0), (-1, -1), "TOP")])


def masthead(s, lines, rule=True):
    """Title block: first line big, the rest as centered subtitles."""
    s.append(P(lines[0], title_style))
    for ln in lines[1:]:
        s.append(P(ln, subtitle_style))
    if rule:
        s.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#999999"),
                            spaceAfter=12))


def sigblock(s, entity, name, title, label):
    s.append(Spacer(1, 6))
    s.append(P("<b>" + label + "</b>", sig_style))
    s.append(P(entity, sig_style))
    s.append(P("By: _________________________________________", sig_style))
    s.append(P("Name: " + name, sig_style))
    s.append(P("Title: " + title, sig_style))
    s.append(P("Date signed: __________________________________", sig_style))


def sigblock_pair(s, left, right):
    """Two entity signature blocks side by side. Each arg is (label, entity, name, title)."""
    def col(label, entity, name, title):
        return [Paragraph("<b>" + label + "</b>", sig_style),
                Paragraph(entity, sig_style),
                Spacer(1, 14),
                Paragraph("By: ______________________________", sig_style),
                Paragraph("Name: " + name, sig_style),
                Paragraph("Title: " + title, sig_style),
                Paragraph("Date signed: ______________________", sig_style)]
    a, b = col(*left), col(*right)
    rows = [[a[i], b[i]] for i in range(len(a))]
    t = Table(rows, colWidths=[3.15 * inch, 3.15 * inch])
    t.setStyle(TableStyle([("VALIGN", (0, 0), (-1, -1), "TOP"),
                           ("LEFTPADDING", (0, 0), (-1, -1), 0)]))
    s.append(Spacer(1, 6))
    s.append(t)


def build(story, out, doc_title):
    doc = SimpleDocTemplate(out, pagesize=letter, leftMargin=0.85 * inch, rightMargin=0.85 * inch,
                            topMargin=0.8 * inch, bottomMargin=0.8 * inch,
                            title=doc_title, author=JGN_NAME + " / " + COMPANY_NAME)
    doc.build(story)
    print("Wrote", out, "| BRAND_KIT_OWNER =", BRAND_KIT_OWNER)
