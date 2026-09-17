#!/usr/bin/env python3
# TEMPLATE — public repository copy. Names, EIN and JGN ownership are placeholders; fill from the
# private master record before generating a signing copy. Never commit a filled copy.
"""Marketing and Audience License (JGN Media LLC to Nosebleed Sports LLC).

Update of prior-binder document 18. JGN grants NSL a nonexclusive, royalty-free right to
distribute NSL's content and offers through JGN's legacy social media properties. Ownership of
the accounts, the audience and the legacy media assets stays with JGN, and the license does not
travel with a sale of NSL standing alone.

Changes from the prior binder draft: the pre-formation "TBD" banner is gone (formation is
complete); the grant is aligned to the Product Field / Media Field split used in the Master Brand
and Trademark License; termination mechanics are stated directly rather than left at will with no
notice; and the license is expressly separated from the perpetual brand license so that
terminating this agreement cannot be used to unwind NSL's brand rights.

Identical in both brand modes (see nbs_style.BRAND_KIT_OWNER); only the cross-reference to the
second brand document changes.
"""

import os
from nbs_style import (  # fill-in constants and style helpers
    JGN_MODE, BRAND_KIT_OWNER, WORKDIR, JGN_NAME, JGN_STATE, JGN_ADDRESS, JGN_SIGNER,
    JGN_SIGNER_TITLE, COMPANY_NAME, COMPANY_STATE, FORMATION_DATE, DE_FILE_NUMBER,
    PRINCIPAL_OFFICE, EIN, CEO_NAME, CEO_TITLE, EFFECTIVE_DATE, MARK, GOVERNING_LAW, VENUE,
    T_MASTER, T_SECOND, T_MKTG, T_TSA, T_OA, T_BROCK, PRODUCT_FIELD, MEDIA_FIELD,
    LEGACY_ACCOUNTS, DASH,
    Spacer, HRFlowable, colors, P, H, BUL, masthead, sigblock_pair, build, sig_style)

# =============================== FILL-INS ===============================
OUT = os.environ.get("OUT_PDF", os.path.join(
    WORKDIR, "JGN_NSL_Marketing_and_Audience_License.pdf"))
TERM_NOTICE = "thirty (30)"
CURE_DAYS   = "thirty (30)"
# ========================================================================

s = []
masthead(s, [T_MKTG.upper(),
             "from " + JGN_NAME + " (Licensor) to " + COMPANY_NAME + " (Licensee)"])

s.append(P("This " + T_MKTG + " (this \"Agreement\") is made effective as of <b>" + EFFECTIVE_DATE +
           "</b> (the \"Effective Date\") between <b>" + JGN_NAME + "</b>, a " + JGN_STATE +
           " limited liability company with its principal office at " + JGN_ADDRESS + " (\"JGN\"), "
           "and <b>" + COMPANY_NAME + "</b>, a " + COMPANY_STATE + " limited liability company "
           "formed on " + FORMATION_DATE + " under file number " + DE_FILE_NUMBER + ", holding "
           "Employer Identification Number " + EIN + ", with its principal office at " +
           PRINCIPAL_OFFICE + " (the \"Company\"). JGN and the Company are each a \"Party\" and "
           "together the \"Parties.\""))
s.append(P("JGN owns and operates " + LEGACY_ACCOUNTS + " and the audience built on them. The "
           "Company operates the Nosebleed Sports application, website, Discord community and "
           "subscription offerings under the " + T_MASTER + " of even date (the \"" + T_MASTER +
           "\"). This Agreement lets the Company reach JGN's audience. It is a distribution "
           "license only; it transfers nothing. JGN's members have approved this Agreement by "
           "written consent and the Company's Class A Members have approved it under Section 11.2 "
           "of the Company's " + T_OA + " (the \"" + T_OA + "\")."))

