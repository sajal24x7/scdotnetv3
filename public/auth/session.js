// One sign-in for the whole site.
//
// Several surfaces here can write to the repo — the /write composer, cross-
// device sync and authored prompts on /practice — and every one of them
// needs the same credential: a fine-grained GitHub PAT with Contents
// read/write on this repo. They used to each ask for it separately, which
// meant pasting the same token two or three times per device and having no
// single place to sign out. This module is the session they now share.
//
// It lives in public/ deliberately. The Astro side imports it through
// src/components/auth/session.ts (Vite bundles it like any other module),
// and the /write composer — a standalone static page outside the Astro build
// — imports it over the wire from /auth/session.js. One physical file, two
// consumers, no chance of the two drifting. Same reasoning as
// src/utils/learnBlockParser.mjs, which a Node script and a browser bundle
// share for the same reason.
//
// Plain JS on purpose: no build step stands between this file and the
// composer. Types live alongside it in src/components/auth/session.ts.

export const TOKEN_KEY = 'site-gh-token';
export const LOGIN_KEY = 'site-gh-login';

// Where tokens lived before there was one session: the composer's key and
// /practice's sync key. Read on first load and adopted, so a device that was
// already signed in to /write stays signed in — nobody has to paste anything
// again because the login moved. Cleared on sign-out, since one session means
// signing out signs out everywhere.
export const LEGACY_TOKEN_KEYS = ['microwrite.token', 'practice-sync-token'];

const listeners = new Set();

function read(key) {
	try {
		return window.localStorage.getItem(key);
	} catch {
		return null; // private mode / storage disabled
	}
}

function write(key, value) {
	try {
		window.localStorage.setItem(key, value);
	} catch {
		// Nothing to do — the caller degrades to an unauthenticated session.
	}
}

function remove(key) {
	try {
		window.localStorage.removeItem(key);
	} catch {
		// no-op
	}
}

// Adopts a pre-session token if one is lying around. Idempotent, and safe to
// call on every page load: once the unified key exists this does nothing.
export function adoptLegacyToken() {
	if (typeof window === 'undefined') return null;
	const current = read(TOKEN_KEY);
	if (current) return current;
	for (const key of LEGACY_TOKEN_KEYS) {
		const legacy = read(key);
		if (legacy) {
			write(TOKEN_KEY, legacy);
			return legacy;
		}
	}
	return null;
}

export function getToken() {
	if (typeof window === 'undefined') return null;
	return read(TOKEN_KEY) || adoptLegacyToken();
}

export function isSignedIn() {
	return Boolean(getToken());
}

// The GitHub login the token belongs to, remembered so the signed-in state
// can be shown without a round-trip on every page load. Cosmetic only —
// nothing is authorized on the strength of it.
export function getLogin() {
	if (typeof window === 'undefined') return null;
	return read(LOGIN_KEY);
}

export function signIn(token, login) {
	if (typeof window === 'undefined') return;
	write(TOKEN_KEY, token);
	if (login) write(LOGIN_KEY, login);
	notify();
}

// One session, so this signs out everywhere — including the pre-session keys,
// which would otherwise be re-adopted on the next load and quietly sign the
// device back in.
export function signOut() {
	if (typeof window === 'undefined') return;
	remove(TOKEN_KEY);
	remove(LOGIN_KEY);
	for (const key of LEGACY_TOKEN_KEYS) remove(key);
	notify();
}

// Verifies a token before it's stored, through this site's own endpoint
// rather than api.github.com directly: the work network blocks GitHub's API,
// and the composer already round-trips through Cloudflare for that reason
// (see functions/api/til/sync.js). Returns the GitHub login on success.
export async function verifyToken(token) {
	const res = await fetch('/api/auth-check', {
		headers: { authorization: `Bearer ${token}` },
	});
	let body = null;
	try {
		body = await res.json();
	} catch {
		// fall through to a generic message below
	}
	if (!res.ok) {
		throw new Error(body?.error || `Could not verify the token (${res.status})`);
	}
	if (!body?.canPush) {
		throw new Error('That token has no write access to the site repo — it needs Contents: read and write.');
	}
	return body.login || null;
}

// Verify-then-store, the whole sign-in in one call. Throws with a message
// worth showing if the token is rejected; nothing is stored unless it passed.
export async function signInWithToken(rawToken) {
	const token = String(rawToken || '').trim();
	if (!token) throw new Error('Paste a token first.');
	const login = await verifyToken(token);
	signIn(token, login);
	return login;
}

// --- Change notification ---
//
// Several islands can be on one page (a sign-in panel and whatever it gates),
// and a sign-in in one has to reach the others. `storage` covers other tabs;
// `notify` covers this one, since `storage` doesn't fire on the tab that
// wrote.

function notify() {
	for (const listener of listeners) {
		try {
			listener(getToken());
		} catch {
			// A broken listener shouldn't take the others down.
		}
	}
}

export function subscribe(listener) {
	if (typeof window === 'undefined') return () => {};
	listeners.add(listener);
	const onStorage = (event) => {
		if (event.key === null || event.key === TOKEN_KEY || LEGACY_TOKEN_KEYS.includes(event.key)) {
			listener(getToken());
		}
	};
	window.addEventListener('storage', onStorage);
	return () => {
		listeners.delete(listener);
		window.removeEventListener('storage', onStorage);
	};
}

// Where to mint one, linked from the sign-in panel. Contents read/write is
// the only permission any of this needs.
export const TOKEN_HELP_URL = 'https://github.com/settings/personal-access-tokens/new';
