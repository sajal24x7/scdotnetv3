import React, { useState } from 'react';
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
	doneView,
	saveError,
}: {
	cards: IntroCard[];
	onLearn: (card: IntroCard, prompts: Prompt[]) => void;
	onSkip: (card: IntroCard) => void;
	onQuit: () => void;
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

	if (index >= cards.length) return <>{doneView(learned)}</>;

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
				<button type="button" className="lq-quit" onClick={onQuit}>
					← Stop
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
