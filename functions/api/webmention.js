// Cloudflare Pages Function: POST /api/webmention
//
// Receiving endpoint for webmentions (https://www.w3.org/TR/webmention/),
// advertised via <link rel="webmention"> in Layout.astro. Verification is
// synchronous — the spec allows async, but volume on a personal site is tiny:
// the source document is fetched with a timeout and a 1 MB cap and must link
// to the target. Verified mentions are parsed into a minimal h-entry and
// stored in the WEBMENTIONS KV namespace (Pages project → Settings →
// Bindings) keyed `pending:{sha256(source + "\n" + target)}`, so a re-sent
// webmention overwrites its previous record (spec-compliant update). The
// scheduled refresh-interactions workflow drains these records into
// src/data/interactions-index.json behind a moderation gate
// (scripts/lib/interactions/webmentions.js).
//
// Only plain text ever leaves this function: the content excerpt is the
// text of the source's e-content, never its HTML, so unsanitized third-party
// markup can't reach KV or the index.

const SITE_HOSTS = new Set(['sajalchoudhary.net', 'www.sajalchoudhary.net']);
const CANONICAL_ORIGIN = 'https://sajalchoudhary.net';
const MAX_SOURCE_BYTES = 1024 * 1024;
const FETCH_TIMEOUT_MS = 10_000;
const MAX_MENTIONS_PER_IP_PER_HOUR = 24;
const EXCERPT_CHARS = 500;

const json = (status, body) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });

/**
 * Normalize a URL for link comparison: resolve against a base, drop the
 * fragment and the http/https distinction, trim trailing slashes, lowercase
 * the host. Returns null for anything that isn't http(s).
 */
function normalizeUrl(input, base) {
  let url;
  try {
    url = new URL(input, base);
  } catch {
    return null;
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
  const path = url.pathname.replace(/\/+$/, '') || '/';
  return `${url.host.toLowerCase()}${path}${url.search}`;
}

async function sha256Hex(text) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Fetch the source document. Returns { gone } for 404/410 (a deletion per
 * the spec), { error } for other failures, { html, finalUrl } on success.
 * Bodies over the cap are truncated, not rejected — the link back to the
 * target is overwhelmingly in the first megabyte.
 */
async function fetchSource(sourceUrl) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    let response;
    try {
      response = await fetch(sourceUrl, {
        redirect: 'follow',
        signal: controller.signal,
        headers: {
          accept: 'text/html;q=1.0,*/*;q=0.5',
          'user-agent': 'sajalchoudhary.net-webmention/1.0 (+https://sajalchoudhary.net)',
        },
      });
    } catch {
      return { error: 'Source could not be fetched' };
    }

    if (response.status === 404 || response.status === 410) return { gone: true };
    if (!response.ok) return { error: `Source returned ${response.status}` };

    const reader = response.body.getReader();
    const chunks = [];
    let total = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      total += value.byteLength;
      if (total >= MAX_SOURCE_BYTES) {
        await reader.cancel();
        break;
      }
    }
    const bytes = new Uint8Array(total);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.byteLength;
    }
    return { html: new TextDecoder('utf-8').decode(bytes), finalUrl: response.url || sourceUrl };
  } finally {
    clearTimeout(timer);
  }
}

const collapseWhitespace = (text) => text.replace(/\s+/g, ' ').trim();

/**
 * Scan the source HTML for a link to the target and extract a minimal
 * h-entry: interaction type from the microformats class on the linking
 * anchor, author from .p-author, excerpt from the text of .e-content.
 */
async function extractMention(html, target, baseUrl) {
  const normalizedTarget = normalizeUrl(target);
  const found = {
    linksToTarget: false,
    type: 'mention',
    authorName: '',
    authorUrl: '',
    authorPhoto: '',
    content: '',
    published: '',
    title: '',
  };

  const resolve = (href) => {
    try {
      return new URL(href, baseUrl).toString();
    } catch {
      return '';
    }
  };

  const rewriter = new HTMLRewriter()
    .on('a[href], link[href]', {
      element(el) {
        const href = el.getAttribute('href');
        if (!href || normalizeUrl(href, baseUrl) !== normalizedTarget) return;
        found.linksToTarget = true;
        const cls = el.getAttribute('class') || '';
        if (/\bu-in-reply-to\b/.test(cls)) found.type = 'reply';
        else if (/\bu-like-of\b/.test(cls)) found.type = 'like';
        else if (/\bu-repost-of\b/.test(cls)) found.type = 'repost';
      },
    })
    .on('title', {
      text(chunk) {
        if (found.title.length < 200) found.title += chunk.text;
      },
    })
    .on('.h-entry .e-content', {
      text(chunk) {
        if (found.content.length < EXCERPT_CHARS * 3) {
          found.content += chunk.text;
          // Keep text from adjacent block elements from running together;
          // collapseWhitespace tidies the extras.
          if (chunk.lastInTextNode) found.content += ' ';
        }
      },
    })
    .on('.h-entry .dt-published[datetime]', {
      element(el) {
        if (!found.published) found.published = el.getAttribute('datetime') || '';
      },
    })
    .on('.h-entry .p-author', {
      element(el) {
        if (el.tagName === 'a' && !found.authorUrl) found.authorUrl = resolve(el.getAttribute('href'));
      },
      text(chunk) {
        if (found.authorName.length < 200) found.authorName += chunk.text;
      },
    })
    .on('.h-entry .p-author .u-url[href]', {
      element(el) {
        if (!found.authorUrl) found.authorUrl = resolve(el.getAttribute('href'));
      },
    })
    .on('.h-entry .p-author img[src]', {
      element(el) {
        if (!found.authorPhoto) found.authorPhoto = resolve(el.getAttribute('src'));
        if (!found.authorName) found.authorName = el.getAttribute('alt') || '';
      },
    });

  // HTMLRewriter is lazy — consume the output to drive the handlers.
  await rewriter.transform(new Response(html)).arrayBuffer();

  return found;
}

