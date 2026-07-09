import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const tvshelfDir = path.join(__dirname, '..', 'src', 'images', 'tvshelf');
const outputFile = path.join(__dirname, '..', 'src', 'utils', 'tvCovers.ts');

// Ensure the tvshelf directory exists
if (!fs.existsSync(tvshelfDir)) {
  console.log('TVshelf directory does not exist, creating it...');
  fs.mkdirSync(tvshelfDir, { recursive: true });
}

// Scan the tvshelf directory for image files
const imageFiles = fs.readdirSync(tvshelfDir)
  .filter(file => /\.(jpg|jpeg|png|webp)$/i.test(file))
  .sort();

console.log(`Found ${imageFiles.length} image files in ${tvshelfDir}`);

if (imageFiles.length === 0) {
  console.log('No images found. Creating empty tvCovers.ts...');

  const emptyFileContent = `// Auto-generated file - do not edit manually

export const tvCoverImages: Record<string, any> = {};

export function getTVCoverImage(filename: string) {
  return tvCoverImages[filename];
}

export type TVCoverFilename = string;
`;

  fs.writeFileSync(outputFile, emptyFileContent);
  console.log(`Generated empty ${outputFile}`);
  process.exit(0);
}

// Generate import statements
const imports = imageFiles.map(file => {
  const varName = file
    .replace(/[^a-zA-Z0-9]/g, '_')
    .replace(/^(\d+)/, 'img_$1')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
  return `import ${varName} from '../images/tvshelf/${file}';`;
}).join('\n');

const mappings = imageFiles.map(file => {
  const varName = file
    .replace(/[^a-zA-Z0-9]/g, '_')
    .replace(/^(\d+)/, 'img_$1')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
  return `  '${file}': ${varName}`;
}).join(',\n');

const typeDefinitions = `export type TVCoverFilename = ${imageFiles.map(f => `'${f}'`).join(' | ')};`;

const fileContent = `// Auto-generated file - do not edit manually
// Found ${imageFiles.length} image(s): ${imageFiles.join(', ')}

${imports}

export const tvCoverImages: Record<string, any> = {
${mappings}
};

export function getTVCoverImage(filename: string) {
  return tvCoverImages[filename];
}

${typeDefinitions}
`;

fs.writeFileSync(outputFile, fileContent);
console.log(`✅ Generated ${outputFile} with ${imageFiles.length} image(s):`);
imageFiles.forEach(file => console.log(`   - ${file}`));
