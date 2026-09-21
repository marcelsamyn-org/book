/**
 * Draws a line figure as SVG. The site component and the EPUB renderer both
 * call this, so the two outputs cannot drift; the PDF redraws the same geometry
 * with Typst primitives. The markup is XHTML-safe — self-closing tags, quoted
 * attributes, an explicit namespace — because epubcheck runs with
 * `--failonwarnings`.
 */

import { buildLineChart, type LineChartSpec, polylinePoints, round } from "./figures.js";

export const GOLD = "#c9a574";
export const NAVY = "#1c2540";

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

const escapeXml = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

export const lineFigureSvg = (spec: LineFigureSpec): string => {
  const chart = buildLineChart(spec);
  const { frame, box } = chart;
  const split = chart.firstProjected;
  const measured = split === -1 ? chart.points : chart.points.slice(0, split);
  // The projected run starts one point early so the two lines join up.
  const projected = split <= 0 ? [] : chart.points.slice(split - 1);

  const parts: string[] = [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${box.width} ${box.height}" class="figure-svg" role="img" aria-label="${escapeXml(spec.alt)}">`,
  ];

  for (const tick of chart.yTicks) {
    parts.push(
      `<line x1="${frame.left}" y1="${round(tick.y)}" x2="${frame.right}" y2="${round(tick.y)}" class="figure-grid" />`,
      `<text x="${frame.left - 8}" y="${round(tick.y) + 3}" class="figure-tick figure-tick-y">${escapeXml(tick.label)}</text>`,
    );
  }

  for (const band of chart.bands) {
    parts.push(
      `<line x1="${frame.left}" y1="${round(band.y)}" x2="${frame.right}" y2="${round(band.y)}" class="figure-band" />`,
      `<text x="${frame.right + 8}" y="${round(band.y) + 3}" class="figure-band-label">${escapeXml(band.label)}</text>`,
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
