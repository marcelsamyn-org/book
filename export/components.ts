import type { Expression, Pattern } from "estree-jsx";
import type { ListItem, Nodes, PhrasingContent, Root } from "mdast";
import type {} from "mdast-util-mdx";
import type { MdxJsxAttribute, MdxJsxFlowElement } from "mdast-util-mdx-jsx";
import { toString } from "mdast-util-to-string";
import remarkSmartypants from "remark-smartypants";
import { unified } from "unified";
import { ruleLabelGutter, wrapLabel } from "../src/components/barFigure.js";
import {
  adviceChartSpec,
  adviceFigureSvg,
  type AdviceResponder,
} from "../src/components/breakupAdvice.js";
import {
  capabilityChartSpec,
  capabilityFigureSvg,
  type CapabilityPoint,
} from "../src/components/capabilityCurve.js";
import { breakDownEliza, type ElizaSubstitution } from "../src/components/eliza.js";
import { buildBarChart, buildLineChart, round } from "../src/components/figures.js";
import { valueAnchor } from "../src/components/lineFigure.js";
import { ptgiBands, ptgiScale, ptgiSubscales } from "../src/components/ptgi.js";

/** A manuscript component rendered for both output formats. */
export interface RenderedComponent {
  readonly typst: string;
  readonly html: string;
}

export const failAt = (node: Nodes, message: string): never => {
  throw new Error(`book.mdx line ${node.position?.start.line ?? "?"}: ${message}`);
};

export const renderComponent = (node: MdxJsxFlowElement): RenderedComponent => {
  switch (node.name) {
    case "PartPlate":
      expectShape(node, ["src", "alt"], "no children");
      return renderPartPlate(node);
    case "ChatExhibit":
      expectShape(node, ["prompt"], "children");
      return renderChatExhibit(node);
    case "ScreenplayWriter":
      expectShape(node, ["sceneHeading", "turns", "ghostLine"], "no children");
      return renderScreenplay(node);
    case "ElizaBreakdown":
      expectShape(
        node,
        ["input", "keyword", "pattern", "fragment", "substitutions", "transformedFragment", "template", "response"],
        "no children",
      );
      return renderEliza(node);
    case "PTGIQuestionnaire":
      expectShape(node, [], "no children");
      return renderPtgi();
    case "CapabilityCurve":
      expectShape(node, ["points", "caption", "alt"], "no children");
      return renderCapabilityCurve(node);
    case "BreakupAdvice":
      expectShape(node, ["responders", "average", "caption", "alt"], "no children");
      return renderBreakupAdvice(node);
    default:
      return failAt(node, `<${node.name ?? ""}> has no ebook rendering`);
  }
};

/** Fails on props or content the renderer would not print, so the ebook never loses text quietly. */
const expectShape = (node: MdxJsxFlowElement, props: readonly string[], content: "children" | "no children"): void => {
  const dropped = node.attributes.flatMap((attribute) =>
    attribute.type !== "mdxJsxAttribute" ? ["{...spread}"] : props.includes(attribute.name) ? [] : [attribute.name],
  );
  if (dropped.length > 0) failAt(node, `<${node.name ?? ""}> has props the ebook would drop: ${dropped.join(", ")}`);
  if (content === "no children" && node.children.length > 0) {
    failAt(node, `<${node.name ?? ""}> has content the ebook would drop`);
  }
};

// ── Part plates ─────────────────────────────────────────────

const renderPartPlate = (node: MdxJsxFlowElement): RenderedComponent => {
  const src = stringProp(node, "src");
  const alt = stringProp(node, "alt");
  if (!/^\/images\/book\/[a-z0-9-]+\.png$/.test(src)) {
    return failAt(node, "<PartPlate> src must be a PNG under /images/book/");
  }
  const exportSrc = `public${src}`;
  return {
    typst: `#part-plate(src: ${typstString(`/${exportSrc}`)}, alt: ${typstString(alt)})`,
    html: `<figure class="part-plate"><img src="${escapeHtml(exportSrc)}" alt="${escapeHtml(alt)}" /></figure>`,
  };
};

