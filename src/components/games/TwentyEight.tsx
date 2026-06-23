import React, { useReducer, useEffect, useRef, useState } from "react";

// ── Name pools ─────────────────────────────────────────────────────────────────
const PARTNER_POOL = ["Prerna", "Kavya", "Nishi", "Rohan", "Diya", "Amit"];
const OPP_POOL = ["Niraj", "Smita", "Vikram", "Rahul", "Arjun", "Priya", "Karan", "Meena"];
function pickN<T>(arr: T[], n: number): T[] {
  return [...arr].sort(() => Math.random() - 0.5).slice(0, n);
}

// ── Card constants ─────────────────────────────────────────────────────────────
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

// ── Types ──────────────────────────────────────────────────────────────────────
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
  | { type: "NEW_MATCH" }
  | { type: "RESET" };

// ── Persistence ────────────────────────────────────────────────────────────────
const SAVE_KEY = "g28_v2";
function saveState(s: GameState) {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify({ ...s, banner: null, moveTip: null })); } catch {}
}
function loadState(fallback: GameState): GameState {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return fallback;
    const p = JSON.parse(raw);
    if (typeof p.phase !== "string" || !Array.isArray(p.hands) || !Array.isArray(p.names)) return fallback;
    return { ...fallback, ...p, banner: null, moveTip: null };
  } catch { return fallback; }
}

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
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
function cardBeats(a: Card, b: Card, ls: Suit, ts: Suit) {
  const at = a.suit === ts, bt = b.suit === ts;
  if (at && !bt) return true; if (!at && bt) return false;
  if (at && bt) return rankIdx(a.rank) < rankIdx(b.rank);
  if (a.suit === ls && b.suit === ls) return rankIdx(a.rank) < rankIdx(b.rank);
  if (a.suit === ls && b.suit !== ls) return true; return false;
}
function trickWinner(trick: TrickEntry[], ls: Suit, ts: Suit) {
  let best = trick[0];
  for (const t of trick.slice(1)) if (cardBeats(t.card, best.card, ls, ts)) best = t;
  return best.player;
}
function nextActive(from: number, passed: boolean[]) {
  let p = (from + 1) % 4, g = 0;
  while (passed[p] && g < 8) { p = (p + 1) % 4; g++; }
  return p;
}
function evaluateMove(card: Card, st: GameState, trumpKnown: boolean) {
  const hand = st.hands[0], ls = st.leadSuit!, ts = st.trumpSuit!;
  let legal = ls ? hand.filter((c) => c.suit === ls) : hand;
  if (!legal.length) legal = hand;
  if (legal.length <= 1) return null;
  if (st.trick.length === 0) return card.suit === ts ? "Leading trump reveals it early — gives up the secret." : null;
  const best = st.trick.reduce((b, t) => (cardBeats(t.card, b.card, ls, ts) ? t : b), st.trick[0]);
  const wins = (c: Card) => cardBeats(c, best.card, ls, ts);
  const playedWins = wins(card), winners = legal.filter(wins);
  const isVoid = ls && !hand.some((c) => c.suit === ls);
  if (isVoid) {
    const cheaper = legal.filter((c) => POINTS[c.rank] < POINTS[card.rank]);
    if (POINTS[card.rank] > 0 && cheaper.length > 0)
      return `Discarding ${POINTS[card.rank]} pt${POINTS[card.rank] > 1 ? "s" : ""} — a zero-point card costs nothing.`;
    if (trumpKnown && !playedWins && card.suit !== ts) {
      const tw = winners.find((c) => c.suit === ts);
      if (tw) return `${tw.rank}${SUIT_INFO[tw.suit].sym} would have trumped in and taken this trick.`;
    }
    return null;
  }
  if (playedWins) {
    const lesser = winners.find((c) => c.id !== card.id && cardBeats(card, c, ls, ts));
    if (lesser) return `${lesser.rank}${SUIT_INFO[lesser.suit].sym} wins too — saves ${card.rank}${SUIT_INFO[card.suit].sym} for later.`;
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
function aiBidDecision(hand: Card[], bid: number) {
  const w = Math.min(28, 13 + Math.round(handStrength(hand) * 1.15) + (Math.random() < 0.3 ? 1 : 0));
  if (bid + 1 <= w && bid < 28) return Math.min(w, bid + (Math.random() < 0.25 ? 2 : 1), 28);
  return null;
}
function aiChooseTrump(hand: Card[]): Suit {
  const sc: Record<string, number> = {};
  SUITS.forEach((s) => (sc[s] = 0));
  hand.forEach((c) => (sc[c.suit] += POINTS[c.rank] * 1.5 + 1));
  return SUITS.reduce((b, s) => (sc[s] > sc[b] ? s : b), SUITS[0]) as Suit;
}
function aiPlayCard(pi: number, state: GameState): Card {
  const hand = state.hands[pi], { leadSuit: ls, trick, trumpSuit: ts } = state;
  const knowsTrump = state.caller === pi || state.trumpRevealed;
  let legal = ls ? hand.filter((c) => c.suit === ls) : hand;
  if (!legal.length) legal = hand;
  if (!trick.length) {
    const pool = knowsTrump ? (hand.filter((c) => c.suit !== ts).length ? hand.filter((c) => c.suit !== ts) : hand) : hand;
    pool.sort((a, b) => POINTS[b.rank] - POINTS[a.rank]);
    return pool[Math.random() < 0.5 ? 0 : pool.length - 1];
  }
  const bestE = trick.reduce((b, t) => cardBeats(t.card, b.card, ls!, ts!) ? t : b, trick[0]);
  const partnerW = bestE.player % 2 === pi % 2;
  const winners = legal.filter((c) => cardBeats(c, bestE.card, ls!, ts!));
  if (!partnerW && winners.length > 0)
    return [...winners].sort((a, b) => {
      const w = (c: Card) => c.suit === ts ? 100 - rankIdx(c.rank) : 50 - rankIdx(c.rank);
      return w(a) - w(b);
    })[0];
  return [...legal].sort((a, b) => POINTS[a.rank] - POINTS[b.rank])[0];
}

// ── Reducer ────────────────────────────────────────────────────────────────────
const tl = (names: string[]) => ({ 0: `${names[0]} & ${names[2]}`, 1: `${names[1]} & ${names[3]}` } as Record<number, string>);

const INIT: GameState = {
  phase: "start", dealer: 3, hands: [[], [], [], []], restDeck: [],
  bidTurn: 0, currentBid: 13, highBidder: null, passed: [false, false, false, false],
  caller: null, trumpSuit: null, trumpRevealed: false, trick: [], leadSuit: null, turn: 0,
  teamPoints: { 0: 0, 1: 0 }, handsWon: { 0: 0, 1: 0 }, tricksPlayed: 0,
  log: [], lastResult: null, round: 0, bannerSeq: 0, banner: null,
  names: ["You", "Niraj", "Partner", "Smita"], feedbackOn: true, halfBidPenaltyOn: true,
  moveTipSeq: 0, moveTip: null, handTips: [],
};

function addLog(s: GameState, msg: string): GameState { return { ...s, log: [msg, ...s.log].slice(0, 6) }; }
function mkBanner(s: GameState, text: string, kind: string): GameState {
  const id = (s.bannerSeq || 0) + 1; return { ...s, banner: { id, text, kind }, bannerSeq: id };
}
function mkTip(s: GameState, text: string): GameState {
  const id = (s.moveTipSeq || 0) + 1;
  return { ...s, moveTip: { id, text }, moveTipSeq: id, handTips: [...s.handTips, text] };
}

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case "RESET": return { ...INIT, names: state.names, feedbackOn: state.feedbackOn, halfBidPenaltyOn: state.halfBidPenaltyOn };
    case "START": return reducer({ ...state, names: action.names }, { type: "DEAL" });
    case "DEAL": {
      const deck = shuffle(makeDeck()), hands: Card[][] = [[], [], [], []];
      for (let i = 0; i < 16; i++) hands[i % 4].push(deck[i]);
      const dealer = state.phase === "start" ? state.dealer : (state.dealer + 1) % 4;
      const bidTurn = (dealer + 1) % 4, round = state.round + 1;
      let s: GameState = {
        ...state, phase: "bidding", dealer, hands, restDeck: deck.slice(16), bidTurn,
        currentBid: 13, highBidder: null, passed: [false, false, false, false], caller: null,
        trumpSuit: null, trumpRevealed: false, trick: [], leadSuit: null, tricksPlayed: 0,
        teamPoints: { 0: 0, 1: 0 }, lastResult: null, round, handTips: [],
      };
      s = addLog(s, `Round ${round} — ${state.names[bidTurn]} bids first.`);
      s = mkBanner(s, `Round ${round}`, "round");
      return s;
    }
    case "BID": {
      const { playerIdx, amount } = action;
      let s: GameState = { ...state, currentBid: amount, highBidder: playerIdx };
      s = addLog(s, `${state.names[playerIdx]} bids ${amount}.`);
      if (s.passed.filter((p) => !p).length === 1) {
        s.caller = playerIdx; s.phase = "choose-trump";
        return addLog(s, `${state.names[playerIdx]} wins at ${amount}, picks trump.`);
      }
      s.bidTurn = nextActive(playerIdx, s.passed); return s;
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
      s.bidTurn = nextActive(playerIdx, passed); return s;
    }
    case "CHOOSE_TRUMP": {
      const { suit } = action;
      const hands = state.hands.map((h, i) => [...h, ...state.restDeck.filter((_, idx) => idx % 4 === i)]);
      let s: GameState = {
        ...state, trumpSuit: suit, trumpRevealed: false, hands,
        phase: "playing", turn: state.caller!, leadSuit: null, trick: [], tricksPlayed: 0,
      };
      return addLog(s, state.caller === 0 ? `You chose ${SUIT_INFO[suit].name} as trump (secret).` : `${state.names[state.caller!]} secretly chose trump.`);
    }
    case "ASK_TRUMP": {
      const { playerIdx } = action;
      let s: GameState = { ...state, trumpRevealed: true };
      s = addLog(s, playerIdx === 0 ? `You ask for trump — ${SUIT_INFO[state.trumpSuit!].name}!` : `${state.names[playerIdx]} asks — trump is ${SUIT_INFO[state.trumpSuit!].name}!`);
      return mkBanner(s, `Trump: ${SUIT_INFO[state.trumpSuit!].sym} ${SUIT_INFO[state.trumpSuit!].name}`, "trump");
    }
    case "PLAY_CARD": {
      const { playerIdx, card } = action;
      let tipText: string | null = null;
      if (playerIdx === 0 && state.feedbackOn) tipText = evaluateMove(card, state, state.caller === 0 || state.trumpRevealed);
      const hands = state.hands.map((h, i) => i === playerIdx ? h.filter((c) => c.id !== card.id) : h);
      const trick = [...state.trick, { player: playerIdx, card }];
      const leadSuit = trick.length === 1 ? card.suit : state.leadSuit;
      const trumpRevealed = state.trumpRevealed || card.suit === state.trumpSuit;
      let s: GameState = { ...state, hands, trick, leadSuit, trumpRevealed };
      s = addLog(s, `${state.names[playerIdx]} plays ${card.rank}${SUIT_INFO[card.suit].sym}.`);
      if (tipText) s = mkTip(s, tipText);
      if (trumpRevealed && !state.trumpRevealed) {
        s = addLog(s, `Trump revealed: ${SUIT_INFO[state.trumpSuit!].name}!`);
        s = mkBanner(s, `Trump: ${SUIT_INFO[state.trumpSuit!].sym} ${SUIT_INFO[state.trumpSuit!].name}`, "trump");
      }
      if (trick.length === 4) {
        const winner = trickWinner(trick, leadSuit!, state.trumpSuit!);
        const pts = trick.reduce((sum, t) => sum + POINTS[t.card.rank], 0);
        const team = winner % 2;
        const teamPoints = { ...s.teamPoints, [team]: s.teamPoints[team] + pts };
        s = addLog({ ...s, teamPoints, tricksPlayed: s.tricksPlayed + 1, lastTrickWinner: winner },
          `${state.names[winner]} wins +${pts}. ${tl(state.names)[team]}: ${teamPoints[team]} pts.`);
      } else { s.turn = (playerIdx + 1) % 4; }
      return s;
    }
    case "CLEAR_TRICK": {
      let s: GameState = { ...state, trick: [], leadSuit: null, turn: state.lastTrickWinner! };
      if (s.tricksPlayed < 8) return s;
      const ct = s.caller! % 2, made = s.teamPoints[ct] >= s.currentBid;
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
      s = addLog(s, made ? `${tl(state.names)[ct]} made ${s.currentBid}!` : underHalf ? `Under half! ${tl(state.names)[1 - ct]} win double.` : `${tl(state.names)[1 - ct]} win the hand.`);
      if (matchOver) { s = addLog(s, `${tl(state.names)[wt]} win the match!`); s = mkBanner(s, `${tl(state.names)[wt]} win!`, "match"); }
      return s;
    }
    case "AI_BID": {
      const { playerIdx } = action;
      const d = aiBidDecision(state.hands[playerIdx], state.currentBid);
      return d === null || state.currentBid >= 28 ? reducer(state, { type: "PASS", playerIdx }) : reducer(state, { type: "BID", playerIdx, amount: d });
    }
    case "AI_CHOOSE_TRUMP": return reducer(state, { type: "CHOOSE_TRUMP", suit: aiChooseTrump(state.hands[state.caller!]) });
    case "AI_PLAY": {
      const { playerIdx } = action;
      const hand = state.hands[playerIdx];
      let working = state;
      if (state.leadSuit && !hand.some((c) => c.suit === state.leadSuit) && !state.trumpRevealed && playerIdx !== state.caller) {
        const defending = playerIdx % 2 !== state.caller! % 2;
        if (Math.random() < (defending ? 0.7 : 0.3)) working = reducer(state, { type: "ASK_TRUMP", playerIdx });
      }
      return reducer(working, { type: "PLAY_CARD", playerIdx, card: aiPlayCard(playerIdx, working) });
    }
    case "CLEAR_BANNER": return state.banner?.id === action.id ? { ...state, banner: null } : state;
    case "CLEAR_MOVE_TIP": return state.moveTip?.id === action.id ? { ...state, moveTip: null } : state;
    case "TOGGLE_FEEDBACK": return { ...state, feedbackOn: !state.feedbackOn, moveTip: null };
    case "TOGGLE_HALF_BID": return { ...state, halfBidPenaltyOn: !state.halfBidPenaltyOn };
    case "NEW_MATCH": return reducer({ ...state, handsWon: { 0: 0, 1: 0 }, round: 0 }, { type: "DEAL" });
    default: return state;
  }
}

