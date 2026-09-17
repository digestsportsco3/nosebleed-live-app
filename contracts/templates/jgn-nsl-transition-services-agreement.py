#!/usr/bin/env python3
# TEMPLATE — public repository copy. Names, EIN and JGN ownership are placeholders; fill from the
# private master record before generating a signing copy. Never commit a filled copy.
"""Transition Services Agreement (JGN Media LLC and Nosebleed Sports LLC).

Update of prior-binder document 19. JGN lets the Company use JGN's existing Apple Developer,
Stripe/payment and related infrastructure temporarily, where platform rules permit, until the
Company's own accounts are live.

Carried forward from the prior draft: the service list, the ownership/no-commingling rule, the
merchant-of-record caveat, the 60-day migration target, the no-fee / documented-reimbursement-only
economics, and biweekly remittance of any Company revenue JGN temporarily receives.

Changed: the pre-formation "TBD" banner is gone; the counsel/CPA review condition is replaced with
a direct statement of who does what and when; and Section 6 states plainly that JGN is not the
merchant of record for the Company beyond the transition.

Identical in both brand modes (see nbs_style.BRAND_KIT_OWNER); only the cross-reference to the
second brand document changes.
"""

import os
from nbs_style import (  # fill-in constants and style helpers
    BRAND_KIT_OWNER, WORKDIR, JGN_NAME, JGN_STATE, JGN_ADDRESS, JGN_SIGNER, JGN_SIGNER_TITLE,
    COMPANY_NAME, COMPANY_STATE, FORMATION_DATE, DE_FILE_NUMBER, PRINCIPAL_OFFICE, EIN,
    CEO_NAME, CEO_TITLE, EFFECTIVE_DATE, GOVERNING_LAW, VENUE, JGN_ADVANCES,
    T_MASTER, T_SECOND, T_MKTG, T_TSA, T_OA, T_INFRA, DASH,
    Spacer, HRFlowable, colors, P, H, BUL, masthead, sigblock_pair, build, sig_style)

# =============================== FILL-INS ===============================
OUT = os.environ.get("OUT_PDF", os.path.join(
    WORKDIR, "JGN_NSL_Transition_Services_Agreement.pdf"))
# Fee concept carried from the prior binder draft: no service fee or royalty; documented
# out-of-pocket reimbursement only. Set SERVICE_FEE to a dollar figure only if the Parties later
# agree one, in which case Section 5.1 changes from "no fee" to that amount per month.
SERVICE_FEE       = None
MIGRATION_TARGET  = "sixty (60)"
REMITTANCE_CYCLE  = "every two weeks"
CURE_DAYS         = "fifteen (15)"
OUTSIDE_DATE      = "twelve (12) months"
# ========================================================================

s = []
masthead(s, [T_TSA.upper(),
             "between " + JGN_NAME + " and " + COMPANY_NAME])

s.append(P("This " + T_TSA + " (this \"Agreement\") is made effective as of <b>" + EFFECTIVE_DATE +
           "</b> (the \"Effective Date\") between <b>" + JGN_NAME + "</b>, a " + JGN_STATE +
           " limited liability company with its principal office at " + JGN_ADDRESS + " (\"JGN\"), "
           "and <b>" + COMPANY_NAME + "</b>, a " + COMPANY_STATE + " limited liability company "
           "formed on " + FORMATION_DATE + " under file number " + DE_FILE_NUMBER + ", holding "
           "Employer Identification Number " + EIN + ", with its principal office at " +
           PRINCIPAL_OFFICE + " (the \"Company\"). JGN and the Company are each a \"Party\" and "
           "together the \"Parties.\""))

# ---------------------------------------------------------------- 1
s.append(H("1. Purpose"))
s.append(P("JGN holds existing Apple Developer, Stripe and other payment and production accounts "
           "that predate the Company and are JGN Retained Assets under Schedule D to the Company's " +
           T_OA + " (the \"" + T_OA + "\"). Until the Company's own accounts are open and live, "
           "JGN will let the Company use those accounts and give the Company transition support, "
           "in each case only where the applicable platform's rules and contracts permit. This "
           "Agreement is temporary by design. It does not transfer any account, and it is not a "
           "long-term outsourcing or service arrangement."))

# ---------------------------------------------------------------- 2
s.append(H("2. Transition Services"))
s.append(P("During the Term, JGN will provide the following, each only to the extent platform rules "
           "and JGN's contracts permit and each on a commercially reasonable efforts basis:"))
s.append(BUL("<b>Apple Developer and application infrastructure.</b> Temporary use of JGN's Apple "
             "Developer account for building, signing, submitting, updating and, when the Company's "
             "own account is live, transferring the Company's application."))
