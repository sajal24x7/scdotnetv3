import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Define a custom date schema that accepts both Date objects and ISO date strings
const dateSchema = z.union([
  z.date(),
  z.string().transform((str) => new Date(str))
]);

// Derive a URL-safe id from the file entry path (used as fallback when no slug in frontmatter)
function slugFromEntry(entry: string): string {
  return entry
    .replace(/\.mdx?$/, '')
    .split('/')
    .pop()!
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Shared glob loader factory — uses frontmatter slug as the entry id so URLs are
// stable and human-readable regardless of the underlying filename convention.
const postsLoader = (category: string) =>
  glob({
    pattern: '**/*.{md,mdx}',
    base: `./src/content/${category}`,
    generateId: ({ entry, data }) =>
      ((data as Record<string, unknown>).slug as string | undefined) || slugFromEntry(entry),
  });

// Shared post schema (all 14 content categories use this)
const postsSchema = z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    pubDate: dateSchema,
    updatedDate: dateSchema.optional(),
    category: z.enum(['evergreen', 'blog', 'micro', 'photo', 'nordletter', 'story', 'poem', 'bookshelf', 'filmshelf', 'tvshelf', 'gameshelf', 'now', 'til', 'colophon']),
    status: z.enum(['active', 'done']).optional().default('active'),
    tags: z.array(z.string()).optional(),
    image: z.string().optional(),
    edition: z.number().optional(),
    format: z.string().optional(),
    genre: z.string().optional(),
    layout: z.object({
      span: z.union([
        z.literal(3),
        z.literal(4),
        z.literal(6),
        z.literal(8),
        z.literal(12)
      ]).optional()
    }).optional(),
    // Book-specific metadata
    author: z.union([z.string(), z.array(z.string())]).optional(),
    series: z.string().optional().default('none'),
    seriesNumber: z.number().optional(),
    // Unified shelf date fields (books: started/finished, film: finished only, TV/games: started/finished)
    started: dateSchema.optional(),
    finished: dateSchema.optional(),
    readingProgress: z.number().min(0).max(100).optional(),
    // Unified shelf status (books: reading/read/on-hold, films: watching/watched, TV: watching/watched, games: playing/played/on-hold)
    shelfStatus: z.enum(['reading', 'read', 'on-hold', 'watching', 'watched', 'playing', 'played']).optional(),
    // Unified rating for all shelf types
    rating: z.enum(['like', 'love', 'nope']).optional(),
    // Release year (film, TV, games)
    year: z.number().optional(),
    // Film-specific metadata
    director: z.array(z.string()).optional(),
    // TV-specific metadata
    creator: z.array(z.string()).optional(),
    showTitle: z.string().optional(),
    season: z.number().optional(),
    // Games-specific metadata
    developer: z.string().optional(),
    platform: z.string().optional(),
    // Shared cover image (books, films, TV, games)
    cover: z.string().optional(),
    // POSSE syndication metadata
    syndicationUrls: z.array(z.string()).optional(),
  });

// Inbox collection — relaxed schema for notes arriving from Shortcuts/Obsidian.
// The GitHub Action moves them to the correct category folder after sorting.
const inboxCollection = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/inbox' }),
  schema: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    pubDate: dateSchema.optional(),
    updatedDate: dateSchema.optional(),
    category: z.string().optional(),
    tags: z.array(z.string()).optional(),
    image: z.string().optional(),
  }).passthrough(),
});

// All known content categories — each maps to a folder under src/content/
export const CONTENT_CATEGORIES = [
  'til',
  'blog',
  'micro',
  'photo',
  'nordletter',
  'story',
  'poem',
  'bookshelf',
  'filmshelf',
  'tvshelf',
  'gameshelf',
  'now',
  'colophon',
  'evergreen',
] as const;

export type ContentCategory = typeof CONTENT_CATEGORIES[number];

// Convenience: build a collection for a named category
const postsCollection = (category: string) =>
  defineCollection({ loader: postsLoader(category), schema: postsSchema });

export const collections = {
  // Inbox — staging area for new notes
  'inbox': inboxCollection,

  // Content categories — one collection per folder
  'til':        postsCollection('til'),
  'blog':       postsCollection('blog'),
  'micro':      postsCollection('micro'),
  'photo':      postsCollection('photo'),
  'nordletter': postsCollection('nordletter'),
  'story':      postsCollection('story'),
  'poem':       postsCollection('poem'),
  'bookshelf':  postsCollection('bookshelf'),
  'filmshelf':  postsCollection('filmshelf'),
  'tvshelf':    postsCollection('tvshelf'),
  'gameshelf':  postsCollection('gameshelf'),
  'now':        postsCollection('now'),
  'colophon':   postsCollection('colophon'),
  'evergreen':  postsCollection('evergreen'),
};