# ---------------------------------------------------------------- 1
s.append(H("1. Definitions"))
s.append(BUL("<b>\"JGN Social Properties\"</b> means JGN's legacy social media accounts, handles, "
             "channels, pages, newsletters and audience lists, including " + LEGACY_ACCOUNTS +
             ", and any account JGN opens or acquires during the Term for the Media Field."))
s.append(BUL("<b>\"Company Content\"</b> means content, creative, offers, promotions, links and "
             "calls to action for the Company's products and services, produced or approved by the "
             "Company."))
s.append(BUL("<b>\"Product Field\"</b> means " + PRODUCT_FIELD + "."))
s.append(BUL("<b>\"Media Field\"</b> means " + MEDIA_FIELD + ". The Media Field is JGN's, and this "
             "Agreement does not move any part of it to the Company."))
s.append(Spacer(1, 4))

# ---------------------------------------------------------------- 2
s.append(H("2. Marketing and Audience Rights"))
s.append(P("<b>2.1 Grant.</b> JGN grants the Company a <b>nonexclusive, royalty-free, fully paid-up, "
           "worldwide</b> right and license during the Term to use the JGN Social Properties, and "
           "JGN's audience and distribution reach, to market, promote and distribute Company "
           "Content for the Company's products and services in the Product Field, including by "
           "having Company Content posted, reposted, linked, pinned, placed in profile and bio "
           "links, included in stories and newsletters, and promoted through JGN's talent and "
           "creators. The Company may also use JGN handles, account names and logos in its own "
           "marketing and application-store promotional materials to identify the relationship."))
s.append(P("<b>2.2 Nonexclusive.</b> The license is nonexclusive. JGN may post its own content and "
           "the content of others, including content for products that compete with the Company's, "
           "on the JGN Social Properties, and may enter into sponsorship, advertising and affiliate "
           "arrangements with third parties, subject to Section 5.3."))
s.append(P("<b>2.3 Approval, guidelines and platform rules.</b> Distribution under this Agreement is "
           "subject to JGN's reasonable approval of specific Company Content, JGN's brand and "
           "editorial guidelines, the terms of the applicable platform, JGN's existing sponsorship "
           "and exclusivity commitments, and applicable law. JGN will respond to a request for "
           "approval within a reasonable time and will not withhold approval unreasonably. Content "
           "and formats already in use on the Effective Date are deemed approved."))
s.append(P("<b>2.4 No minimum commitment.</b> There is no minimum posting requirement, no minimum "
           "impression, reach, click-through or traffic commitment and no guaranteed placement, "
           "schedule or performance. JGN makes no representation about the size, engagement or "
           "composition of its audience."))
s.append(P("<b>2.5 Sublicensing.</b> The Company may extend the benefit of this license to its "
           "contractors, talent and agencies acting on its behalf in the Product Field, including "
           "[Class B Member] under the " + T_BROCK + ", solely to produce and place Company Content. The "
           "Company remains responsible for their compliance with this Agreement."))
s.append(P("<b>2.6 No fee.</b> No royalty, license fee, revenue share or placement fee is or will "
           "become payable by the Company under this Agreement. Paid media purchased by either "
           "Party is handled separately, and neither Party is obligated to buy paid media for the "
           "other."))

# ---------------------------------------------------------------- 3
s.append(H("3. Ownership Preserved; No Assignment of Accounts"))
s.append(P("<b>3.1 JGN ownership.</b> JGN retains ownership of the JGN Social Properties and of all "
           "legacy media assets, including the accounts and handles themselves, follower and "
           "subscriber lists, historical content, historical sponsorship, advertising and affiliate "
           "agreements, historical revenue and legacy media intellectual property. These are JGN "
           "Retained Assets under Schedule D to the " + T_OA + "."))
s.append(P("<b>3.2 No transfer.</b> This Agreement does not transfer, assign or grant a security "
           "interest in any social media account, handle, follower or subscriber list, historical "
           "media asset, sponsorship contract, advertising contract or affiliate contract, and does "
           "not give the Company administrative control of any JGN account. Any administrative "
           "access JGN chooses to give the Company is a convenience, is revocable, and creates no "
           "ownership interest."))
