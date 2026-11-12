/**
 * Learn mode for the 29 card game: a ladder of nine rungs, each adding one
 * thing to remember. Before each of your turns it asks one question from
 * your rung, mixed with review questions from the rungs below.
 * The questions only use what you can know: your own hand, the cards
 * already played and who has failed to follow suit.
 * See docs/pages/cards-29.md#learn-mode.
 */
import {
    SUITS, SUIT_INFO, RANK_ORDER, POINTS, rankIdx, cardLabel, reducer,
} from "./twentyNine.ts";
import type { Action, Card, GameState } from "./twentyNine.ts";

export type Skill = "jn" | "voids" | "long" | "second" | "suits" | "at" | "guess" | "trump" | "points";

export interface Rung { id: Skill; level: number; name: string; remember: string; say: string; }

// The ladder, lowest rung first. Shown on the start screen and in the docs.
export const RUNGS: Rung[] = [
    { id: "jn", level: 1, name: "J's and 9's", remember: "Which J's and 9's are gone.", say: "Heart 9 gone." },
    { id: "voids", level: 2, name: "Voids", remember: "Who has run out of which suit.", say: "West out of clubs." },
    { id: "long", level: 3, name: "Your longest suit", remember: "How many cards are left in that one suit.", say: "3 hearts left." },
    { id: "second", level: 4, name: "A second suit", remember: "The count for the suit where you hold an A or 10.", say: "2 spades left." },
    { id: "suits", level: 5, name: "All four suits", remember: "How many are left in every suit.", say: "Clubs down to 1." },
    { id: "at", level: 6, name: "A's and 10's", remember: "Which A's and 10's are gone. Now you know every point card.", say: "Diamond A gone." },
    { id: "guess", level: 7, name: "Guess the trump", remember: "Which suits the bidder leads and which they throw away.", say: "Bidder threw a club, not clubs." },
    { id: "trump", level: 8, name: "Count trumps", remember: "Once trump is shown, how many trumps are left.", say: "Trump is spades, 3 left." },
    { id: "points", level: 9, name: "Points", remember: "Points each team has won versus the bid.", say: "We have 12, they need 18." },
];
export const TOP_LEVEL = RUNGS.length;

export const rungOf = (s: Skill) => RUNGS.find((r) => r.id === s)!;
export const rungAt = (level: number) => RUNGS[Math.min(TOP_LEVEL, Math.max(1, level)) - 1];
export const skillName = (s: Skill) => rungOf(s).name;

// Moving up: at least READY_MIN of the last RECENT answers on a rung, at READY_RATE or better.
export const RECENT = 10;
export const READY_MIN = 8;
export const READY_RATE = 0.8;
// Share of questions from your own rung in mixed practice. The rest review lower rungs.
const OWN_SHARE = 0.6;

export interface Quiz {
    id: number;
    skill: Skill;
    question: string;
    kind: "number" | "cards" | "pick";
    options: number[];          // kind "number"
    answer: number;             // kind "number"
    pool: Card[];               // kind "cards": cards shown to pick from
    wide: boolean;              // kind "cards": an 8-column grid
    lockedIds: string[];        // kind "cards": shown as "yours", not pickable
    choices: { id: string; label: string }[];   // kind "pick"
    answerIds: string[];        // kind "cards" and "pick": the right picks
    noneLabel: string;          // check button text when nothing is picked
    explain: string;
    say: string;                // the short phrase to say to yourself
    result: { correct: boolean; picked: number | string[] } | null;
}

export interface Tally { asked: number; right: number; }
export type LearnStats = Partial<Record<Skill, Tally>>;
export type LearnRecent = Partial<Record<Skill, boolean[]>>;

export type LearnAction =
    | { type: "SET_LEARN"; on: boolean }
    | { type: "SET_LEARN_LEVEL"; level: number }
    | { type: "SET_LEARN_ONLY"; only: boolean }
    | { type: "ANSWER_QUIZ"; value: number | string[] }
    | { type: "CLOSE_QUIZ" };

