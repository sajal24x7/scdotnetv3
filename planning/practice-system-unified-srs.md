# Unified Practice System — Plan

- Status: PROPOSED — design for review, decisions marked, not yet implemented
- Target pages: `/practice` (new), changes to `/learn` and `/learn/*`
- Blueprint being evolved: [`docs/architecture/learning-systems.md`](../docs/architecture/learning-systems.md)
- Branch: `claude/learning-practice-system-design-9vme48`

## 0. The brief

Four learn systems exist (`/learn/linux`, `/learn/finnish`, `/learn/til`, `/learn/evergreen`) and more are wanted: English vocabulary (auto-fed from word-of-the-day sources), people (names and faces — private), and eventually things like the periodic table. Three questions drive this plan:

1. **Should practice be per-domain or one combined session?** Today each system runs its own daily session. Anki-style would be one queue across everything.
2. **How do new kinds of material get in easily?** Especially material that must *not* be public (people notes) on a public site built from a public repo.
3. **Should learning and practice be separate systems?** Learning = browsing reference cards to build familiarity ("periodic table on the wall"). Practice = a bare retrieval session: question, recall, grade, next.

## 1. Core decision: learn per-domain, practice unified

**Recommendation: keep learning per-domain; make practice one combined daily session at `/practice`.**

The reasoning, from both the literature and the existing design principles:

