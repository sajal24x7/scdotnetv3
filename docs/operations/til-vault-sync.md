# TIL Vault Sync (/write · TIL tab)

Syncs the Obsidian TIL vault on the work laptop with the `til-sync/` folder of
this repo, through the TIL tab on `https://sajalchoudhary.net/write/`. Built for
a locked-down machine: no git, no Obsidian plugins, and `api.github.com`
blocked — the browser only talks to the site itself, and a Cloudflare Pages
Function (`functions/api/til/sync.js`) makes the GitHub calls server-side.

## Setup after merging to main

### Cloudflare — nothing to do

The function deploys automatically with the site, exactly like the existing
`/api/upload`. It needs **no KV namespaces, no bindings, no environment
variables, and no dashboard changes** — it authenticates every request with the
GitHub token the browser sends and uses that same token for all GitHub calls.

The only Cloudflare-side event is the next production deploy (triggered by the
merge itself), which ships the updated `/write` page and the new function.

### GitHub — one fine-grained PAT

The TIL tab uses the same token as the Micro/Photo composer. If it's already
saved in the browser you're using, there is nothing to do. To set it up on the
work laptop (or check an existing token has the right shape):

1. GitHub → Settings → Developer settings → Fine-grained tokens → Generate new token
2. **Repository access**: only `sajal24x7/scdotnetv3`
3. **Permissions**: Contents → **Read and write** (nothing else)
4. Pick an expiry you're comfortable with; renew by pasting the new token into
   the `token` settings on `/write`

On the work laptop, open `/write`, paste the token when prompted, and it's
stored in that browser's localStorage only. Generate the token from a personal
device and carry it over via your password manager — you don't need GitHub
itself to be reachable from the work network (the token is only ever sent to
`sajalchoudhary.net`).

> **Security note**: the token sits in the work browser's localStorage and
> grants content write access to this (private) repo. Scope it to exactly the
> permissions above and give it a short expiry. Revoke it at
> GitHub → Settings → Developer settings → Fine-grained tokens if the work
> machine is ever out of your control.

### Optional cleanup from the abandoned passkey approach (PR #312)

PR #312 (`/vault-sync` with WebAuthn passkeys) was closed without merging, so
nothing from it is deployed. If any of these were created while trying it out,
they can be removed:

- Cloudflare Pages → Settings: the `WEBAUTHN_KV` KV binding and its namespace,
  and the `REGISTRATION_TOKEN` / `GITHUB_TOKEN` environment variables
- The separate `sajal24x7/til-sync` **repository** (this feature uses the
  `til-sync/` *folder* in this repo instead)
- The stale branch `claude/obsidian-vault-sync-website-4magxl` on this repo

## How it works

### Daily use

- **Work laptop → repo**: zip the vault folder (right-click → compress), open
  `/write`, switch to **TIL**, upload the zip. The page unzips it locally,
  keeps only `.md` files (skips `.obsidian/`, `.trash/`, `__MACOSX/`, dotfiles,
  flattens subfolders to filenames), and sends them to `/api/til/sync`.
- **Repo → work laptop**: the **Download zip** button rebuilds a zip of
  everything in `til-sync/` — extract it over the vault folder.

### Sync semantics

- One commit per upload on `main`, e.g. `TIL vault sync: 3 added, 2 updated
  [CI Skip]`. Files whose content already matches the repo (compared by git
  blob SHA) are skipped; re-uploading an identical vault is a no-op and makes
  no commit.
- `[CI Skip]` follows the repo convention: sync commits trigger **no
  Cloudflare build and no GitHub Actions**, since `til-sync/` doesn't affect
  the site.
- **Upsert-only**: notes missing from an uploaded zip are reported in the
  status line but never deleted from the repo. Delete manually in GitHub if a
  note should really go.
- `til-sync/` is **not** part of the published site (it's outside
  `src/content/`). To publish one of these notes, move it to
  `src/content/inbox/` with a `category:` field and the content pipeline
  (`content-publish.yml`) handles the rest.

### Limits

- Upload: max 2,000 files / 20 MB of markdown per sync; only `.md` files.
- The folder listing uses the GitHub contents API, which caps a directory at
  1,000 entries — revisit (switch to the git trees API) if the vault ever
  grows past that.

### API surface

`functions/api/til/sync.js`, authenticated by the composer PAT as a bearer
token on every request:

| Request | Purpose |
| --- | --- |
| `GET /api/til/sync` | List `.md` files in `til-sync/` (name, blob sha, size) |
| `GET /api/til/sync?path=<name>` | Raw content of one note |
| `POST /api/til/sync` `{ files: [{ name, content }] }` | Commit new/changed notes to `main` in one commit |

The client-side zip/unzip uses a vendored copy of
[fflate](https://github.com/101arrowz/fflate) at `public/write/fflate.js`
(UMD build, MIT) — self-hosted so the page loads with no third-party requests.
