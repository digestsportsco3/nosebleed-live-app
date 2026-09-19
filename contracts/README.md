# JGN Media LLC — Contract Records

Master log for JGN Media LLC contracting. Keyed by X handle, **no operator PII**
(see `../CLAUDE.md` — this repo is public). Last updated 2026-09-17.

- **Company:** JGN Media LLC, a New York limited liability company (NY confirmed 2026-09-17)
- **Business address:** 105 Broadway, Rockville Centre, NY 11570
- **Signer:** Nicholas Restivo, Chief Executive Officer
- **Brands:** Nosebleed Sports; Casual Big Ten

---

## 1. Casual Big Ten Account Operator Agreement

Reusable template, one signed per operator. Body is identical for everyone; only
**Exhibit A** varies. Generator: `templates/casual-big-ten-operator-agreement.py`.

### Business deal (do not change without instruction)

| Term | Value |
|---|---|
| Ownership | JGN owns 100% of every account from inception — handles, followers, goodwill, credentials, monetization rights, analytics |
| Operator status | Independent contractor, 18+, temporary revocable access only |
| Base pay | None — pure revenue share |
| X monetization share | 50% of revenue attributable to the Assigned Account |
| Brand deal share | 50% of deals **approved and contracted by JGN** executed through sponsored content the operator posts. Lead source is irrelevant — an operator-referred deal still qualifies |
| Excluded revenue | Merchandise, affiliate, network-wide and Company-level revenue, unless JGN designates otherwise in writing |
| Collection | All revenue into JGN-controlled Stripe/bank accounts |
| Payment | Monthly, within 15 days of month end, with a statement. No invoice required from operator |
| Posting minimum | Set on Exhibit A. Network default 42/week; some operators at 28/week |
| Payment methods | Zelle, wire transfer, or PayPal |
| Governing law | **New York**, exclusive NY state/federal courts |
| Dispute path | Negotiation (15 days) → non-binding mediation → NY courts. No arbitration |
| Term | Open-ended; mutual 14-day termination for convenience |

### Key provisions and why they exist

- **§2 — Company reserved use.** JGN may post to or use any account at any time for
  network campaigns or internal needs. Company use is not a breach, does not count
  toward the operator's minimum, and JGN uses reasonable efforts not to disrupt.
  *That last clause exists so an operator cannot argue JGN's posting made their own
  performance impossible.*
- **§3.2 — Standard of care**, not a growth guarantee.
- **§3.3 — Approval rights.** JGN directs strategy, issues guidelines, pre-approves
  major campaigns, requires takedowns/corrections. Operator compliance with JGN
  direction is expressly not a breach by the operator.
- **§3.4 — Prohibited conduct.** No bought followers, bots, engagement pods, IP
  infringement, illegal/defamatory content, impersonation, FTC violations, or
  claiming university/conference/athlete affiliation or using official logos.
- **§3.5 — No subcontracting.** Services are personal to the operator.
- **§3.6 — Third-party media.** Account access is **not** a license to repost
  broadcasts, game footage, photos, or music; "it's all over social media" is not
  authorization. JGN approving a content *category* is not direction to post a
  *specific* item — the operator owns their own clip selection.
- **§5 — Ownership.** Assignment-first (effective on creation) with work-for-hire as
  backup. *Order matters: contractor social content does not fit cleanly into
  17 U.S.C. §101's enumerated categories, so the assignment has to lead.*
  Operator keeps pre-existing know-how; JGN gets a perpetual license to anything of
  theirs embedded in Work Product.
- **§7.4 — Emergency suspension.** JGN may suspend access on reasonable belief of
  security/reputational risk. Does not terminate the agreement; if the suspension is
  not the operator's fault, their posting obligations are excused and revenue share
  keeps accruing.
- **§7.5 — Liquidated damages.** See "Liquidated damages history" below.
- **§8 — No authority to bind.** No executing agreements, accepting sponsorships,
  incurring expenses, or making official statements.
- **§10.1 — Indemnity.** Names the real risks: broadcast/game-footage copyright,
  trademark, publicity/likeness/NIL, defamation, FTC, unauthorized sponsorships.
  Carve-out for content JGN created or specifically directed in writing without
  material deviation.
- **§10.4 — Limitation of liability.** JGN capped at 6 months of that operator's
  payments, excludes consequential damages, never caps revenue share actually owed.
  Operator uncapped for fraud, willful misconduct, account misappropriation (§7.3),
  and confidentiality (§9) — but **ordinary-negligence-only** indemnity claims are
  capped at the greater of 12 months' payments or $25,000. *That carve-down exists
  because fully uncapped negligence exposure against a young creator is where an
  unconscionability argument gets traction.*
- **§11.5 — Transition assistance.** Incidental handover only (files, drafts,
  questions, settings). Substantive post-termination work requires a separately
  agreed fee first.
- **§12.6 — Savings clause.** Nothing waives nonwaivable rights under applicable law.

### Liquidated damages history (§7.5)

Applies **only** to serious account-control misconduct: intentional lockout,
unauthorized transfer, deletion, destruction, misappropriation. Never to bad posts,
missed quotas, or good-faith errors. A 48-hour restoration window gates the damages
remedy only — it never delays suspension (§7.4) or immediate termination (§11.1).
Injunctive relief to recover the account is preserved.

