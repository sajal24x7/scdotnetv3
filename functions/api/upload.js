// Cloudflare Pages Function: POST /api/upload
//
// Accepts a raw image body from the /write composer and stores it in the
// existing media R2 bucket, bound as IMAGES (Pages project → Settings →
// Bindings). Keys follow the bucket's established images/YYYY/MM/<name>.<ext>
// layout and the returned URL uses the bucket's public domain.
// Auth reuses the composer's fine-grained GitHub PAT: only a token with push
// (Contents write) access to the site repo is treated as the owner, so no
// separate upload secret exists. Read access is not enough — the repo is
// public, so any GitHub token can read it.

const REPO = 'sajal24x7/scdotnetv3';
const PUBLIC_BASE = 'https://storage.sajalchoudhary.net';
const MAX_BYTES = 15 * 1024 * 1024;

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
      'user-agent': 'scdotnetv3-write-composer',
    },
  });
  if (gh.status !== 200) {
    return json(401, { error: `Token rejected by GitHub (${gh.status})` });
  }
  const repo = await gh.json().catch(() => null);
  if (!repo?.permissions?.push) {
    return json(403, { error: 'Token does not have write access to the site repo' });
  }

  const contentType = (request.headers.get('content-type') || '').split(';')[0].trim();
  const ext = EXT_BY_TYPE[contentType];
  if (!ext) {
    return json(415, { error: `Unsupported image type: ${contentType || 'none'}` });
  }

  const length = Number(request.headers.get('content-length') || '0');
  if (length > MAX_BYTES) {
    return json(413, { error: `Image exceeds ${MAX_BYTES / 1024 / 1024}MB limit` });
  }

  const bytes = await request.arrayBuffer();
  if (bytes.byteLength === 0) return json(400, { error: 'Empty body' });
  if (bytes.byteLength > MAX_BYTES) {
    return json(413, { error: `Image exceeds ${MAX_BYTES / 1024 / 1024}MB limit` });
  }

  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const stamp =
    now.getUTCFullYear() + pad(now.getUTCMonth() + 1) + pad(now.getUTCDate()) +
    pad(now.getUTCHours()) + pad(now.getUTCMinutes()) + pad(now.getUTCSeconds());
  const rand = crypto.randomUUID().slice(0, 8);
  const key = `images/${now.getUTCFullYear()}/${pad(now.getUTCMonth() + 1)}/${stamp}-${rand}.${ext}`;

  await env.IMAGES.put(key, bytes, {
    httpMetadata: {
      contentType,
      cacheControl: 'public, max-age=31536000, immutable',
    },
  });

  const base = (env.IMAGES_PUBLIC_URL || PUBLIC_BASE).replace(/\/+$/, '');
  return json(200, { key, url: `${base}/${key}` });
}
