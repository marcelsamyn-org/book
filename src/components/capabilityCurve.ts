/**
 * The capability figure's data shape, axis ticks, and Typst arguments. Shared
 * by the site component, the EPUB renderer, and the PDF, so all three plot the
 * same points against the same scale.
 */

import type { FigureBox, Tick } from "./figures.js";
import { lineFigureSvg } from "./lineFigure.js";

/**
 * Wider left margin than the default box: the tick labels are words ("12
 * hours"), not numbers, and they must sit on one line.
 */
export const capabilityBox: FigureBox = { width: 640, height: 320, pad: [26, 62, 34, 92] };

/** Keeps the first and last points clear of the axis rule and the top edge. */
export const capabilityYPad = 0.07;

/** Keeps the 2020 and 2026 value labels from overrunning the axis labels. */
export const capabilityXPad = 0.07;

export interface CapabilityPoint {
  readonly year: number;
  /** Task length in seconds. The log axis needs this positive. */
  readonly seconds: number;
  /** How the figure prints the value, e.g. "3 h 23 min". */
  readonly label: string;
  /** True for the book's forward setting rather than a published measurement. */
  readonly projected?: boolean;
}

/** Human-scale rungs, not powers of ten: the reader thinks in minutes and hours. */
export const capabilityYTicks: readonly Tick[] = [
  { value: 10, label: "10 sec" },
  { value: 60, label: "1 min" },
  { value: 600, label: "10 min" },
  { value: 3600, label: "1 hour" },
  { value: 43200, label: "12 hours" },
];

export const capabilityXTicks = (points: readonly CapabilityPoint[]): readonly Tick[] => {
  const years = points.map((point) => point.year);
  const first = Math.min(...years);
  const last = Math.max(...years);
  const ticks: Tick[] = [];
  for (let year = first; year <= last; year += 2) ticks.push({ value: year, label: String(year) });
  if (ticks.at(-1)?.value !== last) ticks.push({ value: last, label: String(last) });
  return ticks;
};

export interface CapabilityFigureSpec {
  readonly points: readonly CapabilityPoint[];
  readonly alt: string;
}

/** The chart spec both the SVG outputs and the PDF's geometry are built from. */
export const capabilityChartSpec = (points: readonly CapabilityPoint[]) =>
  ({
    yScale: "log",
    yTicks: capabilityYTicks,
    xTicks: capabilityXTicks(points),
    box: capabilityBox,
    yPad: capabilityYPad,
    xPad: capabilityXPad,
    data: points.map((point) => ({
      x: point.year,
      y: point.seconds,
      label: point.label,
      projected: point.projected === true,
    })),
  }) as const;

export const capabilityFigureSvg = (spec: CapabilityFigureSpec): string =>
  lineFigureSvg({ ...capabilityChartSpec(spec.points), alt: spec.alt });
