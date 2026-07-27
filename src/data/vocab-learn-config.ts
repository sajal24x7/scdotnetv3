// LearnSystemConfig for /learn/vocabulary — English words fed daily by
// scripts/fetch-wotd.mjs into src/data/vocab.generated.json (plan §4). That
// file is word-keyed, raw (word/pos/gloss/href/source/fetchedAt); the actual
// categories-by-part-of-speech + prompts transform lives in
// vocab-dataset.ts (split out so scripts/validate-learn-data.mjs can load
// just the pure transform, without this file's JSON import). Same "adapt at
// the config boundary" pattern linux-learn-config.ts uses for
// linux-commands.ts's pre-shared-types shape.

import words from './vocab.generated.json';
import { buildDataset, type RawWord } from './vocab-dataset';
import { withAuthored } from './authored-prompts';
import type { LearnSystemConfig } from '../components/learn/types';

export const vocabLearnConfig: LearnSystemConfig = {
	storageKey: 'vocab-learn-srs',
	newPerDay: 1,
	dueCap: 6,
	itemNoun: 'word',
	monoAnswers: false,
	authorPrompts: true,
	dataset: withAuthored(buildDataset((words as { words: Record<string, RawWord> }).words)),
};
