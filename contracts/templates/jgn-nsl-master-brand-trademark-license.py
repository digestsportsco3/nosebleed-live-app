#!/usr/bin/env python3
# TEMPLATE — public repository copy. Names, EIN and JGN ownership are placeholders; fill from the
# private master record before generating a signing copy. Never commit a filled copy.
"""Master Brand and Trademark License (JGN Media LLC to Nosebleed Sports LLC).

JGN owns the NOSEBLEED SPORTS word mark, the common-law rights and goodwill in it, the legacy
social accounts and the legacy media assets. This License gives NSL the exclusive, royalty-free,
perpetual right to use the brand in the Product Field, surviving a bona fide Change of Control
of NSL for the successor.

Generated in both brand modes (see nbs_style.BRAND_KIT_OWNER):
  * "JGN"  - the Licensed Brand also includes the new brand kit, which NSL assigns to JGN under
             the Brand Asset Assignment; that assignment is the consideration for this License.
  * "NSL"  - the Licensed Brand is the word mark, common-law rights, goodwill and legacy media
             identity only; NSL keeps the brand kit and licenses it to JGN under the Logo and
             Visual Identity License.
"""

import os
from nbs_style import (  # fill-in constants and style helpers
    JGN_MODE, BRAND_KIT_OWNER, WORKDIR, JGN_NAME, JGN_STATE, JGN_ADDRESS, JGN_SIGNER,
    JGN_SIGNER_TITLE, COMPANY_NAME, COMPANY_STATE, FORMATION_DATE, DE_FILE_NUMBER,
    PRINCIPAL_OFFICE, EIN, CEO_NAME, CEO_TITLE, CTO_NAME, EFFECTIVE_DATE, MARK, GOVERNING_LAW,
    VENUE, T_MASTER, T_ASSIGN, T_LOGO, T_SECOND, T_MKTG, T_TSA, T_OA, T_PIIA, T_BROCK,
    PRODUCT_FIELD, MEDIA_FIELD, BRAND_KIT_DESC, LEGACY_ACCOUNTS, DASH,
    Spacer, HRFlowable, colors, P, H, BUL, masthead, sigblock, build, sig_style)

# =============================== FILL-INS ===============================
OUT = os.environ.get("OUT_PDF", os.path.join(
    WORKDIR, "JGN_NSL_Master_Brand_and_Trademark_License.pdf"))
CURE_DAYS       = "sixty (60)"
SAMPLE_CADENCE  = "no more often than once per calendar quarter"
WINDDOWN_DAYS   = "one hundred twenty (120)"
ENFORCE_WINDOW  = "sixty (60)"
NSL_NOTICE_DAYS = "ninety (90)"
# ========================================================================

s = []
masthead(s, [T_MASTER.upper(),
             "between " + JGN_NAME + " (Licensor) and " + COMPANY_NAME + " (Licensee)"])

s.append(P("This " + T_MASTER + " (this \"License\") is made effective as of <b>" + EFFECTIVE_DATE +
           "</b> (the \"Effective Date\") between <b>" + JGN_NAME + "</b>, a " + JGN_STATE +
           " limited liability company with its principal office at " + JGN_ADDRESS +
           " (\"JGN\" or \"Licensor\"), and <b>" + COMPANY_NAME + "</b>, a " + COMPANY_STATE +
           " limited liability company with its principal office at " + PRINCIPAL_OFFICE +
           " (the \"Company\" or \"Licensee\"). JGN and the Company are each a \"Party\" and "
           "together the \"Parties.\""))

# ---------------------------------------------------------------- recitals
s.append(H("Recitals"))
s.append(P("<b>A.</b> JGN owns the " + MARK + " name and master brand, including the word mark, the "
           "common-law trademark rights in it, the historical goodwill associated with it, " +
           LEGACY_ACCOUNTS + ", and JGN's legacy media assets and historical content."))
s.append(P("<b>B.</b> The Company was formed as a " + COMPANY_STATE + " limited liability company on " +
           FORMATION_DATE + " under file number " + DE_FILE_NUMBER + ", holds Employer Identification "
           "Number " + EIN + ", and operates the Nosebleed Sports application, website, Discord "
           "community, subscription and premium picks offerings and related technology."))
