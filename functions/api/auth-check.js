// Cloudflare Pages Function: /api/auth-check
//
// The verification step of the site's sign-in (public/auth/session.js). Takes
// a fine-grained GitHub PAT as a bearer token and reports whether it's valid
// and whether it can write to this repo — which is the only permission any of
// the site's editing surfaces need.
//
// The check happens here rather than in the browser against api.github.com
// because the work network blocks GitHub's API; the composer already routes
// its calls through Cloudflare for that reason (see api/til/sync.js). Doing
// the same for sign-in means the login works from everywhere the site does.
//
// The token is used once, to make these two calls, and never stored: the only
// copy lives in the browser's localStorage.
//
//   GET /api/auth-check → { login, canPush }  (401 if GitHub rejects it)

const OWNER = 'sajal24x7';
const REPO = 'scdotnetv3';
const GH = 'https://api.github.com';

const json = (status, body) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  });

const ghHeaders = (token) => ({
  authorization: `Bearer ${token}`,
  accept: 'application/vnd.github+json',
  'user-agent': 'scdotnetv3-auth-check',
  'x-github-api-version': '2022-11-28',
});

export async function onRequestGet({ request }) {
  const token = (request.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  if (!token) return json(401, { error: 'Missing Authorization bearer token' });

  const repoRes = await fetch(`${GH}/repos/${OWNER}/${REPO}`, { headers: ghHeaders(token) });
  if (repoRes.status === 401) {
    return json(401, { error: 'GitHub rejected that token — check it was copied in full and hasn’t expired.' });
  }
  if (repoRes.status === 404) {
    // A fine-grained PAT scoped to the wrong repository sees this repo as
    // nonexistent rather than forbidden, so say what's actually wrong.
    return json(401, { error: `That token can’t see ${OWNER}/${REPO} — check it’s scoped to this repository.` });
  }
  if (!repoRes.ok) {
    return json(502, { error: `GitHub said ${repoRes.status}` });
  }

  const repo = await repoRes.json().catch(() => null);
  const canPush = Boolean(repo?.permissions?.push);

  // Best-effort: a fine-grained PAT can be valid without /user access, and
  // the login is only ever displayed, so a failure here isn't a failure.
  let login = null;
  try {
    const userRes = await fetch(`${GH}/user`, { headers: ghHeaders(token) });
    if (userRes.ok) login = (await userRes.json())?.login ?? null;
  } catch {
    // ignore
  }
  if (!login) login = repo?.owner?.login ?? null;

  return json(200, { login, canPush });
}
