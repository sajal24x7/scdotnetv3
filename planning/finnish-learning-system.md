# Finnish Learning System — Plan

- Status: PLANNED — ready for implementation
- Target page: `/learn/finnish`
- Blueprint: [`docs/architecture/learning-systems.md`](../docs/architecture/learning-systems.md) (the "periodic table on the wall" pattern; first implementation `/learn/linux`)
- Branch: `claude/finnish-learning-system-1s29ux`

## 0. The brief

Sajal wants to learn Finnish, is interested in the origins of the language, and was drawn in by the idea that Finnish is a language of rules — once you internalize the rule system, producing correct Finnish becomes largely mechanical. This plan takes that premise seriously and builds the training *around the rules* rather than around a vocabulary list.

**The pedagogical thesis.** Finnish is unusually rule-governed in exactly the places where most languages are chaotic:

- **Spelling and pronunciation are one system.** One letter = one sound, always; stress is always on the first syllable. There is no "how do you pronounce this word?" problem. This is learnable in days, not years.
- **Grammar is agglutinative.** Instead of prepositions and word-order tricks, Finnish stacks suffixes onto stems: `talo` (house) → `talossa` (in the house) → `talossani` (in my house). Fifteen cases replace most of what English does with prepositions.
- **The suffixes themselves obey two master rules** — vowel harmony (which vowel flavor a suffix takes) and consonant gradation (how the stem mutates when a suffix closes a syllable). Learn ~10 gradation patterns and the harmony rule, and thousands of word forms become derivable instead of memorizable.
- **What Finnish *doesn't* have** is also a gift: no grammatical gender, no articles, no future tense.

**Honest caveats the system must respect** (these appear in the page copy and in "Roots" content, not hidden):

1. The vocabulary gives almost no freebies — Finnish is not Indo-European, so `kirja`, `vesi`, `puhua` share no roots with English. Rules make forms cheap; the word stock still needs spaced repetition. That's exactly what this system is for.
2. Spoken Finnish (*puhekieli*) differs noticeably from written Finnish (*kirjakieli*). We teach the written standard and flag the difference explicitly (item G6).
3. Rules have lexical exceptions (three illative shapes, gradation quirks). Phase 1 stays inside the regular core.

**Design consequence.** Unlike the Linux deck (facts to retrieve), roughly half of this deck is *procedures to execute*. Rule prompts are generative: "Apply: `kauppa` + `-ssa` → ?" (answer: `kaupassa`). The vocabulary track exists partly to supply raw material for the rule track, so the two compound: every new word is another rep for harmony and gradation.

## 1. What we inherit from the blueprint

Everything in `docs/architecture/learning-systems.md` applies unchanged: the system chooses (zero-decision daily ritual), retrieval not recognition, Leitner boxes 1–5 with intervals 1/3/7/14/30 days, bounded sessions, gradual introduction, atomic prompts, wall chart as visible territory, reference cards behind tiles, drills that don't touch scheduler state, localStorage per system, no accounts, no guilt mechanics.

Per that doc's own instruction (§"Building a new system"), the second system is the moment to **generalize the island** into a shared component rather than copy `LinuxQuiz.tsx`. That refactor is Phase E1 below.

### Tuning constants for Finnish

| Constant | Linux | Finnish | Why |
| --- | --- | --- | --- |
| `BOX_INTERVALS` | 1/3/7/14/30 | same | No reason to deviate |
| `NEW_ITEMS_PER_DAY` | 2 | **3** | Language decks tolerate faster intake (blueprint §"Tuning"); 59 items ramp in ~3 weeks |
| `DUE_CAP` | 8 | **12** | More prompts per item + faster intake means a bigger honest daily due pile |
| `MAX_BOX` | 5 | same | |
| Storage key | `linux-learn-srs` | `finnish-learn-srs` | Never share state between decks |

## 2. Curriculum — the wall chart territory

Eight categories ≈ 59 items ≈ 140 prompts (same scale as the Linux deck). The chart makes the rule system *visible as a territory*: you can see the whole grammar of survival Finnish on one screen and watch it turn green.

