/**
 * Geometry for the book's data figures. One source of truth for three outputs:
 * the site's Astro components and the EPUB renderer both draw SVG from these
 * numbers, and the PDF's Typst functions place the same numbers with their own
 * primitives. Nothing here knows about SVG or Typst — it turns data into
 * positions inside an abstract drawing box.
 *
 * Positions are in viewport units with the origin at the top left, matching
 * SVG. Typst flips nothing: it receives the same y and measures down too.
 */

/** The drawing box every figure is laid out in, before the caller scales it. */
export interface FigureBox {
  readonly width: number;
  readonly height: number;
  /** Space reserved for axis labels, in order: top, right, bottom, left. */
  readonly pad: readonly [number, number, number, number];
}

export const defaultBox: FigureBox = { width: 640, height: 320, pad: [18, 96, 34, 46] };

/** A value and the text that labels it on an axis. */
export interface Tick {
  readonly value: number;
  readonly label: string;
}

export interface Point {
  readonly x: number;
  readonly y: number;
}

/** A plotted point, carrying the label and the flag the figure draws it with. */
export interface PlottedPoint extends Point {
  readonly label: string;
  /** True when the value is the book's own projection rather than a measurement. */
  readonly projected: boolean;
}

export interface PlottedTick extends Point {
  readonly label: string;
}

/** A horizontal band drawn behind the plot to give the scale a human meaning. */
export interface PlottedBand {
  readonly y: number;
  readonly label: string;
}

const inner = (box: FigureBox) => {
  const [top, right, bottom, left] = box.pad;
  return {
    left,
    top,
    right: box.width - right,
    bottom: box.height - bottom,
    width: box.width - left - right,
    height: box.height - top - bottom,
  };
};

/** Maps a value in [min, max] onto [0, 1]. Throws rather than silently clamping. */
const fraction = (value: number, min: number, max: number): number => {
  if (!(max > min)) throw new RangeError(`axis needs max > min, got ${min}..${max}`);
  return (value - min) / (max - min);
};

const log10 = (value: number): number => {
  if (!(value > 0)) throw new RangeError(`a log axis needs positive values, got ${value}`);
  return Math.log10(value);
};

// ── Line charts ─────────────────────────────────────────────

export interface LineDatum {
  readonly x: number;
  readonly y: number;
  readonly label: string;
  readonly projected?: boolean;
}

export interface LineChartSpec {
  readonly data: readonly LineDatum[];
  readonly xTicks: readonly Tick[];
  readonly yTicks: readonly Tick[];
  /** Reference values drawn as bands behind the plot, on the y scale. */
  readonly bands?: readonly Tick[];
  readonly yScale: "linear" | "log";
  readonly box?: FigureBox;
  /**
   * Extra room above and below the data, as a fraction of the y span. Keeps a
   * point's own label off the axis rule when the point sits at the extreme.
   */
  readonly yPad?: number;
  /**
   * Extra room left and right, as a fraction of the x span. Keeps the first and
   * last points away from the edges, where a centred label would overrun them.
   */
  readonly xPad?: number;
}

export interface LineChart {
  readonly box: FigureBox;
  readonly points: readonly PlottedPoint[];
  readonly xTicks: readonly PlottedTick[];
  readonly yTicks: readonly PlottedTick[];
  readonly bands: readonly PlottedBand[];
  /** Plot area edges, for the axis rules. */
  readonly frame: { readonly left: number; readonly top: number; readonly right: number; readonly bottom: number };
  /** Index of the first projected point, or -1 when every point is measured. */
  readonly firstProjected: number;
}

export const buildLineChart = (spec: LineChartSpec): LineChart => {
  const box = spec.box ?? defaultBox;
  const frame = inner(box);
  if (spec.data.length < 2) throw new RangeError("a line chart needs at least two points");

  const toY = spec.yScale === "log" ? log10 : (value: number) => value;
  const xs = spec.data.map((d) => d.x);
  const ys = spec.data.map((d) => toY(d.y));
  const tickYs = spec.yTicks.map((t) => toY(t.value));
  const bandYs = (spec.bands ?? []).map((b) => toY(b.value));

  const rawLeft = Math.min(...xs, ...spec.xTicks.map((t) => t.value));
  const rawRight = Math.max(...xs, ...spec.xTicks.map((t) => t.value));
  const margin = (rawRight - rawLeft) * (spec.xPad ?? 0);
  const xMin = rawLeft - margin;
  const xMax = rawRight + margin;
  const rawMin = Math.min(...ys, ...tickYs, ...bandYs);
  const rawMax = Math.max(...ys, ...tickYs, ...bandYs);
  const room = (rawMax - rawMin) * (spec.yPad ?? 0);
  const yMin = rawMin - room;
  const yMax = rawMax + room;

  const px = (x: number) => frame.left + fraction(x, xMin, xMax) * frame.width;
  const py = (y: number) => frame.bottom - fraction(y, yMin, yMax) * frame.height;

  return {
    box,
    frame: { left: frame.left, top: frame.top, right: frame.right, bottom: frame.bottom },
    points: spec.data.map((d) => ({
      x: px(d.x),
      y: py(toY(d.y)),
      label: d.label,
      projected: d.projected === true,
    })),
    xTicks: spec.xTicks.map((t) => ({ x: px(t.value), y: frame.bottom, label: t.label })),
    yTicks: spec.yTicks.map((t) => ({ x: frame.left, y: py(toY(t.value)), label: t.label })),
    bands: (spec.bands ?? []).map((b) => ({ y: py(toY(b.value)), label: b.label })),
    firstProjected: spec.data.findIndex((d) => d.projected === true),
  };
};

