# Imagery and charts — what to add, 2026-09-21

*Twenty-two candidates: the three imagery TODOs already in `book.mdx`, plus nineteen places where a figure would carry something the prose currently asserts. Each item has **What** (the figure), **Why** (what it does that prose can't), and **Your call** (the part left to you). Locations are grep-able quotes from `book.mdx`, because line numbers drift. Priority is H, M, or L.*

*One thing to decide before any of this: the book has no figures today apart from the three part plates and four exhibit components. Adding charts changes what kind of book it is. A reader who sees a chart expects measured numbers, and several of the numbers here are your own unpublished tests or forward projections. The Production notes section at the end covers how to keep that honest.*

## Built, 2026-09-21

All six of the shortlist are in the manuscript and render in the site, the PDF and the EPUB.

1. **The capability curve** (How smart is AI) — resolved `"TODO: Add graphs"`.
2. **The relationship-advice results** (Parroting The Internet) — your own data, was seven bullets.
3. **The attachment lineage** (Why We Get Attached To Machines) — resolved `"TODO: Add pictures"`.
4. **The inverted U** (Post-Traumatic Growth) — the thesis shape, named twice, now drawn.
5. **The ladder of scarcity** (Is that it?) — three rungs abundant, one standing alone.
6. **Poiesis and the unmade** (AI as Infinite Creation) — five traditions, two columns.

Two decisions are still yours, and each is a one-line edit in `book.mdx`:

- **Where the capability series comes from.** It has no citation in `references.yaml`, and the figure now plots all six points the same way, matching your prose, which states the 2026 figure as fact. If any of them are your own projection rather than a published measurement, add `projected: true` to those points and they draw dashed under a key that says so.
- **The break-up method line.** The caption states the method in one sentence. Replace it with the real numbers when you have them: how many posts, collected when, how many runs per model.

The adversity figure plots Seery, Holman and Silver's own fitted model, from Table 2 of the paper. Each curve is `z(x) = b·x + q·x²`, with the coefficients as they report them at no adversity. Their reported slopes at high adversity fix where "high" sits on the axis, and all four outcomes agree on it to within 0.014, which the code checks on every build. Life satisfaction peaks at 1.70 standard deviations and is back to +0.012 by high adversity, which is Figure 1.

The rest of this document is the original analysis, unchanged. The items below the shortlist are still open.

## The three imagery TODOs in the manuscript

- [x] **The capability curve** — `"TODO: Add graphs"`, How smart is AI. Priority H
  - *What:* One line chart of the task-length numbers you already list: 6 seconds in 2020, 36 seconds in 2022, 4 minutes in 2023, 11 minutes in 2024, 3 hours 23 minutes in 2025, 12 hours in early 2026. Log scale on the y-axis, with a few human-scale reference bands ("a tweet", "a code review", "a working day") along the side.
  - *Why:* The paragraph's claim is `"AI though is growing at a *hyper*-exponential pace. That's an exponential of an exponential."` A linear axis hides the first four points entirely. A log axis is the only one that shows the claim, because a plain exponential is a straight line on a log axis and a hyper-exponential bends upward. The chart is the argument, not decoration for it.
  - *Your call:* The points from 2025 on are the book's forward setting, not published measurement. Mark the projected points differently, cite the source for the measured ones, or state the whole series as your own estimate — an unmarked chart reads as measured data.

- [x] **The attachment lineage** — `"TODO: Add pictures"`, Why We Get Attached To Machines. Priority H
  - *What:* Not product photos. A timeline strip in the part-plate visual language — ELIZA 1966, Tamagotchi 1996, AIBO and Paro, LLM companions — where each era adds the attachment ingredient it introduced, so the ingredients accumulate left to right and the last column has all of them.
  - *Why:* Three product photos would illustrate the passage. This shows the passage's actual claim, which is that each technology added one ingredient and language models are the first to hold every one at once. It also avoids clearing rights on Tamagotchi, AIBO, and Paro imagery for a commercially sold ebook.
  - *Your call:* Making this figure forces a reconciliation you'll have to do anyway. The prose names self-disclosure at ELIZA (`“the next ingredient we’ve just discovered is **self-disclosure**”`) and neediness at Tamagotchi (`"another ingredient that creates emotional attachment: **neediness**"`), but neediness is absent from the seven-item summary list that follows (`"Responsiveness"` through `"Social need"`). Either add neediness to the list, fold it into Availability, or drop the word at Tamagotchi.

- [ ] **The agent action log** — `"TODO: Create illustration"`, Teaching AI Good Behavior. Priority H
  - *What:* Your TODO already answers itself: reuse the screenplay form. Extend `ScreenplayWriter` into a variant that renders a transcript of model turns interleaved with tool calls and their results, with the ghost-line device showing the model about to write the next turn.
  - *Why:* Two placements, one component. Introduce the form at `"instead of chatting with a real person, the LLM is chatting with a piece of software"` in Agents: How We Make AI Act, where the reader meets the agent loop for the first time. Then reuse it at the blackmail example, where the point lands only if the reader already sees the transcript as a screenplay the model is completing. Introducing the form at the blackmail example asks the reader to learn the notation and the argument at the same time.
  - *Your call:* Whether the Part 1 instance is neutral (the refund example already in the text) or already slightly ominous. Neutral first makes the Part 3 reuse hit harder.

## Part 1 — other candidates

- [ ] **Next-token probabilities** — `“it’ll come back with a list of “of each possible token, this is the chance that this one comes next.””`, Tokens And The Context Window. Priority H
  - *What:* One sentence tokenized with real boundaries (show `"work"` and `"ing"` as separate tokens, since you name that example), then the ranked probability list for the next token, with the sampled one marked and the mode marked separately.
  - *Why:* This is the most load-bearing mechanic in the book and the only one the reader must hold for 1,400 lines. The Conclusion pays it off directly — `"a machine that works, at its base, by predicting the next most-likely thing"` and `"The minimal error, the thing that is least likely to be wrong"` — and Creativity's temperature argument depends on it too. Right now the reader has to build that picture from prose alone and then keep it.
  - *Your call:* Whether the Conclusion reuses the same figure with the dopamine curve laid over it, so The Inevitable and The Surprise are visibly the same axis read from opposite ends. That's one figure doing the book's two hardest jobs, but it also risks looking clever.

- [ ] **The jagged frontier** — `“one moment you feel like you're on the interstellar superintelligence highway, the other you feel like you're trying to explain yourself to a ten-year-old”`, AI is also surprisingly stupid. Priority H
  - *What:* Human and model scores on the same axis across the tasks you already name: math olympiad, competitive programming, condensed matter physics, ARC-AGI-3, write an article of a given word count, don't repeat the question back.
  - *Why:* Jagged is a shape. The section's whole claim is that the edge is uneven, and an uneven edge is exactly what prose can't draw. It also gives the ARC-AGI-3 number somewhere to live: `"the best language model today scores a measly 0.37%"` next to a human 100% is the sharpest single fact in the chapter.
  - *Your call:* The open `"TODO: GPT-6 Astra got 99% afaik"` changes one bar but not the picture — if it's right, the frontier moved and is still jagged, which arguably strengthens the section. Decide whether the figure makes that explicit (two model rows, a year apart) or just shows the current state.

- [ ] **The weights, printed** — `“All of the magic is in this hundreds-of-gigabytes-large file, the model’s *weights*. Nobody ever looks at the actual numbers”`, We really don't understand LLMs. Priority M
  - *What:* An actual patch of weight values set in mono type, filling the exhibit block, with a caption saying how small a fraction of one model this is.
  - *Why:* It's the negative-space image for the chapter's claim. The reader is told the file is unreadable; showing a piece of it is cheaper and more convincing than any diagram of a neural network, and it avoids drawing an architecture the book deliberately never explains.
  - *Your call:* Real values from an open-weights model with the source named, or illustrative numbers. Real is better and costs one download.

- [ ] **Stated thoughts versus actual computation** — `"**The thoughts a language model presents are not always the thoughts it actually has.**"`, Pretend-Thinking. Priority H
  - *What:* Two columns for the multiplication example you already use. Left: the visible scratchpad doing carry-the-one. Right: what the activations show — ballpark first, then last digits, then the middle.
  - *Why:* This is a mechanism claim the reader currently has to take on trust, and it's the one that makes the cybersecurity-escape passage frightening rather than merely odd. Two columns make the mismatch a thing you see instead of a thing you're told.
  - *Your call:* The status doc already flags that the underlying paper uses addition, not multiplication. Settle that first, because the figure will be read as a direct illustration of the cited result.

- [ ] **Base model versus chat scaffold** — `"Hint: It should be measured around the equator"`, How We Made Large Language Models Useful. Priority L
  - *What:* The same prompt side by side: raw completion on the left, transcript-wrapped completion on the right.
  - *Why:* Makes the second breakthrough a visible difference rather than a described one.
  - *Your call:* Probably skip. The two blockquotes already sit next to each other and do most of this. Only worth building if the chat-exhibit component can render it with no new code.

- [ ] **The uncanny valley** — `"As robots become more human-like, we humans tend to like and trust them more...right up to the point"`, Language models are intelligent in a very different way. Priority L
  - *What:* The curve, with two positions marked: the humanoid robot in the trough, the language model past it.
  - *Why:* The prose names a curve and then places something on it. Asking the reader to hold an unseen curve and a position on it is more work than the point is worth.
  - *Your call:* This is the most stock image in the list and the one most likely to look borrowed. Skip unless you place something unexpected on it.

## Part 2 — candidates

- [ ] **Bloom's two sigma** — `"on average their score increases by two standard deviations"`, Personalized Tutoring. Priority M
  - *What:* Two overlapping distributions shifted by 2σ, with the top 2% tail shaded.
  - *Why:* The prose already translates the number (`"it suddenly puts them in the top 2%"`), so the chart doesn't add a fact. It adds the feel of how far that is, which is the reason you cite it.
  - *Your call:* Worth a figure at all, or is the translated sentence enough? If the Learning chapter gets only one figure, this is the one.

- [ ] **Income and two kinds of well-being** — `"emotional* well-being—positive affect, absence of stress and worry—plateaued at around $75,000"`, Happiness Through Friction. Priority H
  - *What:* One chart, two lines against log income: life evaluation rising steadily, experienced well-being flattening.
  - *Why:* This is the empirical floor under the book's entire thesis, and it's the one claim where the shape *is* the finding — two measures of happiness that come apart. It also serves the Easterlin passage in Meaningful Work, so one figure covers two chapters.
  - *Your call:* The $75,000 plateau was substantially revised by the 2023 Killingsworth, Kahneman and Mellers adversarial collaboration, which found the flattening holds mainly for the least happy fifth. A chart makes the plateau look settled in a way the sentence doesn't. Either chart the revised finding, or keep the figure and add the revision to the text — charting the 2010 result alone is the one option that would misinform.

- [ ] **What makes work satisfying** — `"Autonomy: I have some control over what I do"`, Meaningful Work. Priority M
  - *What:* Four bars, ordered, for autonomy, beneficence, competence, relatedness.
  - *Why:* The sentence after the list says `"The first two, autonomy and beneficence, are by far the most important."` A bulleted list flattens that; bars show "by far".
  - *Your call:* Only if you have effect sizes to put on the bars. Drawing relative heights you don't have a source for is worse than the list.

- [x] **The relationship-advice results** — `“The “real” people in these comments recommended breaking up primarily in 42% of the cases”`, Parroting The Internet. Priority H
  - *What:* One grouped chart of your own test: break-up rate by responder (humans plus each model), with the second-order findings as small paired marks — communicate as primary advice (humans 11% versus most models top), harsh tone (humans 14%, models 0%), self-consistency (humans 54%, models 90%+).
  - *Why:* This is the only original research in the book and it's currently seven bullets holding eleven numbers. Readers skim bullet lists of percentages. A chart is also the only way to show the finding that makes the section interesting: the models don't just differ from humans, they differ from each other, which is your evidence for the post-training hypothesis.
  - *Your call:* The figure needs a method line — how many posts, when collected, how many runs per model, how the classifier judged. Without it you publish a confident-looking chart with no method, in a book that argues against trusting confident-looking output. A small inset for the Shaw 2010–2025 Reddit trend (30% to almost 50%) would also give that citation a home.

- [ ] **What text cannot carry** — `"No amount of AI chat is going to activate your C-tactile fibers."`, Biology's Unmet Hunger. Priority M
  - *What:* Three channels, three thresholds: C-tactile fibers and the stroke speed that triggers them, face-to-face synchrony and the few-hundred-millisecond delay that breaks it, chemosignals and the pathway they share with social processing.
  - *Why:* Each of the three is a hard threshold — a speed, a latency, a pathway — and thresholds are what a figure is for. It's also the only place in the book where the limit is physical rather than argued, so it deserves to look different from the rest.
  - *Your call:* Three findings in one figure, or leave it. The prose is already vivid here, which is the argument against.

## Part 3 — candidates

- [ ] **Dopamine shifting to the cue** — `"The next time, we’ll already start receiving our squirt of dopamine in anticipation of the reward"`, Why we do what we do. Priority H
  - *What:* Three panels of firing over time: unexpected reward fires at the reward, learned cue fires at the cue, omitted reward dips below baseline at the moment the reward doesn't come.
  - *Why:* You describe the shift in words and then build most of Part 3 on it — superstimuli, token anxiety, the morning, the Conclusion's prediction-error argument. The shift is a change in timing, and timing is the one thing prose describes worst.
  - *Your call:* Whether the third panel (omission) goes in. It isn't in your text, but it's where `"they usually leave us feeling *less* good afterwards"` in Arbiters of Presence comes from, so the figure could earn that claim its evidence.

- [ ] **The herring gull and the painted rod** — `"a plain red rod with white stripes—which looks nothing like a mommy or daddy herring gull"`, Superstimuli. Priority H
  - *What:* The real beak beside the rod, with the pecking rates.
  - *Why:* This is the one place where the literal picture beats any diagram. The absurdity of the rod out-pecking a parent is the argument, and it survives being looked at for one second. Drawn in the part-plate language it also carries the book's own aesthetic into its funniest moment.
  - *Your call:* Nothing much. This one is cheap and it works.

- [x] **The inverted U** — `“It seems like there’s an inverted U-curve to it”`, Post-Traumatic Growth. Priority H
  - *What:* One curve, adversity on the x-axis, life satisfaction on the y, with three positions marked: none, some, too much.
  - *Why:* You name the shape twice — once for a single episode's severity, once for lifetime adversity from Seery 2010 (`"experiencing *some* amount of life adversity leads to a greater sense of life satisfaction than none at all"`) — and never draw it. This is the shape of the book's whole argument, and Seery gives you real data for the lifetime version. If Part 3 gets one figure, it's this.
  - *Your call:* One curve or two. They're different claims on different axes, and merging them would overstate what either study shows. My read: draw Seery's lifetime curve with its data, and let the prose keep the single-episode version.

- [ ] **What AI helps and what it takes, across PERMA** — `"A bunch of these can actually be *improved* with large language models"`, The Forge of Meaning. Priority M
  - *What:* Five rows, one per PERMA element, each marked helped, hurt, or complicated, with your one-line reason.
  - *Why:* The passage gives three helps in one sentence and then spends paragraphs on the two that are harder. A five-row block makes the asymmetry visible at a glance and stops the three helps from being forgotten by the time Meaning arrives.
  - *Your call:* Cheap and low-risk. Main question is whether Meaning reads as "complicated" or as its own thing, since the text says `"it seems like AI is neutral here"` and then spends two pages disagreeing.

- [x] **The ladder of scarcity** — `"Abundant execution, abundant attention, abundant judgment."`, New World, New Scarcity. Priority H
  - *What:* Four rungs — execution, attention, judgment, responsibility — with the first three shaded as abundant and the fourth left unshaded and visibly unlike the others.
  - *Why:* The chapter is built as a sequence where each answer fails and pushes value up one step, and then Is that it? points out that the fourth rung is a different kind of thing (`"execution, attention and judgment became abundant because AI got better at it, but getting better at things can never make AI able to be sued"`). The figure can show that break in kind, which is the chapter's actual point and the hardest part to hold in prose.
  - *Your call:* Whether the same ladder motif appears earlier at `"we’ve stepped up the ladder of abstraction"` in the Part 2 opening. Using it twice would tie the two Parts together with one image, which is the cheapest structural link available to you. Using it twice also risks the second one feeling like a recap.

- [x] **Poiesis and the unmade** — `“In **Sāṃkhya**, Hinduism, there’s **Prakriti**”`, AI as Infinite Creation. Priority H
  - *What:* Two columns, five rows: Prakriti/Purusha, Shakti/Shiva, Wéi/Wú Wéi, Martha/Mary, poiesis/the unmade. Column headers naming the two poles.
  - *Why:* The rhetorical move is that five unrelated traditions drew the same line. Five consecutive paragraphs make the reader do the alignment themselves; two columns do it instantly, and the instant is the point. This is the highest ratio of effect to effort in the list.
  - *Your call:* Whether the table replaces the paragraphs or sits beside them. Replacing loses your phrasing (`"the Tao does nothing, yet nothing is undone"`). My read: keep the paragraphs, add the table as a summary, and cut a sentence from each paragraph.

- [ ] **Hedonic adaptation** — `"even these people return to their baseline level of happiness after just a few months"`, The Forge of Meaning. Priority L
  - *What:* Happiness over time after a large positive event, returning to baseline.
  - *Why:* Familiar shape, clearly written paragraph.
  - *Your call:* Skip unless the chapter feels text-heavy after the other figures land.

## What I'd skip, and why

- **A transformer or attention diagram.** The book deliberately never explains the architecture (`"These are roughly the same thing"`), and a diagram would promise a level of detail the text then declines to give.
- **Parameter counts over model generations** (117M, 1.5B, 175B). Three numbers in one sentence. If anything, a small inset on the capability curve.
- **Brain energy, 20% of energy from 2% of mass.** One striking ratio, already striking in words.
- **Asimov's three laws.** A numbered list is the correct form for a numbered list.
- **Anything in The Mental Gym.** Seven practice sections, no numbers, no mechanisms with shapes. Diagrams here would be decoration, and the chapter's argument is for less input, not more.

## Production notes

**Four new components cover nearly all of this.** Every figure needs an Astro component, a renderer in `export/components.ts`, and a matching Typst function in `export/book-style.typ`, so twenty bespoke figures is not a real plan. The set that covers the list:

- A data-driven `Chart` (line, bar, distribution) covers the capability curve, the jagged frontier, two sigma, income and well-being, work satisfaction, the relationship-advice results, dopamine, the inverted U, and hedonic adaptation.
- An `AgentLog` variant of `ScreenplayWriter` covers both agent-transcript placements.
- A `TokenStream` covers next-token probabilities and the Conclusion callback.
- A two-column comparison block covers poiesis, stated-versus-actual thoughts, and PERMA.
- The ladder and the lineage strip are illustrations in the part-plate language, not components.
- The herring gull and the printed weights are single images.

`WordHistoryGraph.astro` is site tooling with no export renderer, so it isn't reusable here, but it proves the inline-SVG-in-Astro pattern works in this repo.

**Author charts as data, render as static SVG.** Three outputs have to agree, and two of them can't run JavaScript. Any interactivity on the site must be an enhancement over a static SVG that already carries the full meaning. `bun run book:export` stops on any EPUBCheck warning, so inline SVG has to be well-formed XHTML.

**Charts claim more than sentences do.** Three specific traps in this book:

- The capability series past 2025 is the book's forward setting, and the model names in it (Claude Opus 4.6, GPT-5.4, Gemini 3.1 Pro) are the book's own. A chart presents all points as measurements unless it says otherwise.
- The $75,000 plateau has been revised since 2010.
- The relationship-advice numbers are your own unpublished test.

The book's own argument is that we over-trust output that looks authoritative. A chart is output that looks authoritative. Every figure carrying numbers should show its source and its method in the caption — which is a small cost, and it's also the one place where the book's form can agree with its argument.
