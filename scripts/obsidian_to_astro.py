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


SMALL_WORDS = {"a", "an", "the", "and", "but", "or", "for", "nor", "on", "at", "to", "by", "in", "of", "up", "as"}


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


def is_obsidian_format(fm: dict) -> bool:
    """True if the frontmatter looks like it came from Obsidian (needs transformation)."""
    return "aliases" in fm or "title" not in fm or "slug" not in fm


def transform_file(filepath: str) -> bool:
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

    # Parse tags from the raw file for list values
    tags = extract_tags(content)

    tags_str = "[" + ", ".join(f'"{t}"' for t in tags) + "]"

    new_fm_lines = [
        "---",
        f'title: "{title}"',
        f'slug: "{slug}"',
        f"pubDate: {pub_date}",
        f"updatedDate: {pub_date}",
        f"category: {category}",
        f"tags: {tags_str}",
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

    failed = 0
    for path in sys.argv[1:]:
        try:
            transform_file(path)
        except Exception as e:
            print(f"ERROR processing {path}: {e}", file=sys.stderr)
            failed += 1

    sys.exit(1 if failed else 0)