- **The daily ritual must be zero-decision** (principle #1 in the blueprint). Four systems means four rituals, and the `/learn` hub already exists precisely because that was starting to hurt. Every deck added under the current model adds another daily stop. A single practice session scales to ten decks without the ritual growing heavier — this is exactly why Anki reviews everything in one sitting.
- **Interleaving is a feature, not a compromise.** Mixing Finnish, Linux, and names in one session is a desirable difficulty — retrieval against interference is a stronger memory act than blocked review. The domain lives *on the card* (a deck badge), not in the ritual.
- **Learning and practice are different activities with different UIs.** Browsing the wall chart, clicking tiles, reading reference cards, drilling a category out of curiosity — that's *studying*, it's exploratory, and it's inherently per-domain (a Finnish wall chart and a Linux wall chart share nothing visually or conceptually). The retrieval session is the opposite: undifferentiated, sequential, bounded, done in 3–7 minutes. Fusing them (as today) makes each learn page carry session machinery it doesn't need, and makes the session ritual multiply per domain.

So the split becomes:

| | `/learn/*` (per domain) | `/practice` (one page) |
| --- | --- | --- |
| Purpose | Territory: wall chart, reference cards, category drills, browsing | The daily ritual: due reviews + new-item introductions across all decks |
| Mutates SRS state | Never (drills stay no-op, as today) | Always — the only place grading happens |
| Cadence | Whenever curious | Once a day, bounded |
| Adding a deck | New page (or none — see §5) | Automatic via the deck registry |

The `/learn` hub stays as the map of territories; it gains a single prominent "Today's practice" block that replaces the four per-system due-count calls to action.

**What moves out of learn pages:** the "Start today's review" button and session flow. Learn pages keep the wall chart (tile colors still derived from SRS state — the emotional engine stays), the reference panel, and drills. During a transition period the button can simply link to `/practice`.

**What stays exactly as-is:** the mnemonic-medium authoring model (```` ```learn ```` blocks in notes), extraction, render-stripping, id-stability rules, the hub, all localStorage state.

## 2. Architecture of `/practice`

### 2.1 Deck registry

A build-time list of every deck, `src/data/practice-registry.ts`:

```ts
interface PracticeDeck {
    id: string;               // 'linux' | 'finnish' | 'til' | 'evergreen' | 'vocab' | 'people' | ...
    title: string;
    emoji: string;
    itemNoun: string;
    monoAnswers: boolean;
    newPerDay: number;        // per-deck intake budget (unchanged semantics)
    dueCap: number;           // per-deck share of the session (see 2.3)
    storageKey: string;       // existing keys preserved — zero migration
    source:
        | { kind: 'json'; href: string }       // public decks, lazy-fetched
        | { kind: 'encrypted'; href: string }  // private decks, see §6
        | { kind: 'local' };                   // browser-only decks (fallback option)
    learnHref?: string;       // link back to the wall-chart page, shown on cards
}
```

### 2.2 Deck data stays out of the island bundle

The practice island must not bundle every content pool (Linux alone is 1000+ lines; the hub already avoids this deliberately). Each public deck's dataset is emitted at build as a static JSON endpoint — `src/pages/api/practice/[deck].json.ts`, same pattern as the existing `api/link-previews` endpoints — and the island fetches only the decks it needs for today's session (a deck with nothing due and no new budget left never loads its data; the *counts* are computable from localStorage + registry totals alone, which is exactly what `LearnHub.tsx` proves).

### 2.3 Session composition (the unified queue)

Reuses the existing Leitner semantics per card; only *selection* becomes cross-deck:

1. **Reviews:** gather due cards from every enabled deck (earliest-due first within a deck), then interleave **round-robin across decks** up to a **global session cap** (`GLOBAL_DUE_CAP = 20`). Round-robin gives fairness — a Finnish backlog can't starve the people deck — and produces the interleaving we want for free. Per-deck `dueCap` survives as a per-deck ceiling within the global cap.
2. **New items:** per-deck `newPerDay` budgets still apply, but a **global intake cap** (`GLOBAL_NEW_PER_DAY = 5`) is taken round-robin across decks that have unseen items. Without this, unifying six decks would mean 10+ introductions a day and the session stops being bounded. (The current per-deck numbers sum to 8/day across four decks — already past comfortable.)
3. **Ordering within the session:** reviews first, then new items (learn card followed by its prompts) — same as today, just cross-deck.
4. **Card chrome:** each card shows a deck badge (emoji + deck title) and the item term, and keeps per-deck `monoAnswers` rendering. Learn-card introductions link to the source note (`href`) or the deck's wall chart.

Capped-out cards remain due and surface tomorrow — the existing safety property carries over unchanged.

### 2.4 State: per-deck keys preserved, one new meta key

**No migration of existing progress.** Each deck keeps its own localStorage key with the existing `SrsState` schema; the practice island loads all of them, builds the queue, and writes grades back to the owning deck's key. This keeps:

- all current Linux/Finnish/TIL/evergreen progress intact,
- per-domain wall charts working untouched (they read the same keys),
- the hub's count-derivation logic valid.

One new key, `practice-meta`, holds what is genuinely global:

```ts
{ version: 1,
  streak: number,               // seeded from max(existing per-deck streaks) on first run
  lastSessionDate: string | null,
  totalSessions: number,
  disabledDecks: string[],      // deck toggles ("pause Finnish for a month")
  suspended: string[] }         // item ids skipped at introduction (see §4.4)
```

Per-deck `streak`/`totalSessions` fields stop being updated (harmless leftovers). The streak becomes a single number meaning "days I did *the* practice" — which is the truthful unit once there is one ritual.

### 2.5 Engine extraction

`LearningSystem.tsx` currently owns scheduling, persistence, and UI in one 540-line island. Phase 1 extracts the pure logic into `src/components/learn/engine.ts` — `localToday`, `addDays`, `gradeCard`, `itemStatus`, `buildQueue`, load/save — consumed by three islands: `LearningSystem` (wall chart + drills), `PracticeSession` (new), and `LearnHub` (which currently *duplicates* the count derivation with a keep-in-sync comment; that duplication dies here). This is the same "second consumer forces the refactor" moment the Finnish plan called out for the island itself.

### 2.6 Scheduler: keep Leitner (decision)

**Keep the 5-box 1/3/7/14/30 Leitner ladder as the shared engine.** Existing state carries over byte-for-byte; the system stays debuggable by reading localStorage; and the deck sizes (a few hundred prompts even after vocab and people join) are within Leitner's comfort zone.

*Recorded alternative:* FSRS (`ts-fsrs`, the algorithm modern Anki ships) predicts intervals noticeably better on large mixed decks. It costs a dependency, a one-way state migration, and eyeball-debuggability. **Revisit trigger:** combined active prompts exceed ~800, or daily due counts feel persistently wrong (too easy / too swamped). The engine extraction in 2.5 makes the swap localized when the day comes.

### 2.7 Deliberate non-features (inherited and extended)

- No accounts, no server-side *scheduling*. All scheduling decisions stay client-side; the server stores an opaque state blob (§2.8), nothing more.
- **Export/import stays** (single JSON blob of all `*-srs` keys + `practice-meta`, downloaded/uploaded on `/practice`) as the manual backup and the escape hatch if sync is ever down.
- No guilt mechanics, no penalties for missed days — unchanged.

### 2.8 Cross-device state sync (decision)

Practicing from phone, Mac, and work laptop — and surviving the loss of any of them — needs real sync. The blueprint's "no server sync until an actual second device demands it" clause has now been triggered, so:

**Recommendation: a Cloudflare Pages Function + KV blob, authenticated the way `/api/upload` already is.**

- **Endpoint** — `functions/api/practice-state.js`: `GET` returns the stored blob, `PUT` replaces it. The blob is the full sync unit: every deck's `SrsState` + `practice-meta`, tens of KB at most (well inside KV limits). A `PRACTICE_STATE` KV namespace is bound on the Pages project.
- **Auth** — same pattern as `upload.js`: a Bearer token that is a fine-grained GitHub PAT; the function accepts it only if GitHub confirms push (Contents-write) access to this repo. No new secret class, no accounts. **Mint one PAT per device** (phone / Mac / work laptop): losing a device then means revoking one token in GitHub settings — the state in KV is untouched and a replacement device just pastes a fresh token. This is the direct answer to "if I lose access to my device."
- **Merge, not last-write-wins** — grading on the phone in the morning and the Mac at night must not clobber each other. The client merges remote into local on load (and tab focus), and pushes the merged blob after each finished session (plus debounced mid-session). The merge is deterministic and idempotent, safe to run any number of times:
    - per prompt id: keep the `CardState` with the higher `reps` (tie → later `due`) — `reps` only ever grows, so this is conflict-free;
    - `introduced`: union, earliest date wins;
    - `suspended` / `disabledDecks`: union;
    - streak / `totalSessions` / `lastSessionDate`: take the triple from whichever side has the later `lastSessionDate`.
- **Safety net** — KV has no history, so the function keeps a small rolling backup (`state:backup:<date>`, last 7 days) before each overwrite; a bad push is recoverable. Sync failures degrade silently to local-only (existing principle) with a quiet "last synced" line on `/practice`.
- **Private decks** — the sync blob contains only SRS *state* (boxes, dates, ids), never deck *content*, so people-deck review state syncs without the people data itself ever touching KV.

*Recorded alternative:* no server at all — the island reads/writes a `practice-state.json` in the private repo via the GitHub contents API from the browser (CORS-friendly, versioned for free, zero infra). Rejected as primary because a commit per practice session pollutes the private repo's history and the token would need private-repo scope on every device; kept as fallback if the KV binding ever feels like too much infrastructure.

## 3. Ideas adopted from the literature

Beyond Matuschak (already the blueprint's foundation), specific mechanisms worth stealing:

- **Gwern ("Spaced Repetition for Efficient Learning"):** (a) the *worth-memorizing threshold* — only card things you'll actually need; this drives the skip-at-introduction curation in §4.4 rather than auto-learning every feed word. (b) *Personal-life decks are high-value* — Gwern specifically uses SRS for people's names and faces; the people deck is a canonical use, not a gimmick. (c) *Review in dead time* — the session must be comfortable on a phone; `/practice` is a mobile-first layout.
- **Wozniak's "20 rules" / Nielsen ("Augmenting Long-term Memory"):** minimum-information principle (already principle #6); *avoid orphan cards* — cards disconnected from anything you engage with decay into annoyances; another argument for curating feed words and for prompts that reference *your* context ("where did I meet X") over generic facts.
- **Anki mechanics:** (a) **deck toggles** (pause a deck without losing state) — `disabledDecks` above. (b) **Suspended cards** — the skip list. (c) **Leech detection**: a card with `lapses >= 6` is flagged as a leech on the wall chart (distinct tile state) with a hint to rewrite or retire the prompt — misses stop being silently absorbed and start being a signal the *prompt* is bad, which is Matuschak's prompt-revision loop made visible.
- **Orbit / mnemonic medium:** already implemented as learn blocks; the unified queue makes note-embedded prompts and hand-built decks indistinguishable at review time, which is exactly Orbit's model.

## 4. New deck: English vocabulary (`vocab`)

### 4.1 Sources — feeds plus personal capture

Two intake paths, both feeding one deck:

1. **Word-of-the-day feeds, fetched by a scheduled GitHub Action** (`fetch-wotd.yml`, daily; same infra pattern as `syndicate-content.yml` / `download-covers.yml`):
   - **Wiktionary WOTD** via the MediaWiki featured-feed (`action=featuredfeed&feed=wotd`) — literary/interesting skew; parse word, part of speech, gloss, usage example.
   - **Merriam-Webster WOTD** RSS (`merriam-webster.com/wotd/feed/rss2`) — practical/contemporary skew. **Recommendation: start with Wiktionary only** (one word/day is plenty at the start; the action is written so adding the second feed is a config line). Wordnik's WOTD API is a third option if either feed proves brittle.
   - The action appends to `src/data/vocab.generated.json` (word-keyed, so re-runs are idempotent; entries carry `source` and `fetchedAt`) and commits with `[CI Skip]` unless batched with other content.
2. **Manual capture** — words actually encountered while reading, which stick far better than feed words. Cheapest viable path: a `vocab` note-type in the existing inbox flow (an Obsidian note with `category: vocab`, one word per note, definition optional — a pipeline step enriches missing definitions from the Wiktionary REST API at extraction time). A dedicated quick-add composer (like `/write`) is a later nicety, not phase-1.

### 4.2 Card design

Per word, following the both-directions rule from the blueprint:

- **Recognition:** word → meaning ("What does *susurrus* mean?").
- **Production:** gloss-plus-cloze → word ("A soft murmuring sound: the ____ of the pines" → *susurrus*). Production is the direction that makes a word *usable*, and the usage sentence doubles as elaborative encoding.
- Optional third prompt when the feed supplies it: pronunciation or usage nuance as a `note` on the answer, not a separate card (minimum information).

### 4.3 Public learn page

Words are not sensitive — `/learn/vocabulary` is a normal public learn system (wall chart grouped by month added or by part of speech; reference card = word, pronunciation, gloss, example, source link). It registers in the practice registry like every other deck.

### 4.4 Curation: skip-at-introduction (decision)

Feed words are auto-added to the *deck* but curated at the *introduction moment*: when a new word's learn card appears in the practice session, it carries a **"Skip — don't learn this"** action alongside "Got it — quiz me". Skipping adds the item id to `practice-meta.suspended`; it never counts against the day's new budget, never appears again, and shows as a distinct muted tile on the wall chart.

Why this over alternatives: a pre-deck approval inbox needs write-back infrastructure (a commit per decision) or a second daily chore; auto-learning everything violates the worth-memorizing threshold. Skip-at-introduction is zero-infra (localStorage), zero extra ritual (the decision happens inside the session where the word is already in front of you), and reversible (a "suspended" section on the learn page can un-skip).

## 5. New deck: People (`people`) — private

### 5.1 The privacy constraint

This repo is **public** and the built site is public; anything in either — committed markdown, generated JSON, an unlinked route — is world-readable. People notes (names, relationships, personal facts, possibly photos) must therefore never exist in plaintext in this repo, the content branch, or the static output. This rules out the "different folder in this repo" idea in its naive form.

### 5.2 Storage design (decision): encrypted blob, authored in the private repo

**Recommendation:** people notes live in the existing **private repo (`scdotnetv3-tools`)** as plain markdown (one file per person, same timestamp-filename convention). An Action *in the private repo* builds the deck and pushes only ciphertext here:

1. On push, the private repo's workflow parses `people/*.md` into deck JSON (same `LearnDataset` shape).
2. Encrypts it — AES-256-GCM, key derived from a passphrase (scrypt/PBKDF2) stored as an Action secret in the private repo.
3. Commits `src/data/people.enc.json` to this repo via a PAT (with `[CI Skip]` respected by the normal build; the file also ships into `dist` as an opaque blob).

Client side, on `/practice` (and `/learn/people`): the first time the people deck is enabled, the page asks for the passphrase, derives the key (WebCrypto), decrypts, and caches the *derived key* in localStorage so the ritual stays zero-friction on that device. Trade-off stated plainly: anyone with full access to that browser profile can read the deck — acceptable for a personal device; "forget this device" button clears it.

Why this beats the alternatives:

- **Local-only browser deck** (editor UI on the site, IndexedDB, export/import): zero infra, but authoring in a bespoke web form instead of Obsidian, no versioning, and one cleared browser away from data loss. Kept as the fallback if the encryption path feels heavy in practice.
- **Cloudflare Function + KV/private-repo at runtime:** real server-side privacy and no passphrase UX, but adds runtime infrastructure and an auth token to a deliberately static site — against the "no server sync until a second device demands it" principle. The encrypted blob gets multi-device sync *through the existing static deploy*, which is the elegant part.
- **Committing plaintext anywhere in this repo:** ruled out by §5.1, full stop.

Photos (face → name is the classic and most useful card): stored in the private repo, downscaled to small thumbnails (~128px) at deck-build time and embedded as data URIs *inside* the encrypted JSON, so images ride the same blob and never exist as separately fetchable files. Photos are optional per person.

### 5.3 Authoring format

One markdown file per person in the private repo:

```markdown
---
name: Priya Raman
context: Neighbour, moved in 2025; runs the community garden
org: ""
partner: Anssi
kids: [Veera]
met: "Building sauna evening, June 2025"
photo: priya.jpg
tags: [neighbours]
---
Optional free-form notes (never shown in prompts unless pulled into a field).
```

Prompts are **generated from fields**, not hand-written (lowering input friction is the whole point): photo → name (if photo), context → name ("Who runs the community garden…?"), name → context ("Who is Priya?" → the context line), name → partner/kids when present. A hand-written `prompts:` list in frontmatter overrides generation for people who need bespoke cards. Id = filename timestamp, prompt ids positional — same stability rules as note-backed decks.

### 5.4 Learn page

`/learn/people` exists but renders a locked state until the passphrase unlocks it (and carries `noindex`; the tile grid — faces/names by group — is the wall chart). It registers in the practice registry with `source: { kind: 'encrypted' }`; when locked, the practice session simply composes without it and shows a one-line "people deck locked" hint.

## 5A. Learn-block shorthand (authoring simplification)

The note-first flow (§1, blueprint §"Note-backed decks") is the system's front door, so its friction matters. Today the *minimum* valid block is already small — every scalar field is optional (`term` ← note title, `category` ← first tag, `description` ← first paragraph, `example` ← first code block, and `href` back to the note is added automatically and rendered as "Read the note →" on cards — that wish is already implemented) — but prompts still require the YAML list ceremony:

````markdown
```learn
prompts:
  - q: Why not rely on Azure's default outbound IPs?
    a: They change at random.
```
````

**Add a q/a shorthand** so the common case is just pairs:

````markdown
```learn
q: Why not rely on Azure's default outbound IPs?
a: They change at random, so external services can't whitelist them.

q: What fixes it?
a: A NAT Gateway with a static public IP.
```
````

Implementation is confined to `parseLearnBlocks` in `scripts/extract-learn-blocks.mjs`: if a block has no top-level `prompts:` key, split it into stanzas at each top-level `q:` line and YAML-parse each stanza as one prompt (`q`, `a`, optional `note:` / `id:`; YAML block scalars like `a: |` keep working for multi-line answers). Plain YAML can't express repeated keys, which is why this needs the stanza pre-split rather than a schema tweak. The full syntax stays valid — needed whenever you want to override `term`/`category`/etc. — and both forms can coexist in one note (scalar fields still come from the first block). Nothing else changes: positional id assignment (`-p1`, `-p2` in encounter order) and the append-only stability rule apply across both syntaxes, and the render-strip in `src/utils/learnBlocks.ts` is shape-agnostic (it removes the fence wholesale), so no change there.

## 6. Hub and entry points after the split

- **`/practice`** — the ritual page: big start button, combined due/new counts, per-deck breakdown line, streak, deck toggles, export/import, unlock control for private decks. This is the page that gets bookmarked on the phone home screen.
- **`/learn`** — stays the map of territories, one card per system linking to its wall chart, but its per-system status lines simplify (item/prompt totals + territory progress) and a single "Today's practice: 12 due · 3 new →" banner replaces four separate calls to action.
- Learn pages link to `/practice` where the session button used to be.
- Future systems (periodic table, more languages) follow the existing "Building a new system" recipe for their learn page, plus one registry entry to join practice. A deck can even be practice-only (no wall chart yet) — registry entry with no `learnHref`.

## 7. Implementation phases

Each phase is independently shippable and leaves every existing page working.

**Phase 0 — Learn-block q/a shorthand (§5A).**
Standalone parser change in `extract-learn-blocks.mjs` + a line in `docs/content/authoring.md`. No dependency on anything else — can ship immediately and improves the authoring flow today.

**Phase 1 — Engine extraction (no behavior change).**
Extract scheduler/persistence pure functions from `LearningSystem.tsx` into `src/components/learn/engine.ts`; re-point `LearningSystem` and `LearnHub` at it (deleting the duplicated count logic). Verify all four learn pages and hub behave identically.

**Phase 2 — `/practice` + registry.**
`practice-registry.ts`; per-deck JSON endpoints (`src/pages/api/practice/[deck].json.ts`); `PracticeSession.tsx` island (queue composition per §2.3, deck badges, `practice-meta` state, streak seeding, export/import); `/practice.astro` page + styles; hub banner; learn pages' session buttons become links to `/practice`. Tuning constants start at `GLOBAL_DUE_CAP = 20`, `GLOBAL_NEW_PER_DAY = 5`.

**Phase 2b — Cross-device sync (§2.8).**
`functions/api/practice-state.js` + `PRACTICE_STATE` KV binding; client merge + push/pull wiring in the practice island; per-device PAT entry UI ("connect this device") and "last synced" indicator. Depends on Phase 2's `practice-meta`; everything before this works local-only.

**Phase 3 — Vocabulary deck.**
`fetch-wotd.yml` action + `scripts/fetch-wotd.mjs` (Wiktionary featured feed; M-W behind a flag); `vocab.generated.json`; skip-at-introduction + `suspended` list (this lands the suspend mechanism for *all* decks); `/learn/vocabulary` page; manual-capture via `category: vocab` inbox notes with definition enrichment.

**Phase 4 — People deck.**
Private-repo authoring convention + deck-build/encrypt workflow there; `people.enc.json` consumption, passphrase unlock UX, key caching + "forget this device"; `/learn/people` locked page with `noindex`; thumbnail pipeline.

**Phase 5 — Niceties (as wanted).**
Leech detection (flag `lapses >= 6` on charts and in a session hint); keyboard shortcuts (space = reveal, 1/2 = grade); per-deck stats on `/practice`; a real quick-add composer for vocab/people; FSRS revisit per the §2.6 trigger.

**Phase 6 — Finnish vocabulary expansion (`finnish-vocab` deck).**
The existing Finnish deck is *rules-first by design* — its vocabulary category holds ~14 items (11 nouns plus bundled adjectives/greetings/numbers), chosen to feed the rule prompts, and the verbs category teaches the conjugation *system* with only `olla` as an actual word. That's the right Phase-1 scope per its own plan, but it is nowhere near communicative vocabulary (~300–500 words for survival, 1000+ for basic conversation). Rather than growing the rules deck (whose wall chart should stay a bounded territory you can finish), add a **sibling deck** `finnish-vocab` on the TIL-style open-feed model: themed categories (verbs, family, food, time, question words/pronouns, places, adjectives), items sourced from a reputable frequency list (e.g. the Kelly project list — per the Finnish plan's rule, **never invent Finnish**), added in curated batches of 20–50. Each word gets both-direction prompts (fi→en, en→fi) plus, where the word exercises a learned rule, one *apply-the-rule* prompt (e.g. inflect it into the inessive) — compounding the rules deck exactly as that plan's thesis intends. Separate deck = its own tuning (`newPerDay: 3`, higher `dueCap`) and the unified practice queue interleaves it with everything else automatically.

## 8. Open questions (defaults chosen, override freely)

| # | Question | Default taken in this plan |
| --- | --- | --- |
| 1 | Private-deck mechanism | Encrypted blob built from the private repo (§5.2); local-only editor is the fallback |
| 2 | Scheduler | Keep Leitner; FSRS only on the §2.6 trigger |
| 3 | Vocab feeds | Wiktionary daily; Merriam-Webster off by default |
| 4 | Feed-word curation | Skip-at-introduction inside the session (§4.4), no approval inbox |
| 5 | Global caps | 20 due / 5 new per day, round-robin across decks |
| 6 | People photos | Yes, as encrypted thumbnails; deck works fine without them |
| 7 | Global streak | Seeded from the max of existing per-deck streaks |
| 8 | Sync backend | Cloudflare KV + Pages Function with per-device PATs (§2.8); GitHub-contents-API fallback recorded |
| 9 | Learn-block shorthand | Bare q/a stanzas via a pre-split in the extractor (§5A); full syntax stays valid |

## 9. Documentation to update at implementation time

- `docs/architecture/learning-systems.md` — restructure around the learn/practice split; the registry becomes the "adding a system" entry point; move tuning table to include global caps.
- `docs/content/authoring.md` — `category: vocab` capture notes; the learn-block q/a shorthand.
- Private repo README — people-note format and the encrypt workflow.
- `scripts/README.md` — `fetch-wotd.mjs`.
