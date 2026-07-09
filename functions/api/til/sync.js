// Cloudflare Pages Function: /api/til/sync
//
// Backs the TIL tab on /write, which mirrors the work-laptop Obsidian vault
// into the til-sync/ folder of this repo. The work network blocks
// api.github.com, so the browser only ever talks to this function and the
// GitHub calls happen from Cloudflare's side.
//
// Auth reuses the composer's fine-grained GitHub PAT (Contents read/write on
// this repo): the browser sends it as a bearer token and every GitHub call
// below is made with it, so the function needs no bindings or secrets.
//
//   GET  /api/til/sync              → list .md files in til-sync/ (name, sha, size)
//   GET  /api/til/sync?path=<name>  → raw content of one note
//   POST /api/til/sync              → { files: [{ name, content }] } — commits new
//                                     and changed notes to main in a single commit.
//                                     Upsert-only: never deletes repo files.

const OWNER = 'sajal24x7';
const REPO = 'scdotnetv3';
const BRANCH = 'main';
const FOLDER = 'til-sync';
const GH = 'https://api.github.com';

const MAX_FILES = 2000;
const MAX_TOTAL_BYTES = 20 * 1024 * 1024;

const json = (status, body) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });

const ghHeaders = (token) => ({
  authorization: `Bearer ${token}`,
  accept: 'application/vnd.github+json',
  'user-agent': 'scdotnetv3-til-sync',
  'x-github-api-version': '2022-11-28',
});

function bearerToken(request) {
  return (request.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
}

// Filenames are always flattened basenames — reject anything that could
// escape the til-sync/ folder or hide as a dotfile.
function validName(name) {
  return (
    typeof name === 'string' &&
    name.length > 0 &&
    name.length <= 255 &&
    name.endsWith('.md') &&
    !name.includes('/') &&
    !name.includes('\\') &&
    !name.startsWith('.')
  );
}

// Git blob SHA of a string: sha1("blob <bytelen>\0<bytes>"). Matching this
// against the existing tree lets a re-uploaded identical vault be a no-op.
async function gitBlobSha(content) {
  const body = new TextEncoder().encode(content);
  const header = new TextEncoder().encode(`blob ${body.byteLength}\0`);
  const full = new Uint8Array(header.byteLength + body.byteLength);
  full.set(header, 0);
  full.set(body, header.byteLength);
  const digest = await crypto.subtle.digest('SHA-1', full);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function listFolder(token) {
  const res = await fetch(
    `${GH}/repos/${OWNER}/${REPO}/contents/${FOLDER}?ref=${BRANCH}`,
    { headers: ghHeaders(token) },
  );
  if (res.status === 404) return []; // folder doesn't exist yet
  if (!res.ok) throw new Error(`GitHub listing failed (${res.status})`);
  const entries = await res.json();
  if (!Array.isArray(entries)) return [];
  return entries
    .filter((e) => e.type === 'file' && e.name.endsWith('.md'))
    .map((e) => ({ name: e.name, sha: e.sha, size: e.size }));
}

export async function onRequestGet({ request }) {
  const token = bearerToken(request);
  if (!token) return json(401, { error: 'Missing Authorization bearer token' });

  const path = new URL(request.url).searchParams.get('path');

  if (path !== null) {
    if (!validName(path)) return json(400, { error: 'Invalid file name' });
    const res = await fetch(
      `${GH}/repos/${OWNER}/${REPO}/contents/${FOLDER}/${encodeURIComponent(path)}?ref=${BRANCH}`,
      { headers: { ...ghHeaders(token), accept: 'application/vnd.github.raw+json' } },
    );
    if (res.status === 401 || res.status === 403) {
      return json(401, { error: `Token rejected by GitHub (${res.status})` });
    }
    if (res.status === 404) return json(404, { error: 'File not found' });
    if (!res.ok) return json(502, { error: `GitHub said ${res.status}` });
    return new Response(res.body, {
      headers: { 'content-type': 'text/markdown; charset=utf-8' },
    });
  }

  // Listing doubles as the token check: a bad token surfaces as 401 here.
  const probe = await fetch(`${GH}/repos/${OWNER}/${REPO}`, { headers: ghHeaders(token) });
  if (probe.status !== 200) {
    return json(401, { error: `Token rejected by GitHub (${probe.status})` });
  }
  try {
    return json(200, { files: await listFolder(token) });
  } catch (e) {
    return json(502, { error: e.message });
  }
}

async function commitFiles(token, files, message) {
  const headers = { ...ghHeaders(token), 'content-type': 'application/json' };

  const refRes = await fetch(
    `${GH}/repos/${OWNER}/${REPO}/git/ref/${encodeURIComponent(`heads/${BRANCH}`)}`,
    { headers },
  );
  if (!refRes.ok) throw new Error(`Failed to read ${BRANCH} ref (${refRes.status})`);
  const headSha = (await refRes.json()).object.sha;

  const headCommitRes = await fetch(`${GH}/repos/${OWNER}/${REPO}/git/commits/${headSha}`, { headers });
  if (!headCommitRes.ok) throw new Error(`Failed to read head commit (${headCommitRes.status})`);
  const baseTree = (await headCommitRes.json()).tree.sha;

  // Inline `content` entries make GitHub create the blobs inside the tree
  // call — one request regardless of file count, no per-blob uploads.
  const treeRes = await fetch(`${GH}/repos/${OWNER}/${REPO}/git/trees`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      base_tree: baseTree,
      tree: files.map(({ name, content }) => ({
        path: `${FOLDER}/${name}`,
        mode: '100644',
        type: 'blob',
        content,
      })),
    }),
  });
  if (!treeRes.ok) throw new Error(`Failed to create tree (${treeRes.status})`);
  const treeSha = (await treeRes.json()).sha;

  const commitRes = await fetch(`${GH}/repos/${OWNER}/${REPO}/git/commits`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ message, tree: treeSha, parents: [headSha] }),
  });
  if (!commitRes.ok) throw new Error(`Failed to create commit (${commitRes.status})`);
  const commit = await commitRes.json();

  const updateRes = await fetch(
    `${GH}/repos/${OWNER}/${REPO}/git/refs/${encodeURIComponent(`heads/${BRANCH}`)}`,
    { method: 'PATCH', headers, body: JSON.stringify({ sha: commit.sha }) },
  );
  if (!updateRes.ok) {
    // 422 = main moved while we worked (e.g. a /write post landed); caller retries
    const race = updateRes.status === 422;
    const err = new Error(`Failed to update ${BRANCH} ref (${updateRes.status})`);
    err.retryable = race;
    throw err;
  }

  return commit;
}

