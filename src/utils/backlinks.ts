import { promises as fs } from 'node:fs';
import path from 'node:path';
import { getCollection } from 'astro:content';
import { getContentCategories } from './content';
import { stripLearnBlocks } from './learnBlocks';
import type { CollectionEntry } from 'astro:content';
import { CONTENT_CATEGORIES } from '../content.config';

type AnyEntry = CollectionEntry<(typeof CONTENT_CATEGORIES)[number]>;

/**
 * Backlinks System with Smart Caching
 *
 * This module builds a reverse index of internal links between posts.
 * For each post, it tracks which other posts link to it.
 *
 * Caching Strategy:
 * - The index is cached to src/data/backlinks-index.json for performance
 * - Cache is automatically invalidated when any content file is modified
 * - Checks modification time of all .md files in content directories
 * - Regenerates automatically if cache is stale
 * - Can force regeneration with REGENERATE_BACKLINKS=true env var
 *
 * This ensures backlinks are always up-to-date without manual intervention.
 */

export interface Backlink {
    slug: string;
    title: string;
    description: string;
    category: string;
    created: Date;
    /** Plain-text sentence surrounding the first mention of the link in the source post. */
    snippet?: string;
}

interface BacklinkJson extends Omit<Backlink, 'created'> {
    created: string;
}

type BacklinkIndex = Map<string, Backlink[]>;
type BacklinkArtifact = Record<string, BacklinkJson[]>;

const SITE_DOMAIN = 'sajalchoudhary.net';
const DATA_DIRECTORY = path.join(process.cwd(), 'src', 'data');
const CACHE_FILE = path.join(DATA_DIRECTORY, 'backlinks-index.json');

// Bump when the artifact schema changes (e.g. new fields) so stale caches regenerate.
const INDEX_VERSION = 2;

const SNIPPET_MAX_LENGTH = 500;
const SNIPPET_MIN_LENGTH = 20;

let backlinkIndexPromise: Promise<BacklinkIndex> | null = null;

/**
 * Find all posts that link to the current post using the cached backlink index.
 */
export async function findBacklinks(currentPostPath: string): Promise<Backlink[]> {
    return findBacklinksComprehensive(currentPostPath);
}

/**
 * Find backlinks for a post by consulting the precomputed backlink index.
 */
export async function findBacklinksComprehensive(currentPostPath: string): Promise<Backlink[]> {
    const index = await loadBacklinkIndex();
    const key = normalizeBacklinkKey(currentPostPath);

    if (!key) {
        return [];
    }

    const backlinks = index.get(key);
    if (!backlinks || backlinks.length === 0) {
        return [];
    }

    return backlinks.map(backlink => ({ ...backlink }));
}

/**
 * Get a sorted list of all content file paths relative to the content directory.
 * Used to detect when content files are added or removed.
 */
async function getContentFileList(): Promise<string[]> {
    const contentDir = path.join(process.cwd(), 'src', 'content');
    const categories = getContentCategories();
    const files: string[] = [];

    for (const category of categories) {
        const categoryDir = path.join(contentDir, category);
        try {
            const categoryFiles = await fs.readdir(categoryDir);
            for (const file of categoryFiles) {
                if (file.endsWith('.md')) {
                    files.push(`${category}/${file}`);
                }
            }
        } catch {
            continue;
        }
    }

    return files.sort();
}

/**
 * Check if the backlinks cache is fresh by comparing the stored file manifest.
 * Returns true if cache is fresh, false if stale, undefined if cache doesn't exist.
 *
 * Uses a file manifest instead of mtime comparison because git does not preserve
 * file modification times — all files get the checkout timestamp on clone/pull,
 * making mtime-based checks unreliable.
 */
