#!/usr/bin/env node
import { loadConfig } from "../config.js";
import { synchronizeQuestions } from "../pipeline/questionSync.js";
import { getLogger } from "../utils/logger.js";

const main = async (): Promise<void> => {
  const logger = await getLogger();
  const config = await loadConfig();
  const { newQuestions } = await synchronizeQuestions(config, logger);

  if (newQuestions.length === 0) {
    logger.info("No new research questions were generated");
    return;
  }

  const grouped = new Map<string, Array<typeof newQuestions[number]>>();
  newQuestions.forEach((question) => {
    const bucket = grouped.get(question.chapterTitle);
    if (bucket) {
      bucket.push(question);
    } else {
      grouped.set(question.chapterTitle, [question]);
    }
  });

  grouped.forEach((questions, chapterTitle) => {
    logger.info({ chapterTitle, questions: questions.length }, "Generated questions for chapter");
    console.log(`Chapter: ${chapterTitle}`);
    questions.forEach((question, index) => {
      console.log(`  ${index + 1}. ${question.prompt}`);
      console.log(`     ↪ ${question.justification}`);
    });
  });
};

void main().catch(async (error) => {
  const logger = await getLogger();
  logger.error(
    {
      error: error instanceof Error ? { message: error.message, stack: error.stack } : { message: String(error) },
    },
    "generate-questions tool failed",
  );
  process.exitCode = 1;
});
