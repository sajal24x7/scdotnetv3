/**
 * Checks for the 29 card game rules and computer players.
 *
 *   npx astro check          # type-checks this file with the rest of src
 *   node --experimental-strip-types src/utils/__checks__/twentyNine.check.ts
 */

import {
    POINTS, cardBeats, trickWinner, legalCards, isBoss, findPairHolder, declarePair,
    teamAwareBidOrder, initialState, makeDeck, reducer,
} from '../twentyNine.ts';
import type { Card, GameState } from '../twentyNine.ts';
import { makeQuiz, checkAnswer, learnReducer, nearOptions, candidateSkills, totalTally, focusSuits, isReady, readyToMoveUp, cleanLoaded } from '../twentyNineLearn.ts';

let failures = 0;

function check(label: string, actual: unknown, expected: unknown): void {
    const a = JSON.stringify(actual);
    const b = JSON.stringify(expected);
    if (a === b) {
        console.log(`  ok   ${label}`);
    } else {
        failures++;
        console.error(`  FAIL ${label}\n         expected ${b}\n         actual   ${a}`);
    }
}

const c = (id: string): Card => ({ suit: id[0], rank: id.slice(1), id });

console.log('deck');
const deck = makeDeck();
check('32 cards', deck.length, 32);
check('28 card points', deck.reduce((s, x) => s + POINTS[x.rank], 0), 28);

console.log('cardBeats');
check('J beats 9 in suit', cardBeats(c('HJ'), c('H9'), 'H', 'S'), true);
check('7 loses to 8 in suit', cardBeats(c('H7'), c('H8'), 'H', 'S'), false);
check('trump 7 beats led J', cardBeats(c('S7'), c('HJ'), 'H', 'S'), true);
check('off-suit J loses to led 7', cardBeats(c('DJ'), c('H7'), 'H', 'S'), false);

console.log('trickWinner');
check('highest of led suit', trickWinner([
    { player: 0, card: c('H10') }, { player: 1, card: c('HA') },
    { player: 2, card: c('DJ') }, { player: 3, card: c('H7') },
], 'H', 'S'), 1);
check('trump takes it', trickWinner([
    { player: 0, card: c('HJ') }, { player: 1, card: c('S7') },
    { player: 2, card: c('H9') }, { player: 3, card: c('S8') },
], 'H', 'S'), 3);

console.log('legalCards');
const hand = [c('HJ'), c('H7'), c('S9'), c('DA')];
const at = (over: Partial<GameState>): GameState => ({ ...initialState, trumpSuit: 'S', ...over });
check('lead: anything', legalCards(hand, at({ leadSuit: null }), 0).length, 4);
check('must follow suit', legalCards(hand, at({ leadSuit: 'H' }), 0).map((x) => x.id), ['HJ', 'H7']);
check('void: anything', legalCards(hand, at({ leadSuit: 'C' }), 0).length, 4);
check('asked: must trump', legalCards(hand, at({ leadSuit: 'C', askedBy: 0, trumpRevealed: true }), 0).map((x) => x.id), ['S9']);
check('other player asked: free', legalCards(hand, at({ leadSuit: 'C', askedBy: 1, trumpRevealed: true }), 0).length, 4);

console.log('isBoss');
check('J is always boss', isBoss(c('HJ'), at({}), []), true);
check('9 not boss while J out', isBoss(c('H9'), at({}), []), false);
check('9 boss once J played', isBoss(c('H9'), at({ played: ['HJ'] }), []), true);
check('9 boss when J in own hand', isBoss(c('H9'), at({}), [c('HJ')]), true);

console.log('pair');
check('finds holder', findPairHolder([[], [c('SK')], [c('SK'), c('SQ')], []], 'S'), 2);
check('none', findPairHolder([[c('SK')], [c('SQ')], [], []], 'S'), null);
const silent = { ...initialState, names: ['A', 'B', 'C', 'D'] };
check('caller side lowers by 4',
    declarePair({ ...silent, caller: 0, pairHolder: 2, currentBid: 22, trumpSuit: 'S' }).currentBid, 18);
check('caller side floor 16',
    declarePair({ ...silent, caller: 0, pairHolder: 0, currentBid: 18, trumpSuit: 'S' }).currentBid, 16);
check('defenders raise by 4, cap 28',
    declarePair({ ...silent, caller: 0, pairHolder: 1, currentBid: 26, trumpSuit: 'S' }).currentBid, 28);

