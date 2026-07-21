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
	syntax: string;
	description: string;
	example: string;
	exampleNote: string;
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
