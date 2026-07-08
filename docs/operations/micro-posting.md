# Micro posting from your phone

A low-friction way to publish micro posts without Obsidian or gitsync. A
single Apple Shortcut sends the post straight to GitHub; a workflow builds
the file with correct Astro frontmatter, commits it to
`src/content/micro/` on `main`, and kicks off syndication. Cloudflare
Pages deploys as usual.

```
Share sheet / Shortcut → workflow_dispatch API → micro-post.yml
    → creates src/content/micro/YYYYMMDDHHMM Title.md on main
    → Cloudflare deploys · syndication posts to Bluesky/Mastodon/Threads
```

## Pieces

- **`.github/workflows/micro-post.yml`** — `workflow_dispatch` workflow
  taking `title`, `url`, `link_text`, `quote`, `comment`, `tags` (all
  optional; at least one of `url`/`quote`/`comment` required).
- **`scripts/create-micro-post.mjs`** — builds the markdown file:
  Helsinki-time `YYYYMMDDHHMM` filename (title-less posts get just the
  timestamp), `created`/`updated` in UTC, slug from title, quote rendered
  as blockquotes.

All formatting logic lives in the repo, so the shortcut stays dumb — it
only collects fields and makes one API call.

## One-time setup: a fine-grained token

1. GitHub → Settings → Developer settings → **Fine-grained personal
   access tokens** → Generate new token.
2. Name it e.g. `micro-post-shortcut`, set a long expiry.
3. Repository access: **Only select repositories** → `scdotnetv3`.
4. Permissions → Repository permissions → **Actions: Read and write**.
   Nothing else.
5. Copy the token — it goes inside the shortcut in the next section.

If the token ever leaks, the blast radius is "can run workflows in this
one repo". Revoke and re-issue from the same page.

## The Apple Shortcut

Create a new shortcut with these actions:

1. **Receive** *URLs and Text* from the Share Sheet
   (Shortcut Details → check "Show in Share Sheet"). Add a
   **Get URLs from Input** action and save to variable `PostURL`.
2. **Get Clipboard** → variable `Quote` (this is the passage you copied
   on the page — same habit as your current workflow).
3. **Ask for Input** (Text), prompt "Title (optional)" → variable
   `Title`. Leave the default empty and just tap Done for title-less
   posts.
4. **Ask for Input** (Text), prompt "Comment (optional)" → variable
   `Comment`.
5. **Ask for Input** (Text), prompt "Tags, comma-separated (optional)"
   → variable `Tags`.
6. **Get Contents of URL**:
   - URL: `https://api.github.com/repos/sajal24x7/scdotnetv3/actions/workflows/micro-post.yml/dispatches`
   - Method: `POST`
   - Headers:
     - `Authorization`: `Bearer <YOUR-TOKEN>`
     - `Accept`: `application/vnd.github+json`
   - Request Body: JSON
     - `ref` (Text): `main`
     - `inputs` (Dictionary):
       - `title` (Text): `Title`
       - `url` (Text): `PostURL`
       - `quote` (Text): `Quote`
       - `comment` (Text): `Comment`
       - `tags` (Text): `Tags`
7. Optionally add **Show Notification**: "Micro post published 🚀".

A successful dispatch returns an empty `204` response — no output means
it worked.

### Usage

1. On the page you want to post about, copy the passage you want to
   quote (or copy nothing — the quote is optional; clear the clipboard
   or delete the Get Clipboard step result if it contains something
   stale).
2. Share sheet → run the shortcut.
3. Type a title (or skip), a comment (or skip), tags (or skip). Done.

The post is live on the site after the next Cloudflare deploy
(~2 minutes) and syndicated automatically.

### Variations

- **Pure-text thought, no link**: run the shortcut from the home screen
  instead of the share sheet (add it as an icon or to a widget); leave
  the URL empty and just fill the comment.
- **From a Mac**: the same shortcut works in macOS Shortcuts, or use the
  GitHub UI: Actions → "Create micro post" → Run workflow and fill the
  form fields — that's the zero-setup fallback from any browser.

## Why this over a web app

- No hosting, no auth layer to build, nothing new to maintain — the
  "backend" is a GitHub Action in the repo you already run actions in.
- The shortcut keeps the copy-quote muscle memory from the old
  Obsidian flow, minus Obsidian, the second shortcut, and gitsync.
- The Actions run log doubles as an audit trail; a failed post shows up
  as a red run with the script's error message.

## Notes

- Posts go straight to `main`, bypassing `src/content/inbox/` — micro
  posts are ephemeral and don't need the sorting stage.
- Filename collisions within the same minute are auto-bumped by one
  minute.
- The workflow pushes with `GITHUB_TOKEN`, which doesn't fire `on: push`
  workflows, so it dispatches `syndicate-content.yml` explicitly;
  syndication also re-runs after deploy via the existing
  `deploy-success` dispatch from the Cloudflare build.
