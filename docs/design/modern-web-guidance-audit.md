# Modern Web Guidance Audit (2026-11)

Audit date: 2026-11-10. Compares the site against Google Chrome's [modern-web-guidance](https://github.com/GoogleChrome/modern-web-guidance). Findings only; no fixes applied yet.

## Summary

The site is in good shape, but 6 changes would bring it in line with Google Chrome's [modern-web-guidance](https://github.com/GoogleChrome/modern-web-guidance) with little effort. The biggest wins are declaring `color-scheme`, adding speculation rules for faster page-to-page loads, and fixing type sizes so they respect user text scaling.

The guidance is a set of about 230 short guides (HTML, CSS, performance, accessibility, security, UI patterns) written for AI coding agents. The core discipline guides and the pattern guides that match what this site uses were read, then `src/`, `public/` and `functions/` were checked against them by hand. The repo's own `legacy-scan` tool was not run for this audit.

**Top changes, by impact:**

1. Add `color-scheme` (CSS and a `<meta>`) and `theme-color` to the main layout.
2. Add speculation rules so links prefetch on hover.
3. Add a font-relative part to the fluid type tokens (`clamp(1rem, 2.5vw, …)` to `clamp(1rem, 0.9rem + 0.5vw, …)`).
4. Give the theme toggle a "System" state.
5. Add `Strict-Transport-Security` and a `frame-ancestors` CSP to `public/_headers`.
6. Turn on cross-document view transitions, guarded for reduced motion.

## What already matches the guidance

Most of the core rules are already followed, so no rework is needed here.

- **Fonts:** self-hosted variable fonts, only the two Latin faces preloaded, with `crossorigin` (`src/layouts/Layout.astro`).
- **LCP images:** the hero image uses `fetchpriority="high"` and `loading="eager"`; other images lazy-load; R2 images get `srcset`, `sizes` and dimensions at build time.
- **Theme flash:** the theme script runs inline in `<head>` before paint.
- **Reduced motion:** a global `prefers-reduced-motion` block in `src/styles/global.css`, plus per-component guards in the carousels, feed and timeline.
- **Accessibility basics:** skip link, `lang="en"`, `aria-pressed` toggle buttons, a polite live region in the feed, real `<button>` prev/next controls in `PhotoCarousel`.
- **XSS:** every `innerHTML` call checked escapes its input first (search results, life timeline tooltip, filter badges).
- **Headers:** `nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy` and `Permissions-Policy` are set; hashed assets are `immutable`.
- **Search:** Pagefind loads lazily on its own page, not on every page.

## Findings and recommended changes

Fifteen gaps were found. Each row names the guide, what the site does today, the change, and where to make it. Effort: S = under an hour, M = a few hours, L = a day or more.

### Theming and dark mode

| # | Guide | Today | Change | Where | Effort |
| --- | --- | --- | --- | --- | --- |
| 1 | `dark-mode` (marked MANDATORY) | No `color-scheme` anywhere. Native scrollbars, form fields and the canvas stay light in dark mode. | Add `<meta name="color-scheme" content="light dark">` and set `:root { color-scheme: light }` / `.dark { color-scheme: dark }`. | `Layout.astro`, `tokens.css` | S |
| 2 | `browser-ui-theming` | No `theme-color` on the main site (only on `/write` and `/tools/webp`). | Add two `theme-color` metas with `media` queries, using `#fffcf5` and `#231e1c`. | `Layout.astro` | S |
| 3 | `dark-mode-toggle` | Toggle has 2 states. Once clicked, the site never follows the OS again. | Add a third "System" state that clears the stored value. Keep the `<meta name="color-scheme">` in sync. | `MultiLevelNavigation.astro`, `Layout.astro` | M |
| 4 | `browser-ui-theming` | No `accent-color` or `::selection` on the main site. | Set `accent-color: rgb(var(--color-accent))` on `:root` and a branded `::selection`. | `base.css` | S |

### Typography and text scaling

| # | Guide | Today | Change | Where | Effort |
| --- | --- | --- | --- | --- | --- |
| 5 | `respect-os-text-scale`, `fluid-scaling` | Type tokens use only `vw` in the middle term, for example `clamp(1rem, 2.5vw, 1.125rem)`. Text does not fully follow user zoom. | Add a `rem` term, for example `clamp(1rem, 0.95rem + 0.25vw, 1.125rem)`. Check that the max stays at or below 2.5× the min. | `tokens.css` | S |
| 6 | `respect-os-text-scale` | No opt-in to OS text size on mobile. | Add `<meta name="text-scale" content="scale">` after #5 lands, then test at 200%. | `Layout.astro` | S |
| 7 | `improve-text-layout-and-legibility` | `text-wrap` used in only 2 components. | Add `text-wrap: balance` to `h1`–`h3` and `text-wrap: pretty` to `.prose p, li, blockquote`. | `base.css` | S |
| 8 | `visually-stable-font-fallbacks` | No `font-size-adjust`. Fallback fonts can shift layout when Inter and Fraunces load. | Add `font-size-adjust: from-font` on `body` and headings. | `base.css` | S |

