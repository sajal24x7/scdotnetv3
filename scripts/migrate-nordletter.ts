import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';

const NORDLETTER_DIR = path.join(process.cwd(), 'src/content/nordletter');
const POSTS_DIR = path.join(process.cwd(), 'src/content/posts');

// Helper to migrate a single file
async function migrateFile(filePath: string, year: string) {
  const content = await fs.readFile(filePath, 'utf-8');
  const { data, content: markdown } = matter(content);
  
  // Create new filename based on the original
  const originalFilename = path.basename(filePath);
  const newFilename = originalFilename.replace(/^nl-?/, ''); // Remove 'nl-' prefix if it exists
  
  // Create year directory if it doesn't exist
  const yearDir = path.join(POSTS_DIR, year);
  await fs.mkdir(yearDir, { recursive: true });
  
  // Create new file path
  const newFilePath = path.join(yearDir, newFilename);
  
  // Write the file to the new location
  await fs.writeFile(newFilePath, content);
  console.log(`Migrated: ${filePath} -> ${newFilePath}`);
}

// Migrate all nordletter content
async function migrateNordletter() {
  const years = await fs.readdir(NORDLETTER_DIR);
  
  for (const year of years) {
    const yearDir = path.join(NORDLETTER_DIR, year);
    const stats = await fs.stat(yearDir);
    
    if (stats.isDirectory()) {
      const files = await fs.readdir(yearDir);
      
      for (const file of files) {
        if (file.endsWith('.md')) {
          const filePath = path.join(yearDir, file);
          await migrateFile(filePath, year);
        }
      }
    }
  }
}

// Run migration
console.log('Starting nordletter migration...');
await migrateNordletter();
console.log('Migration complete!'); 