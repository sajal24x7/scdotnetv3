#!/usr/bin/env node
// Builds the /learn/til and /learn/evergreen content pools from ```learn
// fenced blocks authored inside published notes (the "mnemonic medium"
// pattern — prompts live in the note they test). See
// docs/architecture/learning-systems.md § "Note-backed decks".
//
// A note opts into a deck simply by containing a learn block:
//
//   ```learn
//   term: NAT Gateway            # optional — tile label; defaults to note title
//   category: azure              # optional — deck category; defaults to first tag
//   syntax: az network nat ...   # optional — canonical form on the reference card
//   description: ...             # optional — defaults to the note's first paragraph
//   example: ...                 # optional — defaults to the note's first code block
//   exampleNote: ...             # optional
//   prompts:
//     - q: Why not rely on Azure's default outbound IPs?
//       a: They change at random, so external services can't whitelist them.
//       note: ...                # optional
//       id: why-nat              # optional stable id override — see below
//   ```
//
// For the common case — no scalar overrides, just prompts — a bare q/a
// shorthand skips the `prompts:` list ceremony:
//
//   ```learn
//   q: Why not rely on Azure's default outbound IPs?
//   a: They change at random, so external services can't whitelist them.
//
//   q: What fixes it?
//   a: A NAT Gateway with a static public IP.
//   ```
//
// A block using the shorthand is any block with no top-level `prompts:`
// key; it's split into stanzas at each top-level `q:` line, and each
// stanza is YAML-parsed as one prompt (`q`, `a`, optional `note:`/`id:`).
// Anything before the first `q:` line is parsed as the scalar fields
// (`term:`, `category:`, etc.) shown above. The two forms can be mixed
// across the learn blocks in one note — scalar fields still come from the
// first block regardless of which form it uses.
//
// ID stability: prompt ids key the learner's localStorage review state, so
// they must never change once a prompt has been reviewed. Ids are
// positional (`til-<noteid>-p1`, `-p2`, ...) — append new prompts at the
// end; if you must insert or reorder, give prompts explicit `id:` fields.
//
// Invalid learn blocks are skipped with a warning (never fail the site
// build over a malformed note); `node scripts/validate-learn-data.mjs`
// checks the generated pools' invariants strictly.
//
// Run: node scripts/extract-learn-blocks.mjs
// Output: src/data/learn-decks.generated.json (committed; also rebuilt by
// `npm run dev` / `npm run build`).

