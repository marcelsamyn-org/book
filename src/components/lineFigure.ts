/**
 * Draws a line figure as SVG. The site component and the EPUB renderer both
 * call this, so the two outputs cannot drift; the PDF redraws the same geometry
 * with Typst primitives. The markup is XHTML-safe — self-closing tags, quoted
 * attributes, an explicit namespace — because epubcheck runs with
 * `--failonwarnings`.
 */

import { buildLineChart, escapeXml, type LineChartSpec, type Point, polylinePoints, round } from "./figures.js";

/** Read by the site, the EPUB and the PDF, so the sentence cannot drift between them. */
export const PROJECTION_KEY = "Dashed: the book’s own projection, not a measurement";

export interface LineFigureSpec extends LineChartSpec {
  /** Describes the figure for readers who do not see it. */
  readonly alt: string;
}

export type ValueAnchor = "start" | "middle" | "end";

/**
 * The end points sit closest to the axis labels on one side and the plot edge
 * on the other, so their labels hang inward instead of straddling the point.
 */
export const valueAnchor = (index: number, count: number): ValueAnchor =>
  index === 0 ? "start" : index === count - 1 ? "end" : "middle";

/**
 * Splits the points into the solid measured run and the dashed projected one.
 * Projections have to be a trailing run: a projected point followed by a
 * measured one would draw measured data under the projection key.
 */
export const splitProjection = <T extends { readonly projected: boolean }>(points: readonly T[]) => {
  const first = points.findIndex((point) => point.projected);
  if (first === -1) return { measured: points, projected: [] as readonly T[] };
  const strays = points.slice(first).filter((point) => !point.projected);
  if (strays.length > 0) {
    throw new RangeError("projected points must be the last run: a measured point follows a projected one");
  }
  // The dashed run repeats the last measured point so the two lines join up.
  return { measured: points.slice(0, first), projected: points.slice(Math.max(first - 1, 0)) };
};

export const lineFigureSvg = (spec: LineFigureSpec): string => {
  const chart = buildLineChart(spec);
  const { frame, box } = chart;
  // A figure that plots separate measurements shares no series, so the line
  // between them is dropped rather than drawn as a trend.
  const { measured, projected } =
    spec.connect === false
      ? { measured: [] as readonly Point[], projected: [] as readonly Point[] }
      : splitProjection(chart.points);

  const parts: string[] = [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${box.width} ${box.height}" class="figure-svg" role="img" aria-label="${escapeXml(spec.alt)}">`,
  ];

  for (const tick of chart.yTicks) {
    parts.push(
      `<line x1="${frame.left}" y1="${round(tick.y)}" x2="${frame.right}" y2="${round(tick.y)}" class="figure-grid" />`,
      `<text x="${frame.left - 8}" y="${round(tick.y) + 3}" class="figure-tick figure-tick-y">${escapeXml(tick.label)}</text>`,
    );
  }

  for (const rule of chart.rules) {
    // The label sits at the left end, just above the line: the right end is
    // where the highest point lands, and a label there would sit on top of it.
    parts.push(
      `<line x1="${frame.left}" y1="${round(rule.y)}" x2="${frame.right}" y2="${round(rule.y)}" class="figure-rule" />`,
      `<text x="${frame.left + 6}" y="${round(rule.y) - 5}" class="figure-rule-label figure-rule-label-left">${escapeXml(rule.label)}</text>`,
    );
  }

  parts.push(
    `<line x1="${frame.left}" y1="${frame.bottom}" x2="${frame.right}" y2="${frame.bottom}" class="figure-axis" />`,
  );

  for (const tick of chart.xTicks) {
    parts.push(
      `<text x="${round(tick.x)}" y="${frame.bottom + 18}" class="figure-tick figure-tick-x">${escapeXml(tick.label)}</text>`,
    );
  }

  if (measured.length > 1) {
    parts.push(`<polyline points="${polylinePoints(measured)}" class="figure-line" />`);
  }
  if (projected.length > 1) {
    parts.push(`<polyline points="${polylinePoints(projected)}" class="figure-line figure-line-projected" />`);
  }

  // Points measured on the same date stack on one x, so their names can
  // overprint. A label is only moved when it would actually collide with one
  // already placed, and then just far enough to clear it: two points far apart
  // keep their names level with their own dots, so the distance between them
  // still reads as the distance between the scores. The dots never move — a
  // score is the measurement, and only the name is repositioned.
  const rowHeight = 12;
  const placed: Record<string, number[]> = {};
  chart.points.forEach((point, index) => {
    const side = point.labelSide;
    const anchor = side ?? valueAnchor(index, chart.points.length);
    const wanted = side === undefined || side === "above" ? point.y - 10 : point.y + 3;
    const earlier = placed[anchor] ?? [];
    // A label moves only if it would land on one already placed. It commits to
    // one direction — down unless the clash is below it — and keeps stepping
    // that way, so two neighbours can never send it back and forth.
    let y = wanted;
    for (let pass = 0; pass < earlier.length; pass += 1) {
      const clash = earlier.filter((other) => Math.abs(other - y) < rowHeight);
      if (clash.length === 0) break;
      const nearest = clash.reduce((best, other) => (Math.abs(other - y) < Math.abs(best - y) ? other : best), clash[0]!);
      y = nearest + (nearest >= wanted ? rowHeight : -rowHeight);
    }
    (placed[anchor] ??= []).push(y);
    parts.push(
      `<circle cx="${round(point.x)}" cy="${round(point.y)}" r="3.5" class="figure-dot${point.projected ? " figure-dot-projected" : ""}" />`,
      `<text x="${round(point.x)}" y="${round(y)}" class="figure-value figure-value-${anchor}">${escapeXml(point.label)}</text>`,
    );
  });

  parts.push("</svg>");
  return parts.join("");
};
