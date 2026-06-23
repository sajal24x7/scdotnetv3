import React, { useReducer, useEffect, useRef, useState } from "react";

/* ---------- Card data ---------- */
const SUITS = ["S", "H", "D", "C"];
const SUIT_INFO = {
  S: { sym: "♠", color: "#1c1f1d", name: "Spades" },
  C: { sym: "♣", color: "#1c1f1d", name: "Clubs" },
  H: { sym: "♥", color: "#9a2b3a", name: "Hearts" },
  D: { sym: "♦", color: "#9a2b3a", name: "Diamonds" },
};
const RANK_ORDER = ["J", "9", "A", "10", "K", "Q", "8", "7"]; // high to low
const POINTS: Record<string, number> = { J: 3, 9: 2, A: 1, "10": 1, K: 0, Q: 0, "8": 0, "7": 0 };
const DEFAULT_NAMES = ["You", "Niraj", "Partner", "Smita"];
const MATCH_TARGET = 6;
function teamNames(names: string[]) {
  return { 0: `${names[0]} & ${names[2]}`, 1: `${names[1]} & ${names[3]}` };
}
const rankIdx = (r: string) => RANK_ORDER.indexOf(r);

type Card = { suit: string; rank: string; id: string };
type TrickEntry = { player: number; card: Card };

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
function cardBeats(a: Card, b: Card, leadSuit: string, trumpSuit: string) {
  const aTrump = a.suit === trumpSuit;
  const bTrump = b.suit === trumpSuit;
  if (aTrump && !bTrump) return true;
  if (!aTrump && bTrump) return false;
  if (aTrump && bTrump) return rankIdx(a.rank) < rankIdx(b.rank);
  if (a.suit === leadSuit && b.suit === leadSuit) return rankIdx(a.rank) < rankIdx(b.rank);
  if (a.suit === leadSuit && b.suit !== leadSuit) return true;
  return false;
}
function trickWinner(trick: TrickEntry[], leadSuit: string, trumpSuit: string) {
  let best = trick[0];
  for (const t of trick.slice(1)) {
    if (cardBeats(t.card, best.card, leadSuit, trumpSuit)) best = t;
  }
  return best.player;
}

/* ---------- Move feedback ---------- */
function evaluateMove(card: Card, beforeState: GameState, trumpKnownToUser: boolean) {
  const hand = beforeState.hands[0];
  const leadSuit = beforeState.leadSuit;
  const trick = beforeState.trick;
  const trumpSuit = beforeState.trumpSuit!;
  let legal = leadSuit ? hand.filter((c) => c.suit === leadSuit) : hand;
  if (legal.length === 0) legal = hand;
  if (legal.length <= 1) return null;

  if (trick.length === 0) {
    if (card.suit === trumpSuit) {
      return "Leading trump shows it to the whole table right away. Fine if you wanted control of the trick, but it also gives up the secret.";
    }
    return null;
  }

  const currentBest = trick.reduce(
    (best, t) => (cardBeats(t.card, best.card, leadSuit!, trumpSuit) ? t : best),
    trick[0]
  );
  const wins = (c: Card) => cardBeats(c, currentBest.card, leadSuit!, trumpSuit);
  const playedWins = wins(card);
  const winners = legal.filter(wins);
  const isVoid = leadSuit && !hand.some((c) => c.suit === leadSuit);

  if (isVoid) {
    const cheaper = legal.filter((c) => POINTS[c.rank] < POINTS[card.rank]);
    if (POINTS[card.rank] > 0 && cheaper.length > 0) {
      return `That discard gave away ${POINTS[card.rank]} point${POINTS[card.rank] > 1 ? "s" : ""}. A zero-point card was free to let go instead.`;
    }
    if (trumpKnownToUser && !playedWins && card.suit !== trumpSuit) {
      const trumpWinner = winners.find((c) => c.suit === trumpSuit);
      if (trumpWinner) {
        return `You could have trumped in with ${trumpWinner.rank}${SUIT_INFO[trumpWinner.suit as keyof typeof SUIT_INFO].sym} to take this trick instead.`;
      }
    }
    return null;
  }

  if (playedWins) {
    const lesserWinner = winners.find((c) => c.id !== card.id && cardBeats(card, c, leadSuit!, trumpSuit));
    if (lesserWinner) {
      return `You won with more card than you needed. ${lesserWinner.rank}${SUIT_INFO[lesserWinner.suit as keyof typeof SUIT_INFO].sym} would have taken this trick too, keeping ${card.rank}${SUIT_INFO[card.suit as keyof typeof SUIT_INFO].sym} in reserve.`;
    }
    return null;
  }

  if (winners.length > 0) {
    const alt = winners[0];
    return `This trick was there for the taking. ${alt.rank}${SUIT_INFO[alt.suit as keyof typeof SUIT_INFO].sym} would have won it.`;
  }
  return null;
}
function nextActive(from: number, passed: boolean[]) {
  let p = (from + 1) % 4;
  let guard = 0;
  while (passed[p] && guard < 8) {
    p = (p + 1) % 4;
    guard++;
  }
  return p;
}

