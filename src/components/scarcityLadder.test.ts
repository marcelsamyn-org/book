import { describe, expect, it } from "bun:test";
import type { Rung } from "./scarcityLadder.js";

/** The rungs as the manuscript lists them: the order the chapter argues them in. */
const rungs: readonly Rung[] = [
  { name: "Execution", note: "AI makes what you ask.", abundant: true },
  { name: "Attention", note: "AI reads everything.", abundant: true },
  { name: "Judgment", note: "AI can take in more information than a person.", abundant: true },
  { name: "Responsibility", note: "You cannot sue a machine.", abundant: false },
];

describe("the ladder of scarcity", () => {
  it("keeps exactly one rung scarce, which is the chapter's point", () => {
    expect(rungs.filter((rung) => !rung.abundant)).toHaveLength(1);
  });

  it("lists the scarce rung last, which is where the figure leaves it unshaded", () => {
    expect(rungs.at(-1)?.abundant).toBe(false);
  });
});
