import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';
import { glob } from 'glob';

const IMAGE_DIRECTORY = path.join(process.cwd(), 'src', 'images', 'nordletter');
const MANIFEST_PATH = path.join(process.cwd(), 'src', 'data', 'nordletter-image-manifest.json');
const CONTENT_GLOB = 'src/content/**/*.md';

function sanitizeSegment(value) {
    return value
        .toString()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        || 'nordletter-image';
}

async function ensureDirectory(dirPath) {
    await fs.mkdir(dirPath, { recursive: true });
}

async function fileExists(filePath) {
    try {
        await fs.access(filePath);
        return true;
    } catch {
        return false;
    }
}

function resolveExtension(imageUrl) {
    try {
        const url = new URL(imageUrl);
        const ext = path.extname(url.pathname).toLowerCase();
        if (ext) {
            return ext;
        }
    } catch {
        // Ignore parsing errors and fall back to default extension
    }
    return '.jpg';
}

async function downloadImage(imageUrl, destinationPath) {
    const response = await fetch(imageUrl);

    if (!response.ok) {
        throw new Error(`Failed to fetch ${imageUrl}: ${response.status} ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await fs.writeFile(destinationPath, buffer);
}

async function loadExistingManifest() {
    try {
        const content = await fs.readFile(MANIFEST_PATH, 'utf-8');
        return JSON.parse(content);
    } catch {
        return {};
    }
}

async function saveManifest(manifest) {
    const sortedEntries = Object.entries(manifest)
        .sort(([a], [b]) => a.localeCompare(b));

    const data = JSON.stringify(Object.fromEntries(sortedEntries), null, 2);
    await fs.writeFile(MANIFEST_PATH, `${data}\n`, 'utf-8');
}

async function removeStaleImages(manifest) {
    const keepFiles = new Set(Object.values(manifest));
    const entries = await fs.readdir(IMAGE_DIRECTORY, { withFileTypes: true });

    for (const entry of entries) {
        if (!entry.isFile() || entry.name === '.gitignore') {
            continue;
        }

        if (!keepFiles.has(entry.name)) {
            await fs.unlink(path.join(IMAGE_DIRECTORY, entry.name));
            console.log(`Removed stale image: ${entry.name}`);
        }
    }
}

async function collectNordletterImages() {
    await ensureDirectory(IMAGE_DIRECTORY);
    const existingManifest = await loadExistingManifest();
    const manifest = { ...existingManifest };

    const files = await glob(CONTENT_GLOB, { absolute: true });
    const seenSlugs = new Set();

    for (const filePath of files) {
        const rawContent = await fs.readFile(filePath, 'utf-8');
        const { data } = matter(rawContent);

        if (!data || data.category !== 'nordletter') {
            continue;
        }

        const slug = typeof data.slug === 'string'
            ? data.slug
            : sanitizeSegment(data.title || path.basename(filePath, path.extname(filePath)));
        seenSlugs.add(slug);

        if (typeof data.image !== 'string') {
            delete manifest[slug];
            continue;
        }

        const imageUrl = data.image.trim();
        if (!imageUrl) {
            delete manifest[slug];
            continue;
        }

        const extension = resolveExtension(imageUrl);
        const fileName = `${slug}${extension}`;
        const destinationPath = path.join(IMAGE_DIRECTORY, fileName);

        manifest[slug] = fileName;

        if (await fileExists(destinationPath)) {
            continue;
        }

        try {
            console.log(`Downloading ${imageUrl} -> ${fileName}`);
            await downloadImage(imageUrl, destinationPath);
        } catch (error) {
            console.error(`Failed to download ${imageUrl}:`, error);
            delete manifest[slug];
        }
    }

    for (const existingSlug of Object.keys(manifest)) {
        if (!seenSlugs.has(existingSlug)) {
            delete manifest[existingSlug];
        }
    }

    await saveManifest(manifest);
    await removeStaleImages(manifest);
}

try {
    await collectNordletterImages();
    console.log('Nordletter images cached successfully.');
} catch (error) {
    console.error('Failed to cache nordletter images:', error);
    process.exit(1);
}
