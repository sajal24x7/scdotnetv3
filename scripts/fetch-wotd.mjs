#!/usr/bin/env node
// Feeds the /learn/vocabulary deck (unified-practice plan §4.1): fetches
// Wiktionary's "Word of the Day" featured feed and upserts each word into
// src/data/vocab.generated.json, word-keyed so re-runs are idempotent — a
// word already on file keeps its original fetchedAt and is never touched
// again by this script (hand edits to gloss/pos in the file are safe).
//
// The feed is MediaWiki's ApiFeaturedFeed (RSS 2.0), one <item> per day.
// Its <title> is NOT the headword — it's a generic "Word of the day for
// <date>" wrapper (the same quirk as Wikipedia's POTD feed's "Picture of
// the day for <date>"). The real headword is recovered from <description>
// instead: the gloss is the first <li> of the definition list, and the
// headword is the title attribute of the wikilink Wiktionary renders over
// the bolded term. Both are parsed with small regexes below rather than a
// real XML parser — the feed's structure is simple and stable, and a full
// parser would be one more dependency for one script.
//
// Merriam-Webster's WOTD RSS is a second source, on by default — set
// WOTD_ENABLE_MW=false to turn it off. Its parser is a best-effort first
// cut (plan §4.1 originally shipped it off pending verification); it has
// since been checked against live output and produces two words/day.
//
// A parse failure for a single word is a warning, never a build failure —
// same philosophy as extract-learn-blocks.mjs: skip the word, log why, try
// again tomorrow. A total fetch failure (feed down, network blocked) is
// also non-fatal: the script exits 0 with nothing added.
//
// Run: node scripts/fetch-wotd.mjs

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';

const repoRoot = path.resolve(import.meta.dirname, '..');
const OUT_FILE = path.join(repoRoot, 'src', 'data', 'vocab.generated.json');

const WIKTIONARY_FEED_URL = 'https://en.wiktionary.org/w/api.php?action=featuredfeed&feed=wotd&feedformat=rss';
const MW_FEED_URL = 'https://www.merriam-webster.com/wotd/feed/rss2';
const ENABLE_MW = process.env.WOTD_ENABLE_MW !== 'false';

const POS_WORDS = [
	'Proper noun',
	'Noun',
	'Verb',
	'Adjective',
	'Adverb',
	'Interjection',
	'Pronoun',
	'Preposition',
	'Conjunction',
	'Determiner',
	'Numeral',
	'Article',
];

function decodeEntities(str) {
	return str
		.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
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

function detectPos(html) {
	for (const pos of POS_WORDS) {
		const re = new RegExp(`>\\s*${pos}\\s*<`, 'i');
		if (re.test(html)) return pos.toLowerCase().replace(/\s+/g, '-');
	}
	return 'other';
}

function firstListItemText(html) {
	const m = /<li[^>]*>([\s\S]*?)<\/li>/i.exec(html);
	return m ? stripTags(m[1]) : '';
}

// The feed's <title> turned out to be a generic "Word of the day for
// <date>" wrapper (the same quirk as Wikipedia's "Picture of the day for
// <date>" POTD feed) rather than the headword — confirmed by a live run on
// 2026-07-23 that filled vocab.generated.json with nine entries literally
// named "Word of the day for July 14" etc. The real headword only shows up
// inside <description>, as the wikilink over the bolded term. A wikilink's
// title attribute is the clean page name (e.g. "demigirl"), immune to the
// italics/superscript markup that can wrap the link's visible text.
function extractLinkedHeadword(html) {
	const m = /<a\b[^>]*\btitle="([^"]+)"[^>]*>/i.exec(html);
	return m ? decodeEntities(m[1]).trim() : '';
}

function isoDateFrom(pubDate) {
	if (pubDate) {
		const parsed = new Date(pubDate);
		if (!Number.isNaN(parsed.getTime())) return parsed.toISOString().slice(0, 10);
	}
	return new Date().toISOString().slice(0, 10);
}

function slugify(word) {
	return word
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
}

async function fetchWiktionary(warnings) {
	let res;
	try {
		res = await fetch(WIKTIONARY_FEED_URL, { headers: { 'User-Agent': 'scdotnetv3-fetch-wotd/1.0' } });
	} catch (err) {
		warnings.push(`wiktionary: fetch failed (${err.message}) — skipping this run`);
		return [];
	}
	if (!res.ok) {
		warnings.push(`wiktionary: HTTP ${res.status} — skipping this run`);
		return [];
	}
	const xml = await res.text();
	const entries = [];
	for (const item of parseRssItems(xml)) {
		const rawTitle = item.title.trim();
		if (!rawTitle) {
			warnings.push('wiktionary: item with no title — skipped');
			continue;
		}
		const gloss = firstListItemText(item.description);
		if (!gloss) {
			warnings.push(`wiktionary: "${rawTitle}" — no definition found in feed markup, skipped`);
			continue;
		}
		const word = /^word of the day for /i.test(rawTitle) ? extractLinkedHeadword(item.description) : rawTitle;
		if (!word) {
			warnings.push(`wiktionary: could not find a headword for "${rawTitle}" — skipped`);
			continue;
		}
		entries.push({
			word,
			pos: detectPos(item.description),
			gloss,
			href: `https://en.wiktionary.org/wiki/${encodeURIComponent(word)}`,
			source: 'wiktionary',
			fetchedAt: isoDateFrom(item.pubDate),
		});
	}
	return entries;
}

// On by default (WOTD_ENABLE_MW=false to turn off). M-W's WOTD RSS wraps
// the gloss in its own description markup, so the gloss text is a raw
// stripped-tags dump of the whole entry (headline + pronunciation + POS +
// definition + examples) rather than a clean single sentence like
// Wiktionary's — set WOTD_ENABLE_MW=false if that gets noisy in practice.
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
		const word = item.title.trim();
		if (!word) continue;
		const gloss = stripTags(item.description).slice(0, 400);
		if (!gloss) {
			warnings.push(`merriam-webster: "${word}" — no definition found, skipped`);
			continue;
		}
		entries.push({
			word,
			pos: 'other',
			gloss,
			href: item.link || `https://www.merriam-webster.com/dictionary/${encodeURIComponent(word)}`,
			source: 'merriam-webster',
			fetchedAt: isoDateFrom(item.pubDate),
		});
	}
	return entries;
}

async function main() {
	const warnings = [];
	const existing = existsSync(OUT_FILE) ? JSON.parse(readFileSync(OUT_FILE, 'utf8')) : { words: {} };
	const words = { ...existing.words };

	const fetched = [...(await fetchWiktionary(warnings)), ...(ENABLE_MW ? await fetchMerriamWebster(warnings) : [])];

	let added = 0;
	for (const entry of fetched) {
		const key = slugify(entry.word);
		if (!key || words[key]) continue; // already have this word — keep the first-seen record
		words[key] = {
			word: entry.word,
			pos: entry.pos,
			gloss: entry.gloss,
			href: entry.href,
			source: entry.source,
			fetchedAt: entry.fetchedAt,
		};
		added++;
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

main().catch((err) => {
	console.error('fetch-wotd failed unexpectedly:', err);
	process.exitCode = 1;
});
