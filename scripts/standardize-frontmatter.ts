import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';

const CONTENT_DIR = path.join(process.cwd(), 'src/content');

// Helper to standardize a single file's frontmatter
async function standardizeFile(filePath: string) {
  const content = await fs.readFile(filePath, 'utf-8');
  const { data, content: markdown } = matter(content);
  
  // If updatedDate is missing, use pubDate
  const pubDate = data.pubDate || '';
  const updatedDate = data.updatedDate || pubDate;

  // Create standardized frontmatter
  const newData = {
    title: data.title || '',
    category: data.category || '',
    description: data.description || '',
    tags: data.tags || [],
    pubDate,
    updatedDate,
    image: data.image || ''
  };

  // Create new frontmatter
  const newContent = matter.stringify(markdown, newData);
  
  // Write updated file
  await fs.writeFile(filePath, newContent);
  console.log(`Standardized: ${filePath}`);
}

// Standardize all posts
async function standardizePosts() {
  const years = await fs.readdir(CONTENT_DIR);
  
  for (const year of years) {
    const yearDir = path.join(CONTENT_DIR, year);
    const stats = await fs.stat(yearDir);
    
    if (stats.isDirectory() && /^\d{4}$/.test(year)) { // Only process year directories
      const files = await fs.readdir(yearDir);
      
      for (const file of files) {
        if (file.endsWith('.md')) {
          const filePath = path.join(yearDir, file);
          await standardizeFile(filePath);
        }
      }
    }
  }
}

// Run standardization
console.log('Starting frontmatter standardization...');
await standardizePosts();
console.log('Standardization complete!'); 