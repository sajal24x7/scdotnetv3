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

## Learn mode

Learn mode builds the habit of tracking what strong players track. Turn it on from the start screen or the **Learn** button in the header. Before each of your turns the game asks one question that fits that moment, and the computer players wait until you tap Continue.

### What to track

In order of value. The same list is shown on the start screen.

| Skill | What to know | When it is asked |
| --- | --- | --- |
| Trumps | How many trumps are still with the other players. | Any turn, once you know trump. |
| Boss cards | Which of your cards are now the highest left in their suit. | When you lead. |
| Voids | Who has run out of a suit. They can trump it or throw points on it. | Once another player has failed to follow suit. |
| Bid target | How many more points your side needs. Defenders need 29 − bid + 1. | Any turn. |
| Suit count | How many cards of the led suit the others still hold. | When following, before trump is open. |
| Endgame | Every card still out. | Once per hand, when you have three cards left. |

Each turn picks one question from those that fit, weighted towards Trumps, and avoids repeating the last one. Questions only use what you could know: your hand, the cards played, and who failed to follow suit (`shownOut` in the game state). Each answer shows the working, for example `8 ♥ in the deck. 3 played, 2 in your hand, so 3 with the others.`

While learn mode is on, the running team points, the "Last trick" button and the log are hidden, since they would give the answers away. The hand-end summary shows your score per skill for that hand and names the weakest one. Totals per skill are saved with the game and shown on the start screen.

To add a question type, add a `Skill` and an entry in `SKILLS`, a case in `makeQuiz`, a weight in `WEIGHT`, and add it to `candidateSkills`. The checks play 20 hands in learn mode and answer each question with its own answer key.

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
