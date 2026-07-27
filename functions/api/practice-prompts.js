// Cloudflare Pages Function: /api/practice-prompts
//
// The store behind authored prompts (docs/architecture/learning-systems.md
// § "Authored prompts"). The automated decks — linux, finnish, finnish-vocab,
// vocab — ship items as reference cards with no prompts; the learner writes
// the prompts by hand when a concept is introduced on /learn/new, and this
// function is where they land: src/data/authored-prompts.json on main.
//
// Storing them in the repo rather than in the practice-state KV blob is a
// deliberate choice — these are hand-written content, so they belong in git
// where they're versioned, diffable, and editable in an editor like every
// other content pool. The trade-off is rebuild latency: another device sees a
// new prompt once Cloudflare rebuilds. The authoring device doesn't wait —
// it caches what it wrote in localStorage (see authoredPrompts.ts), and any
// device holding a PAT can GET the live file straight from GitHub here.
//
// Auth and the commit mechanics reuse api/til/sync.js exactly: a fine-grained
// GitHub PAT with Contents read/write on this repo, sent as a bearer token,
// with every GitHub call made as that token — no bindings, no secrets. It's
// the same PAT /practice already asks for to turn on sync.
//
//   GET  /api/practice-prompts  → { store, sha } — the live file on main
//   POST /api/practice-prompts  → { items: { <itemId>: { prompts, updatedAt } } }
//                                 upserts those items and commits. Read-merge-
//                                 write against the live file, so two devices
//                                 authoring on the same day can't clobber each
//                                 other's words.

const OWNER = 'sajal24x7';
const REPO = 'scdotnetv3';
const BRANCH = 'main';
const FILE_PATH = 'src/data/authored-prompts.json';
const GH = 'https://api.github.com';

const MAX_ITEMS_PER_REQUEST = 200;
const MAX_PROMPTS_PER_ITEM = 12;
const MAX_FIELD_CHARS = 500;

const json = (status, body) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });

const ghHeaders = (token) => ({
  authorization: `Bearer ${token}`,
  accept: 'application/vnd.github+json',
  'user-agent': 'scdotnetv3-practice-prompts',
  'x-github-api-version': '2022-11-28',
});

