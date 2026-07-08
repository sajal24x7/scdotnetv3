#!/usr/bin/env node
/**
 * Create a micro post in src/content/micro/ from environment variables.
 *
 * Used by the "Create micro post" GitHub Actions workflow (micro-post.yml),
 * which is dispatched from a phone (Apple Shortcut) — see
 * docs/operations/micro-posting.md.
 *
 * Inputs (all via env, all optional except that at least one of
 * MICRO_URL / MICRO_QUOTE / MICRO_COMMENT must be non-empty):
 *   MICRO_TITLE      Post title. Omit for a title-less micro post.
 *   MICRO_URL        Link the post is about.
 *   MICRO_LINK_TEXT  Text for the link (defaults to title, then URL).
 *   MICRO_QUOTE      Quoted passage — rendered as a blockquote.
 *   MICRO_COMMENT    Your own commentary, plain markdown.
 *   MICRO_TAGS       Comma-separated tags.
 *
 * Output file follows the existing convention:
 *   src/content/micro/YYYYMMDDHHMM Title.md   (timestamp in Europe/Helsinki)
 *   src/content/micro/YYYYMMDDHHMM.md         (when no title given)
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const TIME_ZONE = 'Europe/Helsinki';
const MICRO_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '../src/content/micro');

const env = (name) => (process.env[name] ?? '').trim();

const title = env('MICRO_TITLE');
const url = env('MICRO_URL');
const linkText = env('MICRO_LINK_TEXT');
const quote = env('MICRO_QUOTE');
const comment = env('MICRO_COMMENT');
const tags = env('MICRO_TAGS')
    .split(',')
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);

if (!url && !quote && !comment) {
    console.error('Nothing to post: provide at least one of url, quote or comment.');
    process.exit(1);
}

// "YYYYMMDDHHMM" in local (Helsinki) time, matching existing filenames.
function localStamp(date) {
    const parts = new Intl.DateTimeFormat('en-GB', {
        timeZone: TIME_ZONE,
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', hour12: false,
    }).formatToParts(date);
    const get = (type) => parts.find((p) => p.type === type).value;
    return `${get('year')}${get('month')}${get('day')}${get('hour')}${get('minute')}`;
}

function slugify(text) {
    return text
        .toLowerCase()
        .replace(/['’]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

// Strip characters that are unsafe in filenames; keep unicode and quotes.
function safeFilename(text) {
    return text.replace(/[/\\:*?"<>|]/g, '').replace(/\s+/g, ' ').trim();
}

// Quote a YAML scalar only when needed, matching the hand-written style
// of existing frontmatter.
function yamlScalar(text) {
    if (/^[A-Za-z0-9]/.test(text) && !/[:#"\n]/.test(text) && !/\s$/.test(text)) {
        return text;
    }
    return `"${text.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
}

const created = new Date();
created.setMilliseconds(0);

// Find a free filename; bump the timestamp a minute at a time on collision.
let stampDate = new Date(created);
let filename;
let filePath;
for (let attempt = 0; attempt < 10; attempt++) {
    const stamp = localStamp(stampDate);
    filename = title ? `${stamp} ${safeFilename(title)}.md` : `${stamp}.md`;
    filePath = path.join(MICRO_DIR, filename);
    if (!fs.existsSync(filePath)) break;
    filePath = null;
    stampDate = new Date(stampDate.getTime() + 60_000);
}
if (!filePath) {
    console.error('Could not find a free filename — too many posts this minute?');
    process.exit(1);
}

const createdIso = created.toISOString();
const frontmatter = ['---'];
if (title) {
    frontmatter.push(`title: ${yamlScalar(title)}`);
    frontmatter.push(`slug: ${slugify(title)}`);
}
frontmatter.push(`created: ${createdIso}`);
frontmatter.push(`updated: ${createdIso}`);
frontmatter.push('category: micro');
if (tags.length > 0) {
    frontmatter.push('tags:');
    for (const tag of tags) frontmatter.push(`  - ${tag}`);
}
frontmatter.push('---');

const blocks = [];
if (url) {
    const text = linkText || title || url.replace(/^https?:\/\//, '');
    blocks.push(`[${text}](${url})`);
}
if (quote) {
    // Each paragraph of the quote becomes its own blockquote,
    // matching the style of existing micro posts.
    const paragraphs = quote.split(/\n\s*\n/).map((p) =>
        p.split('\n').map((line) => `> ${line.trim()}`.trimEnd()).join('\n')
    );
    blocks.push(paragraphs.join('\n\n'));
}
if (comment) {
    blocks.push(comment);
}

fs.writeFileSync(filePath, `${frontmatter.join('\n')}\n\n${blocks.join('\n\n')}\n`);
console.log(`Created ${path.relative(process.cwd(), filePath)}`);

// Expose the filename to later workflow steps.
if (process.env.GITHUB_OUTPUT) {
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `filename=${filename}\n`);
}
