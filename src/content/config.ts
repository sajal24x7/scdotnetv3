import { defineCollection, z } from 'astro:content';
import { readdirSync } from 'fs';
import { join } from 'path';

// Define a custom date schema that accepts both Date objects and ISO date strings
const dateSchema = z.union([
  z.date(),
  z.string().transform((str) => new Date(str))
]);

// Define the unified post schema
const postsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    pubDate: dateSchema,
    updatedDate: dateSchema.optional(),
    category: z.enum(['evergreen', 'blog', 'micro', 'photo', 'nordletter', 'story', 'poem', 'bookshelf', 'film', 'tv', 'now', 'til', 'colophon']),
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
    startedReading: dateSchema.optional(),
    finishedReading: dateSchema.optional(),
    bookStatus: z.enum(['reading', 'read', 'finished', 'on-hold', 'to-read']).optional(),
    readingProgress: z.number().min(0).max(100).optional(),
    bookRating: z.enum(['like', 'love', 'nope']).optional(),
    bookCover: z.string().optional(), // Book cover image for bookshelf display
    // Film/TV-specific metadata
    firstWatched: dateSchema.optional(),
    rewatchedOn: dateSchema.optional(),
    rating: z.enum(['like', 'love', 'nope']).optional(),
    poster: z.string().optional(), // Poster image for filmshelf display
    releaseDate: dateSchema.optional(),
    season: z.number().optional(), // Season number for TV shows
    seriesSlug: z.string().optional(), // Links multiple seasons of a TV show together
    // POSSE syndication metadata
    syndicationUrls: z.array(z.string()).optional(), // URLs where content was syndicated
  }),
});

// Export collections
const nordletterCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    pubDate: dateSchema,
    description: z.string().optional(),
    edition: z.number().optional(),
  }),
});

// Define the notes collection
const notesCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    pubDate: dateSchema,
    updatedDate: dateSchema.optional(),
    category: z.enum(['evergreen', 'blog', 'micro', 'photo', 'nordletter', 'story', 'poem', 'bookshelf', 'film', 'tv', 'til', 'colophon']).optional(),
    tags: z.array(z.string()).optional(),
    image: z.string().optional(),
    stage: z.enum(['fleeting', 'seedling', 'budding', 'evergreen']).optional(),
  }),
});

// Get all year directories from src/content
const contentDir = join(process.cwd(), 'src', 'content');
const yearDirs = readdirSync(contentDir, { withFileTypes: true })
  .filter(dirent => dirent.isDirectory() && /^\d{4}$/.test(dirent.name))
  .map(dirent => dirent.name);

// Create year collections dynamically
const yearCollections = Object.fromEntries(
  yearDirs.map(year => [year, postsCollection])
);

export const collections = {
  'posts': postsCollection,
  'nordletter': nordletterCollection,
  'notes': notesCollection,
  ...yearCollections,
}; 