async function isCacheFresh(): Promise<boolean | undefined> {
    try {
        const data = await fs.readFile(CACHE_FILE, 'utf-8');
        const raw = JSON.parse(data) as Record<string, unknown>;

        const meta = raw['_meta'] as { files?: string[]; version?: number } | undefined;
        if (!meta || !Array.isArray(meta.files)) {
            // Cache has no manifest (old format) — treat as stale so it regenerates
            console.log('[Backlinks] Cache has no file manifest, treating as stale');
            return false;
        }

        if (meta.version !== INDEX_VERSION) {
            console.log('[Backlinks] Cache schema version mismatch, treating as stale');
            return false;
        }

        const storedFiles = meta.files as string[];
        const currentFiles = await getContentFileList();

        if (storedFiles.length !== currentFiles.length) {
            return false; // File count differs
        }

        for (let i = 0; i < storedFiles.length; i++) {
            if (storedFiles[i] !== currentFiles[i]) {
                return false; // File list differs
            }
        }

        return true; // Manifest matches
    } catch (error: any) {
        if (error?.code === 'ENOENT') {
            return undefined; // Cache doesn't exist
        }
        console.warn('[Backlinks] Error checking cache freshness:', error);
        return false; // Assume stale on error
    }
}

async function loadBacklinkIndex(): Promise<BacklinkIndex> {
    if (!backlinkIndexPromise) {
        backlinkIndexPromise = (async () => {
            const shouldRegenerate = process.env.REGENERATE_BACKLINKS === 'true';
            const isCacheStale = await isCacheFresh() === false;

            if (shouldRegenerate || isCacheStale) {
                if (isCacheStale) {
                    console.log('[Backlinks] Cache is stale, regenerating index...');
                }
                const builtIndex = await buildBacklinkIndex();
                await writeBacklinkArtifact(builtIndex);
                return builtIndex;
            }

            const artifact = await readBacklinkArtifact();
            if (artifact) {
                console.log('[Backlinks] Using cached index');
                return convertArtifactToIndex(artifact);
            }

            console.log('[Backlinks] No cache found, building index...');
            const builtIndex = await buildBacklinkIndex();
            await writeBacklinkArtifact(builtIndex);
            return builtIndex;
        })();
    }

    return backlinkIndexPromise;
}

async function readBacklinkArtifact(): Promise<BacklinkArtifact | null> {
    try {
        const data = await fs.readFile(CACHE_FILE, 'utf-8');
        const raw = JSON.parse(data) as Record<string, unknown>;
        const artifact: BacklinkArtifact = {};
        for (const [key, value] of Object.entries(raw)) {
            if (key === '_meta') continue;
            artifact[key] = value as BacklinkJson[];
        }
        return artifact;
    } catch (error: any) {
        if (error?.code !== 'ENOENT') {
            console.warn('Failed to read backlink artifact, regenerating…', error);
        }

        return null;
    }
}

async function writeBacklinkArtifact(index: BacklinkIndex): Promise<void> {
    try {
        await fs.mkdir(DATA_DIRECTORY, { recursive: true });
        const artifact = convertIndexToArtifact(index);
        const files = await getContentFileList();
        const output: Record<string, unknown> = {
            _meta: {
                version: INDEX_VERSION,
                files,
            },
            ...artifact,
        };
        await fs.writeFile(CACHE_FILE, JSON.stringify(output, null, 2), 'utf-8');
    } catch (error) {
        console.warn('Unable to write backlink artifact', error);
    }
}

