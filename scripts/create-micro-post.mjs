#!/usr/bin/env node
/**
 * Create a micro post in src/content/micro/.
 *
 * Two modes, used by two workflows (see docs/operations/micro-posting.md):
 *
 * 1. Env mode — dispatched from a phone Shortcut via micro-post.yml:
 *      MICRO_TEXT   The post body (markdown). Required.
 *      MICRO_TITLE  Post title. Omit for a title-less micro post.
 *      MICRO_TAGS   Comma-separated tags. Optional.
 *
 * 2. File mode — a bare note dropped in src/content/inbox/micro/,
 *    picked up by micro-inbox.yml:
 *      node scripts/create-micro-post.mjs --from-file <path>
 *    The note's filename is ignored. An optional frontmatter block may
 *    set title/tags; otherwise a leading "# Heading" line becomes the
 *    title. The source file is deleted after the post is created.
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

// ---------------------------------------------------------------------------
// Input collection

const env = (name) => (process.env[name] ?? '').trim();

const fromFileIdx = process.argv.indexOf('--from-file');
const sourceFile = fromFileIdx !== -1 ? process.argv[fromFileIdx + 1] : null;

let text, title, tags;
if (sourceFile) {
    ({ text, title, tags } = parseNoteFile(sourceFile));
} else {
    text = env('MICRO_TEXT');
    title = env('MICRO_TITLE');
    tags = splitTags(env('MICRO_TAGS'));
}

if (!text) {
    console.error('Nothing to post: text is empty.');
    process.exit(1);
}

// Minimal parser for notes dropped in inbox/micro: optional frontmatter
// (only title/tags are honoured), optional leading "# Heading" as title.
function parseNoteFile(file) {
    let body = fs.readFileSync(file, 'utf8').replace(/^﻿/, '');
    let title = '';
    let tags = [];

    const fm = body.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
    if (fm) {
        body = body.slice(fm[0].length);
        const lines = fm[1].split(/\r?\n/);
        for (let i = 0; i < lines.length; i++) {
            const kv = lines[i].match(/^(title|tags):\s*(.*)$/);
            if (!kv) continue;
            const value = kv[2].trim();
            if (kv[1] === 'title') {
                title = value.replace(/^(['"])(.*)\1$/, '$2');
            } else if (value.startsWith('[')) {
                tags = splitTags(value.replace(/^\[|\]$/g, ''));
            } else if (value) {
                tags = splitTags(value);
            } else {
                // Block list: following "  - tag" lines
                while (i + 1 < lines.length && /^\s*-\s+/.test(lines[i + 1])) {
                    tags.push(lines[++i].replace(/^\s*-\s+/, '').trim().toLowerCase());
                }
            }
        }
    }

    body = body.trim();
    const heading = body.match(/^#\s+(.+)\r?\n+/);
    if (!title && heading) {
        title = heading[1].trim();
        body = body.slice(heading[0].length).trim();
    }

    return { text: body, title, tags };
}

function splitTags(value) {
    return value
        .split(',')
        .map((t) => t.trim().replace(/^(['"])(.*)\1$/, '$2').toLowerCase())
        .filter(Boolean);
}

// ---------------------------------------------------------------------------
// Post generation

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

if (sourceFile) {
    fs.rmSync(sourceFile);
    console.log(`Removed ${sourceFile}`);
}

// Expose the filename to later workflow steps.
if (process.env.GITHUB_OUTPUT) {
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `filename=${filename}\n`);
}
