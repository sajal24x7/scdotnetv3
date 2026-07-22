# Learning Systems

How to build a daily-practice learning page on this site — the "periodic table on the wall" pattern. The first implementation is `/learn/linux` (Linux sysadmin commands); the second is `/learn/finnish` (Finnish as a rule system). The scheduler and UI are shared between them — a new system only needs a content pool, a small config object, and a page shell.

Two further systems — `/learn/til` and `/learn/evergreen` — don't have hand-written pools at all: their content is extracted from ` ```learn ` blocks authored inside published notes (see "Note-backed decks" below). `/learn` is the hub page that fronts all systems with live due counts.

**Key files:**

| Role | File |
| --- | --- |
| Shared types | `src/components/learn/types.ts` |
| Shared scheduler + persistence (pure functions) | `src/components/learn/engine.ts` |
| Shared UI (React island, consumes `engine.ts`) | `src/components/learn/LearningSystem.tsx` |
| Shared styles | `src/styles/learn.css` |
| Hub page + island | `src/pages/learn/index.astro`, `src/components/learn/LearnHub.tsx` |
| Linux content pool | `src/data/linux-commands.ts` (+ `src/data/linux-learn-config.ts` adapter) |
| Linux page shell | `src/pages/learn/linux.astro` |
| Finnish content pool | `src/data/finnish.ts` (+ `src/data/finnish-learn-config.ts`) |
| Finnish page shell | `src/pages/learn/finnish.astro` |
| Note-backed pools (generated) | `src/data/learn-decks.generated.json` (built by `scripts/extract-learn-blocks.mjs`) |
| TIL / Evergreen configs + shells | `src/data/til-learn-config.ts`, `src/data/evergreen-learn-config.ts`, `src/pages/learn/til.astro`, `src/pages/learn/evergreen.astro` |
| Learn-block render stripping | `src/utils/learnBlocks.ts` (remark plugin + string strip used by pages, RSS, previews, backlinks) |
| Content-pool guardrail | `scripts/validate-learn-data.mjs` (prompt-id uniqueness, `introductionOrder` completeness) |

## Design principles

These come largely from Andy Matuschak's work on spaced repetition and memory systems (["How to write good prompts"](https://andymatuschak.org/prompts/), [Quantum Country](https://quantum.country), [Orbit](https://withorbit.com)). They are the *why* behind every mechanism below; keep them intact when building a new system.

1. **The system chooses, not the learner.** The daily ritual must be zero-decision: open the page, do what it shows, leave. Menus and choices ("which topic today?") add friction and invite skipping. Choice is allowed only in optional extras (drills), never in the main loop.
2. **Retrieval, not recognition.** Prompts ask the learner to *produce* the answer from memory, then reveal and self-grade ("Got it" / "Forgot"). Multiple choice tests recognition, a much weaker memory act. The moment of effortful recall before the reveal is the rep that counts.
3. **Spacing over cramming.** Each prompt has its own review schedule. Correct answers push it further out; misses pull it back to tomorrow. Reviewing right before the forgetting point is what converts short-term familiarity into long-term memory.
4. **Bounded daily sessions.** A session must reliably take 2–5 minutes. Cap due reviews per day and introduce new material gradually. The ritual dies the day it feels like a backlog chore — "done for today, come back tomorrow" is a feature, not a limitation.
5. **Gradual introduction.** Never dump the whole deck on day one. A fixed number of new items per day (2 commands ≈ 4 prompts for the Linux page) ramps a 60-item deck in over about a month, interleaved with reviews. Introduce new items round-robin across categories so early days mix topics.
6. **Atomic prompts.** One fact per prompt, short unambiguous answer, scenario-flavored where possible ("umount says target is busy — how do you find who's holding it?" beats "what does lsof do?"). Several small prompts per item beat one big one; each is scheduled independently, so weak facts get extra reps without dragging strong ones along.
7. **A visible territory.** The wall chart — every item as a small tile, grouped by category, colored by memory strength — is the emotional engine. It gives the periodic-table-on-the-wall experience: you see the whole domain at a glance, watch it turn green over weeks, and the due tiles pulse as today's task. Progress feels physical.
8. **Reference doubles as prompt context.** Clicking any tile shows the item's reference card (syntax, description, worked example). The chart is therefore also a lookup sheet, which keeps the learner returning to the page outside review time — Matuschak's mnemonic-medium idea of memory prompts living inside real reference material.

## Architecture

Three layers, cleanly separated so a new system only rewrites the first:

