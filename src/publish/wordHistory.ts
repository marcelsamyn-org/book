import { execSync } from "node:child_process";
import { countWords } from "./progress.js";
import { stripObsidianComments } from "../utils/stripObsidianComments.js";

export type PeriodKind = "day" | "week" | "month";

export interface PeriodBucket {
  readonly key: string;
  readonly startIso: string;
  readonly delta: number;
}

export interface WordHistory {
  readonly day: readonly PeriodBucket[];
  readonly week: readonly PeriodBucket[];
  readonly month: readonly PeriodBucket[];
}

export interface CommitSample {
  readonly unixSeconds: number;
  readonly words: number;
}

interface CommitEntry {
  readonly hash: string;
  readonly unixSeconds: number;
  readonly path: string;
}

const pad2 = (n: number): string => String(n).padStart(2, "0");

const dayKey = (d: Date): string =>
  `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

const monthKey = (d: Date): string =>
  `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`;

/** ISO 8601 week: Monday-start. Year is ISO week-year (may differ from calendar year at edges). */
const isoWeek = (d: Date): { year: number; week: number } => {
  const target = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const dayIdx = (target.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayIdx + 3);
  const firstThursday = new Date(target.getFullYear(), 0, 4);
  const firstThursdayIdx = (firstThursday.getDay() + 6) % 7;
  firstThursday.setDate(firstThursday.getDate() - firstThursdayIdx + 3);
  const diffDays = Math.round(
    (target.getTime() - firstThursday.getTime()) / (24 * 3600 * 1000),
  );
  return { year: target.getFullYear(), week: 1 + Math.round(diffDays / 7) };
};

const weekKey = (d: Date): string => {
  const { year, week } = isoWeek(d);
  return `${year}-W${pad2(week)}`;
};

const dateFromDayKey = (key: string): Date => {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y!, m! - 1, d!);
};

const dateFromMonthKey = (key: string): Date => {
  const [y, m] = key.split("-").map(Number);
  return new Date(y!, m! - 1, 1);
};

const dateFromWeekKey = (key: string): Date => {
  const [yStr, wStr] = key.split("-W");
  const year = parseInt(yStr!, 10);
  const week = parseInt(wStr!, 10);
  const jan4 = new Date(year, 0, 4);
  const jan4Idx = (jan4.getDay() + 6) % 7;
  const monday = new Date(jan4);
  monday.setDate(jan4.getDate() - jan4Idx + (week - 1) * 7);
  return monday;
};

interface Binning {
  readonly keyOf: (d: Date) => string;
  readonly dateOfKey: (k: string) => Date;
  readonly nextKey: (k: string) => string;
}

const DAY_BIN: Binning = {
  keyOf: dayKey,
  dateOfKey: dateFromDayKey,
  nextKey: (k) => {
    const d = dateFromDayKey(k);
    d.setDate(d.getDate() + 1);
    return dayKey(d);
  },
};

const WEEK_BIN: Binning = {
  keyOf: weekKey,
  dateOfKey: dateFromWeekKey,
  nextKey: (k) => {
    const d = dateFromWeekKey(k);
    d.setDate(d.getDate() + 7);
    return weekKey(d);
  },
};

const MONTH_BIN: Binning = {
  keyOf: monthKey,
  dateOfKey: dateFromMonthKey,
  nextKey: (k) => {
    const d = dateFromMonthKey(k);
    d.setMonth(d.getMonth() + 1);
    return monthKey(d);
  },
};

const bucketDeltas = (
  samples: readonly CommitSample[],
  bin: Binning,
): PeriodBucket[] => {
  if (samples.length === 0) return [];

  const sorted = [...samples].sort((a, b) => a.unixSeconds - b.unixSeconds);
  const deltas = new Map<string, number>();

  let prevWords = 0;
  for (const s of sorted) {
    const k = bin.keyOf(new Date(s.unixSeconds * 1000));
    deltas.set(k, (deltas.get(k) ?? 0) + (s.words - prevWords));
    prevWords = s.words;
  }

  const first = bin.keyOf(new Date(sorted[0]!.unixSeconds * 1000));
  const last = bin.keyOf(
    new Date(sorted[sorted.length - 1]!.unixSeconds * 1000),
  );

  const result: PeriodBucket[] = [];
  let cursor = first;
  for (let i = 0; i < 100_000; i++) {
    const startDate = bin.dateOfKey(cursor);
    result.push({
      key: cursor,
      startIso: dayKey(startDate),
      delta: deltas.get(cursor) ?? 0,
    });
    if (cursor === last) break;
    cursor = bin.nextKey(cursor);
  }
  return result;
};

export const computeHistoryFromSamples = (
  samples: readonly CommitSample[],
): WordHistory => ({
  day: bucketDeltas(samples, DAY_BIN),
  week: bucketDeltas(samples, WEEK_BIN),
  month: bucketDeltas(samples, MONTH_BIN),
});

/**
 * Walks git log --follow for filePath (handling renames), then for each commit
 * reads the file at that revision and computes a stripped word count.
 */
const listCommits = (filePath: string): CommitEntry[] => {
  const output = execSync(
    `git log --follow --name-status --format="%H %ct" -- "${filePath}"`,
    { encoding: "utf-8", cwd: process.cwd() },
  );

  const entries: CommitEntry[] = [];
  let header: { hash: string; unixSeconds: number } | null = null;

  for (const raw of output.split("\n")) {
    const line = raw.trim();
    if (!line) continue;

    const headerMatch = line.match(/^([0-9a-f]{40})\s+(\d+)$/);
    if (headerMatch) {
      header = {
        hash: headerMatch[1]!,
        unixSeconds: parseInt(headerMatch[2]!, 10),
      };
      continue;
    }

    if (!header) continue;

    const statusMatch = line.match(/^([MARCD])\d*\s+(.+)$/);
    if (!statusMatch) continue;
    if (statusMatch[1] === "D") {
      header = null;
      continue;
    }

    const parts = statusMatch[2]!.split(/\s+/);
    entries.push({
      hash: header.hash,
      unixSeconds: header.unixSeconds,
      path: parts[parts.length - 1]!,
    });
    header = null;
  }

  return entries.sort((a, b) => a.unixSeconds - b.unixSeconds);
};

const readFileAtCommit = (hash: string, path: string): string => {
  try {
    return execSync(`git show "${hash}:${path}"`, {
      encoding: "utf-8",
      cwd: process.cwd(),
      maxBuffer: 50 * 1024 * 1024,
    });
  } catch {
    return "";
  }
};

export const computeWordHistory = (filePath: string): WordHistory => {
  const commits = listCommits(filePath);
  const samples: CommitSample[] = commits.map((c) => ({
    unixSeconds: c.unixSeconds,
    words: countWords(
      stripObsidianComments(readFileAtCommit(c.hash, c.path)).split("\n"),
    ),
  }));
  return computeHistoryFromSamples(samples);
};
