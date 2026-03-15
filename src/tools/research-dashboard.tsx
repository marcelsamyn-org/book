#!/usr/bin/env bun

import { render, useKeyboard, useRenderer } from "@opentui/solid";
import { For, Show, createMemo, createSignal, getOwner, onCleanup, onMount, runWithOwner } from "solid-js";
import type { JSX } from "solid-js";
import { createStore, produce, type SetStoreFunction } from "solid-js/store";
import { randomUUID } from "node:crypto";
import { loadConfig } from "../config.js";
import { synchronizeQuestions } from "../pipeline/questionSync.js";
import { dispatchResearchTasks } from "../pipeline/researchDispatch.js";
import { summarizeReports } from "../pipeline/summarizeReports.js";
import { applyResearchKeyPoints } from "../md/updateResearchKeyPoints.js";
import { createLogger, type LogLevelName, type LogMessage } from "../utils/logger.js";
import type { ResearchDispatchObserver, SummarizationObserver } from "../pipeline/observers.js";
import type { ResearchQuestionStatus } from "../tracking/types.js";
import type { ParsedKey } from "@opentui/core";
import type { Logger } from "pino";

const PROGRESS_BAR_WIDTH = 28;
const LOG_CAPACITY = 18;
const SPINNER_FRAMES = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"] as const;
const ACCENT_COLORS = ["#22d3ee", "#38bdf8", "#a855f7", "#ec4899", "#5eead4"] as const;
const STATUS_ORDER: ReadonlyArray<ResearchQuestionStatus> = ["pending", "queued", "running", "succeeded", "failed"] as const;

const STAGE_LABELS: Record<PipelineStage, string> = {
  initial: "Preparing",
  sync: "Synchronizing Questions",
  dispatch: "Running Research",
  summaries: "Summarizing Reports",
  updating: "Updating Outline",
  complete: "Complete",
  error: "Error",
};

const STAGE_ACCENTS: Record<PipelineStage, string> = {
  initial: "#7dd3fc",
  sync: "#38bdf8",
  dispatch: "#f59e0b",
  summaries: "#c084fc",
  updating: "#34d399",
  complete: "#5eead4",
  error: "#f87171",
};

const STATUS_COLORS: Record<ResearchQuestionStatus, string> = {
  pending: "#94a3b8",
  queued: "#38bdf8",
  running: "#f97316",
  succeeded: "#34d399",
  failed: "#f87171",
};

const LOG_COLORS: Record<DashboardLogLevel, string> = {
  trace: "#64748b",
  debug: "#7dd3fc",
  info: "#38bdf8",
  warn: "#fbbf24",
  error: "#f87171",
  fatal: "#ef4444",
  system: "#c084fc",
  success: "#5eead4",
};

type PipelineStage = "initial" | "sync" | "dispatch" | "summaries" | "updating" | "complete" | "error";

type DashboardLogLevel = LogLevelName | "system" | "success";

interface ProgressState {
  total: number;
  completed: number;
}

interface TotalsState {
  chapters: number;
  questions: number;
  newQuestions: number;
}

interface RunningTask {
  id: string;
  chapterTitle: string;
  prompt: string;
  taskId: string;
}

interface DashboardLogEntry {
  id: string;
  level: DashboardLogLevel;
  timestamp: string;
  message: string;
  source: "pipeline" | "logger";
  context?: Record<string, unknown>;
}

interface DashboardState {
  stage: PipelineStage;
  stageMessage: string;
  totals: TotalsState;
  statusCounts: Record<ResearchQuestionStatus, number>;
  research: ProgressState;
  summaries: ProgressState;
  chapters: ProgressState;
  failures: number;
  runningTasks: RunningTask[];
  logs: DashboardLogEntry[];
}

type LogSource = "pipeline" | "logger";

type AppendLog = (
  source: LogSource,
  level: DashboardLogLevel,
  message: string,
  options?: {
    readonly context?: Record<string, unknown>;
    readonly timestamp?: Date;
  },
) => void;

const createInitialState = (): DashboardState => ({
  stage: "initial",
  stageMessage: "Preparing research pipeline…",
  totals: { chapters: 0, questions: 0, newQuestions: 0 },
  statusCounts: { pending: 0, queued: 0, running: 0, succeeded: 0, failed: 0 },
  research: { total: 0, completed: 0 },
  summaries: { total: 0, completed: 0 },
  chapters: { total: 0, completed: 0 },
  failures: 0,
  runningTasks: [],
  logs: [],
});

