import type { APIRoute } from 'astro';
import type { LearnDataset } from '../../../components/learn/types';
import { linuxLearnConfig } from '../../../data/linux-learn-config';
import { finnishLearnConfig } from '../../../data/finnish-learn-config';
import { tilLearnConfig } from '../../../data/til-learn-config';
import { evergreenLearnConfig } from '../../../data/evergreen-learn-config';
import { vocabLearnConfig } from '../../../data/vocab-learn-config';

// Per-deck dataset endpoint for /practice (plan §2.2): the practice island
// must not bundle every content pool, so each public deck's data is emitted
// at build as a static JSON file and fetched lazily, only for decks that
// actually contribute to today's session. Same prerendered-route pattern as
// src/pages/api/link-previews/[category].json.ts.

const datasets: Record<string, LearnDataset> = {
	linux: linuxLearnConfig.dataset,
	finnish: finnishLearnConfig.dataset,
	til: tilLearnConfig.dataset,
	evergreen: evergreenLearnConfig.dataset,
	vocab: vocabLearnConfig.dataset,
};

export function getStaticPaths() {
	return Object.keys(datasets).map((deck) => ({ params: { deck } }));
}

export const prerender = true;

export const GET: APIRoute = ({ params }) => {
	const dataset = datasets[params.deck ?? ''];
	if (!dataset) {
		return new Response('Not found', { status: 404 });
	}
	return new Response(JSON.stringify(dataset), {
		status: 200,
		headers: {
			'Content-Type': 'application/json',
			'Cache-Control': 'public, max-age=3600, must-revalidate',
		},
	});
};
