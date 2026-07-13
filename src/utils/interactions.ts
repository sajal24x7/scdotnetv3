import { promises as fs } from 'node:fs';
import path from 'node:path';

/**
 * Interactions System
 *
 * Reads the interactions index baked by scripts/collect-interactions.js
 * (and refreshed on a schedule by .github/workflows/refresh-interactions.yml).
 * For each post it stores the responses gathered from syndicated copies —
 * replies, likes, and reposts from Mastodon/Bluesky, replies/comments and
 * like counts from Threads/Instagram — with webmentions and email planned
 * to land in the same shape.
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

let interactionsIndexPromise: Promise<InteractionsArtifact> | null = null;

async function loadInteractionsIndex(): Promise<InteractionsArtifact> {
    if (!interactionsIndexPromise) {
        interactionsIndexPromise = (async () => {
            try {
                const raw = JSON.parse(await fs.readFile(INDEX_FILE, 'utf-8')) as Record<string, unknown>;
                const artifact: InteractionsArtifact = {};
                for (const [key, value] of Object.entries(raw)) {
                    if (key === '_meta') continue;
                    artifact[key] = value as Interaction[];
                }
                return artifact;
            } catch (error: any) {
                if (error?.code !== 'ENOENT') {
                    console.warn('[Interactions] Failed to read interactions index:', error);
                }
                return {};
            }
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
