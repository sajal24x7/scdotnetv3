import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { LearnDataset } from './types';
import type { PracticeDeck } from '../../data/practice-registry';
import { loadPeopleDeck } from './peopleDeckStore';
import { PromptQuestion } from './ItemDetails';
import { loadSyncToken, SYNC_LAST_KEY } from './sync';
import { SignInPanel, useSession } from '../auth/SignIn';
import {
	applyAuthoredPrompts,
	AUTHORED_CACHE_KEY,
	emptyAuthoredStore,
	introducedItemIdsFor,
	loadAuthoredCache,
	loadAuthoredForSession,
	mergeAuthored,
	pullAuthored,
	saveAuthoredCache,
	type AuthoredStore,
} from './authoredPrompts';
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
// Since the learn/practice split, this page is Q&A only — questions and
// answers for concepts already introduced. New concepts are introduced on
// the learn side (/learn/new, or a deck's own /learn/<topic> page); a home-
// screen nudge points there whenever today's new budget has anything left.
//
// Cross-device sync (plan §2.8): opt-in, via a per-device GitHub PAT posted
// to functions/api/practice-state.js (a Workers KV blob). Pulls merge into
// local state on load/focus/manual sync; pushes happen at session end and
// debounced mid-session. Sync failures degrade silently to local-only.
//
// One token per device covers everything: the same PAT authenticates the
// state blob and the authored-prompt commits, and if /write is already set
// up in this browser its token is picked up automatically (see sync.ts) —
// there's nothing to paste twice.

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
	const [results, setResults] = useState({ got: 0, forgot: 0 });
	const [requeued, setRequeued] = useState<Set<string>>(new Set());
	const [starting, setStarting] = useState(false);
	const [startError, setStartError] = useState<string | null>(null);
	// Prompts written since the last deploy (see authoredPrompts.ts): the
	// datasets fetched below carry whatever the build baked in, and this
	// overlays anything newer this device knows about.
	const [authored, setAuthored] = useState<AuthoredStore>(emptyAuthoredStore);

	// Sync follows the site's sign-in: signed in means on. Signing in from the
	// panel below re-renders this through the session subscription, which is
	// what kicks off the first pull.
	const { token: syncToken } = useSession();
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

		// Cache first so the first render has something, then the full load —
		// repo pull plus the one-time migration of pre-authoring prompts. Without
		// the migration here, a device that only ever opens /practice would find
		// its pre-existing cards resolving to no prompt at all.
		setAuthored(loadAuthoredCache());
		loadAuthoredForSession({
			introducedItemIds: introducedItemIdsFor(registry, perDeck),
			token: loadSyncToken(),
		})
			.then(setAuthored)
			.catch(() => {
				// Cache plus the build's copy still apply.
			});

		const seedStreak = Math.max(0, ...registry.map((d) => perDeck[d.id]?.streak ?? 0));
		setMeta(loadPracticeMeta(seedStreak));
		setToday(localToday());
		setLastSyncedAt(window.localStorage.getItem(SYNC_LAST_KEY));
		const onFocus = () => {
			setToday(localToday());
			const token = loadSyncToken();
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
			// Authored prompts ride the same token and the same moments as the
			// state blob, but a different store (the repo, not KV) — a concept
			// introduced on the phone this morning is useless here without the
			// questions that were written for it.
			try {
				const remote = await pullAuthored(token);
				if (remote) {
					setAuthored((prev) => {
						const merged = mergeAuthored(prev, remote);
						saveAuthoredCache(merged);
						return merged;
					});
				}
			} catch {
				// Degrade to the cache plus whatever the build shipped.
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
	// Mirrors buildUnifiedQueue's two-stage capping: each deck contributes at
	// most its own dueCap, and the total is then clamped to the global cap.
	// Capping per deck *before* summing (as this once did) inflates the number
	// by up to GLOBAL_DUE_CAP per deck — after a break it would promise "94
	// due" for a session that will only ever serve 20, which is exactly the
	// backlog dread the cap exists to prevent.
	const totalDue = Math.min(
		activeDecks.reduce((n, d) => n + Math.min(countsByDeck.get(d.id)?.due ?? 0, d.dueCap), 0),
		GLOBAL_DUE_CAP,
	);
	// New concepts aren't part of this page anymore — the count only feeds the
	// "waiting on the Learn page" nudge below, capped at what /learn/new
	// would actually offer today.
	const totalNew = Math.min(
		activeDecks.reduce((n, d) => n + (countsByDeck.get(d.id)?.newAvailable ?? 0), 0),
		GLOBAL_NEW_PER_DAY,
	);
	const doneForToday = meta !== null && totalDue === 0;

	async function startPractice() {
		if (!meta) return;
		setStarting(true);
		setStartError(null);
		try {
			const candidates = activeDecks.filter((deck) => (countsByDeck.get(deck.id)?.due ?? 0) > 0);
			const fetched = await Promise.all(
				candidates.map(async (deck) => {
					if (deck.source.kind === 'json') {
						const res = await fetch(deck.source.href);
						if (!res.ok) return null;
						const dataset: LearnDataset = await res.json();
						return { deck, dataset: applyAuthoredPrompts(dataset, authored) };
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
			});

			if (queue.length === 0) {
				setStartError('Nothing came back for today — try refreshing.');
				return;
			}

			setSession(queue);
			setIndex(0);
			setRevealed(false);
			setResults({ got: 0, forgot: 0 });
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

	function gradeCurrent(gotIt: boolean) {
		const current = session[index];
		if (!current) return;
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
		// Authored prompts live in the repo, but include this device's cache
		// too: a prompt written minutes ago may not have been committed yet,
		// and a backup that silently omits it isn't a backup.
		blob[AUTHORED_CACHE_KEY] = loadAuthoredCache();
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

				<div className="lq-flip-wrap">
					<div
						className={`lq-flipcard${revealed ? ' lq-flipcard--flipped' : ''}`}
						role="button"
						tabIndex={0}
						aria-label="Flip card"
						onClick={() => setRevealed((r) => !r)}
						onKeyDown={(e) => {
							if (e.key === 'Enter' || e.key === ' ') {
								e.preventDefault();
								setRevealed((r) => !r);
							}
						}}
					>
						<span className="lq-flipcard__flip-icon" aria-hidden="true">
							⟳
						</span>
						<div className="lq-flipcard__inner">
							<div className="lq-flipcard__face lq-flipcard__face--front">
								{current.item.photo && <img className="lq-item-photo" src={current.item.photo} alt="" />}
								<PromptQuestion q={current.prompt.q} kind={current.prompt.kind} revealed={false} />
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
								{current.prompt.kind === 'cloze' && (
									<PromptQuestion q={current.prompt.q} kind="cloze" revealed={true} />
								)}
								{deck?.monoAnswers ? (
									<code className="lq-answer__text">{current.prompt.a}</code>
								) : (
									<span className="lq-answer__text lq-answer__text--prose">{current.prompt.a}</span>
								)}
								{current.prompt.note && <p className="lq-answer__note">{current.prompt.note}</p>}
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
							{meta.streak > 0 ? ` · ${meta.streak}-day streak` : ''}
						</p>
					</div>
				)}
				{totalNew > 0 && (
					<p className="lq-today__status">
						{totalNew} new concept{totalNew === 1 ? '' : 's'} waiting on the{' '}
						<a href="/learn/new/">Learn page</a> — learn first, then practice.
					</p>
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
						</div>
						<SignInPanel compact />
					</>
				) : (
					<SignInPanel
						compact
						lead="Sign in to sync review state across your devices and to save the prompts you write. Everything on this page works without it — it just stays on this device."
					/>
				)}
			</div>
		</div>
	);
}
