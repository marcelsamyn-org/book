/**
 * Draws several fitted curves on one pair of scaled axes, as SVG. One series
 * carries the claim and is drawn in full; the rest are drawn thin, the way a
 * published figure shows its supporting outcomes.
 */

import { escapeXml, type FigureBox, polylinePoints, type Point, round, type Tick } from "./figures.js";

export interface CurveSeries {
  readonly key: string;
  readonly label: string;
  /** Evaluated across the x domain, in the y unit. */
  readonly at: (x: number) => number;
  readonly emphasis: boolean;
}

export interface CurveFigureSpec {
  readonly series: readonly CurveSeries[];
  readonly box: FigureBox;
  readonly xTicks: readonly Tick[];
  readonly yTicks: readonly Tick[];
  readonly xMin: number;
  readonly xMax: number;
  readonly xAxis: string;
  readonly yAxis: string;
  readonly alt: string;
  readonly samples?: number;
}

const SAMPLES = 96;

export const curveFigureSvg = (spec: CurveFigureSpec): string => {
  const [top, right, bottom, left] = spec.box.pad;
  const frame = {
    left,
    top,
    right: spec.box.width - right,
    bottom: spec.box.height - bottom,
  };
  const samples = spec.samples ?? SAMPLES;

  const ys = spec.series.flatMap((series) =>
    Array.from({ length: samples }, (_, i) => series.at(spec.xMin + ((spec.xMax - spec.xMin) * i) / (samples - 1))),
  );
  const yMin = Math.min(...ys, ...spec.yTicks.map((tick) => tick.value));
  const yMax = Math.max(...ys, ...spec.yTicks.map((tick) => tick.value));
  if (!(yMax > yMin)) throw new RangeError("the curves and ticks span no range on the y axis");

  const px = (x: number) => frame.left + ((x - spec.xMin) / (spec.xMax - spec.xMin)) * (frame.right - frame.left);
  const py = (y: number) => frame.bottom - ((y - yMin) / (yMax - yMin)) * (frame.bottom - frame.top);
  const path = (series: CurveSeries): readonly Point[] =>
    Array.from({ length: samples }, (_, i) => {
      const x = spec.xMin + ((spec.xMax - spec.xMin) * i) / (samples - 1);
      return { x: px(x), y: py(series.at(x)) };
    });

  const parts: string[] = [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${spec.box.width} ${spec.box.height}" class="figure-svg" role="img" aria-label="${escapeXml(spec.alt)}">`,
  ];

  for (const tick of spec.yTicks) {
    parts.push(
      `<line x1="${frame.left}" y1="${round(py(tick.value))}" x2="${frame.right}" y2="${round(py(tick.value))}" class="figure-grid" />`,
      `<text x="${frame.left - 8}" y="${round(py(tick.value)) + 3}" class="figure-tick figure-tick-y">${escapeXml(tick.label)}</text>`,
    );
  }

  for (const tick of spec.xTicks) {
    parts.push(
      `<line x1="${round(px(tick.value))}" y1="${frame.top}" x2="${round(px(tick.value))}" y2="${frame.bottom}" class="figure-drop" />`,
      `<text x="${round(px(tick.value))}" y="${frame.bottom + 18}" class="figure-tick figure-tick-x">${escapeXml(tick.label)}</text>`,
    );
  }

  parts.push(
    `<line x1="${frame.left}" y1="${frame.bottom}" x2="${frame.right}" y2="${frame.bottom}" class="figure-axis" />`,
  );

  // Supporting curves first, so the emphasised one is never drawn under them.
  for (const series of [...spec.series].sort((a, b) => Number(a.emphasis) - Number(b.emphasis))) {
    const end = path(series).at(-1);
    parts.push(
      `<polyline points="${polylinePoints(path(series))}" class="figure-curve${series.emphasis ? " figure-curve-lead" : ""}" />`,
    );
    if (end !== undefined) {
      parts.push(
        `<text x="${round(end.x) + 8}" y="${round(end.y) + 3}" class="figure-series-label${series.emphasis ? " figure-series-lead" : ""}">${escapeXml(series.label)}</text>`,
      );
    }
  }

  parts.push(
    `<text x="${frame.right}" y="${frame.bottom + 38}" class="figure-axis-name figure-value-end">${escapeXml(spec.xAxis)}</text>`,
    // Anchored at the axis foot: rotating -90 about that point runs the label
    // upward inside the plot. Anchoring at the top would send it off the figure.
    `<text x="${frame.left - 46}" y="${frame.bottom}" class="figure-axis-name" transform="rotate(-90 ${frame.left - 46} ${frame.bottom})">${escapeXml(spec.yAxis)}</text>`,
    "</svg>",
  );
  return parts.join("");
};
