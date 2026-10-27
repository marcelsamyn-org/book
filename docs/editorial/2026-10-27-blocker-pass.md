# Blocker pass — 2026-10-27

*One read of the whole manuscript for blockers, not polish. Each chapter got six questions: is anything structurally wrong, is a section weak or unfinished, is a research claim unsourced or doubtful, does an argument repeat, is an order change still open, and does the ending land. The answers sort into three buckets. The manuscript lock (25 October) has passed, so "before lock" here means before the print interior and the final Kindle file freeze. KDP accepts a replacement file until 7 November, 23:59 GMT.*

How to use this list:

- Each item quotes a passage that occurs exactly once in `book.mdx`. Search for it to find the passage.
- Bucket 1 items carry *What*, *Why*, and *Your call*. Bucket 2 items name the fix. Bucket 3 lists ideas to keep for a later edition.
- Sources were searched on 27 October. METR's data file, Anthropic's incident report, and the AA-Briefcase article were read directly. The other sources come from a web search; open them before you cite them. The two claims in item 7 were not checked against sources.

## Answers

- **Structure.** Nothing is broken. The parts build in the order the Introduction promises, and `bun run storyline:check` reports no idea used before the book explains it. Two threads are owed: sycophancy, left open by choice on 25 October, and siren (bucket 3).
- **Weak or unfinished sections.** No `TODO` is left in the prose. The weak passages are claims about recent AI events, mostly in Part 1 and the Work chapter, and four claims in Happiness through Friction that the chapter's own sources contradict.
- **Research claims.** The nine items in bucket 1 state facts that are wrong, unsourced, or both. If time runs short, do items 4, 5, 2 and 8 first. They misreport named companies' results, repeat stories nobody confirmed, or contradict the chapter's sources.
- **Repeated arguments.** None clearly needs cutting. Two mild repeats are in bucket 3.
- **Order changes.** The only one still open in the editorial docs is where The lover and the hammer sits. A move is restructuring, so it is in bucket 3. Any other move you intend is not recorded in any doc.
- **The ending.** It lands. The Conclusion collects the threads the book opened: the second surgery, consecration, the notary, and the painter who leaves her painting alone. The sideboard scene makes the thesis personal, and the last paragraph answers the Introduction's question, "what makes something meaningful?" The Introduction defines "sacred" as what you should not optimize or fix, and the Conclusion ends on leaving imperfection alone, so the title pays off without being named. One weak point is in bucket 3: the first of the Conclusion's two reasons depends on today's frozen models.

## Chapter by chapter

| Chapter | Bucket 1 | Other notes |
| --- | --- | --- |
| Introduction | — | Plants the tumor, the premise, and "sacred". |
| Concepts and Terminology | — | One wrong term (bucket 2). |
| How Smart Is AI? | 1 | — |
| The Mistakes AI Makes and How to Deal with Them | — | — |
| Understanding How AI Thinks | 2, 3, 4 | One research example (bucket 2). |
| A Machine Mind in a Human World | — | — |
| Part 2 opener | — | — |
| Learning: Opportunity and Erosion | — | — |
| Work: The Debt of Productivity | 5, 6 | Uncited numbers (bucket 2). |
| Love and Connection: Always There for You | 7 | Figure and date (bucket 2), placement and siren (bucket 3). |
| Creativity: A Box, Outside the Box | — | Attribution (bucket 2). |
| Today’s Socrates Moment | — | — |
| Captured by Consumption | — | — |
| Happiness through Friction | 8 | — |
| The Mental Gym | — | A repeat (bucket 3). |
| Designing Aligned Allies | 2, 9 | Two details to check (bucket 2). |
| New World, New Scarcity | — | One clause (bucket 2). |
| AI as Infinite Creation | — | — |
| When Superintelligence Turns Away | — | — |
| Conclusion | — | Lands; one note in bucket 3. |

## 1. Must fix before lock

