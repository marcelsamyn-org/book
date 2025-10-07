#!/usr/bin/env node
import { loadConfig } from "./config.js";
import { synchronizeQuestions } from "./pipeline/questionSync.js";
import { dispatchResearchTasks } from "./pipeline/researchDispatch.js";
import { summarizeReports } from "./pipeline/summarizeReports.js";
import { applyResearchKeyPoints } from "./org/updateResearchKeyPoints.js";
import { getLogger } from "./utils/logger.js";

const main = async (): Promise<void> => {
  const logger = await getLogger();
  const config = await loadConfig();

  logger.info("Synchronizing research questions with outline");
  const { tracking, newQuestions } = await synchronizeQuestions(config, logger);
  logger.info(
    {
      total: tracking.questions.length,
      newlyGenerated: newQuestions.length,
    },
    "Question synchronization complete",
  );

  logger.info("Dispatching research tasks to A2A agent");
  const dispatchOutcome = await dispatchResearchTasks(config, tracking, logger);
  logger.info(
    {
      successes: dispatchOutcome.successes.length,
      failures: dispatchOutcome.failures.length,
    },
    "Research dispatch finished",
  );
  dispatchOutcome.failures.forEach((failure) => {
    logger.error(
      {
        questionId: failure.question.id,
        chapterTitle: failure.question.chapterTitle,
        error: failure.error,
      },
      "Research task failed",
    );
  });

  logger.info("Summarizing research reports");
  const summarization = await summarizeReports(config, dispatchOutcome.tracking, dispatchOutcome.successes, logger);
  logger.info(
    {
      questionSummaries: summarization.questionSummaries.length,
      chapterSummaries: summarization.chapterSummaries.length,
    },
    "Summaries generated",
  );

  if (summarization.chapterSummaries.length > 0) {
    logger.info("Updating book outline with research key points");
    await applyResearchKeyPoints(config.outlinePath, summarization.chapterSummaries);
  } else {
    logger.warn("No chapter-level summaries generated; skipping book update");
  }

  logger.info("Research pipeline complete");
};

void main().catch(async (error) => {
  const logger = await getLogger();
  logger.fatal(
    {
      error: error instanceof Error ? { message: error.message, stack: error.stack } : { message: String(error) },
    },
    "Unhandled error in research pipeline",
  );
  process.exitCode = 1;
});
