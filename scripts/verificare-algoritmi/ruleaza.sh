#!/usr/bin/env bash
# Rulează verificările numerice ale algoritmilor **pe modulele reale** din `src/`,
# nu pe reimplementări — o reimplementare ar verifica alt cod decât cel livrat.
#
# Node dezbracă tipurile nativ (22.18+), dar nu cunoaște aliasul `@/` din Vite.
# De aceea copiem sursele într-un director temporar și rescriem `@/…` în căi
# relative. Copia e aruncată la final; `src/` nu se atinge.
#
#   bash scripts/verificare-algoritmi/ruleaza.sh
set -euo pipefail

RADACINA="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
LUCRU="$(mktemp -d)"
trap 'rm -rf "$LUCRU"' EXIT

cp -r "$RADACINA/src" "$LUCRU/src"
cp -r "$RADACINA/scripts/verificare-algoritmi" "$LUCRU/verificare"
echo '{ "type": "module" }' > "$LUCRU/package.json"

# `@/x` → cale absolută către copia din directorul de lucru, cu extensie.
find "$LUCRU/src" "$LUCRU/verificare" -name '*.ts' -print0 |
  xargs -0 sed -i -E "s#(from \")@/([^\"]+)(\")#\1$LUCRU/src/\2.ts\3#g"
# Verificările importă cu `../../src/…`; le trimitem la aceeași copie.
sed -i -E "s#\"\.\./\.\./src/([^\"]+)\"#\"$LUCRU/src/\1\"#g" "$LUCRU/verificare"/*.ts

esec=0
for fisier in "$LUCRU/verificare"/*.ts; do
  nume="$(basename "$fisier")"
  [ "$nume" = "ruleaza.sh" ] && continue
  echo ""
  echo "──────── $nume ────────"
  node --experimental-strip-types "$fisier" 2>&1 | grep -v "ExperimentalWarning\|--trace-warnings" || esec=1
done

echo ""
if [ "$esec" -eq 0 ]; then echo "✓ toate fișierele de verificare au trecut"; else echo "✗ au picat verificări"; fi
exit "$esec"
