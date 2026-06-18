import { generateRegistrationOptions } from '@simplewebauthn/server';

interface Env {
  WEBAUTHN_KV: KVNamespace;
  REGISTRATION_TOKEN: string;
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const auth = request.headers.get('Authorization');
  if (!auth || auth !== `Bearer ${env.REGISTRATION_TOKEN}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const raw = await env.WEBAUTHN_KV.get('credentials');
  const existingCreds: Array<{ id: string; transports?: string[] }> = raw ? JSON.parse(raw) : [];

  const options = await generateRegistrationOptions({
    rpName: 'Vault Sync',
    rpID: 'sajalchoudhary.net',
    userName: 'vault',
    userID: new TextEncoder().encode('vault-user'),
    attestationType: 'none',
    authenticatorSelection: {
      residentKey: 'required',
      userVerification: 'preferred',
    },
    excludeCredentials: existingCreds.map((c) => ({
      id: c.id,
      transports: c.transports as AuthenticatorTransport[],
    })),
  });

  const challengeId = crypto.randomUUID();
  await env.WEBAUTHN_KV.put(
    `challenge:${challengeId}`,
    JSON.stringify({ challenge: options.challenge }),
    { expirationTtl: 300 },
  );

  return Response.json({ options, challengeId });
};