console.log('teamAwareBidOrder');
check('opponents stay paired', teamAwareBidOrder([0, 2, 3], null), [0, 3, 2]);
check('high bidder anchored', teamAwareBidOrder([1, 2, 3], 3), [3, 2, 1]);

console.log('learn mode questions');
{
    // You hold SJ S9 HK DQ; played so far: HJ H9 HA H10 (trick 1) and S7 D8 C7 CJ (trick 2).
    // In trick 2 clubs were led and player 3 threw D8, so player 3 is out of clubs.
    const st: GameState = {
        ...initialState, phase: 'playing', trumpSuit: 'S', caller: 0, tricksPlayed: 2, currentBid: 18,
        names: ['You', 'B', 'C', 'D'], turn: 0, dealSeq: 1,
        hands: [[c('SJ'), c('S9'), c('HK'), c('DQ')], [], [], []],
        played: ['HJ', 'H9', 'HA', 'H10', 'C7', 'S7', 'CJ', 'D8'],
        shownOut: [{ player: 1, suit: 'C', card: 'S7', trick: 2 }, { player: 3, suit: 'C', card: 'D8', trick: 2 }],
        teamPoints: { 0: 7, 1: 3 },
    };
    const trump = makeQuiz(st, 'trump', 1)!;
    check('trump count', trump.answer, 8 - 1 - 2);
    check('trump say', trump.say, 'Trump is spades, 5 left.');
    check('no trump count while trump is hidden', makeQuiz({ ...st, caller: 1 }, 'trump', 1), null);
    const jn = makeQuiz(st, 'jn', 1)!;
    check("J's and 9's: gone", [...jn.answerIds].sort(), ['CJ', 'H9', 'HJ']);
    check("J's and 9's: yours locked", [...jn.lockedIds].sort(), ['S9', 'SJ']);
    check("J's and 9's: say", jn.say, 'Heart J gone, heart 9 gone, club J gone.');
    check("J's and 9's wait for a trick", makeQuiz({ ...st, played: ['HJ'] }, 'jn', 1), null);
    let at = makeQuiz(st, 'at', 1)!;
    for (let i = 0; i < 40 && at.pool.length !== 8; i++) at = makeQuiz(st, 'at', 1)!;
    check("A's and 10's: gone", [...at.answerIds].sort(), ['H10', 'HA']);
    const points = makeQuiz(st, 'points', 1)!;
    check('points: answer is ours or bidders need', points.answer === 7 || points.answer === 18 - 7, true);
    let need = makeQuiz({ ...st, caller: 1 }, 'points', 1)!;
    for (let i = 0; i < 40 && need.question.startsWith('How many points has'); i++) need = makeQuiz({ ...st, caller: 1 }, 'points', 1)!;
    check('points: opponents need bid minus their points', need.answer, 18 - 3);
    check('points: say', need.say, 'We have 7, they need 15.');
    let voids = makeQuiz(st, 'voids', 1)!;
    for (let i = 0; i < 40 && !voids.question.includes('Clubs'); i++) voids = makeQuiz(st, 'voids', 1)!;
    check('voids: who showed out', voids.answerIds, ['1', '3']);
    check('voids: say', voids.say, 'B and D out of clubs.');
    check('voids: none known', makeQuiz({ ...st, shownOut: [] }, 'voids', 1), null);
    check('voids: ignores your own', makeQuiz({ ...st, shownOut: [{ player: 0, suit: 'C', card: 'H7', trick: 1 }] }, 'voids', 1), null);
    // Started with 4 spades (J 9 + 2 played), 2 hearts with the K and A... see startHand below.
    const fs = { ...st, startHand: ['SJ', 'S9', 'S7', 'HK', 'H10', 'DQ', 'D8', 'C7'] };
    check('focus suits: longest, then the one with an A or 10', focusSuits(fs), { long: 'S', second: 'H' });
    check('focus suits: second falls back to next longest',
        focusSuits({ ...st, startHand: ['SJ', 'S9', 'S7', 'HK', 'HQ', 'DQ', 'C7', 'C8'] }).long, 'S');
    check('longest suit count', makeQuiz(fs, 'long', 1)!.answer, 8 - 1 - 2);
    check('second suit count', makeQuiz(fs, 'second', 1)!.answer, 8 - 4 - 1);
    const suitQ = makeQuiz({ ...st, trick: [{ player: 3, card: c('DK') }], leadSuit: 'D' }, 'suits', 1)!;
    check('suit count says down to', suitQ.say.includes('down to'), true);
    // Trump hidden from you: hearts, clubs, spades and diamonds have all been played.
    const hidden = { ...st, caller: 1, trumpRevealed: false, played: ['HJ', 'H9', 'HA', 'H10', 'C7', 'D8', 'CJ', 'C9'],
        shownOut: [{ player: 1, suit: 'H', card: 'C7', trick: 1 }] };
    const guess = makeQuiz(hidden, 'guess', 1)!;
    check('guess: suits not yet played', [...guess.answerIds].sort(), ['S']);
    check('guess: say uses the bidder throw', guess.say, 'Bidder threw a club, not clubs.');
    check('guess: not when you know trump', makeQuiz(st, 'guess', 1), null);
    check('card answer: exact set', checkAnswer(voids, ['3', '1']), true);
    check('card answer: missing one', checkAnswer(voids, ['1']), false);
    check('number answer', checkAnswer(trump, 5), true);
    check('options in range', nearOptions(0, 0, 12).every((n) => n >= 0) && nearOptions(0, 0, 12).length === 4, true);
    check('rung 1 asks only rung 1', candidateSkills({ ...st, learnLevel: 1 }), ['jn']);
    check('rung 3 reviews 1 and 2', candidateSkills({ ...st, learnLevel: 3 }), ['jn', 'voids', 'long']);
    check('this rung only', candidateSkills({ ...st, learnLevel: 3, learnOnly: true }), ['long']);
    check('ready: 8 of 10', isReady([true, true, false, true, true, true, true, false, true, true]), true);
    check('not ready: too few', isReady([true, true, true]), false);
    check('not ready: 7 of 10', isReady([true, true, false, true, false, true, true, false, true, true]), false);
    check('move up prompt', readyToMoveUp({ ...st, learnLevel: 2, learnRecent: { voids: Array(8).fill(true) } }), true);
    check('no move up past the top', readyToMoveUp({ ...st, learnLevel: 9, learnRecent: { points: Array(8).fill(true) } }), false);
    const old = cleanLoaded({ ...st, learnLevel: 99, quiz: { ...trump, skill: 'endgame' as never } });
    check('old saves: level clamped, old question dropped', [old.learnLevel, old.quiz], [9, null]);
    const asked = learnReducer({ ...st, learnOn: true }, { type: 'ANSWER_QUIZ', value: 0 });
    check('answer needs an open quiz', asked.handStats, {});
    const on = learnReducer({ ...st, learnLevel: 8 }, { type: 'SET_LEARN', on: true });
    check('turning on asks at once on your turn', on.quiz !== null, true);
    const moved = learnReducer({ ...on, learnOnly: true }, { type: 'SET_LEARN_LEVEL', level: 1 });
    check('switching rung swaps an open question', moved.quiz?.skill, 'jn');
    const answered = learnReducer(learnReducer(moved, { type: 'ANSWER_QUIZ', value: moved.quiz!.answerIds }), { type: 'CLOSE_QUIZ' });
    check('answers count towards the rung', answered.learnRecent.jn, [true]);
}

