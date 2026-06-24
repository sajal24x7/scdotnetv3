import React, { useReducer, useEffect, useRef } from "react";

/* ---------- Card data ---------- */
const SUITS = ["S", "H", "D", "C"];
const SUIT_INFO: Record<string, { sym: string; red: boolean; name: string }> = {
  S: { sym: "♠", red: false, name: "Spades" },
  C: { sym: "♣", red: false, name: "Clubs" },
  H: { sym: "♥", red: true, name: "Hearts" },
  D: { sym: "♦", red: true, name: "Diamonds" },
};
const RANK_ORDER = ["J", "9", "A", "10", "K", "Q", "8", "7"];
const POINTS: Record<string, number> = { J: 3, 9: 2, A: 1, "10": 1, K: 0, Q: 0, "8": 0, "7": 0 };
const MATCH_TARGET = 6;

const GEN1_POKEMON = [
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

function pickPokemonNames(): [string, string, string] {
  const pool = [...GEN1_POKEMON];
  const pick = () => pool.splice(Math.floor(Math.random() * pool.length), 1)[0];
  return [pick(), pick(), pick()];
}

function teamNames(names: string[]) {
  return { 0: `${names[0]} & ${names[2]}`, 1: `${names[1]} & ${names[3]}` };
}
const rankIdx = (r: string) => RANK_ORDER.indexOf(r);
function sortHand(hand: Card[]) {
  return [...hand].sort((a, b) => {
    if (a.suit !== b.suit) return SUITS.indexOf(a.suit) - SUITS.indexOf(b.suit);
    return rankIdx(b.rank) - rankIdx(a.rank);
  });
}

interface Card { suit: string; rank: string; id: string; }
interface TrickEntry { player: number; card: Card; }

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
function cardBeats(a: Card, b: Card, leadSuit: string, trumpSuit: string) {
  const aT = a.suit === trumpSuit, bT = b.suit === trumpSuit;
  if (aT && !bT) return true;
  if (!aT && bT) return false;
  if (aT && bT) return rankIdx(a.rank) < rankIdx(b.rank);
  if (a.suit === leadSuit && b.suit === leadSuit) return rankIdx(a.rank) < rankIdx(b.rank);
  if (a.suit === leadSuit && b.suit !== leadSuit) return true;
  return false;
}
function trickWinner(trick: TrickEntry[], leadSuit: string, trumpSuit: string) {
  let best = trick[0];
  for (const t of trick.slice(1)) if (cardBeats(t.card, best.card, leadSuit, trumpSuit)) best = t;
  return best.player;
}

function evaluateMove(card: Card, state: GameState, trumpKnownToUser: boolean): string | null {
  const hand = state.hands[0];
  const { leadSuit, trick, trumpSuit } = state;
  let legal = leadSuit ? hand.filter((c) => c.suit === leadSuit) : hand;
  if (legal.length === 0) legal = hand;
  if (legal.length <= 1) return null;
  if (trick.length === 0) {
    if (card.suit === trumpSuit)
      return "Leading trump reveals it to everyone. Fine for control, but gives up the secret early.";
    return null;
  }
  const currentBest = trick.reduce((best, t) =>
    cardBeats(t.card, best.card, leadSuit!, trumpSuit!) ? t : best, trick[0]);
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

function nextActive(from: number, passed: boolean[]) {
  let p = (from + 1) % 4, guard = 0;
  while (passed[p] && guard < 8) { p = (p + 1) % 4; guard++; }
  return p;
}

function handStrength(hand: Card[]) {
  const pts = hand.reduce((s, c) => s + POINTS[c.rank], 0);
  const bySuit: Record<string, number> = {};
  hand.forEach((c) => (bySuit[c.suit] = (bySuit[c.suit] || 0) + 1));
  return pts + Math.max(...Object.values(bySuit)) * 1.4;
}
function aiBidDecision(hand: Card[], currentBid: number, mustRaise: boolean): number | null {
  const strength = handStrength(hand);
  // Conservative: avg hand (strength ~7) tops out ~19-20; very strong hand caps at 21
  const willing = Math.min(21, 17 + Math.round(strength * 0.38) + (Math.random() < 0.12 ? 1 : 0));
  const minBid = mustRaise ? currentBid + 1 : currentBid;
  if (minBid <= willing) {
    // Almost never jump — stay at the minimum
    return Math.min(willing, minBid + (Math.random() < 0.12 ? 1 : 0));
  }
  return null;
}
function aiChooseTrump(hand: Card[]) {
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
function aiPlayCard(playerIdx: number, state: GameState): Card {
  const hand = state.hands[playerIdx];
  const { leadSuit, trick, trumpSuit } = state;
  const knowsTrump = state.caller === playerIdx || state.trumpRevealed;
  let legal = leadSuit ? hand.filter((c) => c.suit === leadSuit) : hand;
  if (legal.length === 0) legal = hand;
  if (trick.length === 0) {
    const nonTrump = hand.filter((c) => c.suit !== trumpSuit || !knowsTrump);
    const pool = nonTrump.length ? nonTrump : hand;
    pool.sort((a, b) => POINTS[b.rank] - POINTS[a.rank]);
    return pool[Math.random() < 0.5 ? 0 : pool.length - 1];
  }
  const best = trick.reduce((b, t) => cardBeats(t.card, b.card, leadSuit!, trumpSuit!) ? t : b, trick[0]);
  const partnerWinning = best.player % 2 === playerIdx % 2;
  const winners = legal.filter((c) => cardBeats(c, best.card, leadSuit!, trumpSuit!));
  if (!partnerWinning && winners.length > 0) {
    const weighted = [...winners].sort((a, b) => {
      const aw = a.suit === trumpSuit ? 100 - rankIdx(a.rank) : 50 - rankIdx(a.rank);
      const bw = b.suit === trumpSuit ? 100 - rankIdx(b.rank) : 50 - rankIdx(b.rank);
      return aw - bw;
    });
    return weighted[0];
  }
  return [...legal].sort((a, b) => POINTS[a.rank] - POINTS[b.rank])[0];
}

/* ---------- State ---------- */
interface LastResult {
  callerTeam: number; made: boolean; bid: number;
  callerPts: number; defTeam: number; defPts: number;
  winningTeam: number; tips: string[];
  underHalf: boolean; pointsAwarded: number; matchOver: boolean;
}
interface GameState {
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
}

const initialState: GameState = {
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
};

function addLog(state: GameState, msg: string): GameState {
  return { ...state, log: [msg, ...state.log].slice(0, 8) };
}
function showBanner(state: GameState, text: string, kind: string): GameState {
  const id = (state.bannerSeq || 0) + 1;
  return { ...state, banner: { id, text, kind }, bannerSeq: id };
}
function showMoveTip(state: GameState, text: string): GameState {
  const id = (state.moveTipSeq || 0) + 1;
  return { ...state, moveTip: { id, text }, moveTipSeq: id, handTips: [...state.handTips, text] };
}

type Action =
  | { type: "INIT_NAMES"; names: string[] }
  | { type: "DEAL" }
  | { type: "BID"; playerIdx: number; amount: number }
  | { type: "PASS"; playerIdx: number }
  | { type: "CHOOSE_TRUMP"; suit: string }
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

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case "INIT_NAMES": return { ...state, names: action.names };
    case "DEAL": {
      const deck = shuffle(makeDeck());
      const hands: Card[][] = [[], [], [], []];
      for (let i = 0; i < 16; i++) hands[i % 4].push(deck[i]);
      const restDeck = deck.slice(16);
      const dealer = state.phase === "idle" ? state.dealer : (state.dealer + 1) % 4;
      const firstBidder = (dealer + 1) % 4;
      const bidOrder = [0, 1, 2, 3].map((i) => (firstBidder + i) % 4);
      const round = state.round + 1;
      let s: GameState = {
        ...state, phase: "bidding", dealer, hands, restDeck,
        bidTurn: firstBidder, bidOrder, mustRaise: false,
        currentBid: 16, highBidder: null, passed: [false, false, false, false],
        caller: null, trumpSuit: null, trumpRevealed: false, trick: [],
        leadSuit: null, tricksPlayed: 0, teamPoints: { 0: 0, 1: 0 },
        lastResult: null, round, handTips: [],
      };
      s = addLog(s, `Round ${round}. ${state.names[firstBidder]} opens.`);
      s = showBanner(s, `Round ${round}`, "round");
      return s;
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
      const bidOrder = state.bidOrder.filter((p) => p !== playerIdx);
      let s = addLog({ ...state, passed, bidOrder }, `${state.names[playerIdx]} passes.`);
      if (bidOrder.length === 1) {
        const last = bidOrder[0];
        const finalBid = state.highBidder === null ? 17 : state.currentBid;
        s = { ...s, caller: last, currentBid: finalBid, phase: "choose-trump", bidTurn: last };
        s = addLog(s, `${state.names[last]} wins the bid at ${finalBid}.`);
        return s;
      }
      // New active pair: bidOrder[0] (defender/new-opener) vs bidOrder[1] (new challenger)
      // New challenger always goes first; mustRaise resets to false (they can match)
      const nextTurn = state.highBidder !== null ? bidOrder[1] : bidOrder[0];
      s = { ...s, bidTurn: nextTurn, mustRaise: false };
      return s;
    }
    case "CHOOSE_TRUMP": {
      const { suit } = action;
      const hands = state.hands.map((h, i) => [...h, ...state.restDeck.filter((_, idx) => idx % 4 === i)]);
      let s: GameState = {
        ...state, trumpSuit: suit, trumpRevealed: false, hands,
        phase: "playing", turn: state.caller!, leadSuit: null, trick: [], tricksPlayed: 0,
      };
      s = addLog(s, state.caller === 0 ? `You chose ${SUIT_INFO[suit].name} (secret).` : `${state.names[state.caller!]} chose trump secretly.`);
      return s;
    }
    case "ASK_TRUMP": {
      const { playerIdx } = action;
      let s = { ...state, trumpRevealed: true };
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
      let s: GameState = { ...state, hands, trick, leadSuit, trumpRevealed };
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
        s = addLog({ ...s, teamPoints, tricksPlayed, lastTrickWinner: winner },
          `${state.names[winner]} wins the trick (+${pts}). Team ${team === 0 ? teamNames(state.names)[0] : teamNames(state.names)[1]}: ${teamPoints[team]} pts.`);
      } else {
        s = { ...s, turn: (playerIdx + 1) % 4 };
      }
      return s;
    }
    case "CLEAR_TRICK": {
      let s: GameState = { ...state, trick: [], leadSuit: null, turn: state.lastTrickWinner! };
      if (s.tricksPlayed >= 8) {
        const callerTeam = s.caller! % 2;
        const made = s.teamPoints[callerTeam] >= s.currentBid;
        const winningTeam = made ? callerTeam : 1 - callerTeam;
        const underHalf = !made && s.halfBidPenaltyOn && s.teamPoints[callerTeam] < s.currentBid / 2;
        const pointsAwarded = underHalf ? 2 : 1;
        const handsWon = { ...s.handsWon, [winningTeam]: s.handsWon[winningTeam] + pointsAwarded };
        const matchOver = handsWon[winningTeam] >= MATCH_TARGET;
        s = {
          ...s, phase: "hand-end", handsWon,
          lastResult: {
            callerTeam, made, bid: s.currentBid, callerPts: s.teamPoints[callerTeam],
            defTeam: 1 - callerTeam, defPts: s.teamPoints[1 - callerTeam],
            winningTeam, tips: s.handTips, underHalf, pointsAwarded, matchOver,
          },
        };
        s = addLog(s, made
          ? `${teamNames(state.names)[callerTeam]} made the bid!`
          : underHalf
          ? `${teamNames(state.names)[callerTeam]} fell under half — double point to ${teamNames(state.names)[1 - callerTeam]}.`
          : `${teamNames(state.names)[callerTeam]} fell short. ${teamNames(state.names)[1 - callerTeam]} wins the hand.`);
        if (matchOver) {
          s = showBanner(s, `${teamNames(state.names)[winningTeam]} win!`, "match");
        }
      }
      return s;
    }
    case "AI_BID": {
      const { playerIdx } = action;
      const decision = aiBidDecision(state.hands[playerIdx], state.currentBid, state.mustRaise);
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
        const defending = playerIdx % 2 !== state.caller! % 2;
        if (Math.random() < (defending ? 0.7 : 0.3))
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
    case "NEW_MATCH": return reducer({ ...state, handsWon: { 0: 0, 1: 0 }, round: 0 }, { type: "DEAL" });
    case "RESET": return { ...initialState, names: state.names, feedbackOn: state.feedbackOn, halfBidPenaltyOn: state.halfBidPenaltyOn, bidOrder: [], mustRaise: false };
    default: return state;
  }
}

/* ---------- UI Components ---------- */

function PlayingCard({ card, small = false, faded = false, onClick, disabled = false, highlight = false, isTrump = false, popDir }: {
  card: Card; small?: boolean; faded?: boolean; onClick?: () => void;
  disabled?: boolean; highlight?: boolean; isTrump?: boolean; popDir?: string;
}) {
  const info = SUIT_INFO[card.suit];
  const animClass = popDir ? `pop-${popDir}` : "pop";
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`card-piece ${animClass} ${disabled ? "" : onClick ? "card-hover" : ""} ${highlight ? "card-highlight" : ""} ${isTrump ? "card-trump" : ""}`}
      style={{
        width: small ? 36 : 48,
        height: small ? 52 : 68,
        opacity: faded ? 0.3 : 1,
        cursor: disabled ? "default" : onClick ? "pointer" : "default",
      }}
      aria-label={`${card.rank} of ${info.name}`}
    >
      {isTrump && <span className="trump-dot" />}
      <span className={`card-rank ${info.red ? "text-red" : "text-dark"}`} style={{ fontSize: small ? 11 : 14 }}>
        {card.rank}
      </span>
      <span className={`card-suit ${info.red ? "text-red" : "text-dark"}`} style={{ fontSize: small ? 14 : 18 }}>
        {info.sym}
      </span>
    </button>
  );
}