| # | Category id | Title | Emoji | Items | What it is |
| --- | --- | --- | --- | --- | --- |
| A | `sounds` | Sounds & Reading | 🔤 | 7 | The pronunciation/spelling rule system — the fastest win in Finnish |
| B | `gradation` | Consonant Gradation (KPT) | 🧊 | 9 | The stem-mutation patterns Finns call *astevaihtelu* |
| C | `local-cases` | Location Cases | 📍 | 7 | The famous 2×3 grid that replaces in/into/out of/on/onto/off |
| D | `gram-cases` | Core Grammar Cases | ⚙️ | 5 | Nominative, genitive, and the mighty partitive |
| E | `verbs` | Verbs | 🏃 | 8 | Personal endings, the four common verb types, negation, questions |
| F | `character` | Character of the Language | 🧭 | 3 | What Finnish deliberately doesn't have |
| G | `roots` | Roots (Juuret) | 🗺️ | 6 | Origins: Uralic family, loanword time capsules, Agricola |
| H | `vocab` | Survival Vocabulary | 💬 | 14 | Words chosen to *feed the rule prompts* |

### Item inventory and content specification

> **⚠️ RULE FOR IMPLEMENTERS: never invent Finnish.** Every Finnish string in `src/data/finnish.ts` must be copied verbatim from the tables in this section. If a prompt you're writing needs a Finnish form that is not in this document, do not derive or guess it — leave the prompt out and note it in the PR. Finnish morphology has traps (harmony, gradation direction, e-stems) that will produce plausible-looking wrong answers.

Each item below lists: **id · term (tile label) · canonical form (`syntax` field) · what the reference card says · example**. Prompts follow the templates in §3, instantiated with forms from the inflection banks in §2.9–2.10.

#### 2.1 A — Sounds & Reading (`sounds`)

| id | term | Canonical form | Reference card gist | Example |
| --- | --- | --- | --- | --- |
| `a-phonemic` | read = write | one letter, one sound | Finnish spelling is fully phonemic: every letter is always pronounced, always the same way. If you can spell it you can say it. | `kioski` — five letters, five sounds, no surprises |
| `a-stress` | stress | always 1st syllable | Word stress falls on the first syllable, every word, no exceptions. | `HEl-sin-ki`, `KA-le-va-la` |
| `a-length` | long sounds | double letter = long sound | Doubled vowels and consonants are held twice as long, and length changes meaning. | `tuli` fire · `tuuli` wind · `tulli` customs |
| `a-vowels` | ä ö y | front vowels | `ä ö y` are independent front vowels (not accented a/o/u); `a o u` are back vowels; `e i` are neutral. | `ä` as in *cat*; `y` like German *ü* |
| `a-harmony` | vowel harmony | back with back, front with front | A native word contains back vowels (`a o u`) or front vowels (`ä ö y`), never both; `e i` go with either. Every suffix has two forms and copies the word's flavor. | `talossa` (back) but `metsässä` (front) |
| `a-suffix-pairs` | -ssa/-ssä | suffix pairs | Because of harmony, endings come in pairs: `-ssa/-ssä`, `-lla/-llä`, `-ko/-kö`, `-vat/-vät`. Picking the right one is automatic once you scan the stem's vowels. | `Puhutko?` but `Syötkö?` |
| `a-diphthongs` | diphthongs | uo · ie · yö | Finnish glues vowels into diphthongs pronounced as written. | `suo` swamp · `tie` road · `yö` night |

#### 2.2 B — Consonant Gradation / KPT (`gradation`)

Reference-card framing for the whole category: Finns call this **KPT** because it hits the stops k, p, t. Words alternate between a **strong grade** (basic form) and a **weak grade** (when most endings — genitive `-n`, `-ssa`, `-lla`… — close the syllable). Partitive `-a/-ä` and illative keep the strong grade.

