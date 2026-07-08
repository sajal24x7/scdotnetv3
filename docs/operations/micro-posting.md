# Micro posting from your phone

Low-friction ways to publish tweet-like micro posts without Obsidian or
gitsync. Two entry points feed the same script; both end with a properly
formatted post committed to `src/content/micro/` on `main`, followed by
the usual Cloudflare deploy and syndication.

```
A. Git app on the phone (Working Copy, GitHub app, …)
   drop bare note in src/content/inbox/micro/ → push
       → micro-inbox.yml converts it in place

B. Apple Shortcut → workflow_dispatch API → micro-post.yml

both → src/content/micro/YYYYMMDDHHMM[ Title].md on main
     → Cloudflare deploys · syndication posts to Bluesky/Mastodon/Threads
```

## Pieces

- **`.github/workflows/micro-inbox.yml`** — watches
  `src/content/inbox/micro/`; converts any markdown file dropped there
  into a micro post and deletes the original.
- **`.github/workflows/micro-post.yml`** — `workflow_dispatch` workflow
  taking `text` (required, markdown), `title` (optional) and `tags`
  (optional, comma-separated).
- **`scripts/create-micro-post.mjs`** — shared by both: builds the
  markdown file with a Helsinki-time `YYYYMMDDHHMM` filename (title-less
  posts get just the timestamp), `created`/`updated` in UTC, slug from
  title.

All formatting logic lives in the repo, so the phone side stays dumb.

## Option A: drop a file in `inbox/micro/`

If you already have the repo on your phone (e.g. in Working Copy), this
needs no token and no shortcut:

1. Create a new file in `src/content/inbox/micro/` — **name it
   anything**, the filename is discarded.
2. Type your post. That's the whole file — no frontmatter needed.
   - Want a title? Start the note with `# Your Title`.
   - Want tags? Add a frontmatter block with `tags: a, b`.
3. Commit and push (or let your app's auto-sync do it).

The workflow converts the note into `src/content/micro/` with proper
frontmatter, deletes the original, and triggers syndication. Notes with
a `category` field still go in the parent `inbox/` folder and are
handled by the existing sort-inbox pipeline.

## Option B: Apple Shortcut

One tap from the home screen, no git client involved. Needs a one-time
token setup.

### One-time setup: a fine-grained token

1. GitHub → Settings → Developer settings → **Fine-grained personal
   access tokens** → Generate new token.
2. Name it e.g. `micro-post-shortcut`, set a long expiry.
3. Repository access: **Only select repositories** → `scdotnetv3`.
4. Permissions → Repository permissions → **Actions: Read and write**.
   Nothing else.
5. Copy the token — it goes inside the shortcut in the next section.

If the token ever leaks, the blast radius is "can run workflows in this
one repo". Revoke and re-issue from the same page.

### The Apple Shortcut

Create a new shortcut with these actions:

1. **Ask for Input** (Text), prompt "What's on your mind?", with
   "Allow Multiple Lines" enabled → variable `Text`.
2. **Ask for Input** (Text), prompt "Title (optional)" → variable
   `Title`. Leave the default empty and just tap Done for title-less
   posts.
3. **Ask for Input** (Text), prompt "Tags, comma-separated (optional)"
   → variable `Tags`.
4. **Get Contents of URL**:
   - URL: `https://api.github.com/repos/sajal24x7/scdotnetv3/actions/workflows/micro-post.yml/dispatches`
   - Method: `POST`
   - Headers:
     - `Authorization`: `Bearer <YOUR-TOKEN>`
     - `Accept`: `application/vnd.github+json`
   - Request Body: JSON
     - `ref` (Text): `main`
     - `inputs` (Dictionary):
       - `text` (Text): `Text`
       - `title` (Text): `Title`
       - `tags` (Text): `Tags`
5. Optionally add **Show Notification**: "Micro post published 🚀".

Add the shortcut to your home screen or a widget so posting is one tap
away. A successful dispatch returns an empty `204` response — no output
means it worked.

If asking for title and tags every time feels like friction, delete
those two actions and send only `text` — both are optional server-side.

The post is live on the site after the next Cloudflare deploy
(~2 minutes) and syndicated automatically. The text is plain markdown,
so links and formatting work if you want them.

### Fallback from any browser

GitHub → Actions → "Create micro post" → Run workflow. That form has
the same fields and needs no token — useful from a desktop or someone
else's machine.

## Why this over a web app

- No hosting, no auth layer to build, nothing new to maintain — the
  "backend" is a GitHub Action in the repo you already run actions in.
- The Actions run log doubles as an audit trail; a failed post shows up
  as a red run with the script's error message.

## Notes

- Micro posts skip the sort-inbox stage — they are ephemeral and their
  category is known up front. `micro-inbox.yml` only looks at the
  `inbox/micro/` subfolder, and `sort-inbox.yml` only looks at
  top-level `inbox/` files, so the two never touch the same note.
- Filename collisions within the same minute are auto-bumped by one
  minute.
- Both workflows push with `GITHUB_TOKEN`, which doesn't fire `on: push`
  workflows, so they dispatch `syndicate-content.yml` explicitly;
  syndication also re-runs after deploy via the existing
  `deploy-success` dispatch from the Cloudflare build.
- The two workflows share a concurrency group so simultaneous posts
  queue instead of racing on the push to `main`.
