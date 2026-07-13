# Typography Audit — July 2026

A static audit of fonts, sizes, weights, line heights, and letter spacing across the site, based on `src/styles/global.css`, `src/styles/progress-page.css`, and every scoped `<style>` block and inline style in `src/components` and `src/pages`.

**TL;DR:** The intended system (Inter for body, Fraunces for headings, a four-step fluid scale) is sound and mostly followed, but it has drifted. There are ~45 distinct hard-coded `font-size` values in component styles, at least seven different H1 treatments, three unrelated monospace stacks, and the site masthead renders in Georgia instead of Fraunces due to a stale override.

---

## 1. The intended system

Defined in `src/styles/global.css` and documented in [`docs/design/system.md`](system.md):

| Token | Value | Role |
| --- | --- | --- |
| `--font-sans` | Inter Variable → system-ui | Body copy (set on `body`) |
| `--font-serif` | Fraunces Variable → Georgia | All headings `h1–h6` |
| `--text-small` | `clamp(0.875rem, 2vw, 1rem)` | Meta, captions |
| `--text-normal` | `clamp(1rem, 2.5vw, 1.125rem)` | Body, `h4–h6` |
| `--text-large` | `clamp(1.25rem, 4vw, 1.5rem)` | `h2`, `h3` |
| `--text-huge` | `clamp(2rem, 8vw, 3rem)` | `h1` |

Fonts are self-hosted via `@fontsource-variable` (good: no render-blocking Google Fonts request), and Fraunces loads the `opsz` variant so optical sizing adapts between heading and text sizes.

**What's working well:**

- Fluid `clamp()`-based scale rather than breakpoint jumps — a solid foundation.
- Variable fonts with proper fallback stacks.
- The card/chip system (`.tag-chip`, `.card-chip`) is genuinely consistent where the shared classes are used: `0.7rem` / 600 / `0.08em` tracking / uppercase.
- `Card.astro` and `PostItem.astro` both consume the token scale (`var(--text-small)`, `var(--text-large)`) — this is the pattern the rest of the site should follow.

---

## 2. Findings

### 2.1 The masthead doesn't use the brand serif ⚠️ (highest-visibility issue)

The site name in the header has the Tailwind `font-serif` class, but `MultiLevelNavigation.astro` locally redefines that class:

```css
/* src/components/navigation/MultiLevelNavigation.astro:310-314 */
/* Guardian-style typography */
.font-serif {
    font-family: 'Georgia', 'Times New Roman', serif;
}
```

Astro scopes this rule with an attribute selector, so it out-specifies Tailwind's `font-serif` utility (which maps to Fraunces via `--font-serif`). Result: **the masthead — the single most visible piece of type on the site — renders in Georgia while every heading below it is Fraunces.** This looks like a leftover from before Fraunces was adopted. Deleting the local override makes the masthead pick up Fraunces automatically.

### 2.2 Seven-plus competing H1 / page-title treatments

| Location | Size | Weight |
| --- | --- | --- |
| Global `h1` (`global.css:157`) | `clamp(2rem, 8vw, 3rem)` | 600 |
| `.prose h1` (`global.css:218`) | `2.25rem` fixed | 700 |
| Post titles (`PostLayout.astro:259`) | `text-3xl md:text-4xl` (1.875/2.25rem) | 700 |
| Section titles (`PageToggleTitle.astro:53`, `ShelfTabNav.astro:31`, `books/index.astro:141`, `bookshelf/index.astro:542`) | `clamp(2rem, 5vw, 3rem)` | varies |
| Shelf year headings (film/tv/game/shelf indexes) | `clamp(2rem, 5vw, 3rem)` → `clamp(2.25rem, 4vw, 3.5rem)` at ≥64rem | 700 |
| Homepage/feed heading (`index.astro:132`, `UnifiedFeed.astro:65`) | `clamp(1.75rem, 5vw, 2.25rem)` | 700 |
| Progress card titles (`progress-page.css:137`) | `clamp(2.25rem, 3.5vw, 2.75rem)` | 700 |
| Games page (`games/index.astro:12`, inline `style=`) | `clamp(1.5rem, 5vw, 2rem)` | 700, `-0.02em` tracking |
| Book detail (`BookDetailLayout.astro:192`) | `clamp(2rem, 4vw, 2.75rem)` | — |
| TV show/season pages | `clamp(1.5rem, 4vw, 2.25rem)` | — |

Notable details:

- `--text-huge` (`8vw` midpoint) is defined as *the* H1 token but almost no page-level title actually uses it — pages re-declare near-identical clamps with `5vw`. The token and reality have diverged.
- Heading weight flips between 600 and 700 with no discernible rule (global h1/h2 are 600; prose h1, card titles, and most page titles are 700).
- The games page title is the only place on the site with negative letter spacing, and it's an inline `style` attribute.

### 2.3 Two parallel sizing systems (custom tokens vs. Tailwind utilities)

Both are in active use:

- Custom fluid utilities: `.text-small` ×29, `.text-normal` ×20, `.text-large` ×9, `.text-huge` ×3
- Tailwind fixed utilities: `text-sm` ×7, `text-xs` ×6, `text-xl` ×4, `text-4xl`/`text-3xl`/`text-2xl` ×3 each, `text-lg` ×2, `text-base` ×1

These overlap but disagree: `text-sm` is a fixed `0.875rem` while `.text-small` grows to `1rem` on desktop. Two elements that look identical on mobile diverge by ~14% at desktop widths. Same story for `text-base` vs `.text-normal`.

### 2.4 Hard-coded font sizes have proliferated

Component `<style>` blocks contain **~45 distinct `font-size` values**. The long tail of near-duplicates in the "small text" range alone:

```
0.6rem, 0.65rem (×9), 0.68rem (×2), 0.7rem (×19), 0.75rem (×20), 0.78rem,
0.8rem (×2), 0.8125rem (×3), 0.85rem (×5), 0.875rem (×25), 0.9rem (×2),
0.9375rem (×3), 0.95rem (×9)
```

That's 13 sizes doing the job of roughly three (chip/label, caption, small body). Most differences are almost certainly unintentional — e.g. chips are canonically `0.7rem` in `global.css` but appear as `0.65rem`, `0.68rem`, and `0.75rem` in individual components.

`LinkHoverEffect.astro:37-59` additionally uses fixed pixel sizes with `!important` (`14px`, `12px`), the only px-denominated type on the site — it won't respond to user font-size preferences.

### 2.5 Heading hierarchy is flat in places

In the global scale (`global.css:162-177`):

- `h2` and `h3` are the **same size** (`--text-large`), distinguished only by weight (600 vs 500) — a subtle cue that's easy to miss in Fraunces.
- `h4`, `h5`, `h6` are all `--text-normal` — i.e. **identical to body text size**, distinguished only by font family and weight 500.

Meanwhile `.prose` articles use a completely separate fixed-rem heading scale (h1 `2.25rem` / h2 `1.875rem` / h3 `1.5rem`, `global.css:218-231`), so the same `<h2>` is a different size depending on whether it sits inside a prose container. The prose scale also doesn't respond to viewport width, unlike everything else.

### 2.6 Three unrelated monospace stacks, no token

| Location | Stack |
| --- | --- |
| `global.css:361` (`.prose code`) | `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace` |
| `UnifiedFeed.astro:413` | `ui-monospace, SFMono-Regular, Menlo, monospace` |
| `LinkHoverEffect.astro:58` | `'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace !important` |

There is no `--font-mono` token; each usage reinvents the stack (and the third one skips `ui-monospace` entirely, so it can resolve differently from the other two on the same machine).

### 2.7 Letter-spacing and line-height variance

Uppercase label/chip tracking uses **eight** values: `0.02em, 0.03em, 0.04em, 0.05em, 0.06em, 0.07em, 0.08em, 0.1em, 0.12em`. The canonical chip is `0.08em`, but one-off labels scatter across the range (e.g. `UnifiedFeed.astro:107` uses `0.12em`, `progress-page.css:111` uses `0.04em`, `SectionLanding.astro:302` uses `0.05em`).

Body line-height is similarly split: base body is `1.6`, `.prose p` is `1.75`, progress page is `1.7`, various cards use `1.4`–`1.65`. Some variance here is legitimate (tight headings vs. loose prose), but three different "comfortable reading" values (1.6 / 1.7 / 1.75) is two too many.

### 2.8 Font-weight drift

Weights used: 400, 500, 600, 650 (once — `UnifiedFeed.astro:182`), 700, plus one `600 !important` and mixed Tailwind classes (`font-medium` ×22, `font-bold` ×13, `font-semibold` ×6). The lone 650 works only because Inter is a variable font, but it reads as an accident next to a site-wide 600.

### 2.9 Minor / housekeeping

