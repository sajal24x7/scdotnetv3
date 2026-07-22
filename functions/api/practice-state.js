// Cloudflare Pages Function: /api/practice-state
//
// Backs cross-device sync for /practice (unified-practice plan §2.8). The
// stored blob is opaque to this function — every deck's SrsState plus
// practice-meta, as one JSON object keyed by localStorage key — merging
// happens client-side (src/components/learn/engine.ts mergeSrsState /
// mergePracticeMeta) so this function never needs to understand the shape.
//
// Auth reuses the same pattern as api/upload.js and api/til/sync.js: a
// fine-grained GitHub PAT with Contents write access to this repo, sent as a
// bearer token. One PAT per device — losing a device means revoking its
// token in GitHub settings; the KV blob itself is untouched.
//
//   GET /api/practice-state  → the stored blob ({} if nothing saved yet)
//   PUT /api/practice-state  → replaces it; keeps one rolling backup per UTC
//                              day (state:backup:<date>), pruned after 7 days

const REPO = 'sajal24x7/scdotnetv3';
const STATE_KEY = 'state';
const BACKUP_PREFIX = 'state:backup:';
const BACKUP_RETENTION_DAYS = 7;
const MAX_BYTES = 512 * 1024; // tens of KB expected; generous ceiling

const json = (status, body) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });

function bearerToken(request) {
  return (request.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
}

async function requireWriteAccess(request) {
  const token = bearerToken(request);
  if (!token) return { error: json(401, { error: 'Missing Authorization bearer token' }) };

  const gh = await fetch(`https://api.github.com/repos/${REPO}`, {
    headers: {
      authorization: `Bearer ${token}`,
      accept: 'application/vnd.github+json',
      'user-agent': 'scdotnetv3-practice-sync',
    },
  });
  if (gh.status !== 200) {
    return { error: json(401, { error: `Token rejected by GitHub (${gh.status})` }) };
  }
  const repo = await gh.json().catch(() => null);
  if (!repo?.permissions?.push) {
    return { error: json(403, { error: 'Token does not have write access to the site repo' }) };
  }
  return { token };
}

function todayUtc() {
  return new Date().toISOString().slice(0, 10);
}

async function pruneOldBackups(kv) {
  const cutoff = todayUtc();
  const cutoffDate = new Date(cutoff);
  cutoffDate.setUTCDate(cutoffDate.getUTCDate() - BACKUP_RETENTION_DAYS);
  const cutoffStr = cutoffDate.toISOString().slice(0, 10);

  const list = await kv.list({ prefix: BACKUP_PREFIX });
  for (const key of list.keys) {
    const dateStr = key.name.slice(BACKUP_PREFIX.length);
    if (dateStr < cutoffStr) {
      await kv.delete(key.name);
    }
  }
}

export async function onRequestGet({ request, env }) {
  if (!env.PRACTICE_STATE) {
    return json(500, { error: 'PRACTICE_STATE KV binding is not configured on the Pages project' });
  }
  const auth = await requireWriteAccess(request);
  if (auth.error) return auth.error;

  const raw = await env.PRACTICE_STATE.get(STATE_KEY);
  return json(200, { blob: raw ? JSON.parse(raw) : {} });
}

export async function onRequestPut({ request, env }) {
  if (!env.PRACTICE_STATE) {
    return json(500, { error: 'PRACTICE_STATE KV binding is not configured on the Pages project' });
  }
  const auth = await requireWriteAccess(request);
  if (auth.error) return auth.error;

  const length = Number(request.headers.get('content-length') || '0');
  if (length > MAX_BYTES) {
    return json(413, { error: `Payload exceeds ${MAX_BYTES / 1024}KB limit` });
  }

  let blob;
  try {
    blob = await request.json();
  } catch {
    return json(400, { error: 'Expected a JSON body' });
  }
  if (!blob || typeof blob !== 'object' || Array.isArray(blob)) {
    return json(400, { error: 'Expected a JSON object' });
  }

  const serialized = JSON.stringify(blob);
  if (serialized.length > MAX_BYTES) {
    return json(413, { error: `Payload exceeds ${MAX_BYTES / 1024}KB limit` });
  }

  // Safety net before overwriting: KV has no history of its own.
  const existing = await env.PRACTICE_STATE.get(STATE_KEY);
  if (existing) {
    await env.PRACTICE_STATE.put(`${BACKUP_PREFIX}${todayUtc()}`, existing);
  }
  await env.PRACTICE_STATE.put(STATE_KEY, serialized);
  await pruneOldBackups(env.PRACTICE_STATE);

  return json(200, { ok: true, syncedAt: new Date().toISOString() });
}
