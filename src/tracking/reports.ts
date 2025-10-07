import { writeFile } from "node:fs/promises";
import { join, relative, resolve } from "node:path";
import { ResearchConfig } from "../config.js";
import { ensureDirectory } from "../utils/filesystem.js";
import { currentIsoTimestamp } from "../utils/time.js";

export interface ReportSaveOptions {
  readonly chapterId: string;
  readonly questionId: string;
  readonly questionPrompt: string;
  readonly content: string;
  readonly usedQueries?: readonly string[];
  readonly usedSources?: readonly string[];
  readonly recordedAt?: string;
}

export const saveReportToDisk = async (
  config: ResearchConfig,
  options: ReportSaveOptions,
): Promise<string> => {
  const baseDir = resolve(config.reportsDir);
  const chapterDir = join(baseDir, options.chapterId);
  await ensureDirectory(chapterDir);
  const absolutePath = join(chapterDir, `${options.questionId}.md`);
  const body = buildReportFile(options);
  await writeFile(absolutePath, body, "utf8");
  return relative(process.cwd(), absolutePath);
};

const buildReportFile = (options: ReportSaveOptions): string => {
  const recordedAt = options.recordedAt ?? currentIsoTimestamp();
  const metadata = {
    questionId: options.questionId,
    chapterId: options.chapterId,
    prompt: options.questionPrompt,
    recordedAt,
    usedQueries: options.usedQueries ?? [],
    usedSources: options.usedSources ?? [],
  };

  const sections: string[] = [];
  sections.push("<!--");
  sections.push(JSON.stringify(metadata, null, 2));
  sections.push("-->");
  sections.push("");

  if ((metadata.usedQueries?.length ?? 0) > 0) {
    sections.push("## Used Queries");
    metadata.usedQueries?.forEach((query) => {
      sections.push(`- ${query}`);
    });
    sections.push("");
  }

  if ((metadata.usedSources?.length ?? 0) > 0) {
    sections.push("## Used Sources");
    metadata.usedSources?.forEach((source) => {
      sections.push(`- ${source}`);
    });
    sections.push("");
  }

  sections.push(options.content.trimEnd());
  sections.push("");

  return sections.join("\n");
};