function bearerToken(request) {
  return (request.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
}

// Reads the file as it exists on main right now. Returns the parsed store and
// the blob sha the write must be based on (GitHub rejects a contents PUT whose
// sha is stale, which is exactly the concurrency check we want).
async function readStore(token) {
  const res = await fetch(
    `${GH}/repos/${OWNER}/${REPO}/contents/${FILE_PATH}?ref=${BRANCH}`,
    { headers: ghHeaders(token) },
  );
  if (res.status === 404) return { store: { version: 1, items: {} }, sha: null };
  if (!res.ok) throw new Error(`GitHub read failed (${res.status})`);
  const meta = await res.json();
  let store;
  try {
    // The contents API returns base64 with newlines; atob needs them gone.
    const decoded = new TextDecoder().decode(
      Uint8Array.from(atob(meta.content.replace(/\n/g, '')), (c) => c.charCodeAt(0)),
    );
    store = JSON.parse(decoded);
  } catch {
    throw new Error('Stored prompts file is not valid JSON');
  }
  if (!store || typeof store !== 'object' || typeof store.items !== 'object') {
    throw new Error('Stored prompts file has an unexpected shape');
  }
  return { store: { version: 1, items: store.items ?? {} }, sha: meta.sha };
}

function badField(value, { required = true } = {}) {
  if (value === undefined || value === null || value === '') return required;
  return typeof value !== 'string' || value.length > MAX_FIELD_CHARS;
}

// Prompts are hand-typed, so validate shape rather than trusting the client:
// this file is committed to the repo and read back by the site build.
function validateItems(items) {
  const ids = Object.keys(items);
  if (ids.length === 0) return 'No items in payload';
  if (ids.length > MAX_ITEMS_PER_REQUEST) return `More than ${MAX_ITEMS_PER_REQUEST} items`;

  for (const id of ids) {
    if (typeof id !== 'string' || id.length === 0 || id.length > 200) return `Invalid item id: ${id}`;
    const entry = items[id];
    if (!entry || typeof entry !== 'object') return `Invalid entry for "${id}"`;
    if (!Array.isArray(entry.prompts)) return `Entry "${id}" has no prompts array`;
    if (entry.prompts.length > MAX_PROMPTS_PER_ITEM) {
      return `Entry "${id}" has more than ${MAX_PROMPTS_PER_ITEM} prompts`;
    }
    for (const prompt of entry.prompts) {
      if (!prompt || typeof prompt !== 'object') return `Entry "${id}" has a malformed prompt`;
      if (badField(prompt.id) || badField(prompt.q) || badField(prompt.a)) {
        return `Entry "${id}" has a prompt missing id/q/a`;
      }
      if (badField(prompt.note, { required: false })) return `Entry "${id}" has an invalid note`;
      if (prompt.kind !== undefined && prompt.kind !== 'cloze') {
        return `Entry "${id}" has an unknown prompt kind`;
      }
    }
  }
  return null;
}

export async function onRequestGet({ request }) {
  const token = bearerToken(request);
  if (!token) return json(401, { error: 'Missing Authorization bearer token' });

  const probe = await fetch(`${GH}/repos/${OWNER}/${REPO}`, { headers: ghHeaders(token) });
  if (probe.status !== 200) {
    return json(401, { error: `Token rejected by GitHub (${probe.status})` });
  }
  try {
    const { store, sha } = await readStore(token);
    return json(200, { store, sha });
  } catch (e) {
    return json(502, { error: e.message });
  }
}

async function commitStore(token, store, sha, message) {
  const serialized = `${JSON.stringify(store, null, '\t')}\n`;
  const encoded = btoa(String.fromCharCode(...new TextEncoder().encode(serialized)));
  const res = await fetch(`${GH}/repos/${OWNER}/${REPO}/contents/${FILE_PATH}`, {
    method: 'PUT',
    headers: { ...ghHeaders(token), 'content-type': 'application/json' },
    body: JSON.stringify({
      message,
      content: encoded,
      branch: BRANCH,
      ...(sha ? { sha } : {}),
    }),
  });
  if (!res.ok) {
    // 409/422 = the file moved under us (another device wrote first). The
    // caller retries once from a fresh read, which re-merges rather than
    // overwriting — nothing typed on either device is lost.
    const err = new Error(`Failed to commit prompts (${res.status})`);
    err.retryable = res.status === 409 || res.status === 422;
    throw err;
  }
  return res.json();
}

export async function onRequestPost({ request }) {
  const token = bearerToken(request);
  if (!token) return json(401, { error: 'Missing Authorization bearer token' });

  const probe = await fetch(`${GH}/repos/${OWNER}/${REPO}`, { headers: ghHeaders(token) });
  if (probe.status !== 200) {
    return json(401, { error: `Token rejected by GitHub (${probe.status})` });
  }
  const repo = await probe.json().catch(() => null);
  if (!repo?.permissions?.push) {
    return json(403, { error: 'Token does not have write access to the site repo' });
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return json(400, { error: 'Expected a JSON body' });
  }
  const items = payload && typeof payload.items === 'object' && payload.items ? payload.items : null;
  if (!items) return json(400, { error: 'Expected an items object' });
  const invalid = validateItems(items);
  if (invalid) return json(400, { error: invalid });

  // Upsert against the live file, newest write per item wins. Two devices that
  // authored different concepts today both keep their work; the same concept
  // authored twice keeps the later edit.
  async function attempt() {
    const { store, sha } = await readStore(token);
    const merged = { version: 1, items: { ...store.items } };
    let written = 0;
    for (const [id, entry] of Object.entries(items)) {
      const existing = merged.items[id];
      const incomingAt = typeof entry.updatedAt === 'string' ? entry.updatedAt : new Date().toISOString();
      if (existing && typeof existing.updatedAt === 'string' && existing.updatedAt > incomingAt) continue;
      merged.items[id] = { prompts: entry.prompts, updatedAt: incomingAt };
      written++;
    }
    if (written === 0) return { store: merged, written: 0, upToDate: true };

    const label = written === 1 ? '1 concept' : `${written} concepts`;
    // Prompts feed the site build (they're baked into /api/practice/*.json),
    // so this commit deliberately does NOT carry [CI Skip] — the rebuild is
    // what publishes the new prompts to every other device.
    const commit = await commitStore(token, merged, sha, `Add practice prompts for ${label}`);
    return { store: merged, written, commitUrl: commit.commit?.html_url };
  }

  try {
    let result;
    try {
      result = await attempt();
    } catch (e) {
      if (!e.retryable) throw e;
      result = await attempt(); // someone else committed first — re-merge and retry once
    }
    return json(200, {
      written: result.written,
      upToDate: result.upToDate ?? false,
      commitUrl: result.commitUrl,
      store: result.store,
    });
  } catch (e) {
    return json(502, { error: e.message });
  }
}
