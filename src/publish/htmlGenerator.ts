import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import type {
  BookProgress,
  SectionProgress,
  SectionStatus,
} from "./progress.js";

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
  progress: BookProgress;
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
    progress,
    templatePath,
  } = options;

  const templatePathResolved =
    templatePath ?? resolve(import.meta.dirname, "templates/template.html");
  const template = await readFile(templatePathResolved, "utf-8");

  const tocHtml = generateTocHtml(tocEntries);
  const commitsHtml = generateCommitsHtml(commits);
  const progressHtml = generateProgressHtml(progress);
  const progressSummary = `~${formatWordCount(progress.totalWords)} of ${formatWordCount(progress.targetWords)} words`;

  return template
    .replace("{{LAST_UPDATED_ISO}}", lastUpdatedIso)
    .replace("{{LINE_CHANGES}}", lineChanges)
    .replace("{{COMMITS_HTML}}", commitsHtml)
    .replace("{{PROGRESS_HTML}}", progressHtml)
    .replace("{{PROGRESS_SUMMARY}}", progressSummary)
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

const formatWordCount = (count: number): string =>
  count.toLocaleString("en-US");

const STATUS_CSS: Record<SectionStatus, string> = {
  notes: "progress-status-notes",
  outline: "progress-status-outline",
  sketched: "progress-status-sketched",
  draft: "progress-status-draft",
  revised: "progress-status-revised",
};

const generateProgressBar = (percentage: number, width: number): string => {
  const filled = Math.round((percentage / 100) * width);
  const empty = width - filled;
  const filledStr = `<span class="progress-bar-filled">${"\u2593".repeat(filled)}</span>`;
  const emptyStr = `<span class="progress-bar-empty">${"\u2591".repeat(empty)}</span>`;
  return `<div class="progress-bar" aria-label="${percentage}% complete">${filledStr}${emptyStr}</div>`;
};

const generateSectionRow = (section: SectionProgress): string => {
  const statusClass = STATUS_CSS[section.status];
  return `<div class="progress-section"><span class="progress-title">${escapeHtml(section.title)}</span><span class="progress-leader"></span><span class="progress-words">${formatWordCount(section.totalWordCount)}</span><span class="${statusClass}">${section.status}</span></div>`;
};

const generateSectionWithChildren = (section: SectionProgress): string => {
  const row = generateSectionRow(section);
  const h2Children = section.children.filter((c) => c.level === 2);
  if (h2Children.length === 0) return row;

  const childRows = h2Children.map(generateSectionRow).join("");
  return `${row}<div class="progress-chapters">${childRows}</div>`;
};

const generateProgressHtml = (progress: BookProgress): string => {
  const bar = generateProgressBar(progress.percentage, 40);
  const stat = `<div class="progress-stat">${formatWordCount(progress.totalWords)} of ${formatWordCount(progress.targetWords)} words &middot; ${progress.percentage}%</div>`;
  const sections = progress.sections
    .map(generateSectionWithChildren)
    .join("");

  return `<div class="progress-overview">${bar}${stat}</div><div class="progress-sections">${sections}</div>`;
};