if JGN_MODE:
    s.append(P("<b>C.</b> " + CTO_NAME + ", the Company's Chief Technology Officer, created " +
               BRAND_KIT_DESC + " (the \"Brand Kit\"), and assigned it to the Company under his " +
               T_PIIA + " (his \"PIIA\"). Concurrently with this License, the Company assigns the "
               "Brand Kit to JGN under the " + T_ASSIGN + " of even date between the Parties (the "
               "\"" + T_ASSIGN + "\"), so that the entire brand is held in a single entity. This "
               "License is the consideration for that assignment."))
    s.append(P("<b>D.</b> The Parties intend that JGN own the whole of the brand and that the Company "
               "hold, permanently and exclusively, every right in the brand that the Company's product "
               "business needs, including after a sale of the Company."))
else:
    s.append(P("<b>C.</b> " + CTO_NAME + ", the Company's Chief Technology Officer, created " +
               BRAND_KIT_DESC + " (the \"Brand Kit\"), and assigned it to the Company under his " +
               T_PIIA + " (his \"PIIA\"). The Company retains ownership of the Brand Kit and licenses "
               "it to JGN for JGN's retained media properties under the " + T_LOGO + " of even date "
               "between the Parties. The Brand Kit is not licensed to the Company under this License, "
               "because the Company already owns it."))
    s.append(P("<b>D.</b> The Parties intend that the Company hold, permanently and exclusively, every "
               "right in JGN's " + MARK + " name and master brand that the Company's product business "
               "needs, including after a sale of the Company."))
s.append(P("<b>E.</b> JGN's members have approved this License by written consent, and the Company's "
           "Class A Members have approved it under Section 11.2 of the Company's " + T_OA + " (the "
           "\"" + T_OA + "\")."))
s.append(P("The Parties agree as follows."))

# ---------------------------------------------------------------- 1
s.append(H("1. Definitions"))
s.append(BUL("<b>\"Brand\"</b> means the " + MARK + " name and master brand as a whole, including the "
             "word mark, the common-law trademark rights and goodwill in it, trade dress, and all "
             "names, marks, logos and identity elements used to identify the Nosebleed Sports business."))
if JGN_MODE:
    s.append(BUL("<b>\"Brand Kit\"</b> means " + BRAND_KIT_DESC + ", assigned by the Company to JGN "
                 "under the " + T_ASSIGN + "."))
    s.append(BUL("<b>\"Licensed Brand\"</b> means, collectively, the Licensed Marks and the Brand Kit, "
                 "together with all goodwill in them and all modifications, updates and derivative "
                 "works of them created by either Party during the Term."))
else:
    s.append(BUL("<b>\"Brand Kit\"</b> means " + BRAND_KIT_DESC + ". The Brand Kit is owned by the "
                 "Company and is licensed to JGN under the " + T_LOGO + ". It is not part of the "
                 "Licensed Brand."))
    s.append(BUL("<b>\"Licensed Brand\"</b> means the Licensed Marks, together with all goodwill in "
                 "them and all modifications, updates and derivative works of them created by either "
                 "Party during the Term."))
s.append(BUL("<b>\"Licensed Marks\"</b> means the " + MARK + " word mark, the common-law trademark and "
             "service mark rights in it, any registration or application for it in JGN's name, and any "
             "confusingly similar or successor mark adopted by JGN for the Nosebleed Sports business."))
s.append(BUL("<b>\"Product Field\"</b> means " + PRODUCT_FIELD + "."))
s.append(BUL("<b>\"Media Field\"</b> means " + MEDIA_FIELD + "."))
s.append(BUL("<b>\"Brand Standards\"</b> means the reasonable written standards for quality, "
             "presentation and use of the Licensed Brand described in Section 4."))
s.append(BUL("<b>\"Change of Control\"</b> has the meaning given in the " + T_OA + ", and a \"bona fide "
             "Change of Control\" means one approved in accordance with that agreement in a "
             "transaction with a person that is not an affiliate of the transferring Members."))
s.append(BUL("<b>\"Successor\"</b> means the acquiring person in a bona fide Change of Control of the "
             "Company, or the surviving or resulting entity of that transaction, and its affiliates "
             "that operate the Company's business."))
s.append(BUL("<b>\"Term\"</b> has the meaning given in Section 8.1."))
s.append(Spacer(1, 4))

