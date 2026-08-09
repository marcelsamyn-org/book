# Status Check & Sprint Plan — 2026-08-09

*Follow-up to `2026-06-10-reverse-outline.md` (on branch `claude/kind-cerf-oos6fs`). That doc's deadline math assumed 14 weeks; **Sep 15 is now ~5.3 weeks out**. Current manuscript: ~33.3k words excluding notes.*

## Where you are against the June plan

| Step (from §5 of the June doc) | Status |
|---|---|
| 1. Draft the Conclusion | ✅ **Done** — and it lands. The Inevitable vs. The Surprise, consecration, the sideboard scene. |
| 2. Mechanical restructure | ✅ ~85% — spine matches the target: parts renamed (Machine Mind / Domains / The Ascent), Benchmarks + AGI/ASI killed, Learning/Work/Creativity promoted to chapters, Captured by Consumption moved into Work, Drift chapter gone, Seduction of Ease folded in, Mental Gym chapter created. Leftovers below. |
| 3. Consolidation pass (§3 dupes) | 🟡 ~70% — token anxiety ✅, awareness callback ✅, creativity-trained-out callbacks ✅, screenplay-writer callback ✅, grown-not-built ✅, jaggedness ✅. Remaining: Motivation section, PTG paraphrase (below). |
| 4. Write the missing pieces | 🔴 Barely started — this is the actual remaining work. |
| 5. Trim Part 1 | ✅ Done. |
| 6. Rewrite Overview last | ⬜ Correctly still pending (it's supposed to be last). |

**Translation: the editing/restructuring phase you're dreading is ~90% behind you.** What's left is mostly *writing new sections you were excited about in June* — plus one short mechanical sitting.

## Sitting 1 — mechanical leftovers (half a day, zero inspiration required)

- [x] **Dissolve `### Motivation`** — done 2026-08-09 (Claude). Reward-prediction-error and serotonin-as-patience were already covered in Captured by Consumption; the Sahu/Colwell serotonin citations moved there; section + Comfortable Sadness note deleted. Happiness Through Friction now ends on the God passage.
- [x] **Delete the PTG paraphrase** — done 2026-08-09 (Claude). Removed the trauma-narrative paragraph and the "This is called Post-Traumatic Growth…optimal level of difficulty" paragraph; kept the (unique) thought experiment and Big Panda quote.
- [x] **Move The Lover And The Hammer** — done 2026-08-09 (Claude). Now closes Love & Connection as `###`, verbatim.
- [x] **Kill the empty `### Inform People` heading** — done 2026-08-09 (Claude).
- [x] **Delete stray debris** (Meta links / `st-Tr` inside Token Anxiety) — done 2026-08-09 (Claude).
- [x] **Delete the stale TODO** atop Captured by Consumption — done 2026-08-09 (Claude).
- [ ] **Decide the tumor story** (~line 1232, Meaning Guidance): promote to Introduction per the June plan, leave a one-line callback. (The second-surgery comparison in When Superintelligence Turns Away is a distinct point — keep it, as a callback to the intro.)

## Sittings 2–N — the writing, in energy order

- [ ] **Methodology / meta-layer** (~800 w). Cheapest and hottest: hand-writing a book about effortful creation while feeling token anxiety about the manuscript itself. Confession, not research.
- [ ] **Introduction** (~1–1.5k w). The tumor story — material already written at Meaning Guidance.
- [ ] **Finish The Mental Gym** (~1.5–2.5k w). It currently stops mid-sentence ("your brain prefers to run on"). Decide the organizing principle. One candidate already in the manuscript: the four elements from Facilitating Growth Through Challenge (severity, controllability, support, processing style) — each gym practice tunes one of them. Another: the existing sections already trace a daily cycle (protect the morning → hold boredom → notice → inhibit → sleep). Pick one, don't invent a third. If the brain-energy research rabbit hole threatens the deadline, cut the subsection to a paragraph — the program matters more than the neuroscience.
- [ ] **Steelman** (~800 w, buffer item). "Socrates said this about writing" + "new games always emerge." June doc §4.4 has the answer sketches.
- [ ] **Children** (buffer item). One passage in Learning — adults exercise muscles built in an AI-free childhood; kids never build them. Learning is the thinnest domain chapter (1.3k w vs. Work 3.7k, Love 4.7k); this is the natural way to feed it.
- [ ] **Plant "error minimization" in Part 1** (~1 sentence). The best half of the Mindvalley pitch — "AI's whole existence stems from error minimization" — is technically literal (training *is* loss minimization; deviation is punished) and the book never names it. Natural spot: Concepts & Terminology, where training nudging the parameters is explained. Creativity already has the perfect companion setup (novelty trained away, chaos injected from *outside* the model).
- [ ] **Harvest error minimization in the Conclusion** (~1 sentence). The Inevitable is already there; one callback naming the machine as an error-minimization engine lets the Conclusion cash the Part 1 setup instead of introducing the idea cold.
- [ ] **Rewrite the Overview** from the finished Conclusion — and build it on the Mindvalley spine sentence: *meaning is when we choose imperfection, and AI — an error-minimization machine — structurally cannot*. Seed "The Inevitable vs. The Surprise" vocabulary here so the Conclusion lands as a crescendo, not a cold introduction.
- [ ] **Title decision** — now unblocked (June doc said: after the Conclusion). Contender families: *Sacred Struggle* (kept honest by "struggle is the force of life"), the consecration family (riskier, truer to the ending), and now the **choosing-imperfection family** minted by the spoken pitch.

## How to talk about the book (the spoken pitch)

The Mindvalley formulation *is* the spine sentence the June doc (§4.1) asked for — repeated retelling did the work. It's the Conclusion compressed: "decides to *not* go to that optimum… leave the imperfection as it is," and the partner example is already in the manuscript ("The love we give feels special when it's given *despite* clear reasons why not to").

Two-beat shape to keep: **diagnosis** (AI is an error-minimization machine — its whole existence is a pull toward the expected, and nothing expected ever meant anything to anyone) → **answer with the partner punchline** (finding the perfect partner is convenience; *choosing* an imperfect one is love).

One caution: don't let "choosing imperfection" swallow the God passage. The book holds two meaning-sources — the imperfection you *choose* (consecration, the painting left alone) and the struggle you *didn't* (the tumor, the not-knowing). The Conclusion unifies them as "risky randomness," and the partner example is secretly the synthesis: you choose the imperfect partner, *and then* they surprise and hurt you in ways you can't control. The pitch should end there, not at the choosing.

- [ ] **Write down the canonical pitch** in your own words (a paragraph in this doc or in the Methodology section) so it stops living only in your Mindvalley memory.

## Final week — polish

- [ ] **Trim the vector mechanics** in Tokens And The Context Window (`book.mdx:76`) — the one un-executed piece of the June "Part 1 too deep" feedback. Keep the sampling sentence ("pick one of the most-likely ones at random…"): it seeds Creativity's temperature argument, the Conclusion's Inevitable, and the error-minimization plant. Cut the one-hot dictionary-vector and "memory passed back in" details — they never pay off, and the memory framing describes an RNN more than a transformer (it contradicts the next paragraph's correct "re-reads everything every token").
- [ ] Copyedit pass (don't do it earlier; content is still moving). Known typos: "abgiguous", "susprisingly", "ourseleves", "unsatiable", "mose of the times", "traning", "thisLike" (~line 64). One broken sentence: "the amount of times a language models has already decreased" (Hallucinations §) is missing its verb phrase.
- [ ] Open prose-TODOs: graphs (pace-of-progress §), depression/meaning study numbers (Work intro), AI-writing-preference citation (Good-Enough Rocket), Tamagotchi pictures.
- [ ] Love & Connection has no chapter intro (heading falls straight into The Rise of Synthetic Bonds). One paragraph.
- [ ] Optional: half-page Part 2 opener doing the old Seduction-of-Ease teaser work, so Part 2 doesn't open cold on Learning.

## Site tracker

Retuned 2026-08-09: `src/publish/progress.ts` target 55k → **40k**, and `SECTION_TARGETS` re-keyed to the current part titles (they were still keyed to "Digital Mirage"/"New Sun"/"Reclaiming the Flame", so every part was silently falling back to an even split). Per-part targets now: Overview 800 · Introduction 2,200 · Part 1 7,500 · Part 2 13,000 · Part 3 15,000 · Conclusion 1,500.

## Deadline math, redone

~5–7k new words over ~4 writing weeks (keep week 5 for polish) = 1.2–1.7k words/week. Same pace the June plan called comfortable — but the buffer is gone, so Steelman and Children are the designated cuts if anything slips. Everything else on this list is either mechanical or already half-written.
