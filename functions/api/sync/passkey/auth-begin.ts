import { generateAuthenticationOptions } from '@simplewebauthn/server';

interface Env {
  WEBAUTHN_KV: KVNamespace;
}

export const onRequestPost: PagesFunction<Env> = async ({ env }) => {
  const raw = await env.WEBAUTHN_KV.get('credentials');
  const creds: Array<{ id: string; transports?: string[] }> = raw ? JSON.parse(raw) : [];

  if (creds.length === 0) {
    return Response.json({ error: 'No passkeys registered' }, { status: 400 });
  }

  const options = await generateAuthenticationOptions({
    rpID: 'sajalchoudhary.net',
    allowCredentials: creds.map((c) => ({
      id: c.id,
      transports: c.transports as AuthenticatorTransport[],
    })),
    userVerification: 'preferred',
  });

  const challengeId = crypto.randomUUID();
  await env.WEBAUTHN_KV.put(
    `challenge:${challengeId}`,
    JSON.stringify({ challenge: options.challenge }),
    { expirationTtl: 300 },
  );

  return Response.json({ options, challengeId });
};
