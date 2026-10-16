#!/usr/bin/env bash
# Собирает PDF из markdown-документов в docs/. Нужны python3 с пакетом markdown, puppeteer-core и /usr/bin/google-chrome.
set -e
cd "$(dirname "$0")/.."
tmp=$(mktemp -d)
python3 -I scripts/md2html.py docs/manual/panduan-pengguna.md "$tmp/manual.html" "Panduan Pengguna"
python3 -I scripts/md2html.py docs/dev/dokumentasi-teknis.md "$tmp/dev.html" "Dokumentasi Teknis"
node scripts/html2pdf.mjs "$tmp/manual.html" docs/manual/panduan-pengguna.pdf
node scripts/html2pdf.mjs "$tmp/dev.html" docs/dev/dokumentasi-teknis.pdf
echo "PDF обновлены"
