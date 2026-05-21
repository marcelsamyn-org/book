/**
 * Pushes the manuscript completion percentage to petals (https://petals.chat).
 *
 * Run by the "Report progress to petals" GitHub Actions workflow on pushes to
 * main that touch book.mdx (see .github/workflows/report-progress.yml). Reuses
 * the exact same progress computation that renders the on-site progress bar.
 *
 * Aliases: petals metric, manuscript completion, progress report, observation.
 *
 * Skips silently unless PETALS_API_KEY is set, so local runs without the key
 * are a no-op. Any failure warns and exits 0 — telemetry must never break CI.
 */
import { readFile } from "node:fs/promises";
import { parseOutline } from "../md/parseOutline.js";
import { computeBookProgress } from "./progress.js";
import { stripObsidianComments } from "../utils/stripObsidianComments.js";
import { getLogger } from "../utils/logger.js";

const PETALS_ENDPOINT = "https://petals.chat/api/memory/metrics/observations";
const MANUSCRIPT_PATH = "book.mdx";

interface MetricDefinition {
  readonly slug: string;
  readonly label: string;
  readonly description: string;
  readonly unit: string;
  readonly aggregationHint: "avg" | "sum" | "min" | "max";
  readonly validRangeMin: number;
  readonly validRangeMax: number;
}

interface MetricObservation {
  readonly metric: MetricDefinition;
  readonly value: number;
  readonly occurredAt: string;
}

const MANUSCRIPT_METRIC: MetricDefinition = {
  slug: "manuscript_completion_percent",
  label: "Manuscript Completion",
  description:
    "Percent of the 55,000-word manuscript target drafted, measured from book.mdx on each production build.",
  unit: "%",
  aggregationHint: "max",
  validRangeMin: 0,
  validRangeMax: 100,
};

/** Builds the petals observation payload for a completion percentage. */
export const buildCompletionObservation = (
  percentage: number,
  occurredAt: Date,
): MetricObservation => ({
  metric: MANUSCRIPT_METRIC,
  value: percentage,
  occurredAt: occurredAt.toISOString(),
});

const readCompletionPercentage = async (): Promise<number> => {
  const raw = stripObsidianComments(await readFile(MANUSCRIPT_PATH, "utf-8"));
  const { headings } = parseOutline(raw);
  return computeBookProgress(headings).percentage;
};

const main = async (): Promise<void> => {
  const logger = await getLogger();

  const apiKey = process.env["PETALS_API_KEY"];
  if (!apiKey) {
    logger.info("PETALS_API_KEY not set; skipping manuscript completion report");
    return;
  }

  const percentage = await readCompletionPercentage();
  const observation = buildCompletionObservation(percentage, new Date());

  const response = await fetch(PETALS_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": apiKey },
    body: JSON.stringify(observation),
  });

  if (!response.ok) {
    const body = await response.text();
    logger.warn(
      { status: response.status, body: body.slice(0, 500) },
      "Petals rejected the manuscript completion report",
    );
    return;
  }

  logger.info(
    { percentage },
    "Reported manuscript completion to petals",
  );
};

void main().catch(async (error) => {
  const logger = await getLogger();
  logger.warn(
    {
      error:
        error instanceof Error ? error.message : String(error),
    },
    "Failed to report manuscript completion to petals",
  );
  // Telemetry must not break the deploy.
});
