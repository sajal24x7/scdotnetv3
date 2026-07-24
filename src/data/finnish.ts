// Content pool for the /learn/finnish practice page.
//
// Structure follows docs/architecture/learning-systems.md and
// planning/finnish-learning-system.md: each item is a small reference card
// plus 2+ atomic retrieval prompts. Prompts are the unit of scheduling (the
// FSRS engine in src/components/learn/engine.ts tracks its own card per
// prompt); items are the unit of introduction and of the wall chart.
//
// RULE FOR EDITORS: never invent Finnish. Every Finnish string below is
// copied verbatim from the tables in planning/finnish-learning-system.md §2
// (item inventory in §2.1–2.8, inflection bank in §2.9, conjugation bank in
// §2.10). If a prompt needs a Finnish form that isn't in that document,
// don't derive or guess it — leave it out. Finnish morphology has traps
// (vowel harmony, gradation direction, e-stems) that produce plausible-
// looking wrong answers.

import type { Category } from '../components/learn/types';

export const categories: Category[] = [
	{
		id: 'sounds',
		title: 'Sounds & Reading',
		emoji: '🔤',
		description: 'The pronunciation/spelling rule system — the fastest win in Finnish.',
		items: [
			{
				id: 'a-phonemic',
				term: 'read = write',
				syntax: 'one letter, one sound',
				description:
					'Finnish spelling is fully phonemic: every letter is always pronounced, always the same way. If you can spell it you can say it.',
				explanation:
					"There's no silent 'e', no letter that changes sound depending on what's next to it, and no digraph that collapses into a single surprise sound. Once you know the ~20-letter alphabet's sounds, you can read any word aloud correctly the first time — including names and loanwords you've never seen, since they get spelled the Finnish way too.",
				examples: [
					{ code: 'kioski', note: 'Five letters, five sounds, no surprises.' },
					{ code: 'talo', note: "Read exactly as written: /t/ /a/ /l/ /o/ — no hidden rules to learn." },
					{ code: 'Helsinki', note: 'Even a well-known proper noun follows the same one-letter-one-sound rule.' },
				],
				prompts: [
					{
						id: 'a-phonemic-1',
						q: 'True or false: in Finnish, a letter can be silent or change sound depending on context.',
						a: 'False — every letter is always pronounced, always the same way.',
						note: 'Finnish spelling is fully phonemic.',
					},
					{
						id: 'a-phonemic-2',
						q: 'How many sounds does kioski have?',
						a: 'Five — one per letter.',
						note: 'If you can spell it, you can say it.',
					},
				],
			},
			{
				id: 'a-stress',
				term: 'stress',
				syntax: 'always 1st syllable',
				description: 'Word stress falls on the first syllable, every word, no exceptions.',
				explanation:
					"Unlike English, where stress shifts unpredictably ('CON-tent' the noun vs 'con-TENT' the adjective), Finnish stress is completely fixed and mechanical — it never moves, no matter how long the word gets or where it came from. That predictability is a free win: you never have to memorize a word's stress pattern separately from its spelling.",
				examples: [
					{ code: 'HEl-sin-ki', note: 'Stress marked in caps — first syllable, always.' },
					{ code: 'KA-le-va-la', note: "Four syllables, still stressed on the first — the national epic's name." },
					{ code: 'O-pis-kel-la', note: "'To study' — even a long, common verb keeps the stress up front." },
				],
				prompts: [
					{
						id: 'a-stress-1',
						q: 'Which syllable is stressed in a Finnish word?',
						a: 'Always the first syllable.',
						note: 'No exceptions — even in long loanwords.',
					},
					{
						id: 'a-stress-2',
						q: "Where's the stress in Kalevala?",
						a: 'KA-le-va-la',
						note: 'First syllable, always.',
					},
				],
			},
			{
				id: 'a-length',
				term: 'long sounds',
				syntax: 'double letter = long sound',
				description: 'Doubled vowels and consonants are held twice as long, and length changes meaning.',
				explanation:
					"This isn't a spelling quirk — short and long versions of a sound are genuinely different phonemes in Finnish, the same way 'ship' and 'sheep' differ in English. A single letter is held briefly; a doubled letter is held roughly twice as long. Mixing them up doesn't just sound like an accent — it can turn one real word into a different real word.",
				examples: [
					{ code: 'tuli', note: 'fire — short u, short l.' },
					{ code: 'tuuli', note: 'wind — long uu, same short l.' },
					{ code: 'tulli', note: 'customs — short u, long ll. Same four letters as tuli, different meaning entirely.' },
				],
				prompts: [
					{
						id: 'a-length-1',
						q: 'What does doubling a letter do in Finnish?',
						a: 'Holds the sound twice as long — and can change the word\'s meaning.',
						note: 'tuli (fire) vs tuuli (wind) vs tulli (customs).',
					},
					{
						id: 'a-length-2',
						q: 'tuli, tuuli, tulli — three different words. What distinguishes them?',
						a: 'Length of the vowel/consonant.',
						note: 'fire · wind · customs',
					},
				],
			},
			{
				id: 'a-vowels',
				term: 'ä ö y',
				syntax: 'front vowels',
				description:
					'ä ö y are independent front vowels (not accented a/o/u); a o u are back vowels; e i are neutral.',
				explanation:
					"Treat ä, ö, and y as their own letters with their own place in the alphabet — not decorated versions of a, o, u. The front/back split is about where in the mouth the vowel is made: front vowels (ä ö y) are pronounced with the tongue forward, back vowels (a o u) with it pulled back. e and i sit in between and are neutral, which is why they can appear in a word alongside either group. This split is the entire mechanism behind vowel harmony (see a-harmony).",
				examples: [
					{ code: 'ä', note: 'As in English "cat" — a front, open vowel.' },
					{ code: 'ö', note: 'Like the vowel in English "bird" (no r-sound) or French "peu".' },
					{ code: 'y', note: 'Like German ü, or French u — round your lips as if for "oo" but say "ee".' },
				],
				prompts: [
					{
						id: 'a-vowels-1',
						q: "Which three letters are Finnish's front vowels?",
						a: 'ä ö y',
						note: 'They are independent letters, not accented a/o/u.',
					},
					{
						id: 'a-vowels-2',
						q: 'Which three letters are the back vowels?',
						a: 'a o u',
						note: 'e and i are neutral — they pair with either set.',
					},
				],
			},
			{
				id: 'a-harmony',
				term: 'vowel harmony',
				syntax: 'back with back, front with front',
				description:
					'A native word contains back vowels (a o u) or front vowels (ä ö y), never both; e i go with either. Every suffix has two forms and copies the word\'s flavor.',
				explanation:
					"Vowel harmony is the payoff for learning front vs. back vowels: once you know which family a word's vowels belong to, you never have to memorize which suffix form to use — you just copy the word's own flavor. Scan the stem for its last back or front vowel (ignoring neutral e/i) and every harmonizing suffix you attach follows suit automatically. This is why the same grammatical ending shows up in two visibly different spellings depending on the word.",
				examples: [
					{ code: 'talossa', note: '"in the house" — talo has back vowels (a, o), so the suffix takes its back form -ssa.' },
					{ code: 'metsässä', note: '"in the forest" — metsä has front vowels (e, ä), so the suffix takes its front form -ssä.' },
					{ code: 'kaupassa', note: '"in the shop" — kauppa is back-voweled, so -ssa again (and pp weakens to p — see gradation).' },
				],
				prompts: [
					{
						id: 'a-harmony-1',
						q: 'What is vowel harmony?',
						a: "A word's vowels are all back (a o u) or all front (ä ö y) — never mixed; e/i are neutral.",
						note: 'talossa (back) vs metsässä (front)',
					},
					{
						id: 'a-harmony-2',
						q: 'Why do suffixes like -ssa/-ssä come in pairs?',
						a: "Because of vowel harmony — the suffix copies the word's back/front flavor.",
						note: 'talossa vs metsässä',
					},
				],
			},
			{
				id: 'a-suffix-pairs',
				term: '-ssa/-ssä',
				syntax: 'suffix pairs',
				description:
					'Because of harmony, endings come in pairs: -ssa/-ssä, -lla/-llä, -ko/-kö, -vat/-vät. Picking the right one is automatic once you scan the stem\'s vowels.',
				explanation:
					"Almost every Finnish suffix that contains a, o, or ä, ö comes in a matched back/front pair — it's not a handful of special cases, it's the default. You will never have to choose which member of the pair to use by memorizing exceptions: you just read off the last non-neutral vowel in the stem and match it. The only suffixes exempt from this are the ones built entirely from neutral vowels (e, i) or consonants.",
				examples: [
					{ code: 'Puhutko?', note: '"Do you speak?" — puhua is back-voweled, so the question particle is -ko.' },
					{ code: 'Syötkö?', note: '"Do you eat?" — syödä has ö (front), so the question particle is -kö.' },
					{ code: 'kadulla / pöydällä', note: '"on the street" (back, from katu) vs "on the table" (front, from pöytä) — the same adessive ending, two harmonized shapes.' },
				],
				prompts: [
					{
						id: 'a-suffix-pairs-1',
						q: 'Name two harmony pairs of suffixes besides -ssa/-ssä.',
						a: '-lla/-llä and -ko/-kö (also -vat/-vät).',
						note: "Every suffix that isn't neutral comes in a back/front pair.",
					},
					{
						id: 'a-suffix-pairs-2',
						q: 'Puhutko? uses -ko. Why would Syötkö use -kö instead?',
						a: 'syödä has front vowels (ö), so the question particle takes its front form -kö.',
						note: 'Harmony picks the suffix automatically.',
					},
				],
			},
			{
				id: 'a-diphthongs',
				term: 'diphthongs',
				syntax: 'uo · ie · yö',
				description: 'Finnish glues vowels into diphthongs pronounced as written.',
				explanation:
					"A diphthong is two vowels pronounced as one glide within a single syllable — your mouth starts shaped for the first vowel and slides toward the second, without a break between them. Because Finnish spelling is fully phonemic (see 'read = write'), you never have to guess whether a vowel pair is a diphthong or two separate syllables — it's always pronounced exactly as the letters suggest, one smooth glide per pair.",
				examples: [
					{ code: 'suo', note: 'swamp — glide from "u" into "o" in one syllable.' },
					{ code: 'tie', note: 'road — glide from "i" into "e".' },
					{ code: 'yö', note: 'night — glide from "y" into "ö", both front vowels.' },
				],
				prompts: [
					{
						id: 'a-diphthongs-1',
						q: 'How is a Finnish diphthong like uo pronounced?',
						a: 'Exactly as written — both vowels glide together, no surprises.',
						note: 'suo (swamp), tie (road), yö (night)',
					},
					{
						id: 'a-diphthongs-2',
						q: 'What does tie mean?',
						a: 'road',
						note: 'diphthong ie',
					},
				],
			},
		],
	},
	{
		id: 'gradation',
		title: 'Consonant Gradation (KPT)',
		emoji: '🧊',
		description: 'The stem-mutation patterns Finns call astevaihtelu.',
		items: [
			{
				id: 'b-principle',
				term: 'KPT rule',
				syntax: 'strong ↔ weak grade',
				description:
					'Words alternate between a strong grade (basic form) and a weak grade (when most endings — genitive -n, -ssa, -lla… — close the syllable). Partitive -a/-ä and illative keep the strong grade.',
				explanation:
					"The whole system turns on syllable structure, not the ending itself: gradation-triggering endings close the preceding syllable (add a consonant right after the stem's k/p/t), and a closed syllable is where Finnish weakens kk/pp/tt/k/p/t. The partitive (-a/-ä) and illative don't close the syllable the same way, so they leave the strong grade untouched — which is why the same word shows three different consonant shapes across its own paradigm, not just two.",
				examples: [
					{ code: 'kauppa → kaupan', note: 'Genitive -n closes the syllable: strong pp weakens to p.' },
					{ code: 'kauppa → kauppaa', note: 'Partitive -a keeps the strong grade — pp stays pp.' },
					{ code: 'kauppa → kauppaan', note: 'Illative also keeps the strong grade — same pp.' },
				],
				prompts: [
					{
						id: 'b-principle-1',
						q: 'What is consonant gradation (KPT)?',
						a: 'Stems alternate between a strong grade and a weak grade depending on the ending.',
						note: 'Called KPT because it hits the stops k, p, t.',
					},
					{
						id: 'b-principle-2',
						q: "Which grade appears when an ending closes the syllable (like genitive -n)?",
						a: 'The weak grade.',
						note: 'kauppa → kaupan',
					},
					{
						id: 'b-principle-3',
						q: 'Which two endings keep the strong grade instead of weakening it?',
						a: 'Partitive -a/-ä and the illative.',
						note: "They don't close the preceding syllable the same way.",
					},
				],
			},
			{
				id: 'b-kk',
				term: 'kk ~ k',
				syntax: 'kk → k',
				description: 'kk weakens to k in the weak grade.',
				explanation:
					"kk is the doubled version of the same stop that k alone weakens (see b-k) — but because it starts from a doubled consonant, weakening it just drops one copy rather than disappearing entirely the way a single k often does. That makes kk~k the most mechanical of the KPT patterns to spot: doubled letter in the strong grade, single letter in the weak grade, same consonant both times.",
				examples: [
					{ code: 'kukka → kukan', note: 'flower — genitive weakens kk to k.' },
					{ code: 'kukka → kukkaa', note: 'flower — partitive keeps the strong grade, kk stays kk.' },
				],
				prompts: [
					{
						id: 'b-kk-1',
						q: 'kk weakens to what in the weak grade?',
						a: 'k',
						note: 'kukka → kukan (flower)',
					},
					{
						id: 'b-kk-2',
						q: 'Apply gradation: kukka + -n (genitive) → ?',
						a: 'kukan',
						note: 'kk → k in weak grade.',
					},
				],
			},
			{
				id: 'b-pp',
				term: 'pp ~ p',
				syntax: 'pp → p',
				description: 'pp weakens to p.',
				explanation:
					"This is the pattern nearly every Finnish course leads with, because kauppa (shop) is common vocabulary and its genitive kaupan is unavoidable early on. Like kk~k, it's a doubled-to-single shift on the same consonant — pp in the strong grade, p in the weak grade — and it's worth anchoring as the canonical KPT example before moving to the patterns that change the consonant itself (p~v, t~d, k~∅/v).",
				examples: [
					{ code: 'kauppa → kaupan', note: 'shop — genitive weakens pp to p.' },
					{ code: 'kauppa → kauppaa', note: 'shop — partitive keeps the strong grade, pp stays pp.' },
				],
				prompts: [
					{
						id: 'b-pp-1',
						q: 'pp weakens to what in the weak grade?',
						a: 'p',
						note: 'kauppa → kaupan (shop)',
					},
					{
						id: 'b-pp-2',
						q: 'Apply gradation: kauppa + -n (genitive) → ?',
						a: 'kaupan',
						note: 'pp → p; the canonical KPT example.',
					},
				],
			},
			{
				id: 'b-tt',
				term: 'tt ~ t',
				syntax: 'tt → t',
				description: 'tt weakens to t.',
				explanation:
					"The third and last of the doubled-stop patterns (alongside kk~k and pp~p): tt in the strong grade simplifies to a single t in the weak grade whenever an ending closes the syllable. Once these three doubled patterns feel automatic, the harder single-consonant patterns (k~∅/v, p~v, t~d) are the same underlying rule applied to consonants that weren't already doubled.",
				examples: [
					{ code: 'tyttö → tytön', note: 'girl — genitive weakens tt to t.' },
					{ code: 'tyttö → tyttöä', note: 'girl — partitive keeps the strong grade, tt stays tt.' },
				],
				prompts: [
					{
						id: 'b-tt-1',
						q: 'tt weakens to what in the weak grade?',
						a: 't',
						note: 'tyttö → tytön (girl)',
					},
					{
						id: 'b-tt-2',
						q: 'Apply gradation: tyttö + -n (genitive) → ?',
						a: 'tytön',
						note: 'tt → t.',
					},
				],
			},
			{
				id: 'b-k',
				term: 'k ~ ∅/v',
				syntax: 'k → nothing (→ v after u/y)',
				description: 'k weakens to nothing between vowels, or to v after u/y.',
				explanation:
					"A single k (not doubled) is the most dramatic KPT pattern: between two vowels it usually vanishes outright rather than softening to another consonant, which shortens the word by a full letter — jalka (foot) loses its k entirely in jalan. The one variant to watch for is k after u or y, where it surfaces as v instead of disappearing, as in puku → puvun; both are the same underlying rule, just with a different weak-grade outcome depending on what precedes the k.",
				examples: [
					{ code: 'jalka → jalan', note: 'foot — k drops out entirely between vowels.' },
					{ code: 'puku → puvun', note: 'suit — k becomes v after u.' },
					{ code: 'jalka → jalkaa', note: 'foot — partitive keeps the strong grade, k stays.' },
				],
				prompts: [
					{
						id: 'b-k-1',
						q: 'What does k weaken to in the weak grade?',
						a: 'Usually disappears; becomes v after u/y.',
						note: 'jalka → jalan (foot); puku → puvun (suit)',
					},
					{
						id: 'b-k-2',
						q: 'Apply gradation: jalka + -n (genitive) → ?',
						a: 'jalan',
						note: 'k drops out entirely.',
					},
					{
						id: 'b-k-3',
						q: 'Apply gradation: puku + -n (genitive) → ?',
						a: 'puvun',
						note: 'k → v after u.',
					},
				],
			},
			{
				id: 'b-p',
				term: 'p ~ v',
				syntax: 'p → v',
				description: 'p weakens to v.',
				explanation:
					"A single p (unlike doubled pp, which just simplifies to p) weakens all the way to a different consonant, v — the same shift that shows up in puku → puvun for k after u/y, but here it applies directly to p itself. leipä (bread) is the model word for this pattern and also carries front vowel harmony (ä), so its genitive leivän shows both rules firing on the same word.",
				examples: [
					{ code: 'leipä → leivän', note: 'bread — genitive weakens p to v.' },
					{ code: 'leipä → leipää', note: 'bread — partitive keeps the strong grade, p stays p.' },
				],
				prompts: [
					{
						id: 'b-p-1',
						q: 'p weakens to what?',
						a: 'v',
						note: 'leipä → leivän (bread)',
					},
					{
						id: 'b-p-2',
						q: 'Apply gradation: leipä + -n (genitive) → ?',
						a: 'leivän',
						note: 'p → v; front harmony (ä) keeps the ending -än.',
					},
				],
			},
			{
				id: 'b-t',
				term: 't ~ d',
				syntax: 't → d',
				description: 't weakens to d.',
				explanation:
					"t~d is probably the single most useful gradation pattern to have automatic, since katu (street) and pöytä (table) are both model nouns used constantly elsewhere in this deck for the location-case grid — every adessive/ablative form built on them (kadulla, pöydällä) already has this weakening baked in. The rule itself is simple and exceptionless within the regular pattern: single t between vowels becomes d in the weak grade, full stop.",
				examples: [
					{ code: 'katu → kadun', note: 'street — genitive weakens t to d.' },
					{ code: 'pöytä → pöydän', note: 'table — same shift, front harmony (ä) unaffected.' },
					{ code: 'katu → katua', note: 'street — partitive keeps the strong grade, t stays t.' },
				],
				prompts: [
					{
						id: 'b-t-1',
						q: 't weakens to what?',
						a: 'd',
						note: 'katu → kadun (street); pöytä → pöydän (table)',
					},
					{
						id: 'b-t-2',
						q: 'Apply gradation: katu + -n (genitive) → ?',
						a: 'kadun',
						note: 't → d.',
					},
					{
						id: 'b-t-3',
						q: 'Apply gradation: pöytä + -n (genitive) → ?',
						a: 'pöydän',
						note: 't → d; front harmony (ä).',
					},
				],
			},
			{
				id: 'b-nk',
				term: 'nk ~ ng',
				syntax: 'nk → ng',
				description: 'nk weakens to ng (written ng, pronounced as a long ŋ).',
				explanation:
					"nk is a cluster, not a single consonant, so it gradates as a unit rather than just the k inside it weakening on its own — the whole cluster shifts to ng, spelled with two letters but pronounced as one long nasal sound (like the 'ng' in English 'singer', not 'finger'). Helsinki itself is the everyday example: its genitive Helsingin is one of the first gradated proper nouns any learner runs into, since it comes up in addresses and sentences constantly.",
				examples: [
					{ code: 'Helsinki → Helsingin', note: 'genitive weakens nk to ng.' },
					{ code: 'kenkä → kengän', note: 'shoe — same shift, front harmony (ä) unaffected.' },
					{ code: 'Helsinki → Helsinkiä', note: 'partitive keeps the strong grade, nk stays nk.' },
				],
				prompts: [
					{
						id: 'b-nk-1',
						q: 'nk weakens to what?',
						a: 'ng',
						note: 'Helsinki → Helsingin; kenkä → kengän (shoe)',
					},
					{
						id: 'b-nk-2',
						q: 'Apply gradation: Helsinki + -n (genitive) → ?',
						a: 'Helsingin',
						note: 'nk → ng.',
					},
					{
						id: 'b-nk-3',
						q: 'Apply gradation: kenkä + -n (genitive) → ?',
						a: 'kengän',
						note: 'nk → ng; front harmony (ä).',
					},
				],
			},
			{
				id: 'b-assim',
				term: 'nt · lt · rt · mp',
				syntax: 'nt→nn, lt→ll, rt→rr, mp→mm',
				description:
					'Consonant clusters assimilate in the weak grade: nt→nn, lt→ll, rt→rr, mp→mm.',
				explanation:
					"These four clusters all end in t or p, so they're gradation targets like any other KPT case — but instead of the t/p weakening to d/v the way it would after a vowel, here it assimilates to match the consonant before it, doubling that consonant instead. It's the same 'weak grade' concept as every other pattern in this category, just with a different-looking outcome because the environment (consonant cluster, not vowel-t-vowel) is different.",
				examples: [
					{ code: 'ranta → rannan', note: 'shore — nt assimilates to nn.' },
					{ code: 'ilta → illan', note: 'evening — lt assimilates to ll.' },
					{ code: 'kampa → kamman', note: 'comb — mp assimilates to mm.' },
				],
				prompts: [
					{
						id: 'b-assim-1',
						q: 'What does nt weaken to?',
						a: 'nn',
						note: 'ranta → rannan (shore)',
					},
					{
						id: 'b-assim-2',
						q: 'What does lt weaken to?',
						a: 'll',
						note: 'ilta → illan (evening)',
					},
					{
						id: 'b-assim-3',
						q: 'Apply gradation: parta + -n (genitive) → ?',
						a: 'parran',
						note: 'rt → rr (beard).',
					},
					{
						id: 'b-assim-4',
						q: 'Apply gradation: kampa + -n (genitive) → ?',
						a: 'kamman',
						note: 'mp → mm (comb).',
					},
				],
			},
		],
	},
	{
		id: 'local-cases',
		title: 'Location Cases',
		emoji: '📍',
		description: 'The famous 2×3 grid that replaces in/into/out of/on/onto/off.',
		items: [
			{
				id: 'c-grid',
				term: 'the 2×3 grid',
				syntax: 's-cases = inside, l-cases = surface',
				description:
					'The whole system in one picture: -ssa/-sta/-Vn (in/out of/into) and -lla/-lta/-lle (on/off/onto).',
				explanation:
					"English uses six unrelated prepositions (in, out of, into, on, off, onto) where Finnish uses one symmetric grid: two families of three endings, s-cases for interior and l-cases for surface, each family covering static location / motion away / motion toward. Once the grid is memorized as a shape rather than six separate words, producing the right ending becomes a lookup — which family (interior or surface), which direction (static/away/toward) — instead of six separate vocabulary items.",
				examples: [
					{ code: 'talossa · talosta · taloon', note: 'in / out of / into the house — the s-cases (interior).' },
					{ code: 'pöydällä · pöydältä · pöydälle', note: 'on / off / onto the table — the l-cases (surface).' },
					{ code: 'kadulla', note: 'on the street — l-case, since a street is a surface, not an interior.' },
				],
				prompts: [
					{
						id: 'c-grid-1',
						q: 'What do the s-cases (-ssa/-sta/-Vn) express?',
						a: 'Being inside / out of / into something (interior).',
						note: 'talossa · talosta · taloon',
					},
					{
						id: 'c-grid-2',
						q: 'What do the l-cases (-lla/-lta/-lle) express?',
						a: 'Being on / off / onto a surface (exterior).',
						note: 'pöydällä · pöydältä · pöydälle',
					},
					{
						id: 'c-grid-3',
						q: "talossa vs pöydällä — which is 'in' and which is 'on'?",
						a: 'talossa = in (inside); pöydällä = on (surface)',
						note: 's-cases = interior, l-cases = exterior.',
					},
				],
			},
			{
				id: 'c-ine',
				term: '-ssa/-ssä',
				syntax: 'inessive',
				description: 'in, inside',
				explanation:
					"The inessive is the 'static interior' corner of the grid — being inside something, with no motion implied — and it's the case that closes the syllable, so any gradating stem shows its weak grade here (kauppa's pp weakens to p in kaupassa). Place names take it just like common nouns: Helsingissä works exactly the same way as talossa, no special city-name case needed.",
				examples: [
					{ code: 'talossa', note: 'in the house.' },
					{ code: 'Helsingissä', note: 'in Helsinki — nk weakens to ng (gradation) before the ending.' },
					{ code: 'kirjassa', note: 'in the book — back harmony, no gradation to worry about.' },
				],
				prompts: [
					{
						id: 'c-ine-1',
						q: 'Which case ending means “in / inside”?',
						a: '-ssa / -ssä',
						note: 'Inessive. talossa — in the house; Helsingissä — in Helsinki.',
					},
					{
						id: 'c-ine-2',
						q: 'Apply it: “in the shop” (kauppa) → ?',
						a: 'kaupassa',
						note: 'Two rules fire at once: KPT weakens pp→p, harmony picks -ssa (back vowels).',
					},
					{
						id: 'c-ine-3',
						q: 'Apply it: “in Finland” (Suomi) → ?',
						a: 'Suomessa',
						note: 'i-final nouns often shift i→e in the stem: Suomi → Suome- + -ssa.',
					},
				],
			},
			{
				id: 'c-ela',
				term: '-sta/-stä',
				syntax: 'elative',
				description: 'out of, from inside',
				explanation:
					"The elative is the inessive's 'motion away' partner — same interior meaning, different direction — and like the inessive it closes the syllable, so gradation applies the same way (kauppa's pp weakens to p in kaupasta, exactly as in kaupassa). Recognizing -sta/-stä as elative rather than inessive is purely about the direction implied: 'from inside X' rather than 'inside X'.",
				examples: [
					{ code: 'talosta', note: 'out of the house.' },
					{ code: 'Suomesta', note: 'from Finland — i-final stem shifts i→e before the ending.' },
					{ code: 'kaupasta', note: 'out of the shop — pp weakens to p (KPT), same as the inessive kaupassa.' },
				],
				prompts: [
					{
						id: 'c-ela-1',
						q: "Which case ending means 'out of / from inside'?",
						a: '-sta / -stä',
						note: 'Elative. talosta — out of the house; Suomesta — from Finland.',
					},
					{
						id: 'c-ela-2',
						q: "Apply it: 'from Finland' (Suomi) → ?",
						a: 'Suomesta',
						note: 'Same i→e stem shift as the inessive.',
					},
					{
						id: 'c-ela-3',
						q: "Apply it: 'out of the shop' (kauppa) → ?",
						a: 'kaupasta',
						note: 'pp→p (KPT) plus back harmony -sta.',
					},
				],
			},
			{
				id: 'c-ill',
				term: 'into (illative)',
				syntax: 'vowel + n',
				description:
					'into (commonest shape: lengthen final vowel + n). Other shapes (-hVn, -seen) exist for other stem types — out of scope for phase 1.',
				explanation:
					"The illative is the odd one out in the s-case row: instead of adding a suffix like -ssa or -sta, the commonest shape lengthens the word's own final vowel and adds -n — taloon isn't talo + a new ending, it's talo with its final o doubled plus -n. Because the illative doesn't close the syllable the same way -ssa/-sta do, it keeps the strong grade, which is the clearest place to see the strong/weak contrast: kauppaan (strong, pp) sits right next to kaupassa and kaupasta (weak, p) for the exact same word.",
				examples: [
					{ code: 'taloon', note: 'into the house — final o lengthens, +n.' },
					{ code: 'Helsinkiin', note: 'to Helsinki — final i lengthens, +n.' },
					{ code: 'kauppaan', note: 'into the shop — strong grade kept (pp), unlike kaupassa/kaupasta.' },
				],
				prompts: [
					{
						id: 'c-ill-1',
						q: "What is the commonest shape of the illative ('into')?",
						a: 'Lengthen the final vowel and add -n.',
						note: 'talo → taloon; Helsinki → Helsinkiin',
					},
					{
						id: 'c-ill-2',
						q: "Apply it: 'into the shop' (kauppa) → ?",
						a: 'kauppaan',
						note: 'Illative keeps the strong grade (pp stays pp) — unlike -ssa/-sta.',
					},
					{
						id: 'c-ill-3',
						q: "talossa vs taloon — which is 'in' and which is 'into'?",
						a: 'talossa = in (inessive); taloon = into (illative)',
						note: 'Static location vs motion toward the inside.',
					},
				],
			},
			{
				id: 'c-ade',
				term: '-lla/-llä',
				syntax: 'adessive',
				description: "on, at; also 'have'",
				explanation:
					"The adessive is the surface-case mirror of the inessive: same static, no-motion meaning, but for something you're on top of or at, rather than inside of. It does double duty in Finnish grammar — beyond literal location (pöydällä, kadulla) it's also the mechanism behind possession (see f-have: Minulla on koira literally puts 'I' in the adessive, 'on me'), so this one ending covers both a place meaning and a grammatical role English handles with a completely different verb.",
				examples: [
					{ code: 'pöydällä', note: 'on the table.' },
					{ code: 'kadulla', note: 'on the street — t weakens to d (KPT), back harmony -lla.' },
					{ code: 'Minulla on koira.', note: 'I have a dog — the same adessive ending used for possession.' },
				],
				prompts: [
					{
						id: 'c-ade-1',
						q: "Which case ending means 'on / at' (and also expresses 'have')?",
						a: '-lla / -llä',
						note: 'Adessive. pöydällä — on the table; also Minulla on... — I have...',
					},
					{
						id: 'c-ade-2',
						q: "Apply it: 'on the street' (katu) → ?",
						a: 'kadulla',
						note: 't→d (KPT) plus back harmony -lla.',
					},
					{
						id: 'c-ade-3',
						q: "Apply it: 'on the table' (pöytä) → ?",
						a: 'pöydällä',
						note: 't→d plus front harmony -llä.',
					},
				],
			},
			{
				id: 'c-abl',
				term: '-lta/-ltä',
				syntax: 'ablative',
				description: 'off, from (a surface)',
				explanation:
					"The ablative is the adessive's 'motion away' partner, completing the surface row the same way the elative completes the interior row — pöydällä (on) / pöydältä (off) is the exact surface-case analog of talossa (in) / talosta (out of). Same weak grade as the adessive (t→d already happened in pöytä's stem, unaffected by which of the two l-case endings follows it).",
				examples: [
					{ code: 'pöydältä', note: 'off the table.' },
					{ code: 'pöydällä → pöydältä', note: 'on the table → off the table — same stem, l-case direction flips.' },
				],
				prompts: [
					{
						id: 'c-abl-1',
						q: "Which case ending means 'off / from a surface'?",
						a: '-lta / -ltä',
						note: 'Ablative. pöydältä — off the table.',
					},
					{
						id: 'c-abl-2',
						q: "Apply it: 'off the table' (pöytä) → ?",
						a: 'pöydältä',
						note: 't→d plus front harmony -ltä.',
					},
				],
			},
			{
				id: 'c-all',
				term: '-lle',
				syntax: 'allative',
				description: 'onto, to (a surface/person)',
				explanation:
					"The allative completes the surface row's third direction, motion toward — pöydällä (on) / pöydältä (off) / pöydälle (onto). It's the one ending in the whole local-case grid that doesn't harmonize: every other pair split into a back and front form (-lla/-llä, -lta/-ltä), but -lle stays -lle regardless of the stem's vowels, which makes it the easiest of the six to apply once you've spotted it's an l-case at all.",
				examples: [
					{ code: 'pöydälle', note: 'onto the table.' },
					{ code: 'pöydällä · pöydältä · pöydälle', note: 'the full surface row for one word: on / off / onto.' },
				],
				prompts: [
					{
						id: 'c-all-1',
						q: "Which case ending means 'onto / to' (a surface or person)?",
						a: '-lle',
						note: "Allative — note it doesn't harmonize (always -lle). pöydälle — onto the table.",
					},
					{
						id: 'c-all-2',
						q: "Apply it: 'onto the table' (pöytä) → ?",
						a: 'pöydälle',
						note: 't→d (KPT); -lle is invariant.',
					},
				],
			},
		],
	},
	{
		id: 'gram-cases',
		title: 'Core Grammar Cases',
		emoji: '⚙️',
		description: 'Nominative, genitive, and the mighty partitive.',
		items: [
			{
				id: 'd-nom',
				term: 'dictionary form',
				syntax: 'nominative',
				description:
					'The bare form is the nominative — subject of the sentence, the form dictionaries list, always strong grade.',
				explanation:
					"The nominative is the form you already know for every word in this deck — it's what a dictionary lists, what a noun looks like before any case ending attaches, and it always carries the strong grade, since nothing is closing a syllable yet. Every other case in this section is defined relative to it: genitive is nominative plus -n (and a grade shift), partitive is nominative plus -a/-ä (no grade shift), and so on.",
				examples: [
					{ code: 'kauppa on iso.', note: 'The shop is big — kauppa is the subject, bare nominative.' },
					{ code: 'kauppa', note: 'The dictionary form — strong grade (pp), no ending.' },
				],
				prompts: [
					{
						id: 'd-nom-1',
						q: 'What grade does the nominative (dictionary) form always keep?',
						a: 'Strong grade.',
						note: 'kauppa on iso — the shop is big.',
					},
					{
						id: 'd-nom-2',
						q: 'What is the nominative used for?',
						a: 'The subject of the sentence — also the form dictionaries list.',
						note: '',
					},
				],
			},
			{
				id: 'd-gen',
				term: '-n',
				syntax: 'genitive',
				description: 'Possession and much else: add -n (weak grade!).',
				explanation:
					"The genitive is the ending you'll produce most automatically, because -n closes the syllable right after the stem — which is exactly the environment that triggers KPT gradation, so the genitive is the case where weak-grade forms show up constantly (kaupan, not kauppan). Word order does the rest of the possession work: the possessor's genitive simply comes right before the thing possessed, no extra word needed — kissan nimi is literally 'cat's name' with nothing between them.",
				examples: [
					{ code: "talon ovi", note: "the house's door — talo takes no gradation, just +n." },
					{ code: "kissan nimi", note: "the cat's name — kissa has no gradation either." },
					{ code: "kaupan ovi", note: "the shop's door — kauppa's pp weakens to p before -n." },
				],
				prompts: [
					{
						id: 'd-gen-1',
						q: 'How do you form the genitive?',
						a: 'Add -n (and the stem weakens — weak grade).',
						note: "talon ovi — the house's door",
					},
					{
						id: 'd-gen-2',
						q: "Apply it: 'the shop's door' — kauppa + -n → ?",
						a: 'kaupan ovi',
						note: 'pp→p gradation strikes again in the genitive.',
					},
				],
			},
			{
				id: 'd-part',
				term: 'partitive',
				syntax: '-a/-ä · -ta/-tä',
				description:
					"The signature Finnish case: an 'incomplete amount' of something. After short vowel add -a/-ä (taloa, kahvia); vesi becomes vettä. Keeps strong grade.",
				explanation:
					"English marks the in-progress/unbounded vs. complete/bounded distinction with articles and aspect ('I drink coffee' vs 'I drink the coffee' vs 'I drank the coffee') — Finnish marks the same distinction on the object noun itself, with the partitive. Juon kahvia doesn't specify how much coffee or whether you'll finish it; that open-endedness is the partitive's whole job, and it shows up constantly: with uncountable substances, with numbers 2+ (see d-part-num), and with any negative sentence (see d-part-neg).",
				examples: [
					{ code: 'Juon kahvia.', note: 'I drink (some) coffee — unspecified amount, the core partitive use.' },
					{ code: 'taloa', note: 'partitive of talo — regular short-vowel pattern, add -a.' },
					{ code: 'vettä', note: 'partitive of vesi — an e-stem exception: vettä, not "vesiä".' },
				],
				prompts: [
					{
						id: 'd-part-1',
						q: 'What does the partitive express?',
						a: 'An incomplete or unspecified amount of something.',
						note: 'Juon kahvia — I drink (some) coffee.',
					},
					{
						id: 'd-part-2',
						q: "Apply it: 'some water' — vesi → ?",
						a: 'vettä',
						note: "vesi is an e-stem: partitive is vettä, not 'vesiä'.",
					},
					{
						id: 'd-part-3',
						q: 'Does the partitive keep the strong or weak grade?',
						a: 'Strong grade.',
						note: "Like the illative — it doesn't close the syllable the same way.",
					},
				],
			},
			{
				id: 'd-part-num',
				term: 'numbers + partitive',
				syntax: 'kaksi taloa',
				description: "After numbers 2+, the noun goes in the partitive singular, not plural.",
				explanation:
					"English pluralizes the noun after any number above one ('two houses'); Finnish does something that feels backwards at first — the noun after kaksi, kolme, and up stays grammatically singular, just in the partitive case instead of the nominative. The logic is consistent with the partitive's general meaning: 'two of house' (an unspecified portion counted out) rather than a true plural, and yksi (one) is the only number that leaves the noun in the plain nominative singular.",
				examples: [
					{ code: 'yksi talo', note: 'one house — nominative singular, the only number that doesn\'t trigger partitive.' },
					{ code: 'kaksi taloa', note: 'two houses — partitive singular, not a plural.' },
					{ code: 'kolme kissaa', note: 'three cats — same pattern, any number 2+.' },
				],
				prompts: [
					{
						id: 'd-part-num-1',
						q: "After the number 'kaksi' (two), what case does the noun take?",
						a: 'Partitive singular (not plural).',
						note: 'kaksi taloa — two houses',
					},
					{
						id: 'd-part-num-2',
						q: "Apply it: 'three cats' — kolme + kissa → ?",
						a: 'kolme kissaa',
						note: 'Numbers 2+ take partitive singular.',
					},
				],
			},
			{
				id: 'd-part-neg',
				term: 'negation + partitive',
				syntax: 'en juo kahvia',
				description: 'The object of a negative sentence is partitive.',
				explanation:
					"A negative sentence can't claim a complete, bounded action happened — 'I don't drink the coffee' isn't a finished event the way 'I drink the coffee' is — and the partitive's core meaning (unbounded, unspecified) is exactly the right fit for that, which is why Finnish grammar simply requires it: any direct object in a negative clause goes partitive, regardless of what case it would take in the positive sentence. Juon kahvin (bounded, a specific cup) flips to En juo kahvia (partitive) the moment en enters the sentence.",
				examples: [
					{ code: 'En juo kahvia.', note: "I don't drink coffee — negative verb, object forced to partitive." },
					{ code: 'Juon kahvin. → En juo kahvia.', note: "I'll drink the coffee → I don't drink coffee — object case flips with negation." },
				],
				prompts: [
					{
						id: 'd-part-neg-1',
						q: 'What case does the object take in a negative sentence?',
						a: 'Partitive.',
						note: "Juon kahvin (I'll drink the coffee) → En juo kahvia (I don't drink coffee).",
					},
					{
						id: 'd-part-neg-2',
						q: "Say: 'I don't drink coffee.'",
						a: 'En juo kahvia.',
						note: 'Negative verb en + bare stem juo; object kahvi → partitive kahvia.',
					},
				],
			},
		],
	},
	{
		id: 'verbs',
		title: 'Verbs',
		emoji: '🏃',
		description: 'Personal endings, the four common verb types, negation, questions.',
		items: [
			{
				id: 'e-endings',
				term: 'personal endings',
				syntax: '-n -t – -mme -tte -vat',
				description:
					'One set of endings for every verb: puhun, puhut, puhuu, puhumme, puhutte, puhuvat. 3sg lengthens the final vowel instead of adding an ending. Pronouns optional for I/you because the ending already tells you.',
				explanation:
					"Every regular Finnish verb, no matter which of the four stem-formation types it belongs to (see e-type1 through e-type4), takes this exact same set of six personal endings once you have the stem — learn the endings once and they apply everywhere. The 3rd person singular is the outlier worth noting specially: instead of adding a consonant ending like the other five persons, it just lengthens the stem's final vowel, which is why puhuu (speaks) looks like it's missing an ending rather than having an unusual one.",
				examples: [
					{ code: 'puhun, puhut, puhuu, puhumme, puhutte, puhuvat', note: 'The full six-person paradigm for puhua (to speak).' },
					{ code: 'puhun', note: 'I speak — the -n ending alone tells you it\'s "I", no minä required.' },
					{ code: 'puhuu', note: 'he/she speaks — 3sg lengthens the stem vowel instead of adding a consonant ending.' },
				],
				prompts: [
					{
						id: 'e-endings-1',
						q: 'What are the six personal endings (minä…he) added to a verb stem?',
						a: '-n, -t, (vowel lengthens), -mme, -tte, -vat',
						note: 'puhun, puhut, puhuu, puhumme, puhutte, puhuvat',
					},
					{
						id: 'e-endings-2',
						q: "How does the 3rd person singular (hän) mark itself, if not with an ending?",
						a: "By lengthening the stem's final vowel.",
						note: 'puhu- → puhuu',
					},
					{
						id: 'e-endings-3',
						q: 'Why can you drop minä/sinä in puhun/puhut?',
						a: "The verb ending already shows who's speaking.",
						note: 'puhun = I speak, no minä needed.',
					},
				],
			},
			{
				id: 'e-olla',
				term: 'olla',
				syntax: 'to be',
				description: 'The one truly irregular must-know verb: olen, olet, on, olemme, olette, ovat.',
				explanation:
					"olla is the single verb in this whole system that doesn't fit any of the four regular stem types — its paradigm just has to be memorized as its own irregular set, the way 'to be' is irregular in most languages. That's a small one-time cost for outsized value: olla underpins the adessive-possession construction (minulla on, see f-have), every yes/no question built on 'is/are' (Onko kahvi hyvää?), and simple identity statements like Olen Sajal.",
				examples: [
					{ code: 'olen, olet, on, olemme, olette, ovat', note: 'The full irregular paradigm — no shared pattern with regular verbs.' },
					{ code: 'Olen Sajal.', note: 'I am Sajal — 1st person singular, olen.' },
					{ code: 'Minulla on koira.', note: 'I have a dog — 3sg on, doing double duty as the possession verb.' },
				],
				prompts: [
					{
						id: 'e-olla-1',
						q: 'Conjugate olla (to be) for minä and hän.',
						a: 'olen (I am), on (he/she is)',
						note: 'olen, olet, on, olemme, olette, ovat',
					},
					{
						id: 'e-olla-2',
						q: "Say: 'I am Sajal.'",
						a: 'Olen Sajal.',
						note: 'olla is irregular — memorize the full paradigm.',
					},
				],
			},
			{
				id: 'e-type1',
				term: 'type 1: -a/-ä',
				syntax: 'puhua → puhu-',
				description:
					'The biggest verb group: infinitive ends in two vowels + a/ä. Stem = infinitive minus the final -a/-ä (puhua → puhu-), then add the personal endings.',
				explanation:
					"Type 1 is the default verb shape and covers the majority of Finnish verbs, so it's worth learning first and treating everything else as an exception to it. The rule is a single mechanical step: the infinitive already ends in a vowel plus -a/-ä, so lopping off just that final -a/-ä leaves the stem, ready for the same six personal endings every verb type shares (see e-endings) — no consonant changes, no extra letters to add.",
				examples: [
					{ code: 'puhua → puhun', note: 'to speak → I speak — drop -a, add -n.' },
					{ code: 'sanoa → sanon', note: 'to say → I say — same pattern, drop -a, add -n.' },
					{ code: 'puhua → puhuu', note: 'to speak → he/she speaks — 3sg lengthens the stem vowel (puhu- → puhuu).' },
				],
				prompts: [
					{
						id: 'e-type1-1',
						q: 'Type 1 verbs (like puhua) — how do you find the stem?',
						a: 'Drop the final -a/-ä.',
						note: 'puhua → puhu-, then add endings: puhun',
					},
					{
						id: 'e-type1-2',
						q: 'Conjugate sanoa (to say) for minä.',
						a: 'sanon',
						note: 'Type 1: drop -a → sano-, add -n.',
					},
				],
			},
			{
				id: 'e-type2',
				term: 'type 2: -da/-dä',
				syntax: 'syödä → syö-',
				description: 'Verbs in -da/-dä: stem = infinitive minus -da/-dä.',
				explanation:
					"Type 2 is easy to spot because the infinitive ending is -da/-dä instead of type 1's bare -a/-ä — the d is the tell. Drop the whole -da/-dä (not just the vowel) and what's left is already the stem, ready for personal endings; syödä (to eat) and juoda (to drink) are the two most useful verbs in this group, since eating and drinking sentences recur constantly in the vocabulary track.",
				examples: [
					{ code: 'syödä → syön', note: 'to eat → I eat — drop -dä, add -n.' },
					{ code: 'juoda → juon', note: 'to drink → I drink — drop -da, add -n.' },
					{ code: 'juoda → juo', note: 'to drink → he/she drinks — 3sg form, from the stem juo-.' },
				],
				prompts: [
					{
						id: 'e-type2-1',
						q: 'Type 2 verbs (like syödä) — how do you find the stem?',
						a: 'Drop the final -da/-dä.',
						note: 'syödä → syö-, then add endings: syön',
					},
					{
						id: 'e-type2-2',
						q: 'Conjugate juoda (to drink) for minä.',
						a: 'juon',
						note: 'Type 2: drop -da → juo-, add -n.',
					},
				],
			},
			{
				id: 'e-type3',
				term: 'type 3: -lla/-nnä…',
				syntax: 'tulla → tule-',
				description:
					'Verbs in -lla/-llä, -nna/-nnä, -rra/-rrä, -sta/-stä: drop the last two letters, add -e-, then endings.',
				explanation:
					"Type 3 infinitives end in a doubled consonant pair (-lla, -nna, -rra) or -sta/-stä, and the stem-forming move is different from types 1 and 2: instead of just trimming the ending, you drop the last two letters and insert an -e- before the personal endings — tulla loses -la, leaving tul-, and then -e- is added to make tule-, which is what actually takes the ending. Recognizing the doubled-consonant infinitive shape is the trigger for reaching for this pattern rather than type 1 or 2.",
				examples: [
					{ code: 'tulla → tulen', note: 'to come → I come — drop -la, add -e-, then -n: tul- → tule- → tulen.' },
					{ code: 'mennä → menen', note: 'to go → I go — same pattern: menn- → men- → mene- → menen.' },
					{ code: 'opiskella → opiskelen', note: 'to study → I study — same pattern on a longer stem: opiskell- → opiskele- → opiskelen.' },
				],
				prompts: [
					{
						id: 'e-type3-1',
						q: 'Type 3 verbs (like tulla) — how do you find the stem?',
						a: 'Drop the last two letters and add -e-.',
						note: 'tulla → tul- → tule-, then add endings: tulen',
					},
					{
						id: 'e-type3-2',
						q: 'Conjugate mennä (to go) for minä.',
						a: 'menen',
						note: 'Type 3: menn- → men- + -e- → mene-, add -n.',
					},
					{
						id: 'e-type3-3',
						q: 'Conjugate opiskella (to study) for minä.',
						a: 'opiskelen',
						note: 'Type 3: opiskell- → opiskel- + -e- → opiskele-, add -n.',
					},
				],
			},
			{
				id: 'e-type4',
				term: 'type 4: -ata/-ätä',
				syntax: 'haluta → halua-',
				description: 'Verbs in vowel+ta/tä: drop -t-, add -a-.',
				explanation:
					"Type 4 infinitives end in a vowel plus -ta/-tä (haluta), which superficially resembles type 2's -da/-dä but forms its stem differently: rather than dropping the whole ending, you drop just the -t- and keep (double) the -a-, turning haluta into halua-. Mixing up type 2 and type 4 is a common early error precisely because both endings look similar on the surface — the giveaway is the consonant: -da/-dä is type 2, -ta/-tä is type 4.",
				examples: [
					{ code: 'haluta → haluan', note: 'to want → I want — drop -t-, keep -a-: halut(a) → halua- → haluan.' },
					{ code: 'haluta → halua-', note: 'the bare stem, before any personal ending attaches.' },
				],
				prompts: [
					{
						id: 'e-type4-1',
						q: 'Type 4 verbs (like haluta) — how do you find the stem?',
						a: 'Drop the -t-, keep the -a-.',
						note: 'haluta → halua-, then add endings: haluan',
					},
					{
						id: 'e-type4-2',
						q: 'Conjugate haluta (to want) for minä.',
						a: 'haluan',
						note: 'Type 4: haluta → halua- + -n.',
					},
				],
			},
			{
				id: 'e-neg',
				term: 'negation',
				syntax: 'en · et · ei · emme · ette · eivät',
				description:
					'The negative word is itself a verb that conjugates; the main verb drops to its bare stem.',
				explanation:
					"Finnish negation doesn't add a word like English 'not' to an otherwise-unchanged verb — the negative word (en/et/ei/emme/ette/eivät) is itself the thing that conjugates for person, and it carries that job away from the main verb entirely, which drops down to its bare, unconjugated stem. So negating puhun (I speak) doesn't touch puhu- at all — it swaps out where the person marking lives, from the main verb onto en.",
				examples: [
					{ code: 'puhun → en puhu', note: 'I speak → I don\'t speak — en carries the "I", puhu is bare stem.' },
					{ code: 'hän syö → hän ei syö', note: 'he/she eats → he/she doesn\'t eat — ei carries 3sg, syö stays bare.' },
					{ code: 'en, et, ei, emme, ette, eivät', note: 'The full negative-verb paradigm — conjugates just like a normal verb.' },
				],
				prompts: [
					{
						id: 'e-neg-1',
						q: 'How do you negate a Finnish verb?',
						a: 'Conjugate the negative verb (en/et/ei/emme/ette/eivät) and drop the main verb to its bare stem.',
						note: 'puhun → en puhu',
					},
					{
						id: 'e-neg-2',
						q: 'Negate: hän syö (he/she eats).',
						a: 'hän ei syö',
						note: 'ei is the 3sg negative form; syö is the bare stem.',
					},
				],
			},
			{
				id: 'e-q',
				term: '-ko/-kö',
				syntax: 'question particle',
				description: 'Yes/no questions: verb first + -ko/-kö (harmony!).',
				explanation:
					"Finnish doesn't invert subject and verb or add a helper word to ask a yes/no question — it moves the verb to the front of the sentence and attaches -ko/-kö directly to it, and like every other harmonizing suffix in this deck (see a-suffix-pairs), which member of the pair to use is decided by the verb's own vowels, not memorized case by case. Puhutko (from puhut, back vowels) takes -ko; Onko (from on, back-neutral but conventionally -ko) and Syötkö-style forms (front vowels) take -kö.",
				examples: [
					{ code: 'Puhutko suomea?', note: 'Do you speak Finnish? — puhut + -ko, back harmony.' },
					{ code: 'Onko kahvi hyvää?', note: 'Is the coffee good? — on + -ko.' },
					{ code: 'Puhun vähän suomea.', note: 'I speak a little Finnish — a natural reply to Puhutko suomea?' },
				],
				prompts: [
					{
						id: 'e-q-1',
						q: 'How do you form a yes/no question in Finnish?',
						a: 'Put the verb first and attach -ko/-kö.',
						note: 'Puhutko suomea? — Do you speak Finnish?',
					},
					{
						id: 'e-q-2',
						q: "Ask: 'Is the coffee good?' (on, hyvää)",
						a: 'Onko kahvi hyvää?',
						note: 'on + -ko → Onko; back harmony.',
					},
				],
			},
		],
	},
	{
		id: 'character',
		title: 'Character of the Language',
		emoji: '🧭',
		description: "What Finnish deliberately doesn't have.",
		items: [
			{
				id: 'f-han',
				term: 'hän',
				syntax: 'no gender, no articles',
				description:
					'One pronoun hän for he and she; no a/an/the at all. Definiteness comes from context and word order.',
				explanation:
					"Two of English's grammatical obligations simply don't exist in Finnish: gendered third-person pronouns and articles. hän covers 'he' and 'she' alike (gender lives in vocabulary if at all, never grammar), and there's no a/an/the anywhere — Hän on opettaja is literally 'he/she is teacher', with definiteness left to context and word order rather than marked explicitly. Both are genuine simplifications, not gaps to work around: nothing is lost, English just spends grammar on distinctions Finnish doesn't bother making.",
				examples: [
					{ code: 'Hän on opettaja.', note: 'He/she is a teacher — no gender marked, no article needed.' },
					{ code: 'hän', note: 'The single third-person singular pronoun — covers both he and she.' },
				],
				prompts: [
					{
						id: 'f-han-1',
						q: "How many words does Finnish have for 'he' and 'she'?",
						a: 'One — hän covers both.',
						note: 'No grammatical gender.',
					},
					{
						id: 'f-han-2',
						q: "How does Finnish say 'a/an/the'?",
						a: "It doesn't — there are no articles; definiteness comes from context and word order.",
						note: 'Hän on opettaja — he/she is a teacher.',
					},
				],
			},
			{
				id: 'f-have',
				term: 'minulla on',
				syntax: "'on me is'",
				description: "Finnish has no verb to have. Possession = adessive + olla: literally 'on me is'.",
				explanation:
					"Rather than a dedicated verb like English 'have', Finnish repurposes machinery this deck already covers: the adessive case (see c-ade — 'on/at') applied to the possessor, plus olla ('to be') for the thing possessed. Minulla on koira reads word-for-word as 'on-me is dog' — no new grammar needed, just the adessive doing double duty as both 'location' and 'possessor', which is why f-have sits downstream of both c-ade and e-olla in the learning order.",
				examples: [
					{ code: 'Minulla on koira.', note: 'I have a dog — literally "on me is dog".' },
					{ code: 'Kissalla on…', note: "The cat has… — same construction, third-person possessor." },
				],
				prompts: [
					{
						id: 'f-have-1',
						q: "How does Finnish express 'to have' without a verb for it?",
						a: "Adessive + olla — literally 'on me is'.",
						note: 'Minulla on koira — I have a dog.',
					},
					{
						id: 'f-have-2',
						q: "Say: 'I have a dog.'",
						a: 'Minulla on koira.',
						note: 'minulla = on me (adessive of minä).',
					},
				],
			},
			{
				id: 'f-nofuture',
				term: 'no future tense',
				syntax: 'present covers it',
				description: 'There is no future tense; present + context does the job.',
				explanation:
					"Where English has a dedicated future construction ('will go'), Finnish just uses the present tense and leans on context — a time word like huomenna (tomorrow), or the surrounding conversation — to make clear the action hasn't happened yet. Huomenna menen kauppaan is grammatically present tense (menen = 'I go'), but reads naturally as future because huomenna already fixes the timeframe; no separate verb form is needed or exists.",
				examples: [
					{ code: 'Huomenna menen kauppaan.', note: "Tomorrow I('ll) go to the shop — present-tense menen, future meaning from huomenna." },
					{ code: 'menen', note: 'I go — present tense, the only tense this sentence needs.' },
				],
				prompts: [
					{
						id: 'f-nofuture-1',
						q: 'How does Finnish express future time?',
						a: "Present tense plus context (like 'tomorrow').",
						note: "Huomenna menen kauppaan — tomorrow I'll go to the shop.",
					},
					{
						id: 'f-nofuture-2',
						q: "Say: 'Tomorrow I go to the shop.' (as Finnish would say it)",
						a: 'Huomenna menen kauppaan.',
						note: 'No future tense needed — huomenna (tomorrow) does the work.',
					},
				],
			},
		],
	},
	{
		id: 'roots',
		title: 'Roots (Juuret)',
		emoji: '🗺️',
		description: 'Origins: Uralic family, loanword time capsules, Agricola.',
		items: [
			{
				id: 'g-uralic',
				term: 'Uralic',
				syntax: 'not Indo-European',
				description:
					"Finnish belongs to the Uralic family — a completely separate tree from English, Hindi, Russian, French (all Indo-European). That's why the vocabulary looks alien: it is unrelated.",
				explanation:
					"Most languages a European or South Asian learner has met — English, French, Hindi, Russian, Persian, and hundreds more — descend from a single common ancestor, Proto-Indo-European, which is why their core vocabulary shares recognizable roots even across huge distances (English 'three', Hindi 'tīn', both from the same source). Finnish simply isn't on that tree at all — it's Uralic, a separate family altogether — so the usual trick of guessing a word from a cognate in another European language doesn't work here; the vocabulary has to be learned from scratch, which is exactly what the rule-based grammar in this deck is designed to make bearable.",
				examples: [
					{ code: 'English, Hindi, Russian, French', note: 'All Indo-European — genuinely unrelated to Finnish, despite geography.' },
				],
				prompts: [
					{
						id: 'g-uralic-1',
						q: 'What language family does Finnish belong to?',
						a: 'Uralic',
						note: 'A completely separate tree from English, Hindi, Russian, French (all Indo-European).',
					},
					{
						id: 'g-uralic-2',
						q: 'Why does Finnish vocabulary look totally alien to English speakers?',
						a: "Because it's Uralic, not Indo-European — genuinely unrelated.",
						note: '',
					},
				],
			},
			{
				id: 'g-relatives',
				term: 'relatives',
				syntax: 'Estonian near, Hungarian far',
				description:
					'Closest relatives: Estonian and Karelian (partly intelligible). Hungarian is family too, but separated by thousands of years — related the way English is to Persian.',
				explanation:
					"Within the Uralic family, Finnish's closeness to its relatives varies enormously by branch. Estonian and Karelian share the Finnic branch directly with Finnish and split off recently enough that a Finn and an Estonian can often follow the gist of each other's speech — genuine partial mutual intelligibility, not just a family resemblance. Hungarian is real family too, but on a much more distant branch, separated by thousands of years of divergence — related to Finnish the way English is to Persian: same ultimate ancestor, no practical resemblance left.",
				examples: [
					{ code: 'Estonian, Karelian', note: "Finnish's closest relatives — same Finnic branch, partly intelligible." },
					{ code: 'Hungarian', note: 'Real Uralic family, but thousands of years removed — a distant cousin, not a close one.' },
				],
				prompts: [
					{
						id: 'g-relatives-1',
						q: "Finnish's closest major relative language?",
						a: 'Estonian',
						note: 'Same Finnic branch of Uralic; Hungarian is a far more distant cousin.',
					},
					{
						id: 'g-relatives-2',
						q: 'How closely related are Finnish and Hungarian?',
						a: 'Distantly — separated by thousands of years, like English and Persian.',
						note: 'Both Uralic, but far apart on the tree.',
					},
				],
			},
			{
				id: 'g-sami',
				term: 'Sami',
				syntax: 'northern cousins',
				description: 'The Sami languages of Lapland are Uralic cousins, not dialects of Finnish.',
				explanation:
					"A common misconception worth correcting early: the Sami languages spoken across Lapland aren't regional Finnish dialects, the way one might assume from geographic proximity — they're their own branch of the Uralic family, related to Finnish roughly the way the Finnic languages are related to each other, but distinct enough to be genuinely separate languages (in fact several separate Sami languages, not just one) with their own grammar and vocabulary.",
				examples: [
					{ code: 'Lapland', note: 'Home to the Sami languages — a separate Uralic branch, not Finnish dialects.' },
				],
				prompts: [
					{
						id: 'g-sami-1',
						q: 'Are the Sami languages of Lapland dialects of Finnish?',
						a: "No — they're separate Uralic cousin languages.",
						note: '',
					},
				],
			},
			{
				id: 'g-loans',
				term: 'loanword time capsule',
				syntax: 'kuningas < *kuningaz',
				description:
					'Finnish changes so slowly it preserves ancient loans better than the lenders: kuningas (king) still ≈ Proto-Germanic *kuningaz; ranta (shore) < Germanic strand-word; äiti (mother) < Gothic aiþei; sata (hundred) is an Indo-Iranian loan from ~4000 years ago.',
				explanation:
					"Because Finnish has been geographically and linguistically isolated from its Indo-European neighbors for millennia, words it borrowed long ago often changed less inside Finnish than they did in the very languages that lent them — a kind of linguistic time capsule. kuningas (king) is close enough to reconstructed Proto-Germanic *kuningaz that it's a textbook citation in historical linguistics, and sata (hundred) traces all the way back to an Indo-Iranian loan roughly 4000 years old — evidence of contact between Uralic and Indo-Iranian speakers in deep prehistory, preserved intact in a single everyday Finnish number word.",
				examples: [
					{ code: 'kuningas', note: 'king — still close to reconstructed Proto-Germanic *kuningaz.' },
					{ code: 'ranta', note: 'shore — from an old Germanic "strand" word.' },
					{ code: 'sata', note: 'hundred — an Indo-Iranian loan from roughly 4000 years ago.' },
				],
				prompts: [
					{
						id: 'g-loans-1',
						q: 'What does kuningas mean, and where does it come from?',
						a: 'king — an ancient loan from Proto-Germanic *kuningaz',
						note: 'Finnish preserves old loans better than the languages that lent them.',
					},
					{
						id: 'g-loans-2',
						q: 'sata (hundred) was borrowed from which ancient language family, ~4000 years ago?',
						a: 'Indo-Iranian',
						note: 'One of the oldest loanwords in Finnish.',
					},
					{
						id: 'g-loans-3',
						q: 'Where does äiti (mother) come from?',
						a: 'A loan from Gothic aiþei.',
						note: '',
					},
				],
			},
			{
				id: 'g-agricola',
				term: 'Agricola 1543',
				syntax: 'father of written Finnish',
				description:
					'Written Finnish is young: bishop Mikael Agricola published the first Finnish book (Abckiria, an ABC-primer, ~1543) and the New Testament (1548).',
				explanation:
					"Finnish as a spoken language is ancient, but Finnish as a written language is comparatively recent — there was no standard way to write it at all until bishop Mikael Agricola, trained in Wittenberg during the Reformation, created one and used it to publish Abckiria (an ABC-primer) around 1543, followed by a Finnish New Testament in 1548. That single person's choices about spelling and orthography still echo in the phonemic writing system taught in the 'Sounds & Reading' category — one letter, one sound.",
				examples: [
					{ code: 'Abckiria, 1543', note: 'The first book printed in Finnish — an ABC-primer.' },
					{ code: 'Mikael Agricola', note: 'The bishop credited as the father of written Finnish.' },
				],
				prompts: [
					{
						id: 'g-agricola-1',
						q: 'Who is called the father of written Finnish?',
						a: 'Mikael Agricola',
						note: 'Published the first Finnish book, Abckiria, ~1543.',
					},
					{
						id: 'g-agricola-2',
						q: 'What was the first book printed in Finnish, and roughly when?',
						a: 'Abckiria (an ABC-primer), ~1543',
						note: 'By bishop Mikael Agricola; he also published the New Testament in 1548.',
					},
				],
			},
			{
				id: 'g-registers',
				term: 'kirjakieli / puhekieli',
				syntax: 'written vs spoken',
				description:
					'The standard you learn (kirjakieli) and everyday speech (puhekieli) differ: minä olen → spoken mä oon. Learn the book language first; the street version is a systematic compression of it.',
				explanation:
					"Every language has a gap between how it's written and how it's actually spoken, but Finnish's gap is unusually wide and systematic: puhekieli shortens pronouns (minä → mä), contracts common verb forms (olen → oon), and drops sounds kirjakieli keeps — not randomly, but by consistent patterns you can learn once you know the standard. That's why this deck teaches kirjakieli first even though it's not what you'll hear on the street: puhekieli is a predictable compression of the book language, easier to reverse-engineer once the full forms are solid than to learn as a separate, unruly system.",
				examples: [
					{ code: 'minä olen → mä oon', note: 'I am — written kirjakieli vs. everyday spoken puhekieli.' },
					{ code: 'kirjakieli', note: 'The written/standard register — what this deck teaches.' },
					{ code: 'puhekieli', note: 'Everyday spoken register — a systematic compression of kirjakieli.' },
				],
				prompts: [
					{
						id: 'g-registers-1',
						q: 'What are kirjakieli and puhekieli?',
						a: 'Written/standard Finnish and everyday spoken Finnish — they differ noticeably.',
						note: 'minä olen (written) → mä oon (spoken)',
					},
					{
						id: 'g-registers-2',
						q: 'Which register does this course teach first, and why?',
						a: 'Kirjakieli (written standard) — puhekieli is a systematic compression of it, easier to learn after.',
						note: '',
					},
				],
			},
		],
	},
	{
		id: 'vocab',
		title: 'Survival Vocabulary',
		emoji: '💬',
		description: 'Words chosen to feed the rule prompts.',
		items: [
			{
				id: 'h-talo',
				term: 'talo',
				syntax: 'house',
				description: 'house — clean case paradigm (no gradation); the model noun for the location-case grid.',
				explanation:
					"talo is deliberately the first noun this deck leans on for case practice: its stem never gradates, so every ending attaches with no consonant surprises, letting the case ending itself be the whole lesson. That's why it's the model noun for the location-case grid (c-grid) — talossa/talosta/taloon show the s-cases in their purest form, uncomplicated by KPT.",
				examples: [
					{ code: 'talossa', note: 'in the house — inessive, no gradation.' },
					{ code: 'talon', note: "of the house / house's — genitive, still just talo + n." },
					{ code: 'taloa', note: 'some house(s)/of a house — partitive, strong grade (same as nominative).' },
				],
				prompts: [
					{ id: 'h-talo-1', q: 'What does talo mean?', a: 'house' },
					{ id: 'h-talo-2', q: "Finnish for 'house'?", a: 'talo' },
					{
						id: 'h-talo-3',
						q: "Apply the inessive: 'in the house' — talo → ?",
						a: 'talossa',
						note: 'No gradation — talo is the clean model noun for the case grid.',
					},
				],
			},
			{
				id: 'h-katu',
				term: 'katu',
				syntax: 'street',
				description: "street — t~d gradation; adessive gives 'on the street'.",
				explanation:
					"katu is the model noun for t~d gradation (b-t) and for the exterior l-cases at once — a street is a surface you're on, not an interior you're in, so it takes -lla/-lta/-lle rather than -ssa/-sta/-ssa. Every weak-grade form shows the same t→d shift: kadulla, kadulta, kadulle all share the weakened kadu- stem.",
				examples: [
					{ code: 'kadulla', note: 'on the street — adessive, t weakens to d.' },
					{ code: 'kadun', note: "of the street / street's — genitive, same weak grade." },
					{ code: 'katua', note: 'some street — partitive, strong grade (t stays t).' },
				],
				prompts: [
					{ id: 'h-katu-1', q: 'What does katu mean?', a: 'street' },
					{ id: 'h-katu-2', q: "Finnish for 'street'?", a: 'katu' },
					{
						id: 'h-katu-3',
						q: "Apply the adessive: 'on the street' — katu → ?",
						a: 'kadulla',
						note: 't→d (KPT) plus back harmony -lla.',
					},
				],
			},
			{
				id: 'h-kauppa',
				term: 'kauppa',
				syntax: 'shop',
				description: 'shop — pp~p gradation; the canonical KPT example.',
				explanation:
					"kauppa is the word every Finnish course reaches for to introduce KPT gradation, since kauppa → kaupan is the textbook pp~p example (b-pp) — and because it's used constantly across this deck's example sentences (Huomenna menen kauppaan), its full paradigm ends up reinforced everywhere, not just in the gradation category.",
				examples: [
					{ code: 'kaupassa', note: 'in the shop — inessive, weak grade (pp→p).' },
					{ code: 'kaupan', note: "of the shop / shop's — genitive, same weak grade." },
					{ code: 'kauppaa', note: 'some shop — partitive, strong grade (pp stays pp).' },
				],
				prompts: [
					{ id: 'h-kauppa-1', q: 'What does kauppa mean?', a: 'shop' },
					{ id: 'h-kauppa-2', q: "Finnish for 'shop'?", a: 'kauppa' },
					{
						id: 'h-kauppa-3',
						q: 'Apply the genitive: kauppa + -n → ?',
						a: 'kaupan',
						note: 'pp→p — the textbook KPT example.',
					},
				],
			},
			{
				id: 'h-kirja',
				term: 'kirja',
				syntax: 'book',
				description: 'book — back harmony, no gradation.',
				explanation:
					"kirja is a clean word for practicing back-vowel harmony in isolation: it has no gradation to complicate things, so every ending it takes just follows the vowel-harmony rule (back vowels a/o/u throughout, so every suffix takes its back form: -ssa not -ssä).",
				examples: [
					{ code: 'kirjassa', note: 'in the book — inessive, back harmony -ssa, no gradation.' },
					{ code: 'kirjan', note: "of the book / book's — genitive, no gradation to worry about." },
					{ code: 'kirjaa', note: 'some book — partitive.' },
				],
				prompts: [
					{ id: 'h-kirja-1', q: 'What does kirja mean?', a: 'book' },
					{ id: 'h-kirja-2', q: "Finnish for 'book'?", a: 'kirja' },
					{
						id: 'h-kirja-3',
						q: "Apply the inessive: 'in the book' — kirja → ?",
						a: 'kirjassa',
						note: 'Back harmony, no gradation to worry about.',
					},
				],
			},
			{
				id: 'h-vesi',
				term: 'vesi',
				syntax: 'water',
				description: 'water — e-stem: veden / vettä / vedessä; flagship irregular-ish noun.',
				explanation:
					"vesi looks like it should behave like other i-final nouns, but it's an e-stem: the case forms are built on vete-/vede-, not vesi- directly, which is why its partitive is vettä rather than a naive 'vesiä'. It's the flagship example of this pattern precisely because water comes up so often in beginner sentences (Juon vettä) that the irregularity gets drilled early and hard.",
				examples: [
					{ code: 'vettä', note: '(some) water — partitive, the e-stem form (not "vesiä").' },
					{ code: 'veden', note: "of the water / water's — genitive, e-stem vede-." },
					{ code: 'vedessä', note: 'in the water — inessive, e-stem vede-.' },
				],
				prompts: [
					{ id: 'h-vesi-1', q: 'What does *vesi* mean?', a: 'water' },
					{ id: 'h-vesi-2', q: 'Finnish for "water"?', a: 'vesi' },
					{
						id: 'h-vesi-3',
						q: '"I drink water" — juon … ?',
						a: 'Juon vettä.',
						note: 'vesi is an e-stem: partitive is vettä (not "vesiä"). Drinking = incomplete amount = partitive.',
					},
				],
			},
			{
				id: 'h-kahvi',
				term: 'kahvi',
				syntax: 'coffee',
				description: 'coffee — partitive object: juon kahvia.',
				explanation:
					"kahvi has no gradation, which keeps the focus on the partitive itself: coffee is the drink Finns actually drink most, and 'I drink coffee' (Juon kahvia) is the sentence every partitive-as-object example in this deck eventually points back to.",
				examples: [
					{ code: 'Juon kahvia.', note: 'I drink coffee — partitive object, unspecified amount.' },
					{ code: 'kahvin', note: "of the coffee / coffee's — genitive, no gradation." },
					{ code: 'Onko kahvi hyvää?', note: 'Is the coffee good? — kahvi in its bare nominative form.' },
				],
				prompts: [
					{ id: 'h-kahvi-1', q: 'What does kahvi mean?', a: 'coffee' },
					{ id: 'h-kahvi-2', q: "Finnish for 'coffee'?", a: 'kahvi' },
					{
						id: 'h-kahvi-3',
						q: "Say: 'I drink coffee.'",
						a: 'Juon kahvia.',
						note: 'Drinking = incomplete amount = partitive object.',
					},
				],
			},
			{
				id: 'h-maito',
				term: 'maito',
				syntax: 'milk',
				description: 't~d gradation: maidon.',
				explanation:
					"maito is a second t~d example alongside katu and pöytä, reinforcing the same weak-grade shift (t→d) on a different word so the pattern generalizes rather than sticking to just one memorized pair.",
				examples: [
					{ code: 'maidon', note: "of the milk / milk's — genitive, t weakens to d." },
					{ code: 'maitoa', note: 'some milk — partitive, strong grade (t stays t).' },
				],
				prompts: [
					{ id: 'h-maito-1', q: 'What does maito mean?', a: 'milk' },
					{ id: 'h-maito-2', q: "Finnish for 'milk'?", a: 'maito' },
					{
						id: 'h-maito-3',
						q: 'Apply the genitive: maito + -n → ?',
						a: 'maidon',
						note: 't→d gradation.',
					},
				],
			},
			{
				id: 'h-leipa',
				term: 'leipä',
				syntax: 'bread',
				description: 'bread — front harmony plus p~v gradation: leivän.',
				explanation:
					"leipä stacks two rules on one word: front vowel harmony (ä, so any suffix it takes uses the front form) and p~v gradation (leipä → leivän), which makes it a compact review card for both systems at once rather than testing them separately.",
				examples: [
					{ code: 'leivän', note: "of the bread / bread's — genitive, p weakens to v." },
					{ code: 'leipää', note: 'some bread — partitive, strong grade (p stays p), front harmony -ää.' },
				],
				prompts: [
					{ id: 'h-leipa-1', q: 'What does leipä mean?', a: 'bread' },
					{ id: 'h-leipa-2', q: "Finnish for 'bread'?", a: 'leipä' },
					{
						id: 'h-leipa-3',
						q: 'Apply the genitive: leipä + -n → ?',
						a: 'leivän',
						note: 'p→v gradation; front harmony (ä).',
					},
				],
			},
			{
				id: 'h-kissa',
				term: 'kissa',
				syntax: 'cat',
				description: 'cat — used with the adessive-possession construction: kissalla on…',
				explanation:
					"kissa has no gradation, which keeps it simple as the noun that carries the adessive-possession construction (f-have) into a third-person example: Kissalla on… puts the cat itself, not minä (I), into the adessive, showing the construction generalizes to any possessor.",
				examples: [
					{ code: 'Kissalla on…', note: 'The cat has… — adessive possessor, third person.' },
					{ code: 'kissan nimi', note: "the cat's name — genitive, no gradation." },
					{ code: 'kissalla', note: 'on/at the cat — adessive, also used literally for location.' },
				],
				prompts: [
					{ id: 'h-kissa-1', q: 'What does kissa mean?', a: 'cat' },
					{ id: 'h-kissa-2', q: "Finnish for 'cat'?", a: 'kissa' },
					{
						id: 'h-kissa-3',
						q: "Say: 'the cat's name' — kissa + n + nimi → ?",
						a: 'kissan nimi',
						note: 'Genitive -n; kissa has no gradation.',
					},
				],
			},
			{
				id: 'h-koira',
				term: 'koira',
				syntax: 'dog',
				description: "dog — the go-to example for the 'have' construction: Minulla on koira.",
				explanation:
					"koira is the word most learners meet the adessive-possession construction through, since 'I have a dog' is such a natural first sentence to want to say — no gradation to complicate it, so the whole sentence's difficulty lives entirely in the construction itself (minulla + on), not in the noun.",
				examples: [
					{ code: 'Minulla on koira.', note: 'I have a dog — the flagship f-have sentence.' },
					{ code: 'koiran', note: "of the dog / dog's — genitive, no gradation." },
					{ code: 'koiralla', note: 'on/at the dog — adessive, also usable as a possessor: "the dog has…".' },
				],
				prompts: [
					{ id: 'h-koira-1', q: 'What does koira mean?', a: 'dog' },
					{ id: 'h-koira-2', q: "Finnish for 'dog'?", a: 'koira' },
					{
						id: 'h-koira-3',
						q: "Say: 'I have a dog.'",
						a: 'Minulla on koira.',
						note: "Adessive + olla — Finnish's way of saying 'have'.",
					},
				],
			},
			{
				id: 'h-poyta',
				term: 'pöytä',
				syntax: 'table',
				description:
					'table — front harmony plus t~d gradation; the model noun for the exterior (l-) cases.',
				explanation:
					"pöytä plays the same model-noun role for the exterior l-cases that talo plays for the interior s-cases — except pöytä isn't a clean case, since it stacks front harmony and t~d gradation on top of the case ending, so its full l-case row (pöydällä/pöydältä/pöydälle) is the fullest single-word demonstration of everything the location-case grid combines.",
				examples: [
					{ code: 'pöydällä', note: 'on the table — adessive, t weakens to d, front harmony -llä.' },
					{ code: 'pöydän', note: "of the table / table's — genitive, same weak grade." },
					{ code: 'pöytää', note: 'some table — partitive, strong grade (t stays t).' },
				],
				prompts: [
					{ id: 'h-poyta-1', q: 'What does pöytä mean?', a: 'table' },
					{ id: 'h-poyta-2', q: "Finnish for 'table'?", a: 'pöytä' },
					{
						id: 'h-poyta-3',
						q: "Apply the adessive: 'on the table' — pöytä → ?",
						a: 'pöydällä',
						note: 't→d gradation; front harmony -llä; model noun for the exterior cases.',
					},
				],
			},
			{
				id: 'h-adjs',
				term: 'hyvä · iso · pieni',
				syntax: 'good · big · small',
				description:
					'good · big · small. pieni is an e-stem (pientä); Hyvää päivää! is the standard "good day" greeting.',
				explanation:
					"These three adjectives cover the basics of description, but pieni is worth flagging specially: like vesi, it's an e-stem, so its partitive is pientä rather than a naively regular form — the same irregularity pattern as vesi/vettä, just on a different word. Hyvää päivää! is a fixed, frozen partitive greeting phrase (not a sentence you build word-by-word), worth learning as a whole unit rather than decomposing.",
				examples: [
					{ code: 'hyvä · iso · pieni', note: 'good · big · small — the three core adjectives.' },
					{ code: 'pientä', note: 'partitive of pieni — an e-stem, like vesi → vettä.' },
					{ code: 'Hyvää päivää!', note: 'Good day! — a fixed partitive greeting phrase.' },
				],
				prompts: [
					{ id: 'h-adjs-1', q: 'What do hyvä, iso, and pieni mean?', a: 'good, big, small' },
					{
						id: 'h-adjs-2',
						q: "Finnish for 'small'?",
						a: 'pieni',
						note: 'e-stem: partitive is pientä.',
					},
					{
						id: 'h-adjs-3',
						q: 'What does Hyvää päivää! mean, literally used as a greeting?',
						a: 'Good day!',
						note: 'Partitive form of hyvä päivä — a set greeting phrase.',
					},
				],
			},
			{
				id: 'h-greet',
				term: 'kiitos · anteeksi · hei/moi',
				syntax: 'thanks · sorry · hi',
				description: 'thanks · sorry / excuse me · hi — zero-grammar words you can use from day one.',
				explanation:
					"These are fixed words with no case endings, no conjugation, and no harmony to apply — the zero-grammar wins that make day one of learning any language feel productive immediately, before any rule system has been introduced at all. hei and moi are interchangeable casual greetings; kiitos and anteeksi cover the two most-used social reflexes in any language.",
				examples: [
					{ code: 'Kiitos!', note: 'Thanks!' },
					{ code: 'Anteeksi.', note: 'Sorry / excuse me.' },
					{ code: 'Hei! · Moi!', note: 'Two interchangeable casual ways to say hi.' },
				],
				prompts: [
					{ id: 'h-greet-1', q: 'What does kiitos mean?', a: 'thanks' },
					{ id: 'h-greet-2', q: 'What does anteeksi mean?', a: 'sorry / excuse me' },
					{ id: 'h-greet-3', q: "Two casual ways to say 'hi' in Finnish?", a: 'hei and moi' },
				],
			},
			{
				id: 'h-num',
				term: '1–10',
				syntax: 'yksi kaksi kolme neljä viisi kuusi seitsemän kahdeksan yhdeksän kymmenen',
				description:
					'The numbers 1–10: yksi kaksi kolme neljä viisi kuusi seitsemän kahdeksan yhdeksän kymmenen. Feed the partitive-after-numbers rule (2+).',
				explanation:
					"These ten words aren't just vocabulary — they're the raw material the d-part-num rule (numbers + partitive) runs on: yksi is the sole exception that keeps the noun in the nominative, while kaksi through kymmenen all trigger the partitive singular. Learning to count is what turns that grammar rule from an abstract fact into something you can actually produce in a sentence.",
				examples: [
					{ code: 'yksi, kaksi, kolme, neljä, viisi', note: 'One through five.' },
					{ code: 'kuusi, seitsemän, kahdeksan, yhdeksän, kymmenen', note: 'Six through ten.' },
					{ code: 'kaksi taloa', note: 'two houses — kaksi triggers the partitive singular taloa.' },
				],
				prompts: [
					{
						id: 'h-num-1',
						q: 'Count 1 to 5 in Finnish.',
						a: 'yksi, kaksi, kolme, neljä, viisi',
					},
					{
						id: 'h-num-2',
						q: 'Count 6 to 10 in Finnish.',
						a: 'kuusi, seitsemän, kahdeksan, yhdeksän, kymmenen',
					},
					{ id: 'h-num-3', q: "What is 'seitsemän'?", a: 'seven' },
				],
			},
		],
	},
];

