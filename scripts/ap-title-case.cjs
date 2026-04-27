#!/usr/bin/env node
'use strict';

/**
 * AP Style Title Case updater for all content in src/content/
 *
 * AP Title Case rules:
 *  - Always capitalize first and last word
 *  - Capitalize all principal words (nouns, verbs, adjectives, adverbs, pronouns)
 *  - Do NOT capitalize: articles (a, an, the), coordinating conjunctions (and, but,
 *    nor, or, so, yet), short prepositions of ≤3 letters (as, at, by, for, in, of,
 *    on, to, up, via) — unless they are the first or last word
 *  - Capitalize first word after a colon or em/en dash
 *  - For hyphenated words, capitalize each part
 *
 * Usage:
 *   node scripts/ap-title-case.cjs [--dry-run]
 *
 *   --dry-run   Preview changes without writing any files
 */

const fs = require('fs');
const path = require('path');

const CONTENT_DIR = path.join(__dirname, '../src/content');

// Words that stay lowercase in AP title case (unless first/last/after colon)
const LOWER_WORDS = new Set([
  // Articles
  'a', 'an', 'the',
  // Coordinating conjunctions
  'and', 'but', 'nor', 'or', 'so', 'yet',
  // Short prepositions (3 letters or fewer)
  'as', 'at', 'by', 'for', 'in', 'of', 'off', 'on', 'out', 'per', 'to', 'up', 'via', 'vs',
]);

/**
 * Capitalize the first letter of a word, preserving special cases.
 * - All-caps words (acronyms: USA, AI, NL102) are kept as-is.
 * - Mixed-case words (iPhone, macOS) are kept as-is.
 * - Otherwise: first letter uppercased, rest lowercased.
 */
function capitalizeWord(word) {
  if (!word) return word;

  // All-caps or all-caps+numbers (acronyms like USA, AI, NL57, VB)
  if (word.length > 1 && /[A-Z]/.test(word) && word === word.toUpperCase()) {
    return word;
  }

  // Mixed internal caps (iPhone, macOS, JavaScript, eBay)
  if (/[A-Z]/.test(word.slice(1))) {
    return word;
  }

  // Standard: capitalize first, lowercase rest
  return word[0].toUpperCase() + word.slice(1).toLowerCase();
}

/**
 * Apply AP title case to a title string.
 */
function apTitleCase(title) {
  if (!title || typeof title !== 'string') return title;

  const words = title.split(' ');
  const lastIdx = words.length - 1;

  return words.map((word, idx) => {
    if (!word) return word;

    // Separate any leading punctuation (opening quotes, parens, #)
    const leadMatch = word.match(/^([^a-zA-Z0-9]*)(.+)$/);
    if (!leadMatch) return word;
    const lead = leadMatch[1];
    const body = leadMatch[2];

    // Clean word text for lookup (strip trailing punctuation)
    const clean = body.replace(/[^a-zA-Z]/g, '').toLowerCase();

    const isFirst = idx === 0;
    const isLast = idx === lastIdx;

    // After colon or em/en dash: force capitalization of the next word.
    // Scan backwards; stop as soon as we find a break indicator OR a letter-word
    // without a break indicator (meaning no break in the chain).
    let isAfterBreak = false;
    for (let j = idx - 1; j >= 0; j--) {
      const w = words[j];
      // Any token ending with : — – counts as a break (including "2001:", "Life:")
      if (/[:—–]$/.test(w) || w === '-' || w === '—' || w === '–' || w === ':') {
        isAfterBreak = true;
        break;
      }
      if (/[a-zA-Z]/.test(w)) {
        // Letter-word without break — stop scanning
        break;
      }
      // No letters and no break (e.g. "1.") — keep scanning backwards
    }

    const shouldLower = !isFirst && !isLast && !isAfterBreak && LOWER_WORDS.has(clean);

    if (shouldLower) {
      return lead + body.toLowerCase();
    }

    // Handle hyphenated compound words — capitalize each part (AP style)
    if (body.includes('-')) {
      const parts = body.split('-');
      return lead + parts.map(part => (part ? capitalizeWord(part) : part)).join('-');
    }

    return lead + capitalizeWord(body);
  }).join(' ');
}

/**
 * Extract the raw title value from a frontmatter block (the text between --- delimiters).
 * Returns { raw, value, quoted } where:
 *   raw    = the full matched line (e.g. 'title: "Some Title"')
 *   value  = the title text without quotes
 *   quoted = the quote character used ('"', "'", or '')
 */