// ── Chat exhibit ────────────────────────────────────────────

const renderChatExhibit = (node: MdxJsxFlowElement): RenderedComponent => {
  const tree: Root = { type: "root", children: [node] };
  smartypants.runSync(tree);
  const prompt = stringProp(node, "prompt");
  const responses = node.children.map((child) => {
    if (child.type !== "mdxJsxFlowElement" || child.name !== "ChatResponse") {
      return failAt(child, "<ChatExhibit> may only contain <ChatResponse> elements");
    }
    expectShape(child, ["model"], "children");
    const [list, ...rest] = child.children;
    if (list?.type !== "list" || list.ordered === true || rest.length > 0) {
      return failAt(child, "<ChatResponse> must contain exactly one bullet list");
    }
    return { model: stringProp(child, "model"), items: list.children.map(itemPhrasing) };
  });

  const typst = [
    "#chat-exhibit(",
    `  prompt: ${typstString(prompt)},`,
    "  responses: (",
    ...responses.map(
      (response) =>
        `    (model: ${typstString(response.model)}, items: ${typstArray(response.items.map(typstInline))}),`,
    ),
    "  ),",
    ")",
  ];
  const html = [
    `<div class="exhibit chat-exhibit">`,
    `<p class="exhibit-label">Prompt</p>`,
    `<p class="chat-prompt">${escapeHtml(prompt)}</p>`,
    ...responses.flatMap((response) => [
      `<div class="chat-response">`,
      `<p class="exhibit-label">${escapeHtml(response.model)}</p>`,
      "<ul>",
      ...response.items.map((item) => `<li>${htmlInline(item)}</li>`),
      "</ul>",
      "</div>",
    ]),
    "</div>",
  ];
  return { typst: typst.join("\n"), html: html.join("\n") };
};

const itemPhrasing = (item: ListItem): readonly PhrasingContent[] => {
  const [paragraph, ...rest] = item.children;
  return paragraph?.type === "paragraph" && rest.length === 0
    ? paragraph.children
    : failAt(item, "list items must be a single line of text");
};

// ── Screenplay ──────────────────────────────────────────────

type Speaker = "human" | "assistant";

interface Turn {
  readonly speaker: Speaker;
  readonly text: string;
}

const SPEAKER_NAMES: Readonly<Record<Speaker, { readonly chat: string; readonly cue: string }>> = {
  human: { chat: "You", cue: "HUMAN" },
  assistant: { chat: "Assistant", cue: "ASSISTANT" },
};

const readTurn = (value: unknown): Turn | undefined => {
  if (!isRecord(value)) return undefined;
  const speaker = value["speaker"];
  const text = value["text"];
  return (speaker === "human" || speaker === "assistant") && typeof text === "string"
    ? { speaker, text: smart(text) }
    : undefined;
};

