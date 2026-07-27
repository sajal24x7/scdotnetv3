import React, { useEffect, useState } from 'react';
import type { LearnDataset, Prompt } from './types';
import type { PracticeDeck } from '../../data/practice-registry';
import { loadPeopleDeck } from './peopleDeckStore';
import { IntroFlow, type IntroCard } from './IntroFlow';
import {
	buildNewToday,
	computeIntroducedTodayCount,
	computeNewAvailable,
	computeUnseenCount,
	emptyPracticeMeta,
	emptyState,
	GLOBAL_NEW_PER_DAY,
	introduceItem,
	loadPracticeMeta,
	loadState,
	localToday,
	mergePracticeMeta,
	mergeSrsState,
	savePracticeMeta,
	saveState,
	type DeckSessionInput,
	type PracticeMeta,
	type SrsState,
} from './engine';
import { loadSyncToken, pullBlob, pushBlobFromLocalStorage } from './sync';
import {
	applyAuthoredPrompts,
	emptyAuthoredStore,
	introducedItemIdsFor,
	loadAuthoredForSession,
	recordAuthored,
	type AuthoredStore,
} from './authoredPrompts';

// The combined "new today" page (/learn/new): every deck's new-concept
// budget for today, round-robin across decks up to the global cap, as full
// reference cards with an accept/skip decision each. This is the learn half
// of the learn/practice split — accepting a concept here marks it introduced
// and seeds its prompts due-today, so they show up at /practice immediately;
// /practice itself never introduces anything.
//
// For decks that set `authorPrompts` this page is also where the prompts get
// written: those decks ship reference cards with no questions, and accepting
// a concept means composing the questions that will test it (IntroFlow ->
// PromptComposer). They're cached locally so today's practice has them
// immediately, and committed to the repo via /api/practice-prompts. See
// docs/architecture/learning-systems.md § "Authored prompts".

const LOCAL_DATASET_LOADERS: Record<string, () => Promise<LearnDataset | null>> = {
	people: loadPeopleDeck,
};

type Phase = 'loading' | 'ready' | 'empty' | 'error';