async function buildBacklinkIndex(): Promise<BacklinkIndex> {
    const categories = getContentCategories();
    const entries: AnyEntry[] = [];

    for (const category of categories) {
        const posts = (await getCollection(category as any)) as AnyEntry[];
        entries.push(...posts);
    }

    const postIndex = new Map<string, AnyEntry>();
    for (const entry of entries) {
        const category = resolveCategory(entry);
        const key = `${category}/${entry.id}`;
        postIndex.set(key, entry);
    }

    // Build a wikilink resolution index: slug, title, and Obsidian filename stem → "category/slug" key
    const wikilinkResolutionIndex = new Map<string, string>();
    for (const [key, entry] of postIndex) {
        const e = entry as any;
        wikilinkResolutionIndex.set(e.id, key);
        wikilinkResolutionIndex.set(key, key);
        const title = e.data?.title;
        if (title) {
            wikilinkResolutionIndex.set(String(title).toLowerCase(), key);
        }
    }

    // Also index by raw filename stem so Obsidian wikilinks like
    // [[202404141404 Control traffic flows]] resolve correctly.
    const contentDir = path.join(process.cwd(), 'src', 'content');
    for (const categoryRelPath of await getContentFileList()) {
        const [category, filename] = categoryRelPath.split('/');
        const filenameStem = filename.replace(/\.mdx?$/, '');
        const filePath = path.join(contentDir, categoryRelPath);
        try {
            const raw = await fs.readFile(filePath, 'utf-8');
            const fm = raw.match(/^---\s*\n([\s\S]*?)\n---/);
            if (!fm) continue;
            const slugMatch = fm[1].match(/^slug:\s*["']?(.+?)["']?\s*$/m);
            if (!slugMatch) continue;
            const slug = slugMatch[1].trim();
            const key = `${category}/${slug}`;
            if (postIndex.has(key)) {
                wikilinkResolutionIndex.set(filenameStem, key);
                wikilinkResolutionIndex.set(filenameStem.toLowerCase(), key);
            }
        } catch {
            continue;
        }
    }

    const backlinkIndex: BacklinkIndex = new Map();

    for (const entry of entries) {
        const category = resolveCategory(entry);
        const sourceKey = `${category}/${entry.id}`;
        const body = stripLearnBlocks(entry.body ?? '');
        const targets = collectBacklinkTargets(body);

        // Also collect wikilink targets and resolve them
        for (const [wikilinkTarget, position] of collectWikilinkTargets(body)) {
            const resolved =
                wikilinkResolutionIndex.get(wikilinkTarget) ||
                wikilinkResolutionIndex.get(wikilinkTarget.toLowerCase());
            if (resolved) {
                recordTargetPosition(targets, resolved, position);
            }
        }

        for (const [targetKey, position] of targets) {
            if (targetKey === sourceKey) continue;
            if (!postIndex.has(targetKey)) continue;

            const backlinkEntry = backlinkIndex.get(targetKey) ?? [];
            if (!backlinkIndex.has(targetKey)) {
                backlinkIndex.set(targetKey, backlinkEntry);
            }

            backlinkEntry.push({
                slug: `/${category}/${entry.id}/`,
                title: entry.data.title || 'Untitled',
                description: entry.data.description || '',
                category,
                created: normalizeDate(entry.data.created),
                snippet: extractSnippet(body, position)
            });
        }
    }

    for (const backlinks of backlinkIndex.values()) {
        backlinks.sort((a, b) => b.created.getTime() - a.created.getTime());
    }

    return backlinkIndex;
}

/**
 * Record the earliest position at which a target is mentioned in the content.
 * Reference-style link definitions carry no prose context, so any position
 * from real usage (or even a later definition) never overrides an earlier one.
 */
function recordTargetPosition(targets: Map<string, number>, key: string, position: number): void {
    const existing = targets.get(key);
    if (existing === undefined || position < existing) {
        targets.set(key, position);
    }
}

function collectBacklinkTargets(content: string): Map<string, number> {
    const hrefPositions = new Map<string, number>();
    const record = (href: string, position: number) => {
        const existing = hrefPositions.get(href);
        if (existing === undefined || position < existing) {
            hrefPositions.set(href, position);
        }
    };

    const inlineLinkRegex = /\[[^\]]+\]\(([^)]+)\)/g;
    let inlineMatch: RegExpExecArray | null;
    while ((inlineMatch = inlineLinkRegex.exec(content)) !== null) {
        record(inlineMatch[1], inlineMatch.index);
    }

    const htmlLinkRegex = /<a\s+[^>]*href=["']([^"']+)["']/gi;
    let htmlMatch: RegExpExecArray | null;
    while ((htmlMatch = htmlLinkRegex.exec(content)) !== null) {
        record(htmlMatch[1], htmlMatch.index);
    }

    const referenceLinkRegex = /^\s*\[[^\]]+\]:\s*(\S+)/gm;
    let referenceMatch: RegExpExecArray | null;
    while ((referenceMatch = referenceLinkRegex.exec(content)) !== null) {
        record(referenceMatch[1], referenceMatch.index);
    }

    const absoluteUrlRegex = /https?:\/\/[^\s)]+/gi;
    let absoluteMatch: RegExpExecArray | null;
    while ((absoluteMatch = absoluteUrlRegex.exec(content)) !== null) {
        record(absoluteMatch[0], absoluteMatch.index);
    }

    const protocolRelativeRegex = /(?:^|[^\w])\/\/[^\s)]+/gi;
    let protocolMatch: RegExpExecArray | null;
    while ((protocolMatch = protocolRelativeRegex.exec(content)) !== null) {
        record(protocolMatch[0].trim(), protocolMatch.index);
    }

    const domainOnlyRegex = /(?:^|[^\w.])(www\.)?sajalchoudhary\.net[^\s)]*/gi;
    let domainMatch: RegExpExecArray | null;
    while ((domainMatch = domainOnlyRegex.exec(content)) !== null) {
        const candidate = domainMatch[0].trim().replace(/^[^\w]*(?=sajalchoudhary\.net|www\.)/, '');
        if (candidate) {
            record(candidate, domainMatch.index);
        }
    }

    const normalizedTargets = new Map<string, number>();
    for (const [href, position] of hrefPositions) {
        const key = normalizeHrefToKey(href);
        if (key) {
            recordTargetPosition(normalizedTargets, key, position);
        }
    }

    return normalizedTargets;
}

