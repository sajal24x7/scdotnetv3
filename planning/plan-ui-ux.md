## UI/UX Improvement Plan

- Current Phase: P1 – Accessibility and consistency
- Overall Progress: 0%
- Last Updated: run `npm run date` and replace this line per workspace rule

### Goals
- Improve accessibility, consistency of wrappers, and search modal a11y without changing look.
- Optional: provide opt-in heading font variant using Montserrat via a class.

### Tasks
- [ ] P1.1 Add structural landmarks and skip link
  - Add skip link to `Header.astro` (hidden until focus), and ensure `main` has `id="content"`.
  - Ensure `nav`, `main`, `footer` semantics exist (they do). Add `aria-current` on active nav links.
- [ ] P1.2 Standardize wrappers
  - Ensure pages use `Layout.astro` with `PageWrapper` or `ProseWrapper` appropriately.
  - Create a brief usage guideline per page type.
- [ ] P1.3 Search modal accessibility
  - Add `role="dialog"`, `aria-modal="true"`, label the title, focus trap, close on `Esc` (exists), restore focus to opener.
  - Add keyboard navigation between results.
- [ ] P1.4 Focus-visible styles
  - Add consistent `:focus-visible` ring utilities on interactive elements.
- [ ] P1.5 Optional: Montserrat headings variant
  - Load Montserrat and gate with a root class `.use-montserrat-headings` to avoid global change.
  - Provide a toggle script-only for your preview, not enabled by default.

### Implementation Notes
- Maintain current spacing and typography tokens.
- Avoid color changes; use existing semantic tokens.

### Acceptance
- No layout shift when enabling new semantics.
- Search modal is screen-reader-friendly; keyboard nav works.

### Completion Log
- Add dated notes here as tasks complete.


