#!/usr/bin/env node

/**
 * Interactions backfeed collector for sajalchoudhary.net
 *
 * For every post with syndicationUrls in frontmatter, fetches the responses
 * that accumulated on the syndicated copies — replies, likes, and reposts —
 * and bakes them into src/data/interactions-index.json, which the site reads
 * at build time (src/utils/interactions.ts) to render the Interactions tab.
 *
 * Currently collects from Mastodon and Bluesky. Threads and Instagram are
 * planned (see planning/webmention-interactions-plan.md, Phase 2); their
 * entries in the index — like `web` and `email` ones — are preserved
 * untouched by this script.
 *
 * Environment:
 *   MASTODON_ACCESS_TOKEN     optional, improves Mastodon rate limits
 *   INTERACTIONS_DAYS_BACK    poll window in days (default from
 *                             interactions.config.json; 0 = all posts)
 */

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { RateLimiter } from './lib/utils/rate-limiter.js';
import { parseMastodonUrl, collectMastodonInteractions } from './lib/interactions/mastodon.js';
import { parseBlueskyUrl, collectBlueskyInteractions } from './lib/interactions/bluesky.js';

const INDEX_FILE = path.join(process.cwd(), 'src', 'data', 'interactions-index.json');
const CONFIG_FILE = path.join(process.cwd(), 'interactions.config.json');
const INDEX_VERSION = 1;

// Platforms this script is authoritative for. Entries from any other
// platform (threads, instagram, web, email) are never touched here.
const POLLED_PLATFORMS = new Set(['mastodon', 'bluesky']);

const rateLimiters = {
  mastodon: new RateLimiter(300, 5 * 60 * 1000),
  bluesky: new RateLimiter(100, 60 * 1000),
};

function loadConfig() {
  const defaults = { daysBack: 60, blockedAuthorUrls: [] };
  try {
    const raw = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
    return { ...defaults, ...raw };
  } catch {
    return defaults;
  }
}

/**
 * Mirror of slugFromEntry in src/content.config.ts — index keys must match
 * the page paths Astro generates.
 */
