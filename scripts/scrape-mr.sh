#!/usr/bin/env bash
# Scrape marrakechrealty.com fiches biens — séquentiel, respectueux du serveur.
#
# USAGE
#   bash scripts/scrape-mr.sh                   # utilise scripts/urls.txt
#   bash scripts/scrape-mr.sh path/to/urls.txt  # fichier d'URLs custom
#
# Lit les URLs (format "type/slug") depuis scripts/urls.txt. Une par ligne,
# commentaires avec # ignorés. Les fichiers déjà téléchargés sont skippés
# (idempotent — relancer le script reprend là où ça s'est arrêté).
#
# NOTE IMPORTANTE : marrakechrealty.com rate-limit au niveau IP/WAF.
# Depuis une IP déjà bannie, toutes les requêtes timeoutent (observé 2026-04-17).
# Exécuter depuis :
#   • une machine locale avec VPN
#   • une GitHub Action (IP propre, relance automatique)
#   • un serveur cloud frais
#
# Avec params actuels (--max-time 25 + sleep 4s), compter ~30s par fiche,
# soit ~20 min pour 40 URLs. Ne PAS paralléliser (MR bloque au 2e flux).

set -u

UA="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
URLS_FILE="${1:-$(dirname "$0")/urls.txt}"
OUT_DIR="$(dirname "$0")/fixtures/fiches"

if [ ! -f "$URLS_FILE" ]; then
  echo "URLs file not found: $URLS_FILE" >&2
  exit 1
fi

mkdir -p "$OUT_DIR"

ok=0
fail=0
skip=0
total=0

while IFS= read -r url; do
  # Strip comments and blank lines
  url="${url%%#*}"
  url="$(echo "$url" | tr -d '[:space:]')"
  [ -z "$url" ] && continue

  ((total++))
  fname=$(echo "$url" | tr '/' '_').html
  out="${OUT_DIR}/${fname}"

  if [ -f "$out" ] && [ -s "$out" ]; then
    echo "skip ${url}"
    ((skip++))
    continue
  fi

  code=$(curl -sL -A "$UA" \
    -H "Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8" \
    -H "Accept-Language: fr-FR,fr;q=0.9,en;q=0.8" \
    --max-time 25 --compressed \
    "https://www.marrakechrealty.com/${url}/" \
    -o "$out" -w "%{http_code}" 2>/dev/null)
  sz=$(test -f "$out" && wc -c < "$out" || echo 0)

  if [ "$code" = "200" ] && [ "$sz" -gt 5000 ]; then
    echo "ok  ${code} ${sz}b ${url}"
    ((ok++))
  else
    echo "ERR ${code} ${sz}b ${url}"
    ((fail++))
    rm -f "$out"
  fi
  sleep 4
done < "$URLS_FILE"

echo
echo "=========================================="
echo "DONE — total=$total ok=$ok skip=$skip fail=$fail"
echo "Output : $OUT_DIR"
echo
echo "Next steps :"
echo "  1. python3 scripts/parse-mr.py            # parse HTML → JSON"
echo "  2. bun run scripts/seed-supabase.ts       # push JSON → Supabase (à venir)"
