// Browser-side "Build deck file" logic for /learn/people (plan §5.2/Phase 4).
// Takes the files dropped on the page — person notes (.md, written exactly
// like TIL/evergreen notes per plan §5.3) plus any referenced photos — and
// produces a single self-contained people-deck.json, entirely client-side:
// no script, no Node, no data ever leaving the browser. Reuses the same
// ```learn block parser the site's build uses (src/utils/learnBlockParser.mjs)
// so person notes follow the exact same authoring rules as TIL/evergreen.

import * as yaml from 'js-yaml';
import {
	parseLearnBlocks,
	normalizeTag,
	firstParagraph,
	firstCodeBlock,
	noteTimestamp,
	titleFromFilename,
	slugFromFilename,
} from '../../utils/learnBlockParser.mjs';
import type { Category, LearnDataset, LearnItem, Prompt } from './types';

const FALLBACK_CATEGORY_EMOJI: Record<string, string> = {
	people: '🧑‍🤝‍🧑',
};
const DEFAULT_EMOJI = '🧑';

// Frontmatter is simple key: value YAML for person notes (name/photo/tags),
// so a hand-rolled splitter is safe here — it avoids pulling gray-matter
// (the build script's frontmatter parser) into the client bundle.
function splitFrontmatter(raw: string): { data: Record<string, unknown>; body: string } {
	const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
	if (!match) return { data: {}, body: raw };
	let data: Record<string, unknown> = {};
	try {
		const parsed = yaml.load(match[1]);
		if (parsed && typeof parsed === 'object') data = parsed as Record<string, unknown>;
	} catch {
		// malformed frontmatter — proceed with an empty data object rather than failing the whole note
	}
	return { data, body: raw.slice(match[0].length) };
}

async function readAsDataUrl(file: File): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => resolve(reader.result as string);
		reader.onerror = () => reject(reader.error);
		reader.readAsDataURL(file);
	});
}

async function loadImage(dataUrl: string): Promise<HTMLImageElement> {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.onload = () => resolve(img);
		img.onerror = () => reject(new Error('image decode failed'));
		img.src = dataUrl;
	});
}

// Downscales to a small square-ish thumbnail and re-encodes as JPEG so a
// deck with a dozen photos still stays a reasonably sized JSON file.
async function thumbnailImage(file: File, maxDim = 128): Promise<string> {
	const dataUrl = await readAsDataUrl(file);
	try {
		const img = await loadImage(dataUrl);
		const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
		const w = Math.max(1, Math.round(img.width * scale));
		const h = Math.max(1, Math.round(img.height * scale));
		const canvas = document.createElement('canvas');
		canvas.width = w;
		canvas.height = h;
		const ctx = canvas.getContext('2d');
		if (!ctx) return dataUrl;
		ctx.drawImage(img, 0, 0, w, h);
		return canvas.toDataURL('image/jpeg', 0.85);
	} catch {
		return dataUrl; // decode failed — fall back to the untouched original
	}
}

export interface BuildResult {
	dataset: LearnDataset;
	warnings: string[];
	itemCount: number;
	promptCount: number;
}

