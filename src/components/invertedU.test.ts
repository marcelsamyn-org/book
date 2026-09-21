import { describe, expect, it } from "bun:test";
import {
  adversityOutcomes,
  invertedUBox,
  invertedUXAxis,
  invertedUXTicks,
  invertedUYAxis,
  invertedUYTicks,
  outcomeAt,
  peakAt,
  xHigh,
  xMean,
} from "./invertedU.js";
import { curveFigureSvg } from "./shapeFigure.js";

const lead = adversityOutcomes.find((outcome) => outcome.emphasis)!;

const svg = (): string =>
  curveFigureSvg({
    series: adversityOutcomes.map((outcome) => ({
      key: outcome.key,
      label: outcome.label,
      at: (x: number) => outcomeAt(outcome, x),
      emphasis: outcome.emphasis === true,
    })),
    box: invertedUBox,
    xTicks: [...invertedUXTicks],
    yTicks: [...invertedUYTicks],
    xMin: 0,
    xMax: xHigh,
    xAxis: invertedUXAxis,
    yAxis: invertedUYAxis,
    alt: "test",
  });

describe("the fitted model, against Seery, Holman & Silver (2010) Table 2", () => {
  it("reproduces each outcome's reported slope at high adversity", () => {
    // Table 2 gives the simple slope at M + 1 SD. The curve's slope at x is
    // b + 2qx, so plotting the right axis means reproducing that number.
    for (const outcome of adversityOutcomes) {
      expect(outcome.b + 2 * outcome.q * xHigh).toBeCloseTo(outcome.slopeAtHigh, 2);
    }
  });

  it("puts every curve at zero where there is no adversity, the model's reference point", () => {
    for (const outcome of adversityOutcomes) expect(outcomeAt(outcome, 0)).toBe(0);
  });

  it("curves life satisfaction the opposite way from the three symptom measures", () => {
    // Life satisfaction is the positively valenced outcome, so it is the
    // inverse U while distress, impairment and PTS symptoms are U-shaped.
    expect(lead.q).toBeLessThan(0);
    for (const outcome of adversityOutcomes.filter((one) => one !== lead)) {
      expect(outcome.q).toBeGreaterThan(0);
    }
  });

  it("peaks where the paper's coefficients put the vertex", () => {
    expect(peakAt).toBeCloseTo(1.7, 2);
    expect(outcomeAt(lead, peakAt)).toBeCloseTo(0.289, 3);
  });

  it("falls back to where it started by the time adversity is high", () => {
    expect(outcomeAt(lead, xHigh)).toBeCloseTo(0.012, 2);
    expect(outcomeAt(lead, xHigh)).toBeLessThan(outcomeAt(lead, peakAt));
  });

  it("peaks below the sample mean, so the average person is past the best point", () => {
    expect(peakAt).toBeLessThan(xMean);
    expect(outcomeAt(lead, xMean)).toBeLessThan(outcomeAt(lead, peakAt));
  });

  it("places the mean one standard deviation below high, as the paper defines it", () => {
    expect(xHigh - xMean).toBe(1);
    expect(xHigh).toBeCloseTo(3.365, 2);
  });
});

describe("the figure", () => {
  it("labels both axes in the paper's own units", () => {
    const drawn = svg();
    expect(drawn).toContain("Standard deviations");
    expect(drawn).toContain(">None</text>");
    expect(drawn).toContain(">Mean</text>");
    expect(drawn).toContain(">High</text>");
  });

  it("draws the outcome the book's sentence leads with in full, and the rest thin", () => {
    const drawn = svg();
    expect((drawn.match(/class="figure-curve"/g) ?? []).length).toBe(3);
    expect((drawn.match(/class="figure-curve figure-curve-lead"/g) ?? []).length).toBe(1);
    expect(drawn).toContain("figure-series-lead");
  });

  it("draws the leading curve last so the thin ones never cover it", () => {
    const drawn = svg();
    expect(drawn.indexOf("figure-curve-lead")).toBeGreaterThan(drawn.indexOf('class="figure-curve"'));
  });

  it("names every outcome the book's sentence names", () => {
    const drawn = svg();
    for (const outcome of adversityOutcomes) expect(drawn).toContain(outcome.label);
  });

  it("keeps every drawn coordinate inside the viewBox", () => {
    const coords = [...svg().matchAll(/\s(?:x|y|x1|y1|x2|y2|cx|cy)="(-?[\d.]+)"/g)].map((m) => Number(m[1]));
    expect(coords.length).toBeGreaterThan(10);
    for (const value of coords) {
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(Math.max(invertedUBox.width, invertedUBox.height));
    }
  });
});
