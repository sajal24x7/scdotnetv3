import { getAllPosts, transformPost, type Post } from './content';

export type TransformedPost = ReturnType<typeof transformPost>;

interface CategoryConfig {
    label: string;
    includes: string[];
}

export interface TagCategorySlice {
    key: string;
    label: string;
    includes: string[];
    includeLabels: string[];
    count: number;
    transformedPosts: TransformedPost[];
}

export interface TagPageData {
    tag: string;
    transformedPosts: TransformedPost[];
    categorySlices: TagCategorySlice[];
    totalCount: number;
}

const CATEGORY_CONFIG: Record<string, CategoryConfig> = {
    stream: { label: 'Stream', includes: ['blog', 'micro', 'photo'] },
    blog: { label: 'Blog', includes: ['blog'] },
    micro: { label: 'Micro', includes: ['micro'] },
    photo: { label: 'Photo', includes: ['photo'] },
    garden: { label: 'Garden', includes: ['evergreen', 'til', 'bookshelf', 'story', 'poem'] },
    evergreen: { label: 'Evergreen', includes: ['evergreen'] },
    til: { label: 'TIL', includes: ['til'] },
    bookshelf: { label: 'Bookshelf', includes: ['bookshelf'] },
    story: { label: 'Story', includes: ['story'] },
    poem: { label: 'Poem', includes: ['poem'] },
    nordletter: { label: 'Nordletter', includes: ['nordletter'] },
    now: { label: 'Now', includes: ['now'] }
};

const CATEGORY_ORDER = [
    'stream',
    'blog',
    'micro',
    'photo',
    'garden',
    'evergreen',
    'til',
    'bookshelf',
    'story',
    'poem',
    'nordletter',
    'now'
];

let cachedTagPageData: TagPageData[] | null = null;

export async function getTagPageData(): Promise<TagPageData[]> {
    if (cachedTagPageData) {
        return cachedTagPageData;
    }

    const allPosts = await getAllPosts();
    const postsByTag = new Map<string, Post[]>();

    for (const post of allPosts) {
        const tags = post.data.tags ?? [];
        for (const tag of tags) {
            const taggedPosts = postsByTag.get(tag);
            if (taggedPosts) {
                taggedPosts.push(post);
            } else {
                postsByTag.set(tag, [post]);
            }
        }
    }

    const tagPageData: TagPageData[] = [];

    for (const [tag, posts] of postsByTag.entries()) {
        if (posts.length === 0) {
            continue;
        }

        const sortedPosts = [...posts].sort((a, b) =>
            b.data.pubDate.valueOf() - a.data.pubDate.valueOf()
        );

        const transformedBySlug = new Map<string, TransformedPost>();
        const transformedPosts = sortedPosts.map(post => {
            const transformed = transformPost(post);
            transformedBySlug.set(post.slug, transformed);
            return transformed;
        });

        const categorySlices = buildCategorySlices(sortedPosts, transformedBySlug);

        tagPageData.push({
            tag,
            transformedPosts,
            categorySlices,
            totalCount: sortedPosts.length
        });
    }

    cachedTagPageData = tagPageData.sort((a, b) => a.tag.localeCompare(b.tag));
    return cachedTagPageData;
}

function buildCategorySlices(
    sortedPosts: Post[],
    transformedBySlug: Map<string, TransformedPost>
): TagCategorySlice[] {
    const slices: TagCategorySlice[] = [];
    const addedKeys = new Set<string>();

    for (const key of CATEGORY_ORDER) {
        const config = CATEGORY_CONFIG[key];
        if (!config) {
            continue;
        }

        const filtered = sortedPosts.filter(post =>
            config.includes.includes(post.data.category)
        );

        if (filtered.length === 0) {
            continue;
        }

        slices.push({
            key,
            label: config.label,
            includes: [...config.includes],
            includeLabels: config.includes.map(formatCategoryLabel),
            count: filtered.length,
            transformedPosts: filtered.map(post => {
                const transformed = transformedBySlug.get(post.slug);
                if (!transformed) {
                    throw new Error(`Missing transformed post for slug "${post.slug}".`);
                }
                return transformed;
            })
        });

        addedKeys.add(key);
    }

    const seenCategories = new Set(sortedPosts.map(post => post.data.category));
    for (const category of seenCategories) {
        if (addedKeys.has(category)) {
            continue;
        }

        const filtered = sortedPosts.filter(post => post.data.category === category);
        if (filtered.length === 0) {
            continue;
        }

        slices.push({
            key: category,
            label: formatCategoryLabel(category),
            includes: [category],
            includeLabels: [formatCategoryLabel(category)],
            count: filtered.length,
            transformedPosts: filtered.map(post => {
                const transformed = transformedBySlug.get(post.slug);
                if (!transformed) {
                    throw new Error(`Missing transformed post for slug "${post.slug}".`);
                }
                return transformed;
            })
        });
    }

    return slices;
}

export function formatCategoryLabel(key: string): string {
    const config = CATEGORY_CONFIG[key];
    if (config) {
        return config.label;
    }

    if (!key) {
        return key;
    }

    return key.length <= 3 ? key.toUpperCase() : key.charAt(0).toUpperCase() + key.slice(1);
}

export function clearCachedTagPageData() {
    cachedTagPageData = null;
}
