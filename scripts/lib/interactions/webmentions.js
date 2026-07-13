/**
 * Webmention drain + moderation for the interactions collector.
 *
 * functions/api/webmention.js verifies incoming webmentions and parks them
 * in a Cloudflare KV namespace as `pending:{hash}` records. This module
 * drains those records through the Cloudflare REST API and merges them into
 * the interactions index behind a moderation gate:
 *
 *   - source domain on approvedWebmentionDomains → status "approved"
 *   - source domain on blockedWebmentionDomains  → dropped, and any
 *     previously merged entries from that domain are purged
 *   - everything else → status "pending" (invisible on the site); the
 *     refresh-interactions workflow surfaces these in a GitHub issue
 *
 * Hand edits to the index outlive refreshes: a re-received mention keeps a
 * manually flipped status unless its domain has since been allowlisted.
 *
 * Environment (all three required to enable the drain):
 *   CLOUDFLARE_API_TOKEN          KV read/write scope
 *   CLOUDFLARE_ACCOUNT_ID
 *   WEBMENTIONS_KV_NAMESPACE_ID   the namespace bound as WEBMENTIONS on Pages
 */

import { makeEntry, plainTextToHtml, toIsoTimestamp, sortEntries } from './shared.js';

const API_BASE = 'https://api.cloudflare.com/client/v4';
const KEY_PREFIX = 'pending:';
const ENTRY_TYPES = new Set(['reply', 'like', 'repost', 'mention']);

export function webmentionsConfig() {
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const namespaceId = process.env.WEBMENTIONS_KV_NAMESPACE_ID;
  if (!apiToken || !accountId || !namespaceId) return null;
  return { apiToken, accountId, namespaceId };
}

const namespaceUrl = ({ accountId, namespaceId }) =>
  `${API_BASE}/accounts/${accountId}/storage/kv/namespaces/${namespaceId}`;

const authHeaders = ({ apiToken }) => ({ authorization: `Bearer ${apiToken}` });

/**
 * Read every pending webmention record out of KV. Returns
 * [{ key, record }] — record is null for values that fail to parse, so the
 * caller still deletes the garbage key after the run.
 */
export async function drainPendingWebmentions(config) {
  const keys = [];
  let cursor = '';
  do {
    const url =
      `${namespaceUrl(config)}/keys?limit=1000&prefix=${encodeURIComponent(KEY_PREFIX)}` +
      (cursor ? `&cursor=${encodeURIComponent(cursor)}` : '');
    const response = await fetch(url, { headers: authHeaders(config) });
    if (!response.ok) throw new Error(`KV key listing failed (${response.status})`);
    const data = await response.json();
    for (const item of data.result ?? []) keys.push(item.name);
    cursor = data.result_info?.cursor || '';
  } while (cursor);

  const mentions = [];
  for (const key of keys) {
    const response = await fetch(`${namespaceUrl(config)}/values/${encodeURIComponent(key)}`, {
      headers: authHeaders(config),
    });
    if (response.status === 404) continue; // deleted between list and read
    if (!response.ok) throw new Error(`KV read of ${key} failed (${response.status})`);
    let record = null;
    try {
      record = await response.json();
    } catch {
      // Unparseable value — return it with record null so the key still gets cleaned up.
    }
    mentions.push({ key, record });
  }
  return mentions;
}

/** Delete drained keys so the next run starts from an empty queue. */
export async function deleteWebmentionKeys(config, keys) {
  if (keys.length === 0) return;
  const response = await fetch(`${namespaceUrl(config)}/bulk`, {
    method: 'DELETE',
    headers: { ...authHeaders(config), 'content-type': 'application/json' },
    body: JSON.stringify(keys),
  });
  if (!response.ok) throw new Error(`KV bulk delete failed (${response.status})`);
}

const domainOf = (url) => {
  try {
    return new URL(url).hostname.replace(/^www\./, '').toLowerCase();
  } catch {
    return null;
  }
};

const normalizeDomain = (domain) => String(domain).replace(/^www\./, '').toLowerCase();

const isThisMention = (entry, hash) => entry.platform === 'web' && entry.id.endsWith(`:${hash}`);

/**
 * Merge drained webmention records into the index (mutated in place).
 * Also sweeps previously merged web entries whose source domain has been
 * blocklisted since. Returns { added, updated, removed, pending } where
 * pending counts all pending web entries left in the index.
 */
export function mergeWebmentionsIntoIndex(index, mentions, config) {
  const approved = new Set((config.approvedWebmentionDomains ?? []).map(normalizeDomain));
  const blocked = new Set((config.blockedWebmentionDomains ?? []).map(normalizeDomain));
  const stats = { added: 0, updated: 0, removed: 0, pending: 0 };

  if (blocked.size > 0) {
    for (const key of Object.keys(index)) {
      const kept = index[key].filter(
        (entry) => !(entry.platform === 'web' && blocked.has(domainOf(entry.url) ?? ''))
      );
      stats.removed += index[key].length - kept.length;
      index[key] = kept;
    }
  }

  for (const { key, record } of mentions) {
    if (!record) continue;
    const hash = key.slice(KEY_PREFIX.length);
    const targetKey = String(record.targetPath ?? '').replace(/^\/+|\/+$/g, '');
    if (!targetKey || !hash) continue;

    const entries = index[targetKey] ?? [];
    const previous = entries.find((entry) => isThisMention(entry, hash));
    const withoutThis = entries.filter((entry) => !isThisMention(entry, hash));

    const domain = domainOf(record.source);
    if (record.status === 'deleted' || !domain || blocked.has(domain)) {
      if (previous) {
        stats.removed++;
        index[targetKey] = withoutThis;
      }
      continue;
    }

    const entry = makeEntry({
      platform: 'web',
      type: ENTRY_TYPES.has(record.type) ? record.type : 'mention',
      nativeId: hash,
      author: record.author,
      // The endpoint stores a plain-text excerpt; this is where it becomes
      // the sanitized HTML the index holds.
      content: plainTextToHtml(record.content),
      url: record.source,
      published: toIsoTimestamp(record.published) ?? toIsoTimestamp(record.received),
    });
    entry.status = approved.has(domain) ? 'approved' : previous?.status ?? 'pending';

    index[targetKey] = sortEntries([...withoutThis, entry]);
    previous ? stats.updated++ : stats.added++;
  }

  for (const entries of Object.values(index)) {
    for (const entry of entries) {
      if (entry.platform === 'web' && entry.status === 'pending') stats.pending++;
    }
  }
  return stats;
}
