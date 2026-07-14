#!/usr/bin/env node

/**
 * Prints the current webmention-moderation issue state as JSON
 * ({ pending, body }) so github-script steps (which run CommonJS and can't
 * import project ESM modules directly) can shell out to it instead of
 * duplicating the pending/body logic inline.
 */

import fs from 'fs';
import { findPendingWebmentions, buildModerationIssueBody } from './lib/interactions/moderation-issue.js';

let index = {};
try {
  index = JSON.parse(fs.readFileSync('src/data/interactions-index.json', 'utf-8'));
} catch {
  // No index yet — nothing pending.
}

const pending = findPendingWebmentions(index);
process.stdout.write(JSON.stringify({ pending, body: buildModerationIssueBody(pending) }));
