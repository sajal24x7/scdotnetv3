// Tuning constants for the people deck (local-first, plan §5.2/Phase 4).
// Unlike every other deck, there is no `*-learn-config.ts` with a build-time
// `dataset` here — people-note content never enters this repo or the site
// build (§5.1's privacy constraint), so the dataset only exists per-browser,
// loaded from IndexedDB at runtime (src/components/learn/peopleDeckStore.ts).
// This module just holds the numbers that both src/data/practice-registry.ts
// (the static registry entry) and src/components/learn/PeopleLearnPage.tsx
// (the live LearnSystemConfig) need to share, so they can't drift.

export const PEOPLE_STORAGE_KEY = 'people-learn-srs';
export const PEOPLE_ITEM_NOUN = 'person';
export const PEOPLE_NEW_PER_DAY = 2;
export const PEOPLE_DUE_CAP = 8;
export const PEOPLE_MONO_ANSWERS = false;
