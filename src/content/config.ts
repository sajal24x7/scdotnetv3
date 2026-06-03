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
      (data as Record<string, unknown>).slug as string | undefined ?? slugFromEntry(entry),
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
    startedReading: dateSchema.optional(),
    finishedReading: dateSchema.optional(),
    bookStatus: z.enum(['reading', 'read', 'finished', 'on-hold', 'to-read']).optional(),
    readingProgress: z.number().min(0).max(100).optional(),
    bookRating: z.enum(['like', 'love', 'nope']).optional(),
    // Release year (film, TV, games)
    year: z.number().optional(),
    // Film-specific metadata
    director: z.array(z.string()).optional(),
    watchedDate: dateSchema.optional(),
    filmStatus: z.enum(['watching', 'watched', 'to-watch']).optional(),
    filmRating: z.enum(['like', 'love', 'nope']).optional(),
    // TV-specific metadata
    creator: z.array(z.string()).optional(),
    showTitle: z.string().optional(),
    season: z.number().optional(),
    tvStatus: z.enum(['watching', 'watched', 'to-watch', 'on-hold', 'abandoned']).optional(),
    tvRating: z.enum(['like', 'love', 'nope']).optional(),
    // Games-specific metadata
    developer: z.string().optional(),
    platform: z.string().optional(),
    gameStatus: z.enum(['playing', 'played', 'to-play', 'on-hold', 'abandoned']).optional(),
    gameRating: z.enum(['like', 'love', 'nope']).optional(),
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
