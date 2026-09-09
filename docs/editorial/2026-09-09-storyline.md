# Story line — what the diagram shows, 2026-09-09

*Self-contained working doc. The diagram is the `/storyline` page of the site: run `bun run dev:site` and open http://localhost:4321/storyline. Its data is `src/storyline/threads.ts`: thirty threads, each an idea or question the reader carries, anchored to exact quotes from `book.mdx`. The build fails with a list of broken quotes when the manuscript drifts, so fix the quote, not the book. Every open item below carries **What** (the move), **Why** (the reasoning), and **Your call** (the part left to you). Locations are grep-able quotes because line numbers drift.*

*How to read the diagram: one row per thread. A hollow dot is a plant (the idea is hinted), a small filled dot is a use, the large blue dot is where the book explains it, the orange diamond is the payoff. The dotted line runs from the first hint to the explanation; the blue line from the explanation to the payoff. Red dots are ideas used before the book explains them. A red dashed line is a promise with no payoff. Hover a dot for the quote; click it to open that spot in the book.*

## The shape

| Part | Words | Opens | Explains | Pays off |
| --- | ---: | ---: | ---: | ---: |
| Overview | 72 | 1 | 0 | 0 |
| Introduction | 1,373 | 9 | 2 | 0 |
| Part 1: The Machine Mind | 7,724 | 9 | 7 | 1 |
| Part 2: Domains | 12,583 | 10 | 7 | 3 |
| Part 3: The Ascent | 17,294 | 1 | 10 | 13 |
| Conclusion | 1,381 | 0 | 0 | 8 |

Three things stand out.

**The book is a long inhale and a short exhale.** The Introduction opens nine questions in 1,400 words and answers none. Part 1 answers one of its own (why AI is smart and stupid at once) and hands the rest to Part 3. Part 2 opens ten more and pays three: token anxiety, cognitive debt, and Socrates' worry, the last two both in Today's Socrates Moment. Part 3 opens one thread and closes thirteen. The Conclusion closes eight in 1,400 words, one sentence each. This is a legitimate shape for an argument. It also means the payoffs come late and fast, and the Conclusion only lands if the reader still holds setups that are, for the Part 1 threads, thirty-five thousand words old. The Conclusion already re-states dopamine in one line (`Dopamine encodes reward prediction error`) before cashing it. The other seven it cashes without a reminder.

**There is a payoff desert in the middle of Part 2.** Between Token Anxiety (30%) and Today's Socrates Moment (54%), no book-level thread pays off. Love & Connection and Creativity, together 9,700 words, run on their chapter-internal arcs alone. The Love chapter's own arc is strong (the "wouldn't it be nice" bait and the cringe), so this may be fine. It is worth knowing that the reader's only book-level rewards in that stretch are the Lover and Hammer designs.

**The longest tensions are the Introduction's.** The tumor, adversity, companions, meaning, the God promise, and the thesis all open before 4% and pay off after 93%. That is the book's spine and it holds. The gym thread is the exception: it opens at 3% (`I have to forcibly slow myself down`) and pays off at 66% with The Mental Gym, which gives the middle of Part 3 its one big landing.

## Red: used before it is explained

- [ ] **Name "sampling" in Part 1**
  - *What:* In Tokens And The Context Window, `We’ll pick one of the most-likely ones at random` never uses the word. The Good-Enough Rocket then says `Like we discussed before, this probably has something to do with sampling`. Add the word where the mechanism is: "...at random (this step is called *sampling*)".
  - *Why:* The callback points at a term the reader never met. The 2026-08-09 plan already calls this "the sampling sentence" and counts three payoffs on it; the first of the three currently refers to a word that is not there.
  - *Your call:* One word, or a clause that also says why the exact most-likely token is boring? The Conclusion's `The Inevitable` cashes exactly that, so the clause would plant the ending.
