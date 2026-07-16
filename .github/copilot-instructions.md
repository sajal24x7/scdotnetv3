# Copilot Instructions

Follow the repository guidelines in [`AGENTS.md`](../AGENTS.md) — it covers project structure, build commands, coding style, typography tokens, content-loading rules, and the twelve-column grid conventions. The full documentation library is indexed at [`docs/README.md`](../docs/README.md).

Key points, in brief:

- Astro 7 + Tailwind CSS 4 + TypeScript; 4-space indentation; `PascalCase.astro` components; named exports in `src/utils`.
- Content is Markdown in one folder per category under `src/content/`, validated by `src/content.config.ts`. Never hard-code the category list — use `getContentCategories()` / `getAllPosts()` from `src/utils/content.ts`.
- Use the `--text-*` type-scale and `--font-*` family tokens from `src/styles/global.css`; never hard-code `font-size` or font stacks in component styles.
- Reuse the twelve-column grid utilities (`grid-span-*`, `grid-pad-*`) and existing layout components instead of new wrappers.
- Run `npx astro check` before opening a pull request. There is no test suite; verify with `npm run dev` / `npm run build`.
