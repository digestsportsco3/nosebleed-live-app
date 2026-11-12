#!/bin/bash
# Prints every html/*.html to pdf/*.pdf with headless Chromium. Usage: ./build_pdf.sh
set -e
cd "$(dirname "$0")"
CHROME=${CHROME:-/opt/pw-browsers/chromium-1243/chrome-linux64/chrome}
rm -rf pdf && mkdir -p pdf
while IFS= read -r f; do
  [ -z "$f" ] && continue
  base="${f%.html}"
  url="file://$(python3 -c "import urllib.parse,sys,os; print(urllib.parse.quote(os.path.abspath(sys.argv[1])))" "html/$f")"
  "$CHROME" --headless --disable-gpu --no-sandbox --no-pdf-header-footer --print-to-pdf="pdf/$base.pdf" "$url" 2>/dev/null
  echo "$(pdfinfo "pdf/$base.pdf" | awk '/^Pages/ {print $2}') pages  $base"
done < html/manifest.txt
