import React, { useMemo, useState } from 'react';
import { categories, type Category, type Command } from '../../data/linux-commands';

const SESSION_SIZE = 5;
const PROGRESS_KEY = 'linux-learn-progress';

interface Progress {
	totalSessions: number;
	streak: number;
	lastCompletedDate: string | null;
	bestScoreByCategory: Record<string, number>;
}

function loadProgress(): Progress {
	const fallback: Progress = { totalSessions: 0, streak: 0, lastCompletedDate: null, bestScoreByCategory: {} };
	if (typeof window === 'undefined') return fallback;
	try {
		const raw = window.localStorage.getItem(PROGRESS_KEY);
		if (!raw) return fallback;
		return { ...fallback, ...JSON.parse(raw) };
	} catch {
		return fallback;
	}
}

function saveProgress(progress: Progress) {
	if (typeof window === 'undefined') return;
	try {
		window.localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
	} catch {
		// localStorage unavailable (private mode etc) — skip persisting silently.
	}
}

function daysBetween(a: string, b: string): number {
	const msPerDay = 24 * 60 * 60 * 1000;
	return Math.round((new Date(b).getTime() - new Date(a).getTime()) / msPerDay);
}

function shuffle<T>(arr: T[]): T[] {
	const copy = [...arr];
	for (let i = copy.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[copy[i], copy[j]] = [copy[j], copy[i]];
	}
	return copy;
}

function buildSession(category: Category | null): Command[] {
	if (category) {
		return shuffle(category.commands).slice(0, SESSION_SIZE);
	}
	const pool = categories.flatMap((c) => c.commands);
	return shuffle(pool).slice(0, SESSION_SIZE);
}

type Phase = 'learn' | 'quiz';
type Screen = 'home' | 'session' | 'summary';

interface Attempt {
	command: Command;
	selectedIndex: number;
	correct: boolean;
}

export default function LinuxQuiz() {
	const [screen, setScreen] = useState<Screen>('home');
	const [activeCategory, setActiveCategory] = useState<Category | null>(null);
	const [session, setSession] = useState<Command[]>([]);
	const [stepIndex, setStepIndex] = useState(0);
	const [phase, setPhase] = useState<Phase>('learn');
	const [selectedOption, setSelectedOption] = useState<number | null>(null);
	const [attempts, setAttempts] = useState<Attempt[]>([]);
	const [progress, setProgress] = useState<Progress>(() => loadProgress());

	const currentCommand = session[stepIndex];

	function startSession(category: Category | null) {
		setActiveCategory(category);
		setSession(buildSession(category));
		setStepIndex(0);
		setPhase('learn');
		setSelectedOption(null);
		setAttempts([]);
		setScreen('session');
	}

	function selectAnswer(index: number) {
		if (selectedOption !== null) return;
		setSelectedOption(index);
		const correct = index === currentCommand.quiz.correctIndex;
		setAttempts((prev) => [...prev, { command: currentCommand, selectedIndex: index, correct }]);
	}

	function nextStep() {
		if (stepIndex + 1 < session.length) {
			setStepIndex((i) => i + 1);
			setPhase('learn');
			setSelectedOption(null);
		} else {
			finishSession();
		}
	}

	function finishSession() {
		const correctCount = attempts.filter((a) => a.correct).length;
		const today = new Date().toISOString().slice(0, 10);
		setProgress((prev) => {
			let streak = prev.streak;
			if (!prev.lastCompletedDate) {
				streak = 1;
			} else {
				const diff = daysBetween(prev.lastCompletedDate, today);
				if (diff === 0) streak = prev.streak || 1;
				else if (diff === 1) streak = prev.streak + 1;
				else streak = 1;
			}
			const bestScoreByCategory = { ...prev.bestScoreByCategory };
			if (activeCategory) {
				const key = activeCategory.id;
				bestScoreByCategory[key] = Math.max(bestScoreByCategory[key] ?? 0, correctCount);
			}
			const next: Progress = {
				totalSessions: prev.totalSessions + 1,
				streak,
				lastCompletedDate: today,
				bestScoreByCategory,
			};
			saveProgress(next);
			return next;
		});
		setScreen('summary');
	}

	const score = attempts.filter((a) => a.correct).length;

	if (screen === 'home') {
		return (
			<HomeScreen
				progress={progress}
				onStartCategory={(c) => startSession(c)}
				onStartMixed={() => startSession(null)}
			/>
		);
	}

	if (screen === 'summary') {
		return (
			<SummaryScreen
				attempts={attempts}
				categoryTitle={activeCategory ? activeCategory.title : 'Mixed session'}
				onRetry={() => startSession(activeCategory)}
				onMixed={() => startSession(null)}
				onHome={() => setScreen('home')}
			/>
		);
	}

	if (!currentCommand) return null;

	return (
		<SessionScreen
			command={currentCommand}
			stepIndex={stepIndex}
			total={session.length}
			phase={phase}
			selectedOption={selectedOption}
			score={score}
			categoryTitle={activeCategory ? activeCategory.title : 'Mixed session'}
			onReveal={() => setPhase('quiz')}
			onSelect={selectAnswer}
			onNext={nextStep}
			onQuit={() => setScreen('home')}
		/>
	);
}