// Fanned overlapping card backs — horizontal (top) or vertical (sides)
function FannedCards({ count, vertical = false }: { count: number; vertical?: boolean }) {
  if (count === 0) return <div style={{ width: vertical ? 18 : 32, height: vertical ? 32 : 18 }} />;
  const CW = 18, CH = 26; // card dimensions
  const STEP = 7;          // how much each card peeks out from behind the previous
  const totalW = vertical ? CW : CW + (count - 1) * STEP;
  const totalH = vertical ? CH + (count - 1) * STEP : CH;
  return (
    <div style={{ position: "relative", width: totalW, height: totalH, flexShrink: 0 }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{
          position: "absolute",
          left: vertical ? 0 : i * STEP,
          top: vertical ? i * STEP : 0,
          width: CW, height: CH,
          borderRadius: 3,
          background: "var(--game-card-back)",
          border: "1px solid var(--game-card-border)",
          zIndex: i,
        }} />
      ))}
    </div>
  );
}

function PlayerSeat({ name, cardCount, active, layout }: {
  name: string; cardCount: number; active: boolean;
  layout: "top" | "left" | "right";
}) {
  const label = (
    <span style={{
      fontSize: 9, fontWeight: active ? 700 : 400, lineHeight: 1.2,
      color: active ? "var(--game-accent)" : "var(--game-text-2)",
      textAlign: "center", maxWidth: 56, wordBreak: "break-word",
    }}>
      {name}{active ? " ▸" : ""}
    </span>
  );
  const fan = <FannedCards count={cardCount} vertical={layout !== "top"} />;
  if (layout === "top") {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
        {label}{fan}
      </div>
    );
  }
  // left / right — label above, cards below
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
      {label}{fan}
    </div>
  );
}

