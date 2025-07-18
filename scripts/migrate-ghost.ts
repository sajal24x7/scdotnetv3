import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';

const CONTENT_DIR = path.join(process.cwd(), 'src/content');
const GHOST_EXPORT = path.join(process.cwd(), 'ghost/content/data/sajal-choudhary.ghost.2024-01-28-11-05-58.json');

// Helper to determine category based on content type and tags
function determineCategory(type: string, tags?: string[]): 'evergreen' | 'blog' | 'micro' | 'photo' {
  if (type === 'note') {
    return 'evergreen';
  }
  if (type === 'photo') {
    return 'photo';
  }
  if (type === 'micro') {
    return 'micro';
  }
  return 'blog';
}

// Helper to clean up tags
function cleanTags(tags?: string[]): string[] {
  if (!tags) return [];
  return tags.map(tag => tag.replace('#', ''));
}

// Helper to get year from date
function getYearFromDate(date: string): string {
  return new Date(date).getFullYear().toString();
}

// Helper to migrate a single post
async function migratePost(post: any) {
  const { title, slug, html, published_at, updated_at, tags } = post;
  
  // Transform frontmatter
  const newData: Record<string, any> = {
    title,
    category: determineCategory(post.type || 'blog', tags),
    pubDate: published_at,
    updatedDate: updated_at,
    tags: cleanTags(tags),
  };

  // Create new frontmatter
  const newContent = matter.stringify(html, newData);
  
  // Get year from date and create new filename
  const year = getYearFromDate(published_at);
  const fileName = `${slug}.md`;
  const newPath = path.join(CONTENT_DIR, year, fileName);
  
  // Ensure year directory exists
  await fs.mkdir(path.dirname(newPath), { recursive: true });
  
  // Write new file
  await fs.writeFile(newPath, newContent);
}

// Migrate all content
async function migrateGhostContent() {
  try {
    // Read Ghost export
    const ghostData = JSON.parse(await fs.readFile(GHOST_EXPORT, 'utf-8'));
    
    // Migrate each post
    for (const post of ghostData.db[0].data.posts) {
      await migratePost(post);
    }
    
    console.log('Ghost content migration complete!');
  } catch (error) {
    console.error('Error migrating Ghost content:', error);
  }
}

// Run migration
console.log('Starting Ghost content migration...');
await migrateGhostContent(); 