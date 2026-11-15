/**
 * Learn mode for the 29 card game. After each finished trick it asks you to
 * update a running count. Two modes exist; LEARN_MODE picks the one in use:
 *   "points": points not yet played in each suit (J 3, 9 2, A 1, 10 1, so 7 a suit),
 *             your own cards included, plus trumps not yet played once you know trump.
 *   "cards":  every card of each suit still with the other three (the ranked list
 *             J 9 A 10 K Q 8 7, your own cards crossed off). Kept for later practice.
 * The questions only use what you can know: your own hand and the cards played.
 * See docs/pages/cards-29.md#learn-mode.
 */
import { SUITS, SUIT_INFO, RANK_ORDER, POINTS, reducer } from "./twentyNine.ts";
import type { Action, Card, GameState } from "./twentyNine.ts";

export type LearnMode = "points" | "cards";

export interface ModeInfo { name: string; remember: string; say: string; }

export const MODES: Record<LearnMode, ModeInfo> = {
    points: {
        name: "Points left",
        remember: "Each suit starts with 7 points: J 3, 9 2, A 1, 10 1. Take off each point card as it is played, yours included. Once you know trump, also count the trumps not yet played, starting from 8.",
        say: "Points: ♠ 7, ♥ 4, ♦ 2, ♣ 0. Trumps: 5.",
    },
    cards: {
        name: "Cards left",
        remember: "Keep the ranked list J 9 A 10 K Q 8 7 for each suit. Cross off your own cards at once and each card as it falls.",
        say: "Hearts left: A, 10, Q, 7.",
    },
};

// The mode used in play. Switch to "cards" to practise the full card list.
export const LEARN_MODE: LearnMode = "points";

export interface PointsRow { id: string; suit: string; label: string; max: number; answer: number; }

export interface Quiz {
    id: number;
    mode: LearnMode;
    question: string;
    rows: PointsRow[];          // mode "points": one number per row
    yoursIds: string[];         // mode "cards": marked "yours" and not pickable
    suits: string[];            // mode "cards": the suits asked, one after another
    answerIds: string[];        // mode "cards": the right picks
    noneLabel: string;          // mode "cards": check button text when nothing is picked
    explain: string;
    say: string;                // the short phrase to say to yourself
    result: { correct: boolean; picked: number[] | string[] } | null;
}

export interface Tally { asked: number; right: number; }
export const emptyTally: Tally = { asked: 0, right: 0 };

export type LearnAction =
    | { type: "SET_LEARN"; on: boolean }
    | { type: "ANSWER_QUIZ"; value: number[] | string[] }
    | { type: "CLOSE_QUIZ" };

const sym = (s: string) => SUIT_INFO[s].sym;
const plural = (s: string) => SUIT_INFO[s].name.toLowerCase();
const cardOf = (suit: string, rank: string): Card => ({ suit, rank, id: suit + rank });
const capital = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const blank = (mode: LearnMode, seq: number): Quiz => ({
    id: seq, mode, question: "", rows: [], yoursIds: [], suits: [], answerIds: [], noneLabel: "Check",
    explain: "", say: "", result: null,
});

export const trumpKnown = (state: GameState) => state.trumpSuit !== null && (state.caller === 0 || state.trumpRevealed);

/* ---------- What you could know ---------- */

const POINT_RANKS = RANK_ORDER.filter((r) => POINTS[r] > 0);

// Points of a suit not yet played, your own cards included.
export function pointsLeft(state: GameState, suit: string): number {
    const played = new Set(state.played);
    return POINT_RANKS.filter((r) => !played.has(suit + r)).reduce((sum, r) => sum + POINTS[r], 0);
}

// Trumps not yet played, your own included.
export const trumpsLeft = (state: GameState, t: string) => 8 - state.played.filter((id) => id[0] === t).length;

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

/* ---------- Points left ---------- */

