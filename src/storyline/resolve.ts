/**
 * Resolves story-line threads against the manuscript: turns each anchor quote
 * into a word position and section, and derives the flags the diagram shows
 * (ideas used before they are explained, promises never paid off).
 *
 * Positions are word offsets into the comment-stripped book, so the x-axis of
 * the diagram is "how far into the book the reader is".
 */
import GithubSlugger from "github-slugger";
import { parseOutline } from "../md/parseOutline.js";
import type { Heading } from "../md/types.js";
import { countWords } from "../publish/progress.js";
import type { Mention, Thread } from "./types.js";

export interface SectionRef {
  readonly title: string;
  /** Heading id on the book page, matching Astro's github-slugger output. */
  readonly slug: string;
  /** Titles from the part down to the innermost heading containing the quote. */
  readonly path: readonly string[];
}

export interface ResolvedMention extends Mention {
  /** Words from the start of the book to the quote. */
  readonly position: number;
  /** 1-based line in the comment-stripped book. */
  readonly line: number;
  readonly section: SectionRef;
  /** A `use` that comes before the thread's explanation. */
  readonly early: boolean;
  readonly afterPayoff: boolean;
}

export interface ResolvedThread {
  readonly id: string;
  readonly title: string;
  readonly question: string;
  /** Sorted by position. */
  readonly mentions: readonly ResolvedMention[];
  readonly start: number;
  /** Position of the explanation; falls back to the payoff when a thread has none. */
  readonly explainAt: number | null;
  readonly payoffAt: number | null;
  /** Where the tension line ends: the payoff, or the last mention when there is none. */
  readonly end: number;
  /** Planted but never paid off. */
  readonly owed: boolean;
  /** Explained with nothing planted before it. */
  readonly coldOpen: boolean;
}

export interface Band {
  readonly title: string;
  readonly slug: string;
  readonly level: number;
  readonly start: number;
  readonly end: number;
}

export interface Storyline {
  readonly totalWords: number;
  readonly parts: readonly Band[];
  readonly chapters: readonly Band[];
  /** Sorted by first mention. */
  readonly threads: readonly ResolvedThread[];
}

interface FlatHeading {
  readonly title: string;
  readonly level: number;
  readonly startLine: number;
  readonly slug: string;
  readonly path: readonly string[];
  readonly position: number;
}

interface BookIndex {
  readonly content: string;
  readonly lineStarts: readonly number[];
  readonly wordsBeforeLine: readonly number[];
  readonly totalWords: number;
  readonly headings: readonly FlatHeading[];
}

const ROOT_SECTION: SectionRef = { title: "(before the first heading)", slug: "", path: [] };

const indexBook = (content: string): BookIndex => {
  const lines = content.split("\n");
  const lineStarts: number[] = [];
  const wordsBeforeLine: number[] = [0];
  let offset = 0;
  lines.forEach((line, i) => {
    lineStarts.push(offset);
    offset += line.length + 1;
    wordsBeforeLine.push(wordsBeforeLine[i]! + countWords([line]));
  });

  const slugger = new GithubSlugger();
  const headings: FlatHeading[] = [];
  const walk = (nodes: readonly Heading[], parents: readonly string[]): void => {
    for (const heading of nodes) {
      const path = [...parents, heading.title];
      headings.push({
        title: heading.title,
        level: heading.level,
        startLine: heading.startLine,
        slug: slugger.slug(heading.title),
        path,
        position: wordsBeforeLine[heading.startLine - 1]!,
      });
      walk(heading.children, path);
    }
  };
  walk(parseOutline(content).headings, []);

  return {
    content,
    lineStarts,
    wordsBeforeLine,
    totalWords: wordsBeforeLine[lines.length]!,
    headings,
  };
};

/** 0-based index of the line containing a character offset. */
const lineIndexOf = (index: BookIndex, charIndex: number): number => {
  let lo = 0;
  let hi = index.lineStarts.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (index.lineStarts[mid]! <= charIndex) lo = mid;
    else hi = mid - 1;
  }
  return lo;
};

