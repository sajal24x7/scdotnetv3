import React, { useReducer, useEffect, useRef, useState } from "react";

// ── Constants ──────────────────────────────────────────────────────────────────
const SUITS = ["S", "H", "D", "C"] as const;
type Suit = typeof SUITS[number];
const SUIT_INFO: Record<Suit, { sym: string; color: string; name: string }> = {
  S: { sym: "♠", color: "#1a1a1a", name: "Spades" },
  C: { sym: "♣", color: "#1a1a1a", name: "Clubs" },
  H: { sym: "♥", color: "#9a2b3a", name: "Hearts" },
  D: { sym: "♦", color: "#9a2b3a", name: "Diamonds" },
};
const RANK_ORDER = ["J", "9", "A", "10", "K", "Q", "8", "7"] as const;
const POINTS: Record<string, number> = { J: 3, 9: 2, A: 1, "10": 1, K: 0, Q: 0, "8": 0, "7": 0 };
const MATCH_TARGET = 6;

type Card = { suit: Suit; rank: string; id: string };
type TrickEntry = { player: number; card: Card };
type Banner = { id: number; text: string; kind: string } | null;
type MoveTip = { id: number; text: string } | null;
type LastResult = {
  callerTeam: number; made: boolean; bid: number; callerPts: number;
  defTeam: number; defPts: number; winningTeam: number; tips: string[];
  underHalf: boolean; pointsAwarded: number; matchOver: boolean;
} | null;
type GameState = {
  phase: string; dealer: number; hands: Card[][]; restDeck: Card[];
  bidTurn: number; currentBid: number; highBidder: number | null;
  passed: boolean[]; caller: number | null; trumpSuit: Suit | null;
  trumpRevealed: boolean; trick: TrickEntry[]; leadSuit: Suit | null;
  turn: number; teamPoints: Record<number, number>; handsWon: Record<number, number>;
  tricksPlayed: number; log: string[]; lastResult: LastResult;
  lastTrickWinner?: number; round: number; bannerSeq: number; banner: Banner;
  names: string[]; feedbackOn: boolean; halfBidPenaltyOn: boolean;
  moveTipSeq: number; moveTip: MoveTip; handTips: string[];
};
type Action =
  | { type: "START"; names: string[] }
  | { type: "DEAL" }
  | { type: "BID"; playerIdx: number; amount: number }
  | { type: "PASS"; playerIdx: number }
  | { type: "CHOOSE_TRUMP"; suit: Suit }
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
  | { type: "NEW_MATCH" };

// ── Game logic ─────────────────────────────────────────────────────────────────
const rankIdx = (r: string) => RANK_ORDER.indexOf(r as typeof RANK_ORDER[number]);

function sortHand(hand: Card[]) {
  return [...hand].sort((a, b) => {
    if (a.suit !== b.suit) return SUITS.indexOf(a.suit) - SUITS.indexOf(b.suit);
    return rankIdx(b.rank) - rankIdx(a.rank);
  });
}
function makeDeck(): Card[] {
  const d: Card[] = [];
  SUITS.forEach((s) => RANK_ORDER.forEach((r) => d.push({ suit: s, rank: r, id: s + r })));
  return d;
}
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function cardBeats(a: Card, b: Card, leadSuit: Suit, trumpSuit: Suit) {
  const at = a.suit === trumpSuit, bt = b.suit === trumpSuit;
  if (at && !bt) return true;
  if (!at && bt) return false;
  if (at && bt) return rankIdx(a.rank) < rankIdx(b.rank);
  if (a.suit === leadSuit && b.suit === leadSuit) return rankIdx(a.rank) < rankIdx(b.rank);
  if (a.suit === leadSuit && b.suit !== leadSuit) return true;
  return false;
}
function trickWinner(trick: TrickEntry[], leadSuit: Suit, trumpSuit: Suit) {
  let best = trick[0];
  for (const t of trick.slice(1)) if (cardBeats(t.card, best.card, leadSuit, trumpSuit)) best = t;
  return best.player;
}
function nextActive(from: number, passed: boolean[]) {
  let p = (from + 1) % 4, guard = 0;
  while (passed[p] && guard < 8) { p = (p + 1) % 4; guard++; }
  return p;
}
function evaluateMove(card: Card, st: GameState, trumpKnown: boolean) {
  const hand = st.hands[0], ls = st.leadSuit!, ts = st.trumpSuit!;
  let legal = ls ? hand.filter((c) => c.suit === ls) : hand;
  if (!legal.length) legal = hand;
  if (legal.length <= 1) return null;
  if (st.trick.length === 0) {
    return card.suit === ts ? "Leading trump reveals it immediately. Good for control, but loses the element of surprise." : null;
  }
  const best = st.trick.reduce((b, t) => (cardBeats(t.card, b.card, ls, ts) ? t : b), st.trick[0]);
  const wins = (c: Card) => cardBeats(c, best.card, ls, ts);
  const playedWins = wins(card);
  const winners = legal.filter(wins);
  const isVoid = ls && !hand.some((c) => c.suit === ls);
  if (isVoid) {
    const cheaper = legal.filter((c) => POINTS[c.rank] < POINTS[card.rank]);
    if (POINTS[card.rank] > 0 && cheaper.length > 0)
      return `Discarding ${POINTS[card.rank]} point${POINTS[card.rank] > 1 ? "s" : ""} — a zero-point card would cost nothing.`;
    if (trumpKnown && !playedWins && card.suit !== ts) {
      const tw = winners.find((c) => c.suit === ts);
      if (tw) return `You could have trumped in with ${tw.rank}${SUIT_INFO[tw.suit].sym} to take this trick.`;
    }
    return null;
  }
  if (playedWins) {
    const lesser = winners.find((c) => c.id !== card.id && cardBeats(card, c, ls, ts));
    if (lesser) return `${lesser.rank}${SUIT_INFO[lesser.suit].sym} would have won too — keeping ${card.rank}${SUIT_INFO[card.suit].sym} in reserve.`;
    return null;
  }
  if (winners.length > 0) return `${winners[0].rank}${SUIT_INFO[winners[0].suit].sym} would have taken this trick.`;
  return null;
}

