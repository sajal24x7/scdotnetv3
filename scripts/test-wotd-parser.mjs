#!/usr/bin/env node
// Parser tests for scripts/fetch-wotd.mjs, run without touching the network.
//
// The Word of the Day feed is parsed with regexes rather than a real parser
// (see that file's header for why), which only stays defensible if the
// parsing is pinned down by tests. These fixtures exercise the shapes that
// matter: the ordinary entry, an entry with no pronunciation, one with no
// usage example, a multi-word part of speech, and an entry whose definition
// contains the punctuation that tag-stripping tends to strand.
//
// FIXTURE PROVENANCE: the "maverick" case is real — its text is exactly what
// the previous parser captured from the live feed on 2026-07-23 and stored in
// src/data/vocab.generated.json. The surrounding tags are representative
// rather than byte-identical (M-W's markup isn't reproduced here), which is
// fine: `parseMerriamWebster` strips tags before it parses anything, so the
// text is the part under test. The other fixtures are variations on that same
// real shape.
//
// Run: node scripts/test-wotd-parser.mjs

import { parseMerriamWebster, slugify } from './fetch-wotd.mjs';

const PUB_DATE = 'Thu, 23 Jul 2026 00:00:01 -0400';

function mwItem({ word, body, link }) {
	return {
		title: word,
		link: link ?? `https://www.merriam-webster.com/word-of-the-day/${word}-2026-07-23`,
		description: `<p>Merriam-Webster's Word of the Day for July 23, 2026 is:</p>${body}`,
		pubDate: PUB_DATE,
	};
}

const cases = [
	{
		name: 'ordinary entry: word, pronunciation, pos, definition, example',
		item: mwItem({
			word: 'maverick',
			body:
				'<h1>maverick</h1> <p>\\MAV-rik\\&nbsp;</p> <p><em>noun</em></p>' +
				'<p><strong>Maverick</strong> refers to a person who refuses to follow the customs or rules of a ' +
				'group; in other words, a <em>nonconformist</em>. // Ayo has always been a bit of a maverick in the ' +
				'fashion world, inventing new trends rather than following them. <a href="#">See the entry &gt;</a></p>' +
				'<p>Examples: &ldquo;[Luis] Alvarez has been described as a scientific maverick&rdquo;</p>',
		}),
		expect: {
			word: 'maverick',
			pos: 'noun',
			pronunciation: 'MAV-rik',
			gloss:
				'Maverick refers to a person who refuses to follow the customs or rules of a group; in other words, a nonconformist.',
			example:
				'Ayo has always been a bit of a maverick in the fashion world, inventing new trends rather than following them.',
		},
	},
	{
		name: 'multi-word part of speech is not mistaken for its last word',
		item: mwItem({
			word: 'Pyrrhic victory',
			body:
				'<h1>Pyrrhic victory</h1> <p>\\PEER-ik-VIK-tuh-ree\\&nbsp;</p> <p><em>proper noun</em></p>' +
				'<p>A Pyrrhic victory is one that comes at too great a cost. <a href="#">See the entry &gt;</a></p>',
		}),
		expect: {
			word: 'Pyrrhic victory',
			pos: 'proper-noun',
			pronunciation: 'PEER-ik-VIK-tuh-ree',
			gloss: 'A Pyrrhic victory is one that comes at too great a cost.',
			example: undefined,
		},
	},
	{
		name: 'no usage example — definition runs to the "See the entry" trailer',
		item: mwItem({
			word: 'salubrious',
			body:
				'<h1>salubrious</h1> <p>\\suh-LOO-bree-us\\&nbsp;</p> <p><em>adjective</em></p>' +
				'<p>Salubrious means favorable to health. <a href="#">See the entry &gt;</a></p>',
		}),
		expect: {
			word: 'salubrious',
			pos: 'adjective',
			pronunciation: 'suh-LOO-bree-us',
			gloss: 'Salubrious means favorable to health.',
			example: undefined,
		},
	},
	{
		name: 'no pronunciation — falls back to cutting at "is:" and drops the headword',
		item: mwItem({
			word: 'bowdlerize',
			body: '<h1>bowdlerize</h1> <p><em>verb</em></p><p>To bowdlerize is to expurgate a text.</p>',
		}),
		expect: {
			word: 'bowdlerize',
			pos: 'verb',
			pronunciation: undefined,
			gloss: 'To bowdlerize is to expurgate a text.',
			example: undefined,
		},
	},
	{
		name: 'unrecognized part of speech degrades to "other" without eating the definition',
		item: mwItem({
			word: 'et cetera',
			body:
				'<h1>et cetera</h1> <p>\\et-SET-uh-ruh\\&nbsp;</p> <p><em>phrase</em></p>' +
				'<p>Et cetera means "and other things." <a href="#">See the entry &gt;</a></p>',
		}),
		expect: {
			word: 'et cetera',
			pos: 'other',
			pronunciation: 'et-SET-uh-ruh',
			gloss: 'phrase Et cetera means "and other things."',
			example: undefined,
		},
	},
];

let failures = 0;

function check(name, field, actual, expected) {
	if (actual !== expected) {
		failures++;
		console.error(`✗ ${name}\n    ${field}\n      expected: ${JSON.stringify(expected)}\n      actual:   ${JSON.stringify(actual)}`);
		return false;
	}
	return true;
}

for (const { name, item, expect } of cases) {
	const { entry, error } = parseMerriamWebster(item);
	if (error) {
		failures++;
		console.error(`✗ ${name}\n    parse failed: ${error}`);
		continue;
	}
	let ok = true;
	for (const [field, expected] of Object.entries(expect)) {
		ok = check(name, field, entry[field], expected) && ok;
	}
	ok = check(name, 'source', entry.source, 'merriam-webster') && ok;
	ok = check(name, 'fetchedAt', entry.fetchedAt, '2026-07-23') && ok;
	if (ok) console.log(`✓ ${name}`);
}

// A word with no title can't be keyed or displayed — it must be skipped, not
// stored under an empty slug.
const untitled = parseMerriamWebster({ title: '  ', link: '', description: '<p>anything</p>', pubDate: PUB_DATE });
if (!untitled.error) {
	failures++;
	console.error('✗ an item with no title should be rejected');
} else {
	console.log('✓ an item with no title is rejected');
}

for (const [input, expected] of [
	['maverick', 'maverick'],
	['Pyrrhic victory', 'pyrrhic-victory'],
	['et cetera', 'et-cetera'],
	['façade', 'fa-ade'],
]) {
	if (!check('slugify', input, slugify(input), expected)) continue;
}
if (failures === 0) console.log('✓ slugify');

if (failures > 0) {
	console.error(`\n${failures} assertion(s) failed`);
	process.exitCode = 1;
} else {
	console.log('\nAll Word of the Day parser tests passed.');
}
