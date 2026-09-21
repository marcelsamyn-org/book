import { describe, expect, it } from "bun:test";
import { buildBarChart, buildCurve, buildLineChart, defaultBox, polylinePoints, round } from "./figures.js";

const box = { width: 100, height: 100, pad: [0, 0, 0, 0] as const };

describe("line charts", () => {
  const spec = {
    data: [
      { x: 0, y: 1, label: "1" },
      { x: 1, y: 10, label: "10" },
      { x: 2, y: 100, label: "100" },
    ],
    xTicks: [
      { value: 0, label: "0" },
      { value: 2, label: "2" },
    ],
    yTicks: [
      { value: 1, label: "1" },
      { value: 100, label: "100" },
    ],
    yScale: "log" as const,
    box,
  };

  it("puts a constant multiple at a constant distance on a log axis", () => {
    const chart = buildLineChart(spec);
    const [first, second, third] = chart.points;
    // 1→10 and 10→100 are the same multiple, so they must be the same rise.
    expect(round(first!.y - second!.y)).toBe(round(second!.y - third!.y));
  });

  it("anchors the extremes to the plot edges", () => {
    const chart = buildLineChart(spec);
    expect(chart.points.at(0)?.y).toBe(chart.frame.bottom);
    expect(chart.points.at(-1)?.y).toBe(chart.frame.top);
    expect(chart.points.at(0)?.x).toBe(chart.frame.left);
    expect(chart.points.at(-1)?.x).toBe(chart.frame.right);
  });

  it("bends upward when growth is faster than exponential", () => {
    // Each step multiplies by more than the step before, which is the claim the
    // capability figure makes. On a log axis that must read as a rising slope.
    const chart = buildLineChart({
      ...spec,
      data: [
        { x: 0, y: 1, label: "a" },
        { x: 1, y: 10, label: "b" },
        { x: 2, y: 1000, label: "c" },
      ],
      yTicks: [
        { value: 1, label: "1" },
        { value: 1000, label: "1000" },
      ],
    });
    const [a, b, c] = chart.points;
    expect(b!.y - c!.y).toBeGreaterThan(a!.y - b!.y);
  });

  it("carries the projected flag through to each plotted point", () => {
    expect(buildLineChart(spec).points.every((point) => !point.projected)).toBe(true);
    const mixed = buildLineChart({
      ...spec,
      data: [spec.data[0]!, spec.data[1]!, { ...spec.data[2]!, projected: true }],
    });
    expect(mixed.points.map((point) => point.projected)).toEqual([false, false, true]);
  });

  it("widens the range so a tick above every point stays inside the plot", () => {
    const chart = buildLineChart({
      ...spec,
      yTicks: [
        { value: 1, label: "1" },
        { value: 1000, label: "1000" },
      ],
    });
    expect(chart.yTicks.at(-1)?.y).toBe(chart.frame.top);
    expect(chart.points.at(-1)!.y).toBeGreaterThan(chart.frame.top);
  });

  it("rejects a log axis with a non-positive value", () => {
    expect(() => buildLineChart({ ...spec, data: [{ x: 0, y: 0, label: "zero" }, spec.data[1]!] })).toThrow(RangeError);
  });

  it("rejects a single point", () => {
    expect(() => buildLineChart({ ...spec, data: [spec.data[0]!] })).toThrow(RangeError);
  });
});

