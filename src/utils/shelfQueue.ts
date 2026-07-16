// Config for the "to be read/watched/played" queue pages — one per shelf
// category, mirroring the per-category label maps in shelfStatus.ts.

import type { ShelfCategory } from './shelfStatus';

export type ShelfQueueCreatorField = 'author' | 'director' | 'creator' | 'developer';

export interface ShelfQueueConfig {
    category: ShelfCategory;
    route: string;
    heading: string;
    verb: string;
    creatorField: ShelfQueueCreatorField;
    rssHref: string;
}

export const SHELF_QUEUE_CONFIG: Record<ShelfCategory, ShelfQueueConfig> = {
    bookshelf: {
        category: 'bookshelf',
        route: '/bookshelf/queue/',
        heading: 'To Read',
        verb: 'reading',
        creatorField: 'author',
        rssHref: '/bookshelf/rss.xml',
    },
    filmshelf: {
        category: 'filmshelf',
        route: '/filmshelf/queue/',
        heading: 'To Watch',
        verb: 'watching',
        creatorField: 'director',
        rssHref: '/filmshelf/rss.xml',
    },
    tvshelf: {
        category: 'tvshelf',
        route: '/tvshelf/queue/',
        heading: 'To Watch',
        verb: 'watching',
        creatorField: 'creator',
        rssHref: '/tvshelf/rss.xml',
    },
    gameshelf: {
        category: 'gameshelf',
        route: '/gameshelf/queue/',
        heading: 'To Play',
        verb: 'playing',
        creatorField: 'developer',
        rssHref: '/gameshelf/rss.xml',
    },
};

// author/director/creator can be a string or string[]; developer is a plain string.
export function getQueueCreator(
    data: { author?: string | string[]; director?: string[]; creator?: string[]; developer?: string },
    field: ShelfQueueCreatorField
): string {
    const value = data[field];
    if (!value) return '';
    return Array.isArray(value) ? value.join(', ') : value;
}