console.log('shownOut');
{
    let s: GameState = { ...initialState, names: ['A', 'B', 'C', 'D'], phase: 'playing', trumpSuit: 'S', caller: 0, turn: 0,
        hands: [[c('H7')], [c('D7')], [c('H8')], [c('HK')]] };
    for (const p of [0, 1, 2, 3]) s = reducer(s, { type: 'PLAY_CARD', playerIdx: p, card: s.hands[p][0] });
    check('records the player who did not follow', s.shownOut, [{ player: 1, suit: 'H', card: 'D7', trick: 1 }]);
}

/* Seeded random so a failure is reproducible. */
function seeded(seed: number): () => number {
    let s = seed >>> 0;
    return () => {
        s = (s + 0x6d2b79f5) >>> 0;
        let t = s;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

console.log('simulated hands (computer plays every seat)');
const realRandom = Math.random;
const HANDS = 400;
const problems: string[] = [];
let callerWins = 0;
for (let n = 0; n < HANDS; n++) {
    Math.random = seeded(n + 1);
    let s: GameState = reducer({ ...initialState, names: ['A', 'B', 'C', 'D'], feedbackOn: false }, { type: 'DEAL' });
    let steps = 0;
    while (s.phase !== 'hand-end' && steps++ < 500) {
        if (s.phase === 'bidding') s = reducer(s, { type: 'AI_BID', playerIdx: s.bidTurn });
        else if (s.phase === 'choose-trump') s = reducer(s, { type: 'AI_CHOOSE_TRUMP' });
        else if (s.phase === 'doubling') s = reducer(s, { type: 'AI_DOUBLE' });
        else if (s.trick.length === 4) s = reducer(s, { type: 'CLEAR_TRICK' });
        else {
            const player = s.turn;
            const before = s.hands[player];
            const next = reducer(s, { type: 'AI_PLAY', playerIdx: player });
            const played = next.played[next.played.length - 1];
            const card = before.find((x) => x.id === played);
            if (!card) problems.push(`hand ${n}: ${player} played a card it did not hold`);
            else if (s.leadSuit && card.suit !== s.leadSuit && before.some((x) => x.suit === s.leadSuit))
                problems.push(`hand ${n}: ${player} revoked ${played} on ${s.leadSuit}`);
            s = next;
        }
    }
    if (s.phase !== 'hand-end') { problems.push(`hand ${n}: stuck in ${s.phase}`); continue; }
    const total = s.teamPoints[0] + s.teamPoints[1];
    if (total !== 29) problems.push(`hand ${n}: points add to ${total}`);
    if (new Set(s.played).size !== 32) problems.push(`hand ${n}: ${new Set(s.played).size} unique cards played`);
    if (s.hands.some((h) => h.length)) problems.push(`hand ${n}: cards left in hand`);
    if (s.currentBid < 16 || s.currentBid > 28) problems.push(`hand ${n}: bid ${s.currentBid} out of range`);
    if (s.lastResult!.made) callerWins++;
}
Math.random = realRandom;
// Learn mode asks once before each of your 8 turns at the top rung, and play goes on after it.
// Lower rungs and "this rung only" may skip turns where no question fits.
for (let n = 0; n < 40; n++) {
    Math.random = seeded(1000 + n);
    const level = n < 20 ? 9 : 1 + (n % 9);
    const only = n >= 20 && n % 2 === 0;
    let s: GameState = learnReducer({ ...initialState, names: ['A', 'B', 'C', 'D'], feedbackOn: false, learnOn: true, learnLevel: level, learnOnly: only }, { type: 'DEAL' });
    let quizzes = 0, steps = 0;
    while (s.phase !== 'hand-end' && steps++ < 500) {
        if (s.quiz) {
            quizzes++;
            const allowed = candidateSkills(s);
            if (!allowed.includes(s.quiz.skill)) problems.push(`learn ${n}: ${s.quiz.skill} asked at rung ${level}`);
            if (!s.quiz.say) problems.push(`learn ${n}: ${s.quiz.skill} has no say line`);
            const answer = s.quiz.kind === 'number' ? s.quiz.answer : s.quiz.answerIds;
            s = learnReducer(s, { type: 'ANSWER_QUIZ', value: answer });
            if (!s.quiz!.result!.correct) problems.push(`learn ${n}: own answer marked wrong`);
            s = learnReducer(s, { type: 'CLOSE_QUIZ' });
        } else if (s.phase === 'bidding') s = learnReducer(s, { type: 'AI_BID', playerIdx: s.bidTurn });
        else if (s.phase === 'choose-trump') s = learnReducer(s, { type: 'AI_CHOOSE_TRUMP' });
        else if (s.phase === 'doubling') s = learnReducer(s, { type: 'AI_DOUBLE' });
        else if (s.trick.length === 4) s = learnReducer(s, { type: 'CLEAR_TRICK' });
        else s = learnReducer(s, { type: 'AI_PLAY', playerIdx: s.turn });
    }
    if (s.phase !== 'hand-end') problems.push(`learn ${n}: stuck`);
    if (s.startHand.length !== 8) problems.push(`learn ${n}: start hand has ${s.startHand.length} cards`);
    if (level === 9 && !only && quizzes !== 8) problems.push(`learn ${n}: ${quizzes} questions at the top rung`);
    if (quizzes > 8) problems.push(`learn ${n}: ${quizzes} questions`);
    if (totalTally(s.handStats).right !== quizzes) problems.push(`learn ${n}: tally ${totalTally(s.handStats).right}/${quizzes}`);
}
Math.random = realRandom;
check(`${HANDS} hands finish cleanly`, problems.slice(0, 5), []);
const rate = callerWins / HANDS;
console.log(`  info bidders made ${(rate * 100).toFixed(0)}% of hands`);
check('bidders make between 30% and 90%', rate > 0.3 && rate < 0.9, true);

if (failures) {
    console.error(`\n${failures} check(s) failed`);
    process.exit(1);
}
console.log('\nAll checks passed');