Three versions exist. **Track which operator is on which.**

1. **Flat $50,000** (superseded). Rejected: a flat sum across accounts of wildly
   different value reads as a penalty.
2. **Three tiers** (most current operators): `<10k followers → $10,000`;
   `10k–50k → $25,000`; `50k+ → $50,000`.
3. **Four tiers** (@CasualOregon, @CasualWisconsin, @CasualUSC): adds
   `<1,000 followers → $2,500`, then $10,000 / $25,000 / $50,000.

Tiers are measured **at the time of the breach**, so the figure scales as an account
grows. Exhibit A may name a specific amount instead, changeable only by mutual
written agreement **before** any breach — never set by JGN after the fact.

**Why v3 exists:** the @CasualOregon operator pushed back before signing, noting the
account had 17 followers and a $10,000 floor was disproportionate. Correct read —
under NY law (*Truck Rent-A-Center v. Puritan Farms*) a disproportionate figure is
voided entirely, not reduced, so the aggressive number collects $0. A $2,500 floor
that holds beats a $10,000 floor that doesn't, and a calibrated bottom rung protects
the credibility of the $50,000 top tier.

> **OPEN ITEM:** the network is split across v2 and v3. Standardizing everyone on the
> four-tier version was recommended and not yet done.

### Roster (by handle — no PII in this file)

| Handle | School | Posts/wk | §7.5 | Status |
|---|---|---|---|---|
| @CasualNebraska | Nebraska | 28 | 3-tier | **Signed** |
| @CasualUCLA | UCLA | 42 | 3-tier | Issued |
| @CasualMSU | Michigan State | 28 | 3-tier | Issued |
| @CasualPurdue | Purdue | 42 | 3-tier | Issued (reassigned — first candidate never signed) |
| @CasualOSU | Ohio State | 42 | 3-tier | Issued |
| @Casual_Illini | Illinois | 42 | 3-tier | Issued |
| @CasualIowa | Iowa | 42 | 3-tier | Issued |
| @CasualMinnesota | Minnesota | 42 | 3-tier | Issued |
| @Casual_NU | Northwestern | 42 | 3-tier | Issued |
| @CasualRutgers | Rutgers | 42 | 3-tier | Issued |
| @CasualOregon | Oregon | 42 | **4-tier** | Issued (revised after operator pushback) |
| @CasualWisconsin | Wisconsin | 42 | **4-tier** | Issued — third operator for this seat |
| @CasualUSC | USC | 42 | **4-tier** | Issued — confirm handle spelling |

**@CasualWisconsin history:** operator 1 signed then requested out (Mutual Termination
and Release drafted — see §3 below); operator 2 backed out; operator 3 current.
Change the password between every handoff.

Big Ten schools not yet papered: Michigan, Penn State, Indiana, Maryland, Washington.

> **OPEN ITEMS:**
> - Effective dates on issued agreements read **August 14, 2026**. If any are still
>   unsigned as of signing, update the date.
> - Confirm @CasualUSC spelling (was supplied once as "@CausalUSC").
> - One operator's Exhibit A address is missing a ZIP; one is missing a phone.

---

## 2. Nosebleed Sports content agreement (Click Culture LLC)

Generator: `templates/nosebleed-content-agreement.py`.

Originally with **the contractor individually** (Aug 10, 2026), now **Amended and Restated**
with **Click Culture LLC** as Contractor, its principal signing as Authorized Signatory.

| Term | Value |
|---|---|
| Accounts | @NosebleedNFL, @NosebleedHQ, @Nosebleedhoops, @golfnbs |
| Deliverable | Minimum 5 posts/day on each (20/day total) |
| Fee | $500/account/month = $2,000/month flat (not revenue share) |
| Term | Aug 10 – **Dec 31, 2026** |
| Payments | $2,000 on the 10th, Aug–Dec = **$10,000 total**. The Dec 10 payment covers through Dec 31 |
| Restatement date | September 2, 2026 |

**Structure notes:** the restatement supersedes the original agreement, Click Culture
assumes the prior obligations, and prior services/payments are credited. The individual was
**not** released from the original agreement — deliberate. A key-person clause
requires the Services be performed **personally by that individual**, with no
assignment, subcontracting, or delegation — added because once the counterparty is an
LLC, nothing otherwise stops a stranger being put on the accounts.

> **OPEN ITEM:** this agreement still carries **Delaware** law and venue, inherited
> from the original draft. JGN is a New York company with no Delaware nexus. The
> Casual Big Ten agreements were converted to New York for exactly this reason;
> this one should be too.

---

## 3. Talent, Handicapping & Content Services Agreement (on-camera talent / handicapper seat)

Generator: `templates/nosebleed-talent-handicapper-agreement.py`. Built for the on-camera
talent + handicapper seat; reusable for similar roles.

### Entity structure (important)

Two entities, both parties to the agreement, together "the Company":

- **JGN Media LLC** — owns the Nosebleed Sports **brand and social media accounts**.
- **Nosebleed Sports LLC ("NSL")** — a **Delaware** LLC; owns the **app, website, Discord, and premium picks
  offering** (the "Platform"). **All equity is in NSL.** Nothing grants any interest in JGN.