s.append(BUL("<b>Payment infrastructure.</b> Temporary use of JGN's Stripe or other payment "
             "infrastructure for subscriptions, payments, payout records and migration planning."))
s.append(BUL("<b>Other production systems.</b> Temporary use of JGN-controlled infrastructure, "
             "domains, hosting, credentials and tooling identified on the " + T_INFRA + " as "
             "JGN-retained, pending the Company's own accounts."))
s.append(BUL("<b>Technical transition support.</b> Reasonable technical assistance in moving "
             "production operations, builds, keys, webhooks, data and integrations into "
             "Company-owned accounts."))
s.append(BUL("<b>Recordkeeping support.</b> Records and exports sufficient for the Company to track "
             "its own revenue, platform fees, processing fees, refunds, chargebacks and taxes "
             "separately from JGN activity."))
s.append(Spacer(1, 3))
s.append(P("<b>2.1 What is not included.</b> JGN is not obligated to provide staffing, development "
           "work, content production, capital, credit support or guarantees, or any service not "
           "listed above. JGN's obligations are those of an accommodating affiliate, not of a "
           "vendor, and JGN makes no service-level, uptime or performance commitment."))
s.append(P("<b>2.2 Company responsibilities.</b> The Company will apply for and open its own "
           "accounts promptly, provide the information those applications require, follow JGN's "
           "reasonable security and access instructions, and use JGN accounts only for the "
           "Company's own business and in compliance with the applicable platform's terms. The "
           "Company will not change JGN account settings, users, payout destinations or tax "
           "information except as JGN directs in writing."))

# ---------------------------------------------------------------- 3
s.append(H("3. Ownership; No Transfer; No Commingling"))
s.append(P("<b>3.1 Ownership.</b> JGN's existing accounts and infrastructure remain owned by JGN or "
           "the applicable account holder. The Company receives only temporary use and transition "
           "rights under this Agreement. Access credentials do not create ownership, and no account "
           "transfers except through a separate platform-compliant transfer the platform approves."))
s.append(P("<b>3.2 No holding out.</b> Neither Party will represent that a JGN Retained Asset is a "
           "Company-owned asset, in diligence materials, financial statements, application-store "
           "listings, marketing or otherwise. The " + T_INFRA + " records the target owner and "
           "current status of each account, and the Parties will keep it current."))
s.append(P("<b>3.3 No commingling.</b> The Parties will not commingle funds, accounts or records. "
           "Each Party will maintain books sufficient to identify its own revenue, expenses, "
           "liabilities and assets."))
s.append(P("<b>3.4 Company property.</b> The Company owns its application, source code, content, "
           "subscriber relationships and customer data regardless of which account they pass "
           "through during the transition. JGN will not use the Company's customer or subscriber "
           "data for JGN's own marketing."))

# ---------------------------------------------------------------- 4
s.append(H("4. Merchant of Record; Platform Status"))
s.append(P("<b>4.1 Legal status distinguished from intended economics.</b> The Parties intend that "
           "the economics of the Company's products belong to the Company. This Agreement does not "
           "state, and neither Party represents, that the Company is the seller or merchant of "
           "record where Apple, Stripe or another platform legally treats JGN or another account "
           "holder as seller or merchant of record. Where a platform treats JGN as the merchant or "
           "seller of record during the transition, Section 5.3 governs how the money reaches the "
           "Company."))
s.append(P("<b>4.2 JGN is not the Company's merchant of record beyond the transition.</b> JGN acts "
           "as a merchant or seller of record for the Company's products only for so long as, and "
           "only to the extent that, a platform requires it during the Term. JGN has no obligation "
           "to continue in that role after migration, after the Term, or after JGN reasonably "
           "determines that continuing would breach a platform's terms or applicable law, and JGN "
           "may discontinue the arrangement immediately in that case on notice to the Company."))
s.append(P("<b>4.3 Tax and regulatory positions.</b> Each Party is responsible for its own tax "
           "filings, registrations and any sales, use or similar taxes attributable to receipts it "
           "actually keeps. The Company is responsible for the tax and regulatory consequences of "
           "its own products, including any sports-wagering or gambling-related requirements."))

# ---------------------------------------------------------------- 5
s.append(H("5. Fees, Reimbursement and Revenue Remittance"))
if SERVICE_FEE:
    s.append(P("<b>5.1 Service fee.</b> The Company will pay JGN <b>" + str(SERVICE_FEE) + "</b> per "
               "month for the transition services, payable in arrears within fifteen (15) days "
               "after JGN's monthly statement."))
