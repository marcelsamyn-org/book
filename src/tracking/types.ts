export type ResearchQuestionStatus =
  | "pending"
  | "queued"
  | "running"
  | "succeeded"
  | "failed";

export interface ResearchAttemptRecord {
  readonly taskId: string;
  readonly dispatchedAt: string;
  readonly completedAt?: string;
  readonly status: "succeeded" | "failed";
  readonly reportPath?: string;
  readonly usedQueries?: readonly string[];
  readonly usedSources?: readonly string[];
  readonly errorMessage?: string;
}

export interface ResearchQuestionRecord {
  readonly id: string;
  readonly chapterId: string;
  readonly chapterTitle: string;
  readonly prompt: string;
  readonly justification: string;
  readonly createdAt: string;
  readonly status: ResearchQuestionStatus;
  readonly attempts: readonly ResearchAttemptRecord[];
  readonly latestReportPath?: string;
  readonly summaryPath?: string;
}

export interface ChapterIndexEntry {
  readonly id: string;
  readonly title: string;
  readonly questionIds: readonly string[];
}

export interface ResearchTrackingFile {
  readonly version: 1;
  readonly outlineHash: string;
  readonly generatedAt: string;
  readonly questions: readonly ResearchQuestionRecord[];
  readonly chapters: readonly ChapterIndexEntry[];
}