### 1. Content pool (`src/data/<topic>.ts`)

Plain TypeScript data, no logic. Shape (`src/components/learn/types.ts`):

```ts
Category { id, title, emoji, description, items: LearnItem[] }
LearnItem { id, term, syntax, description, example, exampleNote, prompts: Prompt[] }
Prompt   { id, q, a, note? }   // note = one-line elaboration shown with the answer
```

- **Item** = the unit of *introduction* and of the wall chart (a tile).
- **Prompt** = the unit of *scheduling* (each has its own FSRS card — its own stability, difficulty, and due date). Aim for 2+ prompts per item: typically one "what does X do" and one scenario/flag prompt.
- Prompt ids must be globally unique and stable — they key the learner's saved state, so renaming one orphans its progress.
- An `introductionOrder` export defines the sequence new items appear in. It can be plain round-robin across categories (Linux) or hand-curated to respect content dependencies (Finnish: vowel harmony before suffixes, a gradation pattern before the case that uses it, a vocabulary word before the rule item that applies it to that word).
- `linux-commands.ts` predates the shared types and keeps its own `Command`/`cmd` naming; `linux-learn-config.ts` adapts it to `LearnItem`/`term` at the config boundary rather than renaming the 1000+ line data file. New content pools should just use the shared types directly (see `finnish.ts`).
- Run `node scripts/validate-learn-data.mjs` after editing a content pool — it checks prompt-id uniqueness, that every item appears in `introductionOrder` exactly once, and that no category/item is empty.

### 2. Scheduler (FSRS, in `engine.ts`)

The scheduling and persistence logic (`localToday`, `addDays`, `gradeCard`, `itemStatus`, `buildDailySession`, `loadState`/`saveState`, the count helpers) is a pure module, `src/components/learn/engine.ts` — no React, no DOM assumptions beyond `window.localStorage`. `LearningSystem.tsx` (wall chart + session UI) and `LearnHub.tsx` (hub due/new counts) both import it, so the two can't drift out of sync the way the hub's hand-duplicated counts once could. A new consumer (e.g. a future unified `/practice` page) extends the same engine rather than re-deriving it.

