import { promises as fs } from 'node:fs';
import path from 'node:path';

/**
 * Interactions System
 *
 * Reads the interactions index baked by scripts/collect-interactions.js
 * (and refreshed on a schedule by .github/workflows/refresh-interactions.yml),
 * merged at build time with the hand-curated src/data/email-interactions.json.
 * For each post it stores the responses gathered from syndicated copies —
 * replies, likes, and reposts from Mastodon/Bluesky, replies/comments and
 * like counts from Threads/Instagram, verified webmentions from other blogs,
 * and manually pasted-in email replies.
 *
 * Index keys are `category/slug`, matching page paths and the backlinks index.
 */

/**
 * "like-count" is the count-only aggregate for platforms that never expose
 * who liked (Threads, Instagram); it renders as a chip, not a facepile.
 */
export type InteractionType = 'reply' | 'like' | 'repost' | 'mention' | 'like-count';
export type InteractionPlatform =
    | 'mastodon'
    | 'bluesky'
    | 'threads'
    | 'instagram'
    | 'web'
    | 'email';

export interface Interaction {
    id: string;
    type: InteractionType;
    platform: InteractionPlatform;
    author: {
        name: string;
        url?: string;
        avatar?: string;
    };
    /** Sanitized HTML — present for replies/mentions, absent for likes/reposts. */
    content?: string;
    /** Permalink to the interaction on its platform. */
    url?: string;
    /** ISO timestamp when the platform provides one. */
    published?: string;
    /** Aggregate total — present on "like-count" entries only. */
    count?: number;
    status?: 'approved' | 'pending' | 'blocked';
}

type InteractionsArtifact = Record<string, Interaction[]>;

const INDEX_FILE = path.join(process.cwd(), 'src', 'data', 'interactions-index.json');
const EMAIL_FILE = path.join(process.cwd(), 'src', 'data', 'email-interactions.json');

let interactionsIndexPromise: Promise<InteractionsArtifact> | null = null;

async function readArtifact(file: string): Promise<InteractionsArtifact> {
    try {
        const raw = JSON.parse(await fs.readFile(file, 'utf-8')) as Record<string, unknown>;
        const artifact: InteractionsArtifact = {};
        for (const [key, value] of Object.entries(raw)) {
            if (key === '_meta') continue;
            artifact[key] = value as Interaction[];
        }
        return artifact;
    } catch (error: any) {
        if (error?.code !== 'ENOENT') {
            console.warn(`[Interactions] Failed to read ${file}:`, error);
        }
        return {};
    }
}

/** Same chronological-stream order the collector writes to the index. */
function sortEntries(entries: Interaction[]): Interaction[] {
    return [...entries].sort((a, b) => {
        if (a.published && b.published) return a.published.localeCompare(b.published);
        if (a.published) return -1;
        if (b.published) return 1;
        return a.id.localeCompare(b.id);
    });
}

async function loadInteractionsIndex(): Promise<InteractionsArtifact> {
    if (!interactionsIndexPromise) {
        interactionsIndexPromise = (async () => {
            const [collected, email] = await Promise.all([readArtifact(INDEX_FILE), readArtifact(EMAIL_FILE)]);

            // The curated email file is never written by the collector, so a
            // plain merge can't clobber anything it manages.
            const merged: InteractionsArtifact = { ...collected };
            for (const [key, entries] of Object.entries(email)) {
                merged[key] = sortEntries([...(merged[key] ?? []), ...entries]);
            }
            return merged;
        })();
    }

    return interactionsIndexPromise;
}

/**
 * All publishable interactions for a post, oldest first.
 * @param postPath - `category/slug`, with or without surrounding slashes
 */
export async function getInteractionsForPost(postPath: string): Promise<Interaction[]> {
    const key = postPath.replace(/^\/+/, '').replace(/\/+$/, '');
    if (!key) return [];

    const index = await loadInteractionsIndex();
    const interactions = index[key];
    if (!interactions || interactions.length === 0) return [];

    // Only entries the moderation flow has approved (collector default) are
    // ever rendered; pending/blocked stay invisible.
    return interactions.filter((interaction) => (interaction.status ?? 'approved') === 'approved');
}
