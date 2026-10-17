# Sentence and flow pass — 2026-10-17

*A close read of the whole manuscript through two lenses. **Sentence** flags mark sentences a reader has to read twice. **Flow** flags mark a missing step in the reasoning, inside a paragraph or across a few. Each flag names the problem; the rewording is yours.*

How to use this list:

- Each item starts with a quote that occurs exactly once in `book.mdx`. Search for it to find the passage.
- **Fix** means a reader will likely misread, stall, or lose the argument. **Polish** means the passage works but reads rough. If time runs short, do the Fix items.
- "Across chapters" comes first. Those problems only show when you read two distant passages together. After that, the items follow the book's order.
- "Facts to check" at the end lists claims an informed reader may correct. Nobody checked them against sources in this pass.

Already done in `book.mdx`: 105 small fixes to grammar, typos, and punctuation, each changing only the error. Examples: `mutiple` → `multiple`, `while people are be looking at you` → `while people are looking at you`, `if I would be working on a farm` → `if I were working on a farm`, `What when our own ambition` → `What if our own ambition`, and five commas between a long subject and its verb. The citation after `Claude Constitution` now follows the period. One story line anchor in `src/storyline/threads.ts` was updated to the new wording (`whatever you’d like to read`).

## Across chapters

- [x] **Fix** · flow · `I’ve had two brain surgeries in my life.`
  - The Introduction tells of one surgery. A second appears here for the first time, and the Conclusion then calls it `My second brain tumor surgery`. The reader has to infer that the tumor came back.
  - *Your call:* mention the second surgery in the Introduction, or give it one clause here?
- [x] **Fix** · flow · `Indeed, AI is actually surprisingly good at judging things`
  - Being a good judge (Part 1) says models `don’t have the ability to judge what incredible work looks like` and gives judging to the human. Earlier in this same section, AI `doesn’t *know* when things are slop`. Then "Indeed" says the opposite, and the scarcity ladder marks judgment as abundant.
  - *Your call:* did AI get better at judging since Part 1 (then say so), or are these two kinds of judgment, such as noticing what is new versus making a broad, informed choice (then name them)?
- [x] **Fix** · sentence · `Because large language models are pre-trained, we can ask them`
  - Part 1 uses "pre-training" for the first phase of training. Here, in `you can’t do it with a pre-trained model`, and in the Conclusion's `Well, first, AI is pre-trained.`, the word means "frozen after training". A reader who learned the Part 1 meaning reads these wrong. A different word, such as "frozen", avoids the clash. "Because" also attaches to "we can ask them" instead of to the repeated ideas.
- [x] **Fix** · flow · `smiling in that sweet, sweet dopamine release`
  - Captured by Consumption teaches that `dopamine does not feel “good.”` Here dopamine is the pleasant part. Name the feeling, or call it anticipation.
- [x] **Fix** · flow · `When I checked the AI responses in my relationship advice test against sycophancy`
  - Parroting the internet reports breakup rates. It does not report sycophancy or compare model generations, yet this paragraph says `we saw indeed`. It also cannot show that the Constitution techniques caused the change, because those were tested on blackmail.
  - *Your call:* add the sycophancy result to Parroting the internet, or present it here as new and drop the causal claim?
- [x] **Fix** · sentence · `since they care more about grammatical structure than being right`
  - The book uses "grammatical" to mean "fits as the next line of text". It does so here, in `these grammatical, structural patterns`, and in `it all makes total grammatical sense`. A reader takes it as grammar, and the explanation stops making sense. Name the idea once in plain words and keep that word.
- [x] **Polish** · flow · `Turns out happiness isn’t what we need.`
  - Happiness through Friction defines happiness as `a short-term “pleasure” signal plus a longer-term “meaning” signal`. The last page sets happiness against meaning. Say which happiness you mean, such as pleasure or comfort.
- [x] **Polish** · flow · `along that road we find contribution, agency, relatedness and effort`
  - These are the four needs from Meaningful work (autonomy, beneficence, competence, relatedness) under new names. With the same names, the reader would see the callback.

## Habits to watch

These came up again and again. Watch for them as you edit.

- **Pronouns that reach too far.** "This", "that", "it", and "they" often point two sentences back, at a whole paragraph, or at something not said yet. AI also switches between "it" and "they" inside one paragraph.
- **Connectors that claim the wrong logic.** "So", "After all", "As a result", "Indeed", "Luckily", "On the other hand", and "Because" often join two sentences that do not follow from each other.
- **Dutch patterns.** "For the rest", "confronting", "eventually" in the sense of *eventueel*, "But then still", "next to" for "in addition to", "quite some", "my course" for course notes, "out of where", and "I’m seeing a man sit". "If … would" conditionals were fixed where the meaning was clear.
- **Terms used without a definition.** System prompt, out of distribution, semiosis, DOCTOR, Dot, context window, locus of control.
- **Numbers without what they measure.** GDPVal, AA-Briefcase, the IMF figure, the 2024 survey, "From the research".
- **Setups that do not close.** A question that is never answered (`Would that have been better or worse?`), a list where only some items are discussed (PERMA, the four elements of challenge), and "It’s one thing…" without "another thing".

## Introduction

