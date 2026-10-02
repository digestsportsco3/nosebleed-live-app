#!/usr/bin/env python3
# TEMPLATE — public repository copy. Names, EIN and JGN ownership are placeholders; fill from the
# private master record before generating a signing copy. Never commit a filled copy.
"""The second brand document, which exists only in nbs_style.BRAND_KIT_OWNER = "NSL" mode:

  * "JGN"  (default) -> nothing is generated. The brand kit was developed for the NOSEBLEED
           SPORTS brand by the Company's officers as part of their roles, so it is JGN brand
           property and part of the Licensed Brand under the Master Brand and Trademark License.
           Section 3.5 of that License carries the Company's confirmation. There is no separate
           assignment document.

  * "NSL"  (fallback) -> Logo and Visual Identity License (the Company to JGN)
           NSL_JGN_Logo_and_Visual_Identity_License.pdf
           NSL keeps the brand kit and licenses it to JGN for the Media Field.
"""

import os
import sys

from nbs_style import (  # fill-in constants and style helpers
    JGN_MODE, BRAND_KIT_OWNER, WORKDIR, JGN_NAME, JGN_STATE, JGN_ADDRESS, JGN_SIGNER,
    JGN_SIGNER_TITLE, COMPANY_NAME, COMPANY_STATE, FORMATION_DATE, DE_FILE_NUMBER,
    PRINCIPAL_OFFICE, EIN, CEO_NAME, CEO_TITLE, EFFECTIVE_DATE, MARK, GOVERNING_LAW,
    VENUE, T_MASTER, T_LOGO, T_MKTG, T_TSA, T_OA, body_style, heading_style,
    bullet_style,
    PRODUCT_FIELD, MEDIA_FIELD, BRAND_KIT_DESC, DASH,
    Spacer, HRFlowable, colors, P, H, BUL, masthead, sigblock_pair, build, sig_style)

# In "JGN" mode there is no second brand document at all. Remove any stale PDF from an earlier
# run so the directory cannot carry a superseded assignment.
if JGN_MODE:
    stale = os.path.join(WORKDIR, "NSL_JGN_Brand_Asset_Assignment.pdf")
    if os.path.exists(stale):
        os.remove(stale)
    print("Brand Asset Assignment: not used (brand kit is JGN brand property under the "
          "Master Brand and Trademark License)")
    sys.exit(0)

# =============================== FILL-INS ===============================
OUT = os.environ.get("OUT_PDF",
                     os.path.join(WORKDIR, "NSL_JGN_Logo_and_Visual_Identity_License.pdf"))
CURE_DAYS     = "sixty (60)"
WINDDOWN_DAYS = "ninety (90)"
# ========================================================================

ASSET_ITEMS = [
    "The Nosebleed Sports logo artwork in all formats and its editable source files, and all logo "
    "variations, lockups, icons, application icons and favicon assets",
    "The visual identity: color system, typography, iconography, illustration and photographic "
    "treatment, layout grids and motion treatments",
    "The design system: components, tokens, templates, style definitions and the design files in "
    "which they are maintained",
    "Product-brand design assets: application-store artwork and screenshots, website and Discord "
    "visual assets, and social and marketing templates and graphics",
    "All derivative works, revisions and work-in-progress files of the foregoing, and all copyrights, "
    "design rights and trade dress rights in them in every jurisdiction, together with all rights to "
    "recover for past, present and future infringement",
]

s = []

# =======================================================================
#  MODE "NSL": LOGO AND VISUAL IDENTITY LICENSE (the Company -> JGN)
# =======================================================================
masthead(s, [T_LOGO.upper(),
             "from " + COMPANY_NAME + " (Licensor) to " + JGN_NAME + " (Licensee)"])

s.append(P("This " + T_LOGO + " (this \"License\") is made effective as of <b>" + EFFECTIVE_DATE +
           "</b> (the \"Effective Date\") between <b>" + COMPANY_NAME + "</b>, a " + COMPANY_STATE +
           " limited liability company formed on " + FORMATION_DATE + " under file number " +
           DE_FILE_NUMBER + ", holding Employer Identification Number " + EIN + ", with its "
           "principal office at " + PRINCIPAL_OFFICE + " (the \"Company\" or \"Licensor\"), and "
           "<b>" + JGN_NAME + "</b>, a " + JGN_STATE + " limited liability company with its "
           "principal office at " + JGN_ADDRESS + " (\"JGN\" or \"Licensee\"). JGN and the Company "
           "are each a \"Party\" and together the \"Parties.\""))

s.append(H("Recitals"))
s.append(P("<b>A. The Licensed Assets.</b> " + BRAND_KIT_DESC[0].upper() + BRAND_KIT_DESC[1:] +
           " (the \"Licensed Assets\") were developed by the Company's officers as part of their "
           "roles. The Company owns the Licensed Assets."))
