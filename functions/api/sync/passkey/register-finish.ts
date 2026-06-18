import { verifyRegistrationResponse } from '@simplewebauthn/server';

interface Env {
  WEBAUTHN_KV: KVNamespace;
  REGISTRATION_TOKEN: string;
}

function toBase64(arr: Uint8Array): string {
  let binary = '';
  arr.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary);
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const auth = request.headers.get('Authorization');
  if (!auth || auth !== `Bearer ${env.REGISTRATION_TOKEN}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { challengeId, registrationResponse } = await request.json<{
    challengeId: string;
    registrationResponse: unknown;
  }>();

  const challengeRaw = await env.WEBAUTHN_KV.get(`challenge:${challengeId}`);
  if (!challengeRaw) {
    return Response.json({ error: 'Challenge expired or not found' }, { status: 400 });
  }
  const { challenge } = JSON.parse(challengeRaw) as { challenge: string };

  let verification;
  try {
    verification = await verifyRegistrationResponse({
      response: registrationResponse as Parameters<typeof verifyRegistrationResponse>[0]['response'],
      expectedChallenge: challenge,
      expectedOrigin: 'https://sajalchoudhary.net',
      expectedRPID: 'sajalchoudhary.net',
      requireUserVerification: false,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Verification error';
    return Response.json({ error: msg }, { status: 400 });
  }

  if (!verification.verified || !verification.registrationInfo) {
    return Response.json({ error: 'Registration failed' }, { status: 400 });
  }

  const { credential } = verification.registrationInfo;

  const raw = await env.WEBAUTHN_KV.get('credentials');
  const creds: Array<{
    id: string;
    publicKey: string;
    counter: number;
    transports?: string[];
  }> = raw ? JSON.parse(raw) : [];

  creds.push({
    id: credential.id,
    publicKey: toBase64(credential.publicKey),
    counter: credential.counter,
    transports: credential.transports,
  });

  await env.WEBAUTHN_KV.put('credentials', JSON.stringify(creds));
  await env.WEBAUTHN_KV.delete(`challenge:${challengeId}`);

  return Response.json({ verified: true });
};
