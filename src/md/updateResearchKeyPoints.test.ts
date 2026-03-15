import { describe, expect, it } from "bun:test";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { ChapterSummaryResult } from "../pipeline/summarizeReports.js";
import { parseOutline } from "./parseOutline.js";
import { applyResearchKeyPoints } from "./updateResearchKeyPoints.js";

describe("applyResearchKeyPoints", () => {
  it("inserts key points under nested chapter headings", async () => {
    const tempDirectory = await mkdtemp(join(tmpdir(), "update-research-key-points-"));
    const outlinePath = join(tempDirectory, "outline.md");
    const outlineContent = [
      "# Part 1",
      "## Chapter One",
      "Content for chapter one",
      "## Chapter Two",
      "Content for chapter two",
      "",
    ].join("\n");
    await writeFile(outlinePath, `${outlineContent}\n`, "utf8");

    const outline = parseOutline(outlineContent);
    const partHeading = outline.headings.find((heading) => heading.title === "Part 1");
    if (!partHeading) {
      throw new Error("Part heading not found in test outline");
    }
    const chapterTwo = partHeading.children.find((child) => child.title === "Chapter Two");
    if (!chapterTwo) {
      throw new Error("Chapter heading not found in test outline");
    }

    const updates: readonly ChapterSummaryResult[] = [
      {
        chapterId: chapterTwo.id,
        chapterTitle: chapterTwo.title,
        keyPoints: ["First finding", "Second finding"],
      },
    ];

    await applyResearchKeyPoints(outlinePath, updates);

    const result = await readFile(outlinePath, "utf8");
    const expected = [
      "# Part 1",
      "## Chapter One",
      "Content for chapter one",
      "## Chapter Two",
      "### Research Key Points",
      "",
      "- First finding",
      "- Second finding",
      "",
      "Content for chapter two",
      "",
    ].join("\n");

    expect(result.endsWith("\n")).toBe(true);
    expect(result.trimEnd()).toBe(expected.trimEnd());
  });
});
