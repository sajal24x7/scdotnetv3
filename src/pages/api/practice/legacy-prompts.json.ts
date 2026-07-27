import type { APIRoute } from 'astro';
import legacy from '../../../data/legacy-prompts.json';

// The frozen snapshot of the prompts the four authored-prompt decks shipped
// before authoring landed (see src/components/learn/authoredPrompts.ts §
// "One-time migration"). Served as its own endpoint rather than bundled into
// the practice island: it's ~96KB and only fetched on a device that has
// introduced concepts predating the change, once.

export const prerender = true;

export const GET: APIRoute = () =>
	new Response(JSON.stringify(legacy), {
		status: 200,
		headers: {
			'Content-Type': 'application/json',
			'Cache-Control': 'public, max-age=86400, must-revalidate',
		},
	});
