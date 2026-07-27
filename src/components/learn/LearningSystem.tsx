import React, { useEffect, useMemo, useState } from 'react';
import { promptsOf, type Category, type LearnItem, type LearnSystemConfig, type Prompt } from './types';
import { ItemDetails, PromptQuestion } from './ItemDetails';
import { IntroFlow, type IntroCard } from './IntroFlow';
import {
	emptyState,
	introduceItem,
	itemStatus,
	loadPracticeMeta,
	loadState,
	localToday,
	newCandidatesForDeck,
	savePracticeMeta,
	saveState,
	type PracticeMeta,
	type SessionItem,
	type SrsState,
} from './engine';
import { loadSyncToken, pushBlobFromLocalStorage } from './sync';
import {
	applyAuthoredPrompts,
	emptyAuthoredStore,
	flushAuthored,
	loadAuthoredCache,
	stageAuthored,
	type AuthoredStore,
} from './authoredPrompts';

// UI for the per-domain wall chart + reference panel + no-op drills + the
// deck's own "new today" intro flow. Scheduling and persistence live in
// ./engine. Since the learn/practice split, this page owns the *learning*
// half for its deck: introducing today's new concepts (which seeds their
// prompts due-today) happens either here or on the combined /learn/new page.
// Graded Q&A stays at /practice — drills here never touch scheduler state,
// and grading never happens on this page. Parameterized by LearnSystemConfig
// so /learn/linux, /learn/finnish, etc. share one engine.

type Screen = 'chart' | 'drill' | 'intro';

