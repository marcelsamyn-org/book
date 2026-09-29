import { describe, expect, it } from "bun:test";
import { arcBaseline, arcChartSpec, arcFigureSvg, arcXTicks, arcYTicks, type ArcEntry } from "./arcagi3.js";
import { buildLineChart, round } from "./figures.js";

/** The scores as the manuscript states them, used to check the figure they produce. */
const entries: readonly ArcEntry[] = [
  { name: "Opus 4.6", month: 0, percent: 0.5, group: "ai" },
  { name: "Gemini 3.1 Pro", month: 0, percent: 0.4, group: "ai" },
  { name: "GPT 5.4", month: 0, percent: 0.2, group: "ai" },
  { name: "Astra, standard harness", month: 6, percent: 62.71, group: "ai" },
  { name: "Astra, provider adapter", month: 6, percent: 99.95, group: "ai" },
];

/** Label y positions per anchor, so a figure's spacing can be checked pairwise. */
const labelRows = (svg: string) => {
  const rows: { anchor: string; y: number }[] = [];
  for (const match of svg.matchAll(
    /<text x="[\d.]+" y="([\d.]+)" class="figure-value figure-value-(start|end|middle)">/g,
  )) {
    rows.push({ anchor: match[2]!, y: Number(match[1]) });
  }
  return rows;
};

describe("the ARC-AGI-3 figure", () => {
  const chart = buildLineChart(arcChartSpec(entries));

  it("puts each measurement at the month it was taken, so the gap is visible", () => {
    // The whole climb happened inside five months. Equal-width bars would have
    // drawn these as neighbours and thrown that away.
    const march = chart.points.find((point) => point.label === "Opus 4.6")!;
    const september = chart.points.find((point) => point.label === "Astra, provider adapter")!;
    expect(september.x - march.x).toBeGreaterThan((chart.frame.right - chart.frame.left) * 0.7);
  });

  it("stacks the three launch scores in one tight cluster, as they were measured", () => {
    const launch = entries.filter((entry) => entry.month === 0);
    expect(launch).toHaveLength(3);
    const xs = chart.points.filter((point) => launch.some((e) => e.name === point.label)).map((p) => p.x);
    expect(Math.max(...xs) - Math.min(...xs)).toBe(0);
  });

  it("draws no line between the points, which are separate runs, not one series", () => {
    expect(arcFigureSvg({ entries, alt: "test" })).not.toContain("<polyline");
  });

  it("draws the human baseline as a reference line the points are read against", () => {
    expect(chart.rules).toHaveLength(1);
    expect(chart.rules[0]!.label).toBe(arcBaseline.label);
    // The baseline must sit above every model point, including Astra's best.
    const best = Math.min(...chart.points.map((point) => point.y));
    expect(chart.rules[0]!.y).toBeLessThanOrEqual(best);
    expect(arcFigureSvg({ entries, alt: "test" })).toContain("figure-rule");
  });

  it("keeps the launch scores on the floor, where a fraction of a percent belongs", () => {
    // On a log axis these three would spread across the lower half, giving them
    // a separation nobody needs while 62% and 99.95% crowd each other at the
    // top. Linear is the honest scale for a score out of 100.
    for (const entry of entries.filter((e) => e.month === 0)) {
      const point = chart.points.find((p) => p.label === entry.name)!;
      expect(point.y).toBeGreaterThan(chart.frame.bottom - 20);
    }
  });

  it("shows the two Astra scores as far apart as they really are", () => {
    const standard = chart.points.find((point) => point.label === "Astra, standard harness")!;
    const adapter = chart.points.find((point) => point.label === "Astra, provider adapter")!;
    // 62.71% against 99.95% is more than a third of the axis. On a log scale
    // this was a few pixels, which is the comparison this section turns on.
    // A higher score plots higher, so it carries the smaller y.
    expect(standard.y - adapter.y).toBeGreaterThan(40);
  });

  it("hangs each label beside its dot so same-day points do not share a column", () => {
    // Every dot in this figure shares its x with at least one other, so a
    // centred label would print the three March names on top of each other.
    expect(arcFigureSvg({ entries, alt: "test" })).not.toContain("figure-value-middle");
  });

  it("never lets two labels print over each other", () => {
    const rows = labelRows(arcFigureSvg({ entries, alt: "test" }));
    const anchors = Array.from(new Set(rows.map((row) => row.anchor)));
    for (const anchor of anchors) {
      const ys = rows.filter((row) => row.anchor === anchor).map((row) => row.y).sort((a, b) => a - b);
      for (let i = 1; i < ys.length; i += 1) {
        // The tick line height is 11px; closer than that and the names touch.
        expect(ys[i]! - ys[i - 1]!).toBeGreaterThan(5);
      }
    }
  });

  it("leaves the dots where they were measured, however far the names move", () => {
    // Repositioning a name must never move a score: the dot is the measurement.
    const svg = arcFigureSvg({ entries, alt: "test" });
    for (const point of chart.points) {
      expect(svg).toContain(`cx="${round(point.x)}" cy="${round(point.y)}"`);
    }
  });

  it("labels the human baseline at the empty end, clear of the highest point", () => {
    const svg = arcFigureSvg({ entries, alt: "test" });
    expect(svg).toContain("figure-rule-label-left");
    // The top point is in the right corner, so a right-anchored label would
    // land on top of it.
    expect(svg).not.toMatch(/text-anchor="end"[^>]*>Humans/);
  });

  it("ticks the x axis in months, the unit a reader counts the gap in", () => {
    expect(arcXTicks.map((tick) => tick.value)).toEqual([0, 3, 6]);
    expect(arcXTicks.at(-1)?.label).toContain("Sep");
  });

  it("ticks the score axis in plain percent, not powers of ten", () => {
    expect(arcYTicks.map((tick) => tick.label)).toEqual(["0%", "25%", "50%", "75%", "100%"]);
  });

  it("spans the whole axis for a score of zero against a score of 100", () => {
    const zero: readonly ArcEntry[] = [
      { name: "Nothing", month: 0, percent: 0, group: "ai" },
      { name: "Everything", month: 6, percent: 100, group: "ai" },
    ];
    const zeroChart = buildLineChart(arcChartSpec(zero));
    const bottom = zeroChart.points.find((p) => p.label === "Nothing")!;
    const top = zeroChart.points.find((p) => p.label === "Everything")!;
    // A log axis had nowhere to put a zero at all. A linear one puts it on the
    // baseline and carries the other end to the ceiling, leaving only the pad
    // that keeps each label clear of the frame.
    const span = zeroChart.frame.bottom - zeroChart.frame.top;
    expect(bottom.y - top.y).toBeGreaterThan(span * 0.85);
  });

  it("escapes label text so the EPUB stays well-formed XML", () => {
    const risky: readonly ArcEntry[] = [
      { name: `GPT-6 "Astra" & co`, month: 0, percent: 1, group: "ai" },
      { name: "Later", month: 6, percent: 50, group: "ai" },
    ];
    const svg = arcFigureSvg({ entries: risky, alt: "a & b" });
    expect(svg).toContain("&quot;Astra&quot; &amp;");
    expect(svg).toContain('aria-label="a &amp; b"');
    expect(svg).not.toMatch(/&(?!(amp|lt|gt|quot|apos);)/);
  });
});