const sym = (s: string) => SUIT_INFO[s].sym;
const suitName = (s: string) => `${sym(s)} ${SUIT_INFO[s].name}`;
const plural = (s: string) => SUIT_INFO[s].name.toLowerCase();
const single = (s: string) => SUIT_INFO[s].name.slice(0, -1);
const cardOf = (suit: string, rank: string): Card => ({ suit, rank, id: suit + rank });
const idCard = (id: string) => cardOf(id[0], id.slice(1));
const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const capital = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

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
        pool: [], wide: false, lockedIds: [], choices: [], answerIds: [], noneLabel: "Check (none)",
        explain: "", say: "", result: null,
    };
}

// Cards of a suit nobody has played yet and that are not in your hand.
export function outWithOthers(state: GameState, suit: string): Card[] {
    const mine = new Set(state.hands[0].map((c) => c.id));
    const played = new Set(state.played);
    return RANK_ORDER.map((r) => cardOf(suit, r)).filter((c) => !mine.has(c.id) && !played.has(c.id));
}

export const trumpKnown = (state: GameState) => state.trumpSuit !== null && (state.caller === 0 || state.trumpRevealed);

/* ---------- Your two focus suits (rungs 3 and 4) ---------- */

// Your 8 cards when play started. Falls back to the current hand for games saved before this field.
const startCards = (state: GameState): Card[] =>
    state.startHand?.length ? state.startHand.map(idCard) : state.hands[0];

// Longest suit at the start of play, ties to more points, then the higher top card.
// Second suit: another suit where you held an A or 10, else the next longest.
export function focusSuits(state: GameState): { long: string | null; second: string | null } {
    const cards = startCards(state);
    const rank = (s: string) => {
        const cs = cards.filter((c) => c.suit === s);
        const top = cs.length ? Math.min(...cs.map((c) => rankIdx(c.rank))) : 9;
        return { s, n: cs.length, pts: cs.reduce((t, c) => t + POINTS[c.rank], 0), top, at: cs.some((c) => c.rank === "A" || c.rank === "10") };
    };
    const order = SUITS.map(rank).filter((x) => x.n > 0)
        .sort((a, b) => b.n - a.n || b.pts - a.pts || a.top - b.top);
    if (!order.length) return { long: null, second: null };
    const rest = order.slice(1);
    const second = rest.find((x) => x.at) ?? rest[0];
    return { long: order[0].s, second: second ? second.s : null };
}

/* ---------- Questions ---------- */

function countQuiz(q: Quiz, state: GameState, suit: string, intro: string): Quiz {
    const played = state.played.filter((id) => id[0] === suit).length;
    const mine = state.hands[0].filter((c) => c.suit === suit).length;
    const out = 8 - played - mine;
    q.question = intro
        ? `${intro}How many are still with the other players?`
        : `How many ${suitName(suit).toLowerCase()} are still with the other players?`;
    q.answer = out;
    q.options = [0, 1, 2, 3, 4, 5, 6, 7, 8];
    q.explain = `8 ${sym(suit)} in the deck. ${played} played, ${mine} in your hand, so 8 − ${played} − ${mine} = ${out} with the others.`;
    q.say = `${out} ${plural(suit)} left.`;
    return q;
}

// "Which of these point cards are gone?" for J's and 9's, A's and 10's, or all 16.
function goneQuiz(q: Quiz, state: GameState, ranks: string[], label: string): Quiz | null {
    if (state.played.length < 4) return null;
    const pool = SUITS.flatMap((s) => ranks.map((r) => cardOf(s, r)));
    const mine = new Set(state.hands[0].map((c) => c.id));
    const played = new Set(state.played);
    const gone = pool.filter((c) => played.has(c.id));
    q.kind = "cards";
    q.wide = pool.length > 8;
    q.question = `Tap every ${label} that has been played, the table included.`;
    q.pool = pool;
    q.lockedIds = pool.filter((c) => mine.has(c.id)).map((c) => c.id);
    q.answerIds = gone.map((c) => c.id);
    const left = pool.filter((c) => !played.has(c.id) && !mine.has(c.id));
    q.explain = (gone.length ? `Gone: ${gone.map(cardLabel).join(" ")}.` : "None gone yet.")
        + ` Still with the others: ${left.length ? left.map(cardLabel).join(" ") : "none"}.`;
    q.say = gone.length
        ? capital(gone.slice(0, 3).map((c) => `${single(c.suit).toLowerCase()} ${c.rank} gone`).join(", ")) + (gone.length > 3 ? ", and so on." : ".")
        : "Nothing gone yet.";
    return q;
}

