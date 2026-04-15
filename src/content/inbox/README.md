# Inbox

Drop new notes here from Apple Shortcuts or Obsidian.

A GitHub Action will automatically move each file to the correct category folder
(`til/`, `blog/`, `micro/`, etc.) based on the `category` field in its frontmatter.

## Required frontmatter

```yaml
---
title: "Your note title"
pubDate: 2025-01-15T10:30:00
category: til   # must match one of the known categories
tags: []
---
```

## Known categories

`til` · `blog` · `micro` · `photo` · `nordletter` · `story` · `poem`  
`bookshelf` · `filmshelf` · `tvshelf` · `gameshelf` · `now` · `colophon` · `evergreen`

If `category` is missing or unknown the Action will leave the file here and
open a GitHub issue so nothing is silently lost.
