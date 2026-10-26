#!/usr/bin/env bash
# Snapshot kľúčových URL pred/po zmene PHP verzie na Webglobe hostingu.
#
#   ./scripts/php-switch-check.sh before zvaraciestroje
#   ... prepni PHP v admin.webglobe.sk, počkaj ~15 min ...
#   ./scripts/php-switch-check.sh after  zvaraciestroje
#   ./scripts/php-switch-check.sh diff   zvaraciestroje
#
# Porovnáva HTTP status a veľkosť odpovede. Rozdiel vo veľkosti o pár bajtov
# je bežný (CSRF token, čas). Zmena statusu alebo prepad veľkosti = problém.

set -uo pipefail
MODE="${1:?použitie: $0 before|after|diff <site>}"
SITE="${2:?použitie: $0 before|after|diff <site>}"
OUT="$(cd "$(dirname "$0")/.." && pwd)/.php-check"
mkdir -p "$OUT"

urls_zvaraciestroje() {
  cat <<'EOF'
https://www.zvaraciestroje.sk/
https://www.zvaraciestroje.sk/kontakt
https://www.zvaraciestroje.sk/o-nas
https://www.zvaraciestroje.sk/zvaracia-zastera
https://www.zvaraciestroje.sk/zahradne-cerpadlo-p3300s
https://www.zvaraciestroje.sk/zvaracia-zastena-green6-160-cm
https://www.zvaraciestroje.sk/sitemap.xml
https://www.zvaraciestroje.sk/scripts/cron/xml_sitemap.php
https://www.zvaraciestroje.sk/scripts/cron/generate_search.php
EOF
}

urls_praskova() {
  cat <<'EOF'
https://www.praskovalakovnanr.sk/sk/uvodna-stranka/
https://www.praskovalakovnanr.sk/wp-json/
https://www.praskovalakovnanr.sk/sk/kontakt/
https://www.praskovalakovnanr.sk/wp-login.php
EOF
}

urls_billik() {
  cat <<'EOF'
https://www.billik.sk/
EOF
}

case "$SITE" in
  zvaraciestroje) URLS=$(urls_zvaraciestroje) ;;
  praskova)       URLS=$(urls_praskova) ;;
  billik)         URLS=$(urls_billik) ;;
  *) echo "neznámy web: $SITE (zvaraciestroje|praskova|billik)"; exit 1 ;;
esac

snap() {
  local f="$OUT/$SITE.$1"
  : > "$f"
  while IFS= read -r u; do
    [ -z "$u" ] && continue
    read -r code size < <(curl -sS -m 40 -A "Mozilla/5.0 (php-switch-check)" \
      -o /tmp/pscheck.body -w '%{http_code} %{size_download}' "$u" 2>/dev/null || echo "000 0")
    # počet riadkov s PHP chybami priamo vo výstupe
    local errs
    errs=$(grep -ciE "fatal error|parse error|deprecated:|warning:.*on line|uncaught (exception|error)" /tmp/pscheck.body 2>/dev/null | head -1)
    errs=${errs:-0}
    printf '%s\t%s\t%s\t%s\n' "$code" "$size" "$errs" "$u" >> "$f"
  done <<< "$URLS"
  echo "zapísané: $f"
  column -t -s $'\t' "$f"
}

case "$MODE" in
  before|after) snap "$MODE" ;;
  diff)
    b="$OUT/$SITE.before"; a="$OUT/$SITE.after"
    [ -f "$b" ] && [ -f "$a" ] || { echo "chýba $b alebo $a"; exit 1; }
    echo "URL | status pred→po | veľkosť pred→po | PHP chyby po"
    paste "$b" "$a" | awk -F'\t' '{
      status = ($1==$5) ? "ok" : "ZMENA " $1 "->" $5
      d = ($2==0) ? 0 : ($6-$2)*100/$2
      size = (d<-5 || d>5) ? sprintf("ZMENA %d->%d (%.0f%%)", $2, $6, d) : "ok"
      err  = ($7+0>0) ? "CHYBY:" $7 : "ok"
      printf "%-62s %-22s %-28s %s\n", $4, status, size, err
    }'
    ;;
  *) echo "neznámy režim: $MODE"; exit 1 ;;
esac
