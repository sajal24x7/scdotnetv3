# 08 — UI polish (P2–P3)

Independent sub-tasks; each can be its own small PR. Ordered by value.

## 8.1 Manual theme toggle (system-preference override)

Today dark mode follows `prefers-color-scheme` only, wired in **three places**
(`Layout.astro` inline script, `public/bg-color-randomizer.js`,
`games/cards-29/index.astro`) — `public/logo-switch.js` is a fourth, unused copy.
Users cannot pin the site to light/dark.

**Implementation:**

1. Single source of truth in the `Layout.astro` head inline script (merge with the
   background-color logic from brief 04 §4.2):

```js
const stored = localStorage.getItem('theme');            // 'light' | 'dark' | null
const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
const dark = stored ? stored === 'dark' : systemDark;
document.documentElement.classList.toggle('dark', dark);
```

2. Toggle button in the header (`MultiLevelNavigation.astro`, next to `SocialLinks`):
   a `<button type="button" aria-label="Toggle color theme" aria-pressed={...}>` with
   sun/moon SVGs shown/hidden via the existing `.dark` class. Click handler:

```js
const isDark = document.documentElement.classList.toggle('dark');
localStorage.setItem('theme', isDark ? 'dark' : 'light');
// re-apply background palette (see brief 04 §4.2 — expose its apply() function)
```

3. Keep following system changes only when no stored override exists.
4. Apply the same storage check in `games/cards-29/index.astro`'s standalone script.

**Verify:** toggle persists across reloads and navigation; OS theme change still switches
the site when no override is stored; background palette swaps light/dark sets on toggle.

## 8.2 Footer: make it useful and theme-aware

`src/components/Footer.astro` is `bg-black text-white` in both themes (harsh against the
pastel random backgrounds) and contains only stats + copyright.

- Replace hard-coded colors with tokens: `background: rgb(var(--color-bg-secondary))`,
  text `rgb(var(--color-text-primary))`, border `rgb(var(--color-border))` — or keep a
  deliberate dark band but derive it from the palette (`.dark` aware).
- Add a compact nav row: Garden · Stream · Nordletter · Books · About · Feeds · Search ·
  Colophon. Reuse the `mainNavItems` hrefs (don't import the nav component; a simple
  hand-written list is fine here).
- Keep the streak/post-count stats — they're charming — but wrap the two blocks in a
  responsive flex row.
- The orange `text-orange-500` streak number is the only orange in the app; switch to the
  accent token for consistency (see 8.5).

## 8.3 Newsletter signup: replace the popup pattern

`src/components/ui/NewsletterSignup.astro` posts to Buttondown with
`target="popupwindow"` + `onsubmit="window.open(...)"` — a popup that browsers may block,
with no inline feedback.

**Implementation (Buttondown supports both patterns):**

1. Remove `target` and the inline `onsubmit`.
2. Progressive enhancement script in the component: intercept submit, `fetch` the same
   `actionUrl` with `FormData`, then swap the form for an inline success message
   ("Check your inbox to confirm — thanks!") or an error message with the email preserved.
   No JS → normal form post to Buttondown's hosted page (which is the current fallback
   behavior anyway, minus the popup).
3. Add a honeypot field (`<input type="text" name="url" tabindex="-1" autocomplete="off"
   class="sr-only" aria-hidden="true">`) — Buttondown treats a filled `url` as spam.
4. **Placement audit:** the signup currently renders at the bottom of *every* post
   (`PostLayout.astro` line ~566) regardless of category. Restrict to categories where it
   makes sense — suggested: `nordletter`, `blog`, `evergreen` — via
   `{['nordletter','blog','evergreen'].includes(category) && <NewsletterSignup .../>}`.
   Keep the homepage instance.

## 8.4 Search discoverability

`/search/` works well (Pagefind) but is reachable only through a small magnifier icon in
the social row.

- Add a `/` keyboard shortcut: tiny inline script in `Layout.astro` —
  `keydown` on document; if `e.key === '/'` and target isn't an
  input/textarea/contenteditable, `e.preventDefault(); location.href = '/search/'`.
- Add "Search" to the footer nav (8.2).
- Optional: give the search icon a visible label on desktop (`Search`) in
  `SocialLinks.astro` (`showLabels` already exists as a prop).

## 8.5 Color-token consolidation

Current inconsistency:
- `--color-accent` = blue `#0066cc` (light) / `#4d9fff` (dark) — used for focus rings and
  some links.
- Buttons, tag chips, newsletter CTA hard-code purple `#8b5cf6`/`#7c3aed`
  (`index.astro` hero buttons, `NewsletterSignup.astro`, `--color-tag`).
- Footer streak uses Tailwind `orange-500`.
- Secondary-nav active state uses `border-blue-600`.

**Decision to make with the owner:** pick ONE accent (the purple is used most). Then:

1. In `global.css`, set `--color-accent` (and dark variant) to the chosen accent; add
   `--color-accent-hover`.
2. Replace hard-coded `#8b5cf6`/`#7c3aed`/`bg-[#8b5cf6]`-style arbitrary values with the
   token: grep targets — `grep -rn "8b5cf6\|7c3aed\|orange-500\|blue-600" src`.
3. Verify focus-visible outlines (they use `--color-accent`) still meet 3:1 contrast on
   both light and dark backgrounds.

This is mechanical but touches many files — keep it as its own PR with before/after
screenshots of: homepage hero buttons, tag chips, nav active states, post links, footer.

## 8.6 Micro-fixes (batch into any polish PR)

- `src/pages/index.astro` line ~89: `<br />` inside the bio paragraph used for layout —
  replace with two `<p>` elements.
- `MultiLevelNavigation.astro`: the `layout?: 'mobile' | 'desktop'` prop is accepted but
  never used — delete it.
- `Footer.astro` uses class `text-normal` on a `<div>` around stats but `text-small`
  inside; fine — just confirm intentionality while in the file.
- `UnifiedFeed.astro` load-more button: after a fetch error the label stays
  "Something went wrong — try again" forever even after success; reset `textContent` to
  the original label at the start of each click handler run.
- `SocialLinks.astro`: external links pass `rel: 'me'` **instead of**
  `noopener noreferrer` (the ternary chooses one or the other). Emit both:
  `rel={link.rel ? `${link.rel} noopener noreferrer` : 'noopener noreferrer'}` for
  `target="_blank"` links.
- `feeds.astro` external links already do this correctly — use as reference.

## Verification

Visual/manual, per sub-task; plus:

```bash
npm run build && npm run preview
grep -rn "8b5cf6" src | wc -l    # 0 after 8.5
```

Screenshot checklist for the PR(s): header with theme toggle (light+dark), footer
(light+dark), newsletter success state, a post page bottom (categories with and without
signup), search via `/` shortcut.
