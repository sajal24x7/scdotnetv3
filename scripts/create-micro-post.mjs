#!/usr/bin/env node
/**
 * Create a micro post in src/content/micro/ from environment variables.
 *
 * Used by the "Create micro post" GitHub Actions workflow (micro-post.yml),
 * which is dispatched from a phone (Apple Shortcut) — see
 * docs/operations/micro-posting.md.
 *
 * Inputs (via env):
 *   MICRO_TEXT   The post body (markdown). Required.
 *   MICRO_TITLE  Post title. Omit for a title-less micro post.
 *   MICRO_TAGS   Comma-separated tags. Optional.
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

const text = env('MICRO_TEXT');
const title = env('MICRO_TITLE');
const tags = env('MICRO_TAGS')
    .split(',')
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);

if (!text) {
    console.error('Nothing to post: text is empty.');
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

fs.writeFileSync(filePath, `${frontmatter.join('\n')}\n\n${text}\n`);
console.log(`Created ${path.relative(process.cwd(), filePath)}`);

// Expose the filename to later workflow steps.
if (process.env.GITHUB_OUTPUT) {
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `filename=${filename}\n`);
}
