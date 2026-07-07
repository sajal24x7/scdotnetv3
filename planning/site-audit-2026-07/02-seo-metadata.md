# 02 — SEO & metadata overhaul (P1)

All changes concentrate in `src/layouts/Layout.astro` (the single `<head>` for every page
except `games/cards-29`, which has its own). Current head state (verified in built HTML):

- `<title>` is whatever each page passes — some pages pass `"Blog"`, others
  `"Search - Sajal Choudhary"`; no consistent pattern.
- No `<link rel="canonical">`.
- OG tags: only `og:title`, `og:description`, `og:type=website` (even for articles),
  `og:url`. No `og:image`, no `og:site_name`, no Twitter card tags, no
  `article:published_time`.
- No RSS autodiscovery `<link rel="alternate" type="application/rss+xml">`.
- Description falls back to the generic "A personal digital garden and blog".
- Favicon is SVG-only (`/logo/logo-square-v2.svg`); no PNG fallback or apple-touch-icon.
- `/navigation-demo/` (an internal test page) is in the public sitemap.

## 2.1 Extend Layout props and normalize the head

In `src/layouts/Layout.astro`:

1. Add optional props to the `Props` interface:

```ts
interface Props {
    title: string;
    description?: string;
    currentPage: string;
    /** OpenGraph type; pass 'article' from PostLayout routes */
    ogType?: 'website' | 'article';
    /** Absolute or root-relative URL to a share image */
    ogImage?: string;
    /** ISO date for article:published_time (post pages) */
    publishedTime?: Date;
    /** Set false on pages that should not be indexed */
    index?: boolean;
    // ...existing props unchanged
}
```

2. Compute canonical + title in frontmatter:

```ts
const SITE_NAME = 'Sajal Choudhary';
const {
    title, description, ogType = 'website', ogImage, publishedTime, index = true,
} = Astro.props as Props;

// "Sajal Choudhary" stays bare on the homepage; every other page gets the suffix once.
const fullTitle = title === SITE_NAME || title.endsWith(`- ${SITE_NAME}`)
    ? title.replace(/ - Sajal Choudhary$/, ` — ${SITE_NAME}`) // normalize existing " - " suffixes
    : `${title} — ${SITE_NAME}`;

const canonicalUrl = new URL(Astro.url.pathname, Astro.site).href;
const metaDescription = description || 'Sajal Choudhary — platform engineer and writer in Finland. Digital garden, blog, newsletter, and bookshelf.';
const shareImage = new URL(ogImage ?? '/logo/logo-square-v2.svg', Astro.site).href;
```

*(Simpler alternative accepted: keep pages' titles as-is and just append the suffix when
`title !== SITE_NAME`. Then remove the manual `" - Sajal Choudhary"` suffixes from the
pages that currently add one: `search.astro`, `now.astro`, `colophon.astro`,
`feeds.astro`, `404.astro`, etc. — grep for `- Sajal Choudhary"` under `src/pages/`.)*

3. Replace/extend the head block:

```html
<title>{fullTitle}</title>
<meta name="description" content={metaDescription} />
<link rel="canonical" href={canonicalUrl} />
{!index && <meta name="robots" content="noindex, follow" />}

<meta property="og:site_name" content={SITE_NAME} />
<meta property="og:title" content={fullTitle} />
<meta property="og:description" content={metaDescription} />
<meta property="og:type" content={ogType} />
<meta property="og:url" content={canonicalUrl} />
<meta property="og:image" content={shareImage} />
{publishedTime && <meta property="article:published_time" content={publishedTime.toISOString()} />}

<meta name="twitter:card" content={ogImage ? 'summary_large_image' : 'summary'} />
<meta name="twitter:title" content={fullTitle} />
<meta name="twitter:description" content={metaDescription} />
<meta name="twitter:image" content={shareImage} />

<link rel="alternate" type="application/rss+xml" title="Sajal Choudhary — everything" href="/rss.xml" />
<link rel="alternate" type="application/rss+xml" title="Nordletter" href="/nordletter/rss.xml" />
```

Keep the existing icon link and add fallbacks (see 2.3).

## 2.2 Pass article metadata from post routes

In `src/pages/[...slug].astro`, forward post data to Layout:

```astro
<Layout
  title={`${entry.data?.title ?? ''} - ${category.charAt(0).toUpperCase() + category.slice(1)}`}
  description={entry.data?.description}
  ogType="article"
  ogImage={'image' in entry.data && entry.data.image ? entry.data.image : undefined}
  publishedTime={entry.data?.created}
  ...
>
```

Frontmatter `image` values may already be absolute URLs or `/public` paths — the
`new URL(ogImage, Astro.site)` in Layout handles both.

## 2.3 Favicon fallbacks

`public/logo/` currently contains only SVGs. Generate PNG fallbacks from
`logo-square-v2.svg` (any tool; e.g. `npx sharp-cli` or `rsvg-convert`) at 32×32,
192×192, and 180×180, saved as `public/logo/favicon-32.png`,
`public/logo/icon-192.png`, `public/logo/apple-touch-icon.png`. Then in the head:

```html
<link rel="icon" type="image/svg+xml" href="/logo/logo-square-v2.svg" />
<link rel="icon" type="image/png" sizes="32x32" href="/logo/favicon-32.png" />
<link rel="apple-touch-icon" href="/logo/apple-touch-icon.png" />
```

## 2.4 Sitemap hygiene

In `astro.config.mjs`, exclude non-content pages from the sitemap (brief 05 deletes
`/navigation-demo/` entirely; the filter still protects future test pages):

```js
sitemap({
  filter: (page) =>
    !page.includes('/navigation-demo/') &&
    !page.includes('/search/'),
}),
```

Rationale: `/search/` is a client-side tool page with no indexable content. Do NOT filter
tag pages here yet — brief 04 §4.4 decides their fate.

## 2.5 (Optional) JSON-LD

Low priority. If added, emit on post pages only, from `PostLayout` via a
`<slot name="head">` script: `BlogPosting` with `headline`, `datePublished`,
`dateModified`, `author` (Person, `https://sajalchoudhary.net`), `image`. Skip if time is
constrained — OG/Twitter tags deliver most of the practical value.

## Verification

```bash
npm run build
# 1. Canonicals present and self-referential:
grep -o '<link rel="canonical"[^>]*>' dist/blog/index.html
grep -o '<link rel="canonical"[^>]*>' dist/index.html
# 2. Titles suffixed exactly once:
grep -o '<title>[^<]*</title>' dist/blog/index.html      # "Blog — Sajal Choudhary"
grep -o '<title>[^<]*</title>' dist/search/index.html    # no double suffix
# 3. Articles are og:type=article with published_time (pick any post):
grep -o 'og:type[^>]*' dist/blog/*/index.html | head -2
# 4. RSS autodiscovery present:
grep -c 'application/rss+xml' dist/index.html            # >= 2
# 5. navigation-demo/search absent from sitemap:
grep -c 'navigation-demo' dist/sitemap-0.xml             # 0
```

Also paste a post URL into a social-card debugger (opengraph.xyz or similar) after deploy.
