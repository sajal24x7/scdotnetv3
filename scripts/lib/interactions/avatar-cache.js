/**
 * Avatar mirroring for the interactions collector.
 *
 * Interaction avatars are hotlinked by default (author.avatar points straight
 * at Mastodon/Bluesky/Threads/Instagram's CDN), which leaks reader IPs to
 * those third parties on every page view and rots when an account is deleted
 * or renamed. This calls the site's /api/mirror-avatar Cloudflare Pages
 * Function (functions/api/mirror-avatar.js), which runs inside the Workers
 * runtime and can use the `env.IMAGES` R2 binding directly — so mirroring
 * needs no R2 credentials here, just a bearer token the Function trusts.
 *
 * Auth reuses the same trick as the /write composer's /api/upload: any
 * token that can read this repo is accepted, and GitHub Actions' automatic
 * GITHUB_TOKEN satisfies that with no new secret to create.
 *
 * Environment:
 *   GITHUB_TOKEN            required to enable mirroring — set automatically
 *                            in GitHub Actions; absent locally, in which
 *                            case avatars are left hotlinked
 *   MIRROR_AVATAR_ENDPOINT   optional override of the mirror endpoint URL
 *   R2_PUBLIC_URL            optional override of the mirrored-avatar host,
 *                            must match the Function's PUBLIC_BASE
 */

import fs from 'node:fs';
import path from 'node:path';

const DEFAULT_ENDPOINT = 'https://sajalchoudhary.net/api/mirror-avatar';
const DEFAULT_PUBLIC_URL = 'https://storage.sajalchoudhary.net';
const CACHE_FILE = path.join(process.cwd(), 'src', 'data', 'avatar-cache.json');
const FETCH_TIMEOUT_MS = 15_000;

export function avatarMirrorConfig() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) return null;
  return {
    token,
    endpoint: process.env.MIRROR_AVATAR_ENDPOINT || DEFAULT_ENDPOINT,
    publicUrl: (process.env.R2_PUBLIC_URL || DEFAULT_PUBLIC_URL).replace(/\/+$/, ''),
  };
}

function readCache() {
  try {
    return JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'));
  } catch {
    return {};
  }
}

function writeCache(cache) {
  const sorted = Object.fromEntries(Object.entries(cache).sort(([a], [b]) => a.localeCompare(b)));
  const serialized = JSON.stringify(sorted, null, 2) + '\n';
  let existing = null;
  try {
    existing = fs.readFileSync(CACHE_FILE, 'utf-8');
  } catch {
    // First run.
  }
  if (existing === serialized) return;
  fs.mkdirSync(path.dirname(CACHE_FILE), { recursive: true });
  fs.writeFileSync(CACHE_FILE, serialized, 'utf-8');
}

async function requestMirror(source, config) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const response = await fetch(config.endpoint, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        authorization: `Bearer ${config.token}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({ url: source }),
    });
    const data = await response.json().catch(() => null);
    if (!response.ok || !data?.url) {
      throw new Error(data?.error || `mirror endpoint returned ${response.status}`);
    }
    return data.url;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Mirror every hotlinked author avatar in the index via the Pages Function,
 * rewriting entries in place to point at the mirrored copy. Cached by
 * source URL across runs; failures fall back to the original hotlink and
 * are retried next run rather than treated as fatal.
 */
export async function mirrorAvatars(index, config) {
  const cache = readCache();
  const stats = { uploaded: 0, cached: 0, failed: 0 };

  for (const entries of Object.values(index)) {
    for (const entry of entries) {
      const source = entry.author?.avatar;
      if (!source || !/^https?:\/\//.test(source) || source.startsWith(config.publicUrl)) continue;

      if (cache[source]) {
        entry.author.avatar = cache[source];
        stats.cached++;
        continue;
      }

      try {
        const mirrored = await requestMirror(source, config);
        cache[source] = mirrored;
        entry.author.avatar = mirrored;
        stats.uploaded++;
      } catch (error) {
        console.warn(`  ⚠️  avatar mirror failed for ${source}: ${error.message} — using hotlink`);
        stats.failed++;
      }
    }
  }

  writeCache(cache);
  return stats;
}
