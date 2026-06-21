#!/usr/bin/env python3
"""
Transform Obsidian note frontmatter to Astro-compatible frontmatter.

Filename format: YYYYMMDDHHMI Note Title.md

Obsidian input:
  aliases: [...]
  tags: ["#work"]
  category: evergreen

Astro output:
  title: "Note Title"
  slug: "note-title"
  pubDate: 2024-12-09T14:36:00
  updatedDate: 2024-12-09T14:36:00
  category: evergreen
  tags: ["work"]
"""

import sys
import re
import os
from pathlib import Path

# Default content root relative to where the script is called from
DEFAULT_CONTENT_ROOT = "src/content"


SMALL_WORDS = {"a", "an", "the", "and", "but", "or", "for", "nor", "on", "at", "to", "by", "in", "of", "up", "as"}

# Keys rewritten by the transform step — not passed through verbatim
_TRANSFORMED_KEYS = {"title", "slug", "created", "updated", "category", "tags"}
# Keys that are Obsidian-internal and should be stripped from output
_OBSIDIAN_ONLY_KEYS = {"aliases", "cssclass", "cssClasses"}

# Stub fields added for each category when absent.
# Each entry is (key, default_value) where default_value is the raw YAML string
# to write after the colon. Empty string means the key is written with no value (null).
_CATEGORY_STUBS: dict[str, list[tuple[str, str]]] = {
    "nordletter": [
        ("edition", ""),
        ("description", '""'),
        ("image", '""'),
    ],
    "bookshelf": [
        ("author", '""'),
        ("format", '""'),
        ("genre", '""'),
        ("series", ""),
        ("bookStatus", "to-read"),
        ("bookRating", ""),
        ("startedReading", ""),
        ("finishedReading", ""),
    ],
    "filmshelf": [
        ("director", '""'),
        ("year", ""),
        ("watchedDate", ""),
        ("filmStatus", "to-watch"),
        ("filmRating", ""),
        ("genre", '""'),
    ],
    "tvshelf": [
        ("showTitle", '""'),
        ("creator", '""'),
        ("season", ""),
        ("year", ""),
        ("genre", '""'),
        ("tvStatus", "to-watch"),
        ("tvRating", ""),
    ],
    "gameshelf": [
        ("developer", '""'),
        ("platform", '""'),
        ("genre", '""'),
        ("startedReading", ""),
        ("gameStatus", "to-play"),
        ("gameRating", ""),
    ],
}


def title_case(s: str) -> str:
    words = s.split()
    result = []
    for i, word in enumerate(words):
        if i == 0 or word.lower() not in SMALL_WORDS:
            result.append(word[0].upper() + word[1:] if word else word)
        else:
            result.append(word.lower())
    return " ".join(result)


def to_slug(s: str) -> str:
    s = s.lower()
    s = re.sub(r"[^\w\s-]", "", s)
    s = re.sub(r"[\s_]+", "-", s)
    s = re.sub(r"-+", "-", s)
    return s.strip("-")


def parse_filename(filename: str):
    stem = Path(filename).stem
    match = re.match(r"^(\d{12})\s+(.+)$", stem)
    if not match:
        return None, None

    ts = match.group(1)
    title_raw = match.group(2)

    pub_date = f"{ts[0:4]}-{ts[4:6]}-{ts[6:8]}T{ts[8:10]}:{ts[10:12]}:00"
    return pub_date, title_raw


def parse_frontmatter(content: str):
    """Return (frontmatter_dict, body) or (None, content) if no frontmatter."""
    if not content.startswith("---"):
        return None, content

    end = content.find("---", 3)
    if end == -1:
        return None, content

    fm_text = content[3:end]
    body = content[end + 3:]

    fm: dict = {}
    for line in fm_text.splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        if ":" in line:
            key, _, val = line.partition(":")
            key = key.strip()
            val = val.strip().strip("'\"")
            if key in fm:
                continue
            fm[key] = val
        elif line.startswith("- "):
            # list item for the last key — skip for simplicity
            pass

    return fm, body


def build_content_index(content_root: str) -> dict:
    """
    Scan src/content/<category>/*.md and return a dict mapping
    filename stem -> category, e.g. {"202412091436 Be a hybrid": "evergreen"}.
    Inbox is excluded because those files haven't been sorted yet.
    """
    index = {}
    root = Path(content_root)
    if not root.exists():
        return index

    for md_file in root.rglob("*.md"):
        parts = md_file.relative_to(root).parts
        if len(parts) < 2:
            continue
        category = parts[0]
        if category == "inbox":
            continue
        index[md_file.stem] = category

    return index


def convert_internal_links(body: str, content_index: dict) -> str:
    """
    Replace Obsidian [[stem|alias]] and [[stem]] links with Astro markdown links.
    Uses content_index to resolve the category for each linked note.

    [[202412091436 Be a hybrid|Be a hybrid]] -> [Be a hybrid](/evergreen/be-a-hybrid)
    [[202412091436 Be a hybrid]]             -> [Be a Hybrid](/evergreen/be-a-hybrid)
    """
    pattern = re.compile(r"\[\[([^\]|]+?)(?:\|([^\]]+?))?\]\]")

    def replace(m: re.Match) -> str:
        stem = m.group(1).strip()
        alias = m.group(2).strip() if m.group(2) else None

        # Strip timestamp prefix to get the raw title portion
        title_match = re.match(r"^\d{12}\s+(.+)$", stem)
        title_raw = title_match.group(1) if title_match else stem

        slug = to_slug(title_raw)
        display = alias if alias else title_case(title_raw)

        category = content_index.get(stem)
        path = f"/{category}/{slug}" if category else f"/{slug}"
        return f"[{display}]({path})"

    return pattern.sub(replace, body)