/* ---------- AI heuristics ---------- */
function handStrength(hand: Card[]) {
  const pts = hand.reduce((s, c) => s + POINTS[c.rank], 0);
  const bySuit: Record<string, number> = {};
  hand.forEach((c) => (bySuit[c.suit] = (bySuit[c.suit] || 0) + 1));
  const longest = Math.max(...Object.values(bySuit));
  return pts + longest * 1.4;
}
function aiBidDecision(hand: Card[], currentBid: number, playerIdx: number) {
  const strength = handStrength(hand);
  const willingTo = Math.min(28, 13 + Math.round(strength * 1.15) + (Math.random() < 0.3 ? 1 : 0));
  if (currentBid + 1 <= willingTo && currentBid < 28) {
    const jump = Math.random() < 0.25 ? 2 : 1;
    return Math.min(willingTo, currentBid + jump, 28);
  }
  return null;
}
function aiChooseTrump(hand: Card[]) {
  const bySuit: Record<string, { pts: number; count: number }> = {};
  SUITS.forEach((s) => (bySuit[s] = { pts: 0, count: 0 }));
  hand.forEach((c) => {
    bySuit[c.suit].pts += POINTS[c.rank];
    bySuit[c.suit].count += 1;
  });
  let best = SUITS[0];
  let bestScore = -1;
  SUITS.forEach((s) => {
    const score = bySuit[s].pts * 1.5 + bySuit[s].count;
    if (score > bestScore) {
      bestScore = score;
      best = s;
    }
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

  const currentBestEntry = trick.reduce((best, t) =>
    cardBeats(t.card, best.card, leadSuit!, trumpSuit!) ? t : best, trick[0]);
  const partnerWinning = currentBestEntry.player % 2 === playerIdx % 2;

  const winners = legal.filter((c) => cardBeats(c, currentBestEntry.card, leadSuit!, trumpSuit!));

  if (!partnerWinning && winners.length > 0) {
    const weighted = [...winners].sort((a, b) => {
      const aw = a.suit === trumpSuit ? 100 - rankIdx(a.rank) : 50 - rankIdx(a.rank);
      const bw = b.suit === trumpSuit ? 100 - rankIdx(b.rank) : 50 - rankIdx(b.rank);
      return aw - bw;
    });
    return weighted[0];
  }
  const sorted = [...legal].sort((a, b) => POINTS[a.rank] - POINTS[b.rank]);
  return sorted[0];
}

/* ---------- State types ---------- */
type Banner = { id: number; text: string; kind: string } | null;
type MoveTip = { id: number; text: string } | null;
type LastResult = {
  callerTeam: number;
  made: boolean;
  bid: number;
  callerPts: number;
  defTeam: number;
  defPts: number;
  winningTeam: number;
  tips: string[];
  underHalf: boolean;
  pointsAwarded: number;
  matchOver: boolean;
} | null;

type GameState = {
  phase: string;
  dealer: number;
  hands: Card[][];
  restDeck: Card[];
  bidTurn: number;
  currentBid: number;
  highBidder: number | null;
  passed: boolean[];
  caller: number | null;
  trumpSuit: string | null;
  trumpRevealed: boolean;
  trick: TrickEntry[];
  leadSuit: string | null;
  turn: number;
  teamPoints: Record<number, number>;
  handsWon: Record<number, number>;
  tricksPlayed: number;
  log: string[];
  lastResult: LastResult;
  lastTrickWinner?: number;
  round: number;
  bannerSeq: number;
  banner: Banner;
  names: string[];
  feedbackOn: boolean;
  halfBidPenaltyOn: boolean;
  moveTipSeq: number;
  moveTip: MoveTip;
  handTips: string[];
};

type Action =
  | { type: "START"; names: string[] }
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
  | { type: "NEW_MATCH" };

/* ---------- Reducer ---------- */
const initialState: GameState = {
  phase: "start",
  dealer: 3,
  hands: [[], [], [], []],
  restDeck: [],
  bidTurn: 0,
  currentBid: 13,
  highBidder: null,
  passed: [false, false, false, false],
  caller: null,
  trumpSuit: null,
  trumpRevealed: false,
  trick: [],
  leadSuit: null,
  turn: 0,
  teamPoints: { 0: 0, 1: 0 },
  handsWon: { 0: 0, 1: 0 },
  tricksPlayed: 0,
  log: ["Welcome! Enter player names to start."],
  lastResult: null,
  round: 0,
  bannerSeq: 0,
  banner: null,
  names: DEFAULT_NAMES,
  feedbackOn: true,
  halfBidPenaltyOn: true,
  moveTipSeq: 0,
  moveTip: null,
  handTips: [],
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

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case "START": {
      return reducer({ ...state, names: action.names }, { type: "DEAL" });
    }
    case "DEAL": {
      const deck = shuffle(makeDeck());
      const hands: Card[][] = [[], [], [], []];
      for (let i = 0; i < 16; i++) hands[i % 4].push(deck[i]);
      const restDeck = deck.slice(16);
      const dealer = state.phase === "start" ? state.dealer : (state.dealer + 1) % 4;
      const bidTurn = (dealer + 1) % 4;
      const round = state.round + 1;
      let s: GameState = {
        ...state,
        phase: "bidding",
        dealer,
        hands,
        restDeck,
        bidTurn,
        currentBid: 13,
        highBidder: null,
        passed: [false, false, false, false],
        caller: null,
        trumpSuit: null,
        trumpRevealed: false,
        trick: [],
        leadSuit: null,
        tricksPlayed: 0,
        teamPoints: { 0: 0, 1: 0 },
        lastResult: null,
        round,
        handTips: [],
      };
      s = addLog(s, `New hand dealt. ${state.names[bidTurn]} bids first.`);
      s = showBanner(s, `Round ${round}`, "round");
      return s;
    }
    case "BID": {
      const { playerIdx, amount } = action;
      let s: GameState = { ...state, currentBid: amount, highBidder: playerIdx };
      s = addLog(s, `${state.names[playerIdx]} bids ${amount}.`);
      const remaining = s.passed.filter((p) => !p).length;
      if (remaining === 1) {
        s.caller = playerIdx;
        s.phase = "choose-trump";
        s = addLog(s, `${state.names[playerIdx]} wins the bid at ${amount} and will pick trump.`);
        return s;
      }
      s.bidTurn = nextActive(playerIdx, s.passed);
      return s;
    }
    case "PASS": {
      const { playerIdx } = action;
      const passed = [...state.passed];
      passed[playerIdx] = true;
      let s = addLog({ ...state, passed }, `${state.names[playerIdx]} passes.`);
      const remaining = passed.filter((p) => !p).length;
      if (remaining === 1) {
        const last = passed.findIndex((p) => !p);
        const finalBid = state.highBidder === null ? 14 : state.currentBid;
        s.caller = last;
        s.currentBid = finalBid;
        s.phase = "choose-trump";
        s = addLog(s, `${state.names[last]} wins the bid at ${finalBid} and will pick trump.`);
        return s;
      }
      s.bidTurn = nextActive(playerIdx, passed);
      return s;
    }
    case "CHOOSE_TRUMP": {
      const { suit } = action;
      const hands = state.hands.map((h, i) => [...h, ...state.restDeck.filter((_, idx) => idx % 4 === i)]);
      let s: GameState = {
        ...state,
        trumpSuit: suit,
        trumpRevealed: false,
        hands,
        phase: "playing",
        turn: state.caller!,
        leadSuit: null,
        trick: [],
        tricksPlayed: 0,
      };
      s = addLog(
        s,
        state.caller === 0
          ? `You chose ${SUIT_INFO[suit as keyof typeof SUIT_INFO].name} as trump (kept secret).`
          : `${state.names[state.caller!]} has secretly chosen trump.`
      );
      return s;
    }
    case "ASK_TRUMP": {
      const { playerIdx } = action;
      let s: GameState = { ...state, trumpRevealed: true };
      s = addLog(
        s,
        playerIdx === 0
          ? `You ask for trump. It's ${SUIT_INFO[state.trumpSuit! as keyof typeof SUIT_INFO].name}!`
          : `${state.names[playerIdx]} asks for trump. It's ${SUIT_INFO[state.trumpSuit! as keyof typeof SUIT_INFO].name}!`
      );
      s = showBanner(s, `Trump Revealed: ${SUIT_INFO[state.trumpSuit! as keyof typeof SUIT_INFO].sym} ${SUIT_INFO[state.trumpSuit! as keyof typeof SUIT_INFO].name}`, "trump");
      return s;
    }
    case "PLAY_CARD": {
      const { playerIdx, card } = action;
      let tipText: string | null = null;
      if (playerIdx === 0 && state.feedbackOn) {
        const trumpKnownToUser = state.caller === 0 || state.trumpRevealed;
        tipText = evaluateMove(card, state, trumpKnownToUser);
      }
      const hands = state.hands.map((h, i) =>
        i === playerIdx ? h.filter((c) => c.id !== card.id) : h
      );
      const trick = [...state.trick, { player: playerIdx, card }];
      let leadSuit = state.leadSuit;
      if (trick.length === 1) leadSuit = card.suit;
      let trumpRevealed = state.trumpRevealed;
      if (card.suit === state.trumpSuit && !trumpRevealed) trumpRevealed = true;

      let s: GameState = { ...state, hands, trick, leadSuit, trumpRevealed };
      s = addLog(s, `${state.names[playerIdx]} plays ${card.rank}${SUIT_INFO[card.suit as keyof typeof SUIT_INFO].sym}.`);
      if (tipText) s = showMoveTip(s, tipText);
      if (trumpRevealed && state.trumpRevealed === false) {
        s = addLog(s, `Trump revealed: ${SUIT_INFO[state.trumpSuit! as keyof typeof SUIT_INFO].name}!`);
        s = showBanner(s, `Trump Revealed: ${SUIT_INFO[state.trumpSuit! as keyof typeof SUIT_INFO].sym} ${SUIT_INFO[state.trumpSuit! as keyof typeof SUIT_INFO].name}`, "trump");
      }

      if (trick.length === 4) {
        const winner = trickWinner(trick, leadSuit!, state.trumpSuit!);
        const pts = trick.reduce((sum, t) => sum + POINTS[t.card.rank], 0);
        const team = winner % 2;
        const teamPoints = { ...s.teamPoints, [team]: s.teamPoints[team] + pts };
        const tricksPlayed = s.tricksPlayed + 1;
        s = addLog(
          { ...s, teamPoints, tricksPlayed, lastTrickWinner: winner },
          `${state.names[winner]} wins the trick (+${pts} pts). ${teamNames(state.names)[team as 0 | 1]}: ${teamPoints[team]} pts so far.`
        );
      } else {
        s.turn = (playerIdx + 1) % 4;
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
          ...s,
          phase: "hand-end",
          handsWon,
          lastResult: {
            callerTeam,
            made,
            bid: s.currentBid,
            callerPts: s.teamPoints[callerTeam],
            defTeam: 1 - callerTeam,
            defPts: s.teamPoints[1 - callerTeam],
            winningTeam,
            tips: s.handTips,
            underHalf,
            pointsAwarded,
            matchOver,
          },
        };
        s = addLog(
          s,
          made
            ? `${teamNames(state.names)[callerTeam as 0 | 1]} made their bid of ${s.currentBid}! Hand won.`
            : underHalf
            ? `${teamNames(state.names)[callerTeam as 0 | 1]} fell short of ${s.currentBid}, held under half! ${teamNames(state.names)[(1 - callerTeam) as 0 | 1]} win double.`
            : `${teamNames(state.names)[callerTeam as 0 | 1]} fell short of ${s.currentBid}. ${teamNames(state.names)[(1 - callerTeam) as 0 | 1]} win the hand.`
        );
        if (matchOver) {
          s = addLog(s, `${teamNames(state.names)[winningTeam as 0 | 1]} reach ${MATCH_TARGET} game points and win the match!`);
          s = showBanner(s, `${teamNames(state.names)[winningTeam as 0 | 1]} win the match!`, "match");
        }
      }
      return s;
    }
    case "AI_BID": {
      const { playerIdx } = action;
      const decision = aiBidDecision(state.hands[playerIdx], state.currentBid, playerIdx);
      if (decision === null || state.currentBid >= 28) {
        return reducer(state, { type: "PASS", playerIdx });
      }
      return reducer(state, { type: "BID", playerIdx, amount: decision });
    }
    case "AI_CHOOSE_TRUMP": {
      const suit = aiChooseTrump(state.hands[state.caller!]);
      return reducer(state, { type: "CHOOSE_TRUMP", suit });
    }
    case "AI_PLAY": {
      const { playerIdx } = action;
      const hand = state.hands[playerIdx];
      const isVoid = state.leadSuit && !hand.some((c) => c.suit === state.leadSuit);
      let working = state;
      if (isVoid && !state.trumpRevealed && playerIdx !== state.caller) {
        const defending = playerIdx % 2 !== state.caller! % 2;
        const askProb = defending ? 0.7 : 0.3;
        if (Math.random() < askProb) {
          working = reducer(state, { type: "ASK_TRUMP", playerIdx });
        }
      }
      const card = aiPlayCard(playerIdx, working);
      return reducer(working, { type: "PLAY_CARD", playerIdx, card });
    }
    case "CLEAR_BANNER": {
      if (state.banner && state.banner.id === action.id) return { ...state, banner: null };
      return state;
    }
    case "CLEAR_MOVE_TIP": {
      if (state.moveTip && state.moveTip.id === action.id) return { ...state, moveTip: null };
      return state;
    }
    case "TOGGLE_FEEDBACK": {
      return { ...state, feedbackOn: !state.feedbackOn, moveTip: null };
    }
    case "TOGGLE_HALF_BID": {
      return { ...state, halfBidPenaltyOn: !state.halfBidPenaltyOn };
    }
    case "NEW_MATCH": {
      return reducer({ ...state, handsWon: { 0: 0, 1: 0 }, round: 0 }, { type: "DEAL" });
    }
    default:
      return state;
  }
}