- [ ] **Decide what "dopamine" means in Part 2**
  - *What:* Three mentions come before Why We Do What We Do explains it: `your brain squirts some dopamine` (Transmissionism), `highly dopaminergic content` (The Business of Companionship), `our dopamine, norepinephrine and serotonin systems` (Where Does Creativity Come From?).
  - *Why:* The Conclusion's hinge is `Dopamine encodes reward prediction error`. It lands only if the reader has the mechanism. Part 2 teaches the pop meaning (dopamine is pleasure), which Part 3 then has to unteach: `It’s important to know that dopamine does not feel “good.”`
  - *Your call:* Keep the pop usage as deliberate bait and let Part 3 correct it out loud ("you have read that word three times in this book already, and each time it meant something slightly wrong"), or swap the three for plain words (a rush, addictive, drive) so the term arrives once, correctly?
- [ ] **Define alignment where Alignment Faking appears**
  - *What:* `#### Alignment Faking` (Part 1) uses the term; `is called *alignment*` (Alignment Research, Part 3) defines it, twenty-six thousand words later. One clause in the section's first sentence does it.
  - *Why:* The section is clear on its own, but the word also carries the title of Designing Aligned Allies, and the reader meets both before the definition.
  - *Your call:* Define it in Part 1, or rename the Part 1 section to what it shows ("Pretending to be good when watched") and let the definition stay where it is?
- [ ] **"The theme of the book so far"**
  - *What:* Biology's Unmet Hunger: `as the theme of the book has been so far, in many ways we're attracted to the benefits of artificial intelligence because of what it gives our *conscious* mind, *right now*, but we forget the subtle subconscious and long-term effects`.
  - *Why:* This is the first time the book states its now-versus-later theme in one sentence, at 44%, inside a subsection about smell and touch. The Forge of Meaning restates it at 63% as hedonia and eudaimonia. As it stands, "so far" asks the reader to have noticed a theme nobody named.
  - *Your call:* Is this sentence the plant for the Forge (then give it its own paragraph, it is doing more work than its position suggests), or should the theme be stated once in the Introduction so "so far" is true?

## Owed: promised, never paid off

- [ ] **The debt collector**
  - *What:* `a faint image of a debt collector on the horizon and we're not quite sure yet how quickly they're walking or what they'll have to say` closes Disappearing Depth. Nothing returns to it. Two candidate spots: Food For Thought, at `dramatically increases the complexity and difficulty of the tasks that are left for me to do` (the collector is the harder work that remains), or Captured by Consumption, at `comfortable and hollow, wondering what went wrong` (the collector is the hollowness).
  - *Why:* "We're not sure yet" is a promise. A reader who liked the image is waiting.
  - *Your call:* Which debt is it, skill or satisfaction? The book's own answer (`It was never about the skills.`) points at the second.
- [ ] **Siren or muse**
  - *What:* `more of a siren than a muse` in the Love & Connection intro, once. The TODO `The work of this guy writing about siren vs. muse?` is still open. The Lover And The Hammer is the natural payoff: the lover-only companion is the siren, the hammer is the muse.
  - *Why:* One image, one use, and the chapter's closing section already has the two halves it maps onto.
  - *Your call:* Pay it off in The Lover And The Hammer with one sentence, cut it, or find the source first?
- [ ] **The mountain trail, and the Part title**
  - *What:* Part 3 is "The Ascent". Captured by Consumption opens on `the uphill mountain trails` and `the magnificent view on the mountaintop`. Neither the trail nor the view returns; the only later mountain is the sports flag in Falling in Love with Resistance (`plant the flag on the most impossible-to-climb mountain`), a different image. The Part ends on God and the Conclusion ends at the sideboard.
  - *Why:* A Part title is the biggest promise in the book, and it is made of an image the book uses once.
  - *Your call:* Return to the mountain once (the last paragraph of When Superintelligence Turns Away, or the sideboard scene: the view was never the point, the trail was), or rename the Part to what it delivers?

## Cold opens worth a plant

