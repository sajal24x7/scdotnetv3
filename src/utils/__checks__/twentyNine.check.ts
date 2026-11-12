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
import { makeQuiz, checkAnswer, learnReducer, nearOptions, LEARN_LEVELS } from '../twentyNineLearn.ts';

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
    // You hold SJ S9 HK; played so far: HJ H9 HA H10 (trick) and S7 D8 C7 CJ.
    const st: GameState = {
        ...initialState, phase: 'playing', trumpSuit: 'S', caller: 0, tricksPlayed: 2,
        hands: [[c('SJ'), c('S9'), c('HK'), c('DQ')], [], [], []],
        played: ['HJ', 'H9', 'HA', 'H10', 'S7', 'D8', 'C7', 'CJ'],
        prevTrick: [
            { player: 0, card: c('HJ') }, { player: 1, card: c('H9') },
            { player: 2, card: c('HA') }, { player: 3, card: c('H10') },
        ],
    };
    const trick = makeQuiz(st, 'trick', 1)!;
    check('trick points', trick.answer, 7);
    check('trick options hold answer', trick.options.includes(7) && trick.options.length === 4, true);
    check('points left', makeQuiz(st, 'left', 1)!.answer, 28 - 10);
    const power = makeQuiz(st, 'power', 1)!;
    check('power: yours locked', power.lockedIds, ['SJ', 'S9']);
    check('power: still out', power.answerIds, ['DJ', 'D9', 'C9']);
    check('boss cards', makeQuiz(st, 'boss', 1)!.answerIds, ['SJ', 'S9', 'HK']);
    let suitQ = makeQuiz(st, 'suit', 1)!;
    for (let i = 0; i < 20 && !suitQ.question.includes('Spades'); i++) suitQ = makeQuiz(st, 'suit', 1)!;
    check('trump count', suitQ.answer, 8 - 1 - 2);
    const recall = makeQuiz(st, 'recall', 1)!;
    const suit = recall.pool[0].suit;
    check('recall excludes played and yours', recall.answerIds.every((id) => !st.played.includes(id) && id[0] === suit && !recall.lockedIds.includes(id)), true);
    check('card answer: exact set', checkAnswer(power, ['DJ', 'D9', 'C9']), true);
    check('card answer: missing one', checkAnswer(power, ['DJ', 'D9']), false);
    check('number answer', checkAnswer(trick, 7), true);
    check('options in range', nearOptions(0, 0, 12).every((n) => n >= 0) && nearOptions(0, 0, 12).length === 4, true);
    check('no trick question without a trick', makeQuiz({ ...st, prevTrick: [] }, 'trick', 1), null);
    const asked = learnReducer({ ...st, learnLevel: 2 }, { type: 'ANSWER_QUIZ', value: 0 });
    check('answer needs an open quiz', asked.handLearn.asked, 0);
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
// Every learn level asks a question after tricks 1-7, and play goes on after it.
for (const level of LEARN_LEVELS) {
    Math.random = seeded(1000 + level.id);
    let s: GameState = learnReducer({ ...initialState, names: ['A', 'B', 'C', 'D'], feedbackOn: false, learnLevel: level.id }, { type: 'DEAL' });
    let quizzes = 0, steps = 0;
    while (s.phase !== 'hand-end' && steps++ < 500) {
        if (s.quiz) {
            quizzes++;
            const answer = s.quiz.kind === 'number' ? s.quiz.answer : s.quiz.answerIds;
            s = learnReducer(s, { type: 'ANSWER_QUIZ', value: answer });
            if (!s.quiz!.result!.correct) problems.push(`learn ${level.id}: own answer marked wrong`);
            s = learnReducer(s, { type: 'CLOSE_QUIZ' });
        } else if (s.phase === 'bidding') s = learnReducer(s, { type: 'AI_BID', playerIdx: s.bidTurn });
        else if (s.phase === 'choose-trump') s = learnReducer(s, { type: 'AI_CHOOSE_TRUMP' });
        else if (s.phase === 'doubling') s = learnReducer(s, { type: 'AI_DOUBLE' });
        else if (s.trick.length === 4) s = learnReducer(s, { type: 'CLEAR_TRICK' });
        else s = learnReducer(s, { type: 'AI_PLAY', playerIdx: s.turn });
    }
    if (s.phase !== 'hand-end') problems.push(`learn ${level.id}: stuck`);
    if (quizzes < 6 || quizzes > 7) problems.push(`learn ${level.id}: ${quizzes} questions`);
    if (s.handLearn.right !== quizzes) problems.push(`learn ${level.id}: tally ${s.handLearn.right}/${quizzes}`);
}
check(`${HANDS} hands finish cleanly`, problems.slice(0, 5), []);
const rate = callerWins / HANDS;
console.log(`  info bidders made ${(rate * 100).toFixed(0)}% of hands`);
check('bidders make between 30% and 90%', rate > 0.3 && rate < 0.9, true);

if (failures) {
    console.error(`\n${failures} check(s) failed`);
    process.exit(1);
}
console.log('\nAll checks passed');
