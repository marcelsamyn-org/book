import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

interface HtmlGeneratorOptions {
  contentHtml: string;
  tocEntries: Array<{
    id: string;
    title: string;
    level: number;
    children: Array<{ id: string; title: string; level: number }>;
  }>;
  lastUpdatedIso: string;
  lineChanges: string;
  commits: Array<{ date: Date; message: string }>;
  templatePath?: string;
}

export const generateHtml = async (
  options: HtmlGeneratorOptions,
): Promise<string> => {
  const {
    contentHtml,
    tocEntries,
    lastUpdatedIso,
    lineChanges,
    commits,
    templatePath,
  } = options;

  const templatePathResolved =
    templatePath ?? resolve(import.meta.dirname, "templates/template.html");
  const template = await readFile(templatePathResolved, "utf-8");

  const tocHtml = generateTocHtml(tocEntries);
  const commitsHtml = generateCommitsHtml(commits);

  return template
    .replace("{{LAST_UPDATED_ISO}}", lastUpdatedIso)
    .replace("{{LINE_CHANGES}}", lineChanges)
    .replace("{{COMMITS_HTML}}", commitsHtml)
    .replace("{{TOC_HTML}}", tocHtml)
    .replace("{{CONTENT_HTML}}", contentHtml);
};

const generateTocHtml = (
  entries: Array<{
    id: string;
    title: string;
    level: number;
    children: Array<{ id: string; title: string; level: number }>;
  }>,
): string =>
  entries
    .map((entry) => {
      const childrenHtml =
        entry.children.length > 0
          ? `<div class="toc-children">${entry.children
              .map(
                (child) =>
                  `<a href="#${child.id}" class="toc-link toc-child">${escapeHtml(child.title)}</a>`,
              )
              .join("")}</div>`
          : "";

      return `<div class="toc-entry"><a href="#${entry.id}" class="toc-link toc-parent">${escapeHtml(entry.title)}</a>${childrenHtml}</div>`;
    })
    .join("");

const generateCommitsHtml = (
  commits: Array<{ date: Date; message: string }>,
): string => {
  if (commits.length === 0) {
    return '<p class="text-ink-secondary text-sm">No commit history available.</p>';
  }

  return commits
    .map((commit) =>
      `<div class="commit-row"><span class="commit-date" data-timestamp="${commit.date.toISOString()}"></span><span class="commit-msg">${escapeHtml(commit.message)}</span></div>`,
    )
    .join("");
};

const escapeHtml = (text: string): string => {
  const escapeMap: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (char) => escapeMap[char]!);
};
