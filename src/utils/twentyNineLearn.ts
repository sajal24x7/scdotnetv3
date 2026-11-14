/**
 * Learn mode for the 29 card game. It trains three things:
 *   1. every card of each suit still with the others,
 *   2. who has run out of which suit (voids),
 *   3. how many trumps are still out, once you know trump.
 * Before each of your turns it looks at what has happened since it last asked
 * about each skill and asks the question that matters most right now, or
 * nothing when nothing worth asking has happened.
 * The questions only use what you can know: your own hand, the cards
 * already played and who has failed to follow suit.
 * See docs/pages/cards-29.md#learn-mode.
 */
import { SUITS, SUIT_INFO, RANK_ORDER, cardLabel, reducer } from "./twentyNine.ts";
import type { Action, Card, GameState } from "./twentyNine.ts";

export type Skill = "top" | "voids" | "trump";

export interface SkillInfo { id: Skill; name: string; remember: string; say: string; }

export const SKILLS: SkillInfo[] = [
    { id: "top", name: "Cards left", remember: "Keep the ranked list J 9 A 10 K Q 8 7 for each suit. Cross off your own cards at once and each card as it falls.", say: "Hearts left: A, 10, Q, 7." },
    { id: "voids", name: "Voids", remember: "Who has run out of which suit.", say: "West out of clubs." },
    { id: "trump", name: "Trumps left", remember: "How many trumps the others still hold, once you know trump.", say: "Spades, 3 out." },
];
export const ALL_SKILLS: Skill[] = SKILLS.map((s) => s.id);

export const skillInfo = (s: Skill) => SKILLS.find((x) => x.id === s)!;
export const skillName = (s: Skill) => skillInfo(s).name;

export interface Quiz {
    id: number;
    skill: Skill;
    question: string;
    kind: "number" | "pick" | "list";
    options: number[];          // kind "number"
    answer: number;             // kind "number"
    yoursIds: string[];         // kind "list": marked "yours" and not pickable
    suits: string[];            // kind "list": the suits asked, one after another
    choices: { id: string; label: string }[];   // kind "pick"
    answerIds: string[];        // kinds "pick" and "list": the right picks
    noneLabel: string;          // check button text when nothing is picked
    explain: string;
    say: string;                // the short phrase to say to yourself
    result: { correct: boolean; picked: number | string[] } | null;
}

export interface Tally { asked: number; right: number; }
export type LearnStats = Partial<Record<Skill, Tally>>;
// Per skill: how many cards had been played when it was last asked this hand.
export type LearnMarks = Partial<Record<Skill, number>>;

export type LearnAction =
    | { type: "SET_LEARN"; on: boolean }
    | { type: "TOGGLE_LEARN_SKILL"; skill: Skill }
    | { type: "ANSWER_QUIZ"; value: number | string[] }
    | { type: "CLOSE_QUIZ" };

const sym = (s: string) => SUIT_INFO[s].sym;
const suitName = (s: string) => `${sym(s)} ${SUIT_INFO[s].name}`;
const plural = (s: string) => SUIT_INFO[s].name.toLowerCase();
const cardOf = (suit: string, rank: string): Card => ({ suit, rank, id: suit + rank });
const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const capital = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

function base(skill: Skill, seq: number): Quiz {
    return {
        id: seq, skill, question: "", kind: "number", options: [], answer: 0,
        yoursIds: [], suits: [], choices: [], answerIds: [], noneLabel: "Check (none)",
        explain: "", say: "", result: null,
    };
}

export const trumpKnown = (state: GameState) => state.trumpSuit !== null && (state.caller === 0 || state.trumpRevealed);

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

// Voids shown by the other players in finished tricks (the current trick is still on the table).
const otherVoids = (state: GameState) => state.shownOut.filter((v) => v.player !== 0);
const settledVoids = (state: GameState) => otherVoids(state).filter((v) => v.trick <= state.tricksPlayed);

// Players still to play in this trick, after you.
function laterPlayers(state: GameState): number[] {
    const left = 3 - state.trick.length;
    return [1, 2, 3].slice(0, left);
}

const trumpsWithOthers = (state: GameState, t: string) =>
    8 - state.played.filter((id) => id[0] === t).length - state.hands[0].filter((c) => c.suit === t).length;

/* ---------- Questions ---------- */

// Which suits to ask: the led suit first when following, then the suits that changed most
// since last asked. Suits with no unplayed cards are skipped.
export function listSuits(state: GameState, max: number): string[] {
    const mark = state.learnMarks?.top ?? 0;
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
    const q = base("top", seq);
    const mine = new Set(state.hands[0].map((c) => c.id));
    const played = new Set(state.played);
    q.kind = "list";
    q.suits = suits;
    q.noneLabel = "None left";
    q.yoursIds = suits.flatMap((s) => RANK_ORDER.map((r) => s + r)).filter((id) => mine.has(id));
    q.answerIds = suits.flatMap((s) => cardsLeft(state, s).map((c) => c.id));
    q.question = "Which cards do the other three still hold? Cards on the table count as played.";
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
    q.explain = lines.map((l) => l.explain).join("\n");
    q.say = lines.map((l) => l.say).join("\n");
    return q;
}

