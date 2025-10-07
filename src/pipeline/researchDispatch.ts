import { randomUUID } from "node:crypto";
import type { Logger } from "pino";
import { ResearchConfig } from "../config.js";
import { A2AClient } from "../agents/a2aClient.js";
import { runWithConcurrency } from "../utils/concurrency.js";
import { AsyncLock } from "../utils/lock.js";
import { currentIsoTimestamp } from "../utils/time.js";
import { saveReportToDisk } from "../tracking/reports.js";
import {
  appendAttempt,
  saveTrackingData,
  updateQuestionStatus,
  type AttemptUpdate,
} from "../tracking/store.js";
import type {
  ResearchAttemptRecord,
  ResearchQuestionRecord,
  ResearchTrackingFile,
} from "../tracking/types.js";
import type { ResearchDispatchObserver } from "./observers.js";

export interface ResearchSuccess {
  readonly question: ResearchQuestionRecord;
  readonly reportPath: string;
  readonly reportContent: string;
  readonly usedQueries: readonly string[];
  readonly usedSources: readonly string[];
}

export interface ResearchFailure {
  readonly question: ResearchQuestionRecord;
  readonly error: string;
}

export interface ResearchDispatchOutcome {
  readonly tracking: ResearchTrackingFile;
  readonly successes: readonly ResearchSuccess[];
  readonly failures: readonly ResearchFailure[];
}

interface QueuedQuestion {
  readonly question: ResearchQuestionRecord;
  readonly index: number;
}

const RESEARCH_INSTRUCTION = `You are an autonomous research agent. Produce a comprehensive, evidence-based report that answers the given research question. Include quantitative findings, cite sources inline, and end with actionable insights for the author. Output must be Markdown.`;

