// Shared types for the /learn/* spaced-repetition "wall chart" systems.
// See docs/architecture/learning-systems.md for the design these implement.

export interface Prompt {
	id: string;
	// For plain q/a prompts, the question text. For cloze prompts
	// (kind: 'cloze'), the full statement with the hidden span(s) wrapped in
	// {{…}} markers — the UI masks them on the front and reveals them
	// highlighted on the back, e.g. q: 'talo + "in" = talo{{ssa}}'.
	q: string;
	// The canonical answer. Keep it to 1–2 words (or one flag/form) — prompts
	// must be atomic, precise, consistent, and effortful; long prose answers
	// are un-gradeable. For cloze prompts this is the hidden text (joined
	// with ' · ' when there are multiple deletions).
	a: string;
	note?: string;
	// Absent = plain question/answer. 'cloze' = fill-in-the-blank; q carries
	// {{…}} markers.
	kind?: 'cloze';
}

// A single worked example: a code/phrase line plus an optional one-line note
// explaining it. See `examples` below.
export interface LearnExample {
	code: string;
	note?: string;
}

export interface LearnItem {
	id: string;
	term: string;
	// Optional for note-backed decks (til/evergreen), where prose items have
	// no canonical syntax or worked example; the UI falls back to `term`.
	syntax?: string;
	description: string;
	// Optional longer paragraph for the reference panel, below `description`.
	// Use for the "why"/mechanics that don't fit a one-line description —
	// per design principle #8 (docs/architecture/learning-systems.md), the
	// reference panel is a lookup sheet and can afford more depth than the
	// atomic quiz prompts it accompanies.
	explanation?: string;
	example?: string;
	exampleNote?: string;
	// Richer decks: two or more worked examples. When present, the renderer
	// shows this list instead of the single `example`/`exampleNote` pair.
	examples?: LearnExample[];
	// Link to the source note, for decks generated from published notes.
	href?: string;
	// Data-URI thumbnail, for decks with a visual recognition element (the
	// people deck's face → name cards — see planning/practice-system-unified-srs.md
	// §5.2). Never a URL: photos never touch a server, so this is the only
	// representation that works everywhere the item does.
	photo?: string;
	prompts: Prompt[];
}

export interface Category {
	id: string;
	title: string;
	emoji: string;
	description: string;
	items: LearnItem[];
}

export interface LearnDataset {
	categories: Category[];
	introductionOrder: string[];
}

export interface LearnSystemConfig {
	storageKey: string;
	legacyKey?: string;
	newPerDay: number;
	dueCap: number;
	itemNoun: string;
	monoAnswers: boolean;
	dataset: LearnDataset;
}
