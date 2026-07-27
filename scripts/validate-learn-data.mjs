#!/usr/bin/env node
// Guardrails for the /learn/* content pools (src/data/linux-commands.ts,
// src/data/finnish.ts, and the note-backed decks generated into
// src/data/learn-decks.generated.json by scripts/extract-learn-blocks.mjs).
// See planning/finnish-learning-system.md §E4 and
// docs/architecture/learning-systems.md for the invariants this checks:
//
//   - every prompt id is globally unique within its pool
//   - every introductionOrder entry names a real item, exactly once
//   - every item appears in introductionOrder
//   - every item has at least one prompt (except on authored-prompt decks —
//     see below, where an item legitimately has none until it's introduced)
//   - every category is non-empty
//   - src/data/authored-prompts.json only names items that actually exist
//
// The four authored-prompt decks (linux, finnish, finnish-vocab, vocab) ship
// items as reference cards with no prompts; their prompts are hand-written at
// introduction time and stored in src/data/authored-prompts.json, which this
// script folds in exactly as src/data/authored-prompts.ts does at build time.
// So an item here has either the prompts its author wrote or none at all, and
// "no prompts" is a normal state rather than an error.
//
// Plus prompt-quality rules (docs/architecture/learning-systems.md, "Writing
// prompts"): answers must stay short (atomic prompts, no prose paragraphs),
// true/false-style questions are banned (not effortful), and cloze prompts
// (kind: 'cloze') must carry {{…}} markers — while plain q/a prompts must
// not. Quality rules are hard errors for the curated/automated pools and
// warnings for the note-backed ones (til/evergreen), whose prompts are
// authored inside published notes and fixed there.
//
// Run: node scripts/validate-learn-data.mjs

import { readFileSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { transform } from 'esbuild';

const repoRoot = path.resolve(import.meta.dirname, '..');

async function loadTsModule(relPath) {
	const abs = path.join(repoRoot, relPath);
	const source = readFileSync(abs, 'utf8');
	const { code } = await transform(source, { loader: 'ts', format: 'esm' });
	const dir = mkdtempSync(path.join(tmpdir(), 'learn-validate-'));
	const tmpFile = path.join(dir, path.basename(abs).replace(/\.ts$/, '.mjs'));
	writeFileSync(tmpFile, code);
	return import(pathToFileURL(tmpFile).href);
}

function itemsOf(category) {
	return category.items ?? category.commands ?? [];
}

// Answers longer than this many words can't be self-graded at a glance —
// the target is 1–2 words; the ceiling leaves room for a short form like
// "-ssa / -ssä" or a command line.
const MAX_ANSWER_WORDS = 8;
const BANNED_QUESTION_RE = /^\s*(true or false|yes or no)\b/i;

function promptQualityIssues(name, item, prompt) {
	const issues = [];
	const answerWords = String(prompt.a ?? '').trim().split(/\s+/).filter(Boolean).length;
	if (answerWords > MAX_ANSWER_WORDS) {
		issues.push(
			`[${name}] prompt "${prompt.id}" (item "${item.id}") answer is ${answerWords} words — keep answers to 1–2 words (max ${MAX_ANSWER_WORDS}); move the explanation into note:`,
		);
	}
	if (BANNED_QUESTION_RE.test(prompt.q ?? '')) {
		issues.push(
			`[${name}] prompt "${prompt.id}" (item "${item.id}") is a true/false-style question — not effortful; rewrite as recall or cloze`,
		);
	}
	const hasMarkers = /\{\{.+?\}\}/.test(prompt.q ?? '');
	if (prompt.kind === 'cloze' && !hasMarkers) {
		issues.push(`[${name}] cloze prompt "${prompt.id}" (item "${item.id}") has no {{…}} markers in q`);
	}
	if (prompt.kind !== 'cloze' && hasMarkers) {
		issues.push(`[${name}] prompt "${prompt.id}" (item "${item.id}") has {{…}} markers but no kind: 'cloze'`);
	}
	return issues;
}

// Mirrors applyAuthoredPrompts in src/components/learn/authoredPrompts.ts.
// Kept as its own few lines rather than imported so this script stays plain
// Node with no bundler in the loop.
function applyAuthored(categories, authored) {
	return categories.map((category) => ({
		...category,
		items: itemsOf(category).map((item) => {
			const entry = authored.items[item.id];
			return entry ? { ...item, prompts: entry.prompts } : item;
		}),
	}));
}

function validatePool(name, categories, introductionOrder, { qualityAsWarnings = false, authorPrompts = false } = {}) {
	const errors = [];
	const warnings = [];
	const allItems = categories.flatMap(itemsOf);
	const allIds = new Set();

	for (const category of categories) {
		const items = itemsOf(category);
		if (items.length === 0) {
			errors.push(`[${name}] category "${category.id}" has no items`);
		}
	}

	for (const item of allItems) {
		if (allIds.has(item.id)) {
			errors.push(`[${name}] duplicate item id "${item.id}"`);
		}
		allIds.add(item.id);
		// On an authored-prompt deck, an item with no prompts is simply one
		// that hasn't been introduced yet — the composer is what fills it in.
		if (!authorPrompts && (!item.prompts || item.prompts.length === 0)) {
			errors.push(`[${name}] item "${item.id}" has no prompts`);
		}
	}

	const promptIds = new Map();
	for (const item of allItems) {
		for (const prompt of item.prompts ?? []) {
			if (promptIds.has(prompt.id)) {
				errors.push(
					`[${name}] duplicate prompt id "${prompt.id}" (items "${promptIds.get(prompt.id)}" and "${item.id}")`,
				);
			}
			promptIds.set(prompt.id, item.id);
			(qualityAsWarnings ? warnings : errors).push(...promptQualityIssues(name, item, prompt));
		}
	}

	const orderCounts = new Map();
	for (const id of introductionOrder) {
		orderCounts.set(id, (orderCounts.get(id) ?? 0) + 1);
		if (!allIds.has(id)) {
			errors.push(`[${name}] introductionOrder references unknown item id "${id}"`);
		}
	}
	for (const [id, count] of orderCounts) {
		if (count > 1) errors.push(`[${name}] introductionOrder lists "${id}" ${count} times`);
	}
	for (const id of allIds) {
		if (!orderCounts.has(id)) errors.push(`[${name}] item "${id}" is missing from introductionOrder`);
	}

	return { errors, warnings, itemCount: allItems.length, promptCount: promptIds.size };
}

async function main() {
	const authored = JSON.parse(readFileSync(path.join(repoRoot, 'src/data/authored-prompts.json'), 'utf8'));
	if (!authored || typeof authored.items !== 'object') {
		console.error('✗ src/data/authored-prompts.json is missing its items map');
		process.exitCode = 1;
		return;
	}

	const pools = [
		{
			name: 'linux',
			authorPrompts: true,
			load: async () => {
				const mod = await loadTsModule('src/data/linux-commands.ts');
				return { categories: mod.categories, introductionOrder: mod.introductionOrder };
			},
		},
		{
			name: 'finnish',
			authorPrompts: true,
			load: async () => {
				const mod = await loadTsModule('src/data/finnish.ts');
				return { categories: mod.categories, introductionOrder: mod.introductionOrder };
			},
		},
		{
			name: 'finnish-vocab',
			authorPrompts: true,
			load: async () => {
				const mod = await loadTsModule('src/data/finnish-vocab.ts');
				return { categories: mod.categories, introductionOrder: mod.introductionOrder };
			},
		},
		...['til', 'evergreen'].map((deck) => ({
			name: deck,
			// Note-backed prompts are authored inside published notes — quality
			// slips there are surfaced as warnings to fix in the note, not
			// build-breaking errors.
			qualityAsWarnings: true,
			load: async () => {
				const generated = JSON.parse(
					readFileSync(path.join(repoRoot, 'src/data/learn-decks.generated.json'), 'utf8'),
				);
				return generated[deck];
			},
		})),
		{
			name: 'vocab',
			authorPrompts: true,
			load: async () => {
				const { buildDataset } = await loadTsModule('src/data/vocab-dataset.ts');
				const raw = JSON.parse(readFileSync(path.join(repoRoot, 'src/data/vocab.generated.json'), 'utf8'));
				return buildDataset(raw.words);
			},
		},
	];

	let hadErrors = false;
	const knownItemIds = new Set();
	for (const pool of pools) {
		const loaded = await pool.load();
		const introductionOrder = loaded.introductionOrder;
		// Fold in the hand-written prompts exactly as the build does, so the
		// quality and uniqueness rules below apply to them too — a prompt typed
		// in the browser gets the same scrutiny as one committed by hand.
		const categories = pool.authorPrompts ? applyAuthored(loaded.categories, authored) : loaded.categories;
		for (const category of categories) {
			for (const item of itemsOf(category)) knownItemIds.add(item.id);
		}
		const { errors, warnings, itemCount, promptCount } = validatePool(pool.name, categories, introductionOrder, {
			qualityAsWarnings: pool.qualityAsWarnings ?? false,
			authorPrompts: pool.authorPrompts ?? false,
		});
		if (errors.length === 0) {
			const authoredNote = pool.authorPrompts ? ` (authored: ${promptCount})` : '';
			console.log(
				`✓ ${pool.name}: ${categories.length} categories, ${itemCount} items, ${promptCount} prompts${authoredNote}`,
			);
		} else {
			hadErrors = true;
			console.error(`✗ ${pool.name}: ${errors.length} problem(s)`);
			for (const err of errors) console.error(`  - ${err}`);
		}
		for (const warning of warnings) console.warn(`  ⚠ ${warning}`);
	}

	// An authored-prompts entry naming an item no deck has is dead weight at
	// best and a typo'd id at worst — either way it silently tests nothing.
	const orphans = Object.keys(authored.items).filter((id) => !knownItemIds.has(id));
	if (orphans.length > 0) {
		hadErrors = true;
		console.error(`✗ authored-prompts: ${orphans.length} entr(ies) name unknown items`);
		for (const id of orphans) console.error(`  - "${id}" is not an item in any deck`);
	}

	if (hadErrors) {
		process.exitCode = 1;
	}
}

main();
