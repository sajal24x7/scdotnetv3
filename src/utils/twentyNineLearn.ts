/**
 * Learn mode for the 29 card game. Before each of your turns it asks one
 * question about what a strong player keeps track of at that moment.
 * The questions only use what you can know: your own hand, the cards
 * already played and who has failed to follow suit.
 * See docs/pages/cards-29.md#learn-mode.
 */
import {
    SUITS, SUIT_INFO, RANK_ORDER, rankIdx, cardLabel, isBoss, reducer,
} from "./twentyNine.ts";
import type { Action, Card, GameState } from "./twentyNine.ts";

export type Skill = "trump" | "boss" | "voids" | "target" | "suit" | "endgame";

// The strategy, in order of value. Shown on the start screen and in the docs.
export const SKILLS: { id: Skill; name: string; tip: string }[] = [
    { id: "trump", name: "Trumps", tip: "Count trumps. Know how many are still with the others." },
    { id: "boss", name: "Boss cards", tip: "Know which of your cards are now the highest left in their suit." },
    { id: "voids", name: "Voids", tip: "Note who has run out of a suit. They can trump it or throw points on it." },
    { id: "target", name: "Bid target", tip: "Know how many points your side still needs, and how many are left to win." },
    { id: "suit", name: "Suit count", tip: "Before trump is open, count the suit being played." },
    { id: "endgame", name: "Endgame", tip: "With three cards left, know every card still out." },
];

export const skillName = (s: Skill) => SKILLS.find((k) => k.id === s)!.name;

// How often each question comes up when more than one fits.
const WEIGHT: Record<Skill, number> = { trump: 3, boss: 2, voids: 2, target: 2, suit: 1, endgame: 1 };

export interface Quiz {
    id: number;
    skill: Skill;
    question: string;
    kind: "number" | "cards" | "pick";
    options: number[];          // kind "number"
    answer: number;             // kind "number"
    pool: Card[];               // kind "cards": cards shown to pick from
    wide: boolean;              // kind "cards": the full 32-card grid
    lockedIds: string[];        // kind "cards": shown as "yours", not pickable
    choices: { id: string; label: string }[];   // kind "pick"
    answerIds: string[];        // kind "cards" and "pick": the right picks
    explain: string;
    result: { correct: boolean; picked: number | string[] } | null;
}

export interface Tally { asked: number; right: number; }
export type LearnStats = Partial<Record<Skill, Tally>>;

export type LearnAction =
    | { type: "SET_LEARN"; on: boolean }
    | { type: "ANSWER_QUIZ"; value: number | string[] }
    | { type: "CLOSE_QUIZ" };

const sym = (s: string) => SUIT_INFO[s].sym;
const suitName = (s: string) => `${sym(s)} ${SUIT_INFO[s].name}`;
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
        pool: [], wide: false, lockedIds: [], choices: [], answerIds: [], explain: "", result: null,
    };
}

// Cards of a suit nobody has played yet and that are not in your hand.
export function outWithOthers(state: GameState, suit: string): Card[] {
    const mine = new Set(state.hands[0].map((c) => c.id));
    const played = new Set(state.played);
    return RANK_ORDER.map((r) => cardOf(suit, r)).filter((c) => !mine.has(c.id) && !played.has(c.id));
}

export const trumpKnown = (state: GameState) => state.trumpSuit !== null && (state.caller === 0 || state.trumpRevealed);

function countQuiz(q: Quiz, state: GameState, suit: string, label: string): Quiz {
    const played = state.played.filter((id) => id[0] === suit).length;
    const mine = state.hands[0].filter((c) => c.suit === suit).length;
    const out = 8 - played - mine;
    q.question = `How many ${label} are still with the other players?`;
    q.answer = out;
    q.options = [0, 1, 2, 3, 4, 5, 6, 7, 8];
    q.explain = `8 ${sym(suit)} in the deck. ${played} played, ${mine} in your hand, so 8 − ${played} − ${mine} = ${out} with the others.`;
    return q;
}

