import React, { useEffect, useState } from 'react';

// The /learn hub: one card per practice system, with live due/new counts
// read from each system's localStorage state. The systems stay fully
// independent (own deck, own storage key, own wall chart) — the hub only
// makes the daily ritual single-entry: open /learn, see what's owed where.
//
// Receives lightweight build-time summaries instead of the datasets
// themselves so the island doesn't bundle four content pools.

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
	streak: number;
	started: boolean;
}

function localToday(): string {
	const d = new Date();
	const pad = (n: number) => String(n).padStart(2, '0');
	return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// Mirrors the counts LearningSystem.tsx derives from its SrsState; keep the
// two in sync if the state schema changes.
function readStatus(system: LearnHubSystem): SystemStatus {
	const today = localToday();
	try {
		const raw = window.localStorage.getItem(system.storageKey);
		if (!raw) {
			return { due: 0, newAvailable: Math.min(system.totalItems, system.newPerDay), streak: 0, started: false };
		}
		const state = JSON.parse(raw);
		const cards: Record<string, { due: string }> = state.cards ?? {};
		const introduced: Record<string, string> = state.introduced ?? {};
		const due = Object.values(cards).filter((c) => c.due <= today).length;
		const introducedToday = Object.values(introduced).filter((d) => d === today).length;
		const unseen = Math.max(0, system.totalItems - Object.keys(introduced).length);
		const newAvailable = Math.min(unseen, Math.max(0, system.newPerDay - introducedToday));
		return { due: Math.min(due, system.dueCap), newAvailable, streak: state.streak ?? 0, started: true };
	} catch {
		return { due: 0, newAvailable: 0, streak: 0, started: false };
	}
}

function statusLine(system: LearnHubSystem, status: SystemStatus): { text: string; kind: 'due' | 'done' | 'fresh' } {
	if (system.totalItems === 0) {
		return { text: 'no items yet', kind: 'fresh' };
	}
	const parts: string[] = [];
	if (status.due > 0) parts.push(`${status.due} due`);
	if (status.newAvailable > 0) {
		parts.push(`${status.newAvailable} new ${system.itemNoun}${status.newAvailable > 1 ? 's' : ''}`);
	}
	if (parts.length === 0) {
		return { text: status.started ? '✓ done for today' : 'not started', kind: status.started ? 'done' : 'fresh' };
	}
	if (status.streak > 0) parts.push(`${status.streak}-day streak`);
	return { text: parts.join(' · '), kind: 'due' };
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
			{systems.map((system) => {
				const status = statuses?.[system.id];
				const line = status ? statusLine(system, status) : null;
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
	);
}
