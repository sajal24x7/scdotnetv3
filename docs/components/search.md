# Search Modal and Index

The search experience combines a statically generated JSON index with a lazily loaded custom element to keep the default payload small while enabling fast client-side querying.

## Index Generation

- `src/pages/search-index.json.ts` prerenders a JSON payload during the Astro build. It uses `getAllPosts()` to collect every Markdown entry across the dynamic year collections and emits a list of `{ slug, data }` objects containing title, description, category, and tags.【F:src/pages/search-index.json.ts†L1-L31】【F:src/utils/content.ts†L38-L92】
- Responses are cached for ten minutes at the CDN via `Cache-Control: public, max-age=0, s-maxage=600`, allowing Cloudflare Pages to serve subsequent requests quickly.【F:src/pages/search-index.json.ts†L22-L31】

## Modal Delivery Strategy

- The shell markup lives in `src/components/SearchModal.astro`. It renders a `<search-modal>` custom element, wired with accessibility attributes and styled overlay/backdrop treatment. The modal expects to receive the index URL via `data-search-index-url` (defaults to `/search-index.json`).【F:src/components/SearchModal.astro†L1-L71】
- `src/components/islands/search-modal-loader.ts` attaches event listeners to any trigger annotated with `data-search-modal="global-search"`. Pointer hover, focus, or the `⌘/Ctrl + K` keyboard shortcut prefetch the island bundle. The loader imports `search-modal-island.ts` on demand and ensures the module only loads once per session.【F:src/components/islands/search-modal-loader.ts†L1-L154】
- The actual client logic is implemented in `search-modal-island.ts`. It defines the `<search-modal>` custom element, manages focus trapping, and handles open/close transitions. The island fetches the JSON index once the modal is opened (or earlier if the loader prefetches it).【F:src/components/islands/search-modal-island.ts†L1-L210】

## Relevance Scoring

`performSearch()` normalizes user input and chooses one of two strategies.【F:src/components/islands/search-modal-island.ts†L232-L322】

- Tag-specific queries use the `tag:` prefix and perform an exact, case-insensitive match against the stored tag array.
- General queries compute a composite relevance score:
  - Tag matches contribute 100 points.
  - Title matches contribute 50 points.
  - Category matches contribute 25 points.
  - Description matches contribute 10 points.

Results are sorted by the computed score, limited to ten items, and rendered with contextual metadata (category chip, description snippet, and up to three tags).【F:src/components/islands/search-modal-island.ts†L322-L403】

## User Experience Details

- Opening the modal locks page scroll and restores focus to the trigger after closing to maintain keyboard flow.【F:src/components/islands/search-modal-island.ts†L142-L205】
- A minimum of two characters is required for general queries to avoid noisy results, with explicit messaging for short inputs.【F:src/components/islands/search-modal-island.ts†L214-L273】
- Error, loading, and empty states are handled via template helpers so the user always sees contextual guidance.【F:src/components/islands/search-modal-island.ts†L206-L257】
- Result tags highlight matching strings and indicate the dominant relevance source via emoji (🏷️ tags, 📝 title, 📁 category, 💬 description).【F:src/components/islands/search-modal-island.ts†L12-L124】【F:src/components/islands/search-modal-island.ts†L324-L403】

## Extending the Modal

| Goal | Suggested Changes |
| --- | --- |
| Support additional metadata | Expand the JSON payload in `search-index.json.ts` and adjust `renderResultItem()` to output the new fields. |
| Change trigger behavior | Update the selector logic in `search-modal-loader.ts` or provide `data-modal-id` overrides when rendering the modal. |
| Integrate server-side filtering | Replace the fetch target with an API endpoint that accepts query parameters and update the island to debounce network requests instead of reading from memory. |

## Accessibility Checklist

- The modal sets `role="dialog"` and `aria-modal="true"`, and uses `aria-hidden` to communicate visibility changes.【F:src/components/SearchModal.astro†L14-L28】
- Keyboard shortcuts respect existing bindings and stop propagation once the module fully loads to avoid duplicate execution.【F:src/components/islands/search-modal-loader.ts†L59-L118】
- `Enter` selects the first result, while `Escape` closes the modal. Clicks on the backdrop (or the close button) also dismiss the overlay.【F:src/components/islands/search-modal-island.ts†L114-L205】
