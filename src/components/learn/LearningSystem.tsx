import React, { useEffect, useMemo, useState } from 'react';
import type { Category, LearnItem, LearnSystemConfig } from './types';
import {
	addDays,
	buildDailySession,
	buildPromptsById,
	clearLegacyBackup,
	computeDueCount,
	computeIntroducedTodayCount,
	computeNewAvailable,
	computeUnseenCount,
	emptyState,
	finishSession,
	gradeCard,
	itemStatus,
	loadState,
	localToday,
	saveState,
	type SessionItem,
	type SrsState,
} from './engine';

// UI for the per-domain wall chart + session flow. Scheduling and
// persistence live in ./engine (shared with LearnHub's count derivation);
// this component owns only screens and rendering. Parameterized by
// LearnSystemConfig so /learn/linux, /learn/finnish, etc. share one engine.

type Screen = 'chart' | 'session' | 'done' | 'drill';

export default function LearningSystem({ config }: { config: LearnSystemConfig }) {
	const { storageKey, legacyKey, newPerDay, dueCap, itemNoun, monoAnswers, dataset } = config;
	const { categories, introductionOrder } = dataset;

	const allItems = useMemo<LearnItem[]>(() => categories.flatMap((c) => c.items), [categories]);
	const promptsById = useMemo(() => buildPromptsById(allItems), [allItems]);

	function categoryOf(itemId: string): Category | undefined {
		return categories.find((c) => c.items.some((item) => item.id === itemId));
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
	// Prompt ids already given a same-session second chance after "Forgot" —
	// caps the requeue at one extra shot per prompt (see gradeCurrent).
	const [requeued, setRequeued] = useState<Set<string>>(new Set());

	// Load persisted state after hydration, and re-check the date when the tab
	// regains focus (page left open overnight).
	useEffect(() => {
		setState(loadState(storageKey, legacyKey));
		setToday(localToday());
		const onFocus = () => setToday(localToday());
		window.addEventListener('focus', onFocus);
		return () => window.removeEventListener('focus', onFocus);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const dueCount = useMemo(() => computeDueCount(state, today), [state, today]);
	const unseenCount = useMemo(() => computeUnseenCount(allItems.length, state), [state, allItems]);
	const introducedTodayCount = useMemo(() => computeIntroducedTodayCount(state, today), [state, today]);
	const newAvailable = computeNewAvailable(unseenCount, introducedTodayCount, newPerDay);
	const doneForToday = dueCount === 0 && newAvailable === 0;
	const allDone = unseenCount === 0 && dueCount === 0;

	function startDaily() {
		const items = buildDailySession({ state, today, allItems, promptsById, introductionOrder, dueCap, newPerDay });
		if (items.length === 0) return;
		setSession(items);
		setIndex(0);
		setRevealed(false);
		setResults({ got: 0, forgot: 0, learned: 0 });
		setRequeued(new Set());
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

	// Takes the session array explicitly rather than reading the `session`
	// state variable, because gradeCurrent may append a requeued card to it
	// in the same tick — relying on the stale closure would end the session
	// one card early.
	function advanceWithin(activeSession: SessionItem[]) {
		setRevealed(false);
		if (index + 1 < activeSession.length) {
			setIndex(index + 1);
		} else if (screen === 'drill') {
			setScreen('chart');
		} else {
			finishDaily();
		}
	}

	function advance() {
		advanceWithin(session);
	}

	function gradeCurrent(gotIt: boolean) {
		const item = session[index];
		if (item.kind !== 'prompt' || !item.prompt) return;
		const promptId = item.prompt.id;

		let activeSession = session;
		if (screen === 'session') {
			setState((prev) => {
				const next = gradeCard(prev, item.item.id, promptId, gotIt, today);
				saveState(storageKey, next);
				return next;
			});

			// A "Forgot" card gets one same-session second chance at the end of
			// the queue — day-granular persisted scheduling still pushes it to
			// tomorrow (that's the source of truth), but a same-day retry
			// converts a slip into a win more often than waiting until tomorrow
			// would (plan §2.6).
			if (!gotIt && !requeued.has(promptId)) {
				setRequeued((prev) => new Set(prev).add(promptId));
				activeSession = [...session, { kind: 'prompt', item: item.item, prompt: item.prompt }];
				setSession(activeSession);
			}
		}

		setResults((r) => ({
			got: r.got + (gotIt ? 1 : 0),
			forgot: r.forgot + (gotIt ? 0 : 1),
			learned: r.learned + (item.isNew && gotIt ? 1 : 0),
		}));
		advanceWithin(activeSession);
	}

	function finishDaily() {
		setState((prev) => {
			const next = finishSession(prev, today);
			saveState(storageKey, next);
			return next;
		});
		clearLegacyBackup(storageKey);
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
