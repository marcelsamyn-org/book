import { Heading, Outline } from "./types.js";

export interface ChapterOutline {
  readonly id: string;
  readonly title: string;
  readonly narrative: string;
  readonly heading: Heading;
  readonly partTitle: string | null;
  readonly partDescription: string | null;
  readonly partHeading: Heading | null;
}

const OVERVIEW_TITLE = "overview";

interface SerializeHeadingOptions {
  readonly depth?: number;
  readonly includeChildren?: boolean;
}

export const serializeHeading = (
  heading: Heading,
  { depth = heading.level, includeChildren = true }: SerializeHeadingOptions = {},
): string => {
  const prefix = "#".repeat(Math.max(depth, 1));
  const lines: string[] = [];
  lines.push(`${prefix} ${heading.title}`.trim());
  heading.contentLines
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .forEach((line) => lines.push(line));
  if (includeChildren) {
    heading.children.forEach((child) => {
      lines.push(serializeHeading(child, { depth: depth + 1, includeChildren }));
    });
  }
  return lines.join("\n");
};

const collectHeadingDescription = (heading: Heading): string | null => {
  const description = heading.contentLines
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .join("\n");
  return description.length > 0 ? description : null;
};

const isOverviewHeading = (heading: Heading): boolean => {
  return heading.level === 1 && heading.title.trim().toLowerCase() === OVERVIEW_TITLE;
};

const createChapterOutline = (
  chapterHeading: Heading,
  partHeading: Heading | null,
): ChapterOutline => {
  const partTitle = partHeading ? partHeading.title : null;
  const partDescription = partHeading ? collectHeadingDescription(partHeading) : null;
  const baseDepth = partHeading ? Math.max(partHeading.level + 1, 2) : Math.max(chapterHeading.level, 1);
  return {
    id: chapterHeading.id,
    title: chapterHeading.title,
    narrative: serializeHeading(chapterHeading, { depth: baseDepth, includeChildren: true }),
    heading: chapterHeading,
    partTitle,
    partDescription,
    partHeading,
  };
};

const appendChapterHeadings = (
  accumulator: ChapterOutline[],
  heading: Heading,
  partHeading: Heading | null,
): void => {
  if (heading.level === 2) {
    accumulator.push(createChapterOutline(heading, partHeading));
    return;
  }

  heading.children.forEach((child) => {
    appendChapterHeadings(accumulator, child, partHeading);
  });
};

export const deriveChapters = (outline: Outline): readonly ChapterOutline[] => {
  const chapters: ChapterOutline[] = [];

  outline.headings.forEach((heading) => {
    if (isOverviewHeading(heading)) {
      return;
    }

    if (heading.level === 1) {
      heading.children.forEach((child) => {
        appendChapterHeadings(chapters, child, heading);
      });
      return;
    }

    if (heading.level === 2) {
      appendChapterHeadings(chapters, heading, null);
    }
  });

  return chapters;
};

export const extractOverview = (outline: Outline): string | null => {
  const overviewHeading = outline.headings.find(isOverviewHeading);
  if (!overviewHeading) {
    return null;
  }
  return serializeHeading(overviewHeading, { depth: 1, includeChildren: true });
};