Work Product is assigned to whichever entity the Company designates; absent designation,
brand/social content → JGN, picks/Platform content → NSL. Payment obligations are
obligations of both; either may give notice for the Company. Nick signs for both.

### Business deal (verbally agreed; supersedes the four written "paths")

| Term | Value |
|---|---|
| Monthly Fee | **00/month, paid in arrears** within 10 days of month end, conditioned on performance (§6) |
| Brand deal share | **50%** of deals the Contractor **sourced**, that **directly involve his work** (he creates, appears in, or delivers), or that arise from a **Nosebleed Opportunity** he referred under §4.3. Company-sourced deals he doesn't perform: 0% |
| Nosebleed Opportunity (§4.3) | Any paid opportunity that comes to him **because of** the brand: offered to him as Nosebleed talent; reaching him through a Company account, channel or audience; deliverables touching the Brand/Platform or his Nosebleed picks or persona; or a sportsbook/betting/DFS/odds/picks/sports-media counterparty approaching him for his handicapping profile. He refers it; the Company has **10 business days** to elect. If the Company declines or goes silent, **he keeps 100%** and it is not a Brand Deal |
| What is NOT touched | Anything failing all four Nosebleed-Opportunity tests is his alone — personal accounts, personal content, outside work, other income — no notice, no approval, no share (§2.6). Nothing predating the Effective Date is covered at all; he represents he has **no** existing sponsorship/endorsement/affiliate/ambassador/paid-picks agreement |
| Premium picks subs | **No revenue share** — counts only toward equity milestones (deliberate; the written paths all had one) |
| **Initial Units** | **0.50% of NSL issued up front**, non-voting, **forfeitable until vested** (§5.1, §5.4) |
| Milestone Units | Ladder rebuilt so the up-front 0.5% is an advance on the first tranche: **+0.5% at 5K → 1.0%; +1.5% at 0K → 2.5%; +1.25% at 10K → 3.75%; +1.25% at 75K → 5.0%.** Same 5% cap as the original offer |
| Qualifying Revenue | Any revenue he directly generated: brand deals, events he drove, premium subs attributed via tracking link/code, other documented attribution. Counted gross, once |
| Duties (Monthly Deliverables) | Nosebleed Sports TikTok + Instagram at 3 posts/day **each**; daily picks + write-ups; 30-min live before every NFL Sunday 1pm slate; lives for major events; ad hooks + on-camera in ads; weekly sync; daily Discord presence; 1-business-day response on team strategy; Managed Account handles displayed in his personal TT/IG bios |
| Termination | **Company: at will, effective immediately.** Contractor: 14 days' notice |
| Quarterly review | §3.2 — mandatory; may produce a **Value Notice** (§5.4); changes only by signed amendment |
| Governing law | New York |

### How the Initial Units forfeiture works (§5.4)

The 0.5% is issued at signing but is **unvested**. It vests (becomes his for keeps) on the
**earlier of** reaching the 5K milestone or **12 consecutive months** without an uncured
Shortfall Notice or Value Notice. **Before vesting it is forfeited for /bin/bash** if: (i) the
Company terminates following a Shortfall Notice, for material breach, or for prohibited
conduct; (ii) he quits; or (iii) a quarterly review produces a written **Value Notice**
("deliverables and overall contribution are not meeting expectations," with the
deficiencies identified) and he fails to cure within 30 days. If the Company terminates
before vesting *without* one of those grounds, the units vest — that tracks the stated
intent ("taken away if deliverables and value are not met"), not "taken away for any
reason," and keeps the grant from being illusory. If forfeited, the 5K tranche becomes a
full 1% so the ladder's cumulative percentages are unchanged.

### Key provisions and why

- **§6 — Performance is a condition of payment and equity.** Monthly Fee earned only on
  substantial performance; written **Shortfall Notice** → pro-rata reduction or full
  withholding for material misses. Milestones defer while under an uncured notice and
  forfeit if terminated before cure. *Written notice is what keeps this enforceable rather
  than illusory; in-arrears payment is what makes withholding mechanically clean.*
- **§5 — Equity is a contractual right to issuance subject to NSL's Operating Agreement.**
  Non-voting, dilutable, may be profits interests. **NSL has no OA yet**, so §5.6 locks the
  0.5% economically as of the Effective Date (anti-dilution through the gap), obligates NSL
  to use commercially reasonable efforts to adopt an OA with a non-voting class within
  **120 days**, and issues within 30 days of adoption. Vesting/forfeiture run from the
  Effective Date regardless. *Issuing under NY LLC Law default rules with no OA would hand
  him full member rights — voting, information, per-capita defaults. Never do that.*
- **§2.5 — Handicapping compliance.** Own work; disclaimers + responsible gambling; no
  "locks"; accurate records; no sportsbook/affiliate promotion without approval; disclose
  all sportsbook/picks-service relationships.
- **§2.6 — During-term conflicts only.** No selling picks elsewhere or fronting a competing
  brand during the Term; nothing post-term. Rep that signing breaches no prior agreement.