describe("bar charts", () => {
  const spec = {
    data: [
      { key: "a", label: "A", value: 0, valueLabel: "0", group: "g" },
      { key: "b", label: "B", value: 50, valueLabel: "50", group: "g" },
      { key: "c", label: "C", value: 100, valueLabel: "100", group: "h" },
    ],
    ticks: [{ value: 100, label: "100" }],
    box,
  };

  it("scales bar height to value, with zero drawn as nothing", () => {
    const chart = buildBarChart(spec);
    expect(chart.bars[0]?.height).toBe(0);
    expect(chart.bars[1]?.height).toBe(50);
    expect(chart.bars[2]?.height).toBe(100);
  });

  it("spaces bars evenly and keeps them inside the plot", () => {
    const chart = buildBarChart(spec);
    const centers = chart.bars.map((bar) => bar.x + bar.width / 2);
    expect(round(centers[1]! - centers[0]!)).toBe(round(centers[2]! - centers[1]!));
    expect(chart.bars[0]!.x).toBeGreaterThanOrEqual(chart.frame.left);
    expect(chart.bars.at(-1)!.x + chart.bars.at(-1)!.width).toBeLessThanOrEqual(chart.frame.right);
  });

  it("keeps the group so the figure can colour bars by responder", () => {
    expect(buildBarChart(spec).bars.map((bar) => bar.group)).toEqual(["g", "g", "h"]);
  });

  it("rejects an empty chart", () => {
    expect(() => buildBarChart({ ...spec, data: [] })).toThrow(RangeError);
  });

  it("rejects a bar that would be drawn outside the axis", () => {
    // A value above a pinned max used to draw above the plot on the site, get
    // clipped in the EPUB, and overprint the eyebrow in the PDF — three
    // different pictures from one manuscript, with no build failure.
    const pinned = { ...spec, max: 100 };
    expect(() =>
      buildBarChart({ ...pinned, data: [{ key: "over", label: "Over", value: 101, valueLabel: "101", group: "g" }] }),
    ).toThrow(RangeError);
    expect(() =>
      buildBarChart({ ...pinned, data: [{ key: "neg", label: "Neg", value: -1, valueLabel: "-1", group: "g" }] }),
    ).toThrow(RangeError);
  });
});

describe("curves", () => {
  it("samples an inverted U that peaks in the middle and falls off on both sides", () => {
    const curve = buildCurve({
      shape: (t) => 4 * t * (1 - t),
      samples: 5,
      box,
      marks: [
        { value: 0, label: "none" },
        { value: 0.5, label: "some" },
        { value: 1, label: "too much" },
      ],
    });
    const ys = curve.path.map((p) => p.y);
    expect(Math.min(...ys)).toBe(curve.frame.top);
    expect(ys.at(0)).toBe(curve.frame.bottom);
    expect(ys.at(-1)).toBe(curve.frame.bottom);
    expect(curve.marks.map((m) => m.label)).toEqual(["none", "some", "too much"]);
    expect(curve.marks[1]?.y).toBe(curve.frame.top);
  });

  it("rejects a curve it cannot draw a segment of", () => {
    expect(() => buildCurve({ shape: () => 0, samples: 1 })).toThrow(RangeError);
  });
});

describe("shared helpers", () => {
  it("emits identical rounded coordinates for every output", () => {
    expect(polylinePoints([{ x: 1.04, y: 2.06 }, { x: 3, y: 4 }])).toBe("1,2.1 3,4");
  });

  it("leaves room for axis labels in the default box", () => {
    const [top, right, bottom, left] = defaultBox.pad;
    expect(left).toBeGreaterThan(0);
    expect(bottom).toBeGreaterThan(0);
    expect(defaultBox.width - left - right).toBeGreaterThan(0);
    expect(defaultBox.height - top - bottom).toBeGreaterThan(0);
  });
});

describe("axis padding", () => {
  const spec = {
    data: [
      { x: 0, y: 1, label: "1" },
      { x: 1, y: 100, label: "100" },
    ],
    xTicks: [{ value: 0, label: "0" }],
    yTicks: [{ value: 1, label: "1" }],
    yScale: "log" as const,
    box,
  };

  it("leaves the extremes on the edges when no padding is asked for", () => {
    const chart = buildLineChart(spec);
    expect(chart.points.at(0)?.y).toBe(chart.frame.bottom);
    expect(chart.points.at(-1)?.y).toBe(chart.frame.top);
  });

  it("pulls the extremes inward by the same amount at both ends", () => {
    const chart = buildLineChart({ ...spec, yPad: 0.1 });
    const below = chart.frame.bottom - chart.points.at(0)!.y;
    const above = chart.points.at(-1)!.y - chart.frame.top;
    expect(below).toBeGreaterThan(0);
    expect(round(below)).toBe(round(above));
  });
});
