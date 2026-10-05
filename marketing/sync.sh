#!/usr/bin/env bash
# Copies the rendered trailer, posters and feature reels from apps/web/public into marketing/.
# Run it after re-rendering anything (see README.md → "Regenerate").
#   bash marketing/sync.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="$ROOT/apps/web/public"
OUT="$ROOT/marketing"

mkdir -p "$OUT/trailer" "$OUT/posters" "$OUT/reels"

copy() { # copy <from> <to>; warns instead of failing when an asset has not been rendered yet
  if [ -f "$1" ]; then cp "$1" "$2"; echo "  ✓ ${2#$ROOT/}"; else echo "  – missing ${1#$ROOT/}"; fi
}

echo "Trailer"
copy "$SRC/videos/weatherise-trailer.mp4"           "$OUT/trailer/weatherise-trailer-1080p60.mp4"
copy "$SRC/videos/weatherise-trailer-captioned.mp4" "$OUT/trailer/weatherise-trailer-captioned-1080p60.mp4"
copy "$SRC/videos/weatherise-trailer-web.mp4"       "$OUT/trailer/weatherise-trailer-web.mp4"
copy "$SRC/videos/weatherise-trailer-mobile.mp4"    "$OUT/trailer/weatherise-trailer-mobile.mp4"
copy "$SRC/videos/weatherise-trailer.srt"           "$OUT/trailer/weatherise-trailer.en.srt"
copy "$SRC/videos/weatherise-trailer.vtt"           "$OUT/trailer/weatherise-trailer.en.vtt"
copy "$SRC/videos/weatherise-trailer.jpg"           "$OUT/trailer/weatherise-trailer-thumbnail.jpg"

echo "Posters"
for f in vertical horizontal vertical-back horizontal-back; do
  copy "$SRC/posters/weatherise-poster-$f.png" "$OUT/posters/weatherise-poster-$f.png"
  copy "$SRC/posters/weatherise-poster-$f.jpg" "$OUT/posters/weatherise-poster-$f.jpg"
done

echo "Feature reels"
for r in ask consensus rules replan; do
  copy "$SRC/videos/$r.mp4" "$OUT/reels/weatherise-reel-$r.mp4"
  copy "$SRC/videos/$r.jpg" "$OUT/reels/weatherise-reel-$r.jpg"
done
