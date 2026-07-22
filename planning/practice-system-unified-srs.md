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
        | { kind: 'local' };                   // private decks imported into the browser, see §5
    learnHref?: string;       // link back to the wall-chart page, shown on cards
}
```

### 2.2 Deck data stays out of the island bundle

The practice island must not bundle every content pool (Linux alone is 1000+ lines; the hub already avoids this deliberately). Each public deck's dataset is emitted at build as a static JSON endpoint — `src/pages/api/practice/[deck].json.ts`, same pattern as the existing `api/link-previews` endpoints — and the island fetches only the decks it needs for today's session (a deck with nothing due and no new budget left never loads its data; the *counts* are computable from localStorage + registry totals alone, which is exactly what `LearnHub.tsx` proves).

### 2.3 Session composition (the unified queue)

Per-card scheduling is the shared FSRS engine (§2.6); only *selection* becomes cross-deck:

1. **Reviews:** gather due cards from every enabled deck (earliest-due first within a deck), then interleave **round-robin across decks** up to a **global session cap** (`GLOBAL_DUE_CAP = 20`). Round-robin gives fairness — a Finnish backlog can't starve the people deck — and produces the interleaving we want for free. Per-deck `dueCap` survives as a per-deck ceiling within the global cap.
2. **New items:** per-deck `newPerDay` budgets still apply, but a **global intake cap** (`GLOBAL_NEW_PER_DAY = 5`) is taken round-robin across decks that have unseen items. Without this, unifying six decks would mean 10+ introductions a day and the session stops being bounded. (The current per-deck numbers sum to 8/day across four decks — already past comfortable.)
3. **Ordering within the session:** reviews first, then new items (learn card followed by its prompts) — same as today, just cross-deck.
4. **Card chrome:** each card shows a deck badge (emoji + deck title) and the item term, and keeps per-deck `monoAnswers` rendering. Learn-card introductions link to the source note (`href`) or the deck's wall chart.

Capped-out cards remain due and surface tomorrow — the existing safety property carries over unchanged.

### 2.4 State: per-deck keys preserved, one new meta key

**Keys and progress preserved.** Each deck keeps its own localStorage key; the practice island loads all of them, builds the queue, and writes grades back to the owning deck's key. (The card records *inside* those keys upgrade Leitner→FSRS via §2.6's one-time v3 migration — keys, item ids, introduced dates, and streaks are untouched.) This keeps:

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

### 2.6 Scheduler: FSRS (decision)

**Adopt FSRS — the scheduler modern Anki ships — via the `ts-fsrs` library, replacing the Leitner ladder.**

- **Per-card state** becomes the FSRS card record — `stability` (days until recall probability drops to the retention target), `difficulty`, `state` (new / learning / review / relearning), `due`, `reps`, `lapses`, `last_review` — instead of a box number. Intervals are computed per card from its own history rather than read off a fixed ladder, which is FSRS's whole advantage: easy cards race ahead to multi-month intervals while hard cards get short ones, without a miss dragging a mature card all the way back to "box 1, due tomorrow."
- **Grading stays two buttons.** FSRS accepts four grades (Again / Hard / Good / Easy) but works fine with two: "Forgot" maps to Again, "Got it" to Good. A four-way self-assessment per card is exactly the kind of per-rep decision the blueprint's principle #1 forbids; Hard/Easy can be added later as optional keyboard-only extras with no schema change.
- **Desired retention** is the one honest knob FSRS exposes (default 0.90): lower toward 0.85 for fewer daily reviews, raise it for tighter recall. Surface it in a settings corner of `/practice`, per deck later if ever needed.
- **Day-granular adaptation.** Anki re-shows Again-graded cards within minutes; this system schedules by local calendar date. Adaptation: a card graded "Forgot" re-queues once at the end of the *same session* (an improvement over Leitner's wait-until-tomorrow), while persisted scheduling stays date-based with a minimum of next day.
- **Migration (one-way, versioned).** Per deck, `SrsState` bumps to v3: each Leitner card converts to an FSRS review-state card with `stability` seeded from its current box interval (1/3/7/14/30 days), default difficulty, and `due`/`reps`/`lapses` carried over — so nothing feels re-set on day one. The v2 blob is kept under a backup key until the first completed v3 session; export/import (§2.7) covers rollback beyond that. Wall-chart status derivation updates to: `unseen` (not introduced) → `due` (due ≤ today) → `learning` (learning/relearning state, or stability < 21) → `strong` (review state with stability ≥ 21 days).
- **Costs accepted:** intervals are no longer eyeball-debuggable from localStorage, and a dependency enters the engine (`ts-fsrs`, small and engine-side only — the UI islands never see it).

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
    - per prompt id: keep the card record with the higher `reps` (tie → later `last_review`) — `reps` only ever grows, in FSRS as in Leitner, so this stays conflict-free;
    - `introduced`: union, earliest date wins;
    - `suspended` / `disabledDecks`: union;
    - streak / `totalSessions` / `lastSessionDate`: take the triple from whichever side has the later `lastSessionDate`.
- **Safety net** — KV has no history, so the function keeps a small rolling backup (`state:backup:<date>`, last 7 days) before each overwrite; a bad push is recoverable. Sync failures degrade silently to local-only (existing principle) with a quiet "last synced" line on `/practice`.
- **Private decks** — the sync blob contains only SRS *state* (stability/difficulty numbers, dates, ids), never deck *content*, so people-deck review state syncs without the people data itself ever touching KV.

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

This repo is **public** and the built site is public; anything in either — committed markdown, generated JSON, an unlinked route — is world-readable. People notes (names, relationships, personal facts, possibly photos) must therefore never exist in plaintext in this repo, the content branch, or the static output. This rules out the "different folder in this repo" idea in its naive form. Beyond that, the standing preference is stronger: this data should not live in GitHub *at all* — public or private repo — which shapes the decision below.

### 5.2 Storage design (decision): local-first — the vault is the source of truth, the browser is a cache

**People data never touches GitHub — not this repo, not the private one — and never ships in the site's build.** People notes live only in the Obsidian vault, in a folder excluded from the GitSync/content-branch setup (e.g. `people/`); each device's browser holds an imported copy:

1. **The site ships the parser, never the data.** The learn-block extraction logic (blueprint §"Note-backed decks", plus the §5A shorthand) is refactored into a shared module used both by `extract-learn-blocks.mjs` at build time and client-side in the island — so person notes are parsed *in the browser*.
2. **Build: drop notes, save a deck file.** A "Build deck file" panel on `/learn/people` accepts the `people/*.md` files (photos alongside); the browser parses frontmatter + learn blocks, downscales photos into embedded data-URI thumbnails, and hands back one self-contained **`people-deck.json`** to save — ideally into the vault, so your existing Obsidian sync (iCloud / Obsidian Sync) carries it everywhere. No script, no Node — the browser is the builder.
3. **Load: upload that file on any device.** The "Load deck" control on the same page accepts `people-deck.json` and writes it to IndexedDB. One file works everywhere — Mac and work laptop pick it straight from the vault folder; the phone opens it from the Files app. When notes change: rebuild once, save, re-load per device.
4. **Re-load merges by item id** — deck content updates freely while SRS state (separate storage, keyed by prompt ids) is untouched; items missing from a re-import are dropped and their orphaned state pruned.
5. **Backup is the vault** — the notes *and* the built deck file both live there. The browser copy is a disposable cache; losing or wiping a device loses nothing. This is the strongest privacy posture available: there is no server-side artifact to secure, encrypt, or leak.

Alternatives considered:

- **Encrypted blob committed here, built from the private repo** (the previous revision of this section — preserved in git history): deck content syncs automatically through deploys, but personal data lives in GitHub (ciphered or not) and the pipeline needs an Action, a passphrase secret, and WebCrypto UX. Rejected on the explicit "not in GitHub" preference.
- **Practicing people notes inside Obsidian** (e.g. the Spaced Repetition community plugin): fully local with zero new code, but it splits the daily ritual across two apps with two schedulers — the exact fragmentation this plan exists to remove.
- **A local server / self-hosted companion app:** strictly more moving parts than an import button, for the same result.

The one trade accepted: deck *content* doesn't auto-sync between devices — after editing people notes, you rebuild the file once and re-load it on each device (the vault-synced file makes this a file-picker moment, not a workflow). SRS *state* still syncs via §2.8, which carries only opaque prompt ids and scheduling numbers — no names, no facts — and the people deck can be excluded from sync entirely if even ids feel like too much.

Photos (face → name is the classic and most useful card): referenced by filename in frontmatter, read from the files dropped into the builder, downscaled to ~128px thumbnails client-side, and embedded as data URIs inside `people-deck.json` — so the deck file is fully self-contained and nothing ever exists on a server. Optional per person.

### 5.2b Considered: anonymized public people notes (rejected)

Could people notes be stripped of identifying metadata and published like any other note? No — three reasons, and prior art agrees:

1. **The identifying data is the payload.** A people card's entire job is name ↔ face ↔ context. Remove those and there is nothing left to practice; unlike a technical note, there's no residual idea worth publishing.
2. **Pseudonymization fails against context.** "P., my neighbour who runs the community garden; partner A." is instantly re-identifiable — precisely by the only readers who could ever connect it: the subject, and mutual acquaintances. In a personal social graph the anonymity set is ~1, and those are exactly the people you least want finding a card about themselves.
3. **These are third parties' facts, not yours.** The garden ethos — working with the garage door up — covers *your* ideas. Other people's lives (kids' names, where you met, what they do) are their information, published without consent even when fuzzed.

**Prior art: Matuschak partitions; he does not anonymize.** His public working-notes site is an explicitly *selective* mirror of his private thinking environment — publication is per-note opt-in, and links from public notes to unpublished ones simply don't resolve (readers see a reference to a note that isn't public). Personal material never gets an anonymized public variant; it just stays on the private side. The same partition is this plan's §5.2: people notes never leave the vault, full stop.

**The legitimate public carve-out: public figures.** Remembering authors of books you've read, scientists, historical figures — that's public knowledge and needs none of the private machinery: ordinary notes with learn blocks (or a small curated pool) make a normal public deck. The private people deck is for your personal social graph only; anyone the world already knows belongs in a public deck.

### 5.3 Authoring format

Person notes are written **exactly like TIL/evergreen notes** — markdown in the vault, learn block at the end (cheap with the §5A shorthand) — so there is one authoring habit across the whole system:

````markdown
---
name: Priya Raman
photo: priya.jpg
tags: [neighbours]
---
Runs the community garden; moved into the building in 2025.
Partner Anssi, daughter Veera. Met at the sauna evening, June 2025.

```learn
q: Who runs the community garden in our building?
a: Priya Raman

q: Priya's partner and daughter?
a: Anssi; Veera
```
````

- Prompts come from the learn block under the same rules as every other note-backed deck (positional ids, append-only stability). Item id from the timestamp filename (`people-202607221030`); term ← `name` (falling back to the note title).
- **Block-less notes still work:** if a note has no learn block, the importer generates a default prompt pair from what it can see — photo → name when a photo exists, first paragraph → name otherwise — so a hastily captured note is practicable immediately and can get hand-written prompts later.

### 5.4 Learn page

`/learn/people` is a public *shell* with private *content*: it ships empty apart from the build/load panels, and renders the wall chart — faces/names as tiles — only from what the local browser has imported. It carries `noindex` and registers in the practice registry with `source: { kind: 'local' }`; on a device with nothing imported, the practice session simply composes without it and shows a one-line "people deck not imported on this device" hint.

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

## 5B. Why not a subdomain / separate repo (decision)

Considered: moving the learning utilities to `learn.sajalchoudhary.net` backed by their own repo, so public site and private material never share a codebase. **Rejected for the public system; and for the private side the plan already separates repos — but along the data-visibility line, not the feature line.** The reasoning:

**Why the learning system stays on the site:**

- **The mnemonic medium couples it to the content.** The TIL and evergreen decks are *extracted from site notes at site build time*, and every card links back to its note. A separate repo would need the site's content at build (cross-repo fetch, submodule, or consuming the site's deck JSON endpoints) — a standing two-repo dependency for a solo maintainer, purchased with zero privacy gain since all of that data is public anyway.
- **The learn pages are content, not just utilities.** The wall charts are digital-garden artifacts in their own right — the periodic-table-on-the-wall *is* the public face of "learning in public." Exiling them to a tool subdomain loses that, and would mean duplicating (or extracting into a shared package) the site's layout, typography tokens, and styles — drift maintenance forever.
- **localStorage is per-origin.** Moving pages to a subdomain silently orphans all existing Linux/Finnish/TIL/evergreen progress until every device does an export/import dance. Survivable once sync (§2.8) exists, but it's real migration pain for aesthetic gain.
- If the actual itch is "personal utilities cluttering the public site": `/practice` gets `noindex` and stays out of the sitemap (it's a personal tool with no audience), while `/learn/*` remain indexed content. That's the whole remedy.

**Why the repo split follows data visibility, not features:**

The boundary that matters is *what must stay private*, not *what belongs to learning*. People notes (and any future private deck) never enter GitHub at all — they stay in the vault and are imported straight into each browser (§5.2). Public deck data (Linux, Finnish, vocab, and the note-extracted decks) stays here because it ships to a public site regardless — moving it would privatize nothing. "Public and private don't clash" is achieved by construction: nothing private ever *exists* in any repo, so there is nothing to clash with.

**A private satellite (Access-gated subdomain) is moot under local-first.** An earlier revision weighed a Cloudflare-Access-protected private app against client-side encryption as the private-deck mechanism; with §5.2's local-first design there is no server-side private data to protect anywhere, so the question dissolves. It returns only if per-device import friction ever comes to outweigh the "nothing on any server" property.

## 6. Hub and entry points after the split

- **`/practice`** — the ritual page: big start button, combined due/new counts, per-deck breakdown line, streak, deck toggles, export/import, and import/refresh controls for local decks. This is the page that gets bookmarked on the phone home screen.
- **`/learn`** — stays the map of territories, one card per system linking to its wall chart, but its per-system status lines simplify (item/prompt totals + territory progress) and a single "Today's practice: 12 due · 3 new →" banner replaces four separate calls to action.
- Learn pages link to `/practice` where the session button used to be.
- Future systems (periodic table, more languages) follow the existing "Building a new system" recipe for their learn page, plus one registry entry to join practice. A deck can even be practice-only (no wall chart yet) — registry entry with no `learnHref`.

## 7. Implementation phases

Each phase is independently shippable and leaves every existing page working.

**Phase 0 — Learn-block q/a shorthand (§5A). DONE.**
Standalone parser change in `extract-learn-blocks.mjs` + a line in `docs/content/authoring.md`. No dependency on anything else — can ship immediately and improves the authoring flow today.

**Phase 1 — Engine extraction (no behavior change). DONE.**
Extracted scheduler/persistence pure functions from `LearningSystem.tsx` into `src/components/learn/engine.ts` (`localToday`, `addDays`, `daysBetween`, `itemStatus`, `loadState`/`saveState`, `buildDailySession`, `gradeCard`, `finishSession`, plus the count helpers `computeDueCount`/`computeUnseenCount`/`computeIntroducedTodayCount`/`computeNewAvailable`); re-pointed `LearningSystem` and `LearnHub` at it, deleting `LearnHub`'s hand-duplicated count logic. Verified via `astro check` (0 errors), a full `npm run build`, and a live Playwright run through `/learn/linux` (start session → grade a new item + a review → done screen → state persisted) confirming `/learn` picks up the resulting streak/done status through the shared engine. All four learn pages and the hub behave identically to before.

**Phase 1b — FSRS adoption (§2.6).**
Swap the extracted engine's Leitner ladder for `ts-fsrs`: v2→v3 card migration with backup key, two-button grade mapping, same-session re-queue of forgotten cards, updated wall-chart status thresholds, desired-retention setting. Lands *before* `/practice` so the unified queue is built on the final scheduler from day one.

**Phase 2 — `/practice` + registry.**
`practice-registry.ts`; per-deck JSON endpoints (`src/pages/api/practice/[deck].json.ts`); `PracticeSession.tsx` island (queue composition per §2.3, deck badges, `practice-meta` state, streak seeding, export/import); `/practice.astro` page + styles; hub banner; learn pages' session buttons become links to `/practice`. Tuning constants start at `GLOBAL_DUE_CAP = 20`, `GLOBAL_NEW_PER_DAY = 5`.

**Phase 2b — Cross-device sync (§2.8).**
`functions/api/practice-state.js` + `PRACTICE_STATE` KV binding; client merge + push/pull wiring in the practice island; per-device PAT entry UI ("connect this device") and "last synced" indicator. Depends on Phase 2's `practice-meta`; everything before this works local-only.

**Phase 3 — Vocabulary deck.**
`fetch-wotd.yml` action + `scripts/fetch-wotd.mjs` (Wiktionary featured feed; M-W behind a flag); `vocab.generated.json`; skip-at-introduction + `suspended` list (this lands the suspend mechanism for *all* decks); `/learn/vocabulary` page; manual-capture via `category: vocab` inbox notes with definition enrichment.

**Phase 4 — People deck (local-first, §5.2).**
Refactor learn-block parsing into a shared module (build script + browser); "Build deck file" panel on `/learn/people` (drop `.md` files + photos → self-contained `people-deck.json` download, client-side thumbnailing, default-prompt generation for block-less notes) and "Load deck" panel (upload the JSON → IndexedDB, merge-by-id, orphan pruning); `noindex` page shell.

**Phase 5 — Niceties (as wanted).**
Leech detection (flag `lapses >= 6` on charts and in a session hint); keyboard shortcuts (space = reveal, 1/2 = grade); per-deck stats on `/practice`; a real quick-add composer for vocab/people; FSRS revisit per the §2.6 trigger.

**Phase 6 — Finnish vocabulary expansion (`finnish-vocab` deck).**
The existing Finnish deck is *rules-first by design* — its vocabulary category holds ~14 items (11 nouns plus bundled adjectives/greetings/numbers), chosen to feed the rule prompts, and the verbs category teaches the conjugation *system* with only `olla` as an actual word. That's the right Phase-1 scope per its own plan, but it is nowhere near communicative vocabulary (~300–500 words for survival, 1000+ for basic conversation). Rather than growing the rules deck (whose wall chart should stay a bounded territory you can finish), add a **sibling deck** `finnish-vocab` on the TIL-style open-feed model: themed categories (verbs, family, food, time, question words/pronouns, places, adjectives), items sourced from a reputable frequency list (e.g. the Kelly project list — per the Finnish plan's rule, **never invent Finnish**), added in curated batches of 20–50. Each word gets both-direction prompts (fi→en, en→fi) plus, where the word exercises a learned rule, one *apply-the-rule* prompt (e.g. inflect it into the inessive) — compounding the rules deck exactly as that plan's thesis intends. Separate deck = its own tuning (`newPerDay: 3`, higher `dueCap`) and the unified practice queue interleaves it with everything else automatically.

## 8. Open questions (defaults chosen, override freely)

| # | Question | Default taken in this plan |
| --- | --- | --- |
| 1 | Private-deck mechanism | Local-first: vault notes imported straight into the browser, nothing in GitHub or on any server (§5.2) |
| 2 | Scheduler | FSRS via `ts-fsrs`, two-button grading, one-time Leitner→v3 migration (§2.6) |
| 3 | Vocab feeds | Wiktionary daily; Merriam-Webster off by default |
| 4 | Feed-word curation | Skip-at-introduction inside the session (§4.4), no approval inbox |
| 5 | Global caps | 20 due / 5 new per day, round-robin across decks |
| 6 | People photos | Yes — thumbnailed client-side at import, stored only in IndexedDB; deck works fine without them |
| 7 | Global streak | Seeded from the max of existing per-deck streaks |
| 8 | Sync backend | Cloudflare KV + Pages Function with per-device PATs (§2.8); GitHub-contents-API fallback recorded |
| 9 | Learn-block shorthand | Bare q/a stanzas via a pre-split in the extractor (§5A); full syntax stays valid |
| 10 | Subdomain / separate repo | Stay on the site; repo split follows data visibility only (§5B); local-first makes a private satellite moot |

## 9. Documentation to update at implementation time

- `docs/architecture/learning-systems.md` — restructure around the learn/practice split; the registry becomes the "adding a system" entry point; move tuning table to include global caps.
- `docs/content/authoring.md` — `category: vocab` capture notes; the learn-block q/a shorthand.
- People-note format and the local import flow — in the learning-systems doc update, plus a README note inside the vault's `people/` folder (the only place the convention's data lives).
- `scripts/README.md` — `fetch-wotd.mjs`.
