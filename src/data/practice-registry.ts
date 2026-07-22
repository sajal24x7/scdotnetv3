// Build-time registry of every practice deck (unified-practice plan §2.1).
//
// Server-only: this module imports each system's full *-learn-config.ts,
// which in turn pulls in the full content pool (linux-commands.ts alone is
// 1000+ lines). That's fine in Astro frontmatter (build time), but this
// module must never be imported from a client:load island — the derived,
// dataset-free array below is what islands receive as a prop instead (see
// src/pages/learn/index.astro and src/pages/practice.astro).
//
// Each public deck's actual dataset is served separately, lazily, from
// src/pages/api/practice/[deck].json.ts — the registry only carries counts.

import type { LearnSystemConfig } from '../components/learn/types';
import { linuxLearnConfig } from './linux-learn-config';
import { finnishLearnConfig } from './finnish-learn-config';
import { tilLearnConfig } from './til-learn-config';
import { evergreenLearnConfig } from './evergreen-learn-config';
import { vocabLearnConfig } from './vocab-learn-config';
import {
	PEOPLE_DUE_CAP,
	PEOPLE_ITEM_NOUN,
	PEOPLE_MONO_ANSWERS,
	PEOPLE_NEW_PER_DAY,
	PEOPLE_STORAGE_KEY,
} from './people-learn-config';

export interface PracticeDeck {
	id: string;
	title: string;
	emoji: string;
	blurb: string;
	itemNoun: string;
	monoAnswers: boolean;
	newPerDay: number;
	dueCap: number;
	storageKey: string;
	legacyKey?: string;
	totalItems: number;
	totalPrompts: number;
	source: { kind: 'json'; href: string } | { kind: 'local' };
	// Link back to the deck's wall-chart page; omitted for practice-only decks.
	learnHref?: string;
}

function summarize(
	id: string,
	config: LearnSystemConfig,
	extra: Pick<PracticeDeck, 'title' | 'emoji' | 'blurb' | 'source'> & Partial<Pick<PracticeDeck, 'learnHref'>>,
): PracticeDeck {
	const items = config.dataset.categories.flatMap((c) => c.items);
	return {
		id,
		itemNoun: config.itemNoun,
		monoAnswers: config.monoAnswers,
		newPerDay: config.newPerDay,
		dueCap: config.dueCap,
		storageKey: config.storageKey,
		legacyKey: config.legacyKey,
		totalItems: items.length,
		totalPrompts: items.reduce((n, item) => n + item.prompts.length, 0),
		...extra,
	};
}

export const practiceRegistry: PracticeDeck[] = [
	summarize('linux', linuxLearnConfig, {
		title: 'Linux',
		emoji: '🐧',
		blurb: 'Sysadmin commands — storage, logs, processes, networking — as a periodic table on the wall.',
		learnHref: '/learn/linux/',
		source: { kind: 'json', href: '/api/practice/linux.json' },
	}),
	summarize('finnish', finnishLearnConfig, {
		title: 'Finnish',
		emoji: '🇫🇮',
		blurb: 'Finnish as a rule system: vocabulary, vowel harmony, gradation, and cases.',
		learnHref: '/learn/finnish/',
		source: { kind: 'json', href: '/api/practice/finnish.json' },
	}),
	summarize('til', tilLearnConfig, {
		title: 'TIL',
		emoji: '📝',
		blurb: 'My own TIL notes, distilled into recall prompts — the notes are the curriculum.',
		learnHref: '/learn/til/',
		source: { kind: 'json', href: '/api/practice/til.json' },
	}),
	summarize('evergreen', evergreenLearnConfig, {
		title: 'Evergreen',
		emoji: '🌱',
		blurb: 'Spaced re-encounter with my evergreen ideas: claims, mechanisms, examples.',
		learnHref: '/learn/evergreen/',
		source: { kind: 'json', href: '/api/practice/evergreen.json' },
	}),
	summarize('vocab', vocabLearnConfig, {
		title: 'Vocabulary',
		emoji: '📖',
		blurb: 'English words, one a day from Wiktionary — meaning and recall, both directions.',
		learnHref: '/learn/vocabulary/',
		source: { kind: 'json', href: '/api/practice/vocab.json' },
	}),
	// No *-learn-config.ts / dataset for this one — people-note content never
	// enters this repo or the site build (plan §5.1/§5.2), so there's nothing
	// to summarize() at build time. totalItems/totalPrompts stay 0 here; the
	// real counts only exist per-device, in IndexedDB (see
	// src/components/learn/peopleDeckStore.ts and PracticeSession's
	// local-dataset loading, which is what actually drives due/new counts and
	// the unified queue for this deck).
	{
		id: 'people',
		title: 'People',
		emoji: '🧑‍🤝‍🧑',
		blurb: 'Private — names and faces for people I actually know. Imported per device, never stored on any server; the counts here don’t reflect what’s loaded locally.',
		itemNoun: PEOPLE_ITEM_NOUN,
		monoAnswers: PEOPLE_MONO_ANSWERS,
		newPerDay: PEOPLE_NEW_PER_DAY,
		dueCap: PEOPLE_DUE_CAP,
		storageKey: PEOPLE_STORAGE_KEY,
		totalItems: 0,
		totalPrompts: 0,
		source: { kind: 'local' },
		learnHref: '/learn/people/',
	},
];