def is_obsidian_format(fm: dict) -> bool:
    """True if the frontmatter looks like it came from Obsidian (needs transformation)."""
    return "aliases" in fm or "title" not in fm or "slug" not in fm


def build_stub_lines(category: str, present_keys: set) -> list:
    """Return stub frontmatter lines for category-specific fields not already present."""
    lines = []
    for key, default in _CATEGORY_STUBS.get(category, []):
        if key not in present_keys:
            lines.append(f"{key}: {default}" if default else f"{key}:")
    return lines


def extract_passthrough_lines(fm_text: str) -> list:
    """Return raw frontmatter lines for keys that are neither transformed nor Obsidian-only.

    Preserves multi-line values (indented list items) verbatim so that fields like
    'author:\\n  - Dan Brown' survive unchanged.
    """
    skip = _TRANSFORMED_KEYS | _OBSIDIAN_ONLY_KEYS
    lines = fm_text.splitlines()
    result = []
    include = False
    for line in lines:
        stripped = line.strip()
        if not stripped:
            continue
        # A new key starts when a non-indented, non-list line contains ':'
        if not line.startswith(" ") and not line.startswith("\t") and not stripped.startswith("- "):
            key = stripped.partition(":")[0].strip()
            include = key not in skip
        if include:
            result.append(line)
    return result


def transform_file(filepath: str, content_index: dict | None = None) -> bool:
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    fm, body = parse_frontmatter(content)

    if fm is None:
        print(f"SKIP (no frontmatter): {os.path.basename(filepath)}", file=sys.stderr)
        return False

    if not is_obsidian_format(fm):
        print(f"SKIP (already Astro format): {os.path.basename(filepath)}")
        return False

    filename = os.path.basename(filepath)
    pub_date, title_raw = parse_filename(filename)

    if pub_date is None:
        print(f"SKIP (filename not in YYYYMMDDHHMI format): {filename}", file=sys.stderr)
        return False

    title = title_case(title_raw)
    slug = to_slug(title_raw)
    category = fm.get("category", "").strip().strip("'\"")

    # Use the Obsidian `updated` field if present; otherwise fall back to pubDate
    updated_date = fm.get("updated") or pub_date

    tags = extract_tags(content)
    tags_str = "[" + ", ".join(f'"{t}"' for t in tags) + "]"

    body = convert_internal_links(body, content_index or {})

    # Extract the raw frontmatter text to collect passthrough fields
    fm_end = content.find("---", 3)
    fm_text = content[3:fm_end]
    passthrough = extract_passthrough_lines(fm_text)

    # Determine which keys are already covered (transformed + passed through)
    present_keys = set(_TRANSFORMED_KEYS)
    for line in passthrough:
        stripped = line.strip()
        if stripped and not stripped.startswith("- ") and ":" in stripped:
            present_keys.add(stripped.partition(":")[0].strip())

    stubs = build_stub_lines(category, present_keys)

    new_fm_lines = [
        "---",
        f'title: "{title}"',
        f'slug: "{slug}"',
        f"created: {pub_date}",
        f"updated: {updated_date}",
        f"category: {category}",
        f"tags: {tags_str}",
        *passthrough,
        *stubs,
        "---",
    ]

    new_content = "\n".join(new_fm_lines) + body

    with open(filepath, "w", encoding="utf-8") as f:
        f.write(new_content)

    print(f"Transformed: {filename}")
    return True


def extract_tags(content: str) -> list:
    """Extract tags list from raw frontmatter content, stripping # prefix."""
    in_fm = False
    in_tags = False
    tags = []

    lines = content.splitlines()
    fm_delimiter_count = 0

    for line in lines:
        stripped = line.strip()

        if stripped == "---":
            fm_delimiter_count += 1
            if fm_delimiter_count == 2:
                break
            in_fm = True
            continue

        if not in_fm:
            continue

        if stripped.startswith("tags:"):
            in_tags = True
            # Inline list: tags: ["#work", "#life"]
            inline = stripped[5:].strip()
            if inline.startswith("["):
                inner = inline.strip("[]")
                for item in inner.split(","):
                    t = item.strip().strip("'\"").lstrip("#").strip()
                    if t:
                        tags.append(t)
                in_tags = False
            elif inline and not inline.startswith("-"):
                t = inline.strip("'\"").lstrip("#").strip()
                if t:
                    tags.append(t)
                in_tags = False
        elif in_tags:
            if stripped.startswith("- "):
                t = stripped[2:].strip().strip("'\"").lstrip("#").strip()
                if t:
                    tags.append(t)
            elif ":" in stripped or stripped == "":
                in_tags = False

    return tags


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: obsidian_to_astro.py <file1.md> [file2.md ...]")
        sys.exit(1)

    content_index = build_content_index(DEFAULT_CONTENT_ROOT)

    failed = 0
    for path in sys.argv[1:]:
        try:
            transform_file(path, content_index)
        except Exception as e:
            print(f"ERROR processing {path}: {e}", file=sys.stderr)
            failed += 1

    sys.exit(1 if failed else 0)
