import React, { useEffect, useState } from 'react';
import LearningSystem from './LearningSystem';
import { buildPeopleDeck } from './peopleDeckBuilder';
import { importPeopleDeck, loadPeopleDeck } from './peopleDeckStore';
import type { LearnDataset, LearnSystemConfig } from './types';
import {
	PEOPLE_DUE_CAP,
	PEOPLE_ITEM_NOUN,
	PEOPLE_MONO_ANSWERS,
	PEOPLE_NEW_PER_DAY,
	PEOPLE_STORAGE_KEY,
} from '../../data/people-learn-config';

// /learn/people (plan §5.2/Phase 4): a public *shell* with private *content*.
// The page ships with zero people data — it renders LearningSystem's usual
// wall chart + reference panel + drills, but the dataset comes from
// IndexedDB (peopleDeckStore.ts), populated only by this device's own
// "Load deck" import. Nothing here is fetched from, or sent to, a server.

const EMPTY_DATASET: LearnDataset = { categories: [], introductionOrder: [] };

function download(filename: string, json: string) {
	const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
	const a = document.createElement('a');
	a.href = url;
	a.download = filename;
	a.click();
	URL.revokeObjectURL(url);
}

export default function PeopleLearnPage() {
	const [dataset, setDataset] = useState<LearnDataset | null>(null);
	const [building, setBuilding] = useState(false);
	const [loading, setLoading] = useState(false);
	const [buildMessage, setBuildMessage] = useState<string | null>(null);
	const [loadMessage, setLoadMessage] = useState<string | null>(null);
	const [warnings, setWarnings] = useState<string[]>([]);

	useEffect(() => {
		loadPeopleDeck().then(setDataset);
	}, []);

	async function handleBuild(e: React.ChangeEvent<HTMLInputElement>) {
		const files = Array.from(e.target.files ?? []);
		e.target.value = '';
		if (files.length === 0) return;
		setBuilding(true);
		setBuildMessage(null);
		try {
			const result = await buildPeopleDeck(files);
			download(`people-deck-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(result.dataset, null, 2));
			setBuildMessage(`Built ${result.itemCount} ${result.itemCount === 1 ? 'person' : 'people'}, ${result.promptCount} prompts. Save the download into your vault, then load it below on each device.`);
			setWarnings(result.warnings);
		} catch {
			setBuildMessage('Could not build a deck from those files — check they\'re valid .md notes.');
		} finally {
			setBuilding(false);
		}
	}

	async function handleLoad(e: React.ChangeEvent<HTMLInputElement>) {
		const file = e.target.files?.[0];
		e.target.value = '';
		if (!file) return;
		setLoading(true);
		setLoadMessage(null);
		try {
			const text = await file.text();
			const parsed = JSON.parse(text);
			if (!parsed || !Array.isArray(parsed.categories) || !Array.isArray(parsed.introductionOrder)) {
				throw new Error('not a people-deck.json');
			}
			const loaded: LearnDataset = parsed;
			await importPeopleDeck(loaded);
			setDataset(loaded);
			const itemCount = loaded.categories.reduce((n, c) => n + c.items.length, 0);
			setLoadMessage(`Loaded ${itemCount} ${itemCount === 1 ? 'person' : 'people'} onto this device.`);
		} catch {
			setLoadMessage('That file doesn\'t look like a people-deck.json.');
		} finally {
			setLoading(false);
		}
	}

	const config: LearnSystemConfig = {
		storageKey: PEOPLE_STORAGE_KEY,
		newPerDay: PEOPLE_NEW_PER_DAY,
		dueCap: PEOPLE_DUE_CAP,
		itemNoun: PEOPLE_ITEM_NOUN,
		monoAnswers: PEOPLE_MONO_ANSWERS,
		dataset: dataset ?? EMPTY_DATASET,
	};

	const itemCount = (dataset ?? EMPTY_DATASET).categories.reduce((n, c) => n + c.items.length, 0);

	return (
		<div className="people-page">
			{dataset !== null && itemCount === 0 && (
				<p className="people-page__empty">
					Nothing imported on this device yet — use "Load deck" below once you've built a
					<code>people-deck.json</code>.
				</p>
			)}

			<LearningSystem config={config} />

			<div className="people-manage">
				<div className="people-manage__panel">
					<p className="people-manage__title">Build deck file</p>
					<p className="people-manage__hint">
						Drop your <code>people/*.md</code> notes (plus any referenced photos) — parsed entirely in
						this browser, nothing uploaded. Downloads a self-contained <code>people-deck.json</code>;
						save it into the vault so it travels with your existing sync.
					</p>
					<label className="lq-button lq-import-label">
						{building ? 'Building…' : 'Choose files & build'}
						<input type="file" multiple accept=".md,.mdx,image/*" onChange={handleBuild} disabled={building} hidden />
					</label>
					{buildMessage && <p className="people-manage__message">{buildMessage}</p>}
					{warnings.length > 0 && (
						<ul className="people-manage__warnings">
							{warnings.map((w, i) => (
								<li key={i}>{w}</li>
							))}
						</ul>
					)}
				</div>

				<div className="people-manage__panel">
					<p className="people-manage__title">Load deck</p>
					<p className="people-manage__hint">
						Upload a <code>people-deck.json</code> (from the vault) to this device. Replaces whatever
						was loaded before; review state for people no longer in the file is dropped.
					</p>
					<label className="lq-button lq-import-label">
						{loading ? 'Loading…' : 'Choose people-deck.json'}
						<input type="file" accept="application/json" onChange={handleLoad} disabled={loading} hidden />
					</label>
					{loadMessage && <p className="people-manage__message">{loadMessage}</p>}
				</div>
			</div>
		</div>
	);
}
