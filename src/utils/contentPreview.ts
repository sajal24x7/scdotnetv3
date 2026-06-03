import { getCollection } from 'astro:content';
import { getContentCategories } from './content';

export interface ContentPreview {
  title: string;
  description: string;
  category: string;
  slug: string;
}

// Generate content previews for all posts
export async function generateContentPreviews(): Promise<Map<string, ContentPreview>> {
  const previewMap = new Map<string, ContentPreview>();
  
  try {
    // Get all category collections
    const categories = getContentCategories();
    const allPosts = await Promise.all(categories.map(category => getCollection(category as any)));
    const posts = allPosts.flat();

    for (const post of posts) {
      const postData = post as any;
      if (!postData.data || !postData.data.title) continue;

      const category = postData.data.category || 'notes';
      const slug = postData.id;
      const path = `/${category}/${slug}/`;
      
      // Get description from frontmatter, or use empty string
      const description = postData.data.description || '';

      previewMap.set(path, {
        title: postData.data.title,
        description: description,
        category,
        slug
      });
    }
  } catch (error) {
    console.error('Error generating content previews:', error);
  }
  
  return previewMap;
}

// Get preview for a specific path
export async function getPreviewForPath(path: string): Promise<ContentPreview | null> {
  const previews = await generateContentPreviews();
  return previews.get(path) || null;
}

// Helper function to escape HTML attributes
export function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
} 