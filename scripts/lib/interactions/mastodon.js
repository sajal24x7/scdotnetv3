/**
 * Mastodon backfeed collector.
 *
 * Reads replies, favourites, and boosts for a syndicated status using the
 * instance's public API. Works unauthenticated; MASTODON_ACCESS_TOKEN is
 * sent when present for friendlier rate limits.
 */

import { fetchJson, makeEntry, sanitizeInteractionHtml } from './shared.js';

// How many pages of favourited_by / reblogged_by to follow (40 accounts per
// page). A personal site rarely needs more than the first page.
const MAX_ACCOUNT_PAGES = 3;

/**
 * Parse a Mastodon syndication URL like
 * https://mastodon.social/@sajal24x7/116889719847616464
 * Returns { instance, statusId } or null when the URL isn't Mastodon-shaped.
 */
export function parseMastodonUrl(url) {
  try {
    const parsed = new URL(url);
    const match = parsed.pathname.match(/^\/@[^/]+\/(\d+)\/?$/);
    if (!match) return null;
    // Status ids are snowflakes (long digit strings); the same path shape on
    // non-Mastodon hosts is unlikely, but require a mastodon-ish host or a
    // long id to be safe.
    if (!parsed.hostname.includes('mastodon') && match[1].length < 10) return null;
    return { instance: parsed.origin, statusId: match[1] };
  } catch {
    return null;
  }
}

function authHeaders() {
  const token = process.env.MASTODON_ACCESS_TOKEN;
  return token ? { authorization: `Bearer ${token}` } : {};
}

function accountToAuthor(account) {
  return {
    name: account.display_name || account.username || account.acct,
    url: account.url,
    avatar: account.avatar_static || account.avatar,
  };
}

/** Follow RFC 5988 Link headers for paginated account lists. */
async function fetchAccountPages(firstUrl, rateLimiter) {
  const accounts = [];
  let nextUrl = firstUrl;
  for (let page = 0; page < MAX_ACCOUNT_PAGES && nextUrl; page++) {
    await rateLimiter.checkLimit();
    const { ok, status, data, headers } = await fetchJson(nextUrl, { headers: authHeaders() });
    if (!ok) {
      if (status === 404) return { gone: true, accounts };
      throw new Error(`Mastodon ${nextUrl} returned ${status}`);
    }
    accounts.push(...(Array.isArray(data) ? data : []));
    const link = headers.get('link') || '';
    const nextMatch = link.match(/<([^>]+)>;\s*rel="next"/);
    nextUrl = nextMatch ? nextMatch[1] : null;
  }
  return { gone: false, accounts };
}

/**
 * Collect all interactions for one syndicated Mastodon status.
 * Returns { gone: boolean, entries: Entry[] }.
 */
export async function collectMastodonInteractions({ instance, statusId }, rateLimiter) {
  const base = `${instance}/api/v1/statuses/${statusId}`;
  const entries = [];

  // Replies: every descendant in the conversation under the status.
  await rateLimiter.checkLimit();
  const context = await fetchJson(`${base}/context`, { headers: authHeaders() });
  if (!context.ok) {
    if (context.status === 404) return { gone: true, entries: [] };
    throw new Error(`Mastodon context for ${statusId} returned ${context.status}`);
  }
  for (const status of context.data?.descendants ?? []) {
    entries.push(
      makeEntry({
        platform: 'mastodon',
        type: 'reply',
        nativeId: status.id,
        author: accountToAuthor(status.account),
        content: sanitizeInteractionHtml(status.content),
        url: status.url || status.uri,
        published: status.created_at,
      })
    );
  }

  const favourites = await fetchAccountPages(`${base}/favourited_by?limit=80`, rateLimiter);
  if (favourites.gone) return { gone: true, entries: [] };
  for (const account of favourites.accounts) {
    entries.push(
      makeEntry({
        platform: 'mastodon',
        type: 'like',
        nativeId: `${statusId}:${account.id}`,
        author: accountToAuthor(account),
        url: account.url,
      })
    );
  }

  const boosts = await fetchAccountPages(`${base}/reblogged_by?limit=80`, rateLimiter);
  if (boosts.gone) return { gone: true, entries: [] };
  for (const account of boosts.accounts) {
    entries.push(
      makeEntry({
        platform: 'mastodon',
        type: 'repost',
        nativeId: `${statusId}:${account.id}`,
        author: accountToAuthor(account),
        url: account.url,
      })
    );
  }

  return { gone: false, entries };
}
