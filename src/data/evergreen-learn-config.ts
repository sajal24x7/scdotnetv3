// LearnSystemConfig for /learn/evergreen — the deck generated from ```learn
// blocks inside evergreen notes (scripts/extract-learn-blocks.mjs).
// Conceptual prose, not commands: answers render in the body font
// (monoAnswers: false), and intake is gentler than the technical decks —
// the pool is small and grows slowly, and idea prompts deserve more
// chewing time than command recall.

import decks from './learn-decks.generated.json';
import type { LearnDataset, LearnSystemConfig } from '../components/learn/types';

export const evergreenLearnConfig: LearnSystemConfig = {
	storageKey: 'evergreen-learn-srs',
	newPerDay: 1,
	dueCap: 6,
	itemNoun: 'idea',
	monoAnswers: false,
	dataset: decks.evergreen as LearnDataset,
};
