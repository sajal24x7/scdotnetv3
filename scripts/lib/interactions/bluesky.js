/**
 * Bluesky backfeed collector.
 *
 * Uses the public AppView (public.api.bsky.app) which requires no
 * authentication at all — replies, likes, and reposts of public posts are
 * openly readable.
 */

import { fetchJson, makeEntry, plainTextToHtml } from './shared.js';

const APPVIEW = 'https://public.api.bsky.app/xrpc';
const MAX_CURSOR_PAGES = 3; // 100 items per page for likes/reposts
const MAX_THREAD_DEPTH = 10;

// handle → did, cached for the lifetime of the run (one post author usually).
const didCache = new Map();

/**
 * Parse a Bluesky syndication URL like
 * https://bsky.app/profile/sajalchoudhary.net/post/3mq7iuiuxez25
 * Returns { actor, rkey } or null.
 */
export function parseBlueskyUrl(url) {
  try {
    const parsed = new URL(url);
    if (!/(^|\.)bsky\.app$/.test(parsed.hostname)) return null;
    const match = parsed.pathname.match(/^\/profile\/([^/]+)\/post\/([^/]+)\/?$/);
    if (!match) return null;
    return { actor: match[1], rkey: match[2] };
  } catch {
    return null;
  }
}

async function resolveDid(actor, rateLimiter) {
  if (actor.startsWith('did:')) return actor;
  if (didCache.has(actor)) return didCache.get(actor);
  await rateLimiter.checkLimit();
  const { ok, status, data } = await fetchJson(
    `${APPVIEW}/com.atproto.identity.resolveHandle?handle=${encodeURIComponent(actor)}`
  );
  if (!ok) throw new Error(`Could not resolve Bluesky handle ${actor} (${status})`);
  didCache.set(actor, data.did);
  return data.did;
}

function profileToAuthor(profile) {
  return {
    name: profile.displayName || profile.handle,
    url: `https://bsky.app/profile/${profile.handle}`,
    avatar: profile.avatar,
  };
}

function postWebUrl(post) {
  const rkey = post.uri.split('/').pop();
  return `https://bsky.app/profile/${post.author.handle}/post/${rkey}`;
}

/** Flatten the reply tree under the root post into entries. */
function collectThreadReplies(node, entries) {
  for (const child of node?.replies ?? []) {
    // Blocked/not-found placeholders have no `post`.
    if (child?.post?.record) {
      entries.push(
        makeEntry({
          platform: 'bluesky',
          type: 'reply',
          nativeId: child.post.uri,
          author: profileToAuthor(child.post.author),
          content: plainTextToHtml(child.post.record.text),
          url: postWebUrl(child.post),
          published: child.post.record.createdAt || child.post.indexedAt,
        })
      );
    }
    collectThreadReplies(child, entries);
  }
}

async function fetchCursorPages(endpoint, params, itemsKey, rateLimiter) {
  const items = [];
  let cursor;
  for (let page = 0; page < MAX_CURSOR_PAGES; page++) {
    const query = new URLSearchParams({ ...params, limit: '100' });
    if (cursor) query.set('cursor', cursor);
    await rateLimiter.checkLimit();
    const { ok, status, data } = await fetchJson(`${APPVIEW}/${endpoint}?${query}`);
    if (!ok) {
      if (status === 400 || status === 404) return { gone: true, items };
      throw new Error(`Bluesky ${endpoint} returned ${status}`);
    }
    items.push(...(data?.[itemsKey] ?? []));
    cursor = data?.cursor;
    if (!cursor) break;
  }
  return { gone: false, items };
}

/**
 * Collect all interactions for one syndicated Bluesky post.
 * Returns { gone: boolean, entries: Entry[] }.
 */
export async function collectBlueskyInteractions({ actor, rkey }, rateLimiter) {
  const did = await resolveDid(actor, rateLimiter);
  const uri = `at://${did}/app.bsky.feed.post/${rkey}`;
  const entries = [];

  await rateLimiter.checkLimit();
  const thread = await fetchJson(
    `${APPVIEW}/app.bsky.feed.getPostThread?uri=${encodeURIComponent(uri)}&depth=${MAX_THREAD_DEPTH}`
  );
  if (!thread.ok) {
    // The AppView answers 400 NotFound for deleted posts.
    if (thread.status === 400 || thread.status === 404) return { gone: true, entries: [] };
    throw new Error(`Bluesky getPostThread returned ${thread.status}`);
  }
  if (thread.data?.thread?.$type === 'app.bsky.feed.defs#notFoundPost') {
    return { gone: true, entries: [] };
  }
  collectThreadReplies(thread.data?.thread, entries);

  const likes = await fetchCursorPages('app.bsky.feed.getLikes', { uri }, 'likes', rateLimiter);
  if (likes.gone) return { gone: true, entries: [] };
  for (const like of likes.items) {
    entries.push(
      makeEntry({
        platform: 'bluesky',
        type: 'like',
        nativeId: `${rkey}:${like.actor.did}`,
        author: profileToAuthor(like.actor),
        url: `https://bsky.app/profile/${like.actor.handle}`,
        published: like.createdAt || like.indexedAt,
      })
    );
  }

  const reposts = await fetchCursorPages(
    'app.bsky.feed.getRepostedBy',
    { uri },
    'repostedBy',
    rateLimiter
  );
  if (reposts.gone) return { gone: true, entries: [] };
  for (const profile of reposts.items) {
    entries.push(
      makeEntry({
        platform: 'bluesky',
        type: 'repost',
        nativeId: `${rkey}:${profile.did}`,
        author: profileToAuthor(profile),
        url: `https://bsky.app/profile/${profile.handle}`,
      })
    );
  }

  return { gone: false, entries };
}