const renderScreenplay = (node: MdxJsxFlowElement): RenderedComponent => {
  const sceneHeading = stringProp(node, "sceneHeading");
  const ghostLine = stringProp(node, "ghostLine");
  const turns = arrayProp(node, "turns", readTurn);

  const typst = [
    "#screenplay(",
    `  heading: ${typstString(sceneHeading)},`,
    `  turns: ${typstArray(turns.map((turn) => `(speaker: ${typstString(turn.speaker)}, text: ${typstString(turn.text)})`))},`,
    `  ghost: ${typstString(ghostLine)},`,
    ")",
  ];
  const html = [
    `<div class="exhibit screenplay">`,
    `<p class="exhibit-eyebrow">One writer · two characters</p>`,
    `<p class="exhibit-label">What you see</p>`,
    ...turns.map(
      (turn) =>
        `<p class="chat-message chat-${turn.speaker}"><span class="exhibit-label">${SPEAKER_NAMES[turn.speaker].chat}</span><br />${escapeHtml(turn.text)}</p>`,
    ),
    `<p class="exhibit-label screenplay-script-label">What the model writes</p>`,
    `<div class="screenplay-page">`,
    `<p class="screenplay-scene">${escapeHtml(sceneHeading.toUpperCase())}</p>`,
    ...turns.flatMap((turn) => [
      `<p class="screenplay-cue">${SPEAKER_NAMES[turn.speaker].cue}</p>`,
      `<p class="screenplay-dialogue">${escapeHtml(turn.text)}</p>`,
    ]),
    `<p class="screenplay-cue">${SPEAKER_NAMES.human.cue}</p>`,
    `<p class="screenplay-dialogue screenplay-ghost">${escapeHtml(ghostLine)}▍</p>`,
    "</div>",
    `<p class="screenplay-cut">The model happily writes your next line too — the system stops it here and waits for the real you.</p>`,
    "</div>",
  ];
  return { typst: typst.join("\n"), html: html.join("\n") };
};

// ── ELIZA ───────────────────────────────────────────────────

const readSubstitution = (value: unknown): ElizaSubstitution | undefined => {
  if (!isRecord(value)) return undefined;
  const from = value["from"];
  const to = value["to"];
  return typeof from === "string" && typeof to === "string" ? { from, to } : undefined;
};

const renderEliza = (node: MdxJsxFlowElement): RenderedComponent => {
  const keyword = stringProp(node, "keyword");
  const pattern = stringProp(node, "pattern");
  const hasProp = (name: string): boolean =>
    node.attributes.some((attribute) => attribute.type === "mdxJsxAttribute" && attribute.name === name);
  const { input, substitutions, transformedFragment, template, response } = breakDownEliza({
    input: stringProp(node, "input"),
    keyword,
    pattern,
    fragment: stringProp(node, "fragment"),
    template: stringProp(node, "template"),
    response: stringProp(node, "response"),
    ...(hasProp("substitutions") ? { substitutions: arrayProp(node, "substitutions", readSubstitution) } : {}),
    ...(hasProp("transformedFragment") ? { transformedFragment: stringProp(node, "transformedFragment") } : {}),
  });

  const typst = [
    "#eliza(",
    `  input: (head: ${typstString(input.beforeKeyword)}, keyword: ${typstString(input.keyword)}, middle: ${typstString(input.betweenKeywordAndFragment)}, fragment: ${typstString(input.fragment)}, tail: ${typstString(input.afterFragment)}),`,
    `  keyword: ${typstString(keyword)},`,
    `  pattern: ${typstString(pattern)},`,
    `  substitutions: ${typstArray(substitutions.map((sub) => `(from: ${typstString(sub.from)}, to: ${typstString(sub.to)})`))},`,
    `  transformed: ${typstString(transformedFragment)},`,
    `  template: (left: ${typstString(template.left)}, right: ${typstString(template.right)}),`,
    `  response: (head: ${typstString(response.before)}, fragment: ${typstString(response.fragment)}, tail: ${typstString(response.after)}),`,
    ")",
  ];

  const fragment = (text: string): string => `<span class="eliza-fragment">${escapeHtml(text)}</span>`;
  const code = (text: string): string => `<code>${text}</code>`;
  const step = (tag: string, body: readonly string[]): readonly string[] => [
    `<div class="eliza-step">`,
    `<p class="exhibit-label">${tag}</p>`,
    ...body,
    "</div>",
  ];
  const html = [
    `<div class="exhibit eliza">`,
    `<p class="exhibit-eyebrow">ELIZA · DOCTOR script · 1966</p>`,
    `<div class="eliza-message">`,
    `<p class="exhibit-label">User</p>`,
    `<p>${escapeHtml(input.beforeKeyword)}<span class="eliza-keyword">${escapeHtml(input.keyword)}</span>${escapeHtml(input.betweenKeywordAndFragment)}${fragment(input.fragment)}${escapeHtml(input.afterFragment)}</p>`,
    "</div>",
    ...step("01 · Detect", [
      `<p>Scan the input against a ranked list of keywords until one hits. First match: ${code(escapeHtml(keyword.toUpperCase()))}</p>`,
    ]),
    ...step("02 · Decompose", [
      `<p>Split the input around the keyword using the rule’s pattern. Each ${code("0")} is a wildcard that swallows whatever sits beside the keyword.</p>`,
      `<p>Pattern: ${code(escapeHtml(pattern))}</p>`,
      `<p>Captured: ${code(fragment(input.fragment))}</p>`,
    ]),
    ...(substitutions.length > 0
      ? step("03 · Flip pronouns", [
          "<p>Run the captured fragment through a pronoun-flip table so the reply addresses the user instead of echoing them.</p>",
          ...substitutions.map((sub) => `<p>${code(escapeHtml(sub.from))} → ${code(escapeHtml(sub.to))}</p>`),
          `<p>Result: ${code(fragment(transformedFragment))}</p>`,
        ])
      : []),
    ...step(`${substitutions.length > 0 ? "04" : "03"} · Reassemble`, [
      "<p>Slot the fragment into one of the rule’s reassembly templates. ELIZA cycles through them so it doesn’t repeat itself.</p>",
      `<p>Template: ${code(`${escapeHtml(template.left)}_____${escapeHtml(template.right)}`)}</p>`,
      `<p>Filled: ${code(`${escapeHtml(template.left)}${fragment(transformedFragment)}${escapeHtml(template.right)}`)}</p>`,
    ]),
    `<div class="eliza-message eliza-reply">`,
    `<p class="exhibit-label">ELIZA</p>`,
    `<p>${escapeHtml(response.before)}${fragment(response.fragment)}${escapeHtml(response.after)}</p>`,
    "</div>",
    "</div>",
  ];
  return { typst: typst.join("\n"), html: html.join("\n") };
};