import { readFileSync, readdirSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import * as yaml from 'js-yaml';

const repoRoot = path.resolve(import.meta.dirname, '..');
const OUT_FILE = path.join(repoRoot, 'src', 'data', 'learn-decks.generated.json');

// Keep in sync with LEARN_BLOCK_RE in src/utils/learnBlocks.ts (the render-
// side strip). Matches a fenced code block with the `learn` language tag.
const LEARN_BLOCK_RE = /^```learn[ \t]*\n([\s\S]*?)\n```[ \t]*$/gm;

// Tag → category presentation for the wall chart. Anything not listed falls
// back to a capitalized tag name with a generic emoji.
const CATEGORY_META = {
    til: {
        azure: { title: 'Azure', emoji: '☁️' },
        windows: { title: 'Windows', emoji: '🪟' },
        powershell: { title: 'PowerShell', emoji: '⚡' },
        vmware: { title: 'VMware', emoji: '🖥️' },
        network: { title: 'Networking', emoji: '🌐' },
        entra: { title: 'Entra', emoji: '🪪' },
        entraconnect: { title: 'Entra Connect', emoji: '🔄' },
        ansible: { title: 'Ansible', emoji: '🎛️' },
        ad: { title: 'Active Directory', emoji: '🗂️' },
        storage: { title: 'Storage', emoji: '💾' },
        cert: { title: 'Certificates', emoji: '🔐' },
        security: { title: 'Security', emoji: '🛡️' },
        linux: { title: 'Linux', emoji: '🐧' },
        dns: { title: 'DNS', emoji: '📇' },
        terraform: { title: 'Terraform', emoji: '🏗️' },
        bicep: { title: 'Bicep', emoji: '💪' },
        python: { title: 'Python', emoji: '🐍' },
        backup: { title: 'Backup', emoji: '🗃️' },
        monitoring: { title: 'Monitoring', emoji: '📈' },
        database: { title: 'Databases', emoji: '🛢️' },
        kubernetes: { title: 'Kubernetes', emoji: '☸️' },
    },
    evergreen: {
        learning: { title: 'Learning', emoji: '🧠' },
        writing: { title: 'Writing', emoji: '✍️' },
        thinking: { title: 'Thinking', emoji: '💭' },
        reading: { title: 'Reading', emoji: '📚' },
        health: { title: 'Health', emoji: '🫀' },
        habits: { title: 'Habits', emoji: '🔁' },
        tech: { title: 'Tech', emoji: '🖥️' },
    },
};
const FALLBACK_EMOJI = { til: '📝', evergreen: '🌱' };

const DECKS = [
    { deck: 'til', dir: 'src/content/til' },
    { deck: 'evergreen', dir: 'src/content/evergreen' },
];

// Mirrors slugFromEntry in src/content.config.ts — the fallback entry id
// (and therefore URL) when a note has no frontmatter slug.
function slugFromFilename(filename) {
    return filename
        .replace(/\.mdx?$/, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

function noteTimestamp(filename) {
    const match = filename.match(/^(\d{12})/);
    return match ? match[1] : null;
}

function titleFromFilename(filename) {
    return filename.replace(/\.mdx?$/, '').replace(/^\d{12}\s*/, '');
}

function normalizeTag(tag) {
    return String(tag).replace(/^#/, '').trim().toLowerCase();
}

// First real paragraph of the note body, as plain text, for the reference
// card's description fallback.
function firstParagraph(body) {
    const withoutBlocks = body
        .replace(LEARN_BLOCK_RE, '')
        .replace(/^```[\s\S]*?^```[ \t]*$/gm, '');
    // Trailing "# references" sections are link lists, not prose.
    const beforeReferences = withoutBlocks.split(/^#+\s*references.*$/im)[0];
    for (const rawBlock of beforeReferences.split(/\n\s*\n/)) {
        const block = rawBlock
            .split('\n')
            .filter((line) => !/^#/.test(line.trim()) && !/^[-*_]{3,}$/.test(line.trim()))
            .join('\n')
            .trim();
        if (!block) continue;
        const text = block
            .replace(/\[\[([^\]|]*\|)?([^\]]+)\]\]/g, '$2') // wikilinks → alias/target text
            .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1') // md links → text
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
function firstCodeBlock(body) {
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

// Plain YAML can't express repeated keys, so the q/a shorthand (no
// top-level `prompts:`) is pre-split into stanzas at each top-level `q:`
// line before YAML-parsing each stanza individually.
const TOP_LEVEL_PROMPTS_RE = /^prompts:/m;
const TOP_LEVEL_Q_RE = /^q:/m;

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

function parseLearnBlocks(body, file, warnings) {
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

function buildDeck(deck, dir, warnings) {
    const absDir = path.join(repoRoot, dir);
    if (!existsSync(absDir)) return { categories: [], introductionOrder: [] };

    const byCategory = new Map();
    const ordered = []; // { itemId, timestamp }

    const files = readdirSync(absDir).filter((f) => /\.mdx?$/.test(f)).sort();
    for (const file of files) {
        const raw = readFileSync(path.join(absDir, file), 'utf8');
        let parsed;
        try {
            parsed = matter(raw);
        } catch {
            continue; // notes with broken frontmatter are the pipeline's problem, not ours
        }
        const { data, content: body } = parsed;

        const blocks = parseLearnBlocks(body, `${dir}/${file}`, warnings);
        if (blocks.length === 0) continue;

        const timestamp = noteTimestamp(file);
        const itemId = `${deck}-${timestamp ?? slugFromFilename(file)}`;
        const slug = data.slug != null && data.slug !== '' ? String(data.slug) : slugFromFilename(file);
        const meta = blocks[0]; // scalar fields come from the first block

        const prompts = [];
        for (const block of blocks) {
            if (!Array.isArray(block.prompts)) continue;
            for (const prompt of block.prompts) {
                if (!prompt || typeof prompt.q !== 'string' || typeof prompt.a !== 'string') {
                    warnings.push(`${dir}/${file}: prompt missing q/a — skipped`);
                    continue;
                }
                const suffix = prompt.id != null && prompt.id !== '' ? String(prompt.id) : `p${prompts.length + 1}`;
                prompts.push({
                    id: `${itemId}-${suffix}`,
                    q: prompt.q.trim(),
                    a: prompt.a.trim(),
                    ...(typeof prompt.note === 'string' && prompt.note.trim() ? { note: prompt.note.trim() } : {}),
                });
            }
        }
        if (prompts.length === 0) {
            warnings.push(`${dir}/${file}: learn block has no valid prompts — note skipped`);
            continue;
        }

        const tags = Array.isArray(data.tags) ? data.tags.map(normalizeTag).filter(Boolean) : [];
        const categoryTag = normalizeTag(meta.category ?? tags[0] ?? 'notes') || 'notes';

        const example = typeof meta.example === 'string' ? meta.example.trim() : firstCodeBlock(body);
        const item = {
            id: itemId,
            term: String(meta.term ?? data.title ?? titleFromFilename(file)).trim(),
            ...(typeof meta.syntax === 'string' && meta.syntax.trim() ? { syntax: meta.syntax.trim() } : {}),
            description: String(meta.description ?? '').trim() || firstParagraph(body),
            ...(example ? { example } : {}),
            ...(typeof meta.exampleNote === 'string' && meta.exampleNote.trim() ? { exampleNote: meta.exampleNote.trim() } : {}),
            href: `/${deck}/${slug}/`,
            prompts,
        };

        if (!byCategory.has(categoryTag)) byCategory.set(categoryTag, []);
        byCategory.get(categoryTag).push(item);
        ordered.push({ itemId, timestamp: timestamp ?? '000000000000' });
    }

    const metaFor = (tag) =>
        CATEGORY_META[deck]?.[tag] ?? {
            title: tag.charAt(0).toUpperCase() + tag.slice(1),
            emoji: FALLBACK_EMOJI[deck],
        };

    const categories = [...byCategory.entries()]
        .sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]))
        .map(([tag, items]) => ({
            id: tag,
            title: metaFor(tag).title,
            emoji: metaFor(tag).emoji,
            description: '',
            items,
        }));

    // Newest note first: a TIL published today is the next new item the
    // scheduler introduces — reinforcement lands close to the encounter.
    const introductionOrder = ordered
        .sort((a, b) => b.timestamp.localeCompare(a.timestamp) || a.itemId.localeCompare(b.itemId))
        .map((entry) => entry.itemId);

    return { categories, introductionOrder };
}

function main() {
    const warnings = [];
    const decks = {};
    for (const { deck, dir } of DECKS) {
        decks[deck] = buildDeck(deck, dir, warnings);
        const itemCount = decks[deck].categories.reduce((n, c) => n + c.items.length, 0);
        const promptCount = decks[deck].categories.reduce(
            (n, c) => n + c.items.reduce((m, i) => m + i.prompts.length, 0),
            0,
        );
        console.log(`✓ ${deck}: ${decks[deck].categories.length} categories, ${itemCount} items, ${promptCount} prompts`);
    }

    for (const warning of warnings) console.warn(`  ⚠ ${warning}`);

    const json = `${JSON.stringify(decks, null, '\t')}\n`;
    const existing = existsSync(OUT_FILE) ? readFileSync(OUT_FILE, 'utf8') : null;
    if (existing !== json) {
        writeFileSync(OUT_FILE, json);
        console.log(`Wrote ${path.relative(repoRoot, OUT_FILE)}`);
    } else {
        console.log(`${path.relative(repoRoot, OUT_FILE)} unchanged`);
    }
}

main();