function Pip({ filled, colorClass }: { filled: boolean; colorClass: string }) {
  return (
    <span className={`pip ${colorClass} ${filled ? "pip-filled" : "pip-empty"}`} />
  );
}

function ScoreCard({ label, wins, total, colorClass, symbol }: {
  label: string; wins: number; total: number; colorClass: string; symbol: string;
}) {
  return (
    <div className="score-card">
      <span className="score-label">{label}</span>
      <div className="score-pips">
        {Array.from({ length: total }).map((_, i) => (
          <Pip key={i} filled={i < wins} colorClass={colorClass} />
        ))}
      </div>
      <span className={`score-sym ${colorClass}`}>{symbol}</span>
    </div>
  );
}

const STORAGE_KEY = "twenty-eight-state-v1";

function loadState(): GameState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...initialState, ...JSON.parse(raw) };
  } catch {}
  return initialState;
}

/* ---------- Main component ---------- */
export default function TwentyEight() {
  const [state, dispatch] = useReducer(reducer, initialState, loadState);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    // On first load, assign Pokémon names only if we're starting fresh
    if (state.phase === "idle" && state.names[1] === initialState.names[1]) {
      const [p1, p2, p3] = pickPokemonNames();
      dispatch({ type: "INIT_NAMES", names: ["You", p1, p2, p3] });
    }
    return () => timers.current.forEach(clearTimeout);
  }, []);

  // Persist state to localStorage on every change
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
  }, [state]);

  const after = (ms: number, fn: () => void) => {
    const id = window.setTimeout(fn, ms);
    timers.current.push(id);
  };

  useEffect(() => {
    if (state.phase === "bidding" && state.bidTurn !== 0 && !state.passed[state.bidTurn])
      after(750, () => dispatch({ type: "AI_BID", playerIdx: state.bidTurn }));
  }, [state.phase, state.bidTurn]);

  useEffect(() => {
    if (state.phase === "choose-trump" && state.caller !== 0)
      after(800, () => dispatch({ type: "AI_CHOOSE_TRUMP" }));
  }, [state.phase, state.caller]);

  useEffect(() => {
    if (state.phase === "playing" && state.trick.length < 4 && state.turn !== 0)
      after(700, () => dispatch({ type: "AI_PLAY", playerIdx: state.turn }));
  }, [state.phase, state.turn, state.trick.length]);

  useEffect(() => {
    if (state.phase === "playing" && state.trick.length === 4)
      after(1200, () => dispatch({ type: "CLEAR_TRICK" }));
  }, [state.trick.length, state.phase]);

  useEffect(() => {
    if (state.banner) {
      const id = state.banner.id;
      after(1500, () => dispatch({ type: "CLEAR_BANNER", id }));
    }
  }, [state.banner]);

  useEffect(() => {
    if (state.moveTip) {
      const id = state.moveTip.id;
      after(3000, () => dispatch({ type: "CLEAR_MOVE_TIP", id }));
    }
  }, [state.moveTip]);

  const userHand = sortHand(state.hands[0] || []);
  const mustFollow = state.leadSuit && userHand.some((c) => c.suit === state.leadSuit);
  const isLegal = (c: Card) => !mustFollow || c.suit === state.leadSuit;
  const userTurn = state.phase === "playing" && state.turn === 0 && state.trick.length < 4;
  const trumpKnown = state.caller === 0 || state.trumpRevealed;
  const voidInLead = state.leadSuit && !userHand.some((c) => c.suit === state.leadSuit);
  const callerTeam = state.caller === null ? null : state.caller % 2;
  const target0 = callerTeam === null ? null : callerTeam === 0 ? state.currentBid : 29 - state.currentBid;
  const target1 = callerTeam === null ? null : callerTeam === 1 ? state.currentBid : 29 - state.currentBid;
  const seat = (idx: number) => state.trick.find((t) => t.player === idx);

  const tn = teamNames(state.names);

  return (
    <div className="game-root">
      <style>{`
        @keyframes popin { from { transform: scale(0.6) translateY(8px); opacity:0; } to { transform: scale(1) translateY(0); opacity:1; } }
        @keyframes popTop { from { transform: translateY(-18px) scale(0.7); opacity:0; } to { transform: translateY(0) scale(1); opacity:1; } }
        @keyframes popBottom { from { transform: translateY(18px) scale(0.7); opacity:0; } to { transform: translateY(0) scale(1); opacity:1; } }
        @keyframes popLeft { from { transform: translateX(-18px) scale(0.7); opacity:0; } to { transform: translateX(0) scale(1); opacity:1; } }
        @keyframes popRight { from { transform: translateX(18px) scale(0.7); opacity:0; } to { transform: translateX(0) scale(1); opacity:1; } }
        @keyframes bannerIn { 0% { opacity:0; transform:translateY(10px) scale(0.88); } 12% { opacity:1; transform:translateY(0) scale(1); } 80% { opacity:1; } 100% { opacity:0; transform:translateY(-6px); } }
        @keyframes tipIn { 0% { opacity:0; transform:translateY(5px); } 10% { opacity:1; transform:translateY(0); } 85% { opacity:1; } 100% { opacity:0; } }
        .pop { animation: popin .2s ease-out; }
        .pop-top { animation: popTop .28s ease-out; }
        .pop-bottom { animation: popBottom .28s ease-out; }
        .pop-left { animation: popLeft .28s ease-out; }
        .pop-right { animation: popRight .28s ease-out; }
        .banner-anim { animation: bannerIn 1.5s ease-in-out forwards; }
        .tip-anim { animation: tipIn 3s ease-in-out forwards; }

        .game-root {
          min-height: 100dvh;
          display: flex;
          flex-direction: column;
          background: var(--game-bg);
          color: var(--game-text);
          font-family: 'Inter Variable', 'Inter', ui-sans-serif, system-ui, sans-serif;
          --game-bg: rgb(255,252,245);
          --game-text: rgb(33,33,33);
          --game-text-2: rgb(117,117,117);
          --game-border: rgb(220,215,208);
          --game-card-bg: #fff;
          --game-card-border: rgb(210,205,198);
          --game-card-back: rgb(235,232,226);
          --game-accent: rgb(0,102,204);
          --game-accent-text: #fff;
          --game-red: rgb(185,28,28);
          --game-surface: rgba(0,0,0,0.04);
          --game-surface-2: rgba(0,0,0,0.07);
          --game-trump-dot: rgb(0,102,204);
          --game-banner-bg: rgba(255,252,245,0.96);
          --game-banner-trump: rgb(0,102,204);
          --game-banner-match: rgb(33,33,33);
          --game-tip-bg: rgba(0,102,204,0.08);
          --game-tip-border: rgba(0,102,204,0.2);
          --game-tip-text: rgb(0,102,204);
          --game-btn: rgb(33,33,33);
          --game-btn-text: rgb(255,252,245);
          --game-btn-border: rgb(33,33,33);
          --game-pass-border: rgb(180,175,168);
          --game-pass-text: rgb(117,117,117);
          --game-suit-red: rgb(185,28,28);
        }
        :root.dark .game-root {
          --game-bg: rgb(22,20,18);
          --game-text: rgb(245,240,230);
          --game-text-2: rgb(160,155,148);
          --game-border: rgb(55,50,45);
          --game-card-bg: rgb(38,34,30);
          --game-card-border: rgb(70,64,58);
          --game-card-back: rgb(45,40,36);
          --game-accent: rgb(77,159,255);
          --game-accent-text: rgb(22,20,18);
          --game-red: rgb(248,113,113);
          --game-surface: rgba(255,255,255,0.04);
          --game-surface-2: rgba(255,255,255,0.08);
          --game-trump-dot: rgb(77,159,255);
          --game-banner-bg: rgba(22,20,18,0.96);
          --game-banner-trump: rgb(77,159,255);
          --game-banner-match: rgb(245,240,230);
          --game-tip-bg: rgba(77,159,255,0.1);
          --game-tip-border: rgba(77,159,255,0.25);
          --game-tip-text: rgb(77,159,255);
          --game-btn: rgb(245,240,230);
          --game-btn-text: rgb(22,20,18);
          --game-btn-border: rgb(245,240,230);
          --game-pass-border: rgb(80,75,70);
          --game-pass-text: rgb(140,135,128);
          --game-suit-red: rgb(248,113,113);
        }

        /* Cards */
        .card-piece {
          position: relative;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          border-radius: 6px;
          background: var(--game-card-bg);
          border: 1.5px solid var(--game-card-border);
          box-shadow: 0 1px 3px rgba(0,0,0,0.08);
          transition: transform 0.12s, box-shadow 0.12s, border-color 0.12s;
          outline: none;
          gap: 1px;
        }
        .card-hover:hover { transform: translateY(-4px); box-shadow: 0 4px 12px rgba(0,0,0,0.12); }
        .card-hover:active { transform: translateY(-2px); }
        .card-highlight { border-color: var(--game-accent); }
        .card-trump { border-color: var(--game-trump-dot); }
        .trump-dot {
          position: absolute; top: 3px; right: 3px;
          width: 5px; height: 5px; border-radius: 50%;
          background: var(--game-trump-dot);
        }
        .card-rank { font-weight: 700; line-height: 1; }
        .card-suit { line-height: 1; }
        .text-red { color: var(--game-red); }
        .text-dark { color: var(--game-text); }
        .card-back {
          border-radius: 4px;
          background: var(--game-card-back);
          border: 1.5px solid var(--game-card-border);
        }

        /* Score */
        .score-card { display: flex; flex-direction: column; align-items: center; gap: 3px; }
        .score-label { font-size: 10px; color: var(--game-text-2); text-align: center; max-width: 80px; line-height: 1.3; }
        .score-pips { display: flex; gap: 3px; align-items: center; }
        .pip { display: inline-block; width: 6px; height: 6px; border-radius: 50%; }
        .pip.pip-filled.text-red { background: var(--game-red); }
        .pip.pip-filled.text-dark { background: var(--game-text); }
        .pip.pip-empty { background: transparent; border: 1.5px solid var(--game-border); }
        .score-sym { font-size: 14px; line-height: 1; }

        /* Buttons */
        .btn-primary {
          background: var(--game-btn);
          color: var(--game-btn-text);
          border: none;
          border-radius: 8px;
          padding: 10px 20px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: opacity 0.15s;
          font-family: inherit;
        }
        .btn-primary:hover { opacity: 0.82; }
        .btn-primary:active { opacity: 0.7; }
        .btn-primary:disabled { opacity: 0.35; cursor: default; }

        .btn-outline {
          background: transparent;
          color: var(--game-text);
          border: 1.5px solid var(--game-pass-border);
          border-radius: 8px;
          padding: 9px 18px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: opacity 0.15s, border-color 0.15s;
          font-family: inherit;
          color: var(--game-pass-text);
        }
        .btn-outline:hover { border-color: var(--game-text-2); opacity: 0.9; }

        .btn-ghost {
          background: transparent;
          color: var(--game-text-2);
          border: none;
          padding: 4px 8px;
          font-size: 11px;
          cursor: pointer;
          font-family: inherit;
          transition: color 0.12s;
        }
        .btn-ghost:hover { color: var(--game-text); }

        .btn-trump-ask {
          background: var(--game-accent);
          color: var(--game-accent-text);
          border: none;
          border-radius: 20px;
          padding: 5px 12px;
          font-size: 11px;
          font-weight: 600;
          cursor: pointer;
          font-family: inherit;
          transition: opacity 0.15s;
        }
        .btn-trump-ask:hover { opacity: 0.85; }

        .suit-btn {
          width: 48px; height: 48px;
          border-radius: 10px;
          background: var(--game-card-bg);
          border: 1.5px solid var(--game-card-border);
          font-size: 22px;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: border-color 0.12s, transform 0.1s;
        }
        .suit-btn:hover { border-color: var(--game-accent); transform: scale(1.05); }

        /* Dividers and surfaces */
        .surface { background: var(--game-surface); border-radius: 10px; }
        .divider { height: 1px; background: var(--game-border); }

        /* Banner */
        .banner-wrap {
          position: absolute; inset: 0;
          display: flex; align-items: center; justify-content: center;
          pointer-events: none; z-index: 50;
        }
        .banner-box {
          background: var(--game-banner-bg);
          border: 1px solid var(--game-border);
          border-radius: 12px;
          padding: 12px 24px;
          text-align: center;
          box-shadow: 0 8px 32px rgba(0,0,0,0.12);
        }
        .banner-text { font-size: 16px; font-weight: 700; }

        /* Tip */
        .tip-box {
          border-radius: 8px;
          padding: 8px 12px;
          font-size: 12px;
          background: var(--game-tip-bg);
          border: 1px solid var(--game-tip-border);
          color: var(--game-tip-text);
        }

        /* Table */
        .trick-grid {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          grid-template-rows: 1fr 1fr 1fr;
          grid-template-areas: ". top ." "left mid right" ". bottom .";
        }
        .trick-cell { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px; }

        /* Scoreboard inline */
        .pts-bar { font-size: 11px; color: var(--game-text-2); }

        /* Game header */
        .game-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 12px 16px 8px;
          border-bottom: 1px solid var(--game-border);
        }
        .game-title { font-size: 20px; font-weight: 700; letter-spacing: -0.5px; }
        .header-actions { display: flex; gap: 4px; align-items: center; }

        /* Player labels */
        .player-name { font-size: 10px; color: var(--game-text-2); text-align: center; }
        .player-name.active-turn { color: var(--game-accent); font-weight: 600; }

        /* Table area */
        .table-area {
          flex: 1;
          display: flex;
          flex-direction: column;
          position: relative;
          padding: 12px;
          gap: 8px;
        }

        /* Bottom controls */
        .bottom-area {
          padding: 12px 16px 16px;
          border-top: 1px solid var(--game-border);
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        /* Idle screen */
        .idle-screen {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 32px 24px;
          text-align: center;
          gap: 12px;
        }

        /* Log */
        .log-line { font-size: 10px; color: var(--game-text-2); line-height: 1.5; }
        .log-line:first-child { color: var(--game-text); }

        @media (min-width: 600px) {
          .game-root { max-width: 480px; margin: 0 auto; min-height: 100vh; border-left: 1px solid var(--game-border); border-right: 1px solid var(--game-border); }
        }
      `}</style>

      {/* Header */}
      <div className="game-header">
        <span className="game-title">29</span>
        <div className="header-actions">
          <button className="btn-ghost" onClick={() => dispatch({ type: "TOGGLE_FEEDBACK" })}>
            Tips {state.feedbackOn ? "on" : "off"}
          </button>
          <button className="btn-ghost" onClick={() => dispatch({ type: "TOGGLE_HALF_BID" })}>
            ½-bid {state.halfBidPenaltyOn ? "on" : "off"}
          </button>
          {state.phase !== "idle" && (
            <button className="btn-ghost" style={{ color: "var(--game-red)", opacity: 0.7 }}
              onClick={() => {
                try { localStorage.removeItem(STORAGE_KEY); } catch {}
                const [p1, p2, p3] = pickPokemonNames();
                dispatch({ type: "RESET" });
                dispatch({ type: "INIT_NAMES", names: ["You", p1, p2, p3] });
              }}>
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Idle / start screen */}
      {state.phase === "idle" && (
        <div className="idle-screen">
          <div style={{ fontSize: 48, lineHeight: 1 }}>🃏</div>
          <div>
            <p style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>28</p>
            <p style={{ fontSize: 13, color: "var(--game-text-2)", maxWidth: 280, margin: "0 auto 16px" }}>
              A trick-taking card game for two pairs. 28 points up for grabs each hand.
            </p>
          </div>
          <button className="btn-primary" style={{ fontSize: 16, padding: "14px 36px" }} onClick={() => dispatch({ type: "DEAL" })}>
            Deal
          </button>
          <div style={{ marginTop: 20, fontSize: 11, color: "var(--game-text-2)", lineHeight: 1.7, maxWidth: 300 }}>
            <p><strong>Ranks</strong> (high→low): J·9·A·10·K·Q·8·7 &nbsp;|&nbsp; <strong>Points</strong>: J=3, 9=2, A=1, 10=1</p>
            <p><strong>Bid</strong> how many points your pair will take. Highest bidder picks trump secretly.</p>
            <p>When void in led suit, you may ask to reveal trump.</p>
          </div>
        </div>
      )}

      {/* Active game */}
      {state.phase !== "idle" && (
        <>
          {/* Score bar */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 16px", borderBottom: "1px solid var(--game-border)" }}>
            <ScoreCard label={tn[0]} wins={state.handsWon[0]} total={MATCH_TARGET} colorClass="text-red" symbol="♥" />
            <div style={{ textAlign: "center" }}>
              {trumpKnown && state.trumpSuit ? (
                <span style={{ fontSize: 12, fontWeight: 600, color: SUIT_INFO[state.trumpSuit].red ? "var(--game-red)" : "var(--game-text)" }}>
                  {SUIT_INFO[state.trumpSuit].sym} {SUIT_INFO[state.trumpSuit].name}
                </span>
              ) : (
                <span style={{ fontSize: 11, color: "var(--game-text-2)" }}>trump 🔒</span>
              )}
              {state.phase === "playing" && callerTeam !== null && (
                <div className="pts-bar" style={{ marginTop: 2 }}>
                  {tn[0]} {state.teamPoints[0]}/{target0} · {tn[1]} {state.teamPoints[1]}/{target1}
                </div>
              )}
            </div>
            <ScoreCard label={tn[1]} wins={state.handsWon[1]} total={MATCH_TARGET} colorClass="text-dark" symbol="♠" />
          </div>

          {/* Table area */}
          <div className="table-area">
            {/* Banner */}
            {state.banner && (
              <div key={state.banner.id} className="banner-wrap">
                <div className="banner-anim banner-box">
                  <div className="banner-text" style={{ color: state.banner.kind === "trump" ? "var(--game-banner-trump)" : "var(--game-banner-match)" }}>
                    {state.banner.text}
                  </div>
                </div>
              </div>
            )}

            {/* Table: 3-row layout — partner top, trick middle, player label bottom */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, flex: 1, justifyContent: "center" }}>

              {/* Partner (top) */}
              <PlayerSeat
                name={state.names[2]}
                cardCount={state.hands[2].length}
                active={state.phase === "playing" && state.turn === 2}
                layout="top"
              />

              {/* Middle row: left · trick · right */}
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <PlayerSeat
                  name={state.names[1]}
                  cardCount={state.hands[1].length}
                  active={state.phase === "playing" && state.turn === 1}
                  layout="left"
                />

                {/* Trick area */}
                <div className="trick-grid" style={{ width: 140, height: 140, flexShrink: 0 }}>
                  {[
                    { idx: 2, area: "top", dir: "top" },
                    { idx: 1, area: "left", dir: "left" },
                    { idx: 3, area: "right", dir: "right" },
                    { idx: 0, area: "bottom", dir: "bottom" },
                  ].map(({ idx, area, dir }) => {
                    const entry = seat(idx);
                    return (
                      <div key={idx} style={{ gridArea: area }} className="trick-cell">
                        <div style={{ width: 34, height: 48, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          {entry ? <PlayingCard card={entry.card} small popDir={dir} /> : null}
                        </div>
                      </div>
                    );
                  })}
                  <div style={{ gridArea: "mid", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: 10, color: "var(--game-border)" }}>◇</span>
                  </div>
                </div>

                <PlayerSeat
                  name={state.names[3]}
                  cardCount={state.hands[3].length}
                  active={state.phase === "playing" && state.turn === 3}
                  layout="right"
                />
              </div>
            </div>

            {/* Log */}
            <div style={{ marginTop: "auto" }}>
              {state.log.slice(0, 3).map((msg, i) => (
                <p key={i} className="log-line">{msg}</p>
              ))}
            </div>
          </div>

          {/* Bottom controls */}
          <div className="bottom-area">
            {/* Move tip */}
            {state.moveTip && (
              <div key={state.moveTip.id} className="tip-anim tip-box">
                {state.moveTip.text}
              </div>
            )}

            {/* Bidding — my turn */}
            {state.phase === "bidding" && state.bidTurn === 0 && !state.passed[0] && (
              <div>
                <p style={{ fontSize: 12, color: "var(--game-text-2)", marginBottom: 8 }}>
                  {state.highBidder !== null && state.highBidder !== 0
                    ? <>Respond to <strong style={{ color: "var(--game-text)" }}>{state.currentBid}</strong> — match, raise, or pass</>
                    : state.mustRaise
                    ? <>You were matched at <strong style={{ color: "var(--game-text)" }}>{state.currentBid}</strong> — raise or pass</>
                    : <>Open the bidding — minimum 17</>}
                </p>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {(() => {
                    // can match if: there's an existing bid AND it wasn't us who bid last AND mustRaise is false
                    const canMatch = state.highBidder !== null && state.highBidder !== 0 && !state.mustRaise;
                    const minBid = canMatch ? state.currentBid : state.currentBid + 1;
                    // show up to 3 bid options
                    const options = [0, 1, 2].map((extra) => Math.min(28, minBid + extra));
                    const unique = [...new Set(options)];
                    return unique.map((amt, i) => (
                      <button key={amt} className="btn-primary"
                        onClick={() => dispatch({ type: "BID", playerIdx: 0, amount: amt })}
                        style={{ fontSize: 13, padding: "8px 16px" }}>
                        {i === 0 && canMatch ? `Match ${amt}` : `Bid ${amt}`}
                      </button>
                    ));
                  })()}
                  <button className="btn-outline" onClick={() => dispatch({ type: "PASS", playerIdx: 0 })}>
                    Pass
                  </button>
                </div>
              </div>
            )}

            {/* Bidding — AI's turn in my pair */}
            {state.phase === "bidding" && state.bidTurn !== 0 && !state.passed[0]
              && (state.bidOrder[0] === 0 || state.bidOrder[1] === 0) && (
              <p style={{ fontSize: 12, color: "var(--game-text-2)" }}>
                {state.names[state.bidTurn]} is deciding…
              </p>
            )}

            {/* Bidding — waiting to enter */}
            {state.phase === "bidding" && !state.passed[0]
              && state.bidOrder.indexOf(0) > 1 && (
              <p style={{ fontSize: 12, color: "var(--game-text-2)" }}>
                Watching {state.names[state.bidOrder[0]]} vs {state.names[state.bidOrder[1]]}
                {state.currentBid > 16 ? ` at ${state.currentBid}` : ""}…
              </p>
            )}

            {/* Choose trump */}
            {state.phase === "choose-trump" && state.caller === 0 && (
              <div>
                <p style={{ fontSize: 12, color: "var(--game-text-2)", marginBottom: 8 }}>
                  You won the bid at {state.currentBid}. Pick your secret trump:
                </p>
                <div style={{ display: "flex", gap: 8 }}>
                  {SUITS.map((s) => (
                    <button key={s} className="suit-btn"
                      style={{ color: SUIT_INFO[s].red ? "var(--game-red)" : "var(--game-text)" }}
                      onClick={() => dispatch({ type: "CHOOSE_TRUMP", suit: s })}>
                      {SUIT_INFO[s].sym}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Waiting on AI trump choice */}
            {state.phase === "choose-trump" && state.caller !== 0 && (
              <p style={{ fontSize: 12, color: "var(--game-text-2)" }}>{state.names[state.caller!]} is picking trump…</p>
            )}

            {/* Your hand during play */}
            {(state.phase === "playing" || state.phase === "bidding" || state.phase === "choose-trump") && userHand.length > 0 && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <span style={{ fontSize: 11, color: "var(--game-text-2)" }}>
                    {userTurn ? "Your turn — tap a card" : "Your hand"}
                  </span>
                  {userTurn && voidInLead && !trumpKnown && (
                    <button className="btn-trump-ask" onClick={() => dispatch({ type: "ASK_TRUMP", playerIdx: 0 })}>
                      Ask trump
                    </button>
                  )}
                </div>
                <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                  {userHand.map((c) => (
                    <PlayingCard key={c.id} card={c}
                      disabled={!userTurn || !isLegal(c)}
                      faded={userTurn && !isLegal(c)}
                      highlight={userTurn && isLegal(c)}
                      isTrump={trumpKnown && c.suit === state.trumpSuit}
                      onClick={userTurn && isLegal(c) ? () => dispatch({ type: "PLAY_CARD", playerIdx: 0, card: c }) : undefined}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Hand end */}
            {state.phase === "hand-end" && state.lastResult && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {state.lastResult.matchOver && (
                  <p style={{ fontWeight: 700, fontSize: 15, textAlign: "center" }}>
                    🏆 {tn[state.lastResult.winningTeam]} win the match!
                  </p>
                )}
                <p style={{ fontSize: 13 }}>
                  {tn[state.lastResult.callerTeam]} bid {state.lastResult.bid}, scored {state.lastResult.callerPts}.{" "}
                  <strong>{tn[state.lastResult.winningTeam]}</strong> win the hand
                  {state.lastResult.pointsAwarded > 1 ? " (double — under half)" : ""}.
                </p>

                {state.feedbackOn && state.lastResult.tips.length > 0 && (
                  <div className="tip-box" style={{ fontSize: 11 }}>
                    <p style={{ fontWeight: 600, marginBottom: 4 }}>Your plays this hand:</p>
                    <ul style={{ paddingLeft: 14, margin: 0, display: "flex", flexDirection: "column", gap: 2 }}>
                      {state.lastResult.tips.slice(0, 4).map((t, i) => <li key={i}>{t}</li>)}
                    </ul>
                  </div>
                )}

                <div style={{ display: "flex", gap: 8 }}>
                  <button className="btn-primary"
                    onClick={() => dispatch({ type: state.lastResult!.matchOver ? "NEW_MATCH" : "DEAL" })}
                    style={{ flex: 1 }}>
                    {state.lastResult.matchOver ? "New Match" : "Next Hand"}
                  </button>
                  {state.lastResult.matchOver && (
                    <button className="btn-outline"
                      onClick={() => dispatch({ type: "NEW_MATCH" })}>
                      Rematch
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
