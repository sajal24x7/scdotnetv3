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

// Parse commit timestamp and format as YYYY-MM-DDTHH:MM:SS in Helsinki time
const date = new Date(timestamp);
const parts = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Europe/Helsinki',
  year: 'numeric', month: '2-digit', day: '2-digit',
  hour: '2-digit', minute: '2-digit', second: '2-digit',
  hour12: false,
}).formatToParts(date);
const get = (type) => parts.find(p => p.type === type).value;
const formattedDate = `${get('year')}-${get('month')}-${get('day')}T${get('hour')}:${get('minute')}:${get('second')}`;

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