export function voidQuiz(state: GameState, suit: string, seq: number): Quiz {
    const q = base("voids", seq);
    const events = settledVoids(state).filter((v) => v.suit === suit);
    q.kind = "pick";
    q.noneLabel = "Check (nobody)";
    q.question = `Who has run out of ${suitName(suit)}?`;
    q.choices = [1, 2, 3].map((p) => ({ id: String(p), label: state.names[p] + (p === 2 ? " (partner)" : "") }));
    q.answerIds = [...new Set(events.map((v) => String(v.player)))].sort();
    q.explain = events.length
        ? events.map((v) => `${state.names[v.player]} played ${cardLabel(cardOf(v.card[0], v.card.slice(1)))} on a ${sym(suit)} lead in trick ${v.trick}.`).join(" ")
            + ` ${events.length > 1 ? "They" : "That player"} can trump ${sym(suit)} or throw points on it.`
        : `Nobody has failed to follow ${sym(suit)} yet.`;
    q.say = events.length
        ? `${[...new Set(events.map((v) => state.names[v.player]))].join(" and ")} out of ${plural(suit)}.`
        : `Everyone still has ${plural(suit)}.`;
    return q;
}

export function trumpQuiz(state: GameState, seq: number): Quiz | null {
    if (!trumpKnown(state)) return null;
    const t = state.trumpSuit!;
    const q = base("trump", seq);
    const played = state.played.filter((id) => id[0] === t).length;
    const mine = state.hands[0].filter((c) => c.suit === t).length;
    const out = 8 - played - mine;
    q.question = `Trump is ${suitName(t).toLowerCase()}. How many trumps do the other three players still hold?`;
    q.answer = out;
    q.options = [0, 1, 2, 3, 4, 5, 6, 7, 8];
    q.explain = `8 trumps in the deck. ${played} played, ${mine} in your hand, so 8 − ${played} − ${mine} = ${out} with the others.`
        + (out === 0 ? " Nobody else can trump now, so your top cards are safe." : " Until they are gone, a player out of a suit can trump it.");
    q.say = `${capital(plural(t))}, ${out} out.`;
    return q;
}

/* ---------- Choosing the moment ---------- */

export interface Candidate { quiz: Quiz; priority: number; }

// 3: something just changed that you must now remember, or the answer decides this play.
// 2: worth checking before this play. 1: a quiet recap, only after a turn without questions.
export function candidates(state: GameState, seq: number): Candidate[] {
    const marks = state.learnMarks ?? {};
    const skills = state.learnSkills?.length ? state.learnSkills : ALL_SKILLS;
    const hand = state.hands[0];
    const held = SUITS.filter((s) => hand.some((c) => c.suit === s));
    const leading = state.trick.length === 0;
    const lead = state.leadSuit;
    const out: Candidate[] = [];
    const add = (quiz: Quiz | null, priority: number) => { if (quiz) out.push({ quiz, priority }); };

    if (skills.includes("top")) {
        // Cards played since last asked. A full trick means the lists have moved on;
        // a busy lead asks up to three suits in a row.
        const mark = marks.top;
        const fresh = mark === undefined ? 0 : state.played.length - mark;
        if (mark === undefined) add(topQuiz(state, seq), leading ? 2 : 1);
        else if (fresh >= 4) add(topQuiz(state, seq, leading ? 3 : 1), leading ? 3 : 2);
        else if (fresh > 0 && leading) add(topQuiz(state, seq), 1);
    }

    if (skills.includes("voids")) {
        const settled = settledVoids(state);
        if (settled.length) {
            const voidSuits = [...new Set(settled.map((v) => v.suit))];
            const later = laterPlayers(state);
            const fresh = settled.filter((v) => state.played.indexOf(v.card) >= (marks.voids ?? 0)).map((v) => v.suit);
            if (lead && settled.some((v) => v.suit === lead && later.includes(v.player))) add(voidQuiz(state, lead, seq), 3);
            else if (fresh.length) add(voidQuiz(state, pick(fresh), seq), 2);
            else if (leading) {
                const heldVoid = voidSuits.filter((s) => held.includes(s));
                const heldClean = held.filter((s) => !voidSuits.includes(s));
                // Mostly a suit someone is out of, sometimes one nobody is out of, so "nobody" stays a real answer.
                const suit = heldVoid.length && (Math.random() < 0.7 || !heldClean.length) ? pick(heldVoid)
                    : heldClean.length ? pick(heldClean) : null;
                if (suit) add(voidQuiz(state, suit, seq), heldVoid.includes(suit) ? 2 : 1);
            }
        }
    }

    if (skills.includes("trump") && trumpKnown(state)) {
        const t = state.trumpSuit!;
        const mark = marks.trump;
        const since = mark === undefined ? 0 : state.played.length - mark;
        const fell = mark !== undefined && state.played.slice(mark).some((id) => id[0] === t);
        const left = trumpsWithOthers(state, t);
        const canTrump = lead !== null && lead !== t && !hand.some((c) => c.suit === lead) && hand.some((c) => c.suit === t);
        if (mark === undefined || fell) add(trumpQuiz(state, seq), 3);
        else if (left > 0 && canTrump && since >= 4) add(trumpQuiz(state, seq), 2);
        else if (left > 0 && leading && since >= 8) add(trumpQuiz(state, seq), 1);
    }
    return out;
}

