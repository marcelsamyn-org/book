import { randomUUID } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { z } from "zod";
import type { ChapterQuestionBatch, ChapterReassignment } from "../questions/types.js";
import { normalizeQuestion } from "../questions/deduplicate.js";
import { ensureParentDirectory, fileExists } from "../utils/filesystem.js";
import { currentIsoTimestamp } from "../utils/time.js";
import type {
  ChapterIndexEntry,
  ResearchAttemptRecord,
  ResearchQuestionRecord,
  ResearchQuestionStatus,
  ResearchTrackingFile,
} from "./types.js";

const statusSchema = z.union([
  z.literal("pending"),
  z.literal("queued"),
  z.literal("running"),
  z.literal("succeeded"),
  z.literal("failed"),
]);

const attemptSchema = z.object({
  taskId: z.string().min(1),
  dispatchedAt: z.string().min(1),
  completedAt: z.string().min(1).optional(),
  status: z.union([z.literal("succeeded"), z.literal("failed")]),
  reportPath: z.string().min(1).optional(),
  usedQueries: z.array(z.string().min(1)).optional(),
  usedSources: z.array(z.string().min(1)).optional(),
  errorMessage: z.string().min(1).optional(),
});

const questionSchema = z.object({
  id: z.string().min(1),
  chapterId: z.string().min(1),
  chapterTitle: z.string().min(1),
  prompt: z.string().min(1),
  justification: z.string().min(1),
  createdAt: z.string().min(1),
  status: statusSchema,
  attempts: z.array(attemptSchema),
  latestReportPath: z.string().min(1).optional(),
  summaryPath: z.string().min(1).optional(),
});

const chapterSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  questionIds: z.array(z.string().min(1)),
});

const trackingSchema = z.object({
  version: z.literal(1),
  outlineHash: z.string().min(1),
  generatedAt: z.string().min(1),
  questions: z.array(questionSchema),
  chapters: z.array(chapterSchema),
});

type TrackingSchema = z.infer<typeof trackingSchema>;

type MergeResult = {
  readonly updated: ResearchTrackingFile;
  readonly createdQuestions: readonly ResearchQuestionRecord[];
};

interface ChapterDraft {
  id: string;
  title: string;
  questionIds: string[];
}

export const loadTrackingData = async (path: string): Promise<ResearchTrackingFile | null> => {
  const resolved = resolve(path);
  if (!(await fileExists(resolved))) {
    return null;
  }

  const raw = await readFile(resolved, "utf8");
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    throw new Error(`Failed to parse tracking JSON at ${resolved}: ${String(error)}`);
  }

  const validated = trackingSchema.parse(parsed);
  return castTracking(validated);
};

export const saveTrackingData = async (path: string, data: ResearchTrackingFile): Promise<void> => {
  const resolved = resolve(path);
  await ensureParentDirectory(resolved);
  const serialized = JSON.stringify(data, null, 2);
  await writeFile(resolved, `${serialized}\n`, "utf8");
};

export const collectNormalizedQuestions = (data: ResearchTrackingFile): Set<string> => {
  return new Set(data.questions.map((question) => normalizeQuestion(question.prompt)));
};