// ── PTGI questionnaire ──────────────────────────────────────

const renderPtgi = (): RenderedComponent => {
  const typst = [
    "#ptgi(",
    `  subscales: ${typstArray(
      ptgiSubscales.map((subscale) => {
        const note = subscale.note === undefined ? "" : `note: ${typstString(smart(subscale.note))}, `;
        const items = typstArray(subscale.items.map((item) => `(n: ${item.n}, text: ${typstString(smart(item.text))})`));
        return `(label: ${typstString(subscale.label)}, ${note}items: ${items})`;
      }),
    )},`,
    `  scale: ${typstArray(ptgiScale.map((point) => `(value: ${point.value}, label: ${typstString(point.label)})`))},`,
    `  bands: ${typstArray(ptgiBands.map((band) => `(max: ${band.max}, reading: ${typstString(smart(band.reading))})`))},`,
    ")",
  ];

  const html = [
    `<div class="exhibit ptgi">`,
    `<p class="exhibit-eyebrow">Self-assessment</p>`,
    `<p class="ptgi-title">PTGI‑X‑SF</p>`,
    "<p>Bring to mind a difficult event you’ve moved through. For each statement, rate from 0 to 5 the degree to which you experienced this change <em>as a result</em> of that crisis.</p>",
    `<p class="ptgi-scale">${ptgiScale.map((point) => `<strong>${point.value}</strong> ${escapeHtml(point.label)}`).join(" · ")}</p>`,
    ...ptgiSubscales.flatMap((subscale) => [
      `<p class="exhibit-label">${escapeHtml(subscale.label)}</p>`,
      ...(subscale.note === undefined ? [] : [`<p class="ptgi-note">${escapeHtml(smart(subscale.note))}</p>`]),
      `<ol start="${subscale.items[0]?.n ?? 1}">`,
      ...subscale.items.map((item) => `<li>${escapeHtml(smart(item.text))}</li>`),
      "</ol>",
    ]),
    `<p class="exhibit-label">Reading your score</p>`,
    "<p>Add up all ten ratings for a total out of 50.</p>",
    ...ptgiBands.map((band, index) => {
      const low = index === 0 ? 0 : (ptgiBands[index - 1]?.max ?? 0) + 1;
      return `<p class="ptgi-band"><strong>${low}–${band.max}</strong> ${escapeHtml(smart(band.reading))}</p>`;
    }),
    "</div>",
  ];
  return { typst: typst.join("\n"), html: html.join("\n") };
};

