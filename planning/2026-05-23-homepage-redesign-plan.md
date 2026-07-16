# Homepage Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Simplify the homepage to a book-led handshake + one light-editorial Featured section, removing the Stream and Garden content sections that belong on their own pages.

**Architecture:** Two files change — `FeaturedGrid.astro` gets a full rewrite (new card markup + CSS, no longer wrapping `Card.astro`), and `index.astro` has three removals (stream section, garden section, their data fetching) and one addition (Content Paths section). Each task is independent and committable on its own.

**Tech Stack:** Astro 4, Tailwind CSS (utility classes used sparingly; most styling is scoped `<style>` blocks), TypeScript frontmatter. Dev server: `npm run dev` → `http://localhost:4321`.

---

## File Map

| File | Change |
|---|---|
| `src/components/layout/FeaturedGrid.astro` | Full rewrite — new light editorial card design |
| `src/pages/index.astro` | Remove stream/garden data + HTML + CSS; add Content Paths section |

---

## Task 1: Rewrite FeaturedGrid.astro with light editorial cards

**Files:**
- Modify: `src/components/layout/FeaturedGrid.astro`

The current component wraps `Card.astro` and `BookshelfCard.astro` inside dark image-overlay wrappers. The new version renders its own simpler card structure: a colour-coded gradient band at top, then a type label and title below. No markdown rendering needed (body content is hidden in the new design).

- [ ] **Step 1: Replace the full contents of `FeaturedGrid.astro`**

Open `src/components/layout/FeaturedGrid.astro` and replace everything with:

```astro
---
interface Props {
  posts: any[];
}

const { posts } = Astro.props;

const getBandClass = (category?: string) => {
  switch (category) {
    case 'evergreen': return 'evergreen-card';
    case 'til':       return 'til-card';
    case 'bookshelf': return 'bookshelf-card';
    case 'story':     return 'stories-card';
    case 'poem':      return 'poems-card';
    default:          return 'default-card';
  }
};
---

<div class="featured-grid grid-span-full" data-featured-grid>
  {posts.map((post) => (
    <a
      href={post.data.link}
      class={`featured-card ${getBandClass(post.data.category)}`}
    >
      <div class="featured-card__band"></div>
      <div class="featured-card__body">
        <span class="featured-card__type">{post.data.category}</span>
        <span class="featured-card__title">{post.data.title}</span>
      </div>
    </a>
  ))}
</div>

<style>
  /* ── Grid ──────────────────────────────────────────────── */
  [data-featured-grid] {
    display: grid;
    grid-template-columns: repeat(1, 1fr);
    gap: clamp(0.75rem, 2vw, 1rem);
  }

  @media (min-width: 48rem) {
    [data-featured-grid] {
      grid-template-columns: repeat(4, 1fr);
    }
  }

  /* ── Card shell ────────────────────────────────────────── */
  .featured-card {
    display: flex;
    flex-direction: column;
    border: 1px solid rgb(var(--color-border));
    border-radius: 0.75rem;
    overflow: hidden;
    background: rgb(255, 255, 255);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
    text-decoration: none;
    transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
  }

  :global(.dark) .featured-card {
    background: rgb(var(--color-bg-secondary));
  }

  .featured-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
    border-color: var(--band-accent);
  }

  /* ── Colour band ───────────────────────────────────────── */
  .featured-card__band {
    height: 3rem;
    background: var(--band-gradient);
  }

  :global(.dark) .featured-card__band {
    opacity: 0.65;
  }

  /* ── Body ──────────────────────────────────────────────── */
  .featured-card__body {
    padding: 0.65rem 0.75rem 0.8rem;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .featured-card__type {
    font-size: 0.625rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.09em;
    color: rgb(var(--color-text-secondary));
  }

  .featured-card__title {
    font-size: 0.875rem;
    font-weight: 600;
    line-height: 1.35;
    color: rgb(var(--color-text-primary));
  }

  /* ── Per-type colours ──────────────────────────────────── */
  .poems-card {
    --band-gradient: linear-gradient(135deg, #fce7f3, #fbcfe8);
    --band-accent: #ec4899;
  }

  .evergreen-card {
    --band-gradient: linear-gradient(135deg, #d1fae5, #a7f3d0);
    --band-accent: #10b981;
  }

  .til-card {
    --band-gradient: linear-gradient(135deg, #e0f2fe, #bae6fd);
    --band-accent: #3b82f6;
  }

  .stories-card {
    --band-gradient: linear-gradient(135deg, #ede9fe, #ddd6fe);
    --band-accent: #8b5cf6;
  }

  .bookshelf-card {
    --band-gradient: linear-gradient(135deg, #fef3c7, #fde68a);
    --band-accent: #f59e0b;
  }

  .default-card {
    --band-gradient: linear-gradient(135deg, #f1f5f9, #e2e8f0);
    --band-accent: #6366f1;
  }
</style>
```

- [ ] **Step 2: Start the dev server and verify the Featured section**

