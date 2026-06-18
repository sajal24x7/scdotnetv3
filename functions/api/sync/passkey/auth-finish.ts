import { verifyAuthenticationResponse } from '@simplewebauthn/server';

interface Env {
  WEBAUTHN_KV: KVNamespace;
}

function fromBase64(b64: string): Uint8Array {
  const binary = atob(b64);
  return new Uint8Array([...binary].map((c) => c.charCodeAt(0)));
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const { challengeId, authenticationResponse } = await request.json<{
    challengeId: string;
    authenticationResponse: { id: string; [key: string]: unknown };
  }>();

  const challengeRaw = await env.WEBAUTHN_KV.get(`challenge:${challengeId}`);
  if (!challengeRaw) {
    return Response.json({ error: 'Challenge expired or not found' }, { status: 400 });
  }
  const { challenge } = JSON.parse(challengeRaw) as { challenge: string };

  const raw = await env.WEBAUTHN_KV.get('credentials');
  const creds: Array<{
    id: string;
    publicKey: string;
    counter: number;
    transports?: string[];
  }> = raw ? JSON.parse(raw) : [];

  const storedCred = creds.find((c) => c.id === authenticationResponse.id);
  if (!storedCred) {
    return Response.json({ error: 'Credential not found' }, { status: 400 });
  }

  let verification;
  try {
    verification = await verifyAuthenticationResponse({
      response: authenticationResponse as Parameters<typeof verifyAuthenticationResponse>[0]['response'],
      expectedChallenge: challenge,
      expectedOrigin: 'https://sajalchoudhary.net',
      expectedRPID: 'sajalchoudhary.net',
      credential: {
        id: storedCred.id,
        publicKey: fromBase64(storedCred.publicKey),
        counter: storedCred.counter,
        transports: storedCred.transports as AuthenticatorTransport[],
      },
      requireUserVerification: false,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Verification error';
    return Response.json({ error: msg }, { status: 401 });
  }

  if (!verification.verified) {
    return Response.json({ error: 'Authentication failed' }, { status: 401 });
  }

  storedCred.counter = verification.authenticationInfo.newCounter;
  await env.WEBAUTHN_KV.put('credentials', JSON.stringify(creds));
  await env.WEBAUTHN_KV.delete(`challenge:${challengeId}`);

  const sessionToken = crypto.randomUUID();
  await env.WEBAUTHN_KV.put(`session:${sessionToken}`, '1', { expirationTtl: 86400 });

  return Response.json({ sessionToken, expiresIn: 86400 });
};