async function rateLimited(env, request) {
  const ip = request.headers.get('cf-connecting-ip') || 'unknown';
  const hour = new Date().toISOString().slice(0, 13);
  const key = `ratelimit:${ip}:${hour}`;
  // Read-then-write is racy but plenty for coarse abuse control.
  const count = Number((await env.WEBMENTIONS.get(key)) || '0');
  if (count >= MAX_MENTIONS_PER_IP_PER_HOUR) return true;
  await env.WEBMENTIONS.put(key, String(count + 1), { expirationTtl: 2 * 60 * 60 });
  return false;
}

export async function onRequestGet() {
  return json(405, {
    error: 'This is a webmention endpoint — POST form-encoded source and target here',
    spec: 'https://www.w3.org/TR/webmention/',
  });
}

export async function onRequestPost({ request, env }) {
  if (!env.WEBMENTIONS) {
    return json(500, { error: 'WEBMENTIONS KV binding is not configured on the Pages project' });
  }

  let form;
  try {
    form = await request.formData();
  } catch {
    return json(400, { error: 'Expected form-encoded body with source and target' });
  }
  const source = String(form.get('source') || '').trim();
  const target = String(form.get('target') || '').trim();
  if (!source || !target) return json(400, { error: 'Both source and target are required' });

  let sourceUrl;
  let targetUrl;
  try {
    sourceUrl = new URL(source);
    targetUrl = new URL(target);
  } catch {
    return json(400, { error: 'source and target must be valid URLs' });
  }
  if (!/^https?:$/.test(sourceUrl.protocol) || !/^https?:$/.test(targetUrl.protocol)) {
    return json(400, { error: 'source and target must be http(s) URLs' });
  }
  if (!SITE_HOSTS.has(targetUrl.hostname.toLowerCase())) {
    return json(400, { error: 'target is not on this site' });
  }
  if (targetUrl.pathname.startsWith('/api/')) {
    return json(400, { error: 'target does not accept webmentions' });
  }
  if (normalizeUrl(source) === normalizeUrl(target)) {
    return json(400, { error: 'source and target must be different' });
  }

  if (await rateLimited(env, request)) {
    return json(429, { error: 'Too many webmentions from this address, try again later' });
  }

  // The target page must actually exist — cheap HEAD against the site.
  const canonicalTarget = `${CANONICAL_ORIGIN}${targetUrl.pathname}`;
  const head = await fetch(canonicalTarget, { method: 'HEAD', redirect: 'follow' });
  if (!head.ok) return json(400, { error: 'target does not exist on this site' });

  const hash = await sha256Hex(`${source}\n${target}`);
  const key = `pending:${hash}`;
  const targetPath = targetUrl.pathname.replace(/^\/+|\/+$/g, '');
  const received = new Date().toISOString();

  const result = await fetchSource(source);

  // 404/410 (or a source that no longer links here) is a deletion request:
  // store a tombstone so the drain removes any previously merged entry.
  const tombstone = () =>
    env.WEBMENTIONS.put(key, JSON.stringify({ source, target, targetPath, status: 'deleted', received }));

  if (result.gone) {
    await tombstone();
    return json(200, { status: 'deleted' });
  }
  if (result.error) return json(400, { error: result.error });

  const mention = await extractMention(result.html, target, result.finalUrl);
  if (!mention.linksToTarget) {
    await tombstone();
    return json(400, { error: 'source does not link to target' });
  }

  const excerpt = collapseWhitespace(mention.content);
  const record = {
    source,
    target,
    targetPath,
    type: mention.type,
    author: {
      name: collapseWhitespace(mention.authorName) || collapseWhitespace(mention.title) || sourceUrl.hostname,
      ...(mention.authorUrl ? { url: mention.authorUrl } : {}),
      ...(mention.authorPhoto ? { avatar: mention.authorPhoto } : {}),
    },
    // Plain text only; converted to sanitized HTML at drain time.
    content: excerpt.length > EXCERPT_CHARS ? `${excerpt.slice(0, EXCERPT_CHARS).trimEnd()}…` : excerpt,
    ...(mention.published ? { published: mention.published } : {}),
    received,
    status: 'pending',
  };

  await env.WEBMENTIONS.put(key, JSON.stringify(record));
  return json(201, { status: 'accepted', result: 'Webmention verified and queued for moderation' });
}