```bash
npm run dev
```

Open `http://localhost:4321` in a browser. Verify:
- The Featured section shows 4 cards in a 4-column grid (desktop) / 1 column (mobile)
- Each card has a soft gradient band at the top, coloured by type
- Below the band: type label (small, uppercase) and post title
- Hovering a card lifts it slightly and shows a coloured border
- Dark mode: cards remain visible and the gradient bands are slightly muted

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/FeaturedGrid.astro
git commit -m "redesign: replace dark overlay featured cards with light editorial style"
```

---

## Task 2: Remove stream/garden sections and add Content Paths

**Files:**
- Modify: `src/pages/index.astro`

Three removals and one addition. Work top-to-bottom through the file.

### Step 2a — Remove stream and garden imports and data fetching

- [ ] **Step 1: Remove the StreamList and GardenGrid imports**

In the frontmatter of `src/pages/index.astro`, find and remove these two lines:

```ts
import StreamList from '../components/layout/StreamList.astro';
import GardenGrid from '../components/layout/GardenGrid.astro';
```

- [ ] **Step 2: Remove stream and garden data fetching**

Find and remove the following four lines (the stream and garden data fetching blocks):

```ts
// Build a list of the most recent stream posts across the unified categories
const streamPostsRaw = getPostsByCategory(allPosts, 'stream', { limit: 5 });
const streamPosts = streamPostsRaw.map(transformPost);

// Curate the latest garden notes, stories, til entries, and more
const gardenPostsRaw = getPostsByCategory(allPosts, 'garden', { limit: 9 });
const gardenPosts = gardenPostsRaw.map(transformPost);
```

Also remove `getPostsByCategory` from the import if it is no longer used elsewhere in the file. The import line currently reads:

```ts
import { getAllPosts, getPostsByCategory, transformPost } from '../utils/content';
```

After removing the stream and garden fetching, check whether `getPostsByCategory` is still called anywhere in the frontmatter. If not, update the import to:

```ts
import { getAllPosts, transformPost } from '../utils/content';
```

### Step 2b — Remove Stream section HTML

- [ ] **Step 3: Remove the Stream section**

Find and delete the entire Stream section block:

```astro
    <section class="home-section home-section--stream">
        <div class="home-stream grid-span-8 grid-start-3">
            <div class="home-stream__inner">
                <h2 class="home-stream__title">Stream</h2>
                <StreamList posts={streamPosts} />
                <a href="/stream/" class="home-stream__cta">Dip into the stream</a>
            </div>
        </div>
    </section>
```

### Step 2c — Remove Garden section HTML

- [ ] **Step 4: Remove the Garden section**

Find and delete the entire Garden section block:

```astro
    <section class="home-section home-section--garden">
        <div class="home-garden__heading grid-span-full">
            <h2 class="home-garden__title">Garden</h2>
        </div>
        <div class="home-garden__grid grid-span-full" data-garden-grid>
            <GardenGrid posts={gardenPosts} />
        </div>
        <div class="home-garden__footer grid-span-full">
            <a href="/garden/" class="home-garden__cta">Roam through the garden</a>
        </div>
    </section>
```

### Step 2d — Add Content Paths section

- [ ] **Step 5: Add the Content Paths section**

In `src/pages/index.astro`, find the Featured section opener:

```astro
    <!-- Writing Section -->
    <section class="home-section home-section--featured">
```

Insert the following block immediately before it:

```astro
    <!-- Content Paths Section -->
    <section class="home-section home-section--paths">
        <nav class="home-paths grid-span-full" aria-label="Content sections">
            <a href="/garden/" class="home-path">
                <span class="home-path__icon" aria-hidden="true">🌱</span>
                <span class="home-path__label">Garden</span>
            </a>
            <a href="/stream/" class="home-path">
                <span class="home-path__icon" aria-hidden="true">🌊</span>
                <span class="home-path__label">Stream</span>
            </a>
            <a href="/shelf/" class="home-path">
                <span class="home-path__icon" aria-hidden="true">📚</span>
                <span class="home-path__label">Shelf</span>
            </a>
            <a href="/nordletter/" class="home-path">
                <span class="home-path__icon" aria-hidden="true">📬</span>
                <span class="home-path__label">Nordletter</span>
            </a>
        </nav>
    </section>
```

### Step 2e — Remove stream and garden CSS, add Content Paths CSS

- [ ] **Step 6: Remove stream and garden CSS rules**

In the `<style>` block of `src/pages/index.astro`, find and delete the following blocks (they may appear in any order):

```css
    .home-section--featured,
    .home-section--stream,
    .home-section--garden {
        display: contents;
    }
```

Replace with:

```css
    .home-section--featured,
    .home-section--paths {
        display: contents;
    }