export const mergeGeneratedQuestions = (
  existing: ResearchTrackingFile | null,
  outlineHash: string,
  batches: readonly ChapterQuestionBatch[],
  reassignments: readonly ChapterReassignment[],
  timestamp: string = currentIsoTimestamp(),
): MergeResult => {
  if (existing === null) {
    if (reassignments.length > 0) {
      throw new Error("Cannot reassign chapters without existing tracking data");
    }
    const created = buildFreshTracking(outlineHash, batches, timestamp);
    return { updated: created, createdQuestions: created.questions };
  }

  const { questions: existingQuestions, chapters: existingChapters } = existing;
  const nextQuestions: ResearchQuestionRecord[] = [...existingQuestions];
  const chaptersIndex = new Map<string, ChapterDraft>();
  const newChapterIds: string[] = [];

  existingChapters.forEach((chapter) => {
    chaptersIndex.set(chapter.id, {
      id: chapter.id,
      title: chapter.title,
      questionIds: [...chapter.questionIds],
    });
  });

  const ensureChapterDraft = (id: string, title: string): ChapterDraft => {
    const existingDraft = chaptersIndex.get(id);
    if (existingDraft) {
      existingDraft.title = title;
      return existingDraft;
    }
    const draft: ChapterDraft = { id, title, questionIds: [] };
    chaptersIndex.set(id, draft);
    newChapterIds.push(id);
    return draft;
  };

  const removeQuestionFromChapter = (chapterId: string, questionId: string) => {
    const draft = chaptersIndex.get(chapterId);
    if (!draft) {
      return;
    }
    if (!draft.questionIds.includes(questionId)) {
      return;
    }
    draft.questionIds = draft.questionIds.filter((id) => id !== questionId);
  };

  reassignments.forEach((movement) => {
    const questionIndex = nextQuestions.findIndex((question) => question.id === movement.questionId);
    if (questionIndex === -1) {
      throw new Error(`Cannot reassign unknown question ${movement.questionId}`);
    }

    const current = nextQuestions[questionIndex]!;

    if (current.chapterId !== movement.nextChapterId || current.chapterTitle !== movement.nextChapterTitle) {
      removeQuestionFromChapter(current.chapterId, current.id);
      const destination = ensureChapterDraft(movement.nextChapterId, movement.nextChapterTitle);
      if (!destination.questionIds.includes(current.id)) {
        destination.questionIds = [...destination.questionIds, current.id];
      }

      nextQuestions[questionIndex] = {
        ...current,
        chapterId: movement.nextChapterId,
        chapterTitle: movement.nextChapterTitle,
      };

      return;
    }

    const destination = ensureChapterDraft(movement.nextChapterId, movement.nextChapterTitle);
    if (!destination.questionIds.includes(current.id)) {
      destination.questionIds = [...destination.questionIds, current.id];
    }
  });

  const creationOrder: ResearchQuestionRecord[] = [];

  batches.forEach((batch) => {
    const chapter = ensureChapterDraft(batch.chapterId, batch.chapterTitle);

    batch.questions.forEach((question) => {
      const record = createQuestionRecord(batch.chapterId, batch.chapterTitle, question, timestamp);
      nextQuestions.push(record);
      creationOrder.push(record);
      if (!chapter.questionIds.includes(record.id)) {
        chapter.questionIds = [...chapter.questionIds, record.id];
      }
    });
  });

  const orderedChapters: ChapterIndexEntry[] = [
    ...existingChapters.map((chapter) => {
      const entry = chaptersIndex.get(chapter.id);
      if (!entry) {
        return chapter;
      }
      return { id: entry.id, title: entry.title, questionIds: [...entry.questionIds] };
    }),
    ...newChapterIds.map((id) => {
      const entry = chaptersIndex.get(id);
      if (!entry) {
        throw new Error(`Unexpected missing chapter entry for ${id}`);
      }
      return { id: entry.id, title: entry.title, questionIds: [...entry.questionIds] };
    }),
  ];

  const updated: ResearchTrackingFile = {
    ...existing,
    outlineHash,
    generatedAt: timestamp,
    questions: nextQuestions,
    chapters: orderedChapters,
  };

  return { updated, createdQuestions: creationOrder };
};

export const updateQuestionStatus = (
  data: ResearchTrackingFile,
  questionId: string,
  status: ResearchQuestionStatus,
): ResearchTrackingFile => {
  return transformQuestion(data, questionId, (question) => ({ ...question, status }));
};

export interface AttemptUpdate {
  readonly questionId: string;
  readonly attempt: ResearchAttemptRecord;
  readonly status: ResearchQuestionStatus;
  readonly latestReportPath?: string;
  readonly summaryPath?: string;
}

