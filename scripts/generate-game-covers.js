import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const gameshelfDir = path.join(__dirname, '..', 'src', 'images', 'gameshelf');
const outputFile = path.join(__dirname, '..', 'src', 'utils', 'gameCovers.ts');

// Ensure the gameshelf directory exists
if (!fs.existsSync(gameshelfDir)) {
  console.log('Gameshelf directory does not exist, creating it...');
  fs.mkdirSync(gameshelfDir, { recursive: true });
}

// Scan the gameshelf directory for image files
const imageFiles = fs.readdirSync(gameshelfDir)
  .filter(file => /\.(jpg|jpeg|png|webp)$/i.test(file))
  .sort();

console.log(`Found ${imageFiles.length} image files in ${gameshelfDir}`);

if (imageFiles.length === 0) {
  console.log('No images found. Creating empty gameCovers.ts...');

  const emptyFileContent = `// Auto-generated file - do not edit manually
// Generated on: ${new Date().toISOString()}

export const gameCoverImages: Record<string, any> = {};

export function getGameCoverImage(filename: string) {
  return gameCoverImages[filename];
}

export type GameCoverFilename = string;
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
  return `import ${varName} from '../images/gameshelf/${file}';`;
}).join('\n');

const mappings = imageFiles.map(file => {
  const varName = file
    .replace(/[^a-zA-Z0-9]/g, '_')
    .replace(/^(\d+)/, 'img_$1')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
  return `  '${file}': ${varName}`;
}).join(',\n');

const typeDefinitions = `export type GameCoverFilename = ${imageFiles.map(f => `'${f}'`).join(' | ')};`;

const fileContent = `// Auto-generated file - do not edit manually
// Generated on: ${new Date().toISOString()}
// Found ${imageFiles.length} image(s): ${imageFiles.join(', ')}

${imports}

export const gameCoverImages: Record<string, any> = {
${mappings}
};

export function getGameCoverImage(filename: string) {
  return gameCoverImages[filename];
}

${typeDefinitions}
`;

fs.writeFileSync(outputFile, fileContent);
console.log(`✅ Generated ${outputFile} with ${imageFiles.length} image(s):`);
imageFiles.forEach(file => console.log(`   - ${file}`));
