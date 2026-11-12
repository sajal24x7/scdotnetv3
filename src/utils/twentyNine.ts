/**
 * Rules, state machine and computer players for the 29 card game.
 * The UI lives in src/components/games/TwentyNine.tsx.
 * Learn mode (counting drills) lives in src/utils/twentyNineLearn.ts.
 * Checks: node --experimental-strip-types src/utils/__checks__/twentyNine.check.ts
 */
import type { Quiz, LearnStats, LearnAction, Skill } from "./twentyNineLearn.ts";

/* ---------- Card data ---------- */
export const SUITS = ["S", "H", "D", "C"];
export const SUIT_INFO: Record<string, { sym: string; red: boolean; name: string }> = {
    S: { sym: "♠", red: false, name: "Spades" },
    C: { sym: "♣", red: false, name: "Clubs" },
    H: { sym: "♥", red: true, name: "Hearts" },
    D: { sym: "♦", red: true, name: "Diamonds" },
};
export const RANK_ORDER = ["J", "9", "A", "10", "K", "Q", "8", "7"];
export const POINTS: Record<string, number> = { J: 3, 9: 2, A: 1, "10": 1, K: 0, Q: 0, "8": 0, "7": 0 };
export const MATCH_TARGET = 6;

export const GEN1_POKEMON = [
    "Bulbasaur","Charmander","Squirtle","Caterpie","Weedle","Pidgey","Rattata","Spearow",
    "Ekans","Pikachu","Sandshrew","Nidoran","Clefairy","Vulpix","Jigglypuff","Zubat",
    "Oddish","Paras","Venonat","Diglett","Meowth","Psyduck","Mankey","Growlithe","Poliwag",
    "Abra","Machop","Bellsprout","Tentacool","Geodude","Ponyta","Slowpoke","Magnemite",
    "Farfetchd","Doduo","Seel","Grimer","Shellder","Gastly","Onix","Drowzee","Krabby",
    "Voltorb","Exeggcute","Cubone","Hitmonlee","Hitmonchan","Lickitung","Koffing","Rhyhorn",
    "Chansey","Tangela","Kangaskhan","Horsea","Goldeen","Staryu","Scyther","Jynx",
    "Electabuzz","Magmar","Pinsir","Tauros","Magikarp","Lapras","Ditto","Eevee",
    "Porygon","Omanyte","Kabuto","Aerodactyl","Snorlax","Articuno","Zapdos","Moltres",
    "Dratini","Mewtwo","Gengar","Alakazam","Machamp","Gyarados","Vaporeon","Jolteon","Flareon",
];

export function pickPokemonNames(): [string, string, string] {
    const pool = [...GEN1_POKEMON];
    const pick = () => pool.splice(Math.floor(Math.random() * pool.length), 1)[0];
    return [pick(), pick(), pick()];
}

export function teamNames(names: string[]): Record<number, string> {
    return { 0: `${names[0]} & ${names[2]}`, 1: `${names[1]} & ${names[3]}` };
}
export const rankIdx = (r: string) => RANK_ORDER.indexOf(r);
export function sortHand(hand: Card[]) {
    return [...hand].sort((a, b) => {
        if (a.suit !== b.suit) return SUITS.indexOf(a.suit) - SUITS.indexOf(b.suit);
        return rankIdx(b.rank) - rankIdx(a.rank);
    });
}

export interface Card { suit: string; rank: string; id: string; }
export interface TrickEntry { player: number; card: Card; }

export function makeDeck(): Card[] {
    const d: Card[] = [];
    SUITS.forEach((s) => RANK_ORDER.forEach((r) => d.push({ suit: s, rank: r, id: s + r })));
    return d;
}
export function shuffle<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}
export function cardBeats(a: Card, b: Card, leadSuit: string, trumpSuit: string) {
    const aT = a.suit === trumpSuit, bT = b.suit === trumpSuit;
    if (aT && !bT) return true;
    if (!aT && bT) return false;
    if (aT && bT) return rankIdx(a.rank) < rankIdx(b.rank);
    if (a.suit === leadSuit && b.suit === leadSuit) return rankIdx(a.rank) < rankIdx(b.rank);
    if (a.suit === leadSuit && b.suit !== leadSuit) return true;
    return false;
}
export function trickWinner(trick: TrickEntry[], leadSuit: string, trumpSuit: string) {
    let best = trick[0];
    for (const t of trick.slice(1)) if (cardBeats(t.card, best.card, leadSuit, trumpSuit)) best = t;
    return best.player;
}

export const handPoints = (hand: Card[]) => hand.reduce((s, c) => s + POINTS[c.rank], 0);
export const cardLabel = (c: Card) => `${c.rank}${SUIT_INFO[c.suit].sym}`;

