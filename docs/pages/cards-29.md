# 29 card game

A single-player version of 29, the trick-taking card game for two pairs, at `/games/cards-29/`. You play with a computer partner against two computer opponents.

## Files

| File | What it holds |
| --- | --- |
| `src/pages/games/cards-29/index.astro` | Standalone page shell (no site layout). Mounts the game with `client:load`. |
| `src/utils/twentyNine.ts` | Rules, the game state machine (`reducer`), the computer players and the move tips. No React and no DOM. |
| `src/utils/twentyNineLearn.ts` | Learn mode: the strategy list (`SKILLS`), question builders and `learnReducer`, which wraps the game reducer. |
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

Learn mode teaches card tracking as a ladder of nine rungs. Each rung adds one thing to remember, so you never have to hold all 32 cards in your head at once. Turn it on from the start screen or the **Learn** button in the header. Before each of your turns the game asks one question, and the computer players wait until you tap Continue.

### The ladder

The rungs are listed in `RUNGS` in `src/utils/twentyNineLearn.ts`. The same list is shown on the start screen.

| Rung | Skill id | Remember | Say | Asked when |
| --- | --- | --- | --- | --- |
| 1. J's and 9's | `jn` | Which J's and 9's are gone. | "Heart 9 gone." | After the first 4 cards are played. |
| 2. Voids | `voids` | Who has run out of which suit. | "West out of clubs." | Once another player has failed to follow suit. |
| 3. Your longest suit | `long` | How many cards are left in that one suit. | "3 hearts left." | Any turn. |
| 4. A second suit | `second` | The count for the suit where you hold an A or 10. | "2 spades left." | Any turn. |
| 5. All four suits | `suits` | How many are left in every suit. | "Clubs down to 1." | Any turn. Often the led suit. |
| 6. A's and 10's | `at` | Which A's and 10's are gone. Sometimes asks all 16 point cards. | "Diamond A gone." | After the first 4 cards are played. |
| 7. Guess the trump | `guess` | Which suits the bidder runs out of before playing one. | "Bidder had no hearts, not hearts." | While trump is hidden from you and the bidder has run out of a suit they never played. |
| 8. Count trumps | `trump` | How many trumps are left once trump is known. | "Trump is spades, 3 left." | Once you know trump. |
| 9. Points | `points` | Points each team has won versus the bid. | "We have 12, they need 18." | Any turn. |

Every answer shows the working and a **Say** line, the short phrase to repeat to yourself during play.

**Focus suits (rungs 3 and 4).** These are fixed when play starts, from your 8 cards (`startHand` in the game state). The longest suit breaks ties by points, then by the higher top card. The second suit is another suit where you held an A or 10, or else the next longest. The learn bar shows them during play.

**Guess the trump (rung 7).** Playing a trump-suit card does not open trump (see [Hidden trump](#hidden-trump)), so most plays tell you nothing. But the bidder picks trump from a suit in their first four cards. If the bidder runs out of a suit before playing any card of it, they never held it, so it is not trump. The question asks which suits could still be trump. It uses `playedBy` in the game state to know who played each card.

### Picking a rung and moving up

- **Pick a rung** by tapping it on the start screen, or from the rung menu in the learn bar during play.
- **With review** (the default) asks your rung about 60% of the time, and a lower rung the rest of the time, never the same lower rung twice in a row. If your rung has no question that fits the moment, a lower rung is asked instead.
- **This rung only** asks only your rung, and skips turns where it does not fit.
- **Moving up:** when at least 8 of your last 10 answers on your rung are right (`isReady`), the learn bar offers **Move up**. That rung also gets a ✅ on the ladder. You can still switch to any rung at any time.

Questions only use what you could know: your hand, the cards played, and who failed to follow suit (`shownOut` in the game state). While learn mode is on, the running team points, the "Last trick" button and the log are hidden, since they would give the answers away. The hand-end summary shows your score per rung for that hand and names the weakest one. Totals per rung (`learnStats`), the last 10 answers per rung (`learnRecent`) and the rungs passed (`learnPassed`) are saved with the game. **Reset** keeps them.

To add a rung, add a `Skill` id and an entry in `RUNGS`, and a case in `makeQuiz` that returns `null` when the question does not fit. The checks play 40 hands in learn mode at different rungs and answer each question with its own answer key.

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
