/**
 * The price-of-thought figure in "The intelligence curve doesn't seem to be
 * stopping": how much cheaper a fixed level of AI performance gets in a year,
 * against the fastest fall ever measured for any other technology. The
 * manuscript supplies the rates, the caption and the alt, because the
 * comparison and its sources belong in the sentence beside the figure; this
 * module owns only the box, the ticks and the key sentence.
 *
 * The rates are multiples per year, not percentages: 13x a year is the number
 * the prose quotes, and a bar of 13 next to bars of 1.05 to 1.84 is the whole
 * argument. A linear axis is the honest scale here — on a log axis the
 * technologies that barely moved would look as dramatic as the one that did.
 */

import { barFigureSvg } from "./barFigure.js";
import type { FigureBox, Tick } from "./figures.js";

export interface PriceRival {
  readonly name: string;
  /** How many times cheaper one unit gets in a year, e.g. 13 for AI inference. */
  readonly multiple: number;
  /** "ai" for LLM inference, "other" for the technologies it is compared to. */
  readonly group: "ai" | "other";
}

/** Taller than the line box: the rival names wrap to two rows beneath the axis. */
export const priceBox: FigureBox = { width: 640, height: 330, pad: [26, 30, 58, 52] };

export const priceEyebrow = "No technology has ever gotten this cheap this fast";

/** In multiples per year, so the axis reads the same unit the prose quotes. */
export const priceTicks: readonly Tick[] = [
  { value: 0, label: "0x" },
  { value: 5, label: "5x" },
  { value: 10, label: "10x" },
  { value: 15, label: "15x" },
];

export interface PriceFigureSpec {
  readonly rivals: readonly PriceRival[];
  readonly alt: string;
}

export const priceChartSpec = (spec: PriceFigureSpec) =>
  ({
    box: priceBox,
    ticks: priceTicks,
    max: 15,
    highlight: "ai",
    data: spec.rivals.map((rival) => ({
      key: rival.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      label: rival.name,
      value: rival.multiple,
      valueLabel: `${rival.multiple}x`,
      group: rival.group,
    })),
  }) as const;

export const priceFigureSvg = (spec: PriceFigureSpec): string =>
  barFigureSvg({ ...priceChartSpec(spec), alt: spec.alt });