# ---------------------------------------------------------------- 2
s.append(H("2. Grant of License"))
s.append(P("<b>2.1 Grant.</b> JGN grants to the Company an <b>exclusive, royalty-free, fully paid-up, "
           "worldwide, perpetual</b> right and license, within the Product Field, to use, reproduce, "
           "display, perform, distribute, modify, create derivative works of and otherwise exploit the "
           "Licensed Brand, including to operate, market, promote, monetize and sell the Company's "
           "products and services under the Licensed Brand, to register and use the Licensed Brand in "
           "application stores, domain names, account handles and platform listings for the Product "
           "Field, and to use the Licensed Brand in the Company's corporate name and business "
           "identity. The Term is perpetual within the Product Field, subject only to Section 8.2."))
s.append(P("<b>2.2 Exclusivity.</b> The license granted in Section 2.1 is exclusive within the Product "
           "Field even as to JGN. During the Term, JGN will not use the Licensed Brand in the Product "
           "Field, will not license or otherwise authorize any third party to use the Licensed Brand "
           "in the Product Field, and will not operate or hold an interest in a product or service in "
           "the Product Field under the Licensed Brand or any confusingly similar mark, in each case "
           "other than through the Company."))
s.append(P("<b>2.3 Sublicensing.</b> The Company may sublicense its rights within the Product Field to "
           "its contractors, service providers, talent, vendors, application-store and payment "
           "platforms and other persons engaged in operating, distributing or promoting the Company's "
           "products, including [Class B Member] under the " + T_BROCK + ". Each sublicense is limited to "
           "the Product Field and to the term of the applicable engagement, is subject to the Brand "
           "Standards, and terminates automatically on termination of this License. The Company "
           "remains responsible for each sublicensee's compliance with this License. No further "
           "sublicensing is permitted without JGN's written approval, except that a sublicensee may "
           "authorize its own subcontractors to act on its behalf."))
s.append(P("<b>2.4 Reservation of rights; Media Field.</b> JGN reserves all rights in the Licensed "
           "Brand outside the Product Field, including the entire Media Field, which JGN retains and "
           "may exploit freely. Nothing in this License grants the Company any right in the Media "
           "Field, in JGN's legacy social media accounts or in JGN's legacy media assets; the "
           "Company's rights to distribute through JGN's social properties are granted separately and "
           "only under the " + T_MKTG + "."))
s.append(P("<b>2.5 No royalty.</b> No royalty, license fee, revenue share or other payment is or will "
           "become payable by the Company for the rights granted under this License. " +
           ("The consideration for this License is the Company's assignment of the Brand Kit under "
            "the " + T_ASSIGN + ", the sufficiency of which each Party acknowledges."
            if JGN_MODE else
            "The consideration for this License is the mutual covenants in this License and in the " +
            T_LOGO + " and the " + T_MKTG + ", the sufficiency of which each Party acknowledges.")))
s.append(P("<b>2.6 Overlap with other agreements.</b> This License is separate from the " + T_MKTG +
           " and the " + T_TSA + " and is not to be consolidated with either of them. Termination or "
           "expiration of either of those agreements does not affect this License."))

# ---------------------------------------------------------------- 3
s.append(H("3. Ownership; Goodwill; No Challenge"))
s.append(P("<b>3.1 JGN ownership.</b> As between the Parties, JGN owns the Licensed Brand and all "
           "right, title and interest in it. This License grants a license only and transfers no "
           "ownership interest."))
s.append(P("<b>3.2 Goodwill.</b> All goodwill arising from the Company's use of the Licensed Marks "
           "inures to the benefit of JGN. The Company will execute any confirmatory document JGN "
           "reasonably requests to record that goodwill, at JGN's expense."))
s.append(P("<b>3.3 No challenge.</b> The Company will not challenge, and will not assist any third "
           "party in challenging, JGN's ownership of or title to the Licensed Brand, the validity of "
           "the Licensed Marks, or any registration or application for them. The Company will not "
           "apply to register the Licensed Marks or any confusingly similar mark in its own name, "
           "except that the Company may register product-level names, application titles, account "
           "handles and domain names within the Product Field, which it will hold subject to this "
           "License and assign to JGN on termination of this License."))
