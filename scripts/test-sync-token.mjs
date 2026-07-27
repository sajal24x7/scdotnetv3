#!/usr/bin/env node
// Tests for the token resolution in src/components/learn/sync.ts.
//
// /practice, the authored-prompt commits, and the /write composer all want
// the same credential — a fine-grained GitHub PAT with Contents read/write on
// this repo — so they share one per device. The sharing has two edges that
// are easy to get wrong and unpleasant when wrong:
//
//   1. Disconnecting sync while running on the composer's token must actually
//      disconnect. A naive fallback hands the same token straight back and
//      the button appears broken.
//   2. Disconnecting sync must not log /write out. They're separate tools
//      that happen to share a credential; one is not the other's session.
//
// Run: node scripts/test-sync-token.mjs

import { readFileSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { transform } from 'esbuild';

const repoRoot = path.resolve(import.meta.dirname, '..');

// Minimal localStorage stand-in — the module only ever uses these three.
const store = new Map();
globalThis.window = {
	localStorage: {
		getItem: (k) => (store.has(k) ? store.get(k) : null),
		setItem: (k, v) => store.set(k, String(v)),
		removeItem: (k) => store.delete(k),
	},
};

async function loadTsModule(relPath) {
	const abs = path.join(repoRoot, relPath);
	const { code } = await transform(readFileSync(abs, 'utf8'), { loader: 'ts', format: 'esm' });
	const dir = mkdtempSync(path.join(tmpdir(), 'sync-test-'));
	const tmpFile = path.join(dir, 'module.mjs');
	writeFileSync(tmpFile, code);
	return import(pathToFileURL(tmpFile).href);
}

const sync = await loadTsModule('src/components/learn/sync.ts');
const { COMPOSER_TOKEN_KEY, SYNC_TOKEN_KEY } = sync;

let failures = 0;
function eq(name, actual, expected) {
	if (JSON.stringify(actual) === JSON.stringify(expected)) {
		console.log(`✓ ${name}`);
		return;
	}
	failures++;
	console.error(`✗ ${name}\n    expected: ${JSON.stringify(expected)}\n    actual:   ${JSON.stringify(actual)}`);
}
function reset(entries = {}) {
	store.clear();
	for (const [k, v] of Object.entries(entries)) store.set(k, v);
}

reset();
eq('no tokens anywhere means not connected', sync.loadSyncToken(), null);
eq('and no composer shortcut to offer', sync.composerTokenAvailable(), false);

reset({ [SYNC_TOKEN_KEY]: 'own-token' });
eq('its own token is used', sync.loadSyncTokenInfo(), { token: 'own-token', source: 'practice' });

reset({ [COMPOSER_TOKEN_KEY]: 'write-token' });
eq('the composer token is picked up when there is no other', sync.loadSyncTokenInfo(), {
	token: 'write-token',
	source: 'composer',
});
eq('and the shortcut is offered', sync.composerTokenAvailable(), true);

reset({ [SYNC_TOKEN_KEY]: 'own-token', [COMPOSER_TOKEN_KEY]: 'write-token' });
eq('its own token wins over the composer’s', sync.loadSyncToken(), 'own-token');

// Edge 1: disconnect has to stick even though the fallback still sees a token.
reset({ [COMPOSER_TOKEN_KEY]: 'write-token' });
sync.clearSyncToken();
eq('disconnecting while on the composer token actually disconnects', sync.loadSyncToken(), null);
// Edge 2: /write must still be signed in afterwards.
eq('disconnecting leaves the composer token alone', store.get(COMPOSER_TOKEN_KEY), 'write-token');
eq('and the shortcut is still offered to reconnect', sync.composerTokenAvailable(), true);

eq('the shortcut reconnects', sync.useComposerToken(), 'write-token');
eq('and sync is live again', sync.loadSyncTokenInfo(), { token: 'write-token', source: 'composer' });
eq('without copying the token into our own key', store.has(SYNC_TOKEN_KEY), false);

// Pasting an explicit token also clears a previous opt-out.
reset({ [COMPOSER_TOKEN_KEY]: 'write-token' });
sync.clearSyncToken();
sync.saveSyncToken('pasted-token');
eq('a pasted token reconnects and takes precedence', sync.loadSyncTokenInfo(), {
	token: 'pasted-token',
	source: 'practice',
});

// Disconnecting an explicitly pasted token falls back to the composer's,
// which is the intended behaviour: the device is still authorized, and the
// opt-out only suppresses the fallback when there's nothing else.
reset({ [SYNC_TOKEN_KEY]: 'pasted-token', [COMPOSER_TOKEN_KEY]: 'write-token' });
sync.clearSyncToken();
eq('disconnecting suppresses the composer fallback too', sync.loadSyncToken(), null);

if (failures > 0) {
	console.error(`\n${failures} assertion(s) failed`);
	process.exitCode = 1;
} else {
	console.log('\nAll sync-token tests passed.');
}
