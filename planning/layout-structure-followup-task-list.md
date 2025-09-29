# Layout Structure Follow-Up Tasks

This task list converts the findings from `planning/layout-structure-audit.md` into actionable follow-up work. Group tasks by priority and expected effort to aid planning.

## High Priority
- [x] **Normalize SectionLanding padding contract**
  - Centralize horizontal padding inside `SectionLanding` so headers, counts, tag lists, and the `section-content` grid share one spacing source.
  - Remove the `pageWrapper.className: 'px-*'` overrides from Garden/Stream/Blog/Micro/Photos/Evergreen/Stories/Poems/Nordletter pages and replace them with `SectionLanding` props (e.g., `contentPadding`, future inline padding hook).
  - Confirm `GardenGrid`, `StreamLayout`, and any sidebar slots do not reintroduce outer padding once SectionLanding owns the spacing.
- [ ] **Consolidate Section Landing usage**
  - Extract shared defaults/helpers so Garden/Stream/Blog/Micro/Photos/Evergreen/Stories/Poems/Nordletter pages stop duplicating configuration.
  - Document the new abstraction and update each route to consume it.
- [ ] **Adopt SectionLanding on `/bookshelf/`**
  - Swap the bespoke bookshelf header/grid scaffolding for SectionLanding slots.
  - Ensure yearly sub-sections and TagList integrations still render correctly.
- [ ] **Remove or reintegrate `TagSidebar`**
  - Decide whether to delete the unused component or plug it into StreamLayout’s sidebar slot.
  - Update references and documentation accordingly.

## Medium Priority
- [ ] **Align Layout page wrapper padding with LayoutContainer tokens**
  - Audit the `Layout` → `LayoutContainer` wrapper (`mx-auto max-w-7xl grid-span-full px-*`) and replace ad-hoc `className` padding with the built-in `padding`/`paddingScale` props.
  - Update Nordletter and similar routes to keep the page wrapper padding-free and push spacing down into `SectionLanding`/inner components.
  - Document guidelines that Layout-level containers stay neutral while inner layouts own proximity padding.
- [ ] **Create a shared Progress layout**
  - Extract the duplicated grid/aside logic from `/now/` and `/done/` into a reusable component.
  - Parameterize title, description, and empty-state copy.
- [ ] **Explore a Post layout wrapper**
  - Identify repeated scaffolding inside `[...slug].astro` and similar article templates.
  - Prototype a `PostLayout` component that centralizes hero, metadata, and supporting sections.
- [ ] **Bring `[...slug].astro` into the padding audit**
  - Catalogue how the post view uses `LayoutContainer` (`className="px-4 md:px-0"`) and plan to swap Tailwind padding classes for component props or a dedicated article body wrapper.
  - Ensure post metadata, hero, and supporting sections inherit consistent inline padding without relying on the global page wrapper.
  - Update the audit document to reflect the dynamic post route once the padding plan is in place.
- [ ] **Assess GardenGrid internal abstraction**
  - Evaluate whether a lower-level `CardGrid` utility would simplify `GardenGrid` span + accent handling.
  - Document trade-offs before refactoring.

## Low Priority / Nice to Have
- [ ] **Inventory layout documentation**
  - Cross-link any new abstractions from developer docs so future routes adopt them consistently.
- [ ] **Monitor stream sidebar opportunities**
  - Plan enhancements that would use StreamLayout’s sticky sidebar slot (e.g., surfacing filters or featured posts).

## References
- `planning/layout-structure-audit.md`
