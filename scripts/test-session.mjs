#!/usr/bin/env node
// Tests for the site's shared sign-in session (public/auth/session.js).
//
// Several surfaces can write to the repo — /write, and sync plus authored
// prompts on /practice — and they now share one token. Two properties of that
// sharing are worth pinning down, because both are silent when wrong:
//
//   1. A browser already signed in to /write must stay signed in. The login
//      moved; that is not a reason to make anyone paste a token again.
//   2. Signing out must actually sign out. One session means clearing the
//      pre-session keys too, or the next page load quietly adopts one of them
//      and signs the device back in.
//
// Run: node scripts/test-session.mjs

const store = new Map();
globalThis.window = {
	localStorage: {
		getItem: (k) => (store.has(k) ? store.get(k) : null),
		setItem: (k, v) => store.set(k, String(v)),
		removeItem: (k) => store.delete(k),
	},
	addEventListener: () => {},
	removeEventListener: () => {},
};

const session = await import('../public/auth/session.js');
const { TOKEN_KEY, LOGIN_KEY, LEGACY_TOKEN_KEYS } = session;
const [COMPOSER_KEY, PRACTICE_KEY] = LEGACY_TOKEN_KEYS;

let failures = 0;
function eq(name, actual, expected) {
	if (JSON.stringify(actual) === JSON.stringify(expected)) {
		console.log(`✓ ${name}`);
		return;
	}
	failures++;
	console.error(`✗ ${name}\n    expected: ${JSON.stringify(expected)}\n    actual:   ${JSON.stringify(actual)}`);
}
const reset = (entries = {}) => {
	store.clear();
	for (const [k, v] of Object.entries(entries)) store.set(k, v);
};

reset();
eq('a fresh browser is signed out', session.getToken(), null);
eq('and reports so', session.isSignedIn(), false);

// Property 1: existing logins survive the move.
reset({ [COMPOSER_KEY]: 'write-token' });
eq('a browser signed in to /write is already signed in', session.getToken(), 'write-token');
eq('and the token is adopted into the shared key', store.get(TOKEN_KEY), 'write-token');

reset({ [PRACTICE_KEY]: 'sync-token' });
eq('a browser connected on /practice is already signed in', session.getToken(), 'sync-token');

// The composer's key wins when both exist — it's the older, more likely one.
reset({ [COMPOSER_KEY]: 'write-token', [PRACTICE_KEY]: 'sync-token' });
eq('the composer key takes precedence', session.getToken(), 'write-token');

reset({ [TOKEN_KEY]: 'current', [COMPOSER_KEY]: 'stale' });
eq('the shared key wins once it exists', session.getToken(), 'current');

// Adoption must not keep re-running or overwrite a newer token.
reset({ [TOKEN_KEY]: 'current', [COMPOSER_KEY]: 'stale' });
session.adoptLegacyToken();
session.adoptLegacyToken();
eq('adoption is idempotent and never clobbers', store.get(TOKEN_KEY), 'current');

// Property 2: sign-out is total.
reset({ [COMPOSER_KEY]: 'write-token', [PRACTICE_KEY]: 'sync-token' });
session.getToken(); // adopt, as a page load would
session.signOut();
eq('signing out clears the shared key', store.has(TOKEN_KEY), false);
eq('and every pre-session key with it', [store.has(COMPOSER_KEY), store.has(PRACTICE_KEY)], [false, false]);
eq('so a reload does not sign back in', session.getToken(), null);

reset();
session.signIn('fresh-token', 'sajal24x7');
eq('signing in stores the token', session.getToken(), 'fresh-token');
eq('and remembers the account for display', session.getLogin(), 'sajal24x7');
session.signOut();
eq('signing out forgets the account too', store.has(LOGIN_KEY), false);

// Listeners drive the cross-island re-render on /practice, so a sign-in that
// doesn't notify leaves the page looking signed out.
reset();
let seen = [];
const unsubscribe = session.subscribe((t) => seen.push(t));
session.signIn('tok', 'me');
session.signOut();
unsubscribe();
session.signIn('after-unsubscribe', null);
eq('subscribers see sign-in and sign-out, and nothing after unsubscribing', seen, ['tok', null]);

if (failures > 0) {
	console.error(`\n${failures} assertion(s) failed`);
	process.exitCode = 1;
} else {
	console.log('\nAll session tests passed.');
}
