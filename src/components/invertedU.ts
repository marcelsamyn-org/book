/**
 * The inverted U in "Post-Traumatic Growth": some adversity leaves people
 * better off than none, and far more leaves them worse off than either.
 *
 * This is a schematic, not a plot. The book cites the shape of the finding,
 * not a table of values, so the figure carries no numeric axis and no
 * gridlines — drawing ticks here would claim a precision the source does not
 * give. The axes are named and directed; nothing on them is measured.
 */

import type { FigureBox, Tick } from "./figures.js";

export const invertedUBox: FigureBox = { width: 640, height: 300, pad: [30, 40, 54, 58] };

/** Height at no adversity: below the peak, above the far end. */
const START = 0.3;
/** Height at the peak. */
const TOP = 0.98;
/** How much lower the "too much" end sits than the "none" end. */
const FALL = 0.14;

const clamp = (t: number): number => Math.min(Math.max(t, 0), 1);

/** A hump skewed left, normalised to 1 at its own mode. */
const hump = (t: number): number => {
  const beta = (x: number) => x ** 1.4 * (1 - x) ** 2.2;
  return beta(t) / beta(1.4 / (1.4 + 2.2));
};

/**
 * Rises from `START` to near `TOP` and falls to `START - FALL`, so the three
 * marked positions rank the way the research does: some beats none, and none
 * beats too much. Returns roughly 0.16 to 0.93, for the drawing layer to scale.
 */
export const invertedU = (t: number): number => {
  const x = clamp(t);
  return START + (TOP - START) * hump(x) - FALL * x;
};

/** Where the curve actually peaks, found by sampling so the mark cannot drift from the shape. */
export const peakAt: number = Array.from({ length: 1001 }, (_, i) => i / 1000).reduce((best, t) =>
  invertedU(t) > invertedU(best) ? t : best,
);

export interface CurveMark extends Tick {
  /** Where the label sits relative to the mark. */
  readonly place: "above" | "below";
}

export const invertedUMarks: readonly CurveMark[] = [
  { value: 0.02, label: "None", place: "below" },
  { value: peakAt, label: "Some", place: "above" },
  { value: 0.98, label: "Too much", place: "below" },
];