export const appendAttempt = (
  data: ResearchTrackingFile,
  update: AttemptUpdate,
): ResearchTrackingFile => {
  return transformQuestion(data, update.questionId, (question) => {
    const attempts = [...question.attempts, update.attempt];
    let result: ResearchQuestionRecord = {
      ...question,
      status: update.status,
      attempts,
    };

    if (update.latestReportPath !== undefined) {
      result = { ...result, latestReportPath: update.latestReportPath };
    } else if (question.latestReportPath !== undefined) {
      result = { ...result, latestReportPath: question.latestReportPath };
    }

    if (update.summaryPath !== undefined) {
      result = { ...result, summaryPath: update.summaryPath };
    } else if (question.summaryPath !== undefined) {
      result = { ...result, summaryPath: question.summaryPath };
    }

    return result;
  });
};

export const setQuestionSummaryPath = (
  data: ResearchTrackingFile,
  questionId: string,
  summaryPath: string,
): ResearchTrackingFile => {
  return transformQuestion(data, questionId, (question) => ({
    ...question,
    summaryPath,
  }));
};

const buildFreshTracking = (
  outlineHash: string,
  batches: readonly ChapterQuestionBatch[],
  timestamp: string,
): ResearchTrackingFile => {
  const questions: ResearchQuestionRecord[] = [];
  const chapters: ChapterIndexEntry[] = [];

  batches.forEach((batch) => {
    const questionIds: string[] = [];
    batch.questions.forEach((question) => {
      const record = createQuestionRecord(batch.chapterId, batch.chapterTitle, question, timestamp);
      questions.push(record);
      questionIds.push(record.id);
    });

    chapters.push({
      id: batch.chapterId,
      title: batch.chapterTitle,
      questionIds,
    });
  });

  return {
    version: 1 as const,
    outlineHash,
    generatedAt: timestamp,
    questions,
    chapters,
  };
};

const createQuestionRecord = (
  chapterId: string,
  chapterTitle: string,
  question: { question: string; justification: string },
  timestamp: string,
): ResearchQuestionRecord => ({
  id: randomUUID(),
  chapterId,
  chapterTitle,
  prompt: question.question,
  justification: question.justification,
  createdAt: timestamp,
  status: "pending",
  attempts: [],
});

const transformQuestion = (
  data: ResearchTrackingFile,
  questionId: string,
  transform: (question: ResearchQuestionRecord) => ResearchQuestionRecord,
): ResearchTrackingFile => {
  let updated = false;
  const questions = data.questions.map((question) => {
    if (question.id !== questionId) {
      return question;
    }
    updated = true;
    return transform(question);
  });

  if (!updated) {
    throw new Error(`Unknown research question id: ${questionId}`);
  }

  return {
    ...data,
    questions,
  };
};

const castTracking = (value: TrackingSchema): ResearchTrackingFile => ({
  version: value.version,
  outlineHash: value.outlineHash,
  generatedAt: value.generatedAt,
  questions: value.questions.map((question) => {
    const attempts = question.attempts.map((attempt) => {
      let result: ResearchAttemptRecord = {
        taskId: attempt.taskId,
        dispatchedAt: attempt.dispatchedAt,
        status: attempt.status,
      };

      if (attempt.completedAt !== undefined) {
        result = { ...result, completedAt: attempt.completedAt };
      }
      if (attempt.reportPath !== undefined) {
        result = { ...result, reportPath: attempt.reportPath };
      }
      if (attempt.usedQueries !== undefined) {
        result = { ...result, usedQueries: [...attempt.usedQueries] };
      }
      if (attempt.usedSources !== undefined) {
        result = { ...result, usedSources: [...attempt.usedSources] };
      }
      if (attempt.errorMessage !== undefined) {
        result = { ...result, errorMessage: attempt.errorMessage };
      }

      return result;
    });

    let record: ResearchQuestionRecord = {
      id: question.id,
      chapterId: question.chapterId,
      chapterTitle: question.chapterTitle,
      prompt: question.prompt,
      justification: question.justification,
      createdAt: question.createdAt,
      status: question.status,
      attempts,
    };

    if (question.latestReportPath !== undefined) {
      record = { ...record, latestReportPath: question.latestReportPath };
    }
    if (question.summaryPath !== undefined) {
      record = { ...record, summaryPath: question.summaryPath };
    }

    return record;
  }),
  chapters: value.chapters.map((chapter) => ({
    id: chapter.id,
    title: chapter.title,
    questionIds: [...chapter.questionIds],
  })),
});
