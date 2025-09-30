# GardenGrid Internal Abstraction Assessment

## Summary
- GardenGrid currently couples data preparation, twelve-column span mapping, and accent styling for garden-style listings.
- Extracting a lower-level CardGrid would shift span and accent logic elsewhere but introduce new configuration complexity.
- Recommendation: keep GardenGrid as the integration layer and, if future routes need the same grid treatment, extract small pure helpers instead of a rendered CardGrid component.

## Current Responsibilities
GardenGrid is more than a simple wrapper around Card components:
- Pre-renders any markdown body to HTML so cards can expose excerpts without client parsing.【F:src/components/layout/GardenGrid.astro†L12-L31】
- Maps per-post layout metadata to twelve-column span utility classes, defaulting to three-column cards but allowing six- and twelve-column features.【F:src/components/layout/GardenGrid.astro†L33-L48】
- Derives accent color tokens based on either the grid content type or the individual post category, ensuring mixed-category grids still theme correctly.【F:src/components/layout/GardenGrid.astro†L18-L32】【F:src/components/layout/GardenGrid.astro†L51-L87】
- Normalizes card wrappers so each Card fills the available height and inherits the accent hover states from the wrapper rather than duplicating styles per card.【F:src/components/layout/GardenGrid.astro†L89-L121】

## CardGrid Extraction Considerations
A shared CardGrid component would need to accept multiple concerns that are currently internal to GardenGrid:
- **Span calculation**: CardGrid would require span metadata for each item and a fallback value, but GardenGrid would still need to inspect `post.data.layout.span` to provide that information, so the span logic cannot be fully removed from GardenGrid.【F:src/components/layout/GardenGrid.astro†L33-L48】
- **Accent styling**: The accent tokens differ per content family. A shared component would need either dynamic CSS variables or class hooks supplied by each consumer, reintroducing the conditional logic GardenGrid already owns.【F:src/components/layout/GardenGrid.astro†L18-L32】【F:src/components/layout/GardenGrid.astro†L51-L118】
- **Markdown rendering**: StreamLayout uses a similar pre-render step for PostItem components, but not every grid consumer needs markdown excerpts. Making CardGrid responsible for rendering markdown would make it opinionated, while omitting that behavior would push the work back into GardenGrid.【F:src/components/layout/GardenGrid.astro†L12-L31】【F:src/components/layout/StreamLayout.astro†L1-L34】
- **Card bindings**: GardenGrid currently spreads the frontmatter data directly into Card alongside tag metadata. A generalized CardGrid would need to be parameterized with a render prop or slot to prevent hard-coding Card usage, adding indirection for the only existing consumer.【F:src/components/layout/GardenGrid.astro†L49-L70】

## Recommendation
Because GardenGrid is the only component that combines these responsibilities today, extracting a shared CardGrid would add configuration surface area without deleting meaningful logic. Instead, we can:
- Keep GardenGrid as the rendering layer for garden-style listings.
- Consider extracting lightweight pure helpers (e.g., `getCardSpanClass(post)` or `getCardAccentClass(post, contentType)`) if other components need the same calculations in the future.
- Revisit a rendered CardGrid component only when another layout needs identical span + accent plumbing and can share the same markup contract.

This maintains the clarity of GardenGrid while documenting the path for smaller, targeted abstractions if duplication appears.
