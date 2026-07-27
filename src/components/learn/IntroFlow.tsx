import React, { useEffect, useRef, useState } from 'react';
import type { LearnItem, Prompt } from './types';
import { ItemDetails } from './ItemDetails';
import {
	composerBlocker,
	draftsToPrompts,
	promptsToDrafts,
	PromptComposer,
	type DraftPrompt,
} from './PromptComposer';

// The learn-side counterpart to a practice session: today's new concepts,
// one full reference card at a time, with an explicit accept/skip decision
// per item. Used by /learn/new (cross-deck, with deck badges) and by each
// deck's own wall-chart page (single deck). Purely presentational — the
// parent persists introductions/skips and decides what "done" means.
//
// For decks that set `authorPrompts` (linux, finnish, finnish-vocab, vocab)
// the card also carries a prompt composer: those decks ship reference content
// only, and a concept isn't introduced until its questions have been written.
// The prompts come back through `onLearn` for the parent to store; on every
// other deck `onLearn` is called with the item's own prompts unchanged.
//
// `onLearn` is a local save only. The session's writes are committed together
// when it ends — `onSessionEnd` fires exactly once, whether the last card was
// answered or the learner stopped part-way — which is what keeps a morning of
// new concepts to one commit instead of one per card.

export interface IntroCard {
	deckId: string;
	item: LearnItem;
	badge?: { emoji: string; title: string };
	itemNoun: string;
	// From the deck's config — true means "write the prompts here".
	authorPrompts?: boolean;
}

export function IntroFlow({
	cards,
	onLearn,
	onSkip,
	onQuit,
	onSessionEnd,
	doneView,
	saveError,
}: {
	cards: IntroCard[];
	onLearn: (card: IntroCard, prompts: Prompt[]) => void;
	onSkip: (card: IntroCard) => void;
	onQuit: () => void;
	// Fired once when the session is over — the parent commits here. Quitting
	// waits on it, so a commit isn't cut short by navigating away.
	onSessionEnd?: () => void | Promise<void>;
	doneView: (learned: number) => React.ReactNode;
	// Surfaced from the parent's last save attempt — a commit that didn't
	// reach the repo must not look like a clean success.
	saveError?: string | null;
}) {
	const [index, setIndex] = useState(0);
	const [learned, setLearned] = useState(0);
	// Keyed by item id so paging back and forth (or a re-render) doesn't lose
	// what's been typed for a card.
	const [draftsByItem, setDraftsByItem] = useState<Record<string, DraftPrompt[]>>({});
	const [showBlocker, setShowBlocker] = useState(false);
	const [quitting, setQuitting] = useState(false);

	// One end per session, however it ends: the last card, or the Stop button.
	const ended = useRef(false);
	const endSession = React.useCallback(async () => {
		if (ended.current) return;
		ended.current = true;
		await onSessionEnd?.();
	}, [onSessionEnd]);

	const done = index >= cards.length;
	useEffect(() => {
		if (done) void endSession();
	}, [done, endSession]);

	async function quit() {
		setQuitting(true);
		await endSession();
		onQuit();
	}

	if (done) return <>{doneView(learned)}</>;

	const card = cards[index];
	const isLast = index === cards.length - 1;
	const authoring = card.authorPrompts === true;
	const drafts = draftsByItem[card.item.id] ?? promptsToDrafts(card.item.prompts ?? []);
	const blocker = authoring ? composerBlocker(drafts) : null;

	function learn() {
		if (blocker) {
			setShowBlocker(true);
			return;
		}
		onLearn(card, authoring ? draftsToPrompts(drafts) : (card.item.prompts ?? []));
		setLearned((n) => n + 1);
		setShowBlocker(false);
		setIndex((i) => i + 1);
	}

	function skip() {
		onSkip(card);
		setShowBlocker(false);
		setIndex((i) => i + 1);
	}

	return (
		<div className="lq-session">
			<div className="lq-session__header">
				<button type="button" className="lq-quit" onClick={quit} disabled={quitting}>
					{quitting ? 'Saving…' : '← Stop'}
				</button>
				<span className="lq-score">
					{index + 1} / {cards.length}
				</span>
			</div>

			<div className="lq-panel">
				<p className="lq-eyebrow">
					{card.badge && (
						<span className="lq-deck-badge">
							{card.badge.emoji} {card.badge.title}
						</span>
					)}
					{' '}New {card.itemNoun}
				</p>
				<ItemDetails item={card.item} linkTarget="_blank" />

				{authoring && (
					<PromptComposer
						itemId={card.item.id}
						itemNoun={card.itemNoun}
						drafts={drafts}
						onChange={(next) => {
							setDraftsByItem((prev) => ({ ...prev, [card.item.id]: next }));
							setShowBlocker(false);
						}}
					/>
				)}

				{showBlocker && blocker && <p className="lq-composer__issue lq-composer__issue--blocker">{blocker}</p>}
				{saveError && <p className="lq-composer__issue lq-composer__issue--blocker">{saveError}</p>}

				<div className="lq-grade">
					<button type="button" className="lq-button lq-button--primary" onClick={learn}>
						{isLast ? 'Got it — added to practice ✓' : 'Got it — next →'}
					</button>
					<button type="button" className="lq-button lq-button--ghost" onClick={skip}>
						Skip — don't learn this
					</button>
				</div>
			</div>
		</div>
	);
}
