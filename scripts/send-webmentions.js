#!/usr/bin/env node

/**
 * Outgoing webmentions for sajalchoudhary.net
 *
 * "Be a good citizen": for recently published posts, fetch the live page,
 * extract the outbound links inside the post content (.e-content, the same
 * class functions/api/webmention.js's own verifier looks for), discover each
 * target's webmention endpoint (Link header or <link rel="webmention"> /
 * <a rel="webmention">), and POST source+target. Sent pairs are recorded in
 * src/data/webmentions-sent.json so re-runs don't resend — a negative result
 * (target has no endpoint) is also cached, but re-checked after 30 days in
 * case the target adds support later.
 *
 * Runs after content is live (see the "Wait for the Cloudflare deploy" step
 * in .github/workflows/syndicate-content.yml, which this follows) since it
 * fetches the canonical URL itself rather than working from local content.
 *
 * Environment:
 *   WEBMENTIONS_DAYS_BACK   how far back to check for posts (default 7)
 *   WEBMENTIONS_DRY_RUN     "true" to log without POSTing or writing state
 */

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const SITE_ORIGIN = 'https://sajalchoudhary.net';
const SENT_FILE = path.join(process.cwd(), 'src', 'data', 'webmentions-sent.json');
const MAX_BYTES = 1024 * 1024;
const FETCH_TIMEOUT_MS = 10_000;
const NEGATIVE_RECHECK_MS = 30 * 24 * 60 * 60 * 1000;
const DRY_RUN = process.env.WEBMENTIONS_DRY_RUN === 'true';

/**
 * Mirror of slugFromEntry in src/content.config.ts — canonical URLs must
 * match the page paths Astro generates.
 */
function slugFromFilename(filename) {
  return filename
    .replace(/\.mdx?$/, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function getRecentPosts(daysBack) {
  const contentDir = path.join(process.cwd(), 'src', 'content');
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - daysBack);
  const posts = [];

  const categoryDirs = fs
    .readdirSync(contentDir, { withFileTypes: true })
    .filter((item) => item.isDirectory() && !item.name.startsWith('.') && item.name !== 'inbox')
    .map((item) => item.name)
    .sort();

  for (const category of categoryDirs) {
    const files = fs
      .readdirSync(path.join(contentDir, category))
      .filter((file) => file.endsWith('.md') || file.endsWith('.mdx'));

    for (const file of files) {
      const filePath = path.join(contentDir, category, file);
      try {
        const { data } = matter(fs.readFileSync(filePath, 'utf-8'));
        const created = new Date(data.created || data.pubDate || 0);
        if (daysBack > 0 && created < cutoff) continue;

        const slug = data.slug != null && data.slug !== '' ? String(data.slug) : slugFromFilename(file);
        posts.push({ url: `${SITE_ORIGIN}/${data.category || category}/${slug}/`, created });
      } catch (error) {
        console.warn(`Warning: could not parse ${filePath}: ${error.message}`);
      }
    }
  }

  return posts;
}

/** Fetch a URL with a timeout and byte cap. Returns { html, finalUrl, headers } or throws. */
async function fetchCapped(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        accept: 'text/html;q=1.0,*/*;q=0.5',
        'user-agent': 'sajalchoudhary.net-webmention-sender/1.0 (+https://sajalchoudhary.net)',
      },
    });
    if (!response.ok) throw new Error(`returned ${response.status}`);

    const reader = response.body.getReader();
    const chunks = [];
    let total = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      total += value.byteLength;
      if (total >= MAX_BYTES) {
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
    return { html: new TextDecoder('utf-8').decode(bytes), finalUrl: response.url || url, headers: response.headers };
  } finally {
    clearTimeout(timer);
  }
}

function extractHrefs(html) {
  const hrefs = [];
  const re = /<a\b[^>]*\bhref\s*=\s*(?:"([^"]*)"|'([^']*)')[^>]*>/gi;
  let match;
  while ((match = re.exec(html))) {
    const href = match[1] ?? match[2];
    if (href) hrefs.push(href);
  }
  return hrefs;
}

/** Find the html index just past the </div> matching the div opened at openTagEnd. */
function findMatchingClose(html, openTagEnd) {
  const openRe = /<div\b[^>]*>/gi;
  const closeRe = /<\/div>/gi;
  let depth = 1;
  let pos = openTagEnd;
  while (depth > 0) {
    openRe.lastIndex = pos;
    closeRe.lastIndex = pos;
    const openMatch = openRe.exec(html);
    const closeMatch = closeRe.exec(html);
    if (!closeMatch) return -1; // malformed HTML — bail rather than misparse
    if (openMatch && openMatch.index < closeMatch.index) {
      depth++;
      pos = openMatch.index + openMatch[0].length;
    } else {
      depth--;
      pos = closeMatch.index + closeMatch[0].length;
    }
  }
  return pos;
}

/**
 * Outbound links inside the post's .e-content block(s) — pages can have more
 * than one (e.g. PhotoPostLayout's caption and body both use the class).
 */
function extractContentLinks(html, baseUrl) {
  const siteHost = new URL(SITE_ORIGIN).hostname;
  const found = new Set();
  const divOpenRe = /<div\b[^>]*\bclass="([^"]*)"[^>]*>/gi;
  let match;
  while ((match = divOpenRe.exec(html))) {
    if (!/\be-content\b/.test(match[1])) continue;
    const openEnd = match.index + match[0].length;
    const closeStart = findMatchingClose(html, openEnd);
    if (closeStart === -1) continue;

    for (const href of extractHrefs(html.slice(openEnd, closeStart))) {
      let url;
      try {
        url = new URL(href, baseUrl);
      } catch {
        continue;
      }
      if (url.protocol !== 'http:' && url.protocol !== 'https:') continue;
      if (url.hostname.replace(/^www\./, '').toLowerCase() === siteHost.replace(/^www\./, '').toLowerCase()) continue;
      url.hash = '';
      found.add(url.toString());
    }

    divOpenRe.lastIndex = closeStart;
  }
  return [...found];
}

