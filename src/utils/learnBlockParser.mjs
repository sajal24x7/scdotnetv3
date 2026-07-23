// Shared ```learn fenced-block parser — the pure parsing core used both at
// build time (scripts/extract-learn-blocks.mjs, for TIL/evergreen) and
// client-side in the browser (src/components/learn/peopleDeckBuilder.ts, for
// the local-first people deck — see planning/practice-system-unified-srs.md
// §5.2/Phase 4). Isolating this from extract-learn-blocks.mjs is what lets
// the browser build a deck file without duplicating (and drifting from) the
// note-authoring rules documented in docs/content/authoring.md.
//
// Plain JS (no TypeScript) so both a Node script (native ESM import) and a
// Vite/Astro browser bundle (also native ESM) can import it unmodified.

import * as yaml from 'js-yaml';

// Keep in sync with LEARN_BLOCK_RE in src/utils/learnBlocks.ts (the render-
// side strip — unrelated concern, same fence syntax).
export const LEARN_BLOCK_RE = /^```learn[ \t]*\n([\s\S]*?)\n```[ \t]*$/gm;

const TOP_LEVEL_PROMPTS_RE = /^prompts:/m;
const TOP_LEVEL_Q_RE = /^q:/m;

// Plain YAML can't express repeated keys, so the q/a shorthand (no top-level
// `prompts:`) is pre-split into stanzas at each top-level `q:` line before
// YAML-parsing each stanza individually.
function parseShorthandBlock(raw, file, warnings) {
	const lines = raw.split('\n');
	const qLineIndexes = [];
	lines.forEach((line, i) => {
		if (/^q:/.test(line)) qLineIndexes.push(i);
	});

	let meta = {};
	const metaText = lines.slice(0, qLineIndexes[0]).join('\n');
	if (metaText.trim()) {
		const parsedMeta = yaml.load(metaText);
		if (parsedMeta && typeof parsedMeta === 'object') meta = parsedMeta;
		else warnings.push(`${file}: learn block metadata is not a YAML mapping — skipped`);
	}

	const prompts = [];
	for (let i = 0; i < qLineIndexes.length; i++) {
		const start = qLineIndexes[i];
		const end = i + 1 < qLineIndexes.length ? qLineIndexes[i + 1] : lines.length;
		const stanzaText = lines.slice(start, end).join('\n');
		try {
			const stanza = yaml.load(stanzaText);
			if (stanza && typeof stanza === 'object') prompts.push(stanza);
			else warnings.push(`${file}: learn block prompt is not a YAML mapping — skipped`);
		} catch (err) {
			warnings.push(`${file}: learn block prompt has invalid YAML (${err.reason ?? err.message}) — skipped`);
		}
	}

	return { ...meta, prompts };
}

// Parses every ```learn fenced block in `body` into an array of raw block
// objects (scalar fields + a `prompts` array). Malformed blocks are skipped
// with a message pushed to `warnings`, never thrown — a bad note shouldn't
// take down a whole build (or a whole browser import).
export function parseLearnBlocks(body, file, warnings) {
	const blocks = [];
	let match;
	LEARN_BLOCK_RE.lastIndex = 0;
	while ((match = LEARN_BLOCK_RE.exec(body)) !== null) {
		const raw = match[1];
		try {
			if (!TOP_LEVEL_PROMPTS_RE.test(raw) && TOP_LEVEL_Q_RE.test(raw)) {
				blocks.push(parseShorthandBlock(raw, file, warnings));
			} else {
				const parsed = yaml.load(raw);
				if (parsed && typeof parsed === 'object') blocks.push(parsed);
				else warnings.push(`${file}: learn block is not a YAML mapping — skipped`);
			}
		} catch (err) {
			warnings.push(`${file}: learn block has invalid YAML (${err.reason ?? err.message}) — skipped`);
		}
	}
	return blocks;
}

export function normalizeTag(tag) {
	return String(tag).replace(/^#/, '').trim().toLowerCase();
}

// First real paragraph of the note body, as plain text — the reference
// card's description fallback when a learn block doesn't set one.
export function firstParagraph(body) {
	const withoutBlocks = body
		.replace(LEARN_BLOCK_RE, '')
		.replace(/^```[\s\S]*?^```[ \t]*$/gm, '');
	const beforeReferences = withoutBlocks.split(/^#+\s*references.*$/im)[0];
	for (const rawBlock of beforeReferences.split(/\n\s*\n/)) {
		const block = rawBlock
			.split('\n')
			.filter((line) => !/^#/.test(line.trim()) && !/^[-*_]{3,}$/.test(line.trim()))
			.join('\n')
			.trim();
		if (!block) continue;
		const text = block
			.replace(/\[\[([^\]|]*\|)?([^\]]+)\]\]/g, '$2')
			.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
			.replace(/[*_]{1,3}([^*_]+)[*_]{1,3}/g, '$1')
			.replace(/\s+/g, ' ')
			.trim();
		if (!text) continue;
		if (text.length <= 240) return text;
		const cut = text.slice(0, 240);
		return `${cut.slice(0, cut.lastIndexOf(' '))}…`;
	}
	return '';
}

// First non-learn fenced code block, for the reference card's example fallback.
export function firstCodeBlock(body) {
	const re = /^```(\w*)[ \t]*\n([\s\S]*?)\n```[ \t]*$/gm;
	let match;
	while ((match = re.exec(body)) !== null) {
		if (match[1] === 'learn') continue;
		const code = match[2].trim();
		if (!code) continue;
		return code.length <= 280 ? code : `${code.slice(0, 280)}…`;
	}
	return undefined;
}

export function noteTimestamp(filename) {
	const match = filename.match(/^(\d{12})/);
	return match ? match[1] : null;
}

export function titleFromFilename(filename) {
	return filename.replace(/\.mdx?$/, '').replace(/^\d{12}\s*/, '');
}

export function slugFromFilename(filename) {
	return filename
		.replace(/\.mdx?$/, '')
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
}
