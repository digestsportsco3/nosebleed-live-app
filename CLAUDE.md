# CLAUDE.md — nosebleed-live-app

## The app
Nosebleed Live: sports scores, odds, picks, and news MVP (JavaScript). See `README.md`.

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
for leftover placeholders, runs the visual QA and only then zips. If it fails, nothing is sent. Table cells
must always be Paragraphs (never bare strings) so long values wrap instead of overflowing, and
signature lines must be sized to their column. A test-run of a public template must never write
into the working directory: generator output paths are relative to the generator's own folder.

## Session continuity

This file loads automatically at the start of every Claude Code session in this repo,
which is how contract context survives session boundaries. When a contract session
produces new decisions — a clause change, a new operator, a termination, a governing-law
switch — **update `contracts/README.md` and commit before the session ends**, or the
knowledge is lost when the container is reclaimed.