// Must follow suit. A player who asked for trump this trick must then play trump if they can.
export function legalCards(hand: Card[], state: GameState, playerIdx: number): Card[] {
    const { leadSuit, trumpSuit } = state;
    if (!leadSuit) return hand;
    const follow = hand.filter((c) => c.suit === leadSuit);
    if (follow.length) return follow;
    if (state.askedBy === playerIdx && state.trumpRevealed) {
        const trumps = hand.filter((c) => c.suit === trumpSuit);
        if (trumps.length) return trumps;
    }
    return hand;
}

// True when every higher card of the same suit is already played or sits in `own`.
export function isBoss(card: Card, state: GameState, own: Card[]) {
    const seen = new Set([...state.played, ...own.map((c) => c.id)]);
    return RANK_ORDER.slice(0, rankIdx(card.rank)).every((r) => seen.has(card.suit + r));
}

// Player holding both K and Q of trump, if any.
export function findPairHolder(hands: Card[][], trumpSuit: string): number | null {
    const idx = hands.findIndex((h) =>
        h.some((c) => c.id === trumpSuit + "K") && h.some((c) => c.id === trumpSuit + "Q"));
    return idx === -1 ? null : idx;
}

// The pair can be shown once trump is open and the holder's side has won a trick since.
export function pairReady(state: GameState) {
    return state.phase === "playing" && state.pairHolder !== null && !state.pairDeclared
        && state.trumpRevealed && state.teamWonSinceReveal[state.pairHolder % 2];
}

export function declarePair(state: GameState): GameState {
    const holder = state.pairHolder!;
    const forCaller = holder % 2 === state.caller! % 2;
    const from = state.currentBid;
    const to = forCaller ? Math.max(16, from - 4) : Math.min(28, from + 4);
    const sym = SUIT_INFO[state.trumpSuit!].sym;
    let s: GameState = { ...state, currentBid: to, pairDeclared: { player: holder, from, to } };
    s = addLog(s, `${state.names[holder]} shows the pair K${sym} Q${sym}. Bid ${from} → ${to}.`);
    s = showBanner(s, `Pair! Bid ${from} → ${to}`, "trump");
    return s;
}

export function evaluateMove(card: Card, state: GameState, trumpKnownToUser: boolean): string | null {
    const hand = state.hands[0];
    const { leadSuit, trick, trumpSuit } = state;
    const legal = legalCards(hand, state, 0);
    if (legal.length <= 1) return null;
    if (trick.length === 0) {
        if (card.suit === trumpSuit)
            return "Leading trump reveals it to everyone. Fine for control, but gives up the secret early.";
        return null;
    }
    const currentBest = trick.reduce((best, t) =>
        cardBeats(t.card, best.card, leadSuit!, trumpSuit!) ? t : best, trick[0]);
    if (currentBest.player === 2) {
        // Partner holds the trick. Playing last, it's safe to feed them points.
        if (trick.length !== 3) return null;
        const richest = [...legal].sort((a, b) => POINTS[b.rank] - POINTS[a.rank])[0];
        if (POINTS[richest.rank] > POINTS[card.rank])
            return `Partner had this trick. Feeding ${cardLabel(richest)} would have banked ${POINTS[richest.rank]} more.`;
        return null;
    }
    const wins = (c: Card) => cardBeats(c, currentBest.card, leadSuit!, trumpSuit!);
    const playedWins = wins(card);
    const winners = legal.filter(wins);
    const isVoid = leadSuit && !hand.some((c) => c.suit === leadSuit);
    if (isVoid) {
        const cheaper = legal.filter((c) => POINTS[c.rank] < POINTS[card.rank]);
        if (POINTS[card.rank] > 0 && cheaper.length > 0)
            return `Discarding ${POINTS[card.rank]} point${POINTS[card.rank] > 1 ? "s" : ""}. A zero-point card was free to let go.`;
        if (trumpKnownToUser && !playedWins && card.suit !== trumpSuit) {
            const tw = winners.find((c) => c.suit === trumpSuit);
            if (tw) return `You could have trumped in with ${tw.rank}${SUIT_INFO[tw.suit].sym} to win this trick.`;
        }
        return null;
    }
    if (playedWins) {
        const lesser = winners.find((c) => c.id !== card.id && cardBeats(card, c, leadSuit!, trumpSuit!));
        if (lesser)
            return `Won with more than needed — ${lesser.rank}${SUIT_INFO[lesser.suit].sym} also wins, keeping ${card.rank}${SUIT_INFO[card.suit].sym} in reserve.`;
        return null;
    }
    if (winners.length > 0) return `${winners[0].rank}${SUIT_INFO[winners[0].suit].sym} would have won this trick.`;
    return null;
}

export function nextActive(from: number, passed: boolean[]) {
    let p = (from + 1) % 4, guard = 0;
    while (passed[p] && guard < 8) { p = (p + 1) % 4; guard++; }
    return p;
}

