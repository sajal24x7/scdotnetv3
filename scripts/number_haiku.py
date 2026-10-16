#!/usr/bin/env python3
"""Give every haiku a `number:` in its frontmatter.

Haiku are numbered by their place in the practice (oldest = 1). The number
lives in frontmatter so the site and the syndication script both read the
same value instead of each working it out.

Already-numbered haiku are left alone. Unnumbered ones (new arrivals from the
inbox) get the next numbers after the current highest, oldest `created` first.
Runs at the end of scripts/sort-inbox.sh; safe to run again at any time.

    python3 scripts/number_haiku.py
"""

import os
import re
import sys
from datetime import datetime, timezone

HAIKU_DIR = os.path.join(os.path.dirname(__file__), "..", "src", "content", "haiku")


def read_frontmatter(content: str):
    if not content.startswith("---"):
        return None
    end = content.find("\n---", 3)
    return None if end == -1 else (content[3:end], end)


def field(fm: str, key: str):
    m = re.search(rf"^{key}:[ \t]*(.*)$", fm, re.MULTILINE)
    return m.group(1).strip().strip("'\"") if m else None


def created_sort_key(fm: str, filename: str):
    raw = field(fm, "created")
    if raw:
        try:
            dt = datetime.fromisoformat(raw.replace("Z", "+00:00"))
            if dt.tzinfo is None:
                dt = dt.replace(tzinfo=timezone.utc)
            return (dt.timestamp(), filename)
        except ValueError:
            pass
    # Filenames start with YYYYMMDDHHMM, so they sort by date too
    return (float("inf"), filename)


def main() -> int:
    if not os.path.isdir(HAIKU_DIR):
        return 0

    highest = 0
    unnumbered = []

    for filename in sorted(os.listdir(HAIKU_DIR)):
        if not filename.endswith((".md", ".mdx")):
            continue
        path = os.path.join(HAIKU_DIR, filename)
        with open(path, "r", encoding="utf-8") as f:
            content = f.read()
        parsed = read_frontmatter(content)
        if parsed is None:
            print(f"WARNING: no frontmatter in haiku/{filename}", file=sys.stderr)
            continue
        fm, _ = parsed
        number = field(fm, "number")
        if number and number.isdigit():
            highest = max(highest, int(number))
        else:
            unnumbered.append((created_sort_key(fm, filename), path, content))

    for _, path, content in sorted(unnumbered, key=lambda item: item[0]):
        highest += 1
        fm, end = read_frontmatter(content)
        fm = re.sub(r"^number:.*\n?", "", fm, flags=re.MULTILINE)
        # Sit next to `category:` when present, else at the end of frontmatter
        if re.search(r"^category:.*$", fm, re.MULTILINE):
            fm = re.sub(r"^(category:.*)$", rf"\1\nnumber: {highest}", fm, count=1, flags=re.MULTILINE)
        else:
            fm = fm.rstrip("\n") + f"\nnumber: {highest}\n"
        with open(path, "w", encoding="utf-8") as f:
            f.write("---" + fm + content[end:])
        print(f"Numbered: haiku/{os.path.basename(path)} → No. {highest}")

    return 0


if __name__ == "__main__":
    sys.exit(main())