/**
 * Extract raw wikilink targets from content body along with the position of
 * their first mention. Returns the target portion of [[target]] and
 * [[target|display]] syntax.
 */
function collectWikilinkTargets(content: string): Map<string, number> {
    const targets = new Map<string, number>();
    const wikilinkRegex = /\[\[([^\]|]+?)(?:\|[^\]]+?)?\]\]/g;
    let match: RegExpExecArray | null;
    while ((match = wikilinkRegex.exec(content)) !== null) {
        recordTargetPosition(targets, match[1].trim(), match.index);
    }
    return targets;
}

/**
 * Extract the sentence surrounding the link at `position` as plain text,
 * clamped to SNIPPET_MAX_LENGTH. Returns undefined when no usable prose
 * exists around the link (e.g. reference-link definitions or bare-URL lines).
 */
function extractSnippet(content: string, position: number): string | undefined {
    if (position < 0 || position >= content.length) {
        return undefined;
    }

    // Reference-link definition lines ("[ref]: /path/") carry no prose context.
    const lineStart = content.lastIndexOf('\n', position - 1) + 1;
    let lineEnd = content.indexOf('\n', position);
    if (lineEnd === -1) {
        lineEnd = content.length;
    }
    const line = content.slice(lineStart, lineEnd);
    if (/^\s*\[[^\]]+\]:\s/.test(line)) {
        return undefined;
    }

    // Bound the snippet to the containing line: content is authored
    // Obsidian-style with one paragraph or list item per line, so a line is a
    // logical unit and crossing it merges unrelated bullets into one snippet.
    const wholeLine = markdownToPlainText(line);
    if (wholeLine.length < SNIPPET_MIN_LENGTH) {
        return undefined;
    }

    if (wholeLine.length <= SNIPPET_MAX_LENGTH) {
        return wholeLine;
    }

    // The paragraph is too long to show whole. Start at the sentence
    // containing the link (so the mention always survives the cut) and run
    // forward until the limit.
    let sentenceStart = lineStart;
    for (let i = position - 1; i > lineStart; i--) {
        if ('.!?'.includes(content[i]) && /\s/.test(content[i + 1] ?? ' ')) {
            sentenceStart = i + 1;
            break;
        }
    }

    const fromSentence = markdownToPlainText(content.slice(sentenceStart, lineEnd));
    if (fromSentence.length < SNIPPET_MIN_LENGTH) {
        return undefined;
    }

    const leader = sentenceStart > lineStart ? '… ' : '';
    if (fromSentence.length <= SNIPPET_MAX_LENGTH) {
        return `${leader}${fromSentence}`;
    }

    const cutoff = fromSentence.lastIndexOf(' ', SNIPPET_MAX_LENGTH - 1);
    return `${leader}${fromSentence.slice(0, cutoff > 0 ? cutoff : SNIPPET_MAX_LENGTH - 1)}…`;
}

/**
 * Reduce a markdown fragment to readable plain text for snippet display.
 */
