// Cloudflare Pages Function: POST /api/mirror-avatar
//
// Mirrors a third-party interaction avatar (a Mastodon/Bluesky/Threads/
// Instagram profile picture) into the site's existing media R2 bucket, so
// the Interactions tab doesn't hotlink readers' page views to those CDNs on
// every visit. Runs inside the Pages Function runtime so it can use the
// `env.IMAGES` binding directly, the same bucket functions/api/upload.js
// writes to — no separate R2 API credentials needed anywhere.
//
// Auth mirrors /api/upload: only a bearer token with push (contents: write)
// access to the site repo is trusted as the owner — read access is not
// enough, the repo is public. GitHub Actions' automatic GITHUB_TOKEN
// satisfies that (refresh-interactions.yml grants contents: write) with no
// new secret to create — see scripts/lib/interactions/avatar-cache.js, the
// only caller.

const REPO = 'sajal24x7/scdotnetv3';
const PUBLIC_BASE = 'https://storage.sajalchoudhary.net';
const MAX_BYTES = 5 * 1024 * 1024;
const FETCH_TIMEOUT_MS = 10_000;

const EXT_BY_TYPE = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/avif': 'avif',
};

const json = (status, body) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });

async function sha256Hex(text) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function onRequestPost({ request, env }) {
  if (!env.IMAGES) {
    return json(500, { error: 'IMAGES R2 binding is not configured on the Pages project' });
  }

  const token = (request.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  if (!token) return json(401, { error: 'Missing Authorization bearer token' });

  const gh = await fetch(`https://api.github.com/repos/${REPO}`, {
    headers: {
      authorization: `Bearer ${token}`,
      accept: 'application/vnd.github+json',
      'user-agent': 'scdotnetv3-avatar-mirror',
    },
  });
  if (gh.status !== 200) {
    return json(401, { error: `Token rejected by GitHub (${gh.status})` });
  }
  const repo = await gh.json().catch(() => null);
  if (!repo?.permissions?.push) {
    return json(403, { error: 'Token does not have write access to the site repo' });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json(400, { error: 'Expected a JSON body with a "url" field' });
  }

  const sourceUrl = String(body?.url || '').trim();
  let parsed;
  try {
    parsed = new URL(sourceUrl);
  } catch {
    return json(400, { error: 'url must be a valid absolute URL' });
  }
  if (!/^https?:$/.test(parsed.protocol)) {
    return json(400, { error: 'url must be http(s)' });
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  let response;
  try {
    response = await fetch(sourceUrl, {
      signal: controller.signal,
      headers: { 'user-agent': 'sajalchoudhary.net-avatar-mirror/1.0 (+https://sajalchoudhary.net)' },
    });
  } catch {
    return json(400, { error: 'Source avatar could not be fetched' });
  } finally {
    clearTimeout(timer);
  }
  if (!response.ok) return json(400, { error: `Source returned ${response.status}` });

  const contentType = (response.headers.get('content-type') || '').split(';')[0].trim();
  const ext = EXT_BY_TYPE[contentType];
  if (!ext) return json(415, { error: `Unsupported avatar content-type: ${contentType || 'none'}` });

  const bytes = await response.arrayBuffer();
  if (bytes.byteLength === 0) return json(400, { error: 'Empty avatar body' });
  if (bytes.byteLength > MAX_BYTES) {
    return json(413, { error: `Avatar exceeds ${MAX_BYTES / 1024 / 1024}MB limit` });
  }

  // Deterministic key from the source URL, so re-mirroring the same avatar
  // (a fresh run with a cold local cache) overwrites the same object
  // instead of accumulating duplicates.
  const key = `avatars/${(await sha256Hex(sourceUrl)).slice(0, 32)}.${ext}`;
  await env.IMAGES.put(key, bytes, {
    httpMetadata: {
      contentType,
      cacheControl: 'public, max-age=31536000, immutable',
    },
  });

  return json(200, { url: `${PUBLIC_BASE}/${key}` });
}
