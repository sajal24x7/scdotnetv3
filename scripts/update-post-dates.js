import fs from 'fs/promises';
import path from 'path';

const timestamp = process.env.COMMIT_TIMESTAMP;
if (!timestamp) {
  console.error('Error: COMMIT_TIMESTAMP environment variable is required');
  process.exit(1);
}

const filesPath = process.env.MODIFIED_FILES_PATH;
if (!filesPath) {
  console.error('Error: MODIFIED_FILES_PATH environment variable is required');
  process.exit(1);
}

// Parse commit timestamp and format as YYYY-MM-DDTHH:MM:SS (UTC, no Z — matches existing post format)
const date = new Date(timestamp);
const formattedDate = date.toISOString().slice(0, 19);

console.log(`Updating updatedDate to: ${formattedDate}`);

const filesContent = await fs.readFile(filesPath, 'utf-8');
const files = filesContent.split('\n').filter(f => f.trim());

if (files.length === 0) {
  console.log('No files to process');
  process.exit(0);
}

for (const file of files) {
  const filePath = path.resolve(file);

  let content;
  try {
    content = await fs.readFile(filePath, 'utf-8');
  } catch (err) {
    console.warn(`Warning: Could not read ${file}: ${err.message}`);
    continue;
  }

  // Only process markdown files that have YAML frontmatter
  if (!content.startsWith('---')) {
    console.log(`Skipping ${file}: no frontmatter found`);
    continue;
  }

  let updated;
  if (/^updatedDate:/m.test(content)) {
    // Replace the existing updatedDate line (handles quoted and unquoted values)
    updated = content.replace(/^updatedDate:.*$/m, `updatedDate: ${formattedDate}`);
  } else if (/^pubDate:/m.test(content)) {
    // No updatedDate yet — insert one directly after pubDate
    updated = content.replace(/^(pubDate:.*)$/m, `$1\nupdatedDate: ${formattedDate}`);
  } else {
    console.log(`Skipping ${file}: no pubDate to insert after`);
    continue;
  }

  await fs.writeFile(filePath, updated);
  console.log(`Updated: ${file}`);
}
