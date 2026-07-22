import React, { useEffect, useMemo, useState } from 'react';
import type { LearnDataset } from './types';
import type { PracticeDeck } from '../../data/practice-registry';
import {
	addDays,
	buildPromptsById,
	buildUnifiedQueue,
	clearLegacyBackup,
	computeDueCount,
	computeIntroducedTodayCount,
	computeNewAvailable,
	computeUnseenCount,
	emptyState,
	finishPracticeSession,
	gradeCard,
	GLOBAL_DUE_CAP,
	GLOBAL_NEW_PER_DAY,
	loadPracticeMeta,
	loadState,
	localToday,
	saveState,
	savePracticeMeta,
	type DeckSessionInput,
	type PracticeMeta,
	type PracticeQueueItem,
	type SrsState,
} from './engine';

// The unified daily ritual (plan §2): one queue across every deck in the
// registry, round-robin interleaved, grading against the shared FSRS engine.
// This is now the *only* place SrsState gets mutated — /learn/* pages keep
// their wall charts and no-op drills, but the "start today's review" button
// lives here (see LearningSystem.tsx, which links out instead).

type Screen = 'home' | 'session' | 'done';

interface DeckCounts {
	due: number;
	newAvailable: number;
	unseen: number;
}

function countsFor(deck: PracticeDeck, state: SrsState, today: string): DeckCounts {
	const due = computeDueCount(state, today);
	const introducedToday = computeIntroducedTodayCount(state, today);
	const unseen = computeUnseenCount(deck.totalItems, state);
	const newAvailable = computeNewAvailable(unseen, introducedToday, deck.newPerDay);
	return { due, newAvailable, unseen };
}

