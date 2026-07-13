/**
 * Avatar mirroring for the interactions collector.
 *
 * Interaction avatars are hotlinked by default (author.avatar points straight
 * at Mastodon/Bluesky/Threads/Instagram's CDN), which leaks reader IPs to
 * those third parties on every page view and rots when an account is deleted
 * or renamed. This mirrors each avatar once into the site's existing R2
 * media bucket (the same one functions/api/upload.js writes to) and rewrites
 * the entry to point at the mirrored copy.
 *
 * The collector runs as a plain Node script in GitHub Actions, not inside a
 * Cloudflare Pages Function, so it can't use the `env.IMAGES` binding
 * upload.js does — it talks to R2 over the S3-compatible API instead, signed
 * with a scoped R2 API token (Account → R2 → Manage R2 API Tokens on the
 * Cloudflare dashboard; needs Object Read & Write on the bucket).
 *
 * Environment (all four required to enable mirroring):
 *   R2_ACCOUNT_ID
 *   R2_ACCESS_KEY_ID
 *   R2_SECRET_ACCESS_KEY
 *   R2_BUCKET                 the bucket name bound as IMAGES on Pages
 *   R2_PUBLIC_URL              optional, defaults to the images bucket's public domain
 */

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const DEFAULT_PUBLIC_URL = 'https://storage.sajalchoudhary.net';
const CACHE_FILE = path.join(process.cwd(), 'src', 'data', 'avatar-cache.json');
const MAX_BYTES = 5 * 1024 * 1024;
const FETCH_TIMEOUT_MS = 10_000;

const EXT_BY_TYPE = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/avif': 'avif',
};

export function r2Config() {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucket = process.env.R2_BUCKET;
  if (!accountId || !accessKeyId || !secretAccessKey || !bucket) return null;
  return {
    accountId,
    accessKeyId,
    secretAccessKey,
    bucket,
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    publicUrl: (process.env.R2_PUBLIC_URL || DEFAULT_PUBLIC_URL).replace(/\/+$/, ''),
  };
}

function hmac(key, data) {
  return crypto.createHmac('sha256', key).update(data, 'utf8').digest();
}

function sha256Hex(data) {
  return crypto.createHash('sha256').update(data).digest('hex');
}

/** Minimal AWS SigV4 PUT against R2's S3-compatible API — no query params, no SDK. */
async function putObject(config, key, bytes, contentType) {
  const region = 'auto';
  const service = 's3';
  const host = new URL(config.endpoint).host;
  const amzDate = new Date().toISOString().replace(/[:-]|\.\d{3}/g, '');
  const dateStamp = amzDate.slice(0, 8);
  const canonicalUri = `/${config.bucket}/${key.split('/').map(encodeURIComponent).join('/')}`;
  const payloadHash = sha256Hex(bytes);

  const signedHeaders = 'host;x-amz-content-sha256;x-amz-date';
  const canonicalHeaders = `host:${host}\nx-amz-content-sha256:${payloadHash}\nx-amz-date:${amzDate}\n`;
  const canonicalRequest = ['PUT', canonicalUri, '', canonicalHeaders, signedHeaders, payloadHash].join('\n');

  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
  const stringToSign = ['AWS4-HMAC-SHA256', amzDate, credentialScope, sha256Hex(canonicalRequest)].join('\n');

  const kDate = hmac(`AWS4${config.secretAccessKey}`, dateStamp);
  const kRegion = hmac(kDate, region);
  const kService = hmac(kRegion, service);
  const kSigning = hmac(kService, 'aws4_request');
  const signature = hmac(kSigning, stringToSign).toString('hex');

  const authorization =
    `AWS4-HMAC-SHA256 Credential=${config.accessKeyId}/${credentialScope}, ` +
    `SignedHeaders=${signedHeaders}, Signature=${signature}`;

  const response = await fetch(`${config.endpoint}${canonicalUri}`, {
    method: 'PUT',
    headers: {
      host,
      'x-amz-content-sha256': payloadHash,
      'x-amz-date': amzDate,
      authorization,
      'content-type': contentType,
      'cache-control': 'public, max-age=31536000, immutable',
    },
    body: bytes,
  });
  if (!response.ok) throw new Error(`R2 PUT ${key} returned ${response.status}`);
}

async function fetchAvatarBytes(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) throw new Error(`avatar fetch returned ${response.status}`);
    const contentType = (response.headers.get('content-type') || '').split(';')[0].trim();
    const ext = EXT_BY_TYPE[contentType];
    if (!ext) throw new Error(`unsupported avatar content-type: ${contentType || 'none'}`);
    const buffer = Buffer.from(await response.arrayBuffer());
    if (buffer.byteLength === 0 || buffer.byteLength > MAX_BYTES) {
      throw new Error(`avatar size out of bounds (${buffer.byteLength} bytes)`);
    }
    return { bytes: buffer, contentType, ext };
  } finally {
    clearTimeout(timer);
  }
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

/**
 * Mirror every hotlinked author avatar in the index into R2, rewriting
 * entries in place to point at the mirrored copy. Cached by source URL
 * across runs; failures fall back to the original hotlink and are retried
 * next run rather than treated as fatal.
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
        const { bytes, contentType, ext } = await fetchAvatarBytes(source);
        const key = `avatars/${sha256Hex(source).slice(0, 32)}.${ext}`;
        await putObject(config, key, bytes, contentType);
        const mirrored = `${config.publicUrl}/${key}`;
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