// ── AI ─────────────────────────────────────────────────────────────────────────
function handStrength(hand: Card[]) {
  const pts = hand.reduce((s, c) => s + POINTS[c.rank], 0);
  const bySuit: Record<string, number> = {};
  hand.forEach((c) => (bySuit[c.suit] = (bySuit[c.suit] || 0) + 1));
  return pts + Math.max(...Object.values(bySuit)) * 1.4;
}
function aiBidDecision(hand: Card[], currentBid: number) {
  const willing = Math.min(28, 13 + Math.round(handStrength(hand) * 1.15) + (Math.random() < 0.3 ? 1 : 0));
  if (currentBid + 1 <= willing && currentBid < 28)
    return Math.min(willing, currentBid + (Math.random() < 0.25 ? 2 : 1), 28);
  return null;
}
function aiChooseTrump(hand: Card[]): Suit {
  const sc: Record<string, number> = {};
  SUITS.forEach((s) => (sc[s] = 0));
  hand.forEach((c) => (sc[c.suit] += POINTS[c.rank] * 1.5 + 1));
  return (SUITS.reduce((b, s) => (sc[s] > sc[b] ? s : b), SUITS[0]) as Suit);
}
function aiPlayCard(playerIdx: number, state: GameState): Card {
  const hand = state.hands[playerIdx];
  const { leadSuit: ls, trick, trumpSuit: ts } = state;
  const knowsTrump = state.caller === playerIdx || state.trumpRevealed;
  let legal = ls ? hand.filter((c) => c.suit === ls) : hand;
  if (!legal.length) legal = hand;
  if (!trick.length) {
    const pool = knowsTrump ? hand.filter((c) => c.suit !== ts) || hand : hand;
    const p = pool.length ? pool : hand;
    p.sort((a, b) => POINTS[b.rank] - POINTS[a.rank]);
    return p[Math.random() < 0.5 ? 0 : p.length - 1];
  }
  const bestEntry = trick.reduce((b, t) => cardBeats(t.card, b.card, ls!, ts!) ? t : b, trick[0]);
  const partnerWinning = bestEntry.player % 2 === playerIdx % 2;
  const winners = legal.filter((c) => cardBeats(c, bestEntry.card, ls!, ts!));
  if (!partnerWinning && winners.length > 0) {
    return [...winners].sort((a, b) => {
      const w = (c: Card) => c.suit === ts ? 100 - rankIdx(c.rank) : 50 - rankIdx(c.rank);
      return w(a) - w(b);
    })[0];
  }
  return [...legal].sort((a, b) => POINTS[a.rank] - POINTS[b.rank])[0];
}

// ── Reducer ────────────────────────────────────────────────────────────────────
const teamLabel = (names: string[]) => ({
  0: `${names[0]} & ${names[2]}`,
  1: `${names[1]} & ${names[3]}`,
} as Record<number, string>);

const init: GameState = {
  phase: "start", dealer: 3, hands: [[], [], [], []], restDeck: [],
  bidTurn: 0, currentBid: 13, highBidder: null, passed: [false, false, false, false],
  caller: null, trumpSuit: null, trumpRevealed: false, trick: [], leadSuit: null, turn: 0,
  teamPoints: { 0: 0, 1: 0 }, handsWon: { 0: 0, 1: 0 }, tricksPlayed: 0,
  log: ["Welcome — enter names to start."], lastResult: null, round: 0,
  bannerSeq: 0, banner: null, names: ["You", "Niraj", "Partner", "Smita"],
  feedbackOn: true, halfBidPenaltyOn: true, moveTipSeq: 0, moveTip: null, handTips: [],
};

