# Overview
This book asks a simple but high-stakes question: when LLM-based chats become woven into everyday life, what do they do to our creativity, our intelligence, and our ability to relate to others? The central thesis—“Sacred Struggle”—holds that friction and challenge are not bugs but features of human flourishing: we learn deeper, create better, and feel more alive when we face difficulty on purpose. The book resists both doom and hype; it treats AI as a powerful scaffold that can either amplify human agency or erode it into homogenization, over-reliance, and learned helplessness. The aim is to translate evidence into design principles for AI, personal practices for users, and social norms that keep the human in the loop—so the technology strengthens taste, judgment, and connection rather than numbing them.

For research and writing support, I’m looking for rigorous, recent, and citable work (ideally RCTs, field experiments, meta-analyses, high-quality qualitative studies) on: productivity and quality shifts; originality/novelty measures; learning depth, transfer and calibration; collaboration and relationship effects; attention/affect (addiction, distraction); and long-run skill development. I want both failure modes (homogenization, over-trust, mode collapse in thinking) and countermeasures (deliberate difficulty, sampling diverse outputs, active-recall/reflective prompts, constraint-based workflows, light “Dopamine Nutrition Label” ideas). The end product should convert findings into actionable heuristics for designers, concrete use-protocols for knowledge workers, and cultural guidance for a post-AI world that prizes strong character, responsible decision-making, long-term ambitious projects, and disciplined taste.

# Introduction
## Story-based intro

## Methodology, what to expect, for who is this

# Part 1: The Digital Mirage
## Decoding The Machine Mind
### Concepts & Terminology
This world of "AI" is wrapped in hype, mystery and confusion. From charlatans slapping the word on every product they find to the researchers not even knowing why these systems end up seeming so smart, you'll find every opinion and perspective under the sun in a matter of seconds.

So I will add one more. I'll gradually build up the nomenclature from the broadest words up to what the more technical terminology is for the technologies we're talking about today.

Let's start with this word, *Artificial Intelligence*. When I took the course with that name in university I was expecting to learn how magic works. We didn't have ChatGPT yet but the groundwork for it existed: we already had some seemingly magical technologies for things like translation and image recognition. Alas, it turned out to be more about things like optimizing the logic for finding the best chess moves. However, I did learn a definition of AI that turned out to be the most useful one in today's day and age: AI is where a system *appears to be behaving in an intelligent way*. This definition is wildly abgiguous, perfectly reflecting this word. It doesn't say anything about how we know if something is intelligent or what kind of technology it should be. Maybe you say that when the lights turn on automatically as you walk into a room is intelligent---and I can't disagree with that.

Now that we've satisfied the salespeople and saddened the scientists, let's turn to some more precise terms. *Machine Learning* is an approach to programming in a sense, where you're not telling the computer what to do explicitly, but you're showing it examples and you let it figure out how to do it by itself. Most machine learning is "supervised" where we give it the correct input and output (when a person asks this, you should say that) and it can also be unsupervised when we don't even know the correct answer.

But most of the "magic" has come from a third type: *reinforcement learning*. In reinforcement learning, you usually let the machine do its thing for a bit and then you'd give it a score for how well it's doing. This is, for example, how robots learn to walk: you give the machine control over the motors and you score it, say, on how well it's still standing upright and if it's actually moving forwards. This is the methodology where we've seen in many different cases that the computer manages to come up, all by itself, with behaving in ways that are remarkably human-like.

In normal software, we write *code* that describes how the machine should behave. In machine learning, we train *models*. The actual code, the "what to do" for machine learning systems is relatively simple: you just multiply and add a whole bunch of numbers (this "how to" is the machine learning *algorithm*, which needs a trained *model* to be complete). These numbers, millions or even billions of *parameters* or *weights*, are what the model learns during its training phase: the traning process makes changes to the parameters through the examples the model "sees." Note that once this model is done with the training, these parameters don't change anymore. There is no inherent "continuous learning as it runs," to do this you have to re-train or do some other trickery.

You probably also encountered the terms *neural network* or *deep learning*---or even *deep neural networks.* These are roughly the same thing: a neural network is a specific structure of a machine learning algorithm, and a *deep* neural network is just a bigger version of that. There are many kinds of machine learning algorithms; most are specific to the specific use case but neural networks are very general and can be used for pretty much anything, though the trade-off is that you need a lot more training for it to actually learn to do something useful.

All of the "headline systems" you see today are deep neural networks, usually using some variation of the *transformer architecture* with *attention.* The development of these architectures are what allowed these machine learning systems to deal with large amounts of data in one go (entire sentences instead of words, entire images instead of very small ones). Less technically, we're usually talking about *Generative AI.* This just means "it's an AI thing that *creates* things"---because most machine learning is focused on, for example, classifying transactions or predicting which movie you'd like to watch next.