// ── Data figures ────────────────────────────────────────────

const readCapabilityPoint = (value: unknown): CapabilityPoint | undefined => {
  if (!isRecord(value)) return undefined;
  const { year, seconds, label, projected } = value;
  if (typeof year !== "number" || typeof seconds !== "number" || typeof label !== "string") return undefined;
  if (projected !== undefined && typeof projected !== "boolean") return undefined;
  return { year, seconds, label, ...(projected === true ? { projected: true } : {}) };
};

const typstPair = (x: number, y: number): string => `(${round(x)}, ${round(y)})`;

/**
 * The PDF redraws the figure rather than embedding the SVG, so it resolves the
 * same geometry here and hands Typst plain numbers in the same unit space.
 */
const renderCapabilityCurve = (node: MdxJsxFlowElement): RenderedComponent => {
  const points = arrayProp(node, "points", readCapabilityPoint);
  const caption = smart(stringProp(node, "caption"));
  const alt = stringProp(node, "alt");
  if (points.length < 2) failAt(node, "<CapabilityCurve> needs at least two points");

  const chart = buildLineChart(capabilityChartSpec(points));
  const split = chart.firstProjected;
  const measured = split === -1 ? chart.points : chart.points.slice(0, split);
  const projected = split <= 0 ? [] : chart.points.slice(split - 1);
  const key = split === -1 ? "none" : typstString("Dashed: the book’s own projection, not a measurement");

  const typst = [
    "#line-figure(",
    `  eyebrow-text: ${typstString("How long a task AI can finish")},`,
    `  units: (${chart.box.width}.0, ${chart.box.height}.0),`,
    `  grid-lines: ${typstArray(
      chart.yTicks.map(
        (tick) => `(${round(tick.y)}, ${chart.frame.left}, ${chart.frame.right}, ${typstString(tick.label)})`,
      ),
    )},`,
    `  axis: (${chart.frame.bottom}, ${chart.frame.left}, ${chart.frame.right}),`,
    `  xticks: ${typstArray(
      chart.xTicks.map((tick) => `(${round(tick.x)}, ${round(tick.y)}, ${typstString(tick.label)})`),
    )},`,
    `  measured: ${typstArray(measured.map((point) => typstPair(point.x, point.y)))},`,
    `  projected: ${typstArray(projected.map((point) => typstPair(point.x, point.y)))},`,
    `  dots: ${typstArray(
      chart.points.map(
        (point, index) =>
          `(${round(point.x)}, ${round(point.y)}, ${typstString(point.label)}, ${point.projected}, ${typstString(
            valueAnchor(index, chart.points.length),
          )})`,
      ),
    )},`,
    `  key: ${key},`,
    `  caption: ${typstString(caption)},`,
    ")",
  ];

  const html = [
    `<div class="exhibit figure">`,
    `<p class="exhibit-eyebrow">How long a task AI can finish</p>`,
    capabilityFigureSvg({ points, alt }),
    ...(split === -1 ? [] : [`<p class="figure-key">Dashed: the book’s own projection, not a measurement</p>`]),
    `<p class="figure-caption">${escapeHtml(caption)}</p>`,
    "</div>",
  ];
  return { typst: typst.join("\n"), html: html.join("\n") };
};

const readResponder = (value: unknown): AdviceResponder | undefined => {
  if (!isRecord(value)) return undefined;
  const { name, percent, group } = value;
  if (typeof name !== "string" || typeof percent !== "number") return undefined;
  return group === "people" || group === "models" ? { name, percent, group } : undefined;
};