/* ---------- UI bits ---------- */
function CardComponent({ card, small, faded, onClick, disabled, highlight, isTrump, popDir }: {
  card: Card; small?: boolean; faded?: boolean; onClick?: () => void;
  disabled?: boolean; highlight?: boolean; isTrump?: boolean; popDir?: string;
}) {
  const info = SUIT_INFO[card.suit as keyof typeof SUIT_INFO];
  const animClass = popDir ? `pop-${popDir}` : "pop";
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`relative flex flex-col items-center justify-center rounded-md border-2 shadow-md select-none transition-transform ${animClass} ${
        disabled ? "" : onClick ? "hover:-translate-y-1" : ""
      }`}
      style={{
        width: small ? 40 : 52,
        height: small ? 56 : 72,
        opacity: faded ? 0.4 : 1,
        backgroundColor: "#fbf6e9",
        borderColor: highlight ? "#c9a227" : "#3a2a1a",
        boxShadow: highlight ? "0 0 0 2px #c9a227" : undefined,
        cursor: disabled ? "default" : onClick ? "pointer" : "default",
      }}
    >
      {isTrump && (
        <span
          className="absolute top-0.5 right-0.5 rounded-full"
          style={{ width: 6, height: 6, background: "#c9a227" }}
        />
      )}
      <span style={{ color: info.color, fontSize: small ? 13 : 16, fontWeight: 700, lineHeight: 1 }}>
        {card.rank}
      </span>
      <span style={{ color: info.color, fontSize: small ? 15 : 20, lineHeight: 1 }}>{info.sym}</span>
    </button>
  );
}

