/**
 * Learn mode for the 29 card game. It trains one thing: the cards of each suit
 * still with the other three. You keep the ranked list J 9 A 10 K Q 8 7 per suit,
 * take your own cards off at once and cross cards off as they fall.
 * Before each of your turns it looks at what has been played since it last asked
 * and asks when the lists have moved on, or nothing on a quiet turn.
 * The questions only use what you can know: your own hand and the cards played.
 * See docs/pages/cards-29.md#learn-mode.
 */
import { SUITS, SUIT_INFO, RANK_ORDER, reducer } from "./twentyNine.ts";
import type { Action, Card, GameState } from "./twentyNine.ts";

export const LEARN_NAME = "Cards left";
export const LEARN_REMEMBER = "Keep the ranked list J 9 A 10 K Q 8 7 for each suit. Cross off your own cards at once and each card as it falls.";
export const LEARN_SAY = "Hearts left: A, 10, Q, 7.";

export interface Quiz {
    id: number;
    question: string;
    yoursIds: string[];         // marked "yours" and not pickable
    suits: string[];            // the suits asked, one after another
    answerIds: string[];        // the right picks
    noneLabel: string;          // check button text when nothing is picked
    explain: string;
    say: string;                // the short phrase to say to yourself
    result: { correct: boolean; picked: string[] } | null;
}

export interface Tally { asked: number; right: number; }
export const emptyTally: Tally = { asked: 0, right: 0 };

export type LearnAction =
    | { type: "SET_LEARN"; on: boolean }
    | { type: "ANSWER_QUIZ"; value: string[] }
    | { type: "CLOSE_QUIZ" };

const sym = (s: string) => SUIT_INFO[s].sym;
const plural = (s: string) => SUIT_INFO[s].name.toLowerCase();
const cardOf = (suit: string, rank: string): Card => ({ suit, rank, id: suit + rank });
const capital = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/* ---------- What you could know ---------- */

// Highest card of a suit not in `gone`, or null when the whole suit is gone.
function topOf(suit: string, gone: Set<string>): Card | null {
    const r = RANK_ORDER.find((rank) => !gone.has(suit + rank));
    return r ? cardOf(suit, r) : null;
}

export const topLeft = (state: GameState, suit: string) => topOf(suit, new Set(state.played));

// A suit is asked while any of its cards is unplayed.
const suitLive = (state: GameState, suit: string) => RANK_ORDER.some((r) => !state.played.includes(suit + r));

// Cards of a suit still with the other three: the ranked list minus played cards and your own.
export function cardsLeft(state: GameState, suit: string): Card[] {
    const gone = new Set([...state.played, ...state.hands[0].map((c) => c.id)]);
    return RANK_ORDER.filter((r) => !gone.has(suit + r)).map((r) => cardOf(suit, r));
}

/* ---------- Questions ---------- */

// Which suits to ask: the led suit first when following, then the suits that changed most
// since last asked. Suits with no unplayed cards are skipped.
export function listSuits(state: GameState, max: number): string[] {
    const mark = state.learnMark ?? 0;
    const since = (s: string) => state.played.slice(mark).filter((id) => id[0] === s).length;
    const total = (s: string) => state.played.filter((id) => id[0] === s).length;
    const lead = state.trick.length ? state.leadSuit : null;
    const live = SUITS.filter((s) => suitLive(state, s))
        .sort((a, b) => Number(b === lead) - Number(a === lead) || since(b) - since(a) || total(b) - total(a));
    const changed = live.filter((s) => s === lead || since(s) > 0);
    return (changed.length ? changed : live).slice(0, max);
}

// "Diamonds left?" You build the list from blank with a strip of rank buttons, one suit at a time.
// Your own cards are marked and cannot be picked.
export function topQuiz(state: GameState, seq: number, max = 1): Quiz | null {
    const suits = listSuits(state, max);
    if (!suits.length) return null;
    const mine = new Set(state.hands[0].map((c) => c.id));
    const played = new Set(state.played);
    const ranks = (ids: string[]) => ids.map((id) => id.slice(1)).join(" ");
    const lines = suits.map((s) => {
        const ids = RANK_ORDER.map((r) => s + r);
        const gone = ids.filter((id) => played.has(id));
        const yours = ids.filter((id) => mine.has(id));
        const left = cardsLeft(state, s);
        const top = topLeft(state, s);
        const myTop = top !== null && mine.has(top.id) ? top.rank : null;
        const parts = [`${sym(s)}:`];
        if (gone.length) parts.push(`played ${ranks(gone)},`);
        if (yours.length) parts.push(`yours ${ranks(yours)},`);
        parts.push(left.length ? `left ${left.map((c) => c.rank).join(" ")}.` : "none left.");
        if (myTop) parts.push(`Your ${myTop} is top.`);
        return {
            explain: parts.join(" "),
            say: `${capital(plural(s))} left: ${left.length ? left.map((c) => c.rank).join(", ") : "none"}.` + (myTop ? ` My ${myTop} is top.` : ""),
        };
    });
    // One line per suit; the panel keeps the line breaks.
    return {
        id: seq, suits, noneLabel: "None left", result: null,
        question: "Which cards do the other three still hold? Cards on the table count as played.",
        yoursIds: suits.flatMap((s) => RANK_ORDER.map((r) => s + r)).filter((id) => mine.has(id)),
        answerIds: suits.flatMap((s) => cardsLeft(state, s).map((c) => c.id)),
        explain: lines.map((l) => l.explain).join("\n"),
        say: lines.map((l) => l.say).join("\n"),
    };
}

