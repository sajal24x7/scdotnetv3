/**
 * Learn mode for the 29 card game: counting drills asked between tricks.
 * The questions only use what the player can know: their own hand and the
 * cards already played. See docs/pages/cards-29.md#learn-mode.
 */
import {
    SUITS, SUIT_INFO, RANK_ORDER, POINTS, rankIdx, cardLabel, isBoss, reducer,
} from "./twentyNine.ts";
import type { Action, Card, GameState } from "./twentyNine.ts";

export type Skill = "trick" | "left" | "power" | "suit" | "boss" | "recall";

export interface LearnLevel { id: number; skills: Skill[]; name: string; desc: string; }

export const LEARN_LEVELS: LearnLevel[] = [
    { id: 1, skills: ["trick"], name: "Trick points", desc: "Add up the points in the trick that just ended. Learn J=3, 9=2, A=1, 10=1." },
    { id: 2, skills: ["left"], name: "Points left", desc: "Keep a running count of the 28 card points still to be played." },
    { id: 3, skills: ["power"], name: "Jacks and 9s", desc: "Track the eight big cards. Which ones do the others still hold?" },
    { id: 4, skills: ["suit"], name: "Suit count", desc: "Count how many cards of a suit are still with the others. Trump first." },
    { id: 5, skills: ["boss"], name: "Boss cards", desc: "Spot which of your cards can no longer be beaten in their suit." },
    { id: 6, skills: ["recall"], name: "Full recall", desc: "Name exactly which cards of a suit are still out." },
    { id: 7, skills: ["trick", "left", "power", "suit", "boss", "recall"], name: "Mixed", desc: "Any of the above, at random. Count everything." },
];

export const levelInfo = (id: number | null) => LEARN_LEVELS.find((l) => l.id === id) ?? null;

export interface Quiz {
    id: number;
    skill: Skill;
    question: string;
    kind: "number" | "cards";
    options: number[];          // kind "number"
    answer: number;             // kind "number"
    pool: Card[];               // kind "cards": cards shown to pick from
    lockedIds: string[];        // kind "cards": shown as "yours", not pickable
    answerIds: string[];        // kind "cards": the right picks
    explain: string;
    result: { correct: boolean; picked: number | string[] } | null;
}

export interface Tally { asked: number; right: number; }
export type LearnStats = Record<string, Tally>;

export type LearnAction =
    | { type: "SET_LEARN"; level: number | null }
    | { type: "ANSWER_QUIZ"; value: number | string[] }
    | { type: "CLOSE_QUIZ" };

const sym = (s: string) => SUIT_INFO[s].sym;
const list = (cards: Card[]) => (cards.length ? cards.map(cardLabel).join(" ") : "none");
const byRank = (a: Card, b: Card) => rankIdx(a.rank) - rankIdx(b.rank);
const cardOf = (suit: string, rank: string): Card => ({ suit, rank, id: suit + rank });
const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

// Four close choices around the answer, in order.
export function nearOptions(answer: number, min: number, max: number): number[] {
    const set = new Set([answer]);
    const offsets = [-1, 1, -2, 2, -3, 3, 4, -4, 5];
    for (const o of offsets.sort(() => Math.random() - 0.5)) {
        if (set.size >= 4) break;
        const v = answer + o;
        if (v >= min && v <= max) set.add(v);
    }
    return [...set].sort((a, b) => a - b);
}

function base(skill: Skill, seq: number): Quiz {
    return {
        id: seq, skill, question: "", kind: "number", options: [], answer: 0,
        pool: [], lockedIds: [], answerIds: [], explain: "", result: null,
    };
}

// Cards of a suit nobody has played yet and that are not in the player's hand.
function outWithOthers(state: GameState, suit: string): Card[] {
    const mine = new Set(state.hands[0].map((c) => c.id));
    const played = new Set(state.played);
    return RANK_ORDER.map((r) => cardOf(suit, r)).filter((c) => !mine.has(c.id) && !played.has(c.id));
}

const trumpKnown = (state: GameState) => state.trumpSuit !== null && (state.caller === 0 || state.trumpRevealed);

// Prefer trump when the player knows it, else a suit that has been played.
function chooseSuit(state: GameState, trumpBias: number): string {
    if (trumpKnown(state) && Math.random() < trumpBias) return state.trumpSuit!;
    const played = (s: string) => state.played.filter((id) => id[0] === s).length;
    const opened = SUITS.filter((s) => played(s) > 0 && played(s) < 8);
    return opened.length ? pick(opened) : pick(SUITS);
}

