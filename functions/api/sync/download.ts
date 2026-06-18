interface Env {
  WEBAUTHN_KV: KVNamespace;
  GITHUB_TOKEN: string;
}

const REPO = 'sajal24x7/til-sync';

async function validateSession(token: string | null, kv: KVNamespace): Promise<boolean> {
  if (!token) return false;
  return (await kv.get(`session:${token}`)) !== null;
}

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const auth = request.headers.get('Authorization');
  const token = auth?.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!await validateSession(token, env.WEBAUTHN_KV)) {
    return new Response('Unauthorized', { status: 401 });
  }

  const res = await fetch(`https://api.github.com/repos/${REPO}/zipball/main`, {
    headers: {
      Authorization: `token ${env.GITHUB_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'vault-sync',
      'X-GitHub-Api-Version': '2022-11-28',
    },
    redirect: 'follow',
  });

  if (!res.ok) {
    return new Response('Failed to fetch vault zip from GitHub', { status: 502 });
  }

  const date = new Date().toISOString().split('T')[0];
  return new Response(res.body, {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="til-sync-${date}.zip"`,
    },
  });
};
