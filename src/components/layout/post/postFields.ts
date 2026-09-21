import type { Interaction } from '../../../utils/interactions';

export interface Backlink {
    slug: string;
    title: string;
    description: string;
    category: string;
    created: Date;
}

export interface PostEntry {
    data: Record<string, any>;
}

// Every post layout takes the same props, so the dispatcher in
// src/pages/[...slug].astro can pick one without reshaping anything.
export interface PostLayoutProps {
    entry: PostEntry;
    category: string;
    canonicalUrl: string;
    backlinks: Backlink[];
    interactions?: Interaction[];
    hasUpdatedDate: boolean;
}

export interface CommonPostFields {
    title: string;
    description?: string;
    tags: string[];
    syndicationUrls: string[];
    heroImage?: string;
    galleryImages: string[];
    bridgyOmit: boolean;
    publishedDate?: Date | string;
    updated?: Date | string;
}

// Fields shared by all post families, read defensively because the frontmatter
// schema is a union across fourteen content collections.
export function readCommonPostFields(entry: PostEntry, hasUpdatedDate: boolean): CommonPostFields {
    const entryData = entry.data ?? {};

    return {
        title: entryData?.title ?? '',
        description: 'description' in entryData ? entryData.description : undefined,
        tags: 'tags' in entryData && Array.isArray(entryData.tags) ? entryData.tags : [],
        syndicationUrls:
            'syndicationUrls' in entryData && Array.isArray(entryData.syndicationUrls)
                ? entryData.syndicationUrls
                : [],
        heroImage: 'image' in entryData ? entryData.image : undefined,
        // Photo posts carry their gallery in frontmatter; it renders as a
        // carousel instead of the hero image (which is just its first entry).
        galleryImages: Array.isArray(entryData.images) ? entryData.images : [],
        bridgyOmit: Boolean('bridgyOmit' in entryData && entryData.bridgyOmit),
        publishedDate: entryData?.created,
        updated: hasUpdatedDate ? entryData.updated : undefined
    };
}

export function parsePostDate(value: Date | string | undefined): Date | null {
    if (!value) return null;
    if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function formatYMD(value: Date | string | undefined): string | null {
    const date = parsePostDate(value);
    if (!date) return null;
    return date.toISOString().slice(0, 10);
}

export function formatNames(value?: string | string[]): string | null {
    if (!value) return null;
    if (typeof value === 'string') return value;
    if (value.length === 0) return null;
    if (value.length === 1) return value[0];
    if (value.length === 2) return `${value[0]} and ${value[1]}`;
    return `${value.slice(0, -1).join(', ')}, and ${value[value.length - 1]}`;
}