const formatClockTime = (value: Date): string => value.toLocaleTimeString([], { hour12: false });

const clampProgressRatio = (completed: number, total: number): number => {
  if (total <= 0) {
    return 0;
  }
  return Math.max(0, Math.min(1, completed / total));
};

const renderProgressBar = (completed: number, total: number): string => {
  const ratio = clampProgressRatio(completed, total);
  const filledUnits = Math.round(ratio * PROGRESS_BAR_WIDTH);
  const filled = "█".repeat(filledUnits);
  const empty = "·".repeat(Math.max(0, PROGRESS_BAR_WIDTH - filledUnits));
  return `[${filled}${empty}] ${completed}/${total}`;
};

const formatPercentage = (completed: number, total: number): string => {
  if (total === 0) {
    return "0%";
  }
  return `${Math.round(clampProgressRatio(completed, total) * 100)}%`;
};

const formatContext = (context: Record<string, unknown>): string => {
  const json = JSON.stringify(context);
  return json.length > 160 ? `${json.slice(0, 157)}…` : json;
};

interface PipelineDependencies {
  readonly mutateState: (mutator: (draft: DashboardState) => void) => void;
  readonly appendLog: AppendLog;
}

const runDashboardPipeline = async ({ mutateState, appendLog }: PipelineDependencies): Promise<void> => {
  const questionStatuses = new Map<string, ResearchQuestionStatus>();
  const runningTasks = new Map<string, RunningTask>();
  const dispatched = new Set<string>();

  const syncRunningTasks = (): void => {
    const entries = Array.from(runningTasks.values()).sort((a, b) => a.chapterTitle.localeCompare(b.chapterTitle));
    mutateState((draft) => {
      draft.runningTasks = entries.slice(0, 6);
    });
  };

  const updateQuestionStatus = (questionId: string, status: ResearchQuestionStatus): void => {
    const previous = questionStatuses.get(questionId);
    if (previous === status) {
      return;
    }
    questionStatuses.set(questionId, status);
    mutateState((draft) => {
      if (previous) {
        draft.statusCounts[previous] = Math.max(0, draft.statusCounts[previous] - 1);
      }
      draft.statusCounts[status] = (draft.statusCounts[status] ?? 0) + 1;
    });
  };

  let logger: Logger | undefined;

  const pipelineLog = (
    message: string,
    level: DashboardLogLevel = "system",
    context?: Record<string, unknown>,
  ): void => {
    const payload: { context?: Record<string, unknown>; timestamp: Date } = {
      timestamp: new Date(),
    };
    if (context !== undefined) {
      payload.context = context;
    }
    appendLog("pipeline", level, message, payload);
  };

  const setStage = (stage: PipelineStage, message: string): void => {
    mutateState((draft) => {
      draft.stage = stage;
      draft.stageMessage = message;
    });
  };

  try {
    setStage("sync", "Initializing telemetry");
    pipelineLog("Booting logger", "info");

    const activeLogger = await createLogger({
      consoleOutput: "none",
      sinks: [
        (entry: LogMessage) => {
          appendLog("logger", entry.level, entry.message, {
            context: entry.context,
            timestamp: entry.timestamp,
          });
        },
      ],
    });
    logger = activeLogger;

    pipelineLog("Logger ready", "debug");

    setStage("sync", "Loading configuration");
    pipelineLog("Loading configuration", "info");
    const config = await loadConfig();

    setStage("sync", "Analyzing outline");

    const { tracking, newQuestions } = await synchronizeQuestions(config, activeLogger);
    const statusCounters: Record<ResearchQuestionStatus, number> = {
      pending: 0,
      queued: 0,
      running: 0,
      succeeded: 0,
      failed: 0,
    };

    questionStatuses.clear();
    for (const question of tracking.questions) {
      questionStatuses.set(question.id, question.status);
      statusCounters[question.status] += 1;
    }

    mutateState((draft) => {
      draft.totals = {
        chapters: tracking.chapters.length,
        questions: tracking.questions.length,
        newQuestions: newQuestions.length,
      };
      draft.statusCounts = { ...statusCounters };
    });

    if (newQuestions.length > 0) {
      pipelineLog(`Generated ${newQuestions.length} new question${newQuestions.length === 1 ? "" : "s"}`, "success");
    } else {
      pipelineLog("No new questions generated", "info");
    }

    setStage("dispatch", "Dispatching research tasks");
    mutateState((draft) => {
      draft.research.completed = 0;
      draft.research.total = 0;
      draft.failures = 0;
      draft.runningTasks = [];
    });
    runningTasks.clear();
    dispatched.clear();

    const dispatchObserver: ResearchDispatchObserver = {
      onQueued: ({ question }) => {
        if (!dispatched.has(question.id)) {
          dispatched.add(question.id);
          mutateState((draft) => {
            draft.research.total += 1;
          });
        }
        updateQuestionStatus(question.id, question.status);
        pipelineLog(`Queued research • ${question.chapterTitle}`, "info");
      },
      onRunning: ({ question, taskId }) => {
        updateQuestionStatus(question.id, question.status);
        runningTasks.set(question.id, {
          id: question.id,
          chapterTitle: question.chapterTitle,
          prompt: question.prompt,
          taskId,
        });
        syncRunningTasks();
      },
      onSucceeded: ({ question, taskId, reportPath }) => {
        runningTasks.delete(question.id);
        syncRunningTasks();
        updateQuestionStatus(question.id, question.status);
        mutateState((draft) => {
          draft.research.completed += 1;
        });
        pipelineLog(`✓ ${question.chapterTitle}`, "success", {
          taskId,
          reportPath,
        });
      },
      onFailed: ({ question, taskId, error }) => {
        runningTasks.delete(question.id);
        syncRunningTasks();
        updateQuestionStatus(question.id, question.status);
        mutateState((draft) => {
          draft.research.completed += 1;
          draft.failures += 1;
        });
        const message = error instanceof Error ? error.message : String(error);
        pipelineLog(`✗ ${question.chapterTitle}`, "error", {
          taskId,
          error: message,
        });
      },
    };


    const dispatchOutcome = await dispatchResearchTasks(config, tracking, activeLogger, dispatchObserver);
    pipelineLog(
      `Research complete: ${dispatchOutcome.successes.length} succeeded, ${dispatchOutcome.failures.length} failed`,
      "info",
    );

    setStage("summaries", "Summarizing research");
    const chapterSummaryTarget = new Set(
      dispatchOutcome.successes.map((item) => item.question.chapterId),
    ).size;

    mutateState((draft) => {
      draft.summaries.total = dispatchOutcome.successes.length;
      draft.summaries.completed = 0;
      draft.chapters.total = chapterSummaryTarget;
      draft.chapters.completed = 0;
    });
    requestRender();

    const summarizationObserver: SummarizationObserver = {
      onReportSummary: ({ question, summaryPath }) => {
        mutateState((draft) => {
          draft.summaries.completed += 1;
        });
        pipelineLog(`Summary ready • ${question.chapterTitle}`, "success", { summaryPath });
      },
      onChapterSummary: ({ chapterTitle }) => {
        mutateState((draft) => {
          draft.chapters.completed += 1;
        });
        pipelineLog(`Chapter merged • ${chapterTitle}`, "success");
      },
    };


    const summarization = await summarizeReports(
      config,
      dispatchOutcome.tracking,
      dispatchOutcome.successes,
      activeLogger,
      summarizationObserver,
    );

    pipelineLog(
      `Summaries generated: ${summarization.questionSummaries.length} reports → ${summarization.chapterSummaries.length} chapters`,
      "info",
    );

    if (summarization.chapterSummaries.length > 0) {
      setStage("updating", "Updating book outline");
      await applyResearchKeyPoints(config.outlinePath, summarization.chapterSummaries);
      pipelineLog(
        `Inserted key points into ${summarization.chapterSummaries.length} chapter${
          summarization.chapterSummaries.length === 1 ? "" : "s"
        }`,
        "success",
      );
    }

    setStage("complete", "Pipeline complete. Press q to exit.");
    pipelineLog("Pipeline complete", "success");
  } catch (error) {
    setStage("error", "Pipeline failed. Press q to exit");
    const message = error instanceof Error ? error.message : String(error);
    pipelineLog(`Pipeline failed: ${message}`, "fatal");
    logger?.error(
      {
        error:
          error instanceof Error
            ? { message: error.message, stack: error.stack }
            : { message: String(error) },
      },
      "Dashboard pipeline failed",
    );
  }

};

