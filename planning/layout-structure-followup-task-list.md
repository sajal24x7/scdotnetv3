# Layout Structure Follow-Up Tasks

This task list converts the findings from `planning/layout-structure-audit.md` into actionable follow-up work. Group tasks by priority and expected effort to aid planning.

## High Priority
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
- [ ] **Create a shared Progress layout**
  - Extract the duplicated grid/aside logic from `/now/` and `/done/` into a reusable component.
  - Parameterize title, description, and empty-state copy.
- [ ] **Explore a Post layout wrapper**
  - Identify repeated scaffolding inside `[...slug].astro` and similar article templates.
  - Prototype a `PostLayout` component that centralizes hero, metadata, and supporting sections.
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
