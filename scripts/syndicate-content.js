#!/usr/bin/env node

/**
 * POSSE Syndication Script for sajalchoudhary.net
 *
 * Syndicates stream content (blog, micro, photo) to:
 * - Mastodon
 * - Bluesky
 * - Threads
 *
 * Only adds syndicationUrls to frontmatter, preserves all existing fields.
 */

// We'll implement a simple version to avoid TypeScript dependencies
// import { getAllPosts } from '../src/utils/content.ts';
import { safeUpdateSyndicationUrls } from './lib/frontmatter-updater.js';
import { readFrontmatter } from './lib/frontmatter-updater.js';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { formatContentForPlatform } from './lib/content-formatter.js';
import { postToMastodon } from './lib/platforms/mastodon.js';
import { postToBluesky } from './lib/platforms/bluesky.js';
import { postToThreads } from './lib/platforms/threads.js';
import { RateLimiter } from './lib/utils/rate-limiter.js';

// Configuration
const PLATFORMS = ['mastodon', 'bluesky', 'threads'];
const STREAM_CATEGORIES = ['blog', 'micro', 'photo'];
const GARDEN_CATEGORIES = ['evergreen', 'til', 'bookshelf', 'story', 'poem'];
const NORDLETTER_CATEGORIES = ['nordletter'];
const SYNDICATION_CATEGORIES = [
    ...new Set([...STREAM_CATEGORIES, ...GARDEN_CATEGORIES, ...NORDLETTER_CATEGORIES])
];
const DRY_RUN = process.env.SYNDICATION_DRY_RUN === 'true';
const DAYS_BACK = parseInt(process.env.SYNDICATION_DAYS_BACK || '7', 10);

/**
 * Get all posts from category subdirectories
 */
async function getAllPosts() {
  const contentDir = path.join(process.cwd(), 'src', 'content');
  const posts = [];

  // Get all category directories (skip files, hidden dirs, and inbox)
  const items = fs.readdirSync(contentDir, { withFileTypes: true });
  const categoryDirs = items
    .filter(item => item.isDirectory() && !item.name.startsWith('.') && item.name !== 'inbox')
    .map(item => item.name)
    .sort();

  // Read posts from each category directory
  for (const category of categoryDirs) {
    const categoryDir = path.join(contentDir, category);
    const files = fs.readdirSync(categoryDir)
      .filter(file => file.endsWith('.md') || file.endsWith('.mdx'));

    for (const file of files) {
      const filePath = path.join(categoryDir, file);
      try {
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const { data, content } = matter(fileContent);

        // Create a post object similar to Astro's structure
        // Derive category from directory name if not set in frontmatter
        const post = {
          data: {
            ...data,
            category: data.category || category,
            pubDate: new Date(data.created || data.pubDate)
          },
          slug: data.slug || file.replace(/\.(md|mdx)$/, ''),
          body: content,
          filePath: filePath
        };

        posts.push(post);
      } catch (error) {
        console.warn(`Warning: Could not parse ${filePath}: ${error.message}`);
      }
    }
  }

  return posts;
}

// Rate limiters for each platform
const rateLimiters = {
  mastodon: new RateLimiter(300, 5 * 60 * 1000), // 300 requests per 5 minutes
  bluesky: new RateLimiter(100, 60 * 1000),       // 100 requests per minute (conservative)
  threads: new RateLimiter(250, 60 * 60 * 1000)   // 250 requests per hour
};

/**
 * Check if a post needs syndication
 */
function needsSyndication(post) {
  // Only syndicate configured categories
  const category = (post.data.category || '').toLowerCase();
  if (!SYNDICATION_CATEGORIES.includes(category)) {
    return false;
  }

  // Only syndicate posts from the last X days (configurable)
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - DAYS_BACK);

  if (post.data.pubDate < cutoffDate) {
    return false; // Skip posts older than configured days
  }

  // Simple rule: if we don't have URLs for all 3 platforms, syndicate
  const existingUrls = post.data.syndicationUrls || [];
  return existingUrls.length < PLATFORMS.length;
}

/**
 * Detect which platforms are missing from existing syndication URLs
 */
function getMissingPlatforms(post) {
  const existingUrls = post.data.syndicationUrls || [];
  const existingPlatforms = existingUrls.map(url => {
    if (url.includes('mastodon.') || url.includes('mastodon.social')) return 'mastodon';
    if (url.includes('bsky.') || url.includes('bluesky.')) return 'bluesky';
    if (url.includes('threads.') || url.includes('twitter.') || url.includes('x.com')) return 'threads';
    return 'unknown';
  }).filter(platform => platform !== 'unknown');

  return PLATFORMS.filter(platform => !existingPlatforms.includes(platform));
}

