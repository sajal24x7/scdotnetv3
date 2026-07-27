// Content pool for /learn/finnish-vocab — a sibling deck to /learn/finnish
// (plan §Phase 6, planning/practice-system-unified-srs.md). The Finnish deck
// is rules-first by design (14 vocabulary items, chosen to feed the rule
// prompts); this deck is the open, TIL-style vocabulary feed communicative
// Finnish actually needs, added in curated batches. This is batch 1: ~55
// words across the themed categories the plan calls for (verbs, family,
// food, time, question words/pronouns, places, adjectives).
//
// Prompts are NOT authored here. This is an authored-prompt deck: each word
// ships as a reference card only, and the prompts that test it are written
// by hand when it's introduced on /learn/new, then stored in
// src/data/authored-prompts.json. See docs/architecture/learning-systems.md
// § "Authored prompts".
//
// RULE FOR EDITORS: never invent Finnish (same rule as planning/finnish-
// learning-system.md §2's header comment in finnish.ts). That rule binds the
// prompts you write in the composer too — if you want to test an inflected
// form, verify it against finnish.ts's own inflection bank or a worked
// "strong → weak" example first. The composer can't check your Finnish for
// you; a plausible-looking guess drilled daily is worse than no prompt.

import type { Category } from '../components/learn/types';

