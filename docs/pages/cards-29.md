# 29 card game

A single-player version of 29, the trick-taking card game for two pairs, at `/games/cards-29/`. You play with a computer partner against two computer opponents.

## Files

| File | What it holds |
| --- | --- |
| `src/pages/games/cards-29/index.astro` | Standalone page shell (no site layout). Mounts the game with `client:load`. |
| `src/utils/twentyNine.ts` | Rules, the game state machine (`reducer`), the computer players and the move tips. No React and no DOM. |
| `src/utils/twentyNineLearn.ts` | Learn mode: the counting levels, question builders and `learnReducer`, which wraps the game reducer. |
| `src/components/games/TwentyNine.tsx` | The React UI: table, hand, bidding controls and animations. |
| `src/utils/__checks__/twentyNine.check.ts` | Rule checks plus 400 seeded hands played by the computer in every seat. |

Keep game logic in `twentyNine.ts` so it stays testable. The component should only render state and dispatch actions.

## Checks

```sh
node --experimental-strip-types src/utils/__checks__/twentyNine.check.ts
```

The simulated hands assert that every hand finishes, the points always add to 29, all 32 cards are played once, and no player breaks the follow-suit rule. The random generator is seeded, so a failure always reproduces. If you tune the computer bidding, keep an eye on the "bidders made" rate it prints.

## Learn mode

Learn mode drills card counting. Pick a level on the start screen, or from the **Learn** button in the header during a game. After each of the first seven tricks the table pauses and asks one question. The computer players wait until you answer and tap Continue.

| Level | Skill | Question |
| --- | --- | --- |
| 1 | Trick points | How many points were in the trick that just ended? |
| 2 | Points left | How many of the 28 card points have not been played? |
| 3 | Jacks and 9s | Which Jacks and 9s do the other players still hold? |
| 4 | Suit count | How many cards of a suit do the others hold? Asks about trump most often once you know it. |
| 5 | Boss cards | Which of your cards are the highest left in their suit? |
| 6 | Full recall | Exactly which cards of a suit are still out? |
| 7 | Mixed | Any of the above at random. |

Questions only use what you could know: your own hand and the cards already played. Each answer shows the working, for example `8 ♥ in the deck. 3 played, 2 in your hand, so 3 with the others.`

While learn mode is on, the running team points, the "Last trick" button and the log are hidden, since they would give the answers away. The hand-end summary shows your score for the hand and offers the next level after a clean hand. Per-level totals are saved with the game and shown under the level picker.

To add a question type, add a `Skill`, a case in `makeQuiz`, and a level in `LEARN_LEVELS`. The checks play one hand at every level and answer each question with its own answer key.

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