else:
    s.append(P("<b>5.1 No transition service fee.</b> No service fee, markup, royalty or overhead "
               "allocation is payable to JGN for the transition services. The Parties may agree a "
               "fee later only by a written amendment approved by each Party under its own "
               "governing documents."))
s.append(P("<b>5.2 Reimbursement of documented costs.</b> The Company will reimburse JGN for "
           "documented third-party costs JGN incurs for the Company, limited to platform and "
           "developer-program fees, payment-processing fees, refunds and chargebacks on Company "
           "transactions, taxes actually attributable to Company receipts, and other out-of-pocket "
           "costs the Company approves in writing in advance. JGN will support each reimbursement "
           "request with records. No undocumented, estimated or allocated overhead is "
           "reimbursable. JGN will invoice monthly and the Company will pay within fifteen (15) "
           "days of an invoice supported as required."))
s.append(P("<b>5.3 Remittance of Company revenue.</b> There is no Company revenue as of the "
           "Effective Date. If JGN receives Company revenue in a platform-compliant manner, JGN "
           "holds it for the Company's account and will remit it " + REMITTANCE_CYCLE + ". JGN may "
           "deduct only documented processing fees, refunds, chargebacks, taxes actually "
           "attributable to those receipts, and amounts the Company has approved in writing. With "
           "each remittance JGN will provide records sufficient to identify and reconcile the "
           "receipts, deductions and net amount. JGN will not apply Company receipts against the "
           "JGN Advances described in Section 5.4 or against any other obligation without the "
           "Company's written approval."))
s.append(P("<b>5.4 JGN Advances are separate.</b> JGN paid " + JGN_ADVANCES + " of documented "
           "development and operating expenses on the Company's behalf through the Effective Date, and may continue to advance such costs. Those amounts are "
           "an unsecured, non-interest-bearing obligation of the Company to JGN under Section 3.8 "
           "of the " + T_OA + ", repayable when the Company's Members determine cash is reasonably "
           "available. They are not capital contributions, not equity and not consideration for "
           "anything under this Agreement, and they are not transition service fees."))
s.append(P("<b>5.5 Audit of records.</b> On reasonable notice, and not more than twice in any "
           "twelve-month period, each Party may review the other Party's records relating to "
           "amounts payable or remittable under this Agreement. The reviewing Party bears the cost "
           "unless the review shows an error of more than five percent (5%) in its favor, in which "
           "case the other Party bears the reasonable cost of the review and pays the shortfall."))

# ---------------------------------------------------------------- 6
s.append(H("6. Migration"))
s.append(P("<b>6.1 Target.</b> The commercially reasonable target is to complete migration to "
           "Company-owned accounts within " + MIGRATION_TARGET + " days after the Effective Date, "
           "and in any event before meaningful commercial launch. That target is a plan, not an "
           "automatic termination date."))
s.append(P("<b>6.2 Migration steps.</b> The Company's Chief Executive Officer is responsible for "
           "opening the Company's bank, payment-processing and developer accounts, and the Parties "
           "will then transfer or re-create the application listing, payment configuration, "
           "subscription plans, webhooks, keys and payout destinations, and update the " + T_INFRA +
           " to record each completed transfer."))
s.append(P("<b>6.3 Prohibited arrangements.</b> If Apple, Stripe or another provider prohibits or "
           "conditions the temporary arrangement, the Parties will discontinue the prohibited "
           "arrangement immediately and migrate to Company-owned or otherwise compliant "
           "infrastructure. Neither Party is in breach of this Agreement for doing so."))

# ---------------------------------------------------------------- 7
s.append(H("7. Term and Termination"))
s.append(P("<b>7.1 Term.</b> The Term begins on the Effective Date and ends on the earliest of "
           "completion of migration for all services, termination under this Section 7, or the date " +
           OUTSIDE_DATE + " after the Effective Date, unless the Parties extend it in writing."))
s.append(P("<b>7.2 Termination.</b> Either Party may terminate this Agreement, in whole or as to any "
           "service, on thirty (30) days' written notice; immediately for the other Party's "
           "material breach that remains uncured " + CURE_DAYS + " days after written notice; and "
           "immediately where continuing would breach a platform's terms or applicable law."))
s.append(P("<b>7.3 Effect of termination.</b> On termination JGN's obligation to provide the "
           "affected service ends, the Company will stop using the affected JGN accounts, and each "
           "Party will promptly deliver to the other the records, exports and reconciliations the "
           "other needs to close out. JGN will remit Company revenue it holds within thirty (30) "
           "days. Sections 3, 4, 5.2 through 5.5, 8 and 9 and accrued obligations survive."))
