#!/usr/bin/env node

/**
 * Applies a `/approve <domain>` or `/deny <domain>` (alias `/block`) command
 * from a comment on the "Webmentions pending moderation" issue: updates the
 * allow/block lists in interactions.config.json and, in the same pass,
 * flips (approve) or purges (deny) matching "web" platform entries in
 * src/data/interactions-index.json. Invoked by
 * .github/workflows/webmention-moderation.yml.
 *
 * Environment:
 *   COMMENT_BODY   the triggering issue comment body (required)
 *   GITHUB_OUTPUT  step outputs file; written to when present
 */

import fs from 'fs';
import path from 'path';
import { domainOf, normalizeDomain } from './lib/interactions/webmentions.js';

const CONFIG_FILE = path.join(process.cwd(), 'interactions.config.json');
const INDEX_FILE = path.join(process.cwd(), 'src', 'data', 'interactions-index.json');

function setOutput(name, value) {
  if (!process.env.GITHUB_OUTPUT) return;
  fs.appendFileSync(process.env.GITHUB_OUTPUT, `${name}<<MODERATE_EOF\n${value}\nMODERATE_EOF\n`);
}

function fail(message) {
  console.error(message);
  setOutput('ok', 'false');
  setOutput('message', message);
  process.exit(1);
}

const body = process.env.COMMENT_BODY ?? '';
const match = body.match(/^\/(approve|deny|block)\s+`?([^\s`]+)`?/im);
if (!match) {
  fail("Couldn't find a command. Use `/approve <domain>` or `/deny <domain>`, e.g. `/approve example.com`.");
}

const action = match[1].toLowerCase() === 'approve' ? 'approve' : 'block';
const rawDomain = match[2].replace(/^https?:\/\//i, '').replace(/\/.*$/, '');
const domain = normalizeDomain(rawDomain);
if (!domain) fail('No domain found in the command.');

const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
const index = JSON.parse(fs.readFileSync(INDEX_FILE, 'utf-8'));

config.approvedWebmentionDomains ??= [];
config.blockedWebmentionDomains ??= [];

let affected = 0;

if (action === 'approve') {
  config.blockedWebmentionDomains = config.blockedWebmentionDomains.filter((d) => normalizeDomain(d) !== domain);
  if (!config.approvedWebmentionDomains.some((d) => normalizeDomain(d) === domain)) {
    config.approvedWebmentionDomains.push(domain);
  }
  for (const key of Object.keys(index)) {
    if (key === '_meta' || !Array.isArray(index[key])) continue;
    for (const entry of index[key]) {
      if (entry.platform === 'web' && entry.status === 'pending' && domainOf(entry.url) === domain) {
        entry.status = 'approved';
        affected++;
      }
    }
  }
} else {
  config.approvedWebmentionDomains = config.approvedWebmentionDomains.filter((d) => normalizeDomain(d) !== domain);
  if (!config.blockedWebmentionDomains.some((d) => normalizeDomain(d) === domain)) {
    config.blockedWebmentionDomains.push(domain);
  }
  for (const key of Object.keys(index)) {
    if (key === '_meta' || !Array.isArray(index[key])) continue;
    const before = index[key].length;
    index[key] = index[key].filter((entry) => !(entry.platform === 'web' && domainOf(entry.url) === domain));
    affected += before - index[key].length;
  }
}

fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2) + '\n');
fs.writeFileSync(INDEX_FILE, JSON.stringify(index, null, 2) + '\n');

const message =
  action === 'approve'
    ? `Approved \`${domain}\` — added to \`approvedWebmentionDomains\`, ${affected} pending webmention(s) now approved.`
    : `Blocked \`${domain}\` — added to \`blockedWebmentionDomains\`, ${affected} ${affected === 1 ? 'entry' : 'entries'} purged.`;

console.log(message);
setOutput('ok', 'true');
setOutput('action', action);
setOutput('domain', domain);
setOutput('affected', String(affected));
setOutput('message', message);