// ── Bar charts ──────────────────────────────────────────────

export interface BarDatum {
  readonly key: string;
  readonly label: string;
  readonly value: number;
  /** Groups bars visually, e.g. "human" against "model". */
  readonly group: string;
}

export interface BarChartSpec {
  readonly data: readonly BarDatum[];
  /** Upper edge of the value axis. Defaults to the largest value, rounded up. */
  readonly max?: number;
  readonly ticks: readonly Tick[];
  readonly box?: FigureBox;
  /** Fraction of each slot the bar fills, 0 to 1. */
  readonly barFill?: number;
}

export interface PlottedBar {
  readonly key: string;
  readonly label: string;
  readonly group: string;
  readonly value: number;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export interface BarChart {
  readonly box: FigureBox;
  readonly bars: readonly PlottedBar[];
  readonly ticks: readonly PlottedTick[];
  readonly frame: { readonly left: number; readonly top: number; readonly right: number; readonly bottom: number };
}

export const buildBarChart = (spec: BarChartSpec): BarChart => {
  const box = spec.box ?? defaultBox;
  const frame = inner(box);
  if (spec.data.length === 0) throw new RangeError("a bar chart needs at least one bar");

  const max = spec.max ?? Math.max(...spec.data.map((d) => d.value), ...spec.ticks.map((t) => t.value));
  const fill = spec.barFill ?? 0.62;
  const slot = frame.width / spec.data.length;
  const width = slot * fill;

  const py = (value: number) => frame.bottom - fraction(value, 0, max) * frame.height;

  return {
    box,
    frame: { left: frame.left, top: frame.top, right: frame.right, bottom: frame.bottom },
    bars: spec.data.map((d, index) => {
      const y = py(d.value);
      return {
        key: d.key,
        label: d.label,
        group: d.group,
        value: d.value,
        x: frame.left + slot * index + (slot - width) / 2,
        y,
        width,
        height: frame.bottom - y,
      };
    }),
    ticks: spec.ticks.map((t) => ({ x: frame.left, y: py(t.value), label: t.label })),
  };
};

// ── Sampled curves ──────────────────────────────────────────

export interface CurveSpec {
  /** Evaluated across [0, 1] and drawn across the full plot width. */
  readonly shape: (t: number) => number;
  readonly samples?: number;
  readonly box?: FigureBox;
  /** Positions along [0, 1] to mark on the curve. */
  readonly marks?: readonly Tick[];
}

export interface Curve {
  readonly box: FigureBox;
  readonly path: readonly Point[];
  readonly marks: readonly PlottedTick[];
  readonly frame: { readonly left: number; readonly top: number; readonly right: number; readonly bottom: number };
}

export const buildCurve = (spec: CurveSpec): Curve => {
  const box = spec.box ?? defaultBox;
  const frame = inner(box);
  const samples = spec.samples ?? 64;
  if (samples < 2) throw new RangeError("a curve needs at least two samples");

  const at = (t: number): Point => ({
    x: frame.left + t * frame.width,
    y: frame.bottom - spec.shape(t) * frame.height,
  });

  return {
    box,
    frame: { left: frame.left, top: frame.top, right: frame.right, bottom: frame.bottom },
    path: Array.from({ length: samples }, (_, i) => at(i / (samples - 1))),
    marks: (spec.marks ?? []).map((mark) => ({ ...at(mark.value), label: mark.label })),
  };
};

// ── Shared drawing helpers ──────────────────────────────────

/** Rounds to one decimal so the three outputs emit identical numbers. */
export const round = (value: number): number => Math.round(value * 10) / 10;

export const polylinePoints = (points: readonly Point[]): string =>
  points.map((p) => `${round(p.x)},${round(p.y)}`).join(" ");
