import { promises as fs } from 'node:fs';
import path from 'node:path';
import { findAndReplace } from 'mdast-util-find-and-replace';

// Must be kept in sync with CONTENT_CATEGORIES in src/content.config.ts.
// Defined inline here to avoid importing astro:content into astro.config.mjs.
const CONTENT_CATEGORIES = [
    'til', 'blog', 'micro', 'photo', 'nordletter', 'story', 'poem',
    'bookshelf', 'filmshelf', 'tvshelf', 'gameshelf', 'now', 'colophon', 'evergreen',
] as const;

interface WikilinkEntry {
    url: string;
    title: string;
}

// Maps slug, "category/slug", and lowercase title → entry
type WikilinkIndex = Map<string, WikilinkEntry>;

let indexPromise: Promise<WikilinkIndex> | null = null;

async function buildWikilinkIndex(): Promise<WikilinkIndex> {
    const contentDir = path.join(process.cwd(), 'src', 'content');
    const index: WikilinkIndex = new Map();

    for (const category of CONTENT_CATEGORIES) {
        const categoryDir = path.join(contentDir, category);
        let files: string[];
        try {
            files = await fs.readdir(categoryDir);
        } catch {
            continue;
        }

        for (const file of files) {
            if (!file.endsWith('.md') && !file.endsWith('.mdx')) continue;

            const filePath = path.join(categoryDir, file);
            let content: string;
            try {
                content = await fs.readFile(filePath, 'utf-8');
            } catch {
                continue;
            }

            const frontmatterMatch = content.match(/^---\s*\n([\s\S]*?)\n---/);
            if (!frontmatterMatch) continue;
            const frontmatter = frontmatterMatch[1];

            const slugMatch = frontmatter.match(/^slug:\s*["']?(.+?)["']?\s*$/m);
            const titleMatch = frontmatter.match(/^title:\s*["'](.+?)["']?\s*$/m);

            const slug = slugMatch
                ? slugMatch[1].trim()
                : file
                      .replace(/\.mdx?$/, '')
                      .toLowerCase()
                      .replace(/[^a-z0-9]+/g, '-')
                      .replace(/^-+|-+$/g, '');

            const title = titleMatch ? titleMatch[1].trim() : null;
            const url = `/${category}/${slug}/`;
            const entry: WikilinkEntry = { url, title: title || slug };

            // Index by slug
            index.set(slug, entry);
            index.set(`${category}/${slug}`, entry);
            // Index by title (case-insensitive)
            if (title) {
                index.set(title.toLowerCase(), entry);
            }
            // Index by filename stem — Obsidian uses the raw filename (without extension)
            // as the wikilink target, e.g. "202404141404 Control traffic flows"
            const filenameStem = file.replace(/\.mdx?$/, '');
            index.set(filenameStem, entry);
            index.set(filenameStem.toLowerCase(), entry);
        }
    }

    return index;
}

function getWikilinkIndex(): Promise<WikilinkIndex> {
    if (!indexPromise) {
        indexPromise = buildWikilinkIndex();
    }
    return indexPromise;
}

function resolveWikilink(target: string, index: WikilinkIndex): WikilinkEntry | null {
    // Exact match (handles "category/slug" and "slug" directly)
    if (index.has(target)) return index.get(target)!;
    // Case-insensitive match (handles titles)
    const lower = target.toLowerCase();
    if (index.has(lower)) return index.get(lower)!;
    return null;
}

/**
 * Remark plugin that converts Obsidian-style wikilinks to standard links.
 *
 * Supported syntax:
 *   [[slug]]               → link using slug as display text
 *   [[slug|Display Text]]  → link with custom display text
 *   [[category/slug]]      → explicit category/slug targeting
 *
 * Resolution order: exact slug → exact category/slug → case-insensitive title match
 * Unresolved wikilinks are preserved as literal text [[...]] to avoid silent breakage.
 */
export function remarkWikilinks() {
    return async function transform(tree: import('mdast').Root) {
        const index = await getWikilinkIndex();

        findAndReplace(tree, [
            [
                /\[\[([^\]|]+?)(?:\|([^\]]+?))?\]\]/g,
                (_match: string, rawTarget: string, rawDisplay: string | undefined) => {
                    const target = rawTarget.trim();
                    const display = rawDisplay?.trim() || target;
                    const entry = resolveWikilink(target, index);

                    if (!entry) {
                        // Preserve literal text for unresolved wikilinks
                        return { type: 'text', value: `[[${rawTarget}${rawDisplay ? `|${rawDisplay}` : ''}]]` };
                    }

                    return {
                        type: 'link',
                        url: entry.url,
                        title: null,
                        children: [{ type: 'text', value: display }],
                    };
                },
            ],
        ]);
    };
}