- **§7 — Likeness license.** During-term; post-term the Company keeps using everything made
  during the term including paid ads. Fallback if he pushes back: 12-month cap on paid use.
- **§13.4 — 60-day tail** on deals contracted before termination.
- **Classification-posture clauses (added rev. 2):** §10.2 states outright that the
  Contractor controls manner/means/hours/location and the Company does not set a schedule
  beyond the agreed time-bound deliverables; §2.7 lets him hire his own assistants for
  editing/research (right-to-hire-helpers is an IC factor) with no account access; §10.3
  lets him perform through his own LLC while staying personally bound on the key
  covenants. §2.1(e) reframed Discord as "active presence as a Brand ambassador."
- §§8, 9, 11, 12 mirror the operator template (assignment-first IP, account security with
  four-tier liquidated damages, confidentiality, indemnity + LoL with negligence carve-down).

> **OPEN ITEMS — must resolve before or at signing:**
> - **NSL Operating Agreement — does not exist yet; 120-day clock from signing.** Drafted
>   in-house (no outside counsel, by decision). Must contain: a non-voting Class B
>   profits-interest class, §5.4 forfeiture/repurchase mechanics, drag-along, transfer
>   restrictions, and treatment of the holder as a member from issuance. If NSL is
>   single-member, adding him makes it a partnership for tax (K-1s).
>   **Profits-interest structure (Rev. Proc. 93-27 / 2001-43); no 83(b), by decision** —
>   §5.8 has the parties treat him as holder from issuance, which is what the safe harbor
>   relies on in place of the election.
> - NSL confirmed **Delaware** (File No. 10727267); rev. 4 of the talent agreement fixes the recital and states 50,000 Class B Units of 10,000,000 authorized.
> - **Confirm Nick's title at NSL** — signature block says CEO for both entities.
> - **Worker classification.** Contractor is **Tennessee-based**, so TN law governs the
>   employment-status question regardless of the NY choice-of-law clause. TN applies the
>   **IRS 20-factor common-law test** (not ABC) and has **no state minimum wage** (federal
>   $7.25 applies) — materially better posture than NY/CA. Not W-2. No LLC required; §10.3
>   is permissive. The contract is as IC-postured as drafting allows; practice must match.
> - Exhibit A: only the **effective date** remains blank — fill at signing; the 30-day equity
>   issuance and 12-month vesting clocks both run from it.
> - The written offer listed different accounts (Nosebleed Golf TikTok, Baseball Bros IG) and
>   2 posts/day; contract follows the later instruction (Nosebleed Sports TikTok + IG, 3/day).

---

## 3A. Podcast, Handicapping & Content Services Agreement (Nosebleed Gambling podcast host)

Generator: `templates/nosebleed-podcast-talent-agreement.py` (14 pp). Built on the talent
agreement in §3 with the same two Company Parties, the same Nosebleed Opportunity mechanics,
the same IP, likeness, account, liquidated-damages, classification, confidentiality, indemnity
and termination architecture, and the same anti-sandbagging paragraph in the Tail Period.

| Term | Value |
|---|---|
| Role | Nosebleed Gambling podcast host and on-call handicapper. Monthly Deliverables: ≥2 podcast episodes/week on Company feeds and channels; join Company live streams on Discord/YouTube/TikTok/Instagram/X on reasonable notice; picks for the Premium Offering when requested; sponsored gambling streams only under an approved Brand Deal; daily Discord presence with 1-business-day response; brand in personal bios |
| Pay | **Pure 50/50 revenue share. No monthly fee, no equity, no minimum.** 50% of **Shared Revenue** = (a) Brand Deals the Contractor sourced, (b) **Podcast Revenue** (sponsorship, ads, host-reads, platform ad-share, paid subscriptions attributable to the podcast and podcast live streams he hosts), (c) Nosebleed Opportunities he referred and the Company contracted, **(d) Brand Deals he personally creates, appears in or delivers, however sourced** — so a Company-sold casino stream he hosts is in the 50/50. Premium Offering subscriptions not shared |
| Accounts and platforms | Stated **broadly on purpose** — stream locations change. Managed Accounts are the podcast's feeds, show listings, channels and social accounts on every platform plus anything the Company later designates, and the obligations follow the podcast wherever it is published. No handles are named. Live streams and sponsored streams cover any platform the Company designates |
| `SHARE_PERFORMED_DEALS` switch | Set **True** (the deal). `False` would drop limb (d) and share only sourced, referred and podcast revenue |
| Performance condition | No fee to reduce, so a Shortfall Notice lets the Company withhold the Podcast Revenue share pro rata to episodes missed, stop scheduling him, or terminate. Sourced-deal share untouched except for a deal he failed to perform |
| **§2.9 Sponsored gambling streams** | The clause that matters most in this role: only Operators approved in writing and lawfully offered where the stream targets; Company may refuse or withdraw any Operator; each platform's gambling policy; stop on Company or platform instruction; age/geo gating; responsible-gambling messaging; FTC-grade disclosure of sponsorship, bonuses, promo codes, affiliate links and play money; no "gambling makes money", no guarantees, no chasing losses, no minors; no Company funds wagered; disclose every dollar/credit an Operator provides; his own wagering and its tax are his; immediate suspension right that is not a shortfall. Matching indemnity limb |
| **§2.10 Guests** | Any person he invites onto a podcast, live stream, sponsored stream, or any Company event or Company-branded activity is a **direct extension of him**: he is liable to the Company for their acts, statements and content as if his own, and a Guest's conduct that would breach the conduct, handicapping, gambling, IP or confidentiality sections is his breach. Advance notice; a recorded-consent and likeness release from each Guest (Company form or equivalent, produced on request); Guest told the rules; 18+ and of gambling age for sponsored streams; Company may decline or remove any Guest or their content (not a shortfall); no credentials to Guests; no Guest is a Company contractor or agent; anything he promises a Guest is on him. Matching indemnity limb |
| Existing relationships | He has none. §2.6 states affirmatively that no paying sponsorship, endorsement, affiliate, ambassador, paid-promotion or paid-picks agreement is in effect, and nothing predating the Effective Date is covered |
| Everything else | As §3: at-will both ways, NY law, Nassau/NY courts, tiered LD keyed to the podcast channels and Nosebleed Gambling accounts, 60-day Tail Period incl. unreferred-opportunity payment, no invoice required |

