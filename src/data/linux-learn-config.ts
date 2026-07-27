// Adapts the existing linux-commands.ts content pool (Command/cmd naming) to
// the shared LearnSystemConfig shape consumed by LearningSystem.tsx, without
// touching the data file itself: the storage key and legacy-key migration
// stay byte-identical to the pre-refactor Linux deck.

import { categories as linuxCategories, introductionOrder, type Command } from './linux-commands';
import { withAuthored } from './authored-prompts';
import type { Category, LearnItem, LearnSystemConfig } from '../components/learn/types';

function toLearnItem(command: Command): LearnItem {
	return {
		id: command.id,
		term: command.cmd,
		syntax: command.syntax,
		description: command.description,
		explanation: command.explanation,
		example: command.example,
		exampleNote: command.exampleNote,
		examples: command.examples,
		// No prompts: Linux is an authored-prompt deck (see types.ts), so items
		// carry reference content only until the learner writes their own.
	};
}

const categories: Category[] = linuxCategories.map((category) => ({
	id: category.id,
	title: category.title,
	emoji: category.emoji,
	description: category.description,
	items: category.commands.map(toLearnItem),
}));

export const linuxLearnConfig: LearnSystemConfig = {
	storageKey: 'linux-learn-srs',
	legacyKey: 'linux-learn-progress',
	newPerDay: 2,
	dueCap: 8,
	itemNoun: 'command',
	monoAnswers: true,
	authorPrompts: true,
	dataset: withAuthored({ categories, introductionOrder }),
};
