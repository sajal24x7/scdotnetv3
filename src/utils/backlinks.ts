import { getCollection } from 'astro:content';
import { getYearDirectories } from './content';
import type { CollectionEntry } from 'astro:content';

export interface Backlink {
  slug: string;
  title: string;
  description: string;
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
    
    // Get the post content
    const { Content } = await post.render();
    const content = await Content();
    
    // Convert content to string for searching
    const contentString = content.toString();
    
    // Check if this post links to the current post
    // Look for various link patterns that might reference the current post
    const linkPatterns = [
      // Direct slug references
      new RegExp(`\\[([^\\]]+)\\]\\(/${currentPostSlug}/\\)`, 'gi'),
      new RegExp(`\\[([^\\]]+)\\]\\(/${currentPostSlug}\\)`, 'gi'),
      // Title references in markdown links
      new RegExp(`\\[([^\\]]+)\\]\\([^)]*${currentPostSlug}[^)]*\\)`, 'gi'),
      // Plain text references to the title (case insensitive)
      new RegExp(`\\b${currentPostTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi'),
      // References to the slug in plain text
      new RegExp(`\\b${currentPostSlug.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi'),
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
          description: post.data.description || ''
        });
      }
  }
  
  // Sort backlinks by publication date (newest first)
  backlinks.sort((a, b) => {
    // We'll need to get the actual post data to sort by date
    // For now, just return them in the order found
    return 0;
  });
  
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
      // Get the post content
      const { Content } = await post.render();
      const content = await Content();
      
      // Convert content to string for searching
      const contentString = content.toString();
      
      // Check if this post links to the current post
      // Look for various link patterns that might reference the current post
      const linkPatterns = [
        // Direct slug references in markdown links
        new RegExp(`\\[([^\\]]+)\\]\\(/${currentPostSlug}/\\)`, 'gi'),
        new RegExp(`\\[([^\\]]+)\\]\\(/${currentPostSlug}\\)`, 'gi'),
        // Title references in markdown links
        new RegExp(`\\[([^\\]]+)\\]\\([^)]*${currentPostSlug}[^)]*\\)`, 'gi'),
        // Plain text references to the title (case insensitive)
        new RegExp(`\\b${currentPostTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi'),
        // References to the slug in plain text
        new RegExp(`\\b${currentPostSlug.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi'),
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
          description: post.data.description || ''
        });
      }
    } catch (error) {
      // Skip posts that can't be rendered
      console.warn(`Could not render post ${post.slug}:`, error);
      continue;
    }
  }
  
  return backlinks;
}