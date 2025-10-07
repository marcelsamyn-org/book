import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { ResearchConfig } from "../config.js";
import { parseOrgOutline } from "../org/parseOutline.js";
import { deriveChapters, extractOverview } from "../org/chapters.js";
import { sha256 } from "../utils/hash.js";
import { ChapterPrimerGenerator } from "./chapterPrimer.js";
import { ChapterQuestionContext, QuestionGenerator } from "./generateQuestions.js";
import { normalizeQuestion } from "./deduplicate.js";
import {
  ChapterQuestionBatch,
  ChapterReassignment,
  ExistingQuestionContext,
  ResearchQuestionCandidate,
} from "./types.js";

export interface QuestionsGenerationResult {
  readonly outlineHash: string;
  readonly batches: readonly ChapterQuestionBatch[];
  readonly reassignments: readonly ChapterReassignment[];
}

export const generateQuestionsFromOutline = async (
  config: ResearchConfig,
  existingNormalizedQuestions: ReadonlySet<string>,
  existingAssignments: Map<string, ExistingQuestionContext[]>,
): Promise<QuestionsGenerationResult> => {
  const outlinePath = resolve(config.outlinePath);
  const outlineContent = await readFile(outlinePath, "utf8");
  const outline = parseOrgOutline(outlineContent);
  const outlineHash = sha256(outlineContent);
  const chapters = deriveChapters(outline);
  const overview = extractOverview(outline);

  const assignmentIndex = new Map<string, ExistingQuestionContext[]>();
  existingAssignments.forEach((value, key) => {
    assignmentIndex.set(
      key,
      value.map((entry) => ({ ...entry })),
    );
  });

  const generator = new QuestionGenerator(config);
  const primerGenerator = new ChapterPrimerGenerator(config, { overview });
  const seen = new Set(existingNormalizedQuestions);
  const reassignments: ChapterReassignment[] = [];

  const rawResults = await Promise.all(
    chapters.map(async (chapter) => {
      const chapterSummary = await primerGenerator.generate(chapter);
      const context: ChapterQuestionContext = {
        bookOverview: overview,
        partTitle: chapter.partTitle,
        partDescription: chapter.partDescription,
        chapterSummary,
      };
      const generated = await generator.generateForChapter(chapter, context);
      return { chapter, generated };
    }),
  );

  const batches: ChapterQuestionBatch[] = [];
  rawResults.forEach(({ chapter, generated }) => {
    const deduped = filterAndRegister(
      generated,
      chapter,
      seen,
      assignmentIndex,
      reassignments,
    );
    if (deduped.length > 0) {
      batches.push({
        chapterId: chapter.id,
        chapterTitle: chapter.title,
        questions: deduped,
      });
    }
  });

  return { outlineHash, batches, reassignments };
};

const filterAndRegister = (
  candidates: readonly ResearchQuestionCandidate[],
  chapter: { id: string; title: string },
  seen: Set<string>,
  assignmentIndex: Map<string, ExistingQuestionContext[]>,
  reassignments: ChapterReassignment[],
): ResearchQuestionCandidate[] => {
  const unique: ResearchQuestionCandidate[] = [];

  const registerMigration = (
    normalized: string,
    existingEntries: ExistingQuestionContext[],
  ) => {
    const updatedEntries = existingEntries.map((entry) => {
      if (entry.chapterId === chapter.id && entry.chapterTitle === chapter.title) {
        return entry;
      }

      reassignments.push({
        questionId: entry.questionId,
        previousChapterId: entry.chapterId,
        previousChapterTitle: entry.chapterTitle,
        nextChapterId: chapter.id,
        nextChapterTitle: chapter.title,
      });

      return {
        ...entry,
        chapterId: chapter.id,
        chapterTitle: chapter.title,
      };
    });
    assignmentIndex.set(normalized, updatedEntries);
  };

  candidates.forEach((candidate) => {
    const normalized = normalizeQuestion(candidate.question);
    const existingEntries = assignmentIndex.get(normalized);
    if (existingEntries && existingEntries.length > 0) {
      registerMigration(normalized, existingEntries);
    }

    if (seen.has(normalized)) {
      return;
    }

    seen.add(normalized);
    unique.push(candidate);
  });

  return unique;
};
