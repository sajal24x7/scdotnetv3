# Stream Sidebar Opportunity Assessment

## Overview
StreamLayout (`src/components/layout/StreamLayout.astro`) renders a two-column grid with a sticky sidebar slot that is currently unused by the stream-like routes (`/stream/`, `/blog/`, `/micro/`, `/photos/`). Each route already loads rich metadata (post categories, tags, and chronological groupings) that could power contextual widgets without additional network requests. This note captures candidate sidebar modules, required data dependencies, and a sequencing plan for incremental delivery.

## Existing Inputs
- **SectionLanding context** – Pages already compute post counts, tag collections, and date ranges to populate their `SectionLanding` headers. The same data can be passed into the sidebar slot as props without new loaders.
- **Content utilities** – Helpers in `src/utils/content.ts` provide category filters (`getPostsByCategory`), chronological buckets, and metadata transforms that normalize posts for list views.
- **Markdown rendering** – StreamLayout pre-parses post bodies into HTML for `PostItem`. Sidebar cards that reuse excerpts or microcopy can share the same `parseMarkdown` helper to avoid duplicating logic.

## Opportunity Modules
1. **Quick Filters**
   - Render a toggle group that filters the stream between long-form (`blog`) and shorter updates (`micro`).
   - Implementation: Create a client island (`StreamFilter.client.tsx`) that accepts the transformed posts array and emits filter events. The island can reuse the existing `PostItem` list by conditionally filtering posts before render or by toggling CSS classes.
   - Data needs: `posts` already contain `category` metadata; no additional fetches required.

2. **Featured or Pinned Post**
   - Surface a single curated post (e.g., most recent evergreen article) with prominent styling to direct attention.
   - Implementation: Expose an optional `featuredPost` prop on the page frontmatter. Pass the resolved post into the sidebar slot as a `FeaturedPostCard` component that reuses the shared `Card` styles.
   - Data needs: Hook into the existing `getAllPosts()` results to locate the slug defined in frontmatter.

3. **Surfacing Active Tags**
   - Display the top 6–8 tags represented in the current view with counts to encourage deeper exploration.
   - Implementation: Build a `StreamTagList` component that wraps `TagList` but scopes the input to the posts already loaded. Provide a “View all tags” link pointing back to the route’s SectionLanding tag picker.
   - Data needs: Aggregated tag counts derived from the `transformedPosts` array.

4. **Newsletter Call-to-Action**
   - Highlight the Nordletter signup or other subscription CTA inside the sticky sidebar.
   - Implementation: Reuse the existing `NordletterSignup` component (currently embedded in footer) but adjust spacing to fit the sidebar column.
   - Data needs: Static copy; no dynamic content required.

5. **Cross-Collection Highlights**
   - Introduce related content blocks such as the latest garden note or bookshelf entry to encourage cross-navigation.
   - Implementation: Extend the page-level loaders to request a small subset of posts from neighboring collections (e.g., `getPostsByCategory('garden')`). Provide a shared `SidebarHighlight` component to render them.
   - Data needs: Additional calls to `getPostsByCategory` with tight limits to keep build-time cost low.

## Rollout Plan
1. Ship the analytics-friendly modules first (Quick Filters, Active Tags) because they rely entirely on existing data and demonstrate immediate user value.
2. Layer in editorial widgets (Featured Post, Cross-Collection Highlights) once CMS/frontmatter hooks are available to define highlights without code edits.
3. Close with evergreen CTAs to round out the column and ensure the sidebar remains populated even when highlight content is sparse.

## Next Steps
- Prototype the Quick Filters island to validate performance and UX.
- Define a shared sidebar props contract so each StreamLayout consumer can opt-in without duplicating markup.
- Revisit the task list after the first module ships to prioritize subsequent enhancements.
