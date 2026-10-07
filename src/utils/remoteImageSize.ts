import fs from 'node:fs';
import path from 'node:path';
import { inferRemoteSize } from 'astro/assets/utils/inferRemoteSize.js';
import { REMOTE_IMAGE_DOMAINS } from './imageDomains';

// Astro caches optimized remote images, but not the size probe it needs for
// images without width/height. Without this cache every build would re-probe
// each R2 image over the network. The file sits next to Astro's own asset
// cache, so the Cloudflare Pages build cache keeps it between deploys.
const CACHE_FILE = path.resolve(process.cwd(), 'node_modules/.astro/remote-image-sizes.json');

type Size = { width: number; height: number };

let sizes: Record<string, Size> | undefined;
let writeScheduled = false;
const pending = new Map<string, Promise<Size>>();

function readCacheFile(): Record<string, Size> {
    try {
        return JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'));
    } catch {
        return {};
    }
}

function scheduleWrite() {
    if (writeScheduled) {
        return;
    }
    writeScheduled = true;
    setTimeout(() => {
        writeScheduled = false;
        try {
            // Merge with what is on disk: the config and the build each load
            // their own copy of this module.
            const merged = { ...readCacheFile(), ...sizes };
            fs.mkdirSync(path.dirname(CACHE_FILE), { recursive: true });
            fs.writeFileSync(CACHE_FILE, JSON.stringify(merged));
        } catch (error) {
            console.warn(`[images] Could not write ${CACHE_FILE}: ${error}`);
        }
    }, 200);
}

export async function getRemoteImageSize(src: string): Promise<Size> {
    sizes ??= readCacheFile();
    const cached = sizes[src];
    if (cached) {
        return cached;
    }
    let request = pending.get(src);
    if (!request) {
        request = inferRemoteSize(src, { domains: REMOTE_IMAGE_DOMAINS, remotePatterns: [] })
            .then(({ width, height }) => {
                const size = { width, height };
                sizes![src] = size;
                scheduleWrite();
                return size;
            })
            .finally(() => pending.delete(src));
        pending.set(src, request);
    }
    return request;
}
