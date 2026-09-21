/**
 * Draws a line figure as SVG. The site component and the EPUB renderer both
 * call this, so the two outputs cannot drift; the PDF redraws the same geometry
 * with Typst primitives. The markup is XHTML-safe — self-closing tags, quoted
 * attributes, an explicit namespace — because epubcheck runs with
 * `--failonwarnings`.
 */

import { buildLineChart, escapeXml, type LineChartSpec, polylinePoints, round } from "./figures.js";

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
  const { measured, projected } = splitProjection(chart.points);

  const parts: string[] = [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${box.width} ${box.height}" class="figure-svg" role="img" aria-label="${escapeXml(spec.alt)}">`,
  ];

  for (const tick of chart.yTicks) {
    parts.push(
      `<line x1="${frame.left}" y1="${round(tick.y)}" x2="${frame.right}" y2="${round(tick.y)}" class="figure-grid" />`,
      `<text x="${frame.left - 8}" y="${round(tick.y) + 3}" class="figure-tick figure-tick-y">${escapeXml(tick.label)}</text>`,
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

  chart.points.forEach((point, index) => {
    parts.push(
      `<circle cx="${round(point.x)}" cy="${round(point.y)}" r="3.5" class="figure-dot${point.projected ? " figure-dot-projected" : ""}" />`,
      `<text x="${round(point.x)}" y="${round(point.y) - 10}" class="figure-value figure-value-${valueAnchor(index, chart.points.length)}">${escapeXml(point.label)}</text>`,
    );
  });

  parts.push("</svg>");
  return parts.join("");
};