// Reorder remaining bidders so positions 0 & 1 are always from opposing teams.
// The high bidder (if any) is anchored at position 0.
export function teamAwareBidOrder(remaining: number[], highBidder: number | null): number[] {
    let ordered = [...remaining];
    if (highBidder !== null && ordered.includes(highBidder)) {
        ordered = [highBidder, ...ordered.filter(p => p !== highBidder)];
    }
    if (ordered.length >= 2 && ordered[0] % 2 === ordered[1] % 2) {
        const oppIdx = ordered.findIndex((p, i) => i > 1 && p % 2 !== ordered[0] % 2);
        if (oppIdx !== -1) {
            const opp = ordered[oppIdx];
            ordered = [ordered[0], opp, ...ordered.filter((_, i) => i !== 0 && i !== oppIdx)];
        }
    }
    return ordered;
}

// Value of the four bidding cards, judged by the best suit to call as trump.
// Trump J/9 and trump length matter most; side Js are near-certain tricks.
export const TRUMP_VALUE: Record<string, number> = { J: 2.5, 9: 1.5, A: 0.75, "10": 0.5 };
export const SIDE_VALUE: Record<string, number> = { J: 1, 9: 0.25, A: 0.25 };
export function bidValue(hand: Card[]) {
    let best = 0;
    SUITS.forEach((s) => {
        const trumps = hand.filter((c) => c.suit === s);
        if (!trumps.length) return;
        let v = trumps.length - 1;
        trumps.forEach((c) => (v += TRUMP_VALUE[c.rank] ?? 0));
        hand.filter((c) => c.suit !== s).forEach((c) => (v += SIDE_VALUE[c.rank] ?? 0));
        best = Math.max(best, v);
    });
    return best;
}
// Lone trump J ≈ 17, J+9 of a suit ≈ 19, J+9 with length ≈ 21.
// About a third of hands pass outright; only ~5% are willing to reach 20+.
export function aiBidDecision(hand: Card[], currentBid: number, mustRaise: boolean, opening: boolean): number | null {
    const willing = Math.min(22, 14 + Math.round(bidValue(hand)));
    // Opening bid is 17 (same as for the human); after that, match or raise by one
    const minBid = opening ? 17 : mustRaise ? currentBid + 1 : currentBid;
    return minBid <= willing ? minBid : null;
}
export function aiChooseTrump(hand: Card[]) {
    const bySuit: Record<string, { pts: number; count: number }> = {};
    SUITS.forEach((s) => (bySuit[s] = { pts: 0, count: 0 }));
    hand.forEach((c) => { bySuit[c.suit].pts += POINTS[c.rank]; bySuit[c.suit].count += 1; });
    let best = SUITS[0], bestScore = -1;
    SUITS.forEach((s) => {
        const score = bySuit[s].pts * 1.5 + bySuit[s].count;
        if (score > bestScore) { bestScore = score; best = s; }
    });
    return best;
}
export function aiPlayCard(playerIdx: number, state: GameState): Card {
    const hand = state.hands[playerIdx];
    const { leadSuit, trick, trumpSuit } = state;
    const knowsTrump = state.caller === playerIdx || state.trumpRevealed;
    const onCallerTeam = state.caller! % 2 === playerIdx % 2;
    const legal = legalCards(hand, state, playerIdx);
    const pts = (c: Card) => POINTS[c.rank];
    const boss = (c: Card) => isBoss(c, state, hand);
    // Cheapest card: fewest points, then lowest rank
    const lowest = (cards: Card[]) =>
        [...cards].sort((a, b) => pts(a) - pts(b) || rankIdx(b.rank) - rankIdx(a.rank))[0];
    const sideCards = (cards: Card[]) => {
        const side = cards.filter((c) => !knowsTrump || c.suit !== trumpSuit);
        return side.length ? side : cards;
    };

    if (trick.length === 0) {
        // Caller's side pulls trumps once they are in the open
        const trumps = knowsTrump ? hand.filter((c) => c.suit === trumpSuit) : [];
        if (state.trumpRevealed && onCallerTeam && trumps.length >= 2) {
            const top = trumps.find(boss);
            if (top) return top;
        }
        const pool = sideCards(hand);
        const bosses = pool.filter(boss).sort((a, b) => pts(b) - pts(a));
        if (bosses.length && (pts(bosses[0]) > 0 || Math.random() < 0.5)) return bosses[0];
        // Otherwise lead something cheap from the longest suit
        const len = (s: string) => pool.filter((c) => c.suit === s).length;
        return [...pool].sort((a, b) => pts(a) - pts(b) || len(b.suit) - len(a.suit) || rankIdx(b.rank) - rankIdx(a.rank))[0];
    }

    const best = trick.reduce((b, t) => cardBeats(t.card, b.card, leadSuit!, trumpSuit!) ? t : b, trick[0]);
    const partnerWinning = best.player % 2 === playerIdx % 2;
    const last = trick.length === 3;
    const trickPts = trick.reduce((s, t) => s + pts(t.card), 0);

    if (partnerWinning) {
        const safe = last || (boss(best.card) && (best.card.suit === trumpSuit || Math.random() < 0.6));
        if (!safe) return lowest(sideCards(legal));
        // Feed points, keeping our own boss cards for later tricks where possible
        return [...sideCards(legal)].sort((a, b) =>
            pts(b) - pts(a) || Number(boss(a)) - Number(boss(b)))[0];
    }

    const winners = legal.filter((c) => cardBeats(c, best.card, leadSuit!, trumpSuit!));
    if (winners.length) {
        const cheapest = [...winners].sort((a, b) => {
            const aw = a.suit === trumpSuit ? 100 - rankIdx(a.rank) : 50 - rankIdx(a.rank);
            const bw = b.suit === trumpSuit ? 100 - rankIdx(b.rank) : 50 - rankIdx(b.rank);
            return aw - bw;
        });
        if (last) return cheapest[0];
        if (cheapest[0].suit === trumpSuit && leadSuit !== trumpSuit) {
            if (trickPts >= 1 || Math.random() < 0.4) return cheapest[0];
        } else {
            const safeWin = cheapest.find(boss);
            if (safeWin) return safeWin;
            if (trickPts >= 2) return cheapest[0];
        }
    }
    return lowest(sideCards(legal));
}