s.append(P("<b>3.4 Company property.</b> The Company owns its application, website, Discord "
           "community, technology, source code, data, subscriber relationships and product content, "
           "none of which is part of the Licensed Brand. Nothing in this License gives JGN any "
           "interest in them."))

# ---------------------------------------------------------------- 4
s.append(H("4. Quality Control and Brand Standards"))
s.append(P("<b>4.1 Standards.</b> The Company will use the Licensed Brand in a manner consistent with "
           "reasonable written brand standards provided by JGN from time to time, covering "
           "presentation of the marks, use of the Brand Kit elements, tone, quality of the products "
           "offered under the Licensed Brand, and compliance with applicable law, platform terms and "
           "advertising-disclosure rules. JGN will give the Company at least thirty (30) days' notice "
           "of any new or changed standard, and no standard may be applied in a way that materially "
           "impairs the Company's operation of its products in the Product Field."))
s.append(P("<b>4.2 Existing uses approved.</b> The Company's uses of the Licensed Brand in existence "
           "on the Effective Date, including its application, website, Discord community, "
           "application-store listings, subscription and premium picks offerings and marketing "
           "materials, are deemed approved and compliant with the Brand Standards, and remain "
           "approved for continued use and for ordinary-course updates in the same style."))
s.append(P("<b>4.3 Samples.</b> On JGN's reasonable written request, " + SAMPLE_CADENCE + ", the "
           "Company will provide representative samples or screenshots of its then-current use of the "
           "Licensed Brand, at no charge. JGN will treat them as confidential information of the "
           "Company."))
s.append(P("<b>4.4 Compliance.</b> The Company will comply with applicable law, platform and "
           "application-store terms, privacy and data-security requirements, consumer-protection "
           "rules and gambling-content and advertising rules in its use of the Licensed Brand."))
s.append(P("<b>4.5 Notice and cure.</b> If JGN believes the Company is materially failing to comply "
           "with the Brand Standards, JGN will give the Company written notice identifying the "
           "specific use, the standard it fails and the correction required. The Company has " +
           CURE_DAYS + " days after that notice to cure. Section 8.2 is JGN's only termination remedy "
           "for a breach of this Section 4."))

# ---------------------------------------------------------------- 5
s.append(H("5. JGN Covenants"))
s.append(P("<b>5.1 No competing license.</b> While this License is in effect, JGN will not license, "
           "assign, pledge or otherwise authorize any third party to use the Licensed Brand in the "
           "Product Field, and will not grant any right that conflicts with the Company's exclusive "
           "rights under Section 2."))
s.append(P("<b>5.2 Federal registration.</b> JGN will file and prosecute an application to register "
           "the " + MARK + " mark with the United States Patent and Trademark Office in JGN's name, "
           "covering, among other goods and services, the goods and services in the Product Field, "
           "and will maintain any resulting registration, including by paying maintenance fees and "
           "filing declarations of use and renewals when due. JGN will bear those costs. JGN will "
           "keep the Company reasonably informed of the status of the application and will provide "
           "the Company with copies of filings and office actions on request."))
s.append(P("<b>5.3 No abandonment.</b> JGN will not abandon, cancel, surrender or allow to lapse the "
           "Licensed Marks or any application or registration for them, and will not take or omit any "
           "action that would reasonably be expected to cause the Licensed Marks to become "
           "abandoned, generic or unenforceable. JGN will continue to use the Licensed Marks in the "
           "Media Field or will rely on the Company's controlled use in the Product Field to maintain "
           "the marks."))
s.append(P("<b>5.4 Specimens and evidence of use.</b> The Company will promptly provide specimens, "
           "dates of first use, sales information and other evidence of use that JGN reasonably needs "
           "for the application, maintenance or enforcement of the Licensed Marks, and JGN will "
           "reimburse the Company's documented out-of-pocket costs of doing so."))
s.append(P("<b>5.5 Transfer of the marks.</b> JGN may assign the Licensed Brand only to a person that "
           "assumes this License in writing and takes the Licensed Brand subject to it. Any purported "
           "assignment that does not comply with this Section is void."))

# ---------------------------------------------------------------- 6
s.append(H("6. Enforcement Against Third Parties"))
s.append(P("<b>6.1 Notice.</b> Each Party will promptly notify the other of any infringement, "
           "dilution, passing off or misuse of the Licensed Brand, and of any claim that the Licensed "
           "Brand infringes a third party's rights, of which it becomes aware."))
