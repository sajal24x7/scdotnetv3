## Website Improvement Guidelines (Information Architecture, UI/UX, Technical)

These guidelines consolidate how the site should evolve without disrupting the current look and feel. Implementation plans are split into separate documents and referenced here.

- Last Updated: run `npm run date` and replace this line per workspace rule

### Principles
- Content-first. Keep pages fast, legible, and low-JS by default.
- No visual regressions by default. Any UI changes must be opt-in and reviewed.
- Never hardcode year lists. Always discover `src/content/[YYYY]` dynamically.
- Accessibility is a baseline, not a layer on top.
- Prefer composition (small Astro components, utilities) over duplication.
- Keep taxonomy consistent across navigation, feeds, and search.

### Information Architecture (IA)
- Buckets (per project rule):
  - Notes: `evergreen`, `now` (surfaced at `garden/`)
  - Ephemera: `micro`, `blog`, `photo`, `til` (surfaced at `stream/`)
  - Fiction: `poem`, `story` (surfaced at `prose/`, `poems/`, `stories/`)
  - Newsletter: `nordletter`
  - Bookshelf: `bookshelf`
- URL model: `/<category>/<slug>/` stays. Section landing pages: `/garden/`, `/stream/`, `/prose/`, `/nordletter/`, `/books/`, `/bookshelf/`, `/tags/`, `/feeds/`.
- Year discovery: always use a utility (`getYearDirectories()`) to enumerate years. Do not keep constants (e.g., in `now.astro`, `Footer.astro`).
- Category mapping: centralize mapping (e.g., `story -> stories`, `poem -> poems`) in a single `src/utils/categories.ts` so pages and feeds don’t drift.
- Tags: unify tag usage across search, tag pages, and listings. Normalize casing at render.
- Feeds: one canonical feed per bucket with consistent metadata and item shaping.

### UI/UX
- Layout wrappers: use `PageWrapper` and `ProseWrapper` consistently to keep widths predictable. Keep current max-widths to avoid layout shift.
- Header/nav: primary nav should reflect the buckets. If expanding items (e.g., add `Tags`, `Feeds`), gate behind a flag to avoid visual changes by default.
- Search: keep modal approach; add keyboard navigation and ARIA attributes (`role="dialog"`, `aria-modal="true"`, labelled controls).
- Typography: keep current defaults. Optionally offer an opt-in variant using Montserrat for headings (user preference) gated behind a CSS class to avoid global change.
- Cards/lists: maintain consistent spacing scales and hover states. Prefer text-first previews; images optional.
- Accessibility: add skip-to-content link, `nav`/`main` landmarks, `aria-current` on active links, and focus-visible styles.

### Technical
- Layout: consolidate on `src/layouts/Layout.astro`. Deprecate `BaseLayout.astro` or migrate anything unique from it, then remove.
- Theme/Fouc: use a single theme strategy. Apply the class before paint (same inline script everywhere) and add a proper toggle (persisted with `localStorage`).
- SEO: add canonical URL; fix `og:url` to use a string URL; add JSON-LD for articles; enable `@astrojs/sitemap`; add `robots.txt`; ensure a custom `404` page exists.
- Feeds: factor duplicate RSS logic into `src/utils/rss.ts` so section feeds only provide filters and titles.
- Search: generate a small build-time index (title, description, tags, category, date, url) to enable body search later (FlexSearch/MiniSearch) while staying client-only.
- Content: extend `content/config.ts` or a `computedFields` utility for derived fields (reading time, edition display, canonical URL, category URL).
- Images: prefer Astro `<Image>` where helpful or add `srcset/sizes` for hero images; keep `loading="lazy"`. Keep Cloudflare R2 switch in `imageUtils.ts`.
- Performance: drop dead scripts (e.g., random color/ bg scripts) or move them to `public/` and measure; preload only what’s needed. Keep JS footprint minimal.
- Types/quality: improve types in utilities (remove `any` where easy), enable stricter TS for utils, and add a lightweight lint check.
- Analytics: if needed, use privacy-friendly analytics (Plausible/CF Web Analytics). Keep it opt-in.

### References
- Detailed IA plan: `planning/plan-information-architecture.md`
- Detailed UI/UX plan: `planning/plan-ui-ux.md`
- Detailed Technical plan: `planning/plan-technical-modernization.md`


