#!/usr/bin/env node

/**
 * Interactions backfeed collector for sajalchoudhary.net
 *
 * For every post with syndicationUrls in frontmatter, fetches the responses
 * that accumulated on the syndicated copies — replies, likes, and reposts —
 * and bakes them into src/data/interactions-index.json, which the site reads
 * at build time (src/utils/interactions.ts) to render the Interactions tab.
 *
 * Collects from Mastodon, Bluesky, Threads, and Instagram. Entries from any
 * other platform in the index (web, email) are preserved untouched by this
 * script. Threads and Instagram need their permalinks resolved to Meta media
 * ids first; that mapping is cached in src/data/interaction-sources.json.
 *
 * Environment:
 *   MASTODON_ACCESS_TOKEN     optional, improves Mastodon rate limits
 *   THREADS_ACCESS_TOKEN      optional, enables the Threads backfeed
 *   THREADS_USER_ID           (both required; same secrets the syndicator uses)
 *   INSTAGRAM_ACCESS_TOKEN    optional, enables the Instagram backfeed
 *   INSTAGRAM_USER_ID         (both required)
 *   GITHUB_TOKEN              enables mirroring hotlinked avatars into R2 via
 *                             the /api/mirror-avatar Pages Function (see
 *                             scripts/lib/interactions/avatar-cache.js) —
 *                             set automatically in GitHub Actions
 *   INTERACTIONS_DAYS_BACK    poll window in days (default from
 *                             interactions.config.json; 0 = all posts)
 */

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { RateLimiter } from './lib/utils/rate-limiter.js';
import { parseMastodonUrl, collectMastodonInteractions } from './lib/interactions/mastodon.js';
import { parseBlueskyUrl, collectBlueskyInteractions } from './lib/interactions/bluesky.js';
import { parseThreadsUrl, threadsConfig, resolveThreadsMediaIds, collectThreadsInteractions } from './lib/interactions/threads.js';
import { parseInstagramUrl, instagramConfig, resolveInstagramMediaIds, collectInstagramInteractions } from './lib/interactions/instagram.js';
import { webmentionsConfig, drainPendingWebmentions, deleteWebmentionKeys, mergeWebmentionsIntoIndex } from './lib/interactions/webmentions.js';
import { avatarMirrorConfig, mirrorAvatars } from './lib/interactions/avatar-cache.js';
import { sortEntries } from './lib/interactions/shared.js';

const INDEX_FILE = path.join(process.cwd(), 'src', 'data', 'interactions-index.json');
const SOURCES_FILE = path.join(process.cwd(), 'src', 'data', 'interaction-sources.json');
const CONFIG_FILE = path.join(process.cwd(), 'interactions.config.json');
const INDEX_VERSION = 1;

// Platforms this script is authoritative for. Entries from any other
// platform (web, email) are never touched here.
const POLLED_PLATFORMS = new Set(['mastodon', 'bluesky', 'threads', 'instagram']);

// The Meta platforms share a poll shape: resolve permalinks to media ids
// once per run, then collect per post via the resolved refs.
const META_PLATFORMS = {
  threads: {
    getConfig: threadsConfig,
    parseUrl: parseThreadsUrl,
    resolve: resolveThreadsMediaIds,
    collect: collectThreadsInteractions,
  },
  instagram: {
    getConfig: instagramConfig,
    parseUrl: parseInstagramUrl,
    resolve: resolveInstagramMediaIds,
    collect: collectInstagramInteractions,
  },
};

const rateLimiters = {
  mastodon: new RateLimiter(300, 5 * 60 * 1000),
  bluesky: new RateLimiter(100, 60 * 1000),
  // Meta's per-user Graph limits are hourly; stay comfortably below them.
  threads: new RateLimiter(150, 60 * 60 * 1000),
  instagram: new RateLimiter(150, 60 * 60 * 1000),
};