function markdownToPlainText(text: string): string {
    return text
        .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
        .replace(/\[\[([^\]|]+?)\|([^\]]+?)\]\]/g, '$2')
        // Bare wikilinks may point at Obsidian filename stems like
        // "202404011327 Entra ID" — drop the timestamp prefix for display.
        .replace(/\[\[(?:\d{10,14}\s+)?([^\]]+?)\]\]/g, '$1')
        .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
        .replace(/\[([^\]]+)\]\[[^\]]*\]/g, '$1')
        .replace(/<[^>]+>/g, '')
        .replace(/`([^`]*)`/g, '$1')
        .replace(/(\*\*|__)(.*?)\1/g, '$2')
        .replace(/(\*|_)(.*?)\1/g, '$2')
        .replace(/^#{1,6}\s+/gm, '')
        .replace(/^\s*(?:[-*+]|\d+[.)])\s+/gm, '')
        .replace(/^\s*>\s*/gm, '')
        .replace(/\s+/g, ' ')
        .trim();
}

function normalizeHrefToKey(href: string): string | null {
    const trimmed = href.trim();
    if (!trimmed) {
        return null;
    }

    const sanitized = trimmed.replace(/[.,;:!?]+$/, '');
    const lower = sanitized.toLowerCase();
    let pathname: string | null = null;

    if (lower.startsWith('http://') || lower.startsWith('https://')) {
        try {
            const url = new URL(sanitized);
            if (normalizeHost(url.hostname) !== SITE_DOMAIN) {
                return null;
            }

            pathname = url.pathname;
        } catch {
            return null;
        }
    } else if (lower.startsWith('//')) {
        try {
            const url = new URL(`https:${sanitized}`);
            if (normalizeHost(url.hostname) !== SITE_DOMAIN) {
                return null;
            }

            pathname = url.pathname;
        } catch {
            return null;
        }
    } else if (lower.startsWith('sajalchoudhary.net') || lower.startsWith('www.sajalchoudhary.net')) {
        try {
            const url = new URL(`https://${sanitized}`);
            if (normalizeHost(url.hostname) !== SITE_DOMAIN) {
                return null;
            }

            pathname = url.pathname;
        } catch {
            return null;
        }
    } else if (sanitized.startsWith('/')) {
        pathname = sanitized;
    } else {
        return null;
    }

    if (!pathname) {
        return null;
    }

    const normalizedPath = pathname
        .replace(/[#?].*$/, '')
        .replace(/^\/+/g, '')
        .replace(/\/+$/g, '');

    if (!normalizedPath) {
        return null;
    }

    return normalizedPath;
}

function normalizeBacklinkKey(target: string): string | null {
    if (!target) {
        return null;
    }

    if (target.includes('://') || target.startsWith('//') || target.startsWith('/') || target.startsWith(SITE_DOMAIN)) {
        return normalizeHrefToKey(target);
    }

    return target.replace(/^\/+/g, '').replace(/\/+$/g, '') || null;
}

function convertArtifactToIndex(artifact: BacklinkArtifact): BacklinkIndex {
    const index: BacklinkIndex = new Map();

    for (const [key, backlinks] of Object.entries(artifact)) {
        index.set(
            key,
            backlinks
                .map(backlink => ({
                    ...backlink,
                    created: new Date(backlink.created)
                }))
                .sort((a, b) => b.created.getTime() - a.created.getTime())
        );
    }

    return index;
}

function convertIndexToArtifact(index: BacklinkIndex): BacklinkArtifact {
    const artifact: BacklinkArtifact = {};

    for (const [key, backlinks] of index) {
        artifact[key] = backlinks.map(backlink => ({
            ...backlink,
            created: backlink.created.toISOString()
        }));
    }

    return artifact;
}

function normalizeHost(host: string): string {
    return host.replace(/^www\./, '');
}

function resolveCategory(entry: AnyEntry): string {
    if (entry.data && typeof entry.data.category === 'string' && entry.data.category.length > 0) {
        return entry.data.category;
    }

    return 'notes';
}

function normalizeDate(dateValue: unknown): Date {
    if (dateValue instanceof Date) {
        return dateValue;
    }

    if (typeof dateValue === 'string') {
        return new Date(dateValue);
    }

    return new Date();
}