export function makeQuiz(state: GameState, skill: Skill, seq: number): Quiz | null {
    const q = base(skill, seq);
    const myHand = state.hands[0];
    const leading = state.trick.length === 0;
    switch (skill) {
        case "trump": {
            if (!trumpKnown(state)) return null;
            const t = state.trumpSuit!;
            const quiz = countQuiz(q, state, t, `trumps (${suitName(t)})`);
            quiz.explain += quiz.answer === 0
                ? " Nobody else can trump now, so your boss cards are safe."
                : ` Until they are gone, an opponent out of a suit can trump it.`;
            return quiz;
        }
        case "suit": {
            const suit = state.leadSuit;
            if (!suit || (trumpKnown(state) && suit === state.trumpSuit)) return null;
            return countQuiz(q, state, suit, suitName(suit));
        }
        case "boss": {
            if (!leading || myHand.length < 2) return null;
            const hand = [...myHand].sort((a, b) => SUITS.indexOf(a.suit) - SUITS.indexOf(b.suit) || byRank(a, b));
            const seen = new Set([...state.played, ...myHand.map((c) => c.id)]);
            const notes = hand.map((c) => {
                const higher = RANK_ORDER.slice(0, rankIdx(c.rank)).filter((r) => !seen.has(c.suit + r));
                return higher.length
                    ? `${cardLabel(c)} loses to ${higher.map((r) => r + sym(c.suit)).join(", ")}`
                    : `${cardLabel(c)} is boss`;
            });
            q.kind = "cards";
            q.question = "You lead. Tap every card in your hand that is the highest left in its suit.";
            q.pool = hand;
            q.answerIds = hand.filter((c) => isBoss(c, state, myHand)).map((c) => c.id);
            q.explain = notes.join(". ") + ".";
            return q;
        }
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
            q.question = `Who has run out of ${suitName(suit)}?`;
            q.choices = [1, 2, 3].map((p) => ({ id: String(p), label: state.names[p] + (p === 2 ? " (partner)" : "") }));
            q.answerIds = [...new Set(events.map((v) => String(v.player)))].sort();
            q.explain = events.length
                ? events.map((v) => `${state.names[v.player]} played ${cardLabel(cardOf(v.card[0], v.card.slice(1)))} on a ${sym(suit)} lead in trick ${v.trick}.`).join(" ")
                    + ` ${events.length > 1 ? "They" : "That player"} can trump ${sym(suit)} or throw points on it.`
                : `Nobody has failed to follow ${sym(suit)} yet.`;
            return q;
        }
        case "target": {
            if (state.caller === null) return null;
            const bid = state.currentBid;
            const weBid = state.caller % 2 === 0;
            const goal = weBid ? bid : 30 - bid;
            const have = state.teamPoints[0];
            const need = Math.max(0, goal - have);
            const left = 29 - state.teamPoints[0] - state.teamPoints[1];
            q.question = weBid
                ? "How many more points does your side need to make the bid?"
                : "How many more points does your side need to beat the bid?";
            q.answer = need;
            q.options = nearOptions(need, 0, 29);
            const why = weBid
                ? `Your side bid ${bid}.`
                : `The other side bid ${bid}, so you need ${goal} to stop them (29 − ${bid} + 1).`;
            const status = need === 0 ? "You already have enough."
                : need > left ? `Only ${left} are left to win, so this hand is lost.`
                : `${left} points are still to win, counting 1 for the last trick.`;
            q.explain = `${why} You have won ${have}, so ${need} more. ${status}`;
            return q;
        }
        case "endgame": {
            const pool = SUITS.flatMap((s) => RANK_ORDER.map((r) => cardOf(s, r)));
            const mine = new Set(myHand.map((c) => c.id));
            const out = SUITS.flatMap((s) => outWithOthers(state, s));
            q.kind = "cards";
            q.wide = true;
            q.question = "Three cards left. Tap every card the other players still hold.";
            q.pool = pool;
            q.lockedIds = pool.filter((c) => mine.has(c.id)).map((c) => c.id);
            q.answerIds = out.map((c) => c.id);
            q.explain = "Still out: " + SUITS
                .map((s) => out.filter((c) => c.suit === s))
                .filter((cs) => cs.length)
                .map((cs) => list(cs))
                .join(" · ") + ".";
            return q;
        }
    }
}