s.append(P("<b>B. JGN's master brand.</b> JGN owns the " + MARK + " name and master brand, "
           "including the word mark, the common-law trademark rights in it and the historical "
           "goodwill associated with it, JGN's legacy social media accounts and JGN's legacy media "
           "assets, all as listed on Schedule D to the Company's " + T_OA + " (the \"" + T_OA +
           "\"), and licenses them to the Company in the Product Field under the " + T_MASTER +
           " of even date (the \"" + T_MASTER + "\")."))
s.append(P("<b>C. Purpose.</b> JGN's retained media properties display the same visual identity as "
           "the Company's products. This License gives JGN the right to keep using the Licensed "
           "Assets on those properties in the Media Field."))
s.append(P("<b>D. Approvals.</b> The Company's Class A Members have approved this License under "
           "Sections 9.2 and 11.2 of the " + T_OA + ", and JGN's members have approved it by "
           "written consent."))
s.append(P("The Parties agree as follows."))

s.append(H("1. Licensed Assets"))
s.append(P("The \"Licensed Assets\" are:"))
for it in ASSET_ITEMS:
    s.append(BUL(it))
s.append(Spacer(1, 3))
s.append(P("The Licensed Assets do not include the Company's application, website, Discord "
           "community, source code, technology, databases, picks systems, prediction models, "
           "subscriber relationships or product content, and do not include the " + MARK +
           " word mark, the common-law rights or the goodwill in it, all of which JGN owns."))

s.append(H("2. Grant of License"))
s.append(P("<b>2.1 Grant.</b> The Company grants JGN a nonexclusive, royalty-free, fully paid-up, "
           "worldwide license, during the Term, to use, reproduce, display, distribute and create "
           "derivative works of the Licensed Assets within the Media Field, meaning " + MEDIA_FIELD +
           ", on JGN's retained media properties, including JGN's legacy social media accounts, "
           "editorial and media publishing, sponsorship and brand-deal deliverables on JGN "
           "properties, and advertising."))
s.append(P("<b>2.2 Reservation; Product Field.</b> The Company reserves all other rights. JGN "
           "receives no right to use the Licensed Assets in the Product Field, meaning " +
           PRODUCT_FIELD + ", which the Company operates and in which the Company holds the "
           "exclusive brand rights granted under the " + T_MASTER + "."))
s.append(P("<b>2.3 Sublicensing.</b> JGN may sublicense the Licensed Assets to its contractors, "
           "talent, agencies, sponsors and platform partners solely to produce and distribute JGN "
           "content and campaigns in the Media Field. Each sublicense is subject to this License "
           "and ends when this License ends. JGN remains responsible for each sublicensee's "
           "compliance. The Company may likewise sublicense its Product Field rights to its own "
           "contractors, including [Class B Member]."))
s.append(P("<b>2.4 No fee.</b> No royalty, license fee or revenue share is or will become payable "
           "for this License. The consideration is the mutual covenants in this License, the " +
           T_MASTER + " and the " + T_MKTG + "."))

s.append(H("3. Ownership; Quality Standards; No Challenge"))
s.append(P("<b>3.1 Ownership.</b> As between the Parties, the Company owns the Licensed Assets and "
           "all goodwill arising from JGN's use of them, insofar as that goodwill attaches to the "
           "Licensed Assets, inures to the Company. Goodwill attaching to the " + MARK +
           " word mark inures to JGN as owner of that mark. This License transfers no ownership."))
s.append(P("<b>3.2 Standards.</b> JGN will use the Licensed Assets in a manner consistent with "
           "reasonable written brand standards provided by the Company from time to time. JGN's "
           "uses in existence on the Effective Date are deemed approved, as are ordinary-course "
           "variations in the same style. No standard may be applied in a way that materially "
           "impairs JGN's operation of its media properties."))
s.append(P("<b>3.3 No challenge.</b> JGN will not challenge, or assist a third party in "
           "challenging, the Company's ownership of the Licensed Assets, and will not register or "
           "attempt to register the Licensed Assets in its own name. The Company will not "
           "challenge JGN's ownership of the " + MARK + " word mark, the common-law rights or the "
           "goodwill in it."))
s.append(P("<b>3.4 Compliance.</b> Each Party will comply with applicable law, platform terms, "
           "privacy and data-security requirements, advertising-disclosure rules and "
           "gambling-content rules in its use of the Licensed Assets."))

s.append(H("4. Term and Termination"))
s.append(P("<b>4.1 Term.</b> The Term begins on the Effective Date and continues until terminated "
           "under this Section 4."))
s.append(P("<b>4.2 Termination for breach.</b> Either Party may terminate this License for the "
           "other Party's material breach of Section 3.2 or 3.3 that remains uncured " + CURE_DAYS +
           " days after written notice identifying the specific use, the standard it fails and "
           "the correction required."))