function addLog(s: GameState, msg: string): GameState {
  return { ...s, log: [msg, ...s.log].slice(0, 8) };
}
function banner(s: GameState, text: string, kind: string): GameState {
  const id = (s.bannerSeq || 0) + 1;
  return { ...s, banner: { id, text, kind }, bannerSeq: id };
}
function tip(s: GameState, text: string): GameState {
  const id = (s.moveTipSeq || 0) + 1;
  return { ...s, moveTip: { id, text }, moveTipSeq: id, handTips: [...s.handTips, text] };
}

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case "START": return reducer({ ...state, names: action.names }, { type: "DEAL" });
    case "DEAL": {
      const deck = shuffle(makeDeck());
      const hands: Card[][] = [[], [], [], []];
      for (let i = 0; i < 16; i++) hands[i % 4].push(deck[i]);
      const dealer = state.phase === "start" ? state.dealer : (state.dealer + 1) % 4;
      const bidTurn = (dealer + 1) % 4;
      const round = state.round + 1;
      let s: GameState = {
        ...state, phase: "bidding", dealer, hands, restDeck: deck.slice(16), bidTurn,
        currentBid: 13, highBidder: null, passed: [false, false, false, false], caller: null,
        trumpSuit: null, trumpRevealed: false, trick: [], leadSuit: null, tricksPlayed: 0,
        teamPoints: { 0: 0, 1: 0 }, lastResult: null, round, handTips: [],
      };
      s = addLog(s, `Round ${round} — ${state.names[bidTurn]} bids first.`);
      s = banner(s, `Round ${round}`, "round");
      return s;
    }
    case "BID": {
      const { playerIdx, amount } = action;
      let s: GameState = { ...state, currentBid: amount, highBidder: playerIdx };
      s = addLog(s, `${state.names[playerIdx]} bids ${amount}.`);
      if (s.passed.filter((p) => !p).length === 1) {
        s.caller = playerIdx; s.phase = "choose-trump";
        return addLog(s, `${state.names[playerIdx]} wins the bid at ${amount}, picks trump.`);
      }
      s.bidTurn = nextActive(playerIdx, s.passed);
      return s;
    }
    case "PASS": {
      const { playerIdx } = action;
      const passed = [...state.passed]; passed[playerIdx] = true;
      let s = addLog({ ...state, passed }, `${state.names[playerIdx]} passes.`);
      if (passed.filter((p) => !p).length === 1) {
        const last = passed.findIndex((p) => !p);
        const finalBid = state.highBidder === null ? 14 : state.currentBid;
        s.caller = last; s.currentBid = finalBid; s.phase = "choose-trump";
        return addLog(s, `${state.names[last]} wins at ${finalBid}, picks trump.`);
      }
      s.bidTurn = nextActive(playerIdx, passed);
      return s;
    }
    case "CHOOSE_TRUMP": {
      const { suit } = action;
      const hands = state.hands.map((h, i) => [...h, ...state.restDeck.filter((_, idx) => idx % 4 === i)]);
      let s: GameState = {
        ...state, trumpSuit: suit, trumpRevealed: false, hands,
        phase: "playing", turn: state.caller!, leadSuit: null, trick: [], tricksPlayed: 0,
      };
      return addLog(s, state.caller === 0
        ? `You chose ${SUIT_INFO[suit].name} as trump (secret).`
        : `${state.names[state.caller!]} secretly chose trump.`);
    }
    case "ASK_TRUMP": {
      const { playerIdx } = action;
      let s: GameState = { ...state, trumpRevealed: true };
      s = addLog(s, playerIdx === 0
        ? `You ask for trump — it's ${SUIT_INFO[state.trumpSuit!].name}!`
        : `${state.names[playerIdx]} asks for trump — it's ${SUIT_INFO[state.trumpSuit!].name}!`);
      return banner(s, `Trump: ${SUIT_INFO[state.trumpSuit!].sym} ${SUIT_INFO[state.trumpSuit!].name}`, "trump");
    }
    case "PLAY_CARD": {
      const { playerIdx, card } = action;
      let tipText: string | null = null;
      if (playerIdx === 0 && state.feedbackOn)
        tipText = evaluateMove(card, state, state.caller === 0 || state.trumpRevealed);
      const hands = state.hands.map((h, i) => i === playerIdx ? h.filter((c) => c.id !== card.id) : h);
      const trick = [...state.trick, { player: playerIdx, card }];
      const leadSuit = trick.length === 1 ? card.suit : state.leadSuit;
      const trumpRevealed = state.trumpRevealed || card.suit === state.trumpSuit;
      let s: GameState = { ...state, hands, trick, leadSuit, trumpRevealed };
      s = addLog(s, `${state.names[playerIdx]} plays ${card.rank}${SUIT_INFO[card.suit].sym}.`);
      if (tipText) s = tip(s, tipText);
      if (trumpRevealed && !state.trumpRevealed) {
        s = addLog(s, `Trump revealed: ${SUIT_INFO[state.trumpSuit!].name}!`);
        s = banner(s, `Trump: ${SUIT_INFO[state.trumpSuit!].sym} ${SUIT_INFO[state.trumpSuit!].name}`, "trump");
      }
      if (trick.length === 4) {
        const winner = trickWinner(trick, leadSuit!, state.trumpSuit!);
        const pts = trick.reduce((sum, t) => sum + POINTS[t.card.rank], 0);
        const team = winner % 2;
        const teamPoints = { ...s.teamPoints, [team]: s.teamPoints[team] + pts };
        s = addLog({ ...s, teamPoints, tricksPlayed: s.tricksPlayed + 1, lastTrickWinner: winner },
          `${state.names[winner]} wins the trick (+${pts}). ${teamLabel(state.names)[team]}: ${teamPoints[team]} pts.`);
      } else {
        s.turn = (playerIdx + 1) % 4;
      }
      return s;
    }
    case "CLEAR_TRICK": {
      let s: GameState = { ...state, trick: [], leadSuit: null, turn: state.lastTrickWinner! };
      if (s.tricksPlayed < 8) return s;
      const ct = s.caller! % 2;
      const made = s.teamPoints[ct] >= s.currentBid;
      const wt = made ? ct : 1 - ct;
      const underHalf = !made && s.halfBidPenaltyOn && s.teamPoints[ct] < s.currentBid / 2;
      const pts = underHalf ? 2 : 1;
      const handsWon = { ...s.handsWon, [wt]: s.handsWon[wt] + pts };
      const matchOver = handsWon[wt] >= MATCH_TARGET;
      s = { ...s, phase: "hand-end", handsWon, lastResult: {
        callerTeam: ct, made, bid: s.currentBid, callerPts: s.teamPoints[ct],
        defTeam: 1 - ct, defPts: s.teamPoints[1 - ct], winningTeam: wt,
        tips: s.handTips, underHalf, pointsAwarded: pts, matchOver,
      }};
      s = addLog(s, made
        ? `${teamLabel(state.names)[ct]} made their bid of ${s.currentBid}!`
        : underHalf
        ? `${teamLabel(state.names)[ct]} fell under half! ${teamLabel(state.names)[1 - ct]} win double.`
        : `${teamLabel(state.names)[ct]} fell short. ${teamLabel(state.names)[1 - ct]} win the hand.`);
      if (matchOver) {
        s = addLog(s, `${teamLabel(state.names)[wt]} win the match!`);
        s = banner(s, `${teamLabel(state.names)[wt]} win the match!`, "match");
      }
      return s;
    }
    case "AI_BID": {
      const { playerIdx } = action;
      const decision = aiBidDecision(state.hands[playerIdx], state.currentBid);
      return decision === null || state.currentBid >= 28
        ? reducer(state, { type: "PASS", playerIdx })
        : reducer(state, { type: "BID", playerIdx, amount: decision });
    }
    case "AI_CHOOSE_TRUMP":
      return reducer(state, { type: "CHOOSE_TRUMP", suit: aiChooseTrump(state.hands[state.caller!]) });
    case "AI_PLAY": {
      const { playerIdx } = action;
      const hand = state.hands[playerIdx];
      let working = state;
      if (state.leadSuit && !hand.some((c) => c.suit === state.leadSuit)
        && !state.trumpRevealed && playerIdx !== state.caller) {
        const defending = playerIdx % 2 !== state.caller! % 2;
        if (Math.random() < (defending ? 0.7 : 0.3))
          working = reducer(state, { type: "ASK_TRUMP", playerIdx });
      }
      return reducer(working, { type: "PLAY_CARD", playerIdx, card: aiPlayCard(playerIdx, working) });
    }
    case "CLEAR_BANNER":
      return state.banner?.id === action.id ? { ...state, banner: null } : state;
    case "CLEAR_MOVE_TIP":
      return state.moveTip?.id === action.id ? { ...state, moveTip: null } : state;
    case "TOGGLE_FEEDBACK": return { ...state, feedbackOn: !state.feedbackOn, moveTip: null };
    case "TOGGLE_HALF_BID": return { ...state, halfBidPenaltyOn: !state.halfBidPenaltyOn };
    case "NEW_MATCH": return reducer({ ...state, handsWon: { 0: 0, 1: 0 }, round: 0 }, { type: "DEAL" });
    default: return state;
  }
}