s.append(P("<b>6.2 JGN's right to act.</b> JGN has the first right, at its expense, to take action "
           "against third-party infringement of the Licensed Brand and controls that action, "
           "including settlement, provided that JGN will not settle in a way that impairs the "
           "Company's rights in the Product Field without the Company's written consent."))
s.append(P("<b>6.3 The Company's step-in right.</b> If the infringement occurs in the Product Field "
           "and JGN has not taken action within " + ENFORCE_WINDOW + " days after notice under "
           "Section 6.1, the Company may take action in its own name, at its own expense, and retain "
           "any recovery. JGN will join as a nominal party where required for standing and will "
           "provide reasonable cooperation, at the Company's expense."))

# ---------------------------------------------------------------- 7
s.append(H("7. Survival of a Change of Control"))
s.append(P("<b>7.1 Automatic survival.</b> This License survives a bona fide Change of Control of the "
           "Company automatically and in full, for the benefit of the Successor, on the same terms "
           "and at no royalty. No consent, approval, fee, renegotiation or new license is required, "
           "and neither the Change of Control itself nor the resulting change in the Company's "
           "ownership is a breach of, or a ground for termination of, this License."))
s.append(P("<b>7.2 Successor obligations.</b> The Successor takes the license subject to all of the "
           "Company's obligations under this License, including the Brand Standards, the no-challenge "
           "covenant and the Product Field limitation, and JGN's rights are enforceable against the "
           "Successor."))
s.append(P("<b>7.3 Change of Control of JGN.</b> A change of control of JGN does not terminate or "
           "impair this License, and JGN's successor takes the Licensed Brand subject to it."))
s.append(P("<b>7.4 Other assignment.</b> Except as provided in Sections 5.5, 7.1 and 7.3, neither "
           "Party may assign this License without the other Party's written consent, which will not "
           "be unreasonably withheld. The Company may assign this License together with all or "
           "substantially all of the assets of the business it is used in."))
s.append(P("<b>7.5 What this License does not carry.</b> This License does not give a Successor any "
           "right in the Media Field, in JGN's legacy social media accounts or in the " + T_MKTG +
           ", which has its own acquisition rule."))

# ---------------------------------------------------------------- 8
s.append(H("8. Term and Termination"))
s.append(P("<b>8.1 Term.</b> The Term begins on the Effective Date and continues perpetually within "
           "the Product Field (the \"Term\"). This License has no expiration date and no renewal "
           "requirement."))
s.append(P("<b>8.2 Termination by JGN.</b> JGN may terminate this License only for the Company's "
           "material breach of the Brand Standards under Section 4 that remains uncured " + CURE_DAYS +
           " days after JGN's written notice complying with Section 4.5. JGN has no other right to "
           "terminate this License, and in particular has no right to terminate for convenience, on "
           "notice, on a Change of Control, on a change in the Company's ownership or officers, or "
           "for breach of any other agreement between the Parties."))
s.append(P("<b>8.3 Disputed breach.</b> If the Company disputes an asserted breach in good faith by "
           "written notice given within the cure period and begins the dispute-resolution process in "
           "Section 12, the cure period and any termination are suspended until the dispute is "
           "resolved, and the Company may continue to use the Licensed Brand during that period."))
s.append(P("<b>8.4 Termination by the Company.</b> The Company may terminate this License at any time "
           "on " + NSL_NOTICE_DAYS + " days' written notice to JGN."))
s.append(P("<b>8.5 Effect of termination.</b> On termination, the Company's license ends, all "
           "sublicenses end, and the Company will cease use of the Licensed Brand except that the "
           "Company has " + WINDDOWN_DAYS + " days to complete an orderly transition, including "
           "rebranding its application and application-store listings, notifying subscribers, and "
           "exhausting materials already produced. The Company will transfer to JGN the domain names, "
           "account handles and platform listings that consist of or contain the Licensed Marks. "
           "Sections 3, 9, 10, 11.4, 12 and 13 survive termination, as do accrued obligations. "
           "Termination of this License does not affect the Company's ownership of its application, "
           "technology, data, subscriber relationships or product content" +
           (", and does not undo or give the Company any right to unwind the " + T_ASSIGN + "."
            if JGN_MODE else ".")))

