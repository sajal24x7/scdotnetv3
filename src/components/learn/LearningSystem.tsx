import React, { useEffect, useMemo, useState } from 'react';
import type { Category, LearnItem, LearnSystemConfig, Prompt } from './types';

// Leitner scheduler — see docs/architecture/learning-systems.md for the
// design this implements (boxes, daily caps, gradual introduction).
// Parameterized by LearnSystemConfig so /learn/linux and /learn/finnish
// (and future systems) share one engine.

const BOX_INTERVALS: Record<number, number> = { 1: 1, 2: 3, 3: 7, 4: 14, 5: 30 };
const MAX_BOX = 5;

interface CardState {
	box: number;
	due: string; // YYYY-MM-DD
	reps: number;
	lapses: number;
}

interface SrsState {
	version: 2;
	cards: Record<string, CardState>; // keyed by prompt id
	introduced: Record<string, string>; // item id -> date introduced
	lastSessionDate: string | null;
	streak: number;
	totalSessions: number;
}

function emptyState(): SrsState {
	return { version: 2, cards: {}, introduced: {}, lastSessionDate: null, streak: 0, totalSessions: 0 };
}

function localToday(): string {
	const d = new Date();
	const pad = (n: number) => String(n).padStart(2, '0');
	return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function addDays(dateStr: string, days: number): string {
	const [y, m, d] = dateStr.split('-').map(Number);
	const date = new Date(y, m - 1, d + days);
	const pad = (n: number) => String(n).padStart(2, '0');
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function daysBetween(a: string, b: string): number {
	const [ay, am, ad] = a.split('-').map(Number);
	const [by, bm, bd] = b.split('-').map(Number);
	return Math.round((new Date(by, bm - 1, bd).getTime() - new Date(ay, am - 1, ad).getTime()) / 86400000);
}

type ItemStatus = 'unseen' | 'due' | 'learning' | 'strong';

function itemStatus(item: LearnItem, state: SrsState, today: string): ItemStatus {
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

interface SessionItem {
	kind: 'learn' | 'prompt';
	item: LearnItem;
	prompt?: Prompt;
	isNew?: boolean;
}

type Screen = 'chart' | 'session' | 'done' | 'drill';

export default function LearningSystem({ config }: { config: LearnSystemConfig }) {
	const { storageKey, legacyKey, newPerDay, dueCap, itemNoun, monoAnswers, dataset } = config;
	const { categories, introductionOrder } = dataset;

	const allItems = useMemo<LearnItem[]>(() => categories.flatMap((c) => c.items), [categories]);
	const promptsById = useMemo(() => {
		const map = new Map<string, { prompt: Prompt; item: LearnItem }>();
		for (const item of allItems) {
			for (const prompt of item.prompts) {
				map.set(prompt.id, { prompt, item });
			}
		}
		return map;
	}, [allItems]);

	function categoryOf(itemId: string): Category | undefined {
		return categories.find((c) => c.items.some((item) => item.id === itemId));
	}

	function loadState(): SrsState {
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

	function saveState(state: SrsState) {
		if (typeof window === 'undefined') return;
		try {
			window.localStorage.setItem(storageKey, JSON.stringify(state));
		} catch {
			// localStorage unavailable — practice still works, just won't persist.
		}
	}

	function buildDailySession(state: SrsState, today: string): SessionItem[] {
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

	// Start from empty state so the first client render matches the prerendered
	// HTML (built without localStorage); real state loads after hydration.
	const [state, setState] = useState<SrsState>(emptyState);
	const [screen, setScreen] = useState<Screen>('chart');
	const [session, setSession] = useState<SessionItem[]>([]);
	const [index, setIndex] = useState(0);
	const [revealed, setRevealed] = useState(false);
	const [results, setResults] = useState<{ got: number; forgot: number; learned: number }>({ got: 0, forgot: 0, learned: 0 });
	const [selectedItem, setSelectedItem] = useState<LearnItem | null>(null);
	const [today, setToday] = useState<string>(() => localToday());

	// Load persisted state after hydration, and re-check the date when the tab
	// regains focus (page left open overnight).
	useEffect(() => {
		setState(loadState());
		setToday(localToday());
		const onFocus = () => setToday(localToday());
		window.addEventListener('focus', onFocus);
		return () => window.removeEventListener('focus', onFocus);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const dueCount = useMemo(
		() => Object.values(state.cards).filter((c) => c.due <= today).length,
		[state, today],
	);
	const unseenCount = useMemo(
		() => allItems.filter((i) => !state.introduced[i.id]).length,
		[state, allItems],
	);
	const introducedTodayCount = useMemo(
		() => Object.values(state.introduced).filter((d) => d === today).length,
		[state, today],
	);
	const newAvailable = Math.min(unseenCount, Math.max(0, newPerDay - introducedTodayCount));
	const doneForToday = dueCount === 0 && newAvailable === 0;
	const allDone = unseenCount === 0 && dueCount === 0;

	function startDaily() {
		const items = buildDailySession(state, today);
		if (items.length === 0) return;
		setSession(items);
		setIndex(0);
		setRevealed(false);
		setResults({ got: 0, forgot: 0, learned: 0 });
		setScreen('session');
		setSelectedItem(null);
	}

	function startDrill(category: Category) {
		const items: SessionItem[] = category.items.flatMap((item) =>
			item.prompts.map((prompt) => ({ kind: 'prompt' as const, item, prompt })),
		);
		setSession(items);
		setIndex(0);
		setRevealed(false);
		setResults({ got: 0, forgot: 0, learned: 0 });
		setScreen('drill');
		setSelectedItem(null);
	}

	function advance() {
		setRevealed(false);
		if (index + 1 < session.length) {
			setIndex(index + 1);
		} else if (screen === 'drill') {
			setScreen('chart');
		} else {
			finishDaily();
		}
	}

	function gradeCurrent(gotIt: boolean) {
		const item = session[index];
		if (item.kind !== 'prompt' || !item.prompt) return;
		const promptId = item.prompt.id;

		if (screen === 'session') {
			setState((prev) => {
				const cards = { ...prev.cards };
				const introduced = { ...prev.introduced };
				const existing = cards[promptId];
				let box: number;
				if (gotIt) {
					box = Math.min((existing?.box ?? 0) + 1, MAX_BOX);
				} else {
					box = 1;
				}
				cards[promptId] = {
					box,
					due: addDays(today, BOX_INTERVALS[box]),
					reps: (existing?.reps ?? 0) + 1,
					lapses: (existing?.lapses ?? 0) + (gotIt ? 0 : 1),
				};
				if (!introduced[item.item.id]) introduced[item.item.id] = today;
				const next = { ...prev, cards, introduced };
				saveState(next);
				return next;
			});
		}

		setResults((r) => ({
			got: r.got + (gotIt ? 1 : 0),
			forgot: r.forgot + (gotIt ? 0 : 1),
			learned: r.learned + (item.isNew && gotIt ? 1 : 0),
		}));
		advance();
	}

	function finishDaily() {
		setState((prev) => {
			let streak = prev.streak;
			if (!prev.lastSessionDate) {
				streak = 1;
			} else {
				const diff = daysBetween(prev.lastSessionDate, today);
				if (diff === 0) streak = prev.streak || 1;
				else if (diff === 1) streak = prev.streak + 1;
				else streak = 1;
			}
			const next: SrsState = {
				...prev,
				streak,
				lastSessionDate: today,
				totalSessions: prev.totalSessions + 1,
			};
			saveState(next);
			return next;
		});
		setScreen('done');
	}

	if (screen === 'session' || screen === 'drill') {
		const sessionItem = session[index];
		if (!sessionItem) return null;
		return (
			<SessionView
				sessionItem={sessionItem}
				index={index}
				total={session.length}
				revealed={revealed}
				isDrill={screen === 'drill'}
				itemNoun={itemNoun}
				monoAnswers={monoAnswers}
				categoryOf={categoryOf}
				onReveal={() => setRevealed(true)}
				onGrade={gradeCurrent}
				onContinue={advance}
				onQuit={() => setScreen('chart')}
			/>
		);
	}

	if (screen === 'done') {
		const tomorrowDue = Object.values(state.cards).filter((c) => c.due <= addDays(today, 1)).length;
		return (
			<div className="lq-done">
				<p className="lq-eyebrow">Done for today</p>
				<h2 className="lq-done__headline">
					{results.got} remembered · {results.forgot} to revisit
					{results.learned > 0 ? ` · ${results.learned} new` : ''}
				</h2>
				<p className="lq-done__message">
					{results.forgot === 0
						? 'Clean sweep. The forgotten-curve is losing.'
						: 'The ones you missed come back tomorrow — that\'s the system working, not you failing.'}
				</p>
				<div className="lq-stats">
					<div className="lq-stat">
						<span className="lq-stat__value">{state.streak}</span>
						<span className="lq-stat__label">day streak</span>
					</div>
					<div className="lq-stat">
						<span className="lq-stat__value">{tomorrowDue}</span>
						<span className="lq-stat__label">cards due tomorrow</span>
					</div>
				</div>
				<button type="button" className="lq-button" onClick={() => setScreen('chart')}>
					View the wall chart
				</button>
			</div>
		);
	}

	// Chart (home) screen
	return (
		<div className="lq-home">
			<div className="lq-today">
				{doneForToday ? (
					<div className="lq-today__row">
						<p className="lq-today__status">
							{allDone
								? '✓ Everything reviewed and nothing due. See you tomorrow.'
								: `✓ Done for today. New ${itemNoun}s and reviews return tomorrow.`}
						</p>
					</div>
				) : (
					<div className="lq-today__row">
						<button type="button" className="lq-button lq-button--primary lq-button--big" onClick={startDaily}>
							Start today’s review
						</button>
						<p className="lq-today__status">
							{dueCount > 0 ? `${Math.min(dueCount, dueCap)} due` : 'nothing due'}
							{newAvailable > 0 ? ` · ${newAvailable} new ${itemNoun}${newAvailable > 1 ? 's' : ''}` : ''}
							{state.streak > 0 ? ` · ${state.streak}-day streak` : ''}
						</p>
					</div>
				)}
			</div>

			<div className="lq-chart">
				{categories.map((category) => (
					<div key={category.id} className="lq-chart__group">
						<p className="lq-chart__label">
							{category.emoji} {category.title}
							<button
								type="button"
								className="lq-drill-link"
								onClick={() => startDrill(category)}
								title={`Drill all ${category.title} prompts (doesn't affect your schedule)`}
							>
								drill
							</button>
						</p>
						<div className="lq-chart__tiles">
							{category.items.map((item) => {
								const status = itemStatus(item, state, today);
								return (
									<button
										type="button"
										key={item.id}
										className={`lq-tile lq-tile--${status}${selectedItem?.id === item.id ? ' lq-tile--selected' : ''}`}
										onClick={() => setSelectedItem(selectedItem?.id === item.id ? null : item)}
										data-hover-title={item.syntax ?? item.term}
										data-hover-description={item.description}
									>
										{item.term}
									</button>
								);
							})}
						</div>
					</div>
				))}
			</div>

			<div className="lq-legend">
				<span><i className="lq-swatch lq-swatch--unseen" /> not yet introduced</span>
				<span><i className="lq-swatch lq-swatch--due" /> due for review</span>
				<span><i className="lq-swatch lq-swatch--learning" /> learning</span>
				<span><i className="lq-swatch lq-swatch--strong" /> solid</span>
			</div>

			{selectedItem && (
				<div className="lq-panel lq-reference">
					<p className="lq-eyebrow">{categoryOf(selectedItem.id)?.title}</p>
					{selectedItem.syntax ? (
						<code className="lq-command">{selectedItem.syntax}</code>
					) : (
						<p className="lq-term">{selectedItem.term}</p>
					)}
					<p className="lq-description">{selectedItem.description}</p>
					{selectedItem.example && (
						<div className="lq-example">
							<code>{selectedItem.example}</code>
							{selectedItem.exampleNote && <p className="lq-example__note">{selectedItem.exampleNote}</p>}
						</div>
					)}
					{selectedItem.href && (
						<a className="lq-note-link" href={selectedItem.href}>
							Read the note →
						</a>
					)}
				</div>
			)}
		</div>
	);
}

function SessionView({
	sessionItem,
	index,
	total,
	revealed,
	isDrill,
	itemNoun,
	monoAnswers,
	categoryOf,
	onReveal,
	onGrade,
	onContinue,
	onQuit,
}: {
	sessionItem: SessionItem;
	index: number;
	total: number;
	revealed: boolean;
	isDrill: boolean;
	itemNoun: string;
	monoAnswers: boolean;
	categoryOf: (itemId: string) => Category | undefined;
	onReveal: () => void;
	onGrade: (gotIt: boolean) => void;
	onContinue: () => void;
	onQuit: () => void;
}) {
	return (
		<div className="lq-session">
			<div className="lq-session__header">
				<button type="button" className="lq-quit" onClick={onQuit}>
					← {isDrill ? 'Exit drill' : 'Wall chart'}
				</button>
				<span className="lq-score">
					{index + 1} / {total}
				</span>
			</div>

			{sessionItem.kind === 'learn' ? (
				<div className="lq-panel">
					<p className="lq-eyebrow">New {itemNoun} · {categoryOf(sessionItem.item.id)?.title}</p>
					{sessionItem.item.syntax ? (
						<code className="lq-command">{sessionItem.item.syntax}</code>
					) : (
						<p className="lq-term">{sessionItem.item.term}</p>
					)}
					<p className="lq-description">{sessionItem.item.description}</p>
					{sessionItem.item.example && (
						<div className="lq-example">
							<code>{sessionItem.item.example}</code>
							{sessionItem.item.exampleNote && <p className="lq-example__note">{sessionItem.item.exampleNote}</p>}
						</div>
					)}
					{sessionItem.item.href && (
						<a className="lq-note-link" href={sessionItem.item.href} target="_blank" rel="noopener">
							Read the full note →
						</a>
					)}
					<button type="button" className="lq-button lq-button--primary" onClick={onContinue}>
						Got it — quiz me →
					</button>
				</div>
			) : (
				<div className="lq-panel">
					<p className="lq-eyebrow">
						{sessionItem.isNew ? 'New card' : isDrill ? 'Drill (won’t affect schedule)' : 'Review'} ·{' '}
						<code className="lq-inline-cmd">{sessionItem.item.term}</code>
					</p>
					<p className="lq-question">{sessionItem.prompt!.q}</p>

					{!revealed ? (
						<div className="lq-recall-hint-wrap">
							<p className="lq-recall-hint">Answer in your head first — that’s the rep that counts.</p>
							<button type="button" className="lq-button lq-button--primary" onClick={onReveal}>
								Show answer
							</button>
						</div>
					) : (
						<div className="lq-answer">
							{monoAnswers ? (
								<code className="lq-answer__text">{sessionItem.prompt!.a}</code>
							) : (
								<span className="lq-answer__text lq-answer__text--prose">{sessionItem.prompt!.a}</span>
							)}
							{sessionItem.prompt!.note && <p className="lq-answer__note">{sessionItem.prompt!.note}</p>}
							<div className="lq-grade">
								<button type="button" className="lq-button lq-button--got" onClick={() => onGrade(true)}>
									✓ Got it
								</button>
								<button type="button" className="lq-button lq-button--forgot" onClick={() => onGrade(false)}>
									✗ Forgot
								</button>
							</div>
						</div>
					)}
				</div>
			)}
		</div>
	);
}
