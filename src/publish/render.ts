import { OrgHeading } from "../org/types.js";

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

const formatOrgInline = (text: string): string => {
  let result = escapeHtml(text);

  result = result.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  result = result.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  result = result.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener">$1</a>',
  );
  result = result.replace(/_([^_]+)_/g, "<u>$1</u>");
  result = result.replace(/=([^=]+)=/g, "<code>$1</code>");
  result = result.replace(/~([^~]+)~/g, "<code>$1</code>");

  return result;
};

const renderContentLines = (lines: readonly string[]): string => {
  if (lines.length === 0) return "";

  const renderedLines: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.length === 0) continue;

    if (trimmed.startsWith("#+begin_quote")) {
      renderedLines.push("<blockquote>");
      continue;
    }

    if (trimmed.startsWith("#+end_quote")) {
      renderedLines.push("</blockquote>");
      continue;
    }

    if (trimmed.startsWith("#+")) continue;

    if (trimmed.startsWith("[[")) {
      const linkMatch = trimmed.match(/\[\[([^\]]+)\]\[([^\]]+)\]\]/);
      if (linkMatch) {
        const url = linkMatch[1]!;
        const text = linkMatch[2]!;
        const isExternal = url.startsWith("http");
        const targetAttr = isExternal ? ' target="_blank" rel="noopener"' : "";
        renderedLines.push(`<a href="${url}"${targetAttr}>${text}</a>`);
        continue;
      }
    }

    renderedLines.push(`<p>${formatOrgInline(trimmed)}</p>`);
  }

  return renderedLines.join("\n");
};

export const renderHeadingToHtml = (heading: OrgHeading): string => {
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
  heading: OrgHeading,
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
