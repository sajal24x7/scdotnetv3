// Authored prompts: the store, the merge rules, and the dataset overlay for
// decks whose config sets `authorPrompts` (linux, finnish, finnish-vocab,
// vocab). See docs/architecture/learning-systems.md § "Authored prompts".
//
// Those decks ship items as reference cards with no prompts. The prompts that
// test a concept are written by hand in the composer when the concept is
// introduced, and committed to src/data/authored-prompts.json in the repo via
// functions/api/practice-prompts.js — content in git, like every other
// content pool, rather than state in KV.
//
// Committing means a rebuild before the prompts are baked into the datasets
// at /api/practice/<deck>.json, so this module keeps a localStorage cache of
// what this device has written and overlays it on top of whatever the build
// shipped. The cache is a cache, not a second source of truth: the merge is
// last-write-wins per item on `updatedAt`, which is deterministic and
// idempotent in either direction, exactly like engine.ts's SRS merge.
//
// Writes are batched per session, not per concept: authoring a card stages it
// (stageAuthored — cache plus a pending queue, no network), and the end of the
// learn session flushes the whole queue in one POST, which is one commit. A
// twelve-concept morning used to be twelve commits and twelve rebuilds; now
// it's one. The queue is durable, so a session ended by closing the tab, going
// offline, or a failed commit leaves the prompts staged and the next flush
// picks them up.
//
// Nothing here touches React, and every browser-only call guards on `window`,
// so the pure parts (applyAuthoredPrompts, mergeAuthored, promptIdFor) can be
// used at build time too — src/data/authored-prompts.ts does exactly that.

import type { LearnDataset, LearnItem, Prompt } from './types';

export interface AuthoredEntry {
	prompts: Prompt[];
	updatedAt: string; // ISO timestamp — the merge tiebreaker
}

export interface AuthoredStore {
	version: 1;
	items: Record<string, AuthoredEntry>; // keyed by LearnItem id
}

export const AUTHORED_CACHE_KEY = 'practice-authored-prompts';
// Staged-but-uncommitted entries, drained by flushAuthored. Separate from the
// cache above because the cache is "what this device knows" (including what
// the repo already has) while this is strictly "what the repo hasn't seen yet".
export const AUTHORED_PENDING_KEY = 'practice-authored-pending';

export function emptyAuthoredStore(): AuthoredStore {
	return { version: 1, items: {} };
}

// --- Pure merge + overlay ---

// Per item id, the later `updatedAt` wins. Whole entries move together: an
// item's prompts are edited as a set in the composer, so merging them
// prompt-by-prompt would resurrect prompts that were deliberately deleted.
export function mergeAuthored(a: AuthoredStore, b: AuthoredStore): AuthoredStore {
	const items: Record<string, AuthoredEntry> = { ...a.items };
	for (const [id, entry] of Object.entries(b.items)) {
		const existing = items[id];
		if (!existing || entry.updatedAt > existing.updatedAt) items[id] = entry;
	}
	return { version: 1, items };
}

export function applyAuthoredPrompts(dataset: LearnDataset, store: AuthoredStore): LearnDataset {
	if (Object.keys(store.items).length === 0) return dataset;
	return {
		introductionOrder: dataset.introductionOrder,
		categories: dataset.categories.map((category) => ({
			...category,
			items: category.items.map((item): LearnItem => {
				const entry = store.items[item.id];
				return entry ? { ...item, prompts: entry.prompts } : item;
			}),
		})),
	};
}

// Prompt ids key the learner's FSRS state, so they must be stable and never
// reused. Ids are `<itemId>-a<n>`; `n` is one past the highest `-a<n>` this
// item has ever carried, so deleting a prompt and adding another gives the
// new one a fresh id rather than inheriting the deleted one's review history.
// The `a` marks it authored, keeping it clear of the `-p<n>` ids the
// note-backed decks generate positionally.
export function promptIdFor(itemId: string, existing: Prompt[]): string {
	let highest = 0;
	for (const prompt of existing) {
		const match = new RegExp(`^${escapeRegExp(itemId)}-a(\\d+)$`).exec(prompt.id);
		if (match) highest = Math.max(highest, Number(match[1]));
	}
	return `${itemId}-a${highest + 1}`;
}

