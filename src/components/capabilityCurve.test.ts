import { describe, expect, it } from "bun:test";
import { capabilityChartSpec, capabilityFigureSvg, capabilityXTicks, type CapabilityPoint } from "./capabilityCurve.js";
import { buildLineChart } from "./figures.js";

/** The series as the manuscript states it, used to check the figure it produces. */
const points: readonly CapabilityPoint[] = [
  { year: 2020, seconds: 6, label: "6 sec" },
  { year: 2022, seconds: 36, label: "36 sec" },
  { year: 2023, seconds: 240, label: "4 min" },
  { year: 2024, seconds: 660, label: "11 min" },
  { year: 2025, seconds: 12180, label: "3 h 23 min" },
  { year: 2026, seconds: 43200, label: "12 hours", projected: true },
];

describe("the capability figure", () => {
  const chart = buildLineChart(capabilityChartSpec(points));

  it("keeps every point clear of the plot edges so value labels have room", () => {
    for (const point of chart.points) {
      expect(point.y).toBeLessThan(chart.frame.bottom);
      expect(point.y).toBeGreaterThan(chart.frame.top);
    }
  });

  it("rises without ever falling back", () => {
    const ys = chart.points.map((point) => point.y);
    for (let i = 1; i < ys.length; i += 1) expect(ys[i]!).toBeLessThan(ys[i - 1]!);
  });

  it("draws the projection as a separate dashed run that joins the measured line", () => {
    expect(chart.firstProjected).toBe(5);
    const svg = capabilityFigureSvg({ points, alt: "test" });
    expect(svg).toContain("figure-line-projected");
    expect(svg).toContain("figure-dot-projected");
    // The dashed run repeats the last measured point, or the line would break.
    const dashed = svg.match(/points="([^"]+)" class="figure-line figure-line-projected"/)?.[1];
    expect(dashed?.split(" ")).toHaveLength(2);
  });

  it("omits the projection styling when every point is measured", () => {
    const measuredOnly = points.map(({ projected: _projected, ...rest }) => rest);
    const svg = capabilityFigureSvg({ points: measuredOnly, alt: "test" });
    expect(svg).not.toContain("figure-line-projected");
    expect(svg).not.toContain("figure-dot-projected");
  });

  it("labels the first and last year even when the step would skip them", () => {
    expect(capabilityXTicks(points).at(0)?.label).toBe("2020");
    expect(capabilityXTicks(points).at(-1)?.label).toBe("2026");
    const odd = capabilityXTicks([points[0]!, { year: 2025, seconds: 10, label: "x" }]);
    expect(odd.at(-1)?.label).toBe("2025");
  });

  it("escapes label text so the EPUB stays well-formed XML", () => {
    const svg = capabilityFigureSvg({
      points: [points[0]!, { year: 2026, seconds: 10, label: `3 < 4 & "up"` }],
      alt: "a & b",
    });
    expect(svg).toContain("3 &lt; 4 &amp; &quot;up&quot;");
    expect(svg).toContain('aria-label="a &amp; b"');
    expect(svg).not.toMatch(/&(?!(amp|lt|gt|quot|apos);)/);
  });
});