# ---------------------------------------------------------------- 9
s.append(H("9. Combined Sale; Allocation Protections"))
s.append(P("<b>9.1 Combined sale cooperation.</b> The Parties may seek a future transaction in which a "
           "strategic buyer purchases both JGN and the Company. Each Party will cooperate in good "
           "faith in diligence, in providing brand chain-of-title records and in presenting the "
           "combined business. That strategy is not a binding obligation, and neither Party is "
           "required to be sold, or to be sold together with the other."))
s.append(P("<b>9.2 Allocation protections.</b> Any future combined acquisition must be separately "
           "approved by each entity under its own governing documents, and the allocation of "
           "consideration between JGN and the Company is governed by Section 11.4 of the " + T_OA +
           ", which the Parties incorporate by reference. If a buyer proposes one lump-sum amount "
           "with no reliable entity allocation, the allocation must be approved separately by each "
           "entity after consideration of an independent valuation or other commercially reasonable "
           "valuation methodology. No person who holds an interest in both entities may unilaterally "
           "shift value from one entity to the other."))
s.append(P("<b>9.3 Disclosure.</b> The existence and terms of this License, including its perpetual "
           "and Change-of-Control-surviving nature and the Product Field limitation, should be "
           "disclosed in acquisition-readiness materials for either entity."))

# ---------------------------------------------------------------- 10
s.append(H("10. Separate Entities; No Authority to Bind"))
s.append(P("<b>10.1 Separate entities.</b> JGN and the Company are and remain separate legal entities "
           "with distinct ownership, assets, capitalization, approvals, books and records. This "
           "License does not create a partnership, joint venture, agency, franchise or employment "
           "relationship between them."))
s.append(P("<b>10.2 No authority to bind.</b> Neither Party may enter into any contract, incur any "
           "obligation, make any representation or hold itself out as having authority to act for or "
           "bind the other Party. Each Party is responsible for its own costs, taxes, liabilities and "
           "compliance obligations."))
s.append(P("<b>10.3 No commingling.</b> The Parties will not commingle funds, accounts or records, "
           "and will maintain records sufficient to identify each entity's own revenue, expenses and "
           "assets."))
s.append(P("<b>10.4 Overlapping members.</b> Several persons hold interests in both JGN and the "
           "Company. Each Party has approved this License through its own governing process with that "
           "overlap disclosed, and no person acting for one Party is relieved of that Party's "
           "internal approval requirements."))

# ---------------------------------------------------------------- 11
s.append(H("11. Representations; Disclaimer; Indemnity"))
s.append(P("<b>11.1 JGN representations.</b> JGN represents that it has the power and authority to "
           "enter into this License and to grant the rights granted here; that its members have "
           "approved this License by written consent; that it owns the Licensed Brand" +
           (", including the Brand Kit acquired under the " + T_ASSIGN if JGN_MODE else "") +
           "; that it has not granted and will not grant any conflicting right in the Product Field; "
           "and that it is not aware of any claim that use of the Licensed Marks in the Product Field "
           "infringes a third party's rights."))
s.append(P("<b>11.2 Company representations.</b> The Company represents that it has the power and "
           "authority to enter into this License, that its Class A Members have approved it, and that "
           "it will use the Licensed Brand in accordance with this License."))
s.append(P("<b>11.3 Disclaimer.</b> Except as expressly stated in Section 11.1, the Licensed Brand is "
           "licensed as-is. JGN does not warrant that any application to register the Licensed Marks "
           "will be granted or that any registration will issue in any particular form or on any "
           "particular schedule."))
s.append(P("<b>11.4 Indemnity.</b> Each Party will defend, indemnify and hold harmless the other "
           "Party and its members, officers and contractors from third-party claims arising out of "
           "the indemnifying Party's breach of this License. The Company will indemnify JGN for "
           "claims arising out of the Company's products, content, marketing and data practices in "
           "the Product Field, other than a claim that the Licensed Brand itself infringes a third "
           "party's rights. JGN will indemnify the Company for a claim that the Company's use of the "
           "Licensed Brand in the Product Field in accordance with this License infringes a third "
           "party's trademark rights. The indemnified Party will give prompt notice, allow the "
           "indemnifying Party to control the defense, and cooperate at the indemnifying Party's "
           "expense. Neither Party is liable to the other for indirect, incidental, special, punitive "
           "or consequential damages, or for lost profits, arising out of this License."))