// ── CSS ────────────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@600;700&family=Inter:wght@400;500;600&display=swap');
.g28*,.g28*::before,.g28*::after{box-sizing:border-box;margin:0;padding:0}

/* Root — full-screen green felt, no inner table */
.g28{
  height:100svh; height:100dvh;
  background:radial-gradient(ellipse at 50% 35%,#1d6b47 0%,#0f4a32 45%,#062318 100%);
  display:flex; flex-direction:column;
  font-family:'Inter',system-ui,sans-serif; color:#f3ecd9; overflow:hidden;
  position:relative;
}

/* ── Top bar ── */
.g28-topbar{
  display:flex; align-items:center; gap:6px;
  padding:6px 10px 5px; flex-shrink:0;
  background:rgba(0,0,0,0.32); border-bottom:1px solid rgba(201,162,39,0.18);
}
.g28-team-score{ display:flex; flex-direction:column; gap:3px; flex:1; min-width:0; }
.g28-team-score.right{ align-items:flex-end; }
.g28-topname{
  font-size:10px; opacity:0.72; white-space:nowrap;
  overflow:hidden; text-overflow:ellipsis; max-width:100%;
}
.g28-sdots{ display:flex; gap:3px; }
.g28-sdot{
  width:7px; height:7px; border-radius:50%;
  border:1px solid rgba(201,162,39,0.45); display:inline-block; flex-shrink:0;
}
.g28-sdot.on{ background:#c9a227; border-color:#c9a227; }

.g28-trump-chip{
  display:flex; flex-direction:column; align-items:center; gap:1px;
  flex-shrink:0; padding:0 4px; min-width:44px;
}
.g28-trump-sym{ font-size:20px; line-height:1; }
.g28-trump-lbl{ font-size:8px; opacity:0.45; letter-spacing:0.3px; text-transform:uppercase; }

.g28-topbtns{ display:flex; gap:4px; align-items:center; flex-shrink:0; }
.g28-tbtn{
  font-size:11px; padding:4px 8px; border-radius:6px;
  border:1px solid rgba(201,162,39,0.35); background:transparent;
  color:#e9d9a0; cursor:pointer; font-family:'Inter',sans-serif; line-height:1;
}
.g28-tbtn.dim{ opacity:0.35; }
.g28-tbtn:hover{ background:rgba(201,162,39,0.1); }

/* ── Arena — fills all space between topbar and hand dock ── */
.g28-arena{
  flex:1; min-height:0; display:flex; flex-direction:column;
  padding:6px 10px 4px; gap:0; position:relative; overflow:hidden;
}

/* Partner strip at top of arena */
.g28-partner-strip{
  display:flex; align-items:center; justify-content:center; gap:7px;
  flex-shrink:0; padding:4px 0 6px;
}
.g28-pname{ font-size:11px; opacity:0.8; }
.g28-ptag{ font-size:9px; opacity:0.38; }

/* Center row: left-opp | trick | right-opp */
.g28-center-row{
  flex:1; min-height:0; display:flex; align-items:center; gap:4px;
}

/* Opponent side chips */
.g28-opp-chip{
  width:40px; flex-shrink:0; display:flex; flex-direction:column;
  align-items:center; gap:4px;
}
.g28-oppname{
  font-size:9px; opacity:0.7; text-align:center;
  white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:40px;
}
.g28-oppturn{ font-size:10px; line-height:1; }

/* Trick field — the open felt in the center */
.g28-trick-field{
  flex:1; min-width:0; min-height:0; position:relative;
  display:flex; align-items:center; justify-content:center;
}

/* Subtle center marker */
.g28-felt-mark{
  position:absolute; left:50%; top:50%; transform:translate(-50%,-50%);
  width:48px; height:48px; border-radius:50%;
  border:1px solid rgba(255,255,255,0.05);
  pointer-events:none;
}

/* Trick card slots — absolute diamond */
.g28-tslot{
  position:absolute; display:flex; flex-direction:column; align-items:center; gap:3px;
}
.g28-tslot.top{ top:6px; left:50%; transform:translateX(-50%); }
.g28-tslot.bot{ bottom:6px; left:50%; transform:translateX(-50%); }
.g28-tslot.lft{ left:6px; top:50%; transform:translateY(-50%); }
.g28-tslot.rgt{ right:6px; top:50%; transform:translateY(-50%); }
.g28-tsname{ font-size:8px; color:rgba(243,236,217,0.3); line-height:1; }
.g28-tsname.played{ color:rgba(243,236,217,0.7); }

/* Points overlay — very subtle, center of felt */
.g28-pts-overlay{
  position:absolute; left:50%; top:50%; transform:translate(-50%,-50%);
  font-size:8px; opacity:0.28; text-align:center; line-height:1.6;
  pointer-events:none; white-space:nowrap;
}

/* Action zone — between trick area and hand dock */
.g28-action{
  flex-shrink:0; display:flex; flex-direction:column; gap:5px; padding-top:4px;
}

/* Panel (bid, trump picker) */
.g28-panel{
  border-radius:10px; padding:9px 11px;
  background:rgba(0,0,0,0.42); border:1px solid rgba(201,162,39,0.18);
  display:flex; flex-direction:column; gap:7px;
}
.g28-panel-lbl{ font-size:11px; opacity:0.58; }
.g28-btn-row{ display:flex; gap:6px; flex-wrap:wrap; align-items:center; }
.g28-suit-row{ display:flex; gap:10px; justify-content:center; }

/* Buttons */
.g28-btn{
  font-family:'Inter',sans-serif; font-size:13px; font-weight:500;
  padding:8px 14px; border-radius:8px; border:none; cursor:pointer;
  transition:opacity 0.12s,transform 0.1s; line-height:1;
}
.g28-btn:hover{ opacity:0.82; }
.g28-btn:active{ transform:scale(0.95); }
.g28-btn:disabled{ opacity:0.28; cursor:default; }
.g28-btn.gold{ background:#c9a227; color:#1c1209; font-weight:600; }
.g28-btn.ghost{ background:transparent; color:#f3ecd9; border:1px solid rgba(243,236,217,0.32); }
.g28-btn.red{ background:#9a2b3a; color:#f3ecd9; }
.g28-btn.full{ width:100%; text-align:center; padding:11px; font-size:14px; font-weight:600; }
.g28-btn.sm{ font-size:11px; padding:5px 10px; }

.g28-suit-btn{
  width:54px; height:54px; border-radius:10px; border:none; background:#fbf6e9;
  font-size:30px; cursor:pointer; display:flex; align-items:center; justify-content:center;
  transition:transform 0.12s; box-shadow:0 3px 10px rgba(0,0,0,0.35);
}
.g28-suit-btn:hover{ transform:scale(1.1) translateY(-2px); }
.g28-suit-btn:active{ transform:scale(0.96); }

/* Move tip */
.g28-tip{
  padding:7px 10px; border-radius:8px; font-size:11px; line-height:1.5;
  background:rgba(201,162,39,0.12); border:1px solid rgba(201,162,39,0.32); color:#e9d9a0;
}

/* Result panel */
.g28-result{
  border-radius:10px; padding:10px 11px;
  background:rgba(0,0,0,0.4); border:1px solid rgba(201,162,39,0.18);
  display:flex; flex-direction:column; gap:5px;
}
.g28-result.win{ background:rgba(201,162,39,0.1); border-color:rgba(201,162,39,0.45); }
.g28-res-big{ font-family:'Fraunces',serif; font-size:15px; color:#e9d9a0; }
.g28-res-row{ font-size:11px; opacity:0.72; }
.g28-res-winner{ font-size:12px; font-weight:600; color:#e9d9a0; }
.g28-res-tips{ font-size:10px; padding:6px 8px; border-radius:6px; background:rgba(0,0,0,0.22); line-height:1.55; }
.g28-res-tips ul{ padding-left:14px; margin-top:2px; }
.g28-res-tips li{ margin-bottom:2px; opacity:0.85; }

/* Waiting text */
.g28-waiting{ font-size:11px; opacity:0.38; text-align:center; padding:3px 0; }

/* Log */
.g28-log{ font-size:9px; opacity:0.3; line-height:1.55; }

/* ── Hand dock — pinned to bottom ── */
.g28-hand-dock{
  flex-shrink:0; padding:7px 10px 10px;
  background:rgba(0,0,0,0.3); border-top:1px solid rgba(201,162,39,0.15);
}
.g28-hand-hdr{
  display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;
}
.g28-hand-lbl{ font-size:10px; opacity:0.45; }
.g28-hand-row{ display:flex; gap:5px; justify-content:center; flex-wrap:nowrap; }

/* ── Cards ── */
/* Player's hand cards — scale with viewport */
.g28-card{
  position:relative; display:flex; flex-direction:column;
  align-items:center; justify-content:center;
  border-radius:6px; background:#fbf6e9;
  border:1.5px solid #ccc;
  box-shadow:0 2px 5px rgba(0,0,0,0.32); user-select:none; flex-shrink:0;
  transition:transform 0.12s,box-shadow 0.12s;
  width:clamp(36px,10vw,50px); height:clamp(52px,14.5vw,72px);
  cursor:default;
}
.g28-card.play{
  border-color:#c9a227; box-shadow:0 0 0 2px #c9a227,0 2px 5px rgba(0,0,0,0.32); cursor:pointer;
}
.g28-card.play:hover{
  transform:translateY(-7px);
  box-shadow:0 0 0 2px #c9a227,0 8px 16px rgba(0,0,0,0.4);
}
.g28-card.play:active{ transform:translateY(-3px) scale(0.97); }
.g28-card.dim{ opacity:0.22; }
.g28-card.waiting{ opacity:0.5; }
.g28-tdot{ position:absolute; top:3px; right:3px; width:5px; height:5px; border-radius:50%; background:#c9a227; }
.g28-crank{ font-weight:700; line-height:1; font-size:clamp(11px,3.2vw,15px); }
.g28-csym{ line-height:1; font-size:clamp(13px,3.8vw,19px); }

/* Trick-area cards (smaller) */
.g28-tcard{
  border-radius:5px; background:#fbf6e9;
  border:1.5px solid #ccc;
  box-shadow:0 3px 8px rgba(0,0,0,0.4);
  display:flex; flex-direction:column; align-items:center; justify-content:center;
  width:clamp(28px,7.5vw,38px); height:clamp(40px,10.8vw,54px);
  flex-shrink:0;
}
.g28-trank{ font-weight:700; line-height:1; font-size:clamp(10px,2.6vw,13px); }
.g28-tsym{ line-height:1; font-size:clamp(11px,3vw,15px); }

/* Empty trick slot */
.g28-tempty{
  border-radius:5px; border:1px dashed rgba(255,255,255,0.1);
  width:clamp(28px,7.5vw,38px); height:clamp(40px,10.8vw,54px);
}

/* Fan card backs (for opponent hand count) */
.g28-fan-card{
  width:12px; height:18px; border-radius:2px;
  background:linear-gradient(145deg,#0f4a32,#083020);
  border:1px solid rgba(201,162,39,0.55);
  flex-shrink:0;
}

/* ── Start / Resume overlay ── */
.g28-overlay{
  position:absolute; inset:0; display:flex;
  align-items:center; justify-content:center; padding:20px; z-index:10;
}
.g28-overlay-box{
  width:100%; max-width:340px;
  background:rgba(6,28,18,0.96); border:1px solid rgba(201,162,39,0.4);
  border-radius:14px; padding:22px 18px;
  display:flex; flex-direction:column; gap:14px;
  box-shadow:0 16px 48px rgba(0,0,0,0.6);
}
.g28-start-title{ font-family:'Fraunces',serif; font-size:28px; color:#e9d9a0; }
.g28-start-sub{ font-size:12px; opacity:0.58; line-height:1.65; }
.g28-field{ display:flex; flex-direction:column; gap:5px; }
.g28-field-lbl{ font-size:11px; opacity:0.52; }
.g28-input{
  font-family:'Inter',sans-serif; font-size:15px; padding:10px 12px;
  border-radius:8px; border:1px solid rgba(201,162,39,0.45);
  background:rgba(255,255,255,0.07); color:#f3ecd9; outline:none;
}
.g28-input:focus{ border-color:#c9a227; background:rgba(255,255,255,0.1); }
.g28-input::placeholder{ color:rgba(243,236,217,0.25); }
.g28-resume-greet{ font-size:13px; opacity:0.72; line-height:1.5; }

/* ── Rules overlay ── */
.g28-rules-overlay{
  position:absolute; inset:0; z-index:20;
  background:rgba(6,28,18,0.97); padding:16px;
  display:flex; flex-direction:column; gap:10px; overflow-y:auto;
}
.g28-rules-title{ font-family:'Fraunces',serif; font-size:18px; color:#e9d9a0; flex-shrink:0; }
.g28-rules-body{ font-size:12px; line-height:1.7; opacity:0.82; }
.g28-rules-body p{ margin-bottom:6px; }

/* ── Banner ── */
.g28-banner-wrap{
  position:absolute; inset:0; display:flex;
  align-items:center; justify-content:center;
  pointer-events:none; z-index:15;
}
.g28-banner{
  padding:10px 22px; border-radius:10px; border:1px solid #c9a227;
  box-shadow:0 6px 24px rgba(0,0,0,0.5); text-align:center;
}
.g28-banner-txt{ font-family:'Fraunces',serif; font-size:18px; font-weight:700; color:#e9d9a0; }

/* ── Animations ── */
@keyframes g28-popT{from{transform:translateX(-50%) translateY(-12px) scale(0.82);opacity:0}to{transform:translateX(-50%) translateY(0) scale(1);opacity:1}}
@keyframes g28-popB{from{transform:translateX(-50%) translateY(12px) scale(0.82);opacity:0}to{transform:translateX(-50%) translateY(0) scale(1);opacity:1}}
@keyframes g28-popL{from{transform:translateY(-50%) translateX(-12px) scale(0.82);opacity:0}to{transform:translateY(-50%) translateX(0) scale(1);opacity:1}}
@keyframes g28-popR{from{transform:translateY(-50%) translateX(12px) scale(0.82);opacity:0}to{transform:translateY(-50%) translateX(0) scale(1);opacity:1}}
.g28-aT{animation:g28-popT .24s ease-out}
.g28-aB{animation:g28-popB .24s ease-out}
.g28-aL{animation:g28-popL .24s ease-out}
.g28-aR{animation:g28-popR .24s ease-out}

@keyframes g28-bnr{
  0%{opacity:0;transform:translateY(10px) scale(0.84)}
  12%{opacity:1;transform:none}
  80%{opacity:1;transform:none}
  100%{opacity:0;transform:translateY(-6px) scale(0.95)}
}
.g28-bnr-anim{animation:g28-bnr 1.6s ease-in-out forwards}

@keyframes g28-tip{
  0%{opacity:0;transform:translateY(4px)}
  8%{opacity:1;transform:none}
  88%{opacity:1}
  100%{opacity:0;transform:translateY(-3px)}
}
.g28-tip-anim{animation:g28-tip 3.2s ease-in-out forwards}
`;

// ── Sub-components ─────────────────────────────────────────────────────────────

function HandPip({ count }: { count: number }) {
  if (count === 0) return <span style={{ fontSize: 8, opacity: 0.3 }}>done</span>;
  const n = Math.min(count, 5);
  return (
    <div style={{ position: "relative", height: 20, width: 8 + n * 7, flexShrink: 0 }}>
      {Array.from({ length: n }).map((_, i) => (
        <div
          key={i}
          className="g28-fan-card"
          style={{
            position: "absolute", left: i * 7, bottom: 0,
            transform: `rotate(${(i - (n - 1) / 2) * 9}deg)`,
            transformOrigin: "bottom center",
          }}
        />
      ))}
    </div>
  );
}

function TrickCard({ card, dir }: { card: Card; dir: "top" | "bot" | "lft" | "rgt" }) {
  const info = SUIT_INFO[card.suit];
  const animCls = { top: "g28-aT", bot: "g28-aB", lft: "g28-aL", rgt: "g28-aR" }[dir];
  return (
    <div className={`g28-tcard ${animCls}`}>
      <span className="g28-trank" style={{ color: info.color }}>{card.rank}</span>
      <span className="g28-tsym" style={{ color: info.color }}>{info.sym}</span>
    </div>
  );
}

function HandCard({ card, playable, faded, isTrump, onClick }: {
  card: Card; playable?: boolean; faded?: boolean; isTrump?: boolean; onClick?: () => void;
}) {
  const info = SUIT_INFO[card.suit];
  const cls = playable ? "play" : faded ? "dim" : "waiting";
  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      className={`g28-card ${cls}`}
      style={{ border: "none" }}
    >
      {isTrump && <span className="g28-tdot" />}
      <span className="g28-crank" style={{ color: info.color }}>{card.rank}</span>
      <span className="g28-csym" style={{ color: info.color }}>{info.sym}</span>
    </button>
  );
}

function ScoreDots({ filled }: { filled: number }) {
  return (
    <div className="g28-sdots">
      {Array.from({ length: MATCH_TARGET }).map((_, i) => (
        <span key={i} className={`g28-sdot${i < filled ? " on" : ""}`} />
      ))}
    </div>
  );
}

function StartScreen({ savedName, onStart }: { savedName?: string; onStart: (names: string[]) => void }) {
  const [name, setName] = useState(savedName || "");
  function go(n = name) {
    const you = n.trim() || "You";
    const [partner] = pickN(PARTNER_POOL, 1);
    const [o1, o2] = pickN(OPP_POOL, 2);
    onStart([you, o1, partner, o2]);
  }
  return (
    <>
      <div>
        <h2 className="g28-start-title">28</h2>
        <p className="g28-start-sub">South Indian trick-taking for two pairs.<br />J=3, 9=2, A=1, 10=1 · first to {MATCH_TARGET} wins.</p>
      </div>
      <div className="g28-field">
        <label className="g28-field-lbl">Your name</label>
        <input
          className="g28-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && go()}
          placeholder="Enter your name"
          autoFocus
          maxLength={16}
        />
      </div>
      <button className="g28-btn gold full" onClick={() => go()}>Deal Cards →</button>
    </>
  );
}

function ResumeScreen({ name, onResume, onNew }: { name: string; onResume: () => void; onNew: () => void }) {
  return (
    <>
      <p className="g28-resume-greet">Welcome back, <strong>{name}</strong>.<br />Your game is saved.</p>
      <button className="g28-btn gold full" onClick={onResume}>Continue Game →</button>
      <button className="g28-btn ghost full" style={{ fontSize: 12, padding: "8px" }} onClick={onNew}>Start new game</button>
    </>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────────
export default function TwentyEight() {
  const [state, dispatch] = useReducer(reducer, INIT, loadState);
  const [showRules, setShowRules] = useState(false);
  const [resuming, setResuming] = useState(() => {
    const s = loadState(INIT);
    return s.phase !== "start" && s.phase !== undefined;
  });
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  const after = (ms: number, fn: () => void) => {
    const id = setTimeout(fn, ms);
    timers.current.push(id);
  };

  useEffect(() => { if (state.phase !== "start") saveState(state); }, [state]);

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
    if (state.banner) {
      const id = state.banner.id;
      after(1600, () => dispatch({ type: "CLEAR_BANNER", id }));
    }
  }, [state.banner]);
  useEffect(() => {
    if (state.moveTip) {
      const id = state.moveTip.id;
      after(3200, () => dispatch({ type: "CLEAR_MOVE_TIP", id }));
    }
  }, [state.moveTip]);

  const { names, handsWon, teamPoints, trumpSuit: ts, trumpRevealed, caller } = state;
  const hand = sortHand(state.hands[0] || []);
  const mustFollow = !!(state.leadSuit && hand.some((c) => c.suit === state.leadSuit));
  const isLegal = (c: Card) => !mustFollow || c.suit === state.leadSuit;
  const userTurn = state.phase === "playing" && state.turn === 0 && state.trick.length < 4;
  const trumpKnown = caller === 0 || trumpRevealed;
  const voidInLead = !!(state.leadSuit && !hand.some((c) => c.suit === state.leadSuit));
  const callerTeam = caller === null ? null : caller % 2;
  const teams = tl(names);
  const trumpColor = ts ? (SUIT_INFO[ts].color === "#9a2b3a" ? "#e07a8b" : "#b8d4a0") : "#e9d9a0";
  const seat = (idx: number) => state.trick.find((t) => t.player === idx);
  const inGame = state.phase !== "start";
  const showHand = ["playing", "bidding", "choose-trump"].includes(state.phase) && hand.length > 0;

  function resetGame() {
    dispatch({ type: "RESET" });
    setResuming(false);
    localStorage.removeItem(SAVE_KEY);
  }

  // Trick slot direction → player index mapping: top=partner(2), bot=you(0), lft=opp1(1), rgt=opp3(3)
  const DIRS = ["top", "bot", "lft", "rgt"] as const;
  const DIR_PLAYER = [2, 0, 1, 3];

  return (
    <div className="g28">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      {/* ── Top bar ── */}
      {inGame && (
        <div className="g28-topbar">
          <div className="g28-team-score">
            <span className="g28-topname">{names[0]} & {names[2]}</span>
            <ScoreDots filled={Math.min(MATCH_TARGET, handsWon[0])} />
          </div>

          <div className="g28-trump-chip">
            {trumpKnown && ts
              ? <span className="g28-trump-sym" style={{ color: trumpColor }}>{SUIT_INFO[ts].sym}</span>
              : <span className="g28-trump-sym" style={{ opacity: 0.25, fontSize: 16 }}>🔒</span>
            }
            <span className="g28-trump-lbl">{trumpKnown && ts ? SUIT_INFO[ts].name : "trump"}</span>
          </div>

          <div className="g28-team-score right">
            <span className="g28-topname">{names[1]} & {names[3]}</span>
            <ScoreDots filled={Math.min(MATCH_TARGET, handsWon[1])} />
          </div>

          <div className="g28-topbtns">
            <button className="g28-tbtn" onClick={resetGame}>↺</button>
            <button className="g28-tbtn" onClick={() => setShowRules((v) => !v)}>{showRules ? "✕" : "?"}</button>
            <button className={`g28-tbtn${state.feedbackOn ? "" : " dim"}`} onClick={() => dispatch({ type: "TOGGLE_FEEDBACK" })}>💡</button>
          </div>
        </div>
      )}

      {/* ── Arena ── */}
      <div className="g28-arena">

        {/* Rules overlay */}
        {showRules && (
          <div className="g28-rules-overlay">
            <div className="g28-rules-title">Rules of 28</div>
            <div className="g28-rules-body">
              <p><strong>Goal:</strong> Two pairs fight over 28 points per hand. J=3, 9=2, A=1, 10=1. K Q 8 7 score zero.</p>
              <p><strong>Rank</strong> (high→low): J · 9 · A · 10 · K · Q · 8 · 7. Trump suit beats all others.</p>
              <p><strong>Bidding:</strong> Each player gets 4 cards. Bid how many points your team will score. Highest bidder wins and secretly picks the trump suit, then all get 4 more cards.</p>
              <p><strong>Hidden trump:</strong> Only the caller knows trump until revealed. A player void in the led suit may ask for trump to be revealed, or play blind. Playing any trump card also reveals it.</p>
              <p><strong>Under-half penalty:</strong> If the calling team scores less than half their bid, the defending team wins double (2 match points instead of 1).</p>
              <p><strong>Match:</strong> First team to {MATCH_TARGET} match points wins.</p>
            </div>
            <button className="g28-btn ghost" onClick={() => setShowRules(false)} style={{ marginTop: 4 }}>Close</button>
          </div>
        )}

        {/* Start / Resume overlay */}
        {state.phase === "start" && (
          <div className="g28-overlay">
            <div className="g28-overlay-box">
              {resuming
                ? <ResumeScreen name={names[0]} onResume={() => setResuming(false)} onNew={resetGame} />
                : <StartScreen
                    savedName={names[0] !== "You" ? names[0] : ""}
                    onStart={(n) => dispatch({ type: "START", names: n })}
                  />
              }
            </div>
          </div>
        )}

        {/* Partner strip */}
        {inGame && (
          <div className="g28-partner-strip">
            <HandPip count={state.hands[2].length} />
            <span className="g28-pname">
              {names[2]}{state.phase === "playing" && state.turn === 2 ? " ⏳" : ""}
            </span>
            <span className="g28-ptag">partner · ×{state.hands[2].length}</span>
          </div>
        )}

        {/* Center row: left opp | trick | right opp */}
        {inGame && (
          <div className="g28-center-row">
            {/* Left opponent (player 1) */}
            <div className="g28-opp-chip">
              <span className="g28-oppname">{names[1].split(" ")[0]}</span>
              {state.phase === "playing" && state.turn === 1 && <span className="g28-oppturn">⏳</span>}
              <HandPip count={state.hands[1].length} />
              <span style={{ fontSize: 8, opacity: 0.35 }}>×{state.hands[1].length}</span>
            </div>

            {/* Trick field */}
            <div className="g28-trick-field">
              {/* Banner */}
              {state.banner && (
                <div key={state.banner.id} className="g28-banner-wrap">
                  <div
                    className="g28-banner g28-bnr-anim"
                    style={{
                      background: state.banner.kind === "trump" ? "rgba(154,43,58,0.94)"
                        : state.banner.kind === "match" ? "rgba(201,162,39,0.97)"
                        : "rgba(10,44,29,0.94)",
                    }}
                  >
                    <div className="g28-banner-txt" style={{ color: state.banner.kind === "match" ? "#1c1209" : "#e9d9a0" }}>
                      {state.banner.text}
                    </div>
                  </div>
                </div>
              )}

              <div className="g28-felt-mark" />

              {/* Points overlay */}
              {state.phase === "playing" && callerTeam !== null && state.trick.length === 0 && (
                <div className="g28-pts-overlay">
                  {names[0]}&{names[2]}: {teamPoints[0]}{callerTeam === 0 ? `/${state.currentBid}★` : ""}<br />
                  {names[1]}&{names[3]}: {teamPoints[1]}{callerTeam === 1 ? `/${state.currentBid}★` : ""}
                </div>
              )}

              {/* 4 trick slots */}
              {DIRS.map((dir, i) => {
                const pi = DIR_PLAYER[i];
                const entry = seat(pi);
                return (
                  <div key={dir} className={`g28-tslot ${dir}`}>
                    {entry
                      ? <TrickCard card={entry.card} dir={dir} />
                      : <div className="g28-tempty" />
                    }
                    <span className={`g28-tsname${entry ? " played" : ""}`}>
                      {names[pi].split(" ")[0]}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Right opponent (player 3) */}
            <div className="g28-opp-chip">
              <span className="g28-oppname">{names[3].split(" ")[0]}</span>
              {state.phase === "playing" && state.turn === 3 && <span className="g28-oppturn">⏳</span>}
              <HandPip count={state.hands[3].length} />
              <span style={{ fontSize: 8, opacity: 0.35 }}>×{state.hands[3].length}</span>
            </div>
          </div>
        )}

        {/* Action zone */}
        <div className="g28-action">

          {/* Move tip */}
          {state.moveTip && (
            <div key={state.moveTip.id} className="g28-tip g28-tip-anim">
              💡 {state.moveTip.text}
            </div>
          )}

          {/* Bidding — your turn */}
          {state.phase === "bidding" && state.bidTurn === 0 && !state.passed[0] && (
            <div className="g28-panel">
              <p className="g28-panel-lbl">Your bid — highest so far: <strong>{state.currentBid === 13 ? "none" : state.currentBid}</strong></p>
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
                <button className="g28-btn ghost" onClick={() => dispatch({ type: "PASS", playerIdx: 0 })}>Pass</button>
              </div>
            </div>
          )}

          {/* Bidding — AI turn */}
          {state.phase === "bidding" && state.bidTurn !== 0 && (
            <p className="g28-waiting">{names[state.bidTurn]} is bidding…</p>
          )}

          {/* Choose trump — your turn */}
          {state.phase === "choose-trump" && caller === 0 && (
            <div className="g28-panel">
              <p className="g28-panel-lbl">You won at {state.currentBid}. Pick your secret trump:</p>
              <div className="g28-suit-row">
                {SUITS.map((s) => (
                  <button
                    key={s}
                    className="g28-suit-btn"
                    style={{ color: SUIT_INFO[s].color }}
                    onClick={() => dispatch({ type: "CHOOSE_TRUMP", suit: s })}
                  >
                    {SUIT_INFO[s].sym}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Choose trump — AI */}
          {state.phase === "choose-trump" && caller !== 0 && (
            <p className="g28-waiting">{names[caller!]} is picking trump…</p>
          )}

          {/* Playing — AI turn waiting */}
          {state.phase === "playing" && state.turn !== 0 && state.trick.length < 4 && (
            <p className="g28-waiting">{names[state.turn]} is thinking…</p>
          )}

          {/* Hand end result */}
          {state.phase === "hand-end" && state.lastResult && (() => {
            const r = state.lastResult!;
            return (
              <div className={`g28-result${r.matchOver ? " win" : ""}`}>
                {r.matchOver && <p className="g28-res-big">🏆 {teams[r.winningTeam]} win the match!</p>}
                <p className="g28-res-row">{teams[r.callerTeam]} bid {r.bid}, scored {r.callerPts} pts.</p>
                <p className="g28-res-winner">
                  {teams[r.winningTeam]} win{r.pointsAwarded > 1 ? " (double — under half!)" : ""}
                  <span style={{ fontWeight: 400, opacity: 0.6 }}> +{r.pointsAwarded}pt</span>
                </p>
                {state.feedbackOn && r.tips.length > 0 && (
                  <div className="g28-res-tips">
                    <strong>Your plays this hand:</strong>
                    <ul>{r.tips.slice(0, 3).map((t, i) => <li key={i}>{t}</li>)}</ul>
                  </div>
                )}
                <button
                  className="g28-btn gold full"
                  onClick={() => dispatch({ type: r.matchOver ? "NEW_MATCH" : "DEAL" })}
                >
                  {r.matchOver ? "New Match" : "Next Hand →"}
                </button>
              </div>
            );
          })()}

          {/* Log */}
          {state.log.length > 0 && inGame && (
            <div className="g28-log">
              {state.log.slice(0, 2).map((l, i) => <span key={i}>{l}</span>)}
            </div>
          )}
        </div>
      </div>

      {/* ── Hand dock ── */}
      {showHand && (
        <div className="g28-hand-dock">
          <div className="g28-hand-hdr">
            <span className="g28-hand-lbl">Your hand{userTurn ? " — tap a card to play" : ""}</span>
            {userTurn && voidInLead && !trumpKnown && (
              <button className="g28-btn red sm" onClick={() => dispatch({ type: "ASK_TRUMP", playerIdx: 0 })}>
                Ask trump
              </button>
            )}
          </div>
          <div className="g28-hand-row">
            {hand.map((c) => (
              <HandCard
                key={c.id}
                card={c}
                playable={userTurn && isLegal(c)}
                faded={userTurn && !isLegal(c)}
                isTrump={trumpKnown && c.suit === ts}
                onClick={userTurn && isLegal(c) ? () => dispatch({ type: "PLAY_CARD", playerIdx: 0, card: c }) : undefined}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