export default function LearningSystem({ config }: { config: LearnSystemConfig }) {
	const { storageKey, legacyKey, itemNoun, monoAnswers, newPerDay, dueCap, authorPrompts } = config;
	// Prompts authored since the last build aren't in the config's dataset
	// yet — overlay this device's cache on top of what the build shipped, so
	// the wall chart's tile colours and the drills both see them.
	const [authored, setAuthored] = useState<AuthoredStore>(emptyAuthoredStore);
	const dataset = useMemo(() => applyAuthoredPrompts(config.dataset, authored), [config.dataset, authored]);
	const { categories } = dataset;

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
	const [selectedItem, setSelectedItem] = useState<LearnItem | null>(null);
	const [today, setToday] = useState<string>(() => localToday());
	// Suspended item ids (plan §4.4, skip-at-introduction) live in the
	// shared practice-meta key, not this deck's own storageKey — a skip
	// happens at introduction time, but the wall chart is where you'd notice
	// a word muted out and decide to bring it back.
	const [suspended, setSuspended] = useState<Set<string>>(new Set());
	const [saveError, setSaveError] = useState<string | null>(null);

	// Load persisted state after hydration, and re-check the date when the tab
	// regains focus (page left open overnight).
	useEffect(() => {
		setState(loadState(storageKey, legacyKey));
		setAuthored(loadAuthoredCache());
		setSuspended(new Set(loadPracticeMeta(0).suspended));
		setToday(localToday());
		const onFocus = () => setToday(localToday());
		window.addEventListener('focus', onFocus);
		return () => window.removeEventListener('focus', onFocus);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// Fire-and-forget sync push after an introduction/skip, so a concept
	// learned here isn't offered again on another connected device.
	function pushSync(meta: PracticeMeta) {
		const token = loadSyncToken();
		if (!token) return;
		pushBlobFromLocalStorage([storageKey], meta, token).catch(() => {
			// silent — local state is already saved
		});
	}

	function unsuspend(itemId: string) {
		const meta = loadPracticeMeta(0);
		const next = { ...meta, suspended: meta.suspended.filter((id) => id !== itemId) };
		savePracticeMeta(next);
		setSuspended(new Set(next.suspended));
		pushSync(next);
	}

	// This deck's new-concept candidates for today (budget-gated, suspended
	// excluded) — the learn half of the learn/practice split.
	const allItems = categories.flatMap((c) => c.items);
	const newToday = newCandidatesForDeck(
		{
			deckId: 'self',
			state,
			allItems,
			promptsById: new Map(),
			introductionOrder: dataset.introductionOrder,
			dueCap,
			newPerDay,
		},
		today,
		suspended,
	);

	function handleLearn(card: IntroCard, prompts: Prompt[]) {
		// On an authored-prompt deck the prompts the learner just wrote are
		// what introduceItem schedules — see NewToday.handleLearn, same rule.
		const item = authorPrompts ? { ...card.item, prompts } : card.item;
		setState((prev) => {
			const next = introduceItem(prev, item, today);
			saveState(storageKey, next);
			return next;
		});
		pushSync(loadPracticeMeta(0));

		if (authorPrompts) {
			// Staged locally; handleSessionEnd commits the session in one go —
			// same rule as NewToday.handleLearn.
			setSaveError(null);
			setAuthored(stageAuthored(card.item.id, prompts));
		}
	}

	async function handleSessionEnd() {
		const result = await flushAuthored(loadSyncToken());
		setSaveError(
			result.committed
				? null
				: `Saved on this device, but not to the repo — ${result.error ?? 'unknown error'}`,
		);
	}

	function handleSkip(card: IntroCard) {
		const meta = loadPracticeMeta(0);
		if (!meta.suspended.includes(card.item.id)) {
			const next = { ...meta, suspended: [...meta.suspended, card.item.id] };
			savePracticeMeta(next);
			setSuspended(new Set(next.suspended));
			pushSync(next);
		}
	}

	function startDrill(category: Category) {
		const items: SessionItem[] = category.items.flatMap((item) =>
			promptsOf(item).map((prompt) => ({ kind: 'prompt' as const, item, prompt })),
		);
		setSession(items);
		setIndex(0);
		setRevealed(false);
		setScreen('drill');
		setSelectedItem(null);
	}

	function advance() {
		setRevealed(false);
		if (index + 1 < session.length) {
			setIndex(index + 1);
		} else {
			setScreen('chart');
		}
	}

	if (screen === 'intro') {
		return (
			<IntroFlow
				cards={newToday.map((item) => ({ deckId: 'self', item, itemNoun, authorPrompts }))}
				saveError={saveError}
				onLearn={handleLearn}
				onSkip={handleSkip}
				onSessionEnd={handleSessionEnd}
				onQuit={() => setScreen('chart')}
				doneView={(learned) => (
					<div className="lq-done">
						<p className="lq-eyebrow">New {itemNoun}s done</p>
						<h2 className="lq-done__headline">
							{learned} new {itemNoun}
							{learned === 1 ? '' : 's'} added to today's practice
						</h2>
						{/* The session's single commit lands on this screen. */}
						{saveError && <p className="lq-composer__issue lq-composer__issue--blocker">{saveError}</p>}
						<div className="lq-io-row">
							<a className="lq-button lq-button--primary" href="/practice/">
								Go to practice →
							</a>
							<button type="button" className="lq-button" onClick={() => setScreen('chart')}>
								Back to the chart
							</button>
						</div>
					</div>
				)}
			/>
		);
	}

	if (screen === 'drill') {
		const sessionItem = session[index];
		if (!sessionItem) return null;
		return (
			<SessionView
				sessionItem={sessionItem}
				index={index}
				total={session.length}
				revealed={revealed}
				monoAnswers={monoAnswers}
				onReveal={() => setRevealed(true)}
				onGrade={advance}
				onQuit={() => setScreen('chart')}
			/>
		);
	}

	// Chart (home) screen
	return (
		<div className="lq-home">
			<div className="lq-today">
				<div className="lq-today__row">
					{newToday.length > 0 && (
						<button
							type="button"
							className="lq-button lq-button--primary lq-button--big"
							onClick={() => setScreen('intro')}
						>
							Learn today's {newToday.length} new {itemNoun}
							{newToday.length === 1 ? '' : 's'} →
						</button>
					)}
					<a
						className={`lq-button lq-button--big${newToday.length > 0 ? '' : ' lq-button--primary'}`}
						href="/practice/"
					>
						Go to today's practice →
					</a>
					<p className="lq-today__status">
						{newToday.length > 0
							? 'New concepts are learned here; questions and answers happen at practice.'
							: `No new ${itemNoun}s left today — reviews happen at practice.`}
					</p>
				</div>
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
								const isSuspended = suspended.has(item.id);
								const status = isSuspended ? 'suspended' : itemStatus(item, state, today);
								return (
									<button
										type="button"
										key={item.id}
										className={`lq-tile lq-tile--${status}${selectedItem?.id === item.id ? ' lq-tile--selected' : ''}`}
										onClick={() => setSelectedItem(selectedItem?.id === item.id ? null : item)}
										data-hover-title={item.syntax ?? item.term}
										data-hover-description={isSuspended ? 'Skipped — won’t be introduced' : item.description}
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
				<span><i className="lq-swatch lq-swatch--suspended" /> skipped</span>
			</div>

			{selectedItem && (
				<div className="lq-panel lq-reference">
					<p className="lq-eyebrow">{categoryOf(selectedItem.id)?.title}</p>
					<ItemDetails item={selectedItem} />
					{suspended.has(selectedItem.id) && (
						<button
							type="button"
							className="lq-button lq-button--ghost"
							onClick={() => unsuspend(selectedItem.id)}
						>
							Bring back to practice
						</button>
					)}
				</div>
			)}
		</div>
	);
}

// Drill-only — a flat, ungraded run through one category's prompts (see
// startDrill); grading and scheduling live at /practice.
function SessionView({
	sessionItem,
	index,
	total,
	revealed,
	monoAnswers,
	onReveal,
	onGrade,
	onQuit,
}: {
	sessionItem: SessionItem;
	index: number;
	total: number;
	revealed: boolean;
	monoAnswers: boolean;
	onReveal: () => void;
	onGrade: () => void;
	onQuit: () => void;
}) {
	const { prompt, item } = sessionItem;
	return (
		<div className="lq-session">
			<div className="lq-session__header">
				<button type="button" className="lq-quit" onClick={onQuit}>
					← Exit drill
				</button>
				<span className="lq-score">
					{index + 1} / {total}
				</span>
			</div>

			<div className="lq-panel">
				<p className="lq-eyebrow">
					Drill (won’t affect schedule) · <code className="lq-inline-cmd">{item.term}</code>
				</p>
				{item.photo && <img className="lq-item-photo" src={item.photo} alt="" />}
				<PromptQuestion q={prompt.q} kind={prompt.kind} revealed={revealed} />

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
							<code className="lq-answer__text">{prompt.a}</code>
						) : (
							<span className="lq-answer__text lq-answer__text--prose">{prompt.a}</span>
						)}
						{prompt.note && <p className="lq-answer__note">{prompt.note}</p>}
						<div className="lq-grade">
							<button type="button" className="lq-button lq-button--got" onClick={onGrade}>
								✓ Got it
							</button>
							<button type="button" className="lq-button lq-button--forgot" onClick={onGrade}>
								✗ Forgot
							</button>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