// Hand-curated, dependency-aware order — see planning/finnish-learning-system.md
// §3 "Introduction order" for the constraints this satisfies (vowels/harmony
// before suffixes, KPT principle before other gradation items, vocab words
// before the rule items that use them, partitive before its dependents,
// roots items spaced as "dessert").
export const introductionOrder: string[] = [
	'h-greet',
	'a-phonemic',
	'h-talo',
	'a-vowels',
	'a-harmony',
	'h-kauppa',
	'b-principle',
	'b-pp',
	'a-stress',
	'c-grid',
	'c-ine',
	'h-katu',
	'g-uralic',
	'h-kirja',
	'a-length',
	'c-ela',
	'c-ill',
	'h-vesi',
	'h-kahvi',
	'd-nom',
	'd-gen',
	'b-kk',
	'h-maito',
	'b-tt',
	'h-poyta',
	'c-ade',
	'g-relatives',
	'b-k',
	'h-leipa',
	'b-p',
	'c-abl',
	'a-suffix-pairs',
	'b-t',
	'c-all',
	'h-kissa',
	'b-nk',
	'd-part',
	'h-koira',
	'h-num',
	'd-part-num',
	'g-sami',
	'd-part-neg',
	'e-endings',
	'e-olla',
	'b-assim',
	'a-diphthongs',
	'h-adjs',
	'e-type1',
	'e-neg',
	'e-q',
	'e-type2',
	'e-type3',
	'g-loans',
	'e-type4',
	'f-han',
	'f-have',
	'f-nofuture',
	'g-agricola',
	'g-registers',
];