function slugFromFilename(filename) {
  return filename
    .replace(/\.mdx?$/, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** All posts that have syndicated copies, keyed the same way as page paths. */
function getSyndicatedPosts() {
  const contentDir = path.join(process.cwd(), 'src', 'content');
  const posts = [];

  const categoryDirs = fs
    .readdirSync(contentDir, { withFileTypes: true })
    .filter((item) => item.isDirectory() && !item.name.startsWith('.') && item.name !== 'inbox')
    .map((item) => item.name)
    .sort();

  for (const category of categoryDirs) {
    const files = fs
      .readdirSync(path.join(contentDir, category))
      .filter((file) => file.endsWith('.md') || file.endsWith('.mdx'));

    for (const file of files) {
      const filePath = path.join(contentDir, category, file);
      try {
        const { data } = matter(fs.readFileSync(filePath, 'utf-8'));
        const syndicationUrls = Array.isArray(data.syndicationUrls) ? data.syndicationUrls : [];
        if (syndicationUrls.length === 0) continue;

        const slug = data.slug != null && data.slug !== '' ? String(data.slug) : slugFromFilename(file);
        posts.push({
          key: `${data.category || category}/${slug}`,
          created: new Date(data.created || data.pubDate || 0),
          syndicationUrls,
        });
      } catch (error) {
        console.warn(`Warning: could not parse ${filePath}: ${error.message}`);
      }
    }
  }

  return posts;
}

function readIndex() {
  try {
    const raw = JSON.parse(fs.readFileSync(INDEX_FILE, 'utf-8'));
    const { _meta, ...entries } = raw;
    return entries;
  } catch {
    return {};
  }
}

function writeIndex(index) {
  const sortedKeys = Object.keys(index).sort();
  const output = { _meta: { version: INDEX_VERSION } };
  for (const key of sortedKeys) {
    if (index[key].length > 0) output[key] = index[key];
  }

  const serialized = JSON.stringify(output, null, 2) + '\n';
  let existing = null;
  try {
    existing = fs.readFileSync(INDEX_FILE, 'utf-8');
  } catch {
    // First run — no index yet.
  }

  if (existing === serialized) {
    console.log('Index unchanged, nothing to write.');
    return false;
  }

  fs.mkdirSync(path.dirname(INDEX_FILE), { recursive: true });
  fs.writeFileSync(INDEX_FILE, serialized, 'utf-8');
  console.log(`Wrote ${INDEX_FILE}`);
  return true;
}

function sortEntries(entries) {
  // Chronological stream; entries without timestamps (e.g. Mastodon likes)
  // sink to the end in a stable order.
  return [...entries].sort((a, b) => {
    if (a.published && b.published) return a.published.localeCompare(b.published);
    if (a.published) return -1;
    if (b.published) return 1;
    return a.id.localeCompare(b.id);
  });
}

async function collectForPost(post) {
  // platform → { gone, entries } for platforms that answered; a thrown
  // fetch marks the platform as failed so its old entries are kept as-is.
  const results = new Map();

  for (const url of post.syndicationUrls) {
    const mastodonRef = parseMastodonUrl(url);
    const blueskyRef = parseBlueskyUrl(url);

    try {
      if (mastodonRef) {
        results.set('mastodon', await collectMastodonInteractions(mastodonRef, rateLimiters.mastodon));
      } else if (blueskyRef) {
        results.set('bluesky', await collectBlueskyInteractions(blueskyRef, rateLimiters.bluesky));
      }
    } catch (error) {
      const platform = mastodonRef ? 'mastodon' : 'bluesky';
      console.warn(`  ⚠️  ${platform} failed for ${post.key}: ${error.message}`);
      results.set(platform, { failed: true });
    }
  }

  return results;
}

function mergePostEntries(existingEntries, results, config) {
  const blocked = new Set(config.blockedAuthorUrls || []);
  const previousById = new Map(existingEntries.map((entry) => [entry.id, entry]));
  const merged = [];

  // Foreign-platform entries (threads/instagram/web/email) and entries from
  // polled platforms that didn't answer this run pass through unchanged.
  for (const entry of existingEntries) {
    const result = results.get(entry.platform);
    const untouched = !POLLED_PLATFORMS.has(entry.platform) || !result || result.failed;
    if (untouched) merged.push(entry);
  }

  for (const [, result] of results) {
    if (result.failed || result.gone) continue; // gone: syndicated post deleted upstream
    for (const entry of result.entries) {
      if (entry.author.url && blocked.has(entry.author.url)) continue;
      // Moderation decisions outlive refreshes: a hand-edited status wins
      // over the collector's default "approved".
      const previous = previousById.get(entry.id);
      merged.push(previous?.status && previous.status !== 'approved' ? { ...entry, status: previous.status } : entry);
    }
  }

  return sortEntries(merged);
}

async function collectInteractions() {
  console.log('💬 Collecting interactions...');
  const config = loadConfig();
  // Env override; empty/garbage values (e.g. the workflow's blank dispatch
  // input on scheduled runs) fall back to the config default.
  const daysBackOverride = Number.parseInt(process.env.INTERACTIONS_DAYS_BACK ?? '', 10);
  const daysBack = Number.isNaN(daysBackOverride) ? config.daysBack : daysBackOverride;

  const allPosts = getSyndicatedPosts();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - daysBack);
  const posts = daysBack > 0 ? allPosts.filter((post) => post.created >= cutoff) : allPosts;

  console.log(
    `📖 ${allPosts.length} syndicated posts total; polling ${posts.length}` +
      (daysBack > 0 ? ` from the last ${daysBack} days` : ' (no window)')
  );

  const index = readIndex();
  let polled = 0;
  let failedPosts = 0;
  let totalEntries = 0;

  for (const post of posts) {
    const results = await collectForPost(post);
    if (results.size === 0) continue; // no Mastodon/Bluesky copies

    polled++;
    if ([...results.values()].every((result) => result.failed)) failedPosts++;

    const mergedEntries = mergePostEntries(index[post.key] ?? [], results, config);
    index[post.key] = mergedEntries;
    totalEntries += mergedEntries.length;

    const summary = [...results.entries()]
      .map(([platform, result]) =>
        result.failed ? `${platform}: failed` : result.gone ? `${platform}: gone` : `${platform}: ${result.entries.length}`
      )
      .join(', ');
    console.log(`  ${post.key} → ${summary}`);
  }

  writeIndex(index);
  console.log(`\n🎉 Done. Polled ${polled} posts, ${totalEntries} interactions in updated keys.`);

  if (polled > 0 && failedPosts === polled) {
    console.error('💥 Every polled post failed — treating as a systemic error.');
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  collectInteractions().catch((error) => {
    console.error('💥 Unhandled error:', error);
    process.exit(1);
  });
}

export { collectInteractions };