s.append(P("<b>3.3 Company ownership.</b> The Company owns the Company Content it creates, its "
           "products, its subscriber relationships and the data it collects through its own "
           "products. Nothing in this Agreement gives JGN an interest in them, and JGN's use of "
           "Company Content is limited to distributing it under this Agreement."))
s.append(P("<b>3.4 Brand rights are elsewhere.</b> The Company's right to use the " + MARK + " name "
           "and brand comes from the " + T_MASTER + " and not from this Agreement."))

# ---------------------------------------------------------------- 4
s.append(H("4. Data, Compliance and Records"))
s.append(P("<b>4.1 Compliance.</b> Each Party will comply with platform terms of service, privacy "
           "and data-protection law, consumer-protection rules, advertising and endorsement "
           "disclosure rules, and the law and platform rules governing sports-wagering and "
           "gambling-related content and advertising, in everything it does under this Agreement. "
           "Paid or sponsored Company Content distributed through the JGN Social Properties must "
           "carry the disclosures those rules require."))
s.append(P("<b>4.2 Data.</b> Neither Party will scrape, export or transfer personal data from a "
           "platform in violation of that platform's terms. Audience data that a platform makes "
           "available to JGN as account holder stays with JGN. Data that users provide directly to "
           "the Company through the Company's own products is the Company's, and the Company is the "
           "controller of it. Each Party will maintain reasonable data-security practices."))
s.append(P("<b>4.3 Records.</b> Each Party will keep records sufficient to show what was distributed "
           "under this Agreement and to separate each entity's revenue and expenses. Neither Party "
           "will commingle funds or records."))

# ---------------------------------------------------------------- 5
s.append(H("5. Term; Termination; Acquisition Rule"))
s.append(P("<b>5.1 Term.</b> The Term begins on the Effective Date and continues until terminated "
           "under this Section 5."))
s.append(P("<b>5.2 Termination.</b> Either Party may terminate this Agreement for convenience on " +
           TERM_NOTICE + " days' written notice stating the effective date of termination, and "
           "either Party may terminate immediately for the other Party's material breach that "
           "remains uncured " + CURE_DAYS + " days after written notice describing the breach. JGN "
           "may suspend distribution of specific Company Content immediately where a platform, a "
           "sponsor commitment or applicable law requires it, on notice to the Company. No longer "
           "or guaranteed notice period is created by this Agreement."))
s.append(P("<b>5.3 Competing promotions.</b> JGN may promote competing sports applications, "
           "communities, picks products and betting-adjacent products on the JGN Social Properties. "
           "JGN will not, however, grant a third party the right to use the " + MARK + " name or "
           "brand in the Product Field, which is licensed exclusively to the Company under the " +
           T_MASTER + "."))
s.append(P("<b>5.4 Effect of termination.</b> On termination the Company's distribution rights end, "
           "and the Company will stop using JGN handles, account names and logos in new marketing "
           "materials. Published historical posts may remain in place. Accrued obligations, "
           "Sections 3, 4, 6 and 7 and this Section 5.4 survive."))
s.append(P("<b>5.5 Acquisition rule.</b> This license does not automatically transfer to a purchaser "
           "of the Company standing alone, and it does not survive a Change of Control of the "
           "Company. A purchaser that wants continuing guaranteed access to JGN's social network "
           "must acquire " + JGN_NAME + " as part of the transaction or negotiate a new written "
           "license with JGN. The Parties' strategic intention to market both entities together to "
           "a future acquirer is not a binding obligation to sell them together."))
s.append(P("<b>5.6 This is not the brand license.</b> This Agreement is separate from the " +
           T_MASTER + ", the " + T_SECOND + " and the " + T_TSA + " and is not to be consolidated "
           "with any of them. Termination or expiration of this Agreement does not terminate, "
           "suspend or impair the " + T_MASTER + ", which is perpetual in the Product Field and "
           "survives a bona fide Change of Control of the Company, and no notice given under this "
           "Section 5 operates as notice under that license."))