function HomeScreen({
	progress,
	onStartCategory,
	onStartMixed,
}: {
	progress: Progress;
	onStartCategory: (category: Category) => void;
	onStartMixed: () => void;
}) {
	return (
		<div className="lq-home">
			{progress.totalSessions > 0 && (
				<div className="lq-stats">
					<div className="lq-stat">
						<span className="lq-stat__value">{progress.totalSessions}</span>
						<span className="lq-stat__label">sessions completed</span>
					</div>
					<div className="lq-stat">
						<span className="lq-stat__value">{progress.streak}</span>
						<span className="lq-stat__label">day streak</span>
					</div>
				</div>
			)}

			<button type="button" className="lq-mixed-card" onClick={onStartMixed}>
				<span className="lq-mixed-card__icon">🔀</span>
				<span>
					<span className="lq-mixed-card__title">Mixed session</span>
					<span className="lq-mixed-card__desc">5 random commands pulled from every category.</span>
				</span>
				<span className="lq-card__arrow">→</span>
			</button>

			<div className="lq-grid">
				{categories.map((category) => {
					const best = progress.bestScoreByCategory[category.id];
					return (
						<button
							type="button"
							key={category.id}
							className="lq-card"
							onClick={() => onStartCategory(category)}
						>
							<span className="lq-card__icon">{category.emoji}</span>
							<span className="lq-card__body">
								<span className="lq-card__title">{category.title}</span>
								<span className="lq-card__desc">{category.description}</span>
								<span className="lq-card__meta">
									{category.commands.length} commands{best !== undefined ? ` · best ${best}/5` : ''}
								</span>
							</span>
							<span className="lq-card__arrow">→</span>
						</button>
					);
				})}
			</div>
		</div>
	);
}

