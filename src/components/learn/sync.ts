// Thin client for the opt-in cross-device sync blob (functions/api/practice-state.js).
// Used by PracticeSession (which layers status UI and debouncing on top) and
// the learn-side intro flows (pull-merge on load, fire-and-forget push after
// an introduction/skip).
//
// The token is no longer this module's business: every write-capable surface
// on the site shares one sign-in (public/auth/session.js, surfaced by
// src/components/auth/SignIn.tsx), and `loadSyncToken` is now just a named
// read of it. Signed in means sync is on; there's no separate connect step
// and no second token to paste.

import { getToken } from '../auth/session';
import type { PracticeMeta } from './engine';

export const SYNC_LAST_KEY = 'practice-sync-last';

export function loadSyncToken(): string | null {
	return getToken();
}

export async function pullBlob(token: string): Promise<Record<string, unknown> | null> {
	const res = await fetch('/api/practice-state', { headers: { authorization: `Bearer ${token}` } });
	if (!res.ok) throw new Error(`sync GET ${res.status}`);
	const { blob } = await res.json();
	return blob && typeof blob === 'object' ? blob : null;
}

// Reads each deck's current blob straight from localStorage (never from
// React state, which can be one render behind) and PUTs the lot. The PUT
// replaces the remote blob wholesale, so this always starts from the current
// remote blob and overlays the given keys — a push from a page that only
// knows about one deck (a /learn/<topic> introduction) must not wipe the
// other decks' remote state.
export async function pushBlobFromLocalStorage(storageKeys: string[], meta: PracticeMeta, token: string): Promise<void> {
	let blob: Record<string, unknown> = {};
	try {
		blob = (await pullBlob(token)) ?? {};
	} catch {
		// If the read fails the write would too — but push what we have anyway;
		// worst case the PUT fails with the same error.
	}
	for (const key of storageKeys) {
		const raw = window.localStorage.getItem(key);
		if (raw) blob[key] = JSON.parse(raw);
	}
	blob['practice-meta'] = meta;
	const res = await fetch('/api/practice-state', {
		method: 'PUT',
		headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
		body: JSON.stringify(blob),
	});
	if (!res.ok) throw new Error(`sync PUT ${res.status}`);
	window.localStorage.setItem(SYNC_LAST_KEY, new Date().toISOString());
}
