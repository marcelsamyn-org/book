import { Heading } from "../md/types.js";

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

const formatInline = (text: string): string => {
  let result = escapeHtml(text);

  result = result.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  result = result.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  result = result.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener">$1</a>',
  );
  result = result.replace(/_([^_]+)_/g, "<u>$1</u>");
  result = result.replace(/`([^`]+)`/g, "<code>$1</code>");

  return result;
};

const renderContentLines = (lines: readonly string[]): string => {
  if (lines.length === 0) return "";

  const renderedLines: string[] = [];
  let inBlockquote = false;

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.length === 0) {
      if (inBlockquote) {
        renderedLines.push("</blockquote>");
        inBlockquote = false;
      }
      continue;
    }

    if (trimmed.startsWith("> ")) {
      const quoteContent = trimmed.slice(2);
      if (!inBlockquote) {
        renderedLines.push("<blockquote>");
        inBlockquote = true;
      }
      renderedLines.push(`<p>${formatInline(quoteContent)}</p>`);
      continue;
    }

    if (inBlockquote) {
      renderedLines.push("</blockquote>");
      inBlockquote = false;
    }

    renderedLines.push(`<p>${formatInline(trimmed)}</p>`);
  }

  if (inBlockquote) {
    renderedLines.push("</blockquote>");
  }

  return renderedLines.join("\n");
};

export const renderHeadingToHtml = (heading: Heading): string => {
  const tag = `h${Math.min(heading.level, 6)}`;
  const anchor = `<a href="#${heading.id}" class="heading-anchor" aria-hidden="true">#</a>`;
  const headingHtml = `<${tag} id="${heading.id}">${anchor}${escapeHtml(heading.title)}</${tag}>`;

  const contentHtml = renderContentLines(heading.contentLines);
  const childrenHtml = heading.children
    .map((child) => renderHeadingToHtml(child))
    .join("\n");

  return [headingHtml, contentHtml, childrenHtml].filter(Boolean).join("\n");
};

export const extractTocEntries = (
  heading: Heading,
): Array<{
  id: string;
  title: string;
  level: number;
  children: Array<{ id: string; title: string; level: number }>;
}> => {
  return [
    {
      id: heading.id,
      title: heading.title,
      level: heading.level,
      children: heading.children.map((child) => ({
        id: child.id,
        title: child.title,
        level: child.level,
      })),
    },
  ];
};
