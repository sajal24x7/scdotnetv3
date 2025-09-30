## Overview

The reusable layout system now centers on a small set of primitives that balance spacing control with predictable markup. This
refresh documents the current architecture so new surfaces stay aligned with the shared design language.

- **Last audited:** 2025-10-07
- **Primary contacts:** Layout maintainers (`src/layouts/`, `src/components/layout/` owners)

## Core Primitives

### LayoutContainer (`src/components/layout/LayoutContainer.astro`)
- Governs max-width, padding, and optional prose styling.
- Accepts `paddingScale` to switch between page-scale and container-scale spacing tokens.
- Provides a `grid` namespace so wrappers like `Layout.astro` can pass `.twelve-grid` gap and padding settings consistently.
- Replaces the legacy `PageWrapper`, `ContainerWrapper`, and `ProseWrapper` components. Those files are retired and should not
  re-surface.

### Layout (`src/layouts/Layout.astro`)
- Global shell that wires header, footer, and the `LayoutContainer` wrapper.
- Routes configure `pageWrapper` to opt into container widths, grid padding, or prose treatments while leaving outer spacing
  neutral.
- Always keep new routes inside `Layout`; bespoke top-level shells drift from navigation/search affordances.

### SectionLanding (`src/layouts/SectionLanding.astro`)
- Standardizes section headers, count badges, tag rails, and main/sidebar grids.
- Works with `createSectionLandingProps` (`src/utils/sectionLanding.ts`) to pull in presets for layout, header sizing, and
  padding tokens.
- Section pages (Garden, Stream, Blog, Micro, Photos, Stories, Poems, Evergreen, Nordletter, Books, Bookshelf) should spread the
  helper output and only override slots or copy.

### ProgressLayout (`src/components/layout/ProgressLayout.astro`)
- Shared scaffold for `/now/` and `/done/` that exposes slots for stats, quick links, and body content.
- Relies on `LayoutContainer` internally so additional progress-style pages can drop in without copying grid math.

### PostLayout (`src/components/layout/PostLayout.astro`)
- Wraps article surfaces (`[...slug].astro`) with hero metadata, tag listings, share links, backlinks, syndication, and
  webmentions.
- Uses `LayoutContainer` in prose mode so long-form content inherits typography defaults automatically.

## Usage Guidelines

1. **Prefer helpers over ad-hoc class names.** Reach for `createSectionLandingProps` instead of rebuilding padding or count
   logic. Add new presets there if a route needs a different combination.
2. **Keep Layout neutral.** Only configure `pageWrapper` when a page needs prose sizing or specific grid padding. Push all other
   spacing down into `SectionLanding`, `ProgressLayout`, or feature-specific wrappers.
3. **Stick with `.twelve-grid`.** When adding new layouts, start from the shared grid utilities (`grid-span-*`, `grid-pad-*`,
   `grid-gap-*`). Avoid bespoke CSS grids unless a component cannot express itself with the existing tokens.
4. **Document new primitives here.** When introducing a new layout component, add an entry below so future sections can discover
   it before duplicating markup.

## Existing Components At-a-Glance

| Component | Purpose | Typical Consumers |
| --- | --- | --- |
| `LayoutContainer` | Max-width, padding, optional prose formatting | `Layout`, `PostLayout`, marketing pages |
| `SectionLanding` | Section hero, counts, tag rails, main/sidebar grid | `garden/`, `stream/`, `blog/`, `photos/`, `nordletter/`, `bookshelf/` |
| `ProgressLayout` | Two-column progress dashboards with stats rail | `/now/`, `/done/` |
| `PostLayout` | Long-form article wrapper with metadata + microformats | `[...slug].astro` |
| `StreamLayout` (`src/components/layout/StreamLayout.astro`) | Stream/Garden list scaffolding with optional sidebar slot | `/stream/`, `/blog/`, `/micro/`, `/photos/` |
| `GardenGrid` (`src/components/layout/GardenGrid.astro`) | Accent-aware card grid for garden/prose listings | `/garden/`, `/stories/`, `/poems/`, `/evergreen/` |

## Migration & Legacy Notes

- `PageWrapper`, `ContainerWrapper`, and `ProseWrapper` were superseded in September 2025. Remove remaining references in planning
  docs when encountered.
- `SectionWrapper` and `GridWrapper` remain archived for historical context only. The `.twelve-grid` utility covers their use
  cases.
- When migrating older content, convert bespoke wrappers into one of the primitives above, then delete the redundant markup.

## Onboarding Checklist for New Routes

1. Start with `src/layouts/Layout.astro`.
2. Decide whether the page is:
   - A **section landing** → use `SectionLanding` + `createSectionLandingProps`.
   - A **progress dashboard** → use `ProgressLayout`.
   - A **long-form article** → use `PostLayout`.
   - A **custom layout** → wrap feature-specific markup in `LayoutContainer`, applying grid tokens explicitly.
3. Confirm padding comes from the chosen layout component, not ad-hoc `px-*` classes on the outer page.
4. Update this document if a new reusable primitive emerges.

## References

- `src/components/layout/LayoutContainer.astro`
- `src/layouts/Layout.astro`
- `src/layouts/SectionLanding.astro`
- `src/utils/sectionLanding.ts`
- `src/components/layout/ProgressLayout.astro`
- `src/components/layout/PostLayout.astro`
- `src/components/layout/StreamLayout.astro`
- `src/components/layout/GardenGrid.astro`
