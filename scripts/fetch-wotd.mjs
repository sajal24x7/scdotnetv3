#!/usr/bin/env node
// Feeds the /learn/vocabulary deck: fetches Merriam-Webster's "Word of the
// Day" RSS and upserts the newest word into src/data/vocab.generated.json.
//
// ONE SOURCE, ONE WORD. Merriam-Webster is the only source (Wiktionary's
// featured feed was the second one and has been dropped): its entries are
// editorially curated rather than crowd-authored, and each carries a
// pronunciation, a part of speech, a single clean defining sentence, and a
// usage example — everything the reference card wants, in one place.
// Wiktionary's glosses are serviceable but arrive with parenthetical usage
// labels and no example, and running both meant two words landing per day.
// Words captured from Wiktionary before this change stay on file; they're
// history, and their item ids key real review state.
//
// At most one new word is added per run, the newest one not already on file.
// The feed carries about a week of items, so this is what keeps a fresh
// checkout (or a run after a few missed days) from dumping seven words into
// the deck at once, while still catching up a day at a time.
//
// The file is word-keyed and idempotent: a word already on file keeps its
// original record and is never re-fetched or overwritten, so a re-run or a
// duplicated cron fire is harmless and hand edits to gloss/pos are safe.
//
// Parsing is a handful of targeted regexes against the feed's known
// structure rather than a real XML/HTML parser — the shape is simple and
// stable, and a full parser would be one more dependency for one script.
// The description is HTML inside an escaped/CDATA payload, so entities are
// decoded, tags stripped, and entities decoded again (the inner HTML has its
// own — `&nbsp;` between the pronunciation and the part of speech, most
// notably). `parseMerriamWebster` is exported so scripts/test-wotd-parser.mjs
// can exercise it against captured feed output without touching the network.
//
// A parse failure for a single word is a warning, never a build failure —
// same philosophy as extract-learn-blocks.mjs: skip it, log why, try again
// tomorrow. A total fetch failure (feed down, network blocked) is also
// non-fatal: the script exits 0 with nothing added.
//
// Run: node scripts/fetch-wotd.mjs

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';

const repoRoot = path.resolve(import.meta.dirname, '..');
const OUT_FILE = path.join(repoRoot, 'src', 'data', 'vocab.generated.json');

const MW_FEED_URL = 'https://www.merriam-webster.com/wotd/feed/rss2';

// Merriam-Webster labels every entry with one of these, immediately after the
// pronunciation. Order matters: the multi-word forms must be tried before the
// single words they contain, so "proper noun" doesn't match as "noun".
const POS_WORDS = [
	'proper noun',
	'auxiliary verb',
	'noun',
	'verb',
	'adjective',
	'adverb',
	'interjection',
	'pronoun',
	'preposition',
	'conjunction',
	'abbreviation',
];

