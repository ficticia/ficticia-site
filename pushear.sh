#!/usr/bin/env bash
# Uso: GITHUB_TOKEN=ghp_... ./pushear.sh "feat: mi cambio"
# O sin env: ./pushear.sh "feat: mi cambio" (te pide el token sin mostrarlo)
set -e
MSG="${1:-update}"
git add -A
if git diff --cached --quiet; then
  echo "sin cambios para commitear"
else
  git commit -m "$MSG"
fi
TOKEN="${GITHUB_TOKEN:-}"
if [ -z "$TOKEN" ]; then
  read -s -p "GITHUB_TOKEN: " TOKEN
  echo
fi
git push "https://ficticia:${TOKEN}@github.com/ficticia/ficticia-site.git" main
