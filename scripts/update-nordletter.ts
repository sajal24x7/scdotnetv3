import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';

const NORDLETTER_DIR = path.join(process.cwd(), 'src/content/nordletter');

// Helper to update a single file
async function updateFile(filePath: string) {
  const content = await fs.readFile(filePath, 'utf-8');
  const { data, content: markdown } = matter(content);
  
  // Add category to frontmatter
  const newData = {
    ...data,
    category: '#nordletter'
  };

  // Create new frontmatter
  const newContent = matter.stringify(markdown, newData);
  
  // Write updated file
  await fs.writeFile(filePath, newContent);
}

// Update all nordletter content
async function updateNordletter() {
  const files = await fs.readdir(NORDLETTER_DIR, { recursive: true });
  
  for (const file of files) {
    if (file.endsWith('.md')) {
      const filePath = path.join(NORDLETTER_DIR, file);
      await updateFile(filePath);
      console.log(`Updated: ${file}`);
    }
  }
}

// Run update
console.log('Starting nordletter frontmatter update...');
await updateNordletter();
console.log('Update complete!'); 