Most of our discussions today are about *Large Language Models* (LLM's). These are (very) large, deep neural networks that operate on language---that is, words and sentences. We'll dive into them next because some of the specifics of LLM's will help you work better with ChatGPT and the like, but before that I just want to mention one more class of Generative AI: *Diffusion Models.* A diffusion model slowly and iteratively removes noise. This is how image generation works (start off with random noise and let the AI "remove the noise"), but you can also interpret noise in movement (video generation) or even text (there are some LLM's being built as diffusion models).

#### How We Made Large Language Models Useful
The big hype boom in AI today started because of two breakthroughs:

1. *Scientific.* The training of *very large* language models. This technology had been existing for many years, but it took that long for someone to think, "what if we just do the same thing but a thousand times bigger?" Turns out these models just seem to keep getting smarter.
2. *Entrepreneurial.* The decision to tweak these language models so that they become *chat bots*. OpenAI was the first to publicize and commercialize this.

Let's dive a little deeper into how these work so we can build up to how ChatGPT specifically came to life.

At their base, language models are relatively simple. They "read" a bunch of text and then make a prediction for what the next word would be in that given text (technically they predict the next *token*, we'll get to that in a bit). Then, you put this entire initial text, *plus this new word*, back in the system agan, it predicts the next word, and so on.

They'd been in use for a couple of years with relatively limited application. There was some research being done and they were used for some things like machine translation (Google Translate, DeepL) but this was with what we now consider to be small language models, with just a couple of million parameters. OpenAI was one of the first to bet on the *Scaling Laws*---an empirical result that seemed to show that language models would keep getting more intelligent, the larger you make the models and the more you train them. It's very expensive to train these very large models though; most people weren't willing to bet on this, but OpenAI was one of the companies that did.

They built GPT-1 with 117 million parameters, GPT-2 with 1.5 billion and the breakthrough came with GPT-3 which had an impressive 175 billion parameters (just storing those parameters takes 350GB!). It turned out the bet was well-founded and GPT-3 was indeed surprisingly---magically, even---smart.

The second breakthrough was in how they turned this into a product. Since large language models *complete* text, they're a little cumbersome to use practically. For example, you might input something like:

> What's the circumference of the planet Earth?

A "base" LLM will try to complete that text based on what is learned from, so it might output something like this:

> Hint: It should be measured around the equator, at Earth's widest point.

If you're used to ChatGPT, this will feel very odd to you. But the model is just trying to make the text (input + output) seem like a complete whole. In this case, it probably guessed that this is a part of some kind of high school test.

The solution to this is to make it very clear to the LLM that it should *act* like it's an AI assistant in a conversation, and structure the input to the model like a conversation. The question we asked the LLM earlier will be transformed slightly and the real input to the model will look something like thisLike

> This is a transcript of a conversation between a human user and a helpful, friendly AI assistant called ChatGPT, built by OpenAI.
>
> User: What's the circumference of the planet Earth?
> Assistant:

If the model now needs to *complete the text*, it makes much more sense to give the answer, because it needs to fill in the next part of the conversation. (In real life, we also need a way to stop it from inventing an entire conversation.) The LLM's you're using day-to-day not only have a scaffolding like this around the conversation, but they're also specifically *instruction fine-tuned*, which means that we've let humans (or other language models) come up with thousands of examples where this "friendly AI assistant" is behaving in the way we'd like it to. This way, we teach the models that it should answer questions, follow instructions and for example refuse to explain how to build a bomb.

#### Tokens And The Context Window
The only thing a machine learning algorithm can do is working with numbers (mostly adding and multiplying) but sentences aren't numbers. So, before the actual model runs, your input is *tokenized*: it's converted to *tokens*. What exactly a token *is* is also *learned* by a (different) model, and it usually ends up being someting like three quarters of a word. Common words like "the" often become a single token, and you'll also see tokens for stems of words and suffixes (eg., "work" and "ing"). So if you multiply the amount of words in your input (prompt) by 4/3, you'll get an estimate of how many tokens it would count.

The model represents each token as a *vector*, a list of numbers. The list is always exactly as long as the entire dictionary of possible tokens (about 32,000 usually) and it's all zeroes except for the current token that it's reading---then it's a 1. Each of these vectors are placed, one by one, in the input, which results in some output vector. Part of the output is what we'll pass back in for the next token (we interpret this as the LLM's memory) and another part is the output: another vector of the same length as the input with all kinds of numbers. These numbers are between 0 and 1 so we interpret them as the probability that this token is the next one in the sequence. We'll pick one of the most-likely ones at random (the exact most likely one results in extremely boring output), and that's the next token ChatGPT is "writing out." Then we add that memory + output token back to the input and we do the whole thing again.

An important technical detail to understand about LLM's is that *they read the entire conversation fully, every time they predict the next token*. Every new token needs to consider the entire conversation so you can imagine that, if these all need to be multiplied with hundreds of billions of other numbers over and over again, it takes quite some computational power. The power needed grows with the *square of the input*, which is why we need to have limits on how long our input can be.

In practice, this means that when your conversation becomes long enough, it will be truncated at some point and the LLM will "forget" the first part. Usually the context can be a few books' worth of content but in real life we do notice these models start forgetting and behaving weirdly long before they reach this technical limit. All that to say: it's very important to get right what you put in the model's context.

#### Agents: How We Make AI Act

The chat and instruction-following skills of large language models are already very useful. We can use them to summarize text, write e-mails, translate, reformat, brainstorm ideas, explain things in a simple way, get advice for our relationships, and much more. But can we actually make it *do* things? Can we have this AI actually send the email for us, or research something, or give a refund in a customer support chat?

It turns out we can and it's simpler than we initially thought. These days, the LLM's are optimized for agentic behavior but even before that was the case, we could make them take actions for us.

Here's how it works, conceptually: instead of chatting with a real person, the LLM is chatting with a piece of software. This software would ask something like "someone asked to return their order, what would you do now?" and the LLM would say something like "well, I would ask for the order number" or "I would like to see their order's current status." The software that's running the agent would then interpret this message, execute the action and respond in that computer-to-computer chat. For example it could say "the order was placed last week and had a value of $99. What would you like to do now?" This back and forth continues until someone decides to stop it.

When you chat in ChatGPT today, there's a form of this system running within the chat, too. Both you and the ChatGPT software are talking with the language model in a kind of group chat. This allows ChatGPT to do things like search the internet or browse a website when you ask it to.


### How smart is AI?

We will forever be debating whether our Artificial Intelligence is "intelligent"---partly because we don't even know how to define intelligence to begin with. Over the last few years, we've seen large language models beat every test we gave them over and over again, but we keep finding "odd" behavior that feels to us humans like a very stupid thing to do.

These models are already making new scientific discoveries, and at the same time they're sometimes incapable of even honoring the request to "please don't repeat every question I ask you." Language models are now at the top of the mathematics olympiad and competitive programming, but ask them to write an article with wth a given amount of words and they'll fall apart immediately.

I think we humans have made our task of judging the intelligence of these machines very difficult because we've defined intelligence in an odd way. You can think of "human intelligence" as being comprised of two parts: one is the intelligence embedded in the way our internal plumbing and intuition works, the other is what we can do if we consciously think things through. There's a big discrepancy between humans in how good they are at mathematics or remembering things so we've called that intelligence, while forgetting that things like staying upright on a slippery surface or knowing how far to stand in line from the person in front of us (so it's not awkward) are incredible signs of intelligence.

The nature of machines is different from the nature of humans, so things that are easy for us might be difficult for them and vice versa.

#### Benchmarks

<!-- notes -->
One common argument against "true" AI intelligence is an observation that it seems like these models are indeed succeeding in many things where we considered you need to be extremely intelligent for (programming, researching, writing prose), but they're surprisingly *bad* at the things we don't have tests for. `TODO CITATION`
<!-- /notes -->

Recently, a friend of mine shared how he prompted multiple AI's and got them to collectively figure out a solution to a scientific problem some researchers had been agonizing over for weeks. I thought it would be fun to build a "group chat" with multiple large language models. So I told them to count to ten together, one after the other, and it was incredibly difficult to get it right. They would count multiple times, restart, et cetera. We're dealing with a strange kind of technology indeed.

Another example is *Simple Bench*, a benchmark built by a YouTube influencer that asks questions that involve some misdirection but ultimately have answers that are very obvious to us humans. For example, it gives a whole bunch of physics details and formulas to ask how much of some ice cubes will be left on a hot pan---of course the answer is they all melt but somehow these language models don't realize.

Most benchmarks though, no matter how "difficult," have a surprisingly short lifespan. When a new benchmark just hits the scene, all the models do a poor job and we think we finally found the test for true intelligence, then six months later every model scores 90% or more. This has been happening over and over and over again, to the point that much of the bottleneck towards general intelligence seems to be our ability to test for it.


#### AGI & ASI and The Singularity

These terms are the real hype words that every reseacher, developer and company is trying to build towards.

AGI is *Artificial General Intelligence*, a level of intelligence where we would consider the AI to be intelligent in pretty much everything, similar to humans. While the public has not agreed that we reached this level of intelligence yet, I do think we can make a compelling case that we are very close, if not already there. ChatGPT already knows a lot more about a lot of things than most human beings and is almost universally helpful. Not perfectly, and it makes mistakes that make us humans think it's really dumb, hence there's no agreement whether we've reached this or not.

When we have reached Artificial General Intelligence, the next phase is Artificial SuperIntelligence, ASI. This is a level of AI that is vastly superior to any human, can improve itself and can solve problems that no human can solve.

The thing about ASI is that it's a relatively small step from AGI. Already with intelligence in general there models are obeying the "scaling laws" (give an LLM more compute power and it will get more inteligent) so the step to superintelligence will mostly come down to allocating more energy to our AGI system. Note that we routinely find significant efficency increases---for example OpenAI increased their efficency for running the ARC-AGI benchmark by 390× over the course of 2024---but these facts are definitely causing political and environmental tensions across the world. China is rapidly ramping up energy production (mostly coal) and Europe is shutting down nuclear reactors, but do we want to be last in building a superintelligent system?

Then we come to the grand finale: The Singularity, the moment where our AI is more intelligent than all of humanity combined. This is the "real scary moment" because we have no idea what will happen to us humans---by definition we don't have the capacity to imagine what an entity like this would think. Will it be benevolent, evil or not care about us at all? Think about how you interact with something much less intelligent than you, say an ant. We could imagine this ASI to feel about us with the same indifference. This is where *alignment research* comes into play: the study on what makes AI aligned with human interests, and not unimportantly, do that transparently. There have been many observed cases of language models cheating and lying. But we'll cover this in a dedicated chapter later on.

#### AI is already insanely smart

##### Quote from X: Hard training data
https://x.com/jackclarkSF/status/1962238672704803096

> Five years ago the frontier of LLM math/science capabilities was 3 digit
> multiplication for GPT-3. Now, frontier LLM math/science capabilities are
> evaluated through condensed matter physics questions. Anyone who thinks AI is
> slowing down is fatally miscalibrated.

[https://pbs.twimg.com/media/GztFaPYaIAA8NWN?format=jpg&name=large](https://pbs.twimg.com/media/GztFaPYaIAA8NWN?format=jpg&name=large)

##### The intelligence curve doesn't seem to be stopping
##### Medical diagnoses
##### Video is now impossible to discern
##### Seeing AI as Collective Intelligence

#### It's smart in a way that's different from how we've commonly defined it
##### We always defined intelligence as thing difficult for humans to do, but now we have machines much better at this; yet they're incapable of things that are trivially easy for us humans.

### Dealing with AI's unpredictable mistakes

AI doesn't think in the same way we humans do. Sometimes we're surprised by how well it thinks, sometimes we get frustrated by how it could be making those kinds of "stupid" mistakes.

What are the common types of mistakes large language models make, how could we be fooled by them, and what can we do to make sure we can reasonably trust what it says?

#### Hallucinations
##### LLMs are mostly concerned with writing things that "grammatically make sense," and they've been trained to answer questions and provide help in a very confident way without too much extra knowledge handed to it
##### So they tend to confidently make mistakes
#### Sycophancy
##### LLMs see you a little like a god (maybe for them, you are) who knows everything and is always right
##### They can even pander to you in very subtle ways that you barely notice
#### AI-induced delusion
##### Sycophancy + hallucination. Some people get into a loop of this believing "their special ChatGPT" figured out some "cosmic secret" or broke out of their cage or is leaking information that's secret
#### Your judging expertise matters
##### If you use LLMs in places like programming, where you can often easily verify its output, you have a lot of bad experiences so you bring that to all your interactions—don't easily trust it. But if you don't use it for that, you're not "being trained" to validate output.
#### Negative cognitive augmentation
##### LLMs aren't perfect—sometimes they add unhelpful things that distract and limit our own thinking
### We really don't understand LLM's
#### Research on "hidden motives" and behavioral steering
##### Alignment Faking
#### AI is something we *grow* and *discover* more than *build*
##### One of the big reasons we like sticking to language models is because at least somewhat we can understand what's going on inside
##### Anthropic: Tracing the thoughts of a large language model
https://www.anthropic.com/news/tracing-thoughts-language-model

LLM's can make up logically incorrect reasoning traces so it would come to the conclusion where it agrees with the human

It incorrectly explains how it added numbers.

Once Claude begins a sentence, many features “pressure” it to maintain grammatical and semantic coherence, and continue a sentence to its conclusion. so it would come to the conclusion where it agrees with the human

Alignment Faking

#### Solving: Mechanical LLM Issues
##### Put yourself in the feet of the LLM: should I be nice, supportive, challenging, follow instructions or not at all?
##### Preventing hallucinations / grounding
## The Seduction of Ease
### Learning: Opportunity and Erosion

I'm always baffled when I think about the students of today and what an incredibly different experience they have studying. Writing suddenly became the easiest thing in the world and you have access to something that can explain anything, in any way, within a few seconds.

There's one catch, though. A friend of mine who went back to university is using ChatGPT to help find good analogies for the concepts he learns in law school and while they're always clear, they are plain wrong embarassingly often. Currently, large language models are a slightly risky sword but the benefit of 24/7 personal tutoring already far outweighs that. We've already seen enormous improvements in hallucinations so I expect this to be a non-issue in a few years.

So is it good that we have an infinitely patient all-knowing tutor in our pockets? My main strategy of studying mathematics was not looking at my course, but forcing myself to solve exam questions immediately. I vividly remember sitting on the floor for *hours* trying to figure out how I could solve a problem. It was not the fastest way of absorbing the subject matter but it trained me at what is maybe even more important: the skill of retrieving and surfacing the knowledge that was already in my mind.

How We Learn

Every time we do or think something, a sequence of neurons in our brains fire. This means an electrical signal goes through the neurons, and between neurons there's communication via chemical signals: neurotransmitters. Along the long parts of these neurons, the axons, they are wrapped *myelin*, insulating cells that protect the electrical signal against interference. It is believed that one of the main ways that learning and skill acquisition work is through the buildup of more myelin along the neural pathways we use more often. All that to say: you get better at what you do more often.

But practically, just focusing on repetition will not help us in many cases. It might work for something like playing an instrument but not so much for grasping a new intellectual topic.

#### [Effect of LLMs on Education and Society](Effect of LLMs on Education and Society)
#### [Books Don't Work - Andy Matuschak](Books Don't Work - Andy Matuschak) - Reading or following lectures just doesn't trigger the reflective and thinking activities needed to learn and integrate new stuff. AI can help with it, or be even more unhelpful by taking away the step of interpretation that we might need to understand something.
#### Large student score increase, I think it flattened over a longer period
#### Struggle strengthens learning
Think about it like this: the effort you feel when you try to remember something is the process of myelin sheets forming and strengthening those neural connections in your brain. Desirable Difficulty, Productive Failure.
#### Seems to be very useful to help explain and understand things, I guess a bit at the expense of not forcing your mind through that deep thinking figuring out process
#### Personalized tutoring -> $+2\sigma$ student scores. AI can deliver this at scale, though it's a delicate balance of how much challenge to leave in.
#### Solving: The Thinking Partner
##### Laddered help
##### Let LLM grill you with increasing difficulty
##### Prompt disagreement
###### Important to reset context: LLM's suffer from cognitive fixation
##### Both Claude and ChatGPT now have a Study or Learning mode where they will ask you or assign things to you once in a while
### Work: The Debt of Productivity
Work is where we spend most of our waking hours and has some peculiar characteristics that make it especially AI-prone. In a way, *work* has for the entire history of humanity been the main target of technological innovation. From the fire that we used to extract more nutrients from our food to robot drones inspecting our crops, automation has been at the core of working.

Since our society decided to interpret businesses as entities separate from humans, they can act in ways counter to what would be best for the people in them. Or rather, a business doesn't really care. People get fired, get assigned a job that depresses them (like moderating TikTok video) or just ruthlessly get swapped out for a robot dog.

But those examples are quite clearly "bad." What happens when we muddy the waters a little more---say by replacing the deeply satisfying work of a master sculptor with prefab moulds?

You see, for many of us our work *is* our main source of fulfillment. We get to create something meaningful for this world and that gives us happiness and satisfaction. Being social animals, we've evolved with a deep-rooted need to give back to our community. But imagine you're Mother Evolution (I can already hear the biologists screaming you're not supposed to do that---bear with me, we're only indulging for a few seconds). How could you "program" your little humans so they understand what's meaningful to contribute? Well, it seems to be that our old brains created the rule that *if it's hard to do it's valuable, and it will satisfy you if you do it.*

This is a nice little shortcut that has served our species immensely for many thousands of years. But already today we're seeing the cracks in this unsatiable need for doing things that are difficult: *what happens when we're done?* What when our own ambition did its job *so damn well* that there's nothing really left to sweat, cry and bleed for?

This isn't a problem you can solve without consequences. We could keep the laser crop-weeding machine in the shed and pull out the weeds with our bare hands, but are we willing to suffer through having less food because of that? Not to mention how silly it would feel to be "working hard while the robots could do it better but our puny little human minds need to believe they're important."

Luckily, business sidesteps this problem by only caring about productivity and efficiency. But that introduces a new problem potentially exacerbating all of this even more: what if you find a new technology that produces at 80% of the quality of what you had before at only 1% of the cost? This has been the plight of our world since the dawn of industrialization. We can make houses, clothes and objects many times cheaper---they're just a little ugly and devoid of any 'soul.' Surrounded by this, we get reminded over and over that automation and machines built most of this at a staggering speed, much faster than we ourseleves could ever hope to do it. And as clearly evidenced, people generally prefer the cheap machine things.

<!-- notes -->
TODO talk about depression and meaning numbers from studies
<!-- /notes -->

So looking out into our future we might see a continuation of this same trend: we can get more things for a lot less money---with the trade-off of being more "boring" and "simple." We'll talk more about this later because it's likely more complicated than that. But for now, let's look at what AI does to our work *today*.

#### The Good-Enough Rocket

At this point in time, large language models have gotten susprisingly good at many tasks for which we consider that you need a certain level of intelligence. Tasks like summarizing text or writing something have been great strengths of these tools for years. It's definitely not perfect, though. I'm still writing large parts of this book by hand---not just because writing helps me flesh out the ideas from the book, but also because something in human writing still stands out. Like we discussed before, this probably has something to do with sampling, or how we choose the words to write down.

But books aren't the only thing we write down. In fact, most of our writing is unbothered by barely-perceived huffs of poetry. We just need to get the email out to ask for approval, or get a list down of the ten key findings of the report.

<!-- notes -->
Most of our writing just needs to clearly, concisely make a point---and that's exactly what the infrastructure of a large language model works best for. In fact, some studies have found *[TODO: Citation]* that people usually prefer AI writing, unless they know it's written by AI.
<!-- /notes -->

So right now, we are handing in some writing quality in exchange for a multiple-digit increase in how much we can write. It's a little sad that this means we lose the creativity and artistry that's around us almost randomly, but it's a trade-off that's almost crazy to *not* make.

#### Disappearing Depth

In fact, we do see that in many critical tasks, artificial intelligence tools (or even better, when human experts cooperate with these tools) produce higher quality outputs *and* are much faster than humans alone. This is great, but there's a slippery trap that looks a lot like another one humanity has been battling for a good decade: media feeds.

The addictive power of our "social" media feeds is so ingrained that we almost expect every single person to spend hours each day scrolling around. We can't help ourselves because these feeds show us things we like to see---and dose it with some less-interesting things, that makes it even more addictive. This is surprisingly similar to working with ChatGPT: mose of the times, you instantly get rewarded with something great, and sometimes you get a response you don't like. The only issue is that while we unanimously understand that "doomscrolling" is bad for us, our AI's still do useful productive work for us. There's no way people are going to delete their ChatGPT app because they're spending a little too much time on it.

Since our brains are so smart, they try to save energy. In Kahneman's book *Thinking, Fast and Slow* he splits our thinking systems in *System 1* and *System 2*. System 1 is quick intuitive estimates, and System 2 is deep, logical reasoning. Our brains tend to avoid logical reasoning (it uses more energy) in favor of making quick guesses or estimations, and the book shows plenty of examples where this ends up leading people to make the wrong judgement.

With an AI that tries to fullfill every request you give it, there's nothing for you to do except to describe what you want to happen. After a short amount of time, you'll have trained your mind that there's no need to think deeply about things anymore, and you can instead just prompt the chatbot to do things for you. That's fine, but just like social media does, it shortens our attention span and makes it much more difficult to actually do deep thinking when it's needed. People who have gotten very used to working with AI (myself included) are finding it more and more difficult to sit down in the quiet and think deeply about something.

We call this *cognitive debt:* you can get a loan for some quick thinking right now, at the cost of your own ability to think later on. And even though you can keep on taking out loans seemingly forever (as our governments clearly show), at some point you have to pay back.

This has worse consequences than might be immediately obvious. We still depend heavily on human oversight, judgement and review. If nobody takes the time and effort to think deeply and evaluate what the AI produced, it can quickly derail in some random direction and start pouring out low-quality work. This isn't something that will be fixed with a smarter AI: in fact the chance that we forget to clearly specify what we want increases as we use and trust our machines more and more.

We are already faced with the dilemma that perfecting our work needs a disproportional amount of effort and this will only get worse. As a result we'll become more productive than ever with a growing lack of satisfaction in our work: we created things, but it's not *really* our own work. We could do a lot better but the economics forbid us from doing so. And even when we can take time for it, we'll run out of patience immediately.

So while work continues its trajectory towards efficiency, speed and absence of humans, there's a faint image of a debt collector on the horizon and we're not quite sure yet how quickly they're walking or what they'll have to say.

#### Much more productive for certain tasks, faster and higher quality
#### Not always better quality once we get "addicted"
##### Consequence is producing lower quality work which reduces our satisfaction
##### Also increases frustration at least for me
##### After getting used to AI-assisted work, the quality of our work and thinking *without* decreases
#### At work this is an even bigger challenge because of companies' profit motives: they care much less about long-term happiness if productivity and output stays high and quality good enough
#### Cognitive Debt (Thinking)
##### Using AI is like taking out a loan
##### Heavy ChatGPT users show the lowest brain activity, over months the memory links weaken
#### Cognitive Offloading (Memory)
##### When we expect we'll be able to find something we won't try to remember it
### Reclaiming the Grind
#### Challenge and difficulty is crucial for developing the mind, practicing creativity, learning social interaction, and even happiness
#### AI lures into avoiding those difficulties, thereby stripping us of our own skill and happiness over the long term
## Creativity's Mirror-On-The-Wall
### Where Does Creativity Come From?
#### Working Memory + Inhibition of the obvious
#### Ability to detatch and see other perspective
#### Divergent & Convergent Thinking
One study calls it "blind variation and selective retention"
#### Motivation * Self-Determination * Positive Mood
#### Well-linked knowledge (raw materials) is important for creativity
##### You become more creative once you know more things and have them better connected in your mind—so if you don't properly learn you'll have worse creativity
#### Cognitive fixation
##### If you see examples, you're less likely to come up with more novel ideas yourself. So starting with AI might be a bad
### Mathematical Creativity
#### Token Sampling
##### By the very mathematical design of large language models, these systems are handicapped in their creativity.
##### The standard sampling method (choosing which word it writes next) just picks the most likely one.
##### We have many techniques to "increase creativity" but all of them still weigh "most probable" highly—which makes sense because you don't want ChatGPT to write out nonsense.
##### Humans, though, in all of their writing use some very rare words or structures at least a few times throughout each piece of writing. Current LLM's can't do that.
##### This is the main reason why you can still "feel" AI-written content
#### LLM's do show some ability in self-inhibition but you might have to prompt it for The MIT License (MIT)
Eg., you might tell it to stop itself mid sentence and keep iterating, and/or do that in the reasoning traces.

### The Creative Paradox
#### [Effect of LLMs on Creativity and Ideation](Effect of LLMs on Creativity and Ideation)
#### Short-term increases in creativity
#### Using AI reduces your non-AI creativity
#### Current LLM's are measured to be about as creative as the average human
#### The broad knowledge works, but the mechanics of LLM's stop it from finding truly creative ideas
# Part 2: The New Sun Casting Shadows on the Soul
## When Machines Mimic Love
### The Rise of Synthetic Bonds

Humans are so dang difficult to deal with! One minute they give us all this love and understanding---and the next they make a mistake, they hurt us, they misunderstand us, they cheat and lie...and then they expect us to forgive them? We don't know if they went too far or if we're the ones being too difficult, maybe they sound mean but it's just our own inner child being afraid of some imagined doom. Maybe they do want the best for us, or maybe not, maybe they're right, maybe not. All these questions that are impossible to answer...

Wouldn't it be nice if we could talk to someone who always said the right thing? Someone with infinite patience, who always understands us, who sounds nuanced enough for us to believe them but who still always agrees with us? We could train an AI so that it will only say things we like and prefer!

I hope you intuitively started cringing a little bit reading that last part. I think most of us intuitively understand that it's exactly the difficulties in dealing with other real, messy people that create unbreakable bonds between us, that teach us our biggest life lessons, that are actually the same things that cause our greatest moments of joy. "I learned to love our differences" has a very different energy to it than "we always seem to think the same thing."

The thing is, this is exactly how AI is trained: we show a human two responses to the same prompt and they pick the one they prefer. The whole thing is optimized for what you would like to hear right now, irrespective of the rest of your life and any sense of long-term happiness. And we're not stupid: you wouldn't *choose* to spend more time with someone who consistently frustrates you, that would be silly. But because humans are so beautifully messy, once in a while they will end up hurting us. That's unpleasant to say the least, but more often than not, when we emerge from those tears and shouts we do so with a deeper understanding of ourselves, better social calibration, and appreciation for all the good things we do have in our life. Easy positive interactions are addictive, but when we lose the effort we also lose both growth and meaning.

So we will always be attracted to "someone" that says what we want to hear and all AI's are optimized for this (how else would you train it). When you undestand that, you immediately understand the meteoric rise of people having relationships with virtual chatbots. In a 2024 study (a long time ago in AI-time), 1 in 4 young adults believed AI has the potential to replace romantic relationships. The amount of people in such a relationship was much smaller---1% claimed to have an AI friend---but these are early days. I draw a parallel to compulsive social media and porn consumption: these are also optimized for short-term appeal and addiction, and pretty much everyone spends more time on "social" media than they wished they would.

#### [1 in 4 Young Adults Believe AI Partners Could Replace Real-life Romance](1 in 4 Young Adults Believe AI Partners Could Replace Real-life Romance)
##### Show the many businesses working on this, for a long time already actually
##### Even linked to my thesis from university which was about social robots
##### Character.ai is very popular
##### Human lookalike sexbots
###### https://www.realbotix.com/
##### Effect on men vs. women—emotional connection is a lot easier with text only vs. eg., physical connection—seems like women see a bigger effect of this pull towards AI relationships
#### [Effect of LLMs on Social Relationships](Effect of LLMs on Social Relationships)
#### ChatGPT gives advice rated as better and more independent overall
##### Trap of sycophancy
#### Emotionally rich conversations with LLMs increase loneliness and might decrease human connection
#### In a way, AI is emotional porn: gives an instant release of good emotional feeling, but doesn't build your real social capacity and deep meaningful relations
#### Comparing with social media feed, instant messaging, distraction
#### Because it's not physical it can fulfill us emotionally, at least in the short term, but there's a lot of our biology that doesn't trigger so we still don't feel that *deep* sense of connection. Physical touch but probably also more, things that we don't even perfectly understand yet. Like porn it can dampen us in a way because it sort of feels like it fulfills the need but there's still loneliness and sadness.
<!-- notes -->
#### TODO Separate research run
<!-- /notes -->
#### Solving: The Hammer or The Lover
##### Be conscious about emotionality in LLM's (use Petals hah)
#### Solving: Social Step-Back & Connection Creator
##### Disappear to facilitate social connection
##### Encourage social connection, creating bonds through difficult conversation
##### Encourage talking to people, maybe even knowing who your friends are as in "maybe you should talk to Alex about this"
### Advice and Loneliness Loops
#### Sycophancy
#### Infinite Patience
### Biology's Unmet Hunger
#### Physical Touch
#### Non-Verbal Communication
#### Is Passive-Agressive Behavior Useful?
## Happiness Through Friction
### The Forge of Meaning
#### Understanding Happiness
- PERMA :: Positive emotion, Engagement (flow), Relationships, Meaning, Accomplishment

##### Fundamental needs fulfilled
##### Hedonic (feeling good) vs. eudaimonic (doing/being good)
##### Flow
###### Optimal balance of high challenge matched to skills
##### Relationships
##### Stress doesn't make us happy, but it is linked to *meaningfulness*

#### [Impact of Struggle on Happiness](Impact of Struggle on Happiness)
##### Desirable difficulty
###### Struggle strengthens learning
###### The kind of difficulty matters: challenge stressors vs. hindrance stressors
##### Productive failure in teaching
###### Concept that has been studied for a long time
##### Post-traumatic growth
###### Greater appreciation for life if you went through adversity

#### Creating Meaning
##### Happiness also comes from activities that emphasize meaning like personal growth
###### This is something where AI can help me: record everything and reflect my wins (works for me, probably not for everyone)

#### Tuning Struggle
##### Only few people believe AI will automatically make humans happier
##### Good kind of difficulty
##### Invisibility
###### The best AI you don't see at all
###### Ideally, AI should be taking care of some things and leave us with exactly the things that will increase our happiness. That can be time for meaningful activities but also challenge in relationships—where it's not trying to solve it immediately.
##### Supporting learning

#### Conclusion: AI isn’t a happiness shortcut
#### Solving: Depth Enabler
##### Give triggers and prompts for my own thinking
##### AI should really make me think and reason, it can spot the mistakes in my thinking process and therefor more qualitatively improve my reasoning instead of making me figure it out all at once by just saying the end is wrong
###### MW: Not 100% sure if that's best
###### Related to book [Malcolm Gladwell - Outliers](Malcolm Gladwell - Outliers)
####### I think here he talked about how to create the precise amount of struggle for ideal growth
### Comfortable Sadness
#### We have a tendency of trying to create comfort but if we get it too often it eats on our happiness
### Sacred Struggle
#### Just like we go to the gym because we know physical challenge is important for your health and happiness; it's actually exactly the same for artificial intelligence
## The Echo of Collective Drift
### Exponentials & The Loneliness Epidemic
### Relationships Redefined
#### Scene from Her
### Towards Resilient Joy
#### Platforms win by reducing friction, not building character. (Perverse incentives)
# Part 3: Reclaiming the Flame
## Personal Armor Against the Tide
### Cultivating Discipline
#### Prompt for challenge
### Everyday Rituals
#### Context Resets
#### Verify Outputs
### Embracing the Unknown
#### Work with the best and latest AI models (don't walk away)
## Designing Aligned Allies
### Inform people
### I do think we need government-level AI because we don't want the attention / usage incentive
### Build human-aligned AI's
### Alignment Research
## Horizons of Human Flourishing
### [Post-Labor Economics](Post-Labor Economics)
### Post-Truth Mechanics
### What will matter
#### Personality
#### Responsibility
#### Long-term risky activities

# Conclusion