import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { LearnDataset } from './types';
import type { PracticeDeck } from '../../data/practice-registry';
import { loadPeopleDeck } from './peopleDeckStore';
import {
	addDays,
	buildPromptsById,
	buildUnifiedQueue,
	clearLegacyBackup,
	computeDueCount,
	computeIntroducedTodayCount,
	computeNewAvailable,
	computeUnseenCount,
	emptyPracticeMeta,
	emptyState,
	finishPracticeSession,
	gradeCard,
	GLOBAL_DUE_CAP,
	GLOBAL_NEW_PER_DAY,
	loadPracticeMeta,
	loadState,
	localToday,
	mergePracticeMeta,
	mergeSrsState,
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
//
// Cross-device sync (plan §2.8): opt-in, via a per-device GitHub PAT posted
// to functions/api/practice-state.js (a Workers KV blob). Pulls merge into
// local state on load/focus/manual sync; pushes happen at session end and
// debounced mid-session. Sync failures degrade silently to local-only.

const SYNC_TOKEN_KEY = 'practice-sync-token';
const SYNC_LAST_KEY = 'practice-sync-last';
const PUSH_DEBOUNCE_MS = 4000;

type Screen = 'home' | 'session' | 'done';
type SyncStatus = 'idle' | 'syncing' | 'error';

function formatRelativeTime(iso: string): string {
	const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
	if (minutes < 1) return 'just now';
	if (minutes < 60) return `${minutes}m ago`;
	const hours = Math.round(minutes / 60);
	if (hours < 24) return `${hours}h ago`;
	return `${Math.round(hours / 24)}d ago`;
}

interface DeckCounts {
	due: number;
	newAvailable: number;
	unseen: number;
}

// Local decks (currently just people) have no build-time dataset — the
// registry's totalItems/totalPrompts for them stay 0 (see
// practice-registry.ts). Whichever of these loads a browser has actually
// imported (peopleDeckStore.ts) is the source of truth for that deck's real
// item count; every count below takes it as an optional override.
const LOCAL_DATASET_LOADERS: Record<string, () => Promise<LearnDataset | null>> = {
	people: loadPeopleDeck,
};

function totalItemsFor(deck: PracticeDeck, localDataset?: LearnDataset): number {
	if (!localDataset) return deck.totalItems;
	return localDataset.categories.reduce((n, c) => n + c.items.length, 0);
}

function countsFor(deck: PracticeDeck, state: SrsState, today: string, localDataset?: LearnDataset): DeckCounts {
	const due = computeDueCount(state, today);
	const introducedToday = computeIntroducedTodayCount(state, today);
	const unseen = computeUnseenCount(totalItemsFor(deck, localDataset), state);
	const newAvailable = computeNewAvailable(unseen, introducedToday, deck.newPerDay);
	return { due, newAvailable, unseen };
}

export default function PracticeSession({ registry }: { registry: PracticeDeck[] }) {
	const [today, setToday] = useState(() => localToday());
	const [perDeckState, setPerDeckState] = useState<Record<string, SrsState>>({});
	const [localDatasets, setLocalDatasets] = useState<Record<string, LearnDataset>>({});
	const [meta, setMeta] = useState<PracticeMeta | null>(null);
	const [screen, setScreen] = useState<Screen>('home');
	const [session, setSession] = useState<PracticeQueueItem[]>([]);
	const [index, setIndex] = useState(0);
	const [revealed, setRevealed] = useState(false);
	const [results, setResults] = useState({ got: 0, forgot: 0, learned: 0 });
	const [requeued, setRequeued] = useState<Set<string>>(new Set());
	const [starting, setStarting] = useState(false);
	const [startError, setStartError] = useState<string | null>(null);

	const [syncToken, setSyncToken] = useState<string | null>(null);
	const [tokenInput, setTokenInput] = useState('');
	const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
	const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
	const pushTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

	const deckById = useMemo(() => new Map(registry.map((d) => [d.id, d])), [registry]);

	// Load happens after hydration so the first client render matches the
	// prerendered HTML (built without localStorage).
	useEffect(() => {
		const perDeck: Record<string, SrsState> = {};
		for (const deck of registry) perDeck[deck.id] = loadState(deck.storageKey, deck.legacyKey);
		setPerDeckState(perDeck);

		const localDeckIds = registry.filter((d) => d.source.kind === 'local').map((d) => d.id);
		Promise.all(localDeckIds.map((id) => LOCAL_DATASET_LOADERS[id]?.()?.then((dataset) => [id, dataset] as const))).then(
			(entries) => {
				const next: Record<string, LearnDataset> = {};
				for (const entry of entries) {
					if (entry && entry[1]) next[entry[0]] = entry[1];
				}
				setLocalDatasets(next);
			},
		);

		const seedStreak = Math.max(0, ...registry.map((d) => perDeck[d.id]?.streak ?? 0));
		setMeta(loadPracticeMeta(seedStreak));
		setToday(localToday());
		setLastSyncedAt(window.localStorage.getItem(SYNC_LAST_KEY));
		setSyncToken(window.localStorage.getItem(SYNC_TOKEN_KEY));
		const onFocus = () => {
			setToday(localToday());
			const token = window.localStorage.getItem(SYNC_TOKEN_KEY);
			if (token) pullAndMerge(token);
		};
		window.addEventListener('focus', onFocus);
		return () => {
			window.removeEventListener('focus', onFocus);
			if (pushTimer.current) clearTimeout(pushTimer.current);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// Pull-and-merge whenever a token becomes available — first load (if
	// already connected) and right after "Connect this device".
	useEffect(() => {
		if (syncToken) pullAndMerge(syncToken);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [syncToken]);

	async function pullAndMerge(token: string) {
		setSyncStatus('syncing');
		try {
			const res = await fetch('/api/practice-state', { headers: { authorization: `Bearer ${token}` } });
			if (!res.ok) throw new Error(`sync GET ${res.status}`);
			const { blob } = await res.json();
			if (blob && typeof blob === 'object') {
				setPerDeckState((prev) => {
					const next = { ...prev };
					for (const deck of registry) {
						const remoteRaw = blob[deck.storageKey];
						if (!remoteRaw) continue;
						const remoteState: SrsState = { ...emptyState(), ...remoteRaw, version: 3 };
						const merged = mergeSrsState(next[deck.id] ?? emptyState(), remoteState);
						next[deck.id] = merged;
						saveState(deck.storageKey, merged);
					}
					return next;
				});
				const remoteMetaRaw = blob['practice-meta'];
				if (remoteMetaRaw) {
					setMeta((prev) => {
						if (!prev) return prev;
						const remoteMeta: PracticeMeta = { ...emptyPracticeMeta(), ...remoteMetaRaw, version: 1 };
						const merged = mergePracticeMeta(prev, remoteMeta);
						savePracticeMeta(merged);
						return merged;
					});
				}
			}
			const now = new Date().toISOString();
			window.localStorage.setItem(SYNC_LAST_KEY, now);
			setLastSyncedAt(now);
			setSyncStatus('idle');
		} catch {
			setSyncStatus('error');
		}
	}

	async function pushState(token: string, currentMeta: PracticeMeta) {
		setSyncStatus('syncing');
		try {
			const blob: Record<string, unknown> = {};
			for (const deck of registry) {
				const raw = window.localStorage.getItem(deck.storageKey);
				if (raw) blob[deck.storageKey] = JSON.parse(raw);
			}
			blob['practice-meta'] = currentMeta;
			const res = await fetch('/api/practice-state', {
				method: 'PUT',
				headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
				body: JSON.stringify(blob),
			});
			if (!res.ok) throw new Error(`sync PUT ${res.status}`);
			const now = new Date().toISOString();
			window.localStorage.setItem(SYNC_LAST_KEY, now);
			setLastSyncedAt(now);
			setSyncStatus('idle');
		} catch {
			setSyncStatus('error');
		}
	}

	// Debounced push while grading — coalesces rapid grades into one PUT.
	function schedulePush() {
		if (!syncToken || !meta) return;
		if (pushTimer.current) clearTimeout(pushTimer.current);
		const token = syncToken;
		const currentMeta = meta;
		pushTimer.current = setTimeout(() => pushState(token, currentMeta), PUSH_DEBOUNCE_MS);
	}

	function connectSync() {
		const token = tokenInput.trim();
		if (!token) return;
		window.localStorage.setItem(SYNC_TOKEN_KEY, token);
		setTokenInput('');
		setSyncToken(token);
	}

	function disconnectSync() {
		window.localStorage.removeItem(SYNC_TOKEN_KEY);
		setSyncToken(null);
		setSyncStatus('idle');
	}

	const disabledDecks = useMemo(() => new Set(meta?.disabledDecks ?? []), [meta]);

	const countsByDeck = useMemo(() => {
		const map = new Map<string, DeckCounts>();
		for (const deck of registry) {
			const state = perDeckState[deck.id];
			if (!state) continue;
			map.set(deck.id, countsFor(deck, state, today, localDatasets[deck.id]));
		}
		return map;
	}, [registry, perDeckState, today, localDatasets]);

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
				return c && (c.due > 0 || c.newAvailable > 0);
			});
			const fetched = await Promise.all(
				candidates.map(async (deck) => {
					if (deck.source.kind === 'json') {
						const res = await fetch(deck.source.href);
						if (!res.ok) return null;
						const dataset: LearnDataset = await res.json();
						return { deck, dataset };
					}
					// Local decks (e.g. people) are already loaded from IndexedDB on
					// mount — nothing to fetch, and nothing if this device has no
					// deck imported (the candidate filter above already excludes it,
					// since an empty dataset means zero due/new).
					const dataset = localDatasets[deck.id];
					if (!dataset) return null;
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

	// Skip-at-introduction (plan §4.4): a new item's learn card carries a
	// "Skip" action alongside "Got it — quiz me". Skipping suspends the item
	// permanently (practice-meta.suspended) rather than just for today — it
	// never counts against a deck's new budget again and never resurfaces,
	// until un-suspended from the item's wall-chart reference panel. Since
	// buildUnifiedQueue always emits a new item's learn card immediately
	// followed by all of its own prompts, the ones still ahead of `index`
	// are exactly this item's block and can be dropped as one contiguous run.
	function skipCurrentItem() {
		const current = session[index];
		if (current.kind !== 'learn') return;
		const { deckId, item } = current;

		setMeta((prev) => {
			if (!prev || prev.suspended.includes(item.id)) return prev;
			const next: PracticeMeta = { ...prev, suspended: [...prev.suspended, item.id] };
			savePracticeMeta(next);
			return next;
		});
		schedulePush();

		const filtered = session.filter((s, i) => i < index || !(s.deckId === deckId && s.item.id === item.id));
		setRevealed(false);
		setSession(filtered);
		if (index >= filtered.length) {
			finishPractice();
		}
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

			schedulePush();
		}

		setResults((r) => ({
			got: r.got + (gotIt ? 1 : 0),
			forgot: r.forgot + (gotIt ? 0 : 1),
			learned: r.learned + (current.isNew && gotIt ? 1 : 0),
		}));
		advanceWithin(activeSession);
	}

	function finishPractice() {
		if (meta) {
			const next = finishPracticeSession(meta, today);
			savePracticeMeta(next);
			setMeta(next);
			if (pushTimer.current) clearTimeout(pushTimer.current);
			if (syncToken) pushState(syncToken, next);
		}
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
						{current.item.photo && <img className="lq-item-photo" src={current.item.photo} alt="" />}
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
						<div className="lq-grade">
							<button type="button" className="lq-button lq-button--primary" onClick={advance}>
								Got it — quiz me →
							</button>
							<button type="button" className="lq-button lq-button--ghost" onClick={skipCurrentItem}>
								Skip — don't learn this
							</button>
						</div>
					</div>
				) : (
					<div className="lq-flip-wrap">
						<div className={`lq-flipcard${revealed ? ' lq-flipcard--flipped' : ''}`}>
							<button
								type="button"
								className="lq-flipcard__flip-btn"
								onClick={() => setRevealed((r) => !r)}
								aria-label="Flip card"
							>
								⟳
							</button>
							<div className="lq-flipcard__inner">
								<div className="lq-flipcard__face lq-flipcard__face--front">
									{current.item.photo && <img className="lq-item-photo" src={current.item.photo} alt="" />}
									<p className="lq-question">{current.prompt!.q}</p>
								</div>
								<div className="lq-flipcard__face lq-flipcard__face--back">
									<p className="lq-eyebrow">
										{deck && (
											<span className="lq-deck-badge">
												{deck.emoji} {deck.title}
											</span>
										)}
										{' '}
										<code className="lq-inline-cmd">{current.item.term}</code>
									</p>
									{deck?.monoAnswers ? (
										<code className="lq-answer__text">{current.prompt!.a}</code>
									) : (
										<span className="lq-answer__text lq-answer__text--prose">{current.prompt!.a}</span>
									)}
									{current.prompt!.note && <p className="lq-answer__note">{current.prompt!.note}</p>}
								</div>
							</div>
						</div>

						{!revealed ? (
							<div className="lq-flip-controls">
								<p className="lq-recall-hint">Answer in your head first — that’s the rep that counts.</p>
							</div>
						) : (
							<div className="lq-flip-controls">
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
					const totalItems = totalItemsFor(deck, localDatasets[deck.id]);
					return (
						<label key={deck.id} className={`lq-deck-row${disabled ? ' lq-deck-row--disabled' : ''}`}>
							<input type="checkbox" checked={!disabled} onChange={() => toggleDeck(deck.id)} />
							<span className="lq-deck-row__title">
								{deck.emoji} {deck.title}
							</span>
							<span className="lq-deck-row__meta">
								{totalItems} {deck.itemNoun}
								{totalItems === 1 ? '' : 's'}
								{deck.source.kind === 'local' && totalItems === 0 ? ' (not imported here)' : ''}
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

			<div className="lq-sync">
				<p className="lq-sync__title">Cross-device sync</p>
				{syncToken ? (
					<>
						<p className="lq-sync__status">
							{syncStatus === 'syncing'
								? 'Syncing…'
								: syncStatus === 'error'
									? 'Sync unavailable right now — practicing locally.'
									: lastSyncedAt
										? `Last synced ${formatRelativeTime(lastSyncedAt)}`
										: 'Connected — not yet synced'}
						</p>
						<div className="lq-io-row">
							<button type="button" className="lq-button" onClick={() => pullAndMerge(syncToken)}>
								Sync now
							</button>
							<button type="button" className="lq-button" onClick={disconnectSync}>
								Disconnect this device
							</button>
						</div>
					</>
				) : (
					<div className="lq-io-row">
						<input
							type="password"
							className="lq-sync__input"
							placeholder="Fine-grained GitHub PAT (Contents: read/write)"
							value={tokenInput}
							onChange={(e) => setTokenInput(e.target.value)}
						/>
						<button type="button" className="lq-button" onClick={connectSync} disabled={!tokenInput.trim()}>
							Connect this device
						</button>
					</div>
				)}
			</div>
		</div>
	);
}
