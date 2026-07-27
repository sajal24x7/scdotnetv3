import React, { useEffect, useMemo, useState } from 'react';
import type { Prompt } from './types';
import { clozeAnswer, MAX_ANSWER_WORDS, promptIdFor, promptIssue } from './authoredPrompts';

// Write-your-own-prompts, shown under the reference card in the intro flow
// for decks whose config sets `authorPrompts` (linux, finnish, finnish-vocab,
// vocab). See docs/architecture/learning-systems.md § "Authored prompts".
//
// The point is the act of writing: deciding what's worth remembering about a
// concept, and phrasing the question that retrieves it, is itself the first
// rep — and it's why these decks stopped shipping prompts. So this component
// stays deliberately plain (rows of question/answer, a note, a cloze toggle)
// and does one job well: refuse to let a bad prompt through. The rules it
// enforces are the ones in scripts/validate-learn-data.mjs, checked here so a
// prompt typed in the browser can't fail the build that publishes it.
//
// Purely controlled — the parent owns the prompts and decides when they're
// saved. `existingIds` carries every prompt id this item has ever had, so a
// deleted-then-re-added prompt gets a fresh id rather than inheriting the old
// one's FSRS review history (promptIdFor in authoredPrompts.ts).

export interface DraftPrompt {
	id: string;
	q: string;
	a: string;
	note: string;
	cloze: boolean;
}

export function emptyDraft(itemId: string, existingIds: Prompt[]): DraftPrompt {
	return { id: promptIdFor(itemId, existingIds), q: '', a: '', note: '', cloze: false };
}

// Drafts → the Prompt shape actually stored. Blank rows are dropped, so an
// untouched "add another" row never becomes a prompt.
export function draftsToPrompts(drafts: DraftPrompt[]): Prompt[] {
	return drafts
		.filter((d) => d.q.trim() && (d.cloze ? clozeAnswer(d.q) : d.a.trim()))
		.map((d) => ({
			id: d.id,
			q: d.q.trim(),
			a: (d.cloze ? clozeAnswer(d.q) : d.a).trim(),
			...(d.note.trim() ? { note: d.note.trim() } : {}),
			...(d.cloze ? { kind: 'cloze' as const } : {}),
		}));
}

export function promptsToDrafts(prompts: Prompt[]): DraftPrompt[] {
	return prompts.map((p) => ({
		id: p.id,
		q: p.q,
		a: p.a,
		note: p.note ?? '',
		cloze: p.kind === 'cloze',
	}));
}

function isBlank(draft: DraftPrompt): boolean {
	return !draft.q.trim() && !draft.a.trim() && !draft.note.trim();
}

export function PromptComposer({
	itemId,
	itemNoun,
	drafts,
	onChange,
}: {
	itemId: string;
	itemNoun: string;
	drafts: DraftPrompt[];
	onChange: (drafts: DraftPrompt[]) => void;
}) {
	// Track which rows have been visited so the first, untouched row doesn't
	// open covered in red — validation appears once you've had a go at it.
	const [touched, setTouched] = useState<Set<string>>(new Set());

	// A fresh concept starts with one empty row.
	useEffect(() => {
		if (drafts.length === 0) onChange([emptyDraft(itemId, [])]);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [itemId, drafts.length]);

	const issues = useMemo(() => {
		const map = new Map<string, string>();
		for (const draft of drafts) {
			if (isBlank(draft)) continue;
			const issue = promptIssue({
				q: draft.q,
				a: draft.cloze ? clozeAnswer(draft.q) : draft.a,
				kind: draft.cloze ? 'cloze' : undefined,
			});
			if (issue) map.set(draft.id, issue);
		}
		return map;
	}, [drafts]);

	function update(id: string, patch: Partial<DraftPrompt>) {
		onChange(drafts.map((d) => (d.id === id ? { ...d, ...patch } : d)));
	}

	function remove(id: string) {
		onChange(drafts.filter((d) => d.id !== id));
	}

	function add() {
		onChange([...drafts, emptyDraft(itemId, draftsToPrompts(drafts))]);
	}

	return (
		<div className="lq-composer">
			<p className="lq-composer__lead">
				Write the questions that will test this {itemNoun}. One fact each, short answers — the writing is the first
				rep.
			</p>

			{drafts.map((draft, i) => {
				const issue = touched.has(draft.id) ? issues.get(draft.id) : undefined;
				return (
					<div className="lq-composer__row" key={draft.id}>
						<div className="lq-composer__row-head">
							<span className="lq-composer__index">Prompt {i + 1}</span>
							<label className="lq-composer__cloze-toggle">
								<input
									type="checkbox"
									checked={draft.cloze}
									onChange={(e) => update(draft.id, { cloze: e.target.checked })}
								/>
								Fill in the blank
							</label>
							{drafts.length > 1 && (
								<button
									type="button"
									className="lq-composer__remove"
									onClick={() => remove(draft.id)}
									aria-label={`Remove prompt ${i + 1}`}
								>
									Remove
								</button>
							)}
						</div>

						<label className="lq-composer__field">
							<span>{draft.cloze ? 'Statement — wrap the hidden part in {{…}}' : 'Question'}</span>
							<textarea
								rows={2}
								value={draft.q}
								placeholder={
									draft.cloze
										? 'talo + "in the house" = talo{{ssa}}'
										: 'umount says the target is busy — how do you find who’s holding it?'
								}
								onChange={(e) => update(draft.id, { q: e.target.value })}
								onBlur={() => setTouched((prev) => new Set(prev).add(draft.id))}
							/>
						</label>

						{draft.cloze ? (
							<p className="lq-composer__derived">
								Answer: <code>{clozeAnswer(draft.q) || '—'}</code> <span>(taken from the {'{{…}}'} markers)</span>
							</p>
						) : (
							<label className="lq-composer__field">
								<span>Answer — 1–2 words, max {MAX_ANSWER_WORDS}</span>
								<input
									type="text"
									value={draft.a}
									placeholder="lsof"
									onChange={(e) => update(draft.id, { a: e.target.value })}
									onBlur={() => setTouched((prev) => new Set(prev).add(draft.id))}
								/>
							</label>
						)}

						<label className="lq-composer__field">
							<span>Note — optional, shown with the answer</span>
							<input
								type="text"
								value={draft.note}
								placeholder="Why it matters, or the gotcha you keep forgetting."
								onChange={(e) => update(draft.id, { note: e.target.value })}
							/>
						</label>

						{issue && <p className="lq-composer__issue">{issue}</p>}
					</div>
				);
			})}

			<button type="button" className="lq-button lq-button--ghost lq-composer__add" onClick={add}>
				+ Another prompt
			</button>
		</div>
	);
}

// The gate the intro flow applies before it will introduce a concept: at
// least one prompt, and nothing typed that breaks the rules. A half-finished
// second row is a blocker, not something to silently drop — dropping it
// would lose work the learner thinks they've saved.
export function composerBlocker(drafts: DraftPrompt[]): string | null {
	const filled = drafts.filter((d) => !isBlank(d));
	if (filled.length === 0) return 'Write at least one prompt before adding this to practice.';
	for (const draft of filled) {
		const issue = promptIssue({
			q: draft.q,
			a: draft.cloze ? clozeAnswer(draft.q) : draft.a,
			kind: draft.cloze ? 'cloze' : undefined,
		});
		if (issue) return issue;
	}
	return null;
}