Scheduling is [FSRS](https://github.com/open-spaced-repetition/ts-fsrs) (the algorithm modern Anki ships), via the `ts-fsrs` library:

- Each prompt's card carries FSRS's own state — `stability` (days until recall probability drops to the retention target), `difficulty` (1–10), `state` (New/Learning/Review/Relearning), `due`, `reps`, `lapses`, `lastReview` — instead of a Leitner box number. Intervals are computed per card from its own history: easy cards race out to multi-month gaps, hard cards stay short, and a single miss doesn't drag a mature card all the way back to "box 1."
- **Grading stays two buttons.** "Forgot" maps to FSRS's `Again`, "Got it" to `Good`. Hard/Easy exist in the algorithm but aren't exposed — a four-way self-assessment per card is exactly the per-rep decision principle #1 forbids.
- **Desired retention** is fixed at `DEFAULT_RETENTION = 0.9` (FSRS's own default) for now; surfacing it as a per-user setting is deferred to `/practice` (see the unified-practice plan).
- **Day-granular by design.** The FSRS instance is configured with `enable_short_term: false`, which disables Anki's minute-level (re)learning steps — every persisted interval is a whole calendar day, even the very first "Again" on a brand-new card (verified: schedules >= 1 day out, never same-day). `enable_fuzz: false` keeps intervals exact rather than randomized. A same-day second chance after "Forgot" is handled at the *session* level instead: the failed prompt is requeued once at the end of the current session's queue (tracked in `LearningSystem.tsx`, capped at one retry per prompt per session) — turning a slip into a win more often than making the learner wait until tomorrow, while the persisted `due` stays date-based throughout.
- Daily session = all due prompts (earliest-due first, capped at `dueCap`) + up to `newPerDay` new items (learn-card first, then its prompts). Both are config values — see the tuning table below.
- The new-item budget is tracked per calendar date, so reopening the page mid-day doesn't introduce extras.
- Dates are local calendar dates (`YYYY-MM-DD`), not UTC — "tomorrow" must mean the user's tomorrow. FSRS itself works in JS `Date` objects; `engine.ts` converts at the boundary (`toFsrsInput`/`fromFsrsCard`) so persisted state and the rest of the module stay in the string-date domain.

Tile status on the chart is derived, never stored: `unseen` (not introduced) → `due` (any prompt due) → `learning` (Learning/Relearning state, or stability < 21 days) → `strong` (Review state with stability >= 21 days).

### 3. State (localStorage)

One key per system (`linux-learn-srs`, `finnish-learn-srs`), holding:

```ts
{ version: 3,
  cards: { [promptId]: { due, stability, difficulty, state, reps, lapses, lastReview } },
  introduced: { [itemId]: date }, lastSessionDate, streak, totalSessions }
```

- **Version the schema** and migrate on load. `loadState` upgrades a v2 (Leitner) blob to v3 on the fly: each card's `stability` seeds from its old box interval (1/3/7/14/30 days), `difficulty` seeds from FSRS's own default-difficulty value (no per-card history to do better), and `due`/`reps`/`lapses` carry over unchanged — nothing resets on day one. The pre-migration v2 blob is kept under a `<storageKey>-v2-backup` key until the first fully completed v3 session, as a rollback net. The Linux page separately migrates streak/session-count from the old v1 quiz key via `legacyKey` in its config; Finnish has no legacy key.
- All state is per-browser/per-device. Acceptable for a personal ritual; add export/import before it matters.
- Save failures (private mode) degrade silently — practice still works, it just doesn't persist.

### UI states

`chart` (home: today-strip + wall chart + legend + reference panel) → `session` (learn cards and recall prompts, one at a time) → `done` (today's tally, streak, tomorrow's due count). Plus an optional `drill` mode: run through a category's prompts with the same reveal/self-grade UI but **without touching scheduler state** — cramming for curiosity shouldn't corrupt the spacing data.

## Note-backed decks (`/learn/til`, `/learn/evergreen`)

These decks follow Matuschak's mnemonic-medium model: prompts are authored by the writer, inline, inside the note they test — the machinery only collects them. A note opts into its deck simply by containing a fenced ` ```learn ` block with YAML inside:

````markdown
```learn
term: NAT Gateway            # optional — tile label; defaults to the note title
category: azure              # optional — deck category; defaults to the note's first tag
syntax: az network nat ...   # optional — canonical form on the reference card
description: ...             # optional — defaults to the note's first paragraph
example: ...                 # optional — defaults to the note's first code block
exampleNote: ...             # optional
prompts:
  - q: Why not rely on Azure's default outbound IPs?
    a: They change at random, so external services can't whitelist them.
    note: ...                # optional one-line elaboration
    id: why-nat              # optional stable id override
```
````

For the common case — no scalar overrides, just prompts — a bare q/a shorthand skips the `prompts:` list ceremony:

````markdown
```learn
q: Why not rely on Azure's default outbound IPs?
a: They change at random, so external services can't whitelist them.

q: What fixes it?
a: A NAT Gateway with a static public IP.
```
````

A block with no top-level `prompts:` key is treated as shorthand: it's split into stanzas at each top-level `q:` line, and each stanza is YAML-parsed as one prompt (`q`, `a`, optional `note:`/`id:`); anything before the first `q:` line is parsed as the scalar fields shown above. Both forms are valid — the full syntax is still needed whenever a prompt needs an `id:`/`note:` alongside scalar overrides in the same block — and a note can mix them across its learn blocks.

Mechanics:

- **Extraction** — `scripts/extract-learn-blocks.mjs` scans `src/content/til` and `src/content/evergreen`, groups items into categories by tag (`CATEGORY_META` maps tag → title/emoji; unknown tags get a generic fallback), and writes `src/data/learn-decks.generated.json`. It runs automatically in `npm run dev` / `npm run build`, and the generated file is committed so checkouts work without a build step. Malformed blocks are skipped with a warning, never a build failure; `validate-learn-data.mjs` is the strict check.
- **Id stability** — item ids come from the note's timestamp (`til-202502271259`); prompt ids are positional (`-p1`, `-p2`, …). They key the learner's localStorage state, so **append new prompts at the end** — inserting or reordering shifts positions and orphans progress. When restructuring is unavoidable, pin prompts with explicit `id:` fields.
- **Introduction order** is newest-note-first: a TIL published today is the next new item introduced, so reinforcement lands close to the encounter. The deck growing as notes are published is the intended feed, not a problem — `newPerDay` meters the intake.
- **Render stripping** — learn blocks are authoring metadata, not prose. `src/utils/learnBlocks.ts` removes them everywhere a note body renders: a remark plugin (site pages, wired in `astro.config.mjs`), plus string strips in RSS items, hover-preview excerpts, and backlink snippets.
- **Item extras** — note-backed items carry `href` back to their source note ("Read the note →" on cards and the reference panel), and `syntax`/`example` are optional in the shared types: prose items fall back to showing the term instead of a `<code>` line.
- **Two decks, not one** — TIL (commands, `monoAnswers: true`, `newPerDay: 2`, `dueCap: 8`) and evergreen (ideas, `monoAnswers: false`, `newPerDay: 1`, `dueCap: 6`) differ in answer style, tuning, and what their wall chart depicts, so they keep separate storage keys and pages. Evergreen prompts ask for an idea's *structure* — the claim, the mechanism, an example — not verbatim recall of the note.

Authoring workflow: write the learn block in the note (in Obsidian or directly in `src/content/...`), publish through the normal content pipeline, and the next build picks it up. Note that if a note is edited in the vault and republished *without* its learn block, the block disappears from the published copy and the item drops out of the deck — keep the block with the note in the vault once you add one.

## The hub (`/learn`)

Four systems means four daily rituals unless something aggregates them. `/learn` renders one card per system with live counts — "5 due · 2 new notes · 12-day streak" or "✓ done for today" — read client-side from each system's localStorage key (`LearnHub.tsx`). Systems stay fully independent; the page receives lightweight build-time summaries (`storageKey`, `newPerDay`, `dueCap`, item/prompt totals) rather than the datasets, so the island stays small. The count derivation mirrors `LearningSystem.tsx`'s — keep them in sync if the state schema changes.

## Building a new system

The scheduler and UI are already shared (`LearningSystem.tsx`); a new system is just data plus a config plus a page:

1. **Write the content pool** — `src/data/<topic>.ts` exporting `categories: Category[]` and `introductionOrder: string[]` per the shared types. For language material the "item" is a word/phrase, "syntax" its canonical form, "example" a usage sentence. Prompts should go *both directions* (fi→en and en→fi as separate prompts — they are different memory acts and deserve separate schedules).
2. **Write a config** — `src/data/<topic>-learn-config.ts` exporting a `LearnSystemConfig`: `storageKey` (never share state between decks), `newPerDay`, `dueCap`, `itemNoun` (used in UI copy like "3 new words"), `monoAnswers` (`true` renders answers in `<code>`; set `false` for prose languages like Finnish, which uses the serif body font instead), and `dataset`.
3. **New page** at `/learn/<topic>.astro` — render `<LearningSystem client:load config={yourConfig} />`, import `src/styles/learn.css`, and add a `.learn-<topic>-page`/`__title`/`__subtitle` selector group to that stylesheet (or reuse an existing one).
4. **Validate** with `node scripts/validate-learn-data.mjs` before opening a PR.
5. **Tune the constants** to the material: language decks usually want more new items per day and can tolerate a higher due cap; dense technical material wants fewer. See the tuning table below.

## Tuning knobs

| Constant | Linux | Finnish | TIL | Evergreen | Meaning |
| --- | --- | --- | --- | --- | --- |
| `DEFAULT_RETENTION` | 0.9 | same | same | same | FSRS's desired-recall-probability target (fixed in the engine, not per-config) |
| `newPerDay` | 2 | 3 | 2 | 1 | New items introduced daily |
| `dueCap` | 8 | 12 | 8 | 6 | Max reviews shown per day |
| `STRONG_STABILITY_DAYS` | 21 | same | same | same | Stability threshold for the "solid" tile color (fixed in the engine) |
| `monoAnswers` | `true` | `false` | `true` | `false` | Whether revealed answers render in `<code>` (commands) or prose (natural language) |

Raising `dueCap` clears backlogs faster after missed days but lengthens sessions; the cap is safe because capped-out cards remain due and surface the next day. `DEFAULT_RETENTION` and `STRONG_STABILITY_DAYS` live as constants inside `engine.ts` rather than the config — no system has needed to deviate from them yet.

## Deliberate non-features

- **No penalties for missed days.** The due pile waits, capped per session. Guilt mechanics kill daily rituals.
- **No ease factors beyond FSRS's own, no fuzzing.** `enable_fuzz: false` keeps intervals exact and debuggable; FSRS's built-in difficulty/stability model already goes further than a fixed ease factor would.
- **No server sync.** Keep the system free of accounts and infrastructure until an actual second device demands it.

## Planned evolution

A proposed redesign splits learning (per-domain wall charts and reference, this document) from practice (one unified cross-deck SRS session at `/practice`), and adds vocabulary and private people decks — see [`planning/practice-system-unified-srs.md`](../../planning/practice-system-unified-srs.md). This document stays authoritative for what is implemented until that plan lands.