- `.text-small/.text-normal/.text-large/.text-huge` are **defined twice** in `global.css` — once in `@layer base` (lines 179–193) and again in `@layer utilities` (lines 636–650). The base copies are dead weight.
- Shelf year headings hard-code text colors (`#111827` / `#f9fafb` in `filmshelf/tvshelf/gameshelf/shelf` indexes) instead of `rgb(var(--color-text-primary))`. Dark mode is handled, but via a parallel hex pair that will drift if the palette changes.
- `html` sets `font-family: system-ui` while `body` sets Inter (`global.css:122-128`). Harmless, but the `html` rule is redundant and can only ever show through as a mismatched flash.
- The games page (`src/pages/games/index.astro`) styles everything — including its `h1` — with inline `style` attributes, bypassing every token.

---

## 3. Recommendations (prioritized)

### Quick wins (low risk, high payoff)

1. **Fix the masthead font.** Delete the `.font-serif { font-family: 'Georgia', ... }` override in `MultiLevelNavigation.astro:310-314`; the existing Tailwind class then resolves to Fraunces. (If Georgia-in-the-masthead is intentional, document it in `docs/design/system.md` instead — right now it reads as a bug.)
2. **Add a `--font-mono` token** to the `@theme` block and point all three mono usages at it.
3. **Delete the duplicate `.text-*` definitions** from `@layer base` in `global.css`.
4. **Replace the px `!important` sizes** in `LinkHoverEffect.astro` with rem equivalents (`0.875rem` / `0.75rem`).
5. **Normalize the lone `font-weight: 650`** to 600 or 700.

### Structural improvements

6. **Extend the token scale and kill the near-duplicates.** The current 4-step scale is too coarse, which is *why* components invent sizes. A pragmatic 7-step scale covers observed usage:

   | Token | Suggested value | Replaces |
   | --- | --- | --- |
   | `--text-xs` | `0.75rem` | 0.6–0.78rem cluster (chips, labels) |
   | `--text-small` | keep | 0.8–0.95rem cluster |
   | `--text-normal` | keep | 1rem–1.125rem |
   | `--text-medium` | `clamp(1.125rem, 2.5vw, 1.25rem)` | new — gives `h3` its own size |
   | `--text-large` | keep | h2, card titles |
   | `--text-xl` | `clamp(1.75rem, 4vw, 2.25rem)` | feed/show titles |
   | `--text-huge` | `clamp(2rem, 5vw, 3rem)` | all page titles (note: change `8vw` → `5vw` to match what pages actually use) |

7. **Pick one page-title treatment** (size token + weight 600 *or* 700, one rule) and apply it to section landings, shelf pages, the homepage, games, and progress. The shelf pages' larger `≥64rem` bump can become part of the token if it's wanted everywhere.
8. **Reconcile the `.prose` heading scale** with the global scale — express prose headings in the same tokens so an `<h2>` is one size everywhere, and prose headings become fluid.
9. **Choose one small-text system**: either the fluid custom utilities or Tailwind's fixed ones. Given the fluid scale is the site's signature, the simplest path is remapping Tailwind's `text-sm`/`text-base`/`text-lg` theme values to the fluid tokens in the `@theme` block, so both spellings resolve identically.
10. **Standardize uppercase-label tracking** on two values (e.g. `0.08em` for chip-size text, `0.04em` for slightly larger labels) and sweep the outliers.
11. **Differentiate `h4`–`h6`** from body text (at minimum bump `h4` to weight 600) or stop using them where they can't be distinguished.
12. **Move the games page to classes/tokens** — it's currently a token-free island of inline styles.

### Process

13. Update `docs/design/system.md` after any of the above so the documented scale matches reality, and add a line to `AGENTS.md` ("use `--text-*` tokens; never hard-code `font-size` in component styles") so future generated code doesn't reintroduce drift.

---

## 4. Method

Audited via grep sweeps over `src/**/*.astro` and `src/styles/*.css` for `font-family`, `font-size`, `font-weight`, `line-height`, `letter-spacing`, `text-transform`, and Tailwind `text-*`/`font-*` utility classes, followed by manual inspection of `global.css`, `progress-page.css`, `Layout.astro`, `MultiLevelNavigation.astro`, `UnifiedFeed.astro`, `Card.astro`, `PostItem.astro`, `PostLayout.astro`, `SectionLanding.astro`, and the shelf/books/games page templates. No runtime rendering was involved; findings are based on source order, Astro style scoping, and Tailwind v4 layer semantics.
