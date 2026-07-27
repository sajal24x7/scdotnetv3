#!/usr/bin/env node
// Tests for the pure half of src/components/learn/authoredPrompts.ts — the
// parts that decide what a learner's hand-written prompts mean: id
// allocation, the cross-device merge, the dataset overlay, the validation
// gate the composer applies, and the one-time migration of the prompts the
// four authored-prompt decks used to ship.
//
// These are the functions where a quiet bug costs real review history (a
// reused prompt id inherits a deleted prompt's schedule; a bad merge drops a
// word you wrote on another device), so they're pinned down here rather than
// left to the type checker. The browser-only halves — localStorage, fetch —
// are mostly left alone; they're thin wrappers with nothing to get wrong that
// a test like this would catch. The exception is the stage/flush pair at the
// bottom, which decides how many commits a learn session makes — "one commit
// per session" is a promise about the repo's history, so it gets a fake
// localStorage and fetch rather than the benefit of the doubt.
//
// Loaded through esbuild the same way scripts/validate-learn-data.mjs loads a
// TypeScript content pool: no bundler, no test framework, plain Node.
//
// Run: node scripts/test-authored-prompts.mjs

import { readFileSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { transform } from 'esbuild';

const repoRoot = path.resolve(import.meta.dirname, '..');

async function loadTsModule(relPath) {
	const abs = path.join(repoRoot, relPath);
	const { code } = await transform(readFileSync(abs, 'utf8'), { loader: 'ts', format: 'esm' });
	const dir = mkdtempSync(path.join(tmpdir(), 'authored-test-'));
	const tmpFile = path.join(dir, 'module.mjs');
	writeFileSync(tmpFile, code);
	return import(pathToFileURL(tmpFile).href);
}

const {
	applyAuthoredPrompts,
	AUTHORED_CACHE_KEY,
	AUTHORED_PENDING_KEY,
	clozeAnswer,
	flushAuthored,
	introducedItemIdsFor,
	loadAuthoredCache,
	loadPendingAuthored,
	mergeAuthored,
	migrateLegacyPrompts,
	promptIdFor,
	promptIssue,
	stageAuthored,
} = await loadTsModule('src/components/learn/authoredPrompts.ts');

let failures = 0;

function eq(name, actual, expected) {
	if (JSON.stringify(actual) === JSON.stringify(expected)) {
		console.log(`✓ ${name}`);
		return;
	}
	failures++;
	console.error(`✗ ${name}\n    expected: ${JSON.stringify(expected)}\n    actual:   ${JSON.stringify(actual)}`);
}

// --- Prompt ids ---
// The invariant that matters: an id is never reused, because a reused id
// inherits the FSRS card (stability, due date, lapses) of the prompt it
// replaces — the new question would arrive pre-answered.
eq('first prompt on an item', promptIdFor('df', []), 'df-a1');
eq('next prompt continues the run', promptIdFor('df', [{ id: 'df-a1' }, { id: 'df-a2' }]), 'df-a3');
eq(
	'a deleted prompt’s id is not handed out again',
	promptIdFor('df', [{ id: 'df-a1' }, { id: 'df-a3' }]),
	'df-a4',
);
eq('legacy -p/-n ids do not shift the run', promptIdFor('df', [{ id: 'df-1' }, { id: 'df-p2' }]), 'df-a1');
eq('an item id containing regex characters is matched literally', promptIdFor('c++.x', [{ id: 'c++.x-a1' }]), 'c++.x-a2');

// --- Merge ---
// Must be deterministic and idempotent in either direction: it runs on load,
// on focus, and after every save, on every device.
const older = { version: 1, items: { x: { prompts: [{ id: 'x-a1' }], updatedAt: '2026-01-01T00:00:00Z' } } };
const newer = {
	version: 1,
	items: {
		x: { prompts: [{ id: 'x-a2' }], updatedAt: '2026-02-01T00:00:00Z' },
		y: { prompts: [], updatedAt: '2026-01-05T00:00:00Z' },
	},
};
eq('the later edit wins', mergeAuthored(older, newer).items.x.prompts, [{ id: 'x-a2' }]);
eq('and wins from the other direction too', mergeAuthored(newer, older).items.x.prompts, [{ id: 'x-a2' }]);
eq('merging twice changes nothing', mergeAuthored(mergeAuthored(older, newer), newer), mergeAuthored(older, newer));
eq('items from both sides survive', Object.keys(mergeAuthored(older, newer).items).sort(), ['x', 'y']);
// Whole entries move together: merging prompt-by-prompt would resurrect a
// prompt the learner deliberately deleted on the other device.
eq(
	'a prompt deleted in the later edit stays deleted',
	mergeAuthored(
		{ version: 1, items: { x: { prompts: [{ id: 'x-a1' }, { id: 'x-a2' }], updatedAt: '2026-01-01T00:00:00Z' } } },
		{ version: 1, items: { x: { prompts: [{ id: 'x-a1' }], updatedAt: '2026-03-01T00:00:00Z' } } },
	).items.x.prompts,
	[{ id: 'x-a1' }],
);

// --- Dataset overlay ---
const dataset = {
	introductionOrder: ['a', 'b'],
	categories: [{ id: 'c', items: [{ id: 'a', term: 'A' }, { id: 'b', term: 'B' }] }],
};
const overlaid = applyAuthoredPrompts(dataset, {
	version: 1,
	items: { a: { prompts: [{ id: 'a-a1', q: 'q', a: 'a' }], updatedAt: '2026-01-01T00:00:00Z' } },
});
eq('only the authored item gains prompts', overlaid.categories[0].items.map((i) => (i.prompts ?? []).length), [1, 0]);
eq('the source dataset is not mutated', dataset.categories[0].items[0].prompts, undefined);
eq('an empty store is a no-op', applyAuthoredPrompts(dataset, { version: 1, items: {} }), dataset);

// --- Validation (the composer's gate; mirrors validate-learn-data.mjs) ---
eq('a nine-word answer is rejected', promptIssue({ q: 'x?', a: 'a b c d e f g h i' }) !== null, true);
eq('an eight-word answer is allowed', promptIssue({ q: 'x?', a: 'a b c d e f g h' }), null);
eq('an empty question is rejected', promptIssue({ q: '   ', a: 'x' }) !== null, true);
eq('an empty answer is rejected', promptIssue({ q: 'x?', a: '' }) !== null, true);
eq('true/false is rejected', promptIssue({ q: 'True or false: x', a: 'yes' }) !== null, true);
eq('a cloze with no markers is rejected', promptIssue({ q: 'plain', a: 'x', kind: 'cloze' }) !== null, true);
eq('markers without kind: cloze are rejected', promptIssue({ q: 'talo{{ssa}}', a: 'ssa' }) !== null, true);
eq('a well-formed cloze passes', promptIssue({ q: 'talo{{ssa}}', a: 'ssa', kind: 'cloze' }), null);
eq('multiple deletions join with the separator', clozeAnswer('a{{x}} b{{y}}'), 'x · y');
eq('no markers means no derived answer', clozeAnswer('plain text'), '');

// --- Migration ---
const legacy = {
	version: 1,
	items: {
		df: { deck: 'linux', prompts: [{ id: 'df-1', q: 'Q', a: 'A' }] },
		du: { deck: 'linux', prompts: [{ id: 'du-1', q: 'Q', a: 'A' }] },
		ls: { deck: 'linux', prompts: [{ id: 'ls-1', q: 'Q', a: 'A' }] },
	},
};
const adopted = migrateLegacyPrompts({
	legacy,
	// `du` already has authored prompts; `ls` was never introduced.
	authored: { version: 1, items: { du: { prompts: [{ id: 'du-a1' }], updatedAt: '2026-01-01T00:00:00Z' } } },
	introducedItemIds: new Set(['df', 'du']),
});
eq('only introduced, unauthored items are migrated', Object.keys(adopted), ['df']);
eq('migrated prompt ids are preserved exactly', adopted.df.prompts[0].id, 'df-1');
eq(
	'an introduced item with no legacy record is left alone',
	Object.keys(migrateLegacyPrompts({ legacy, authored: { version: 1, items: {} }, introducedItemIds: new Set(['gone']) })),
	[],
);

eq(
	'only authored-prompt decks contribute ids to migrate',
	[
		...introducedItemIdsFor(
			[
				{ id: 'linux', authorPrompts: true },
				{ id: 'til', authorPrompts: false },
			],
			{ linux: { introduced: { df: '2026-01-01' } }, til: { introduced: { 'til-1': '2026-01-01' } } },
		),
	],
	['df'],
);

// --- Staging and the one-commit-per-session flush ---
//
// The point of the split: authoring a card touches localStorage only, and the
// end of the session sends everything staged in a single POST — which is a
// single commit on main. Before this, a twelve-concept morning was twelve
// commits and twelve site rebuilds.

const store = new Map();
globalThis.window = {
	localStorage: {
		getItem: (k) => (store.has(k) ? store.get(k) : null),
		setItem: (k, v) => store.set(k, v),
		removeItem: (k) => store.delete(k),
	},
};

let posts = [];
let postFails = false;
globalThis.fetch = async (_url, init) => {
	posts.push(JSON.parse(init.body).items);
	if (postFails) return { ok: false, status: 502, json: async () => ({ error: 'boom' }) };
	return { ok: true, status: 200, json: async () => ({ written: 1 }) };
};

function resetSession() {
	store.clear();
	posts = [];
	postFails = false;
}

const p = (id) => [{ id, q: 'q?', a: 'a' }];

resetSession();
stageAuthored('df', p('df-a1'));
stageAuthored('du', p('du-a1'));
stageAuthored('ls', p('ls-a1'));

eq('staging makes no network calls', posts.length, 0);
eq('staged items queue up', Object.keys(loadPendingAuthored()).sort(), ['df', 'du', 'ls']);
eq(
	'staged prompts are practisable immediately',
	Object.keys(loadAuthoredCache().items).sort(),
	['df', 'du', 'ls'],
);

let result = await flushAuthored('token');
eq('the session flushes in one request', posts.length, 1);
eq('that request carries every concept', Object.keys(posts[0]).sort(), ['df', 'du', 'ls']);
eq('the flush reports success', [result.committed, result.pending], [true, 3]);
eq('a committed queue is emptied', loadPendingAuthored(), {});

eq('flushing an empty queue is a no-op', (await flushAuthored('token')).committed, true);
eq('and sends nothing', posts.length, 1);

// A failed commit must not look clean, and must not lose the prompts: they
// stay queued so the next session's flush picks them up.
resetSession();
postFails = true;
stageAuthored('df', p('df-a1'));
result = await flushAuthored('token');
eq('a failed flush reports the failure', result.committed, false);
eq('a failed flush keeps the queue', Object.keys(loadPendingAuthored()), ['df']);

postFails = false;
await flushAuthored('token');
eq('the next flush retries what was left', Object.keys(posts[1]), ['df']);
eq('and clears it once it lands', loadPendingAuthored(), {});

// No token means no repo — the prompts still work on this device today, and
// stay queued for whenever sync is turned on.
resetSession();
stageAuthored('df', p('df-a1'));
result = await flushAuthored(null);
eq('an unconnected flush sends nothing', posts.length, 0);
eq('an unconnected flush reports it', result.committed, false);
eq('an unconnected flush keeps the queue', Object.keys(loadPendingAuthored()), ['df']);

// Authoring while the POST is in flight belongs to the *next* commit, and
// must survive the clear that follows the one in flight.
resetSession();
stageAuthored('df', p('df-a1'));
const inFlight = flushAuthored('token');
stageAuthored('du', p('du-a1'));
await inFlight;
eq('a concept staged mid-flush is not dropped', Object.keys(loadPendingAuthored()), ['du']);

// Re-editing a staged concept before the flush replaces it rather than
// queueing it twice — the composer edits an item's prompts as a set.
resetSession();
stageAuthored('df', p('df-a1'));
stageAuthored('df', p('df-a2'));
await flushAuthored('token');
eq('a re-edited concept commits once, latest wins', posts[0].df.prompts[0].id, 'df-a2');

if (failures > 0) {
	console.error(`\n${failures} assertion(s) failed`);
	process.exitCode = 1;
} else {
	console.log('\nAll authored-prompt tests passed.');
}
