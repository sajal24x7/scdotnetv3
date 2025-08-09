## Information Architecture Plan

- Current Phase: P1 – Inventory and centralization
- Overall Progress: 0%
- Last Updated: run `npm run date` and replace this line per workspace rule

### Goals
- Unify how years are discovered and content is fetched.
- Centralize category mapping and URL helpers.
- Align nav, tags, feeds, and pages with the same taxonomy buckets.

### Tasks
- [ ] P1.1 Create `src/utils/categories.ts`
  - Expose: `getCategoryUrl(category)`, `getBucket(category)`, `ALL_CATEGORIES`, `BUCKETS`.
- [ ] P1.2 Replace hardcoded year arrays
  - Files: `src/pages/now.astro`, `src/components/Footer.astro` and others that list years.
  - Use `getYearDirectories()` everywhere.
- [ ] P1.3 Replace local category maps with centralized helper
  - Files: `src/pages/[...slug].astro` (uses `getCategoryUrl()`), tag pages, feeds.
- [ ] P1.4 Normalize tag casing at render
  - Ensure tag listing and search use a consistent display (e.g., original case) and consistent URL param casing.
- [ ] P1.5 Update navigation items to reflect buckets
  - Keep visual layout unchanged; only adjust link targets/labels if required by taxonomy truth.
- [ ] P1.6 Add canonical section landing content rules
  - Garden: `evergreen`, `til`, `now`.
  - Stream: `blog`, `micro`, `photo`.
  - Prose: link to `stories/` and `poems/`.
  - Feeds page should link to all section feeds.

### Implementation Notes
- Do not change visual hierarchy without explicit approval; keep classes and layout.
- Where a page already filters categories (e.g., `stream`), ensure it uses the BUCKET logic.
- Maintain current URLs. Migrations should not alter routes.

### Acceptance
- No visual differences except copy/link corrections.
- All listings and feeds reflect the same category-to-bucket mapping.
- No hardcoded year arrays remain.

### Completion Log
- Add dated notes here as tasks complete.


