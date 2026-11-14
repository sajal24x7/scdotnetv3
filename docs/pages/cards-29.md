# 29 card game

A single-player version of 29, the trick-taking card game for two pairs, at `/games/cards-29/`. You play with a computer partner against two computer opponents.

## Files

| File | What it holds |
| --- | --- |
| `src/pages/games/cards-29/index.astro` | Standalone page shell (no site layout). Mounts the game with `client:load`. |
| `src/utils/twentyNine.ts` | Rules, the game state machine (`reducer`), the computer players and the move tips. No React and no DOM. |
| `src/utils/twentyNineLearn.ts` | Learn mode: the cards-left question (`topQuiz`), the timing rule (`chooseQuiz`) and `learnReducer`, which wraps the game reducer. |
| `src/components/games/TwentyNine.tsx` | The React UI: table, hand, bidding controls and animations. |
| `src/utils/__checks__/twentyNine.check.ts` | Rule checks plus 400 seeded hands played by the computer in every seat. |

Keep game logic in `twentyNine.ts` so it stays testable. The component should only render state and dispatch actions.

## Checks

```sh
node --experimental-strip-types src/utils/__checks__/twentyNine.check.ts
```

The simulated hands assert that every hand finishes, the points always add to 29, all 32 cards are played once, and no player breaks the follow-suit rule. The random generator is seeded, so a failure always reproduces. If you tune the computer bidding, keep an eye on the "bidders made" rate it prints.

## Hidden trump

Trump stays hidden until a player who cannot follow suit asks for it. Playing a trump-suit card does not reveal it. Until trump is open, a trump-suit card is a plain card and cannot win a trick of another suit, even when the bidder plays it.

- **Asking:** any player who is out of the led suit may ask (`ASK_TRUMP`). The bidder can do the same; the button then reads **Show trump**. Whoever asks must play a trump if they hold one (`legalCards`).
- **The trick trump opens in:** once trump is open, every trump-suit card in that trick counts as trump, including ones played before the ask.
- **Code:** `activeTrump(state)` returns the trump suit once it is open and `null` before. Pass it to `cardBeats` and `trickWinner`; never pass `state.trumpSuit` directly for deciding a trick.
- **Computer players:** defenders and the bidder's partner ask when the trick is worth taking. The computer bidder shows trump only when it holds a trump that would win the trick. Before trump is open, the bidder keeps its trump-suit cards rather than throwing them away as plain cards.

## Learn mode

Learn mode trains one skill: **Cards left**, every card of each suit still with the other three. Turn it on from the start screen or the **Learn** button in the header. On your turn the game may ask one question, and the computer players wait until you tap Continue.

### Cards left: the ranked list

Learn mode drills one method for tracking every card:

1. Start each suit with its ranked list: J, 9, A, 10, K, Q, 8, 7.
2. Take your own cards off at once. Holding the heart 9, the list is "J, A, 10, K, Q, 8, 7."
3. Cross cards off as they fall. When the heart J drops, the list is "A, 10, K, Q, 8, 7", and your 9 is now the top heart.
4. Say the list to yourself: "Hearts left: A, 10, K, Q, 8, 7."

You build each list from blank, one suit at a time:

- The prompt names a suit: "♦ Diamonds left?"
- Below it is a row of empty slots (eight minus your own cards, so the count gives nothing away).
- Under that is a strip of rank buttons, J 9 A 10 K Q 8 7. Tapping one moves it up into the row, which stays in ranked order. Tapping a card in the row puts it back.
- Your own ranks are marked "yours" and cannot be picked.
- The button reads "Next suit" (or "Check" on the last suit), or "None left" when you pick nothing.

Which suits: when following, the led suit. Otherwise the suits that changed most since last asked (`listSuits`). A lead after a full trick asks up to three suits in a row; other turns ask one. A suit with every card played is skipped.

The answer shows each suit's row: green for right, dashed red for missed, solid red for a card that is gone or yours. The working and the Say line have one line per suit, such as "Hearts left: A, 10, K, Q, 8, 7. My 9 is top." Helpers: `cardsLeft`, `listSuits` and `topQuiz` in `twentyNineLearn.ts`; the panel is `ListQuiz` in `TwentyNine.tsx`.

### When a question comes up

There is no fixed schedule. Before each of your turns, `chooseQuiz` counts the cards played since you were last asked (`learnMark`):

- First turn of the hand: ask.
- 4 or more cards since last asked: ask. When leading, up to three suits in a row; when following, one.
- 1 to 3 cards since last asked and you are leading: a quiet recap of one suit, skipped if you were asked on the last turn.
- Otherwise no question.

Every answer shows the working and a **Say** line, the short phrase to repeat to yourself during play.

Questions only use what you could know: your hand and the cards played. While learn mode is on, the running team points, the "Last trick" button and the log are hidden, since they would give the answers away. The learn bar shows your score for the hand, and the hand-end summary repeats the method if you missed any. The total (`learnStats`) is saved with the game, and **Reset** keeps it. Games saved with the old three-skill learn mode load with their cards-left score kept and the other skills dropped (`cleanLoaded`).

The checks play 40 hands in learn mode and answer each question with its own answer key.

## Hold tricks

With **Hold** on (the default), a finished trick stays on the table until you tap **Next trick** or the table. This gives you time to read all four cards whatever your seat. Turn it off in the header to have tricks clear on their own after about a second.

## Table and animations

All animation is plain CSS and the Web Animations API. There is no canvas or 3D library, so cards stay real buttons that work with keyboards and screen readers, and colours come from CSS variables for light and dark mode.

- **Dealing:** hand cards turn over one after another (`.deal-in`, staggered with the `--i` custom property).
- **Playing a card:** `TrickCard` uses a FLIP animation. It measures where the card came from (the tapped hand card, or the opponent's card backs) and flies it to its spot on the table. Computer players' cards turn face up in flight.
- **Winning a trick:** the winning card lifts, then all four cards slide towards the winner's seat just before the trick clears.
- **Trump reveal:** the trump label in the score bar flips over.
- **Reduced motion:** all of the above is skipped when the visitor has `prefers-reduced-motion: reduce` set.

Each card has a front and a back face (`backface-visibility: hidden`) so it can turn over in 3D. The hand is an overlapping fan, so eight cards fit on a 360px screen while the corner index stays visible.

## Saved games

The game state is saved in `localStorage` under `twenty-eight-state-v1`. The key keeps its old name so games saved before the rename still load.
