import type { RootContent } from "mdast";
import type {} from "mdast-util-mdx";
import remarkMdx from "remark-mdx";
import remarkParse from "remark-parse";
import { unified } from "unified";
import { failAt, renderComponent, type RenderedComponent } from "./components.js";

const OBSIDIAN_COMMENT = /%%([\s\S]*?)%%/g;
const CITATION = /^ *(\[@[^\]\n]+\]) *$/;
const MDX_NODE_TYPES: ReadonlySet<string> = new Set([
  "mdxjsEsm",
  "mdxJsxFlowElement",
  "mdxJsxTextElement",
  "mdxFlowExpression",
  "mdxTextExpression",
]);

const lineAt = (text: string, offset: number): number => text.slice(0, offset).split("\n").length;

/**
 * Drops Obsidian `%%…%%` comments, pairing markers left to right as Obsidian
 * does, but keeps citation comments (`%%[@key]%%`) as pandoc citations.
 * Removed comments leave their newlines behind so error line numbers still
 * match book.mdx. Throws where a reader would otherwise see a private note
 * or lose a citation: an unclosed `%%`, or a comment that mixes a citation
 * with other text.
 */
export const revealCitations = (source: string): string => {
  const revealed = source.replace(OBSIDIAN_COMMENT, (_comment, inner: string, offset: number) => {
    const citation = CITATION.exec(inner)?.[1];
    if (citation !== undefined) return citation;
    if (inner.includes("[@")) {
      throw new Error(
        `book.mdx line ${lineAt(source, offset)}: a comment mixes a citation with other text; write it as %%[@key]%%`,
      );
    }
    return inner.replace(/[^\n]/g, "");
  });
  const unclosed = revealed.indexOf("%%");
  if (unclosed >= 0) {
    throw new Error(`book.mdx line ${lineAt(revealed, unclosed)}: %% opens a comment that never closes`);
  }
  return revealed;
};

/**
 * Converts the MDX manuscript into pandoc Markdown. Imports are removed and
 * each top-level component becomes raw Typst and HTML blocks; any other MDX
 * construct throws, so nothing is silently dropped from the book.
 */
export const toPandocMarkdown = (source: string): string => {
  const text = revealCitations(source);
  const tree = unified().use(remarkParse).use(remarkMdx).parse(text);
  const edits = tree.children.flatMap((node) => topLevelEdit(node, text));
  return edits.reduceRight(
    (result, edit) => result.slice(0, edit.start) + edit.replacement + result.slice(edit.end),
    text,
  );
};

interface Edit {
  readonly start: number;
  readonly end: number;
  readonly replacement: string;
}

const topLevelEdit = (node: RootContent, text: string): readonly Edit[] => {
  switch (node.type) {
    case "mdxjsEsm":
      return [editOf(node, "")];
    case "mdxJsxFlowElement": {
      const { start, end } = editOf(node, "");
      if (text.slice(start, end).includes("[@")) failAt(node, "citations inside components are not supported");
      return [{ start, end, replacement: rawBlocks(renderComponent(node)) }];
    }
    default:
      assertNoMdx(node);
      return [];
  }
};

const assertNoMdx = (node: RootContent): void => {
  if (MDX_NODE_TYPES.has(node.type)) failAt(node, `${node.type} is only supported as a top-level component`);
  if ("children" in node) node.children.forEach(assertNoMdx);
};

const editOf = (node: RootContent, replacement: string): Edit => {
  const start = node.position?.start.offset;
  const end = node.position?.end.offset;
  if (start === undefined || end === undefined) return failAt(node, "has no source position");
  return { start, end, replacement };
};

const rawBlocks = ({ typst, html }: RenderedComponent): string =>
  ["````{=typst}", typst, "````", "", "````{=html}", html, "````"].join("\n");
