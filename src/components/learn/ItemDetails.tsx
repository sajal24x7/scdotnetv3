import React from 'react';
import type { LearnItem } from './types';
import { splitCloze } from './engine';

// Shared presentational pieces for the learn/practice islands.
//
// ItemDetails renders one item's full reference content — photo, term,
// canonical syntax, description, explanation, worked examples, source-note
// link. Used by the wall-chart reference panel (LearningSystem), the
// per-deck intro flow, and the combined /learn/new page, so the three can't
// drift apart.
//
// The term is always the headline: it's the item's identity in every deck,
// and on the intro flow (/learn/new) there is no tile carrying it. `syntax`
// is a *second* line, not a replacement — it means different things per deck
// (the flagged invocation for linux, the English gloss for finnish-vocab, a
// rule summary for finnish), and swapping it in for the term used to hide
// the actual Finnish word on vocabulary cards.

export function ItemDetails({ item, linkTarget }: { item: LearnItem; linkTarget?: '_blank' }) {
	return (
		<>
			{item.photo && <img className="lq-item-photo" src={item.photo} alt="" />}
			<p className="lq-term">{item.term}</p>
			{item.syntax && item.syntax !== item.term && <code className="lq-command">{item.syntax}</code>}
			<p className="lq-description">{item.description}</p>
			{item.explanation && <p className="lq-explanation">{item.explanation}</p>}
			{item.examples && item.examples.length > 0 ? (
				<div className="lq-examples">
					{item.examples.map((ex, i) => (
						<div className="lq-example" key={i}>
							<code>{ex.code}</code>
							{ex.note && <p className="lq-example__note">{ex.note}</p>}
						</div>
					))}
				</div>
			) : (
				item.example && (
					<div className="lq-example">
						<code>{item.example}</code>
						{item.exampleNote && <p className="lq-example__note">{item.exampleNote}</p>}
					</div>
				)
			)}
			{item.href && (
				<a className="lq-note-link" href={item.href} target={linkTarget} rel={linkTarget ? 'noopener' : undefined}>
					Read the note →
				</a>
			)}
		</>
	);
}

// The question side of a prompt. Plain q/a prompts render their text as-is;
// cloze prompts ({{…}} markers in q) render each hidden span as a blank
// before reveal and highlighted once revealed.
export function PromptQuestion({ q, kind, revealed }: { q: string; kind?: 'cloze'; revealed: boolean }) {
	if (kind !== 'cloze') return <p className="lq-question">{q}</p>;
	return (
		<p className="lq-question">
			{splitCloze(q).map((seg, i) =>
				seg.hidden ? (
					<span key={i} className={`lq-cloze${revealed ? ' lq-cloze--revealed' : ''}`}>
						{revealed ? seg.text : '    '}
					</span>
				) : (
					<React.Fragment key={i}>{seg.text}</React.Fragment>
				),
			)}
		</p>
	);
}