function escapeRegExp(str: string): string {
	return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// --- Prompt validation (the composer's gate) ---
//
// Mirrors scripts/validate-learn-data.mjs so a prompt typed in the browser
// can't fail the build that publishes it. Same rules as the "Writing prompts"
// section of the architecture doc: short answers, no true/false, cloze markers
// present iff the prompt is a cloze.

export const MAX_ANSWER_WORDS = 8;
const BANNED_QUESTION_RE = /^\s*(true or false|yes or no)\b/i;

export function promptIssue(prompt: { q: string; a: string; kind?: 'cloze' }): string | null {
	const q = prompt.q.trim();
	const a = prompt.a.trim();
	if (!q) return 'Add a question.';
	if (!a) return 'Add an answer.';
	const answerWords = a.split(/\s+/).filter(Boolean).length;
	if (answerWords > MAX_ANSWER_WORDS) {
		return `Answers stay 1–2 words (max ${MAX_ANSWER_WORDS}) — put the explanation in the note.`;
	}
	if (BANNED_QUESTION_RE.test(q)) return 'True/false questions aren’t effortful — ask for recall instead.';
	const hasMarkers = /\{\{.+?\}\}/.test(q);
	if (prompt.kind === 'cloze' && !hasMarkers) return 'Wrap the hidden span in {{…}} — that’s what gets blanked out.';
	if (prompt.kind !== 'cloze' && hasMarkers) return 'This has {{…}} markers — switch it to a cloze, or remove them.';
	return null;
}

// A cloze prompt's canonical answer is its hidden span(s), so the composer
// derives it rather than asking twice.
export function clozeAnswer(q: string): string {
	const matches = [...q.matchAll(/\{\{(.+?)\}\}/g)].map((m) => m[1].trim());
	return matches.join(' · ');
}

// --- localStorage cache ---

export function loadAuthoredCache(): AuthoredStore {
	if (typeof window === 'undefined') return emptyAuthoredStore();
	try {
		const raw = window.localStorage.getItem(AUTHORED_CACHE_KEY);
		if (raw) {
			const parsed = JSON.parse(raw);
			if (parsed && typeof parsed.items === 'object') return { version: 1, items: parsed.items };
		}
	} catch {
		// fall through to an empty cache — the build's copy still applies
	}
	return emptyAuthoredStore();
}

export function saveAuthoredCache(store: AuthoredStore) {
	if (typeof window === 'undefined') return;
	try {
		window.localStorage.setItem(AUTHORED_CACHE_KEY, JSON.stringify(store));
	} catch {
		// Cache write failed (private mode, quota). The prompts still committed
		// to the repo; this device just re-reads them from the build instead.
	}
}

// --- Pending queue (staged, not yet committed) ---

export function loadPendingAuthored(): Record<string, AuthoredEntry> {
	if (typeof window === 'undefined') return {};
	try {
		const raw = window.localStorage.getItem(AUTHORED_PENDING_KEY);
		if (raw) {
			const parsed = JSON.parse(raw);
			if (parsed && typeof parsed === 'object') return parsed as Record<string, AuthoredEntry>;
		}
	} catch {
		// Unreadable queue — treat as empty. The cache still holds the prompts,
		// so nothing the learner typed is lost from this device.
	}
	return {};
}

function savePendingAuthored(pending: Record<string, AuthoredEntry>) {
	if (typeof window === 'undefined') return;
	try {
		if (Object.keys(pending).length === 0) window.localStorage.removeItem(AUTHORED_PENDING_KEY);
		else window.localStorage.setItem(AUTHORED_PENDING_KEY, JSON.stringify(pending));
	} catch {
		// Nothing to do — a queue we can't persist just means this session's
		// flush is the only chance to commit, which is the old behaviour.
	}
}

// Drops the entries a successful flush covered, keeping anything staged since
// the POST went out (the learner can author while it's in flight).
function clearPendingAuthored(committed: Record<string, AuthoredEntry>) {
	const pending = loadPendingAuthored();
	for (const [id, entry] of Object.entries(committed)) {
		if (pending[id] && pending[id].updatedAt === entry.updatedAt) delete pending[id];
	}
	savePendingAuthored(pending);
}

// --- Server round-trips ---

export async function pullAuthored(token: string): Promise<AuthoredStore | null> {
	const res = await fetch('/api/practice-prompts', { headers: { authorization: `Bearer ${token}` } });
	if (!res.ok) throw new Error(`authored GET ${res.status}`);
	const { store } = await res.json();
	if (!store || typeof store.items !== 'object') return null;
	return { version: 1, items: store.items };
}

export async function pushAuthored(items: Record<string, AuthoredEntry>, token: string): Promise<void> {
	const res = await fetch('/api/practice-prompts', {
		method: 'POST',
		headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
		body: JSON.stringify({ items }),
	});
	if (!res.ok) {
		const detail = await res.json().catch(() => null);
		throw new Error(detail?.error ?? `authored POST ${res.status}`);
	}
}

// Stages an item's prompts: cache (so this device practices them today,
// without waiting for a rebuild) plus the pending queue. No network — the
// commit happens once, at the end of the session, in flushAuthored.
export function stageAuthored(itemId: string, prompts: Prompt[]): AuthoredStore {
	const entry: AuthoredEntry = { prompts, updatedAt: new Date().toISOString() };
	const store = mergeAuthored(loadAuthoredCache(), { version: 1, items: { [itemId]: entry } });
	saveAuthoredCache(store);
	savePendingAuthored({ ...loadPendingAuthored(), [itemId]: entry });
	return store;
}

// Commits everything staged in one POST — one commit per session, whatever it
// covers. A failed flush leaves the queue intact and reports the error; the
// caller surfaces it rather than pretending the prompts are safe. Callers can
// fire this on every session end: with nothing pending it's a no-op that
// touches neither the network nor the repo.
export async function flushAuthored(
	token: string | null,
): Promise<{ pending: number; committed: boolean; error?: string }> {
	const pending = loadPendingAuthored();
	const count = Object.keys(pending).length;
	if (count === 0) return { pending: 0, committed: true };

	if (!token) {
		return { pending: count, committed: false, error: 'Not connected — saved on this device only.' };
	}
	try {
		await pushAuthored(pending, token);
		clearPendingAuthored(pending);
		return { pending: count, committed: true };
	} catch (e) {
		return {
			pending: count,
			committed: false,
			error: e instanceof Error ? e.message : 'Could not save to the repo.',
		};
	}
}

// --- One-time migration of the pre-authoring prompts ---
//
// The four authored decks used to ship hand-written prompts; they were
// removed when authoring landed. Concepts already introduced still have FSRS
// cards keyed by those prompt ids, so dropping the prompts outright would
// orphan real review history. src/data/legacy-prompts.json is the frozen
// snapshot taken before the strip, served lazily at
// /api/practice/legacy-prompts.json (~96KB, only ever fetched when there's
// something to migrate).
//
// Rule: adopt the old prompts for an item only if it's already `introduced`
// on this device and has nothing authored yet. Ids carry over byte-identical,
// so every card keeps its stability, due date, and lapse count. Concepts not
// yet met stay unprompted — those are the ones you write yourself.

export interface LegacyStore {
	version: 1;
	items: Record<string, { deck: string; prompts: Prompt[] }>;
}

export function migrateLegacyPrompts(params: {
	legacy: LegacyStore;
	authored: AuthoredStore;
	// Item ids already introduced, across every authored-prompt deck.
	introducedItemIds: Set<string>;
}): Record<string, AuthoredEntry> {
	const { legacy, authored, introducedItemIds } = params;
	const adopted: Record<string, AuthoredEntry> = {};
	const updatedAt = new Date().toISOString();
	for (const itemId of introducedItemIds) {
		if (authored.items[itemId]) continue; // already has prompts, authored or migrated
		const entry = legacy.items[itemId];
		if (!entry || entry.prompts.length === 0) continue;
		adopted[itemId] = { prompts: entry.prompts, updatedAt };
	}
	return adopted;
}

export async function fetchLegacyPrompts(): Promise<LegacyStore | null> {
	try {
		const res = await fetch('/api/practice/legacy-prompts.json');
		if (!res.ok) return null;
		const store = await res.json();
		return store && typeof store.items === 'object' ? store : null;
	} catch {
		return null;
	}
}

// Every item id introduced on an authored-prompt deck, across the registry —
// the set the migration below asks "does this have prompts?" of. Decks that
// author their own prompts in the note (til, evergreen, people) are excluded:
// their prompts travel with the note and were never in the snapshot.
export function introducedItemIdsFor(
	decks: { id: string; authorPrompts: boolean }[],
	stateByDeck: Record<string, { introduced: Record<string, string> } | undefined>,
): Set<string> {
	const ids = new Set<string>();
	for (const deck of decks) {
		if (!deck.authorPrompts) continue;
		for (const itemId of Object.keys(stateByDeck[deck.id]?.introduced ?? {})) ids.add(itemId);
	}
	return ids;
}

// The whole load-side story in one call, shared by /learn/new and /practice:
// start from this device's cache, fold in the repo copy when connected, then
// adopt any legacy prompts still unaccounted for. Both entry points need all
// three — a device that only ever opens /practice would otherwise never
// migrate, and its pre-existing cards would resolve to no prompt at all and
// quietly drop out of the queue.
//
// Every step degrades on its own: no token means cache-only, a failed pull
// means the build's copy still applies, and a failed migration push leaves
// the prompts cached for the next save to retry.
export async function loadAuthoredForSession(params: {
	introducedItemIds: Set<string>;
	token: string | null;
}): Promise<AuthoredStore> {
	const { introducedItemIds, token } = params;
	let authored = loadAuthoredCache();

	if (token) {
		try {
			const remote = await pullAuthored(token);
			if (remote) {
				authored = mergeAuthored(authored, remote);
				saveAuthoredCache(authored);
			}
		} catch {
			// Fall back to the cache plus whatever the build shipped.
		}
	}

	const unaccounted = [...introducedItemIds].some((id) => !authored.items[id]);
	if (!unaccounted) return authored;

	const legacy = await fetchLegacyPrompts();
	if (!legacy) return authored;

	const adopted = migrateLegacyPrompts({ legacy, authored, introducedItemIds });
	if (Object.keys(adopted).length === 0) return authored;

	authored = mergeAuthored(authored, { version: 1, items: adopted });
	saveAuthoredCache(authored);
	// Stage rather than push: the migration then rides the session's single
	// commit instead of racing it with a second one, and a failure leaves it
	// queued for the next flush.
	savePendingAuthored({ ...loadPendingAuthored(), ...adopted });
	if (token) {
		flushAuthored(token).catch(() => {
			// Cached and queued already; the next flush retries.
		});
	}
	return authored;
}