export function aiDoubleDecision(state: GameState): boolean {
    const callerTeam = state.caller! % 2;
    const stretch = state.currentBid - 17;
    if (state.doubleStage === "double") {
        const defenders = [1, 3, 0, 2].filter((p) => p % 2 !== callerTeam && p !== 0);
        const best = Math.max(...defenders.map((p) => handPoints(state.hands[p])));
        return best + stretch >= 12 && Math.random() < 0.6;
    }
    const hand = state.hands[state.caller!];
    const trumps = hand.filter((c) => c.suit === state.trumpSuit).length;
    return handPoints(hand) + trumps * 1.5 - stretch >= 14 && Math.random() < 0.7;
}

/* ---------- State ---------- */
export interface LastResult {
    callerTeam: number; made: boolean; bid: number;
    callerPts: number; defTeam: number; defPts: number;
    winningTeam: number; tips: string[];
    underHalf: boolean; pointsAwarded: number; matchOver: boolean;
    lastTrickTeam: number;
    multiplier: number;
    pair: { team: number; from: number; to: number } | null;
}
export interface Stats {
    matchesPlayed: number; matchesWon: number;
    bidsTotal: number; bidsMade: number;
    streak: number; bestStreak: number;
}
export interface GameState {
    phase: string; dealer: number; hands: Card[][];
    restDeck: Card[]; bidTurn: number; currentBid: number;
    highBidder: number | null; passed: boolean[];
    caller: number | null; trumpSuit: string | null;
    trumpRevealed: boolean; trick: TrickEntry[];
    leadSuit: string | null; turn: number;
    teamPoints: Record<number, number>; handsWon: Record<number, number>;
    tricksPlayed: number; log: string[];
    lastResult: LastResult | null; round: number;
    banner: { id: number; text: string; kind: string } | null; bannerSeq: number;
    names: string[]; feedbackOn: boolean; halfBidPenaltyOn: boolean;
    moveTip: { id: number; text: string } | null; moveTipSeq: number;
    handTips: string[]; lastTrickWinner?: number;
    bidOrder: number[];   // remaining bidders in queue; first two are the active pair
    mustRaise: boolean;   // true after a match — next bidder cannot match, must raise
    dealSeq: number;      // bumps on every deal, including redeals
    askedBy: number | null;   // who asked for trump in the current trick
    played: string[];         // ids of every card played this hand
    prevTrick: TrickEntry[];
    pairHolder: number | null;
    pairDeclared: { player: number; from: number; to: number } | null;
    teamWonSinceReveal: Record<number, boolean>;
    multiplier: number;       // 1, 2 after a double, 4 after a redouble
    doubleStage: "double" | "redouble" | null;
    stats: Stats;
    shownOut: { player: number; suit: string; card: string; trick: number }[];   // failed to follow suit
    holdTricks: boolean;         // keep a finished trick on the table until tapped
    learnOn: boolean;            // learn mode asks a question before each of your turns
    quiz: Quiz | null;           // question waiting for an answer
    quizSeq: number;
    quizKey: string;             // deal and trick of the last question, so each turn asks once
    lastSkill: Skill | null;
    endgameDeal: number;         // deal in which the endgame question was asked
    learnStats: LearnStats;      // per skill, kept across matches
    handStats: LearnStats;       // this hand only
}

export const emptyStats: Stats = { matchesPlayed: 0, matchesWon: 0, bidsTotal: 0, bidsMade: 0, streak: 0, bestStreak: 0 };

