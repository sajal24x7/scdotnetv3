import { getCollection } from 'astro:content';
import { getYearDirectories } from './content';
import type { CollectionEntry } from 'astro:content';

export interface Backlink {
  slug: string;
  title: string;
  description: string;
  category: string;
  pubDate: Date;
}

/**
 * Find all posts that link to the current post
 * @param currentPostSlug The slug of the current post
 * @param currentPostTitle The title of the current post
 * @returns Array of backlink objects
 */
export async function findBacklinks(currentPostSlug: string, currentPostTitle: string): Promise<Backlink[]> {
  const years = getYearDirectories();
  const allPosts: CollectionEntry<any>[] = [];
  
  // Get all posts from all year collections
  for (const year of years) {
    const posts = await getCollection(year as any);
    allPosts.push(...posts);
  }
  
  const backlinks: Backlink[] = [];
  
  for (const post of allPosts) {
    // Skip the current post itself
    if (post.slug === currentPostSlug) continue;
    
    try {
      // Get the raw content without rendering
      const contentString = post.body;
      
      // Check if this post links to the current post
      // Look for various link patterns that might reference the current post
      const escapedSlug = currentPostSlug.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const linkPatterns = [
        // Direct slug references
        new RegExp(`\\[([^\\]]+)\\]\\(/${escapedSlug}/\\)`, 'gi'),
        new RegExp(`\\[([^\\]]+)\\]\\(/${escapedSlug}\\)`, 'gi'),
        // Title references in markdown links
        new RegExp(`\\[([^\\]]+)\\]\\([^)]*${escapedSlug}[^)]*\\)`, 'gi'),
        // Plain text references to the title (case insensitive)
        new RegExp(`\\b${currentPostTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi'),
        // References to the slug in plain text
        new RegExp(`\\b${escapedSlug}\\b`, 'gi'),
      ];
      
      let hasReference = false;
      for (const pattern of linkPatterns) {
        if (pattern.test(contentString)) {
          hasReference = true;
          break;
        }
      }
      
      if (hasReference) {
        backlinks.push({
          slug: `/${post.data.category}/${post.slug}/`,
          title: post.data.title || 'Untitled',
          description: post.data.description || '',
          category: post.data.category,
          pubDate: post.data.pubDate
        });
      }
    } catch (error) {
      // Skip posts that can't be processed
      console.warn(`Could not process post ${post.slug}:`, error);
      continue;
    }
  }
  
  return backlinks;
}

/**
 * Find backlinks for a post by searching for references in other posts
 * This is a more comprehensive search that looks for various types of references
 */
export async function findBacklinksComprehensive(currentPostSlug: string, currentPostTitle: string): Promise<Backlink[]> {
  const years = getYearDirectories();
  const allPosts: CollectionEntry<any>[] = [];
  
  // Get all posts from all year collections
  for (const year of years) {
    const posts = await getCollection(year as any);
    allPosts.push(...posts);
  }
  
  const backlinks: Backlink[] = [];
  
  for (const post of allPosts) {
    // Skip the current post itself
    if (post.slug === currentPostSlug) continue;
    
    try {
      // Get the raw content without rendering
      const contentString = post.body;
      
      // Check if this post links to the current post
      // Look for various link patterns that might reference the current post
      const escapedSlug = currentPostSlug.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const linkPatterns = [
        // Direct slug references in markdown links
        new RegExp(`\\[([^\\]]+)\\]\\(/${escapedSlug}/\\)`, 'gi'),
        new RegExp(`\\[([^\\]]+)\\]\\(/${escapedSlug}\\)`, 'gi'),
        // Title references in markdown links
        new RegExp(`\\[([^\\]]+)\\]\\([^)]*${escapedSlug}[^)]*\\)`, 'gi'),
        // Plain text references to the title (case insensitive)
        new RegExp(`\\b${currentPostTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi'),
        // References to the slug in plain text
        new RegExp(`\\b${escapedSlug}\\b`, 'gi'),
      ];
      
      let hasReference = false;
      for (const pattern of linkPatterns) {
        if (pattern.test(contentString)) {
          hasReference = true;
          break;
        }
      }
      
      if (hasReference) {
        backlinks.push({
          slug: `/${post.data.category}/${post.slug}/`,
          title: post.data.title || 'Untitled',
          description: post.data.description || '',
          category: post.data.category,
          pubDate: post.data.pubDate
        });
      }
    } catch (error) {
      // Skip posts that can't be processed
      console.warn(`Could not process post ${post.slug}:`, error);
      continue;
    }
  }
  
  return backlinks;
}