/**
 * The ARC-AGI-3 figure in "The intelligence curve doesn't seem to be
 * stopping": what each system scored on the same environments, plotted
 * against when it was measured. The manuscript supplies the entries, the
 * caption and the alt, because ARC Prize
 * reports the numbers and this module must not restate them; what lives here
 * is the box, the scales and the human baseline.
 *
 * The x axis is the point. Six equal-width bars say "these were all measured at
 * some point" and hide that the entire climb happened inside five months, so
 * the points are placed where they were actually measured and not joined.
 *
 * The y axis is linear, 0 to 100. A log scale would give the three March
 * launches a little separation from each other and spend it making 62% and
 * 99.95% look like neighbours, which is the one comparison this section turns
 * on. On a linear axis those three sit on the floor together, which is what
 * they scored: under half a percent.
 */

import type { FigureBox, Tick } from "./figures.js";
import { lineFigureSvg } from "./lineFigure.js";

export interface ArcEntry {
  readonly name: string;
  /** When it was measured, as months since March 2026. */
  readonly month: number;
  /** Share of the environments solved, on ARC-AGI-3's own efficiency measure. */
  readonly percent: number;
  /** "ai" for a model, "human" for the baseline they are measured against. */
  readonly group: "ai" | "human";
}

export const arcBox: FigureBox = { width: 640, height: 320, pad: [30, 96, 56, 62] };

export const arcEyebrow = "The same benchmark, half a year apart";

/** Percent, in the quarters a reader reads a score at. */
export const arcYTicks: readonly Tick[] = [
  { value: 0, label: "0%" },
  { value: 25, label: "25%" },
  { value: 50, label: "50%" },
  { value: 75, label: "75%" },
  { value: 100, label: "100%" },
];

/** Keeps Astra's best point from sitting exactly on the human rule at the top. */
export const arcYPad = 0.07;

/** Calendar months, the unit a reader counts the gap in. */
export const arcXTicks: readonly Tick[] = [
  { value: 0, label: "Mar ’26" },
  { value: 3, label: "Jun" },
  { value: 6, label: "Sep ’26" },
];

/**
 * The ceiling every score is read against. The label reads to the right of the
 * axis, where nothing else is drawn; the top point sits in the far corner.
 */
export const arcBaseline = { value: 100, label: "Humans: 100%" } as const;

/** Keeps the first and last points off the plot edges. */
export const arcXPad = 0.06;

export interface ArcFigureSpec {
  readonly entries: readonly ArcEntry[];
  readonly alt: string;
}

export const arcChartSpec = (entries: readonly ArcEntry[]) => {
  // Points measured on the same day stack on one x, so a centred label would
  // overprint its neighbours. The left-hand cluster hangs its labels to the
  // right and the right-hand cluster to the left, which keeps every name
  // readable without moving the dots off the date they belong to.
  const months = entries.map((entry) => entry.month);
  const first = Math.min(...months);
  const last = Math.max(...months);
  return {
    // No line: these are separate runs on a shared axis, not one series.
    connect: false,
    yScale: "linear",
    yTicks: arcYTicks,
    xTicks: arcXTicks,
    rules: [arcBaseline],
    box: arcBox,
    xPad: arcXPad,
    yPad: arcYPad,
    data: entries.map((entry) => ({
      x: entry.month,
      y: entry.percent,
      label: entry.name,
      // Both clusters sit at the plot edges, so each set of names hangs inward
      // from its own dots rather than over them.
      labelSide: entry.month === last ? ("end" as const) : ("start" as const),
    })),
  } as const;
};

export const arcFigureSvg = (spec: ArcFigureSpec): string =>
  lineFigureSvg({ ...arcChartSpec(spec.entries), alt: spec.alt });
