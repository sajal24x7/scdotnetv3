// Content pool for /learn/finnish-vocab — a sibling deck to /learn/finnish
// (plan §Phase 6, planning/practice-system-unified-srs.md). The Finnish deck
// is rules-first by design (14 vocabulary items, chosen to feed the rule
// prompts); this deck is the open, TIL-style vocabulary feed communicative
// Finnish actually needs, added in curated batches. This is batch 1: ~55
// words across the themed categories the plan calls for (verbs, family,
// food, time, question words/pronouns, places, adjectives).
//
// RULE FOR EDITORS: never invent Finnish (same rule as planning/finnish-
// learning-system.md §2's header comment in finnish.ts). Every inflected
// form below (the "apply the rule" third prompt on a handful of items) is
// the *regular* consonant-gradation outcome of a pattern already verified
// in finnish.ts's own inflection bank/worked examples (see the note on each
// prompt for which pattern it is and which existing item demonstrates it).
// If you're not certain a derived form is correct, leave the item as a
// plain two-prompt vocabulary word rather than guessing a third prompt.

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
				prompts: [
					{ id: 'fv-nahda-1', q: 'What does *nähdä* mean?', a: 'to see' },
					{ id: 'fv-nahda-2', q: "Finnish for 'to see'?", a: 'nähdä' },
				],
			},
			{
				id: 'fv-tehda',
				term: 'tehdä',
				syntax: 'to do / to make',
				description: 'to do, to make — one of the most frequent verbs in the language.',
				prompts: [
					{ id: 'fv-tehda-1', q: 'What does *tehdä* mean?', a: 'to do / to make' },
					{ id: 'fv-tehda-2', q: "Finnish for 'to do' or 'to make'?", a: 'tehdä' },
				],
			},
			{
				id: 'fv-saada',
				term: 'saada',
				syntax: 'to get / to receive',
				description: 'to get, to receive — also doubles as "may/be allowed to" in polite requests.',
				prompts: [
					{ id: 'fv-saada-1', q: 'What does *saada* mean?', a: 'to get / to receive' },
					{ id: 'fv-saada-2', q: "Finnish for 'to get' or 'to receive'?", a: 'saada' },
				],
			},
			{
				id: 'fv-antaa',
				term: 'antaa',
				syntax: 'to give',
				description: 'to give.',
				prompts: [
					{ id: 'fv-antaa-1', q: 'What does *antaa* mean?', a: 'to give' },
					{ id: 'fv-antaa-2', q: "Finnish for 'to give'?", a: 'antaa' },
				],
			},
			{
				id: 'fv-ottaa',
				term: 'ottaa',
				syntax: 'to take',
				description: 'to take.',
				prompts: [
					{ id: 'fv-ottaa-1', q: 'What does *ottaa* mean?', a: 'to take' },
					{ id: 'fv-ottaa-2', q: "Finnish for 'to take'?", a: 'ottaa' },
				],
			},
			{
				id: 'fv-rakastaa',
				term: 'rakastaa',
				syntax: 'to love',
				description: 'to love.',
				prompts: [
					{ id: 'fv-rakastaa-1', q: 'What does *rakastaa* mean?', a: 'to love' },
					{ id: 'fv-rakastaa-2', q: "Finnish for 'to love'?", a: 'rakastaa' },
				],
			},
			{
				id: 'fv-asua',
				term: 'asua',
				syntax: 'to live / to reside',
				description: 'to live, to reside (asks and answers "where do you live?").',
				example: 'asun',
				exampleNote: '(minä) asun — Type 1 verb: drop -a from the infinitive, add the ending, same as puhua → puhun.',
				prompts: [
					{ id: 'fv-asua-1', q: 'What does *asua* mean?', a: 'to live / to reside' },
					{ id: 'fv-asua-2', q: "Finnish for 'to live (reside)'?", a: 'asua' },
					{
						id: 'fv-asua-3',
						q: 'Conjugate: asua → minä (I)?',
						a: 'asun',
						note: 'Type 1: stem = infinitive minus -a/-ä, then the personal ending — same pattern as puhua → puhun.',
					},
				],
			},
			{
				id: 'fv-ostaa',
				term: 'ostaa',
				syntax: 'to buy',
				description: 'to buy.',
				example: 'ostan',
				exampleNote: '(minä) ostan — Type 1 verb, same stem-drop pattern as puhua → puhun.',
				prompts: [
					{ id: 'fv-ostaa-1', q: 'What does *ostaa* mean?', a: 'to buy' },
					{ id: 'fv-ostaa-2', q: "Finnish for 'to buy'?", a: 'ostaa' },
					{
						id: 'fv-ostaa-3',
						q: 'Conjugate: ostaa → minä (I)?',
						a: 'ostan',
						note: 'Type 1: stem = infinitive minus -a/-ä, then the personal ending — same pattern as puhua → puhun.',
					},
				],
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
				prompts: [
					{ id: 'fv-aiti-1', q: 'What does *äiti* mean?', a: 'mother' },
					{ id: 'fv-aiti-2', q: "Finnish for 'mother'?", a: 'äiti' },
					{
						id: 'fv-aiti-3',
						q: 'Genitive (-n) of äiti?',
						a: 'äidin',
						note: 'KPT: t → d before a closing suffix, same pattern as katu → kadun.',
					},
				],
			},
			{
				id: 'fv-isa',
				term: 'isä',
				syntax: 'father',
				description: 'father.',
				prompts: [
					{ id: 'fv-isa-1', q: 'What does *isä* mean?', a: 'father' },
					{ id: 'fv-isa-2', q: "Finnish for 'father'?", a: 'isä' },
				],
			},
			{
				id: 'fv-veli',
				term: 'veli',
				syntax: 'brother',
				description: 'brother.',
				prompts: [
					{ id: 'fv-veli-1', q: 'What does *veli* mean?', a: 'brother' },
					{ id: 'fv-veli-2', q: "Finnish for 'brother'?", a: 'veli' },
				],
			},
			{
				id: 'fv-sisko',
				term: 'sisko',
				syntax: 'sister',
				description: 'sister (the everyday word; sisar is the more formal register).',
				prompts: [
					{ id: 'fv-sisko-1', q: 'What does *sisko* mean?', a: 'sister' },
					{ id: 'fv-sisko-2', q: "Finnish for 'sister'?", a: 'sisko' },
				],
			},
			{
				id: 'fv-poika',
				term: 'poika',
				syntax: 'son / boy',
				description: 'son, or boy more generally.',
				prompts: [
					{ id: 'fv-poika-1', q: 'What does *poika* mean?', a: 'son / boy' },
					{ id: 'fv-poika-2', q: "Finnish for 'son' or 'boy'?", a: 'poika' },
				],
			},
			{
				id: 'fv-tytar',
				term: 'tytär',
				syntax: 'daughter',
				description: "daughter (distinct from tyttö, 'girl').",
				prompts: [
					{ id: 'fv-tytar-1', q: 'What does *tytär* mean?', a: 'daughter' },
					{ id: 'fv-tytar-2', q: "Finnish for 'daughter'?", a: 'tytär' },
				],
			},
			{
				id: 'fv-vaimo',
				term: 'vaimo',
				syntax: 'wife',
				description: 'wife.',
				prompts: [
					{ id: 'fv-vaimo-1', q: 'What does *vaimo* mean?', a: 'wife' },
					{ id: 'fv-vaimo-2', q: "Finnish for 'wife'?", a: 'vaimo' },
				],
			},
			{
				id: 'fv-perhe',
				term: 'perhe',
				syntax: 'family',
				description: 'family, as a household unit.',
				prompts: [
					{ id: 'fv-perhe-1', q: 'What does *perhe* mean?', a: 'family' },
					{ id: 'fv-perhe-2', q: "Finnish for 'family'?", a: 'perhe' },
				],
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
				prompts: [
					{ id: 'fv-ruoka-1', q: 'What does *ruoka* mean?', a: 'food' },
					{ id: 'fv-ruoka-2', q: "Finnish for 'food'?", a: 'ruoka' },
				],
			},
			{
				id: 'fv-liha',
				term: 'liha',
				syntax: 'meat',
				description: 'meat.',
				prompts: [
					{ id: 'fv-liha-1', q: 'What does *liha* mean?', a: 'meat' },
					{ id: 'fv-liha-2', q: "Finnish for 'meat'?", a: 'liha' },
				],
			},
			{
				id: 'fv-kala',
				term: 'kala',
				syntax: 'fish',
				description: 'fish.',
				prompts: [
					{ id: 'fv-kala-1', q: 'What does *kala* mean?', a: 'fish' },
					{ id: 'fv-kala-2', q: "Finnish for 'fish'?", a: 'kala' },
				],
			},
			{
				id: 'fv-omena',
				term: 'omena',
				syntax: 'apple',
				description: 'apple.',
				prompts: [
					{ id: 'fv-omena-1', q: 'What does *omena* mean?', a: 'apple' },
					{ id: 'fv-omena-2', q: "Finnish for 'apple'?", a: 'omena' },
				],
			},
			{
				id: 'fv-keitto',
				term: 'keitto',
				syntax: 'soup',
				description: 'soup.',
				example: 'keiton',
				exampleNote: 'genitive — tt weakens to t, same pattern as tyttö → tytön.',
				prompts: [
					{ id: 'fv-keitto-1', q: 'What does *keitto* mean?', a: 'soup' },
					{ id: 'fv-keitto-2', q: "Finnish for 'soup'?", a: 'keitto' },
					{
						id: 'fv-keitto-3',
						q: 'Genitive (-n) of keitto?',
						a: 'keiton',
						note: 'KPT: tt → t before a closing suffix, same pattern as tyttö → tytön.',
					},
				],
			},
			{
				id: 'fv-tee',
				term: 'tee',
				syntax: 'tea',
				description: 'tea, the drink.',
				prompts: [
					{ id: 'fv-tee-1', q: 'What does *tee* mean?', a: 'tea' },
					{ id: 'fv-tee-2', q: "Finnish for 'tea'?", a: 'tee' },
				],
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
				prompts: [
					{ id: 'fv-tanaan-1', q: 'What does *tänään* mean?', a: 'today' },
					{ id: 'fv-tanaan-2', q: "Finnish for 'today'?", a: 'tänään' },
				],
			},
			{
				id: 'fv-huomenna',
				term: 'huomenna',
				syntax: 'tomorrow',
				description: 'tomorrow — used with the plain present tense, since Finnish has no future tense.',
				prompts: [
					{ id: 'fv-huomenna-1', q: 'What does *huomenna* mean?', a: 'tomorrow' },
					{ id: 'fv-huomenna-2', q: "Finnish for 'tomorrow'?", a: 'huomenna' },
				],
			},
			{
				id: 'fv-eilen',
				term: 'eilen',
				syntax: 'yesterday',
				description: 'yesterday.',
				prompts: [
					{ id: 'fv-eilen-1', q: 'What does *eilen* mean?', a: 'yesterday' },
					{ id: 'fv-eilen-2', q: "Finnish for 'yesterday'?", a: 'eilen' },
				],
			},
			{
				id: 'fv-viikko',
				term: 'viikko',
				syntax: 'week',
				description: 'week.',
				example: 'viikon',
				exampleNote: 'genitive — kk weakens to k, same pattern as kukka → kukan.',
				prompts: [
					{ id: 'fv-viikko-1', q: 'What does *viikko* mean?', a: 'week' },
					{ id: 'fv-viikko-2', q: "Finnish for 'week'?", a: 'viikko' },
					{
						id: 'fv-viikko-3',
						q: 'Genitive (-n) of viikko?',
						a: 'viikon',
						note: 'KPT: kk → k before a closing suffix, same pattern as kukka → kukan.',
					},
				],
			},
			{
				id: 'fv-paiva',
				term: 'päivä',
				syntax: 'day',
				description: 'day.',
				prompts: [
					{ id: 'fv-paiva-1', q: 'What does *päivä* mean?', a: 'day' },
					{ id: 'fv-paiva-2', q: "Finnish for 'day'?", a: 'päivä' },
				],
			},
			{
				id: 'fv-ilta',
				term: 'ilta',
				syntax: 'evening',
				description: 'evening.',
				example: 'illan',
				exampleNote: 'genitive — lt assimilates to ll, same word finnish.ts uses for the b-assim pattern.',
				prompts: [
					{ id: 'fv-ilta-1', q: 'What does *ilta* mean?', a: 'evening' },
					{ id: 'fv-ilta-2', q: "Finnish for 'evening'?", a: 'ilta' },
					{
						id: 'fv-ilta-3',
						q: 'Genitive (-n) of ilta?',
						a: 'illan',
						note: 'Assimilation: lt → ll before a closing suffix.',
					},
				],
			},
			{
				id: 'fv-tunti',
				term: 'tunti',
				syntax: 'hour',
				description: 'hour.',
				example: 'tunnin',
				exampleNote: 'genitive — nt assimilates to nn, same pattern as ranta → rannan.',
				prompts: [
					{ id: 'fv-tunti-1', q: 'What does *tunti* mean?', a: 'hour' },
					{ id: 'fv-tunti-2', q: "Finnish for 'hour'?", a: 'tunti' },
					{
						id: 'fv-tunti-3',
						q: 'Genitive (-n) of tunti?',
						a: 'tunnin',
						note: 'Assimilation: nt → nn before a closing suffix, same pattern as ranta → rannan.',
					},
				],
			},
			{
				id: 'fv-minuutti',
				term: 'minuutti',
				syntax: 'minute',
				description: 'minute.',
				example: 'minuutin',
				exampleNote: 'genitive — tt weakens to t, same pattern as tyttö → tytön.',
				prompts: [
					{ id: 'fv-minuutti-1', q: 'What does *minuutti* mean?', a: 'minute' },
					{ id: 'fv-minuutti-2', q: "Finnish for 'minute'?", a: 'minuutti' },
					{
						id: 'fv-minuutti-3',
						q: 'Genitive (-n) of minuutti?',
						a: 'minuutin',
						note: 'KPT: tt → t before a closing suffix, same pattern as tyttö → tytön.',
					},
				],
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
				prompts: [
					{ id: 'fv-kuka-1', q: 'What does *kuka* mean?', a: 'who' },
					{ id: 'fv-kuka-2', q: "Finnish for 'who'?", a: 'kuka' },
				],
			},
			{
				id: 'fv-mika',
				term: 'mikä',
				syntax: 'what / which',
				description: 'what, which — asks about a thing.',
				prompts: [
					{ id: 'fv-mika-1', q: 'What does *mikä* mean?', a: 'what / which' },
					{ id: 'fv-mika-2', q: "Finnish for 'what' or 'which'?", a: 'mikä' },
				],
			},
			{
				id: 'fv-missa',
				term: 'missä',
				syntax: 'where',
				description: 'where — asks about a location.',
				prompts: [
					{ id: 'fv-missa-1', q: 'What does *missä* mean?', a: 'where' },
					{ id: 'fv-missa-2', q: "Finnish for 'where'?", a: 'missä' },
				],
			},
			{
				id: 'fv-milloin',
				term: 'milloin',
				syntax: 'when',
				description: 'when.',
				prompts: [
					{ id: 'fv-milloin-1', q: 'What does *milloin* mean?', a: 'when' },
					{ id: 'fv-milloin-2', q: "Finnish for 'when'?", a: 'milloin' },
				],
			},
			{
				id: 'fv-miksi',
				term: 'miksi',
				syntax: 'why',
				description: 'why.',
				prompts: [
					{ id: 'fv-miksi-1', q: 'What does *miksi* mean?', a: 'why' },
					{ id: 'fv-miksi-2', q: "Finnish for 'why'?", a: 'miksi' },
				],
			},
			{
				id: 'fv-miten',
				term: 'miten',
				syntax: 'how',
				description: 'how.',
				prompts: [
					{ id: 'fv-miten-1', q: 'What does *miten* mean?', a: 'how' },
					{ id: 'fv-miten-2', q: "Finnish for 'how'?", a: 'miten' },
				],
			},
			{
				id: 'fv-mina',
				term: 'minä',
				syntax: 'I',
				description: 'I — first-person singular pronoun (optional in speech, since the verb ending already carries it).',
				prompts: [
					{ id: 'fv-mina-1', q: 'What does *minä* mean?', a: 'I' },
					{ id: 'fv-mina-2', q: "Finnish for 'I'?", a: 'minä' },
				],
			},
			{
				id: 'fv-sina',
				term: 'sinä',
				syntax: 'you (singular)',
				description: 'you — second-person singular pronoun.',
				prompts: [
					{ id: 'fv-sina-1', q: 'What does *sinä* mean?', a: 'you (singular)' },
					{ id: 'fv-sina-2', q: "Finnish for 'you' (one person)?", a: 'sinä' },
				],
			},
			{
				id: 'fv-han',
				term: 'hän',
				syntax: 'he / she',
				description: 'he or she — one pronoun covers both, since Finnish has no grammatical gender.',
				prompts: [
					{ id: 'fv-han-1', q: 'What does *hän* mean?', a: 'he / she' },
					{ id: 'fv-han-2', q: "Finnish for 'he' or 'she'?", a: 'hän' },
				],
			},
			{
				id: 'fv-me',
				term: 'me',
				syntax: 'we',
				description: 'we — first-person plural pronoun.',
				prompts: [
					{ id: 'fv-me-1', q: 'What does *me* mean?', a: 'we' },
					{ id: 'fv-me-2', q: "Finnish for 'we'?", a: 'me' },
				],
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
				prompts: [
					{ id: 'fv-koti-1', q: 'What does *koti* mean?', a: 'home' },
					{ id: 'fv-koti-2', q: "Finnish for 'home'?", a: 'koti' },
					{
						id: 'fv-koti-3',
						q: 'Genitive (-n) of koti?',
						a: 'kodin',
						note: 'KPT: t → d before a closing suffix, same pattern as katu → kadun.',
					},
				],
			},
			{
				id: 'fv-koulu',
				term: 'koulu',
				syntax: 'school',
				description: 'school.',
				prompts: [
					{ id: 'fv-koulu-1', q: 'What does *koulu* mean?', a: 'school' },
					{ id: 'fv-koulu-2', q: "Finnish for 'school'?", a: 'koulu' },
				],
			},
			{
				id: 'fv-tyo',
				term: 'työ',
				syntax: 'work / job',
				description: 'work, job.',
				prompts: [
					{ id: 'fv-tyo-1', q: 'What does *työ* mean?', a: 'work / job' },
					{ id: 'fv-tyo-2', q: "Finnish for 'work' or 'job'?", a: 'työ' },
				],
			},
			{
				id: 'fv-kirjasto',
				term: 'kirjasto',
				syntax: 'library',
				description: 'library.',
				prompts: [
					{ id: 'fv-kirjasto-1', q: 'What does *kirjasto* mean?', a: 'library' },
					{ id: 'fv-kirjasto-2', q: "Finnish for 'library'?", a: 'kirjasto' },
				],
			},
			{
				id: 'fv-ravintola',
				term: 'ravintola',
				syntax: 'restaurant',
				description: 'restaurant.',
				prompts: [
					{ id: 'fv-ravintola-1', q: 'What does *ravintola* mean?', a: 'restaurant' },
					{ id: 'fv-ravintola-2', q: "Finnish for 'restaurant'?", a: 'ravintola' },
				],
			},
			{
				id: 'fv-kirkko',
				term: 'kirkko',
				syntax: 'church',
				description: 'church.',
				example: 'kirkon',
				exampleNote: 'genitive — kk weakens to k, same pattern as kukka → kukan.',
				prompts: [
					{ id: 'fv-kirkko-1', q: 'What does *kirkko* mean?', a: 'church' },
					{ id: 'fv-kirkko-2', q: "Finnish for 'church'?", a: 'kirkko' },
					{
						id: 'fv-kirkko-3',
						q: 'Genitive (-n) of kirkko?',
						a: 'kirkon',
						note: 'KPT: kk → k before a closing suffix, same pattern as kukka → kukan.',
					},
				],
			},
			{
				id: 'fv-kaupunki',
				term: 'kaupunki',
				syntax: 'city',
				description: 'city.',
				example: 'kaupungin',
				exampleNote: 'genitive — nk weakens to ng, same pattern as Helsinki → Helsingin.',
				prompts: [
					{ id: 'fv-kaupunki-1', q: 'What does *kaupunki* mean?', a: 'city' },
					{ id: 'fv-kaupunki-2', q: "Finnish for 'city'?", a: 'kaupunki' },
					{
						id: 'fv-kaupunki-3',
						q: 'Genitive (-n) of kaupunki?',
						a: 'kaupungin',
						note: 'KPT: nk → ng before a closing suffix, same pattern as Helsinki → Helsingin.',
					},
				],
			},
			{
				id: 'fv-kyla',
				term: 'kylä',
				syntax: 'village',
				description: 'village.',
				prompts: [
					{ id: 'fv-kyla-1', q: 'What does *kylä* mean?', a: 'village' },
					{ id: 'fv-kyla-2', q: "Finnish for 'village'?", a: 'kylä' },
				],
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
				prompts: [
					{ id: 'fv-nopea-1', q: 'What does *nopea* mean?', a: 'fast' },
					{ id: 'fv-nopea-2', q: "Finnish for 'fast'?", a: 'nopea' },
				],
			},
			{
				id: 'fv-hidas',
				term: 'hidas',
				syntax: 'slow',
				description: 'slow.',
				prompts: [
					{ id: 'fv-hidas-1', q: 'What does *hidas* mean?', a: 'slow' },
					{ id: 'fv-hidas-2', q: "Finnish for 'slow'?", a: 'hidas' },
				],
			},
			{
				id: 'fv-vanha',
				term: 'vanha',
				syntax: 'old',
				description: 'old.',
				prompts: [
					{ id: 'fv-vanha-1', q: 'What does *vanha* mean?', a: 'old' },
					{ id: 'fv-vanha-2', q: "Finnish for 'old'?", a: 'vanha' },
				],
			},
			{
				id: 'fv-uusi',
				term: 'uusi',
				syntax: 'new',
				description: 'new.',
				prompts: [
					{ id: 'fv-uusi-1', q: 'What does *uusi* mean?', a: 'new' },
					{ id: 'fv-uusi-2', q: "Finnish for 'new'?", a: 'uusi' },
				],
			},
			{
				id: 'fv-kylma',
				term: 'kylmä',
				syntax: 'cold',
				description: 'cold.',
				prompts: [
					{ id: 'fv-kylma-1', q: 'What does *kylmä* mean?', a: 'cold' },
					{ id: 'fv-kylma-2', q: "Finnish for 'cold'?", a: 'kylmä' },
				],
			},
			{
				id: 'fv-kuuma',
				term: 'kuuma',
				syntax: 'hot',
				description: 'hot.',
				prompts: [
					{ id: 'fv-kuuma-1', q: 'What does *kuuma* mean?', a: 'hot' },
					{ id: 'fv-kuuma-2', q: "Finnish for 'hot'?", a: 'kuuma' },
				],
			},
			{
				id: 'fv-pitka',
				term: 'pitkä',
				syntax: 'long / tall',
				description: 'long, or tall for a person.',
				prompts: [
					{ id: 'fv-pitka-1', q: 'What does *pitkä* mean?', a: 'long / tall' },
					{ id: 'fv-pitka-2', q: "Finnish for 'long' or 'tall'?", a: 'pitkä' },
				],
			},
			{
				id: 'fv-helppo',
				term: 'helppo',
				syntax: 'easy',
				description: 'easy.',
				example: 'helpon',
				exampleNote: 'genitive — pp weakens to p, same pattern as kauppa → kaupan.',
				prompts: [
					{ id: 'fv-helppo-1', q: 'What does *helppo* mean?', a: 'easy' },
					{ id: 'fv-helppo-2', q: "Finnish for 'easy'?", a: 'helppo' },
					{
						id: 'fv-helppo-3',
						q: 'Genitive (-n) of helppo?',
						a: 'helpon',
						note: 'KPT: pp → p before a closing suffix, same pattern as kauppa → kaupan.',
					},
				],
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
