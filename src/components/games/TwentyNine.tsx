import React, { useReducer, useEffect, useLayoutEffect, useRef, useState } from "react";
import {
    SUITS, SUIT_INFO, MATCH_TARGET, initialState, reducer, pickPokemonNames, teamNames,
    sortHand, legalCards, trickWinner, handPoints, pairReady,
} from "../../utils/twentyNine";
import type { Card, GameState, TrickEntry } from "../../utils/twentyNine";

/* ---------- Motion helpers ---------- */

const prefersReducedMotion = () =>
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const centre = (r: DOMRect) => ({ x: r.left + r.width / 2, y: r.top + r.height / 2 });

// Small, stable tilt per card so the trick looks tossed onto the table.
function tossAngle(id: string) {
    let h = 0;
    for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) | 0;
    return (Math.abs(h) % 13) - 6;
}

/* ---------- UI Components ---------- */

type CardSize = "hand" | "trick" | "mini";

function PlayingCard({ card, size = "hand", faded = false, onClick, disabled = false, highlight = false, isTrump = false, className = "", style }: {
    card: Card; size?: CardSize; faded?: boolean; onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
    disabled?: boolean; highlight?: boolean; isTrump?: boolean; className?: string; style?: React.CSSProperties;
}) {
    const info = SUIT_INFO[card.suit];
    const colour = info.red ? "text-red" : "text-dark";
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`card-piece card-${size} ${disabled ? "" : onClick ? "card-hover" : ""} ${highlight ? "card-highlight" : ""} ${isTrump ? "card-trump" : ""} ${className}`}
            style={{ opacity: faded ? 0.35 : 1, cursor: disabled ? "default" : onClick ? "pointer" : "default", ...style }}
            aria-label={`${card.rank} of ${info.name}`}
        >
            <span className="card-face card-front">
                {isTrump && <span className="trump-dot" />}
                <span className={`card-corner ${colour}`}>
                    <span className="card-rank">{card.rank}</span>
                    <span className="card-corner-suit">{info.sym}</span>
                </span>
                <span className={`card-centre ${colour}`}>{info.sym}</span>
            </span>
            <span className="card-face card-back-face" aria-hidden="true" />
        </button>
    );
}

// A card on the table. It flies in from where it was played and, when the
// trick is over, slides off towards the seat that won it.
function TrickCard({ entry, from, collectTo, highlight }: {
    entry: TrickEntry;
    from: () => DOMRect | null;
    collectTo: (() => DOMRect | null) | null;
    highlight: boolean;
}) {
    const ref = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        const el = ref.current;
        const origin = from();
        if (!el || !origin || prefersReducedMotion()) return;
        const to = el.getBoundingClientRect();
        const a = centre(origin), b = centre(to);
        const scale = origin.width / to.width;
        // Computer players' cards start face down and turn over in flight.
        const flip = entry.player === 0 ? 0 : 180;
        el.animate(
            [
                { transform: `translate(${a.x - b.x}px, ${a.y - b.y}px) scale(${scale}) rotateY(${flip}deg)` },
                { transform: "translate(0, 0) scale(1) rotateY(0deg)" },
            ],
            { duration: 420, easing: "cubic-bezier(.2,.8,.2,1)" },
        );
    }, []);

    useEffect(() => {
        const el = ref.current;
        const target = collectTo?.();
        if (!el || !target || prefersReducedMotion()) return;
        const a = centre(el.getBoundingClientRect()), b = centre(target);
        el.animate(
            [
                { transform: "translate(0, 0) scale(1)", opacity: 1 },
                { transform: `translate(${b.x - a.x}px, ${b.y - a.y}px) scale(0.5)`, opacity: 0 },
            ],
            { duration: 320, easing: "cubic-bezier(.5,0,.75,0)", fill: "forwards" },
        );
    }, [collectTo !== null]);

    return (
        <div ref={ref} className="trick-fly">
            <div className="trick-toss" style={{ transform: `rotate(${tossAngle(entry.card.id)}deg)` }}>
                <PlayingCard card={entry.card} size="trick" highlight={highlight} className={highlight ? "trick-win" : ""} />
            </div>
        </div>
    );
}

// Overlapping fan of card backs.
function CardBacks({ count, vertical = false, backsRef }: {
    count: number; vertical?: boolean; backsRef: (el: HTMLDivElement | null) => void;
}) {
    return (
        <div ref={backsRef} className={`card-backs ${vertical ? "card-backs-v" : ""}`} aria-label={`${count} cards`}>
            {Array.from({ length: count }).map((_, i) => <div key={i} className="card-back-mini" />)}
        </div>
    );
}

type BidRole = "high" | "challenge" | "watching" | "passed" | null;

