---
updated: 2026-08-25T14:30:56
---
# til-sync

Mirror of the work-laptop Obsidian TIL vault, synced through the **TIL** tab
on [/write](https://sajalchoudhary.net/write/).

- **Not published.** This folder lives outside `src/content/`, so Astro never
  builds or deploys anything in it. To publish a note on the site, copy it into
  `src/content/inbox/` and the content pipeline takes over.
- **Upload** (from the work laptop): zip the vault folder and upload it on the
  TIL tab. Only new and changed `.md` files are committed, in a single commit
  tagged `[CI Skip]` so syncs never trigger builds or workflows.
- **Download**: the TIL tab's download button zips this folder's current
  contents to restore or refresh the work vault.
- **Upsert-only.** Notes deleted from the work vault are never deleted here;
  remove files manually if they should go.

See `docs/operations/til-vault-sync.md` for setup and details.
