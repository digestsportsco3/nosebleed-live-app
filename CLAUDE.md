# nosebleed-live-app — rules for every Claude session

## The app
Nosebleed Live: sports scores, odds, picks, and news MVP (JavaScript). See `README.md`.

## Nothing stays on one computer

A commit that is not pushed does not exist to the next session. Sessions get
archived, computers go to sleep, and the next session (local or cloud) only
sees what is on GitHub.

- After EVERY commit, push it: `git push -u origin <current-branch>`.
  Never end a turn with unpushed commits. If the push fails, say so in the
  reply and retry before doing anything else.
- Before a session closes, restarts, or switches mode (for example restarting
  with `claude --chrome`), write the handoff (below) and push it. Do this
  without being asked.

## Stat Desk handoff

The stats pipeline lives in `statdesk/`. Its running handoff is
`statdesk/HANDOFF.md`. Every Stat Desk session:

1. Reads `statdesk/HANDOFF.md` first, then `statdesk/STATDESK.md`.
2. Before ending, updates the "Current state" section of `statdesk/HANDOFF.md`
   (what was verified, what is still open, last commit, anything broken),
   then runs `./statdesk/handoff.sh` (Mac/Linux) or `statdesk\handoff.cmd`
   (Windows), which commits and pushes everything.
3. Reports the pushed commit hash in the final reply, so the user can confirm
   it reached GitHub.

## Contracts work — read this before any contract task

JGN Media LLC contract records live in **`contracts/`**. Start with
**`contracts/README.md`**: it carries the full drafting history, the rationale behind
every negotiated clause, the current operator roster, and the signing checklist for
the Casual Big Ten network and the Nosebleed Sports content agreements.

Reusable generators are in `contracts/templates/`. They produce the PDFs with
ReportLab (`pip install reportlab pypdf` if missing).

### HARD RULE — THIS REPOSITORY IS PUBLIC

Never commit operator personally identifiable information to this repo:

- home addresses
- phone numbers
- personal email addresses
- signed or filled contract PDFs
- per-operator generator scripts (they contain the above)
- the names of operators, contractors, founders and former participants: the public
  copies use placeholders, and `contracts/README.md` describes people by role or X
  handle. Only JGN's own CEO name is committed, because it appears on every executed
  contract. `scrub_templates.py` enforces this and fails the copy if a real name
  survives.

**The private working tools are never committed.** `scrub_templates.py`, `build_all.py`,
the `make_*.py` generators and the `verify_*.py` checkers all have to reference real
names and per-operator scripts to do their job, so they live beside the generators in
the working session, outside this repository. `.gitignore` blocks them. Only the
scrubbed `nosebleed-*.py` / `jgn-*.py` templates and the generic `qa_pdf.py` belong
here. This rule exists because all four were committed once, which put ten real names,
the EIN and a personal email address into a public repo.

**`contracts/templates/check_repo_clean.py` is the backstop.** It scans everything
`git ls-files` reports — not one script's output — and refuses PII by shape (phone,
street address, apartment line, EIN, personal email) and private tooling by filename.
Install it as a pre-commit hook with `--install-hook`; it is already installed in this
working copy. It carries no real names itself, so it is safe to commit.

`contracts/README.md` is keyed by **X handle only**, deliberately. Full contact
records are kept privately by Nicholas Restivo outside this repository.
`.gitignore` blocks `contracts/private/` — do not override it.

JGN Media LLC's own business details (company name, business address, CEO name) are
fine to commit; they appear on every executed contract.

### HARD RULE — VISUAL QA BEFORE ANY PDF IS DELIVERED

Every generated PDF must pass `contracts/templates/qa_pdf.py` (text outside the margins,
overlapping text, wrapped signature lines, clipped words, near-empty pages) AND the
signature pages, exhibits and every table must be rendered to PNG and looked at before the
file is sent. In the working session the single entry point is `build_all.py` (kept beside the
generators, outside this repo): it runs the content verifiers, rebuilds the default set, checks
for leftover placeholders, runs the visual QA and only then zips. If it fails, nothing is sent.
Table cells must always be Paragraphs (never bare strings) so long values wrap instead of
overflowing, and signature lines must be sized to their column. A test-run of a public template
must never write into the working directory: generator output paths are relative to the
generator's own folder.

### HARD RULE — NEVER CALL A CONTRACT SIGN-READY ON YOUR OWN JUDGMENT

Four rounds of independent adversarial review on one agreement found 27, 19, 31 and 19
defects. **Every round found blockers introduced by the previous round's fixes**, including
one that destroyed the company's own liability cap. Self-review caught none of them.

- Before any agreement is sent, an independent reviewer with no stake in the outcome reads
  it and reports. Give the reviewer the pre-extracted plain text, not the PDF — a reviewer
  told to parse the PDF itself burns its context re-extracting and dies without reporting.
- Verify every finding against the actual built text before acting on it. Reviewers are
  sometimes wrong; a fix applied to a hallucinated defect is a new defect.
- Every fix gets a `verify_*.py` assertion, including a **negative** assertion that fails if
  the old language ever returns. That is what makes a round of review permanent.
- Scope negative assertions precisely. A ban on "greater of" written for the company's cap
  will fire on the contractor's cap, where it is correct.

## Session continuity

This file loads automatically at the start of every Claude Code session in this repo,
which is how contract context survives session boundaries. When a contract session
produces new decisions — a clause change, a new operator, a termination, a governing-law
switch — **update `contracts/README.md` and commit before the session ends**, or the
knowledge is lost when the container is reclaimed.