export function makeQuiz(state: GameState, skill: Skill, seq: number): Quiz | null {
    const q = base(skill, seq);
    const myHand = state.hands[0];
    switch (skill) {
        case "jn":
            return goneQuiz(q, state, ["J", "9"], "J and 9");
        case "at":
            return Math.random() < 0.4
                ? goneQuiz(q, state, ["J", "9", "A", "10"], "point card (J, 9, A, 10)")
                : goneQuiz(q, state, ["A", "10"], "A and 10");
        case "voids": {
            // Your own voids are in your hand already, so only ask about the others.
            const others = state.shownOut.filter((v) => v.player !== 0);
            if (!others.length) return null;
            const voidSuits = [...new Set(others.map((v) => v.suit))];
            const held = [...new Set(myHand.map((c) => c.suit))];
            const heldVoid = voidSuits.filter((s) => held.includes(s));
            const suit = Math.random() < 0.7
                ? pick(heldVoid.length ? heldVoid : voidSuits)
                : pick(held.length ? held : SUITS);
            const events = others.filter((v) => v.suit === suit);
            q.kind = "pick";
            q.noneLabel = "Check (nobody)";
            q.question = `Who has run out of ${suitName(suit)}?`;
            q.choices = [1, 2, 3].map((p) => ({ id: String(p), label: state.names[p] + (p === 2 ? " (partner)" : "") }));
            q.answerIds = [...new Set(events.map((v) => String(v.player)))].sort();
            q.explain = events.length
                ? events.map((v) => `${state.names[v.player]} played ${cardLabel(idCard(v.card))} on a ${sym(suit)} lead in trick ${v.trick}.`).join(" ")
                    + ` ${events.length > 1 ? "They" : "That player"} can trump ${sym(suit)} or throw points on it.`
                : `Nobody has failed to follow ${sym(suit)} yet.`;
            q.say = events.length
                ? `${events.map((v) => state.names[v.player]).join(" and ")} out of ${plural(suit)}.`
                : `Everyone still has ${plural(suit)}.`;
            return q;
        }
        case "long": {
            const { long } = focusSuits(state);
            if (!long) return null;
            return countQuiz(q, state, long, `Your longest suit is ${suitName(long).toLowerCase()}. `);
        }
        case "second": {
            const { second } = focusSuits(state);
            if (!second) return null;
            const cards = startCards(state).filter((c) => c.suit === second && (c.rank === "A" || c.rank === "10"));
            const why = cards.length ? `you started with ${cards.map(cardLabel).join(" ")}` : "it is your next longest";
            return countQuiz(q, state, second, `Your second suit is ${suitName(second).toLowerCase()} (${why}). `);
        }
        case "suits": {
            // The led suit when you follow, otherwise any suit with cards still out.
            const live = SUITS.filter((s) => outWithOthers(state, s).length || myHand.some((c) => c.suit === s));
            const suit = state.leadSuit && Math.random() < 0.6 ? state.leadSuit : pick(live.length ? live : SUITS);
            const quiz = countQuiz(q, state, suit, "");
            quiz.say = `${capital(plural(suit))} down to ${quiz.answer}.`;
            return quiz;
        }
        case "guess": {
            // A trump played face up opens trump, so every suit played while trump is hidden is not trump.
            if (trumpKnown(state) || state.caller === null || state.played.length === 0) return null;
            const playedSuits = new Set(state.played.map((id) => id[0]));
            const open = SUITS.filter((s) => !playedSuits.has(s));
            const bidder = state.caller;
            const bidderName = bidder === 2 ? "Your partner (the bidder)" : `${state.names[bidder]} (the bidder)`;
            const thrown = state.shownOut.filter((v) => v.player === bidder).map((v) => v.card[0]);
            q.kind = "pick";
            q.question = "Trump is still hidden. Tap every suit that could still be trump.";
            q.choices = SUITS.map((s) => ({ id: s, label: suitName(s) }));
            q.answerIds = open;
            const ruled = SUITS.filter((s) => playedSuits.has(s)).map(sym).join(" ");
            q.explain = `Playing a trump turns trump face up. So a suit played while trump is hidden is not trump: ${ruled}.`
                + (thrown.length ? ` ${bidderName} threw ${[...new Set(thrown)].map(sym).join(" ")} when out of the led suit.` : "")
                + (open.length === 1 ? ` Only ${sym(open[0])} is left, so trump is ${plural(open[0])}.` : ` Still possible: ${open.map(sym).join(" ")}.`);
            q.say = thrown.length
                ? `Bidder threw a ${single(thrown[0]).toLowerCase()}, not ${plural(thrown[0])}.`
                : open.length === 1 ? `Trump must be ${plural(open[0])}.` : `Not ${[...playedSuits].map(plural).join(", not ")}.`;
            return q;
        }
        case "trump": {
            if (!trumpKnown(state)) return null;
            const t = state.trumpSuit!;
            const quiz = countQuiz(q, state, t, `Trump is ${suitName(t).toLowerCase()}. `);
            quiz.explain += quiz.answer === 0
                ? " Nobody else can trump now, so your top cards are safe."
                : " Until they are gone, an opponent out of a suit can trump it.";
            quiz.say = `Trump is ${plural(t)}, ${quiz.answer} left.`;
            return quiz;
        }
        case "points": {
            if (state.caller === null) return null;
            const bid = state.currentBid;
            const weBid = state.caller % 2 === 0;
            const ours = state.teamPoints[0], theirs = state.teamPoints[1];
            const bidderHave = weBid ? ours : theirs;
            const bidderNeed = Math.max(0, bid - bidderHave);
            const left = 29 - ours - theirs;
            const askOurs = Math.random() < 0.4;
            q.question = askOurs
                ? "How many points has your side won so far?"
                : weBid ? "How many more points does your side need to make the bid?"
                : "How many more points do the bidders need to make their bid?";
            q.answer = askOurs ? ours : bidderNeed;
            q.options = nearOptions(q.answer, 0, 29);
            const status = bidderNeed === 0 ? "The bid is already made."
                : bidderNeed > left ? `Only ${left} are left to win, so the bid is already beaten.`
                : `${left} points are still to win, counting 1 for the last trick.`;
            q.explain = `Your side has won ${ours}, the other side ${theirs}. The bid is ${bid}, so the bidders need ${bid} − ${bidderHave} = ${bidderNeed} more. ${status}`;
            q.say = weBid ? `We have ${ours}, we need ${bidderNeed}.` : `We have ${ours}, they need ${bidderNeed}.`;
            return q;
        }
    }
}

