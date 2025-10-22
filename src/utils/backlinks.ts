import { promises as fs } from 'node:fs';
import path from 'node:path';
import { getCollection } from 'astro:content';
import { getYearDirectories } from './content';
import type { CollectionEntry } from 'astro:content';

export interface Backlink {
    slug: string;
    title: string;
    description: string;
    category: string;
    pubDate: Date;
}

interface BacklinkJson extends Omit<Backlink, 'pubDate'> {
    pubDate: string;
}

type BacklinkIndex = Map<string, Backlink[]>;
type BacklinkArtifact = Record<string, BacklinkJson[]>;

const SITE_DOMAIN = 'sajalchoudhary.net';
const DATA_DIRECTORY = path.join(process.cwd(), 'src', 'data');
const CACHE_FILE = path.join(DATA_DIRECTORY, 'backlinks-index.json');

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

async function loadBacklinkIndex(): Promise<BacklinkIndex> {
    if (!backlinkIndexPromise) {
        backlinkIndexPromise = (async () => {
            const shouldRegenerate = process.env.REGENERATE_BACKLINKS === 'true';
            const artifact = shouldRegenerate ? null : await readBacklinkArtifact();

            if (artifact) {
                return convertArtifactToIndex(artifact);
            }

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
        return JSON.parse(data) as BacklinkArtifact;
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
        await fs.writeFile(CACHE_FILE, JSON.stringify(artifact, null, 2), 'utf-8');
    } catch (error) {
        console.warn('Unable to write backlink artifact', error);
    }
}

async function buildBacklinkIndex(): Promise<BacklinkIndex> {
    const years = getYearDirectories();
    const entries: CollectionEntry<any>[] = [];

    for (const year of years) {
        const posts = await getCollection(year as any);
        entries.push(...posts);
    }

    const postIndex = new Map<string, CollectionEntry<any>>();
    for (const entry of entries) {
        const category = resolveCategory(entry);
        const key = `${category}/${entry.slug}`;
        postIndex.set(key, entry);
    }

    const backlinkIndex: BacklinkIndex = new Map();

    for (const entry of entries) {
        const category = resolveCategory(entry);
        const sourceKey = `${category}/${entry.slug}`;
        const targets = collectBacklinkTargets(entry.body);

        for (const targetKey of targets) {
            if (targetKey === sourceKey) continue;
            if (!postIndex.has(targetKey)) continue;

            const backlinkEntry = backlinkIndex.get(targetKey) ?? [];
            if (!backlinkIndex.has(targetKey)) {
                backlinkIndex.set(targetKey, backlinkEntry);
            }

            backlinkEntry.push({
                slug: `/${category}/${entry.slug}/`,
                title: entry.data.title || 'Untitled',
                description: entry.data.description || '',
                category,
                pubDate: normalizeDate(entry.data.pubDate)
            });
        }
    }

    for (const backlinks of backlinkIndex.values()) {
        backlinks.sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());
    }

    return backlinkIndex;
}

function collectBacklinkTargets(content: string): Set<string> {
    const hrefTargets = new Set<string>();

    const inlineLinkRegex = /\[[^\]]+\]\(([^)]+)\)/g;
    let inlineMatch: RegExpExecArray | null;
    while ((inlineMatch = inlineLinkRegex.exec(content)) !== null) {
        hrefTargets.add(inlineMatch[1]);
    }

    const htmlLinkRegex = /<a\s+[^>]*href=["']([^"']+)["']/gi;
    let htmlMatch: RegExpExecArray | null;
    while ((htmlMatch = htmlLinkRegex.exec(content)) !== null) {
        hrefTargets.add(htmlMatch[1]);
    }

    const referenceLinkRegex = /^\s*\[[^\]]+\]:\s*(\S+)/gm;
    let referenceMatch: RegExpExecArray | null;
    while ((referenceMatch = referenceLinkRegex.exec(content)) !== null) {
        hrefTargets.add(referenceMatch[1]);
    }

    const absoluteUrlRegex = /https?:\/\/[^\s)]+/gi;
    let absoluteMatch: RegExpExecArray | null;
    while ((absoluteMatch = absoluteUrlRegex.exec(content)) !== null) {
        hrefTargets.add(absoluteMatch[0]);
    }

    const protocolRelativeRegex = /(?:^|[^\w])\/\/[^\s)]+/gi;
    let protocolMatch: RegExpExecArray | null;
    while ((protocolMatch = protocolRelativeRegex.exec(content)) !== null) {
        hrefTargets.add(protocolMatch[0].trim());
    }

    const domainOnlyRegex = /(?:^|[^\w.])(www\.)?sajalchoudhary\.net[^\s)]*/gi;
    let domainMatch: RegExpExecArray | null;
    while ((domainMatch = domainOnlyRegex.exec(content)) !== null) {
        const candidate = domainMatch[0].trim().replace(/^[^\w]*(?=sajalchoudhary\.net|www\.)/, '');
        if (candidate) {
            hrefTargets.add(candidate);
        }
    }

    const normalizedTargets = new Set<string>();
    for (const href of hrefTargets) {
        const key = normalizeHrefToKey(href);
        if (key) {
            normalizedTargets.add(key);
        }
    }

    return normalizedTargets;
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
                    pubDate: new Date(backlink.pubDate)
                }))
                .sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime())
        );
    }

    return index;
}

function convertIndexToArtifact(index: BacklinkIndex): BacklinkArtifact {
    const artifact: BacklinkArtifact = {};

    for (const [key, backlinks] of index) {
        artifact[key] = backlinks.map(backlink => ({
            ...backlink,
            pubDate: backlink.pubDate.toISOString()
        }));
    }

    return artifact;
}

function normalizeHost(host: string): string {
    return host.replace(/^www\./, '');
}

function resolveCategory(entry: CollectionEntry<any>): string {
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
