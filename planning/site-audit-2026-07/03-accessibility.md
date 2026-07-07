# 03 — Accessibility (P1)

Findings from reading the layout shell, navigation, and built HTML. No automated axe run
was performed; run one (see Verification) after these fixes.

## 3.1 Add a skip-to-content link

There is none anywhere in `src/`. Keyboard users must tab through the full three-tier
navigation (5 primary + up to 5 secondary + 4 tertiary links + socials) on every page.

**File:** `src/layouts/Layout.astro`

1. First element inside `<body>`:

```html
<a href="#main-content" class="skip-link">Skip to content</a>
```

2. Add `id="main-content"` and `tabindex="-1"` to the existing `<main>` element.

3. In `src/styles/global.css` (`@layer components`):

```css
.skip-link {
    position: absolute;
    left: 1rem;
    top: -100%;
    z-index: 100;
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    background: rgb(var(--color-text-primary));
    color: rgb(var(--color-bg));
    font-weight: 600;
}
.skip-link:focus {
    top: 1rem;
}
```

## 3.2 Site name must not be an `<h1>` on every page

**File:** `src/components/navigation/MultiLevelNavigation.astro` (line ~173).

The masthead renders `<h1>Sajal Choudhary</h1>` inside the header, so every content page
has two `<h1>`s (masthead + page title). Change the masthead element to a `<p>` (keep all
classes — the visual style is class-driven, not element-driven):

```html
<a href="/" class="inline-block">
    <p class="text-2xl font-bold text-gray-900 dark:text-white font-serif tracking-tight">
        Sajal Choudhary
    </p>
</a>
```

Also update the two mobile media-query rules in the same file's `<style>` that target
bare `h1 { font-size: ... }` selectors — retarget them to the class or a new
`.masthead-name` class so the sizing still applies.

Exception: on the homepage the page's own `<h1>` is currently the book title
("A Year of Mornings") — that is acceptable; no change needed there.

## 3.3 Dark-mode-invisible social icons

**File:** `src/components/navigation/SocialLinks.astro`

The inline SVGs hard-code brand fills: GitHub `fill="#333"`, Threads `fill="#000"`.
On the dark background these are effectively invisible. Two options; take the first:

1. **Preferred:** change those two fills to `currentColor` and give the anchor
   `class="text-gray-700 dark:text-gray-300"` (matching the existing icon sizing wrapper).
   Leave colorful brand icons (Mastodon, Bluesky, Instagram) as-is if desired.
2. Alternative: per-icon dark variants via Tailwind `dark:` on a wrapping span with
   CSS `filter: invert()` — more fragile; avoid.

While in this file, fix the nonsense aria-label
`` aria-label={`${link.name}${showLabels ? '' : ` - ${link.name}`}`} `` (renders
"GitHub - GitHub") → `aria-label={link.name}`.

## 3.4 Hover jitter (also a design fix)

Two rules cause text/layout shift on hover:

1. `src/styles/global.css` (~line 403): headings gain weight on hover —

```css
h1:hover, h2:hover, h3:hover, h4:hover, h5:hover, h6:hover { font-weight: 700; }
```

Variable-font weight change reflows surrounding text. **Delete this rule** (and the
companion `transition: font-weight 0.2s ease` on the heading base rule ~line 136 becomes
unnecessary; remove it too).

2. `src/components/navigation/MultiLevelNavigation.astro` `<style>`:
`nav a:hover { transform: translateY(-1px); }` makes nav links bounce. Delete the rule
(the color/background hover states remain).

## 3.5 Respect reduced motion globally

`html { scroll-behavior: smooth; }` and the 0.5 s background/color transitions on
`html, body` play regardless of user preference. In `src/styles/global.css` add:

```css
@media (prefers-reduced-motion: reduce) {
    html {
        scroll-behavior: auto;
    }
    *, *::before, *::after {
        transition-duration: 0.01ms !important;
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
    }
}
```

## 3.6 Feed load-more announcements (minor)

`src/components/layout/UnifiedFeed.astro`: after "Load 10 more", new entries replace
`list.innerHTML` with no announcement, and focus stays on the button (acceptable), but
screen readers get nothing. Add `aria-live="polite"` + a visually-hidden status element
that the script updates ("10 more entries loaded"), or set `role="status"` on the
existing `[data-feed-end]` note. Small change inside the existing `render()` function.

## 3.7 Search link named "Search" but renders as icon-only (minor)

`SocialLinks.astro` renders the search icon link with `aria-label="Search"` — fine — but
it sits in an unlabeled group of social links. Wrap the container `<div>` in
`<nav aria-label="Social links and search">` or add `role="navigation"`; one-line change.

## Verification

```bash
npm run build && npm run preview
```

- Tab from the address bar: first focus is "Skip to content"; Enter jumps to main.
- `grep -c "<h1" dist/blog/index.html` → exactly 1.
- Dark mode (OS setting or DevTools emulation): GitHub/Threads icons visible.
- Hover any heading/nav link: no text movement.
- DevTools → Rendering → emulate `prefers-reduced-motion`: no smooth scroll, no long transitions.
- Run `npx @axe-core/cli http://localhost:4321/ http://localhost:4321/blog/` (or the
  Lighthouse a11y audit) and record the score in the PR; fix any new criticals it reports.