# ---------------------------------------------------------------- 12
s.append(H("12. Dispute Resolution"))
s.append(P("The Parties will attempt in good faith to resolve any dispute under this License through "
           "direct negotiation between the Parties' authorized signers for at least fifteen (15) days "
           "after written notice, and then through nonbinding mediation before a mutually agreed "
           "mediator. If the dispute remains unresolved thirty (30) days after mediation begins, or a "
           "Party refuses to mediate, either Party may bring the dispute in " + VENUE + ", and each "
           "Party consents to that jurisdiction and venue. Nothing in this Section prevents a Party "
           "from seeking injunctive relief at any time to protect the Licensed Brand or the Company's "
           "exclusive rights in the Product Field. Damages would be an inadequate remedy for breach "
           "of Sections 2.2, 3.3, 5.1, 5.3 or 7.1, and the non-breaching Party is entitled to "
           "specific performance and injunctive relief to enforce them, without posting bond."))

# ---------------------------------------------------------------- 13
s.append(H("13. General"))
s.append(P("<b>13.1 Governing law.</b> This License is governed by the laws of the " + GOVERNING_LAW +
           ", without regard to conflict-of-law principles."))
s.append(P("<b>13.2 Entire agreement.</b> This License, together with the " + T_SECOND + ", the " +
           T_MKTG + " and the " + T_TSA + ", is the entire "
           "agreement between the Parties regarding the Licensed Brand and supersedes all prior "
           "understandings and drafts on that subject, including the pre-formation binder documents. "
           "Each of those agreements is separate and is not to be consolidated with the others."))
s.append(P("<b>13.3 Amendment.</b> This License may be amended only by a written instrument signed by "
           "both Parties and approved by each Party in accordance with its own governing documents, "
           "which for JGN means the approval of its members holding at least the percentage its "
           "governing documents require and for the Company means the approval of its Class A Members "
           "required by Section 5.4 of the " + T_OA + "."))
s.append(P("<b>13.4 Notices.</b> Notices must be in writing and are effective when sent by email to "
           "the authorized signer of the receiving Party at the address most recently provided for "
           "notices, absent a bounce or error message, or when delivered by hand or by a nationally "
           "recognized courier to the Party's principal office."))
s.append(P("<b>13.5 Severability; waiver; headings.</b> If any provision is held unenforceable, it "
           "will be modified to the minimum extent necessary and the remainder will continue in "
           "effect. No waiver is effective unless in writing, and no waiver of one breach waives any "
           "other. Headings are for convenience only."))
s.append(P("<b>13.6 Third-party beneficiaries.</b> There are no third-party beneficiaries of this "
           "License, except that a Successor may enforce Section 7 and a sublicensee may rely on the "
           "sublicense granted to it under Section 2.3 for so long as this License and that "
           "sublicense remain in effect."))
s.append(P("<b>13.7 Further assurances.</b> Each Party will execute the documents and take the "
           "actions the other Party reasonably requests to carry out this License, including "
           "confirmatory recordals with the United States Patent and Trademark Office."))
s.append(P("<b>13.8 Counterparts; electronic signatures.</b> This License may be signed in "
           "counterparts and by electronic signature, each of which is valid and binding."))

# ---------------------------------------------------------------- signatures
s.append(Spacer(1, 8))
s.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#999999"), spaceAfter=8))
s.append(P("IN WITNESS WHEREOF, the Parties have executed this " + T_MASTER + " as of the Effective "
           "Date."))
sigblock(s, JGN_NAME, JGN_SIGNER, JGN_SIGNER_TITLE, "LICENSOR")
sigblock(s, COMPANY_NAME, CEO_NAME, CEO_TITLE, "LICENSEE")
s.append(Spacer(1, 6))
s.append(P("Signing order: the " + JGN_NAME + " Written Consent is signed by all five JGN members "
           "first; the Company's Initial Member and Organizational Written Consent is signed next; "
           "this License is then signed by both Parties.", sig_style))

build(s, OUT, T_MASTER + " " + DASH + " " + JGN_NAME + " to " + COMPANY_NAME)
