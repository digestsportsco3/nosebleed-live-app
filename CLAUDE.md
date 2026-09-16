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

`contracts/README.md` is keyed by **X handle only**, deliberately. Full contact
records are kept privately by Nicholas Restivo outside this repository.
`.gitignore` blocks `contracts/private/` — do not override it.

JGN Media LLC's own business details (company name, business address, CEO name) are
fine to commit; they appear on every executed contract.

## Session continuity

This file loads automatically at the start of every Claude Code session in this repo,
which is how contract context survives session boundaries. When a contract session
produces new decisions — a clause change, a new operator, a termination, a governing-law
switch — **update `contracts/README.md` and commit before the session ends**, or the
knowledge is lost when the container is reclaimed.
