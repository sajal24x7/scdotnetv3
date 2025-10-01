# Twelve-Grid Global Rollout Tasks

_Companion roadmap for consolidating every route onto a single Craig Mod–style grid host. Refer to `planning/twelve-grid-audit.md` for current usage counts and priority cues._

- [x] **Codify Craig Mod–style tokens** – Update the `.twelve-grid` ruleset in `src/styles/global.css` to mirror Craig Mod's container/row/column behavior and expose helpers for every span.
  ```css
  .twelve-grid { padding-left: 20px; padding-right: 20px; min-width: 984px; }
  .twelve-grid .row { width: 100%; max-width: 1140px; min-width: 984px; margin: 0 auto; overflow: hidden; }
  .twelve-grid .onecol { width: 4.85%; }
  .twelve-grid .twocol { width: 13.45%; }
  .twelve-grid .threecol { width: 22.05%; }
  .twelve-grid .fourcol { width: 30.75%; }
  .twelve-grid .fivecol { width: 39.45%; }
  .twelve-grid .sixcol { width: 48%; }
  .twelve-grid .sevencol { width: 56.75%; }
  .twelve-grid .eightcol { width: 65.4%; }
  .twelve-grid .ninecol { width: 74.05%; }
  .twelve-grid .tencol { width: 82.7%; }
  .twelve-grid .elevencol { width: 91.35%; }
  .twelve-grid .twelvecol { width: 100%; float: left; }
  .twelve-grid .onecol,
  .twelve-grid .twocol,
  .twelve-grid .threecol,
  .twelve-grid .fourcol,
  .twelve-grid .fivecol,
  .twelve-grid .sixcol,
  .twelve-grid .sevencol,
  .twelve-grid .eightcol,
  .twelve-grid .ninecol,
  .twelve-grid .tencol,
  .twelve-grid .elevencol { margin-right: 3.8%; float: left; min-height: 1px; }
  .twelve-grid .last { margin-right: 0; }
  img, object, embed { max-width: 100%; }
  img { height: auto; }
  ```
- [x] **Upgrade `LayoutContainer` API** – Add a boolean/variant prop that injects the global grid class list and optional gap/padding modifiers, replacing the manual `gridClasses` concatenation currently handled in `Layout.astro` and `SectionLanding`.
- [x] **Refit `Layout.astro` to delegate grid control** – Strip the inline `.twelve-grid` wrapper from `Layout.astro`, pass the new grid prop down to `LayoutContainer`, and ensure default pages still receive one grid shell by default.
- [x] **Retire redundant wrappers in `SectionLanding` & `StreamLayout`** – Replace their internal `.twelve-grid` divs with the shared component, leaning on props for gap/padding so landing pages no longer apply `contentClass="… twelve-grid …"`. This covers the cluster of routes currently rendering three grids apiece.
- [x] **Normalize progress and bookshelf layouts** – Update `ProgressLayout`, `BookGrid`, and `BookDetailLayout` to consume the central grid configuration instead of hard-coding `.twelve-grid`, ensuring `/now/`, `/done/`, `/bookshelf/`, and `/books/*` collapse to a single wrapper.
- [ ] **Sweep informational pages** – Convert inline grid sections on `/feeds/`, `/tags/`, `/colophon/`, and `/sajal/` to use the shared component with column span helpers, paring each route back to one grid per logical section without reintroducing wrappers.
- [x] **Document usage** – Update `planning/twelve-column-grid-task-list.md` and design guidelines to point developers at the new `LayoutContainer` grid API, clarifying when to use span helpers versus stacking multiple grid hosts.
