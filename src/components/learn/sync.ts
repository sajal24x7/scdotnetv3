// Thin client for the opt-in cross-device sync blob (functions/api/practice-state.js),
// plus the token plumbing every PAT-authenticated call in the learning system
// shares. Used by PracticeSession (which layers status UI and debouncing on
// top), the learn-side intro flows (pull-merge on load, fire-and-forget push
// after an introduction/skip), and authoredPrompts.ts (which posts the
// prompts you write to functions/api/practice-prompts.js).
//
// All three want the same credential — a fine-grained GitHub PAT with
// Contents read/write on this repo — which is also exactly what the /write
// composer asks for. So it's one token per device, not one per feature: see
// loadSyncTokenInfo below for how the composer's key is picked up.

import type { PracticeMeta } from './engine';

export const SYNC_TOKEN_KEY = 'practice-sync-token';
export const SYNC_LAST_KEY = 'practice-sync-last';

// The /write composer (public/write/index.html) stores its own fine-grained
// PAT here, on this same origin. It needs exactly what /practice needs —
// Contents read/write on this repo — so a device set up for writing is
// already set up for syncing, and asking for a second token would be asking
// for the same token twice. `/practice` reads the composer's key as a
// fallback rather than adopting it: the two pages own their own keys, and a
// disconnect here must never log the composer out.
export const COMPOSER_TOKEN_KEY = 'microwrite.token';

// Set when sync is explicitly disconnected while the only token available is
// the composer's. Without it, "Disconnect this device" would silently do
// nothing — the fallback would hand the same token straight back.
export const SYNC_OPTOUT_KEY = 'practice-sync-optout';

export type TokenSource = 'practice' | 'composer';

export interface SyncTokenInfo {
	token: string;
	source: TokenSource;
}

export function loadSyncTokenInfo(): SyncTokenInfo | null {
	if (typeof window === 'undefined') return null;
	const own = window.localStorage.getItem(SYNC_TOKEN_KEY);
	if (own) return { token: own, source: 'practice' };
	if (window.localStorage.getItem(SYNC_OPTOUT_KEY) === '1') return null;
	const composer = window.localStorage.getItem(COMPOSER_TOKEN_KEY);
	return composer ? { token: composer, source: 'composer' } : null;
}

export function loadSyncToken(): string | null {
	return loadSyncTokenInfo()?.token ?? null;
}

// True when there's a composer token to fall back on but sync isn't using it
// — the state behind the "Use the token from /write" shortcut.
export function composerTokenAvailable(): boolean {
	if (typeof window === 'undefined') return false;
	return Boolean(window.localStorage.getItem(COMPOSER_TOKEN_KEY));
}

export function saveSyncToken(token: string) {
	if (typeof window === 'undefined') return;
	window.localStorage.setItem(SYNC_TOKEN_KEY, token);
	window.localStorage.removeItem(SYNC_OPTOUT_KEY);
}

// Adopts whatever the composer has, without copying it: the fallback does the
// work, and clearing the opt-out is all that's needed to re-enable it.
export function useComposerToken(): string | null {
	if (typeof window === 'undefined') return null;
	const composer = window.localStorage.getItem(COMPOSER_TOKEN_KEY);
	if (!composer) return null;
	window.localStorage.removeItem(SYNC_OPTOUT_KEY);
	return composer;
}

// Disconnects sync only. The composer's token is left exactly where it is —
// /write is a different tool that happens to share a credential, and turning
// off sync must not break posting.
export function clearSyncToken() {
	if (typeof window === 'undefined') return;
	window.localStorage.removeItem(SYNC_TOKEN_KEY);
	window.localStorage.setItem(SYNC_OPTOUT_KEY, '1');
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
