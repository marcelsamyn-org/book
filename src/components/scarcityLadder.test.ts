import { describe, expect, it } from "bun:test";
import { type Rung, topDown } from "./scarcityLadder.js";

/** The rungs as the manuscript lists them: the order the chapter argues them in. */
const rungs: readonly Rung[] = [
  { name: "Execution", note: "AI makes what you ask.", abundant: true },
  { name: "Attention", note: "AI reads everything.", abundant: true },
  { name: "Judgment", note: "AI weighs more than we can.", abundant: true },
  { name: "Responsibility", note: "You cannot sue a machine.", abundant: false },
];

describe("the ladder of scarcity", () => {
  it("draws the last rung the chapter reaches at the top", () => {
    expect(topDown(rungs).map((rung) => rung.name)).toEqual([
      "Responsibility",
      "Judgment",
      "Attention",
      "Execution",
    ]);
  });

  it("leaves the manuscript's own order untouched", () => {
    const before = rungs.map((rung) => rung.name);
    topDown(rungs);
    expect(rungs.map((rung) => rung.name)).toEqual(before);
  });

  it("keeps exactly one rung scarce, which is the chapter's point", () => {
    expect(rungs.filter((rung) => !rung.abundant)).toHaveLength(1);
    expect(topDown(rungs).at(0)?.abundant).toBe(false);
  });
});
