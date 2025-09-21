# Repository Guidelines

## Project Structure & Module Organization
The Astro site lives in `src`, with route files under `src/pages`, shared wrappers in `src/layouts`, and UI elements in `src/components`. Structured content is kept in `src/content/<year>/slug.md` folders; use the same year split when adding notes, ephemera, or newsletters so collection helpers can enumerate years dynamically. Data helpers and Zod schemas sit in `src/data` and `src/types`, while `src/utils` holds reusable formatters. Static assets belong in `public` and generated covers are written to `src/assets/covers`; the production build emits to `dist`.

## Build, Test, and Development Commands
Run `npm install` with Node 20+ before contributing. Use `npm run dev` for the local server; it pre-builds covers and watches Astro files. `npm run build` executes cover generation, syncs webmentions, builds the static site, and best-effort triggers syndication. `npm run preview` serves the last build. Sync webmentions on demand with `npm run fetch-webmentions`, and use `npm run syndicate:dry-run` to verify outbound syndication without publishing.

## Coding Style & Naming Conventions
Follow the existing 4-space indentation in TypeScript, Astro, and scripts. Name Astro components with `PascalCase.astro` and colocate supporting modules in subfolders (for example `src/components/navigation`). Keep utility modules in TypeScript (`.ts`) and prefer named exports. Styling relies on Tailwind; favor utility classes over bespoke CSS unless adding a shared pattern to `src/styles`. Run `npm run astro check` (or `npx astro check`) before opening a pull request.

## Testing Guidelines
No automated test suite is configured; rely on `npm run dev` for interactive verification and `npm run build` to catch integration issues. When adding logic-heavy utilities, include minimal unit scripts under `src/utils/__checks__` or document manual test steps in the pull request until a formal harness is introduced.

## Commit & Pull Request Guidelines
Commits in this repository use short, action-focused subjects (e.g., `Minor ui changes`, `NL72`). Keep to 65 characters, start with an imperative verb when possible, and scope single features or fixes per commit. Pull requests should describe the change, reference any related issue, and note content updates or scripts executed. Include screenshots or URLs if you adjust visual components, and call out any manual verification performed.

## Content Authoring Tips
When contributing writing, keep frontmatter consistent with existing entries and avoid hardcoding year lists—use the folder structure instead. Generated artwork or large media should be added via the cover generator or stored externally, linking via frontmatter fields.