| id | term | Pattern | Strong → weak example (nom → gen) |
| --- | --- | --- | --- |
| `b-principle` | KPT rule | strong ↔ weak grade | `kauppa` → `kaupan`: ending closes the syllable, stem weakens |
| `b-kk` | kk ~ k | kk → k | `kukka` → `kukan` (flower) |
| `b-pp` | pp ~ p | pp → p | `kauppa` → `kaupan` (shop) |
| `b-tt` | tt ~ t | tt → t | `tyttö` → `tytön` (girl) |
| `b-k` | k ~ ∅/v | k → nothing (→ v after u/y) | `jalka` → `jalan` (foot); `puku` → `puvun` (suit) |
| `b-p` | p ~ v | p → v | `leipä` → `leivän` (bread) |
| `b-t` | t ~ d | t → d | `katu` → `kadun` (street); `pöytä` → `pöydän` (table) |
| `b-nk` | nk ~ ng | nk → ng | `Helsinki` → `Helsingin`; `kenkä` → `kengän` (shoe) |
| `b-assim` | nt · lt · rt · mp | assimilation: nt→nn, lt→ll, rt→rr, mp→mm | `ranta`→`rannan` (shore) · `ilta`→`illan` (evening) · `parta`→`parran` (beard) · `kampa`→`kamman` (comb) |

#### 2.3 C — Location Cases (`local-cases`)

Reference-card framing: where English uses six prepositions, Finnish uses a perfectly symmetric **2×3 grid**: interior vs. exterior × being/leaving/entering. Model noun for interior: `talo` (house); for exterior: `pöytä` (table — note gradation `t→d` in weak-grade cells).

| id | term | Suffix | Meaning | Example |
| --- | --- | --- | --- | --- |
| `c-grid` | the 2×3 grid | s-cases = inside, l-cases = surface | The whole system in one picture: `-ssa/-sta/-Vn` (in/out of/into) and `-lla/-lta/-lle` (on/off/onto) | `talossa · talosta · taloon` / `pöydällä · pöydältä · pöydälle` |
| `c-ine` | -ssa/-ssä | inessive | in, inside | `talossa` in the house · `Helsingissä` in Helsinki |
| `c-ela` | -sta/-stä | elative | out of, from inside | `talosta` out of the house · `Suomesta` from Finland |
| `c-ill` | into (illative) | vowel + n | into (commonest shape: lengthen final vowel + `n`) | `taloon` into the house · `Helsinkiin` to Helsinki |
| `c-ade` | -lla/-llä | adessive | on, at; also "have" | `pöydällä` on the table · `kadulla` on the street |
| `c-abl` | -lta/-ltä | ablative | off, from (a surface) | `pöydältä` off the table |
| `c-all` | -lle | allative | onto, to (a surface/person) | `pöydälle` onto the table |

Note for the `c-ill` card: the illative has other shapes (`-hVn`, `-seen`) for other stem types — out of scope for phase 1, mention on the card as a one-liner.

#### 2.4 D — Core Grammar Cases (`gram-cases`)

| id | term | Canonical form | Reference card gist | Example |
| --- | --- | --- | --- | --- |
| `d-nom` | dictionary form | nominative | The bare form is the nominative — subject of the sentence, the form dictionaries list, always strong grade. | `kauppa on iso` — the shop is big |
| `d-gen` | -n | genitive | Possession and much else: add `-n` (weak grade!). | `talon ovi` the house's door · `kissan nimi` the cat's name |
| `d-part` | partitive | -a/-ä · -ta/-tä | The signature Finnish case: an "incomplete amount" of something. After short vowel add `-a/-ä` (`taloa`, `kahvia`); `vesi` becomes `vettä`. Keeps strong grade. | `Juon kahvia` — I drink (some) coffee |
| `d-part-num` | numbers + partitive | kaksi taloa | After numbers 2+, the noun goes in the **partitive singular**, not plural. | `yksi talo, kaksi taloa, kolme kissaa` |
| `d-part-neg` | negation + partitive | en juo kahvia | The object of a negative sentence is partitive. | `Juon kahvin` I'll drink the coffee → `En juo kahvia` I don't drink coffee |

#### 2.5 E — Verbs (`verbs`)

