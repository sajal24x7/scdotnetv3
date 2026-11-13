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
import { topQuiz, voidQuiz, trumpQuiz, topChangedSince, candidates, chooseQuiz, checkAnswer, learnReducer, totalTally, cleanLoaded, ALL_SKILLS } from '../twentyNineLearn.ts';

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
check('hidden trump: trump-suit 7 loses to led J', cardBeats(c('S7'), c('HJ'), 'H', null), false);

console.log('trickWinner');
check('highest of led suit', trickWinner([
    { player: 0, card: c('H10') }, { player: 1, card: c('HA') },
    { player: 2, card: c('DJ') }, { player: 3, card: c('H7') },
], 'H', 'S'), 1);
check('trump takes it', trickWinner([
    { player: 0, card: c('HJ') }, { player: 1, card: c('S7') },
    { player: 2, card: c('H9') }, { player: 3, card: c('S8') },
], 'H', 'S'), 3);
check('hidden trump: led suit takes it', trickWinner([
    { player: 0, card: c('HJ') }, { player: 1, card: c('S7') },
    { player: 2, card: c('H9') }, { player: 3, card: c('S8') },
], 'H', null), 0);

console.log('hidden trump');
{
    const base: GameState = { ...initialState, names: ['A', 'B', 'C', 'D'], phase: 'playing', trumpSuit: 'S', caller: 1, turn: 0 };
    // Spades are trump. Player 1 (the bidder) and player 3 throw spades without anyone asking.
    let s: GameState = { ...base, hands: [[c('HJ')], [c('S7')], [c('H9')], [c('SJ')]] };
    for (const p of [0, 1, 2, 3]) s = reducer(s, { type: 'PLAY_CARD', playerIdx: p, card: s.hands[p][0] });
    check('playing a trump-suit card does not reveal trump', s.trumpRevealed, false);
    check('unrevealed trump-suit cards are plain', s.lastTrickWinner, 0);
    // Player 3 asks, so trump opens and counts for the whole trick, including the bidder's S7.
    s = { ...base, hands: [[c('HJ')], [c('S7')], [c('H9')], [c('S8'), c('DA')]] };
    for (const p of [0, 1, 2]) s = reducer(s, { type: 'PLAY_CARD', playerIdx: p, card: s.hands[p][0] });
    s = reducer(s, { type: 'ASK_TRUMP', playerIdx: 3 });
    check('asker must trump', legalCards(s.hands[3], s, 3).map((x) => x.id), ['S8']);
    s = reducer(s, { type: 'PLAY_CARD', playerIdx: 3, card: c('S8') });
    check('asking reveals trump', s.trumpRevealed, true);
    check('trumps count in the trick trump opened in', s.lastTrickWinner, 3);
    // The bidder may show trump when out of the led suit.
    s = { ...base, turn: 1, trick: [{ player: 0, card: c('HJ') }], leadSuit: 'H', played: ['HJ'], playedBy: [0],
        hands: [[], [c('S7'), c('D7')], [c('H9')], [c('H8')]] };
    s = reducer(s, { type: 'ASK_TRUMP', playerIdx: 1 });
    check('bidder showing trump must trump', legalCards(s.hands[1], s, 1).map((x) => x.id), ['S7']);
}

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
    // You hold SJ S9 HK DQ; played so far: HJ H9 HA H10 (trick 1) and C7 S7 CJ D8 (trick 2).
    // In trick 2 clubs were led, player 1 trumped with S7 and player 3 threw D8.
    const st: GameState = {
        ...initialState, phase: 'playing', trumpSuit: 'S', caller: 0, tricksPlayed: 2, currentBid: 18,
        names: ['You', 'B', 'C', 'D'], turn: 0, dealSeq: 1,
        hands: [[c('SJ'), c('S9'), c('HK'), c('DQ')], [], [], []],
        played: ['HJ', 'H9', 'HA', 'H10', 'C7', 'S7', 'CJ', 'D8'],
        shownOut: [{ player: 1, suit: 'C', card: 'S7', trick: 2 }, { player: 3, suit: 'C', card: 'D8', trick: 2 }],
        teamPoints: { 0: 7, 1: 3 },
    };
    const trump = trumpQuiz(st, 1)!;
    check('trump count with the others', trump.answer, 8 - 1 - 2);
    check('trump say', trump.say, 'Spades, 5 out.');
    check('no trump count while trump is hidden', trumpQuiz({ ...st, caller: 1 }, 1), null);
    check('trump count once revealed', trumpQuiz({ ...st, caller: 1, trumpRevealed: true }, 1)!.answer, 5);
    const hearts = topQuiz(st, ['H'], 1)!;
    check('top: hearts after J 9 A 10', hearts.answerIds, ['HK']);
    check('top: one suit answers on one tap', hearts.single, true);
    check('top: your card is marked', hearts.yoursIds, ['HK']);
    check('top: say', hearts.say, 'Hearts: K is top.');
    const grid = topQuiz(st, ['S', 'H', 'D', 'C'], 1)!;
    check('top: every suit', [...grid.answerIds].sort(), ['C9', 'DJ', 'HK', 'SJ']);
    check('top: grid needs Check', grid.single, false);
    check('top: changed since start', topChangedSince(st, 0), ['H', 'C']);
    check('top: changed since trick 1', topChangedSince(st, 4), ['C']);
    check('top: a suit with no cards left is skipped',
        topQuiz({ ...st, played: ['HJ', 'H9', 'HA', 'H10', 'HK', 'HQ', 'H8', 'H7'] }, ['H'], 1), null);
    const voids = voidQuiz(st, 'C', 1);
    check('voids: who showed out', voids.answerIds, ['1', '3']);
    check('voids: say', voids.say, 'B and D out of clubs.');
    check('voids: nobody', voidQuiz(st, 'H', 1).answerIds, []);
    const onTable = { ...st, tricksPlayed: 1, shownOut: [{ player: 1, suit: 'C', card: 'S7', trick: 2 }] };
    check('voids: not while the card is on the table', voidQuiz(onTable, 'C', 1).answerIds, []);
    check('card answer: exact set', checkAnswer(voids, ['3', '1']), true);
    check('card answer: missing one', checkAnswer(voids, ['1']), false);
    check('number answer', checkAnswer(trump, 5), true);

    // When to ask. Leading with nothing asked yet: trump count first (you set trump), plus top cards and voids.
    const pri = (s: GameState) => Object.fromEntries(candidates(s, 1).map((x) => [x.quiz.skill, x.priority]));
    check('leading: every skill fits', pri(st), { top: 3, voids: 2, trump: 3 });
    const marked = { ...st, learnMarks: { top: 8, voids: 8, trump: 8 }, learnLastTrick: 1 };
    check('nothing new: only quiet recaps, skipped after a question last turn', chooseQuiz(marked, 1), null);
    check('nothing new: a recap after a quiet turn', chooseQuiz({ ...marked, learnLastTrick: 0 }, 1) !== null, true);
    // Clubs led to you; D (player 3) plays after you and is out of clubs.
    const follow = { ...marked, trick: [{ player: 1, card: c('CK') }, { player: 2, card: c('C8') }], leadSuit: 'C', turn: 0,
        played: [...st.played, 'CK', 'C8'] };
    check('following: a later player out of the led suit', pri(follow).voids, 3);
    check('following: a trump fell since last asked', pri({ ...follow, learnMarks: { ...follow.learnMarks, trump: 4 } }).trump, 3);
    check('only chosen skills', candidates({ ...st, learnSkills: ['voids'] }, 1).map((x) => x.quiz.skill), ['voids']);
    check('tie goes to the skill asked longest ago', chooseQuiz({ ...st, learnMarks: { top: 4 } }, 1)!.skill, 'trump');

    const old = cleanLoaded({ ...st, learnSkills: undefined as never, learnStats: { jn: { asked: 3, right: 2 }, top: { asked: 1, right: 1 } } as never,
        quiz: { ...trump, skill: 'jn' as never } });
    check('old saves: old skills and questions dropped', [old.learnSkills, old.learnStats, old.quiz], [ALL_SKILLS, { top: { asked: 1, right: 1 } }, null]);
    const asked = learnReducer({ ...st, learnOn: true }, { type: 'ANSWER_QUIZ', value: 0 });
    check('answer needs an open quiz', asked.handStats, {});
    const on = learnReducer(st, { type: 'SET_LEARN', on: true });
    check('turning on asks at once on your turn', on.quiz !== null, true);
    const off = learnReducer({ ...on, learnSkills: ALL_SKILLS }, { type: 'TOGGLE_LEARN_SKILL', skill: on.quiz!.skill });
    check('turning a skill off swaps its open question', off.quiz?.skill !== on.quiz!.skill, true);
    const last = learnReducer({ ...st, learnSkills: ['top'] }, { type: 'TOGGLE_LEARN_SKILL', skill: 'top' });
    check('the last skill stays on', last.learnSkills, ['top']);
    const answered = learnReducer(learnReducer(on, { type: 'ANSWER_QUIZ', value: on.quiz!.kind === 'number' ? on.quiz!.answer : on.quiz!.answerIds }), { type: 'CLOSE_QUIZ' });
    check('answers count', totalTally(answered.learnStats), { asked: 1, right: 1 });
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
// Learn mode asks at most once per turn, only skills you chose, and play goes on after it.
const asked: Record<string, number> = {};
for (let n = 0; n < 40; n++) {
    Math.random = seeded(1000 + n);
    const skills = n < 20 ? ALL_SKILLS : [ALL_SKILLS[n % 3]];
    let s: GameState = learnReducer({ ...initialState, names: ['A', 'B', 'C', 'D'], feedbackOn: false, learnOn: true, learnSkills: skills }, { type: 'DEAL' });
    let quizzes = 0, steps = 0;
    while (s.phase !== 'hand-end' && steps++ < 500) {
        if (s.quiz) {
            quizzes++;
            asked[s.quiz.skill] = (asked[s.quiz.skill] ?? 0) + 1;
            if (!skills.includes(s.quiz.skill)) problems.push(`learn ${n}: ${s.quiz.skill} asked but not chosen`);
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
    if (quizzes > 8) problems.push(`learn ${n}: ${quizzes} questions`);
    if (totalTally(s.handStats).right !== quizzes) problems.push(`learn ${n}: tally ${totalTally(s.handStats).right}/${quizzes}`);
}
console.log(`  info learn questions asked: ${JSON.stringify(asked)}`);
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
