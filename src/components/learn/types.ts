// Shared types for the /learn/* spaced-repetition "wall chart" systems.
// See docs/architecture/learning-systems.md for the design these implement.

export interface Prompt {
	id: string;
	q: string;
	a: string;
	note?: string;
}

export interface LearnItem {
	id: string;
	term: string;
	// Optional for note-backed decks (til/evergreen), where prose items have
	// no canonical syntax or worked example; the UI falls back to `term`.
	syntax?: string;
	description: string;
	example?: string;
	exampleNote?: string;
	// Link to the source note, for decks generated from published notes.
	href?: string;
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
