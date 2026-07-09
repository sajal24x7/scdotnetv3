# Publishing Shortcut (Obsidian → inbox → done)

The iOS Shortcut that publishes an Obsidian note. It replaces the old
metadata-mapping shortcut: all frontmatter transformation now happens in CI
(`content-publish.yml` runs `scripts/obsidian_to_astro.py`), so the shortcut's
only job is to **copy the note into the GitSync repo's inbox folder** and let
GitSync push it to the `content` branch. The workflows handle the rest.

## What the note must contain (before running the shortcut)

The pipeline transforms the note for you, but two things must be right in
Obsidian because they can't be invented later:

1. **Filename: `YYYYMMDDHHMM Title.md`** — a 12-digit minute timestamp, a
   space, then the title. Example: `202607091430 On Slow Mornings.md`.
   The pipeline derives everything from it:
   - `title` and `slug` come from the title portion,
   - `created` (the publish date) comes from the timestamp.

   ⚠️ A file that doesn't match this pattern is *not* transformed. Until the
   validation step becomes blocking (audit brief 06), a mis-named note with a
   valid category can slip through and break the production build — so
   filename discipline is the one rule that matters. Use an Obsidian template
   (below) so you never type it by hand.

2. **Frontmatter with a valid `category`** — one of:
   `til` · `blog` · `micro` · `photo` · `nordletter` · `story` · `poem` ·
   `bookshelf` · `filmshelf` · `tvshelf` · `gameshelf` · `now` · `colophon` ·
   `evergreen`.
   A missing/unknown category fails the publish safely: nothing reaches the
   site and a GitHub issue tells you which file to fix.

Everything else is handled for you:

- `tags` pass through, `#` prefixes are stripped (`"#work"` → `"work"`).
- `updated:` is used if present, otherwise defaults to the created date.
- `[[wikilinks]]` become proper site links (`[Be a Hybrid](/evergreen/be-a-hybrid)`).
- Shelf categories (`bookshelf`, `filmshelf`, `tvshelf`, `gameshelf`,
  `nordletter`) get their extra fields stubbed in (`author`, `bookStatus`,
  etc.) — fill them in Obsidian if you have them, stubs appear otherwise.
- `aliases` and other Obsidian-only fields are stripped; unknown fields pass
  through untouched.

### Suggested Obsidian template

```
---
category:
tags:
---


```

Name the template so new notes inherit the timestamp: Obsidian →
Settings → Templates (or Templater) with a filename format of
`YYYYMMDDHHmm {{title}}` — then a new note is publish-ready by construction.

## Building the Shortcut

Open the **Shortcuts** app → **+** → name it **Publish Note**.

1. **Accept share-sheet input.** Tap the ⓘ info panel → enable **Show in
   Share Sheet** → set accepted types to **Files** only. This lets you run it
   from Obsidian/Files via Share.
2. **Fallback file picker** (so it also works when launched directly):
   - Action: **If** → Input: `Shortcut Input` → Condition: `has any value`
   - **Otherwise** branch → Action: **Select File** — when the picker opens
     at run time, navigate to your Obsidian vault. (Shortcuts remembers the
     last folder, so subsequent runs open in the vault.)
   - **End If**, then use **If Result** as the working file.
3. **Copy into the repo inbox.** Action: **Save File**:
   - File: the working file from step 2.
   - **Ask Where to Save: Off**, Destination: the GitSync repo folder →
     `src/content/inbox/`.
   - If the GitSync app's storage doesn't appear as a preset destination
     (some file providers can't be preset), leave **Ask Where to Save: On**
     and pick `src/content/inbox/` at run time — one extra tap.
   - Do **not** enable "Delete original" anywhere — the vault keeps your
     copy; the repo gets its own.
4. **Trigger the push.** Action: **Open App** → GitSync, and run its
   sync/commit for the repo (if GitSync exposes a Shortcuts action or URL
   scheme for "sync now", use that instead so the whole flow is one tap).
   GitSync must be pointed at branch **`content`** — see
   `publishing-pipeline.md`.
5. Optional: **Show Notification** → "Note queued — publish pipeline will
   take it from here."

That's the whole shortcut: *receive file → save into `src/content/inbox/` →
sync*. No metadata mapping, no frontmatter editing, no date formatting.

## What happens after the push (nothing for you to do)

1. `content-publish.yml` runs once: normalizes the frontmatter, sorts the
   note into its category folder, validates, merges to `main`.
2. Cloudflare builds the site **once**; the note is live.
3. After the deploy succeeds, the syndication workflow cross-posts it and
   records `syndicationUrls`.
4. If anything is wrong with the note, a GitHub issue (labels:
   `automation`, `inbox`) is opened and nothing is published — fix the
   frontmatter in Obsidian, run the shortcut again.

## Testing the shortcut

1. Create a throwaway note `202601010101 Shortcut Test.md` with
   `category: micro` in the frontmatter.
2. Run the shortcut → confirm the file appears in the GitSync repo under
   `src/content/inbox/` and GitSync pushes to `content`.
3. Watch the Actions tab: one **Publish content** run, one commit on `main`,
   one Cloudflare build; the note appears on the site.
4. Delete the post by removing the file from `src/content/micro/` on
   `content` (or any clone) and pushing — the pipeline publishes deletions
   the same way.

## Not for micro posts

Quick thoughts are faster through the `/write` composer
(see `micro-composer.md`) — it publishes straight to `main` from any device
with zero Obsidian involvement. Use this shortcut for everything that starts
life as an Obsidian note.