export default function PracticeSession({ registry }: { registry: PracticeDeck[] }) {
	const [today, setToday] = useState(() => localToday());
	const [perDeckState, setPerDeckState] = useState<Record<string, SrsState>>({});
	const [meta, setMeta] = useState<PracticeMeta | null>(null);
	const [screen, setScreen] = useState<Screen>('home');
	const [session, setSession] = useState<PracticeQueueItem[]>([]);
	const [index, setIndex] = useState(0);
	const [revealed, setRevealed] = useState(false);
	const [results, setResults] = useState({ got: 0, forgot: 0, learned: 0 });
	const [requeued, setRequeued] = useState<Set<string>>(new Set());
	const [starting, setStarting] = useState(false);
	const [startError, setStartError] = useState<string | null>(null);

	const deckById = useMemo(() => new Map(registry.map((d) => [d.id, d])), [registry]);

	// Load happens after hydration so the first client render matches the
	// prerendered HTML (built without localStorage).
	useEffect(() => {
		const perDeck: Record<string, SrsState> = {};
		for (const deck of registry) perDeck[deck.id] = loadState(deck.storageKey, deck.legacyKey);
		setPerDeckState(perDeck);
		const seedStreak = Math.max(0, ...registry.map((d) => perDeck[d.id]?.streak ?? 0));
		setMeta(loadPracticeMeta(seedStreak));
		setToday(localToday());
		const onFocus = () => setToday(localToday());
		window.addEventListener('focus', onFocus);
		return () => window.removeEventListener('focus', onFocus);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const disabledDecks = useMemo(() => new Set(meta?.disabledDecks ?? []), [meta]);

	const countsByDeck = useMemo(() => {
		const map = new Map<string, DeckCounts>();
		for (const deck of registry) {
			const state = perDeckState[deck.id];
			if (!state) continue;
			map.set(deck.id, countsFor(deck, state, today));
		}
		return map;
	}, [registry, perDeckState, today]);

	const activeDecks = registry.filter((d) => !disabledDecks.has(d.id));
	const totalDue = activeDecks.reduce((n, d) => n + Math.min(countsByDeck.get(d.id)?.due ?? 0, GLOBAL_DUE_CAP), 0);
	const totalNew = activeDecks.reduce((n, d) => n + (countsByDeck.get(d.id)?.newAvailable ?? 0), 0);
	const doneForToday = meta !== null && totalDue === 0 && totalNew === 0;

	async function startPractice() {
		if (!meta) return;
		setStarting(true);
		setStartError(null);
		try {
			const candidates = activeDecks.filter((deck) => {
				const c = countsByDeck.get(deck.id);
				return deck.source.kind === 'json' && c && (c.due > 0 || c.newAvailable > 0);
			});
			const fetched = await Promise.all(
				candidates.map(async (deck) => {
					if (deck.source.kind !== 'json') return null;
					const res = await fetch(deck.source.href);
					if (!res.ok) return null;
					const dataset: LearnDataset = await res.json();
					return { deck, dataset };
				}),
			);

			const deckInputs: DeckSessionInput[] = [];
			for (const entry of fetched) {
				if (!entry) continue;
				const { deck, dataset } = entry;
				const allItems = dataset.categories.flatMap((c) => c.items);
				deckInputs.push({
					deckId: deck.id,
					state: perDeckState[deck.id] ?? emptyState(),
					allItems,
					promptsById: buildPromptsById(allItems),
					introductionOrder: dataset.introductionOrder,
					dueCap: deck.dueCap,
					newPerDay: deck.newPerDay,
				});
			}

			const queue = buildUnifiedQueue({
				decks: deckInputs,
				today,
				suspended: new Set(meta.suspended),
				globalDueCap: GLOBAL_DUE_CAP,
				globalNewPerDay: GLOBAL_NEW_PER_DAY,
			});

			if (queue.length === 0) {
				setStartError('Nothing came back for today — try refreshing.');
				return;
			}

			setSession(queue);
			setIndex(0);
			setRevealed(false);
			setResults({ got: 0, forgot: 0, learned: 0 });
			setRequeued(new Set());
			setScreen('session');
		} catch {
			setStartError('Could not load today’s decks — check your connection and try again.');
		} finally {
			setStarting(false);
		}
	}

	function advanceWithin(activeSession: PracticeQueueItem[]) {
		setRevealed(false);
		if (index + 1 < activeSession.length) {
			setIndex(index + 1);
		} else {
			finishPractice();
		}
	}

	function advance() {
		advanceWithin(session);
	}

	function gradeCurrent(gotIt: boolean) {
		const current = session[index];
		if (current.kind !== 'prompt' || !current.prompt) return;
		const promptId = current.prompt.id;
		const deck = deckById.get(current.deckId);

		let activeSession = session;
		if (deck) {
			setPerDeckState((prev) => {
				const prevState = prev[deck.id] ?? emptyState();
				const next = gradeCard(prevState, current.item.id, promptId, gotIt, today);
				saveState(deck.storageKey, next);
				return { ...prev, [deck.id]: next };
			});

			// Same-session second chance for a miss — see engine.ts / plan §2.6.
			const requeueKey = `${current.deckId}:${promptId}`;
			if (!gotIt && !requeued.has(requeueKey)) {
				setRequeued((prev) => new Set(prev).add(requeueKey));
				activeSession = [...session, { ...current }];
				setSession(activeSession);
			}
		}

		setResults((r) => ({
			got: r.got + (gotIt ? 1 : 0),
			forgot: r.forgot + (gotIt ? 0 : 1),
			learned: r.learned + (current.isNew && gotIt ? 1 : 0),
		}));
		advanceWithin(activeSession);
	}

	function finishPractice() {
		setMeta((prev) => {
			if (!prev) return prev;
			const next = finishPracticeSession(prev, today);
			savePracticeMeta(next);
			return next;
		});
		for (const deck of registry) clearLegacyBackup(deck.storageKey);
		setScreen('done');
	}

	function toggleDeck(deckId: string) {
		setMeta((prev) => {
			if (!prev) return prev;
			const has = prev.disabledDecks.includes(deckId);
			const next: PracticeMeta = {
				...prev,
				disabledDecks: has ? prev.disabledDecks.filter((id) => id !== deckId) : [...prev.disabledDecks, deckId],
			};
			savePracticeMeta(next);
			return next;
		});
	}

	function exportState() {
		const blob: Record<string, unknown> = {};
		for (const deck of registry) {
			const raw = window.localStorage.getItem(deck.storageKey);
			if (raw) blob[deck.storageKey] = JSON.parse(raw);
		}
		if (meta) blob['practice-meta'] = meta;
		const json = JSON.stringify(blob, null, 2);
		const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
		const a = document.createElement('a');
		a.href = url;
		a.download = `practice-backup-${today}.json`;
		a.click();
		URL.revokeObjectURL(url);
	}

	function importState(e: React.ChangeEvent<HTMLInputElement>) {
		const file = e.target.files?.[0];
		if (!file) return;
		file.text().then((text) => {
			try {
				const parsed = JSON.parse(text);
				for (const [key, value] of Object.entries(parsed)) {
					window.localStorage.setItem(key, JSON.stringify(value));
				}
				window.location.reload();
			} catch {
				setStartError('That file doesn’t look like a practice export.');
			}
		});
		e.target.value = '';
	}

	if (meta === null) return null;

	if (screen === 'session') {
		const current = session[index];
		if (!current) return null;
		const deck = deckById.get(current.deckId);
		return (
			<div className="lq-session">
				<div className="lq-session__header">
					<button type="button" className="lq-quit" onClick={() => setScreen('home')}>
						← Stop
					</button>
					<span className="lq-score">
						{index + 1} / {session.length}
					</span>
				</div>

				{current.kind === 'learn' ? (
					<div className="lq-panel">
						<p className="lq-eyebrow">
							{deck && (
								<span className="lq-deck-badge">
									{deck.emoji} {deck.title}
								</span>
							)}
							{' '}New {deck?.itemNoun ?? 'item'}
						</p>
						{current.item.syntax ? (
							<code className="lq-command">{current.item.syntax}</code>
						) : (
							<p className="lq-term">{current.item.term}</p>
						)}
						<p className="lq-description">{current.item.description}</p>
						{current.item.example && (
							<div className="lq-example">
								<code>{current.item.example}</code>
								{current.item.exampleNote && <p className="lq-example__note">{current.item.exampleNote}</p>}
							</div>
						)}
						{current.item.href && (
							<a className="lq-note-link" href={current.item.href} target="_blank" rel="noopener">
								Read the full note →
							</a>
						)}
						<button type="button" className="lq-button lq-button--primary" onClick={advance}>
							Got it — quiz me →
						</button>
					</div>
				) : (
					<div className="lq-panel">
						<p className="lq-eyebrow">
							{deck && (
								<span className="lq-deck-badge">
									{deck.emoji} {deck.title}
								</span>
							)}
							{' '}
							<code className="lq-inline-cmd">{current.item.term}</code>
						</p>
						<p className="lq-question">{current.prompt!.q}</p>

						{!revealed ? (
							<div className="lq-recall-hint-wrap">
								<p className="lq-recall-hint">Answer in your head first — that’s the rep that counts.</p>
								<button type="button" className="lq-button lq-button--primary" onClick={() => setRevealed(true)}>
									Show answer
								</button>
							</div>
						) : (
							<div className="lq-answer">
								{deck?.monoAnswers ? (
									<code className="lq-answer__text">{current.prompt!.a}</code>
								) : (
									<span className="lq-answer__text lq-answer__text--prose">{current.prompt!.a}</span>
								)}
								{current.prompt!.note && <p className="lq-answer__note">{current.prompt!.note}</p>}
								<div className="lq-grade">
									<button type="button" className="lq-button lq-button--got" onClick={() => gradeCurrent(true)}>
										✓ Got it
									</button>
									<button type="button" className="lq-button lq-button--forgot" onClick={() => gradeCurrent(false)}>
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

	if (screen === 'done') {
		const tomorrow = addDays(today, 1);
		const tomorrowDue = registry.reduce((n, deck) => {
			const state = perDeckState[deck.id];
			if (!state) return n;
			return n + Object.values(state.cards).filter((c) => c.due <= tomorrow).length;
		}, 0);
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
						<span className="lq-stat__value">{meta.streak}</span>
						<span className="lq-stat__label">day streak</span>
					</div>
					<div className="lq-stat">
						<span className="lq-stat__value">{tomorrowDue}</span>
						<span className="lq-stat__label">cards due tomorrow</span>
					</div>
				</div>
				<button type="button" className="lq-button" onClick={() => setScreen('home')}>
					Back to practice
				</button>
			</div>
		);
	}

	// Home screen
	return (
		<div className="lq-practice-home">
			<div className="lq-today">
				{doneForToday ? (
					<div className="lq-today__row">
						<p className="lq-today__status">✓ Everything's caught up. Come back tomorrow.</p>
					</div>
				) : (
					<div className="lq-today__row">
						<button
							type="button"
							className="lq-button lq-button--primary lq-button--big"
							onClick={startPractice}
							disabled={starting}
						>
							{starting ? 'Loading…' : 'Start today’s practice'}
						</button>
						<p className="lq-today__status">
							{totalDue > 0 ? `${totalDue} due` : 'nothing due'}
							{totalNew > 0 ? ` · ${totalNew} new` : ''}
							{meta.streak > 0 ? ` · ${meta.streak}-day streak` : ''}
						</p>
					</div>
				)}
				{startError && <p className="lq-today__status lq-today__status--error">{startError}</p>}
			</div>

			<div className="lq-deck-list">
				{registry.map((deck) => {
					const counts = countsByDeck.get(deck.id);
					const disabled = disabledDecks.has(deck.id);
					return (
						<label key={deck.id} className={`lq-deck-row${disabled ? ' lq-deck-row--disabled' : ''}`}>
							<input type="checkbox" checked={!disabled} onChange={() => toggleDeck(deck.id)} />
							<span className="lq-deck-row__title">
								{deck.emoji} {deck.title}
							</span>
							<span className="lq-deck-row__meta">
								{deck.totalItems} {deck.itemNoun}
								{deck.totalItems === 1 ? '' : 's'}
								{counts && !disabled
									? counts.due > 0 || counts.newAvailable > 0
										? ` · ${counts.due} due · ${counts.newAvailable} new`
										: ' · ✓ done'
									: ''}
							</span>
							{deck.learnHref && (
								<a className="lq-deck-row__link" href={deck.learnHref}>
									wall chart →
								</a>
							)}
						</label>
					);
				})}
			</div>

			<div className="lq-io-row">
				<button type="button" className="lq-button" onClick={exportState}>
					Export backup
				</button>
				<label className="lq-button lq-import-label">
					Import backup
					<input type="file" accept="application/json" onChange={importState} hidden />
				</label>
			</div>
		</div>
	);
}