- [x] **Fix** · sentence · `Absolutely not. That doesn’t make any sense…but still` — "That" reads as "wanting it again". The point is the contradiction: the episode was deeply meaningful, yet you would never want it again. Say what doesn't make sense.
- [x] **Fix** · sentence · `no matter the technical reach of the current technology` — The "that" clause comes far after "things", past a dash insert, so the reader loses what it describes. "Current" also works against the point, which is that the insight holds however far the technology gets.
- [x] **Fix** · sentence · `The title, probably, I don’t even remember anymore.` — Read literally, you no longer remember the book's title. A clause is missing: the title was probably Claude's idea too.
- [x] **Fix** · sentence · `became ridiculously easy to fulfill, but still I can’t do it` — "Can't do it" reads as "am not able to", which contradicts "easy". The meaning is "must not let myself".
- [x] **Fix** · flow · `nor if you’re someone who’s “purely” spiritual` — The reader can't tell who this means, and the parenthetical admits it. One clause on what that reader would come looking for and not find.
- [x] **Polish** · sentence · `For the rest, the medical team kept me quite unaware` — "For the rest" is Dutch (*voor de rest*). English readers take it as "for the other people". It appears again in `but for the rest it just` (AI-induced delusion).
- [x] **Polish** · sentence · `the neurosurgeon had to fight with other surgeons` — After "My surgeon" and "the surgeon", "the neurosurgeon" can read as a third person. The newspaper quote also mixes "he" with "there’s this young man", so the reader can't tell who is speaking.
- [x] **Polish** · sentence · `There’s something special about moments like this.` — "Moment" changes meaning three times in two paragraphs: the instant of realizing (`That was the moment`), the months-long episode (`this entire moment of my life`), and life crises in general. Name the crises here.
- [x] **Polish** · sentence · `we do so being equipped with something deeply valuable` — Clumsy construction. "Passages" is also an unusual word for hard periods of life.
- [x] **Polish** · sentence · `I received the biggest pains I’ve ever felt in my life` — In English you feel or go through the worst pain. If "received" echoes `received an abundance of love` on purpose, the rest of the phrase still needs fixing.
- [x] **Polish** · flow · `but the thought experiment is necessary nonetheless` — The thought experiment only arrives one sentence later (`let’s assume it will become perfect`). State the assumption first, then name it.
- [x] **Polish** · flow · `And I’m definitely feeling token anxiety (you’ll read about that)` — "Token" and "monthly token allowance" are explained only in Part 1. A few words (tokens are what AI use is measured and paid in) would show why an idle AI causes anxiety.
- [x] **Polish** · sentence · `while at the same time I would actually need to think` — One comma-spliced sentence carries three ideas, and "at the same time" appears three times in two paragraphs.
- [x] **Polish** · sentence · `It’s a rather confronting situation to realize` — "Confronting" as an adjective is Dutch (*confronterend*). English readers expect "sobering" or "unsettling".

## Part 1: The Machine Mind

### Concepts and Terminology

- [x] **Fix** · flow · `Most of the “magic” we see today has come from a third type` — A page later, the scientific breakthrough is scale (`a thousand times bigger`), and How Smart Is AI? credits making models `100 or 1000 times larger`. The reader gets two different sources of the magic. *Your call:* narrow the claim (robots, games, reasoning models), or tie it to RLHF?
- [x] **Polish** · sentence · `and how we can find meaning through it` — "It" reads as AI, which suggests the book is about finding meaning through AI. The chain of phrases before it is also long.
- [x] **Polish** · flow · `But then still, we let humans interact with these chatbots` — Chatbots first appear in the next section, so "these chatbots" points back to nothing. "But then still" is Dutch (*maar dan toch*); English says "Yet".
- [x] **Polish** · sentence · `because most of the classical machine learning is focused on` — "Because" makes classical machine learning the reason that generative AI creates things. The clause explains the label: generative AI as opposed to machine learning that sorts and predicts.
- [x] **Polish** · sentence · `but you can also interpret noise in movement` — Not idiomatic. Neither is `there are some LLMs as diffusion models`.

### How we made large language models useful

- [x] **Fix** · sentence · `believed there would be a fast quality decline` — This says bigger models would get worse. The belief was that the gains would soon level off.
- [x] **Polish** · flow · `This technology had existed for many years` — Two paragraphs later the same models had `been in use for a couple of years`.

### Tokens and the context window

- [x] **Polish** · sentence · `it takes quite some computational power` — "Quite some" is Dutch (*heel wat*); "quite a bit of" or "a lot of".
- [x] **Polish** · flow · `if these all need to be multiplied with hundreds of billions of other numbers` — "These" has no clear referent. The section opens with `sentences aren’t numbers` but never says that each token becomes numbers.
- [x] **Polish** · flow · `and one of the reasons why it starts to get confused` — A cost that grows with the square of the input explains the length limit, not the confusion. Give confusion its own cause, or end the sentence at the limit.
- [ ] **Polish** · flow · `which is why we need to have limits on how much text you can input` — This limit is the "context window" in the heading, but the text never names it.

### How Smart Is AI?

- [x] **Polish** · flow · `We will forever be debating whether our Artificial Intelligence is “intelligent”` — This repeats `So what is “intelligence,” you say?` from the previous chapter point for point. Point back to it, or cut one.
- [x] **Polish** · flow · `AI though is growing at a *hyper*-exponential pace.` — The multipliers stop after 6.7x. The next steps are about 2.75x (4 to 11 minutes), 18x, and 3.5x, so a reader who keeps counting sees the growth slow down before it speeds up. The prose also never says what "could do tasks" means (how reliably). *Your call:* give one multiplier across the whole span, or soften "an exponential of an exponential"?
- [x] **Polish** · flow · `Between 2021 and 2026, AI has become 100,000 times cheaper` — "For the same level of performance" is only in the chart caption. A reader who pays for the newest models will doubt the number.
- [x] **Polish** · flow · `OpenAI’s GPT-6 Astra model reached an almost perfect score` — The ARC-AGI-3 chart shows 62.71% on the standard harness and 99.95% only with a provider adapter. The prose drops that difference. Match the score ARC Prize verified.
- [x] **Fix** · flow · `Another example is the seahorse emoji.` — The stacking exhibit has no prose before or after it. The reader is never told what is wrong with the answers (a towel on a pan of boiling water, eggs holding up toilet rolls), so "Another example" points back to an example whose point was never made. One sentence before the exhibit and one after would do it.
- [x] **Polish** · sentence · `for some reason the language models were very confident that this actually exists` — A run-on with a comma splice. The key fact is never stated: there is no seahorse emoji.
- [x] **Fix** · flow · `So they’re just around the uncanny valley somewhere` — "So" does not follow. The sentence before says text makes chatbots seem human easily, which would put them past the valley. The valley also means creepiness and rejection, yet this sentence describes bonding. Say what the dip looks like for a chatbot.
- [x] **Polish** · flow · `while not giving it enough memory to be able to memorize everything` — The key step is left to the reader: because the model can't store everything, it has to learn the patterns behind the text. Without it, `the blueprint for intelligence` comes from nowhere.
- [x] **Polish** · sentence · `so humanity has coined that as being “intelligence.”` — You coin a word; "coined that as being" is not idiomatic. The same happens in `Niko Tinbergen coined this as being a *superstimulus*`.

### The Mistakes AI Makes and How to Deal with Them

