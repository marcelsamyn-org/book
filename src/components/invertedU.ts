/**
 * The inverted U in "Post-Traumatic Growth", plotted from the fitted model in
 * Seery, Holman and Silver (2010), Table 2 and Figure 1.
 *
 * Their model is a quadratic in cumulative lifetime adversity. Adversity counts
 * were log-transformed and divided by their standard deviation; outcomes were
 * converted to z scores. So each curve is
 *
 *     z(x) = b·x + q·x²
 *
 * with x measured from zero adversity, `b` the simple slope there, and `q` the
 * quadratic term. Both come from Table 2's "At no lifetime adversity" column.
 *
 * Table 2 also reports each outcome's simple slope at "high" adversity, one
 * standard deviation above the mean. The slope of the curve at x is b + 2qx,
 * which fixes where "high" sits on the axis: x = (slopeAtHigh − b) / 2q. All
 * four outcomes put it at 3.36 to within 0.014, which is what `xHigh` checks.
 * "High" is the mean plus one standard deviation, so the mean sits one unit
 * below it.
 *
 * Figure 1 plots exactly this range, from no adversity to high, and notes that
 * observations exist past it but are not displayed because predicted values
 * there rest on progressively fewer of them.
 */

import type { FigureBox } from "./figures.js";

export const invertedUBox: FigureBox = { width: 640, height: 320, pad: [26, 150, 64, 78] };

export interface AdversityOutcome {
  readonly key: string;
  readonly label: string;
  /** Simple slope at zero adversity. Table 2, "At no lifetime adversity". */
  readonly b: number;
  /** The Lifetime Adversity × Lifetime Adversity term. */
  readonly q: number;
  /** Simple slope at high adversity, one SD above the mean. */
  readonly slopeAtHigh: number;
  /** The outcome the book's sentence leads with is the one drawn in full. */
  readonly emphasis?: boolean;
}

export const adversityOutcomes: readonly AdversityOutcome[] = [
  { key: "life-satisfaction", label: "Life satisfaction", b: 0.34, q: -0.1, slopeAtHigh: -0.334, emphasis: true },
  { key: "global-distress", label: "Global distress", b: -0.227, q: 0.101, slopeAtHigh: 0.451 },
  { key: "functional-impairment", label: "Functional impairment", b: -0.358, q: 0.124, slopeAtHigh: 0.476 },
  { key: "pts-symptoms", label: "PTS symptoms", b: -0.352, q: 0.111, slopeAtHigh: 0.396 },
];

/** Reads a curve at a point on the adversity axis, in z scores. */
export const outcomeAt = (outcome: AdversityOutcome, x: number): number => outcome.b * x + outcome.q * x * x;

const impliedHigh = (outcome: AdversityOutcome): number => (outcome.slopeAtHigh - outcome.b) / (2 * outcome.q);

/**
 * Where "high" adversity sits on the axis, averaged over the four outcomes that
 * each imply it. They agree closely; a wide spread would mean a coefficient had
 * been transcribed wrong, so this throws rather than plotting a bad axis.
 */
export const xHigh: number = (() => {
  const implied = adversityOutcomes.map(impliedHigh);
  const spread = Math.max(...implied) - Math.min(...implied);
  if (spread > 0.05) {
    throw new RangeError(`the four outcomes disagree on where high adversity sits: spread ${spread.toFixed(3)}`);
  }
  return implied.reduce((total, value) => total + value, 0) / implied.length;
})();

/** The sample mean, one standard deviation below "high". */
export const xMean: number = xHigh - 1;

/** Where life satisfaction peaks: the vertex of its parabola. */
export const peakAt: number = (() => {
  const best = adversityOutcomes.find((outcome) => outcome.emphasis);
  if (best === undefined) throw new RangeError("no outcome is marked for emphasis");
  return -best.b / (2 * best.q);
})();

export const invertedUEyebrow = "Adversity and well-being over three years";
export const invertedUXAxis = "Cumulative lifetime adversity →";
export const invertedUYAxis = "Standard deviations";

/** Their axis: the transformed adversity scale, not a raw count of events. */
export const invertedUXTicks = [
  { value: 0, label: "None" },
  { value: xMean, label: "Mean" },
  { value: xHigh, label: "High" },
] as const;

export const invertedUYTicks = [
  { value: -0.3, label: "−0.3" },
  { value: 0, label: "0" },
  { value: 0.3, label: "+0.3" },
] as const;
