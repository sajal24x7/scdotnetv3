# Learning Systems

How to build a daily-practice learning page on this site — the "periodic table on the wall" pattern. The first implementation is `/learn/linux` (Linux sysadmin commands); the same blueprint applies to future systems like Finnish vocabulary, networking concepts, or anything else worth memorizing.

**Key files (Linux implementation):**

| Role | File |
| --- | --- |
| Content pool (items + prompts) | `src/data/linux-commands.ts` |
| Scheduler + UI (React island) | `src/components/learn/LinuxQuiz.tsx` |
| Styles | `src/styles/linux-learn.css` |
| Page shell | `src/pages/learn/linux.astro` |

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

Plain TypeScript data, no logic. Shape:

```ts
Category { id, title, emoji, description, commands: Item[] }
Item     { id, cmd/term, syntax, description, example, exampleNote, prompts: Prompt[] }
Prompt   { id, q, a, note? }   // note = one-line elaboration shown with the answer
```

- **Item** = the unit of *introduction* and of the wall chart (a tile).
- **Prompt** = the unit of *scheduling* (each has its own Leitner box). Aim for 2+ prompts per item: typically one "what does X do" and one scenario/flag prompt.
- Prompt ids must be globally unique and stable — they key the learner's saved state, so renaming one orphans its progress.
- An `introductionOrder` export defines the sequence new items appear in (round-robin across categories for the Linux page).

### 2. Scheduler (Leitner boxes, in the island)

Simpler than full SM-2 and adequate for decks of a few hundred prompts:

- Boxes 1–5 with intervals **1, 3, 7, 14, 30 days**.
- "Got it" → move up one box, due = today + new box's interval (capped at box 5).
- "Forgot" → back to box 1, due tomorrow. Lapses are counted but don't change the ladder.
- Daily session = all due prompts (earliest-due first, **capped at 8**) + up to **2 new items** (learn-card first, then its prompts).
- The new-item budget is tracked per calendar date, so reopening the page mid-day doesn't introduce extras.
- Dates are local calendar dates (`YYYY-MM-DD`), not UTC — "tomorrow" must mean the user's tomorrow.

Tile status on the chart is derived, never stored: `unseen` (not introduced) → `due` (any prompt due) → `learning` (min box < 4) → `strong` (all prompts in box 4+).

### 3. State (localStorage)

One key per system (Linux: `linux-learn-srs`), holding:

```ts
{ version, cards: { [promptId]: { box, due, reps, lapses } },
  introduced: { [itemId]: date }, lastSessionDate, streak, totalSessions }
```

- **Version the schema** and migrate on load (the Linux page migrates streak/session-count from the v1 quiz key).
- All state is per-browser/per-device. Acceptable for a personal ritual; add export/import before it matters.
- Save failures (private mode) degrade silently — practice still works, it just doesn't persist.

### UI states

`chart` (home: today-strip + wall chart + legend + reference panel) → `session` (learn cards and recall prompts, one at a time) → `done` (today's tally, streak, tomorrow's due count). Plus an optional `drill` mode: run through a category's prompts with the same reveal/self-grade UI but **without touching scheduler state** — cramming for curiosity shouldn't corrupt the spacing data.

## Building a new system (e.g. Finnish)

1. **Write the content pool** — `src/data/finnish-vocab.ts` with the same three-level shape. For language material the "item" is a word/phrase, "syntax" its canonical form, "example" a usage sentence. Prompts should go *both directions* (fi→en and en→fi as separate prompts — they are different memory acts and deserve separate schedules).
2. **Extract or copy the island.** The scheduler, state handling, and screens in `LinuxQuiz.tsx` are content-agnostic apart from labels and the imported data module. Either generalize it into a shared `<LearningSystem>` component parameterized by the data pool and storage key when the second system is built (preferred), or copy it while the count is still two.
3. **New storage key per system** (`finnish-learn-srs`) — never share state between decks.
4. **New page** at `/learn/<topic>` following `linux.astro`.
5. **Tune the constants** to the material: language decks usually want more new items per day (4–6) and can tolerate a higher due cap; dense technical material wants fewer.

## Tuning knobs

| Constant | Linux value | Meaning |
| --- | --- | --- |
| `BOX_INTERVALS` | 1/3/7/14/30 | Days between reviews per box |
| `NEW_COMMANDS_PER_DAY` | 2 | New items introduced daily |
| `DUE_CAP` | 8 | Max reviews shown per day |
| `MAX_BOX` | 5 | Ladder height; top box = "solid" |

Raising `DUE_CAP` clears backlogs faster after missed days but lengthens sessions; the cap is safe because capped-out cards remain due and surface the next day.

## Deliberate non-features

- **No penalties for missed days.** The due pile waits, capped per session. Guilt mechanics kill daily rituals.
- **No ease factors / fuzzing / SM-2.** Leitner is transparent enough to debug by reading localStorage. Revisit only if decks grow past ~500 prompts.
- **No server sync.** Keep the system free of accounts and infrastructure until an actual second device demands it.
