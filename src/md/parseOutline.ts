import type { Heading, Outline } from "./types.js";
import { slugify } from "../utils/slug.js";

interface MutableHeading {
  id: string;
  title: string;
  level: number;
  startLine: number;
  endLine?: number;
  contentLines: string[];
  children: MutableHeading[];
}

export const parseOutline = (content: string): Outline => {
  const lines = content.split(/\r?\n/);
  const rootHeadings: MutableHeading[] = [];
  const headingStack: MutableHeading[] = [];

  const finalizeHeading = (heading: MutableHeading, endLine: number) => {
    heading.endLine = endLine;
  };

  lines.forEach((line, index) => {
    const lineNumber = index + 1;
    const headingMatch = /^(#{1,6})\s+(.*)$/.exec(line);

    if (headingMatch) {
      const level = headingMatch[1]!.length;
      const title = headingMatch[2]!.trim();
      const id = `${slugify(title)}-${lineNumber}`;
      const heading: MutableHeading = {
        id,
        title,
        level,
        startLine: lineNumber,
        contentLines: [],
        children: [],
      };

      let stackTop = headingStack.at(-1);
      while (stackTop && stackTop.level >= level) {
        const completed = headingStack.pop();
        if (completed) {
          finalizeHeading(completed, lineNumber - 1);
        }
        stackTop = headingStack.at(-1);
      }

      const parent = headingStack.at(-1);
      if (parent) {
        parent.children.push(heading);
      } else {
        rootHeadings.push(heading);
      }

      headingStack.push(heading);
      return;
    }

    const activeHeading = headingStack[headingStack.length - 1];
    if (activeHeading) {
      activeHeading.contentLines.push(line);
    }
  });

  while (headingStack.length > 0) {
    const completed = headingStack.pop();
    if (completed) {
      finalizeHeading(completed, lines.length);
    }
  }

  const convert = (heading: MutableHeading): Heading => {
    const base: Heading = {
      id: heading.id,
      title: heading.title,
      level: heading.level,
      startLine: heading.startLine,
      contentLines: [...heading.contentLines],
      children: heading.children.map(convert),
    };

    return heading.endLine !== undefined ? { ...base, endLine: heading.endLine } : base;
  };

  return {
    headings: rootHeadings.map(convert),
  };
};