| id | term | Canonical form | Reference card gist | Example |
| --- | --- | --- | --- | --- |
| `e-endings` | personal endings | -n -t – -mme -tte -vat | One set of endings for every verb: `puhun, puhut, puhuu, puhumme, puhutte, puhuvat`. 3sg lengthens the final vowel instead of adding an ending. Pronouns optional for I/you because the ending already tells you. | `puhun` = I speak (no `minä` needed) |
| `e-olla` | olla | to be | The one truly irregular must-know verb: `olen, olet, on, olemme, olette, ovat`. | `Olen Sajal.` — I am Sajal |
| `e-type1` | type 1: -a/-ä | puhua → puhu- | The biggest verb group: infinitive ends in two vowels + `a/ä`. Stem = infinitive minus the final `-a/-ä` (`puhua` → `puhu-`), then add the personal endings. | `puhua` → `puhun` · `sanoa` → `sanon` |
| `e-type2` | type 2: -da/-dä | syödä → syö- | Verbs in `-da/-dä`: stem = infinitive minus `-da/-dä`. | `syödä` → `syön` · `juoda` → `juon` |
| `e-type3` | type 3: -lla/-nnä… | tulla → tule- | Verbs in `-lla/-llä, -nna/-nnä, -rra/-rrä, -sta/-stä`: drop the last two letters, **add `-e-`**, then endings. | `tulla` → `tulen` · `mennä` → `menen` · `opiskella` → `opiskelen` |
| `e-type4` | type 4: -ata/-ätä | haluta → halua- | Verbs in vowel+`ta/tä`: drop `-t-`, add `-a-`. | `haluta` → `haluan` I want |
| `e-neg` | negation | en · et · ei · emme · ette · eivät | The negative word is itself a verb that conjugates; the main verb drops to its bare stem. | `puhun` → `en puhu` · `hän syö` → `hän ei syö` |
| `e-q` | -ko/-kö | question particle | Yes/no questions: verb first + `-ko/-kö` (harmony!). | `Puhutko suomea?` · `Onko kahvi hyvää?` |

#### 2.6 F — Character of the Language (`character`)