const readAverage = (node: MdxJsxFlowElement): { percent: number; label: string } | undefined => {
  const raw = expressionProp(node, "average");
  if (raw === undefined) return undefined;
  if (!isRecord(raw)) return failAt(node, "<BreakupAdvice> average must be an object");
  const { percent, label } = raw;
  if (typeof percent !== "number" || typeof label !== "string") {
    return failAt(node, "<BreakupAdvice> average needs a percent and a label");
  }
  return { percent, label: smart(label) };
};

const renderBreakupAdvice = (node: MdxJsxFlowElement): RenderedComponent => {
  const responders = arrayProp(node, "responders", readResponder);
  const average = readAverage(node);
  const caption = smart(stringProp(node, "caption"));
  const alt = stringProp(node, "alt");
  if (responders.length === 0) failAt(node, "<BreakupAdvice> needs at least one responder");

  const spec = adviceChartSpec({ responders, ...(average === undefined ? {} : { average }), alt });
  const chart = buildBarChart(spec);
  const eyebrow = "Main advice was “end the relationship”";

  const typst = [
    "#bar-figure(",
    `  eyebrow-text: ${typstString(eyebrow)},`,
    `  units: (${chart.box.width}.0, ${chart.box.height}.0),`,
    `  grid-lines: ${typstArray(
      chart.ticks.map(
        (tick) => `(${round(tick.y)}, ${chart.frame.left}, ${chart.frame.right}, ${typstString(tick.label)})`,
      ),
    )},`,
    `  rules: ${typstArray(
      chart.rules.map(
        (rule) =>
          `(${round(rule.y)}, ${chart.frame.left}, ${chart.frame.right - ruleLabelGutter}, ${typstString(
            rule.label,
          )}, ${chart.frame.right})`,
      ),
    )},`,
    `  axis: (${chart.frame.bottom}, ${chart.frame.left}, ${chart.frame.right}),`,
    `  bars: ${typstArray(
      chart.bars.map(
        (bar) =>
          `(${round(bar.x)}, ${round(bar.y)}, ${round(bar.width)}, ${round(bar.height)}, ${typstString(
            bar.valueLabel,
          )}, ${typstArray(wrapLabel(bar.label).map(typstString))}, ${bar.group !== spec.highlight})`,
      ),
    )},`,
    `  caption: ${typstString(caption)},`,
    ")",
  ];

  const html = [
    `<div class="exhibit figure">`,
    `<p class="exhibit-eyebrow">${escapeHtml(eyebrow)}</p>`,
    adviceFigureSvg({ responders, ...(average === undefined ? {} : { average }), alt }),
    `<p class="figure-caption">${escapeHtml(caption)}</p>`,
    "</div>",
  ];
  return { typst: typst.join("\n"), html: html.join("\n") };
};

// ── Props ───────────────────────────────────────────────────

const attributeValue = (node: MdxJsxFlowElement, name: string): MdxJsxAttribute["value"] => {
  const found = node.attributes.find(
    (attribute): attribute is MdxJsxAttribute => attribute.type === "mdxJsxAttribute" && attribute.name === name,
  );
  return found === undefined ? failAt(node, `<${node.name ?? ""}> is missing ${name}`) : found.value;
};

const stringProp = (node: MdxJsxFlowElement, name: string): string => {
  const value = attributeValue(node, name);
  return typeof value === "string" ? smart(value) : failAt(node, `<${node.name ?? ""}> ${name} must be a string`);
};

/** Reads a `{...}` or `[...]` prop as plain data, without evaluating the expression. */
const expressionProp = (node: MdxJsxFlowElement, name: string): unknown => {
  const value = attributeValue(node, name);
  if (value === null || value === undefined || typeof value === "string") {
    return failAt(node, `<${node.name ?? ""}> ${name} must be an expression`);
  }
  const body = value.data?.estree?.body ?? [];
  const [statement] = body;
  if (body.length !== 1 || statement?.type !== "ExpressionStatement") {
    return failAt(node, `<${node.name ?? ""}> ${name} must be a single expression`);
  }
  return literal(statement.expression, node);
};

