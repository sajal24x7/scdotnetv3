# Making the learn/practice system a mnemonic medium

Status: proposal. Nothing here is implemented yet.
Scope: `/learn`, `/learn/new`, `/learn/<topic>`, `/practice`, note pages, and the authoring
surfaces that feed them.
Companion documents: [`docs/architecture/learning-systems.md`](../docs/architecture/learning-systems.md)
(what exists today) and [`planning/practice-system-unified-srs.md`](practice-system-unified-srs.md)
(the plan that produced it).

## 1. Why this document

The scheduler half of the system is faithful to the research already: FSRS, two-button grading,
bounded interleaved sessions, atomic prompt rules, learn and practice separated, prompts written by
the person who will answer them. What is missing is the *medium* half. Two problems, and they pull
in opposite directions:

1. **The prose and the prompts never meet.** `src/utils/learnBlocks.ts` strips every
   ` ```learn ` block out of the rendered note, so a reader of a TIL or evergreen note never sees a
   prompt, and a practicer at `/practice` never sees the note. That is the reverse of the mnemonic
   medium, where the prompt sits in the text, immediately after the passage that teaches it.
2. **Writing the prompt is the exercise, and automation would delete it.** Linux, Finnish, Finnish
   vocabulary and word-of-the-day arrive as material from elsewhere. Deciding what is worth
   remembering about a command, and phrasing the question that retrieves it, is the act of
   understanding. If prompts were shipped with the material, or generated, that act disappears and
   the deck becomes someone else's flashcards.

Solving (1) naively (embed ready-made prompts everywhere, the Quantum Country model) makes (2)
worse. This document resolves the tension rather than picking a side.

## 2. What the research actually says

Sources, all from Matuschak and the Quantum Country work:

- [How to write good prompts](https://andymatuschak.org/prompts/) and
  [Important attributes of good spaced repetition memory prompts](https://notes.andymatuschak.org/z42J1vxsMjhkdbrqVfoqjiEesSzfaEqurBtoJ):
  prompts should be **focused, precise, consistent, tractable, effortful**.
- [Spaced repetition memory prompts should connect and relate ideas](https://notes.andymatuschak.org/z49EwwPL1CzKHTyLHXwJJH7hsciCg772Vm5WJ)
  and [Avoid orphan spaced repetition memory prompts](https://notes.andymatuschak.org/z8QtbrR4cxDshTYBq3RCfwUVkXS8mSjRmAnqk):
  a prompt with no connection to what you already know invites shallow pattern matching.
  [Elaborative encoding](https://notes.andymatuschak.org/z9Uq4yzBT1QaBU8twwyvm7P) is why.
- [Writing one's own spaced repetition prompts seems to promote understanding](https://notes.andymatuschak.org/z219EBYg9SbQzF372qudzgJpArt4Bmfhrczkg):
  the generation effect is real (Pan et al. 2022 found d=0.45 for self-authored definition
  questions, d=0.29 for application questions).
- [Writing good spaced repetition memory prompts is hard](https://notes.andymatuschak.org/zKy4FsHTcf8LdkgXkMueeGL)
  and [The mnemonic medium supplies expert-authored prompts to remove the burden of prompt-writing](https://notes.andymatuschak.org/The_mnemonic_medium_supplies_expert-authored_prompts_to_remove_the_burden_of_prompt-writing):
  what you lose by not writing your own is usually repaid in card quality, because most self-made
  cards are poor.
- [The mnemonic medium may help scaffold prompt-writing through author-provided prompts](https://notes.andymatuschak.org/zJSUEFHrJLVspreiCpnAnKJ)
  and [The mnemonic medium should give readers control over the prompts they collect](https://notes.andymatuschak.org/z8kPkXQZ3wVR5DfJ79uhnuz):
  the middle ground Matuschak names explicitly is **partial or starter templates** the reader adapts
  and completes, plus the ability to edit, delete and add prompts afterwards.
- [Timeful Texts](https://numinous.productions/timeful/) and
  [The mnemonic medium can be adapted to author an experience which unfolds over time](https://notes.andymatuschak.org/zKRrv2DmKp3VyDEp3oXrKXQ):
  a prompt is not written to be read once. It will be met dozens of times over months, so it has to
  survive re-reading, and it has to be revisable when it does not.
- [The mnemonic medium can help readers apply what they've learned through simple application prompts](https://notes.andymatuschak.org/The_mnemonic_medium_can_help_readers_apply_what_they%E2%80%99ve_learned_through_simple_application_prompts):
  recall prompts are the floor, not the ceiling.

**The synthesis for this site.** Both halves of the finding are true at once: writing your own
prompts is where understanding happens, *and* writing good prompts from a blank page is hard enough
that most people write bad ones or stop. The blank page is the enemy, not the automation. So:

> The system supplies the material, the structure, and the critique. The learner supplies the
> thinking. Nothing ever writes a finished prompt on the learner's behalf.

Concretely that means scaffolds (typed slots, worked examples, patterns per deck), a real revision
loop, and prose next to prompts. It does not mean pre-filled questions, and it does not mean
generated questions.

## 3. Where the system stands today

| Surface | What it does now | Mnemonic-medium gap |
| --- | --- | --- |
| Note page (`[...slug].astro`) | Learn blocks stripped by `remarkStripLearnBlocks` | Prompts invisible to the reader. The note is not a timeful text |
| `/learn` hub (`LearnHub.tsx`) | Deck directory plus two banners, territory percentage per deck | Says nothing about the writing work: unwritten prompts, weak prompts, notes with no prompts |
| `/learn/new` (`NewToday.tsx`, `IntroFlow.tsx`) | One extracted reference card at a time, composer for authored decks, accept or skip | Introduction is divorced from the source prose. Composer is a blank page with rules attached |
| `/learn/<topic>` (`LearningSystem.tsx`) | Wall chart, reference panel, ungraded drills | Reference panel is the only place prose and prompts sit together, and it is read-only |
| `/practice` (`PracticeSession.tsx`) | Unified due queue, flip card, two-button grade | The back of the card shows answer plus note only. `item.href` and the reference card are in hand (`PracticeQueueItem` carries the whole item) and unused. No way to fix a bad prompt at the moment you discover it |
| Prompt quality | `promptIssue` enforces focused, precise-ish, effortful (no true/false), answers under 8 words | Nothing addresses **tractable** or **connected**. `lapses` is tracked in state and never surfaced |
| Prompt revision | Edit `src/data/authored-prompts.json` by hand | No in-product edit surface at all. A prompt written badly at 7am is permanent in practice |

## 4. The design position

Four rules to hold every change below to:

1. **Never author for the learner.** No shipped prompts on the automated decks, no generated
   questions. The generation effect is the point.
2. **Never present a blank page.** Every authoring moment offers typed slots, a pattern appropriate
   to the deck, and worked examples drawn from prompts that already exist.
3. **Prompts live next to prose.** In the note, in the reference card, and on the back of every
   practice card.
4. **A prompt is a draft until it survives review.** Failure is evidence about the prompt, not only
   about the learner, and the fix must be reachable at the moment of failure.

## 5. Changes

### A. Bring prose and prompts together

**A1. Render learn blocks inline on the note page.** Replace the strip-only behaviour with a
transform: `remarkStripLearnBlocks` becomes `remarkLearnBlocks`, which swaps the code node for an
HTML placeholder carrying the parsed prompts (`<div data-learn-prompts='…'>`). `PostLayout.astro`
hydrates the placeholders with a small island that reuses `PromptQuestion` from `ItemDetails.tsx`
and grades through `engine.ts` against the deck's existing `storageKey`. Notes are `.md`, not
`.mdx`, so the placeholder plus hydration route is the one that works without changing the content
pipeline.

Behaviour on revisit follows Orbit rather than Quantum Country: show un-introduced prompts as "add
to practice", show introduced prompts only when they are due, and otherwise collapse to a quiet
line ("3 prompts, next due in 6 days"). A re-read must not become a pop quiz.

Keep the string strip for RSS, hover previews and backlink snippets (`src/utils/rss.js`,
`contentPreview.ts`, `backlinks.ts`). Those surfaces are non-interactive.

**A2. Per-section placement becomes the authoring convention.** `LEARN_BLOCK_RE` is already global
and the parser already accepts several blocks per note, so a block after each section works with no
data-model change. Document it as the preferred style: the prompt goes under the passage that earns
it, not in a lump at the end.

**A3. Context on the back of every practice card.** `PracticeSession.tsx` reveal currently renders
term, answer and `prompt.note`. Add the collapsed reference card (`ItemDetails`) and "Read the note
→" where `item.href` exists. A miss should be one click from the prose that explains it.

**A4. The note is the introduction surface for note-backed decks.** For `til` and `evergreen`,
`IntroFlow` shows an extracted description while the real explanation sits one link away. Once A1
exists, `/learn/new` should link into the note anchor for those decks, or render the note body in
the card, rather than paraphrasing it.

**A5. Item reference pages for the authored decks.** `linux`, `finnish`, `finnish-vocab` and
`vocab` have prompts in `authored-prompts.json` with no prose around them anywhere. A per-item view
(reference content plus that item's prompts inline, editable) gives every deck the same
reading-with-prompts surface and gives A6 somewhere to live.

### B. Fix the authoring moment, without automating it

This is the direct answer to "writing the prompt is part of the exercise". Keep the act, remove the
blank page.

**B1. Prompt patterns per deck.** `PromptComposer` today offers an empty question box and an empty
answer box. Replace the first row with a choice of *slot templates*, defined per deck in its
`*-learn-config.ts`, each of which is a partially-written question the learner completes. Nothing is
ever submitted as written: every template contains a blank the learner has to fill from their own
understanding, and the composer refuses a prompt where the blanks are untouched.

Sketch, by deck:

| Deck | Patterns offered |
| --- | --- |
| linux | "You are trying to ___ and hit ___. Which tool?" (scenario recall), "What does `-x` change about `cmd`?" (flag effect), cloze on the canonical invocation |
| finnish | "Which rule applies to ___?" (rule recognition), "Apply ___ to the word ___" (procedure application), cloze on the derived form |
| finnish-vocab | fi to en, en to fi, and one use-in-context cloze |
| vocab | word to meaning, meaning to word, and one personal-connection prompt ("where would I actually use this?") |
| til / evergreen (in-note) | claim, mechanism, worked example, and the "why not the obvious alternative" prompt |

**B2. A required connection prompt on concept decks.** Orphan prompts invite pattern matching. For
`finnish`, `evergreen` and `vocab`, the composer asks for one prompt that ties the new item to
something already introduced (the item picker can suggest recently introduced items from the same
deck). This is elaborative encoding made structural rather than left to discipline.

**B3. Worked examples, revealed after the attempt, never before.** The composer can show one or two
existing prompts from the same deck and pattern as models. They appear *after* the learner has
typed something, in a "compare with" panel, so the model informs revision rather than replacing
generation. This is Matuschak's "expert examples as templates" adapted to preserve the generation
effect.

**B4. Capture now, write later.** Word-of-the-day arrives daily whether or not there is thinking
time that morning. Today the composer blocks introduction until a prompt exists, so a rushed
morning produces either a bad prompt or a skipped word. Add a third action next to "Got it" and
"Skip": **"Keep, write prompts later"**, which marks the item captured but un-introduced and puts
it in a writing queue. The queue is surfaced on `/learn` (see D2), capped (suggest 10), and blocks
new captures once full so it cannot become a landfill.

**B5. Tractability check.** The five attributes include *tractable*, and nothing in the product
mentions it. Add it to the composer's guidance line and to `promptIssue` where it can be checked
mechanically (for example, a question with more than one blank in a cloze that spans different
facts, or an answer that is a list). Where it cannot be checked mechanically, it becomes the
leading question in the revision loop below: "could you always answer this correctly?"

**B6. Explicit prompt kinds.** `Prompt` currently has `kind?: 'cloze'`. Extend to a `family` field
(`recall | application | connection | salience`) set by the pattern chosen in B1. It costs one
optional field, drives the composer's balance nudge ("every prompt here is plain recall, add one
application"), and lets `/learn` report the mix. It is also the hook for future per-family
scheduling if that is ever wanted.

### C. Make prompt revision a first-class loop

**C1. Leech detection.** `lapses` is already persisted (`engine.ts:39`) and never read. A card with
`lapses >= 6` becomes a distinct wall-chart tile state and a `/learn` count. Plan §5 has this
already; it matters more once prompts are self-authored, because then a leech usually means the
prompt is wrong.

**C2. Edit a prompt from where it fails.** On the back of a practice card, add "Fix this prompt",
which opens the composer for that prompt inline, writes through the existing
`stageAuthored`/pending-queue path for authored decks, and for note-backed decks links to the note
with the block anchored. Editing text keeps the card's FSRS history; only a deliberate "replace this
prompt" gets a fresh id (the `-a<n>` scheme already supports that).

**C3. Retire a prompt honestly.** A prompt that keeps failing because it was a bad idea should be
deletable at the point of failure, with its item flagged for a rewrite rather than silently losing
coverage. This also fixes the documented rough edge where an item with all prompts deleted shows as
due with nothing to practice.

**C4. A scheduled revision card.** Occasionally (suggest: when a deck has leeches and no new items
today) `/practice` shows a single non-graded card: "This prompt has failed 7 times. Rewrite it, or
retire it." The revision loop becomes part of the ritual rather than a chore requiring initiative.

### D. `/learn` becomes a workbench, not a directory

Today the hub shows one card per deck, a territory percentage, and two banners. It reports what
exists rather than what to do. Proposed structure, top to bottom:

**D1. The ritual strip.** The two existing banners stay, in this order: new today, then practice.

**D2. The writing queue.** "4 concepts captured, prompts not written yet" linking to a writing
session (`/learn/write`), which runs the composer over the B4 backlog with no new material mixed in.
This is the surface that makes deferred authoring safe.

**D3. The revision queue.** "3 prompts are failing repeatedly" linking to the same composer in
rewrite mode (C1 to C3).

**D4. Coverage on the writing side.** "6 published notes teach something and carry no prompts",
generated by `scripts/extract-learn-blocks.mjs` as a report and rendered from the generated JSON.
The mnemonic medium is an authoring discipline as much as a reading one, and right now nothing tells
you when a note went out without prompts.

**D5. Deck cards keep territory, gain prompt mix.** Alongside "38% of the territory introduced",
show the B6 family mix ("mostly recall") and the count of items introduced with prompts still
unwritten. Territory percentage alone can look healthy while the deck is hollow.

### E. `/practice` changes

**E1. Context on the back** (A3) and **fix or retire from the back** (C2, C3). Together these turn
review from a verdict into a feedback loop.

**E2. Keyboard shortcuts.** Space to flip, J/K or 1/2 to grade. Plan §5 already lists this; it is
the single cheapest change to session friction, and friction is what kills the ritual.

**E3. Move deck toggles out of the main view.** The home screen currently leads with a checkbox list
of every deck. That is configuration, and configuration in the daily path invites the per-session
decisions principle 1 forbids. Collapse it behind "Decks and settings".

**E4. Say what the miss means.** The done screen's copy is good ("that's the system working, not you
failing"). Extend it: when a card fails twice or more, say so and offer the rewrite path, so
repeated failure reads as information rather than as guilt.

**E5. Application prompts get their own beat.** Once B6 exists, order each session so pure recall
comes first and application or connection prompts land later, when warmed up. Cheap ordering change
inside `buildUnifiedQueue`, no scheduling change.

### F. Authoring-side signals

**F1. Prompt count on the note page.** A small marker ("3 prompts") near the note's metadata, both
as a signal to a reader that this is a timeful text and as a nag when a note has none.

**F2. Extraction report.** `extract-learn-blocks.mjs` prints notes in `til` and `evergreen` with no
learn block; `validate-learn-data.mjs` gains a non-fatal warning for items whose prompts are all one
family, and for authored items introduced with zero prompts.

**F3. Write the conventions down.** `docs/content/authoring.md` gains a short section: block after
the section it tests, prompts appended never reordered (id stability), one fact each, and the
patterns from B1.

## 6. Phasing

**Phase 1, the medium (highest value, mostly mechanical).**
A1 inline note prompts, A3 context on the back, F1 prompt count, E2 keyboard shortcuts.
These are the changes a reader actually feels.

**Phase 2, the authoring loop (the answer to the prompt-writing tension).**
B1 patterns, B3 worked examples, B4 capture-now-write-later plus D2, B5 tractability copy.
Ship B1 for one deck first (`linux` has the clearest patterns) before generalising.

**Phase 3, revision.**
C1 leeches, C2 fix from the back, C3 retire, D3 revision queue, E4 copy.

**Phase 4, structure and reporting.**
B6 prompt families, B2 connection prompts, D4 and D5, E5, F2, F3, A5 item reference pages.

A2 and A4 are convention and copy changes that ride along with Phase 1 and 2 respectively.

## 7. Open questions

1. **Does the writing queue (B4) undermine the ritual?** It trades "a prompt now, possibly bad" for
   "a good prompt later, possibly never". The cap plus the `/learn` counter is the mitigation, but
   the right cap is a guess until it runs.
2. **Should inline note prompts grade into the same FSRS state as `/practice`?** Yes in this
   proposal, and it means a note page can quietly consume today's due cards. Alternative: inline
   answers count as introduction and elaboration only, never as a graded review. Decide before A1.
3. **How much scaffolding is too much?** If a pattern is filled in almost mechanically, the
   generation effect is gone and B1 has recreated the thing this document argues against. The blanks
   must require a judgement, not a lookup.
4. **Prompt families (B6) are a schema change.** Optional field, so no migration, but every existing
   prompt is untyped until backfilled. Backfill by hand, or leave untyped and only classify new
   prompts?
5. **Does `people` participate in inline prompts?** It has no public prose and never will. Probably
   it stays exactly as it is.

## 8. Deliberate non-goals

- **No generated prompts, from any model.** This is the whole argument of section 2. If a suggestion
  feature is ever built, it may only critique a prompt the learner has already written.
- **No shipped prompts on the automated decks.** `authorPrompts` stays true for linux, finnish,
  finnish-vocab and vocab.
- **No four-way grading, no ease sliders, no penalties for missed days.** Unchanged from the
  existing deliberate non-features.
- **No accounts and no server-side scheduling.** Everything above stays client-side over
  localStorage and the existing opt-in sync.
