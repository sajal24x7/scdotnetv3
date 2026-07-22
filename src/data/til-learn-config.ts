// LearnSystemConfig for /learn/til — the deck generated from ```learn blocks
// inside published TIL notes (scripts/extract-learn-blocks.mjs). Dense
// technical material, so intake matches the Linux deck rather than Finnish:
// 2 new notes/day, 8 reviews/day.

import decks from './learn-decks.generated.json';
import type { LearnDataset, LearnSystemConfig } from '../components/learn/types';

export const tilLearnConfig: LearnSystemConfig = {
	storageKey: 'til-learn-srs',
	newPerDay: 2,
	dueCap: 8,
	itemNoun: 'note',
	monoAnswers: true,
	dataset: decks.til as LearnDataset,
};