export const categories: Category[] = [
	{
		id: 'verbs',
		title: 'Verbs',
		emoji: '🗣️',
		description: 'Common verbs beyond olla — the working vocabulary of everyday sentences.',
		items: [
			{
				id: 'fv-nahda',
				term: 'nähdä',
				syntax: 'to see',
				description: 'to see — one of the handful of verbs every beginner needs immediately.',
			},
			{
				id: 'fv-tehda',
				term: 'tehdä',
				syntax: 'to do / to make',
				description: 'to do, to make — one of the most frequent verbs in the language.',
			},
			{
				id: 'fv-saada',
				term: 'saada',
				syntax: 'to get / to receive',
				description: 'to get, to receive — also doubles as "may/be allowed to" in polite requests.',
			},
			{
				id: 'fv-antaa',
				term: 'antaa',
				syntax: 'to give',
				description: 'to give.',
			},
			{
				id: 'fv-ottaa',
				term: 'ottaa',
				syntax: 'to take',
				description: 'to take.',
			},
			{
				id: 'fv-rakastaa',
				term: 'rakastaa',
				syntax: 'to love',
				description: 'to love.',
			},
			{
				id: 'fv-asua',
				term: 'asua',
				syntax: 'to live / to reside',
				description: 'to live, to reside (asks and answers "where do you live?").',
				example: 'asun',
				exampleNote: '(minä) asun — Type 1 verb: drop -a from the infinitive, add the ending, same as puhua → puhun.',
			},
			{
				id: 'fv-ostaa',
				term: 'ostaa',
				syntax: 'to buy',
				description: 'to buy.',
				example: 'ostan',
				exampleNote: '(minä) ostan — Type 1 verb, same stem-drop pattern as puhua → puhun.',
			},
		],
	},
	{
		id: 'family',
		title: 'Family',
		emoji: '👪',
		description: 'Household and family words — the vocabulary of "who\'s who."',
		items: [
			{
				id: 'fv-aiti',
				term: 'äiti',
				syntax: 'mother',
				description: 'mother — as in äidinkieli, "mother tongue."',
				example: 'äidin',
				exampleNote: "genitive — t weakens to d, same pattern as katu → kadun / pöytä → pöydän.",
			},
			{
				id: 'fv-isa',
				term: 'isä',
				syntax: 'father',
				description: 'father.',
			},
			{
				id: 'fv-veli',
				term: 'veli',
				syntax: 'brother',
				description: 'brother.',
			},
			{
				id: 'fv-sisko',
				term: 'sisko',
				syntax: 'sister',
				description: 'sister (the everyday word; sisar is the more formal register).',
			},
			{
				id: 'fv-poika',
				term: 'poika',
				syntax: 'son / boy',
				description: 'son, or boy more generally.',
			},
			{
				id: 'fv-tytar',
				term: 'tytär',
				syntax: 'daughter',
				description: "daughter (distinct from tyttö, 'girl').",
			},
			{
				id: 'fv-vaimo',
				term: 'vaimo',
				syntax: 'wife',
				description: 'wife.',
			},
			{
				id: 'fv-perhe',
				term: 'perhe',
				syntax: 'family',
				description: 'family, as a household unit.',
			},
		],
	},
	{
		id: 'food',
		title: 'Food',
		emoji: '🍽️',
		description: 'Everyday food words for ordering, cooking, and shopping.',
		items: [
			{
				id: 'fv-ruoka',
				term: 'ruoka',
				syntax: 'food',
				description: 'food, in the general sense.',
			},
			{
				id: 'fv-liha',
				term: 'liha',
				syntax: 'meat',
				description: 'meat.',
			},
			{
				id: 'fv-kala',
				term: 'kala',
				syntax: 'fish',
				description: 'fish.',
			},
			{
				id: 'fv-omena',
				term: 'omena',
				syntax: 'apple',
				description: 'apple.',
			},
			{
				id: 'fv-keitto',
				term: 'keitto',
				syntax: 'soup',
				description: 'soup.',
				example: 'keiton',
				exampleNote: 'genitive — tt weakens to t, same pattern as tyttö → tytön.',
			},
			{
				id: 'fv-tee',
				term: 'tee',
				syntax: 'tea',
				description: 'tea, the drink.',
			},
		],
	},
	{
		id: 'time',
		title: 'Time',
		emoji: '⏰',
		description: 'Days, parts of the day, and the units that measure them.',
		items: [
			{
				id: 'fv-tanaan',
				term: 'tänään',
				syntax: 'today',
				description: 'today.',
			},
			{
				id: 'fv-huomenna',
				term: 'huomenna',
				syntax: 'tomorrow',
				description: 'tomorrow — used with the plain present tense, since Finnish has no future tense.',
			},
			{
				id: 'fv-eilen',
				term: 'eilen',
				syntax: 'yesterday',
				description: 'yesterday.',
			},
			{
				id: 'fv-viikko',
				term: 'viikko',
				syntax: 'week',
				description: 'week.',
				example: 'viikon',
				exampleNote: 'genitive — kk weakens to k, same pattern as kukka → kukan.',
			},
			{
				id: 'fv-paiva',
				term: 'päivä',
				syntax: 'day',
				description: 'day.',
			},
			{
				id: 'fv-ilta',
				term: 'ilta',
				syntax: 'evening',
				description: 'evening.',
				example: 'illan',
				exampleNote: 'genitive — lt assimilates to ll, same word finnish.ts uses for the b-assim pattern.',
			},
			{
				id: 'fv-tunti',
				term: 'tunti',
				syntax: 'hour',
				description: 'hour.',
				example: 'tunnin',
				exampleNote: 'genitive — nt assimilates to nn, same pattern as ranta → rannan.',
			},
			{
				id: 'fv-minuutti',
				term: 'minuutti',
				syntax: 'minute',
				description: 'minute.',
				example: 'minuutin',
				exampleNote: 'genitive — tt weakens to t, same pattern as tyttö → tytön.',
			},
		],
	},
	{
		id: 'question-words',
		title: 'Question Words & Pronouns',
		emoji: '❓',
		description: 'The words that open a question, plus the personal pronouns behind every verb ending.',
		items: [
			{
				id: 'fv-kuka',
				term: 'kuka',
				syntax: 'who',
				description: 'who — asks about a person.',
			},
			{
				id: 'fv-mika',
				term: 'mikä',
				syntax: 'what / which',
				description: 'what, which — asks about a thing.',
			},
			{
				id: 'fv-missa',
				term: 'missä',
				syntax: 'where',
				description: 'where — asks about a location.',
			},
			{
				id: 'fv-milloin',
				term: 'milloin',
				syntax: 'when',
				description: 'when.',
			},
			{
				id: 'fv-miksi',
				term: 'miksi',
				syntax: 'why',
				description: 'why.',
			},
			{
				id: 'fv-miten',
				term: 'miten',
				syntax: 'how',
				description: 'how.',
			},
			{
				id: 'fv-mina',
				term: 'minä',
				syntax: 'I',
				description: 'I — first-person singular pronoun (optional in speech, since the verb ending already carries it).',
			},
			{
				id: 'fv-sina',
				term: 'sinä',
				syntax: 'you (singular)',
				description: 'you — second-person singular pronoun.',
			},
			{
				id: 'fv-han',
				term: 'hän',
				syntax: 'he / she',
				description: 'he or she — one pronoun covers both, since Finnish has no grammatical gender.',
			},
			{
				id: 'fv-me',
				term: 'me',
				syntax: 'we',
				description: 'we — first-person plural pronoun.',
			},
		],
	},
	{
		id: 'places',
		title: 'Places',
		emoji: '📍',
		description: 'Everyday destinations — feeds straight into the location-case grid from the main Finnish deck.',
		items: [
			{
				id: 'fv-koti',
				term: 'koti',
				syntax: 'home',
				description: 'home.',
				example: 'kodin',
				exampleNote: 'genitive — t weakens to d, same pattern as katu → kadun.',
			},
			{
				id: 'fv-koulu',
				term: 'koulu',
				syntax: 'school',
				description: 'school.',
			},
			{
				id: 'fv-tyo',
				term: 'työ',
				syntax: 'work / job',
				description: 'work, job.',
			},
			{
				id: 'fv-kirjasto',
				term: 'kirjasto',
				syntax: 'library',
				description: 'library.',
			},
			{
				id: 'fv-ravintola',
				term: 'ravintola',
				syntax: 'restaurant',
				description: 'restaurant.',
			},
			{
				id: 'fv-kirkko',
				term: 'kirkko',
				syntax: 'church',
				description: 'church.',
				example: 'kirkon',
				exampleNote: 'genitive — kk weakens to k, same pattern as kukka → kukan.',
			},
			{
				id: 'fv-kaupunki',
				term: 'kaupunki',
				syntax: 'city',
				description: 'city.',
				example: 'kaupungin',
				exampleNote: 'genitive — nk weakens to ng, same pattern as Helsinki → Helsingin.',
			},
			{
				id: 'fv-kyla',
				term: 'kylä',
				syntax: 'village',
				description: 'village.',
			},
		],
	},
	{
		id: 'adjectives',
		title: 'Adjectives',
		emoji: '🎨',
		description: 'Descriptive words for everyday sentences.',
		items: [
			{
				id: 'fv-nopea',
				term: 'nopea',
				syntax: 'fast',
				description: 'fast, quick.',
			},
			{
				id: 'fv-hidas',
				term: 'hidas',
				syntax: 'slow',
				description: 'slow.',
			},
			{
				id: 'fv-vanha',
				term: 'vanha',
				syntax: 'old',
				description: 'old.',
			},
			{
				id: 'fv-uusi',
				term: 'uusi',
				syntax: 'new',
				description: 'new.',
			},
			{
				id: 'fv-kylma',
				term: 'kylmä',
				syntax: 'cold',
				description: 'cold.',
			},
			{
				id: 'fv-kuuma',
				term: 'kuuma',
				syntax: 'hot',
				description: 'hot.',
			},
			{
				id: 'fv-pitka',
				term: 'pitkä',
				syntax: 'long / tall',
				description: 'long, or tall for a person.',
			},
			{
				id: 'fv-helppo',
				term: 'helppo',
				syntax: 'easy',
				description: 'easy.',
				example: 'helpon',
				exampleNote: 'genitive — pp weakens to p, same pattern as kauppa → kaupan.',
			},
		],
	},
];

