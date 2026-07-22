// LearnSystemConfig for /learn/finnish-vocab. Plan §Phase 6: its own tuning
// rather than growing the rules deck's constants — a flat vocabulary feed
// tolerates a faster ramp than the main Finnish deck's dependency-curated
// introduction order, so both newPerDay and dueCap go slightly higher.

import { categories, introductionOrder } from './finnish-vocab';
import type { LearnSystemConfig } from '../components/learn/types';

export const finnishVocabLearnConfig: LearnSystemConfig = {
	storageKey: 'finnish-vocab-learn-srs',
	newPerDay: 3,
	dueCap: 14,
	itemNoun: 'word',
	monoAnswers: false,
	dataset: { categories, introductionOrder },
};