```

Then find and delete all of the following CSS rules entirely:

```css
    .home-stream {
        display: flex;
        padding-block: clamp(2rem, 5vw, 3.5rem);
    }

    .home-garden__title {
        font-size: clamp(1.75rem, 5vw, 2.25rem);
        font-weight: 700;
        margin: 0;
        color: rgb(var(--color-text-primary));
        text-align: center;
    }

    .home-garden__heading {
        margin-top: clamp(2rem, 5vw, 3.5rem);
        margin-bottom: clamp(1.5rem, 3vw, 2rem);
    }

    .home-garden__grid {
        margin-bottom: clamp(1.75rem, 4vw, 2.5rem);
    }

    .home-garden__footer {
        display: flex;
    }

    .home-garden__cta,
    .home-stream__cta {
        display: inline-flex;
        align-items: center;
        gap: 0.45rem;
        font-weight: 600;
        font-size: 0.95rem;
        color: rgb(var(--color-text-primary));
        text-decoration: none;
        border-bottom: 1px solid rgba(var(--color-text-primary), 0.2);
        padding-bottom: 0.15rem;
        transition: color 0.2s ease, border-color 0.2s ease;
    }

    .home-garden__cta:hover,
    .home-garden__cta:focus-visible,
    .home-stream__cta:hover,
    .home-stream__cta:focus-visible {
        color: rgb(var(--color-text-primary));
        border-bottom-color: rgba(var(--color-text-primary), 0.45);
    }

    .home-garden__cta:focus-visible,
    .home-stream__cta:focus-visible {
        outline: 2px solid rgb(var(--color-accent));
        outline-offset: 2px;
    }

    .home-garden__cta::after,
    .home-stream__cta::after {
        content: '→';
        font-size: 0.95em;
        transition: transform 0.2s ease;
    }

    .home-garden__cta:hover::after,
    .home-garden__cta:focus-visible::after,
    .home-stream__cta:hover::after,
    .home-stream__cta:focus-visible::after {
        transform: translateX(0.2rem);
    }

    .home-stream__inner {
        display: flex;
        flex-direction: column;
        gap: clamp(1.25rem, 3vw, 1.75rem);
    }

    .home-stream__title {
        font-size: clamp(1.75rem, 5vw, 2.25rem);
        font-weight: 700;
        margin: 0;
        color: rgb(var(--color-text-primary));
        text-align: center;
    }
```

Also remove the stream/garden responsive rules inside `@media (min-width: 48rem)` and `@media (max-width: 47.99rem)`:

In `@media (min-width: 48rem)`, remove:
```css
        .home-stream {
            padding-block: clamp(2.5rem, 5vw, 4rem);
        }
```

In `@media (max-width: 47.99rem)`, remove:
```css
        .home-stream__title,
        .home-garden__title {
            text-align: center;
        }

        .home-stream__cta,
        .home-garden__cta {
            justify-content: center;
            align-self: center;
        }

        .home-garden__footer {
            justify-content: center;
        }
```

- [ ] **Step 7: Add Content Paths CSS**

Add the following CSS rules to the `<style>` block in `src/pages/index.astro` (place them after the `.home-featured__heading` block):

```css
    .home-paths {
        padding-block: clamp(1.5rem, 4vw, 2.5rem);
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: clamp(0.75rem, 2vw, 1rem);
    }

    @media (min-width: 48rem) {
        .home-paths {
            grid-template-columns: repeat(4, 1fr);
        }
    }

    .home-path {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.4rem;
        padding: 0.85rem 0.5rem;
        border: 1px solid rgb(var(--color-border));
        border-radius: 0.75rem;
        background-color: rgb(var(--color-bg-secondary));
        text-decoration: none;
        transition: border-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
    }

    .home-path:hover {
        border-color: rgb(var(--color-accent));
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(var(--color-accent), 0.15);
    }

    .home-path:focus-visible {
        outline: 2px solid rgb(var(--color-accent));
        outline-offset: 2px;
    }

    .home-path__icon {
        font-size: 1.5rem;
        line-height: 1;
    }

    .home-path__label {
        font-size: 0.7rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: rgb(var(--color-text-secondary));
    }
```

### Step 2f — Verify and commit

- [ ] **Step 8: Verify in the browser**

The dev server should still be running at `http://localhost:4321`. Hard-refresh the homepage and verify:

- Stream section is gone — no "Stream" heading, no recent posts list
- Garden section is gone — no "Garden" heading, no card grid
- Content Paths section appears between Identity/Newsletter and Featured: four equal cards (Garden, Stream, Shelf, Nordletter), 2-column on mobile, 4-column on desktop
- Hovering a path card lifts it and shows the accent-coloured border
- Featured section still shows 4 light editorial cards (from Task 1)
- No console errors

Also verify in dark mode (set `prefers-color-scheme: dark` in DevTools → Rendering):
- Content Paths cards are visible against the dark background
- Featured gradient bands are visible but slightly muted

- [ ] **Step 9: Commit**

```bash
git add src/pages/index.astro
git commit -m "redesign: homepage handshake layout — remove stream/garden, add content paths"
```