const arrayProp = <T>(node: MdxJsxFlowElement, name: string, read: (item: unknown) => T | undefined): readonly T[] => {
  const items = expressionProp(node, name);
  if (!Array.isArray(items)) return failAt(node, `<${node.name ?? ""}> ${name} must be an array`);
  return items.map((item, index) => read(item) ?? failAt(node, `<${node.name ?? ""}> ${name}[${index}] has the wrong shape`));
};

/** Reads a JSON-like JavaScript literal from the syntax tree without evaluating code. */
const literal = (expression: Expression | Pattern, node: MdxJsxFlowElement): unknown => {
  switch (expression.type) {
    case "Literal":
      return typeof expression.value === "string" ||
        typeof expression.value === "number" ||
        typeof expression.value === "boolean" ||
        expression.value === null
        ? expression.value
        : failAt(node, "only string, number, boolean, and null literals are supported");
    case "TemplateLiteral": {
      const cooked = expression.quasis[0]?.value.cooked;
      return expression.expressions.length === 0 && typeof cooked === "string"
        ? cooked
        : failAt(node, "template literals may not contain expressions");
    }
    case "ArrayExpression":
      return expression.elements.map((element) =>
        element === null || element.type === "SpreadElement"
          ? failAt(node, "array holes and spreads are not supported")
          : literal(element, node),
      );
    case "ObjectExpression":
      return Object.fromEntries(
        expression.properties.map((property) => {
          if (property.type !== "Property" || property.computed || property.kind !== "init" || property.method) {
            return failAt(node, "only plain object properties are supported");
          }
          const key =
            property.key.type === "Identifier"
              ? property.key.name
              : property.key.type === "Literal" && typeof property.key.value === "string"
                ? property.key.value
                : failAt(node, "object keys must be names or strings");
          return [key, literal(property.value, node)];
        }),
      );
    default:
      return failAt(node, `${expression.type} is not a literal`);
  }
};

const isRecord = (value: unknown): value is Readonly<Record<string, unknown>> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

// ── Text ────────────────────────────────────────────────────

const smartypants = unified().use(remarkSmartypants);

/** Applies the site's SmartyPants rules to prop strings, which the Markdown pipeline never touches. */
const smart = (value: string): string => {
  const tree: Root = { type: "root", children: [{ type: "paragraph", children: [{ type: "text", value }] }] };
  return toString(smartypants.runSync(tree));
};

const typstString = (value: string): string =>
  `"${value.replaceAll("\\", "\\\\").replaceAll('"', '\\"').replaceAll("\n", "\\n")}"`;

const typstArray = (items: readonly string[]): string => (items.length === 0 ? "()" : `(${items.join(", ")},)`);

const typstInline = (nodes: readonly PhrasingContent[]): string =>
  `${typstArray(
    nodes.map((child) => {
      switch (child.type) {
        case "text":
          return typstString(child.value);
        case "strong":
          return `strong(${typstInline(child.children)})`;
        case "emphasis":
          return `emph(${typstInline(child.children)})`;
        default:
          return failAt(child, `${child.type} is not supported inside a component`);
      }
    }),
  )}.join()`;

const escapeHtml = (value: string): string =>
  value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");

const htmlInline = (nodes: readonly PhrasingContent[]): string =>
  nodes
    .map((child) => {
      switch (child.type) {
        case "text":
          return escapeHtml(child.value);
        case "strong":
          return `<strong>${htmlInline(child.children)}</strong>`;
        case "emphasis":
          return `<em>${htmlInline(child.children)}</em>`;
        default:
          return failAt(child, `${child.type} is not supported inside a component`);
      }
    })
    .join("");
