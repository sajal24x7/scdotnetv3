# Component Diagram

Two Mermaid diagrams that map how content and code move through this
project: how a post gets from a note to production, and how the pieces at
runtime talk to each other. Pair these with the prose in
[Architecture Overview](overview.md) and [Content Lifecycle](content-lifecycle.md).

## 1. Publishing & deploy pipeline

How a note (or a code change) travels from its source to production, and
what happens on a schedule afterward.

```mermaid
flowchart LR
    Obsidian["Obsidian<br/>(GitSync, mobile/desktop)"]
    Write["/write composer"]

    Obsidian -- "git push" --> ContentBranch(("content branch"))
    ContentBranch --> Publish["content-publish.yml<br/>normalize → sort inbox →<br/>reconcile shelf queue →<br/>validate → merge"]
    Publish -- "merge" --> MainBranch(("main branch"))
    Publish -- "fast-forward" --> ContentBranch
    MainBranch --> SyncBranch["sync-content-branch.yml"]
    SyncBranch -- "merge" --> ContentBranch

    Write -- "commit via Pages Function" --> MainBranch

    PR["Pull request"] -.->|"gated by"| CI["ci.yml (astro check)"]
    CI -.-> MainBranch

    MainBranch --> Trigger(["Cloudflare build trigger"])
    Trigger --> BuildStep["npm run build:cloudflare<br/>(see diagram 2)"]
    BuildStep --> Prod[("Production:<br/>dist/ + Pages Functions")]

    Prod --> Syndicate["syndicate-content.yml<br/>(scheduled, every 3h)"]
    Syndicate -- "writes syndicationUrls<br/>[CI Skip]" --> MainBranch
    Syndicate --> Social["Mastodon · Bluesky ·<br/>Threads · Instagram"]

    Maintenance["Scheduled maintenance:<br/>download-covers · enrich-shelf-metadata ·<br/>fetch-wotd · refresh-threads/instagram-token"]
    Maintenance -- "commits" --> MainBranch
    Maintenance --> MetaAPIs["TMDB · RAWG/IGDB ·<br/>Open Library · Google Books"]
```

Notes:

- `content-publish.yml` is the only path from `content` into `main`; a
  missing/unknown `category` fails the run and opens an issue instead of
  reaching production. See [Publishing Pipeline](../content/publishing-pipeline.md).
- The `/write` composer bypasses `content` entirely — it commits
  schema-valid files straight to `main` through a Pages Function for
  instant publishing.
- Syndication is decoupled from the build: it runs on a 3-hour schedule,
  not per push, and its bookkeeping commit is tagged `[CI Skip]` so it
  never triggers a second Cloudflare build.

## 2. Runtime component architecture

What actually renders a page and serves a request once code reaches
Cloudflare — from content collections at build time, to islands and
Pages Functions at request time.

```mermaid
flowchart TD
    subgraph BUILD["Build time — astro build"]
        direction TB
        ContentConfig["src/content.config.ts<br/>(Zod schema, 14 collections)"]
        Utils["src/utils/content.ts<br/>getAllPosts / getPostsByCategory"]
        PagesSrc["src/pages"]
        LayoutsComponents["src/layouts + src/components"]
        ContentConfig --> Utils --> PagesSrc --> LayoutsComponents
    end

    LayoutsComponents --> Dist["dist/<br/>static HTML + JSON endpoints"]
    Dist --> Pagefind["pagefind --site dist"]
    Pagefind --> SearchIndex[("dist/pagefind/<br/>search index")]

    subgraph CF["Cloudflare Pages (production)"]
        Dist
        SearchIndex
        Functions["Pages Functions — functions/api/*<br/>upload · til/sync · practice-state ·<br/>practice-prompts · mirror-avatar ·<br/>webmention · auth-check"]
    end

    CDN(("Cloudflare global CDN"))
    Dist --> CDN

    subgraph BROWSER["Browser"]
        Islands["Astro islands<br/>navigation · tag-list ·<br/>relative-time · link-hover-preview"]
        SearchPage["/search"]
        WriteUI["/write"]
        AuthUI["/auth sign-in"]
    end

    CDN --> Islands
    CDN --> SearchPage
    CDN --> WriteUI
    CDN --> AuthUI
    SearchPage --> SearchIndex

    WriteUI --> Functions
    AuthUI --> Functions

    Functions --> R2[("R2 bucket: IMAGES")]
    Functions --> KV[("KV: PRACTICE_STATE")]
    Functions --> GitHubAPI["api.github.com<br/>(commits, token auth)"]
    Functions --> WebmentionIO["Webmention senders/receivers"]

    Dist -- "RSS/Atom" --> Readers["Feed readers"]
```

Notes:

- Everything dynamic — image uploads, TIL sync, spaced-repetition state,
  avatar mirroring, incoming webmentions, and the GitHub-token auth check —
  runs as a Cloudflare Pages Function, not client-side JavaScript.
- Client islands are opt-in per page (passed as flags to `Layout.astro`),
  so most routes ship no extra JS beyond the shared shell.
- Search never touches `getAllPosts()` at request time: Pagefind indexes
  the already-built HTML, and `/search` lazy-loads that static index.

## Related guides

- [Architecture Overview](overview.md)
- [Content Lifecycle](content-lifecycle.md)
- [Publishing Pipeline](../content/publishing-pipeline.md)
- [Deployment](../operations/deployment.md)
- [Syndication](../operations/syndication.md)