function extractTitle(frontmatter) {
  // Double-quoted
  let m = frontmatter.match(/^(title:\s*)"([^"]*)"[ \t]*$/m);
  if (m) return { prefix: m[1], value: m[2], quoted: '"' };

  // Single-quoted
  m = frontmatter.match(/^(title:\s*)'([^']*)'[ \t]*$/m);
  if (m) return { prefix: m[1], value: m[2], quoted: "'" };

  // Unquoted
  m = frontmatter.match(/^(title:\s*)([^\n'"#][^\n]*)[ \t]*$/m);
  if (m) return { prefix: m[1], value: m[2].trim(), quoted: '' };

  return null;
}

/**
 * Replace the title line in the raw file content.
 * Returns the updated content string, or null if nothing changed.
 */
function replaceTitleInContent(rawContent, originalValue, newValue, quoted) {
  // Determine correct quoting for updated value
  // If new title contains colon, hash, or starts with special chars, it needs quotes
  const needsQuote = !quoted && /[:#{}\[\],&*?|<>=!%@`]/.test(newValue);
  const q = needsQuote ? '"' : quoted;

  // Escape the original title for safe use in a regex
  const escaped = originalValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  // Only replace within the frontmatter (first --- block)
  const fmEnd = rawContent.indexOf('\n---', 3);
  if (fmEnd === -1) return null;

  const frontmatter = rawContent.substring(0, fmEnd);
  const rest = rawContent.substring(fmEnd);

  const pattern = new RegExp(
    `^(title:\\s*)${quoted}${escaped}${quoted}[ \\t]*$`,
    'm'
  );

  const updated = frontmatter.replace(pattern, `$1${q}${newValue}${q}`);
  if (updated === frontmatter) return null; // no match / no change

  return updated + rest;
}

/**
 * Collect all .md and .mdx files recursively under dir.
 */
function collectFiles(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectFiles(fullPath));
    } else if (/\.(md|mdx)$/.test(entry.name)) {
      results.push(fullPath);
    }
  }
  return results;
}

function main() {
  const dryRun = process.argv.includes('--dry-run') || process.argv.includes('--preview');

  const files = collectFiles(CONTENT_DIR);
  const changes = [];
  let unchanged = 0;
  let skipped = 0;
  let errors = 0;

  for (const filePath of files) {
    try {
      const raw = fs.readFileSync(filePath, 'utf8');

      // Must start with frontmatter delimiter
      if (!raw.startsWith('---')) {
        skipped++;
        continue;
      }

      // Find end of frontmatter
      const fmEndIdx = raw.indexOf('\n---', 3);
      if (fmEndIdx === -1) {
        skipped++;
        continue;
      }

      const frontmatter = raw.substring(0, fmEndIdx);
      const titleInfo = extractTitle(frontmatter);

      if (!titleInfo) {
        skipped++;
        continue;
      }

      const { value: originalTitle, quoted } = titleInfo;
      const newTitle = apTitleCase(originalTitle);

      if (newTitle === originalTitle) {
        unchanged++;
        continue;
      }

      const updatedContent = replaceTitleInContent(raw, originalTitle, newTitle, quoted);
      if (!updatedContent) {
        unchanged++;
        continue;
      }

      const relPath = path.relative(CONTENT_DIR, filePath);
      changes.push({ file: relPath, from: originalTitle, to: newTitle });

      if (!dryRun) {
        fs.writeFileSync(filePath, updatedContent, 'utf8');
      }
    } catch (err) {
      console.error(`ERROR: ${filePath}: ${err.message}`);
      errors++;
    }
  }

  // ── Report ──────────────────────────────────────────────────────────────────
  const label = dryRun ? '[DRY RUN] ' : '';
  console.log(`\n${label}AP Title Case Update — ${changes.length} change(s)\n`);

  for (const { file, from, to } of changes) {
    console.log(`  ${file}`);
    console.log(`    Before: ${from}`);
    console.log(`    After:  ${to}`);
    console.log('');
  }

  console.log('─'.repeat(60));
  console.log(`${label}Changed:   ${changes.length}`);
  console.log(`${label}Unchanged: ${unchanged}`);
  console.log(`${label}Skipped:   ${skipped}`);
  if (errors) console.log(`${label}Errors:    ${errors}`);

  if (dryRun && changes.length > 0) {
    console.log('\nRun without --dry-run to apply all changes.');
  }
}

main();
