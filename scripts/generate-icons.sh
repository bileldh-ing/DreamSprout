#!/usr/bin/env bash
# Generates the app icon, adaptive icon, splash and favicon (text-free) with ImageMagick.
# Usage: bash scripts/generate-icons.sh   (from repo root or apps/mobile)
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/apps/mobile/assets/images"
ART="$ROOT/apps/mobile/assets/stories/img/luna-firefly-1.webp"
TMP="$(mktemp -d)"
mkdir -p "$OUT"
IM="$(command -v magick || command -v convert)"

# Glyph: crescent moon + sprout on transparent 1024 canvas
"$IM" -size 1024x1024 xc:none \
  -fill '#FFE7A3' -draw "circle 600,380 600,140" \
  -fill none -draw "fill #000000 circle 690,320 690,110" \
  "$TMP/moon_mask.png"
"$IM" -size 1024x1024 xc:none -fill '#FFE7A3' -draw "circle 600,380 600,140" "$TMP/moon_full.png"
"$IM" -size 1024x1024 xc:none -fill white -draw "circle 690,320 690,110" "$TMP/cut.png"
"$IM" "$TMP/moon_full.png" "$TMP/cut.png" -compose Dst_Out -composite "$TMP/moon.png"
"$IM" -size 1024x1024 xc:none \
  -stroke '#7EE2B8' -strokewidth 34 -fill none -draw "path 'M 470,860 C 470,760 480,690 520,610'" \
  -stroke none -fill '#7EE2B8' -draw "ellipse 420,620 120,62 -30,330" \
  -fill '#A8F0CF' -draw "ellipse 620,560 135,66 0,360" \
  "$TMP/sprout_raw.png"
"$IM" "$TMP/sprout_raw.png" \( +clone -background '#7EE2B8' -shadow 80x18+0+0 \) +swap -background none -layers merge +repage -gravity center -extent 1024x1024 "$TMP/sprout.png"
"$IM" "$TMP/moon.png" \( +clone -background '#FFE7A3' -shadow 70x30+0+0 \) +swap -background none -layers merge +repage -gravity center -extent 1024x1024 "$TMP/moon_glow.png"
"$IM" "$TMP/moon_glow.png" "$TMP/sprout.png" -gravity center -composite "$TMP/glyph.png"

# Icon: story art, darkened navy gradient, glyph on top
"$IM" "$ART" -resize 1024x1024^ -gravity center -extent 1024x1024 \
  \( -size 1024x1024 gradient:'#1a1f4bcc'-'#0b0f24ee' \) -compose over -composite \
  "$TMP/glyph.png" -compose over -composite -flatten "$OUT/icon.png"

# Adaptive icon foreground (transparent, glyph within the 66% safe zone)
"$IM" "$TMP/glyph.png" -resize 680x680 -gravity center -background none -extent 1024x1024 "$OUT/android-icon-foreground.png"
# Splash glyph and favicon
"$IM" "$TMP/glyph.png" -resize 512x512 "$OUT/splash-icon.png"
"$IM" "$OUT/icon.png" -resize 64x64 "$OUT/favicon.png"
rm -rf "$TMP"
echo "✔ icons written to $OUT"