function CardBack({ small }: { small?: boolean }) {
  return (
    <div
      style={{
        width: small ? 26 : 34,
        height: small ? 38 : 48,
        backgroundColor: "#0f3d2e",
        border: "1px solid #c9a227",
      }}
      className="rounded-sm flex items-center justify-center"
    >
      <div style={{ border: "1px solid #c9a227", opacity: 0.6 }} className="w-2/3 h-2/3 rounded-sm" />
    </div>
  );
}

function SixBadge({ filled, colorHex, symbol }: { filled: number; colorHex: string; symbol: string }) {
  return (
    <div className="flex flex-col items-center">
      <div
        style={{
          width: 28,
          height: 40,
          borderRadius: 4,
          backgroundColor: "#fbf6e9",
          border: `2px solid ${colorHex}`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          lineHeight: 1,
        }}
      >
        <span style={{ color: colorHex, fontWeight: 700, fontSize: 12 }}>6</span>
        <span style={{ color: colorHex, fontSize: 13 }}>{symbol}</span>
      </div>
      <div className="flex gap-0.5 mt-0.5">
        {Array.from({ length: MATCH_TARGET }).map((_, i) => (
          <span
            key={i}
            style={{
              width: 5,
              height: 5,
              borderRadius: "50%",
              backgroundColor: i < filled ? colorHex : "transparent",
              border: `1px solid ${colorHex}`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

/* ---------- Name entry form ---------- */
function NameEntryForm({ onStart }: { onStart: (names: string[]) => void }) {
  const [fields, setFields] = useState({
    you: "",
    partner: "",
    opp1: "",
    opp2: "",
  });

  const set = (key: keyof typeof fields) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setFields((f) => ({ ...f, [key]: e.target.value }));

  const handleStart = () => {
    const names = [
      fields.you.trim() || "You",
      fields.opp1.trim() || "Niraj",
      fields.partner.trim() || "Partner",
      fields.opp2.trim() || "Smita",
    ];
    onStart(names);
  };

  const inputStyle: React.CSSProperties = {
    backgroundColor: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(201,162,39,0.5)",
    borderRadius: 6,
    color: "#f3ecd9",
    padding: "6px 10px",
    fontSize: 14,
    width: "100%",
    outline: "none",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 11,
    opacity: 0.65,
    marginBottom: 3,
    display: "block",
  };

  return (
    <div className="w-full max-w-md">
      <p className="text-xs opacity-70 mb-4 text-center">
        Name your players — leave blank for defaults.
      </p>

      <div className="grid grid-cols-2 gap-3 mb-4">
        {/* Team 0: You + Partner */}
        <div
          className="rounded-lg p-3 space-y-3"
          style={{ backgroundColor: "rgba(185,42,74,0.12)", border: "1px solid rgba(185,42,74,0.3)" }}
        >
          <p className="text-xs font-semibold" style={{ color: "#e07a8b" }}>Your team ♥</p>
          <div>
            <label style={labelStyle}>You (seat bottom)</label>
            <input
              style={inputStyle}
              value={fields.you}
              onChange={set("you")}
              placeholder="You"
              maxLength={16}
            />
          </div>
          <div>
            <label style={labelStyle}>Your partner (seat top)</label>
            <input
              style={inputStyle}
              value={fields.partner}
              onChange={set("partner")}
              placeholder="Partner"
              maxLength={16}
            />
          </div>
        </div>

        {/* Team 1: Opponents */}
        <div
          className="rounded-lg p-3 space-y-3"
          style={{ backgroundColor: "rgba(28,31,29,0.3)", border: "1px solid rgba(201,162,39,0.2)" }}
        >
          <p className="text-xs font-semibold" style={{ color: "#e9d9a0" }}>Opponents ♠</p>
          <div>
            <label style={labelStyle}>Opponent (seat left)</label>
            <input
              style={inputStyle}
              value={fields.opp1}
              onChange={set("opp1")}
              placeholder="Niraj"
              maxLength={16}
            />
          </div>
          <div>
            <label style={labelStyle}>Opponent (seat right)</label>
            <input
              style={inputStyle}
              value={fields.opp2}
              onChange={set("opp2")}
              placeholder="Smita"
              maxLength={16}
            />
          </div>
        </div>
      </div>

      <button
        onClick={handleStart}
        className="w-full py-3 rounded-lg font-semibold ge-display text-lg"
        style={{ backgroundColor: "#c9a227", color: "#1c1f1d" }}
      >
        Deal Cards
      </button>
    </div>
  );
}

export default function TwentyEight() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [showRules, setShowRules] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  const after = (ms: number, fn: () => void) => {
    const id = setTimeout(fn, ms);
    timers.current.push(id);
  };

  useEffect(() => {
    if (state.phase === "bidding" && state.bidTurn !== 0 && !state.passed[state.bidTurn]) {
      after(850, () => dispatch({ type: "AI_BID", playerIdx: state.bidTurn }));
    }
  }, [state.phase, state.bidTurn]);

  useEffect(() => {
    if (state.phase === "choose-trump" && state.caller !== 0) {
      after(900, () => dispatch({ type: "AI_CHOOSE_TRUMP" }));
    }
  }, [state.phase, state.caller]);

  useEffect(() => {
    if (state.phase === "playing" && state.trick.length < 4 && state.turn !== 0) {
      after(750, () => dispatch({ type: "AI_PLAY", playerIdx: state.turn }));
    }
  }, [state.phase, state.turn, state.trick.length]);

  useEffect(() => {
    if (state.phase === "playing" && state.trick.length === 4) {
      after(1300, () => dispatch({ type: "CLEAR_TRICK" }));
    }
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

  return (
    <div
      style={{
        background:
          "radial-gradient(ellipse 600px 300px at 50% 0%, rgba(120,170,140,0.10) 0%, transparent 65%), linear-gradient(165deg, #3e2a1a 0%, #2a1a10 45%, #1a0f08 100%)",
        backgroundColor: "#1a0f08",
        minHeight: "100vh",
        fontFamily: "'Inter', system-ui, sans-serif",
        color: "#f3ecd9",
      }}
      className="w-full flex flex-col items-center p-3"
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@600;700&family=Inter:wght@400;500;600;700&display=swap');
        .ge-display { font-family: 'Fraunces', serif; }
        @keyframes popin { from { transform: scale(0.5) translateY(10px); opacity:0;} to { transform: scale(1) translateY(0); opacity:1;} }
        .pop { animation: popin .25s ease-out; }
        @keyframes popTop { from { transform: translateY(-22px) scale(0.7); opacity:0;} to { transform: translateY(0) scale(1); opacity:1;} }
        @keyframes popBottom { from { transform: translateY(22px) scale(0.7); opacity:0;} to { transform: translateY(0) scale(1); opacity:1;} }
        @keyframes popLeft { from { transform: translateX(-22px) scale(0.7); opacity:0;} to { transform: translateX(0) scale(1); opacity:1;} }
        @keyframes popRight { from { transform: translateX(22px) scale(0.7); opacity:0;} to { transform: translateX(0) scale(1); opacity:1;} }
        .pop-top { animation: popTop .3s ease-out; }
        .pop-bottom { animation: popBottom .3s ease-out; }
        .pop-left { animation: popLeft .3s ease-out; }
        .pop-right { animation: popRight .3s ease-out; }
        .game-table { aspect-ratio: 1 / 1; }
        @media (min-width: 768px) { .game-table { aspect-ratio: auto; } }
        @keyframes bannerShow {
          0% { opacity:0; transform: translateY(8px) scale(0.85); }
          14% { opacity:1; transform: translateY(0) scale(1); }
          78% { opacity:1; transform: translateY(0) scale(1); }
          100% { opacity:0; transform: translateY(-6px) scale(0.95); }
        }
        .banner-pop { animation: bannerShow 1.55s ease-in-out forwards; }
        @keyframes tipShow {
          0% { opacity:0; transform: translateY(6px); }
          8% { opacity:1; transform: translateY(0); }
          88% { opacity:1; transform: translateY(0); }
          100% { opacity:0; transform: translateY(-4px); }
        }
        .tip-pop { animation: tipShow 3.2s ease-in-out forwards; }
      `}</style>

      {/* Header */}
      <div className="w-full max-w-md flex items-center justify-between mb-2">
        <div>
          <h1 className="ge-display text-2xl font-bold tracking-tight" style={{ color: "#e9d9a0" }}>
            28
          </h1>
          <p className="text-xs opacity-70 -mt-1">a practice table for two pairs</p>
        </div>
        <div className="flex flex-col gap-1 items-end">
          <button
            onClick={() => setShowRules((v) => !v)}
            className="text-xs px-3 py-1.5 rounded-full"
            style={{ border: "1px solid #c9a227", color: "#e9d9a0" }}
          >
            {showRules ? "Hide rules" : "Rules & tips"}
          </button>
          <button
            onClick={() => dispatch({ type: "TOGGLE_FEEDBACK" })}
            className="text-xs px-3 py-1.5 rounded-full"
            style={{
              border: "1px solid rgba(201,162,39,0.5)",
              color: state.feedbackOn ? "#e9d9a0" : "rgba(243,236,217,0.45)",
            }}
          >
            Move tips: {state.feedbackOn ? "On" : "Off"}
          </button>
          <button
            onClick={() => dispatch({ type: "TOGGLE_HALF_BID" })}
            className="text-xs px-3 py-1.5 rounded-full"
            style={{
              border: "1px solid rgba(201,162,39,0.5)",
              color: state.halfBidPenaltyOn ? "#e9d9a0" : "rgba(243,236,217,0.45)",
            }}
          >
            Under-half double: {state.halfBidPenaltyOn ? "On" : "Off"}
          </button>
        </div>
      </div>

      {showRules && (
        <div
          className="w-full max-w-md rounded-lg p-3 mb-3 text-xs leading-relaxed space-y-2"
          style={{ backgroundColor: "rgba(12,53,39,0.8)", border: "1px solid rgba(201,162,39,0.4)" }}
        >
          <p><strong>Goal:</strong> partnerships of 2, you and your partner against the other pair, fight over 28 points each hand. Card values: J=3, 9=2, A=1, 10=1, others=0.</p>
          <p><strong>Card rank</strong> (high to low): J, 9, A, 10, K, Q, 8, 7. Note this is NOT normal poker order.</p>
          <p><strong>Bidding:</strong> with your first 4 cards, bid how many points your team will win, or pass. Highest bidder ("caller") secretly picks trump.</p>
          <p><strong>Hidden trump:</strong> only the caller knows trump at first. If you can't follow the led suit, you may tap "Ask for trump" to make the caller reveal it, or play on blind and keep the secret a bit longer.</p>
          <p><strong>Tips:</strong> bid high only with several J/9 cards or a long suit. As caller, hold trump back and lead your strongest side suit first. As a defender, weigh asking early for information against staying quiet to protect your own hand's surprises.</p>
          <p><strong>Under-half double:</strong> if defenders hold the bidding team to less than half their bid, that hand counts double in the score.</p>
          <p><strong>Scoring:</strong> each team keeps a red six (game points won) and a black six (points lost to the other side), shown as filled pips. First team to {MATCH_TARGET} wins the match.</p>
        </div>
      )}

      {/* Score + trump bar */}
      <div className="w-full max-w-md flex justify-between items-start text-xs mb-2 px-1">
        <div className="flex flex-col items-center">
          <span className="opacity-80 mb-1">{state.names[0]} & {state.names[2]}</span>
          <div className="flex gap-1.5">
            <SixBadge filled={Math.min(MATCH_TARGET, state.handsWon[0])} colorHex="#b3273a" symbol="♥" />
            <SixBadge filled={Math.min(MATCH_TARGET, state.handsWon[1])} colorHex="#1c1f1d" symbol="♠" />
          </div>
          <span className="mt-1" style={{ fontSize: 10, opacity: 0.55 }}>cards kept by {state.names[2]}</span>
        </div>

        <span className="flex items-center gap-1 mt-1">
          Trump:{" "}
          {trumpKnown && state.trumpSuit ? (
            <strong style={{ color: SUIT_INFO[state.trumpSuit as keyof typeof SUIT_INFO].color === "#9a2b3a" ? "#e07a8b" : "#e9d9a0" }}>
              {SUIT_INFO[state.trumpSuit as keyof typeof SUIT_INFO].sym} {SUIT_INFO[state.trumpSuit as keyof typeof SUIT_INFO].name}
            </strong>
          ) : (
            <strong className="opacity-60">sealed 🔒</strong>
          )}
        </span>

        <div className="flex flex-col items-center">
          <span className="opacity-80 mb-1">{state.names[1]} & {state.names[3]}</span>
          <div className="flex gap-1.5">
            <SixBadge filled={Math.min(MATCH_TARGET, state.handsWon[1])} colorHex="#b3273a" symbol="♦" />
            <SixBadge filled={Math.min(MATCH_TARGET, state.handsWon[0])} colorHex="#1c1f1d" symbol="♣" />
          </div>
          <span className="mt-1" style={{ fontSize: 10, opacity: 0.55 }}>cards kept by {state.names[1]}</span>
        </div>
      </div>

      {/* Table */}
      <div
        style={{
          position: "relative",
          background:
            "radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.07) 0%, transparent 55%), repeating-linear-gradient(45deg, rgba(201,162,39,0.05) 0px, rgba(201,162,39,0.05) 1px, transparent 1px, transparent 13px), repeating-linear-gradient(-45deg, rgba(201,162,39,0.05) 0px, rgba(201,162,39,0.05) 1px, transparent 1px, transparent 13px), radial-gradient(ellipse at center, #15543f 0%, #0d3a2b 65%, #082417 100%)",
          boxShadow: "inset 0 0 36px rgba(0,0,0,0.55), inset 0 0 0 1px rgba(201,162,39,0.12)",
          border: "2px solid rgba(201,162,39,0.5)",
        }}
        className="game-table w-full max-w-md rounded-2xl p-3 flex flex-col justify-between"
      >
        <span className="absolute top-1.5 left-1.5 text-xs" style={{ color: "rgba(201,162,39,0.5)" }}>◆</span>
        <span className="absolute top-1.5 right-1.5 text-xs" style={{ color: "rgba(201,162,39,0.5)" }}>◆</span>
        <span className="absolute bottom-1.5 left-1.5 text-xs" style={{ color: "rgba(201,162,39,0.5)" }}>◆</span>
        <span className="absolute bottom-1.5 right-1.5 text-xs" style={{ color: "rgba(201,162,39,0.5)" }}>◆</span>

        {state.banner && (
          <div
            key={state.banner.id}
            className="banner-pop"
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "none",
              zIndex: 30,
            }}
          >
            <div
              style={{
                backgroundColor:
                  state.banner.kind === "trump"
                    ? "rgba(154,43,58,0.92)"
                    : state.banner.kind === "match"
                    ? "rgba(201,162,39,0.95)"
                    : "rgba(12,53,39,0.92)",
                border: "1px solid #c9a227",
                color: "#f3ecd9",
                boxShadow: "0 6px 24px rgba(0,0,0,0.5)",
                padding: "10px 20px",
                borderRadius: 10,
                textAlign: "center",
              }}
            >
              <div
                className="ge-display font-bold"
                style={{ fontSize: 19, color: state.banner.kind === "match" ? "#1c1f1d" : "#e9d9a0" }}
              >
                {state.banner.text}
              </div>
            </div>
          </div>
        )}

        {/* Partner seat (top) */}
        <div className="flex flex-col items-center">
          <span className="text-xs opacity-80 mb-1">{state.names[2]} (partner){state.phase==='playing' && state.turn===2 ? " ⏳" : ""}</span>
          <div className="flex gap-1">
            {state.hands[2].map((_, i) => <CardBack key={i} small />)}
          </div>
        </div>

        <div className="flex items-center justify-between flex-1">
          {/* opponent: left seat */}
          <div className="flex flex-col items-center">
            <span className="text-xs opacity-80 mb-1">{state.names[1]}{state.phase==='playing' && state.turn===1 ? " ⏳" : ""}</span>
            <div className="flex flex-col gap-1">
              {state.hands[1].map((_, i) => <CardBack key={i} small />)}
            </div>
          </div>

          {/* Center trick */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gridTemplateRows: "1fr 1fr 1fr",
              gridTemplateAreas: `". top ." "left mid right" ". bottom ."`,
              width: "clamp(150px, 46vw, 220px)",
              height: "clamp(150px, 46vw, 220px)",
            }}
          >
            {[
              { idx: 2, area: "top", label: state.names[2], dir: "top" },
              { idx: 1, area: "left", label: state.names[1], dir: "left" },
              { idx: 3, area: "right", label: state.names[3], dir: "right" },
              { idx: 0, area: "bottom", label: state.names[0], dir: "bottom" },
            ].map(({ idx, area, label, dir }) => {
              const entry = seat(idx);
              return (
                <div
                  key={idx}
                  style={{ gridArea: area }}
                  className="flex flex-col items-center justify-center gap-0.5"
                >
                  <div style={{ width: 40, height: 56, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {entry ? <CardComponent card={entry.card} small popDir={dir} /> : null}
                  </div>
                  <span
                    className="text-xs"
                    style={{ color: entry ? "#e9d9a0" : "rgba(243,236,217,0.35)", fontSize: 10 }}
                  >
                    {label}
                  </span>
                </div>
              );
            })}
            <span
              style={{ gridArea: "mid", justifySelf: "center", alignSelf: "center", color: "rgba(201,162,39,0.3)" }}
              className="text-xs"
            >
              ◇
            </span>
          </div>

          {/* opponent: right seat */}
          <div className="flex flex-col items-center">
            <span className="text-xs opacity-80 mb-1">{state.names[3]}{state.phase==='playing' && state.turn===3 ? " ⏳" : ""}</span>
            <div className="flex flex-col gap-1">
              {state.hands[3].map((_, i) => <CardBack key={i} small />)}
            </div>
          </div>
        </div>

        {/* points this hand */}
        <div className="flex justify-center gap-4 text-xs opacity-80" style={{ minHeight: 16 }}>
          {state.phase === "playing" && callerTeam !== null && (
            <>
              <span>
                {state.names[0]} & {state.names[2]}: {state.teamPoints[0]}/{target0}
                {callerTeam === 0 ? " (bid)" : " (need)"}
              </span>
              <span>
                {state.names[1]} & {state.names[3]}: {state.teamPoints[1]}/{target1}
                {callerTeam === 1 ? " (bid)" : " (need)"}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="w-full max-w-md mt-3">
        {state.phase === "start" && (
          <NameEntryForm onStart={(names) => dispatch({ type: "START", names })} />
        )}

        {state.phase === "bidding" && state.bidTurn === 0 && !state.passed[0] && (
          <div className="rounded-lg p-3" style={{ backgroundColor: "rgba(0,0,0,0.3)" }}>
            <p className="text-xs mb-2">Your turn to bid. Current bid: <strong>{state.currentBid === 13 ? "none yet" : state.currentBid}</strong></p>
            <div className="flex gap-2 flex-wrap">
              {[1, 2, 4].map((step) => {
                const amt = Math.min(28, state.currentBid + step);
                return (
                  <button
                    key={step}
                    disabled={amt <= state.currentBid && state.currentBid >= 28}
                    onClick={() => dispatch({ type: "BID", playerIdx: 0, amount: amt })}
                    className="px-3 py-1.5 rounded-md text-sm font-medium"
                    style={{ backgroundColor: "#c9a227", color: "#1c1f1d" }}
                  >
                    Bid {amt}
                  </button>
                );
              })}
              <button
                onClick={() => dispatch({ type: "PASS", playerIdx: 0 })}
                className="px-3 py-1.5 rounded-md text-sm"
                style={{ border: "1px solid #e9d9a0" }}
              >
                Pass
              </button>
            </div>
          </div>
        )}

        {state.phase === "choose-trump" && state.caller === 0 && (
          <div className="rounded-lg p-3" style={{ backgroundColor: "rgba(0,0,0,0.3)" }}>
            <p className="text-xs mb-2">You won the bid at {state.currentBid}. Pick your secret trump suit:</p>
            <div className="flex gap-2 justify-center">
              {SUITS.map((s) => (
                <button
                  key={s}
                  onClick={() => dispatch({ type: "CHOOSE_TRUMP", suit: s })}
                  className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                  style={{ backgroundColor: "#fbf6e9", color: SUIT_INFO[s as keyof typeof SUIT_INFO].color }}
                >
                  {SUIT_INFO[s as keyof typeof SUIT_INFO].sym}
                </button>
              ))}
            </div>
          </div>
        )}

        {state.phase === "hand-end" && state.lastResult && (
          <div
            className="rounded-lg p-3 text-center"
            style={{
              backgroundColor: state.lastResult.matchOver ? "rgba(201,162,39,0.18)" : "rgba(0,0,0,0.3)",
              border: state.lastResult.matchOver ? "1px solid #c9a227" : "none",
            }}
          >
            {state.lastResult.matchOver && (
              <p className="ge-display text-lg font-bold mb-1" style={{ color: "#e9d9a0" }}>
                🏆 {teamNames(state.names)[state.lastResult.winningTeam as 0 | 1]} win the match!
              </p>
            )}
            <p className="text-sm mb-1">
              {teamNames(state.names)[state.lastResult.callerTeam as 0 | 1]} bid {state.lastResult.bid} and scored {state.lastResult.callerPts}.
            </p>
            <p className="text-sm mb-2 font-semibold" style={{ color: "#e9d9a0" }}>
              {teamNames(state.names)[state.lastResult.winningTeam as 0 | 1]} win the hand
              {state.lastResult.pointsAwarded > 1 ? `, double (held under half)` : ""}!{" "}
              <span className="font-normal opacity-80">
                +{state.lastResult.pointsAwarded} pt{state.lastResult.pointsAwarded > 1 ? "s" : ""}
              </span>
            </p>
            {state.feedbackOn && (
              <div className="text-left text-xs mb-3 p-2 rounded-md" style={{ backgroundColor: "rgba(0,0,0,0.25)" }}>
                <p className="font-semibold mb-1" style={{ color: "#e9d9a0" }}>How you played</p>
                {state.lastResult.tips && state.lastResult.tips.length > 0 ? (
                  <ul className="space-y-1 list-disc pl-4">
                    {state.lastResult.tips.slice(0, 5).map((t, i) => (
                      <li key={i} className="opacity-90">{t}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="opacity-80">No notable alternate plays. Clean hand!</p>
                )}
              </div>
            )}
            <button
              onClick={() => dispatch({ type: state.lastResult!.matchOver ? "NEW_MATCH" : "DEAL" })}
              className="px-4 py-2 rounded-md font-semibold"
              style={{ backgroundColor: "#c9a227", color: "#1c1f1d" }}
            >
              {state.lastResult.matchOver ? "Start New Match" : "Deal Next Hand"}
            </button>
          </div>
        )}

        {/* Your hand during play */}
        {(state.phase === "playing" || state.phase === "bidding" || state.phase === "choose-trump") && userHand.length > 0 && (
          <div className="mt-2">
            {state.moveTip && (
              <div
                key={state.moveTip.id}
                className="tip-pop text-xs mb-2 p-2 rounded-md"
                style={{
                  backgroundColor: "rgba(201,162,39,0.15)",
                  border: "1px solid rgba(201,162,39,0.5)",
                  color: "#e9d9a0",
                }}
              >
                💡 {state.moveTip.text}
              </div>
            )}
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs opacity-70">Your hand{userTurn ? ", tap a card to play" : ""}</p>
              {userTurn && voidInLead && !trumpKnown && (
                <button
                  onClick={() => dispatch({ type: "ASK_TRUMP", playerIdx: 0 })}
                  className="text-xs px-2.5 py-1 rounded-full font-medium"
                  style={{ backgroundColor: "#9a2b3a", color: "#f3ecd9" }}
                >
                  Ask for trump
                </button>
              )}
            </div>
            <div className="flex gap-1.5 flex-wrap justify-center">
              {userHand.map((c) => (
                <CardComponent
                  key={c.id}
                  card={c}
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
      </div>
    </div>
  );
}
