// Pure scheduler/persistence engine shared by every /learn/* practice system
// (LearningSystem) and the /learn hub's count derivation (LearnHub). See
// docs/architecture/learning-systems.md for the design this implements
// (Leitner boxes, daily caps, gradual introduction).
//
// Nothing here touches React — it's the "second consumer forces the
// refactor" extraction: LearnHub used to duplicate this logic by hand with a
// keep-in-sync comment; both now call the same functions.

import type { LearnItem, Prompt } from './types';

export const BOX_INTERVALS: Record<number, number> = { 1: 1, 2: 3, 3: 7, 4: 14, 5: 30 };
export const MAX_BOX = 5;

export interface CardState {
	box: number;
	due: string; // YYYY-MM-DD
	reps: number;
	lapses: number;
}

export interface SrsState {
	version: 2;
	cards: Record<string, CardState>; // keyed by prompt id
	introduced: Record<string, string>; // item id -> date introduced
	lastSessionDate: string | null;
	streak: number;
	totalSessions: number;
}

export function emptyState(): SrsState {
	return { version: 2, cards: {}, introduced: {}, lastSessionDate: null, streak: 0, totalSessions: 0 };
}

export function localToday(): string {
	const d = new Date();
	const pad = (n: number) => String(n).padStart(2, '0');
	return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function addDays(dateStr: string, days: number): string {
	const [y, m, d] = dateStr.split('-').map(Number);
	const date = new Date(y, m - 1, d + days);
	const pad = (n: number) => String(n).padStart(2, '0');
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function daysBetween(a: string, b: string): number {
	const [ay, am, ad] = a.split('-').map(Number);
	const [by, bm, bd] = b.split('-').map(Number);
	return Math.round((new Date(by, bm - 1, bd).getTime() - new Date(ay, am - 1, ad).getTime()) / 86400000);
}

export type ItemStatus = 'unseen' | 'due' | 'learning' | 'strong';

export function itemStatus(item: LearnItem, state: SrsState, today: string): ItemStatus {
	if (!state.introduced[item.id]) return 'unseen';
	let minBox = Infinity;
	let anyDue = false;
	for (const prompt of item.prompts) {
		const card = state.cards[prompt.id];
		if (!card) return 'due'; // introduced but a prompt never graded — treat as due
		if (card.due <= today) anyDue = true;
		minBox = Math.min(minBox, card.box);
	}
	if (anyDue) return 'due';
	return minBox >= 4 ? 'strong' : 'learning';
}

// --- Persistence ---

export function loadState(storageKey: string, legacyKey?: string): SrsState {
	if (typeof window === 'undefined') return emptyState();
	try {
		const raw = window.localStorage.getItem(storageKey);
		if (raw) return { ...emptyState(), ...JSON.parse(raw) };
		// One-time migration from a legacy quiz page (Linux only): carry streak + session count.
		if (legacyKey) {
			const legacy = window.localStorage.getItem(legacyKey);
			if (legacy) {
				const old = JSON.parse(legacy);
				return {
					...emptyState(),
					streak: old.streak ?? 0,
					totalSessions: old.totalSessions ?? 0,
					lastSessionDate: old.lastCompletedDate ?? null,
				};
			}
		}
	} catch {
		// fall through to empty state
	}
	return emptyState();
}

export function saveState(storageKey: string, state: SrsState) {
	if (typeof window === 'undefined') return;
	try {
		window.localStorage.setItem(storageKey, JSON.stringify(state));
	} catch {
		// localStorage unavailable — practice still works, just won't persist.
	}
}

// --- Session composition ---

export interface SessionItem {
	kind: 'learn' | 'prompt';
	item: LearnItem;
	prompt?: Prompt;
	isNew?: boolean;
}

export function buildPromptsById(allItems: LearnItem[]): Map<string, { prompt: Prompt; item: LearnItem }> {
	const map = new Map<string, { prompt: Prompt; item: LearnItem }>();
	for (const item of allItems) {
		for (const prompt of item.prompts) {
			map.set(prompt.id, { prompt, item });
		}
	}
	return map;
}

export function buildDailySession(params: {
	state: SrsState;
	today: string;
	allItems: LearnItem[];
	promptsById: Map<string, { prompt: Prompt; item: LearnItem }>;
	introductionOrder: string[];
	dueCap: number;
	newPerDay: number;
}): SessionItem[] {
	const { state, today, allItems, promptsById, introductionOrder, dueCap, newPerDay } = params;
	const items: SessionItem[] = [];

	// 1. Reviews due today (earliest-due first, capped so a backlog can't balloon).
	const due = Object.entries(state.cards)
		.filter(([, card]) => card.due <= today)
		.sort((a, b) => (a[1].due < b[1].due ? -1 : 1))
		.slice(0, dueCap)
		.map(([id]) => promptsById.get(id))
		.filter((x): x is { prompt: Prompt; item: LearnItem } => Boolean(x));

	for (const { prompt, item } of due) {
		items.push({ kind: 'prompt', item, prompt });
	}

	// 2. New items, introduced gradually. Count today's already-introduced
	//    items so reopening the page mid-day doesn't add extras.
	const introducedToday = Object.values(state.introduced).filter((d) => d === today).length;
	let slots = Math.max(0, newPerDay - introducedToday);
	for (const itemId of introductionOrder) {
		if (slots === 0) break;
		if (state.introduced[itemId]) continue;
		const item = allItems.find((i) => i.id === itemId);
		if (!item) continue;
		items.push({ kind: 'learn', item, isNew: true });
		for (const prompt of item.prompts) {
			items.push({ kind: 'prompt', item, prompt, isNew: true });
		}
		slots--;
	}

	return items;
}

// --- Grading & session close ---

export function gradeCard(state: SrsState, itemId: string, promptId: string, gotIt: boolean, today: string): SrsState {
	const cards = { ...state.cards };
	const introduced = { ...state.introduced };
	const existing = cards[promptId];
	const box = gotIt ? Math.min((existing?.box ?? 0) + 1, MAX_BOX) : 1;
	cards[promptId] = {
		box,
		due: addDays(today, BOX_INTERVALS[box]),
		reps: (existing?.reps ?? 0) + 1,
		lapses: (existing?.lapses ?? 0) + (gotIt ? 0 : 1),
	};
	if (!introduced[itemId]) introduced[itemId] = today;
	return { ...state, cards, introduced };
}

export function finishSession(state: SrsState, today: string): SrsState {
	let streak = state.streak;
	if (!state.lastSessionDate) {
		streak = 1;
	} else {
		const diff = daysBetween(state.lastSessionDate, today);
		if (diff === 0) streak = state.streak || 1;
		else if (diff === 1) streak = state.streak + 1;
		else streak = 1;
	}
	return { ...state, streak, lastSessionDate: today, totalSessions: state.totalSessions + 1 };
}

// --- Counts (shared by the wall-chart home screen and the /learn hub) ---

export function computeDueCount(state: SrsState, today: string): number {
	return Object.values(state.cards).filter((c) => c.due <= today).length;
}

export function computeIntroducedTodayCount(state: SrsState, today: string): number {
	return Object.values(state.introduced).filter((d) => d === today).length;
}

export function computeUnseenCount(totalItems: number, state: SrsState): number {
	return Math.max(0, totalItems - Object.keys(state.introduced).length);
}

export function computeNewAvailable(unseenCount: number, introducedTodayCount: number, newPerDay: number): number {
	return Math.min(unseenCount, Math.max(0, newPerDay - introducedTodayCount));
}
