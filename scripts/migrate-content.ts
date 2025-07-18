import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';

const CONTENT_DIR = path.join(process.cwd(), 'src/content');
const POSTS_DIR = path.join(CONTENT_DIR, 'posts');

// Ensure posts directory exists
await fs.mkdir(POSTS_DIR, { recursive: true });

// Helper to determine category based on content type and tags
function determineCategory(type: string, tags?: string[]): 'evergreen' | 'ephemera' {
  if (type === 'note') {
    // If it's a note and has #fleeting tag, it's ephemera
    if (tags?.includes('#fleeting')) {
      return 'ephemera';
    }
    return 'evergreen';
  }
  // All other types are ephemera
  return 'ephemera';
}

// Helper to clean up tags
function cleanTags(tags?: string[]): string[] {
  if (!tags) return [];
  return tags.map(tag => tag.replace('#', ''));
}

// Helper to get year from file path
function getYearFromPath(filePath: string): string {
  const yearMatch = filePath.match(/\/(\d{4})\//);
  return yearMatch ? yearMatch[1] : new Date().getFullYear().toString();
}

// Helper to migrate a single file
async function migrateFile(filePath: string, type: string) {
  const content = await fs.readFile(filePath, 'utf-8');
  const { data, content: markdown } = matter(content);
  
  // Transform frontmatter
  const newData: Record<string, any> = {
    title: data.title || '',
    type,
    category: determineCategory(type, data.tags),
  };

  // Add optional fields only if they exist
  if (data.description) newData.description = data.description;
  if (data.pubDate) newData.pubDate = data.pubDate;
  if (data.updatedDate) newData.updatedDate = data.updatedDate;
  if (data.tags) newData.tags = cleanTags(data.tags);
  if (data.image) newData.image = data.image;
  if (data.stage) newData.stage = data.stage;
  if (data.link) newData.link = data.link;

  // Create new frontmatter
  const newContent = matter.stringify(markdown, newData);
  
  // Get year from path and create new filename
  const year = getYearFromPath(filePath);
  const fileName = path.basename(filePath);
  const newPath = path.join(POSTS_DIR, year, fileName);
  
  // Ensure year directory exists
  await fs.mkdir(path.dirname(newPath), { recursive: true });
  
  // Write new file
  await fs.writeFile(newPath, newContent);
}

// Migrate all content
async function migrateContent() {
  // Migrate notes
  const notesDir = path.join(CONTENT_DIR, 'notes');
  const notes = await fs.readdir(notesDir, { recursive: true });
  for (const note of notes) {
    if (note.endsWith('.md')) {
      await migrateFile(path.join(notesDir, note), 'note');
    }
  }

  // Migrate stories
  const storiesDir = path.join(CONTENT_DIR, 'stories');
  const stories = await fs.readdir(storiesDir, { recursive: true });
  for (const story of stories) {
    if (story.endsWith('.md')) {
      await migrateFile(path.join(storiesDir, story), 'story');
    }
  }

  // Migrate poems
  const poemsDir = path.join(CONTENT_DIR, 'poems');
  const poems = await fs.readdir(poemsDir, { recursive: true });
  for (const poem of poems) {
    if (poem.endsWith('.md')) {
      await migrateFile(path.join(poemsDir, poem), 'poem');
    }
  }
}

// Run migration
console.log('Starting content migration...');
await migrateContent();
console.log('Content migration complete!'); 