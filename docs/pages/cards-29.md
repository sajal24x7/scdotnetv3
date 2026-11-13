# 29 card game

A single-player version of 29, the trick-taking card game for two pairs, at `/games/cards-29/`. You play with a computer partner against two computer opponents.

## Files

| File | What it holds |
| --- | --- |
| `src/pages/games/cards-29/index.astro` | Standalone page shell (no site layout). Mounts the game with `client:load`. |
| `src/utils/twentyNine.ts` | Rules, the game state machine (`reducer`), the computer players and the move tips. No React and no DOM. |
| `src/utils/twentyNineLearn.ts` | Learn mode: the three skills (`SKILLS`), question builders, the timing rules (`candidates`, `chooseQuiz`) and `learnReducer`, which wraps the game reducer. |
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

Learn mode trains three card-tracking skills. Turn it on from the start screen or the **Learn** button in the header. On your turn the game may ask one question, and the computer players wait until you tap Continue.

| Skill id | Name | Remember | Say |
| --- | --- | --- | --- |
| `top` | Top cards | The highest card still in play in each suit. | "Hearts: A is top." |
| `voids` | Voids | Who has run out of which suit. | "West out of clubs." |
| `trump` | Trumps left | How many trumps the other three still hold. | "Spades, 3 out." |

The list is `SKILLS` in `src/utils/twentyNineLearn.ts`. Tap a skill chip on the start screen or in the learn bar to turn it on or off. At least one stays on.

### When a question comes up

There is no fixed schedule. Before each of your turns, `candidates` looks at what has happened since each skill was last asked (`learnMarks`, the number of cards played at that point) and gives each fitting question a priority:

| Skill | Priority 3 (ask now) | Priority 2 | Priority 1 (quiet recap) |
| --- | --- | --- | --- |
| Top cards | Leading: the top card of 2+ suits has fallen (asks all suits), or of one suit you hold. Following: the led suit's top has fallen. | One other suit's top fell. | The led suit's top is not the J, or any top has changed this hand. |
| Voids | Following: a player still to play is out of the led suit. | A new void from a finished trick, or you are leading a suit someone is out of. | Leading: a suit you hold that nobody is out of (answer "nobody"). |
| Trumps left | First turn once you know trump (from the start if you set trump, else once someone asks for it), or a trump has fallen since last asked. | You are out of the led suit and could trump. | Leading, 8+ cards since last asked. |

`chooseQuiz` asks the highest priority. A tie goes to the skill asked longest ago. A priority 1 recap is skipped if you were asked a question on the last turn, and turns with nothing to ask have no question. Voids from the trick on the table are not asked until that trick is finished, since the card is still in view.

**Question types.** Top cards shows the 8 cards of a suit and one tap answers. When several suits changed it shows every suit with cards left, and you tap the top card of each, then Check. Your own cards are marked "yours" and still count as in play. Voids asks who is out of a suit. Trumps left asks a number from 0 to 8.

Every answer shows the working and a **Say** line, the short phrase to repeat to yourself during play.

Questions only use what you could know: your hand, the cards played, and who failed to follow suit (`shownOut` in the game state). While learn mode is on, the running team points, the "Last trick" button and the log are hidden, since they would give the answers away. The learn bar shows your score per skill for the hand, and the hand-end summary names the weakest skill. Totals per skill (`learnStats`) are saved with the game, and **Reset** keeps them.

To add a skill, add a `Skill` id and an entry in `SKILLS`, a question builder, and a block in `candidates` that sets its priority. The checks play 40 hands in learn mode with all skills and with each skill alone, and answer each question with its own answer key.

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
