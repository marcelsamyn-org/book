import type { Heading } from "../md/types.js";

export type SectionStatus =
  | "notes"
  | "outline"
  | "sketched"
  | "draft"
  | "revised";

export interface SectionProgress {
  readonly id: string;
  readonly title: string;
  readonly level: number;
  readonly wordCount: number;
  readonly totalWordCount: number;
  readonly targetWordCount: number;
  readonly status: SectionStatus;
  readonly children: readonly SectionProgress[];
}

export interface Holiday {
  readonly start: string;
  readonly end: string;
}

export interface BookProgress {
  readonly totalWords: number;
  readonly targetWords: number;
  readonly percentage: number;
  readonly sections: readonly SectionProgress[];
  readonly deadlineIso: string;
  readonly daysRemaining: number;
  readonly effectiveDaysRemaining: number;
  readonly requiredDailyPace: number;
  readonly workRate: number;
}

const TARGET_WORDS = 55_000;
const DEADLINE_ISO = "2026-09-15";

/** Fraction of non-holiday days I realistically write on. */
const WORK_RATE = 0.8;

/** Date ranges (inclusive) where no writing is expected. */
const HOLIDAYS: readonly Holiday[] = [
  { start: "2026-07-20", end: "2026-08-09" },
];

const MS_PER_DAY = 24 * 60 * 60 * 1000;

const startOfDay = (d: Date): Date =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate());

const parseIsoDay = (iso: string): Date => new Date(`${iso}T00:00:00`);

const daysUntil = (iso: string, now: Date): number => {
  const target = parseIsoDay(iso);
  const today = startOfDay(now);
  return Math.ceil((target.getTime() - today.getTime()) / MS_PER_DAY);
};

const holidayDaysInRange = (
  holidays: readonly Holiday[],
  rangeStart: Date,
  rangeEndExclusive: Date,
): number => {
  const lastIncluded = new Date(rangeEndExclusive.getTime() - MS_PER_DAY);
  let total = 0;
  for (const h of holidays) {
    const hStart = parseIsoDay(h.start);
    const hEnd = parseIsoDay(h.end);
    const overlapStart = hStart > rangeStart ? hStart : rangeStart;
    const overlapEnd = hEnd < lastIncluded ? hEnd : lastIncluded;
    const days =
      Math.floor((overlapEnd.getTime() - overlapStart.getTime()) / MS_PER_DAY) +
      1;
    if (days > 0) total += days;
  }
  return total;
};

export const computeEffectiveDaysRemaining = (
  now: Date,
  deadlineIso: string,
  holidays: readonly Holiday[],
  workRate: number,
): number => {
  const calendarDays = daysUntil(deadlineIso, now);
  if (calendarDays <= 0) return 0;
  const today = startOfDay(now);
  const deadline = parseIsoDay(deadlineIso);
  const holidayDays = holidayDaysInRange(holidays, today, deadline);
  const remaining = Math.max(0, calendarDays - holidayDays);
  return Math.max(0, Math.round(remaining * workRate));
};

/** Target word counts per H1 section title. */
const SECTION_TARGETS: Record<string, number> = {
  Overview: 2_000,
  Introduction: 3_000,
  "Part 1: The Digital Mirage": 18_000,
  "Part 2: The New Sun Casting Shadows on the Soul": 18_000,
  "Part 3: Reclaiming the Flame": 12_000,
  Conclusion: 2_000,
};

const stripMarkdownSyntax = (line: string): string =>
  line
    .replace(/^>+\s*/, "")
    .replace(/^[-*+]\s+/, "")
    .replace(/^\d+\.\s+/, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[*_`#]/g, "")
    .trim();

export const countWords = (lines: readonly string[]): number =>
  lines
    .map(stripMarkdownSyntax)
    .filter((line) => line.length > 0)
    .join(" ")
    .split(/\s+/)
    .filter((word) => word.length > 0).length;

/**
 * Status is relative to the section's target word count.
 * A section with 5,000 words is "sketched" if its target is 18,000,
 * but "revised" if its target is 2,000.
 */
const computeStatus = (
  totalWordCount: number,
  targetWordCount: number,
): SectionStatus => {
  if (totalWordCount < 50) return "notes";
  const ratio = targetWordCount > 0 ? totalWordCount / targetWordCount : 1;
  if (ratio < 0.05) return "outline";
  if (ratio < 0.3) return "sketched";
  if (ratio < 0.7) return "draft";
  return "revised";
};

const distributeTarget = (
  parent: Heading,
  parentTarget: number,
): readonly number[] => {
  if (parent.children.length === 0) return [];
  const perChild = Math.round(parentTarget / parent.children.length);
  return parent.children.map(() => perChild);
};

const computeSectionProgress = (
  heading: Heading,
  targetWordCount: number,
): SectionProgress => {
  const wordCount = countWords(heading.contentLines);
  const childTargets = distributeTarget(heading, targetWordCount);
  const children = heading.children.map((child, i) =>
    computeSectionProgress(child, childTargets[i] ?? 0),
  );
  const childWords = children.reduce((sum, c) => sum + c.totalWordCount, 0);
  const totalWordCount = wordCount + childWords;

  return {
    id: heading.id,
    title: heading.title,
    level: heading.level,
    wordCount,
    totalWordCount,
    targetWordCount,
    status: computeStatus(totalWordCount, targetWordCount),
    children,
  };
};

const resolveTarget = (heading: Heading, fallback: number): number =>
  SECTION_TARGETS[heading.title] ?? fallback;

export const computeBookProgress = (
  headings: readonly Heading[],
  now: Date = new Date(),
): BookProgress => {
  const fallbackPerSection = Math.round(TARGET_WORDS / headings.length);
  const sections = headings.map((h) =>
    computeSectionProgress(h, resolveTarget(h, fallbackPerSection)),
  );
  const totalWords = sections.reduce((sum, s) => sum + s.totalWordCount, 0);
  const percentage = Math.min(
    100,
    Math.round((totalWords / TARGET_WORDS) * 100),
  );

  const daysRemaining = daysUntil(DEADLINE_ISO, now);
  const effectiveDaysRemaining = computeEffectiveDaysRemaining(
    now,
    DEADLINE_ISO,
    HOLIDAYS,
    WORK_RATE,
  );
  const wordsToGo = Math.max(0, TARGET_WORDS - totalWords);
  const requiredDailyPace =
    effectiveDaysRemaining > 0 && wordsToGo > 0
      ? Math.ceil(wordsToGo / effectiveDaysRemaining)
      : 0;

  return {
    totalWords,
    targetWords: TARGET_WORDS,
    percentage,
    sections,
    deadlineIso: DEADLINE_ISO,
    daysRemaining,
    effectiveDaysRemaining,
    requiredDailyPace,
    workRate: WORK_RATE,
  };
};
