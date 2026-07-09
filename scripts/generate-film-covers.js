import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filmshelfDir = path.join(__dirname, '..', 'src', 'images', 'filmshelf');
const outputFile = path.join(__dirname, '..', 'src', 'utils', 'filmCovers.ts');

// Ensure the filmshelf directory exists
if (!fs.existsSync(filmshelfDir)) {
  console.log('Filmshelf directory does not exist, creating it...');
  fs.mkdirSync(filmshelfDir, { recursive: true });
}

// Scan the filmshelf directory for image files
const imageFiles = fs.readdirSync(filmshelfDir)
  .filter(file => /\.(jpg|jpeg|png|webp)$/i.test(file))
  .sort();

console.log(`Found ${imageFiles.length} image files in ${filmshelfDir}`);

if (imageFiles.length === 0) {
  console.log('No images found. Creating empty filmCovers.ts...');

  const emptyFileContent = `// Auto-generated file - do not edit manually

export const filmCoverImages: Record<string, any> = {};

export function getFilmCoverImage(filename: string) {
  return filmCoverImages[filename];
}

export type FilmCoverFilename = string;
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
  return `import ${varName} from '../images/filmshelf/${file}';`;
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

const typeDefinitions = `export type FilmCoverFilename = ${imageFiles.map(f => `'${f}'`).join(' | ')};`;

const fileContent = `// Auto-generated file - do not edit manually
// Found ${imageFiles.length} image(s): ${imageFiles.join(', ')}

${imports}

export const filmCoverImages: Record<string, any> = {
${mappings}
};

export function getFilmCoverImage(filename: string) {
  return filmCoverImages[filename];
}

${typeDefinitions}
`;

fs.writeFileSync(outputFile, fileContent);
console.log(`✅ Generated ${outputFile} with ${imageFiles.length} image(s):`);
imageFiles.forEach(file => console.log(`   - ${file}`));
