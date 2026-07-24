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

// Unified-practice session caps (plan §2.3) — global ceilings applied across
// every deck in the registry, on top of each deck's own dueCap/newPerDay.
export const GLOBAL_DUE_CAP = 20;
export const GLOBAL_NEW_PER_DAY = 5;

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

// --- Cloze prompts ---
//
// A prompt with kind: 'cloze' carries its full statement in `q`, with the
// hidden span(s) wrapped in {{…}}. The UI masks each hidden span on the
// card's front and reveals it highlighted on the back; `a` stays the
// canonical short answer for the reveal line.

export interface ClozeSegment {
	text: string;
	hidden: boolean;
}

export function splitCloze(q: string): ClozeSegment[] {
	const segments: ClozeSegment[] = [];
	const re = /\{\{(.+?)\}\}/g;
	let last = 0;
	let match: RegExpExecArray | null;
	while ((match = re.exec(q)) !== null) {
		if (match.index > last) segments.push({ text: q.slice(last, match.index), hidden: false });
		segments.push({ text: match[1], hidden: true });
		last = match.index + match[0].length;
	}
	if (last < q.length) segments.push({ text: q.slice(last), hidden: false });
	return segments;
}

// --- Session composition ---

// Since the learn/practice split, a session/drill queue only ever contains
// prompts — new-concept intro cards live in the learn-side IntroFlow instead.
export interface SessionItem {
	kind: 'prompt';
	item: LearnItem;
	prompt: Prompt;
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

// --- Introduction (the learn side of the learn/practice split) ---
//
// Introducing an item happens on /learn/new or a deck's own /learn/<topic>
// page — never inside the /practice session, which is Q&A only. Introduction
// marks the item and seeds a fresh FSRS card (state New, due today) for each
// of its prompts, so the item's questions surface in /practice the same day
// through the ordinary due-collection path — no special "new" branch needed
// downstream (counts, sync merge, and the queue all just see due cards).

export function introduceItem(state: SrsState, item: LearnItem, today: string): SrsState {
	if (state.introduced[item.id]) return state;
	const now = dateStringToLocalDate(today);
	const cards = { ...state.cards };
	for (const prompt of item.prompts) {
		if (!cards[prompt.id]) cards[prompt.id] = fromFsrsCard(createEmptyCard(now));
	}
	return { ...state, cards, introduced: { ...state.introduced, [item.id]: today } };
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

// Shared by SrsState.streak (per-deck, legacy) and PracticeMeta.streak (the
// unified counter) — same "consecutive calendar day" rule either way.
function nextStreak(prevStreak: number, lastSessionDate: string | null, today: string): number {
	if (!lastSessionDate) return 1;
	const diff = daysBetween(lastSessionDate, today);
	if (diff === 0) return prevStreak || 1;
	if (diff === 1) return prevStreak + 1;
	return 1;
}

export function finishSession(state: SrsState, today: string): SrsState {
	const streak = nextStreak(state.streak, state.lastSessionDate, today);
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

export function computeIntroducedCount(state: SrsState): number {
	return Object.keys(state.introduced).length;
}

export function computeNewAvailable(unseenCount: number, introducedTodayCount: number, newPerDay: number): number {
	return Math.min(unseenCount, Math.max(0, newPerDay - introducedTodayCount));
}

// --- Unified cross-deck queue (/practice, plan §2.3) ---
//
// Per-card scheduling stays exactly as above; only *selection* becomes
// cross-deck. Each deck's due/new candidates are gathered exactly as
// buildDailySession would (earliest-due first, capped at the deck's own
// dueCap/newPerDay), then merged round-robin up to a global cap — fairness
// so one deck's backlog can't starve another, and free interleaving.

export interface DeckSessionInput {
	deckId: string;
	state: SrsState;
	allItems: LearnItem[];
	promptsById: Map<string, { prompt: Prompt; item: LearnItem }>;
	introductionOrder: string[];
	dueCap: number;
	newPerDay: number;
}

export interface PracticeQueueItem extends SessionItem {
	deckId: string;
}

function roundRobinPick<T>(queues: { deckId: string; queue: T[] }[], cap: number): { deckId: string; value: T }[] {
	const picked: { deckId: string; value: T }[] = [];
	const cursors = new Array(queues.length).fill(0);
	let progressed = true;
	while (picked.length < cap && progressed) {
		progressed = false;
		for (let i = 0; i < queues.length && picked.length < cap; i++) {
			const q = queues[i];
			if (cursors[i] < q.queue.length) {
				picked.push({ deckId: q.deckId, value: q.queue[cursors[i]] });
				cursors[i]++;
				progressed = true;
			}
		}
	}
	return picked;
}

// Q&A only (learn/practice split): the queue is due reviews, nothing else.
// New-concept introduction happens on the learn side (see buildNewToday /
// introduceItem); a freshly introduced item's prompts arrive here as
// ordinary due cards the same day, since introduceItem seeds them due-today.
export function buildUnifiedQueue(params: {
	decks: DeckSessionInput[];
	today: string;
	suspended: Set<string>;
	globalDueCap: number;
}): PracticeQueueItem[] {
	const { decks, today, suspended, globalDueCap } = params;
	const deckById = new Map(decks.map((d) => [d.deckId, d]));
	const items: PracticeQueueItem[] = [];

	const dueQueues = decks.map((deck) => ({
		deckId: deck.deckId,
		queue: Object.entries(deck.state.cards)
			.filter(([id, card]) => card.due <= today && !suspended.has(id))
			.sort((a, b) => (a[1].due < b[1].due ? -1 : 1))
			.slice(0, deck.dueCap)
			.map(([id]) => id),
	}));
	for (const { deckId, value: promptId } of roundRobinPick(dueQueues, globalDueCap)) {
		const hit = deckById.get(deckId)?.promptsById.get(promptId);
		if (hit) items.push({ kind: 'prompt', item: hit.item, prompt: hit.prompt, deckId });
	}

	return items;
}

// The learn-side counterpart: today's new-concept candidates across every
// deck, round-robin up to the global budget, gated exactly as the old
// in-session introduction was (per-deck newPerDay minus what's already been
// introduced today, suspended items excluded). Consumed by /learn/new and,
// per-deck, by the wall-chart pages.
export interface NewTodayItem {
	deckId: string;
	item: LearnItem;
}

export function newCandidatesForDeck(deck: DeckSessionInput, today: string, suspended: Set<string>): LearnItem[] {
	const introducedToday = Object.values(deck.state.introduced).filter((d) => d === today).length;
	const slots = Math.max(0, deck.newPerDay - introducedToday);
	return deck.introductionOrder
		.filter((id) => !deck.state.introduced[id] && !suspended.has(id))
		.slice(0, slots)
		.map((id) => deck.allItems.find((i) => i.id === id))
		.filter((item): item is LearnItem => Boolean(item));
}

export function buildNewToday(params: {
	decks: DeckSessionInput[];
	today: string;
	suspended: Set<string>;
	globalNewPerDay: number;
	// Deck-id priority lists, each representing one "must appear today" group
	// (e.g. one for English, one for Finnish). Before the ordinary round-robin
	// runs, one slot is reserved per group — taken from the first deck in that
	// group with a candidate available — so registry order can't starve a
	// language whose decks happen to sit after enough other decks to fill the
	// global cap on their own. Optional: omit for the plain round-robin.
	guaranteedGroups?: string[][];
}): NewTodayItem[] {
	const { decks, today, suspended, globalNewPerDay, guaranteedGroups = [] } = params;
	const newQueues = decks.map((deck) => ({
		deckId: deck.deckId,
		queue: newCandidatesForDeck(deck, today, suspended),
	}));

	const picked: { deckId: string; value: LearnItem }[] = [];
	for (const group of guaranteedGroups) {
		if (picked.length >= globalNewPerDay) break;
		for (const deckId of group) {
			const q = newQueues.find((entry) => entry.deckId === deckId);
			if (q && q.queue.length > 0) {
				picked.push({ deckId, value: q.queue.shift()! });
				break; // one guaranteed pick per group, first deck in it with content
			}
		}
	}

	const remaining = globalNewPerDay - picked.length;
	if (remaining > 0) picked.push(...roundRobinPick(newQueues, remaining));

	return picked.map(({ deckId, value }) => ({ deckId, item: value }));
}

// --- practice-meta: the one genuinely global piece of state (plan §2.4) ---

export interface PracticeMeta {
	version: 1;
	streak: number;
	lastSessionDate: string | null;
	totalSessions: number;
	disabledDecks: string[]; // deck ids paused via a /practice toggle
	suspended: string[]; // item ids skipped at introduction (plan §4.4)
}

const PRACTICE_META_KEY = 'practice-meta';

export function emptyPracticeMeta(): PracticeMeta {
	return { version: 1, streak: 0, lastSessionDate: null, totalSessions: 0, disabledDecks: [], suspended: [] };
}

// `seedStreak` only takes effect the first time practice-meta is created —
// plan §2.4/§8 seeds the unified streak from the max of existing per-deck
// streaks so adopting /practice doesn't feel like starting over.
export function loadPracticeMeta(seedStreak: number): PracticeMeta {
	if (typeof window === 'undefined') return emptyPracticeMeta();
	try {
		const raw = window.localStorage.getItem(PRACTICE_META_KEY);
		if (raw) return { ...emptyPracticeMeta(), ...JSON.parse(raw), version: 1 };
	} catch {
		// fall through to a fresh, seeded meta
	}
	return { ...emptyPracticeMeta(), streak: seedStreak };
}

export function savePracticeMeta(meta: PracticeMeta) {
	if (typeof window === 'undefined') return;
	try {
		window.localStorage.setItem(PRACTICE_META_KEY, JSON.stringify(meta));
	} catch {
		// localStorage unavailable — practice still works, just won't persist.
	}
}

export function finishPracticeSession(meta: PracticeMeta, today: string): PracticeMeta {
	const streak = nextStreak(meta.streak, meta.lastSessionDate, today);
	return { ...meta, streak, lastSessionDate: today, totalSessions: meta.totalSessions + 1 };
}

// --- Cross-device merge (plan §2.8) ---
//
// Deterministic and idempotent — safe to run in either direction any number
// of times (local<-remote or remote<-local), so a periodic re-sync never
// double-applies. `reps` only ever grows (FSRS as in the old Leitner
// scheme), so it's a conflict-free tiebreaker for per-card state.

export function mergeSrsState(local: SrsState, remote: SrsState): SrsState {
	const cards: Record<string, CardState> = { ...local.cards };
	for (const [id, remoteCard] of Object.entries(remote.cards)) {
		const localCard = cards[id];
		if (
			!localCard ||
			remoteCard.reps > localCard.reps ||
			(remoteCard.reps === localCard.reps && (remoteCard.lastReview ?? '') > (localCard.lastReview ?? ''))
		) {
			cards[id] = remoteCard;
		}
	}

	const introduced: Record<string, string> = { ...local.introduced };
	for (const [id, date] of Object.entries(remote.introduced)) {
		if (!introduced[id] || date < introduced[id]) introduced[id] = date;
	}

	// streak/lastSessionDate/totalSessions travel together as a triple, taken
	// from whichever side most recently completed a session.
	const winner = (remote.lastSessionDate ?? '') > (local.lastSessionDate ?? '') ? remote : local;
	return {
		version: 3,
		cards,
		introduced,
		lastSessionDate: winner.lastSessionDate,
		streak: winner.streak,
		totalSessions: winner.totalSessions,
	};
}

export function mergePracticeMeta(local: PracticeMeta, remote: PracticeMeta): PracticeMeta {
	const disabledDecks = Array.from(new Set([...local.disabledDecks, ...remote.disabledDecks]));
	const suspended = Array.from(new Set([...local.suspended, ...remote.suspended]));
	const winner = (remote.lastSessionDate ?? '') > (local.lastSessionDate ?? '') ? remote : local;
	return {
		version: 1,
		disabledDecks,
		suspended,
		lastSessionDate: winner.lastSessionDate,
		streak: winner.streak,
		totalSessions: winner.totalSessions,
	};
}
