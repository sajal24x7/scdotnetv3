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

/* Root — locked to viewport, no scroll */
.g28{
  height:100vh; height:100dvh;
  background:linear-gradient(165deg,#3e2a1a 0%,#2a1a10 45%,#1a0f08 100%);
  display:flex; flex-direction:column; align-items:center;
  font-family:'Inter',system-ui,sans-serif; color:#f3ecd9; overflow:hidden;
}
.g28-wrap{
  width:100%; max-width:440px; height:100%;
  display:flex; flex-direction:column; gap:6px; padding:10px 12px 10px;
  overflow:hidden;
}

/* Header */
.g28-hdr{ display:flex; justify-content:space-between; align-items:center; flex-shrink:0; }
.g28-title{ font-family:'Fraunces',serif; font-size:28px; font-weight:700; color:#e9d9a0; line-height:1; }
.g28-subtitle{ font-size:10px; opacity:0.5; margin-top:1px; }
.g28-hdr-right{ display:flex; gap:5px; align-items:center; }
.g28-tbtn{
  font-family:'Inter',sans-serif; font-size:10px; padding:4px 9px; border-radius:99px;
  border:1px solid rgba(201,162,39,0.5); background:transparent; color:#e9d9a0; cursor:pointer;
}
.g28-tbtn.dim{ color:rgba(243,236,217,0.38); }
.g28-tbtn:hover{ opacity:0.75; }

/* Score bar */
.g28-score{ display:flex; justify-content:space-between; align-items:flex-start; flex-shrink:0; gap:6px; }
.g28-team{ display:flex; flex-direction:column; align-items:center; gap:3px; min-width:100px; }
.g28-tname{ font-size:10px; opacity:0.75; text-align:center; line-height:1.3; }
.g28-badges{ display:flex; gap:4px; }
.g28-badge{ display:flex; flex-direction:column; align-items:center; gap:2px; }
.g28-badge-card{
  width:22px; height:32px; border-radius:3px; background:#fbf6e9;
  border:1.5px solid currentColor; display:flex; flex-direction:column;
  align-items:center; justify-content:center; gap:0; line-height:1;
}
.g28-b6{ font-size:10px; font-weight:700; }
.g28-bsym{ font-size:11px; }
.g28-pips{ display:flex; gap:2px; }
.g28-pip{ width:4px; height:4px; border-radius:50%; border:1px solid currentColor; }
.g28-pip.on{ background:currentColor; }

.g28-trump-mid{ display:flex; flex-direction:column; align-items:center; gap:2px; padding-top:2px; }
.g28-trump-lbl{ font-size:9px; opacity:0.55; }
.g28-trump-val{ font-size:12px; font-weight:600; text-align:center; line-height:1.25; }

/* Table */
.g28-table{
  position:relative; border-radius:14px; flex-shrink:0;
  border:2px solid rgba(201,162,39,0.5);
  background:radial-gradient(ellipse at center,#15543f 0%,#0d3a2b 65%,#082417 100%);
  box-shadow:inset 0 0 32px rgba(0,0,0,0.5); overflow:hidden;
  display:flex; flex-direction:column; gap:6px; padding:8px 10px;
}
.g28-cnr{ position:absolute; font-size:8px; color:rgba(201,162,39,0.35); letter-spacing:2px; }
.g28-cnr.tl{ top:5px; left:7px; } .g28-cnr.tr{ top:5px; right:7px; }
.g28-cnr.bl{ bottom:5px; left:7px; } .g28-cnr.br{ bottom:5px; right:7px; }

/* Partner row (top of table) */
.g28-partner-row{ display:flex; align-items:center; justify-content:center; gap:8px; }
.g28-pip-name{ font-size:10px; opacity:0.7; white-space:nowrap; max-width:80px; overflow:hidden; text-overflow:ellipsis; }
.g28-pip-lbl{ font-size:9px; opacity:0.4; }
.g28-card-fan{
  display:flex; gap:-4px; /* overlapping */
}
.g28-fan-card{
  width:14px; height:20px; border-radius:2px; background:#0f3d2e; border:1px solid #c9a227;
  flex-shrink:0;
}
.g28-fan-card:not(:first-child){ margin-left:-5px; }
.g28-count-badge{
  font-size:10px; font-weight:600; color:rgba(201,162,39,0.8);
  min-width:16px; text-align:center;
}

/* Middle row */
.g28-mid{ display:flex; align-items:center; gap:4px; }
.g28-opp{ display:flex; flex-direction:column; align-items:center; gap:3px; width:36px; flex-shrink:0; }
.g28-opp-name{ font-size:9px; opacity:0.65; text-align:center; white-space:nowrap; overflow:hidden; max-width:36px; text-overflow:ellipsis; }

/* Trick area — absolute diamond layout */
.g28-trick{
  flex:1; min-width:0; position:relative; aspect-ratio:1;
  max-width:160px; margin:0 auto;
}
.g28-tslot{
  position:absolute; display:flex; flex-direction:column; align-items:center; gap:2px;
}
.g28-tslot.top { left:50%; top:0; transform:translateX(-50%); }
.g28-tslot.bot { left:50%; bottom:0; transform:translateX(-50%); }
.g28-tslot.left { left:0; top:50%; transform:translateY(-50%); }
.g28-tslot.right { right:0; top:50%; transform:translateY(-50%); }
.g28-tcenter{
  position:absolute; left:50%; top:50%; transform:translate(-50%,-50%);
  font-size:16px; color:rgba(201,162,39,0.2); pointer-events:none;
}
.g28-tname{ font-size:9px; color:rgba(243,236,217,0.38); }
.g28-tname.played{ color:#e9d9a0; }

/* Points row */
.g28-pts{ display:flex; justify-content:center; gap:12px; font-size:9px; opacity:0.7; min-height:12px; }

/* Banner */
.g28-banner-wrap{
  position:absolute; inset:0; display:flex; align-items:center; justify-content:center;
  pointer-events:none; z-index:30;
}
.g28-banner{
  padding:9px 20px; border-radius:9px; border:1px solid #c9a227;
  box-shadow:0 6px 20px rgba(0,0,0,0.5); text-align:center;
}
.g28-banner-txt{ font-family:'Fraunces',serif; font-size:17px; font-weight:700; color:#e9d9a0; }

/* Controls section */
.g28-ctrl{ flex:1; min-height:0; display:flex; flex-direction:column; gap:6px; overflow:hidden; }
.g28-panel{ border-radius:9px; padding:10px; background:rgba(0,0,0,0.35); display:flex; flex-direction:column; gap:8px; flex-shrink:0; }
.g28-panel-lbl{ font-size:11px; opacity:0.65; }
.g28-row{ display:flex; gap:6px; flex-wrap:wrap; align-items:center; }

/* Buttons */
.g28-btn{
  font-family:'Inter',sans-serif; font-size:13px; font-weight:500;
  padding:8px 14px; border-radius:7px; border:none; cursor:pointer;
  transition:opacity 0.12s,transform 0.1s;
}
.g28-btn:hover{ opacity:0.85; }
.g28-btn:active{ transform:scale(0.96); }
.g28-btn:disabled{ opacity:0.32; cursor:default; }
.g28-btn.gold{ background:#c9a227; color:#1c1f1d; font-weight:600; }
.g28-btn.ghost{ background:transparent; color:#f3ecd9; border:1px solid rgba(243,236,217,0.4); }
.g28-btn.red{ background:#9a2b3a; color:#f3ecd9; }
.g28-btn.full{ width:100%; text-align:center; padding:11px; font-size:14px; font-weight:600; }
.g28-suit-row{ display:flex; gap:8px; justify-content:center; }
.g28-suit-btn{
  width:50px; height:50px; border-radius:9px; border:none; background:#fbf6e9;
  font-size:26px; cursor:pointer; display:flex; align-items:center; justify-content:center;
  transition:transform 0.1s;
}
.g28-suit-btn:hover{ transform:scale(1.1); }

/* Move tip */
.g28-tip{
  padding:7px 10px; border-radius:7px; font-size:11px; line-height:1.5; flex-shrink:0;
  background:rgba(201,162,39,0.13); border:1px solid rgba(201,162,39,0.4); color:#e9d9a0;
}

/* Hand */
.g28-hand{ display:flex; flex-direction:column; gap:5px; flex-shrink:0; }
.g28-hand-hdr{ display:flex; justify-content:space-between; align-items:center; }
.g28-hand-lbl{ font-size:10px; opacity:0.55; }
.g28-hand-row{ display:flex; gap:5px; justify-content:center; flex-wrap:nowrap; }

/* Cards */
.g28-card{
  position:relative; display:flex; flex-direction:column; align-items:center; justify-content:center;
  border-radius:5px; border:1.5px solid #3a2a1a; background:#fbf6e9;
  box-shadow:0 1px 3px rgba(0,0,0,0.25); user-select:none; flex-shrink:0;
  transition:transform 0.1s,box-shadow 0.1s;
}
.g28-card.play{ cursor:pointer; border-color:#c9a227; box-shadow:0 0 0 2px #c9a227; }
.g28-card.play:hover{ transform:translateY(-5px); box-shadow:0 0 0 2px #c9a227,0 5px 12px rgba(0,0,0,0.35); }
.g28-card.dim{ opacity:0.28; }
.g28-card.waiting{ opacity:0.6; }
.g28-tdot{ position:absolute; top:2px; right:2px; width:5px; height:5px; border-radius:50%; background:#c9a227; }
.g28-crank{ font-weight:700; line-height:1; }
.g28-csym{ line-height:1; }

/* Card back (trick area) */
.g28-cback{
  border-radius:3px; background:#0f3d2e; border:1px solid #c9a227;
  display:flex; align-items:center; justify-content:center; flex-shrink:0;
}
.g28-cback-in{ width:65%; height:65%; border:1px solid rgba(201,162,39,0.4); border-radius:2px; }

/* Result panel */
.g28-result{ border-radius:9px; padding:11px; display:flex; flex-direction:column; gap:5px; background:rgba(0,0,0,0.35); }
.g28-result.win{ background:rgba(201,162,39,0.14); border:1px solid rgba(201,162,39,0.4); }
.g28-res-big{ font-family:'Fraunces',serif; font-size:16px; color:#e9d9a0; }
.g28-res-row{ font-size:12px; opacity:0.8; }
.g28-res-winner{ font-size:13px; font-weight:600; color:#e9d9a0; }
.g28-res-tips{ font-size:10px; padding:7px 9px; border-radius:6px; background:rgba(0,0,0,0.22); line-height:1.5; }
.g28-res-tips ul{ padding-left:14px; margin-top:3px; }
.g28-res-tips li{ margin-bottom:2px; opacity:0.85; }

/* Log */
.g28-log{ display:flex; flex-direction:column; gap:1px; font-size:9px; opacity:0.38; padding:0 2px; flex-shrink:0; }

/* Start screen */
.g28-start{ display:flex; flex-direction:column; gap:12px; }
.g28-start-title{ font-family:'Fraunces',serif; font-size:22px; color:#e9d9a0; }
.g28-start-sub{ font-size:12px; opacity:0.6; line-height:1.5; }
.g28-start-field{ display:flex; flex-direction:column; gap:5px; }
.g28-start-lbl{ font-size:11px; opacity:0.55; }
.g28-input{
  font-family:'Inter',sans-serif; font-size:15px; padding:9px 12px; border-radius:7px;
  border:1px solid rgba(201,162,39,0.5); background:rgba(255,255,255,0.07); color:#f3ecd9; outline:none;
}
.g28-input:focus{ border-color:#c9a227; background:rgba(255,255,255,0.1); }
.g28-input::placeholder{ color:rgba(243,236,217,0.28); }
.g28-resume{ display:flex; flex-direction:column; gap:8px; }
.g28-resume-greet{ font-size:13px; opacity:0.75; }

/* Rules panel */
.g28-rules{ border-radius:9px; padding:10px 12px; font-size:10px; line-height:1.65; background:rgba(12,53,39,0.88); border:1px solid rgba(201,162,39,0.3); flex-shrink:0; overflow-y:auto; }
.g28-rules p{ margin-bottom:5px; }

/* Animations */
@keyframes g28-popT{from{transform:translateX(-50%) translateY(-14px) scale(0.78);opacity:0}to{transform:translateX(-50%) translateY(0) scale(1);opacity:1}}
@keyframes g28-popB{from{transform:translateX(-50%) translateY(14px) scale(0.78);opacity:0}to{transform:translateX(-50%) translateY(0) scale(1);opacity:1}}
@keyframes g28-popL{from{transform:translateY(-50%) translateX(-14px) scale(0.78);opacity:0}to{transform:translateY(-50%) translateX(0) scale(1);opacity:1}}
@keyframes g28-popR{from{transform:translateY(-50%) translateX(14px) scale(0.78);opacity:0}to{transform:translateY(-50%) translateX(0) scale(1);opacity:1}}
@keyframes g28-pop{from{transform:scale(0.7) translateY(6px);opacity:0}to{transform:scale(1) translateY(0);opacity:1}}
.g28-aT{animation:g28-popT .28s ease-out}
.g28-aB{animation:g28-popB .28s ease-out}
.g28-aL{animation:g28-popL .28s ease-out}
.g28-aR{animation:g28-popR .28s ease-out}
.g28-ap{animation:g28-pop .22s ease-out}

@keyframes g28-bnr{
  0%{opacity:0;transform:translateY(8px) scale(0.85)}
  12%{opacity:1;transform:translateY(0) scale(1)}
  80%{opacity:1;transform:translateY(0) scale(1)}
  100%{opacity:0;transform:translateY(-5px) scale(0.95)}
}
.g28-bnr-anim{animation:g28-bnr 1.6s ease-in-out forwards}

@keyframes g28-tip{
  0%{opacity:0;transform:translateY(4px)}8%{opacity:1;transform:translateY(0)}
  88%{opacity:1;transform:translateY(0)}100%{opacity:0;transform:translateY(-3px)}
}
.g28-tip-anim{animation:g28-tip 3.2s ease-in-out forwards}
`;

// ── Sub-components ─────────────────────────────────────────────────────────────

/** Small fanned stack to represent a player's hidden hand */
function HandPip({ count }: { count: number }) {
  if (count === 0) return <span style={{ fontSize: 9, opacity: 0.4 }}>done</span>;
  const n = Math.min(count, 5);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 0, position: "relative", height: 22, width: 8 + n * 7 }}>
      {Array.from({ length: n }).map((_, i) => (
        <div
          key={i}
          className="g28-fan-card"
          style={{
            position: "absolute",
            left: i * 7,
            bottom: 0,
            transform: `rotate(${(i - (n - 1) / 2) * 8}deg)`,
            transformOrigin: "bottom center",
          }}
        />
      ))}
    </div>
  );
}

/** Card rendered in the trick area (small) */
function TrickCard({ card, dir }: { card: Card; dir: "top" | "bot" | "left" | "right" }) {
  const info = SUIT_INFO[card.suit];
  const animCls = { top: "g28-aT", bot: "g28-aB", left: "g28-aL", right: "g28-aR" }[dir];
  return (
    <div className={`g28-card ${animCls}`} style={{ width: 30, height: 42, border: "none" }}>
      <span className="g28-crank" style={{ color: info.color, fontSize: 12 }}>{card.rank}</span>
      <span className="g28-csym" style={{ color: info.color, fontSize: 14 }}>{info.sym}</span>
    </div>
  );
}

/** Card in the player's hand (tappable) */
function HandCard({ card, playable, faded, isTrump, onClick }: {
  card: Card; playable?: boolean; faded?: boolean; isTrump?: boolean; onClick?: () => void;
}) {
  const info = SUIT_INFO[card.suit];
  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      className={`g28-card${playable ? " play" : faded ? " dim" : !playable && !faded ? " waiting" : ""}`}
      style={{ width: 42, height: 60, border: "none" }}
    >
      {isTrump && <span className="g28-tdot" />}
      <span className="g28-crank" style={{ color: info.color, fontSize: 14 }}>{card.rank}</span>
      <span className="g28-csym" style={{ color: info.color, fontSize: 18 }}>{info.sym}</span>
    </button>
  );
}

function SixBadge({ filled, color, sym }: { filled: number; color: string; sym: string }) {
  return (
    <div className="g28-badge" style={{ color }}>
      <div className="g28-badge-card">
        <span className="g28-b6">6</span>
        <span className="g28-bsym">{sym}</span>
      </div>
      <div className="g28-pips">
        {Array.from({ length: MATCH_TARGET }).map((_, i) => (
          <span key={i} className={`g28-pip${i < filled ? " on" : ""}`} />
        ))}
      </div>
    </div>
  );
}

/** Simplified start screen — just your name */
function StartScreen({ savedName, onStart }: { savedName?: string; onStart: (names: string[]) => void }) {
  const [name, setName] = useState(savedName || "");

  function go(n = name) {
    const you = n.trim() || "You";
    const [partner] = pickN(PARTNER_POOL, 1);
    const [o1, o2] = pickN(OPP_POOL, 2);
    onStart([you, o1, partner, o2]);
  }

  return (
    <div className="g28-start">
      <div>
        <h2 className="g28-start-title">28</h2>
        <p className="g28-start-sub">A trick-taking card game for two pairs.<br />J=3, 9=2, A=1, 10=1 — first to {MATCH_TARGET} wins.</p>
      </div>
      <div className="g28-start-field">
        <label className="g28-start-lbl">Your name</label>
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
    </div>
  );
}

/** Resume prompt when there's a saved in-progress game */
function ResumeScreen({ name, onResume, onNew }: { name: string; onResume: () => void; onNew: () => void }) {
  return (
    <div className="g28-resume">
      <p className="g28-resume-greet">Welcome back, <strong>{name}</strong> — your game is saved.</p>
      <button className="g28-btn gold full" onClick={onResume}>Continue Game →</button>
      <button className="g28-btn ghost full" style={{ fontSize: 12, padding: "7px" }} onClick={onNew}>Start a new game instead</button>
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────────
export default function TwentyEight() {
  const [state, dispatch] = useReducer(reducer, INIT, loadState);
  const [showRules, setShowRules] = useState(false);
  // If we loaded a non-start saved state, show resume prompt first
  const [resuming, setResuming] = useState(() => {
    const s = loadState(INIT);
    return s.phase !== "start" && s.phase !== undefined;
  });
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  const after = (ms: number, fn: () => void) => { const id = setTimeout(fn, ms); timers.current.push(id); };

  // Persist every state change
  useEffect(() => { if (state.phase !== "start") saveState(state); }, [state]);

  // AI effects
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
  const teams = tl(state.names);
  const ts = state.trumpSuit;
  const trumpColor = ts ? (SUIT_INFO[ts].color === "#9a2b3a" ? "#e07a8b" : "#c9d4a0") : "#e9d9a0";
  const seat = (idx: number) => state.trick.find((t) => t.player === idx);
  const inGame = state.phase !== "start";
  const showHand = (state.phase === "playing" || state.phase === "bidding" || state.phase === "choose-trump") && hand.length > 0;

  return (
    <div className="g28">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="g28-wrap">

        {/* ── Header ── */}
        <div className="g28-hdr">
          <div>
            <div className="g28-title">28</div>
            {inGame && <div className="g28-subtitle">{state.names[0]} & {state.names[2]} vs {state.names[1]} & {state.names[3]}</div>}
          </div>
          <div className="g28-hdr-right">
            {inGame && (
              <button className="g28-tbtn" onClick={() => { dispatch({ type: "RESET" }); setResuming(false); localStorage.removeItem(SAVE_KEY); }}>
                New
              </button>
            )}
            <button className="g28-tbtn" onClick={() => setShowRules((v) => !v)}>
              {showRules ? "✕" : "Rules"}
            </button>
            <button className={`g28-tbtn${state.feedbackOn ? "" : " dim"}`} onClick={() => dispatch({ type: "TOGGLE_FEEDBACK" })}>
              Tips
            </button>
          </div>
        </div>

        {/* ── Rules (collapsible) ── */}
        {showRules && (
          <div className="g28-rules">
            <p><strong>Goal:</strong> two pairs fight over 28 pts per hand. J=3, 9=2, A=1, 10=1.</p>
            <p><strong>Rank</strong> (high→low): J 9 A 10 K Q 8 7.</p>
            <p><strong>Bid:</strong> with 4 cards, bid points you'll win. Winner secretly picks trump, then all get 4 more cards.</p>
            <p><strong>Hidden trump:</strong> tap "Ask trump" when void in led suit to force the reveal — or play blind. Playing a trump card also reveals it.</p>
            <p><strong>Under-half:</strong> holding caller below bid/2 wins double.</p>
            <p><strong>Match:</strong> first to {MATCH_TARGET} hand-points wins.</p>
          </div>
        )}

        {/* ── Score bar ── */}
        {inGame && (
          <div className="g28-score">
            <div className="g28-team">
              <span className="g28-tname">{state.names[0]} & {state.names[2]}</span>
              <div className="g28-badges">
                <SixBadge filled={Math.min(MATCH_TARGET, state.handsWon[0])} color="#b3273a" sym="♥" />
                <SixBadge filled={Math.min(MATCH_TARGET, state.handsWon[1])} color="#2a2a2a" sym="♠" />
              </div>
            </div>
            <div className="g28-trump-mid">
              <span className="g28-trump-lbl">Trump</span>
              {trumpKnown && ts
                ? <span className="g28-trump-val" style={{ color: trumpColor }}>{SUIT_INFO[ts].sym} {SUIT_INFO[ts].name}</span>
                : <span className="g28-trump-val" style={{ opacity: 0.45 }}>🔒</span>
              }
            </div>
            <div className="g28-team" style={{ alignItems: "flex-end" }}>
              <span className="g28-tname" style={{ textAlign: "right" }}>{state.names[1]} & {state.names[3]}</span>
              <div className="g28-badges">
                <SixBadge filled={Math.min(MATCH_TARGET, state.handsWon[1])} color="#b3273a" sym="♦" />
                <SixBadge filled={Math.min(MATCH_TARGET, state.handsWon[0])} color="#2a2a2a" sym="♣" />
              </div>
            </div>
          </div>
        )}

        {/* ── Game table ── */}
        {inGame && (
          <div className="g28-table">
            <span className="g28-cnr tl">◆ ◆</span><span className="g28-cnr tr">◆ ◆</span>
            <span className="g28-cnr bl">◆ ◆</span><span className="g28-cnr br">◆ ◆</span>

            {/* Banner overlay */}
            {state.banner && (
              <div key={state.banner.id} className="g28-banner-wrap">
                <div className="g28-banner g28-bnr-anim" style={{
                  background: state.banner.kind === "trump" ? "rgba(154,43,58,0.93)"
                    : state.banner.kind === "match" ? "rgba(201,162,39,0.96)"
                    : "rgba(12,53,39,0.93)",
                }}>
                  <div className="g28-banner-txt" style={{ color: state.banner.kind === "match" ? "#1c1f1d" : "#e9d9a0" }}>
                    {state.banner.text}
                  </div>
                </div>
              </div>
            )}

            {/* Partner row */}
            <div className="g28-partner-row">
              <HandPip count={state.hands[2].length} />
              <span className="g28-pip-name">
                {state.names[2]}{state.phase === "playing" && state.turn === 2 ? " ⏳" : ""}
              </span>
              <span className="g28-pip-lbl">partner</span>
              <span className="g28-count-badge">×{state.hands[2].length}</span>
            </div>

            {/* Middle: left opp | trick | right opp */}
            <div className="g28-mid">
              <div className="g28-opp">
                <span className="g28-opp-name">{state.names[1].split(" ")[0]}{state.phase === "playing" && state.turn === 1 ? "⏳" : ""}</span>
                <HandPip count={state.hands[1].length} />
                <span className="g28-count-badge">×{state.hands[1].length}</span>
              </div>

              {/* Trick diamond */}
              <div className="g28-trick">
                <span className="g28-tcenter">◇</span>
                {(["top", "bot", "left", "right"] as const).map((dir, i) => {
                  const pi = [2, 0, 1, 3][i];
                  const entry = seat(pi);
                  return (
                    <div key={dir} className={`g28-tslot ${dir}`}>
                      {entry
                        ? <TrickCard card={entry.card} dir={dir} />
                        : <div style={{ width: 30, height: 42, opacity: 0.12, borderRadius: 4, border: "1px dashed rgba(201,162,39,0.5)" }} />
                      }
                      <span className={`g28-tname${entry ? " played" : ""}`}>
                        {state.names[pi].split(" ")[0]}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="g28-opp">
                <span className="g28-opp-name">{state.names[3].split(" ")[0]}{state.phase === "playing" && state.turn === 3 ? "⏳" : ""}</span>
                <HandPip count={state.hands[3].length} />
                <span className="g28-count-badge">×{state.hands[3].length}</span>
              </div>
            </div>

            {/* Points row */}
            <div className="g28-pts">
              {state.phase === "playing" && callerTeam !== null && (
                <>
                  <span>{teams[0]}: {state.teamPoints[0]}/{callerTeam === 0 ? state.currentBid : 29 - state.currentBid}{callerTeam === 0 ? "★" : ""}</span>
                  <span>{teams[1]}: {state.teamPoints[1]}/{callerTeam === 1 ? state.currentBid : 29 - state.currentBid}{callerTeam === 1 ? "★" : ""}</span>
                </>
              )}
            </div>
          </div>
        )}

        {/* ── Controls ── */}
        <div className="g28-ctrl">

          {/* Move tip */}
          {state.moveTip && (
            <div key={state.moveTip.id} className="g28-tip g28-tip-anim">💡 {state.moveTip.text}</div>
          )}

          {/* Start / Resume */}
          {state.phase === "start" && (
            resuming
              ? <div className="g28-panel">
                  <ResumeScreen
                    name={state.names[0]}
                    onResume={() => setResuming(false)}
                    onNew={() => { dispatch({ type: "RESET" }); setResuming(false); localStorage.removeItem(SAVE_KEY); }}
                  />
                </div>
              : <div className="g28-panel">
                  <StartScreen
                    savedName={state.names[0] !== "You" ? state.names[0] : ""}
                    onStart={(names) => dispatch({ type: "START", names })}
                  />
                </div>
          )}

          {/* Bidding */}
          {state.phase === "bidding" && state.bidTurn === 0 && !state.passed[0] && (
            <div className="g28-panel">
              <p className="g28-panel-lbl">Your bid — current: <strong>{state.currentBid === 13 ? "none" : state.currentBid}</strong></p>
              <div className="g28-row">
                {[1, 2, 4].map((step) => {
                  const amt = Math.min(28, state.currentBid + step);
                  return (
                    <button key={step} className="g28-btn gold" disabled={amt <= state.currentBid}
                      onClick={() => dispatch({ type: "BID", playerIdx: 0, amount: amt })}>
                      Bid {amt}
                    </button>
                  );
                })}
                <button className="g28-btn ghost" onClick={() => dispatch({ type: "PASS", playerIdx: 0 })}>Pass</button>
              </div>
            </div>
          )}

          {/* Choose trump */}
          {state.phase === "choose-trump" && state.caller === 0 && (
            <div className="g28-panel">
              <p className="g28-panel-lbl">You won at {state.currentBid}. Pick your secret trump:</p>
              <div className="g28-suit-row">
                {SUITS.map((s) => (
                  <button key={s} className="g28-suit-btn" style={{ color: SUIT_INFO[s].color }}
                    onClick={() => dispatch({ type: "CHOOSE_TRUMP", suit: s })}>
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
              <div className={`g28-result${r.matchOver ? " win" : ""}`}>
                {r.matchOver && <p className="g28-res-big">🏆 {teams[r.winningTeam]} win the match!</p>}
                <p className="g28-res-row">{teams[r.callerTeam]} bid {r.bid}, scored {r.callerPts}.</p>
                <p className="g28-res-winner">
                  {teams[r.winningTeam]} win{r.pointsAwarded > 1 ? " (double — under half)" : ""}! <span style={{ fontWeight: 400, opacity: 0.7 }}>+{r.pointsAwarded}pt</span>
                </p>
                {state.feedbackOn && r.tips.length > 0 && (
                  <div className="g28-res-tips">
                    <strong>Your plays:</strong>
                    <ul>{r.tips.slice(0, 4).map((t, i) => <li key={i}>{t}</li>)}</ul>
                  </div>
                )}
                {state.feedbackOn && r.tips.length === 0 && (
                  <p className="g28-res-tips" style={{ opacity: 0.7 }}>Clean hand — no notable alternative plays.</p>
                )}
                <button className="g28-btn gold full" onClick={() => dispatch({ type: r.matchOver ? "NEW_MATCH" : "DEAL" })}>
                  {r.matchOver ? "New Match" : "Deal Next Hand"}
                </button>
              </div>
            );
          })()}

          {/* Waiting during AI turns */}
          {state.phase === "playing" && state.turn !== 0 && state.trick.length < 4 && (
            <p style={{ fontSize: 11, opacity: 0.45, textAlign: "center" }}>
              {state.names[state.turn]} is thinking…
            </p>
          )}

          {/* Your hand */}
          {showHand && (
            <div className="g28-hand">
              <div className="g28-hand-hdr">
                <span className="g28-hand-lbl">Your hand{userTurn ? " — tap to play" : ""}</span>
                {userTurn && voidInLead && !trumpKnown && (
                  <button className="g28-btn red" style={{ fontSize: 10, padding: "4px 9px" }}
                    onClick={() => dispatch({ type: "ASK_TRUMP", playerIdx: 0 })}>
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
                    isTrump={trumpKnown && c.suit === state.trumpSuit}
                    onClick={userTurn && isLegal(c) ? () => dispatch({ type: "PLAY_CARD", playerIdx: 0, card: c }) : undefined}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Log */}
          {state.log.length > 0 && (
            <div className="g28-log">
              {state.log.slice(0, 3).map((l, i) => <span key={i}>{l}</span>)}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