/** Parse an RFC 5988 Link header for a rel="webmention" entry. */
function parseWebmentionLinkHeader(header, base) {
  if (!header) return null;
  for (const entry of header.split(/,(?=\s*<)/)) {
    const urlMatch = entry.match(/<([^>]+)>/);
    const relMatch = entry.match(/rel\s*=\s*"?([^";]+)"?/i);
    if (!urlMatch || !relMatch) continue;
    if (relMatch[1].split(/\s+/).includes('webmention')) {
      try {
        return new URL(urlMatch[1], base).toString();
      } catch {
        return null;
      }
    }
  }
  return null;
}

/** Find <link rel="webmention" href="..."> or <a rel="webmention" href="..."> in HTML. */
function findWebmentionEndpointInHtml(html, base) {
  const tagRe = /<(?:link|a)\b[^>]*\brel=["']?[^"'>]*\bwebmention\b[^"'>]*["']?[^>]*>/i;
  const tag = html.match(tagRe);
  if (!tag) return null;
  const hrefMatch = tag[0].match(/href\s*=\s*["']([^"']+)["']/i);
  if (!hrefMatch) return null;
  try {
    return new URL(hrefMatch[1], base).toString();
  } catch {
    return null;
  }
}

async function discoverEndpoint(targetUrl) {
  const { html, finalUrl, headers } = await fetchCapped(targetUrl);
  return parseWebmentionLinkHeader(headers.get('link'), finalUrl) ?? findWebmentionEndpointInHtml(html, finalUrl);
}

function readSentLog() {
  try {
    const raw = JSON.parse(fs.readFileSync(SENT_FILE, 'utf-8'));
    const { _meta, ...entries } = raw;
    return entries;
  } catch {
    return {};
  }
}

function writeSentLog(log) {
  const sortedKeys = Object.keys(log).sort();
  const output = { _meta: { version: 1 } };
  for (const key of sortedKeys) output[key] = log[key];
  const serialized = JSON.stringify(output, null, 2) + '\n';

  let existing = null;
  try {
    existing = fs.readFileSync(SENT_FILE, 'utf-8');
  } catch {
    // First run.
  }
  if (existing === serialized) return;
  fs.mkdirSync(path.dirname(SENT_FILE), { recursive: true });
  fs.writeFileSync(SENT_FILE, serialized, 'utf-8');
  console.log(`Wrote ${SENT_FILE}`);
}

async function sendWebmentions() {
  console.log('🌐 Sending outgoing webmentions...');
  const daysBack = Number.parseInt(process.env.WEBMENTIONS_DAYS_BACK ?? '7', 10);
  const posts = getRecentPosts(Number.isNaN(daysBack) ? 7 : daysBack);
  console.log(`📖 Checking ${posts.length} post(s) from the last ${daysBack} days for outbound links`);

  const sent = readSentLog();
  const stats = { sent: 0, checked: 0, skipped: 0, noEndpoint: 0, failed: 0 };

  for (const post of posts) {
    let html;
    try {
      ({ html } = await fetchCapped(post.url));
    } catch (error) {
      console.warn(`  ⚠️  could not fetch ${post.url}: ${error.message}`);
      continue;
    }

    for (const target of extractContentLinks(html, post.url)) {
      stats.checked++;
      const key = `${post.url} ${target}`;
      const previous = sent[key];
      const staleNegative = previous && !previous.endpoint && Date.now() - Date.parse(previous.checkedAt) > NEGATIVE_RECHECK_MS;
      if (previous && !staleNegative) {
        stats.skipped++;
        continue;
      }

      let endpoint;
      try {
        endpoint = await discoverEndpoint(target);
      } catch (error) {
        console.warn(`  ⚠️  endpoint discovery failed for ${target}: ${error.message}`);
        stats.failed++;
        continue;
      }

      if (!endpoint) {
        stats.noEndpoint++;
        if (!DRY_RUN) sent[key] = { checkedAt: new Date().toISOString(), endpoint: null };
        continue;
      }

      if (DRY_RUN) {
        console.log(`  [dry run] would send ${post.url} → ${target} via ${endpoint}`);
        continue;
      }

      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'content-type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({ source: post.url, target }),
          signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
        });
        sent[key] = { checkedAt: new Date().toISOString(), endpoint, status: response.status };
        if (response.ok) {
          stats.sent++;
          console.log(`  📤 ${post.url} → ${target} (${response.status})`);
        } else {
          console.warn(`  ⚠️  webmention to ${endpoint} returned ${response.status}`);
        }
      } catch (error) {
        console.warn(`  ⚠️  failed to POST webmention to ${endpoint}: ${error.message}`);
        stats.failed++;
      }
    }
  }

  if (!DRY_RUN) writeSentLog(sent);
  console.log(
    `\n🎉 Done. ${stats.sent} sent, ${stats.checked} link(s) checked, ${stats.skipped} already known, ` +
      `${stats.noEndpoint} without an endpoint, ${stats.failed} failed.`
  );
}

if (import.meta.url === `file://${process.argv[1]}`) {
  sendWebmentions().catch((error) => {
    console.error('💥 Unhandled error:', error);
    process.exit(1);
  });
}

export { sendWebmentions, extractContentLinks, parseWebmentionLinkHeader, findWebmentionEndpointInHtml };
