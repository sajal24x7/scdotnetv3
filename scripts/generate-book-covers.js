import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const bookshelfDir = path.join(__dirname, '..', 'src', 'images', 'bookshelf');
const outputFile = path.join(__dirname, '..', 'src', 'utils', 'bookCovers.ts');

// Ensure the bookshelf directory exists
if (!fs.existsSync(bookshelfDir)) {
  console.log('Bookshelf directory does not exist, creating it...');
  fs.mkdirSync(bookshelfDir, { recursive: true });
}

// Scan the bookshelf directory for image files, normalizing any uppercase
// extensions (e.g. .JPG) on disk so TypeScript's case-sensitive module
// resolution doesn't choke on the generated imports.
const imageFiles = fs.readdirSync(bookshelfDir)
  .filter(file => /\.(jpg|jpeg|png|webp)$/i.test(file))
  .map(file => {
    const ext = path.extname(file);
    const lowerExt = ext.toLowerCase();
    if (ext === lowerExt) return file;

    const normalized = file.slice(0, -ext.length) + lowerExt;
    console.log(`Normalizing extension: ${file} -> ${normalized}`);
    fs.renameSync(path.join(bookshelfDir, file), path.join(bookshelfDir, normalized));
    return normalized;
  })
  .sort();

console.log(`Found ${imageFiles.length} image files in ${bookshelfDir}`);

if (imageFiles.length === 0) {
  console.log('No images found. Creating empty bookCovers.ts...');
  
  const emptyFileContent = `// Auto-generated file - do not edit manually

export const bookCoverImages: Record<string, any> = {};

export function getBookCoverImage(filename: string) {
  return bookCoverImages[filename];
}
`;

  fs.writeFileSync(outputFile, emptyFileContent);
  console.log(`Generated empty ${outputFile}`);
  process.exit(0);
}

// Generate import statements
const imports = imageFiles.map(file => {
  // Convert filename to valid variable name
  const varName = file
    .replace(/[^a-zA-Z0-9]/g, '_')
    .replace(/^(\d+)/, 'img_$1')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
  
  return `import ${varName} from '../images/bookshelf/${file}';`;
}).join('\n');

// Generate the mapping object
const mappings = imageFiles.map(file => {
  const varName = file
    .replace(/[^a-zA-Z0-9]/g, '_')
    .replace(/^(\d+)/, 'img_$1')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
  
  return `  '${file}': ${varName}`;
}).join(',\n');

// Generate TypeScript types for better intellisense
const typeDefinitions = `export type BookCoverFilename = ${imageFiles.map(f => `'${f}'`).join(' | ')};`;

// Generate the complete file
const fileContent = `// Auto-generated file - do not edit manually
// Found ${imageFiles.length} image(s): ${imageFiles.join(', ')}

${imports}

export const bookCoverImages: Record<string, any> = {
${mappings}
};

export function getBookCoverImage(filename: string) {
  return bookCoverImages[filename];
}

${typeDefinitions}
`;

// Write the file
fs.writeFileSync(outputFile, fileContent);
console.log(`✅ Generated ${outputFile} with ${imageFiles.length} image(s):`);
imageFiles.forEach(file => console.log(`   - ${file}`));