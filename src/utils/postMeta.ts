import type { Interaction } from './interactions';
import type { AdjacentPost } from './content';

export interface Backlink {
    slug: string;
    title: string;
    description: string;
    category: string;
    created: Date;
}

/**
 * The prop shape every post detail layout accepts, so `[...slug].astro` can
 * pick one from a table and pass the same props to all of them.
 */
export interface PostLayoutProps {
    entry: { data: Record<string, any> };
    category: string;
    canonicalUrl: string;
    backlinks: Backlink[];
    interactions?: Interaction[];
    hasUpdatedDate: boolean;
    /** Neighbouring pieces in the same category; only the prose layout uses them. */
    siblings?: { previous?: AdjacentPost; next?: AdjacentPost };
}

/**
 * Common frontmatter fields every post detail layout needs, read once so the
 * layouts stay markup-only.
 */
export interface PostCommonMeta {
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

export function getPostCommonMeta(
    data: Record<string, any> | undefined,
    hasUpdatedDate: boolean
): PostCommonMeta {
    const entryData = data ?? {};

    return {
        title: entryData.title ?? '',
        description: entryData.description,
        tags: Array.isArray(entryData.tags) ? entryData.tags : [],
        syndicationUrls: Array.isArray(entryData.syndicationUrls) ? entryData.syndicationUrls : [],
        heroImage: entryData.image,
        galleryImages: Array.isArray(entryData.images) ? entryData.images : [],
        bridgyOmit: Boolean(entryData.bridgyOmit),
        publishedDate: entryData.created,
        updated: hasUpdatedDate ? entryData.updated : undefined
    };
}
