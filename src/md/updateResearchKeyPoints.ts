import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { ChapterSummaryResult } from "../pipeline/summarizeReports.js";
import { parseOutline } from "./parseOutline.js";
import { Heading } from "./types.js";

const HEADING_TITLE = "Research Key Points";

export const applyResearchKeyPoints = async (
  outlinePath: string,
  updates: readonly ChapterSummaryResult[],
): Promise<void> => {
  if (updates.length === 0) {
    return;
  }

  let content = await readFile(resolve(outlinePath), "utf8");
  for (const update of updates) {
    content = await applySingle(content, update);
  }

  if (!content.endsWith("\n")) {
    content += "\n";
  }

  await writeFile(resolve(outlinePath), content, "utf8");
};

const applySingle = async (content: string, update: ChapterSummaryResult): Promise<string> => {
  const outline = parseOutline(content);
  const chapter = findHeadingById(outline.headings, update.chapterId);
  if (!chapter) {
    throw new Error(`Chapter with id ${update.chapterId} not found in outline`);
  }

  const lines = content.split(/\r?\n/);
  const headingLevel = chapter.level + 1;
  const headingPrefix = "#".repeat(headingLevel);
  const blockLines = buildBlockLines(headingPrefix, update.keyPoints);

  const existing = chapter.children.find((child) => child.title === HEADING_TITLE);
  if (existing) {
    const startIndex = existing.startLine - 1;
    const endIndex = (existing.endLine ?? lines.length) - 1;
    const replaceCount = endIndex - startIndex + 1;
    lines.splice(startIndex, replaceCount, ...blockLines);
    return lines.join("\n");
  }

  const insertIndex = chapter.startLine;
  const withBlock = [...lines];
  withBlock.splice(insertIndex, 0, ...blockLines);
  return withBlock.join("\n");
};

const findHeadingById = (
  headings: readonly Heading[],
  targetId: string,
): Heading | null => {
  for (const heading of headings) {
    const located = locateHeading(heading, targetId);
    if (located) {
      return located;
    }
  }
  return null;
};

const locateHeading = (heading: Heading, targetId: string): Heading | null => {
  if (heading.id === targetId) {
    return heading;
  }
  for (const child of heading.children) {
    const located = locateHeading(child, targetId);
    if (located) {
      return located;
    }
  }
  return null;
};

const buildBlockLines = (headingPrefix: string, keyPoints: readonly string[]): string[] => {
  const lines: string[] = [];
  lines.push(`${headingPrefix} ${HEADING_TITLE}`);
  lines.push("");
  keyPoints.forEach((point) => {
    lines.push(`- ${point}`);
  });
  lines.push("");
  return lines;
};