// The question to ask now, or null. Highest priority wins; a tie goes to the skill asked longest ago.
export function chooseQuiz(state: GameState, seq: number): Quiz | null {
    const all = candidates(state, seq);
    if (!all.length) return null;
    const best = Math.max(...all.map((c) => c.priority));
    const askedLastTurn = state.learnLastTrick === state.tricksPlayed - 1;
    if (best === 1 && askedLastTurn) return null;
    const marks = state.learnMarks ?? {};
    const top = all.filter((c) => c.priority === best);
    const oldest = Math.min(...top.map((c) => marks[c.quiz.skill] ?? -1));
    return pick(top.filter((c) => (marks[c.quiz.skill] ?? -1) === oldest)).quiz;
}

export function checkAnswer(quiz: Quiz, value: number | string[]): boolean {
    if (quiz.kind === "number") return value === quiz.answer;
    const picked = new Set(value as string[]);
    return picked.size === quiz.answerIds.length && quiz.answerIds.every((id) => picked.has(id));
}

/* ---------- Progress ---------- */

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
    // Voids in the current trick are still on the table, so they stay "new" until the trick is done.
    const mark = quiz.skill === "voids" ? state.played.length - state.trick.length : state.played.length;
    return {
        ...state, quiz, quizSeq: seq, quizKey: turnKey(state), learnLastTrick: state.tricksPlayed,
        learnMarks: { ...state.learnMarks, [quiz.skill]: mark },
    };
}

const bump = (stats: LearnStats, skill: Skill, correct: boolean): LearnStats => {
    const t = tallyOf(stats, skill);
    return { ...stats, [skill]: { asked: t.asked + 1, right: t.right + (correct ? 1 : 0) } };
};

const keepKnown = (stats: LearnStats | undefined): LearnStats =>
    Object.fromEntries(Object.entries(stats ?? {}).filter(([k]) => ALL_SKILLS.includes(k as Skill)));

// Fixes a game saved by an older version: old question types, old skill stats and missing fields.
export function cleanLoaded(state: GameState): GameState {
    // A top-cards question saved by an older version asks something else.
    const oldTop = state.quiz?.skill === "top" && state.quiz.kind !== "list";
    const quizOk = state.quiz && ALL_SKILLS.includes(state.quiz.skill) && "yoursIds" in state.quiz && !oldTop;
    const quiz = quizOk ? { ...state.quiz!, suits: state.quiz!.suits ?? [] } : null;
    const skills = (state.learnSkills ?? []).filter((s) => ALL_SKILLS.includes(s));
    return {
        ...state,
        learnSkills: skills.length ? skills : ALL_SKILLS,
        learnMarks: state.learnMarks ?? {}, learnLastTrick: state.learnLastTrick ?? -9,
        learnStats: keepKnown(state.learnStats), handStats: keepKnown(state.handStats),
        quiz, quizKey: quizOk ? state.quizKey : "",
    };
}

// Wraps the game reducer: asks a question when your turn comes up and the moment fits.
export function learnReducer(state: GameState, action: Action): GameState {
    switch (action.type) {
        case "SET_LEARN":
            return askNow({ ...state, learnOn: action.on, quiz: null, quizKey: action.on ? state.quizKey : "" });
        case "TOGGLE_LEARN_SKILL": {
            const now = state.learnSkills?.length ? state.learnSkills : ALL_SKILLS;
            const next = now.includes(action.skill) ? now.filter((s) => s !== action.skill) : [...now, action.skill];
            if (!next.length) return state;
            const skills = ALL_SKILLS.filter((s) => next.includes(s));
            // Drop an open, unanswered question about a skill you just turned off.
            const drop = state.quiz && !state.quiz.result && !skills.includes(state.quiz.skill);
            return drop ? askNow({ ...state, learnSkills: skills, quiz: null, quizKey: "" }) : { ...state, learnSkills: skills };
        }
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
            return { ...reducer(state, action), quiz: null, handStats: {}, learnMarks: {}, learnLastTrick: -9 };
        default:
            return askNow(reducer(state, action));
    }
}
