// Single source of truth for how content categories are grouped.
//
// The home feed (src/utils/feed.ts), the category filters (src/utils/content.ts),
// the tag pages (src/utils/tagPages.ts) and the post-page layout dispatcher
// (src/pages/[...slug].astro) all read from here, so a category can never end up
// in one grouping and be missing from another.
export const POST_GROUPS = {
    stream: ['blog', 'micro', 'photo'],
    garden: ['evergreen', 'til', 'story', 'poem'],
    shelf: ['bookshelf', 'filmshelf', 'tvshelf', 'gameshelf'],
    // `now` stands on its own: now updates surface in the home feed
    // ("Everything") but never in the garden or any of the garden's feeds.
    now: ['now'],
    nordletter: ['nordletter']
} as const;

export type PostGroup = keyof typeof POST_GROUPS;

export const POST_GROUP_CATEGORIES: string[] = Object.values(POST_GROUPS).flat();

const CATEGORY_TO_GROUP: Record<string, PostGroup> = Object.fromEntries(
    Object.entries(POST_GROUPS).flatMap(([group, categories]) =>
        (categories as readonly string[]).map((category) => [category, group as PostGroup])
    )
);

export function getPostGroup(category: string): PostGroup | undefined {
    return CATEGORY_TO_GROUP[category];
}