/**
 * Get the file path for a post
 */
function getPostFilePath(post) {
  // We now include filePath in the post object
  if (post.filePath) {
    return post.filePath;
  }

  // Fallback: search all category subdirectories
  const contentDir = path.join(process.cwd(), 'src', 'content');
  const items = fs.readdirSync(contentDir, { withFileTypes: true });
  const categoryDirs = items
    .filter(item => item.isDirectory() && !item.name.startsWith('.') && item.name !== 'inbox')
    .map(item => item.name);

  for (const category of categoryDirs) {
    const categoryDir = path.join(contentDir, category);
    const files = fs.readdirSync(categoryDir);

    for (const file of files) {
      if (file.includes(post.slug) || file.replace(/\.\w+$/, '').endsWith(post.slug)) {
        return path.join(categoryDir, file);
      }
    }
  }

  throw new Error(`Could not find file for post: ${post.slug}`);
}

/**
 * Syndicate a single post to a platform
 */
async function syndicateToplatform(post, platform) {
  console.log(`  → Syndicating to ${platform}...`);

  if (DRY_RUN) {
    console.log(`    [DRY RUN] Would syndicate to ${platform}`);
    return `https://example.com/${platform}/${post.slug}`;
  }

  // Check rate limits
  await rateLimiters[platform].checkLimit();

  // Format content for platform
  const formattedContent = formatContentForPlatform(post, platform);

  // Post to platform
  let syndicationUrl;
  try {
    switch (platform) {
      case 'mastodon':
        syndicationUrl = await postToMastodon(formattedContent);
        break;
      case 'bluesky':
        syndicationUrl = await postToBluesky(formattedContent);
        break;
      case 'threads':
        syndicationUrl = await postToThreads(formattedContent);
        break;
      default:
        throw new Error(`Unknown platform: ${platform}`);
    }

    console.log(`    ✓ Posted to ${platform}: ${syndicationUrl}`);
    return syndicationUrl;

  } catch (error) {
    console.error(`    ✗ Failed to post to ${platform}: ${error.message}`);
    throw error;
  }
}

/**
 * Main syndication function
 */
async function syndicateContent() {
  console.log('🚀 Starting POSSE syndication...');

  if (DRY_RUN) {
    console.log('🧪 Running in DRY RUN mode - no actual posting will occur');
  }

  console.log(`📅 Checking posts from the last ${DAYS_BACK} days`);

  try {
    // Get all posts
    console.log('📖 Loading posts...');
    const allPosts = await getAllPosts();

    // Filter posts that need syndication
    const postsToSyndicate = allPosts.filter(needsSyndication);

    console.log(`📊 Found ${postsToSyndicate.length} posts needing syndication out of ${allPosts.length} total posts`);

    if (postsToSyndicate.length === 0) {
      console.log('✨ All stream content is already syndicated!');
      return;
    }

    let successCount = 0;
    let errorCount = 0;

    // Process each post
    for (const post of postsToSyndicate) {
      console.log(`\n📝 Processing: ${post.data.title || post.slug} (${post.data.category})`);

      const missingPlatforms = getMissingPlatforms(post);
      console.log(`  Missing platforms: ${missingPlatforms.join(', ')}`);

      const newUrls = [];

      // Syndicate to each missing platform
      for (const platform of missingPlatforms) {
        try {
          const url = await syndicateToplatform(post, platform);
          newUrls.push(url);
          successCount++;
        } catch (error) {
          console.error(`  ⚠️  Failed to syndicate to ${platform}: ${error.message}`);
          errorCount++;
          // Continue with other platforms
        }
      }

      // Update frontmatter with new URLs (only if we have new URLs)
      if (newUrls.length > 0 && !DRY_RUN) {
        try {
          const filePath = getPostFilePath(post);
          await safeUpdateSyndicationUrls(filePath, newUrls);
          console.log(`  ✓ Updated frontmatter with ${newUrls.length} new URLs`);
        } catch (error) {
          console.error(`  ⚠️  Failed to update frontmatter: ${error.message}`);
          errorCount++;
        }
      }
    }

    // Summary
    console.log(`\n🎉 Syndication complete!`);
    console.log(`   ✓ Successful syndications: ${successCount}`);
    if (errorCount > 0) {
      console.log(`   ✗ Failed syndications: ${errorCount}`);
    }

  } catch (error) {
    console.error('💥 Fatal error during syndication:', error.message);
    process.exit(1);
  }
}

// Run the syndication if this script is called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  syndicateContent().catch(error => {
    console.error('💥 Unhandled error:', error);
    process.exit(1);
  });
}

export { syndicateContent, needsSyndication, getMissingPlatforms };