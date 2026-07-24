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
//   - every item has at least one prompt
//   - every category is non-empty
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

function validatePool(name, categories, introductionOrder, { qualityAsWarnings = false } = {}) {
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
		if (!item.prompts || item.prompts.length === 0) {
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
	const pools = [
		{
			name: 'linux',
			load: async () => {
				const mod = await loadTsModule('src/data/linux-commands.ts');
				return { categories: mod.categories, introductionOrder: mod.introductionOrder };
			},
		},
		{
			name: 'finnish',
			load: async () => {
				const mod = await loadTsModule('src/data/finnish.ts');
				return { categories: mod.categories, introductionOrder: mod.introductionOrder };
			},
		},
		{
			name: 'finnish-vocab',
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
			load: async () => {
				const { buildDataset } = await loadTsModule('src/data/vocab-dataset.ts');
				const raw = JSON.parse(readFileSync(path.join(repoRoot, 'src/data/vocab.generated.json'), 'utf8'));
				return buildDataset(raw.words);
			},
		},
	];

	let hadErrors = false;
	for (const pool of pools) {
		const { categories, introductionOrder } = await pool.load();
		const { errors, warnings, itemCount, promptCount } = validatePool(pool.name, categories, introductionOrder, {
			qualityAsWarnings: pool.qualityAsWarnings ?? false,
		});
		if (errors.length === 0) {
			console.log(`✓ ${pool.name}: ${categories.length} categories, ${itemCount} items, ${promptCount} prompts`);
		} else {
			hadErrors = true;
			console.error(`✗ ${pool.name}: ${errors.length} problem(s)`);
			for (const err of errors) console.error(`  - ${err}`);
		}
		for (const warning of warnings) console.warn(`  ⚠ ${warning}`);
	}

	if (hadErrors) {
		process.exitCode = 1;
	}
}

main();
