import { getCollection } from 'astro:content';
import { readdirSync } from 'fs';
import { join } from 'path';

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
    syndicationUrls?: string[];
    author?: string;
    bookStatus?: string;
    bookCover?: string;
    startedReading?: Date | string;
    finishedReading?: Date | string;
  };
  slug: string;
  body: string;
  render: () => Promise<{ Content: any }>;
}

// Get all year directories from src/content
export function getYearDirectories(): string[] {
  const contentDir = join(process.cwd(), 'src', 'content');
  return readdirSync(contentDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory() && /^\d{4}$/.test(dirent.name))
    .map(dirent => dirent.name)
    .sort();
}

let cachedPosts: Post[] | null = null;
let cachedPostsPromise: Promise<Post[]> | null = null;

// Get all posts from year collections
export async function getAllPosts(): Promise<Post[]> {
  if (cachedPosts) {
    return cachedPosts;
  }

  if (!cachedPostsPromise) {
    cachedPostsPromise = (async () => {
      const years = getYearDirectories();
      const allPosts = await Promise.all(years.map(async year => {
        const posts = await getCollection(year as any);
        return posts.map((post: any) => ({
          data: post.data,
          slug: post.slug,
          body: post.body,
          render: post.render
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
      link: `/${post.data.category}/${post.slug}/`
    },
    body: post.body,
    render: post.render
  };
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