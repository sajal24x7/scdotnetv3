// Pure transform from the raw, word-keyed vocab.generated.json shape into a
// LearnDataset (categories-by-part-of-speech + introductionOrder). Split out
// from vocab-learn-config.ts (which does the JSON import) so this module has
// no imports beyond types — scripts/validate-learn-data.mjs loads it
// directly under plain Node, which can't resolve a bare `.json` import
// without import-attribute syntax the way Vite/Astro's bundler can.

import type { Category, LearnDataset, LearnItem } from '../components/learn/types';

export interface RawWord {
	word: string;
	pos: string;
	gloss: string;
	href: string;
	source: string;
	fetchedAt: string;
}

export const POS_META: Record<string, { title: string; emoji: string }> = {
	noun: { title: 'Nouns', emoji: '🧩' },
	'proper-noun': { title: 'Proper nouns', emoji: '🏷️' },
	verb: { title: 'Verbs', emoji: '🏃' },
	adjective: { title: 'Adjectives', emoji: '🎨' },
	adverb: { title: 'Adverbs', emoji: '🌀' },
	interjection: { title: 'Interjections', emoji: '❗' },
	pronoun: { title: 'Pronouns', emoji: '👤' },
	preposition: { title: 'Prepositions', emoji: '📍' },
	conjunction: { title: 'Conjunctions', emoji: '🔗' },
	determiner: { title: 'Determiners', emoji: '👉' },
	numeral: { title: 'Numerals', emoji: '🔢' },
	article: { title: 'Articles', emoji: '📰' },
	other: { title: 'Other', emoji: '✨' },
};

export function buildDataset(raw: Record<string, RawWord>): LearnDataset {
	const byPos = new Map<string, LearnItem[]>();
	const entries: { id: string; fetchedAt: string; word: string }[] = [];

	for (const [key, entry] of Object.entries(raw)) {
		const id = `vocab-${key}`;
		const item: LearnItem = {
			id,
			term: entry.word,
			description: entry.gloss,
			href: entry.href,
			prompts: [
				{ id: `${id}-p1`, q: `What does *${entry.word}* mean?`, a: entry.gloss },
				{ id: `${id}-p2`, q: `Which word means: ${entry.gloss}`, a: entry.word },
			],
		};
		const pos = POS_META[entry.pos] ? entry.pos : 'other';
		if (!byPos.has(pos)) byPos.set(pos, []);
		byPos.get(pos)!.push(item);
		entries.push({ id, fetchedAt: entry.fetchedAt, word: entry.word });
	}

	const categories: Category[] = [...byPos.entries()]
		.sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]))
		.map(([pos, items]) => ({
			id: pos,
			title: POS_META[pos].title,
			emoji: POS_META[pos].emoji,
			description: '',
			items,
		}));

	// Newest word first: today's Word of the Day is the next new item
	// introduced, so the practice rep lands close to the day you saw it —
	// same reasoning as til/evergreen's introduction order.
	const introductionOrder = entries
		.sort((a, b) => b.fetchedAt.localeCompare(a.fetchedAt) || a.word.localeCompare(b.word))
		.map((e) => e.id);

	return { categories, introductionOrder };
}