s.append(P("<b>7.4 Independence.</b> This Agreement is separate from the " + T_MASTER +
           (", the " + T_SECOND if T_SECOND else "") + " and the " + T_MKTG +
           " and is not to be consolidated with any of them. "
           "Termination or expiration of this Agreement does not affect any of them, and in "
           "particular does not affect the " + T_MASTER + ", which is perpetual in the Product "
           "Field."))

# ---------------------------------------------------------------- 8
s.append(H("8. Compliance; Liability"))
s.append(P("<b>8.1 Compliance.</b> All services are subject to Apple, Stripe, application-store, "
           "payment-network, tax, privacy, consumer-protection and other platform rules and to "
           "applicable law. Before the Company relies on JGN infrastructure for live customer "
           "revenue, the Company's Chief Executive Officer will confirm in writing to JGN that the "
           "applicable platform's current terms permit the arrangement, will record the basis for "
           "that confirmation, and will re-confirm it if the platform's terms change. Either Party "
           "may suspend an affected service at any time if it reasonably believes the arrangement "
           "has become non-compliant."))
s.append(P("<b>8.2 Disclaimer; indemnity; limitation.</b> The transition services are provided "
           "as-is, without warranty. Each Party will defend, indemnify and hold harmless the other "
           "Party and its members, officers and contractors from third-party claims arising out of "
           "the indemnifying Party's breach of this Agreement, its own products and content, and "
           "its own compliance failures. Neither Party is liable to the other for indirect, "
           "incidental, special, punitive or consequential damages or for lost profits arising out "
           "of this Agreement. Nothing in this Section limits JGN's obligation to remit Company "
           "revenue under Section 5.3 or the Company's obligation to reimburse under Section 5.2."))

# ---------------------------------------------------------------- 9
s.append(H("9. Separate Entities; General"))
s.append(P("<b>9.1 Separate entities.</b> JGN and the Company remain separate legal entities with "
           "distinct ownership, assets, capitalization, approvals and records. This Agreement "
           "creates no partnership, joint venture, agency or employment relationship, and neither "
           "Party may bind the other, incur an obligation for the other or hold itself out as "
           "having authority to do so, except that JGN acts for the Company only to the limited "
           "extent a platform requires under Section 4.2. Several persons hold interests in both "
           "entities, and each Party has approved this Agreement through its own governing process "
           "with that overlap disclosed."))
s.append(P("<b>9.2 Allocation protections.</b> If the entities are sold together, the allocation of "
           "consideration between them is governed by Section 11.4 of the " + T_OA + ", which the "
           "Parties incorporate by reference, and must be approved separately by each entity under "
           "its own governing documents. Amounts owed under this Agreement are settled as "
           "intercompany obligations and are not consideration for either entity's equity."))
s.append(P("<b>9.3 Governing law; disputes.</b> This Agreement is governed by the laws of the " +
           GOVERNING_LAW + ", without regard to conflict-of-law principles. The Parties will "
           "attempt in good faith to resolve any dispute through direct negotiation for at least "
           "fifteen (15) days after written notice and then through nonbinding mediation; if the "
           "dispute remains unresolved thirty (30) days after mediation begins, either Party may "
           "bring it in " + VENUE + ", and each Party consents to that jurisdiction and venue."))
s.append(P("<b>9.4 Entire agreement; amendment; notices; counterparts.</b> This Agreement, with the " +
           T_MASTER + (", the " + T_SECOND if T_SECOND else "") + ", the " + T_MKTG + " and the " + T_INFRA + ", is the "
           "entire agreement between the Parties on its subject and supersedes all prior "
           "understandings and drafts, including the pre-formation binder documents. It may be "
           "amended only by a written instrument signed by both Parties and approved by each Party "
           "under its own governing documents. Notices are effective when sent by email to the "
           "receiving Party's authorized signer, absent a bounce or error message, or on delivery "
           "to that Party's principal office. If any provision is held unenforceable it will be "
           "modified to the minimum extent necessary and the remainder will continue in effect. "
           "Neither Party may assign this Agreement without the other Party's written consent. "
           "There are no third-party beneficiaries. This Agreement may be signed in counterparts "
           "and by electronic signature."))

# ---------------------------------------------------------------- signatures
s.append(Spacer(1, 6))
s.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#999999"), spaceAfter=8))
s.append(P("IN WITNESS WHEREOF, the Parties have executed this " + T_TSA + " as of the Effective "
           "Date."))
sigblock_pair(s, ("JGN MEDIA LLC", JGN_NAME, JGN_SIGNER, JGN_SIGNER_TITLE),
                 ("THE COMPANY", COMPANY_NAME, CEO_NAME, CEO_TITLE))

build(s, OUT, T_TSA + " " + DASH + " " + JGN_NAME + " and " + COMPANY_NAME)
