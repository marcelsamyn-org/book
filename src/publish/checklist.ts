/**
 * Parses the endgame checklist from the author's editorial status doc into
 * typed, display-ready data for the site's progress panel.
 *
 * Aliases: endgame checklist, sitting checklist, status doc parser.
 */
import { readFile } from "node:fs/promises";

export interface ChecklistItem {
  readonly title: string;
  readonly done: boolean;
}

export interface ChecklistSection {
  readonly title: string;
  readonly items: readonly ChecklistItem[];
}

export interface EndgameChecklist {
  readonly sections: readonly ChecklistSection[];
  readonly totalCount: number;
  readonly doneCount: number;
}

const STATUS_DOC_PATH = "docs/editorial/2026-08-09-status-and-plan.md";

const HEADING_RE = /^##\s+(.+)$/;
const CHECKBOX_RE = /^-\s*\[([ xX])\]\s*(.*)$/;
const BOLD_RE = /\*\*(.+?)\*\*/;

const stripInlineMarkdown = (text: string): string =>
  text
    .replace(/`([^`]*)`/g, "$1")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .trim();

/** Item title is its bold lead-in, e.g. "Dissolve `### Motivation`"; falls back to the full line for items without one. */
const extractItemTitle = (text: string): string => {
  const bold = BOLD_RE.exec(text);
  return stripInlineMarkdown(bold ? bold[1]! : text);
};

/** Section headings read "Short name — longer description"; keep only the short name for a compact label. */
const extractSectionTitle = (heading: string): string =>
  (heading.split(" — ")[0] ?? heading).trim();

/** Parses checklist sections (`##` headings) and their `- [ ]`/`- [x]` items from status-doc markdown. */
export const parseEndgameChecklist = (markdown: string): EndgameChecklist => {
  const sections: ChecklistSection[] = [];
  let currentTitle = "";
  let currentItems: ChecklistItem[] = [];

  const flush = (): void => {
    if (currentItems.length > 0) {
      sections.push({ title: currentTitle, items: currentItems });
    }
  };

  for (const line of markdown.split("\n")) {
    const heading = HEADING_RE.exec(line);
    if (heading) {
      flush();
      currentTitle = extractSectionTitle(heading[1]!);
      currentItems = [];
      continue;
    }
    const checkbox = CHECKBOX_RE.exec(line);
    if (checkbox) {
      currentItems.push({
        done: checkbox[1]!.toLowerCase() === "x",
        title: extractItemTitle(checkbox[2]!.trim()),
      });
    }
  }
  flush();

  const allItems = sections.flatMap((s) => s.items);
  return {
    sections,
    totalCount: allItems.length,
    doneCount: allItems.filter((i) => i.done).length,
  };
};

/** Reads and parses the endgame checklist from the status doc. Throws if the doc is missing. */
export const loadEndgameChecklist = async (
  path: string = STATUS_DOC_PATH,
): Promise<EndgameChecklist> => {
  let markdown: string;
  try {
    markdown = await readFile(path, "utf-8");
  } catch (error) {
    throw new Error(
      `Endgame checklist requires ${path}, but it could not be read: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
  return parseEndgameChecklist(markdown);
};
