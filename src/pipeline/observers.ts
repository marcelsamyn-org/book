import type { ResearchQuestionRecord } from "../tracking/types.js";

export interface ResearchDispatchObserver {
  onQueued?(payload: { question: ResearchQuestionRecord }): void;
  onRunning?(payload: { question: ResearchQuestionRecord; taskId: string }): void;
  onSucceeded?(payload: {
    question: ResearchQuestionRecord;
    taskId: string;
    reportPath: string;
  }): void;
  onFailed?(payload: { question: ResearchQuestionRecord; taskId: string; error: unknown }): void;
}

export interface SummarizationObserver {
  onReportSummary?(payload: {
    question: ResearchQuestionRecord;
    summaryPath: string;
    keyPoints: readonly string[];
  }): void;
  onChapterSummary?(payload: {
    chapterId: string;
    chapterTitle: string;
    keyPoints: readonly string[];
    questionCount: number;
  }): void;
}