s.append(P("<b>4.3 Termination for convenience.</b> The Company may terminate this License on " +
           WINDDOWN_DAYS + " days' written notice, and JGN may terminate it at any time on written "
           "notice."))
s.append(P("<b>4.4 Effect.</b> On termination, JGN's license ends and all sublicenses end, except "
           "that JGN has " + WINDDOWN_DAYS + " days to complete an orderly transition and may "
           "leave historical content already published in place without removing or re-editing "
           "it. Accrued obligations, Section 3.1, Section 3.3 and Sections 5 through 7 survive."))
s.append(P("<b>4.5 Independence.</b> This License is separate from the " + T_MASTER + ", the " +
           T_MKTG + " and the " + T_TSA + " and is not to be consolidated with any of them. "
           "Termination of this License does not affect the " + T_MASTER + ", which is perpetual "
           "in the Product Field."))

s.append(H("5. Change of Control; Assignment"))
s.append(P("<b>5.1 Change of Control of the Company.</b> This License survives a bona fide change "
           "of control of the Company, and the acquiring or surviving entity takes the Licensed "
           "Assets subject to it. A change of control of JGN does not terminate this License, and "
           "JGN's successor takes the license subject to it, provided the successor continues to "
           "operate JGN's media properties."))
s.append(P("<b>5.2 Other assignment.</b> Neither Party may otherwise assign this License without "
           "the other Party's written consent, which will not be unreasonably withheld."))

s.append(H("6. Separate Entities; Combined Sale; Allocation"))
s.append(P("<b>6.1 Separate entities.</b> JGN and the Company remain separate legal entities with "
           "distinct ownership, assets, approvals and records. This License creates no "
           "partnership, joint venture, agency or employment relationship, and neither Party may "
           "bind the other or hold itself out as having authority to do so. Several persons hold "
           "interests in both entities; each Party has approved this License through its own "
           "governing process with that overlap disclosed."))
s.append(P("<b>6.2 Combined sale; allocation.</b> The Parties may seek a future transaction in "
           "which a strategic buyer purchases both entities, and will cooperate in good faith in "
           "diligence and in providing brand chain-of-title records. That strategy is not binding. "
           "The allocation of consideration in any combined sale is governed by Section 11.4 of "
           "the " + T_OA + ", which the Parties incorporate by reference, and must be approved "
           "separately by each entity under its own governing documents. No person who holds an "
           "interest in both entities may unilaterally shift value from one entity to the other."))
s.append(P("<b>6.3 Disclosure.</b> The split of brand title between the Parties under this "
           "License and the " + T_MASTER + " should be disclosed in acquisition-readiness "
           "materials for either entity, because a buyer of one entity alone does not acquire the "
           "whole brand."))

s.append(H("7. General"))
s.append(P("<b>7.1 Representations.</b> Each Party represents that it has the power and authority "
           "to enter into this License and that it has obtained the approvals its governing "
           "documents require. The Company represents that it owns the Licensed Assets, which were "
           "developed by its officers as part of their roles. Except as stated, the Licensed Assets are licensed "
           "as-is, and neither Party is liable to the other for indirect, incidental, special, "
           "punitive or consequential damages or for lost profits."))
s.append(P("<b>7.2 Governing law; disputes.</b> This License is governed by the laws of the " +
           GOVERNING_LAW + ", without regard to conflict-of-law principles. The Parties will "
           "attempt in good faith to resolve any dispute through direct negotiation for at least "
           "fifteen (15) days after written notice and then through nonbinding mediation; if the "
           "dispute remains unresolved thirty (30) days after mediation begins, either Party may "
           "bring it in " + VENUE + ", and each Party consents to that jurisdiction and venue. "
           "Either Party may seek injunctive relief at any time."))
s.append(P("<b>7.3 Entire agreement; amendment; notices; counterparts.</b> This License, with the " +
           T_MASTER + ", the " + T_MKTG + " and the " + T_TSA + ", is the entire agreement between "
           "the Parties on its subject and supersedes all prior understandings and drafts, "
           "including the pre-formation binder documents. It may be amended only by a written "
           "instrument signed by both Parties and approved by each Party under its own governing "
           "documents. Notices are effective when sent by email to the receiving Party's "
           "authorized signer, absent a bounce or error message, or on delivery to the Party's "
           "principal office. This License may be signed in counterparts and by electronic "
           "signature."))

s.append(Spacer(1, 8))
s.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#999999"), spaceAfter=8))
s.append(P("IN WITNESS WHEREOF, the Parties have executed this " + T_LOGO + " as of the Effective "
           "Date."))
sigblock_pair(s, ("LICENSOR", COMPANY_NAME, CEO_NAME, CEO_TITLE),
                 ("LICENSEE", JGN_NAME, JGN_SIGNER, JGN_SIGNER_TITLE))

build(s, OUT, T_LOGO + " " + DASH + " " + COMPANY_NAME + " to " + JGN_NAME)
