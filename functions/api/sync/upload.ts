import { unzipSync } from 'fflate';

interface Env {
  WEBAUTHN_KV: KVNamespace;
  GITHUB_TOKEN: string;
}

const GH = 'https://api.github.com';
const REPO = 'sajal24x7/til-sync';

async function validateSession(token: string | null, kv: KVNamespace): Promise<boolean> {
  if (!token) return false;
  return (await kv.get(`session:${token}`)) !== null;
}

function pad(n: number) {
  return String(n).padStart(2, '0');
}

function ts() {
  const d = new Date();
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}-${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}`;
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const auth = request.headers.get('Authorization');
  const token = auth?.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!await validateSession(token, env.WEBAUTHN_KV)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return Response.json({ error: 'Expected multipart form data' }, { status: 400 });
  }

  const file = form.get('file') as File | null;
  if (!file) {
    return Response.json({ error: 'No file field in form data' }, { status: 400 });
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  let unzipped: Record<string, Uint8Array>;
  try {
    unzipped = unzipSync(bytes);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return Response.json({ error: `Failed to unzip: ${msg}` }, { status: 400 });
  }

  const decoder = new TextDecoder();
  const mdFiles = Object.entries(unzipped)
    .filter(([path]) => path.endsWith('.md') && !path.endsWith('/'))
    .map(([path, content]) => ({
      name: path.split('/').pop()!,
      content: decoder.decode(content),
    }));

  if (mdFiles.length === 0) {
    return Response.json({ error: 'No .md files found in zip' }, { status: 400 });
  }

  const ghHeaders = {
    Authorization: `token ${env.GITHUB_TOKEN}`,
    Accept: 'application/vnd.github+json',
    'User-Agent': 'vault-sync',
    'Content-Type': 'application/json',
    'X-GitHub-Api-Version': '2022-11-28',
  };

  // Get main branch commit SHA
  const refRes = await fetch(`${GH}/repos/${REPO}/git/ref/heads/main`, { headers: ghHeaders });
  if (!refRes.ok) {
    return Response.json({ error: 'Failed to get main branch ref' }, { status: 502 });
  }
  const refData = await refRes.json<{ object: { sha: string } }>();
  const mainCommitSha = refData.object.sha;

  // Create a new tree (no base_tree = full replace snapshot)
  const treeRes = await fetch(`${GH}/repos/${REPO}/git/trees`, {
    method: 'POST',
    headers: ghHeaders,
    body: JSON.stringify({
      tree: mdFiles.map(({ name, content }) => ({
        path: name,
        mode: '100644',
        type: 'blob',
        content,
      })),
    }),
  });
  if (!treeRes.ok) {
    const body = await treeRes.text();
    return Response.json({ error: `Failed to create tree: ${body}` }, { status: 502 });
  }
  const treeData = await treeRes.json<{ sha: string }>();

  // Create commit
  const stamp = ts();
  const commitRes = await fetch(`${GH}/repos/${REPO}/git/commits`, {
    method: 'POST',
    headers: ghHeaders,
    body: JSON.stringify({
      message: `Vault sync — ${stamp} (${mdFiles.length} files)`,
      tree: treeData.sha,
      parents: [mainCommitSha],
    }),
  });
  if (!commitRes.ok) {
    return Response.json({ error: 'Failed to create commit' }, { status: 502 });
  }
  const commitData = await commitRes.json<{ sha: string }>();

  // Create branch
  const branch = `sync/upload-${stamp}`;
  const branchRes = await fetch(`${GH}/repos/${REPO}/git/refs`, {
    method: 'POST',
    headers: ghHeaders,
    body: JSON.stringify({ ref: `refs/heads/${branch}`, sha: commitData.sha }),
  });
  if (!branchRes.ok) {
    return Response.json({ error: 'Failed to create branch' }, { status: 502 });
  }

  // Create PR
  const date = new Date().toISOString().split('T')[0];
  const prRes = await fetch(`${GH}/repos/${REPO}/pulls`, {
    method: 'POST',
    headers: ghHeaders,
    body: JSON.stringify({
      title: `Vault sync — ${date}`,
      head: branch,
      base: 'main',
      body: `Automated vault sync upload.\n\n- **Files:** ${mdFiles.length} markdown files\n- **Timestamp:** ${stamp}\n- **Mode:** Full replace`,
    }),
  });
  if (!prRes.ok) {
    const body = await prRes.text();
    return Response.json({ error: `Failed to create PR: ${body}` }, { status: 502 });
  }
  const prData = await prRes.json<{ html_url: string }>();

  return Response.json({ prUrl: prData.html_url, fileCount: mdFiles.length });
};
