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
    category: z.enum(['evergreen', 'blog', 'micro', 'photo', 'nordletter', 'story', 'poem', 'bookshelf', 'now', 'til']),
    status: z.enum(['active', 'done']).optional().default('active'),
    tags: z.array(z.string()).optional(),
    image: z.string().optional(),
    edition: z.number().optional(),
    format: z.string().optional(),
    // Book-specific metadata
    author: z.string().optional(),
    series: z.string().optional().default('none'),
    startedReading: dateSchema.optional(),
    finishedReading: dateSchema.optional(),
    bookStatus: z.enum(['reading', 'read']).optional(),
    bookCover: z.string().optional(), // Book cover image for bookshelf display
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
    category: z.enum(['evergreen', 'blog', 'micro', 'photo', 'nordletter', 'story', 'poem', 'bookshelf', 'til']).optional(),
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