/* ---------- Choosing the moment ---------- */

// The question to ask now, or null. Counts the cards played since last asked:
// a full trick means the lists have moved on, and a busy lead asks up to three suits in a row.
// A quiet recap (leading, a card or two since last asked) is skipped after a question last turn.
export function chooseQuiz(state: GameState, seq: number): Quiz | null {
    const leading = state.trick.length === 0;
    const mark = state.learnMark;
    if (mark === null || mark === undefined) return topQuiz(state, seq);
    const fresh = state.played.length - mark;
    if (fresh >= 4) return topQuiz(state, seq, leading ? 3 : 1);
    const askedLastTurn = state.learnLastTrick === state.tricksPlayed - 1;
    if (fresh > 0 && leading && !askedLastTurn) return topQuiz(state, seq);
    return null;
}

export function checkAnswer(quiz: Quiz, value: string[]): boolean {
    const picked = new Set(value);
    return picked.size === quiz.answerIds.length && quiz.answerIds.every((id) => picked.has(id));
}

/* ---------- Asking ---------- */

// One question per turn at most, keyed by the deal and the trick number.
const turnKey = (state: GameState) => `${state.dealSeq}-${state.tricksPlayed}`;

export function isAskMoment(state: GameState): boolean {
    return state.learnOn && !state.quiz && state.phase === "playing"
        && state.turn === 0 && state.trick.length < 4 && state.quizKey !== turnKey(state);
}

function askNow(state: GameState): GameState {
    if (!isAskMoment(state)) return state;
    const seq = (state.quizSeq || 0) + 1;
    const quiz = chooseQuiz(state, seq);
    if (!quiz) return { ...state, quizKey: turnKey(state) };
    return {
        ...state, quiz, quizSeq: seq, quizKey: turnKey(state), learnLastTrick: state.tricksPlayed,
        learnMark: state.played.length,
    };
}

const bump = (t: Tally | undefined, correct: boolean): Tally =>
    ({ asked: (t?.asked ?? 0) + 1, right: (t?.right ?? 0) + (correct ? 1 : 0) });

const isTally = (t: unknown): t is Tally =>
    typeof t === "object" && t !== null && typeof (t as Tally).asked === "number" && typeof (t as Tally).right === "number";

// Older saves kept a tally per skill; only the cards-left one carries over.
const loadTally = (t: unknown): Tally => isTally(t) ? t : isTally((t as { top?: unknown })?.top) ? (t as { top: Tally }).top : emptyTally;

// Fixes a game saved by an older version: old question types, old stats and missing fields.
export function cleanLoaded(state: GameState): GameState {
    const old = state as GameState & { learnMarks?: { top?: number }; learnSkills?: unknown };
    const q = state.quiz as (Quiz & { skill?: string; kind?: string }) | null;
    const quizOk = q && (q.skill === undefined || q.skill === "top") && (q.kind === undefined || q.kind === "list")
        && Array.isArray(q.suits) && Array.isArray(q.answerIds);
    let quiz: Quiz | null = null;
    if (quizOk) {
        const { skill: _s, kind: _k, ...rest } = q as Quiz & { skill?: string; kind?: string };
        quiz = rest;
    }
    const { learnMarks: _m, learnSkills: _l, ...rest } = old;
    return {
        ...rest,
        learnMark: typeof state.learnMark === "number" ? state.learnMark : old.learnMarks?.top ?? null,
        learnLastTrick: state.learnLastTrick ?? -9,
        learnStats: loadTally(state.learnStats), handStats: loadTally(state.handStats),
        quiz, quizKey: quizOk ? state.quizKey : "",
    };
}

// Wraps the game reducer: asks a question when your turn comes up and the moment fits.
export function learnReducer(state: GameState, action: Action): GameState {
    switch (action.type) {
        case "SET_LEARN":
            return askNow({ ...state, learnOn: action.on, quiz: null, quizKey: action.on ? state.quizKey : "" });
        case "ANSWER_QUIZ": {
            const quiz = state.quiz;
            if (!quiz || quiz.result) return state;
            const correct = checkAnswer(quiz, action.value);
            return {
                ...state,
                quiz: { ...quiz, result: { correct, picked: action.value } },
                learnStats: bump(state.learnStats, correct),
                handStats: bump(state.handStats, correct),
            };
        }
        case "CLOSE_QUIZ":
            return { ...state, quiz: null };
        case "DEAL":
        case "NEW_MATCH":
            return { ...reducer(state, action), quiz: null, handStats: emptyTally, learnMark: null, learnLastTrick: -9 };
        default:
            return askNow(reducer(state, action));
    }
}
