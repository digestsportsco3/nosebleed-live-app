#!/usr/bin/env python3
"""Refuse to let operator PII exist in this PUBLIC repository.

Runs over everything git actually tracks -- not over one script's output. The leak this
exists to prevent got in because the scrub script checked the files it WROTE, while the
scrub script itself, carrying every real name, sat committed beside them. A gate that
only inspects its own output cannot catch that. This one asks git what is in the repo.

Deliberately contains NO real names: it matches PII by SHAPE (phone, street address, EIN,
personal email) and refuses private working tools by FILENAME. A private name list can be
supplied out-of-band via NOSEBLEED_NAME_FILE, one name per line; it is never committed.

Usage:  python3 contracts/templates/check_repo_clean.py
        python3 contracts/templates/check_repo_clean.py --install-hook
Exit 0 = clean, 1 = something must not be committed.
"""
import os
import re
import subprocess
import sys

ROOT = subprocess.run(["git", "rev-parse", "--show-toplevel"],
                      capture_output=True, text=True).stdout.strip()

# Files that must never be tracked here: they must reference real names and per-operator
# scripts to do their job, so they live beside the generators, outside this repo.
FORBIDDEN_NAMES = re.compile(r"^(scrub_templates|build_all|make_.*|verify_.*)\.py$")

# JGN's own business details are fine to commit; they appear on every executed contract.
ALLOWED = [
    re.compile(r"Rockville Centre", re.I),
    re.compile(r"Dover,\s*Delaware", re.I),
    re.compile(r"nosebleedsportsmedia\.com", re.I),
]

PII = [
    ("phone number", re.compile(r"\(?\b\d{3}\)?[-.\s]\d{3}[-.\s]\d{4}\b")),
    ("street address", re.compile(
        r"\b\d{1,5}\s+(?:[NSEW]\.?\s+)?[A-Z0-9][A-Za-z0-9.]*\s+"
        r"(?:Street|St\.?|Road|Rd\.?|Drive|Dr\.?|Court|Ct\.?|Lane|Ln\.?|Terrace|Ave\.?|"
        r"Avenue|Place|Pointe|Trail|Cir\.?|Circle|Way|Blvd\.?)\b")),
    ("apartment line", re.compile(r"\bApt\.? ?\d+")),
    ("EIN", re.compile(r"\b\d{2}-\d{7}\b")),
    ("personal email", re.compile(
        r"[A-Za-z0-9._%+-]+@(?:gmail|yahoo|protonmail|me|outlook|hotmail|icloud|aol)\.com", re.I)),
]

SKIP_SUFFIX = (".png", ".jpg", ".jpeg", ".gif", ".pdf", ".zip", ".ico", ".woff", ".woff2")


def private_names():
    """Optional out-of-band name list. Never stored in this repo."""
    path = os.environ.get("NOSEBLEED_NAME_FILE")
    if not path or not os.path.exists(path):
        return []
    out = []
    for line in open(path):
        line = line.strip()
        if line and not line.startswith("#"):
            out.append(line)
    return out


def main():
    if "--install-hook" in sys.argv:
        hook = os.path.join(ROOT, ".git", "hooks", "pre-commit")
        with open(hook, "w") as f:
            f.write("#!/bin/sh\nexec python3 contracts/templates/check_repo_clean.py\n")
        os.chmod(hook, 0o755)
        print("installed pre-commit hook ->", hook)
        return 0

    tracked = subprocess.run(["git", "ls-files", "-z"], cwd=ROOT,
                             capture_output=True, text=True).stdout.split("\0")
    names = private_names()
    problems = []

    for rel in tracked:
        if not rel:
            continue
        base = os.path.basename(rel)
        if FORBIDDEN_NAMES.match(base):
            problems.append((rel, 0, "private working tool is tracked", base))
            continue
        if rel.lower().endswith(SKIP_SUFFIX):
            continue
        full = os.path.join(ROOT, rel)
        try:
            text = open(full, encoding="utf-8", errors="ignore").read()
        except OSError:
            continue
        for i, line in enumerate(text.splitlines(), 1):
            if any(a.search(line) for a in ALLOWED):
                continue
            for label, pat in PII:
                m = pat.search(line)
                if m:
                    problems.append((rel, i, label, m.group(0)))
            for n in names:
                if n and n in line:
                    problems.append((rel, i, "private individual's name", "<redacted>"))

    if problems:
        print("REFUSING: operator PII or private tooling is tracked in this PUBLIC repo\n")
        for rel, line, label, hit in problems:
            where = "%s:%d" % (rel, line) if line else rel
            print("  %-52s %-28s %s" % (where, label, hit))
        print("\n%d problem(s). Remove them before committing; this repo is public." % len(problems))
        return 1

    print("repo clean: %d tracked files, no PII, no private tooling"
          % len([r for r in tracked if r]))
    if not names:
        print("note: set NOSEBLEED_NAME_FILE to also check real names against a private list")
    return 0


if __name__ == "__main__":
    sys.exit(main())