export async function onRequestPost({ request }) {
  const token = bearerToken(request);
  if (!token) return json(401, { error: 'Missing Authorization bearer token' });

  const probe = await fetch(`${GH}/repos/${OWNER}/${REPO}`, { headers: ghHeaders(token) });
  if (probe.status !== 200) {
    return json(401, { error: `Token rejected by GitHub (${probe.status})` });
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return json(400, { error: 'Expected a JSON body' });
  }
  const files = payload && Array.isArray(payload.files) ? payload.files : null;
  if (!files || files.length === 0) return json(400, { error: 'No files in payload' });
  if (files.length > MAX_FILES) return json(413, { error: `More than ${MAX_FILES} files` });

  let totalBytes = 0;
  for (const f of files) {
    if (!validName(f.name) || typeof f.content !== 'string') {
      return json(400, { error: `Invalid file entry: ${String(f && f.name)}` });
    }
    totalBytes += f.content.length;
  }
  if (totalBytes > MAX_TOTAL_BYTES) {
    return json(413, { error: `Payload exceeds ${MAX_TOTAL_BYTES / 1024 / 1024}MB limit` });
  }

  try {
    const existing = await listFolder(token);
    const existingByName = new Map(existing.map((e) => [e.name, e.sha]));
    const incomingNames = new Set(files.map((f) => f.name));

    const changed = [];
    let added = 0;
    let updated = 0;
    for (const f of files) {
      const current = existingByName.get(f.name);
      if (current === undefined) {
        changed.push(f);
        added++;
      } else if (current !== (await gitBlobSha(f.content))) {
        changed.push(f);
        updated++;
      }
    }
    // Upsert-only by design: deleting a note from the work vault leaves the
    // repo copy alone — we just report it so nothing disappears silently.
    const missingFromZip = existing.filter((e) => !incomingNames.has(e.name)).map((e) => e.name);

    if (changed.length === 0) {
      return json(200, {
        added: 0,
        updated: 0,
        unchanged: files.length,
        missingFromZip,
        upToDate: true,
      });
    }

    const parts = [];
    if (added) parts.push(`${added} added`);
    if (updated) parts.push(`${updated} updated`);
    // [CI Skip] matches the repo's convention for commits that must not
    // trigger a Cloudflare build or GitHub Actions — nothing in til-sync/
    // affects the site.
    const message = `TIL vault sync: ${parts.join(', ')} [CI Skip]`;

    let commit;
    try {
      commit = await commitFiles(token, changed, message);
    } catch (e) {
      if (!e.retryable) throw e;
      commit = await commitFiles(token, changed, message); // main moved — one retry
    }

    return json(200, {
      added,
      updated,
      unchanged: files.length - changed.length,
      missingFromZip,
      commitUrl: `https://github.com/${OWNER}/${REPO}/commit/${commit.sha}`,
    });
  } catch (e) {
    return json(502, { error: e.message });
  }
}