// Round-robin across categories so early days mix topics (blueprint
// principle 5), rather than the dependency-curated order finnish.ts uses
// (that ordering exists to sequence rules before the items that need them;
// this deck has no such dependency chain — it's a flat vocabulary feed).
export const introductionOrder: string[] = [
	'fv-nahda', 'fv-aiti', 'fv-ruoka', 'fv-tanaan', 'fv-kuka', 'fv-koti', 'fv-nopea',
	'fv-tehda', 'fv-isa', 'fv-liha', 'fv-huomenna', 'fv-mika', 'fv-koulu', 'fv-hidas',
	'fv-saada', 'fv-veli', 'fv-kala', 'fv-eilen', 'fv-missa', 'fv-tyo', 'fv-vanha',
	'fv-antaa', 'fv-sisko', 'fv-omena', 'fv-viikko', 'fv-milloin', 'fv-kirjasto', 'fv-uusi',
	'fv-ottaa', 'fv-poika', 'fv-keitto', 'fv-paiva', 'fv-miksi', 'fv-ravintola', 'fv-kylma',
	'fv-rakastaa', 'fv-tytar', 'fv-tee', 'fv-ilta', 'fv-miten', 'fv-kirkko', 'fv-kuuma',
	'fv-asua', 'fv-vaimo', 'fv-tunti', 'fv-mina', 'fv-kaupunki', 'fv-pitka',
	'fv-ostaa', 'fv-perhe', 'fv-minuutti', 'fv-sina', 'fv-kyla', 'fv-helppo',
	'fv-han',
	'fv-me',
];