function loadConfig() {
  const defaults = {
    daysBack: 60,
    blockedAuthorUrls: [],
    approvedWebmentionDomains: [],
    blockedWebmentionDomains: [],
  };
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

function readSources() {
  try {
    const raw = JSON.parse(fs.readFileSync(SOURCES_FILE, 'utf-8'));
    return { threads: raw.threads ?? {}, instagram: raw.instagram ?? {} };
  } catch {
    return { threads: {}, instagram: {} };
  }
}

function writeSources(sources) {
  const sortObject = (obj) => Object.fromEntries(Object.entries(obj).sort(([a], [b]) => a.localeCompare(b)));
  const output = {
    _meta: { version: 1 },
    threads: sortObject(sources.threads),
    instagram: sortObject(sources.instagram),
  };
  const serialized = JSON.stringify(output, null, 2) + '\n';

  let existing = null;
  try {
    existing = fs.readFileSync(SOURCES_FILE, 'utf-8');
  } catch {
    // First run — no cache yet.
  }
  if (existing === serialized) return;

  fs.mkdirSync(path.dirname(SOURCES_FILE), { recursive: true });
  fs.writeFileSync(SOURCES_FILE, serialized, 'utf-8');
  console.log(`Wrote ${SOURCES_FILE}`);
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

/** Group a post's Threads/Instagram syndication URLs by platform. */
function metaRefsForPost(post) {
  const refs = { threads: [], instagram: [] };
  for (const url of post.syndicationUrls) {
    for (const [platform, { parseUrl }] of Object.entries(META_PLATFORMS)) {
      const ref = parseUrl(url);
      if (ref) {
        refs[platform].push({ ...ref, url });
        break;
      }
    }
  }
  return refs;
}

/**
 * Resolve the permalink → media-id map for one Meta platform. Unavailable
 * platforms (no credentials, resolution failure) are simply not polled, so
 * their existing index entries pass through untouched.
 */
async function prepareMetaPlatform(platform, posts, cache) {
  const wanted = new Set(posts.flatMap((post) => post.metaRefs[platform].map((ref) => ref.shortcode)));
  if (wanted.size === 0) return { available: false };

  const config = META_PLATFORMS[platform].getConfig();
  if (!config) {
    console.log(`ℹ️  ${platform}: credentials not configured, leaving existing entries untouched`);
    return { available: false };
  }

  try {
    const { ids, exhausted } = await META_PLATFORMS[platform].resolve({
      config,
      wanted,
      cache,
      rateLimiter: rateLimiters[platform],
    });
    const unresolved = wanted.size - ids.size;
    if (unresolved > 0) {
      console.warn(
        `  ⚠️  ${platform}: ${unresolved} syndicated post(s) missing from the media list` +
          (exhausted ? ' — treating as deleted upstream' : ' — leaving them untouched')
      );
    }
    return { available: true, config, ids, exhausted };
  } catch (error) {
    console.warn(`  ⚠️  ${platform} media resolution failed: ${error.message} — leaving existing entries untouched`);
    return { available: false };
  }
}

async function collectForPost(post, meta, sources) {
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

  for (const [platform, { collect }] of Object.entries(META_PLATFORMS)) {
    const state = meta[platform];
    const refs = post.metaRefs[platform];
    if (!state?.available || refs.length === 0) continue;

    const resolved = refs
      .map((ref) => ({ ...ref, mediaId: state.ids.get(ref.shortcode) }))
      .filter((ref) => ref.mediaId);

    if (resolved.length === 0) {
      // Every copy is missing from the media list: deleted upstream when the
      // full list was paged, unknowable otherwise (leave entries alone).
      if (state.exhausted) results.set(platform, { gone: true, entries: [] });
      continue;
    }

    try {
      const result = await collect(resolved, state.config, rateLimiters[platform]);
      for (const shortcode of result.goneShortcodes ?? []) {
        delete sources[platform][shortcode];
      }
      results.set(platform, result);
    } catch (error) {
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

  const sources = readSources();
  for (const post of posts) post.metaRefs = metaRefsForPost(post);

  const meta = {};
  for (const platform of Object.keys(META_PLATFORMS)) {
    meta[platform] = await prepareMetaPlatform(platform, posts, sources[platform]);
  }

  const index = readIndex();
  let polled = 0;
  let failedPosts = 0;
  let totalEntries = 0;

  for (const post of posts) {
    const results = await collectForPost(post, meta, sources);
    if (results.size === 0) continue; // no copies on a polled platform

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

  // Webmentions received by functions/api/webmention.js sit in Cloudflare KV
  // until this drains them into the index behind the moderation gate.
  const wmConfig = webmentionsConfig();
  let drainedMentions = [];
  if (wmConfig) {
    try {
      drainedMentions = await drainPendingWebmentions(wmConfig);
      console.log(`🌐 web: drained ${drainedMentions.length} webmention(s) from KV`);
    } catch (error) {
      console.warn(`  ⚠️  webmention drain failed: ${error.message} — records stay queued for the next run`);
      drainedMentions = [];
    }
  } else {
    console.log('ℹ️  web: Cloudflare KV credentials not configured, skipping webmention drain');
  }
  const wmStats = mergeWebmentionsIntoIndex(index, drainedMentions, config);
  if (wmStats.added || wmStats.updated || wmStats.removed || wmStats.pending) {
    console.log(
      `🌐 web: ${wmStats.added} added, ${wmStats.updated} updated, ${wmStats.removed} removed; ` +
        `${wmStats.pending} pending moderation`
    );
  }

  // Mirror hotlinked avatars into R2 (via the /api/mirror-avatar Pages
  // Function) so reader IPs aren't leaked to third-party CDNs on every page
  // view; rewrites entries in place.
  const avatarMirror = avatarMirrorConfig();
  if (avatarMirror) {
    const avatarStats = await mirrorAvatars(index, avatarMirror);
    console.log(
      `🖼️  avatars: ${avatarStats.uploaded} mirrored, ${avatarStats.cached} cached, ${avatarStats.failed} failed`
    );
  } else {
    console.log('ℹ️  avatars: GITHUB_TOKEN not set, using hotlinked avatars');
  }

  writeIndex(index);
  writeSources(sources);

  // Only after the index is safely on disk — a failed delete just means the
  // next run re-merges the same records, which is idempotent.
  if (wmConfig && drainedMentions.length > 0) {
    try {
      await deleteWebmentionKeys(wmConfig, drainedMentions.map((mention) => mention.key));
    } catch (error) {
      console.warn(`  ⚠️  KV cleanup failed: ${error.message} — drained keys will be re-read next run`);
    }
  }

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
