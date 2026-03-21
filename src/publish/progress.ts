import { Heading } from "../md/types.js";

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

export interface BookProgress {
  readonly totalWords: number;
  readonly targetWords: number;
  readonly percentage: number;
  readonly sections: readonly SectionProgress[];
}

const TARGET_WORDS = 55_000;

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

  return { totalWords, targetWords: TARGET_WORDS, percentage, sections };
};
