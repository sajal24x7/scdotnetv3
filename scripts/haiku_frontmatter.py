#!/usr/bin/env python3
"""Fill in the frontmatter every haiku should carry.

- `number:` is the haiku's place in the practice (oldest = 1). It lives in
  frontmatter so the site and the syndication script both read the same
  value instead of each working it out. Already-numbered haiku are left
  alone; unnumbered ones (new arrivals from the inbox) get the next numbers
  after the current highest, oldest `created` first.
- `tags:` always includes `haiku`, so haiku get a tag on the site and a
  #haiku hashtag on socials without adding tags by hand. Other tags are kept.

Runs at the end of scripts/sort-inbox.sh; safe to run again at any time.

    python3 scripts/haiku_frontmatter.py
"""

import os
import re
import sys
from datetime import datetime, timezone

HAIKU_DIR = os.path.join(os.path.dirname(__file__), "..", "src", "content", "haiku")
DEFAULT_TAG = "haiku"


def split_frontmatter(content: str):
    """Return (frontmatter text, rest of file starting at the closing ---)."""
    if not content.startswith("---"):
        return None
    end = content.find("\n---", 3)
    return None if end == -1 else (content[3:end], content[end:])


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


def add_number(fm: str, number: int) -> str:
    fm = re.sub(r"^number:.*\n?", "", fm, flags=re.MULTILINE)
    # Sit next to `category:` when present, else at the end of frontmatter
    if re.search(r"^category:.*$", fm, re.MULTILINE):
        return re.sub(r"^(category:.*)$", rf"\1\nnumber: {number}", fm, count=1, flags=re.MULTILINE)
    return fm.rstrip("\n") + f"\nnumber: {number}\n"


def ensure_tag(fm: str) -> str:
    """Add DEFAULT_TAG to `tags:` (inline or block list); no-op if present."""
    line = re.search(r"^tags:[ \t]*(.*)$", fm, re.MULTILINE)
    if not line:
        return fm.rstrip("\n") + f'\ntags: ["{DEFAULT_TAG}"]\n'

    inline = line.group(1).strip()
    if inline.startswith("["):
        tags = [t.strip().strip("'\"").lstrip("#") for t in inline.strip("[]").split(",") if t.strip()]
        if DEFAULT_TAG in tags:
            return fm
        tags.append(DEFAULT_TAG)
        new_line = "tags: [" + ", ".join(f'"{t}"' for t in tags) + "]"
        return fm[:line.start()] + new_line + fm[line.end():]

    # Block list: "tags:" followed by "  - item" lines
    items = re.match(r"((?:\n[ \t]*-[^\n]*)*)", fm[line.end():]).group(1)
    tags = [t.strip()[1:].strip().strip("'\"").lstrip("#") for t in items.split("\n") if t.strip()]
    if DEFAULT_TAG in tags:
        return fm
    insert_at = line.end() + len(items)
    if inline:  # "tags: something" scalar; leave it alone rather than guess
        print(f"WARNING: unexpected tags value '{inline}', not adding '{DEFAULT_TAG}'", file=sys.stderr)
        return fm
    return fm[:insert_at] + f"\n  - {DEFAULT_TAG}" + fm[insert_at:]


def main() -> int:
    if not os.path.isdir(HAIKU_DIR):
        return 0

    highest = 0
    entries = []

    for filename in sorted(os.listdir(HAIKU_DIR)):
        if not filename.endswith((".md", ".mdx")):
            continue
        path = os.path.join(HAIKU_DIR, filename)
        with open(path, "r", encoding="utf-8") as f:
            content = f.read()
        parts = split_frontmatter(content)
        if parts is None:
            print(f"WARNING: no frontmatter in haiku/{filename}", file=sys.stderr)
            continue
        fm, rest = parts
        number = field(fm, "number")
        has_number = bool(number and number.isdigit())
        if has_number:
            highest = max(highest, int(number))
        entries.append({"path": path, "filename": filename, "fm": fm, "original": fm,
                        "rest": rest, "has_number": has_number,
                        "key": created_sort_key(fm, filename)})

    for entry in sorted((e for e in entries if not e["has_number"]), key=lambda e: e["key"]):
        highest += 1
        entry["fm"] = add_number(entry["fm"], highest)
        print(f"Numbered: haiku/{entry['filename']} → No. {highest}")

    for entry in entries:
        entry["fm"] = ensure_tag(entry["fm"])
        if entry["fm"] == entry["original"]:
            continue
        with open(entry["path"], "w", encoding="utf-8") as f:
            f.write("---" + entry["fm"] + entry["rest"])
        print(f"Updated: haiku/{entry['filename']}")

    return 0


if __name__ == "__main__":
    sys.exit(main())
