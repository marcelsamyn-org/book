import type { Logger } from "pino";
import { ResearchConfig } from "../config.js";
import { generateQuestionsFromOutline } from "../questions/pipeline.js";
import { normalizeQuestion } from "../questions/deduplicate.js";
import type { ExistingQuestionContext } from "../questions/types.js";
import { loadTrackingData, mergeGeneratedQuestions, saveTrackingData } from "../tracking/store.js";
import type { ResearchQuestionRecord, ResearchTrackingFile } from "../tracking/types.js";

export interface QuestionSyncResult {
  readonly tracking: ResearchTrackingFile;
  readonly newQuestions: readonly ResearchQuestionRecord[];
}

export const synchronizeQuestions = async (
  config: ResearchConfig,
  logger: Logger,
): Promise<QuestionSyncResult> => {
  logger.info({ outlinePath: config.outlinePath }, "Loading outline for question generation");
  const existing = await loadTrackingData(config.trackingPath);
  const existingAssignments = new Map<string, ExistingQuestionContext[]>();
  if (existing) {
    existing.questions.forEach((question) => {
      const normalized = normalizeQuestion(question.prompt);
      const bucket = existingAssignments.get(normalized);
      const entry: ExistingQuestionContext = {
        questionId: question.id,
        chapterId: question.chapterId,
        chapterTitle: question.chapterTitle,
      };
      if (bucket) {
        bucket.push(entry);
      } else {
        existingAssignments.set(normalized, [entry]);
      }
    });
  }

  const existingNormalized = new Set<string>();
  existingAssignments.forEach((_, key) => {
    existingNormalized.add(key);
  });

  const generation = await generateQuestionsFromOutline(config, existingNormalized, existingAssignments);
  if (generation.reassignments.length > 0) {
    logger.info({ reassignments: generation.reassignments.length }, "Realigned questions to chapter-level headings");
  }
  const { updated, createdQuestions } = mergeGeneratedQuestions(
    existing,
    generation.outlineHash,
    generation.batches,
    generation.reassignments,
  );
  await saveTrackingData(config.trackingPath, updated);
  logger.info({ generated: createdQuestions.length }, "Question generation completed");
  return { tracking: updated, newQuestions: createdQuestions };
};
