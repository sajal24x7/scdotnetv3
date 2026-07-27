// Build-time boundary for authored prompts: the one place that imports
// src/data/authored-prompts.json and folds it into a deck's dataset.
//
// Same "adapt at the config boundary" pattern vocab-learn-config.ts uses for
// vocab.generated.json — the merge logic itself lives in the import-free
// src/components/learn/authoredPrompts.ts, so it can also run in the browser
// (overlaying prompts written since the last build) and under plain Node
// (scripts/validate-learn-data.mjs).
//
// Every authored-prompt deck's config wraps its dataset in `withAuthored`, so
// the registry's counts, /api/practice/<deck>.json, and each /learn/<topic>
// page all see the same prompts without knowing this file exists.

import raw from './authored-prompts.json';
import { applyAuthoredPrompts, type AuthoredStore } from '../components/learn/authoredPrompts';
import type { LearnDataset } from '../components/learn/types';

export const builtAuthoredPrompts = raw as AuthoredStore;

export function withAuthored(dataset: LearnDataset): LearnDataset {
	return applyAuthoredPrompts(dataset, builtAuthoredPrompts);
}