| id | term | Canonical form | Reference card gist | Example |
| --- | --- | --- | --- | --- |
| `f-han` | hän | no gender, no articles | One pronoun `hän` for he and she; no *a/an/the* at all. Definiteness comes from context and word order. | `Hän on opettaja` — he/she is a teacher |
| `f-have` | minulla on | "on me is" | Finnish has no verb *to have*. Possession = adessive + `olla`: literally "on me is". | `Minulla on koira` — I have a dog |
| `f-nofuture` | no future tense | present covers it | There is no future tense; present + context does the job. | `Huomenna menen kauppaan` — tomorrow I('ll) go to the shop |

#### 2.7 G — Roots / Juuret (`roots`) — the origins track

This category exists because the learner explicitly asked about the language's origins. Facts as retrievable prompts, one story per card.

| id | term | Canonical form | Reference card gist |
| --- | --- | --- | --- |
| `g-uralic` | Uralic | not Indo-European | Finnish belongs to the **Uralic** family — a completely separate tree from English, Hindi, Russian, French (all Indo-European). That's why the vocabulary looks alien: it *is* unrelated. |
| `g-relatives` | relatives | Estonian near, Hungarian far | Closest relatives: Estonian and Karelian (partly intelligible). Hungarian is family too, but separated by thousands of years — related the way English is to Persian. |
| `g-sami` | Sami | northern cousins | The Sami languages of Lapland are Uralic cousins, not dialects of Finnish. |
| `g-loans` | loanword time capsule | kuningas < *kuningaz | Finnish changes so slowly it preserves ancient loans better than the lenders: `kuningas` (king) still ≈ Proto-Germanic `*kuningaz`; `ranta` (shore) < Germanic strand-word; `äiti` (mother) < Gothic `aiþei`; `sata` (hundred) is an Indo-Iranian loan from ~4000 years ago. |
| `g-agricola` | Agricola 1543 | father of written Finnish | Written Finnish is young: bishop **Mikael Agricola** published the first Finnish book (*Abckiria*, an ABC-primer, ~1543) and the New Testament (1548). |
| `g-registers` | kirjakieli / puhekieli | written vs spoken | The standard you learn (*kirjakieli*) and everyday speech (*puhekieli*) differ: `minä olen` → spoken `mä oon`. Learn the book language first; the street version is a systematic compression of it. |

#### 2.8 H — Survival Vocabulary (`vocab`)

Chosen so that nearly every word exercises a rule elsewhere in the deck (gradation pattern, harmony flavor, e-stem, etc.). Column "feeds" shows the deliberate cross-link.

| id | term | Meaning | Feeds |
| --- | --- | --- | --- |
| `h-talo` | talo | house | clean case paradigm (no gradation) — model noun for C |
| `h-katu` | katu | street | `t~d` gradation; adessive "on the street" |
| `h-kauppa` | kauppa | shop | `pp~p`; the canonical KPT example |
| `h-kirja` | kirja | book | back harmony, no gradation |
| `h-vesi` | vesi | water | e-stem: `veden / vettä / vedessä` — flagship irregular-ish noun |
| `h-kahvi` | kahvi | coffee | partitive object: `juon kahvia` |
| `h-maito` | maito | milk | `t~d`: `maidon` |
| `h-leipa` | leipä | bread | front harmony + `p~v`: `leivän` |
| `h-kissa` | kissa | cat | `-lla` possession: `kissalla on` |
| `h-koira` | koira | dog | `minulla on koira` |
| `h-poyta` | pöytä | table | front harmony + `t~d`; model noun for exterior cases |
| `h-adjs` | hyvä · iso · pieni | good · big · small | `pieni` is an e-stem (`pientä`); `Hyvää päivää!` greeting |
| `h-greet` | kiitos · anteeksi · hei/moi | thanks · sorry · hi | zero-grammar day-one wins |
| `h-num` | 1–10 | yksi kaksi kolme neljä viisi kuusi seitsemän kahdeksan yhdeksän kymmenen | numbers + partitive (`d-part-num`) |

#### 2.9 Inflection bank (nouns) — the only permitted source of noun forms

| Nominative | Genitive `-n` | Partitive | Inessive/Adessive | Illative/Allative |
| --- | --- | --- | --- | --- |
| talo | talon | taloa | talossa | taloon |
| katu | kadun | katua | kadulla | kadulle |
| kauppa | kaupan | kauppaa | kaupassa | kauppaan |
| kirja | kirjan | kirjaa | kirjassa | kirjaan |
| vesi | veden | vettä | vedessä | veteen |
| kahvi | kahvin | kahvia | — | — |
| maito | maidon | maitoa | — | — |
| leipä | leivän | leipää | — | — |
| kissa | kissan | kissaa | kissalla | kissalle |
| koira | koiran | koiraa | koiralla | koiralle |
| pöytä | pöydän | pöytää | pöydällä (‑ltä: pöydältä) | pöydälle |
| Helsinki | Helsingin | Helsinkiä | Helsingissä | Helsinkiin |
| Suomi | Suomen | Suomea | Suomessa | Suomeen |
| kukka | kukan | kukkaa | — | — |
| jalka | jalan | jalkaa | — | — |
| puku | puvun | pukua | — | — |
| tyttö | tytön | tyttöä | — | — |
| kenkä | kengän | kenkää | — | — |
| ranta | rannan | rantaa | rannalla | — |
| ilta | illan | iltaa | — | — |
| parta | parran | partaa | — | — |
| kampa | kamman | kampaa | — | — |
| metsä | metsän | metsää | metsässä | metsään |

#### 2.10 Conjugation bank (verbs)

| Infinitive | minä | sinä | hän | me | te | he |
| --- | --- | --- | --- | --- | --- | --- |
| puhua (speak) | puhun | puhut | puhuu | puhumme | puhutte | puhuvat |
| sanoa (say) | sanon | sanot | sanoo | sanomme | sanotte | sanovat |
| syödä (eat) | syön | syöt | syö | syömme | syötte | syövät |
| juoda (drink) | juon | juot | juo | juomme | juotte | juovat |
| tulla (come) | tulen | tulet | tulee | tulemme | tulette | tulevat |
| mennä (go) | menen | menet | menee | menemme | menette | menevät |
| opiskella (study) | opiskelen | opiskelet | opiskelee | opiskelemme | opiskelette | opiskelevat |
| haluta (want) | haluan | haluat | haluaa | haluamme | haluatte | haluavat |
| olla (be) | olen | olet | on | olemme | olette | ovat |

Negative present (any verb): `en/et/ei/emme/ette/eivät` + bare stem — e.g. `en puhu`, `et syö`, `hän ei tule`, `emme mene`.

Useful full sentences (verbatim bank): `Puhutko suomea?` (Do you speak Finnish?) · `Puhun vähän suomea.` (I speak a little Finnish.) · `En puhu suomea.` · `Minulla on koira.` · `Onko kahvi hyvää?` · `Hyvää päivää!` · `Huomenna menen kauppaan.`

## 3. Prompt design

Prompts follow the blueprint's Matuschak rules (atomic, short unambiguous answer, scenario-flavored) plus one Finnish-specific extension: **rule items get application prompts** — the learner executes the procedure on a concrete word, not just recites the rule. Aim for 2–3 prompts per item, each direction/skill scheduled separately.

Templates by item kind (instantiate only with §2.9–2.10 forms):

1. **Vocabulary, both directions** (per blueprint: fi→en and en→fi are different memory acts, separate prompts):
   - `q: "What does *kauppa* mean?"` → `a: "shop"`
   - `q: "Finnish for 'shop'?"` → `a: "kauppa"`
2. **Rule recall** (one per rule item): `q: "Which suffix means 'in' (inside something)?"` → `a: "-ssa/-ssä"` with note `"talossa — in the house"`
3. **Rule application** (the signature prompt type — at least one per B/C/D/E item): `q: "Apply the case: kauppa + 'in' → ?"` → `a: "kaupassa"` with note `"pp weakens to p: the -ssa ending closes the syllable (KPT)."`
4. **Harmony forks**: `q: "'in the forest': metsä + ssa or ssä?"` → `a: "metsässä"` with note `"ä is a front vowel, so the suffix takes its front form."`
5. **Contrast prompts** (like the Linux `df vs du` prompt): `q: "talossa vs talolla — which is 'in' and which is 'at/on'?"` → `a: "talossa = in (inside); talolla = at/on"`
6. **Sentence production** (E/F items, from the sentence bank only): `q: "Say: 'I don't speak Finnish.'"` → `a: "En puhu suomea."` with note `"Negative verb conjugates; main verb bare stem; object goes partitive."`
7. **Roots facts** (G): plain retrieval — `q: "Finnish's closest major relative language?"` → `a: "Estonian"` with note `"Same Finnic branch of Uralic; Hungarian is a far more distant cousin."`

**Worked example — full prompt set for one rule item** (`c-ine`, inessive), as the quality bar:

```ts
prompts: [
    { id: 'c-ine-1', q: 'Which case ending means “in / inside”?', a: '-ssa / -ssä',
      note: 'Inessive. talossa — in the house; Helsingissä — in Helsinki.' },
    { id: 'c-ine-2', q: 'Apply it: “in the shop” (kauppa) → ?', a: 'kaupassa',
      note: 'Two rules fire at once: KPT weakens pp→p, harmony picks -ssa (back vowels).' },
    { id: 'c-ine-3', q: 'Apply it: “in Finland” (Suomi) → ?', a: 'Suomessa',
      note: 'i-final nouns often shift i→e in the stem: Suomi → Suome- + -ssa.' },
]
```

**Worked example — vocabulary item** (`h-vesi`):

```ts
prompts: [
    { id: 'h-vesi-1', q: 'What does *vesi* mean?', a: 'water' },
    { id: 'h-vesi-2', q: 'Finnish for “water”?', a: 'vesi' },
    { id: 'h-vesi-3', q: '“I drink water” — juon … ?', a: 'Juon vettä.',
      note: 'vesi is an e-stem: partitive is vettä (not “vesiä”). Drinking = incomplete amount = partitive.' },
]
```

### Introduction order

`introductionOrder` is **hand-curated and dependency-aware**, not plain round-robin. Hard constraints:

1. Day 1: `h-greet`, `a-phonemic` — an instant win and the "you can already read Finnish" hook.
2. `a-vowels` and `a-harmony` before any suffix item (C/E suffixes assume harmony).
3. `b-principle` before any other B item; at least one B pattern (`b-pp`) before `c-ine` so the first case application makes sense.
4. Every rule item comes *after* at least one vocabulary word it uses (e.g. `h-kauppa` before `b-pp`; `h-talo` before `c-grid`).
5. `d-part` before `d-part-num` and `d-part-neg`; `e-endings` and `e-olla` before the verb-type items; `e-type1` before `e-neg` and `e-q`.
6. Sprinkle G (roots) items one every 3–4 days as "dessert" — they're light and keep the origins thread alive through the ramp.
7. Otherwise interleave categories so no day is all-grammar or all-vocab.

The implementer should write the full 59-entry order into the data file following these constraints and eyeball the first ten days (3 items/day) for sanity.

## 4. Engineering plan

### E1 — Generalize the engine (no behavior change to /learn/linux)

The blueprint marks this as the preferred path once a second system exists. `LinuxQuiz.tsx` is already content-agnostic except for imports, labels, and constants.

- Create `src/components/learn/LearningSystem.tsx`: the current component parameterized by a config prop (or a factory), typed roughly as:

```ts
export interface LearnDataset {
    categories: Category[];      // Category { id, title, emoji, description, items: LearnItem[] }
    introductionOrder: string[];
}
export interface LearnItem {     // was Command; `term` was `cmd`
    id: string; term: string; syntax: string; description: string;
    example: string; exampleNote: string; prompts: Prompt[];
}
export interface LearnSystemConfig {
    storageKey: string;          // e.g. 'finnish-learn-srs'
    legacyKey?: string;          // linux only
    newPerDay: number; dueCap: number;
    itemNoun: string;            // 'command' / 'word or rule' — used in UI copy
    monoAnswers: boolean;        // true: render answers in <code>; false: prose (Finnish)
    dataset: LearnDataset;
}
```

- Move shared types (`Prompt`, `Category`, `LearnItem`) into `src/components/learn/types.ts` (or export from the component module); `linux-commands.ts` re-exports/maps `cmd`→`term`.
- `linux.astro` renders `<LearningSystem client:load config={linuxConfig} />` (config module `src/data/linux-learn-config.ts` or inline in the data file). **`LinuxQuiz.tsx` is deleted** once parity is confirmed.
- **Invariants:** Linux storage key stays `linux-learn-srs` with the same shape and the same legacy-key migration; every Linux prompt id is byte-identical (they key saved state); visual output identical.
- CSS: move `src/styles/linux-learn.css` → `src/styles/learn.css`, keep the `lq-*` class names as the shared learn-system namespace (renaming buys nothing and risks churn). Add a `.lq-answer__text--prose` variant used when `monoAnswers` is false — Finnish answers set in the serif/body stack per the typography tokens, not `--font-mono`. Keep the page-level classes (`learn-linux-page__*`) per page.

### E2 — Finnish content pool

- `src/data/finnish.ts` implementing §2 exactly. Header comment mirrors `linux-commands.ts`'s, pointing at the blueprint doc *and this plan*, and repeats the "never invent Finnish — all forms come from planning/finnish-learning-system.md" rule.
- Prompt ids: `<item-id>-1`, `-2`, … as in §3's worked examples. Globally unique, stable forever.

### E3 — Page

- `src/pages/learn/finnish.astro`, modeled on `linux.astro` (Layout + LayoutContainer conventions per AGENTS.md). Title: "Learn Finnish — The Language of Rules". Subtitle copy should carry the thesis and the origins hook in 3–4 sentences, e.g.: *"Finnish isn't Indo-European — it's a Uralic language that builds words by stacking rule-governed suffixes onto alien-looking stems. That makes it unusually learnable by system: master vowel harmony, consonant gradation, and a grid of case endings, and thousands of word forms become derivable instead of memorizable. A few minutes a day; the scheduler decides what you see; the chart turns green as the rule system becomes yours."*
- Import `src/styles/learn.css`.

### E4 — Validation script (implementer guardrail)

- `scripts/validate-learn-data.mjs` (catalog it in `scripts/README.md`): loads both data pools and asserts — all prompt ids globally unique **within each pool**; every `introductionOrder` entry exists and appears exactly once; every item appears in `introductionOrder`; every item has ≥1 prompt; every category non-empty. Run it in the PR (`node scripts/validate-learn-data.mjs`); wire into `npm run build` only if trivial.

### E5 — Docs

- Update `docs/architecture/learning-systems.md`: key-files table gains the Finnish row and the shared `LearningSystem.tsx`/`learn.css` paths; §"Building a new system" note that the generalization is done; tuning table gains the Finnish column.
- Optional (nice-to-have, skip if time-boxed): `/learn/index.astro` listing both systems.

## 5. Task breakdown

Ordered; each task is a reviewable unit. `npm run build` and `npx astro check` must pass after every task.

- [ ] **T1 (E1)** Extract `LearningSystem.tsx` + shared types + `learn.css`; port `/learn/linux` onto it; delete `LinuxQuiz.tsx`.
  - AC: build passes; `/learn/linux` renders identically; storage key, legacy migration, and all Linux prompt ids unchanged (grep-diff the ids); constants unchanged (2 new/day, cap 8).
- [ ] **T2 (E4)** Add `scripts/validate-learn-data.mjs`; document in `scripts/README.md`; passes against the Linux pool.
- [ ] **T3 (E2)** Write `src/data/finnish.ts` — all 8 categories, 59 items, prompts per §3 templates, curated `introductionOrder` per §3 constraints. **Every Finnish string verbatim from §2.**
  - AC: validation script passes; spot-check 10 random Finnish forms against §2.9–2.10 tables; ~120–150 prompts total; every B/C/D/E item has ≥1 application prompt.
- [ ] **T4 (E3)** Add `/learn/finnish` page with config (`storageKey: 'finnish-learn-srs'`, 3 new/day, cap 12, `monoAnswers: false`).
  - AC: page builds; a full session works in dev (learn card → prompts → done screen); ä/ö render correctly; tiles show Finnish terms legibly on mobile widths.
- [ ] **T5 (E5)** Update `docs/architecture/learning-systems.md` per E5.
- [ ] **T6** Manual QA pass documented in the PR: fresh-profile day-1 session on `/learn/finnish`; confirm `/learn/linux` with pre-seeded localStorage state loads that state intact; drill mode on the Gradation category leaves localStorage untouched.

## 6. Deliberate non-features (phase 1)

Inherited from the blueprint (no SM-2, no sync, no guilt mechanics) plus Finnish-specific scope cuts, all revisitable in a phase 2 once the ramp completes (~3 weeks of use):

- **No audio.** Finnish orthography is phonemic — the letter-to-sound category carries pronunciation for now. Phase 2 candidate: audio on reference cards.
- **No typing input / answer checking.** Self-grading reveal is the blueprint's core mechanic; free-text checking of Finnish (harmony variants, typos on ä/ö) is a rabbit hole.
- **No past tense, plural cases, possessive suffixes, object-case rules beyond partitive, illative variants, verb types 5–6, or puhekieli forms.** Phase 2 content batches — the architecture (add items + prompts, extend `introductionOrder`) needs no changes for any of these.
- **No generated inflections.** All forms are hand-specified data; no morphology engine.

## 7. Risks

| Risk | Mitigation |
| --- | --- |
| Implementing model invents wrong Finnish forms | Hard rule in §2 + header comment in data file + T3 AC spot-check; all needed forms precomputed in §2.9–2.10 |
| E1 refactor corrupts existing Linux progress | Invariants in T1 AC (storage key, prompt ids, migration); T6 seeded-state QA |
| Rule prompts feel like grammar homework | Application prompts use real survival words the learner also owns as vocab; notes always explain *which rule fired*; roots items pace the grind |
| Deck too grammar-heavy for a beginner | 14 vocab items + sentence-bank prompts give immediately usable Finnish; introduction order interleaves per §3 |
