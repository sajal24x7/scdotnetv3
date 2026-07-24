import React, { useEffect, useState } from 'react';
import type { Category, LearnItem, LearnSystemConfig } from './types';
import {
	emptyState,
	itemStatus,
	loadPracticeMeta,
	loadState,
	localToday,
	savePracticeMeta,
	type SessionItem,
	type SrsState,
} from './engine';

// UI for the per-domain wall chart + reference panel + no-op drills.
// Scheduling and persistence live in ./engine. The daily review session
// that used to live here now happens at /practice, the one place SrsState
// gets mutated (unified-practice plan §1) — this component only reads state
// to color the wall chart and never grades against it. Parameterized by
// LearnSystemConfig so /learn/linux, /learn/finnish, etc. share one engine.

type Screen = 'chart' | 'drill';

export default function LearningSystem({ config }: { config: LearnSystemConfig }) {
	const { storageKey, legacyKey, itemNoun, monoAnswers, dataset } = config;
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
	// happens on /practice, but the wall chart is where you'd notice a word
	// muted out and decide to bring it back.
	const [suspended, setSuspended] = useState<Set<string>>(new Set());

	// Load persisted state after hydration, and re-check the date when the tab
	// regains focus (page left open overnight).
	useEffect(() => {
		setState(loadState(storageKey, legacyKey));
		setSuspended(new Set(loadPracticeMeta(0).suspended));
		setToday(localToday());
		const onFocus = () => setToday(localToday());
		window.addEventListener('focus', onFocus);
		return () => window.removeEventListener('focus', onFocus);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	function unsuspend(itemId: string) {
		const meta = loadPracticeMeta(0);
		const next = { ...meta, suspended: meta.suspended.filter((id) => id !== itemId) };
		savePracticeMeta(next);
		setSuspended(new Set(next.suspended));
	}

	function startDrill(category: Category) {
		const items: SessionItem[] = category.items.flatMap((item) =>
			item.prompts.map((prompt) => ({ kind: 'prompt' as const, item, prompt })),
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

	// Drills never touch scheduler state — grading here is just the
	// self-assessment click, for the learner's own benefit while cramming.
	function gradeCurrent() {
		advance();
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
				onGrade={gradeCurrent}
				onQuit={() => setScreen('chart')}
			/>
		);
	}

	// Chart (home) screen
	return (
		<div className="lq-home">
			<div className="lq-today">
				<div className="lq-today__row">
					<a className="lq-button lq-button--primary lq-button--big" href="/practice/">
						Go to today's practice →
					</a>
					<p className="lq-today__status">
						Reviews and new {itemNoun}s for every deck happen in one place now.
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
					{selectedItem.photo && <img className="lq-item-photo" src={selectedItem.photo} alt="" />}
					{selectedItem.syntax ? (
						<code className="lq-command">{selectedItem.syntax}</code>
					) : (
						<p className="lq-term">{selectedItem.term}</p>
					)}
					<p className="lq-description">{selectedItem.description}</p>
					{selectedItem.explanation && <p className="lq-explanation">{selectedItem.explanation}</p>}
					{selectedItem.examples && selectedItem.examples.length > 0 ? (
						<div className="lq-examples">
							{selectedItem.examples.map((ex, i) => (
								<div className="lq-example" key={i}>
									<code>{ex.code}</code>
									{ex.note && <p className="lq-example__note">{ex.note}</p>}
								</div>
							))}
						</div>
					) : (
						selectedItem.example && (
							<div className="lq-example">
								<code>{selectedItem.example}</code>
								{selectedItem.exampleNote && <p className="lq-example__note">{selectedItem.exampleNote}</p>}
							</div>
						)
					)}
					{selectedItem.href && (
						<a className="lq-note-link" href={selectedItem.href}>
							Read the note →
						</a>
					)}
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

// Drill-only now — the daily review flow (and its "new item" learn cards)
// moved to PracticeSession.tsx at /practice. A drill is always a flat list
// of prompts for one category (see startDrill), so there's no 'learn'-kind
// item and no schedule to protect against grading.
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
					Drill (won’t affect schedule) · <code className="lq-inline-cmd">{sessionItem.item.term}</code>
				</p>
				{sessionItem.item.photo && <img className="lq-item-photo" src={sessionItem.item.photo} alt="" />}
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