export const initialState: GameState = {
    phase: "idle", dealer: 3, hands: [[], [], [], []],
    restDeck: [], bidTurn: 0, currentBid: 16, highBidder: null,
    passed: [false, false, false, false], caller: null,
    trumpSuit: null, trumpRevealed: false, trick: [], leadSuit: null,
    turn: 0, teamPoints: { 0: 0, 1: 0 }, handsWon: { 0: 0, 1: 0 },
    tricksPlayed: 0, log: [], lastResult: null, round: 0,
    banner: null, bannerSeq: 0,
    names: ["You", "Pikachu", "Partner", "Mewtwo"],
    feedbackOn: true, halfBidPenaltyOn: true,
    moveTip: null, moveTipSeq: 0, handTips: [],
    bidOrder: [], mustRaise: false,
    dealSeq: 0, askedBy: null, played: [], prevTrick: [],
    pairHolder: null, pairDeclared: null, teamWonSinceReveal: { 0: false, 1: false },
    multiplier: 1, doubleStage: null, stats: emptyStats,
    shownOut: [], holdTricks: true,
    learnOn: false, quiz: null, quizSeq: 0, quizKey: "", lastSkill: null, endgameDeal: 0,
    learnStats: {}, handStats: {},
};

export function addLog(state: GameState, msg: string): GameState {
    return { ...state, log: [msg, ...state.log].slice(0, 8) };
}
export function showBanner(state: GameState, text: string, kind: string): GameState {
    const id = (state.bannerSeq || 0) + 1;
    return { ...state, banner: { id, text, kind }, bannerSeq: id };
}
export function showMoveTip(state: GameState, text: string): GameState {
    const id = (state.moveTipSeq || 0) + 1;
    return { ...state, moveTip: { id, text }, moveTipSeq: id, handTips: [...state.handTips, text] };
}

export type Action =
    | { type: "INIT_NAMES"; names: string[] }
    | { type: "DEAL"; redeal?: boolean }
    | { type: "REDEAL"; playerIdx: number }
    | { type: "BID"; playerIdx: number; amount: number }
    | { type: "PASS"; playerIdx: number }
    | { type: "CHOOSE_TRUMP"; suit: string }
    | { type: "DOUBLE_CALL"; yes: boolean }
    | { type: "AI_DOUBLE" }
    | { type: "DECLARE_PAIR" }
    | { type: "ASK_TRUMP"; playerIdx: number }
    | { type: "PLAY_CARD"; playerIdx: number; card: Card }
    | { type: "CLEAR_TRICK" }
    | { type: "AI_BID"; playerIdx: number }
    | { type: "AI_CHOOSE_TRUMP" }
    | { type: "AI_PLAY"; playerIdx: number }
    | { type: "CLEAR_BANNER"; id: number }
    | { type: "CLEAR_MOVE_TIP"; id: number }
    | { type: "TOGGLE_FEEDBACK" }
    | { type: "TOGGLE_HALF_BID" }
    | { type: "TOGGLE_HOLD" }
    | { type: "NEW_MATCH" }
    | { type: "RESET" }
    | LearnAction;

