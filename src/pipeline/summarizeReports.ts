import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import type { Logger } from "pino";
import { ResearchConfig } from "../config.js";
import { deriveChapters, extractOverview, type ChapterOutline } from "../org/chapters.js";
import { parseOrgOutline } from "../org/parseOutline.js";
import { AsyncLock } from "../utils/lock.js";
import { runWithConcurrency } from "../utils/concurrency.js";
import { saveTrackingData, setQuestionSummaryPath } from "../tracking/store.js";
import type { ResearchQuestionRecord, ResearchTrackingFile } from "../tracking/types.js";
import { saveQuestionSummary } from "../tracking/summaries.js";
import {
  ChapterSummaryGenerator,
  ReportSummaryGenerator,
  type ChapterContextDetails,
} from "../summaries/generator.js";
import type { ResearchSuccess } from "./researchDispatch.js";
import type { SummarizationObserver } from "./observers.js";

export interface QuestionSummaryResult {
  readonly question: ResearchQuestionRecord;
  readonly keyPoints: readonly string[];
  readonly summaryPath: string;
}

export interface ChapterSummaryResult {
  readonly chapterId: string;
  readonly chapterTitle: string;
  readonly keyPoints: readonly string[];
}

export interface SummarizationOutcome {
  readonly tracking: ResearchTrackingFile;
  readonly questionSummaries: readonly QuestionSummaryResult[];
  readonly chapterSummaries: readonly ChapterSummaryResult[];
}

export const summarizeReports = async (
  config: ResearchConfig,
  tracking: ResearchTrackingFile,
  successes: readonly ResearchSuccess[],
  logger: Logger,
  observer?: SummarizationObserver,
): Promise<SummarizationOutcome> => {
  if (successes.length === 0) {
    logger.info("No successful research outputs to summarize");
    return { tracking, questionSummaries: [], chapterSummaries: [] };
  }

  const outlinePath = resolve(config.outlinePath);
  const outlineContent = await readFile(outlinePath, "utf8");
  const outline = parseOrgOutline(outlineContent);
  const bookOverview = extractOverview(outline);
  const chapterOutlines = deriveChapters(outline);
  const chapterById = new Map<string, ChapterOutline>();
  const chapterContextById = new Map<string, ChapterContextDetails>();
  chapterOutlines.forEach((chapter) => {
    chapterById.set(chapter.id, chapter);
    const context: ChapterContextDetails = {
      ...(chapter.partTitle ? { partTitle: chapter.partTitle } : {}),
      ...(chapter.partDescription ? { partDescription: chapter.partDescription } : {}),
    };
    chapterContextById.set(chapter.id, context);
  });

  logger.info({ reports: successes.length }, "Generating report summaries");

  const reportSummarizer = new ReportSummaryGenerator(config, { bookOverview });
  const lock = new AsyncLock();
  let currentTracking = tracking;
  const questionSummaries: QuestionSummaryResult[] = [];

  await runWithConcurrency(successes, config.execution.maxParallelDispatch, async (success) => {
    logger.debug(
      {
        questionId: success.question.id,
        chapterTitle: success.question.chapterTitle,
      },
      "Summarizing individual report",
    );

    const chapterContext = chapterContextById.get(success.question.chapterId);
    const summary = await reportSummarizer.generate(
      success.question,
      success.reportContent,
      chapterContext,
    );
    const summaryPath = await saveQuestionSummary(config, {
      chapterId: success.question.chapterId,
      questionId: success.question.id,
      keyPoints: summary.keyPoints,
    });

    await lock.runExclusive(async () => {
      currentTracking = setQuestionSummaryPath(currentTracking, success.question.id, summaryPath);
      await saveTrackingData(config.trackingPath, currentTracking);
      const question = currentTracking.questions.find((item) => item.id === success.question.id);
      if (!question) {
        throw new Error(`Failed to locate question ${success.question.id} after summary update`);
      }
      questionSummaries.push({ question, keyPoints: summary.keyPoints, summaryPath });
    });

    logger.info(
      {
        questionId: success.question.id,
        summaryPath,
        keyPoints: summary.keyPoints.length,
      },
      "Report summary generated",
    );

    const question = questionSummaries[questionSummaries.length - 1];
    if (question) {
      observer?.onReportSummary?.({
        question: question.question,
        summaryPath,
        keyPoints: summary.keyPoints,
      });
    }
  });

  if (questionSummaries.length === 0) {
    logger.warn("Report summarization produced no key points");
    return { tracking: currentTracking, questionSummaries: [], chapterSummaries: [] };
  }

  logger.info({ chapters: new Set(questionSummaries.map((entry) => entry.question.chapterId)).size }, "Generating chapter-level summaries");

  const chapterSummarizer = new ChapterSummaryGenerator(config, { bookOverview });
  const summariesByChapter = new Map<string, QuestionSummaryResult[]>();
  questionSummaries.forEach((entry) => {
    const bucket = summariesByChapter.get(entry.question.chapterId);
    if (bucket) {
      bucket.push(entry);
    } else {
      summariesByChapter.set(entry.question.chapterId, [entry]);
    }
  });

  const chapterSummaries: ChapterSummaryResult[] = [];

  for (const [chapterId, entries] of summariesByChapter.entries()) {
    const chapterTitle = entries[0]?.question.chapterTitle ?? "";
    const chapterContext = chapterContextById.get(chapterId);
    const summary = await chapterSummarizer.deduplicate(
      chapterTitle,
      entries.map((entry) => ({ question: entry.question, keyPoints: entry.keyPoints })),
      chapterContext,
    );
    chapterSummaries.push({
      chapterId,
      chapterTitle,
      keyPoints: summary.keyPoints,
    });

    logger.info(
      {
        chapterId,
        chapterTitle,
        questions: entries.length,
        keyPoints: summary.keyPoints.length,
      },
      "Chapter summary generated",
    );

    observer?.onChapterSummary?.({
      chapterId,
      chapterTitle,
      keyPoints: summary.keyPoints,
      questionCount: entries.length,
    });
  }

  logger.info({
    questionSummaries: questionSummaries.length,
    chapterSummaries: chapterSummaries.length,
  }, "Summarization phase completed");

  return {
    tracking: currentTracking,
    questionSummaries,
    chapterSummaries,
  };
};