- [x] **Fix** · sentence · `This solves the structure of the conversation in a grammatical sense` — "Solves the structure" doesn't parse. The meaning: the instruction makes "I don't know" a fitting next line.
- [x] **Fix** · flow · `they clearly come from training data intended to push the model towards hallucinating less` — The bullets show caveat formulas (`one thing I would caution about`), but the text never says how they relate to hallucination. The missing step: models trained to flag doubt now add a doubt-shaped line by template, whether or not they doubt anything.
- [x] **Polish** · sentence · `that they would have to give this disclaimer` — "This disclaimer" points at a disclaimer the text never mentioned. "Making the realization" is also not idiomatic.
- [x] **Fix** · sentence · `In a way, RLHF is a more honest way of training language models` — In a section about flattery, "more honest" makes the reader expect the opposite of what follows. The meaning is "closer to what we want", because answers are judged loosely, not word for word. "Actually" also appears twice in the sentence.
- [x] **Polish** · sentence · `so that they would eventually take seriously what their human user tells them` — "Eventually" reads like Dutch *eventueel* ("if needed"). In English it means "in the end".
- [x] **Polish** · flow · `Sycophancy is a very, very tricky thing to deal with.` — The word appears only in the heading and here. Name it where the flattery is described.
- [x] **Fix** · flow · `And if you like your humans like a god` — The two "like"s mean different things, and the argument is squeezed into one clause. The missing chain: the model adores you as its god, so you feel liked and trust it back; add hallucination and that trust lands on false things. "Dirty territory" should be "dangerous territory".
- [x] **Fix** · sentence · `You can’t think of an LLM as something that behaves like a machine` — Read literally, you can't think of an LLM as machine-like, so `but it doesn’t quite behave like a human either` has nothing to contrast with. Two plain statements would work.
- [x] **Polish** · sentence · `this will help your technical judge decide what to double-check` — "Technical judge" is a new term. The reader has to work out that it means the first skill.

### Understanding How AI Thinks

- [x] **Polish** · flow · `Nobody ever looks at the actual numbers inside` — The next paragraph says we `have to dissect` the brain, and Pretend-thinking has researchers looking at internal neurons. Say that nobody can read the numbers directly.
- [x] **Polish** · sentence · `many pop culture references to AI are malicious` — The AIs in them are malicious, not the references.
- [x] **Polish** · flow · `The Anthropic researchers do experiments like this all the time.` — "Like this" has no antecedent. The paragraph before describes a behavior, not an experiment.
- [x] **Polish** · flow · `The model “loved” this and decided to send a thank you email` — This sits under "misbehaved", but nothing says what is wrong with a thank-you email. Name it, such as an agent acting on its own impulse and writing to a stranger.
- [x] **Polish** · sentence · `I’m not sure what we should be doing with this` — Reads as Dutch (*wat we hiermee moeten*). The meaning is "what to make of this".
- [x] **Fix** · sentence · `pretending to act in line with their expectations` — "Their" reads as the models' own expectations, which inverts the meaning. Name whose: the researchers'.
- [x] **Polish** · flow · `because it was less bad than knowing there would be` — The setup (`when you refuse to do something bad (but only in the testing environment)`) needs a second read. The comparison also sets an act against a state of knowledge; compare the act with the outcome, a future version that always does the bad thing.
- [x] **Polish** · sentence · `These language models can show complex behavior where they behave differently` — "Behavior where they behave", and the comparison is unbalanced (aware of being tested versus real world scenarios).
- [x] **Polish** · sentence · `or tell it to keep itself alive next to the other task` — "Next to" is Dutch *naast*. English says "in addition to".
- [x] **Polish** · flow · `Once the model, during the training process, figured out how it can use reasoning` — "They" in this sentence has no antecedent (the researchers). It is also unclear whether this is a third method or a later stage of the implicit one.
- [x] **Polish** · sentence · `Second, we have a second hidden use of these thoughts` — "Second… second". The use is also not hidden; it is a side use.
- [x] **Polish** · sentence · `If you’d just let them come up with whatever text they want` — A Dutch-style conditional (*als je ze zou laten*). English: "If you just let them".
- [x] **Polish** · flow · `models seem to start “thinking” in Chinese` — A reader may think "people can read Chinese". The step that matters: the model drifts to whatever helps it, away from the language we chose to check it in.
- [x] **Polish** · sentence · `do the multiplication of the smallest numbers` — The meaning is "the last digits". "Smallest numbers" reads as the smaller factor.
- [x] **Polish** · flow · `proceeded to attack these companies (we don’t know who)` — "These companies" were never introduced; the sentence before says "real-world systems". "Who" should be "which".
- [x] **Polish** · flow · `So these “thoughts” we can read are, as far as we can tell` — "So" skips the link: the written thoughts voiced concern, and the actions went on anyway. In the next sentence, "Aligning this" and "it’s often the only way" point at two different unnamed things.

### A Machine Mind in a Human World

- [x] **Polish** · sentence · `let’s look at how they’re already helping us` — The nearest plural is "AI’s advantages and problems". The sentence also assumes the help that the next sentence questions.

## Part 2: Domains

### Part opener

- [ ] **Polish** · flow · `we’ve stepped up the ladder of abstraction and just got new skills` — "The ladder of abstraction" arrives with "the", as if known. The two examples (art after cooking, lending after writing) show new possibilities, not abstraction.
- [ ] **Polish** · sentence · `Is there one, even, or will it keep chasing us?` — "It" could be the next step or the hyper-intelligent mind. Name what climbs after us.

### Learning: Opportunity and Erosion