> **OPEN:** contractor address/phone/email/state; Effective Date; confirm the payment method; agree
> the weekly podcast slot in writing so "substantially performs" in §5.1 has a benchmark.

---

## 4. Nosebleed Sports LLC — Limited Liability Company Agreement (Delaware)

Generators: `templates/nosebleed-sports-llc-operating-agreement.py` (LLC Agreement, 26 pp) and
`templates/nosebleed-sports-llc-organizational-consent.py` (consent, 8 pp). **Rev. 3 is a merge**
of the founders' prior "Version 2.0" pre-formation binder with the superseding deal terms —
the prior binder is the backbone (its article numbering, definitions, and every provision not
overridden), the superseding changes are layered in. Drafted in-house by decision. Member
names, percentages, JGN's ownership, and the EIN live in the private master record, not here.

**Entity facts (public record):** Delaware LLC, Certificate of Formation filed August 7, 2026,
File No. 10727267; registered agent ZenBusiness Inc., Dover DE; principal office Rockville
Centre NY. IRS assigned a Form 1065 obligation → multi-member partnership from formation.

**Capital structure:** 10,000,000 authorized Common Units. 9,050,000 issued (six voting Class A
founders + one non-voting Class B service provider at 50,000 units = 0.50% of authorized).
950,000 unissued: 450,000 **Brock Reserve** pre-approved for the talent agreement's milestone
ladder, 500,000 unallocated. Two former participants hold nothing, confirmed by consent.

| Element | Term |
|---|---|
| Governance | **Member-managed with officers** (the founders' prior-agreed structure; a manager-managed draft was tried and discarded). CEO = Nicholas Restivo with contract-signing authority and delegation, so every contract's signature block still reads "Chief Executive Officer". Officer removal by Majority. Fiduciary duties **kept** — no Delaware §18-1101(c) waiver |
| Class A | Voting founders' units; 50% vested at Effective Date, 50% monthly over 48 months, no cliff, Officer Service condition; **option-based repurchase** of unvested units at Original Cost within 90 days of actual knowledge, no automatic cancellation — and Original Cost is $0 for service-issued units, so it operates as forfeiture; full acceleration on Change of Control and death/Permanent Disability; Good/Bad Leaver definitions |
| Class B | Non-voting; vests/forfeits solely per the holder's Service Agreement |
| Tax structure | **All service-issued units are profits interests** (Rev. Proc. 93-27/2001-43), Threshold Value = aggregate Capital Accounts at issuance ($0 today). *Replaces the prior binder's cash-purchase / per-unit-FMV / 83(b) structure entirely; no valuation memo, no election, no wire conditions* |
| Voting | Majority = >50% of outstanding Class A; Supermajority = ≥66⅔%. Class B and unissued units never vote |
| Reserved Matters (Supermajority) | Any unit/option/SAFE/pool issuance except the Brock Reserve; Change of Control and drag-along; amendments; new Class A member; dissolution; tax classification; debt/guarantees >$25K; related-party deals >$3K single or >$10K rolling 12 months (JGN licenses and JGN funding pre-approved by consent); bankruptcy |
| Controls | $3,000 spending/contract threshold outside approved budgets; five named banking signers; deadlock article (30-day negotiation → mediation → Chancery; no forced rewrite of ownership) |
| Brand / IP | JGN owns the **entire** NOSEBLEED SPORTS brand — word mark, goodwill, legacy socials, media assets, Apple Developer and Stripe accounts (Schedule D) **and the brand kit**, which is brand property because it was made for the brand as part of the officers' roles (no individual assignment, no chain of title — Master License §3.5 records the Company's confirmation). Company owns app/site/Discord/tech/product IP and assets assigned from JGN (Schedule C: repos, domains, Discord, Vercel/Supabase/Clerk/Whop/Resend/PostHog/Workspace) and holds the whole brand under an exclusive, perpetual, royalty-free Product-Field license. The three intercompany agreements are in §9 below. JGN's ~$5K of spending to date and its discretionary ongoing funding until the Company has cash flow are **JGN's own costs: nothing is owed back, not a loan, not capital, not equity** (§3.8 JGN Funding) |
| Covenants | Confidentiality; 12-month post-service non-solicit; **no general non-compete**; acquisition cooperation; combined-sale allocation protection because JGN and NSL have different owners |
| Law / forum | Delaware law; Chancery for fiduciary/equitable/books-and-records; negotiation → mediation first |
| Schedules | A Members & Capitalization · B Officers · C Assigned Assets · D JGN Retained Assets · E JGN Ownership Context · F Class A Vesting Ledger · G Form of Joinder |

