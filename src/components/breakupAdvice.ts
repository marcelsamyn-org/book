/**
 * The break-up advice comparison in "Parroting The Internet": how often each
 * responder's main advice was to end the relationship. The manuscript supplies
 * the responders, the aggregate rule, and the method line, because these are
 * the author's own test rather than a published result.
 */

import { barFigureSvg } from "./barFigure.js";
import type { FigureBox, Tick } from "./figures.js";

export interface AdviceResponder {
  readonly name: string;
  /** Share of cases where ending the relationship was the primary advice. */
  readonly percent: number;
  /** "people" for the forum commenters, "models" for the language models. */
  readonly group: "people" | "models";
}

/** Taller than the line box: bar names wrap to two rows beneath the axis. */
export const adviceBox: FigureBox = { width: 640, height: 330, pad: [26, 30, 58, 52] };

export const adviceEyebrow = "AI does not recommend breaking up as often as real people do";

export const adviceTicks: readonly Tick[] = [
  { value: 0, label: "0%" },
  { value: 25, label: "25%" },
  { value: 50, label: "50%" },
];

export interface AdviceFigureSpec {
  readonly responders: readonly AdviceResponder[];
  /** Drawn as a line across the bars: the pooled figure the prose quotes. */
  readonly average: { readonly percent: number; readonly label: string };
  readonly alt: string;
}

export const adviceChartSpec = (spec: AdviceFigureSpec) =>
  ({
    box: adviceBox,
    ticks: adviceTicks,
    max: 50,
    highlight: "people",
    rules: [{ value: spec.average.percent, label: spec.average.label }],
    data: spec.responders.map((responder) => ({
      key: responder.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      label: responder.name,
      value: responder.percent,
      valueLabel: `${responder.percent}%`,
      group: responder.group,
    })),
  }) as const;

export const adviceFigureSvg = (spec: AdviceFigureSpec): string =>
  barFigureSvg({ ...adviceChartSpec(spec), alt: spec.alt });
