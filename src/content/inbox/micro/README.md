# Micro inbox

Drop tweet-like micro posts here as plain markdown files — no
frontmatter, no filename convention. A GitHub Action converts each file
into a proper micro post in `src/content/micro/` (timestamp filename,
Astro frontmatter) and deletes the original.

- **Filename**: anything — it is discarded.
- **Title**: optional. Start the note with `# Your Title` to set one;
  otherwise the post is title-less.
- **Tags**: optional. Add a frontmatter block with `tags: a, b` if you
  want them.

Everything else in the file is the post body (markdown).

See `docs/operations/micro-posting.md` for details. Longer notes with a
`category` field still go in the parent `inbox/` folder as before.