export async function buildPeopleDeck(files: File[]): Promise<BuildResult> {
	const warnings: string[] = [];
	const notes = files.filter((f) => /\.mdx?$/i.test(f.name)).sort((a, b) => a.name.localeCompare(b.name));
	const imagesByName = new Map<string, File>();
	for (const f of files) {
		if (/\.(jpe?g|png|webp|gif)$/i.test(f.name)) imagesByName.set(f.name.toLowerCase(), f);
	}

	const byCategory = new Map<string, LearnItem[]>();
	const ordered: { itemId: string; timestamp: string }[] = [];

	for (const file of notes) {
		const raw = await file.text();
		const { data, body } = splitFrontmatter(raw);

		const timestamp = noteTimestamp(file.name);
		const itemId = `people-${timestamp ?? slugFromFilename(file.name)}`;
		const name = typeof data.name === 'string' && data.name.trim() ? data.name.trim() : titleFromFilename(file.name);

		const tags = Array.isArray(data.tags) ? data.tags.map(normalizeTag).filter(Boolean) : [];
		const categoryTag = normalizeTag((data.category as string | undefined) ?? tags[0] ?? 'people') || 'people';

		let photo: string | undefined;
		if (typeof data.photo === 'string' && data.photo.trim()) {
			const imageFile = imagesByName.get(data.photo.trim().toLowerCase());
			if (imageFile) {
				photo = await thumbnailImage(imageFile);
			} else {
				warnings.push(`${file.name}: photo "${data.photo}" not found among dropped files — skipped`);
			}
		}

		const blocks = parseLearnBlocks(body, file.name, warnings);
		const meta = (blocks[0] ?? {}) as Record<string, unknown>;

		const prompts: Prompt[] = [];
		for (const block of blocks) {
			const blockPrompts = (block as { prompts?: unknown }).prompts;
			if (!Array.isArray(blockPrompts)) continue;
			for (const prompt of blockPrompts) {
				if (!prompt || typeof prompt.q !== 'string' || typeof prompt.a !== 'string') {
					warnings.push(`${file.name}: prompt missing q/a — skipped`);
					continue;
				}
				const suffix = prompt.id != null && prompt.id !== '' ? String(prompt.id) : `p${prompts.length + 1}`;
				prompts.push({
					id: `${itemId}-${suffix}`,
					q: prompt.q.trim(),
					a: prompt.a.trim(),
					...(typeof prompt.note === 'string' && prompt.note.trim() ? { note: prompt.note.trim() } : {}),
					...(prompt.kind === 'cloze' ? { kind: 'cloze' as const } : {}),
				});
			}
		}

		// Block-less notes still work (plan §5.3): a default prompt pair is
		// generated from whatever's on the note — photo → name when there's a
		// photo, first paragraph → name otherwise — so a hastily captured note
		// is practicable immediately.
		if (prompts.length === 0) {
			const para = firstParagraph(body);
			const q = photo ? 'Who is this?' : para ? `Who fits: "${para}"?` : `Who is ${name}?`;
			prompts.push({ id: `${itemId}-p1`, q, a: name });
		}

		const example = typeof meta.example === 'string' ? meta.example.trim() : firstCodeBlock(body);
		const item: LearnItem = {
			id: itemId,
			term: typeof meta.term === 'string' && meta.term.trim() ? meta.term.trim() : name,
			...(typeof meta.syntax === 'string' && meta.syntax.trim() ? { syntax: meta.syntax.trim() } : {}),
			description: (typeof meta.description === 'string' ? meta.description.trim() : '') || firstParagraph(body),
			...(example ? { example } : {}),
			...(typeof meta.exampleNote === 'string' && meta.exampleNote.trim() ? { exampleNote: meta.exampleNote.trim() } : {}),
			...(photo ? { photo } : {}),
			prompts,
		};

		if (!byCategory.has(categoryTag)) byCategory.set(categoryTag, []);
		byCategory.get(categoryTag)!.push(item);
		ordered.push({ itemId, timestamp: timestamp ?? '000000000000' });
	}

	const categories: Category[] = [...byCategory.entries()]
		.sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]))
		.map(([tag, items]) => ({
			id: tag,
			title: tag.charAt(0).toUpperCase() + tag.slice(1),
			emoji: FALLBACK_CATEGORY_EMOJI[tag] ?? DEFAULT_EMOJI,
			description: '',
			items,
		}));

	// Newest note first, same convention as the note-backed decks (§ extract-learn-blocks.mjs).
	const introductionOrder = ordered
		.sort((a, b) => b.timestamp.localeCompare(a.timestamp) || a.itemId.localeCompare(b.itemId))
		.map((entry) => entry.itemId);

	const itemCount = categories.reduce((n, c) => n + c.items.length, 0);
	const promptCount = categories.reduce((n, c) => n + c.items.reduce((m, i) => m + i.prompts.length, 0), 0);

	return { dataset: { categories, introductionOrder }, warnings, itemCount, promptCount };
}