> **DECISIONS RESOLVED 2026-09-17:** (1) Brand ownership — **JGN owns the whole brand** (word
> mark and the new brand kit); the Company is the exclusive perpetual licensee in the Product
> Field. Recommended and adopted because acquirers want one brand owner, the goodwill already
> sits with JGN's audience (moving the word mark alone risks an assignment in gross), and the
> Company's CoC-surviving license gives a buyer everything the product needs. The split-brand
> fallback (Company keeps the kit, licenses it to JGN) is preserved behind the switch. (2) JGN's
> members consent — the JGN Written Consent (§9) is drafted for all five members to sign.
> (3) **Simplified same day at the owner's instruction:** no founder signs anything over. The
> designer-founder's PIIA is the generic form; the separate Brand Asset Assignment was deleted.
>
> **OPEN:** Effective Date on both documents; five founders' notice emails; NY foreign qualification + publication (consent directs it);
> nosebleedsport.com registrar; Delaware annual tax; Brock signs the
> Schedule G joinder at issuance.

---

## 9. JGN ↔ Nosebleed Sports LLC intercompany package

Generators in `templates/` (all import `templates/nbs_style.py`, which holds the
`BRAND_KIT_OWNER` switch, the canonical agreement titles, and the single Product Field /
Media Field definition strings so no document can drift from another). Run with
`BRAND_KIT_OWNER=JGN` (default) or `=NSL`. The LLC Agreement and organizational consent
read the same switch. Supersedes prior-binder docs 17–20.

| Document | Generator | pp | What it does |
|---|---|---|---|
| Master Brand and Trademark License (JGN → NSL) | `jgn-nsl-master-brand-trademark-license.py` | 8 | Exclusive (even as to JGN), royalty-free, fully paid-up, worldwide, **perpetual** license to the whole brand in the **Product Field** (app, web, Discord, picks/subscriptions, in-product commerce). JGN keeps the **Media Field** (socials, publishing, sponsorships, advertising). Sublicensable to NSL's contractors (Brock named). Quality control bounded: existing uses deemed approved, samples ≤ quarterly, 30 days' notice of new standards, no standard may materially impair the product. JGN's **only** termination right is uncured breach of brand standards after 60-day cure, suspended while disputed. **Survives a bona fide Change of Control of NSL automatically for the successor at no royalty.** JGN covenants: no third-party Product-Field license, **file and maintain a USPTO application in JGN's name**, no abandonment, mark assignable only to someone who assumes the license. NSL step-in enforcement after 60 days. Combined-sale cooperation + OA §11.4 allocation protection. NY law, Nassau County |
| Logo and Visual Identity License (NSL → JGN) — NSL mode only | `nsl-jgn-logo-visual-identity-license.py` | 4 | Fallback only: NSL keeps the kit, licenses it nonexclusively to JGN for the Media Field. In JGN mode this generator emits nothing — the brand kit is JGN brand property under Master License §3.5 and no separate document exists |
| Marketing and Audience License (JGN → NSL) | `jgn-nsl-marketing-audience-license.py` | 4 | Nonexclusive distribution of NSL content through JGN's socials; no minimums, no account transfer, JGN may promote competitors; 30-day convenience termination; **does not survive an NSL sale** (buyer must buy JGN or renegotiate); its termination never touches the Master Brand License |
| Transition Services Agreement | `jgn-nsl-transition-services-agreement.py` | 5 | NSL uses JGN's Apple Developer / Stripe until its own accounts are live. **No fee**, documented third-party costs only; biweekly remittance of NSL revenue JGN receives, no set-off of any kind; 60-day migration target, 12-month outside date; JGN not merchant of record beyond what a platform requires |
| Company Account and Infrastructure Schedule | `nsl-account-infrastructure-schedule.py` | 4 | Control Standard stated once; every account tabulated with owner-of-record and target owner; open items collected in §9 |
| JGN Media LLC Written Consent | `jgn-media-llc-written-consent.py` | 5 | All five JGN members (80% threshold; overlap with NSL disclosed). Approves the Schedule C assignment for no cash and no NSL equity, confirms Schedule D, accepts the brand-kit confirmation, approves all three agreements, the Brock talent agreement (JGN co-party; no JGN equity to Brock), directs the USPTO filing, records JGN's ~$5K spend and ongoing funding as JGN's own cost with nothing owed back, authorizes the CEO to sign both sides with that disclosed, fixes the signing order |

