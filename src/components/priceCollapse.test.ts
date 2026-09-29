import { describe, expect, it } from "bun:test";
import { priceChartSpec, priceFigureSvg, type PriceRival } from "./priceCollapse.js";
import { buildBarChart } from "./figures.js";

/** The rates as the manuscript states them, used to check the figure they produce. */
const rivals: readonly PriceRival[] = [
  { name: "LLM inference", multiple: 13, group: "ai" },
  { name: "DNA sequencing", multiple: 1.84, group: "other" },
  { name: "Compute", multiple: 1.51, group: "other" },
  { name: "Lithium batteries", multiple: 1.16, group: "other" },
  { name: "Electricity", multiple: 1.05, group: "other" },
];

describe("the price-of-thought figure", () => {
  const chart = buildBarChart(priceChartSpec({ rivals, alt: "test" }));

  it("draws AI in the accent colour and every rival muted, so one bar carries the claim", () => {
    const svg = priceFigureSvg({ rivals, alt: "test" });
    expect(svg.match(/class="figure-bar"/g)).toHaveLength(1);
    expect(svg.match(/class="figure-bar figure-bar-muted"/g)).toHaveLength(4);
  });

  it("keeps every bar inside the plot", () => {
    for (const bar of chart.bars) {
      expect(bar.y).toBeGreaterThanOrEqual(chart.frame.top);
      expect(bar.y).toBeLessThanOrEqual(chart.frame.bottom);
      expect(bar.x).toBeGreaterThanOrEqual(chart.frame.left);
    }
  });

  it("leaves headroom above the tallest bar so the value label is not clipped", () => {
    const tallest = Math.min(...chart.bars.map((bar) => bar.y));
    expect(tallest).toBeGreaterThan(chart.frame.top);
  });

  it("orders the bars as given, so the reader can compare two named systems", () => {
    expect(chart.bars.map((bar) => bar.label)).toEqual(rivals.map((rival) => rival.name));
    // Reading order is left to right, so bar x must rise with the index.
    for (let i = 1; i < chart.bars.length; i += 1) {
      expect(chart.bars[i]!.x).toBeGreaterThan(chart.bars[i - 1]!.x);
    }
  });

  it("labels each bar in multiples per year, the unit the prose quotes", () => {
    expect(chart.bars[0]!.valueLabel).toBe("13x");
    expect(chart.bars[4]!.valueLabel).toBe("1.05x");
  });

  it("refuses a rate that would run off the axis", () => {
    // A silently clipped bar would claim a smaller drop than the prose quotes.
    const tooBig: readonly PriceRival[] = [{ name: "Runaway", multiple: 99, group: "ai" }];
    expect(() => buildBarChart(priceChartSpec({ rivals: tooBig, alt: "test" }))).toThrow(RangeError);
  });

  it("escapes label text so the EPUB stays well-formed XML", () => {
    // Bar names wrap across text elements, so the escaped characters are
    // asserted where they land rather than as one contiguous string.
    const risky: readonly PriceRival[] = [{ name: `AI "inference" & more`, multiple: 13, group: "ai" }];
    const svg = priceFigureSvg({ rivals: risky, alt: "a & b" });
    expect(svg).toContain("&quot;inference&quot;");
    expect(svg).toContain("&amp; more");
    expect(svg).not.toContain(`AI "inference"`);
    expect(svg).toContain('aria-label="a &amp; b"');
    expect(svg).not.toMatch(/&(?!(amp|lt|gt|quot|apos);)/);
  });
});
