import { describe, expect, it } from "bun:test";
import { resolveStoryline } from "./resolve.js";
import type { Thread } from "./types.js";

// Words per line: Overview=1, "Alpha…"=4, Part=3, Chapter A=2, seed line=8,
// Chapter B=2, explain line=9, Conclusion=1, payoff line=6. Cumulative
// offsets at each line start: 0, 1, 5, 8, 10, 18, 20, 29, 30; total 36.
const book = [
  "# Overview",
  "Alpha beta gamma delta.",
  "# Part 1: One",
  "## Chapter A",
  "The seed is planted here in chapter a.",
  "## Chapter B",
  "Now we explain the seed fully in chapter b.",
  "# Conclusion",
  "The seed pays off at last.",
].join("\n");

const thread = (id: string, mentions: Thread["mentions"]): Thread => ({
  id,
  title: id,
  question: id,
  mentions,
});

describe("resolveStoryline", () => {
  it("places mentions by word offset and names their section", () => {
    const { threads, totalWords } = resolveStoryline(book, [
      thread("seed", [
        { kind: "plant", quote: "Alpha beta", note: "" },
        { kind: "use", quote: "seed is planted", note: "" },
        { kind: "explain", quote: "explain the seed fully", note: "" },
        { kind: "payoff", quote: "pays off at last", note: "" },
      ]),
    ]);

    expect(totalWords).toBe(36);
    const seed = threads[0]!;
    expect(seed.mentions.map((m) => m.position)).toEqual([1, 11, 22, 32]);
    expect(seed.start).toBe(1);
    expect(seed.explainAt).toBe(22);
    expect(seed.payoffAt).toBe(32);
    expect(seed.end).toBe(32);

    const use = seed.mentions[1]!;
    expect(use.line).toBe(5);
    expect(use.section.path).toEqual(["Part 1: One", "Chapter A"]);
    expect(use.section.slug).toBe("chapter-a");
  });

  it("flags a use that comes before the explanation", () => {
    const { threads } = resolveStoryline(book, [
      thread("seed", [
        { kind: "use", quote: "seed is planted", note: "" },
        { kind: "explain", quote: "explain the seed fully", note: "" },
        { kind: "use", quote: "pays off at last", note: "" },
      ]),
    ]);
    expect(threads[0]!.mentions.map((m) => m.early)).toEqual([true, false, false]);
    expect(threads[0]!.owed).toBe(false);
  });

  it("uses the payoff as the explanation when a thread has none", () => {
    const { threads } = resolveStoryline(book, [
      thread("fallback", [
        { kind: "plant", quote: "Alpha", note: "" },
        { kind: "use", quote: "planted here", note: "" },
        { kind: "payoff", quote: "pays off", note: "" },
      ]),
    ]);
    const t = threads[0]!;
    expect(t.explainAt).toBe(32);
    expect(t.mentions[1]!.early).toBe(true);
    expect(t.mentions[1]!.position).toBe(13);
  });

  it("marks planted threads without a payoff as owed, and unplanted explanations as cold opens", () => {
    const { threads } = resolveStoryline(book, [
      thread("owed", [{ kind: "plant", quote: "gamma delta", note: "" }]),
      thread("cold", [
        { kind: "explain", quote: "fully in chapter b", note: "" },
        { kind: "use", quote: "pays off at last", note: "" },
      ]),
    ]);
    const byId = new Map(threads.map((t) => [t.id, t]));
    const owed = byId.get("owed")!;
    expect(owed.owed).toBe(true);
    expect(owed.end).toBe(owed.start);
    const cold = byId.get("cold")!;
    expect(cold.coldOpen).toBe(true);
    expect(cold.owed).toBe(false);
    expect(cold.mentions[1]!.afterPayoff).toBe(false);
  });

  it("marks mentions after the payoff as callbacks", () => {
    const { threads } = resolveStoryline(book, [
      thread("cb", [
        { kind: "payoff", quote: "Alpha beta", note: "" },
        { kind: "use", quote: "seed is planted", note: "" },
      ]),
    ]);
    expect(threads[0]!.mentions[1]!.afterPayoff).toBe(true);
    expect(threads[0]!.end).toBe(1);
  });

  it("reports every missing or ambiguous anchor at once", () => {
    expect(() =>
      resolveStoryline(book, [
        thread("bad", [
          { kind: "plant", quote: "seed", note: "" },
          { kind: "use", quote: "zzz", note: "" },
        ]),
      ]),
    ).toThrow(/bad: found more than once — "seed"[\s\S]*bad: not found — "zzz"/);
  });

  it("builds part and chapter bands with a part standing in for its own chapter", () => {
    const { parts, chapters } = resolveStoryline(book, [
      thread("seed", [{ kind: "explain", quote: "Alpha", note: "" }]),
    ]);
    expect(parts.map((p) => [p.title, p.start, p.end])).toEqual([
      ["Overview", 0, 5],
      ["Part 1: One", 5, 29],
      ["Conclusion", 29, 36],
    ]);
    expect(chapters.map((c) => [c.slug, c.start, c.end])).toEqual([
      ["overview", 0, 5],
      ["chapter-a", 8, 18],
      ["chapter-b", 18, 29],
      ["conclusion", 29, 36],
    ]);
  });

  it("names sections by their innermost heading and disambiguates repeated titles like Astro does", () => {
    // Cumulative offsets at line starts: 0, 3, 5, 6, 8, 9, 11, 12; total 14.
    const twinBook = [
      "# Part 1: One",
      "Intro words.",
      "## Notes",
      "Alpha one.",
      "### Deep",
      "Beta two.",
      "# Notes",
      "Gamma three.",
    ].join("\n");
    const { threads, chapters } = resolveStoryline(twinBook, [
      thread("t", [
        { kind: "plant", quote: "Intro words", note: "" },
        { kind: "explain", quote: "Beta", note: "" },
        { kind: "payoff", quote: "Gamma", note: "" },
      ]),
    ]);
    const [intro, deep, twin] = threads[0]!.mentions;
    expect(intro!.section).toEqual({ title: "Part 1: One", slug: "part-1-one", path: ["Part 1: One"] });
    expect(deep!.section).toEqual({ title: "Deep", slug: "deep", path: ["Part 1: One", "Notes", "Deep"] });
    expect(twin!.section.slug).toBe("notes-1");
    // A part's intro text sits in no chapter band; the part band covers it.
    expect(chapters.map((c) => [c.slug, c.start, c.end])).toEqual([
      ["notes", 5, 11],
      ["notes-1", 11, 14],
    ]);
    expect(intro!.position).toBe(3);
  });

  it("sorts threads by first mention", () => {
    const { threads } = resolveStoryline(book, [
      thread("late", [{ kind: "explain", quote: "pays off", note: "" }]),
      thread("early", [{ kind: "explain", quote: "Alpha", note: "" }]),
    ]);
    expect(threads.map((t) => t.id)).toEqual(["early", "late"]);
  });
});
