import React, { useEffect, useState } from 'react';
import {
	computeDueCount,
	computeIntroducedCount,
	computeIntroducedTodayCount,
	computeNewAvailable,
	computeUnseenCount,
	emptyState,
	GLOBAL_NEW_PER_DAY,
	localToday,
	type SrsState,
} from './engine';

// The /learn hub: one card per practice system (territory: wall chart,
// reference, drills), plus a single banner pointing at /practice — the one
// place the daily ritual now happens (unified-practice plan §1/§6). Per-card
// due/new counts and the "start review" CTA moved there; a card's status
// line now only reports territory progress (how much of the deck has been
// introduced), so the hub stays truthful about what changed without
// duplicating /practice's session-composition logic.
//
// Counts are derived with the same engine functions PracticeSession uses, so
// the two can't drift out of sync.

export interface LearnHubSystem {
	id: string;
	title: string;
	emoji: string;
	href: string;
	blurb: string;
	itemNoun: string;
	totalItems: number;
	totalPrompts: number;
	storageKey: string;
	newPerDay: number;
	dueCap: number;
}

interface SystemStatus {
	due: number;
	newAvailable: number;
	introducedToday: number;
	introduced: number;
	started: boolean;
}

function readStatus(system: LearnHubSystem): SystemStatus {
	const today = localToday();
	try {
		const raw = window.localStorage.getItem(system.storageKey);
		if (!raw) {
			return { due: 0, newAvailable: Math.min(system.totalItems, system.newPerDay), introducedToday: 0, introduced: 0, started: false };
		}
		const state: SrsState = { ...emptyState(), ...JSON.parse(raw) };
		const due = computeDueCount(state, today);
		const introduced = computeIntroducedCount(state);
		const unseen = computeUnseenCount(system.totalItems, state);
		const introducedTodayCount = computeIntroducedTodayCount(state, today);
		const newAvailable = computeNewAvailable(unseen, introducedTodayCount, system.newPerDay);
		return { due: Math.min(due, system.dueCap), newAvailable, introducedToday: introducedTodayCount, introduced, started: true };
	} catch {
		return { due: 0, newAvailable: 0, introducedToday: 0, introduced: 0, started: false };
	}
}

function progressLine(system: LearnHubSystem, status: SystemStatus): { text: string; kind: 'progress' | 'fresh' } {
	if (system.totalItems === 0) {
		return { text: 'no items yet', kind: 'fresh' };
	}
	if (!status.started || status.introduced === 0) {
		return { text: 'not started', kind: 'fresh' };
	}
	const pct = Math.round((status.introduced / system.totalItems) * 100);
	return { text: `${pct}% of the territory introduced`, kind: 'progress' };
}

// Two banners for the two halves of the daily ritual: learning (new
// concepts, at /learn/new) and practice (due Q&A, at /practice).
function Banner({ systems, statuses }: { systems: LearnHubSystem[]; statuses: Record<string, SystemStatus> | null }) {
	if (!statuses) return null;
	let due = 0;
	let newAvailable = 0;
	let introducedToday = 0;
	for (const system of systems) {
		const status = statuses[system.id];
		if (!status) continue;
		due += status.due;
		newAvailable += status.newAvailable;
		introducedToday += status.introducedToday;
	}
	// Show what /learn/new would actually offer today, not the raw sum of
	// every deck's budget — and not a fresh 5 regardless of how many of
	// today's global quota are already spent. Without subtracting
	// introducedToday, a deck nobody touched today keeps reporting its own
	// full per-deck quota, so this banner can keep advertising up to 5 more
	// "new" concepts even right after finishing today's batch.
	newAvailable = Math.min(newAvailable, Math.max(0, GLOBAL_NEW_PER_DAY - introducedToday));
	return (
		<>
			<a className="lq-hub__banner" href="/learn/new/">
				<span className="lq-hub__banner-title">New today</span>
				<span className="lq-hub__banner-counts">
					{newAvailable > 0 ? `${newAvailable} new concept${newAvailable === 1 ? '' : 's'} to learn` : '✓ nothing new left'} →
				</span>
			</a>
			<a className="lq-hub__banner" href="/practice/">
				<span className="lq-hub__banner-title">Today's practice</span>
				<span className="lq-hub__banner-counts">{due > 0 ? `${due} due` : '✓ all caught up'} →</span>
			</a>
		</>
	);
}

export default function LearnHub({ systems }: { systems: LearnHubSystem[] }) {
	// Statuses load after hydration so the first client render matches the
	// prerendered HTML (built without localStorage).
	const [statuses, setStatuses] = useState<Record<string, SystemStatus> | null>(null);

	useEffect(() => {
		const load = () => {
			const next: Record<string, SystemStatus> = {};
			for (const system of systems) next[system.id] = readStatus(system);
			setStatuses(next);
		};
		load();
		window.addEventListener('focus', load);
		return () => window.removeEventListener('focus', load);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<div className="lq-hub">
			<Banner systems={systems} statuses={statuses} />
			<div className="lq-hub__grid">
				{systems.map((system) => {
					const status = statuses?.[system.id];
					const line = status ? progressLine(system, status) : null;
					return (
						<a key={system.id} className="lq-hub__card" href={system.href}>
							<p className="lq-hub__name">
								<span className="lq-hub__emoji" aria-hidden="true">{system.emoji}</span>
								{system.title}
							</p>
							<p className="lq-hub__blurb">{system.blurb}</p>
							<p className="lq-hub__meta">
								{system.totalItems} {system.itemNoun}
								{system.totalItems === 1 ? '' : 's'} · {system.totalPrompts} prompts
							</p>
							{line && <p className={`lq-hub__status lq-hub__status--${line.kind}`}>{line.text}</p>}
						</a>
					);
				})}
			</div>
		</div>
	);
}