function PlayerSeat({ name, cardCount, active, layout, bidRole, bidAmt, backsRef }: {
    name: string; cardCount: number; active: boolean;
    layout: "top" | "left" | "right";
    bidRole?: BidRole; bidAmt?: number | null;
    backsRef: (el: HTMLDivElement | null) => void;
}) {
    const badge =
        bidRole === "high" ? <span className="bid-chip-high">{bidAmt ?? "?"}</span>
        : bidRole === "challenge" ? <span className="bid-chip-challenge">vs</span>
        : bidRole === "passed" ? <span className="bid-chip-passed">pass</span>
        : bidRole === "watching" ? <span className="bid-chip-watching">wait</span>
        : null;

    const seatClass = bidRole === "high" ? "seat-bid-high" : bidRole === "challenge" ? "seat-bid-challenge" : "";

    return (
        <div className={`seat ${seatClass}`}>
            <span className={`seat-name ${active ? "seat-active" : ""}`} style={{ opacity: bidRole === "passed" ? 0.45 : 1 }}>
                {name}{active ? " ▸" : ""}
            </span>
            {badge}
            <CardBacks count={cardCount} vertical={layout !== "top"} backsRef={backsRef} />
        </div>
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
                    <span key={i} className={`pip ${colorClass} ${i < wins ? "pip-filled" : "pip-empty"}`} />
                ))}
            </div>
            <span className={`score-sym ${colorClass}`}>{symbol}</span>
        </div>
    );
}

// Key kept from the earlier version so saved games carry over.
const STORAGE_KEY = "twenty-eight-state-v1";

function loadState(): GameState {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) return { ...initialState, ...JSON.parse(raw) };
    } catch {}
    return initialState;
}

