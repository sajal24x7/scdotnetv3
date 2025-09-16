/**
 * Frontmatter Updater for POSSE Syndication
 *
 * Safely updates frontmatter in markdown files, preserving all existing fields
 * and only adding/updating the syndicationUrls array.
 */

import fs from 'fs';
import matter from 'gray-matter';

/**
 * Update the syndicationUrls field in a markdown file's frontmatter
 * CRITICAL: Preserves all existing frontmatter fields
 *
 * @param {string} filePath - Path to the markdown file
 * @param {string[]} newUrls - Array of new syndication URLs to add
 */
export async function updateSyndicationUrls(filePath, newUrls) {
  if (!filePath || !Array.isArray(newUrls) || newUrls.length === 0) {
    throw new Error('Invalid parameters: filePath and newUrls array required');
  }

  try {
    // Read the file
    const fileContent = fs.readFileSync(filePath, 'utf-8');

    // Parse frontmatter and content
    const { data: frontmatter, content } = matter(fileContent);

    // PRESERVE ALL EXISTING FIELDS - only update syndicationUrls
    const existingUrls = frontmatter.syndicationUrls || [];
    const updatedUrls = [...existingUrls, ...newUrls];

    // Remove duplicates while preserving order
    const uniqueUrls = [...new Set(updatedUrls)];

    const updatedFrontmatter = {
      ...frontmatter, // Preserve ALL existing fields
      syndicationUrls: uniqueUrls
    };

    // Reconstruct the file with updated frontmatter
    const updatedContent = matter.stringify(content, updatedFrontmatter);

    // Write back to file
    fs.writeFileSync(filePath, updatedContent, 'utf-8');

    console.log(`  ✓ Updated ${filePath} with ${newUrls.length} new syndication URLs`);

  } catch (error) {
    throw new Error(`Failed to update frontmatter in ${filePath}: ${error.message}`);
  }
}

/**
 * Read frontmatter from a markdown file
 *
 * @param {string} filePath - Path to the markdown file
 * @returns {Object} - Parsed frontmatter data
 */
export function readFrontmatter(filePath) {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const { data } = matter(fileContent);
    return data;
  } catch (error) {
    throw new Error(`Failed to read frontmatter from ${filePath}: ${error.message}`);
  }
}

/**
 * Check if a file has specific syndication URLs
 *
 * @param {string} filePath - Path to the markdown file
 * @param {string[]} urlsToCheck - URLs to check for
 * @returns {boolean} - True if all URLs are present
 */
export function hasSyndicationUrls(filePath, urlsToCheck) {
  try {
    const frontmatter = readFrontmatter(filePath);
    const existingUrls = frontmatter.syndicationUrls || [];

    return urlsToCheck.every(url => existingUrls.includes(url));
  } catch (error) {
    console.warn(`Warning: Could not check syndication URLs in ${filePath}: ${error.message}`);
    return false;
  }
}

/**
 * Backup a file before modifying it
 *
 * @param {string} filePath - Path to the file to backup
 * @returns {string} - Path to the backup file
 */
export function createBackup(filePath) {
  const backupPath = `${filePath}.backup.${Date.now()}`;
  fs.copyFileSync(filePath, backupPath);
  return backupPath;
}

/**
 * Validate frontmatter structure before updating
 *
 * @param {string} filePath - Path to the markdown file
 * @returns {boolean} - True if frontmatter is valid
 */
export function validateFrontmatter(filePath) {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const parsed = matter(fileContent);

    // Check if we can parse it properly
    return typeof parsed.data === 'object' && parsed.data !== null;
  } catch (error) {
    console.warn(`Warning: Invalid frontmatter in ${filePath}: ${error.message}`);
    return false;
  }
}

/**
 * Safe frontmatter update with backup
 *
 * @param {string} filePath - Path to the markdown file
 * @param {string[]} newUrls - Array of new syndication URLs to add
 * @param {boolean} createBackupFile - Whether to create a backup before updating
 */
export async function safeUpdateSyndicationUrls(filePath, newUrls, createBackupFile = false) {
  // Validate inputs
  if (!fs.existsSync(filePath)) {
    throw new Error(`File does not exist: ${filePath}`);
  }

  if (!validateFrontmatter(filePath)) {
    throw new Error(`Invalid frontmatter in file: ${filePath}`);
  }

  let backupPath = null;

  try {
    // Create backup if requested
    if (createBackupFile) {
      backupPath = createBackup(filePath);
      console.log(`  📋 Created backup: ${backupPath}`);
    }

    // Update the frontmatter
    await updateSyndicationUrls(filePath, newUrls);

    // Clean up backup if successful and not requested to keep
    if (backupPath && !createBackupFile) {
      fs.unlinkSync(backupPath);
    }

  } catch (error) {
    // Restore from backup if update failed
    if (backupPath && fs.existsSync(backupPath)) {
      fs.copyFileSync(backupPath, filePath);
      console.log(`  🔄 Restored from backup due to error`);
      fs.unlinkSync(backupPath);
    }

    throw error;
  }
}