function SessionScreen({
	command,
	stepIndex,
	total,
	phase,
	selectedOption,
	score,
	categoryTitle,
	onReveal,
	onSelect,
	onNext,
	onQuit,
}: {
	command: Command;
	stepIndex: number;
	total: number;
	phase: Phase;
	selectedOption: number | null;
	score: number;
	categoryTitle: string;
	onReveal: () => void;
	onSelect: (index: number) => void;
	onNext: () => void;
	onQuit: () => void;
}) {
	const isLast = stepIndex + 1 === total;
	const answered = selectedOption !== null;
	const isCorrect = answered && selectedOption === command.quiz.correctIndex;

	return (
		<div className="lq-session">
			<div className="lq-session__header">
				<button type="button" className="lq-quit" onClick={onQuit} aria-label="Back to sessions">
					← {categoryTitle}
				</button>
				<div className="lq-progress" aria-label={`Step ${stepIndex + 1} of ${total}`}>
					{Array.from({ length: total }).map((_, i) => (
						<span
							key={i}
							className={
								'lq-progress__dot' +
								(i < stepIndex ? ' lq-progress__dot--done' : '') +
								(i === stepIndex ? ' lq-progress__dot--active' : '')
							}
						/>
					))}
				</div>
				<span className="lq-score">Score: {score}</span>
			</div>

			{phase === 'learn' ? (
				<div className="lq-panel">
					<p className="lq-eyebrow">Command {stepIndex + 1} of {total}</p>
					<code className="lq-command">{command.syntax}</code>
					<p className="lq-description">{command.description}</p>
					<div className="lq-example">
						<code>{command.example}</code>
						<p className="lq-example__note">{command.exampleNote}</p>
					</div>
					<button type="button" className="lq-button lq-button--primary" onClick={onReveal}>
						Quiz me →
					</button>
				</div>
			) : (
				<div className="lq-panel">
					<p className="lq-eyebrow">Quick check</p>
					<p className="lq-question">{command.quiz.question}</p>
					<div className="lq-options">
						{command.quiz.options.map((option, index) => {
							let cls = 'lq-option';
							if (answered) {
								if (index === command.quiz.correctIndex) cls += ' lq-option--correct';
								else if (index === selectedOption) cls += ' lq-option--incorrect';
								else cls += ' lq-option--disabled';
							}
							return (
								<button
									type="button"
									key={index}
									className={cls}
									onClick={() => onSelect(index)}
									disabled={answered}
								>
									{option}
								</button>
							);
						})}
					</div>

					{answered && (
						<div className={'lq-feedback' + (isCorrect ? ' lq-feedback--correct' : ' lq-feedback--incorrect')}>
							<p className="lq-feedback__headline">{isCorrect ? 'Correct.' : 'Not quite.'}</p>
							<p>{command.quiz.explanation}</p>
							<button type="button" className="lq-button lq-button--primary" onClick={onNext}>
								{isLast ? 'See results →' : 'Next command →'}
							</button>
						</div>
					)}
				</div>
			)}
		</div>
	);
}

function SummaryScreen({
	attempts,
	categoryTitle,
	onRetry,
	onMixed,
	onHome,
}: {
	attempts: Attempt[];
	categoryTitle: string;
	onRetry: () => void;
	onMixed: () => void;
	onHome: () => void;
}) {
	const score = attempts.filter((a) => a.correct).length;
	const total = attempts.length;

	return (
		<div className="lq-summary">
			<p className="lq-eyebrow">{categoryTitle}</p>
			<h2 className="lq-summary__score">
				{score} / {total}
			</h2>
			<p className="lq-summary__message">
				{score === total
					? 'Perfect session. All five stuck.'
					: score >= total * 0.6
						? 'Solid session — review the misses below.'
						: 'Worth another pass. Repetition is what makes it stick.'}
			</p>

			<ul className="lq-summary__list">
				{attempts.map((attempt, i) => (
					<li key={i} className={'lq-summary__item' + (attempt.correct ? '' : ' lq-summary__item--wrong')}>
						<span className="lq-summary__icon">{attempt.correct ? '✓' : '✗'}</span>
						<code>{attempt.command.cmd}</code>
						<span className="lq-summary__q">{attempt.command.quiz.question}</span>
					</li>
				))}
			</ul>

			<div className="lq-summary__actions">
				<button type="button" className="lq-button lq-button--primary" onClick={onRetry}>
					Retry this session
				</button>
				<button type="button" className="lq-button" onClick={onMixed}>
					Try a mixed session
				</button>
				<button type="button" className="lq-button" onClick={onHome}>
					Back to sessions
				</button>
			</div>
		</div>
	);
}
