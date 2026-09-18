#!/usr/bin/env python3
"""THE ONLY WAY TO PRODUCE DELIVERABLE PDFS. Run from the scratchpad directory:

    python3 build_all.py            # build, verify, visual-QA, zip
    python3 build_all.py --no-zip

Order matters and is the reason this script exists:
  1. content verifiers (they build BOTH brand modes and leave NSL-mode PDFs on disk)
  2. final build of every generator in the default JGN mode, so the PDFs on disk are the real set
  3. delete artifacts that do not exist in JGN mode
  4. visual QA of every PDF (qa_pdf.py): overflow, overlap, wrapped signature lines, clipping
  5. zip the Nosebleed Sports LLC review set
Any failure stops the run with a non-zero exit. Nothing may be sent to the user if this fails.
"""
import glob
import os
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
os.chdir(HERE)
ENV = dict(os.environ, BRAND_KIT_OWNER="JGN")

GENERATORS = [
    "make_jgn_master_brand_license.py", "make_jgn_brand_asset_assignment.py",
    "make_jgn_marketing_audience_license.py", "make_jgn_transition_services.py",
    "make_nsl_account_infra_schedule.py", "make_jgn_written_consent.py",
    "make_nsl_operating_agreement.py", "make_nsl_org_consent.py",
    "make_founder_piia.py", "make_signature_packet.py", "make_brock_smith.py",
]
VERIFIERS = ["verify_intercompany.py", "verify_piia.py", "verify_packet.py"]
NOT_IN_JGN_MODE = ["NSL_JGN_Logo_and_Visual_Identity_License.pdf", "NSL_JGN_Brand_Asset_Assignment.pdf"]
REVIEW_SET = [
    "Nosebleed_Sports_LLC_Signature_Packet_and_Execution_Order.pdf",
    "Nosebleed_Sports_LLC_Operating_Agreement.pdf",
    "Nosebleed_Sports_LLC_Organizational_Consent.pdf",
    "Nosebleed_Sports_LLC_PIIA_Restivo.pdf", "Nosebleed_Sports_LLC_PIIA_Clark.pdf",
    "Nosebleed_Sports_LLC_PIIA_DiDario.pdf", "Nosebleed_Sports_LLC_PIIA_Bickel.pdf",
    "Nosebleed_Sports_LLC_PIIA_Del_Bene.pdf", "Nosebleed_Sports_LLC_PIIA_Glover.pdf",
    "JGN_NSL_Master_Brand_and_Trademark_License.pdf",
    "JGN_NSL_Marketing_and_Audience_License.pdf",
    "JGN_NSL_Transition_Services_Agreement.pdf",
    "NSL_Company_Account_and_Infrastructure_Schedule.pdf",
    "JGN_Media_LLC_Written_Consent.pdf",
]
ZIP = "Nosebleed_Sports_LLC_Review_Set.zip"


def run(cmd, label):
    r = subprocess.run(cmd, env=ENV, capture_output=True, text=True)
    if r.returncode != 0:
        print("FAILED:", label)
        print((r.stdout + r.stderr)[-3000:])
        sys.exit(1)
    return r.stdout


def main():
    print("== 1. content verifiers")
    for v in VERIFIERS:
        out = run([sys.executable, v], v)
        print("   ok", v, "|", out.strip().splitlines()[-1][:90])
    print("== 2. final JGN-mode build")
    for g in GENERATORS:
        run([sys.executable, g], g)
        print("   built", g)
    print("== 3. remove artifacts that do not exist in JGN mode")
    for f in NOT_IN_JGN_MODE:
        if os.path.exists(f):
            os.remove(f); print("   removed", f)
    print("== 4. placeholder / name sanity")
    from pypdf import PdfReader
    for f in sorted(glob.glob("*.pdf")):
        t = "".join(p.extract_text() for p in PdfReader(f).pages)
        for bad in ["[Founder", "[JGN member", "[Class B Member]", "__-_______", "BRAND_KIT_OWNER", "TBD"]:
            if bad in t:
                print("FAILED: %s contains %r" % (f, bad)); sys.exit(1)
    print("   ok")
    print("== 5. visual QA")
    r = subprocess.run([sys.executable, "qa_pdf.py"], capture_output=True, text=True)
    print("\n".join(l for l in r.stdout.splitlines() if not l.startswith("warning")))
    if r.returncode != 0:
        print("FAILED: visual QA"); sys.exit(1)
    if "--no-zip" not in sys.argv:
        print("== 6. zip")
        if os.path.exists(ZIP):
            os.remove(ZIP)
        run(["zip", "-q", "-j", ZIP] + REVIEW_SET, "zip")
        print("   wrote", ZIP, "(%d files)" % len(REVIEW_SET))
    print("\nBUILD OK — deliverable.")


if __name__ == "__main__":
    main()