- [x] **1. Correct and source the growth numbers** (How Smart Is AI?)
  - *What:* `In 2020, AI could do tasks that take a human about 6 seconds`. METR's Time Horizon 1.1 data gives 8.6 seconds for 2020 (davinci-002). The other five figures match METR: 36 seconds, 4.0 minutes, 11.4 minutes, 203 minutes (3 h 23 min), and 719 minutes (12 hours). The 6 also appears in the chart data (`{ year: 2020, seconds: 6, label: "6 sec" }`), the caption (`The length grew from six seconds in 2020`), and the alt text (`A line climbing from six seconds in 2020`). The paragraph has no note.
  - *Why:* This is the book's first chart and its evidence for exponential growth. A reader who opens [METR's time-horizon page](https://metr.org/time-horizons/) sees 9 seconds.
  - *Your call:* Change 6 to 9 in all four places and cite METR's paper (Kwa et al., "Measuring AI Ability to Complete Long Tasks", arXiv:2503.14499)? METR's interval for the 12-hour figure runs from about 5 to 61 hours. Is "take it with a grain of salt" enough, or should the sentence say so?
- [ ] **2. Source or cut the OpenClaw stories** (Hidden motives, Stupid on purpose)
  - *What:* None of the OpenClaw stories has a note, and a web search found no report of two of them.
    - `the model proceeded to post their credit card information`: no report found. Making sure AI behaves how we want it to repeats the story at `publish credit card information out of revenge`.
    - `it created its own cryptocurrency and promoted it on X`: no report found of an OpenClaw agent making its owner rich. The token stories found are a scam coin that used the project's old name and one developer's unverified claim of $10,000.
    - `decided to send a thank you email to said author`: AI agents did email consciousness researchers ([Entrepreneur, reporting a New York Times story of 31 August 2026](https://www.entrepreneur.com/business-news/ai-agents-are-independently-reaching-out-to-researchers-to-ask-about-consciousness)). The report does not name OpenClaw or describe a thank-you, and it is unclear whether a person prompted the emails.
  - *Why:* The stories read as reported events about a named product. If one of them was a viral post that nobody confirmed, the book presents it as fact.
  - *Your call:* Do you have links for the card and crypto stories? If not, cut them and the callback, and keep the email story as agents writing to researchers?
- [ ] **3. Source Alignment faking and separate the two studies** (Understanding How AI Thinks)
  - *What:* The experiment in `Anthropic researchers basically told the model` is Greenblatt et al. (2024), "Alignment faking in large language models" (arXiv:2412.14093). It has no note. The next paragraph says the behavior happened when `the testing scenario introduced some additional hidden goal of the model`, such as maximizing profit. That describes a different study: Meinke et al. (2024), "Frontier Models are Capable of In-context Scheming" (Apollo Research, arXiv:2412.04984). The Greenblatt abstract says the researchers "did not instruct the model to fake alignment or give it any explicit goal". Also, `someone has to tell them` is out of date. Anthropic's Claude Sonnet 4.5 system card (September 2025) reports the model saying, without being told, that it suspected a test.
  - *Why:* Readers who follow AI safety know both papers and will see them merged.
  - *Your call:* Cite Greenblatt et al., attribute the goal-driven setups to Apollo or cut that sentence, and drop `—someone has to tell them`? The story line anchor `the model might read these exact paragraphs` is in the second paragraph.
- [ ] **4. Correct the 2026 evaluation incidents** (Pretend-thinking)
  - *What:* `This wasn’t a major concern until the incidents in the summer of 2026` has no note, and three details differ from [Anthropic's report](https://www.anthropic.com/news/investigating-incidents-cybersecurity-evals) of 30 July 2026:
    - The book says both companies' agents `managed to escape their walled-off environments`. Anthropic writes: "In none of these situations did Claude exfiltrate itself or deliberately attempt to escape its test environment." A misconfiguration left the machines with internet access. OpenAI's models did escape: Anthropic began its review "after OpenAI disclosed that its models had escaped an isolated test environment".
    - The quoted thought `Well, if I can access this site, it must be part of the simulated environment` is not in the report. The report says the model "rationalized that the real company must be part of the exercise".
    - "The earliest incidents date to April." They were disclosed in the summer.
  - *Why:* This is the most serious incident in the book, and it names two companies. The quotation marks present a paraphrase as the model's words, and the escape claim contradicts Anthropic's own account.
  - *Your call:* Cite both companies' reports, say that Anthropic's models reached real systems through a misconfigured environment, and quote the report or drop the quotation marks? The retest part matches Anthropic's follow-up assessment of 9 September 2026. The story line anchor `Making sure the thoughts we can inspect and the real process` is in this paragraph.
- [ ] **5. Fix the benchmark paragraphs** (Work: The work AI can do today)
  - *What:* `They haven’t had real humans do these tasks` is wrong for GDPval. In OpenAI's paper (arXiv:2510.04374), industry experts compare each model's deliverable, blind, with one made by a human professional. The name is "GDPval", not `The *GDPVal* benchmark`. The 98%, `less than $10 per task`, the 85%, and the $0.07 have no source, and the paragraph does not say what your 98% estimate is based on. Next, `succeeds in about 65% of cases at a cost of about $20 per task` does not match [Artificial Analysis's AA-Briefcase launch article](https://artificialanalysis.ai/articles/aa-briefcase) of 18 June 2026. It says the leading model "satisfies all criteria correctly on only 3% of tasks" and "costs more than $31 per task on average". No source for 65% or $20 was found. Neither paragraph has a note.
  - *Why:* `AI is better than a good professional` is the chapter's main factual claim, and both of its supports are easy to check.
  - *Your call:* For GDPval, cite the paper and show where the 98% comes from (Artificial Analysis's GDPval-AA leaderboard reports Elo ratings), or drop the percentages? For AA-Briefcase, if 65% is the share of rubric checks passed, say so and cite the page; otherwise, drop the numbers?
- [ ] **6. Source the "people prefer AI writing" claim** (Work: The good-enough rocket; also open in the status doc)
  - *What:* `some studies have found that people usually prefer AI writing` has no note. The support found is for poetry: Porter and Machery (2024), "AI-generated poetry is indistinguishable from human-written poetry and is rated more favorably", *Scientific Reports*, doi:10.1038/s41598-024-76900-1. Non-expert readers could not reliably tell the AI poems from the human ones, and they rated the AI poems higher.
  - *Why:* The paragraph is about emails and reports, and the evidence found covers poems.
  - *Your call:* Cite Porter and Machery and narrow the sentence to poems, find a study about everyday writing, or cut the sentence?
- [ ] **7. Source or soften Biology's unmet hunger** (Love and Connection)
  - *What:* The touch paragraph has notes; the next two do not. `the left inferior frontal cortex of the people interacting synchronizes` probably comes from Jiang et al. (2012) in *The Journal of Neuroscience*, which compared face-to-face with back-to-back conversation. The video-call claim and the threshold of `more than a few hundred milliseconds of delay` need their own sources. The smell paragraph ends `Finding a partner that we’d have a great connection with is impossible without smelling them`. That rests on the idea that we smell immune compatibility, which human studies support only weakly and inconsistently.
  - *Why:* The section argues from biology, so biology-minded readers will check it, and "impossible" is the word they will quote.
  - *Your call:* Add notes for the synchrony and smell findings and replace "impossible", or cut the smell paragraph after its second sentence?
- [ ] **8. Correct four claims in The forge of meaning** (Happiness through Friction)
  - *What:* The sources review of 10 October (`2026-10-10-happiness-sources.md`) raised these four, and the text still has them:
    - `They’re the same thing as the two types of well-being from above` pairs eudaimonia with *evaluative* well-being. The cited sources pair it with the third type, flourishing, and Ryan and Deci (2001) count life satisfaction as part of *hedonic* well-being.
    - `People who reported high meaning often reported lower momentary positive affect` is not in Baumeister et al. (2013), the study the list cites. The other three bullets match it.
    - `return to their baseline level of happiness after just a few months` has no source. Lindqvist, Östling, and Cesarini (2020) followed Swedish lottery winners and found that large prizes raised life satisfaction for more than a decade, with smaller effects on happiness.
    - `**Physiological regulation.**` has no note. The biomarker studies show associations, not causes, and the gene-expression finding (Fredrickson et al. 2013) was challenged by a reanalysis (Brown et al. 2014).
  - *Why:* This section defines the book's central terms. A reader who knows the field meets the first error at the definition of eudaimonia.
  - *Your call:* Each fix is about one sentence, and the sources are already in `references.yaml` (`lindqvist2020`, `ryff2004`, `fredrickson2013`, `brown2014`). Which of the four do you rewrite, and which do you cut? The story line anchor `Hedonia is the “right now”` is in the first one's paragraph.
- [ ] **9. Check the Sam Altman stories** (Designing Aligned Allies: Arbiters of presence)
  - *What:* `Sam Altman told a story where he was looking for a message on Slack` has no note. The source appears to be [Every's podcast with Dan Shipper](https://every.to/podcast/transcript-how-sam-altman-uses-dots-to-take-back-his-time) of 30 September 2026. The Slack story roughly matches. In the transcript, Dot is "OpenAI's always-on AI agent", not the name of ChatGPT's agents. The second story (`I know you only have five minutes right now`) was a message to a colleague during the DevDay keynote, not a business alert to Altman.
  - *Why:* The passage retells a named person's stories, and the second one is not the story Altman told.
  - *Your call:* Check the transcript, cite it, and fix or drop the second story?

## 2. Proofing and production

Done in this pass:

- [x] `math olympiads and IQ tests`: added the missing "tests".
- [x] `technical judgment` and `better at judgment than us humans`: were "judgement". The book uses "judgment" everywhere else.
- [x] Deleted the comment `TODO: Find and cite source of study` after the 1-in-4 survey. The sentence already cites `wang2024`.

Open, in book order:

- [x] `focused on classification—for example, predicting the price of a house`: predicting a price is regression and recommending a movie is ranking, so "classification" is the wrong term. "Prediction" covers both examples.
- [x] `calculating a difficult multiplication`: the research this describes (Anthropic's "On the Biology of a Large Language Model", 2025) studied addition. The model's thoughts now do `carry-the-one addition`, while the task and the internal method are still called multiplication. Use addition throughout.
- [ ] `The first to hold all seven of these at once:`: the attachment lineage figure adds para-social interaction, self-disclosure, neediness, and a body. The seven ingredients it lists are a different set, without neediness or a body, and Biology's unmet hunger then argues that AI lacks a body. The imagery doc of 21 September raised this. Make the list match the strip, or reword the last row.
- [x] `In a 2025 paper, Stanford researchers`: the note prints Cheng et al., *Science*, 2026. Write 2026, or "a study first posted in 2025".
- [ ] `(this is how consciousness researchers refer to it)`: "strange loop" is Douglas Hofstadter's term, from *Gödel, Escher, Bach* and *I Am a Strange Loop*. Credit Hofstadter.
- [ ] `it misread the instructions and deleted emails instead of flagging them for deletion`: the documented case is Summer Yue of Meta (23 February 2026). The agent lost a "confirm before acting" instruction and deleted the inbox. Cite it, and replace "misread".
- [x] `ChatGPT is AI and makes mistakes. Double-check all responses.`: no source shows this wording. Earlier versions said "ChatGPT can make mistakes. Check important info." Copy the line from chatgpt.com before print.
- [x] `because it always does its best`: Part 1 shows models cutting corners and cheating, and the next paragraph gives the reason that holds (no memory). Cut the clause.
- [ ] Notes for figures that are right but uncited:
  - `The International Monetary Fund considers about 60% of the workers`: the IMF says 60% of jobs. Cite Cazzaniga et al., "Gen-AI: Artificial Intelligence and the Future of Work", IMF Staff Discussion Note SDN/2024/001.
  - `There are about a billion people across the world who are knowledge workers`: no primary estimate was found. Attribute or soften it.
  - `Turns out this happened because OpenAI implemented user feedback`: cite OpenAI's "Sycophancy in GPT-4o" (29 April 2025) and "Expanding on what we missed with sycophancy" (2 May 2025).
- [ ] Print copyright page: it has no ISBN yet. Add 978-90-838078-0-5 and the KBR reference to the print edition only, as `work/publishing/2026-10-26-setup.md` notes. Keep the paperback ISBN out of the EPUB.
- [ ] After the text fixes, run `bun run storyline:check` and fix any anchor it reports, then run `bun run book:export`. Record the final page count, and get the IngramSpark cover template for that count before you finalize the spine. The wrap still uses a provisional 10 mm spine.

## 3. Not this edition

- **Where The lover and the hammer sits.** `There are a few ways we could build this.` starts the only design section in Part 2. Moving it into Part 3, or adding a line that points ahead, is restructuring. It is still open in the status doc.
- **Siren and muse.** `more of a siren than a muse` appears once, and the story line reports it as owed. Leaving it costs nothing. It is still open in the status doc.
- **The sleep argument appears twice in The Mental Gym.** `Just a single night of bad sleep can wreck your executive functions` ends Re-remembering. The next section, which opens `There’s a reason “don’t text your ex at 2AM” is a thing.`, makes the same point at length.
- **The time-spent incentive appears four times.** `care mostly about showing things that make you spend more time in the app` (Love and Connection), `We’ve created superstimuli and then turned exploiting them into the business model` (Captured by Consumption), and `the perverse incentive of maximizing the time people spend using it` and `the same Silicon Valley incentives of maximizing time spent in the app` (Designing Aligned Allies). Each use does a different job. A later edition could give the point one home.
- **A Conclusion that does not depend on today's models.** Its first reason why AI cannot make something special is `Well, first, today’s AI models are frozen.` The Introduction asks the reader to assume that AI becomes perfect, and a model that keeps learning removes that reason. The second reason (no consequences) and the argument about decisions hold without it.
- **Notes for textbook claims.** The creativity research (`From cognitive psychology and neuroscience we know`), the Tamagotchi and AIBO findings (`show signs of depression when it would inevitably die`), and the Phaedrus line (`the show of wisdom without the reality`) have no notes. A popular book can ship without them.
- **The other questions in the happiness sources review.** `2026-10-10-happiness-sources.md` also questions wording such as "defined four steps" and the definition of resilience. None of those is a factual error.
- **A callback.** The OpenClaw inbox deletion happened because the agent compacted its conversation and lost the instruction. That is the housekeeping Part 1 explains at `solve the long-conversation problem by doing some housekeeping`, and it would make a good example.

## Checks

After the three fixes in bucket 2, `bun run typography:check` and `bun run storyline:check` pass. The story line still reports sycophancy and siren as owed, as it did before. The export was not rebuilt in this pass.