### Performance

| # | Guide | Today | Change | Where | Effort |
| --- | --- | --- | --- | --- | --- |
| 9 | `improve-next-page-load-performance` | No speculation rules. Each click is a cold load. | Add a `<script type="speculationrules">` that prefetches same-origin links at `moderate` eagerness. Exclude `/write`, `/auth`, `/api` and `/search`. | `Layout.astro` | S |
| 10 | `performance` | `transition-all duration-500` on `<body>`, plus a body `transition` on background and color. | Remove `transition-all` from `<body>`. Keep only the existing color transition. | `Layout.astro` | S |
| 11 | `performance` (bfcache) | Not verified. | Check in DevTools that no page sends `Cache-Control: no-store` and that bfcache works on post pages. | Cloudflare | S |

### Accessibility

| # | Guide | Today | Change | Where | Effort |
| --- | --- | --- | --- | --- | --- |
| 12 | `browser-ui-theming` | `scrollbar-width: none` on the nav rows and both carousels. The guide says only `auto` unless another way to scroll exists. | Nav rows: show a thin scroll hint or wrap items. Carousels already have buttons, so the photo carousel is fine; add buttons or visible scrollbars to the feed carousel. | `MultiLevelNavigation.astro`, `UnifiedFeed.astro` | M |
| 13 | `accessibility` (focus indicators) | `outline: none` on `:focus` with only a border-color change. | Switch to `:focus-visible` and keep a visible outline, or confirm the border meets 3:1 contrast. | `auth.css`, `learn.css` | S |
| 14 | `carousel` | Feed carousel has no prev/next buttons; photo carousel dots are `aria-hidden`. | Add `<button>` controls and `touch-action: manipulation` to the feed carousel. Make dots real buttons or keep them decorative with a status line. | `UnifiedFeed.astro`, `PhotoCarousel.astro` | M |

### Security headers

| # | Guide | Today | Change | Where | Effort |
| --- | --- | --- | --- | --- | --- |
| 15 | `security` | No HSTS, no CSP. | Add `Strict-Transport-Security: max-age=31536000; includeSubDomains` and `Content-Security-Policy: frame-ancestors 'none'`. Later, try a full CSP in `Report-Only` mode first. | `public/_headers` | S |

### Optional enhancements

These are nice to have and not gaps.

- **Cross-document view transitions** (`consistent-cross-document-transitions`): add `@view-transition { navigation: auto; }` inside a `prefers-reduced-motion: no-preference` query. Works well with #9.
- **Hover previews and tooltips** (`hovercard`, `interest-triggered-action-previews`, `position-aware-tooltips`): `LinkHoverEffect.astro` and the life timeline tooltip place popups with `getBoundingClientRect()`. Popover plus anchor positioning would remove that code, but `interestfor` still needs a polyfill, so this is a later refactor.
- **`content-visibility: auto`** on long pages like `/about` (life calendar) and the shelf walls, paired with `contain-intrinsic-size: auto …`.

## Out of scope

About half the guides do not apply to a static personal site and were skipped.

- **Passkeys, sign-in forms, cookies:** auth runs through Cloudflare, and `functions/` sets no cookies of its own.
- **PWA, WebAssembly, built-in AI, WebMCP, Chrome extensions:** not used.
- **Payment and address autofill, OTP forms:** no such forms.
- **Client A/B testing, analytics batching, service worker caching:** not used.
- **The standalone tools in `public/write/` and `public/tools/`:** these are separate apps and already set `theme-color`; they were not audited in depth.

## Suggested order of work

Three small PRs cover every S-effort item. The M items can follow one at a time.

- [ ] **PR 1, head and headers (about 1 hour):** #1, #2, #9, #10, #15. All in `Layout.astro`, `tokens.css` and `_headers`.
- [ ] **PR 2, typography (about 1 hour):** #5, #7, #8, then #6. Check pages at 200% zoom and at 320px width.
- [ ] **PR 3, small a11y fixes:** #4, #13, and the bfcache check in #11.
- [ ] **Theme toggle with a System state:** #3.
- [ ] **Scrolling and carousels:** #12 and #14 together, since they touch the same components.
- [ ] **Later:** view transitions, popover-based previews, `content-visibility`.

Open question: should the site set a browser support policy in `AGENTS.md`? The guidance asks for one before using features that are not yet Baseline widely available, such as `interestfor` and `text-scale`.

## Sources

- [GoogleChrome/modern-web-guidance](https://github.com/GoogleChrome/modern-web-guidance), cloned 2026-11-10. Guides read: `dark-mode`, `dark-mode-toggle`, `browser-ui-theming`, `respect-os-text-scale`, `fluid-scaling`, `improve-text-layout-and-legibility`, `visually-stable-font-fallbacks`, `performance`, `improve-next-page-load-performance`, `security`, `accessibility`, `carousel`, `hovercard`, `interest-triggered-action-previews`, `consistent-cross-document-transitions`.
