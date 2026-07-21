// LearnSystemConfig for /learn/finnish. See planning/finnish-learning-system.md
// §1 "Tuning constants for Finnish" for why these differ from the Linux deck:
// language decks tolerate faster intake (more new items/day, a bigger due cap).

import { categories, introductionOrder } from './finnish';
import type { LearnSystemConfig } from '../components/learn/types';

export const finnishLearnConfig: LearnSystemConfig = {
	storageKey: 'finnish-learn-srs',
	newPerDay: 3,
	dueCap: 12,
	itemNoun: 'word or rule',
	monoAnswers: false,
	dataset: { categories, introductionOrder },
};