const DashboardApp = (): JSX.Element => {
  const renderer = useRenderer();
  const [state, setState] = createStore<DashboardState>(createInitialState());
  const [spinnerIndex, setSpinnerIndex] = createSignal(0);
  const [accentIndex, setAccentIndex] = createSignal(0);

  type OwnerRunner = (task: () => void) => void;
  let runInRendererOwner: OwnerRunner = (task) => {
    task();
  };

  const setStateInOwner: SetStoreFunction<DashboardState> = new Proxy(setState, {
    apply(_target, thisArg, argArray: Parameters<typeof setState>) {
      runInRendererOwner(() => {
        setState.apply(thisArg, argArray);
      });
      return undefined;
    },
  });

  const requestRender = (): void => {
    runInRendererOwner(() => {
      renderer.requestRender();
    });
  };

  const spinner = createMemo(() => SPINNER_FRAMES[spinnerIndex() % SPINNER_FRAMES.length]);
  const accentColor = createMemo(() => ACCENT_COLORS[accentIndex() % ACCENT_COLORS.length]);
  const stageAccent = createMemo(() => STAGE_ACCENTS[state.stage] ?? "#38bdf8");

  const appendLog: AppendLog = (source, level, message, options) => {
    const timestamp = formatClockTime(options?.timestamp ?? new Date());
    const context = options?.context
      ? Object.fromEntries(
          Object.entries(options.context).filter(([, value]) => value !== undefined),
        )
      : undefined;

    runInRendererOwner(() => {
      setState(
        produce((draft) => {
          const entry: DashboardLogEntry = {
            id: randomUUID(),
            level,
            timestamp,
            message,
            source,
          };
          if (context !== undefined) {
            entry.context = context;
          }
          draft.logs.push(entry);
          if (draft.logs.length > LOG_CAPACITY) {
            draft.logs.splice(0, draft.logs.length - LOG_CAPACITY);
          }
        }),
      );
      renderer.requestRender();
    });
  };

  useKeyboard((key: ParsedKey) => {
    if (key.name === "q" || (key.ctrl && key.name === "c")) {
      appendLog("pipeline", "info", "Exiting dashboard", { timestamp: new Date() });
      renderer.destroy();
      process.exit(0);
    }
  });

  onMount(() => {
    const owner = getOwner();
    if (owner) {
      runInRendererOwner = (task) => runWithOwner(owner, task);
    }

    const timer = setInterval(() => {
      runInRendererOwner(() => {
        setSpinnerIndex((index) => (index + 1) % SPINNER_FRAMES.length);
        setAccentIndex((index) => (index + 1) % ACCENT_COLORS.length);
      });
      requestRender();
    }, 140);

    void runDashboardPipeline({
      setState: (
        ...args: Parameters<typeof setState>
      ) => {
        runInRendererOwner(() => {
          setState(...args);
        });
      },
      appendLog,
      requestRender,
    });

    onCleanup(() => {
      clearInterval(timer);
    });
  });

  onCleanup(() => {
    renderer.destroy();
  });

  const statusRows = createMemo(() =>
    STATUS_ORDER.map((status) => {
      const count = state.statusCounts[status];
      const percentage = state.totals.questions === 0 ? 0 : Math.round((count / state.totals.questions) * 100);
      return {
        status,
        label: status.toUpperCase(),
        count,
        percentage,
        color: STATUS_COLORS[status],
      };
    }),
  );

  return (
    <box
      shouldFill
      backgroundColor="#020617"
      border={false}
      style={{ flexDirection: "column", padding: 1, gap: 1 }}
    >
      <box
        border
        borderStyle="rounded"
        borderColor={accentColor()}
        backgroundColor="#0f172a"
        style={{ flexDirection: "column", padding: 1, gap: 1 }}
      >
        <text fg={accentColor()} wrap={false}>{`${spinner()}  ${STAGE_LABELS[state.stage]}`}</text>
        <text fg="#cbd5f5">{state.stageMessage}</text>
        <text fg="#64748b">
          {`Chapters ${state.totals.chapters} · Questions ${state.totals.questions} · New ${state.totals.newQuestions}`}
        </text>
      </box>

      <box style={{ flexDirection: "row", gap: 1 }}>
        <box
          border
          borderStyle="rounded"
          borderColor="#172554"
          backgroundColor="#02081b"
          style={{ flexDirection: "column", padding: 1, gap: 1, flexGrow: 1 }}
        >
          <text fg={stageAccent()} wrap={false}>
            {`Status Panorama`}
          </text>
          <For each={statusRows()}>
            {(item) => (
              <box style={{ flexDirection: "row", gap: 1 }}>
                <text fg={item.color} wrap={false}>{item.label.padEnd(10, " ")}</text>
                <text fg="#e2e8f0" wrap={false}>{item.count.toString().padStart(4, " ")}</text>
                <text fg="#475569" wrap={false}>{`${item.percentage.toString().padStart(3, " ")}%`}</text>
              </box>
            )}
          </For>
        </box>

        <box
          border
          borderStyle="rounded"
          borderColor="#0f172a"
          backgroundColor="#050b1b"
          style={{ flexDirection: "column", padding: 1, gap: 1, flexGrow: 1 }}
        >
          <text fg={stageAccent()} wrap={false}>
            {`Pipeline Momentum`}
          </text>
          <text fg="#94a3b8" wrap={false}>
            {`Research `.padEnd(12, " ")}{renderProgressBar(state.research.completed, state.research.total)} {formatPercentage(state.research.completed, state.research.total)}
          </text>
          <text fg="#94a3b8" wrap={false}>
            {`Summaries`.padEnd(12, " ")}{renderProgressBar(state.summaries.completed, state.summaries.total)} {formatPercentage(state.summaries.completed, state.summaries.total)}
          </text>
          <text fg="#94a3b8" wrap={false}>
            {`Chapters `.padEnd(12, " ")}{renderProgressBar(state.chapters.completed, state.chapters.total)} {formatPercentage(state.chapters.completed, state.chapters.total)}
          </text>
          <text fg="#f87171" wrap={false}>{`Failures `.padEnd(12, " ")}{state.failures}</text>
        </box>
      </box>

      <box style={{ flexDirection: "row", gap: 1, flexGrow: 1 }}>
        <box
          border
          borderStyle="rounded"
          borderColor="#172554"
          backgroundColor="#040b19"
          style={{ flexDirection: "column", padding: 1, gap: 1, flexGrow: 1 }}
        >
          <text fg={stageAccent()} wrap={false}>
            Active Tasks
          </text>
          <Show
            when={state.runningTasks.length > 0}
            fallback={<text fg="#475569">No active research tasks</text>}
          >
            <For each={state.runningTasks}>
              {(task) => (
                <text fg="#cbd5f5" wrap>
                  {`• ${task.chapterTitle} (${task.taskId.slice(0, 8)})`}
                </text>
              )}
            </For>
          </Show>
        </box>

        <box
          border
          borderStyle="rounded"
          borderColor="#1f2937"
          backgroundColor="#020617"
          style={{ flexDirection: "column", padding: 1, gap: 1, flexGrow: 2 }}
        >
          <text fg={stageAccent()} wrap={false}>
            Signal Stream
          </text>
          <scrollbox
            border={false}
            style={{ flexDirection: "column", gap: 1, flexGrow: 1 }}
            stickyScroll
            stickyStart="bottom"
          >
            <For each={state.logs}>
              {(log) => {
                const prefix = log.source === "logger" ? "LOG" : "SYS";
                const contextLine = log.context && Object.keys(log.context).length > 0 ? formatContext(log.context) : null;
                return (
                  <box style={{ flexDirection: "column", gap: 0 }}>
                    <text fg={LOG_COLORS[log.level]} wrap>
                      {`[${log.timestamp}] ${prefix} ▸ ${log.level.toUpperCase()} · ${log.message}`}
                    </text>
                    <Show when={contextLine}>
                      {(line) => <text fg="#475569" wrap>{line()}</text>}
                    </Show>
                  </box>
                );
              }}
            </For>
          </scrollbox>
        </box>
      </box>
    </box>
  );
};

void render(DashboardApp, { exitOnCtrlC: false, targetFps: 30 });
