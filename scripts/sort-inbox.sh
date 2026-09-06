#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

KNOWN_CATEGORIES="til blog micro photo nordletter story poem bookshelf filmshelf tvshelf gameshelf now colophon evergreen"
INBOX="src/content/inbox"
MOVED=0
FAILED=0

for file in "$INBOX"/*.md; do
  [ -f "$file" ] || continue
  filename=$(basename "$file")
  [ "$filename" = "README.md" ] && continue

  python3 scripts/obsidian_to_astro.py "$file"

  category=$(grep -m1 '^category:' "$file" \
    | sed 's/^category:[[:space:]]*//' \
    | tr -d "'\"" \
    | tr -d '[:space:]') || true

  if echo "$KNOWN_CATEGORIES" | grep -qw "$category"; then
    dest="src/content/$category"
    mkdir -p "$dest"
    # An entry with this filename may already be published there (e.g. a
    # shelf note re-synced from the vault after a site-side enrichment run
    # added a `cover`/`year` the vault copy never had). Carry those fields
    # over before the incoming copy replaces it, instead of silently
    # dropping them.
    if [ -f "$dest/$filename" ]; then
      python3 scripts/obsidian_to_astro.py --merge-missing "$file" "$dest/$filename"
    fi
    mv "$file" "$dest/$filename"
    echo "Moved: $filename → $category/"
    MOVED=$((MOVED + 1))
  else
    if [ -z "$category" ]; then
      reason="no 'category' field in frontmatter"
    else
      reason="unknown category: '$category'"
    fi
    echo "WARNING: Could not sort $filename ($reason)" >&2
    FAILED=$((FAILED + 1))
  fi
done

echo ""
echo "Done: $MOVED moved, $FAILED failed."
[ "$FAILED" -eq 0 ] || exit 1
