// Records the width and height of every R2 image referenced by content in
// src/data/image-dimensions.json. The build reads sizes from this manifest
// (src/utils/imageDimensions.ts) instead of fetching each image to measure
// it, and only images listed here are optimised.
//
// Only images missing from the manifest are probed, and only their first few
// kilobytes are downloaded. Failures are logged and skipped so an offline or
// broken image never stops the build; the image renders unoptimised until a
// later run succeeds.

import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';
import { glob } from 'glob';
import { inferRemoteSize } from 'astro/assets/utils/inferRemoteSize.js';

const R2_HOST = 'storage.sajalchoudhary.net';
const MANIFEST_PATH = path.join(process.cwd(), 'src', 'data', 'image-dimensions.json');
const CONTENT_GLOB = 'src/content/**/*.{md,mdx}';
const CONCURRENCY = 12;
const MAX_LOGGED_FAILURES = 10;
const IMAGE_CONFIG = { domains: [R2_HOST], remotePatterns: [] };

const MARKDOWN_IMAGE_REGEX = /!\[[^\]]*\]\(<?([^)\s>]+)>?(?:\s+"[^"]*")?\)/g;

// Some migrated frontmatter carries smart quotes around URLs
const cleanUrl = (url) => url.replace(/[“”"']/g, '').trim();

function isR2Image(url) {
    try {
        return new URL(url).hostname === R2_HOST;
    } catch {
        return false;
    }
}

async function collectImageUrls() {
    const files = await glob(CONTENT_GLOB, { nodir: true });
    const urls = new Set();

    for (const file of files) {
        const source = await fs.readFile(file, 'utf-8');
        let parsed;
        try {
            parsed = matter(source);
        } catch (error) {
            console.warn(`[image-dimensions] Skipping ${file}: ${error.message}`);
            continue;
        }

        const { data, content } = parsed;
        const candidates = [];
        if (typeof data.image === 'string') candidates.push(data.image);
        if (Array.isArray(data.images)) candidates.push(...data.images.filter((v) => typeof v === 'string'));
        for (const match of content.matchAll(MARKDOWN_IMAGE_REGEX)) {
            candidates.push(match[1]);
        }

        for (const candidate of candidates) {
            const url = cleanUrl(candidate);
            if (isR2Image(url)) urls.add(url);
        }
    }

    return urls;
}

async function loadManifest() {
    try {
        return JSON.parse(await fs.readFile(MANIFEST_PATH, 'utf-8'));
    } catch {
        return {};
    }
}

async function probe(url) {
    // Encode spaces and other unsafe characters the way a browser would
    const { width, height } = await inferRemoteSize(encodeURI(decodeURI(url)), IMAGE_CONFIG);
    return [width, height];
}

async function main() {
    const urls = await collectImageUrls();
    const previous = await loadManifest();
    const manifest = {};
    const missing = [];

    for (const url of urls) {
        if (Array.isArray(previous[url])) {
            manifest[url] = previous[url];
        } else {
            missing.push(url);
        }
    }

    let probed = 0;
    let failed = 0;
    const queue = [...missing];
    async function worker() {
        while (queue.length > 0) {
            const url = queue.shift();
            try {
                manifest[url] = await probe(url);
                probed += 1;
            } catch (error) {
                failed += 1;
                if (failed <= MAX_LOGGED_FAILURES) {
                    console.warn(`[image-dimensions] Could not measure ${url}: ${error.message}`);
                }
            }
        }
    }
    await Promise.all(Array.from({ length: CONCURRENCY }, worker));

    // One image per line keeps diffs readable
    const entries = Object.entries(manifest).sort(([a], [b]) => a.localeCompare(b));
    const lines = entries.map(([url, size]) => `  ${JSON.stringify(url)}: ${JSON.stringify(size)}`);
    await fs.writeFile(MANIFEST_PATH, entries.length ? `{\n${lines.join(',\n')}\n}\n` : '{}\n', 'utf-8');

    const removed = Object.keys(previous).filter((url) => !urls.has(url)).length;
    console.log(
        `[image-dimensions] ${urls.size} R2 images: ${entries.length} known, ` +
        `${probed} newly measured, ${failed} failed, ${removed} stale entries removed.`,
    );
}

main().catch((error) => {
    // Never block the build: unmeasured images just render unoptimised.
    console.error('[image-dimensions] Failed:', error);
});
