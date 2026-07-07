# Astro 7 Upgrade — Implementation Guide

**Goal:** Upgrade this site from Astro 6.4.x to Astro 7.0.x with zero visual or functional regressions.

**Audience:** This guide is written so that any implementer (human or AI agent) can execute it step by step without prior knowledge of Astro 7. Every change is spelled out with exact commands, exact file edits, and exact error messages to expect. Do the steps **in order**. Do not skip verification steps.

**Estimated effort:** 1–3 hours, mostly verification. The dependency and config changes themselves are small.

---

## 1. Current state of this site (verified 2026-07-07)

| Item | Value |
| --- | --- |
| `astro` | `^6.4.6` |
| `@astrojs/mdx` | `^6.0.3` |
| `@astrojs/react` | `^6.0.0` |
| `@astrojs/rss` | `^4.0.11` |
| `@astrojs/sitemap` | `^3.3.1` |
| `@astrojs/check` | `^0.9.9` |
| `tailwindcss` / `@tailwindcss/vite` | `^4.3.0` (Vite plugin, no Astro integration) |
| `pagefind` | `^1.5.2` (post-build CLI, framework-independent) |
| Node requirement (`engines`) | `>=22.12.0` (already meets Astro 7's floor) |
| Cloudflare Pages Node pin | **`20` in `cloudflare-pages.json` — stale, must change (Step 5)** |

Site characteristics that matter for this upgrade:

- **Custom remark plugins.** `astro.config.mjs` registers two remark plugins via `markdown.remarkPlugins`: `remarkWikilinks` (from `src/utils/remarkWikilinks.ts`) and an inline `remarkBreaks` (poetry line breaks). **This is the single most important migration item** — Astro 7 replaces the remark/rehype markdown pipeline by default (see §2.1).
- **Shiki config** under `markdown.shikiConfig` (dual `github-light`/`github-dark` themes, `wrap: true`). Still supported unchanged in v7.
- **15 content collections** in `src/content.config.ts`, all using the `glob()` loader from `astro/loaders` with a custom `generateId`. This API is **unchanged** in v7 (verified against the v7 type definitions).
- **89 `.astro` files**, one React island (`client:load`), 18 RSS endpoints using `@astrojs/rss`, JSON API endpoints, Pagefind search.
- **No usage** of any API removed in v7: no `Astro.glob`, no `getContainerRenderer`, no `astro:db`, no `<ViewTransitions />`, no `experimental.*` flags, no `legacy.*` flags, no `markdown.gfm`/`markdown.smartypants`, no `compressHTML` setting (this last one matters — see §2.3).

---

## 2. What changes in Astro 7 (and how it affects this site)

Facts below were verified against the published npm packages (`astro@7.0.6`, `@astrojs/markdown-remark@7.2.1`, `@astrojs/markdown-satteri@0.3.3`, `@astrojs/mdx@7.0.2`) and the official upgrade material. Latest stable at time of writing: **`astro@7.0.6`**.

### 2.1 Sätteri is the new default Markdown processor — **affects this site**

Astro 7 makes **Sätteri**, a Rust-powered markdown processor (`@astrojs/markdown-satteri`), the default pipeline for `.md` files. The old remark/rehype pipeline lives on in `@astrojs/markdown-remark`, which is **no longer bundled with Astro** — it is an optional peer dependency you install yourself.

Concretely, in `astro@7.0.6`:

- `markdown.processor` is a new config option; its default is `satteri()`.
- The old options `markdown.remarkPlugins`, `markdown.rehypePlugins`, and `markdown.remarkRehype` still parse, but are **deprecated**. If any of them is set, Astro tries to `import('@astrojs/markdown-remark')`:
  - If the package **is installed**, Astro auto-migrates the plugins onto a `unified()` processor and logs a deprecation warning telling you to pass them to `unified({...})` directly.
  - If the package **is not installed**, config validation throws this exact error and the build fails:
    > `` `markdown.remarkPlugins`, `markdown.rehypePlugins`, and `markdown.remarkRehype` run on the `unified` processor from `@astrojs/markdown-remark`, which is no longer installed by default now that Sätteri is the default Markdown processor. Install it with: npm install @astrojs/markdown-remark ``
- The clean, non-deprecated form is an explicit processor (this is what we will do in Step 3):

  ```js
  import { unified } from '@astrojs/markdown-remark';

  export default defineConfig({
    markdown: {
      processor: unified({ remarkPlugins: [myPlugin] }),
    },
  });
  ```

- `unified()` accepts `{ remarkPlugins, rehypePlugins, remarkRehype, gfm, smartypants }` (GFM and SmartyPants both default to `true`, matching v6 behavior).
- `markdown.syntaxHighlight` and `markdown.shikiConfig` stay where they are — they are processor-independent and unchanged.
- `markdown.gfm` and `markdown.smartypants` as top-level options are deprecated (warning only). This site does not set them.

**Decision for this site: keep the remark pipeline via `unified()`.** The two custom plugins are standard remark (mdast) transformers and wikilink rendering is core to the garden. Porting them to Sätteri-native `mdastPlugins`/`hastPlugins` is possible but is explicitly **out of scope** for this upgrade (noted in §8).

### 2.2 Rust compiler is now the only compiler — **verification needed**

The Go-based `@astrojs/compiler` is gone; `@astrojs/compiler-rs` is the only compiler (it was opt-in via `experimental.rustCompiler` in v6). It is faster but **stricter**:

- **Unclosed non-void HTML/component tags are now build errors.** The old compiler silently closed them.
- **Invalid HTML nesting is no longer auto-corrected.** The old compiler would reorder/restructure markup to match the HTML spec (e.g. hoisting block elements out of `<p>`); the new one passes your markup through as-is and lets the browser cope.

There is no config switch to get the old compiler back. Any problem must be fixed in the `.astro` source. The site has 89 `.astro` files; a clean `astro check` + `astro build` in Step 6 flushes out all hard errors.

### 2.3 `compressHTML` default changed from `true` to `'jsx'` — **decision made: pin old behavior**

In v7, Astro strips whitespace from rendered HTML using JSX rules by default (like React): a newline between two inline elements no longer renders as a space. This site does not set `compressHTML`, so it would silently inherit the new behavior — risky for a typography-heavy site with inline tag chips, dot-separated metadata rows, and poetry layouts.

**Decision:** set `compressHTML: true` explicitly in Step 3 to preserve byte-level v6 whitespace behavior and keep this upgrade a pure infrastructure change. Adopting `'jsx'` can be evaluated later as its own change (§8).

### 2.4 Vite 8 (Rolldown) — **no action expected**

Astro 7 bundles Vite 8, which adopts the Rust-based Rolldown bundler. The site's only Vite-level customization is `@tailwindcss/vite`, and the already-installed `^4.3.0` declares peer support for `vite ^8` (verified). No config change needed. Watch for build warnings anyway in Step 6.

### 2.5 Removals and stabilizations — **no action for this site**

- `astro db`, `astro login`, `astro logout`, `astro link` CLI commands and the `@astrojs/db` package are removed. *Not used here.*
- Importing `getContainerRenderer()` from an integration's package root is deprecated in favor of a dedicated `<package>/container-renderer` entrypoint (e.g. `@astrojs/react/container-renderer`). *Container API not used here.*
- v6 experimental flags `rustCompiler`, `advancedRouting`, and `queuedRendering` no longer exist (their behavior shipped); `experimental.logger` became the stable top-level `logger` option. Passing an unknown experimental flag is a config **error**, but this site sets none.
- `legacy.collectionsBackwardsCompat` still exists for pre-loader collections. *Not needed — all 15 collections already use `glob()` loaders.*

### 2.6 Integration version matrix for this upgrade

| Package | From | To | Why |
| --- | --- | --- | --- |
| `astro` | `^6.4.6` | `^7.0.6` | The upgrade. |
| `@astrojs/mdx` | `^6.0.3` | `^7.0.2` | **Required.** MDX v7 peer-depends on `astro ^7.0.0`; v6 will not resolve. MDX v7 supports both processors and, with the default `extendMarkdownConfig: true`, inherits `remarkPlugins`/`rehypePlugins` from the `unified()` processor automatically — so our custom plugins keep applying to MDX with no extra config. |
| `@astrojs/markdown-remark` | *(not installed — was bundled)* | `^7.2.1` | **New direct dependency.** Provides `unified()`; `astro@7.0.6` peer-depends on exactly `7.2.1` (optional peer). |
| `@astrojs/react` | `^6.0.0` | `^6.0.1` (via normal update) | No major needed; it declares no `astro` peer restriction. |
| `@astrojs/sitemap` | `^3.3.1` | latest `3.x` (`3.7.3`) | Routine minor update, no breaking changes. |
| `@astrojs/rss` | `^4.0.11` | latest `4.x` (`4.0.19`) | Routine patch update. |
| `@astrojs/check`, `pagefind`, `tailwindcss`, `@tailwindcss/vite`, React 19, `zod`, `typescript` | — | unchanged | Already compatible. |

---

## 3. Step-by-step implementation

### Step 0 — Preconditions

1. Node version must be ≥ 22.12.0 locally: `node --version`. (The repo's `engines` already requires this.)
2. Work on a dedicated branch:
   ```bash
   git checkout -b upgrade/astro-7
   ```
3. Ensure a clean working tree before starting (`git status`).

### Step 1 — Baseline snapshot (do not skip)

Build **before** touching anything, so you can diff output afterwards:

```bash
npm ci
npm run build          # runs cache-nordletter-images + generate-covers + astro build + pagefind
cp -r dist /tmp/dist-astro6
find /tmp/dist-astro6 -type f | wc -l   # note this number
```

If the baseline build fails, **stop** — fix `main` first; do not debug pre-existing failures mid-upgrade.

### Step 2 — Update dependencies

```bash
npm install astro@^7.0.6 @astrojs/mdx@^7.0.2 @astrojs/markdown-remark@^7.2.1
npm update @astrojs/sitemap @astrojs/rss @astrojs/react
```

Expected result in `package.json` dependencies: `astro` at `^7.0.6`, `@astrojs/mdx` at `^7.0.2`, and a new entry `@astrojs/markdown-remark` at `^7.2.1`. If npm reports a peer-dependency conflict (`ERESOLVE`), read it — it almost certainly means one of the three packages above was given the wrong major version; do **not** reach for `--force` or `--legacy-peer-deps`.

### Step 3 — Update `astro.config.mjs`

Three edits, all in the `markdown` block plus one new top-level option. The custom `remarkBreaks` function defined in this file and the `remarkWikilinks` import are kept exactly as they are.

**3a. Add one import** (below the existing imports at the top):

```js
import { unified } from '@astrojs/markdown-remark';
```

**3b. Replace the `defineConfig` call's option object.** Current form:

```js
export default defineConfig({
  site: 'https://sajalchoudhary.net',
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [
    react(),
    mdx(),
    sitemap(),
  ],
  markdown: {
    remarkPlugins: [remarkWikilinks, remarkBreaks],
    shikiConfig: {
      themes: {
        light: 'github-light',
        dark: 'github-dark',
      },
      wrap: true
    }
  }
});
```

New form (changes: `compressHTML` added, `remarkPlugins` moved inside `processor: unified({...})`, `shikiConfig` untouched):

```js
export default defineConfig({
  site: 'https://sajalchoudhary.net',
  // Astro 7 changed the default from `true` to `'jsx'` (JSX-style whitespace
  // stripping). Pin the v6 behavior so the upgrade is output-identical;
  // revisit `'jsx'` as a separate change.
  compressHTML: true,
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [
    react(),
    mdx(),
    sitemap(),
  ],
  markdown: {
    // Astro 7 defaults to the Sätteri (Rust) markdown pipeline. This site's
    // wikilinks and poetry line-breaks are remark plugins, so opt back into
    // the remark/rehype pipeline explicitly via @astrojs/markdown-remark.
    processor: unified({
      remarkPlugins: [remarkWikilinks, remarkBreaks],
    }),
    shikiConfig: {
      themes: {
        light: 'github-light',
        dark: 'github-dark',
      },
      wrap: true
    }
  }
});
```

Do **not** leave `markdown.remarkPlugins` in place alongside `processor` — it works (Astro merges it in) but logs a deprecation warning on every command.

### Step 4 — Regenerate types

```bash
npx astro sync
```

This regenerates `.astro/` content-collection types against v7. Expect it to complete without output changes needed in `src/content.config.ts`.

### Step 5 — Fix the deployment Node pin

Edit `cloudflare-pages.json`: change `"NODE_VERSION": "20"` to `"NODE_VERSION": "22"`. Node 20 is below Astro 7's floor (≥ 22.12.0) and reached end of life in April 2026.

> **Important:** Cloudflare Pages reads `NODE_VERSION` from the **dashboard environment variables**, not from this file (the file mirrors that setting for documentation). Whoever deploys must also set `NODE_VERSION=22` in the Cloudflare Pages project settings (Settings → Environment variables) for both Production and Preview, or the deploy will build on Node 20 and fail even though local builds pass. Flag this in the PR description.

Optional docs housekeeping while here: `AGENTS.md` says "Astro 5.x" and "Node 20+", and `docs/operations/deployment.md` may repeat the old Node version — update those mentions.

### Step 6 — Build and fix what the stricter compiler reports

```bash
npx astro check     # type + diagnostic pass over all .astro files
npm run build
```

Because the Rust compiler no longer repairs HTML, two new classes of error can appear, always with a file and line number:

1. **Unclosed tag errors** — an element like `<div>` or a component was never closed. Fix: add the missing closing tag at the location the error points to. Verify the fix doesn't change nesting semantics by reading the surrounding template.
2. **Invalid-nesting output changes** (no error, silent) — e.g. a `<div>` inside a `<p>`: v6 rewrote such markup at compile time, v7 emits it verbatim and the *browser* re-nests it at parse time, which can shift styling. This only matters if visual verification (Step 7) shows a layout difference; fix by correcting the invalid nesting in the `.astro` source.

Iterate `npm run build` until it exits 0. Also read the log for **warnings**: there must be **no** `[astro]` deprecation warnings about `remarkPlugins` or `gfm`/`smartypants` (if there are, Step 3 was done incorrectly), and Pagefind must report indexing roughly the same number of pages as before.

### Step 7 — Verify output parity

```bash
find dist -type f | wc -l    # compare with the Step 1 count — must match (or explain every difference)
npm run preview
```

With the preview server running, manually verify each of these (they map to this site's riskiest surfaces):

| Check | Where | What to look for |
| --- | --- | --- |
| Wikilinks | any garden/evergreen note containing `[[...]]` | still rendered as internal links (proves `remarkWikilinks` runs) |
| Poetry line breaks | any `/poem/` entry with blockquote stanzas | single newlines still render as `<br>` (proves `remarkBreaks` runs) |
| Code blocks | any post with fenced code | dual-theme Shiki highlighting, wrapped lines |
| Inline whitespace | tag chips, date "·" separators, nav links | no words/chips jammed together (proves `compressHTML: true` took effect) |
| RSS | `/rss.xml` and 2–3 category feeds (e.g. `/blog/rss.xml`, `/poem/rss.xml`) | valid XML, items present, HTML content intact |
| Search | Pagefind search UI | returns results |
| JSON endpoints | `/search-index.json`, `/api/link-previews.json` | valid JSON, non-empty |
| React island | the one `client:load` component | hydrates without console errors |
| Sitemap | `/sitemap-index.xml` | generated |

For extra rigor, spot-diff a handful of pages against the baseline:

```bash
diff <(sed 's/astro[ v]*[0-9.]*//g' /tmp/dist-astro6/index.html) \
     <(sed 's/astro[ v]*[0-9.]*//g' dist/index.html)
```

Expect only trivial differences (generator meta tag version, hashed asset names). Any *structural* HTML difference must be explained before merging.

### Step 8 — Commit

Commit `package.json`, `package-lock.json`, `astro.config.mjs`, `cloudflare-pages.json`, any `.astro` files fixed in Step 6, and any docs touched in Step 5. Suggested message: `Upgrade Astro 6 → 7 (unified markdown processor, Node 22 deploy pin)`.

---

## 4. Exact error messages → remedies

| Message (verbatim or close) | Cause | Remedy |
| --- | --- | --- |
| `...run on the 'unified' processor from '@astrojs/markdown-remark', which is no longer installed by default... Install it with: npm install @astrojs/markdown-remark` | `markdown.remarkPlugins` set but package missing | Step 2 was skipped; install `@astrojs/markdown-remark@^7.2.1` |
| `[astro] 'markdown.remarkPlugins', 'markdown.rehypePlugins', and 'markdown.remarkRehype' are deprecated. Pass them to 'unified({...})' directly instead.` (warning) | old-style options still present | Finish Step 3: move plugins into `processor: unified({...})` and delete the old keys |
| `[astro] 'markdown.remarkPlugins'/... are set, but your 'satteri' processor doesn't run them.` (warning) | old keys present **and** an explicit `satteri()` processor | Same as above — plugins belong inside `unified({...})` |
| `The markdown processor "<name>" does not provide MDX support.` | a custom processor without `createMdxRenderer` passed to MDX | Not expected here; both `unified()` and `satteri()` are supported by `@astrojs/mdx@7` |
| Compiler error naming a tag + file + line | unclosed non-void element (stricter Rust compiler) | Close the tag in the named `.astro` file |
| `Invalid or outdated experimental feature` | an `experimental.*` flag that no longer exists | Delete the flag (site sets none today) |
| npm `ERESOLVE` mentioning `astro@"^7.0.0"` | `@astrojs/mdx` still at v6, or vice-versa | Re-run Step 2 with the exact versions given |
| Cloudflare deploy fails; local build passes | host still on Node 20 | Step 5 dashboard change wasn't applied |

## 5. Rollback

Everything is dependency + config only. Roll back with:

```bash
git checkout main -- package.json package-lock.json astro.config.mjs cloudflare-pages.json
npm ci
```

(plus revert any `.astro` fixes — though tag-closing fixes are valid on v6 too and are safe to keep). If already merged, revert the merge commit; there is no data or content migration to unwind.

## 6. What deliberately does NOT change

- `src/content.config.ts` — all 15 collections, the `glob()` loader, `generateId`, and Zod schemas are untouched; the content-layer API is stable across 6 → 7.
- `src/utils/remarkWikilinks.ts` and the inline `remarkBreaks` — unchanged code, new registration point only.
- All `scripts/*` (cover generation, nordletter cache, syndication) — plain Node scripts, no Astro APIs.
- Pagefind, Tailwind 4, React 19, TypeScript 6 versions.

## 7. Acceptance criteria

1. `npm run build` exits 0 on Node 22 with **zero** `[astro]` deprecation warnings.
2. `npx astro check` reports no new errors versus `main`.
3. `dist/` page count matches the pre-upgrade baseline.
4. All nine manual checks in Step 7 pass.
5. `package.json` shows `astro@^7.0.6`, `@astrojs/mdx@^7.0.2`, `@astrojs/markdown-remark@^7.2.1`.
6. `cloudflare-pages.json` pins Node 22 and the Cloudflare dashboard variable is updated (or the PR flags it for the maintainer).

## 8. Follow-ups (separate tasks — do not bundle into the upgrade)

- **Evaluate the Sätteri pipeline natively.** Port `remarkWikilinks` + `remarkBreaks` to Sätteri `mdastPlugins` (`satteri({ mdastPlugins: [...] })` from `@astrojs/markdown-satteri`) for faster markdown builds across the site's hundreds of entries. Requires verifying plugin-API parity first; the plugin signature is Sätteri's own, not remark's.
- **Evaluate `compressHTML: 'jsx'`** (the new default) for smaller HTML output, with a visual diff pass over inline-element-heavy components.
- Refresh stale framework references in `AGENTS.md` ("Astro 5.x") if not done in Step 5.

## 9. Sources

- [Upgrade to Astro v7 — official guide](https://docs.astro.build/en/guides/upgrade-to/v7/)
- [Astro 7.0 announcement](https://astro.build/blog/astro-7/)
- [Markdown in Astro — processor configuration](https://docs.astro.build/en/guides/markdown-content/)
- [What's New in Astro 7 (AeroLaunch)](https://aerolaunch.app/blog/whats-new-in-astro-7/)
- [Astro 7 on Netlify changelog](https://www.netlify.com/changelog/2026-06-22-astro-7/)
- [Astro 7: painless migration write-up](https://www.oscargallegoruiz.com/en/blog/astro-7-painless-migration/)
- Behavior verified directly against published npm packages: `astro@7.0.6` (config schema, validation warnings/errors, CLI surface, dependency graph), `astro@6.4.6` (defaults diff), `@astrojs/markdown-remark@7.2.1` (`unified()` options), `@astrojs/markdown-satteri@0.3.3` (`satteri()` options), `@astrojs/mdx@7.0.2` (processor support, `extendMarkdownConfig` inheritance).