function decodeEntities(str) {
	return str
		.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
		.replace(/&nbsp;/g, ' ')
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&quot;/g, '"')
		.replace(/&#0?39;/g, "'")
		.replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
		.replace(/&#x([0-9a-fA-F]+);/g, (_, n) => String.fromCodePoint(parseInt(n, 16)))
		.replace(/&amp;/g, '&');
}

function stripTags(html) {
	return html
		.replace(/<[^>]+>/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();
}

// Stripping tags leaves punctuation floating away from the word it belongs to
// ("a nonconformist ." from "<em>nonconformist</em>."). Pull it back, and
// normalize the curly quotes M-W uses in examples.
function tidy(text) {
	return text
		.replace(/\s+([.,;:!?…])/g, '$1')
		.replace(/\(\s+/g, '(')
		.replace(/\s+\)/g, ')')
		.replace(/\s+/g, ' ')
		.trim();
}

function extractTag(block, tag) {
	const re = new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`, 'i');
	const m = re.exec(block);
	return m ? decodeEntities(m[1].trim()) : '';
}

function parseRssItems(xml) {
	const items = [];
	const itemRe = /<item>([\s\S]*?)<\/item>/gi;
	let m;
	while ((m = itemRe.exec(xml)) !== null) {
		const block = m[1];
		items.push({
			title: extractTag(block, 'title'),
			link: extractTag(block, 'link'),
			description: extractTag(block, 'description'),
			pubDate: extractTag(block, 'pubDate'),
		});
	}
	return items;
}

function isoDateFrom(pubDate) {
	if (pubDate) {
		const parsed = new Date(pubDate);
		if (!Number.isNaN(parsed.getTime())) return parsed.toISOString().slice(0, 10);
	}
	return new Date().toISOString().slice(0, 10);
}

export function slugify(word) {
	return word
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
}

// One feed <item> → the record stored in vocab.generated.json, or null with a
// reason if it can't be read cleanly.
//
// The description reads, once decoded and stripped:
//
//   Merriam-Webster's Word of the Day for July 23, 2026 is: maverick
//   \MAV-rik\ noun Maverick refers to a person who refuses to follow the
//   customs or rules of a group; in other words, a nonconformist. // Ayo has
//   always been a bit of a maverick in the fashion world, … See the entry >
//   Examples: “…”
//
// The headword comes from <title> (M-W puts the real word there, unlike
// Wiktionary's "Word of the day for <date>" wrapper). Everything else is cut
// out of that line: pronunciation between backslashes, part of speech
// immediately after it, definition up to M-W's `//` example marker, and the
// usage example between that marker and the "See the entry" trailer.
export function parseMerriamWebster(item) {
	const word = item.title.trim();
	if (!word) return { error: 'item with no title' };

	const text = tidy(decodeEntities(stripTags(item.description)));
	if (!text) return { error: `"${word}" — empty description` };

	// Everything up to and including \PRONUNCIATION\ is the preamble.
	const pronMatch = /\\([^\\]{1,60})\\/.exec(text);
	let pronunciation = '';
	let rest;
	if (pronMatch) {
		pronunciation = pronMatch[1].trim();
		rest = text.slice(pronMatch.index + pronMatch[0].length).trim();
	} else {
		// No pronunciation in this entry — fall back to cutting at the "is:"
		// that introduces the headword, so a missing \…\ costs the extra field
		// rather than the whole word.
		const isMatch = /\bis:\s*/.exec(text);
		if (!isMatch) return { error: `"${word}" — could not find the definition preamble` };
		rest = text.slice(isMatch.index + isMatch[0].length).trim();
		// The headword itself leads here; drop it.
		if (rest.toLowerCase().startsWith(word.toLowerCase())) rest = rest.slice(word.length).trim();
	}

	let pos = 'other';
	for (const candidate of POS_WORDS) {
		const re = new RegExp(`^${candidate}\\b`, 'i');
		if (re.test(rest)) {
			pos = candidate.replace(/\s+/g, '-');
			rest = rest.slice(candidate.length).trim();
			break;
		}
	}

	// M-W separates definition from usage example with `//`, and closes the
	// entry with "See the entry". Either can be missing; cut at whichever
	// comes first and keep the rest as the example when it's the `//`.
	const exampleMarker = rest.indexOf('//');
	const trailerMatch = /\bSee the entry\b/i.exec(rest);
	const trailerAt = trailerMatch ? trailerMatch.index : -1;

	let gloss;
	let example = '';
	if (exampleMarker !== -1 && (trailerAt === -1 || exampleMarker < trailerAt)) {
		gloss = rest.slice(0, exampleMarker);
		const exampleEnd = trailerAt !== -1 ? trailerAt : rest.length;
		example = tidy(rest.slice(exampleMarker + 2, exampleEnd));
	} else {
		gloss = trailerAt !== -1 ? rest.slice(0, trailerAt) : rest;
	}

	gloss = tidy(gloss);
	if (!gloss) return { error: `"${word}" — no definition found in feed markup` };

	return {
		entry: {
			word,
			pos,
			gloss,
			...(pronunciation ? { pronunciation } : {}),
			...(example ? { example } : {}),
			href: item.link || `https://www.merriam-webster.com/dictionary/${encodeURIComponent(word)}`,
			source: 'merriam-webster',
			fetchedAt: isoDateFrom(item.pubDate),
		},
	};
}

async function fetchMerriamWebster(warnings) {
	let res;
	try {
		res = await fetch(MW_FEED_URL, { headers: { 'User-Agent': 'scdotnetv3-fetch-wotd/1.0' } });
	} catch (err) {
		warnings.push(`merriam-webster: fetch failed (${err.message}) — skipping this run`);
		return [];
	}
	if (!res.ok) {
		warnings.push(`merriam-webster: HTTP ${res.status} — skipping this run`);
		return [];
	}
	const xml = await res.text();
	const entries = [];
	for (const item of parseRssItems(xml)) {
		const { entry, error } = parseMerriamWebster(item);
		if (error) {
			warnings.push(`merriam-webster: ${error}, skipped`);
			continue;
		}
		entries.push(entry);
	}
	// Newest first, so "the newest word not already on file" is just the first
	// one that isn't a duplicate.
	return entries.sort((a, b) => b.fetchedAt.localeCompare(a.fetchedAt));
}

async function main() {
	const warnings = [];
	const existing = existsSync(OUT_FILE) ? JSON.parse(readFileSync(OUT_FILE, 'utf8')) : { words: {} };
	const words = { ...existing.words };

	const fetched = await fetchMerriamWebster(warnings);

	// One word a day: take the newest entry that isn't already on file and
	// stop. A day the workflow didn't run isn't lost, it's just picked up
	// tomorrow — the deck grows one word per run either way.
	let added = 0;
	for (const entry of fetched) {
		const key = slugify(entry.word);
		if (!key || words[key]) continue;
		words[key] = entry;
		added++;
		break;
	}

	for (const warning of warnings) console.warn(`  ⚠ ${warning}`);
	console.log(`✓ vocab: ${Object.keys(words).length} words on file (${added} new this run)`);

	const json = `${JSON.stringify({ words }, null, '\t')}\n`;
	const existingRaw = existsSync(OUT_FILE) ? readFileSync(OUT_FILE, 'utf8') : null;
	if (existingRaw !== json) {
		writeFileSync(OUT_FILE, json);
		console.log(`Wrote ${path.relative(repoRoot, OUT_FILE)}`);
	} else {
		console.log(`${path.relative(repoRoot, OUT_FILE)} unchanged`);
	}
}

// Importable for the parser test without running the fetch.
if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(import.meta.filename)) {
	main().catch((err) => {
		console.error('fetch-wotd failed unexpectedly:', err);
		process.exitCode = 1;
	});
}
