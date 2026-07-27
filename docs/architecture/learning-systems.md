# Learning Systems

How the site's "periodic table on the wall" learning systems work, and where the daily ritual actually happens. The ritual has two halves, on two different surfaces:

- **Learning** — reading today's new concepts and deciding to take each one on — happens on the learn side: the combined **`/learn/new`** page (every deck's new concepts for today, one queue), or any deck's own `/learn/<topic>` page (that deck's new concepts only). Accepting a concept marks it introduced and seeds its prompts due-today. On the automated decks it's also where the prompts get *written* — see "Authored prompts".
- **Practice** — the bounded, graded, everything-interleaved daily Q&A session — is unified at **`/practice`**, one queue across every deck. It contains *only questions and answers*; it never introduces anything. A freshly accepted concept's prompts show up there the same day.

Domains are browsing-first: `/learn/linux` (Linux sysadmin commands), `/learn/finnish` (Finnish as a rule system) and `/learn/finnish-vocab` (its communicative-vocabulary sibling deck), `/learn/til` and `/learn/evergreen` (decks extracted from published notes), `/learn/vocabulary` (fed automatically from Wiktionary's Word of the Day), `/learn/people` (private, local-first — names and faces, never stored on any server). The original unified-practice reasoning is [`planning/practice-system-unified-srs.md`](../../planning/practice-system-unified-srs.md); this document describes what's implemented.

`/learn` is the hub page: one card per system (territory + progress), plus two banners — "New today" pointing at `/learn/new`, and "Today's practice" pointing at `/practice`.

**Key files:**

| Role | File |
| --- | --- |
| Shared types | `src/components/learn/types.ts` |
| Shared scheduler + persistence + unified queue + cloze parsing (pure functions) | `src/components/learn/engine.ts` |
| Per-domain UI: wall chart, reference panel, no-op drills, per-deck intro flow | `src/components/learn/LearningSystem.tsx` |
| Unified daily Q&A session UI (the only place SrsState is graded) | `src/components/learn/PracticeSession.tsx` |
| Combined "new today" page + island | `src/pages/learn/new.astro`, `src/components/learn/NewToday.tsx` |
| Shared intro-card flow (accept/skip per new concept) | `src/components/learn/IntroFlow.tsx` |
| Shared item reference card + prompt/cloze question rendering | `src/components/learn/ItemDetails.tsx` |
| Authored prompts: store, merge rules, dataset overlay, legacy migration | `src/components/learn/authoredPrompts.ts` |
| Prompt composer (write-your-own questions, inside the intro flow) | `src/components/learn/PromptComposer.tsx` |
| Authored-prompt store (committed) + build-time boundary | `src/data/authored-prompts.json`, `src/data/authored-prompts.ts` |
| Authored-prompt commit endpoint (GitHub PAT → repo) | `functions/api/practice-prompts.js` |
| Pre-authoring prompt snapshot (migration source) | `src/data/legacy-prompts.json`, `src/pages/api/practice/legacy-prompts.json.ts` |
| Sync client helpers (pull/push blob) | `src/components/learn/sync.ts` |
| Shared sign-in: session module, typed view, UI, verify endpoint | `public/auth/session.js`, `src/components/auth/session.ts`, `src/components/auth/SignIn.tsx`, `functions/api/auth-check.js` |
| Deck registry (server-only; build-time) | `src/data/practice-registry.ts` |
| `/practice` page + per-deck dataset endpoint | `src/pages/practice.astro`, `src/pages/api/practice/[deck].json.ts` |
| Shared styles | `src/styles/learn.css` |
| Hub page + island | `src/pages/learn/index.astro`, `src/components/learn/LearnHub.tsx` |
| Linux content pool | `src/data/linux-commands.ts` (+ `src/data/linux-learn-config.ts` adapter) |
| Linux page shell | `src/pages/learn/linux.astro` |
| Finnish content pool | `src/data/finnish.ts` (+ `src/data/finnish-learn-config.ts`) |
| Finnish page shell | `src/pages/learn/finnish.astro` |
| Finnish vocabulary content pool + shell | `src/data/finnish-vocab.ts` (+ `src/data/finnish-vocab-learn-config.ts`), `src/pages/learn/finnish-vocab.astro` |
| Note-backed pools (generated) | `src/data/learn-decks.generated.json` (built by `scripts/extract-learn-blocks.mjs`) |
| TIL / Evergreen configs + shells | `src/data/til-learn-config.ts`, `src/data/evergreen-learn-config.ts`, `src/pages/learn/til.astro`, `src/pages/learn/evergreen.astro` |
| Vocabulary feed (generated) + config + shell | `src/data/vocab.generated.json` (built by `scripts/fetch-wotd.mjs`), `src/data/vocab-dataset.ts` (pure transform), `src/data/vocab-learn-config.ts`, `src/pages/learn/vocabulary.astro` |
| Shared ```learn``` block parser (build script + browser) | `src/utils/learnBlockParser.mjs` |
| People deck (local-first, private) | `src/components/learn/peopleDeckBuilder.ts` (browser-side note→deck-file builder), `src/components/learn/peopleDeckStore.ts` (IndexedDB), `src/components/learn/PeopleLearnPage.tsx`, `src/pages/learn/people.astro`, `src/data/people-learn-config.ts` |
| Learn-block render stripping | `src/utils/learnBlocks.ts` (remark plugin + string strip used by pages, RSS, previews, backlinks) |
| Content-pool guardrail | `scripts/validate-learn-data.mjs` (prompt-id uniqueness, `introductionOrder` completeness) |
| Word of the Day parser tests | `scripts/test-wotd-parser.mjs` |
| Authored-prompt logic tests (ids, merge, overlay, migration) | `scripts/test-authored-prompts.mjs` |
| Shared sign-in session tests | `scripts/test-session.mjs` |

## Design principles

These come largely from Andy Matuschak's work on spaced repetition and memory systems (["How to write good prompts"](https://andymatuschak.org/prompts/), [Quantum Country](https://quantum.country), [Orbit](https://withorbit.com)). They are the *why* behind every mechanism below; keep them intact when building a new system.

1. **The system chooses, not the learner.** The daily ritual must be zero-decision: open the page, do what it shows, leave. Menus and choices ("which topic today?") add friction and invite skipping. Choice is allowed only in optional extras (drills), never in the main loop.
2. **Retrieval, not recognition.** Prompts ask the learner to *produce* the answer from memory, then reveal and self-grade ("Got it" / "Forgot"). Multiple choice tests recognition, a much weaker memory act. The moment of effortful recall before the reveal is the rep that counts.
3. **Spacing over cramming.** Each prompt has its own review schedule. Correct answers push it further out; misses pull it back to tomorrow. Reviewing right before the forgetting point is what converts short-term familiarity into long-term memory.
4. **Bounded daily sessions.** A session must reliably take 2–5 minutes. Cap due reviews per day and introduce new material gradually. The ritual dies the day it feels like a backlog chore — "done for today, come back tomorrow" is a feature, not a limitation.
5. **Gradual introduction.** Never dump the whole deck on day one. A fixed number of new items per day (2 commands ≈ 4 prompts for the Linux page) ramps a 60-item deck in over about a month, interleaved with reviews. Introduce new items round-robin across categories so early days mix topics.
6. **Atomic prompts.** One fact per prompt, short unambiguous answer, scenario-flavored where possible ("umount says target is busy — how do you find who's holding it?" beats "what does lsof do?"). Several small prompts per item beat one big one; each is scheduled independently, so weak facts get extra reps without dragging strong ones along. See "Writing prompts" below for the full rules.
7. **A visible territory.** The wall chart — every item as a small tile, grouped by category, colored by memory strength — is the emotional engine. It gives the periodic-table-on-the-wall experience: you see the whole domain at a glance, watch it turn green over weeks, and the due tiles pulse as today's task. Progress feels physical.
8. **Reference doubles as prompt context.** Clicking any tile shows the item's reference card (syntax, description, worked example). The chart is therefore also a lookup sheet, which keeps the learner returning to the page outside review time — Matuschak's mnemonic-medium idea of memory prompts living inside real reference material.
9. **Learning and practicing are different mental modes, on different pages.** Reading a new concept properly (the reference card, the examples, the why) is study; answering a question from memory is retrieval. The learn side (`/learn/new`, `/learn/<topic>`) owns the first; `/practice` owns the second and contains nothing else.

## Writing prompts

Prompts come from two places, and which one applies is a per-deck decision (`authorPrompts` in the deck's config):

- **Written by hand at introduction time**, in the composer on the learn side — the four automated/curated decks (`linux`, `finnish`, `finnish-vocab`, `vocab`). Their content pools ship reference cards with no prompts at all. See "Authored prompts" below.
- **Written alongside the material**, in the ```learn``` block inside the note that teaches it — the note-backed decks (`til`, `evergreen`) and `people`. See "Note-backed decks" below.

The rules are the same either way, and `scripts/validate-learn-data.mjs` enforces them on both (the composer applies the same checks in the browser, so a prompt typed there can't fail the build that publishes it).

Cards must be **atomic, connected, and meaningful**; each prompt must be:

1. **Focused (atomic)** — one fact per prompt. If the answer wants to explain two flags or contrast two commands, that's two prompts.
2. **Precise** — the question pins down exactly what's being asked; no "what about X" vagueness.
3. **Consistent** — the same answer every time. If two answers are defensible, rephrase until only one is.
4. **Effortful** — the answer must not be inferable from the prompt. True/false and yes/no questions are banned (`scripts/validate-learn-data.mjs` enforces this); the statement form gives the fact away and a coin flip scores 50%.

**Answers are 1–2 words** (or one flag, suffix, or command line) — never prose. The validator errors on answers longer than 8 words in the curated/automated pools (linux, finnish, finnish-vocab, vocab) and warns for the note-backed decks. Explanation belongs in the prompt's optional `note:` field, revealed with the answer, not in the answer itself.

Two prompt formats:

- **q/a** — a recall question with a short answer.
- **Cloze deletion** — `kind: 'cloze'`, with the full statement in `q` and the hidden span(s) wrapped in `{{…}}`:

  ```ts
  { id: 'c-ine-2', kind: 'cloze', q: 'talo + "in the house" = talo{{ssa}}', a: 'ssa',
    note: 'Inessive -ssa/-ssä — back-vowel word takes -ssa.' }
  ```

  The UI (`PromptQuestion` in `ItemDetails.tsx`, `splitCloze` in `engine.ts`) renders each hidden span as an underlined blank on the card front and highlighted text on the back. Cloze is the right tool for pattern completion (suffix forms, gradation pairs, command syntax); q/a for meanings and "which tool/flag does X" recall. In note-backed learn blocks the same fields work in YAML (`kind: cloze` plus `{{…}}` in `q`).

## Architecture

Three layers, cleanly separated so a new system only rewrites the first:

### 1. Content pool (`src/data/<topic>.ts`)

Plain TypeScript data, no logic. Shape (`src/components/learn/types.ts`):

```ts
Category { id, title, emoji, description, items: LearnItem[] }
LearnItem { id, term, syntax, description, example, exampleNote, prompts: Prompt[] }
Prompt   { id, q, a, note?, kind? }   // note = one-line elaboration shown with the answer;
                                      // kind: 'cloze' = fill-in-the-blank ({{…}} markers in q)
```

`LearnItem.prompts` is **optional**: on an authored-prompt deck an item legitimately has none until its prompts are written. Read it through `promptsOf(item)` (`types.ts`) rather than dereferencing it — an empty deref is how a prompt-less item silently turns into a "fully remembered" tile.

- **Item** = the unit of *introduction* and of the wall chart (a tile).
- **Prompt** = the unit of *scheduling* (each has its own FSRS card — its own stability, difficulty, and due date). Aim for 2+ prompts per item: typically one "what does X do" and one scenario/flag prompt.
- Prompt ids must be globally unique and stable — they key the learner's saved state, so renaming one orphans its progress.
- An `introductionOrder` export defines the sequence new items appear in. For curated decks it is hand-written and dependency-aware — Finnish (vowel harmony before suffixes, a gradation pattern before the case that uses it, a vocabulary word before the rule item that applies it to that word) and Linux (navigation/files/help fundamentals before pipes and text processing, before processes, storage, networking, systemd) both work this way. Feed-driven decks (til, evergreen, vocab) use newest-first instead, since the feed itself is the curriculum.
- `linux-commands.ts` predates the shared types and keeps its own `Command`/`cmd` naming; `linux-learn-config.ts` adapts it to `LearnItem`/`term` at the config boundary rather than renaming the 1000+ line data file. New content pools should just use the shared types directly (see `finnish.ts`).
- Run `npm run validate-learn` after editing a content pool (it runs in CI too) — it checks prompt-id uniqueness, that every item appears in `introductionOrder` exactly once, and that no category is empty. It folds `authored-prompts.json` in exactly as the build does, so hand-written prompts get the same quality checks, and it flags an authored entry naming an item no deck has (a typo'd id tests nothing, silently). On authored-prompt decks "item has no prompts" is a normal state, not an error.

### 2. Scheduler (FSRS, in `engine.ts`)

The scheduling and persistence logic (`localToday`, `addDays`, `gradeCard`, `itemStatus`, `buildDailySession`, `loadState`/`saveState`, the count helpers) is a pure module, `src/components/learn/engine.ts` — no React, no DOM assumptions beyond `window.localStorage`. `LearningSystem.tsx` (wall chart + session UI) and `LearnHub.tsx` (hub due/new counts) both import it, so the two can't drift out of sync the way the hub's hand-duplicated counts once could. A new consumer (e.g. a future unified `/practice` page) extends the same engine rather than re-deriving it.

Scheduling is [FSRS](https://github.com/open-spaced-repetition/ts-fsrs) (the algorithm modern Anki ships), via the `ts-fsrs` library:

- Each prompt's card carries FSRS's own state — `stability` (days until recall probability drops to the retention target), `difficulty` (1–10), `state` (New/Learning/Review/Relearning), `due`, `reps`, `lapses`, `lastReview` — instead of a Leitner box number. Intervals are computed per card from its own history: easy cards race out to multi-month gaps, hard cards stay short, and a single miss doesn't drag a mature card all the way back to "box 1."
- **Grading stays two buttons.** "Forgot" maps to FSRS's `Again`, "Got it" to `Good`. Hard/Easy exist in the algorithm but aren't exposed — a four-way self-assessment per card is exactly the per-rep decision principle #1 forbids.
- **Desired retention** is fixed at `DEFAULT_RETENTION = 0.9` (FSRS's own default) for now; surfacing it as a per-user setting is deferred to `/practice` (see the unified-practice plan).
- **Day-granular by design.** The FSRS instance is configured with `enable_short_term: false`, which disables Anki's minute-level (re)learning steps — every persisted interval is a whole calendar day, even the very first "Again" on a brand-new card (verified: schedules >= 1 day out, never same-day). `enable_fuzz: false` keeps intervals exact rather than randomized. A same-day second chance after "Forgot" is handled at the *session* level instead: the failed prompt is requeued once at the end of the current session's queue (tracked in `LearningSystem.tsx`, capped at one retry per prompt per session) — turning a slip into a win more often than making the learner wait until tomorrow, while the persisted `due` stays date-based throughout.
- Daily practice session = due prompts only (earliest-due first, capped at `dueCap` per deck). Introduction is a separate, learn-side act: `introduceItem` marks the item and seeds a fresh FSRS card (state `New`, due today) per prompt, so a just-accepted concept's questions arrive in `/practice` through the ordinary due path the same day — no special "new" branch exists downstream.
- The new-item budget (`newPerDay` per deck, `GLOBAL_NEW_PER_DAY` across decks) gates the learn side (`newCandidatesForDeck`/`buildNewToday`), tracked per calendar date so reopening a page mid-day doesn't offer extras.
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

`LearningSystem.tsx` (per-domain, `/learn/<topic>`) has three screens: `chart` (today-strip with the deck's own "Learn today's new items" button plus a link to `/practice`, wall chart, legend, reference panel), `intro` (this deck's new-concept cards for today via the shared `IntroFlow` — accept introduces the item and seeds its prompts due-today; skip suspends it), and `drill` (run through a category's prompts with the same reveal/self-grade UI, but **without touching scheduler state** — cramming for curiosity shouldn't corrupt the spacing data). The graded Q&A flow — `session` (recall prompts, one at a time) → `done` (today's tally, streak, tomorrow's due count) — lives in `PracticeSession.tsx` at `/practice` (see below); grading only ever happens there, while introduction only ever happens on the learn side (`LearningSystem`'s intro screen or `NewToday` at `/learn/new`).

## Finnish vocabulary (`/learn/finnish-vocab`)

Implements plan §Phase 6. The main Finnish deck (`finnish.ts`) is rules-first by design — its own vocabulary category exists only to feed the rule prompts, and stays that way. `finnish-vocab.ts` is a sibling deck on the TIL-style open-feed model: a flat, themed vocabulary pool (verbs, family, food, time, question words/pronouns, places, adjectives — 56 items, 124 prompts in this first batch) meant to grow toward communicative Finnish in curated batches, independent of the main deck's dependency-curated introduction order.

Every word gets both-direction prompts (fi→en, en→fi); a handful additionally get a third "apply the rule" prompt — a genitive `-n` form, or a Type-1 verb's `minä`-conjugation — but *only* where that derived form was independently checked against a pattern `finnish.ts` already establishes (its own inflection bank or a worked "strong → weak" example). Each such prompt's `note` names the existing word it mirrors (e.g. `kaupunki → kaupungin` cites `Helsinki → Helsingin`). Per the "never invent Finnish" rule this repo already enforces for `finnish.ts`, a plausible-looking inflection that wasn't independently verified this way is simply not asserted — the word stays a plain two-prompt vocabulary item instead.

Tuning (`finnish-vocab-learn-config.ts`): `newPerDay: 3`, `dueCap: 14`, `itemNoun: 'word'`, `monoAnswers: false`. Registered in `practiceRegistry` and `scripts/validate-learn-data.mjs` exactly like every other build-time content pool — adding another batch is a data-file edit, not an architecture change.

## Signing in

Several surfaces here can write to the repo — the `/write` composer, cross-device sync, and the authored-prompt commits — and every one needs the same credential: a fine-grained GitHub PAT with **Contents: read and write** on this repo. They used to each ask for it separately, which meant pasting the same token two or three times per device and having nowhere to sign out. They now share one session.

- **`public/auth/session.js`** — the session itself: the token under `site-gh-token`, the GitHub login under `site-gh-login` (display only), sign-in/sign-out, and a subscription so one island's sign-in re-renders the rest of the page. It lives in `public/` on purpose: the Astro side imports it through `src/components/auth/session.ts` (Vite bundles it like any module), and the `/write` composer — a standalone static page outside the Astro build — imports it over the wire from `/auth/session.js`. One physical file, two consumers, no chance of drift. Same reasoning as `src/utils/learnBlockParser.mjs`.
- **`functions/api/auth-check.js`** — verification. The token is checked against the repo before it's stored, so a typo or a wrongly-scoped token fails at sign-in with something readable instead of surfacing later as a mystery sync error. It runs server-side because the work network blocks `api.github.com` — the same reason `api/til/sync.js` exists. A fine-grained PAT scoped to the wrong repository gets a 404 rather than a 403, so that case is reported as "can't see this repository" rather than a generic failure. The token is used for those two calls and never stored server-side.
- **`src/components/auth/SignIn.tsx`** — the UI, styled from `tokens.css` via `src/styles/auth.css` so it matches the site in both themes. `SignInPanel` is a button that opens a token box (or the signed-in line with a way out); `RequireAuth` wraps anything that needs a token; `useSession` is the hook that keeps islands in step.

**Nothing breaks for a browser that was already signed in.** `microwrite.token` (the composer's old key) and `practice-sync-token` (`/practice`'s old key) are read on first load and adopted into the shared key — the login moved, which is not a reason to make anyone paste a token again. Adoption is idempotent and never overwrites a newer token.

**Signing out signs out everywhere,** including those two pre-session keys — leaving them would mean the next page load quietly adopts one and signs the device back in. Both properties are pinned by `scripts/test-session.mjs`.

Sign-in is never a wall. `/practice` works fully signed out (local-only, as it always did), and `/learn/new` still lets you write prompts — it just says up front that they'll stay in this browser instead of reaching the repo and your other devices.

## Authored prompts (`linux`, `finnish`, `finnish-vocab`, `vocab`)

The four automated/curated decks ship **reference cards only**. Their items have a term, syntax, description, and worked examples — and no questions. The questions are written by hand, by the learner, at the moment the concept is introduced.

**Why.** The prompt is the thing the deck is actually made of, and writing one is not clerical work: deciding what's worth remembering about a command, and phrasing the question that retrieves it, is an act of understanding — and the first rep. Pre-written prompts skip that. They also drift: a stranger's guess at which flag matters is rarely the one you'll need at 2am. The note-backed decks never had this problem (their prompts are authored in the note, by the same person, at the same time), which is exactly why they're excluded from this. Design principle #1 still holds — the *system* chooses which concept comes up today; the learner only decides what to ask about it.

**Where they live.** `src/data/authored-prompts.json`, committed to the repo:

```json
{ "version": 1, "items": { "<itemId>": { "prompts": [ { "id", "q", "a", "note?", "kind?" } ], "updatedAt": "<ISO>" } } }
```

Not the practice-state KV blob, which holds *state* — stability numbers, due dates, prompt ids. These are *content*, hand-written, and belong in git with every other content pool: versioned, diffable, greppable, editable in an editor when a prompt turns out to be badly phrased. `src/data/authored-prompts.ts` is the single build-time boundary that imports the JSON; each authored deck's config wraps its dataset in `withAuthored(...)`, so the registry counts, `/api/practice/<deck>.json`, and the `/learn/<topic>` pages all see the prompts without knowing the file exists.

**How they get there.** `functions/api/practice-prompts.js`, a Pages Function that commits to `main` — the same commit mechanics as `api/til/sync.js`, and the same auth as `api/practice-state.js`: the site's shared sign-in token (see above) sent as a bearer token, checked for push access. No new secret, and nothing extra to mint. `POST` read-merges-writes against the live file (later `updatedAt` wins per item), so two devices authoring different concepts the same day both keep their work; a `409`/`422` from a concurrent write is retried once from a fresh read rather than forced.

**The rebuild gap.** A commit doesn't reach the built datasets until Cloudflare redeploys, so:

- the authoring device caches what it wrote in `localStorage` (`practice-authored-prompts`) and overlays it on top of whatever the build shipped — today's practice has the prompts immediately;
- any device holding a PAT pulls the live file straight from GitHub via `GET /api/practice-prompts`, on the same triggers as the state blob (load, focus, connect);
- the merge is last-write-wins per item on `updatedAt` — deterministic and idempotent in either direction, exactly like `mergeSrsState`.

Whole entries merge together rather than prompt-by-prompt: an item's prompts are edited as a set, so merging individually would resurrect prompts that were deliberately deleted.

**The composer** (`PromptComposer.tsx`, rendered by `IntroFlow` when the deck sets `authorPrompts`) is rows of question/answer plus an optional note and a "fill in the blank" toggle (which derives the answer from the `{{…}}` markers rather than asking twice). It refuses to introduce a concept with no prompts, or with a prompt that breaks the rules in "Writing prompts" — the same checks `validate-learn-data.mjs` runs, applied in the browser so a prompt can't fail the build that publishes it. A half-finished second row blocks rather than being silently dropped; dropping it would lose work the learner thinks they've saved.

**Prompt ids** are `<itemId>-a<n>`, where `n` is one past the highest this item has *ever* carried — deleting a prompt and adding another gives the new one a fresh id rather than inheriting the deleted one's review history. The `a` keeps them clear of the `-p<n>` ids the note-backed decks generate positionally.

**Failure mode.** The prompts are cached and scheduled whether or not the commit lands; a failed commit surfaces as "Saved on this device, but not to the repo — …" on the intro card rather than a silent success. This is the one place in the learning system where a sync failure is *not* silent: everything else that fails silently is state that can be re-derived, and this is content that can't.

**Migration.** The four decks used to ship 448 hand-written prompts across 200 items. Those were removed, but concepts already introduced still have FSRS cards keyed by their prompt ids, so dropping them outright would orphan real review history. `src/data/legacy-prompts.json` is the frozen snapshot taken before the strip, served lazily from `/api/practice/legacy-prompts.json` (~96KB, fetched only when a device has introduced concepts predating the change). On load, any *already-introduced* item with nothing authored adopts its old prompts, ids byte-identical, so every card keeps its stability, due date, and lapse count — then they're committed like anything else, and are editable from then on. Concepts not yet met stay unprompted: those are the ones you write.

## Note-backed decks (`/learn/til`, `/learn/evergreen`)

These decks follow Matuschak's mnemonic-medium model: prompts are authored by the writer, inline, inside the note they test — the machinery only collects them. They are deliberately **not** authored-prompt decks (see above): a note's prompts are already written by the right person at the right moment, so there's nothing for a composer to add. A note opts into its deck simply by containing a fenced ` ```learn ` block with YAML inside:

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

The parsing core (the fence regex, the q/a-shorthand splitter, `firstParagraph`/`firstCodeBlock`/id helpers) lives in `src/utils/learnBlockParser.mjs` — plain JS, no TypeScript, so it can be imported unmodified both by this Node script and by a browser bundle (see the people deck below, the second consumer that made the extraction worth doing).

## The people deck (`/learn/people`) — local-first, private

Implements plan §5.2/Phase 4. Unlike every other deck, person-note content never enters this repo, the content branch, or the site build at all (plan §5.1's privacy constraint) — `/learn/people` ships as a shell with zero data, and everything on it comes from what a given browser has imported into its own IndexedDB.

- **Authoring** — person notes are written exactly like TIL/evergreen notes (markdown, a learn block at the end), kept in the vault outside the GitSync/content-branch setup. A block-less note still works: the importer generates a default prompt (photo → name if the note has a photo, first-paragraph → name otherwise) so a hastily captured note is practicable immediately.
- **`src/components/learn/peopleDeckBuilder.ts`** — the "Build deck file" logic, entirely client-side. Takes the `.md` notes and any referenced photos dropped on the page, splits frontmatter with a small hand-rolled parser (gray-matter stays build-script-only), runs bodies through the shared `learnBlockParser.mjs`, and produces a `LearnDataset` with the same item-id scheme and category-by-tag grouping `extract-learn-blocks.mjs` uses. Photos are matched against dropped files by frontmatter `photo:` filename, downscaled to a 128px JPEG data URI via an offscreen `<canvas>`, and embedded directly on the item (`LearnItem.photo?: string` — rendered as a thumbnail wherever an item's reference/prompt is shown, and simply absent for every other deck). The result downloads as a self-contained `people-deck.json`; nothing is ever sent to a server.
- **`src/components/learn/peopleDeckStore.ts`** — deck *content* lives in IndexedDB (`people-deck-db`), not localStorage, since embedded photos push well past its ~5MB budget. SRS *state* stays exactly where every other deck keeps it — `people-learn-srs` in localStorage, keyed by prompt id, through the same engine functions. Re-importing replaces the IndexedDB record wholesale and prunes the SRS state's `cards`/`introduced` entries against the new item/prompt id set (plan §5.2 step 4).
- **`/learn/people.astro` + `PeopleLearnPage.tsx`** — `index={false}` (noindex), no build-time dataset. Loads whatever's in IndexedDB (or nothing) on mount and renders the ordinary `LearningSystem` wall chart/reference/drills, alongside always-visible "Build deck file" and "Load deck" panels.
- **Registry entry** — `practice-registry.ts` adds `people` as a manual `PracticeDeck` literal (`source: { kind: 'local' }`) rather than through `summarize()`, since there's no build-time config/dataset to summarize; `totalItems`/`totalPrompts` sit at 0 there and the blurb says so outright. `PracticeSession.tsx` closes the gap where it actually matters — a `LOCAL_DATASET_LOADERS` map loads the people deck from IndexedDB alongside every other deck's state on mount, and due/new counts, the deck-list row, and queue-building all use that live dataset in place of the registry's static zero. On a device with nothing imported, the deck simply contributes nothing to the queue.
- Tuning (`src/data/people-learn-config.ts`, shared by the registry entry and the live config so they can't drift): `newPerDay: 2`, `dueCap: 8`, `itemNoun: 'person'`, `monoAnswers: false`.

## The vocabulary deck (`/learn/vocabulary`)

Implements plan §4 (feed side; manual capture via `category: vocab` inbox notes is not yet built — see Planned evolution). One English word a day, fed automatically — the *word* is automated, the prompts that test it are not (see "Authored prompts"):

- **`scripts/fetch-wotd.mjs`** — pulls **Merriam-Webster's** Word of the Day RSS and upserts words into `src/data/vocab.generated.json`, keyed by a slugified form of the word. Runs daily via `.github/workflows/fetch-wotd.yml`; `npm run fetch-wotd` to run it by hand.
  - **One source.** M-W is the only source; Wiktionary's featured feed was dropped. M-W's entries are editorially curated rather than crowd-authored, and each carries a pronunciation, a part of speech, one clean defining sentence, and a usage example — everything the reference card wants, from one parse. Wiktionary's glosses are serviceable but arrive wrapped in parenthetical usage labels, with no example and (as it turned out) no reliably detectable part of speech, which is why every word captured under it sits in the "Other" category. Words already on file from Wiktionary stay: they're history, and their item ids key real review state.
  - **One word.** At most one new word is added per run — the newest not already on file. The feed carries about a week of items, so without this a fresh checkout or a run after a few missed days dumps seven words into the deck at once. A missed day isn't lost, it's picked up tomorrow.
  - **Parsing** is a handful of targeted regexes against the feed's known structure, not a full XML/HTML parser: the headword comes from `<title>`, and pronunciation, part of speech, definition, and example are cut out of the `<description>` line (pronunciation between backslashes, part of speech immediately after, definition up to M-W's `//` example marker, example up to the "See the entry" trailer). Each field degrades independently — a missing pronunciation costs that field, not the word. A word that doesn't parse cleanly is skipped with a warning, never a build failure. Because regexes against someone else's markup are only defensible if they're pinned down, `scripts/test-wotd-parser.mjs` (`npm run test:wotd`, run in CI) exercises the parser against captured feed output with no network involved.
  - Idempotent by design: a word already on file keeps its original record and is never re-fetched or overwritten, so a re-run or a duplicated cron fire is harmless and hand edits are safe.
- **`src/data/vocab-dataset.ts`** — the pure transform from the raw word-keyed JSON into a `LearnDataset`: groups words into categories by part of speech (noun/verb/adjective/…, falling back to "Other") and builds each word's reference card — headword, a trimmed defining phrase, the full definition, the pronunciation, and the day's usage example. It builds **no prompts**: vocab is an authored-prompt deck, so the recognition/production pair it used to generate is now something you write when the word comes up. This file is deliberately import-free beyond types (no JSON import) so `scripts/validate-learn-data.mjs` can load it directly under plain Node without hitting Node's import-attribute requirement for JSON modules; `vocab-learn-config.ts` is the thin adapter that actually imports `vocab.generated.json` and calls `buildDataset` on it, the same "adapt at the config boundary" pattern `linux-learn-config.ts` uses.
- **Tuning** — `newPerDay: 1` (matches the feed's natural one-word-a-day cadence), `dueCap: 6`, `monoAnswers: false` (prose, not commands), `itemNoun: 'word'`.
- **Not yet built**: manual capture via `category: vocab` inbox notes with Wiktionary-REST-API definition enrichment (plan §4.1.2) — deferred because it would need a new content-collection category (nav, routing, RSS, sitemap implications) that hasn't been scoped yet, unlike the feed side which only touches the learn/practice surface.

## Skip-at-introduction (`suspended`)

Implements plan §4.4, generalized to every deck in the registry rather than vocabulary alone. Every new-concept card in the learn-side intro flows (`IntroFlow`, used by `/learn/new` and each deck's own intro screen) carries a "Skip — don't learn this" action next to "Got it": clicking it adds the item's id to `practice-meta.suspended` without touching the item's `SrsState` at all (it stays fully unintroduced). Both `buildUnifiedQueue` (due collection) and `newCandidatesForDeck`/`buildNewToday` (introduction candidates) filter against `suspended`.

A suspended item shows as a distinct muted tile (`lq-tile--suspended`, dashed/struck-through) on its deck's `/learn/<topic>` wall chart — `LearningSystem.tsx` loads `practice-meta` (read-only) alongside its own `SrsState` purely to check membership, overriding whatever `itemStatus` would otherwise compute (always `unseen`, since a suspended item is never introduced). Selecting the tile's reference panel shows a "Bring back to practice" button that removes the id from `practice-meta.suspended` — the reversibility the plan calls for, with no separate "suspended list" page needed since the wall chart already is one.

## The hub (`/learn`)

`/learn` renders one card per system — territory only: emoji, blurb, item/prompt totals, and a "territory progress" line ("38% of the territory introduced") derived from `state.introduced` versus the deck's total item count. It no longer shows due/new counts or a per-card CTA. Two banners above the cards mirror the ritual's two halves: "New today — N new concepts to learn →" links to `/learn/new`, and "Today's practice — N due →" links to `/practice`. Both banners and the per-card status line are computed client-side in `LearnHub.tsx`, read from each system's localStorage key. Systems stay fully independent; the page receives lightweight build-time summaries (`storageKey`, `newPerDay`, `dueCap`, item/prompt totals) rather than the datasets, sourced from `practiceRegistry` (see below) so the island stays small. The count derivation mirrors `engine.ts`'s exactly — keep them in sync if the state schema changes.

## The new-today page (`/learn/new`)

The combined learn-side surface: every deck's new-concept candidates for today, merged round-robin across decks up to `GLOBAL_NEW_PER_DAY` (`buildNewToday` in `engine.ts`), rendered one full reference card at a time by `NewToday.tsx` via the shared `IntroFlow`. Accepting a card calls `introduceItem` (marks introduced, seeds each prompt's card due-today) against the deck's own `storageKey`; skipping suspends the item. On mount it pulls-and-merges the sync blob first (when connected) so a concept introduced on another device isn't offered again, and pushes after each accept/skip. The done screen links straight to `/practice`, where the just-introduced prompts are already waiting. Each deck's own `/learn/<topic>` page offers the same flow scoped to that one deck — use whichever entry point fits the day.

## The unified practice session (`/practice`)

The daily Q&A ritual — due reviews interleaved across every deck, questions and answers only — lives at `/practice`, not on the per-domain pages. Implements plan §1–§2 of [`planning/practice-system-unified-srs.md`](../../planning/practice-system-unified-srs.md), with introduction since moved out to the learn side:

- **Registry** (`src/data/practice-registry.ts`, server-only) — a `PracticeDeck[]` derived at build time from each system's existing `*-learn-config.ts`: `id`, `title`, `emoji`, `blurb`, `itemNoun`, `monoAnswers`, `newPerDay`, `dueCap`, `storageKey`, `legacyKey`, `totalItems`/`totalPrompts` (counts only), and a `source` (`{ kind: 'json', href }` for public decks served from `/api/practice/<id>.json`, or `{ kind: 'local' }` for a future browser-only deck like people). This module imports the full content pools, so it must only ever be imported from Astro frontmatter (`practice.astro`, `learn/index.astro`) — never from a `client:load` island, which receives the derived array as a prop instead.
- **Per-deck dataset endpoint** (`src/pages/api/practice/[deck].json.ts`) — a prerendered route (same pattern as `api/link-previews/[category].json.ts`) serving each deck's `LearnDataset` as static JSON, so the practice island can fetch just the decks it needs instead of bundling every content pool.
- **Queue composition** (`buildUnifiedQueue` in `engine.ts`) — gathers each deck's due candidates (earliest-due first, capped at the deck's own `dueCap`), then merges them **round-robin across decks** up to `GLOBAL_DUE_CAP = 20` — fairness so one deck's backlog can't starve another, and free interleaving. A deck's own budget can outlast one capped session; running `/practice` again the same day picks up wherever the global cap left off. New concepts never appear here — when today's new budget has anything left, the home screen shows a nudge linking to `/learn/new` instead.
- **`PracticeSession.tsx`** — the island: loads every enabled deck's `SrsState` from localStorage (no fetch), only fetches datasets for decks that actually contribute to today's queue, renders each flip card with a deck badge (cloze prompts mask their `{{…}}` spans until the flip), grades against the same `gradeCard`/FSRS engine (this is the *only* place grading saves `SrsState`), and keeps the same-session "Forgot" requeue behavior.
- **`practice-meta`** (one shared localStorage key, `PracticeMeta` in `engine.ts`) — the one genuinely global piece of state: `streak` (seeded from the max of existing per-deck streaks the first time it's created), `lastSessionDate`, `totalSessions`, `disabledDecks` (deck toggles, "pause Finnish for a month" — a checkbox per deck on `/practice`), `suspended` (item ids skipped at introduction — plumbed through now, populated once a deck adds a skip action per plan §4.4). Per-deck `streak`/`totalSessions` fields stop being read; the deck's own `SrsState` still carries them as harmless leftovers.
- **Export/import** — a JSON blob of every registry deck's storage key plus `practice-meta`, downloaded/uploaded from `/practice`, is the manual backup and escape hatch, independent of sync.

`/learn/*` pages keep exactly the wall chart, reference panel, and no-op drills — `LearningSystem.tsx` no longer has a `session`/`done` screen or `startDaily`/`gradeCard` path; its "Start today's review" button is now a link to `/practice/`.

## Cross-device sync (`/practice`, opt-in)

Implements plan §2.8: practicing from phone, Mac, and work laptop without any of them being the single point of failure. Off by default — everything above works local-only; sync is an opt-in "Connect this device" step on `/practice`.

- **`functions/api/practice-state.js`** (Cloudflare Pages Function) — `GET` returns the stored blob (`{}` if nothing saved yet), `PUT` replaces it. The blob is opaque to the function: every registry deck's `SrsState` plus `practice-meta`, as one JSON object keyed by localStorage key — merging is entirely client-side, so this function only needs to store and retrieve bytes.
- **Auth** — the same pattern as `api/upload.js` and `api/til/sync.js`: a bearer token that is a fine-grained GitHub PAT, accepted only if GitHub confirms push (Contents write) access to this repo. No new secret class, no accounts. **Mint one PAT per device** — losing a device means revoking its token in GitHub settings; the KV blob itself is untouched.

  **The token comes from the site's sign-in**, not from this page — see "Signing in" below. Signed in means sync is on; there is no separate connect step.
- **Safety net** — KV has no history of its own, so the function copies the previous blob to `state:backup:<UTC date>` before every overwrite, and prunes backups older than 7 days. A bad push is recoverable by hand from a backup key.
- **Client wiring (`PracticeSession.tsx`)** — `pullAndMerge` runs on page load, on tab focus, and after "Connect this device"; it fetches the remote blob and merges it into local state (`mergeSrsState`/`mergePracticeMeta` in `engine.ts`), then writes the merged result back to localStorage. `pushState` fires at the end of every finished session, plus debounced (4s) after each grade mid-session, reading the current per-deck blobs straight from localStorage (never from React state, which can be one render behind a just-graded card) and PUTting them.
- **Merge rules** (`mergeSrsState`/`mergePracticeMeta`), deterministic and idempotent — safe to run in either direction any number of times:
  - per prompt id: keep the card with the higher `reps` (tie → later `lastReview`) — `reps` only ever grows, so this is conflict-free;
  - `introduced`: union, earliest date wins;
  - `disabledDecks`/`suspended`: union;
  - `streak`/`totalSessions`/`lastSessionDate` travel together as a triple, taken from whichever side has the later `lastSessionDate`.
- **Failure mode** — any fetch failure (no binding configured, bad token, offline) degrades silently to local-only; `/practice` shows a quiet "Sync unavailable right now — practicing locally" line instead of an error, and every feature above keeps working without a token at all.
- **Private decks stay private** — the sync blob only ever contains SRS *state* (stability/difficulty numbers, dates, prompt ids), never deck *content*, so a future private deck's review state could sync without the deck's actual data ever touching KV.

### One-time KV setup (Cloudflare dashboard)

1. **Workers & Pages → your Pages project → Settings → Bindings → Add → KV namespace** — variable name **`PRACTICE_STATE`** (must be exactly this). Create a new namespace if one doesn't exist yet. Apply to Production (and Preview if you want sync from preview deploys).
2. Redeploy the site once so the binding takes effect.

Until the binding exists, `/api/practice-state` returns a clear "PRACTICE_STATE KV binding is not configured" error and sync stays silently disabled — nothing else on `/practice` is affected.

## Building a new system

A new *learning* system (wall chart + reference) is data plus a config plus a page:

1. **Write the content pool** — `src/data/<topic>.ts` exporting `categories: Category[]` and `introductionOrder: string[]` per the shared types. For language material the "item" is a word/phrase, "syntax" its canonical form, "example" a usage sentence. On an authored-prompt deck this is *all* you write — items are reference cards and the `prompts` field stays absent. Where prompts are authored in the pool, they should go *both directions* (fi→en and en→fi as separate prompts — they are different memory acts and deserve separate schedules).
2. **Write a config** — `src/data/<topic>-learn-config.ts` exporting a `LearnSystemConfig`: `storageKey` (never share state between decks), `newPerDay`, `dueCap`, `itemNoun` (used in UI copy like "3 new words"), `monoAnswers` (`true` renders answers in `<code>`; set `false` for prose languages like Finnish, which uses the serif body font instead), `authorPrompts`, and `dataset`.

   Decide `authorPrompts` deliberately. Set it `true` (and ship no prompts in the pool) whenever the material arrives from somewhere else — a feed, a frequency list, a reference manual — and wrap the dataset in `withAuthored(...)` from `src/data/authored-prompts.ts`. Leave it `false` only when the prompts are written by the same person who wrote the material, at the same time, as with the note-backed decks.
3. **New page** at `/learn/<topic>.astro` — render `<LearningSystem client:load config={yourConfig} />`, import `src/styles/learn.css`, and add a `.learn-<topic>-page`/`__title`/`__subtitle` selector group to that stylesheet (or reuse an existing one).
4. **Register it for practice** — add an entry to `practiceRegistry` in `src/data/practice-registry.ts` (metadata + a `source`) so it joins the unified queue and the `/api/practice/<id>.json` endpoint. A deck can be practice-only, with no `learnHref`, if it never gets its own wall chart.
5. **Validate** with `node scripts/validate-learn-data.mjs` before opening a PR.
6. **Tune the constants** to the material: language decks usually want more new items per day and can tolerate a higher due cap; dense technical material wants fewer. See the tuning table below.

## Tuning knobs

| Constant | Linux | Finnish | Finnish Vocab | TIL | Evergreen | Vocab | People | Meaning |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `DEFAULT_RETENTION` | 0.9 | same | same | same | same | same | same | FSRS's desired-recall-probability target (fixed in the engine, not per-config) |
| `newPerDay` | 2 | 3 | 3 | 2 | 1 | 1 | 2 | New items introduced daily (per deck, before the global cap) |
| `dueCap` | 8 | 12 | 14 | 8 | 6 | 6 | 8 | Max reviews shown per day (per deck, before the global cap) |
| `GLOBAL_DUE_CAP` | 20 | same | same | same | same | same | same | Max reviews across all decks in one `/practice` session |
| `GLOBAL_NEW_PER_DAY` | 5 | same | same | same | same | same | same | Max new concepts across all decks per day on `/learn/new` |
| `STRONG_STABILITY_DAYS` | 21 | same | same | same | same | same | same | Stability threshold for the "solid" tile color (fixed in the engine) |
| `monoAnswers` | `true` | `false` | `false` | `true` | `false` | `false` | `false` | Whether revealed answers render in `<code>` (commands) or prose (natural language) |
| `authorPrompts` | `true` | `true` | `true` | `false` | `false` | `true` | `false` | Whether the learner writes the prompts at introduction time (see "Authored prompts") |

Raising `dueCap` clears backlogs faster after missed days but lengthens sessions; the cap is safe because capped-out cards remain due and surface the next day. `DEFAULT_RETENTION`, `STRONG_STABILITY_DAYS`, and the two `GLOBAL_*` caps live as constants inside `engine.ts` rather than any config — no deck has needed to deviate from them yet.

`/learn/new` (`NewToday.tsx`) also passes `guaranteedGroups: [['vocab'], ['finnish', 'finnish-vocab']]` into `buildNewToday` — one reserved slot each for English and Finnish, taken before the ordinary round-robin fills the rest of the 5-item cap. Without it, plain round-robin in `practiceRegistry` order lets `linux`/`finnish`/`finnish-vocab`/`til`/`evergreen` (five decks, in that order) exhaust the cap on their own on any day they all have candidates, starving `vocab` (English) entirely — Finnish already had two decks' worth of representation, English had none. `buildNewToday`'s `guaranteedGroups` param is generic (a list of deck-id priority groups, one guaranteed pick per group); the English/Finnish grouping itself is a call-site decision in `NewToday.tsx`, not baked into the engine.

## Deliberate non-features

- **No penalties for missed days.** The due pile waits, capped per session. Guilt mechanics kill daily rituals.
- **No ease factors beyond FSRS's own, no fuzzing.** `enable_fuzz: false` keeps intervals exact and debuggable; FSRS's built-in difficulty/stability model already goes further than a fixed ease factor would.
- **No accounts, no server-side scheduling.** Sync (above) moves an opaque state blob between devices; every scheduling decision still happens client-side.

## Planned evolution

`/practice` and its cross-device sync, the vocabulary deck and skip-at-introduction, the local-first people deck, and the Finnish vocabulary sibling deck (this document, current sections) implement plan Phases 0–2b and 4 and 6 of [`planning/practice-system-unified-srs.md`](../../planning/practice-system-unified-srs.md) — the learn/practice split, the deck registry, the unified queue, opt-in sync, the automated vocab feed, a private deck with no server-side footprint at all, and a first batch of communicative Finnish vocabulary. Manual vocab capture via `category: vocab` inbox notes (plan Phase 3b) is deliberately deferred — it needs a new content-collection category and its own design pass, unlike everything else here which only touched the learn/practice surface. Phase 5 (leeches, keyboard shortcuts, per-deck stats, a real quick-add composer) is still ahead; this document stays authoritative for what is implemented as each phase lands.

Authored prompts (above) are not from the plan — they came later, and they change what the plan's "content pool" means for four of the decks. Known rough edges: there's no edit-a-prompt-later surface yet (fix a bad prompt by editing `authored-prompts.json` directly, which is much of why it lives in git), and an item whose prompts are all deleted shows as `due` on the wall chart with nothing to practice, which is the honest signal but not a pleasant one.