const sectionAt = (index: BookIndex, line: number): SectionRef => {
  let found: FlatHeading | undefined;
  for (const heading of index.headings) {
    if (heading.startLine > line) break;
    found = heading;
  }
  return found ? { title: found.title, slug: found.slug, path: found.path } : ROOT_SECTION;
};

interface Location {
  readonly position: number;
  readonly line: number;
  readonly section: SectionRef;
}

type Located = Location | { readonly matches: 0 | 2 };

const locate = (index: BookIndex, quote: string): Located => {
  const first = index.content.indexOf(quote);
  if (first < 0) return { matches: 0 };
  if (index.content.indexOf(quote, first + 1) >= 0) return { matches: 2 };
  const lineIndex = lineIndexOf(index, first);
  const wordsIntoLine = countWords([index.content.slice(index.lineStarts[lineIndex]!, first)]);
  const line = lineIndex + 1;
  return {
    position: index.wordsBeforeLine[lineIndex]! + wordsIntoLine,
    line,
    section: sectionAt(index, line),
  };
};

const isLocation = (located: Located): located is Location => !("matches" in located);

type LocatedMention = Mention & Location;

const buildThread = (thread: Thread, located: readonly LocatedMention[]): ResolvedThread => {
  const sorted = [...located].sort((a, b) => a.position - b.position);
  const first = sorted[0];
  const last = sorted.at(-1);
  if (!first || !last) {
    throw new Error(`Story line thread "${thread.id}" has no mentions.`);
  }
  const explain = sorted.find((m) => m.kind === "explain");
  const payoff = sorted.find((m) => m.kind === "payoff");
  const explainAt = explain?.position ?? payoff?.position ?? null;
  const payoffAt = payoff?.position ?? null;

  const mentions = sorted.map(
    (m): ResolvedMention => ({
      ...m,
      early: m.kind === "use" && explainAt !== null && m.position < explainAt,
      afterPayoff: payoffAt !== null && m.position > payoffAt,
    }),
  );

  return {
    id: thread.id,
    title: thread.title,
    question: thread.question,
    mentions,
    start: first.position,
    explainAt,
    payoffAt,
    end: payoffAt ?? last.position,
    owed: sorted.some((m) => m.kind === "plant") && payoffAt === null,
    coldOpen: explain !== undefined && explain === first,
  };
};

const toBand = (heading: FlatHeading, end: number): Band => ({
  title: heading.title,
  slug: heading.slug,
  level: heading.level,
  start: heading.position,
  end,
});

const buildBands = (index: BookIndex): { parts: Band[]; chapters: Band[] } => {
  const partHeadings = index.headings.filter((h) => h.level === 1);
  const parts = partHeadings.map((part, i) =>
    toBand(part, partHeadings[i + 1]?.position ?? index.totalWords),
  );

  const chapters = parts.flatMap((part) => {
    const children = index.headings.filter(
      (h) => h.level === 2 && h.position >= part.start && h.position < part.end,
    );
    if (children.length === 0) return [part];
    return children.map((chapter, i) => toBand(chapter, children[i + 1]?.position ?? part.end));
  });

  return { parts, chapters };
};

export const resolveStoryline = (content: string, threads: readonly Thread[]): Storyline => {
  const index = indexBook(content);

  const broken: string[] = [];
  const located = threads.map((thread) =>
    thread.mentions.flatMap((mention): LocatedMention[] => {
      const result = locate(index, mention.quote);
      if (isLocation(result)) return [{ ...mention, ...result }];
      const reason = result.matches === 0 ? "not found" : "found more than once";
      broken.push(`${thread.id}: ${reason} — "${mention.quote}"`);
      return [];
    }),
  );
  if (broken.length > 0) {
    throw new Error(`Story line anchors need fixing:\n${broken.join("\n")}`);
  }

  const resolved = threads
    .map((thread, i) => buildThread(thread, located[i]!))
    .sort((a, b) => a.start - b.start);

  return { totalWords: index.totalWords, ...buildBands(index), threads: resolved };
};
