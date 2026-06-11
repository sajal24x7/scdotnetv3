import { getCollection } from 'astro:content';
import type { BookRating } from './bookRatings';
import { CONTENT_CATEGORIES } from '../content.config';

export interface Post {
  data: {
    title?: string;
    description?: string;
    pubDate: Date;
    updatedDate?: Date;
    category: string;
    status?: string;
    image?: string;
    tags?: string[];
    edition?: number | string;
    editionDisplay?: string;
    format?: string;
    genre?: string;
    syndicationUrls?: string[];
    layout?: {
      span?: 3 | 4 | 6 | 8 | 12;
    };
    // Unified shelf fields
    shelfStatus?: string;
    rating?: BookRating;
    started?: Date | string;
    finished?: Date | string;
    readingProgress?: number;
    // Book-specific
    author?: string | string[];
    series?: string;
    seriesNumber?: number;
    cover?: string;
    // Film-specific
    director?: string[];
    // TV-specific
    creator?: string[];
    showTitle?: string;
    season?: number;
    // Game-specific
    developer?: string;
    platform?: string;
    // Shared shelf
    year?: number;
  };
  id: string;
  body: string;
}

// Returns the list of known content category names.
// Each category corresponds to a folder under src/content/ and an Astro collection.
export function getContentCategories(): string[] {
  return [...CONTENT_CATEGORIES];
}

// Backwards-compatible alias — prefer getContentCategories() in new code
export const getYearDirectories = getContentCategories;

let cachedPosts: Post[] | null = null;
let cachedPostsPromise: Promise<Post[]> | null = null;

// Get all posts from category collections
export async function getAllPosts(): Promise<Post[]> {
  if (cachedPosts) {
    return cachedPosts;
  }

  if (!cachedPostsPromise) {
    cachedPostsPromise = (async () => {
      const categories = getContentCategories();
      const allPosts = await Promise.all(categories.map(async category => {
        const posts = await getCollection(category as any);
        return posts.map((post: any) => ({
          data: post.data,
          id: post.id,
          body: post.body,
        }));
      }));
      cachedPosts = allPosts.flat() as Post[];
      return cachedPosts;
    })();
  }

  const posts = await cachedPostsPromise;
  if (!cachedPosts) {
    cachedPosts = posts;
  }
  return posts;
}

// Transform post for ContentGrid component
export function transformPost(post: Post) {
    return {
        data: {
            title: post.data.title,
            description: post.data.description,
            pubDate: post.data.pubDate,
            category: post.data.category,
            image: post.data.image,
            tags: post.data.tags,
            edition: post.data.edition,
            editionDisplay: post.data.editionDisplay,
            syndicationUrls: post.data.syndicationUrls,
            layout: post.data.layout,
            format: post.data.format,
            genre: post.data.genre,
            // Unified shelf fields
            shelfStatus: post.data.shelfStatus,
            rating: post.data.rating,
            started: post.data.started,
            finished: post.data.finished,
            readingProgress: post.data.readingProgress,
            // Book-specific
            author: post.data.author,
            series: post.data.series,
            seriesNumber: post.data.seriesNumber,
            cover: post.data.cover,
            // Film-specific
            director: post.data.director,
            // TV-specific
            creator: post.data.creator,
            showTitle: post.data.showTitle,
            season: post.data.season,
            // Game-specific
            developer: post.data.developer,
            platform: post.data.platform,
            // Shared
            year: post.data.year,
            link: `/${post.data.category}/${post.id}/`
        },
        id: post.id,
        body: post.body,
    };
}

export const CATEGORY_FILTERS = {
    gardenHighlights: ['evergreen', 'til', 'now'],
    stream: ['blog', 'micro', 'photo'],
    streamHighlights: ['blog', 'micro'],
    bookshelf: ['bookshelf'],
    prose: ['poem', 'story'],
    garden: ['evergreen', 'til', 'bookshelf', 'story', 'poem']
} as const;

export type CategoryFilterKey = keyof typeof CATEGORY_FILTERS;

type CategoryFilter = CategoryFilterKey | ReadonlyArray<string> | string;

interface CategoryFilterOptions {
    limit?: number;
}

function isCategoryFilterKey(value: string): value is CategoryFilterKey {
    return Object.prototype.hasOwnProperty.call(CATEGORY_FILTERS, value);
}

function resolveCategoryList(filter: CategoryFilter): ReadonlyArray<string> {
    if (Array.isArray(filter)) {
        return filter;
    }

    if (typeof filter === 'string' && isCategoryFilterKey(filter)) {
        return CATEGORY_FILTERS[filter];
    }

    return [filter as string];
}

function getPostTimestamp(post: Post): number {
    const pubDate = post.data.pubDate;
    if (!pubDate) {
        return 0;
    }

    if (pubDate instanceof Date) {
        return pubDate.getTime();
    }

    return new Date(pubDate).getTime();
}

export function getPostsByCategory(posts: Post[], filter: CategoryFilter, options: CategoryFilterOptions = {}): Post[] {
    const categories = resolveCategoryList(filter);

    if (categories.length === 0) {
        return [];
    }

    const categorySet = new Set(categories);
    const filtered = posts
        .filter(post => {
            const category = post.data.category;
            return Boolean(category) && categorySet.has(category);
        })
        .sort((a, b) => getPostTimestamp(b) - getPostTimestamp(a));

    if (typeof options.limit === 'number') {
        return filtered.slice(0, options.limit);
    }

    return filtered;
}

/**
 * Extract edition number from nordletter title or slug
 * @param title The title to extract edition from (e.g., "A short trip to Porkkalanniemi")
 * @param slug The slug to extract edition from (e.g., "nl62-a-short-trip-to-porkkalanniemi")
 * @param filename The filename to extract edition from (e.g., "202507122238 NL62 - A short trip to Porkkalanniemi.md")
 * @returns The edition number as a string, or null if not found
 */
export function extractEditionNumber(title: string, slug?: string, filename?: string): string | null {
  // Try title first
  let match = title.match(/^NL(\d+)\s*-\s*/i);
  if (match) return match[1];
  // Try slug (e.g., nl62-...)
  if (slug) {
    match = slug.match(/^nl(\d+)[-\s_]/i);
    if (match) return match[1];
  }
  // Try filename (e.g., ... NL62 - ...)
  if (filename) {
    match = filename.match(/NL(\d+)\s*-\s*/i);
    if (match) return match[1];
  }
  return null;
}

/**
 * Clean nordletter title by removing the NL prefix
 * @param title The title to clean (e.g., "NL62 - A short trip to Porkkalanniemi")
 * @returns The cleaned title (e.g., "A short trip to Porkkalanniemi")
 */
export function cleanNordletterTitle(title: string): string {
  return title.replace(/^NL\d+\s*-\s*/, '');
}

/**
 * Get edition display text for nordletter posts
 * @param edition The edition number (from metadata)
 * @param pubDate The publication date
 * @param title The post title
 * @param slug The post slug
 * @param filename The post filename
 * @returns Formatted edition text (e.g., "62 - July 13")
 */
export function getEditionDisplay(edition: number | string | undefined, pubDate: Date, title?: string, slug?: string, filename?: string): string {
  let editionNumber = edition;
  if (!editionNumber) {
    editionNumber = extractEditionNumber(title || '', slug, filename);
  }
  if (!editionNumber) return '';
  const month = pubDate.toLocaleDateString('en-US', { month: 'long' });
  const day = pubDate.getDate();
  return `${editionNumber} - ${month} ${day}`;
} 