export const dispatchResearchTasks = async (
  config: ResearchConfig,
  tracking: ResearchTrackingFile,
  logger: Logger,
  observer?: ResearchDispatchObserver,
): Promise<ResearchDispatchOutcome> => {
  const backlog = selectBacklog(tracking, config.execution.dispatchLimit);
  if (backlog.length === 0) {
    logger.info("No pending research questions to dispatch");
    return { tracking, successes: [], failures: [] };
  }

  logger.info({
    pending: backlog.length,
    maxParallel: config.execution.maxParallelDispatch,
    dispatchLimit: config.execution.dispatchLimit,
  }, "Dispatching research tasks");

  const lock = new AsyncLock();
  let currentTracking = tracking;
  const successes: ResearchSuccess[] = [];
  const failures: ResearchFailure[] = [];

  const queuedSnapshots: ResearchQuestionRecord[] = [];
  await lock.runExclusive(async () => {
    currentTracking = await markQueued(config, currentTracking, backlog.map((item) => item.question.id));
    backlog.forEach((item) => {
      queuedSnapshots.push(findQuestion(currentTracking, item.question.id));
    });
  });
  logger.debug({ ids: backlog.map((item) => item.question.id) }, "Marked questions as queued");
  queuedSnapshots.forEach((question) => {
    observer?.onQueued?.({ question });
  });

  const client = new A2AClient(config);

  await runWithConcurrency(backlog, config.execution.maxParallelDispatch, async (queued) => {
    const dispatchedAt = currentIsoTimestamp();
    const taskId = randomUUID();

    logger.info(
      {
        questionId: queued.question.id,
        chapterTitle: queued.question.chapterTitle,
        taskId,
      },
      "Submitting research task",
    );

    let runningQuestion: ResearchQuestionRecord | null = null;
    await lock.runExclusive(async () => {
      currentTracking = await transitionStatus(config, currentTracking, queued.question.id, "running");
      runningQuestion = findQuestion(currentTracking, queued.question.id);
    });
    if (runningQuestion) {
      observer?.onRunning?.({ question: runningQuestion, taskId });
    }

    const prompt = buildResearchPrompt(queued.question);
    try {
      const result = await client.runResearch({ taskId, prompt });
      if (result.state !== "completed" || !result.artifact) {
        throw new Error(result.message || "Research task failed");
      }

      const artifact = result.artifact;
      const reportPath = await saveReportToDisk(config, {
        chapterId: queued.question.chapterId,
        questionId: queued.question.id,
        questionPrompt: queued.question.prompt,
        content: artifact.text,
        usedQueries: artifact.usedQueries,
        usedSources: artifact.usedSources,
        recordedAt: currentIsoTimestamp(),
      });

      const attempt: ResearchAttemptRecord = {
        taskId: result.taskId,
        dispatchedAt,
        completedAt: currentIsoTimestamp(),
        status: "succeeded",
        reportPath,
        usedQueries: [...artifact.usedQueries],
        usedSources: [...artifact.usedSources],
      };

      let succeededQuestion: ResearchQuestionRecord | null = null;
      await lock.runExclusive(async () => {
        currentTracking = await registerAttempt(
          config,
          currentTracking,
          queued.question.id,
          attempt,
          "succeeded",
          reportPath,
        );
        const question = findQuestion(currentTracking, queued.question.id);
        successes.push({
          question,
          reportPath,
          reportContent: artifact.text,
          usedQueries: artifact.usedQueries,
          usedSources: artifact.usedSources,
        });
        succeededQuestion = question;
      });

      if (succeededQuestion) {
        observer?.onSucceeded?.({ question: succeededQuestion, taskId: result.taskId, reportPath });
      }

      logger.info(
        {
          questionId: queued.question.id,
          chapterTitle: queued.question.chapterTitle,
          taskId: result.taskId,
          reportPath,
        },
        "Research task succeeded",
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const attempt: ResearchAttemptRecord = {
        taskId,
        dispatchedAt,
        completedAt: currentIsoTimestamp(),
        status: "failed",
        errorMessage: message,
      };

      let failedQuestion: ResearchQuestionRecord | null = null;
      await lock.runExclusive(async () => {
        currentTracking = await registerAttempt(
          config,
          currentTracking,
          queued.question.id,
          attempt,
          "failed",
        );
        const question = findQuestion(currentTracking, queued.question.id);
        failures.push({ question, error: message });
        failedQuestion = question;
      });

      observer?.onFailed?.({ question: failedQuestion ?? queued.question, taskId, error });

      logger.error(
        {
          questionId: queued.question.id,
          chapterTitle: queued.question.chapterTitle,
          taskId,
          error: error instanceof Error ? { message: error.message, stack: error.stack } : { message },
        },
        "Research task failed",
      );
    }
  });

  logger.info(
    {
      successes: successes.length,
      failures: failures.length,
    },
    "Research dispatch completed",
  );

  return {
    tracking: currentTracking,
    successes,
    failures,
  };
};

const selectBacklog = (
  tracking: ResearchTrackingFile,
  limit: number,
): QueuedQuestion[] => {
  const pending = tracking.questions.filter((question) => question.status === "pending");
  const slice = pending.slice(0, limit);
  return slice.map((question, index) => ({ question, index }));
};

const markQueued = async (
  config: ResearchConfig,
  tracking: ResearchTrackingFile,
  ids: readonly string[],
): Promise<ResearchTrackingFile> => {
  let updated = tracking;
  ids.forEach((id) => {
    updated = updateQuestionStatus(updated, id, "queued");
  });
  await saveTrackingData(config.trackingPath, updated);
  return updated;
};

const transitionStatus = async (
  config: ResearchConfig,
  tracking: ResearchTrackingFile,
  id: string,
  status: ResearchQuestionRecord["status"],
): Promise<ResearchTrackingFile> => {
  const updated = updateQuestionStatus(tracking, id, status);
  await saveTrackingData(config.trackingPath, updated);
  return updated;
};

const registerAttempt = async (
  config: ResearchConfig,
  tracking: ResearchTrackingFile,
  questionId: string,
  attempt: ResearchAttemptRecord,
  status: ResearchQuestionRecord["status"],
  latestReportPath?: string,
): Promise<ResearchTrackingFile> => {
  const update: AttemptUpdate = latestReportPath !== undefined
    ? { questionId, attempt, status, latestReportPath }
    : { questionId, attempt, status };
  const updated = appendAttempt(tracking, update);
  await saveTrackingData(config.trackingPath, updated);
  return updated;
};

const buildResearchPrompt = (question: ResearchQuestionRecord): string => {
  return [
    RESEARCH_INSTRUCTION,
    `Research question: ${question.prompt}`,
    `Context: ${question.justification}`,
    `Deliver the final Markdown report as the artifact named report.md.`,
  ].join("\n\n");
};

const findQuestion = (tracking: ResearchTrackingFile, id: string): ResearchQuestionRecord => {
  const question = tracking.questions.find((item) => item.id === id);
  if (!question) {
    throw new Error(`Question ${id} not found in tracking state`);
  }
  return question;
};
