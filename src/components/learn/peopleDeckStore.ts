// IndexedDB-backed storage for the people deck's *content* (categories,
// items, photos-as-data-URIs) — see planning/practice-system-unified-srs.md
// §5.2. Deck content is too big for localStorage's ~5MB budget once photos
// are embedded, and it never needs to sync anywhere (it never leaves the
// device it was imported on), so it lives in IndexedDB rather than
// alongside the SRS state (which stays in localStorage under
// PEOPLE_STORAGE_KEY, keyed by prompt id, same as every other deck).
//
// One object store, one record, keyed 'current' — a re-import replaces it
// wholesale (§5.2 step 4: "deck content updates freely"); the caller is
// responsible for pruning orphaned SRS state against the new item/prompt
// ids (see pruneOrphanedState below).

import type { LearnDataset } from './types';
import { loadState, saveState, type SrsState } from './engine';
import { PEOPLE_STORAGE_KEY } from '../../data/people-learn-config';

const DB_NAME = 'people-deck-db';
const DB_VERSION = 1;
const STORE_NAME = 'deck';
const RECORD_KEY = 'current';

function openDb(): Promise<IDBDatabase> {
	return new Promise((resolve, reject) => {
		const req = indexedDB.open(DB_NAME, DB_VERSION);
		req.onupgradeneeded = () => {
			if (!req.result.objectStoreNames.contains(STORE_NAME)) {
				req.result.createObjectStore(STORE_NAME);
			}
		};
		req.onsuccess = () => resolve(req.result);
		req.onerror = () => reject(req.error);
	});
}

export async function loadPeopleDeck(): Promise<LearnDataset | null> {
	if (typeof indexedDB === 'undefined') return null;
	try {
		const db = await openDb();
		return await new Promise((resolve, reject) => {
			const tx = db.transaction(STORE_NAME, 'readonly');
			const req = tx.objectStore(STORE_NAME).get(RECORD_KEY);
			req.onsuccess = () => resolve((req.result as LearnDataset | undefined) ?? null);
			req.onerror = () => reject(req.error);
		});
	} catch {
		return null;
	}
}

async function writePeopleDeck(dataset: LearnDataset): Promise<void> {
	const db = await openDb();
	await new Promise<void>((resolve, reject) => {
		const tx = db.transaction(STORE_NAME, 'readwrite');
		tx.objectStore(STORE_NAME).put(dataset, RECORD_KEY);
		tx.oncomplete = () => resolve();
		tx.onerror = () => reject(tx.error);
	});
}

// Re-importing a deck can drop items (a person note deleted from the vault)
// or renumber prompts; §5.2 step 4 calls for pruning the now-orphaned SRS
// state rather than leaving it to accumulate as dead entries forever.
function pruneOrphanedState(state: SrsState, dataset: LearnDataset): SrsState {
	const validItemIds = new Set<string>();
	const validPromptIds = new Set<string>();
	for (const category of dataset.categories) {
		for (const item of category.items) {
			validItemIds.add(item.id);
			for (const prompt of item.prompts ?? []) validPromptIds.add(prompt.id);
		}
	}
	const cards = Object.fromEntries(Object.entries(state.cards).filter(([id]) => validPromptIds.has(id)));
	const introduced = Object.fromEntries(Object.entries(state.introduced).filter(([id]) => validItemIds.has(id)));
	return { ...state, cards, introduced };
}

// Loads a freshly-parsed people-deck.json into IndexedDB, replacing whatever
// was there, and prunes the people deck's SRS state against the new item set.
export async function importPeopleDeck(dataset: LearnDataset): Promise<void> {
	await writePeopleDeck(dataset);
	const state = loadState(PEOPLE_STORAGE_KEY);
	saveState(PEOPLE_STORAGE_KEY, pruneOrphanedState(state, dataset));
}
