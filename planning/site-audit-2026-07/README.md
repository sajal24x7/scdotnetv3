# Site-wide Improvement Audit — July 2026

Audit of everything outside the recently redesigned homepage feed: layout shell, navigation,
post pages, section landings, shelf pages, tags, search, RSS, build pipeline, and CI.
Verified against a full production build (`npm run build`) and `npx astro check` on 2026-07-07.

Each numbered file in this folder is a self-contained task brief written so that an
implementer (human or model) can execute it without re-doing the investigation. Every brief
contains: context, exact files/lines, step-by-step instructions with code, and verification
commands. **Do one brief per branch/PR** unless noted otherwise.

## How to use these briefs

1. Read the whole brief before editing anything.
2. Follow the steps in order; file paths are relative to the repo root.
3. Run the verification section at the end of every brief. A brief is not done until all
   verification steps pass.
4. Never hardcode year folders or category lists — use helpers from `src/utils/content.ts`
   (see `AGENTS.md`).
5. `src/utils/bookCovers.ts` and `src/data/backlinks-index.json` are build-generated; if a
   local build touches them, do not include those hunks in an unrelated PR.

## Priority overview

| # | Brief | Priority | Category | One-line summary |
|---|-------|----------|----------|------------------|
| 01 | [Critical bugs](01-critical-bugs.md) | **P0 — broken today** | Mixed | Web fonts 404 site-wide, RSS items have no dates, search result links broken, no 404 page, no robots.txt |
| 02 | [SEO & metadata](02-seo-metadata.md) | P1 | Technical | Canonical URLs, social share images, RSS autodiscovery, consistent titles, sitemap hygiene |
| 03 | [Accessibility](03-accessibility.md) | P1 | UI/Design + Technical | Skip link, duplicate `<h1>`s, dark-mode icon contrast, hover jitter |
| 04 | [Performance](04-performance.md) | P1–P2 | Technical | Self-hosted fonts, background-flash fix, hero image pipeline, 221 MB of tag pages |
| 05 | [Dead code cleanup](05-code-cleanup.md) | P2 | Technical | ~15 unused components/files, stray root files, stale docs |
| 06 | [TypeScript hygiene](06-typescript-hygiene.md) | P2 | Technical | Make `npx astro check` pass (currently 59 errors) |
| 07 | [Infra & CI](07-infra-ci.md) | P1 | Infra | Node 20 vs 22 mismatch, no PR CI, stale `.npmrc` workaround, content publish pipeline consolidation (content branch → main, one build per publish) |
| 08 | [UI polish](08-ui-polish.md) | P2–P3 | UI/Design | Theme toggle, footer, newsletter form UX, color-token consolidation, search discoverability |

## Findings by category

### UI / design

- **Web fonts never load** — the Google Fonts URL returns HTTP 400, so Merriweather/Inter
  silently fall back to Georgia/system-ui on every page. The site's intended typography has
  not been rendering. (Brief 01, then 04 for self-hosting.)
- Random background color is applied only after `DOMContentLoaded`, causing a visible
  background flash on every navigation; a new random color per page also makes the site feel
  unstable. (Brief 04)
- Header/nav links move on hover (`translateY(-1px)`) and headings change `font-weight` on
  hover, both causing text jitter/reflow. (Brief 03)
- Footer is hard-coded black-on-white regardless of theme, contains no navigation, and
  duplicates stats. (Brief 08)
- No manual light/dark toggle — system preference only, implemented in three separate
  scripts. (Brief 08)
- Newsletter signup uses a 2010-era `window.open` popup pattern with no inline success
  feedback, and appears at the bottom of *every* post including poems/bookshelf notes. (Brief 08)
- Accent colors are inconsistent: `--color-accent` is blue (`#0066cc`) but buttons/tags use
  hard-coded purple `#8b5cf6` throughout. (Brief 08)
- No 404 page — Cloudflare serves a default. (Brief 01)
- Search results page renders with broken styling and broken links (curly-quote bug). (Brief 01)
- GitHub/Threads icons use hard-coded dark fills (`#333`, `#000`) that are nearly invisible
  in dark mode. (Brief 03)

### Technical / infra

- **All 21 RSS feeds ship `<item>`s without `<pubDate>`** — readers show no/wrong dates.
  Verified: `dist/rss.xml` has 50 items, zero `pubDate` elements. (Brief 01)
- No `robots.txt`; sitemap not advertised; the internal `/navigation-demo/` test page is in
  the public sitemap. (Briefs 01, 02)
- No canonical URLs, no `og:image`/Twitter cards, no RSS autodiscovery `<link>`s, page
  titles inconsistent ("Blog" vs "Search - Sajal Choudhary"). (Brief 02)
- `npx astro check` fails with 59 type errors, although `AGENTS.md` instructs contributors
  to run it before every PR. (Brief 06)
- Node version conflict: `package.json` requires `>=22.12.0` but Cloudflare Pages and all
  8 GitHub workflows pin Node 20. (Brief 07)
- No CI runs build/typecheck on pull requests. (Brief 07)
- 2,765 of the 4,463 built HTML pages (221 MB of 454 MB) are tag pages, most for tags with
  one or two posts — build-time, deploy-size, and crawl-budget waste. (Brief 04)
- ~15 dead components (`SearchButton`, `FeaturedPosts`, `HomeFeaturedGrid`, two legacy
  `Search` components, `search-index.json.ts`, `homeFeatured.json`, `logo-switch.js`…),
  stray root files (`package-lock 2.json`, `check_2025_categories.js`), and a stale
  `.npmrc` peer-deps workaround for a package no longer installed. (Brief 05)
- `src/pages/rss.xml.js` duplicates the item-building logic that already exists in
  `src/utils/rss.js`. (Brief 01 fixes both; Brief 05 dedupes.)

### Anything else (content, docs, process)

- `AGENTS.md`/`README.md` describe features that no longer exist (Homepage Featured via
  `homeFeatured.json`, `PostList` consumption) — misleading for future automation. (Brief 05)
- `src/data/backlinks-index.json` is a committed build artifact that goes stale between
  builds (the repo copy was ~150 entries behind after one local build). Consider
  regenerating it in CI or gitignoring it. (Brief 07, optional step)
- The `/search` page is only discoverable via a small icon in the social-links row; there is
  no keyboard shortcut and no nav entry. (Brief 08)
- Accessibility gaps: no skip-to-content link, site name is an `<h1>` on every page so all
  pages have two `<h1>`s. (Brief 03)

## Suggested order of execution

```
01 (P0 fixes, small diffs, immediate user-visible wins)
07 (align Node + add CI so later briefs are protected by checks)
02 (SEO head overhaul — one Layout change, big win)
03 (a11y)
04 (performance)
06 (typecheck green — do after 05 so you don't fix types in dead code)
05 (cleanup)   ← can run any time; keep it as its own PR
08 (polish — several independent sub-tasks)
```