// ── CSS (self-contained, no Tailwind) ──────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,600;0,9..144,700&family=Inter:wght@400;500;600&display=swap');

.g28 *, .g28 *::before, .g28 *::after { box-sizing: border-box; margin: 0; padding: 0; }

.g28 {
  min-height: 100vh;
  background: linear-gradient(165deg, #3e2a1a 0%, #2a1a10 45%, #1a0f08 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 12px 24px;
  font-family: 'Inter', system-ui, sans-serif;
  color: #f3ecd9;
}

.g28-wrap {
  width: 100%;
  max-width: 440px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* ── Header ── */
.g28-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}
.g28-title-block { flex-shrink: 0; }
.g28-title {
  font-family: 'Fraunces', serif;
  font-size: 32px;
  font-weight: 700;
  color: #e9d9a0;
  line-height: 1;
}
.g28-subtitle { font-size: 11px; opacity: 0.55; margin-top: 2px; }
.g28-header-btns {
  display: flex;
  flex-direction: column;
  gap: 5px;
  align-items: flex-end;
}
.g28-hbtn {
  font-family: 'Inter', sans-serif;
  font-size: 11px;
  padding: 5px 11px;
  border-radius: 99px;
  border: 1px solid rgba(201,162,39,0.55);
  background: transparent;
  color: #e9d9a0;
  cursor: pointer;
  white-space: nowrap;
  transition: opacity 0.15s;
}
.g28-hbtn:hover { opacity: 0.7; }
.g28-hbtn.dim { color: rgba(243,236,217,0.4); }

/* ── Rules panel ── */
.g28-rules {
  border-radius: 10px;
  padding: 12px 14px;
  font-size: 11px;
  line-height: 1.65;
  background: rgba(12,53,39,0.88);
  border: 1px solid rgba(201,162,39,0.35);
}
.g28-rules p { margin-bottom: 6px; }
.g28-rules p:last-child { margin-bottom: 0; }

/* ── Score bar ── */
.g28-scorebar {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
  padding: 0 2px;
}
.g28-team {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  width: 120px;
  flex-shrink: 0;
}
.g28-team-name {
  font-size: 11px;
  opacity: 0.8;
  text-align: center;
  line-height: 1.3;
  word-break: break-word;
}
.g28-badges { display: flex; gap: 5px; }
.g28-kept { font-size: 9px; opacity: 0.45; text-align: center; }

.g28-trump-center {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding-top: 2px;
  min-width: 0;
}
.g28-trump-label { font-size: 10px; opacity: 0.6; }
.g28-trump-value { font-size: 13px; font-weight: 600; text-align: center; line-height: 1.3; }

/* ── Six badge ── */
.g28-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
}
.g28-badge-card {
  width: 26px;
  height: 38px;
  border-radius: 4px;
  background: #fbf6e9;
  border: 2px solid currentColor;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  line-height: 1;
  gap: 1px;
}
.g28-badge-six { font-size: 11px; font-weight: 700; }
.g28-badge-sym { font-size: 12px; }
.g28-badge-pips { display: flex; gap: 2px; }
.g28-pip {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  border: 1px solid currentColor;
}
.g28-pip.filled { background: currentColor; }