export function makeQuiz(state: GameState, skill: Skill, seq: number): Quiz | null {
    const q = base(skill, seq);
    const myHand = state.hands[0];
    switch (skill) {
        case "trick": {
            const trick = state.prevTrick;
            if (trick.length !== 4) return null;
            const total = trick.reduce((s, t) => s + POINTS[t.card.rank], 0);
            q.question = "How many points were in the trick that just ended?";
            q.answer = total;
            q.options = nearOptions(total, 0, 12);
            q.explain = trick.map((t) => `${cardLabel(t.card)} ${POINTS[t.card.rank]}`).join(" + ") + ` = ${total}.`;
            return q;
        }
        case "left": {
            const playedPts = state.played.reduce((s, id) => s + POINTS[id.slice(1)], 0);
            const left = 28 - playedPts;
            const mine = myHand.reduce((s, c) => s + POINTS[c.rank], 0);
            q.question = "How many of the 28 card points have not been played yet?";
            q.answer = left;
            q.options = nearOptions(left, 0, 28);
            q.explain = `${playedPts} played so far, so 28 − ${playedPts} = ${left} left. You hold ${mine} of them, so the others hold ${left - mine}.`;
            return q;
        }
        case "power": {
            const pool = SUITS.flatMap((s) => [cardOf(s, "J"), cardOf(s, "9")]);
            const mine = new Set(myHand.map((c) => c.id));
            const played = pool.filter((c) => state.played.includes(c.id));
            q.kind = "cards";
            q.question = "Tap the Jacks and 9s the other players still hold.";
            q.pool = pool;
            q.lockedIds = pool.filter((c) => mine.has(c.id)).map((c) => c.id);
            q.answerIds = pool.filter((c) => !mine.has(c.id) && !state.played.includes(c.id)).map((c) => c.id);
            q.explain = `Played: ${list(played)}. Yours: ${list(pool.filter((c) => mine.has(c.id)))}. Still out: ${list(pool.filter((c) => q.answerIds.includes(c.id)))}.`;
            return q;
        }
        case "suit": {
            const suit = chooseSuit(state, 0.6);
            const isTrump = trumpKnown(state) && suit === state.trumpSuit;
            const played = state.played.filter((id) => id[0] === suit).length;
            const mine = myHand.filter((c) => c.suit === suit).length;
            const out = 8 - played - mine;
            const name = `${sym(suit)} ${SUIT_INFO[suit].name}${isTrump ? " (trump)" : ""}`;
            q.question = `How many ${name} do the other players still hold?`;
            q.answer = out;
            q.options = [0, 1, 2, 3, 4, 5, 6, 7, 8];
            q.explain = `8 ${sym(suit)} in the deck. ${played} played, ${mine} in your hand, so 8 − ${played} − ${mine} = ${out} with the others.`;
            return q;
        }
        case "boss": {
            if (myHand.length < 2) return null;
            const hand = [...myHand].sort((a, b) => SUITS.indexOf(a.suit) - SUITS.indexOf(b.suit) || byRank(a, b));
            const seen = new Set([...state.played, ...myHand.map((c) => c.id)]);
            const notes = hand.map((c) => {
                const higher = RANK_ORDER.slice(0, rankIdx(c.rank)).filter((r) => !seen.has(c.suit + r));
                return higher.length
                    ? `${cardLabel(c)} loses to ${higher.map((r) => r + sym(c.suit)).join(", ")}`
                    : `${cardLabel(c)} is boss`;
            });
            q.kind = "cards";
            q.question = "Tap every card in your hand that is the highest left in its suit (ignore trumping).";
            q.pool = hand;
            q.answerIds = hand.filter((c) => isBoss(c, state, myHand)).map((c) => c.id);
            q.explain = notes.join(". ") + ".";
            return q;
        }
        case "recall": {
            const suit = chooseSuit(state, 0.5);
            const pool = RANK_ORDER.map((r) => cardOf(suit, r));
            const mine = new Set(myHand.map((c) => c.id));
            const out = outWithOthers(state, suit);
            q.kind = "cards";
            q.question = `Tap the ${sym(suit)} ${SUIT_INFO[suit].name} the other players still hold.`;
            q.pool = pool;
            q.lockedIds = pool.filter((c) => mine.has(c.id)).map((c) => c.id);
            q.answerIds = out.map((c) => c.id);
            q.explain = `Played: ${list(pool.filter((c) => state.played.includes(c.id)))}. Still out: ${list(out)}.`;
            return q;
        }
    }
}

export function checkAnswer(quiz: Quiz, value: number | string[]): boolean {
    if (quiz.kind === "number") return value === quiz.answer;
    const picked = new Set(value as string[]);
    return picked.size === quiz.answerIds.length && quiz.answerIds.every((id) => picked.has(id));
}

// Accuracy at a level, for the start screen.
export function levelTally(stats: LearnStats, level: number): Tally {
    return stats[String(level)] ?? { asked: 0, right: 0 };
}

function askNext(state: GameState): GameState {
    const level = levelInfo(state.learnLevel);
    if (!level || state.phase !== "playing" || state.tricksPlayed >= 8) return state;
    const seq = (state.quizSeq || 0) + 1;
    // Try the level's skills in random order until one fits this moment.
    for (const skill of [...level.skills].sort(() => Math.random() - 0.5)) {
        const quiz = makeQuiz(state, skill, seq);
        if (quiz) return { ...state, quiz, quizSeq: seq };
    }
    return state;
}

// Wraps the game reducer: adds a counting question after each trick.
export function learnReducer(state: GameState, action: Action): GameState {
    switch (action.type) {
        case "SET_LEARN":
            return { ...state, learnLevel: action.level, quiz: null };
        case "ANSWER_QUIZ": {
            const quiz = state.quiz;
            if (!quiz || quiz.result) return state;
            const correct = checkAnswer(quiz, action.value);
            const key = String(state.learnLevel);
            const prev = levelTally(state.learnStats, state.learnLevel!);
            return {
                ...state,
                quiz: { ...quiz, result: { correct, picked: action.value } },
                learnStats: { ...state.learnStats, [key]: { asked: prev.asked + 1, right: prev.right + (correct ? 1 : 0) } },
                handLearn: { asked: state.handLearn.asked + 1, right: state.handLearn.right + (correct ? 1 : 0) },
            };
        }
        case "CLOSE_QUIZ":
            return { ...state, quiz: null };
        case "CLEAR_TRICK":
            return askNext(reducer(state, action));
        case "DEAL":
        case "NEW_MATCH":
            return { ...reducer(state, action), quiz: null, handLearn: { asked: 0, right: 0 } };
        default:
            return reducer(state, action);
    }
}
