import React, { useState } from 'react';
import type { LearnItem } from './types';
import { ItemDetails } from './ItemDetails';

// The learn-side counterpart to a practice session: today's new concepts,
// one full reference card at a time, with an explicit accept/skip decision
// per item. Used by /learn/new (cross-deck, with deck badges) and by each
// deck's own wall-chart page (single deck). Purely presentational — the
// parent persists introductions/skips and decides what "done" means.

export interface IntroCard {
	deckId: string;
	item: LearnItem;
	badge?: { emoji: string; title: string };
	itemNoun: string;
}

export function IntroFlow({
	cards,
	onLearn,
	onSkip,
	onQuit,
	doneView,
}: {
	cards: IntroCard[];
	onLearn: (card: IntroCard) => void;
	onSkip: (card: IntroCard) => void;
	onQuit: () => void;
	doneView: (learned: number) => React.ReactNode;
}) {
	const [index, setIndex] = useState(0);
	const [learned, setLearned] = useState(0);

	if (index >= cards.length) return <>{doneView(learned)}</>;

	const card = cards[index];
	const isLast = index === cards.length - 1;

	function learn() {
		onLearn(card);
		setLearned((n) => n + 1);
		setIndex((i) => i + 1);
	}

	function skip() {
		onSkip(card);
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