s.append(P("<b>5.7 Acquisition disclosure.</b> This license structure is intentional and should be "
           "disclosed in acquisition-readiness materials for either entity, because the Company's "
           "access to JGN's audience is terminable and does not travel with a standalone sale of "
           "the Company, which may affect a standalone valuation of the Company."))

# ---------------------------------------------------------------- 6
s.append(H("6. Separate Entities; Allocation"))
s.append(P("<b>6.1 Separate entities.</b> JGN and the Company remain separate legal entities with "
           "distinct ownership, assets, capitalization, approvals and records. This Agreement "
           "creates no partnership, joint venture, agency or employment relationship, and neither "
           "Party may bind the other, incur an obligation for the other or hold itself out as "
           "having authority to do so. Several persons hold interests in both entities, and each "
           "Party has approved this Agreement through its own governing process with that overlap "
           "disclosed."))
s.append(P("<b>6.2 Combined sale; allocation protections.</b> The Parties may seek a future "
           "transaction in which a strategic buyer purchases both entities, and will cooperate in "
           "good faith in diligence. That strategy is not binding. The allocation of consideration "
           "between the entities in any combined transaction is governed by Section 11.4 of the " +
           T_OA + ", which the Parties incorporate by reference, must be approved separately by "
           "each entity under its own governing documents, and may not be used by any person "
           "holding an interest in both entities to shift value from one entity to the other."))
s.append(P("<b>6.3 Indemnity; limitation.</b> Each Party will defend, indemnify and hold harmless "
           "the other Party and its members, officers and contractors from third-party claims "
           "arising out of the indemnifying Party's breach of this Agreement, its own content and "
           "its own compliance failures. Neither Party is liable to the other for indirect, "
           "incidental, special, punitive or consequential damages or for lost profits arising out "
           "of this Agreement."))

# ---------------------------------------------------------------- 7
s.append(H("7. General"))
s.append(P("<b>7.1 Governing law; disputes.</b> This Agreement is governed by the laws of the " +
           GOVERNING_LAW + ", without regard to conflict-of-law principles. The Parties will "
           "attempt in good faith to resolve any dispute through direct negotiation for at least "
           "fifteen (15) days after written notice and then through nonbinding mediation; if the "
           "dispute remains unresolved thirty (30) days after mediation begins, or a Party refuses "
           "to mediate, either Party may bring it in " + VENUE + ", and each Party consents to that "
           "jurisdiction and venue."))
s.append(P("<b>7.2 Entire agreement; amendment; notices; counterparts.</b> This Agreement, with the " +
           T_MASTER + ", the " + T_SECOND + " and the " + T_TSA + ", is the entire agreement between "
           "the Parties on its subject and supersedes all prior understandings and drafts, "
           "including the pre-formation binder documents. It may be amended only by a written "
           "instrument signed by both Parties and approved by each Party under its own governing "
           "documents. Notices must be in writing and are effective when sent by email to the "
           "receiving Party's authorized signer, absent a bounce or error message, or on delivery "
           "to that Party's principal office. If any provision is held unenforceable it will be "
           "modified to the minimum extent necessary and the remainder will continue in effect. "
           "There are no third-party beneficiaries. This Agreement may be signed in counterparts "
           "and by electronic signature."))

# ---------------------------------------------------------------- signatures
s.append(Spacer(1, 6))
s.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#999999"), spaceAfter=8))
s.append(P("IN WITNESS WHEREOF, the Parties have executed this " + T_MKTG + " as of the Effective "
           "Date."))
sigblock_pair(s, ("LICENSOR", JGN_NAME, JGN_SIGNER, JGN_SIGNER_TITLE),
                 ("LICENSEE", COMPANY_NAME, CEO_NAME, CEO_TITLE))

build(s, OUT, T_MKTG + " " + DASH + " " + JGN_NAME + " to " + COMPANY_NAME)
