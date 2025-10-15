# Site Audit Follow-up Task List

## Context
- Capture remediation items from the latest site-wide audit focused on static generation, client-side rendering usage, Astro best practices, and performance opportunities.

## Tasks
1. **Decide hosting strategy for `src/pages/api/webhook.ts`.**
   - Either add the appropriate adapter/output configuration for hybrid deployment or migrate the webhook to an external worker/service so the static build remains fully functional.
2. **Refactor `public/bg-color-randomizer.js`.**
   - Replace always-on DOM mutations with a lighter approach (e.g., CSS-driven theming or interaction-triggered script) to reduce main-thread work on every page load.
3. **Optimize link hover and share button scripts.**
   - Audit the global link preview script and the share button island's `MutationObserver` usage; scope their work to the relevant components or swap to Astro islands (`client:idle`/`client:visible`) to cut unnecessary observers.
4. **Fix `src/components/content/Search.astro` client script.**
   - Move the TypeScript-only constructs into a compiled module or remove the invalid annotations so browsers can execute the logic reliably.
5. **Pre-render tag filtering results.**
   - Replace client-side DOM rewrites on the tags index with build-time generated views or server-side filtering so users receive fully-formed markup on first paint.