export function checkAnswer(quiz: Quiz, value: number | string[]): boolean {
    if (quiz.kind === "number") return value === quiz.answer;
    const picked = new Set(value as string[]);
    return picked.size === quiz.answerIds.length && quiz.answerIds.every((id) => picked.has(id));
}

export const tallyOf = (stats: LearnStats, skill: Skill): Tally => stats[skill] ?? { asked: 0, right: 0 };

export function totalTally(stats: LearnStats): Tally {
    return SKILLS.reduce((t, s) => {
        const x = tallyOf(stats, s.id);
        return { asked: t.asked + x.asked, right: t.right + x.right };
    }, { asked: 0, right: 0 });
}

// The skill with the lowest hit rate, for the hand-end summary.
export function weakestSkill(stats: LearnStats): Skill | null {
    let worst: Skill | null = null, worstRate = 1;
    for (const s of SKILLS) {
        const t = tallyOf(stats, s.id);
        if (!t.asked) continue;
        const rate = t.right / t.asked;
        if (rate < worstRate) { worst = s.id; worstRate = rate; }
    }
    return worst;
}

// One question per turn, keyed by the deal and the trick number.
const turnKey = (state: GameState) => `${state.dealSeq}-${state.tricksPlayed}`;

export function isAskMoment(state: GameState): boolean {
    return state.learnOn && !state.quiz && state.phase === "playing"
        && state.turn === 0 && state.trick.length < 4 && state.quizKey !== turnKey(state);
}

// The questions that fit this moment.
export function candidateSkills(state: GameState): Skill[] {
    if (state.hands[0].length === 3 && state.endgameDeal !== state.dealSeq) return ["endgame"];
    return state.trick.length === 0
        ? ["boss", "voids", "trump", "target"]
        : ["trump", "suit", "voids", "target"];
}

function askNow(state: GameState): GameState {
    if (!isAskMoment(state)) return state;
    const seq = (state.quizSeq || 0) + 1;
    const quizzes = candidateSkills(state)
        .map((s) => makeQuiz(state, s, seq))
        .filter((q): q is Quiz => q !== null);
    if (!quizzes.length) return { ...state, quizKey: turnKey(state) };
    // Avoid the same question twice in a row when there is a choice.
    const fresh = quizzes.length > 1 ? quizzes.filter((q) => q.skill !== state.lastSkill) : quizzes;
    const total = fresh.reduce((s, q) => s + WEIGHT[q.skill], 0);
    let roll = Math.random() * total;
    const quiz = fresh.find((q) => (roll -= WEIGHT[q.skill]) < 0) ?? fresh[0];
    return {
        ...state, quiz, quizSeq: seq, quizKey: turnKey(state), lastSkill: quiz.skill,
        endgameDeal: quiz.skill === "endgame" ? state.dealSeq : state.endgameDeal,
    };
}

const bump = (stats: LearnStats, skill: Skill, correct: boolean): LearnStats => {
    const t = tallyOf(stats, skill);
    return { ...stats, [skill]: { asked: t.asked + 1, right: t.right + (correct ? 1 : 0) } };
};

// Wraps the game reducer: asks a question whenever your turn comes up.
export function learnReducer(state: GameState, action: Action): GameState {
    switch (action.type) {
        case "SET_LEARN":
            return askNow({ ...state, learnOn: action.on, quiz: null });
        case "ANSWER_QUIZ": {
            const quiz = state.quiz;
            if (!quiz || quiz.result) return state;
            const correct = checkAnswer(quiz, action.value);
            return {
                ...state,
                quiz: { ...quiz, result: { correct, picked: action.value } },
                learnStats: bump(state.learnStats, quiz.skill, correct),
                handStats: bump(state.handStats, quiz.skill, correct),
            };
        }
        case "CLOSE_QUIZ":
            return { ...state, quiz: null };
        case "DEAL":
        case "NEW_MATCH":
            return { ...reducer(state, action), quiz: null, handStats: {} };
        default:
            return askNow(reducer(state, action));
    }
}