export function reducer(state: GameState, action: Action): GameState {
    switch (action.type) {
        case "INIT_NAMES": return { ...state, names: action.names };
        case "DEAL": {
            const deck = shuffle(makeDeck());
            const hands: Card[][] = [[], [], [], []];
            for (let i = 0; i < 16; i++) hands[i % 4].push(deck[i]);
            const restDeck = deck.slice(16);
            const dealer = state.phase === "idle" || action.redeal ? state.dealer : (state.dealer + 1) % 4;
            const firstBidder = (dealer + 1) % 4;
            const bidOrder = [0, 1, 2, 3].map((i) => (firstBidder + i) % 4);
            const round = action.redeal ? state.round : state.round + 1;
            let s: GameState = {
                ...state, phase: "bidding", dealer, hands, restDeck,
                bidTurn: firstBidder, bidOrder, mustRaise: false,
                currentBid: 16, highBidder: null, passed: [false, false, false, false],
                caller: null, trumpSuit: null, trumpRevealed: false, trick: [],
                leadSuit: null, tricksPlayed: 0, teamPoints: { 0: 0, 1: 0 },
                lastResult: null, round, handTips: [], dealSeq: state.dealSeq + 1,
                askedBy: null, played: [], prevTrick: [], shownOut: [], pairHolder: null, pairDeclared: null,
                teamWonSinceReveal: { 0: false, 1: false }, multiplier: 1, doubleStage: null,
            };
            s = addLog(s, `Round ${round}. ${state.names[firstBidder]} ${firstBidder === 0 ? "open" : "opens"}.`);
            if (!action.redeal) s = showBanner(s, `Round ${round}`, "round");
            return s;
        }
        case "REDEAL": {
            // A player whose first four cards hold no points may ask for a fresh deal.
            let s = reducer(state, { type: "DEAL", redeal: true });
            s = addLog(s, `${state.names[action.playerIdx]} had no points. Redeal!`);
            return showBanner(s, "Redeal", "round");
        }
        case "BID": {
            const { playerIdx, amount } = action;
            // Is this a match (same level) or a raise?
            const isMatch = state.highBidder !== null && amount === state.currentBid;
            const mustRaise = isMatch; // after a match the other player must raise
            let s = { ...state, currentBid: amount, highBidder: playerIdx, mustRaise };
            s = addLog(s, `${state.names[playerIdx]} ${isMatch ? "matches" : "bids"} ${amount}.`);
            // Next turn is the other player in the active pair (bidOrder[0] and bidOrder[1])
            const nextInPair = s.bidOrder[0] === playerIdx ? s.bidOrder[1] : s.bidOrder[0];
            s = { ...s, bidTurn: nextInPair };
            return s;
        }
        case "PASS": {
            const { playerIdx } = action;
            const passed = [...state.passed];
            passed[playerIdx] = true;
            const remaining = state.bidOrder.filter((p) => p !== playerIdx);
            let s = addLog({ ...state, passed }, `${state.names[playerIdx]} passes.`);
            if (remaining.length === 1) {
                const last = remaining[0];
                const finalBid = state.highBidder === null ? 17 : state.currentBid;
                s = { ...s, bidOrder: remaining, caller: last, currentBid: finalBid, phase: "choose-trump", bidTurn: last };
                s = addLog(s, `${state.names[last]} wins the bid at ${finalBid}.`);
                return s;
            }
            // Check if one team has no remaining bidders
            const t0 = remaining.filter(p => p % 2 === 0);
            const t1 = remaining.filter(p => p % 2 === 1);
            if (t0.length === 0 || t1.length === 0) {
                const winnerQ = t0.length > 0 ? t0 : t1;
                const last = (state.highBidder !== null && winnerQ.includes(state.highBidder))
                    ? state.highBidder : winnerQ[0];
                const finalBid = state.highBidder === null ? 17 : state.currentBid;
                s = { ...s, bidOrder: [last], caller: last, currentBid: finalBid, phase: "choose-trump", bidTurn: last };
                s = addLog(s, `${state.names[last]} wins the bid at ${finalBid}.`);
                return s;
            }
            // Ensure opposing teams stay in the active pair (positions 0 and 1)
            const bidOrder = teamAwareBidOrder(remaining, state.highBidder);
            // Next: the passer's replacement responds (position 1 if there's a high bidder,
            // position 0 if no one has bid yet)
            const nextTurn = state.highBidder !== null ? bidOrder[1] : bidOrder[0];
            s = { ...s, bidOrder, bidTurn: nextTurn, mustRaise: false };
            return s;
        }
        case "CHOOSE_TRUMP": {
            const { suit } = action;
            const hands = state.hands.map((h, i) => [...h, ...state.restDeck.filter((_, idx) => idx % 4 === i)]);
            let s: GameState = {
                ...state, trumpSuit: suit, trumpRevealed: false, hands,
                phase: "doubling", doubleStage: "double", multiplier: 1,
                pairHolder: findPairHolder(hands, suit),
                turn: state.caller!, leadSuit: null, trick: [], tricksPlayed: 0,
            };
            s = addLog(s, state.caller === 0 ? `You chose ${SUIT_INFO[suit].name} (secret).` : `${state.names[state.caller!]} chose trump secretly.`);
            return s;
        }
        case "DOUBLE_CALL": {
            const tn = teamNames(state.names);
            const callerTeam = state.caller! % 2;
            const startPlay = (s: GameState): GameState => ({ ...s, phase: "playing", doubleStage: null, turn: s.caller! });
            if (state.doubleStage === "double") {
                if (!action.yes) return startPlay(addLog(state, `${tn[1 - callerTeam]} let the bid stand.`));
                let s: GameState = { ...state, multiplier: 2, doubleStage: "redouble" };
                s = addLog(s, `${tn[1 - callerTeam]} double! The hand is worth twice as much.`);
                return showBanner(s, "Double!", "match");
            }
            if (!action.yes) return startPlay(addLog(state, `${tn[callerTeam]} play on at double.`));
            let s: GameState = addLog({ ...state, multiplier: 4 }, `${tn[callerTeam]} redouble! ×4 stakes.`);
            return startPlay(showBanner(s, "Redouble!", "match"));
        }
        case "AI_DOUBLE":
            return reducer(state, { type: "DOUBLE_CALL", yes: aiDoubleDecision(state) });
        case "DECLARE_PAIR":
            return pairReady(state) ? declarePair(state) : state;
        case "ASK_TRUMP": {
            const { playerIdx } = action;
            let s = { ...state, trumpRevealed: true, askedBy: playerIdx };
            s = addLog(s, playerIdx === 0 ? `You ask for trump — it's ${SUIT_INFO[state.trumpSuit!].name}!` : `${state.names[playerIdx]} asks for trump — it's ${SUIT_INFO[state.trumpSuit!].name}!`);
            s = showBanner(s, `Trump: ${SUIT_INFO[state.trumpSuit!].sym} ${SUIT_INFO[state.trumpSuit!].name}`, "trump");
            return s;
        }
        case "PLAY_CARD": {
            const { playerIdx, card } = action;
            let tipText: string | null = null;
            if (playerIdx === 0 && state.feedbackOn) {
                tipText = evaluateMove(card, state, state.caller === 0 || state.trumpRevealed);
            }
            const hands = state.hands.map((h, i) => i === playerIdx ? h.filter((c) => c.id !== card.id) : h);
            const trick = [...state.trick, { player: playerIdx, card }];
            let leadSuit = state.leadSuit;
            if (trick.length === 1) leadSuit = card.suit;
            let trumpRevealed = state.trumpRevealed;
            if (card.suit === state.trumpSuit && !trumpRevealed) trumpRevealed = true;
            // Not following suit shows everyone the player is out of the led suit.
            const showsOut = state.leadSuit !== null && card.suit !== state.leadSuit
                && !state.shownOut.some((v) => v.player === playerIdx && v.suit === state.leadSuit);
            const shownOut = showsOut
                ? [...state.shownOut, { player: playerIdx, suit: state.leadSuit!, card: card.id, trick: state.tricksPlayed + 1 }]
                : state.shownOut;
            let s: GameState = { ...state, hands, trick, leadSuit, trumpRevealed, shownOut, played: [...state.played, card.id] };
            s = addLog(s, `${state.names[playerIdx]} plays ${card.rank}${SUIT_INFO[card.suit].sym}.`);
            if (tipText) s = showMoveTip(s, tipText);
            if (trumpRevealed && !state.trumpRevealed) {
                s = addLog(s, `Trump revealed: ${SUIT_INFO[state.trumpSuit!].name}!`);
                s = showBanner(s, `Trump: ${SUIT_INFO[state.trumpSuit!].sym} ${SUIT_INFO[state.trumpSuit!].name}`, "trump");
            }
            if (trick.length === 4) {
                const winner = trickWinner(trick, leadSuit!, state.trumpSuit!);
                const pts = trick.reduce((sum, t) => sum + POINTS[t.card.rank], 0);
                const team = winner % 2;
                const teamPoints = { ...s.teamPoints, [team]: s.teamPoints[team] + pts };
                const tricksPlayed = s.tricksPlayed + 1;
                const teamWonSinceReveal = s.trumpRevealed
                    ? { ...s.teamWonSinceReveal, [team]: true } : s.teamWonSinceReveal;
                s = addLog({ ...s, teamPoints, tricksPlayed, lastTrickWinner: winner, teamWonSinceReveal },
                    `${state.names[winner]} wins the trick (+${pts}). Team ${team === 0 ? teamNames(state.names)[0] : teamNames(state.names)[1]}: ${teamPoints[team]} pts.`);
                // AI players show the pair as soon as they're allowed to
                if (pairReady(s) && s.pairHolder !== 0) s = declarePair(s);
            } else {
                s = { ...s, turn: (playerIdx + 1) % 4 };
            }
            return s;
        }
        case "CLEAR_TRICK": {
            let s: GameState = {
                ...state, trick: [], leadSuit: null, turn: state.lastTrickWinner!,
                askedBy: null, prevTrick: state.trick,
            };
            if (s.tricksPlayed >= 8) {
                const callerTeam = s.caller! % 2;
                // Last trick winner gets the bonus point (making total 29)
                const lastTrickTeam = state.lastTrickWinner! % 2;
                const teamPoints = { ...s.teamPoints, [lastTrickTeam]: s.teamPoints[lastTrickTeam] + 1 };
                s = { ...s, teamPoints };
                const made = teamPoints[callerTeam] >= s.currentBid;
                const winningTeam = made ? callerTeam : 1 - callerTeam;
                const underHalf = !made && s.halfBidPenaltyOn && teamPoints[callerTeam] < s.currentBid / 2;
                const pointsAwarded = (underHalf ? 2 : 1) * s.multiplier;
                const handsWon = { ...s.handsWon, [winningTeam]: s.handsWon[winningTeam] + pointsAwarded };
                const matchOver = handsWon[winningTeam] >= MATCH_TARGET;
                const tips = s.pairHolder === 0 && !s.pairDeclared
                    ? [...s.handTips, s.teamWonSinceReveal[0]
                            ? "You held the trump pair (K+Q) but never showed it. That's 4 bid points left on the table."
                            : "You held the trump pair (K+Q). It counts once trump is open and your side wins a trick after."]
                    : s.handTips;
                const st = s.stats;
                const streak = winningTeam === 0 ? st.streak + 1 : 0;
                const stats: Stats = {
                    matchesPlayed: st.matchesPlayed + (matchOver ? 1 : 0),
                    matchesWon: st.matchesWon + (matchOver && winningTeam === 0 ? 1 : 0),
                    bidsTotal: st.bidsTotal + (s.caller === 0 ? 1 : 0),
                    bidsMade: st.bidsMade + (s.caller === 0 && made ? 1 : 0),
                    streak, bestStreak: Math.max(st.bestStreak, streak),
                };
                s = {
                    ...s, phase: "hand-end", handsWon, stats,
                    lastResult: {
                        callerTeam, made, bid: s.currentBid, callerPts: teamPoints[callerTeam],
                        defTeam: 1 - callerTeam, defPts: teamPoints[1 - callerTeam],
                        winningTeam, tips, underHalf, pointsAwarded, matchOver,
                        lastTrickTeam, multiplier: s.multiplier,
                        pair: s.pairDeclared ? { team: s.pairDeclared.player % 2, from: s.pairDeclared.from, to: s.pairDeclared.to } : null,
                    },
                };
                const tn2 = teamNames(state.names);
                s = addLog(s, `${tn2[lastTrickTeam]} win last trick (+1 bonus).`);
                s = addLog(s, made
                    ? `${tn2[callerTeam]} made the bid!`
                    : underHalf
                    ? `${tn2[callerTeam]} fell under half — double point to ${tn2[1 - callerTeam]}.`
                    : `${tn2[callerTeam]} fell short. ${tn2[1 - callerTeam]} wins the hand.`);
                if (matchOver) {
                    s = showBanner(s, `${tn2[winningTeam]} win!`, "match");
                }
            }
            return s;
        }
        case "AI_BID": {
            const { playerIdx } = action;
            if (state.highBidder === null && handPoints(state.hands[playerIdx]) === 0 && Math.random() < 0.8)
                return reducer(state, { type: "REDEAL", playerIdx });
            const decision = aiBidDecision(state.hands[playerIdx], state.currentBid, state.mustRaise, state.highBidder === null);
            if (decision === null)
                return reducer(state, { type: "PASS", playerIdx });
            return reducer(state, { type: "BID", playerIdx, amount: decision });
        }
        case "AI_CHOOSE_TRUMP":
            return reducer(state, { type: "CHOOSE_TRUMP", suit: aiChooseTrump(state.hands[state.caller!]) });
        case "AI_PLAY": {
            const { playerIdx } = action;
            const hand = state.hands[playerIdx];
            const isVoid = state.leadSuit && !hand.some((c) => c.suit === state.leadSuit);
            let working = state;
            if (isVoid && !state.trumpRevealed && playerIdx !== state.caller) {
                // Asking commits you to trump, so only ask when the trick is worth taking
                const { trick, leadSuit, trumpSuit } = state;
                const best = trick.reduce((b, t) => cardBeats(t.card, b.card, leadSuit!, trumpSuit!) ? t : b, trick[0]);
                const trickPts = trick.reduce((sum, t) => sum + POINTS[t.card.rank], 0);
                const defending = playerIdx % 2 !== state.caller! % 2;
                const urge = best.player % 2 === playerIdx % 2 ? 0.1
                    : trickPts >= 2 ? (defending ? 0.9 : 0.7)
                    : (defending ? 0.5 : 0.25);
                if (Math.random() < urge)
                    working = reducer(state, { type: "ASK_TRUMP", playerIdx });
            }
            const card = aiPlayCard(playerIdx, working);
            return reducer(working, { type: "PLAY_CARD", playerIdx, card });
        }
        case "CLEAR_BANNER":
            if (state.banner && state.banner.id === action.id) return { ...state, banner: null };
            return state;
        case "CLEAR_MOVE_TIP":
            if (state.moveTip && state.moveTip.id === action.id) return { ...state, moveTip: null };
            return state;
        case "TOGGLE_FEEDBACK": return { ...state, feedbackOn: !state.feedbackOn, moveTip: null };
        case "TOGGLE_HALF_BID": return { ...state, halfBidPenaltyOn: !state.halfBidPenaltyOn };
        case "TOGGLE_HOLD": return { ...state, holdTricks: !state.holdTricks };
        case "NEW_MATCH": return reducer({ ...state, handsWon: { 0: 0, 1: 0 }, round: 0 }, { type: "DEAL" });
        case "RESET": return { ...initialState, names: state.names, feedbackOn: state.feedbackOn, halfBidPenaltyOn: state.halfBidPenaltyOn, holdTricks: state.holdTricks, stats: state.stats, bidOrder: [], mustRaise: false, learnOn: state.learnOn, learnStats: state.learnStats };
        default: return state;
    }
}
