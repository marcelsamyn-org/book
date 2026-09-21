/**
 * Draws a schematic curve as SVG: a shape with named, directed axes and marked
 * positions, but no scale. Used where the book cites the shape of a finding
 * rather than its numbers, so the figure must not look like plotted data.
 */

import { buildCurve, type FigureBox, polylinePoints, round } from "./figures.js";
import type { CurveMark } from "./invertedU.js";
import { valueAnchor } from "./lineFigure.js";

export interface ShapeFigureSpec {
  readonly shape: (t: number) => number;
  readonly marks: readonly CurveMark[];
  readonly box: FigureBox;
  /** Axis names, written with the direction the reader should read them in. */
  readonly xAxis: string;
  readonly yAxis: string;
  readonly alt: string;
}

const escapeXml = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

export const shapeFigureSvg = (spec: ShapeFigureSpec): string => {
  const curve = buildCurve({ shape: spec.shape, box: spec.box, marks: spec.marks, samples: 96 });
  const { frame, box } = curve;

  const parts: string[] = [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${box.width} ${box.height}" class="figure-svg" role="img" aria-label="${escapeXml(spec.alt)}">`,
    `<line x1="${frame.left}" y1="${frame.bottom}" x2="${frame.right}" y2="${frame.bottom}" class="figure-axis" />`,
    `<line x1="${frame.left}" y1="${frame.bottom}" x2="${frame.left}" y2="${frame.top}" class="figure-axis" />`,
    `<polyline points="${polylinePoints(curve.path)}" class="figure-line" />`,
  ];

  spec.marks.forEach((mark, index) => {
    const point = curve.marks[index];
    if (point === undefined) return;
    const below = mark.place === "below";
    parts.push(
      `<line x1="${round(point.x)}" y1="${round(point.y)}" x2="${round(point.x)}" y2="${frame.bottom}" class="figure-drop" />`,
      `<circle cx="${round(point.x)}" cy="${round(point.y)}" r="3.5" class="figure-dot" />`,
      `<text x="${round(point.x)}" y="${below ? round(point.y) + 20 : round(point.y) - 12}" class="figure-value figure-value-${valueAnchor(index, spec.marks.length)}">${escapeXml(mark.label)}</text>`,
    );
  });

  parts.push(
    `<text x="${frame.right}" y="${frame.bottom + 26}" class="figure-axis-name figure-value-end">${escapeXml(spec.xAxis)}</text>`,
    // Anchored at the axis foot: rotating -90 about that point runs the label
    // upward inside the plot. Anchoring at the top would send it off the figure.
    `<text x="${frame.left - 14}" y="${frame.bottom}" class="figure-axis-name" transform="rotate(-90 ${frame.left - 14} ${frame.bottom})">${escapeXml(spec.yAxis)}</text>`,
    "</svg>",
  );
  return parts.join("");
};
