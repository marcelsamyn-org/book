/**
 * The inverted U in "Post-Traumatic Growth", drawn on the scale Seery, Holman
 * and Silver actually measured: the number of adverse events a person counts
 * over a lifetime, against life satisfaction.
 *
 * What the numbers here come from. Their 2010 study followed 2,398 people on a
 * national survey panel between 2001 and 2004. Lifetime adverse events ranged
 * from 0 to 71, averaging 7.69 with a standard deviation of 6.04, and 8.1% of
 * the sample reported none at all. Life satisfaction came out inverse U-shaped:
 * people with some adversity scored higher than people with none and higher
 * than people with a great deal. Past roughly two standard deviations above the
 * mean the sample thins to single digits at any given count, so the axis stops
 * at 20 rather than running to 71.
 *
 * The y axis is direction only. The paper reports predicted values on a
 * standardised scale, and the fitted coefficients are not in the sources
 * available here, so the curve carries the shape and the x scale, not the
 * paper's exact vertex.
 */

import type { FigureBox, Tick } from "./figures.js";
import type { CurveMark } from "./shapeFigure.js";

export const invertedUBox: FigureBox = { width: 640, height: 300, pad: [30, 44, 56, 62] };

/** Adverse events over a lifetime. Two standard deviations above the mean, where the sample thins out. */
export const maxEvents = 20;

/** The sample's average lifetime adverse-event count. */
export const meanEvents = 7.69;

const START = 0.3;
const TOP = 0.98;
const FALL = 0.14;

const clamp = (t: number): number => Math.min(Math.max(t, 0), 1);

/** A hump skewed left, normalised to 1 at its own mode. */
const hump = (t: number): number => {
  const beta = (x: number) => x ** 1.4 * (1 - x) ** 2.2;
  return beta(t) / beta(1.4 / (1.4 + 2.2));
};

/**
 * Rises from `START` to near `TOP` and falls to `START - FALL`, ranking the
 * three regions the way the study reports them: some adversity above none,
 * none above a great deal. Takes a position along the axis, 0 to 1.
 */
export const invertedU = (t: number): number => {
  const x = clamp(t);
  return START + (TOP - START) * hump(x) - FALL * x;
};

/** Where the curve peaks, found by sampling so the mark cannot drift from the shape. */
export const peakAt: number = Array.from({ length: 1001 }, (_, i) => i / 1000).reduce((best, t) =>
  invertedU(t) > invertedU(best) ? t : best,
);

export const invertedUEyebrow = "Life satisfaction against lifetime adversity";
export const invertedUXAxis = "Adverse events over a lifetime →";
export const invertedUYAxis = "Life satisfaction →";

/** Axis ticks in adverse events, the unit the study counted in. */
export const invertedUTicks: readonly Tick[] = [
  { value: 0, label: "0" },
  { value: 5, label: "5" },
  { value: 10, label: "10" },
  { value: 15, label: "15" },
  { value: 20, label: "20+" },
];

/**
 * No marks. The sample mean of 7.69 events lands within a hair of this curve's
 * drawn peak, which is an artifact of the shape, not a finding — plotting it
 * would tell the reader the average person sits at the optimum, and the study
 * does not say that. The axis carries the scale on its own.
 */
export const invertedUMarks: readonly CurveMark[] = [];
