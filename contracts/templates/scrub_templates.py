#!/usr/bin/env python3
"""Copy the scratchpad generators into the PUBLIC repo as placeholder templates.

Run from the scratchpad directory. Structural regexes run first, then the name map, then a
syntax check. Never commit the scratchpad originals: they carry names, the EIN and JGN ownership.
"""
import os
import re
import sys

T = "/home/user/nosebleed-live-app/contracts/templates"
NAME_MAP = [
    ("Christian Clark", "[Founder B]"), ("Michael Del Bene", "[Founder C]"),
    ("Stephen Bickel", "[Founder D]"), ("Gabriel DiDario", "[Founder E]"),
    ("Jacob Glover", "[Founder F]"), ("Brock Smith", "[Class B Member]"), ("Anthony Alberto", "[Contractor]"),
    ("Jacob Skonieczny", "[former participant 1]"), ("Louis Stathis", "[former participant 2]"),
    ("Robert Gispert", "[content contractor]"),
    ("Brock1335@yahoo.com", "______________________"),
    ("nick@nosebleedsportsmedia.com", "______________________"),
    ("42-4477699", "__-_______"),
    # split-line fragments
    ('under Christian "\n              "Clark\'s PIIA', 'under "\n              "[Founder B]\'s PIIA'),
]
HDR = ("# TEMPLATE — public repository copy. Names, EIN and JGN ownership are placeholders; fill from the\n"
       "# private master record before generating a signing copy. Never commit a filled copy.\n")

JOBS = [
    ("nbs_style.py", "nbs_style.py", [
        (r'JGN_MEMBERS      = \[.*?\]',
         'JGN_MEMBERS      = ["Nicholas Restivo", "[JGN member]", "[JGN member]", "[JGN member]", "[JGN member]"]  # fill from the private record'),
        (r'JGN_MEMBER_PCT   = "20%"', 'JGN_MEMBER_PCT   = "__%"'),
        (r'CTO_NAME         = "Christian Clark"', 'CTO_NAME         = "[Founder B]"'),
    ]),
    ("make_jgn_master_brand_license.py", "jgn-nsl-master-brand-trademark-license.py", []),
    ("make_jgn_brand_asset_assignment.py", "nsl-jgn-logo-visual-identity-license.py", []),  # NSL-mode fallback only
    ("make_jgn_marketing_audience_license.py", "jgn-nsl-marketing-audience-license.py", []),
    ("make_jgn_transition_services.py", "jgn-nsl-transition-services-agreement.py", []),
    ("make_nsl_account_infra_schedule.py", "nsl-account-infrastructure-schedule.py", []),
    ("make_jgn_written_consent.py", "jgn-media-llc-written-consent.py", []),
    ("make_nsl_operating_agreement.py", "nosebleed-sports-llc-operating-agreement.py", [
        (r'JGN_OWNERSHIP = \[.*?\]',
         'JGN_OWNERSHIP = [("Nicholas Restivo", "__%"), ("[JGN member]", "__%"), ("[JGN member]", "__%"), ("[JGN member]", "__%"), ("[JGN member]", "__%")]  # fill from the private record'),
    ]),
    ("make_nsl_org_consent.py", "nosebleed-sports-llc-organizational-consent.py", []),
    ("make_founder_piia.py", "nosebleed-founder-piia.py", []),
    ("make_signature_packet.py", "nosebleed-signature-packet.py", []),
    ("make_anthony_alberto.py", "nosebleed-podcast-talent-agreement.py", [
        (r'CONTRACTOR_NAME        = "Anthony Alberto"', 'CONTRACTOR_NAME        = ""'),
        (r'CONTRACTOR_ADDRESS     = "[^"]*"', 'CONTRACTOR_ADDRESS     = ""'),
        (r'CONTRACTOR_PHONE       = "[^"]*"', 'CONTRACTOR_PHONE       = ""'),
        (r'CONTRACTOR_EMAIL       = "[^"]*"', 'CONTRACTOR_EMAIL       = ""'),
        (r'EFFECTIVE_DATE         = "[^"]*"', 'EFFECTIVE_DATE         = ""'),
        (r'"JGN_Media_Anthony_Alberto_Podcast_Talent_Agreement\.pdf"', '"Nosebleed_Podcast_Talent_Agreement.pdf"'),
    ]),
]
BANNED_PATTERNS = [
    ("phone number", r"\(?\b\d{3}\)?[-.\s]\d{3}[-.\s]\d{4}\b"),
    ("street address", r"\b\d{1,5}\s+(?:[NSEW]\.?\s+)?[A-Z0-9][A-Za-z0-9.]*\s+(?:Street|St\.?|Road|Rd\.?|Drive|Dr\.?|Court|Ct\.?|Lane|Ln\.?|Terrace|Ave\.?|Avenue|Place|Pointe|Trail|Cir\.?|Circle|Way|Blvd\.?)\b(?![^\n]*Rockville Centre)(?![^\n]*Dover, Delaware)"),
    ("EIN", r"\b\d{2}-\d{7}\b"),
    ("personal email", r"[A-Za-z0-9._%+-]+@(?:gmail|yahoo|protonmail|me|outlook|hotmail|icloud|aol)\.com"),
    ("apartment line", r"\bApt\.? ?\d+"),
]
BANNED = ["Christian", "Clark", "Del Bene", "DiDario", "Bickel", "Glover", "Brock Smith", "Alberto", "Skonieczny", "Stathis", "Gispert", "42-4477",
          "@yahoo", "@gmail", "Brock1335"]


def scrub(src, dst, pre):
    if not os.path.exists(src):
        print("skip (missing):", src)
        return
    s = open(src).read()
    for pat, rep in pre:
        assert re.search(pat, s, flags=re.S | re.M), (src, "pattern not found", pat)
        s = re.sub(pat, rep, s, count=1, flags=re.S | re.M)
    for a, b in NAME_MAP:
        s = s.replace(a, b)
    if s.startswith("#!"):
        i = s.index("\n") + 1
        s = s[:i] + HDR + s[i:]
    else:
        s = HDR + s
    compile(s, dst, "exec")
    for b in BANNED:
        assert b not in s, (dst, b)
    # structural PII checks: any phone number, street address, EIN or personal email survives -> refuse
    for label, pat in BANNED_PATTERNS:
        hit = re.search(pat, s)
        assert not hit, (dst, label, hit.group(0))
    open(dst, "w").write(s)
    print("wrote", os.path.basename(dst))


if __name__ == "__main__":
    for src, dst, pre in JOBS:
        scrub(src, os.path.join(T, dst), pre)
    sys.exit(0)