// "Points left in each suit?" One number per suit, plus trumps not yet played once you know trump.
export function pointsQuiz(state: GameState, seq: number): Quiz {
    const q = blank("points", seq);
    const played = new Set(state.played);
    q.question = "Points not yet played in each suit, yours included. This trick counts as played.";
    q.rows = SUITS.map((s) => ({ id: s, suit: s, label: sym(s), max: 7, answer: pointsLeft(state, s) }));
    const lines = SUITS.map((s) => {
        const gone = POINT_RANKS.filter((r) => played.has(s + r));
        const left = POINT_RANKS.filter((r) => !played.has(s + r));
        const sum = (rs: string[]) => rs.map((r) => `${r} ${POINTS[r]}`).join(", ");
        return `${sym(s)}: ${gone.length ? `played ${sum(gone)}; ` : ""}`
            + (left.length ? `left ${sum(left)} = ${pointsLeft(state, s)}.` : "none left = 0.");
    });
    const says = [`Points: ${SUITS.map((s) => `${sym(s)} ${pointsLeft(state, s)}`).join(", ")}.`];
    if (trumpKnown(state)) {
        const t = state.trumpSuit!;
        const gone = state.played.filter((id) => id[0] === t).length;
        const left = trumpsLeft(state, t);
        q.rows.push({ id: "trump", suit: t, label: `Trumps ${sym(t)}`, max: 8, answer: left });
        lines.push(`Trumps ${sym(t)}: 8 − ${gone} played = ${left} not yet played.`);
        says.push(`Trumps: ${left}.`);
    }
    q.explain = lines.join("\n");
    q.say = says.join(" ");
    return q;
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
        ...blank("cards", seq), suits, noneLabel: "None left",
        question: "Which cards do the other three still hold? Cards on the table count as played.",
        yoursIds: suits.flatMap((s) => RANK_ORDER.map((r) => s + r)).filter((id) => mine.has(id)),
        answerIds: suits.flatMap((s) => cardsLeft(state, s).map((c) => c.id)),
        explain: lines.map((l) => l.explain).join("\n"),
        say: lines.map((l) => l.say).join("\n"),
    };
}

/* ---------- Choosing the moment ---------- */

// After each finished trick, before it clears: the moment the counts change.
// The last trick is skipped, since every card has then been played.
export function chooseQuiz(state: GameState, seq: number): Quiz | null {
    if (state.tricksPlayed >= 8) return null;
    return LEARN_MODE === "points" ? pointsQuiz(state, seq) : topQuiz(state, seq, 3);
}

export function checkAnswer(quiz: Quiz, value: number[] | string[]): boolean {
    if (quiz.mode === "points") return quiz.rows.every((row, i) => value[i] === row.answer);
    const picked = new Set(value as string[]);
    return picked.size === quiz.answerIds.length && quiz.answerIds.every((id) => picked.has(id));
}

/* ---------- Asking ---------- */

// One question per trick at most, keyed by the deal and the trick number.
const trickKey = (state: GameState) => `${state.dealSeq}-${state.tricksPlayed}`;

export function isAskMoment(state: GameState): boolean {
    return state.learnOn && !state.quiz && state.phase === "playing"
        && state.trick.length === 4 && state.quizKey !== trickKey(state);
}

function askNow(state: GameState): GameState {
    if (!isAskMoment(state)) return state;
    const seq = (state.quizSeq || 0) + 1;
    const quiz = chooseQuiz(state, seq);
    if (!quiz) return { ...state, quizKey: trickKey(state) };
    return { ...state, quiz, quizSeq: seq, quizKey: trickKey(state), learnMark: state.played.length };
}

const bump = (t: Tally | undefined, correct: boolean): Tally =>
    ({ asked: (t?.asked ?? 0) + 1, right: (t?.right ?? 0) + (correct ? 1 : 0) });

const isTally = (t: unknown): t is Tally =>
    typeof t === "object" && t !== null && typeof (t as Tally).asked === "number" && typeof (t as Tally).right === "number";

// Older saves kept a tally per skill; the cards-left one carries over.
const loadTally = (t: unknown): Tally => isTally(t) ? t : isTally((t as { top?: unknown })?.top) ? (t as { top: Tally }).top : emptyTally;

// Fixes a game saved by an older version: an open question is dropped, old fields removed.
export function cleanLoaded(state: GameState): GameState {
    const old = state as GameState & { learnMarks?: { top?: number }; learnSkills?: unknown; learnLastTrick?: unknown };
    const q = state.quiz as Quiz | null;
    const quizOk = q !== null && q.mode === LEARN_MODE && Array.isArray(q.rows) && Array.isArray(q.answerIds);
    const { learnMarks: _m, learnSkills: _l, learnLastTrick: _t, ...rest } = old;
    return {
        ...rest,
        learnMark: typeof state.learnMark === "number" ? state.learnMark : old.learnMarks?.top ?? null,
        learnStats: loadTally(state.learnStats), handStats: loadTally(state.handStats),
        quiz: quizOk ? q : null, quizKey: quizOk ? state.quizKey : "",
    };
}

// Wraps the game reducer: asks a question when a trick finishes.
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
            return { ...reducer(state, action), quiz: null, handStats: emptyTally, learnMark: null };
        default:
            return askNow(reducer(state, action));
    }
}