export function checkAnswer(quiz: Quiz, value: number | string[]): boolean {
    if (quiz.kind === "number") return value === quiz.answer;
    const picked = new Set(value as string[]);
    return picked.size === quiz.answerIds.length && quiz.answerIds.every((id) => picked.has(id));
}

/* ---------- Progress ---------- */

export const tallyOf = (stats: LearnStats, skill: Skill): Tally => stats[skill] ?? { asked: 0, right: 0 };

export function totalTally(stats: LearnStats): Tally {
    return RUNGS.reduce((t, s) => {
        const x = tallyOf(stats, s.id);
        return { asked: t.asked + x.asked, right: t.right + x.right };
    }, { asked: 0, right: 0 });
}

// The rung with the lowest hit rate, for the hand-end summary.
export function weakestSkill(stats: LearnStats): Skill | null {
    let worst: Skill | null = null, worstRate = 1;
    for (const s of RUNGS) {
        const t = tallyOf(stats, s.id);
        if (!t.asked) continue;
        const rate = t.right / t.asked;
        if (rate < worstRate) { worst = s.id; worstRate = rate; }
    }
    return worst;
}

export const recentOf = (state: GameState, skill: Skill): boolean[] => state.learnRecent?.[skill] ?? [];

export function isReady(recent: boolean[]): boolean {
    return recent.length >= READY_MIN && recent.filter(Boolean).length / recent.length >= READY_RATE;
}

export const currentRung = (state: GameState): Rung => rungAt(state.learnLevel || 1);

// True when you have passed your current rung and a higher one exists.
export const readyToMoveUp = (state: GameState) =>
    currentRung(state).level < TOP_LEVEL && isReady(recentOf(state, currentRung(state).id));

/* ---------- Asking ---------- */

// One question per turn, keyed by the deal and the trick number.
const turnKey = (state: GameState) => `${state.dealSeq}-${state.tricksPlayed}`;

export function isAskMoment(state: GameState): boolean {
    return state.learnOn && !state.quiz && state.phase === "playing"
        && state.turn === 0 && state.trick.length < 4 && state.quizKey !== turnKey(state);
}

