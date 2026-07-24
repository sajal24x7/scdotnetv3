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
				example: 'kauppa → kaupan',
				exampleNote: 'Ending closes the syllable, stem weakens.',
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
				example: 'kukka → kukan',
				exampleNote: 'flower',
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
				example: 'kauppa → kaupan',
				exampleNote: 'shop',
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
				example: 'tyttö → tytön',
				exampleNote: 'girl',
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
				example: 'jalka → jalan; puku → puvun',
				exampleNote: 'foot; suit',
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
				example: 'leipä → leivän',
				exampleNote: 'bread',
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
				example: 'katu → kadun; pöytä → pöydän',
				exampleNote: 'street; table',
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
				example: 'Helsinki → Helsingin; kenkä → kengän',
				exampleNote: 'shoe',
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
				example: 'ranta→rannan (shore) · ilta→illan (evening) · parta→parran (beard) · kampa→kamman (comb)',
				exampleNote: '',
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
				example: 'talossa · talosta · taloon / pöydällä · pöydältä · pöydälle',
				exampleNote: '',
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
				example: 'talossa in the house · Helsingissä in Helsinki',
				exampleNote: '',
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
				example: 'talosta out of the house · Suomesta from Finland',
				exampleNote: '',
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
				example: 'taloon into the house · Helsinkiin to Helsinki',
				exampleNote: '',
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
				example: 'pöydällä on the table · kadulla on the street',
				exampleNote: '',
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
				example: 'pöydältä off the table',
				exampleNote: '',
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
				example: 'pöydälle onto the table',
				exampleNote: '',
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
				example: 'kauppa on iso',
				exampleNote: 'the shop is big',
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
				example: "talon ovi the house's door · kissan nimi the cat's name",
				exampleNote: '',
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
				example: 'Juon kahvia — I drink (some) coffee',
				exampleNote: '',
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
				example: 'yksi talo, kaksi taloa, kolme kissaa',
				exampleNote: '',
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
				example: "Juon kahvin I'll drink the coffee → En juo kahvia I don't drink coffee",
				exampleNote: '',
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
				example: 'puhun = I speak (no minä needed)',
				exampleNote: '',
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
				example: 'Olen Sajal. — I am Sajal',
				exampleNote: '',
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
				example: 'puhua → puhun · sanoa → sanon',
				exampleNote: '',
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
				example: 'syödä → syön · juoda → juon',
				exampleNote: '',
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
				example: 'tulla → tulen · mennä → menen · opiskella → opiskelen',
				exampleNote: '',
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
				example: 'haluta → haluan I want',
				exampleNote: '',
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
				example: 'puhun → en puhu · hän syö → hän ei syö',
				exampleNote: '',
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
				example: 'Puhutko suomea? · Onko kahvi hyvää?',
				exampleNote: '',
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
				example: 'Hän on opettaja — he/she is a teacher',
				exampleNote: '',
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
				example: 'Minulla on koira — I have a dog',
				exampleNote: '',
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
				example: "Huomenna menen kauppaan — tomorrow I('ll) go to the shop",
				exampleNote: '',
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
				example: 'English, Hindi, Russian, French',
				exampleNote: 'All Indo-European — unrelated to Finnish.',
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
				example: 'Estonian, Karelian',
				exampleNote: 'Partly intelligible with Finnish.',
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
				example: 'Lapland',
				exampleNote: 'Sami languages are a separate Uralic branch, not Finnish dialects.',
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
				example: 'kuningas · ranta · äiti · sata',
				exampleNote: 'king · shore · mother · hundred — all ancient loanwords',
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
				example: 'Abckiria, 1543',
				exampleNote: 'The first book printed in Finnish.',
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
				example: 'minä olen → mä oon',
				exampleNote: "written vs spoken 'I am'",
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
				example: 'talossa',
				exampleNote: 'in the house',
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
				example: 'kadulla',
				exampleNote: 'on the street',
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
				example: 'kaupassa',
				exampleNote: 'in the shop',
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
				example: 'kirjassa',
				exampleNote: 'in the book',
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
				example: 'vettä',
				exampleNote: '(some) water',
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
				example: 'kahvia',
				exampleNote: '(some) coffee',
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
				example: 'maidon',
				exampleNote: "of the milk / milk's",
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
				example: 'leivän',
				exampleNote: "of the bread / bread's",
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
				example: 'Kissalla on…',
				exampleNote: 'The cat has…',
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
				example: 'Minulla on koira.',
				exampleNote: 'I have a dog.',
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
				example: 'pöydällä',
				exampleNote: 'on the table',
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
				example: 'Hyvää päivää!',
				exampleNote: 'Good day! (partitive greeting)',
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
				example: 'Kiitos!',
				exampleNote: 'Thanks!',
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
				example: 'kaksi taloa',
				exampleNote: 'two houses (partitive after numbers 2+)',
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
