export interface ResearchQuestionCandidate {
  readonly question: string;
  readonly justification: string;
}

export interface ChapterQuestionBatch {
  readonly chapterId: string;
  readonly chapterTitle: string;
  readonly questions: readonly ResearchQuestionCandidate[];
}

export interface ExistingQuestionContext {
  readonly questionId: string;
  readonly chapterId: string;
  readonly chapterTitle: string;
}

export interface ChapterReassignment {
  readonly questionId: string;
  readonly previousChapterId: string;
  readonly previousChapterTitle: string;
  readonly nextChapterId: string;
  readonly nextChapterTitle: string;
}