export default function NewToday({ registry }: { registry: PracticeDeck[] }) {
	const [phase, setPhase] = useState<Phase>('loading');
	const [cards, setCards] = useState<IntroCard[]>([]);
	const [meta, setMeta] = useState<PracticeMeta | null>(null);
	const [, setPerDeckState] = useState<Record<string, SrsState>>({});
	const [saveError, setSaveError] = useState<string | null>(null);
	const [, setAuthoredStore] = useState<AuthoredStore>(emptyAuthoredStore);

	useEffect(() => {
		let cancelled = false;
		(async () => {
			const today = localToday();

			// Load local state, then fold in the remote blob when sync is on —
			// a concept introduced on another device this morning shouldn't be
			// offered again here.
			const perDeck: Record<string, SrsState> = {};
			for (const deck of registry) perDeck[deck.id] = loadState(deck.storageKey, deck.legacyKey);
			let currentMeta = loadPracticeMeta(Math.max(0, ...registry.map((d) => perDeck[d.id]?.streak ?? 0)));

			const token = loadSyncToken();
			if (token) {
				try {
					const blob = await pullBlob(token);
					if (blob) {
						for (const deck of registry) {
							const remoteRaw = blob[deck.storageKey];
							if (!remoteRaw) continue;
							const remote: SrsState = { ...emptyState(), ...(remoteRaw as Partial<SrsState>), version: 3 };
							perDeck[deck.id] = mergeSrsState(perDeck[deck.id] ?? emptyState(), remote);
							saveState(deck.storageKey, perDeck[deck.id]);
						}
						const remoteMetaRaw = blob['practice-meta'];
						if (remoteMetaRaw) {
							currentMeta = mergePracticeMeta(currentMeta, {
								...emptyPracticeMeta(),
								...(remoteMetaRaw as Partial<PracticeMeta>),
								version: 1,
							});
							savePracticeMeta(currentMeta);
						}
					}
				} catch {
					// Sync failures degrade silently to local-only, as everywhere else.
				}
			}

			// Authored prompts: this device's cache, the live repo copy, and the
			// one-time migration of pre-authoring prompts — see
			// authoredPrompts.ts. /practice runs the same call on mount.
			const authored = await loadAuthoredForSession({
				introducedItemIds: introducedItemIdsFor(registry, perDeck),
				token,
			});
			if (!cancelled) setAuthoredStore(authored);

			// Only fetch datasets for decks that can actually contribute a new
			// item today (enabled, budget left, something unseen).
			const disabled = new Set(currentMeta.disabledDecks);
			const candidates = registry.filter((deck) => {
				if (disabled.has(deck.id)) return false;
				const state = perDeck[deck.id] ?? emptyState();
				const unseen = computeUnseenCount(deck.totalItems, state);
				const budget = computeNewAvailable(unseen, computeIntroducedTodayCount(state, today), deck.newPerDay);
				// Local decks report totalItems 0 in the registry; let their real
				// dataset (if imported on this device) decide below.
				return budget > 0 || deck.source.kind === 'local';
			});

			const fetched = await Promise.all(
				candidates.map(async (deck) => {
					try {
						if (deck.source.kind === 'json') {
							const res = await fetch(deck.source.href);
							if (!res.ok) return null;
							return { deck, dataset: (await res.json()) as LearnDataset };
						}
						const dataset = await LOCAL_DATASET_LOADERS[deck.id]?.();
						return dataset ? { deck, dataset } : null;
					} catch {
						return null;
					}
				}),
			);

			const deckInputs: DeckSessionInput[] = [];
			for (const entry of fetched) {
				if (!entry) continue;
				// The build already baked in everything committed as of the last
				// deploy; this overlays anything authored since.
				const dataset = applyAuthoredPrompts(entry.dataset, authored);
				const allItems = dataset.categories.flatMap((c) => c.items);
				deckInputs.push({
					deckId: entry.deck.id,
					state: perDeck[entry.deck.id] ?? emptyState(),
					allItems,
					promptsById: new Map(),
					introductionOrder: dataset.introductionOrder,
					dueCap: entry.deck.dueCap,
					newPerDay: entry.deck.newPerDay,
				});
			}

			const picked = buildNewToday({
				decks: deckInputs,
				today,
				suspended: new Set(currentMeta.suspended),
				globalNewPerDay: GLOBAL_NEW_PER_DAY,
				// Guarantee at least one English word (vocab) and one Finnish word
				// (finnish, falling back to finnish-vocab) among today's picks —
				// otherwise plain round-robin in registry order lets linux/finnish/
				// finnish-vocab/til/evergreen fill the global cap before vocab is
				// ever reached.
				guaranteedGroups: [['vocab'], ['finnish', 'finnish-vocab']],
			});

			if (cancelled) return;
			const deckById = new Map(registry.map((d) => [d.id, d]));
			setPerDeckState(perDeck);
			setMeta(currentMeta);
			setCards(
				picked.map(({ deckId, item }) => {
					const deck = deckById.get(deckId)!;
					return {
						deckId,
						item,
						badge: { emoji: deck.emoji, title: deck.title },
						itemNoun: deck.itemNoun,
						authorPrompts: deck.authorPrompts,
					};
				}),
			);
			setPhase(picked.length > 0 ? 'ready' : 'empty');
		})().catch(() => {
			if (!cancelled) setPhase('error');
		});
		return () => {
			cancelled = true;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	function pushSync(currentMeta: PracticeMeta) {
		const token = loadSyncToken();
		if (!token) return;
		pushBlobFromLocalStorage(
			registry.map((d) => d.storageKey),
			currentMeta,
			token,
		).catch(() => {
			// silent — local state is already saved
		});
	}

	function handleLearn(card: IntroCard, prompts: Prompt[]) {
		const deck = registry.find((d) => d.id === card.deckId);
		if (!deck || !meta) return;

		// The prompts the learner just wrote are what gets scheduled, so attach
		// them to the item before introducing it — introduceItem seeds one FSRS
		// card per prompt, and an item introduced with none would sit in the
		// deck testing nothing.
		const item = deck.authorPrompts ? { ...card.item, prompts } : card.item;
		setPerDeckState((prev) => {
			const next = introduceItem(prev[card.deckId] ?? emptyState(), item, localToday());
			saveState(deck.storageKey, next);
			return { ...prev, [card.deckId]: next };
		});
		pushSync(meta);

		if (deck.authorPrompts) {
			setSaveError(null);
			recordAuthored(card.item.id, prompts, loadSyncToken()).then((result) => {
				setAuthoredStore(result.store);
				// The prompts are cached and already scheduled either way; this
				// only says whether they reached the repo, which is what makes
				// them durable and visible on other devices.
				setSaveError(
					result.committed
						? null
						: `Saved on this device, but not to the repo — ${result.error ?? 'unknown error'}`,
				);
			});
		}
	}

	function handleSkip(card: IntroCard) {
		setMeta((prev) => {
			if (!prev) return prev;
			if (prev.suspended.includes(card.item.id)) return prev;
			const next: PracticeMeta = { ...prev, suspended: [...prev.suspended, card.item.id] };
			savePracticeMeta(next);
			pushSync(next);
			return next;
		});
	}

	if (phase === 'loading') return <p className="lq-today__status">Loading today's new concepts…</p>;
	if (phase === 'error') return <p className="lq-today__status lq-today__status--error">Couldn't load today's decks — check your connection and try again.</p>;
	if (phase === 'empty') {
		return (
			<div className="lq-done">
				<p className="lq-eyebrow">Nothing new today</p>
				<p className="lq-done__message">
					Every deck's new-concept budget for today is used up (or paused). Reviews still run at{' '}
					<a href="/practice/">practice</a>.
				</p>
			</div>
		);
	}

	return (
		<IntroFlow
			cards={cards}
			saveError={saveError}
			onLearn={handleLearn}
			onSkip={handleSkip}
			onQuit={() => {
				window.location.href = '/learn/';
			}}
			doneView={(learned) => (
				<div className="lq-done">
					<p className="lq-eyebrow">New concepts done</p>
					<h2 className="lq-done__headline">
						{learned} new concept{learned === 1 ? '' : 's'} added to today's practice
					</h2>
					<p className="lq-done__message">
						{learned > 0
							? 'Their questions are already waiting in today\'s queue — quiz yourself while it\'s fresh.'
							: 'Nothing added — come back tomorrow for a fresh batch.'}
					</p>
					<a className="lq-button lq-button--primary" href="/practice/">
						Go to practice →
					</a>
				</div>
			)}
		/>
	);
}