/* ---------- Main component ---------- */
export default function TwentyNine() {
    const [state, dispatch] = useReducer(reducer, initialState, loadState);
    const timers = useRef<number[]>([]);
    const [showPrev, setShowPrev] = useState(false);
    const [collecting, setCollecting] = useState(false);

    // Where cards come from and go to, for the table animations.
    const seatEls = useRef<(HTMLDivElement | null)[]>([null, null, null, null]);
    const handRects = useRef(new Map<string, DOMRect>());
    const handEl = useRef<HTMLDivElement | null>(null);
    const seatRect = (idx: number): DOMRect | null => {
        const el = idx === 0 ? handEl.current : seatEls.current[idx];
        return el ? el.getBoundingClientRect() : null;
    };
    const originOf = (entry: TrickEntry) => () =>
        entry.player === 0 ? handRects.current.get(entry.card.id) ?? seatRect(0) : seatRect(entry.player);

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
    }, [state.phase, state.bidTurn, state.dealSeq]);

    const callerTeamNow = state.caller === null ? null : state.caller % 2;
    const userDecidesDouble = state.phase === "doubling"
        && (state.doubleStage === "double" ? callerTeamNow === 1 : callerTeamNow === 0);

    useEffect(() => {
        if (state.phase === "doubling" && !userDecidesDouble)
            after(900, () => dispatch({ type: "AI_DOUBLE" }));
    }, [state.phase, state.doubleStage]);

    useEffect(() => {
        if (state.phase === "choose-trump" && state.caller !== 0)
            after(800, () => dispatch({ type: "AI_CHOOSE_TRUMP" }));
    }, [state.phase, state.caller]);

    useEffect(() => {
        if (state.phase === "playing" && state.trick.length < 4 && state.turn !== 0)
            after(700, () => dispatch({ type: "AI_PLAY", playerIdx: state.turn }));
    }, [state.phase, state.turn, state.trick.length]);

    useEffect(() => {
        if (state.trick.length < 4) { setCollecting(false); return; }
        if (state.phase === "playing") {
            after(880, () => setCollecting(true));
            after(1200, () => dispatch({ type: "CLEAR_TRICK" }));
        }
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
    const legalIds = new Set(legalCards(state.hands[0] || [], state, 0).map((c) => c.id));
    const isLegal = (c: Card) => legalIds.has(c.id);
    const mustTrump = state.askedBy === 0 && userHand.some((c) => c.suit === state.trumpSuit)
        && !userHand.some((c) => c.suit === state.leadSuit);
    const userTurn = state.phase === "playing" && state.turn === 0 && state.trick.length < 4;
    const trumpKnown = state.caller === 0 || state.trumpRevealed;
    const voidInLead = state.leadSuit && !userHand.some((c) => c.suit === state.leadSuit);
    const callerTeam = state.caller === null ? null : state.caller % 2;
    const target0 = callerTeam === null ? null : callerTeam === 0 ? state.currentBid : 29 - state.currentBid;
    const target1 = callerTeam === null ? null : callerTeam === 1 ? state.currentBid : 29 - state.currentBid;
    const seat = (idx: number) => state.trick.find((t) => t.player === idx);
    const trickWinnerIdx = state.trick.length === 4 && state.leadSuit && state.trumpSuit
        ? trickWinner(state.trick, state.leadSuit, state.trumpSuit) : null;
    const collectTo = collecting && trickWinnerIdx !== null ? () => seatRect(trickWinnerIdx) : null;

    const playCard = (c: Card) => (e: React.MouseEvent<HTMLButtonElement>) => {
        handRects.current.set(c.id, e.currentTarget.getBoundingClientRect());
        dispatch({ type: "PLAY_CARD", playerIdx: 0, card: c });
    };

    const getBidRole = (idx: number): BidRole => {
        if (state.phase !== "bidding") return null;
        if (state.passed[idx]) return "passed";
        const pos = state.bidOrder.indexOf(idx);
        if (pos === -1) return "passed";
        if (pos === 0 || pos === 1) return state.highBidder === idx ? "high" : "challenge";
        return "watching";
    };
    const bidAmt = state.phase === "bidding" && state.highBidder !== null ? state.currentBid : null;

    const tn = teamNames(state.names);

    const seatProps = (idx: number, layout: "top" | "left" | "right") => ({
        name: state.names[idx],
        cardCount: state.hands[idx].length,
        active: state.phase === "playing" && state.turn === idx,
        layout,
        bidRole: getBidRole(idx),
        bidAmt: state.highBidder === idx ? bidAmt : null,
        backsRef: (el: HTMLDivElement | null) => { seatEls.current[idx] = el; },
    });

    return (
        <div className="game-root">
            <style>{`
                @keyframes bannerIn { 0% { opacity:0; transform:translateY(10px) scale(0.88); } 12% { opacity:1; transform:translateY(0) scale(1); } 80% { opacity:1; } 100% { opacity:0; transform:translateY(-6px); } }
                @keyframes tipIn { 0% { opacity:0; transform:translateY(5px); } 10% { opacity:1; transform:translateY(0); } 85% { opacity:1; } 100% { opacity:0; } }
                @keyframes dealIn { from { transform: translateY(-28px) rotateY(180deg); opacity: 0; } 30% { opacity: 1; } to { transform: none; opacity: 1; } }
                @keyframes flipIn { from { transform: rotateX(90deg); opacity: 0; } to { transform: none; opacity: 1; } }
                @keyframes winLift { to { transform: translateY(-4px) scale(1.08); } }
                .banner-anim { animation: bannerIn 1.5s ease-in-out forwards; }
                .tip-anim { animation: tipIn 3s ease-in-out forwards; }
                .deal-in { animation: dealIn .45s cubic-bezier(.2,.8,.2,1) backwards; animation-delay: calc(var(--i, 0) * 45ms); }
                .flip-in { display: inline-block; animation: flipIn .4s ease-out; }
                @media (prefers-reduced-motion: reduce) {
                    .deal-in, .flip-in, .trick-win { animation: none !important; }
                    .card-hover:hover { transform: none; }
                }

                .game-root {
                    min-height: 100dvh;
                    display: flex;
                    flex-direction: column;
                    background: var(--game-bg);
                    color: var(--game-text);
                    font-family: var(--font-sans);
                    --game-bg: rgb(255,252,245);
                    --game-text: rgb(33,33,33);
                    --game-text-2: rgb(117,117,117);
                    --game-border: rgb(220,215,208);
                    --game-card-bg: #fff;
                    --game-card-border: rgb(210,205,198);
                    --game-card-back: rgb(0,102,204);
                    --game-card-back-2: rgb(30,124,220);
                    --game-felt: rgb(242,237,226);
                    --game-felt-edge: rgb(228,221,208);
                    --game-accent: rgb(0,102,204);
                    --game-accent-text: #fff;
                    --game-red: rgb(185,28,28);
                    --game-surface: rgba(0,0,0,0.04);
                    --game-trump-dot: rgb(0,102,204);
                    --game-banner-bg: rgba(255,252,245,0.96);
                    --game-banner-trump: rgb(0,102,204);
                    --game-banner-match: rgb(33,33,33);
                    --game-tip-bg: rgba(0,102,204,0.08);
                    --game-tip-border: rgba(0,102,204,0.2);
                    --game-tip-text: rgb(0,102,204);
                    --game-btn: rgb(33,33,33);
                    --game-btn-text: rgb(255,252,245);
                    --game-pass-border: rgb(180,175,168);
                    --game-pass-text: rgb(117,117,117);
                    --game-shadow: rgba(60,40,20,0.14);
                }
                :root.dark .game-root {
                    --game-bg: rgb(22,20,18);
                    --game-text: rgb(245,240,230);
                    --game-text-2: rgb(160,155,148);
                    --game-border: rgb(55,50,45);
                    --game-card-bg: rgb(38,34,30);
                    --game-card-border: rgb(70,64,58);
                    --game-card-back: rgb(40,78,130);
                    --game-card-back-2: rgb(52,96,156);
                    --game-felt: rgb(30,28,25);
                    --game-felt-edge: rgb(44,40,36);
                    --game-accent: rgb(77,159,255);
                    --game-accent-text: rgb(22,20,18);
                    --game-red: rgb(248,113,113);
                    --game-surface: rgba(255,255,255,0.04);
                    --game-trump-dot: rgb(77,159,255);
                    --game-banner-bg: rgba(22,20,18,0.96);
                    --game-banner-trump: rgb(77,159,255);
                    --game-banner-match: rgb(245,240,230);
                    --game-tip-bg: rgba(77,159,255,0.1);
                    --game-tip-border: rgba(77,159,255,0.25);
                    --game-tip-text: rgb(77,159,255);
                    --game-btn: rgb(245,240,230);
                    --game-btn-text: rgb(22,20,18);
                    --game-pass-border: rgb(80,75,70);
                    --game-pass-text: rgb(140,135,128);
                    --game-shadow: rgba(0,0,0,0.5);
                }

                /* Cards: two faces so they can turn over in 3D */
                .card-piece {
                    position: relative;
                    flex-shrink: 0;
                    padding: 0;
                    border: none;
                    background: none;
                    border-radius: 7px;
                    transform-style: preserve-3d;
                    transition: transform 0.14s, opacity 0.14s;
                    outline: none;
                    font-family: inherit;
                }
                .card-piece:focus-visible { outline: 2px solid var(--game-accent); outline-offset: 2px; }
                .card-hand { width: 56px; height: 80px; }
                .card-trick { width: 48px; height: 68px; }
                .card-mini { width: 36px; height: 50px; }
                .card-face {
                    position: absolute; inset: 0;
                    border-radius: inherit;
                    backface-visibility: hidden;
                    -webkit-backface-visibility: hidden;
                }
                .card-front {
                    background: var(--game-card-bg);
                    border: 1.5px solid var(--game-card-border);
                    box-shadow: 0 1px 2px var(--game-shadow), 0 4px 10px -6px var(--game-shadow);
                    transition: border-color 0.14s, box-shadow 0.14s;
                }
                .card-back-face, .card-back-mini {
                    background:
                        repeating-linear-gradient(45deg, transparent 0 3px, rgba(255,255,255,0.14) 3px 4px),
                        linear-gradient(135deg, var(--game-card-back), var(--game-card-back-2));
                    border: 2px solid var(--game-card-bg);
                    box-shadow: 0 0 0 1px var(--game-card-border), 0 2px 4px -1px var(--game-shadow);
                }
                .card-back-face { transform: rotateY(180deg); }
                .card-corner {
                    position: absolute; top: 4px; left: 5px;
                    display: flex; flex-direction: column; align-items: center;
                    line-height: 1;
                }
                .card-rank { font-weight: 700; font-size: var(--text-sm); letter-spacing: -0.5px; }
                .card-corner-suit { font-size: var(--text-xs); }
                .card-centre {
                    position: absolute; inset: 0;
                    display: flex; align-items: center; justify-content: center;
                    font-size: var(--text-xlarge); line-height: 1;
                    padding-top: 10px; padding-left: 8px;
                }
                .card-trick .card-centre { font-size: var(--text-large); }
                .card-mini .card-rank { font-size: var(--text-xs); }
                .card-mini .card-corner { top: 3px; left: 3px; }
                .card-mini .card-corner-suit { display: none; }
                .card-mini .card-centre { font-size: var(--text-base); padding-left: 6px; padding-top: 8px; }
                .card-hover:hover { transform: translateY(-10px); }
                .card-hover:hover .card-front { box-shadow: 0 10px 18px -6px var(--game-shadow); }
                .card-hover:active { transform: translateY(-6px); }
                .card-highlight .card-front { border-color: var(--game-accent); }
                .card-trump .card-front { border-color: var(--game-trump-dot); }
                .trump-dot {
                    position: absolute; top: 4px; right: 4px;
                    width: 6px; height: 6px; border-radius: 50%;
                    background: var(--game-trump-dot);
                }
                .text-red { color: var(--game-red); }
                .text-dark { color: var(--game-text); }

                /* Hand: overlapping fan that fits any width */
                .hand-row { display: flex; justify-content: center; padding-top: 12px; }
                .hand-slot { flex: 0 1 60px; min-width: 0; perspective: 900px; }
                .hand-slot:last-child { flex: 0 0 auto; }

                /* Opponent card backs */
                .card-backs { display: flex; flex-shrink: 0; }
                .card-back-mini { width: 24px; height: 34px; border-radius: 4px; flex-shrink: 0; }
                .card-backs .card-back-mini + .card-back-mini { margin-left: -14px; }
                .card-backs-v { flex-direction: column; }
                .card-backs-v .card-back-mini + .card-back-mini { margin-left: 0; margin-top: -26px; }

                /* Table */
                .felt {
                    border-radius: 50%;
                    background: radial-gradient(ellipse at 50% 40%, var(--game-felt) 55%, var(--game-felt-edge));
                    box-shadow: inset 0 2px 10px var(--game-shadow);
                }
                .trick-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr 1fr;
                    grid-template-rows: 1fr 1fr 1fr;
                    grid-template-areas: ". top ." "left mid right" ". bottom .";
                    width: min(204px, 56vw); aspect-ratio: 1;
                    flex-shrink: 0;
                }
                .trick-cell { display: flex; align-items: center; justify-content: center; }
                .trick-holder { width: 48px; height: 68px; perspective: 700px; }
                .trick-fly, .trick-toss { transform-style: preserve-3d; }
                .trick-win { animation: winLift .3s ease-out forwards; }

                /* Score */
                .score-card { display: flex; flex-direction: column; align-items: center; gap: 3px; }
                .score-label { font-size: var(--text-xs); color: var(--game-text-2); text-align: center; max-width: 96px; line-height: 1.3; }
                .score-pips { display: flex; gap: 3px; align-items: center; }
                .pip { display: inline-block; width: 7px; height: 7px; border-radius: 50%; }
                .pip.pip-filled.text-red { background: var(--game-red); }
                .pip.pip-filled.text-dark { background: var(--game-text); }
                .pip.pip-empty { background: transparent; border: 1.5px solid var(--game-border); }
                .score-sym { font-size: var(--text-sm); line-height: 1; }

                /* Buttons */
                .btn-primary {
                    background: var(--game-btn);
                    color: var(--game-btn-text);
                    border: none;
                    border-radius: 8px;
                    padding: 9px 18px;
                    font-size: var(--text-sm);
                    font-weight: 600;
                    cursor: pointer;
                    transition: opacity 0.15s;
                    font-family: inherit;
                }
                .btn-primary:hover { opacity: 0.82; }
                .btn-primary:active { opacity: 0.7; }
                .btn-primary:disabled { opacity: 0.35; cursor: default; }
                .btn-big { font-size: var(--text-base); padding: 14px 36px; }

                .btn-outline {
                    background: transparent;
                    border: 1.5px solid var(--game-pass-border);
                    border-radius: 8px;
                    padding: 8px 16px;
                    font-size: var(--text-sm);
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
                    font-size: var(--text-xs);
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
                    font-size: var(--text-xs);
                    font-weight: 600;
                    cursor: pointer;
                    font-family: inherit;
                    transition: opacity 0.15s;
                }
                .btn-trump-ask:hover { opacity: 0.85; }

                .suit-btn {
                    width: 52px; height: 52px;
                    border-radius: 10px;
                    background: var(--game-card-bg);
                    border: 1.5px solid var(--game-card-border);
                    font-size: var(--text-large);
                    cursor: pointer;
                    display: flex; align-items: center; justify-content: center;
                    transition: border-color 0.12s, transform 0.1s;
                }
                .suit-btn:hover { border-color: var(--game-accent); transform: scale(1.05); }

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
                .banner-text { font-family: var(--font-serif); font-size: var(--text-medium); font-weight: 700; }

                /* Tip */
                .tip-box {
                    border-radius: 8px;
                    padding: 8px 12px;
                    font-size: var(--text-xs);
                    background: var(--game-tip-bg);
                    border: 1px solid var(--game-tip-border);
                    color: var(--game-tip-text);
                }

                .pts-bar { font-size: var(--text-xs); color: var(--game-text-2); }
                .hint { font-size: var(--text-xs); color: var(--game-text-2); }
                .prompt { font-size: var(--text-xs); color: var(--game-text-2); margin-bottom: 8px; }
                .prompt strong { color: var(--game-text); }

                .game-header {
                    display: flex; align-items: center; justify-content: space-between;
                    padding: 12px 16px 8px;
                    border-bottom: 1px solid var(--game-border);
                }
                .game-title { font-family: var(--font-serif); font-size: var(--text-large); font-weight: 700; letter-spacing: -0.5px; }
                .header-actions { display: flex; gap: 4px; align-items: center; }

                /* Seats */
                .seat { display: flex; flex-direction: column; align-items: center; gap: 4px; }
                .seat-name {
                    font-size: var(--text-xs); line-height: 1.2;
                    color: var(--game-text-2);
                    text-align: center; max-width: 64px; word-break: break-word;
                }
                .seat-name.seat-active { color: var(--game-accent); font-weight: 700; }

                /* Bid status badges */
                .bid-chip-high {
                    font-size: var(--text-xs); font-weight: 700; line-height: 1;
                    background: var(--game-accent); color: var(--game-accent-text);
                    border-radius: 6px; padding: 2px 6px;
                }
                .bid-chip-challenge {
                    font-size: var(--text-xs); line-height: 1;
                    color: var(--game-text-2);
                    border: 1px dashed var(--game-text-2);
                    border-radius: 6px; padding: 2px 6px;
                }
                .bid-chip-passed { font-size: var(--text-xs); color: var(--game-text-2); opacity: 0.45; line-height: 1; }
                .bid-chip-watching { font-size: var(--text-xs); color: var(--game-text-2); opacity: 0.6; line-height: 1; }
                .seat-bid-high { outline: 2px solid var(--game-accent); border-radius: 8px; padding: 3px; }
                .seat-bid-challenge { outline: 1.5px dashed var(--game-text-2); border-radius: 8px; padding: 3px; }

                .table-area {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    position: relative;
                    padding: 12px;
                    gap: 8px;
                }
                .bottom-area {
                    padding: 12px 16px 16px;
                    border-top: 1px solid var(--game-border);
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }
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
                .log-line { font-size: var(--text-xs); color: var(--game-text-2); line-height: 1.5; }
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
                    <div style={{ fontSize: "var(--text-huge)", lineHeight: 1 }}>🃏</div>
                    <div>
                        <p style={{ fontFamily: "var(--font-serif)", fontSize: "var(--text-xlarge)", fontWeight: 700, marginBottom: 4 }}>29</p>
                        <p style={{ fontSize: "var(--text-sm)", color: "var(--game-text-2)", maxWidth: 300, margin: "0 auto 16px" }}>
                            A trick-taking card game for two pairs. 28 card points plus 1 for the last trick.
                        </p>
                    </div>
                    <button className="btn-primary btn-big" onClick={() => dispatch({ type: "DEAL" })}>
                        Deal
                    </button>
                    <div className="hint" style={{ marginTop: 20, lineHeight: 1.7, maxWidth: 320 }}>
                        <p><strong>Ranks</strong> (high→low): J·9·A·10·K·Q·8·7 &nbsp;|&nbsp; <strong>Points</strong>: J=3, 9=2, A=1, 10=1</p>
                        <p><strong>Bid</strong> how many points your pair will take. Highest bidder picks trump secretly.</p>
                        <p>When void in led suit, you may ask to reveal trump. Once you ask, you must trump if you can.</p>
                        <p><strong>Pair</strong>: hold K+Q of trump? Show it after trump is open and your side wins a trick. It moves the bid 4 in your favour.</p>
                        <p><strong>Double</strong>: after trump is set, defenders may double and the bidders may redouble.</p>
                        <p>No points in your first four cards? Ask for a redeal.</p>
                    </div>
                    {state.stats.matchesPlayed + state.stats.bidsTotal > 0 && (
                        <p className="hint" style={{ marginTop: 8 }}>
                            Matches won {state.stats.matchesWon}/{state.stats.matchesPlayed}
                            {" · "}Your bids made {state.stats.bidsMade}/{state.stats.bidsTotal}
                            {" · "}Best streak {state.stats.bestStreak}
                        </p>
                    )}
                </div>
            )}

            {/* Active game */}
            {state.phase !== "idle" && (
                <>
                    {/* Score bar */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 16px", borderBottom: "1px solid var(--game-border)" }}>
                        <ScoreCard label={tn[0]} wins={state.handsWon[0]} total={MATCH_TARGET} colorClass="text-red" symbol="♥" />
                        <div style={{ textAlign: "center", perspective: 400 }}>
                            <span key={trumpKnown ? "open" : "locked"} className="flip-in">
                                {trumpKnown && state.trumpSuit ? (
                                    <span style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: SUIT_INFO[state.trumpSuit].red ? "var(--game-red)" : "var(--game-text)" }}>
                                        {SUIT_INFO[state.trumpSuit].sym} {SUIT_INFO[state.trumpSuit].name}
                                    </span>
                                ) : (
                                    <span className="hint">trump 🔒</span>
                                )}
                            </span>
                            {state.multiplier > 1 && state.phase !== "hand-end" && (
                                <span className="bid-chip-high" style={{ marginLeft: 6 }}>×{state.multiplier}</span>
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
                        {state.banner && (
                            <div key={state.banner.id} className="banner-wrap" role="status">
                                <div className="banner-anim banner-box">
                                    <div className="banner-text" style={{ color: state.banner.kind === "trump" ? "var(--game-banner-trump)" : "var(--game-banner-match)" }}>
                                        {state.banner.text}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Table: partner top, opponents either side, trick on the felt */}
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, flex: 1, justifyContent: "center" }}>
                            <PlayerSeat {...seatProps(2, "top")} />

                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <PlayerSeat {...seatProps(1, "left")} />

                                <div className="trick-grid felt">
                                    {[
                                        { idx: 2, area: "top" },
                                        { idx: 1, area: "left" },
                                        { idx: 3, area: "right" },
                                        { idx: 0, area: "bottom" },
                                    ].map(({ idx, area }) => {
                                        const entry = seat(idx);
                                        return (
                                            <div key={idx} style={{ gridArea: area }} className="trick-cell">
                                                <div className="trick-holder">
                                                    {entry && (
                                                        <TrickCard
                                                            key={entry.card.id}
                                                            entry={entry}
                                                            from={originOf(entry)}
                                                            collectTo={collectTo}
                                                            highlight={trickWinnerIdx === idx}
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <PlayerSeat {...seatProps(3, "right")} />
                            </div>
                        </div>

                        {/* Log */}
                        <div style={{ marginTop: "auto" }}>
                            {state.phase === "playing" && state.prevTrick.length === 4 && (
                                <div style={{ marginBottom: 6 }}>
                                    <button className="btn-ghost" style={{ paddingLeft: 0 }} onClick={() => setShowPrev((v) => !v)}>
                                        {showPrev ? "Hide last trick" : "Last trick"}
                                    </button>
                                    {showPrev && (
                                        <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                                            {state.prevTrick.map((t) => (
                                                <div key={t.card.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                                                    <PlayingCard card={t.card} size="mini" highlight={t.player === state.lastTrickWinner} />
                                                    <span className="hint">{state.names[t.player]}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                            <div aria-live="polite">
                                {state.log.slice(0, 3).map((msg, i) => (
                                    <p key={i} className="log-line">{msg}</p>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Bottom controls */}
                    <div className="bottom-area">
                        {state.moveTip && (
                            <div key={state.moveTip.id} className="tip-anim tip-box">
                                {state.moveTip.text}
                            </div>
                        )}

                        {/* Bidding — my turn */}
                        {state.phase === "bidding" && state.bidTurn === 0 && !state.passed[0] && (
                            <div>
                                <p className="prompt">
                                    {state.highBidder !== null && state.highBidder !== 0
                                        ? <>Respond to <strong>{state.currentBid}</strong>: match, raise, or pass</>
                                        : state.mustRaise
                                        ? <>You were matched at <strong>{state.currentBid}</strong>. Raise or pass</>
                                        : <>Open the bidding. Minimum 17</>}
                                </p>
                                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                                    {(() => {
                                        // Can match if someone else holds the bid and we weren't just matched
                                        const canMatch = state.highBidder !== null && state.highBidder !== 0 && !state.mustRaise;
                                        const minBid = canMatch ? state.currentBid : state.currentBid + 1;
                                        const options = [...new Set([0, 1, 2].map((extra) => Math.min(28, minBid + extra)))];
                                        return options.map((amt, i) => (
                                            <button key={amt} className="btn-primary"
                                                onClick={() => dispatch({ type: "BID", playerIdx: 0, amount: amt })}>
                                                {i === 0 && canMatch ? `Match ${amt}` : `Bid ${amt}`}
                                            </button>
                                        ));
                                    })()}
                                    <button className="btn-outline" onClick={() => dispatch({ type: "PASS", playerIdx: 0 })}>
                                        Pass
                                    </button>
                                    {state.highBidder === null && handPoints(state.hands[0]) === 0 && (
                                        <button className="btn-outline" onClick={() => dispatch({ type: "REDEAL", playerIdx: 0 })}>
                                            Redeal (no points)
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Bidding — AI's turn in my pair */}
                        {state.phase === "bidding" && state.bidTurn !== 0 && !state.passed[0]
                            && (state.bidOrder[0] === 0 || state.bidOrder[1] === 0) && (
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <p className="hint">{state.names[state.bidTurn]} is deciding…</p>
                                {getBidRole(0) === "high" && bidAmt !== null && (
                                    <span className="bid-chip-high">You: {bidAmt}</span>
                                )}
                                {getBidRole(0) === "challenge" && (
                                    <span className="bid-chip-challenge">you respond next</span>
                                )}
                            </div>
                        )}

                        {/* Bidding — waiting to enter */}
                        {state.phase === "bidding" && !state.passed[0] && state.bidOrder.indexOf(0) > 1 && (
                            <p className="hint">
                                Watching{" "}
                                <strong style={{ color: "var(--game-accent)" }}>{state.names[state.bidOrder[0]]}</strong>
                                {" "}vs{" "}
                                <strong style={{ color: "var(--game-text)" }}>{state.names[state.bidOrder[1]]}</strong>
                                {state.currentBid > 16 ? <>. High bid: <strong style={{ color: "var(--game-accent)" }}>{state.currentBid}</strong></> : ""}
                                {" "}(you enter when one passes)
                            </p>
                        )}

                        {/* Choose trump */}
                        {state.phase === "choose-trump" && state.caller === 0 && (
                            <div>
                                <p className="prompt">You won the bid at {state.currentBid}. Pick your secret trump:</p>
                                <div style={{ display: "flex", gap: 8 }}>
                                    {SUITS.map((s) => (
                                        <button key={s} className="suit-btn" aria-label={SUIT_INFO[s].name}
                                            style={{ color: SUIT_INFO[s].red ? "var(--game-red)" : "var(--game-text)" }}
                                            onClick={() => dispatch({ type: "CHOOSE_TRUMP", suit: s })}>
                                            {SUIT_INFO[s].sym}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {state.phase === "choose-trump" && state.caller !== 0 && (
                            <p className="hint">{state.names[state.caller!]} is picking trump…</p>
                        )}

                        {/* Double / redouble */}
                        {state.phase === "doubling" && (userDecidesDouble ? (
                            <div>
                                <p className="prompt">
                                    {state.doubleStage === "double"
                                        ? <>{state.names[state.caller!]} bid <strong>{state.currentBid}</strong>. Think they'll fall short? Double the stakes.</>
                                        : <>Your side was doubled at <strong>{state.currentBid}</strong>. Redouble for ×4?</>}
                                </p>
                                <div style={{ display: "flex", gap: 6 }}>
                                    <button className="btn-primary" onClick={() => dispatch({ type: "DOUBLE_CALL", yes: true })}>
                                        {state.doubleStage === "double" ? "Double ×2" : "Redouble ×4"}
                                    </button>
                                    <button className="btn-outline" onClick={() => dispatch({ type: "DOUBLE_CALL", yes: false })}>
                                        {state.doubleStage === "double" ? "No double" : "Play on"}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <p className="hint">
                                {state.doubleStage === "double" ? "Defenders are deciding whether to double…" : "Bidders are deciding whether to redouble…"}
                            </p>
                        ))}

                        {/* Your hand */}
                        {(state.phase === "playing" || state.phase === "bidding" || state.phase === "choose-trump" || state.phase === "doubling") && userHand.length > 0 && (
                            <div>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 6 }}>
                                    <span className="hint">{userTurn ? "Your turn. Tap a card" : "Your hand"}</span>
                                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                                        {userTurn && mustTrump && (
                                            <span className="hint" style={{ color: "var(--game-accent)" }}>You asked: must trump</span>
                                        )}
                                        {pairReady(state) && state.pairHolder === 0 && (
                                            <button className="btn-trump-ask" onClick={() => dispatch({ type: "DECLARE_PAIR" })}>
                                                Show pair K{SUIT_INFO[state.trumpSuit!].sym}Q{SUIT_INFO[state.trumpSuit!].sym}
                                            </button>
                                        )}
                                        {userTurn && voidInLead && !trumpKnown && (
                                            <button className="btn-trump-ask" onClick={() => dispatch({ type: "ASK_TRUMP", playerIdx: 0 })}>
                                                Ask trump
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <div className="hand-row" ref={handEl}>
                                    {userHand.map((c, i) => (
                                        <div key={c.id} className="hand-slot">
                                            <PlayingCard card={c}
                                                className="deal-in"
                                                style={{ "--i": i } as React.CSSProperties}
                                                disabled={!userTurn || !isLegal(c)}
                                                faded={userTurn && !isLegal(c)}
                                                highlight={userTurn && isLegal(c)}
                                                isTrump={trumpKnown && c.suit === state.trumpSuit}
                                                onClick={userTurn && isLegal(c) ? playCard(c) : undefined}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Hand end */}
                        {state.phase === "hand-end" && state.lastResult && (
                            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                {state.lastResult.matchOver && (
                                    <p style={{ fontFamily: "var(--font-serif)", fontWeight: 700, fontSize: "var(--text-medium)", textAlign: "center" }}>
                                        🏆 {tn[state.lastResult.winningTeam]} win the match!
                                    </p>
                                )}
                                <p style={{ fontSize: "var(--text-sm)" }}>
                                    {tn[state.lastResult.callerTeam]} bid {state.lastResult.bid}, scored {state.lastResult.callerPts}{" "}
                                    <span className="hint">(+1 last trick to {tn[state.lastResult.lastTrickTeam]})</span>.{" "}
                                    <strong>{tn[state.lastResult.winningTeam]}</strong> win the hand
                                    {state.lastResult.underHalf ? " (under half)" : ""}
                                    {state.lastResult.multiplier === 2 ? " (doubled)" : state.lastResult.multiplier === 4 ? " (redoubled)" : ""}
                                    {" "}for <strong>+{state.lastResult.pointsAwarded}</strong>.
                                </p>
                                {state.lastResult.pair && (
                                    <p className="hint">
                                        {tn[state.lastResult.pair.team]} showed the pair: bid moved {state.lastResult.pair.from} → {state.lastResult.pair.to}.
                                    </p>
                                )}
                                {state.stats.streak >= 2 && state.lastResult.winningTeam === 0 && (
                                    <p className="hint" style={{ color: "var(--game-accent)" }}>🔥 {state.stats.streak} hands in a row</p>
                                )}

                                {state.feedbackOn && state.lastResult.tips.length > 0 && (
                                    <div className="tip-box">
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
                                        <button className="btn-outline" onClick={() => dispatch({ type: "NEW_MATCH" })}>
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
