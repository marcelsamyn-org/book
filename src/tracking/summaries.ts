import { writeFile } from "node:fs/promises";
import { join, relative, resolve } from "node:path";
import { ResearchConfig } from "../config.js";
import { ensureDirectory } from "../utils/filesystem.js";
import { currentIsoTimestamp } from "../utils/time.js";

export interface SaveQuestionSummaryOptions {
  readonly chapterId: string;
  readonly questionId: string;
  readonly keyPoints: readonly string[];
}

export const saveQuestionSummary = async (
  config: ResearchConfig,
  options: SaveQuestionSummaryOptions,
): Promise<string> => {
  const baseDir = resolve(config.reportsDir);
  const chapterDir = join(baseDir, options.chapterId);
  await ensureDirectory(chapterDir);
  const absolutePath = join(chapterDir, `${options.questionId}.summary.json`);
  const payload = {
    chapterId: options.chapterId,
    questionId: options.questionId,
    keyPoints: options.keyPoints,
    generatedAt: currentIsoTimestamp(),
  };
  await writeFile(absolutePath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  return relative(process.cwd(), absolutePath);
};
