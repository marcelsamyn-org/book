/**
 * Applies the manuscript's typography rules to prose: curly quotes, ellipses,
 * and em dashes.
 *
 * Only `text` nodes change. Import statements, JSX attribute values, and JS
 * expressions inside `{...}` are JavaScript, so they keep their ASCII quotes.
 * The transform is remark-smartypants, run the same way the site build runs it,
 * so the source carries the glyphs the site already renders. A text node is
 * accepted only when the change touches nothing but a quote, ellipsis, or dash,
 * so whitespace and every other character survive untouched.
 *
 * Run `bun run typography:check` to report drift, `bun run typography:fix` to
 * apply it. Fixing prose realigns nothing else: story line anchors and the
 * editorial docs quote the manuscript verbatim, so run `bun run storyline:check`
 * afterwards and copy the new wording into `src/storyline/threads.ts`.
 */
import { readFileSync, writeFileSync } from "node:fs";
import type { Nodes, Root, Text } from "mdast";
import remarkMdx from "remark-mdx";
import remarkParse from "remark-parse";
import remarkSmartypants from "remark-smartypants";
import { unified } from "unified";

const parser = unified().use(remarkParse).use(remarkMdx);
const smartypants = unified().use(remarkSmartypants);

const parse = (source: string): Root => parser.parse(source) as Root;

const textNodes = (tree: Nodes, out: Text[] = []): Text[] => {
  if (tree.type === "text") out.push(tree);
  if ("children" in tree) for (const child of tree.children) textNodes(child, out);
  return out;
};

/** Every node value that is not prose, so a mismatch proves syntax was touched. */
const syntaxValues = (tree: Nodes, out: string[] = []): string[] => {
  if (tree.type === "text") return out;
  if ("value" in tree && typeof tree.value === "string") out.push(tree.value);
  if (tree.type === "mdxJsxAttribute" && typeof tree.value === "string") out.push(tree.value);
  if ("children" in tree) for (const child of tree.children) syntaxValues(child, out);
  return out;
};

/** Curly quotes folded back to ASCII, so a string can be compared ignoring quote style. */
const fold = (value: string): string =>
  value.replaceAll("\u2018", "'").replaceAll("\u2019", "'").replaceAll("\u201c", '"').replaceAll("\u201d", '"');

/** What smartypants is allowed to do: quotes are folded, then ellipses and dashes are expected. */
const canonical = (value: string): string =>
  fold(value).replaceAll("...", "\u2026").replaceAll("---", "\u2014").replaceAll("--", "\u2014");

/** Smartypants turns `--` into an em dash but leaves `---`, which this manuscript uses as one. */
const emDashes = (value: string): string => value.replaceAll("---", "\u2014");

/** Puts a transformed text value back where it sat, keeping line prefixes such as `> ` or `- `. */
const remap = (raw: string, was: string, now: string): string | undefined => {
  const rawLines = raw.split("\n");
  const wasLines = was.split("\n");
  const nowLines = now.split("\n");
  if (rawLines.length !== wasLines.length || nowLines.length !== wasLines.length) return undefined;
  if (!rawLines.every((line, i) => line.endsWith(wasLines[i] ?? ""))) return undefined;
  return rawLines
    .map((line, i) => line.slice(0, line.length - (wasLines[i] ?? "").length) + (nowLines[i] ?? ""))
    .join("\n");
};

/** A short before/after window around the first difference, for reports. */
const detail = (from: string, to: string): string => {
  const before = [...from];
  const after = [...to];
  const at = before.findIndex((char, i) => char !== after[i]);
  const start = Math.max(0, at - 30);
  return `${JSON.stringify(before.slice(start, at + 30).join(""))} -> ${JSON.stringify(after.slice(start, at + 30).join(""))}`;
};

const countQuotes = (text: string): string => {
  const chars = [...text];
  const curly = chars.filter((char) => "\u2018\u2019\u201c\u201d".includes(char)).length;
  const straight = chars.filter((char) => char === '"' || char === "'").length;
  return `curly ${curly}, straight ${straight}`;
};

const main = (): void => {
  const [path, ...flags] = process.argv.slice(2);
  if (path === undefined) throw new Error("usage: bun run typography:check <file> (or typography:fix)");
  const write = flags.includes("--write");
  const source = readFileSync(path, "utf-8");
  const tree = parse(source);

  const wasText = textNodes(tree).map((node) => node.value);
  const syntaxBefore = syntaxValues(tree);
  smartypants.runSync(tree);
  for (const node of textNodes(tree)) node.value = emDashes(node.value);

  const edits: { start: number; end: number; from: string; to: string }[] = [];
  const kept: string[] = [];
  textNodes(tree).forEach((node, index) => {
    const was = wasText[index];
    const { start, end } = node.position ?? {};
    if (was === undefined || start?.offset === undefined || end?.offset === undefined) return;
    if (node.value === was) return;
    const raw = source.slice(start.offset, end.offset);
    const mapped = remap(raw, was, node.value);
    if (mapped === undefined) {
      kept.push(`cannot map back at line ${start.line}: ${JSON.stringify(raw.slice(0, 60))}`);
      return;
    }
    if (canonical(raw) !== fold(mapped)) {
      kept.push(`line ${start.line}: ${detail(canonical(raw), fold(mapped))}`);
      return;
    }
    edits.push({ start: start.offset, end: end.offset, from: raw, to: mapped });
  });
  edits.sort((a, b) => a.start - b.start);

  let result = "";
  let cursor = 0;
  for (const edit of edits) {
    result += source.slice(cursor, edit.start) + edit.to;
    cursor = edit.end;
  }
  result += source.slice(cursor);

  const parsed = parse(result);
  const syntaxAfter = syntaxValues(parsed);
  if (syntaxBefore.length !== syntaxAfter.length || syntaxBefore.some((value, i) => value !== syntaxAfter[i])) {
    throw new Error("syntax changed — refusing to write");
  }
  const leftover = textNodes(parsed).filter((node) => /["']/.test(node.value));
  if (leftover.length > 0) {
    const samples = leftover.slice(0, 5).map((node) => JSON.stringify(node.value.slice(0, 80)));
    throw new Error(`${leftover.length} text nodes still hold straight quotes:\n  ${samples.join("\n  ")}`);
  }
  if (kept.length > 0) console.log(`kept as written:\n  ${kept.join("\n  ")}`);

  if (edits.length === 0) {
    console.log(`${path}: prose is already typographic (${countQuotes(source)})`);
    return;
  }

  const ellipses = edits.filter((edit) => edit.from.includes("...")).length;
  const dashes = edits.filter((edit) => edit.from.includes("--")).length;
  const extras = [ellipses > 0 ? `${ellipses} with ellipses` : "", dashes > 0 ? `${dashes} with dashes` : ""];
  console.log(`${path}: ${edits.length} text nodes need typography — ${extras.filter((one) => one !== "").join(", ")}`);
  console.log(`quotes — before: ${countQuotes(source)}; after: ${countQuotes(result)}`);
  for (const edit of edits.slice(0, 8)) {
    console.log(`\n  - ${JSON.stringify(edit.from.slice(0, 100))}\n  + ${JSON.stringify(edit.to.slice(0, 100))}`);
  }

  if (!write) {
    process.exitCode = 1;
    return;
  }
  writeFileSync(path, result);
  console.log(`\nwrote ${path}`);
};

main();
