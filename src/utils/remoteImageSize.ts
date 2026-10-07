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

// Astro renders many posts at once. Firing every probe in parallel made R2
// reject some of them, so probes run a few at a time and retry with backoff.
const MAX_CONCURRENT_PROBES = 6;
const RETRY_DELAYS_MS = [500, 2000, 5000];

let activeProbes = 0;
const probeQueue: Array<() => void> = [];

async function withProbeSlot<T>(task: () => Promise<T>): Promise<T> {
    if (activeProbes >= MAX_CONCURRENT_PROBES) {
        await new Promise<void>((resolve) => probeQueue.push(resolve));
    }
    activeProbes++;
    try {
        return await task();
    } finally {
        activeProbes--;
        probeQueue.shift()?.();
    }
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function probe(src: string): Promise<Size> {
    for (let attempt = 0; ; attempt++) {
        try {
            const { width, height } = await withProbeSlot(() =>
                inferRemoteSize(src, { domains: REMOTE_IMAGE_DOMAINS, remotePatterns: [] })
            );
            return { width, height };
        } catch (error) {
            if (attempt >= RETRY_DELAYS_MS.length) {
                throw error;
            }
            await sleep(RETRY_DELAYS_MS[attempt]);
        }
    }
}

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
        request = probe(src)
            .then((size) => {
                sizes![src] = size;
                scheduleWrite();
                return size;
            })
            .finally(() => pending.delete(src));
        pending.set(src, request);
    }
    return request;
}

/**
 * Astro's probe error hides the cause. Ask R2 directly so the build log says
 * whether the image is missing (404), blocked (403) or the network failed.
 */
export async function describeProbeFailure(src: string, error: unknown): Promise<string> {
    const reason = error instanceof Error ? error.message : String(error);
    try {
        const response = await fetch(src, { method: 'HEAD' });
        return `${reason} (HTTP ${response.status})`;
    } catch (fetchError) {
        const cause = fetchError instanceof Error ? fetchError.message : String(fetchError);
        return `${reason} (${cause})`;
    }
}