/* ── Table ── */
.g28-table {
  position: relative;
  border-radius: 16px;
  border: 2px solid rgba(201,162,39,0.5);
  background: radial-gradient(ellipse at center, #15543f 0%, #0d3a2b 65%, #082417 100%);
  box-shadow: inset 0 0 40px rgba(0,0,0,0.55);
  overflow: hidden;
  padding: 12px 10px 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.g28-corner {
  position: absolute;
  font-size: 9px;
  color: rgba(201,162,39,0.4);
  letter-spacing: 3px;
}
.g28-corner.tl { top: 6px; left: 8px; }
.g28-corner.tr { top: 6px; right: 8px; }
.g28-corner.bl { bottom: 6px; left: 8px; }
.g28-corner.br { bottom: 6px; right: 8px; }

/* partner row */
.g28-seat-top {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
}
.g28-pname {
  font-size: 10px;
  opacity: 0.7;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 120px;
}
.g28-cards-h { display: flex; gap: 3px; flex-wrap: wrap; justify-content: center; }

/* middle row */
.g28-table-mid {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
}
.g28-seat-side {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  width: 34px;
  flex-shrink: 0;
}
.g28-cards-v { display: flex; flex-direction: column; gap: 3px; }

/* trick center */
.g28-trick {
  flex: 1;
  min-width: 0;
  display: grid;
  grid-template-areas: '. top .' 'left mid right' '. bot .';
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: 1fr 1fr 1fr;
  gap: 4px;
  aspect-ratio: 1;
}
.g28-tslot {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
}
.g28-tslot-name { font-size: 9px; color: rgba(243,236,217,0.4); }
.g28-tslot-name.played { color: #e9d9a0; }
.g28-mid-diamond {
  grid-area: mid;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: rgba(201,162,39,0.25);
}

/* hand points */
.g28-pts-row {
  display: flex;
  justify-content: center;
  gap: 16px;
  font-size: 10px;
  opacity: 0.75;
  min-height: 14px;
}

/* ── Card ── */
.g28-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 5px;
  border: 1.5px solid #3a2a1a;
  background: #fbf6e9;
  box-shadow: 0 1px 3px rgba(0,0,0,0.25);
  user-select: none;
  flex-shrink: 0;
  transition: transform 0.12s, box-shadow 0.12s;
}
.g28-card.playable {
  cursor: pointer;
  border-color: #c9a227;
  box-shadow: 0 0 0 2px #c9a227, 0 2px 6px rgba(0,0,0,0.3);
}
.g28-card.playable:hover {
  transform: translateY(-6px);
  box-shadow: 0 0 0 2px #c9a227, 0 5px 12px rgba(0,0,0,0.4);
}
.g28-card.faded { opacity: 0.3; }
.g28-trump-dot {
  position: absolute;
  top: 2px; right: 2px;
  width: 5px; height: 5px;
  border-radius: 50%;
  background: #c9a227;
}
.g28-rank { font-weight: 700; line-height: 1; }
.g28-sym { line-height: 1; }

/* ── Card back ── */
.g28-cback {
  border-radius: 4px;
  background: #0f3d2e;
  border: 1px solid #c9a227;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.g28-cback-inner {
  width: 65%; height: 65%;
  border: 1px solid rgba(201,162,39,0.45);
  border-radius: 2px;
}

/* ── Banner overlay ── */
.g28-banner-wrap {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  z-index: 30;
}
.g28-banner {
  padding: 10px 22px;
  border-radius: 10px;
  border: 1px solid #c9a227;
  box-shadow: 0 6px 24px rgba(0,0,0,0.5);
  text-align: center;
}
.g28-banner-text {
  font-family: 'Fraunces', serif;
  font-size: 18px;
  font-weight: 700;
  color: #e9d9a0;
}

/* ── Controls area ── */
.g28-controls { display: flex; flex-direction: column; gap: 10px; }

.g28-panel {
  border-radius: 10px;
  padding: 12px;
  background: rgba(0,0,0,0.35);
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.g28-panel-label { font-size: 12px; opacity: 0.7; }
.g28-btn-row { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }

.g28-btn {
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  font-weight: 500;
  padding: 8px 14px;
  border-radius: 7px;
  cursor: pointer;
  border: none;
  transition: opacity 0.15s, transform 0.1s;
}
.g28-btn:hover { opacity: 0.85; }
.g28-btn:active { transform: scale(0.97); }
.g28-btn:disabled { opacity: 0.35; cursor: default; }
.g28-btn.gold { background: #c9a227; color: #1c1f1d; font-weight: 600; }
.g28-btn.outline { background: transparent; color: #f3ecd9; border: 1px solid rgba(243,236,217,0.45); }
.g28-btn.red { background: #9a2b3a; color: #f3ecd9; }
.g28-btn.full { width: 100%; text-align: center; font-size: 15px; padding: 12px; font-weight: 600; }
.g28-btn.suit-btn {
  width: 54px; height: 54px; font-size: 28px;
  background: #fbf6e9; padding: 0;
  display: flex; align-items: center; justify-content: center;
}
.g28-btn.suit-btn:hover { transform: scale(1.08); }

/* ── Move tip ── */
.g28-tip {
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 12px;
  line-height: 1.5;
  background: rgba(201,162,39,0.14);
  border: 1px solid rgba(201,162,39,0.45);
  color: #e9d9a0;
}

/* ── Hand ── */
.g28-hand-area { display: flex; flex-direction: column; gap: 6px; }
.g28-hand-hdr {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 11px;
  opacity: 0.65;
}
.g28-hand-cards {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  justify-content: center;
}

/* ── Name entry ── */
.g28-name-heading { font-size: 12px; opacity: 0.6; text-align: center; margin-bottom: 4px; }
.g28-name-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 12px;
}
.g28-name-team {
  border-radius: 9px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 9px;
}
.g28-name-field { display: flex; flex-direction: column; gap: 3px; }
.g28-nlabel { font-size: 10px; opacity: 0.55; }
.g28-input {
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  padding: 7px 9px;
  border-radius: 6px;
  border: 1px solid rgba(201,162,39,0.45);
  background: rgba(255,255,255,0.07);
  color: #f3ecd9;
  outline: none;
  width: 100%;
}
.g28-input:focus { border-color: #c9a227; background: rgba(255,255,255,0.1); }
.g28-input::placeholder { color: rgba(243,236,217,0.3); }

/* ── Result panel ── */
.g28-result {
  border-radius: 10px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  background: rgba(0,0,0,0.35);
  text-align: center;
}
.g28-result.matchover {
  background: rgba(201,162,39,0.15);
  border: 1px solid rgba(201,162,39,0.5);
}
.g28-result-big { font-family: 'Fraunces', serif; font-size: 18px; color: #e9d9a0; }
.g28-result-row { font-size: 13px; }
.g28-result-winner { font-size: 14px; font-weight: 600; color: #e9d9a0; }
.g28-result-tips {
  text-align: left;
  font-size: 11px;
  padding: 8px 10px;
  border-radius: 7px;
  background: rgba(0,0,0,0.25);
  line-height: 1.55;
}
.g28-result-tips ul { padding-left: 15px; margin-top: 4px; }
.g28-result-tips li { margin-bottom: 3px; opacity: 0.85; }

/* ── Log ── */
.g28-log {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 10px;
  opacity: 0.45;
  padding: 0 2px;
}

/* ── Animations ── */
@keyframes g28-pop { from { transform: scale(0.6) translateY(8px); opacity:0 } to { transform: scale(1) translateY(0); opacity:1 } }
@keyframes g28-popT { from { transform: translateY(-18px) scale(0.75); opacity:0 } to { transform: translateY(0) scale(1); opacity:1 } }
@keyframes g28-popB { from { transform: translateY(18px) scale(0.75); opacity:0 } to { transform: translateY(0) scale(1); opacity:1 } }
@keyframes g28-popL { from { transform: translateX(-18px) scale(0.75); opacity:0 } to { transform: translateX(0) scale(1); opacity:1 } }
@keyframes g28-popR { from { transform: translateX(18px) scale(0.75); opacity:0 } to { transform: translateX(0) scale(1); opacity:1 } }
.g28-anim { animation: g28-pop .25s ease-out; }
.g28-animT { animation: g28-popT .28s ease-out; }
.g28-animB { animation: g28-popB .28s ease-out; }
.g28-animL { animation: g28-popL .28s ease-out; }
.g28-animR { animation: g28-popR .28s ease-out; }

@keyframes g28-banner-in {
  0%   { opacity:0; transform: translateY(8px) scale(0.85) }
  12%  { opacity:1; transform: translateY(0) scale(1) }
  80%  { opacity:1; transform: translateY(0) scale(1) }
  100% { opacity:0; transform: translateY(-6px) scale(0.95) }
}
.g28-banner-anim { animation: g28-banner-in 1.6s ease-in-out forwards; }

@keyframes g28-tip-in {
  0%   { opacity:0; transform: translateY(5px) }
  8%   { opacity:1; transform: translateY(0) }
  88%  { opacity:1; transform: translateY(0) }
  100% { opacity:0; transform: translateY(-3px) }
}
.g28-tip-anim { animation: g28-tip-in 3.2s ease-in-out forwards; }
`;

// ── Sub-components ─────────────────────────────────────────────────────────────
function CardFace({ card, size = "md", playable = false, faded = false, isTrump = false, animCls = "", onClick }: {
  card: Card; size?: "sm" | "md" | "lg"; playable?: boolean; faded?: boolean;
  isTrump?: boolean; animCls?: string; onClick?: () => void;
}) {
  const info = SUIT_INFO[card.suit];
  const dim = { sm: [38, 54, 14, 17], md: [44, 62, 15, 19], lg: [50, 70, 16, 22] }[size];
  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      className={`g28-card${playable ? " playable" : ""}${faded ? " faded" : ""} ${animCls}`}
      style={{ width: dim[0], height: dim[1], border: "none" }}
    >
      {isTrump && <span className="g28-trump-dot" />}
      <span className="g28-rank" style={{ color: info.color, fontSize: dim[2] }}>{card.rank}</span>
      <span className="g28-sym" style={{ color: info.color, fontSize: dim[3] }}>{info.sym}</span>
    </button>
  );
}

function CBack({ size = "sm" }: { size?: "xs" | "sm" }) {
  const dim = size === "xs" ? [22, 32] : [28, 40];
  return (
    <div className="g28-cback" style={{ width: dim[0], height: dim[1] }}>
      <div className="g28-cback-inner" />
    </div>
  );
}

function SixBadge({ filled, color, sym }: { filled: number; color: string; sym: string }) {
  return (
    <div className="g28-badge" style={{ color }}>
      <div className="g28-badge-card">
        <span className="g28-badge-six">6</span>
        <span className="g28-badge-sym">{sym}</span>
      </div>
      <div className="g28-badge-pips">
        {Array.from({ length: MATCH_TARGET }).map((_, i) => (
          <span key={i} className={`g28-pip${i < filled ? " filled" : ""}`} />
        ))}
      </div>
    </div>
  );
}

function NameEntry({ onStart }: { onStart: (names: string[]) => void }) {
  const [f, setF] = useState({ you: "", partner: "", o1: "", o2: "" });
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setF((p) => ({ ...p, [k]: e.target.value }));
  return (
    <div>
      <p className="g28-name-heading">Name the players — blanks use defaults.</p>
      <div className="g28-name-grid">
        <div className="g28-name-team" style={{ background: "rgba(185,42,74,0.12)", border: "1px solid rgba(185,42,74,0.3)" }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: "#e07a8b" }}>Your team ♥</p>
          <div className="g28-name-field">
            <label className="g28-nlabel">You (bottom)</label>
            <input className="g28-input" value={f.you} onChange={set("you")} placeholder="You" maxLength={14} />
          </div>
          <div className="g28-name-field">
            <label className="g28-nlabel">Partner (top)</label>
            <input className="g28-input" value={f.partner} onChange={set("partner")} placeholder="Partner" maxLength={14} />
          </div>
        </div>
        <div className="g28-name-team" style={{ background: "rgba(28,31,29,0.35)", border: "1px solid rgba(201,162,39,0.2)" }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: "#c9a227" }}>Opponents ♠</p>
          <div className="g28-name-field">
            <label className="g28-nlabel">Left seat</label>
            <input className="g28-input" value={f.o1} onChange={set("o1")} placeholder="Niraj" maxLength={14} />
          </div>
          <div className="g28-name-field">
            <label className="g28-nlabel">Right seat</label>
            <input className="g28-input" value={f.o2} onChange={set("o2")} placeholder="Smita" maxLength={14} />
          </div>
        </div>
      </div>
      <button
        className="g28-btn gold full"
        onClick={() => onStart([
          f.you.trim() || "You", f.o1.trim() || "Niraj",
          f.partner.trim() || "Partner", f.o2.trim() || "Smita",
        ])}
      >
        Deal Cards →
      </button>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function TwentyEight() {
  const [state, dispatch] = useReducer(reducer, init);
  const [showRules, setShowRules] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  const after = (ms: number, fn: () => void) => { const id = setTimeout(fn, ms); timers.current.push(id); };

  useEffect(() => {
    if (state.phase === "bidding" && state.bidTurn !== 0 && !state.passed[state.bidTurn])
      after(850, () => dispatch({ type: "AI_BID", playerIdx: state.bidTurn }));
  }, [state.phase, state.bidTurn]);

  useEffect(() => {
    if (state.phase === "choose-trump" && state.caller !== 0)
      after(900, () => dispatch({ type: "AI_CHOOSE_TRUMP" }));
  }, [state.phase, state.caller]);

  useEffect(() => {
    if (state.phase === "playing" && state.trick.length < 4 && state.turn !== 0)
      after(750, () => dispatch({ type: "AI_PLAY", playerIdx: state.turn }));
  }, [state.phase, state.turn, state.trick.length]);

  useEffect(() => {
    if (state.phase === "playing" && state.trick.length === 4)
      after(1400, () => dispatch({ type: "CLEAR_TRICK" }));
  }, [state.trick.length, state.phase]);

  useEffect(() => {
    if (state.banner) { const id = state.banner.id; after(1600, () => dispatch({ type: "CLEAR_BANNER", id })); }
  }, [state.banner]);

  useEffect(() => {
    if (state.moveTip) { const id = state.moveTip.id; after(3200, () => dispatch({ type: "CLEAR_MOVE_TIP", id })); }
  }, [state.moveTip]);

  const hand = sortHand(state.hands[0] || []);
  const mustFollow = !!(state.leadSuit && hand.some((c) => c.suit === state.leadSuit));
  const isLegal = (c: Card) => !mustFollow || c.suit === state.leadSuit;
  const userTurn = state.phase === "playing" && state.turn === 0 && state.trick.length < 4;
  const trumpKnown = state.caller === 0 || state.trumpRevealed;
  const voidInLead = !!(state.leadSuit && !hand.some((c) => c.suit === state.leadSuit));
  const callerTeam = state.caller === null ? null : state.caller % 2;
  const tl = teamLabel(state.names);
  const seat = (idx: number) => state.trick.find((t) => t.player === idx);

  const dirAnim = (dir: "top" | "bot" | "left" | "right") =>
    ({ top: "g28-animT", bot: "g28-animB", left: "g28-animL", right: "g28-animR" }[dir]);

  const trickSlot = (idx: number, area: string, dir: "top" | "bot" | "left" | "right") => {
    const entry = seat(idx);
    return (
      <div key={idx} className="g28-tslot" style={{ gridArea: area }}>
        <div style={{ width: 40, height: 56, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {entry && (
            <CardFace card={entry.card} size="sm" animCls={dirAnim(dir)} />
          )}
        </div>
        <span className={`g28-tslot-name${entry ? " played" : ""}`}>
          {state.names[idx].split(" ")[0]}
        </span>
      </div>
    );
  };

  const ts = state.trumpSuit;
  const trumpColor = ts ? (SUIT_INFO[ts].color === "#9a2b3a" ? "#e07a8b" : "#e9d9a0") : "#e9d9a0";

  return (
    <div className="g28">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="g28-wrap">

        {/* Header */}
        <div className="g28-header">
          <div className="g28-title-block">
            <h1 className="g28-title">28</h1>
            <p className="g28-subtitle">a practice table for two pairs</p>
          </div>
          <div className="g28-header-btns">
            <button className="g28-hbtn" onClick={() => setShowRules((v) => !v)}>
              {showRules ? "Hide rules" : "Rules & tips"}
            </button>
            <button className={`g28-hbtn${state.feedbackOn ? "" : " dim"}`} onClick={() => dispatch({ type: "TOGGLE_FEEDBACK" })}>
              Tips: {state.feedbackOn ? "On" : "Off"}
            </button>
            <button className={`g28-hbtn${state.halfBidPenaltyOn ? "" : " dim"}`} onClick={() => dispatch({ type: "TOGGLE_HALF_BID" })}>
              Under-half: {state.halfBidPenaltyOn ? "On" : "Off"}
            </button>
          </div>
        </div>

        {/* Rules */}
        {showRules && (
          <div className="g28-rules">
            <p><strong>Goal:</strong> two partnerships fight over 28 points per hand. J=3, 9=2, A=1, 10=1 — the rest score zero.</p>
            <p><strong>Rank</strong> (high→low): J 9 A 10 K Q 8 7. Not poker order — memorise it.</p>
            <p><strong>Bidding:</strong> you see 4 cards and bid how many points your side will win. Highest bidder secretly names trump, then all 4 remaining cards are dealt out.</p>
            <p><strong>Hidden trump:</strong> only the caller knows trump. If you can't follow the led suit, tap "Ask for trump" to force the reveal — or play blind to keep opponents guessing. Playing a trump card also reveals it.</p>
            <p><strong>Strategy:</strong> bid high only with multiple J/9 cards or a long suit. As caller, lead strong side suits and hold trump back. As defender, ask for trump early if you're void and need to find your partner.</p>
            <p><strong>Scoring:</strong> caller's side wins the hand if they reach their bid; defenders win otherwise. If defenders hold caller below half their bid, they score <em>double</em> (under-half rule). First team to {MATCH_TARGET} hand-points wins the match.</p>
          </div>
        )}

        {/* Score bar */}
        <div className="g28-scorebar">
          <div className="g28-team">
            <span className="g28-team-name">{state.names[0]} & {state.names[2]}</span>
            <div className="g28-badges">
              <SixBadge filled={Math.min(MATCH_TARGET, state.handsWon[0])} color="#b3273a" sym="♥" />
              <SixBadge filled={Math.min(MATCH_TARGET, state.handsWon[1])} color="#2a2a2a" sym="♠" />
            </div>
            <span className="g28-kept">{state.names[2]} holds</span>
          </div>

          <div className="g28-trump-center">
            <span className="g28-trump-label">Trump</span>
            {trumpKnown && ts ? (
              <span className="g28-trump-value" style={{ color: trumpColor }}>
                {SUIT_INFO[ts].sym} {SUIT_INFO[ts].name}
              </span>
            ) : (
              <span className="g28-trump-value" style={{ opacity: 0.5 }}>🔒 sealed</span>
            )}
          </div>

          <div className="g28-team" style={{ alignItems: "flex-end" }}>
            <span className="g28-team-name" style={{ textAlign: "right" }}>{state.names[1]} & {state.names[3]}</span>
            <div className="g28-badges">
              <SixBadge filled={Math.min(MATCH_TARGET, state.handsWon[1])} color="#b3273a" sym="♦" />
              <SixBadge filled={Math.min(MATCH_TARGET, state.handsWon[0])} color="#2a2a2a" sym="♣" />
            </div>
            <span className="g28-kept">{state.names[1]} holds</span>
          </div>
        </div>

        {/* Table */}
        <div className="g28-table">
          <span className="g28-corner tl">◆ ◆</span>
          <span className="g28-corner tr">◆ ◆</span>
          <span className="g28-corner bl">◆ ◆</span>
          <span className="g28-corner br">◆ ◆</span>

          {/* Banner */}
          {state.banner && (
            <div key={state.banner.id} className="g28-banner-wrap">
              <div
                className="g28-banner g28-banner-anim"
                style={{
                  background: state.banner.kind === "trump"
                    ? "rgba(154,43,58,0.93)"
                    : state.banner.kind === "match"
                    ? "rgba(201,162,39,0.96)"
                    : "rgba(12,53,39,0.93)",
                }}
              >
                <div
                  className="g28-banner-text"
                  style={{ color: state.banner.kind === "match" ? "#1c1f1d" : "#e9d9a0" }}
                >
                  {state.banner.text}
                </div>
              </div>
            </div>
          )}

          {/* Partner (top) */}
          <div className="g28-seat-top">
            <span className="g28-pname">
              {state.names[2]} (partner){state.phase === "playing" && state.turn === 2 ? " ⏳" : ""}
            </span>
            <div className="g28-cards-h">
              {state.hands[2].map((_, i) => <CBack key={i} size="xs" />)}
            </div>
          </div>

          {/* Middle row */}
          <div className="g28-table-mid">
            {/* Left opp */}
            <div className="g28-seat-side">
              <span className="g28-pname" style={{ maxWidth: 36 }}>
                {state.names[1].split(" ")[0]}{state.phase === "playing" && state.turn === 1 ? "⏳" : ""}
              </span>
              <div className="g28-cards-v">
                {state.hands[1].map((_, i) => <CBack key={i} size="xs" />)}
              </div>
            </div>

            {/* Trick center */}
            <div className="g28-trick">
              {trickSlot(2, "top", "top")}
              {trickSlot(1, "left", "left")}
              <div className="g28-mid-diamond">◇</div>
              {trickSlot(3, "right", "right")}
              {trickSlot(0, "bot", "bot")}
            </div>

            {/* Right opp */}
            <div className="g28-seat-side">
              <span className="g28-pname" style={{ maxWidth: 36 }}>
                {state.names[3].split(" ")[0]}{state.phase === "playing" && state.turn === 3 ? "⏳" : ""}
              </span>
              <div className="g28-cards-v">
                {state.hands[3].map((_, i) => <CBack key={i} size="xs" />)}
              </div>
            </div>
          </div>

          {/* Points row */}
          <div className="g28-pts-row">
            {state.phase === "playing" && callerTeam !== null && (
              <>
                <span>
                  {tl[0]}: {state.teamPoints[0]}/{callerTeam === 0 ? state.currentBid : 29 - state.currentBid}
                  {callerTeam === 0 ? " (bid)" : " (need)"}
                </span>
                <span>
                  {tl[1]}: {state.teamPoints[1]}/{callerTeam === 1 ? state.currentBid : 29 - state.currentBid}
                  {callerTeam === 1 ? " (bid)" : " (need)"}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="g28-controls">
          {/* Move tip */}
          {state.moveTip && (
            <div key={state.moveTip.id} className="g28-tip g28-tip-anim">
              💡 {state.moveTip.text}
            </div>
          )}

          {/* Start: name entry */}
          {state.phase === "start" && (
            <div className="g28-panel">
              <NameEntry onStart={(names) => dispatch({ type: "START", names })} />
            </div>
          )}

          {/* Bidding */}
          {state.phase === "bidding" && state.bidTurn === 0 && !state.passed[0] && (
            <div className="g28-panel">
              <p className="g28-panel-label">
                Your bid. Current: <strong>{state.currentBid === 13 ? "none" : state.currentBid}</strong>
              </p>
              <div className="g28-btn-row">
                {[1, 2, 4].map((step) => {
                  const amt = Math.min(28, state.currentBid + step);
                  return (
                    <button
                      key={step}
                      className="g28-btn gold"
                      disabled={amt <= state.currentBid}
                      onClick={() => dispatch({ type: "BID", playerIdx: 0, amount: amt })}
                    >
                      Bid {amt}
                    </button>
                  );
                })}
                <button className="g28-btn outline" onClick={() => dispatch({ type: "PASS", playerIdx: 0 })}>
                  Pass
                </button>
              </div>
            </div>
          )}

          {/* Choose trump */}
          {state.phase === "choose-trump" && state.caller === 0 && (
            <div className="g28-panel">
              <p className="g28-panel-label">You won the bid at {state.currentBid}. Pick secret trump:</p>
              <div className="g28-btn-row" style={{ justifyContent: "center" }}>
                {SUITS.map((s) => (
                  <button
                    key={s}
                    className="g28-btn suit-btn"
                    style={{ color: SUIT_INFO[s].color }}
                    onClick={() => dispatch({ type: "CHOOSE_TRUMP", suit: s })}
                  >
                    {SUIT_INFO[s].sym}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Hand end */}
          {state.phase === "hand-end" && state.lastResult && (() => {
            const r = state.lastResult!;
            return (
              <div className={`g28-result${r.matchOver ? " matchover" : ""}`}>
                {r.matchOver && <p className="g28-result-big">🏆 {tl[r.winningTeam]} win the match!</p>}
                <p className="g28-result-row">{tl[r.callerTeam]} bid {r.bid}, scored {r.callerPts}.</p>
                <p className="g28-result-winner">
                  {tl[r.winningTeam]} win the hand{r.pointsAwarded > 1 ? " (double — under half)" : ""}!{" "}
                  <span style={{ fontWeight: 400, opacity: 0.75 }}>+{r.pointsAwarded} pt{r.pointsAwarded > 1 ? "s" : ""}</span>
                </p>
                {state.feedbackOn && (
                  <div className="g28-result-tips">
                    <strong>Your play this hand:</strong>
                    {r.tips.length > 0 ? (
                      <ul>{r.tips.slice(0, 5).map((t, i) => <li key={i}>{t}</li>)}</ul>
                    ) : (
                      <p style={{ marginTop: 4, opacity: 0.75 }}>No notable alternate plays — clean hand!</p>
                    )}
                  </div>
                )}
                <button
                  className="g28-btn gold full"
                  style={{ marginTop: 4 }}
                  onClick={() => dispatch({ type: r.matchOver ? "NEW_MATCH" : "DEAL" })}
                >
                  {r.matchOver ? "New Match" : "Deal Next Hand"}
                </button>
              </div>
            );
          })()}

          {/* Your hand */}
          {(state.phase === "playing" || state.phase === "bidding" || state.phase === "choose-trump") && hand.length > 0 && (
            <div className="g28-hand-area">
              <div className="g28-hand-hdr">
                <span>Your hand{userTurn ? " — tap a card to play" : ""}</span>
                {userTurn && voidInLead && !trumpKnown && (
                  <button className="g28-btn red" style={{ fontSize: 11, padding: "5px 10px" }}
                    onClick={() => dispatch({ type: "ASK_TRUMP", playerIdx: 0 })}>
                    Ask for trump
                  </button>
                )}
              </div>
              <div className="g28-hand-cards">
                {hand.map((c) => (
                  <CardFace
                    key={c.id}
                    card={c}
                    size="lg"
                    playable={userTurn && isLegal(c)}
                    faded={userTurn && !isLegal(c)}
                    isTrump={trumpKnown && c.suit === state.trumpSuit}
                    animCls={userTurn ? "" : ""}
                    onClick={userTurn && isLegal(c) ? () => dispatch({ type: "PLAY_CARD", playerIdx: 0, card: c }) : undefined}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Log */}
        {state.log.length > 0 && state.phase !== "start" && (
          <div className="g28-log">
            {state.log.slice(0, 4).map((l, i) => <span key={i}>{l}</span>)}
          </div>
        )}

      </div>
    </div>
  );
}