// The rungs that may be asked: your own, plus the ones below unless you practise one rung only.
export function candidateSkills(state: GameState): Skill[] {
    const level = currentRung(state).level;
    return RUNGS.filter((r) => r.level === level || (!state.learnOnly && r.level < level)).map((r) => r.id);
}

function askNow(state: GameState): GameState {
    if (!isAskMoment(state)) return state;
    const seq = (state.quizSeq || 0) + 1;
    const own = currentRung(state).id;
    const quizzes = candidateSkills(state)
        .map((s) => makeQuiz(state, s, seq))
        .filter((q): q is Quiz => q !== null);
    if (!quizzes.length) return { ...state, quizKey: turnKey(state) };
    const mine = quizzes.find((q) => q.skill === own);
    const review = quizzes.filter((q) => q.skill !== own);
    // Your rung most of the time; otherwise a lower rung, not the same one twice in a row.
    let quiz: Quiz;
    if (mine && (!review.length || Math.random() < OWN_SHARE)) quiz = mine;
    else {
        const fresh = review.length > 1 ? review.filter((q) => q.skill !== state.lastSkill) : review;
        quiz = pick(fresh.length ? fresh : review);
    }
    return { ...state, quiz, quizSeq: seq, quizKey: turnKey(state), lastSkill: quiz.skill };
}

const bump = (stats: LearnStats, skill: Skill, correct: boolean): LearnStats => {
    const t = tallyOf(stats, skill);
    return { ...stats, [skill]: { asked: t.asked + 1, right: t.right + (correct ? 1 : 0) } };
};

// Fixes a game saved by an older version: unknown question types and out-of-range levels.
export function cleanLoaded(state: GameState): GameState {
    const level = Math.min(TOP_LEVEL, Math.max(1, Math.round(Number(state.learnLevel) || 1)));
    const quizOk = state.quiz && RUNGS.some((r) => r.id === state.quiz!.skill) && "say" in state.quiz;
    return {
        ...state, learnLevel: level,
        learnRecent: state.learnRecent ?? {}, learnPassed: state.learnPassed ?? [],
        quiz: quizOk ? state.quiz : null, quizKey: quizOk ? state.quizKey : "",
    };
}

// Re-asks the turn's question after the rung changes, unless it was already answered.
function reask(state: GameState): GameState {
    if (state.quiz?.result) return state;
    return askNow({ ...state, quiz: null, quizKey: state.quiz ? "" : state.quizKey });
}

// Wraps the game reducer: asks a question whenever your turn comes up.
export function learnReducer(state: GameState, action: Action): GameState {
    switch (action.type) {
        case "SET_LEARN":
            return askNow({ ...state, learnOn: action.on, quiz: null, quizKey: action.on ? state.quizKey : "" });
        case "SET_LEARN_LEVEL": {
            const level = Math.min(TOP_LEVEL, Math.max(1, Math.round(action.level)));
            return reask({ ...state, learnLevel: level });
        }
        case "SET_LEARN_ONLY":
            return reask({ ...state, learnOnly: action.only });
        case "ANSWER_QUIZ": {
            const quiz = state.quiz;
            if (!quiz || quiz.result) return state;
            const correct = checkAnswer(quiz, action.value);
            const recent = [...recentOf(state, quiz.skill), correct].slice(-RECENT);
            const passed = state.learnPassed ?? [];
            return {
                ...state,
                quiz: { ...quiz, result: { correct, picked: action.value } },
                learnStats: bump(state.learnStats, quiz.skill, correct),
                handStats: bump(state.handStats, quiz.skill, correct),
                learnRecent: { ...state.learnRecent, [quiz.skill]: recent },
                learnPassed: isReady(recent) && !passed.includes(quiz.skill) ? [...passed, quiz.skill] : passed,
            };
        }
        case "CLOSE_QUIZ":
            return { ...state, quiz: null };
        case "DEAL":
        case "NEW_MATCH":
            return { ...reducer(state, action), quiz: null, handStats: {}, startHand: [] };
        default: {
            const next = reducer(state, action);
            // Remember your 8 cards when play starts, for the focus suits.
            const started = next.phase === "doubling" && state.phase !== "doubling";
            return askNow(started ? { ...next, startHand: next.hands[0].map((c) => c.id) } : next);
        }
    }
}