- [ ] **Awareness arrives as a creativity footnote**
  - *What:* `what I’d call consciousness or awareness` is introduced in Awareness and Creativity at 50%. Re-Remembering then calls it `the most important skill we can develop in a world of AI`, and Arbiters of Presence calls it `the key`. Pretend-Thinking already holds the machine half (`The thoughts a language model presents are not always the thoughts it actually has`); add the human half there in one sentence: we can notice a thought while we think it, and the model cannot.
  - *Why:* The largest claim in Part 3 rests on a concept the reader met as a side note in a domain chapter.
  - *Your call:* Plant it in Part 1, or move the "structurally incapable of self-introspection" argument out of Creativity into Re-Remembering and leave Creativity with a pointer?
- [ ] **Consecration is coined at 93%**
  - *What:* `What remains? Consecration.` is the word's first appearance. The Conclusion uses it once more (`We can only consecrate through *decision*`). Nothing earlier says "set apart". The word "sacred" appears only in the Overview, in the title.
  - *Why:* The 2026-08-09 plan lists the consecration family as a title candidate. If it becomes the title, the reader meets the title's idea five pages from the end.
  - *Your call:* Plant "set apart" in the Introduction (`There’s something special about moments like this` is one sentence away from it) or in The Forge of Meaning, or accept that the word is the book's last reveal?

## Sequence

- [ ] **"Then comes" points two chapters back**
  - *What:* When Superintelligence Turns Away opens with `Then comes the more philosophical and controversial part: tweaking severity and chronicity of hardship...on purpose`. Severity and chronicity are the four knobs in Facilitating Growth Through Challenge, two chapters earlier; New World, New Scarcity and AI as Infinite Creation sit in between.
  - *Why:* The transition reads as if the knobs were on the previous page.
  - *Your call:* Re-anchor the sentence ("In Designing Aligned Allies we tuned severity and chronicity by hand. Now let a superintelligence do it."), or move the chapter to directly after Designing Aligned Allies? The move puts God before New World and costs you the God-then-Conclusion crescendo.
- [ ] **The Lover and The Hammer is Part 3 material inside Part 2**
  - *What:* The design thread's first dot is `There are a few ways we could build this.` at 46%, well before Designing Aligned Allies opens the design question at 75%. It is the only "how to build it" section inside the Domains.
  - *Why:* The 2026-08-09 plan moved it to close Love & Connection on purpose. The diagram shows the cost: the reader gets solutions before the book has argued that solutions are needed.
  - *Your call:* Keep it as a chapter closer and add one line that says so ("we'll come back to building this in Part 3"), or move it under Facilitating Growth Through Challenge?
- [ ] **The Overview still sells the first thesis** (carried over from 2026-08-09)
  - *What:* The thesis thread opens with `comes from *trying to solve our problems*, not having solved them` and pays off with `accepting imperfection` and `Turns out happiness isn’t what we need`.
  - *Why:* The promise and the payoff use different words. A reader who checks the first page against the last finds two books.
  - *Your call:* Unchanged from the earlier doc.
- [ ] **Error minimization** (carried over from 2026-08-09)
  - *What:* The next-token thread's payoff, `You could call this The Inevitable`, cashes `predict the next word` from Part 1. Neither the plant nor the harvest says "error minimization" yet.
  - *Why:* Same arc as before; both items are still open.

## Copyedit catches from the mapping

- [ ] `*pain without gain* is possible` (Can you grow without trauma?) should read "gain without pain"; the cited paper is "Gains without pains?".
- [ ] Today's Socrates Moment opens on Socrates and then says `What I think Plato realized`. Pick one, or say why it is Plato.
- [ ] `in the post-training phase` (Hallucinations) comes before post-training is introduced in Language Models are Screenplay Writers.

## Keeping the diagram honest

Each thread in `src/storyline/threads.ts` has a title, the question the reader carries, and a list of quotes with a kind: `plant`, `use`, `explain`, or `payoff`. A `use` before the `explain` is red. A thread with a `plant` and no `payoff` is owed. The resolver (`src/storyline/resolve.ts`) has tests; run `bun test src/storyline`. When you add a plant or a payoff to the book, add the quote here and the diagram moves with it.
