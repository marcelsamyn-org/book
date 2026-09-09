# Story line — what the diagram shows, 2026-09-09

*The diagram is the `/storyline` page of the site: run `bun run dev:site` and open http://localhost:4321/storyline. Its data is `src/storyline/threads.ts`: thirty threads, each an idea or question the reader carries, anchored to exact quotes from `book.mdx`. The build fails with a list of broken quotes when the manuscript drifts, so fix the quote, not the book. The items the diagram flagged are tracked in the status doc, `2026-08-09-status-and-plan.md`, under "Story line". This doc explains how to read the diagram and what it says about the book's shape.*

## How to read the diagram

One row per thread. A hollow dot is a plant: the idea is hinted. A small filled dot is a use. The large blue dot is where the book explains the idea. The orange diamond is the payoff. The dotted line runs from the first hint to the explanation; the blue line from the explanation to the payoff. Red dots are ideas used before the book explains them. A red dashed line is a promise with no payoff. Hover a dot for the quote and its section; click it to open that spot in the book. Hover a chapter to see its column.

## The shape

| Part | Words | Opens | Explains | Pays off |
| --- | ---: | ---: | ---: | ---: |
| Overview | 72 | 1 | 0 | 0 |
| Introduction | 1,373 | 9 | 2 | 0 |
| Part 1: The Machine Mind | 7,724 | 9 | 7 | 1 |
| Part 2: Domains | 12,583 | 10 | 7 | 3 |
| Part 3: The Ascent | 17,294 | 1 | 10 | 13 |
| Conclusion | 1,381 | 0 | 0 | 8 |

**The book opens most of its questions early and answers most of them late.** The Introduction opens nine threads in 1,400 words and pays off none. Part 1 pays off one of its own (why AI is smart and stupid at once) and hands the rest to Part 3. Part 2 opens ten more and pays off three: token anxiety, cognitive debt, and Socrates' worry, the last two both in Today's Socrates Moment. Part 3 opens one thread and closes thirteen. The Conclusion closes eight in 1,400 words, one sentence each. This is a workable shape for an argument. It also means the Conclusion only lands if the reader still holds setups that are, for the Part 1 threads, thirty-five thousand words old. The Conclusion re-states dopamine in one line (`Dopamine encodes reward prediction error`) before cashing it. The other seven it cashes without a reminder.

**No book-level thread pays off between Token Anxiety (30%) and Today's Socrates Moment (54%).** Love & Connection and Creativity, together 9,700 words, run on their own chapter arcs. The Love chapter's arc is strong (the "wouldn't it be nice" bait and the cringe), so this may be fine. The reader's only book-level rewards in that stretch are the Lover and Hammer designs.

**The threads that open in the Introduction run the length of the book.** The tumor, adversity, companions, meaning, the God promise, and the thesis all open before 4% and pay off after 93%. That is the book's spine and it holds. The gym thread is the exception: it opens at 3% (`I have to forcibly slow myself down`) and pays off at 66% with The Mental Gym, which gives the middle of Part 3 its one big landing.

## Keeping the diagram honest

Each thread in `src/storyline/threads.ts` has a title, the question the reader carries, and a list of quotes with a kind: `plant`, `use`, `explain`, or `payoff`. A `use` before the `explain` is red. A thread with a `plant` and no `payoff` is owed. The resolver (`src/storyline/resolve.ts`) has tests; run `bun test src/storyline`. When you add a plant or a payoff to the book, add the quote here and the diagram moves with it. When you fix an item from the status doc, update the quote or the kind so the flag clears.
