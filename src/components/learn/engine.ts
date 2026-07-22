// Pure scheduler/persistence engine shared by every /learn/* practice system
// (LearningSystem) and the /learn hub's count derivation (LearnHub). See
// docs/architecture/learning-systems.md for the design this implements
// (FSRS scheduling, daily caps, gradual introduction).
//
// Nothing here touches React — it's the "second consumer forces the
// refactor" extraction: LearnHub used to duplicate this logic by hand with a
// keep-in-sync comment; both now call the same functions.

import { createEmptyCard, fsrs, generatorParameters, Rating, State, type Card, type CardInput } from 'ts-fsrs';
import type { LearnItem, Prompt } from './types';

// --- Legacy Leitner constants, kept only for the v2→v3 migration below ---
const BOX_INTERVALS: Record<number, number> = { 1: 1, 2: 3, 3: 7, 4: 14, 5: 30 };

// FSRS scheduler config. Two deliberate deviations from Anki defaults, both
// from plan §2.6 ("day-granular adaptation"): `enable_short_term: false`
// disables minute-level (re)learning steps so every persisted interval is a
// whole calendar day (verified: even an Again on a brand-new card schedules
// >= 1 day out, never same-day) — a same-day second chance is handled at the
// session level instead (see the requeue logic in LearningSystem.tsx).
// `enable_fuzz: false` keeps intervals exact and reproducible rather than
// randomized, which matters for a scheduler that's meant to be inspectable.
export const DEFAULT_RETENTION = 0.9;
const scheduler = fsrs(generatorParameters({ request_retention: DEFAULT_RETENTION, enable_short_term: false, enable_fuzz: false }));

// A card's memory strength, in FSRS terms, per prompt.
export interface CardState {
	due: string; // YYYY-MM-DD
	stability: number; // days until recall probability drops to the retention target
	difficulty: number; // 1 (easy) – 10 (hard)
	state: State; // New / Learning / Review / Relearning
	reps: number;
	lapses: number;
	lastReview: string | null; // YYYY-MM-DD
}

export interface SrsState {
	version: 3;
	cards: Record<string, CardState>; // keyed by prompt id
	introduced: Record<string, string>; // item id -> date introduced
	lastSessionDate: string | null;
	streak: number;
	totalSessions: number;
}

export function emptyState(): SrsState {
	return { version: 3, cards: {}, introduced: {}, lastSessionDate: null, streak: 0, totalSessions: 0 };
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

function dateStringToLocalDate(dateStr: string): Date {
	const [y, m, d] = dateStr.split('-').map(Number);
	return new Date(y, m - 1, d);
}

// Threshold, in days of stability, above which a card counts as "solid" on
// the wall chart rather than merely "learning" (plan §2.6).
const STRONG_STABILITY_DAYS = 21;

export type ItemStatus = 'unseen' | 'due' | 'learning' | 'strong';

export function itemStatus(item: LearnItem, state: SrsState, today: string): ItemStatus {
	if (!state.introduced[item.id]) return 'unseen';
	let minStability = Infinity;
	let anyDue = false;
	let anyLearning = false;
	for (const prompt of item.prompts) {
		const card = state.cards[prompt.id];
		if (!card) return 'due'; // introduced but a prompt never graded — treat as due
		if (card.due <= today) anyDue = true;
		if (card.state === State.Learning || card.state === State.Relearning) anyLearning = true;
		minStability = Math.min(minStability, card.stability);
	}
	if (anyDue) return 'due';
	return anyLearning || minStability < STRONG_STABILITY_DAYS ? 'learning' : 'strong';
}

// --- FSRS <-> persisted CardState conversion ---

function toFsrsInput(card: CardState): CardInput {
	return {
		due: dateStringToLocalDate(card.due),
		stability: card.stability,
		difficulty: card.difficulty,
		elapsed_days: 0, // deprecated field FSRS recomputes internally from last_review
		scheduled_days: 0,
		learning_steps: 0,
		reps: card.reps,
		lapses: card.lapses,
		state: card.state,
		last_review: card.lastReview ? dateStringToLocalDate(card.lastReview) : null,
	};
}

function fromFsrsCard(card: Card): CardState {
	return {
		due: formatLocalDate(card.due),
		stability: card.stability,
		difficulty: card.difficulty,
		state: card.state,
		reps: card.reps,
		lapses: card.lapses,
		lastReview: card.last_review ? formatLocalDate(card.last_review) : null,
	};
}

function formatLocalDate(date: Date): string {
	const pad = (n: number) => String(n).padStart(2, '0');
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

// --- v2 (Leitner) -> v3 (FSRS) migration, one-way ---

function migrateV2ToV3(v2: {
	cards?: Record<string, { box?: number; due: string; reps?: number; lapses?: number }>;
	introduced?: Record<string, string>;
	lastSessionDate?: string | null;
	streak?: number;
	totalSessions?: number;
}): SrsState {
	// "Default difficulty": FSRS's own init value for a fresh Good-rated card —
	// there's no per-card difficulty history to seed from in Leitner data, so
	// this is the most defensible neutral starting point.
	const defaultDifficulty = scheduler.init_difficulty(Rating.Good);
	const cards: Record<string, CardState> = {};
	for (const [promptId, old] of Object.entries(v2.cards ?? {})) {
		const interval = BOX_INTERVALS[old.box ?? 1] ?? BOX_INTERVALS[1];
		cards[promptId] = {
			due: old.due, // unchanged — nothing feels re-set on day one
			stability: interval,
			difficulty: defaultDifficulty,
			state: State.Review,
			reps: old.reps ?? 0,
			lapses: old.lapses ?? 0,
			lastReview: addDays(old.due, -interval),
		};
	}
	return {
		version: 3,
		cards,
		introduced: { ...(v2.introduced ?? {}) },
		lastSessionDate: v2.lastSessionDate ?? null,
		streak: v2.streak ?? 0,
		totalSessions: v2.totalSessions ?? 0,
	};
}

function legacyBackupKey(storageKey: string): string {
	return `${storageKey}-v2-backup`;
}

// Called once the first post-migration session completes; the v2 blob has
// served its purpose (export/import covers rollback beyond this point).
export function clearLegacyBackup(storageKey: string) {
	if (typeof window === 'undefined') return;
	try {
		window.localStorage.removeItem(legacyBackupKey(storageKey));
	} catch {
		// no-op
	}
}

// --- Persistence ---

export function loadState(storageKey: string, legacyKey?: string): SrsState {
	if (typeof window === 'undefined') return emptyState();
	try {
		const raw = window.localStorage.getItem(storageKey);
		if (raw) {
			const parsed = JSON.parse(raw);
			if (parsed.version === 2) {
				try {
					window.localStorage.setItem(legacyBackupKey(storageKey), raw);
				} catch {
					// backup is best-effort; migration proceeds regardless
				}
				return migrateV2ToV3(parsed);
			}
			return { ...emptyState(), ...parsed, version: 3 };
		}
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
	const now = dateStringToLocalDate(today);
	const existing = cards[promptId];
	const input: CardInput | Card = existing ? toFsrsInput(existing) : createEmptyCard(now);
	const grade = gotIt ? Rating.Good : Rating.Again;
	const { card: nextCard } = scheduler.next(input, now, grade);
	cards[promptId] = fromFsrsCard(nextCard);
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