**Signing order** (`templates/nosebleed-signature-packet.py`, 4 pp, replaces prior binder doc 62):
JGN Written Consent → NSL LLC Agreement → organizational consent → six PIIAs → Master Brand
License → Marketing License → TSA → ledgers confirmed (profits interests: no payment, no valuation)
→ Brock's agreement + joinder → platform transfers → NY qualification. One Effective Date on
every document. The packet carries the founder and Company/JGN signature matrices and an optional
blank spousal consent.

### Founder PIIAs

Generator `templates/nosebleed-founder-piia.py` (imports `nbs_style.py`; `FOUNDER=<key>` builds
one, no arg builds all six; 7 pp each). Built on the founders' prior pre-formation form with every
section kept and the summary boilerplate written out in full. Consideration = Class A admission,
units and office under the LLC Agreement; present assignment of post-formation work product in the
four prior categories plus a confirmatory pre-formation assignment that never undercuts JGN's
ownership; moral-rights waiver running to successors, assigns and licensees; narrow ministerial
IP-perfection appointment (no general power); data-security and account return; open-source and
AI-assisted-development terms; **12-month non-solicit, no general non-compete**; whistleblower
protection with the DTSA §1833(b) notice as Exhibit 1; state invention-assignment carve-outs as
Exhibit 2 (generic — founders' home states not asserted); Delaware law matching the LLC Agreement.

- **CEO's PIIA:** resolves the prior open chain-of-title item on a pre-formation model runner
  (assigned to the extent incorporated into or necessary for any Nosebleed product; unrelated
  portions retained on Schedule A with a perpetual royalty-free license back). Counter-signed for
  the Company by the CTO, since the CEO cannot sign both sides.
- Other five (including the designer-founder): the same generic form, with one tailored
  sentence each for their area; Schedule A none. **Nobody signs anything over individually** —
  the generic work-product clause every founder signs already covers brand assets and graphics
  made in the role.

**Open on this package:** USPTO classes/basis/specimens/fees unsettled; Effective Date
blank everywhere; the designer-founder holds 20% of NSL and 0% of JGN while the brand he
designed for sits in JGN — the owner confirms this is mutually understood by all partners and
reflected in his NSL percentage.

---

## 5. Mutual Termination and Release

Used when a signed operator exits. Two pages. Generator was built ad hoc — rebuild
from the @CasualWisconsin precedent. Structure:

1. Terminates by mutual consent, waiving the §11.2 14-day notice.
2. Final pay: 50% share of revenue received for periods through termination, on the
   normal schedule; acknowledges nothing else is owed.
3. Operator certifies they stopped using the account, changed no credentials or
   settings, and returned/deleted all Company property per §7.6.
4. 30-day incidental transition cooperation.
5. Survival: ownership, confidentiality, liquidated damages, indemnity.
6. Mutual release, carved out for the final payment and the surviving provisions.
   States the exit is amicable with no admission of wrongdoing — which is what makes
   it easy for the departing operator to sign.

**Sequence: change the account password FIRST, then send for signature.**

---

## 6. Per-operator signing checklist

1. Fill Exhibit A completely — effective date, legal name, mailing address, phone,
   email, handle, school, posting minimum, payment method.
2. Leave the liquidated-damages line **blank** unless overriding — blank means the
   §7.5 tiers apply, which is the defensible outcome for a new account.
3. Signatures in **both** blocks — the main one and the Exhibit A block.
4. Countersign as CEO.
5. Collect a **W-9** before the first payout (§6.5).
6. Deliver credentials **only after** full execution.
7. On a handoff, change the password between outgoing and incoming operators.

---

## 7. Risks no contract can solve

Operational, not contractual. These sit with JGN regardless of what operators sign,
because JGN owns the accounts the letters get sent to.

| Risk | Operational fix |
|---|---|
| Broadcaster / game-footage copyright | **Written content-use policy + approved-media-source list — referenced by §3.6 but NOT YET WRITTEN** |
| DMCA takedowns, repeat-infringer strikes | Takedown/escalation procedure |
| University & Big Ten trademark exposure in account names | Trademark attorney review before scaling further |
| Athlete publicity / NIL | Sponsor approval workflow; care with athlete-focused commercial content |
| FTC disclosure | Make #ad requirements part of the content policy |
| Worker reclassification | Keep practice deliverable-based, not schedule-directed. Weekly (not daily) minimums exist for this reason. **California operators** (@CasualUCLA, @CasualUSC) sit under the strict ABC test regardless of the NY choice-of-law clause |
| Credential compromise | Password manager with per-operator revocable access |
| Media / E&O insurance | Worth carrying once revenue justifies it |

---

## 8. Drafting history

Built and hardened across several audit rounds, including adversarial review:

1. Initial Nosebleed Sports agreement for the four-account content deal.
2. Entity rename to JGN Media LLC; symmetric pro-rata convenience termination;
   fault-based terminations separated from no-fault.
3. Casual Big Ten operator template created — 100% brand ownership, revenue share,
   liquidated damages.
4. Enterprise hardening: content-liability indemnity, sports-clip clause, limitation
   of liability, tiered liquidated damages, weekly posting minimum, assignment-first
   IP, narrowed transition assistance.
5. **Delaware → New York** conversion after confirming JGN is a NY company. Delaware
   had no reasonable relationship to the parties and the forum was the most
   oppressive-looking term in the document.
6. NY Freelance Isn't Free Act (GOL Art. 44-A) compliance: company mailing address in
   the recital, express "no invoice required" statement, payment timing inside the
   30-day rule.
7. Multi-account allocation + chargeback allocation made binding absent manifest error,
   with an operator never bearing more than their allocated share of a reversal.
8. Four-tier liquidated damages after operator pushback.

**Standing caveat:** these are strong drafts, not legal advice. A licensed attorney
should review before scaling further — particularly on the trademark and clip-licensing
exposure, which drafting cannot fix.
9. Talent/handicapper agreement for the Nosebleed Sports face-of-brand seat: monthly fee
   conditioned on deliverables, 50% brand-deal share, milestone equity ladder, at-will
   termination, quarterly review.
10. Rev. 2 of the talent agreement: Nosebleed Sports LLC added as co-party and equity issuer;
    0.5% up-front grant with vesting/forfeiture; ladder rebuilt to the same 5% cap; explicit
    control-of-work, assistants, and perform-through-entity clauses for classification posture.
11. Operating Agreement of Nosebleed Sports LLC drafted from scratch (none existed) with a
    Class A / Class B profits-interest structure matching the talent agreement's §5.
12. NSL confirmed Delaware from the filing evidence; OA rebuilt as a Delaware LLC Agreement with the
    real cap table (six Class A founders, Brock Class B, 950,000 reserved), founder vesting, officers,
    Reserved Matters; organizational consent drafted; talent agreement rev. 4.
13. Prior v2.0 binder surfaced (index, formation form, LLC Agreement, consent, ledger). Opus agent merged
    it with the superseding terms: member-managed restored, fiduciary duties kept, option-based repurchase,
    deadlock, non-solicit, JGN separation article, Schedules A–G; profits-interest structure retained.
    Reconciliation memo written. Talent agreement unaffected.
14. Brand-ownership decision made (JGN owns the whole brand; NSL exclusive perpetual licensee) and
    JGN member consent given. Opus agent drafted the intercompany package (§9): Master Brand License,
    Brand Asset Assignment (Logo License fallback), Marketing License, TSA, Infrastructure Schedule,
    JGN Written Consent; OA/consent updated behind the `BRAND_KIT_OWNER` switch; 16 builds verified.
15. JGN confirmed New York; JGN's ~$5,000 spend and discretionary ongoing funding written in; designer-founder's signature dropped from the Assignment. Six founder PIIAs
    drafted from the prior binder form (Opus agent), 12 builds verified.
16. Owner's instruction: no founder signs anything over; the brand kit is brand property by role.
    Brand Asset Assignment deleted, designer-founder's PIIA returned to the generic form, chain-of-
    title recitals removed from every document, Master License §3.5 added. Signature packet drafted
    (replaces prior binder doc 62). All verifiers pass in both modes.
17. Talent agreement §5.6 aligned with the adopted LLC Agreement (Class B units and the milestone
    reserve exist; 120-day adoption window kept only as a backstop; joinder = the LLC Agreement's form).
25. Podcast agreement final pass before issue: numbering, 29 cross-references, 30 defined terms,
    drafting-defect scan and all 14 pages read. Widow lines disabled on body text; the indemnity
    added to the obligations that stay personal if the contractor performs through an entity.
24. Guest clause added to the podcast agreement at the owner's request; indemnity and the
    personal-bind list extended to match. Contractor is New York City based: the agreement's
    written-contract, itemized-services and 30-day payment terms satisfy the city and state
    Freelance Isn't Free Acts.
23. Podcast agreement finalized: Company-sourced deals he performs are shared (limb (d)); accounts
    and platforms stated broadly so stream locations can change; no existing paying deals, so the
    disclosure row is gone and the representation is affirmative. Both talent agreements gained a
    signpost where confidential information is used before its definition.
22. Podcast host agreement drafted from the talent agreement backbone (Opus agent): pure revenue
    share, no fee, no equity, Podcast Revenue limb, gambling-stream compliance section, fairness
    switch for Company-sourced deals he performs. Verified, visually checked, template scrubbed.
21. Anti-sandbagging paragraph added to the talent agreement's tail period, drafted as a payment
    obligation with the burden on the company and no post-term restriction. Visual checker gained a
    split-signature-block test, which then caught the same defect in two founder agreements.
20. Talent agreement final audit before issue: numbering, cross-references, defined terms and all
    14 pages checked. Three terms signposted at first use. One open edge case left undrafted by
    choice (an opportunity arising in-term but contracted after termination is not captured).
19. Talent agreement brand-deal scope narrowed to what the brand actually generates: "Nosebleed
    Opportunity" defined with four objective tests, a 10-business-day Company election and a clean
    walk-away for him; express statement that nothing else about his personal life is restricted and
    that nothing predating the Effective Date is covered. Deliberately non-predatory.
18. **Owner correction:** the prior binder's "JGN Advances repayable when cash is available" was never
    the deal. Replaced everywhere with "JGN Funding": JGN's own cost, nothing owed back, not a loan,
    not capital, not equity (OA §3.8, org consent §14, JGN consent §10, TSA §5.4).
