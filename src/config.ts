import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { z } from "zod";
import { fileExists } from "./utils/filesystem.js";

export interface ModelSelectionConfig {
  readonly questionGeneration: string;
  readonly reportSummaries: string;
  readonly chapterSummaries: string;
}

export interface ExecutionConfig {
  readonly maxParallelDispatch: number;
  readonly dispatchLimit: number;
  readonly researchRequestTimeoutMs: number;
}

export interface QuestionGenerationConfig {
  readonly perChapterLimit: number;
}

export interface OpenAIConfig {
  readonly apiKeyEnvVar: string;
}

export interface ResearchConfig {
  readonly outlinePath: string;
  readonly trackingPath: string;
  readonly reportsDir: string;
  readonly a2aEndpoint: string;
  readonly models: ModelSelectionConfig;
  readonly execution: ExecutionConfig;
  readonly questionGeneration: QuestionGenerationConfig;
  readonly openAI: OpenAIConfig;
}

const defaultConfig: ResearchConfig = {
  outlinePath: "book.md",
  trackingPath: "data/research/tracking.json",
  reportsDir: "data/research/reports",
  a2aEndpoint: "http://localhost:41241",
  models: {
    questionGeneration: "gpt-5-nano",
    reportSummaries: "gpt-5-nano",
    chapterSummaries: "gpt-5-nano",
  },
  execution: {
    maxParallelDispatch: 20,
    dispatchLimit: 40,
    researchRequestTimeoutMs: 15 * 60 * 1000,
  },
  questionGeneration: {
    perChapterLimit: 8,
  },
  openAI: {
    apiKeyEnvVar: "OPENAI_API_KEY",
  },
};

const configOverridesSchema = z.object({
  outlinePath: z.string().trim().min(1).optional(),
  trackingPath: z.string().trim().min(1).optional(),
  reportsDir: z.string().trim().min(1).optional(),
  a2aEndpoint: z.string().trim().url().optional(),
  models: z
    .object({
      questionGeneration: z.string().trim().min(1).optional(),
      reportSummaries: z.string().trim().min(1).optional(),
      chapterSummaries: z.string().trim().min(1).optional(),
    })
    .optional(),
  execution: z
    .object({
      maxParallelDispatch: z.number().int().min(1).optional(),
      dispatchLimit: z.number().int().min(1).optional(),
      researchRequestTimeoutMs: z.number().int().min(60_000).optional(),
    })
    .optional(),
  questionGeneration: z
    .object({
      perChapterLimit: z.number().int().min(1).optional(),
    })
    .optional(),
  openAI: z
    .object({
      apiKeyEnvVar: z.string().trim().min(1).optional(),
    })
    .optional(),
});

type ConfigOverrides = z.infer<typeof configOverridesSchema>;

const mergeConfig = (
  base: ResearchConfig,
  overrides: ConfigOverrides,
): ResearchConfig => {
  const mergedModels: ModelSelectionConfig = {
    questionGeneration:
      overrides.models?.questionGeneration ?? base.models.questionGeneration,
    reportSummaries:
      overrides.models?.reportSummaries ?? base.models.reportSummaries,
    chapterSummaries:
      overrides.models?.chapterSummaries ?? base.models.chapterSummaries,
  };

  const mergedExecution: ExecutionConfig = {
    maxParallelDispatch:
      overrides.execution?.maxParallelDispatch ??
      base.execution.maxParallelDispatch,
    dispatchLimit:
      overrides.execution?.dispatchLimit ?? base.execution.dispatchLimit,
    researchRequestTimeoutMs:
      overrides.execution?.researchRequestTimeoutMs ??
      base.execution.researchRequestTimeoutMs,
  };

  const mergedQuestionGeneration: QuestionGenerationConfig = {
    perChapterLimit:
      overrides.questionGeneration?.perChapterLimit ??
      base.questionGeneration.perChapterLimit,
  };

  const mergedOpenAI: OpenAIConfig = {
    apiKeyEnvVar: overrides.openAI?.apiKeyEnvVar ?? base.openAI.apiKeyEnvVar,
  };

  return {
    outlinePath: overrides.outlinePath ?? base.outlinePath,
    trackingPath: overrides.trackingPath ?? base.trackingPath,
    reportsDir: overrides.reportsDir ?? base.reportsDir,
    a2aEndpoint: overrides.a2aEndpoint ?? base.a2aEndpoint,
    models: mergedModels,
    execution: mergedExecution,
    questionGeneration: mergedQuestionGeneration,
    openAI: mergedOpenAI,
  };
};

export const loadConfig = async (
  configPath = "research.config.json",
): Promise<ResearchConfig> => {
  const resolvedPath = resolve(configPath);
  if (!(await fileExists(resolvedPath))) {
    return defaultConfig;
  }

  const rawContent = await readFile(resolvedPath, "utf8");
  let parsedContent: unknown;
  try {
    parsedContent = JSON.parse(rawContent);
  } catch (error) {
    throw new Error(
      `Failed to parse JSON config at ${resolvedPath}: ${String(error)}`,
    );
  }

  const overrides = configOverridesSchema.parse(parsedContent);
  return mergeConfig(defaultConfig, overrides);
};
