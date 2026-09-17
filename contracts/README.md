# JGN Media LLC — Contract Records

Master log for JGN Media LLC contracting. Keyed by X handle, **no operator PII**
(see `../CLAUDE.md` — this repo is public). Last updated 2026-09-17.

- **Company:** JGN Media LLC, a New York limited liability company
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

Originally **Robert Gispert** individually (Aug 10, 2026), now **Amended and Restated**
with **Click Culture LLC** as Contractor, Rob signing as Authorized Signatory.

| Term | Value |
|---|---|
| Accounts | @NosebleedNFL, @NosebleedHQ, @Nosebleedhoops, @golfnbs |
| Deliverable | Minimum 5 posts/day on each (20/day total) |
| Fee | $500/account/month = $2,000/month flat (not revenue share) |
| Term | Aug 10 – **Dec 31, 2026** |
| Payments | $2,000 on the 10th, Aug–Dec = **$10,000 total**. The Dec 10 payment covers through Dec 31 |
| Restatement date | September 2, 2026 |

**Structure notes:** the restatement supersedes the original agreement, Click Culture
assumes the prior obligations, and prior services/payments are credited. Rob was
**not** released from the original agreement — deliberate. A key-person clause
requires the Services be performed **personally by Robert Gispert**, with no
assignment, subcontracting, or delegation — added because once the counterparty is an
LLC, nothing otherwise stops a stranger being put on the accounts.

> **OPEN ITEM:** this agreement still carries **Delaware** law and venue, inherited
> from the original draft. JGN is a New York company with no Delaware nexus. The
> Casual Big Ten agreements were converted to New York for exactly this reason;
> this one should be too.

---

## 3. Talent, Handicapping & Content Services Agreement (Brock Smith)

Generator: `templates/nosebleed-talent-handicapper-agreement.py`. Built for the on-camera
talent + handicapper seat; reusable for similar roles.

### Entity structure (important)

Two entities, both parties to the agreement, together "the Company":

- **JGN Media LLC** — owns the Nosebleed Sports **brand and social media accounts**.
- **Nosebleed Sports LLC ("NSL")** — owns the **app, website, Discord, and premium picks
  offering** (the "Platform"). **All equity is in NSL.** Nothing grants any interest in JGN.

Work Product is assigned to whichever entity the Company designates; absent designation,
brand/social content → JGN, picks/Platform content → NSL. Payment obligations are
obligations of both; either may give notice for the Company. Nick signs for both.

### Business deal (verbally agreed; supersedes the four written "paths")

| Term | Value |
|---|---|
| Monthly Fee | **00/month, paid in arrears** within 10 days of month end, conditioned on performance (§6) |
| Brand deal share | **50%** of deals the Contractor **sourced** OR that **directly involve his work** (he creates, appears in, or delivers). Company-sourced deals he doesn't perform: 0% |
| Premium picks subs | **No revenue share** — counts only toward equity milestones (deliberate; the written paths all had one) |
| **Initial Units** | **0.50% of NSL issued up front**, non-voting, **forfeitable until vested** (§5.1, §5.4) |
| Milestone Units | Ladder rebuilt so the up-front 0.5% is an advance on the first tranche: **+0.5% at 5K → 1.0%; +1.5% at 0K → 2.5%; +1.25% at 10K → 3.75%; +1.25% at 75K → 5.0%.** Same 5% cap as the original offer |
| Qualifying Revenue | Any revenue he directly generated: brand deals, events he drove, premium subs attributed via tracking link/code, other documented attribution. Counted gross, once |
| Duties (Monthly Deliverables) | Nosebleed Sports TikTok + Instagram at 3 posts/day **each**; daily picks + write-ups; 30-min live before every NFL Sunday 1pm slate; lives for major events; ad hooks + on-camera in ads; weekly sync; daily Discord presence; 1-business-day response on team strategy |
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
  Non-voting, dilutable, may be profits interests. Initial Units due within 30 days of the
  Effective Date, so **the OA work is now a signing-time item, not a someday item.**
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
> - **NSL Operating Agreement.** Issuing the 0.5% at signing requires: a non-voting (or
>   profits-interest) class; forfeiture/repurchase mechanics matching §5.4; drag-along;
>   transfer restrictions. If NSL is single-member, adding him makes it a partnership for
>   tax (K-1s). **Structure as a profits interest** so the up-front grant isn't taxable
>   income to him at issuance; he should file an **83(b) within 30 days**. Attorney + CPA.
> - **Confirm NSL's state of organization and address** — drafted as New York, 105 Broadway.
> - **Confirm Nick's title at NSL** — signature block says CEO for both entities.
> - **Worker classification** remains the biggest exposure — see the classification note in
>   the drafting history. The contract is now as IC-postured as drafting allows; practice
>   must match.
> - Exhibit A blanks: address/phone/email, effective date, both account handles.
> - The written offer listed different accounts (Nosebleed Golf TikTok, Baseball Bros IG) and
>   2 posts/day; contract follows the later instruction (Nosebleed Sports TikTok + IG, 3/day).

---

## 4. Mutual Termination and Release

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

## 5. Per-operator signing checklist

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

## 6. Risks no contract can solve

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

## 7. Drafting history

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
