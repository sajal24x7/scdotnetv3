import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Valid categories from config.ts
const validCategories = ['evergreen', 'blog', 'micro', 'photo', 'nordletter', 'story', 'poem', 'bookshelf', 'now', 'til'];

// Function to extract frontmatter from markdown file
function extractFrontmatter(content) {
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!frontmatterMatch) return null;
  
  const frontmatter = frontmatterMatch[1];
  const lines = frontmatter.split('\n');
  const metadata = {};
  
  for (const line of lines) {
    const colonIndex = line.indexOf(':');
    if (colonIndex !== -1) {
      const key = line.substring(0, colonIndex).trim();
      let value = line.substring(colonIndex + 1).trim();
      
      // Handle quoted strings
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      }
      
      metadata[key] = value;
    }
  }
  
  return metadata;
}

// Function to check a single file
function checkFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const frontmatter = extractFrontmatter(content);
    
    if (!frontmatter) {
      return { file: path.basename(filePath), error: 'No frontmatter found' };
    }
    
    const category = frontmatter.category;
    
    if (!category) {
      return { file: path.basename(filePath), error: 'No category field found' };
    }
    
    if (!validCategories.includes(category)) {
      return { 
        file: path.basename(filePath), 
        error: `Invalid category: "${category}". Valid categories are: ${validCategories.join(', ')}` 
      };
    }
    
    return { file: path.basename(filePath), category, status: 'valid' };
  } catch (error) {
    return { file: path.basename(filePath), error: `File read error: ${error.message}` };
  }
}

// Main function
function checkAll2025Posts() {
  const contentDir = path.join(__dirname, 'src', 'content', '2025');
  
  if (!fs.existsSync(contentDir)) {
    console.error('2025 directory not found');
    return;
  }
  
  const files = fs.readdirSync(contentDir).filter(file => file.endsWith('.md'));
  const results = [];
  
  console.log(`Checking ${files.length} files in 2025 directory...\n`);
  
  for (const file of files) {
    const filePath = path.join(contentDir, file);
    const result = checkFile(filePath);
    results.push(result);
  }
  
  // Group results
  const valid = results.filter(r => r.status === 'valid');
  const invalid = results.filter(r => r.error);
  
  console.log(`✅ Valid files: ${valid.length}`);
  console.log(`❌ Files with issues: ${invalid.length}\n`);
  
  if (invalid.length > 0) {
    console.log('Issues found:');
    console.log('=============');
    invalid.forEach(result => {
      console.log(`${result.file}: ${result.error}`);
    });
  }
  
  // Show category distribution
  const categoryCounts = {};
  valid.forEach(result => {
    categoryCounts[result.category] = (categoryCounts[result.category] || 0) + 1;
  });
  
  console.log('\nCategory distribution:');
  console.log('=====================');
  Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]).forEach(([category, count]) => {
    console.log(`${category}: ${count}`);
  });
}

checkAll2025Posts(); 