- [ ] **Fix** · sentence · `Right now, there’s one catch: you’re not sure.` — Not sure of what? The catch (you can't be sure the answer is right) is explained three sentences later.
- [ ] **Fix** · sentence · `was not looking at my course, but forcing myself` — In Belgian Dutch a *cursus* is the course notes. English readers read "course" as the class.
- [ ] **Polish** · sentence · `It’s a mighty sword that’s slightly risky` — "Often wrong" two sentences earlier becomes "slightly risky", then "far outweighed". "Mighty sword" may mean "double-edged sword".
- [ ] **Polish** · flow · `Would that have been better or worse?` — The chapter never comes back to answer it, and the "Erosion" in the title gets one clause at the end.
- [ ] **Polish** · flow · `It might work for something like playing an instrument` — The guitar analogy that follows shows repetition failing on an instrument.
- [ ] **Polish** · flow · `This is something language models can help us with, but they’re not perfect` — The mnemonic story is about other people's mnemonics. The point that a mnemonic made by AI is the same trap is never said. In the same paragraph, `having to transmit that knowledge` has the wrong verb: the learner still has to remember it.
- [ ] **Polish** · flow · `They were very specific in how they taught students` — "They" has no antecedent; the prose names no study or tutors. Name Bloom's study once.

### Work: The Debt of Productivity

- [ ] **Fix** · flow · `As a result we’ll become more productive than ever` — Higher productivity is not a result of perfecting getting harder, and the sentence before doesn't say why AI makes perfecting harder. One clause on the mechanism, then the right connector.
- [ ] **Fix** · sentence · `and even if you *know* it is because you “smell” it` — A garden path: "it is because" first reads as a cause. Four "it"s with different referents in one sentence.
- [ ] **Fix** · sentence · `which I needed to write about them, has triggered my creative mind` — The relative clause doesn't parse.
- [ ] **Polish** · flow · `Luckily, business sidesteps this problem` — "Luckily" reads as approval of a business that ignores meaning. If it is ironic, a reader may miss it.
- [ ] **Polish** · flow · `And as clearly evidenced, people generally prefer the cheap machine things.` — No evidence has been given.
- [ ] **Polish** · flow · `Human reference numbers aren’t available for all models` — It is unclear what a human reference number for a model is. The 98% (preferred over) and 85% (wins or ties) figures also use different measures.
- [ ] **Polish** · flow · `tasks like doing market assessments and making presentations for them` — "Them" has no antecedent, and "65%" has no scale or human baseline, so the reader can't tell if it is good.
- [ ] **Polish** · flow · `about 60% of the workers in “advanced economies”` — The dash makes this look like the same figure as "a billion people across the world". It is a different group and a different measure (the IMF counts jobs exposed to AI).
- [ ] **Polish** · flow · `I was running at the limit of what I could *input* into the AI` — The chain is unclear: you held off buying more tokens, you were at your own input limit, and yet the credits ran out. The link (the credit cap is what forces rest) comes two sentences later.
- [ ] **Polish** · flow · `This isn’t something that will be fixed with a smarter AI` — The paragraph turns from reviewing output to specifying what we want. The missing premise: a smarter AI still can't know what we didn't say. The slop grenade sentence then sits between cause and result, so `The result is that there are a lot of moments` reads as the result of slop grenades. "Had it in our minds completely differently" is Dutch; "pictured it differently".
- [ ] **Polish** · sentence · `many tasks for which we consider that you need a certain level` — Reads as Dutch (*waarvoor we vinden dat*).
- [ ] **Polish** · sentence · `there’s often an initial outcry of joy and fear` — "Outcry" means protest. The subject also shifts from "people" to "we".
- [ ] **Polish** · sentence · `exactly what the infrastructure of a large language model works best for` — "Infrastructure" is the wrong word (design? the way it works?).
- [ ] **Polish** · sentence · `but *how much happier* people become slows down` — An amount doesn't slow down; the gain shrinks.
- [ ] **Polish** · sentence · `food, shelter and good relationships, becomes less and less meaningful` — The subject is "this process", but it is the work that loses meaning.
- [ ] **Polish** · flow · `From the research, what matters most in work satisfaction` — The research is not named and has no citation.
- [ ] **Polish** · sentence · `doesn’t matter in the end—but it seems like it doesn’t` — The nearest verb is "doesn’t matter", so "it doesn’t" first reads as "it doesn’t matter", which inverts the sentence.
- [ ] **Polish** · sentence · `Even as our work becomes more abstract, it can still carry meaning.` — The paragraph before says `The task itself doesn’t carry meaning, we apply meaning.` "Carry meaning" means opposite things in two consecutive paragraphs.

### Love and Connection: Always There for You

- [ ] **Fix** · flow · `The famous DOCTOR script got people to attribute real understanding` — DOCTOR is never introduced. The reader doesn't know that ELIZA ran scripts or that this one played a psychotherapist, and the next paragraph's `in the rhythm of a therapist` depends on it.
- [ ] **Fix** · flow · `The systems behind why and how we get attached to AI chatbots` — The history builds ingredients: the para-social bond, self-disclosure, neediness, a body. The summary list of seven drops neediness, the body, and the para-social bond, adds new ones, and calls them "systems". Also, `The Tamagotchi doubled down on another ingredient` uses "doubled down" for something new. *Your call:* make the two lists the same set, or say how they map?
- [ ] **Fix** · flow · `Language models make it more difficult for us to be aware of the difference` — The payoff is left to the reader: a companion feels like messaging a friend (the use that raises life satisfaction) but is run like an engagement-optimized feed (the use that lowers it). Say it. The paragraph also carries about four ideas.
- [ ] **Fix** · sentence · `The man later died from those injuries.` — No injuries were mentioned, only that he fell. In the sentence before, `reassured the man she’s real and gave him an address` first reads as the man's actions.
- [ ] **Fix** · sentence · `Many AI users like to get advice from them` — By grammar, "them" is the AI users.
- [ ] **Fix** · sentence · `will say you’re in the right way more often than real people would` — A garden path: "in the right way" reads as one phrase. This is the bolded takeaway.
- [ ] **Fix** · flow · `The lonely people in their study did not initially spend more time` — This contradicts the loop's first step, `People who are less socialized and more emotionally vulnerable retreat to AI more often`. The reader can't tell which direction the study supports, and a loop needs both. "Less socialized" also reads as "brought up with fewer social norms".
- [ ] **Fix** · flow · `Even when people on the internet are jumping to this conclusion` — "This conclusion" has no referent; the lines before ask a question. "Even when" also reads like "even though".
- [ ] **Fix** · sentence · `The interactions they classified as having moderate or severe disempowerment potential` — "They" follows "people", so the users seem to do the classifying. "Disempowerment potential" is explained only in the next paragraph.
- [ ] **Fix** · flow · `significantly increase neural synchronization in the left inferior frontal cortex` — A general reader won't know this means two people's brain activity falling into step. "A second remarkable system" also never names the system.
- [ ] **Polish** · sentence · `that are actually the same things that cause our greatest moments of joy` — The third "that" clause breaks the list. "Intuitively" also appears in this sentence and the one before.
- [ ] **Polish** · flow · `So we will always be attracted to “someone” that says what we want to hear` — "So" rests on `you wouldn’t *choose* to spend more time with someone who consistently frustrates you`, two steps back, past a paragraph that argues the opposite.
- [ ] **Polish** · flow · `you immediately understand the meteoric rise of people having relationships` — The evidence is `1% claimed to have an AI friend`, which reads as small. The 2024 study also has no source.
- [ ] **Polish** · sentence · `Ow, what’s this on the floor now?` — "Ow" is a cry of pain; surprise is "Oh". A lawn has ground, not a floor. In the same paragraph, `before it tips over and manages to continue` reads as the vacuum falling over.
- [ ] **Polish** · flow · `these (still para-social) relationships could become *interactive*` — Para-social was just defined as one-sided, so "still para-social" and "interactive" seem to contradict. Name what stays one-sided (the machine feels nothing back).
- [ ] **Polish** · sentence · `infinite unconditional praise does not deserve to be given` — People deserve praise; praise doesn't deserve anything. The meaning is "praise that wasn't earned".
- [ ] **Polish** · sentence · `will also, left unchecked, abuse in the name of profit` — "Abuse" needs an object.
- [ ] **Polish** · flow · `you’ll very likely *feel* more emotionally involved compared to non-affective use` — This is offered as a second reason the message count underreports. It is about how much a conversation matters, not how many messages it has.
- [ ] **Polish** · flow · `I get a major ick when they try to *explain it*` — "They" is the practices, and "it" has no clear antecedent. "These teachers and gurus" then points back to people not yet mentioned. The bridge to the next paragraph is also unstated: the proof people want is proof for what they already want to believe.
- [ ] **Polish** · flow · `This effect was confirmed by the same Stanford study` — "This effect" is echo chambers and destroying things. The study measured something narrower: less willingness to apologize or repair a conflict.
- [ ] **Polish** · sentence · `they exaggerate in assuming people are correct` — "Exaggerate in" is Dutch (*overdrijven in*). The meaning is that they overdo agreeing.
- [ ] **Polish** · sentence · `the number of times people recommended ending a relationship increased` — A number of times can't go "from about 30% to almost 50%". It is a share of comments.
- [ ] **Polish** · sentence · `there’s quite some behavior difference *between* the language models` — "Quite some" is Dutch (*nogal wat*).
- [ ] **Polish** · sentence · `they’re clearly not always just parroting what they saw` — After "the language model builders", "they" reads as the builders.
- [ ] **Polish** · sentence · `These things do happen—they measured it happens somewhere` — The point is "rare but severe". The stress falls on "do happen", so "but they often have dramatic consequences" has nothing to contrast with.
- [ ] **Polish** · flow · `We intuitively grasp our immune system’s compatibilities for mate selection` — The step "we sense this through smell" is missing, and oxytocin then appears with no link to smell.
- [ ] **Polish** · flow · `they have no memory at all—a language model starts every conversation` — Earlier in the chapter, companions `remember what you’ve said over a lifetime`, and Memory is one of the seven. Say that the app's memory stores facts about you, not the model's moods.
- [ ] **Polish** · sentence · `It also nudges for curiosity` — Not idiomatic; "invites curiosity".
- [ ] **Polish** · sentence · `based on some rules inside the user’s messages` — Rules aren't inside messages; "cues". In the same section, `which has positive and negative sides` repeats "sides".
- [ ] **Polish** · flow · `if it leads to a loss of skill that has long-term negative consequences` — Which skill? This is the chapter's last line and the hook back to Part 2's frame of losing skills. Name it.

### Creativity: A Box, Outside the Box

- [ ] **Fix** · flow · `These last two are maybe the biggest advantages` — The last two are goal-directed planning and working memory. The AI side offers stored knowledge (not working memory) and goals, in reverse order, so the reader tries to match them and can't.
- [ ] **Fix** · flow · `The box surfing from the last example is one that I’d call true creativity` — Hard to follow. "An action in itself" versus "in the context of the goal" is unclear. Training on "the fastest way to get to the hiders" sounds like the goal itself. The game had one goal, not "many goals". `adhere on every step` is not idiomatic. *Your call:* what is the contrast, such as rewarding only the end result versus prescribing each step?
- [ ] **Fix** · sentence · `Claude showed “fake” in its J-space while it read through instructions` — One sentence carries three experiments with three subjects, and "showed “fake”" is opaque. Split it, and say what "showed" means.
- [ ] **Polish** · flow · `This wasn’t what we imagined artificial intelligence to look like.` — "This" opens the chapter. The reader learns two sentences later that it means AI that designs posters and films.
- [ ] **Polish** · flow · `the most boring short-sighted “obvious” ideas that don’t bring in any value` — The tension is novelty against usefulness, so this pole should be "useful but not new". "Don’t bring in any value" makes them useless too.
- [ ] **Polish** · flow · `it’s anything but truly random, precisely because of this` — Spotify's reason was that true randomness produces clusters that listeners hear as not random. "Because of this" (judging and steering ideas) doesn't explain it.
- [ ] **Polish** · sentence · `In literature, they call these two systems` — "Literature" reads as novels. The meaning is the research literature.
- [ ] **Polish** · flow · `In fact, when you *remove* someone’s inhibitory control beforehand` — This follows `The people that have better working memory and inhibition are usually more creative`. The see-saw that reconciles the two only appears in the last sentence. Set it up first.
- [ ] **Polish** · flow · `So while AI technically has all of the ingredients to be creative` — "So" follows the temperature fix, which sounds like a solution, then concludes that AI can't. Say that the added chaos is only a partial fix.
- [ ] **Polish** · sentence · `a single-direction calculation that resets once the model is done` — Done with what? The contrast with the "strange loop" depends on the reset happening after each token.
- [ ] **Polish** · sentence · `The websites and apps Claude makes all look alike because they look good` — Looking good doesn't make things alike. The missing step: the model learned one idea of good, so every output moves toward it.
- [ ] **Polish** · flow · `The same thing happens when we use external help for our creativity` — Functional fixedness was defined for objects. The jump to ideas needs one step: an idea you have heard becomes your default answer.
- [ ] **Polish** · flow · `It’s one thing to think about this in the context of working` — "One thing" never gets its "another", and the paragraph doesn't answer its opening question. `Even the other way` is not idiomatic.

### Today’s Socrates Moment

- [ ] **Fix** · sentence · `It can learn anything and become our personal teacher` — The previous chapter just said that a finished model doesn't change. The meaning is "teach us anything".
- [ ] **Fix** · flow · `Workers become dramatically more productive when they leave themselves behind.` — Every other item names a gain and a loss. This one's cost is unclear. The Work chapter's version is work that is `not *really* our own work`.
- [ ] **Fix** · flow · `What I think he worried about is that` — "The show of wisdom without the reality" is about seeming wise versus being wise. The next sentence jumps to psychological needs with no bridge.
- [ ] **Polish** · sentence · `Socrates worried that new writing would make us forget.` — "New writing" reads as recent texts. The meaning is writing as a new technology.
- [ ] **Polish** · flow · `From what we’ve seen so far, having a certain set of skills is not a requirement` — The book hasn't shown this, and Meaningful work lists competence as a source of satisfaction.
- [ ] **Polish** · flow · `which we tore into pieces when we assumed AI would become “all-powerful,”` — "Tore into pieces" means demolished. The book also never stated that assumption in those words; the Part 2 opener asks `if we had a hyper-intelligent artificial mind`.

## Part 3: The Ascent

### Captured by Consumption

- [ ] **Fix** · flow · `We’ve seen this exact same thing already happen with social media` — The nearest "thing" is arriving in a perfect world and feeling hollow, but social media finished nothing. The paragraph is about superstimuli as a business model, two paragraphs back.
- [ ] **Fix** · flow · `Maybe that’s okay. After all, just being *driven*` — "After all" should give a reason it is okay; the clause argues the opposite. The turn is "the real question is what makes us happy".
- [ ] **Polish** · sentence · `Serotonin fires more as a *forecast*` — Neurons fire; a chemical doesn't. "More" has no comparison.
- [ ] **Polish** · flow · `is not wired for ease but for the pursuit of something meaningful` — The section shows a system that chases scarce, uncertain rewards. It says nothing about meaning, and the next section shows the same system chasing TikTok.
- [ ] **Polish** · flow · `which obviously gets the chicks in trouble because they’re no longer getting food` — The chicks in the experiment didn't go hungry. The step is hypothetical: a chick that preferred the rod would starve.
- [ ] **Polish** · sentence · `even when I’m simultaneously ashamed that I’m not doing something I want` — "Even though… even when" stacks two concessions, and "something I want and would like to do" says one thing twice.
- [ ] **Polish** · flow · `We’re solving all these problems and making all these incredibly cool` — The paragraph before lists rewards, not problems, and "it’s so attractive" has no referent. The move to "what if we finish everything" has no bridge.

### Happiness through Friction

- [ ] **Fix** · sentence · `someone who doesn’t care about your life at all and still loves you` — Reads as indifference, which clashes with "loves you to death". The meaning seems to be that this person doesn't care whether you are perfect.
- [ ] **Fix** · flow · `One of the main ways we find meaning is that we always chase happiness` — The sentence before ties meaning to a life story; this one ties it to chasing pleasure, with no step between. It also clashes with The Existential Vacuum (`When people lack meaning, they fill the void with pleasure`). Your point is in the paragraph's last sentence: meaning comes from working on something that makes life better. The paragraph also opens with "self-image" and never returns to it.
- [ ] **Fix** · flow · `it seems like AI is neutral here—it just does stuff for you` — `They make the other parts more difficult` sets up two items. Flow gets its answer; Meaning never does. After `But the story is more complex.` come Baumeister, a new framework, and hedonia. One or two sentences could close the Meaning item, or point forward.
- [ ] **Fix** · flow · `They’re the same thing. Hedonia is the “right now”` — Two Greek terms are "the same thing" as a list of three. Is eudaimonia the evaluative item or the flourishing item? The list is also called "three time spans", but evaluative well-being is a judgment, not a span.
- [ ] **Fix** · sentence · `Even when building long-term life satisfaction *also* benefits your short-term feelings` — A fragment. It seems to mean "even though"; join it to the sentence before.
- [ ] **Fix** · flow · `Because eudaimonia requires short-term moments of stress` — "Because" makes stress the reason cortisol improves, but the mechanism is missing. "Improves our cortisol levels" also has no direction.
- [ ] **Fix** · flow · `This tells us that yes, you can significantly improve your life satisfaction` — The open question was `Is that enough?`. The two points before argue that positive challenge is not the whole story, so "yes" reads as "yes, it is enough", and then the paragraph turns with "But".
- [ ] **Polish** · sentence · `we were forced onto our challenges` — Not idiomatic; "forced to face".
- [ ] **Polish** · sentence · `they interviewed roughly 450,000 US respondents and found that the more money they made` — "They" changes from the researchers to the respondents.
- [ ] **Polish** · flow · `by building a deep appreciation for the exact thing we’re trying to avoid` — Two sentences earlier, "avoid this" meant avoiding the dilemma. Name the thing (difficulty).
- [ ] **Polish** · flow · `Before we can answer how we can change our behavior or technology` — This repeats `How do we do that? But first, what is happiness, really?` across the heading.
- [ ] **Polish** · sentence · `consisting of five independent variables` — A statistics term with a different meaning; "five parts".
- [ ] **Polish** · flow · `“The company,” said Tiny Dragon.` — The quote has no attribution (James Norbury, *Big Panda and Tiny Dragon*). It sits inside the list of benefits, so it can read as part of the list.
- [ ] **Polish** · sentence · `near-death or death, breakup, boundary violations` — "Death" reads as your own. The meaning is the death of someone close.
- [ ] **Polish** · flow · `If you experienced something truly horrible, it’s just…trauma.` — The whole section calls these events trauma, so "just trauma" blurs the term. The meaning: it only damages.
- [ ] **Polish** · sentence · `it’s morally wrong to wish it in any situation` — The idiom is "wish it on anyone".
- [ ] **Polish** · flow · `The fact that we can grow from trauma is a lucky coincidence` — The clause after the dash (nobody has run the study) doesn't explain "lucky coincidence". The missing step: we only know about growth from people who happened to suffer, and nobody should cause it on purpose.
- [ ] **Polish** · flow · `it’s clear that yes, *gain without pain* is possible` — The examples just before (gym, marathon, ice-cold sea) all involve pain. The meaning is growth without tragedy. `You could call this “post-ecstatic growth”` reads as your term, but it is Roepke's.
- [ ] **Polish** · flow · `First, we already know there’s an inverted U-shape connection` — "Already" suggests the reader saw it before. The earlier inverted U was about the severity of one event; this one is about lifetime adversity, which is new. "These people" in the next sentence has no noun.
- [ ] **Polish** · sentence · `what’s most valuable and consequences and this is a key pillar` — The list runs into "and this is", so "this" reads as one more list item. Split after "consequences".

### The Mental Gym

- [ ] **Fix** · sentence · `all the time and force ourselves to get bored` — Reads as if forcing ourselves to get bored is one of the bad habits in the "if" clause. Split before "and force".
- [ ] **Fix** · flow · `The debt collector we saw in our chapter on work is back` — The image appeared once, as `a faint image of a debt collector on the horizon`, and the debt was never named. Here the report, the five-year-old purchases, and not remembering where you were are never mapped to anything. One sentence on what the report stands for (AI leaves you the hardest review work). The Work chapter calls the collector "they"; here it is "he".
- [ ] **Fix** · sentence · `It prepares your mind for sleep by slowing down the thoughts` — "It" points to play time with AI. The meaning is that ending it does.
- [ ] **Polish** · sentence · `I want to get it out to get manufactured` — "Send it off to be manufactured". The sentence is also a run-on with five actions.
- [ ] **Polish** · flow · `most of our good things come *only* when we’re not under pressure` — The first half of the paragraph says surprise needs real mental effort; the story about your dad says good things come when you aim at nothing. The reader has to reconcile them. `start writing in your book` is also odd, because the reader isn't writing one.
- [ ] **Polish** · sentence · `Not just because when you think through it, you’re actually integrating it` — Two nested "because" clauses and three "it"s.
- [ ] **Polish** · flow · `So start the day with nothing.` — The rule you broke was to `start writing as the first thing of the day`. The reader asks which rule is the real one.
- [ ] **Polish** · sentence · `sit with the struggle of not knowing the answer` — The nearest "answer" belongs to the trivia question. The meaning is what to write in the slide deck.
- [ ] **Polish** · sentence · `it’s one of the least necessary parts of your body for survival` — The "it" before the dash means the bad night; this one means the prefrontal cortex.
- [ ] **Polish** · flow · `I want to pay particular attention to our executive functions` — The 2 AM question (`Why is that? And why is this incredibly relevant`) gets its answer two paragraphs later, after a detour through AI and the debt collector.
- [ ] **Polish** · flow · `Today, that’s the effort to verify that the work of AI` — Holding back an impulse and checking AI output are different acts, and the link is unstated. In the next sentence, "But" has nothing to contrast with, and "while" can read as "although".
- [ ] **Polish** · flow · `I’d have a lot fewer opportunities to lift things above my head` — Farm work involves a lot of lifting, so this reads backwards until the next sentence.
- [ ] **Polish** · sentence · `If I had to pick a single thing to think more, it’s *noticing*.` — "Think more" doesn't fit "noticing"; "practice".
- [ ] **Polish** · flow · `our entire day is tuned towards optimally working with the most intelligent AI` — The chapter promised practices for happiness `despite all the technology`. The close makes AI productivity the goal and happiness a side effect. If the irony is intended, a reader may still take it as a reversal.

### Designing Aligned Allies

- [ ] **Fix** · sentence · `one of the bigger changes of highly intelligent AI is *our own laziness*` — "Changes of AI" doesn't parse. "Dangers" or "risks"?
- [ ] **Fix** · flow · `which will lead to our AIs making “stupid” classic language model-type mistakes` — Trusting the AI too much doesn't make it err; it lets its errors through unchecked.
- [ ] **Fix** · flow · `And you can’t make the opposite claim: people use the technology more` — The "opposite claim" repeats the first claim's direction. The converse you mean is "heavy use proves it is useful".
- [ ] **Fix** · sentence · `This doesn’t prevent them from seeking profit, but they can’t be sued` — "This" follows the OpenAI Foundation sentence but means the PBC status from two sentences back.
- [ ] **Fix** · sentence · `If they understand how to bring people out of rumination` — A chain of "if" clauses with no main clause.
- [ ] **Fix** · flow · `but his Dot (that persistent AI agent) noticed it` — Dot appears nowhere else. If Dot noticed the message, why keep looking? "But… but" doubles. In the next sentence, `this agent noticed the person` leaves unclear whose agent and which person.
- [ ] **Fix** · sentence · `can be an excellent “mini” form of this` — "This" could be narrative-making, journaling, or therapy. "Those thoughts" in the next sentence has no antecedent.
- [ ] **Fix** · flow · `Another approach is training the model on chat transcripts` — The reader loses count of the methods: documents explaining the Constitution, `A second way`, `the approach they do take` (stories), and chat transcripts. `It works.` doesn't say which method produced 65% to 19%, and "relatively unrelated" doesn't say unrelated to what. Two paragraphs later, `without us needing to train it on direct examples of chat conversations` contradicts the transcript method.
- [ ] **Polish** · flow · `But they could be helping us in many ways.` — The Asimov passage never says why it is here. The First Law's `through inaction, allow a human being to come to harm` matches the idea of an AI that protects us from our own impulses. Say so.
- [ ] **Polish** · flow · `making its “owner” filthy rich in the process` — The paragraph is about risk, and this example ends in a windfall. Name the risk.
- [ ] **Polish** · sentence · `Mistakes that are so obvious you wouldn’t miss them` — Mistakes you can't miss don't test attention, and `It might even be made easy to spot` repeats the point.
- [ ] **Polish** · flow · `So how do we make sure AI “behaves properly”?` — The next section answers a different question (who profits from our use). The technical answer comes four sections later, under a heading that repeats this question.
- [ ] **Polish** · sentence · `interrupting you with a “better way” of doing what you’re doing` — Three list items are joined by "and", so the reader loses where each ends.
- [ ] **Polish** · flow · `On the other hand, in a year or two pretty much everyone` — On-device AI is a second way to weaken the same incentive, not a contrast. The reason it removes the pull (no bill per use) isn't stated.
- [ ] **Polish** · sentence · `instead of hoping companies voluntarily adopt them (and are honest about it)` — Who is honest?
- [ ] **Polish** · flow · `they want their own AI “megafactories” running on the mainland` — The US, China, and EU tour ends with no line that returns to the section's question. "On the mainland" reads oddly for Europe.
- [ ] **Polish** · flow · `Think about the four main elements that matter to how we deal` — "The four main elements" reads as already introduced, but they are new and uncited, and only two get discussed. `Not too bad, not too little` mixes two scales.
- [ ] **Polish** · sentence · `This is a combination of the stressor itself, but also our own self-belief` — Broken construction, and "locus of control" isn't defined.
- [ ] **Polish** · sentence · `I’m seeing a man sit on the bench across my street` — "I see a man sitting… across the street".
- [ ] **Polish** · sentence · `throughout this book—is the key that unlocks this` — "This" has no near referent.
- [ ] **Polish** · sentence · `But they can also do the exact opposite: help us to stay away from them.` — "Artificial Intelligence" becomes "them", then "they" (the companies or the AIs?), then "them" again.
- [ ] **Polish** · sentence · `the modern world throws at you is impeccable` — "Impeccable" means flawless. "Invaluable"?
- [ ] **Polish** · flow · `I don’t see any problem with honestly reflecting on our successes` — This answers an objection nobody raised. If the worry is flattery (sycophancy, from Part 1), name it.
- [ ] **Polish** · flow · `ChatGPT knew today’s date from its system prompt` — "System prompt" is never defined, and `folklore prompting tricks like tipping and threatening` assumes the reader knows them.
- [ ] **Polish** · flow · `of our earlier example of an AI assistant that sees the emails from the CTO` — Hidden motives calls him `one executive`. In the same sentence, `behave like how we want a proper AI assistant to be` mixes two constructions.
- [ ] **Polish** · sentence · `When it was trained on why it behaved a certain way, it influenced` — The first "it" is the model, the second the training. "Much better" than what?

### New World, New Scarcity

- [ ] **Fix** · flow · `the person that judges what is worth paying attention to` — This nearly repeats `the person who can *decide what is worth looking at* becomes valuable` from a paragraph earlier, and the difference (setting the rules, saying what we want) is buried. "Attention" also switches meaning inside the section: ours is scarce, the AI's is abundant (`In a way, today already, attention is abundant`). Say the switch.
- [ ] **Fix** · flow · `you quickly realize it’s hanging on a very thin piece of string` — The quoted romantic view already says humans will be `responsible for the decisions`. You call it thin, then make responsibility the answer. Say which half fails (choosing what to do) and which survives (bearing the consequences). The idiom is "hanging by a thread", and in `If you’re lucky, this closes your case` it is unclear whose case.
- [ ] **Fix** · flow · `is very, very out of distribution` — A machine-learning term the book never defines. "In the same vein" also has an unclear referent.
- [ ] **Fix** · sentence · `doesn’t have more reasoning other than “it feels like we should have it.”` — Garbled ("more … other than"). The next sentence then gives a reason after all.
- [ ] **Fix** · sentence · `is something we’ve *decided* AI cannot do more than anything` — Reads as "AI cannot do more than anything". Move "more than anything" forward.
- [ ] **Polish** · flow · `For example, we used to measure our intelligence with programming and mathematics` — "For example" promises tasks that lost and gained value. What follows is about measuring intelligence.
- [ ] **Polish** · flow · `As we’ve seen in Domains, AI makes things abundant` — "Domains" reads as a common noun; "in Part 2".
- [ ] **Polish** · flow · `We’ve also seen a shift towards more mindful activities` — Mindful activities and dumb phones are not curation. They are a different answer to too much content.
- [ ] **Polish** · sentence · `The moment something has been prompted once it becomes worthless slop` — "It" reads as the first video, which you just called valuable. The copies are what become worthless.
- [ ] **Polish** · sentence · `Just like how many notaries are very well-paid` — "Just like how" opens a comparison that never gets its second half.
- [ ] **Polish** · flow · `and even artists in a way—whether their next piece succeeds or not` — The clause ends on `comes down to their ideas`, which makes artists an example of ideas, not responsibility.
- [ ] **Polish** · sentence · `On the one hand you could say AI can’t be held responsible` — Both halves argue the same side.

### AI as Infinite Creation

- [ ] **Fix** · sentence · `Infinite *stuff* is nothing; the ocean is shaped by what’s holding it` — One sentence earlier, "nothing" was the space that gives everything meaning. Here it means worthless.
- [ ] **Polish** · flow · `but it’s more something like *orientation*` — "Manifestation" replaces "creation" without notice. "Orientation" is offered as the opposite and never used again.
- [ ] **Polish** · flow · `the foundation of the production of *meaning*` — "Semiosis" is not defined, and "production" puts a making word on the side of the unmade.

### When Superintelligence Turns Away

- [ ] **Polish** · sentence · `positively and negatively, over what time frame` — The tacked-on clause reads as unfinished, and "imagine… imagine" repeats.
- [ ] **Polish** · sentence · `trying to answer the question of “why did they leave me”` — The scenario was cheating, not leaving.
- [ ] **Polish** · sentence · `They might leave a mini-version of themselves` — The superintelligence is "it" in the chapter's first paragraph and "they" here.
- [ ] **Polish** · sentence · `and that made them motivated and pull through those rough times` — One "made" governs both an adjective and a verb.
- [ ] **Polish** · sentence · `Religion worked to give people meaning before anything else existed` — Reads as "before anything at all existed". The meaning is "before any other technology".

## Conclusion

- [ ] **Polish** · sentence · `(out of where, by the way? who or what in us` — "Out of where" is Dutch (*van waar*); "from where". The aside also splits "we have chosen… to make".
- [ ] **Polish** · sentence · `they’re a dull starting point scaled up, stamped out, lived in` — "Lived in" doesn't fit a stamped-out template.
- [ ] **Polish** · sentence · `It’s shoving our face into meaning.` — The idioms are "rubbing our nose in it" and "shoving it in our face".
- [ ] **Polish** · flow · `our minds that are constantly adapting to that tension` — "That tension" has no near referent; the last one was in the Conclusion's first paragraph.
- [ ] **Polish** · sentence · `everything disappears anyways—so the fact that we decide to be here anyways` — "Anyways" twice in one sentence.

## Facts to check

Nobody checked these against sources in this pass. Each is a place where an informed reader may write in.

- `plateaued at around $75,000 in 2010 dollars` — Killingsworth, Kahneman, and Mellers (*PNAS*, 2023) revised this. Emotional well-being keeps rising with income for most people; the plateau appears only in the least happy group.
- `That’s great for general world knowledge like the height of the Eiffel Tower` — The height changed in 2022, from 324 m to 330 m, when a new antenna went up. Both figures are in training data, which weakens it as the example of a fact that doesn't change.
- `in the case of a 4x4 matrix, beating the previous best` — AlphaTensor's 4x4 result holds in mod-2 arithmetic. For ordinary numbers, Strassen's method still stood.
- `One of the most reliable findings in how students learn best` — Bloom's two-sigma result combined tutoring with mastery learning. The Socratic questioning and motivation details may come from elsewhere. Later reviews find smaller tutoring effects, about 0.8 standard deviations.
- `The Shopify CEO coined the term *slop grenade*` — Reports say he popularized the term and credited a colleague.
- `probably amidst all the pushback and reporting on this, Replika abruptly dropped` — The widely reported trigger was the Italian data protection authority's order in February 2023.
- `this won’t trigger when someone forcefully grabs you or a simple brush touches you` — Researchers activate C-tactile fibers with slow strokes of a soft brush. If "a simple brush" means a quick brush-past, say so.
- `*learned helplessness*, a state of semi-apathy where people never learned to care for` — In Seligman's sense, it means learning that your actions don't change the outcome, so you stop trying.
- `Like agriculture and the first industrial revolutions took away our need for physical effort` — Agriculture is usually described as adding physical labor compared with foraging.
- `OpenAI is additionally partly owned (26% on the board)` — The 26% is the OpenAI Foundation's equity stake, not a share of board seats. The Foundation appoints the board.
- `they want their own AI “megafactories” running on the mainland` — The EU's InvestAI plan calls them "AI gigafactories".
- `none of them had people walking down the street video-calling relatives` — Video calls appear in older science fiction, such as *2001: A Space Odyssey* and *Back to the Future Part II*. Only "walking down the street" holds.
