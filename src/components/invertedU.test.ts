import { describe, expect, it } from "bun:test";
import { buildCurve } from "./figures.js";
import {
  invertedU,
  invertedUBox,
  invertedUMarks,
  invertedUTicks,
  invertedUXAxis,
  invertedUYAxis,
  maxEvents,
  meanEvents,
  peakAt,
} from "./invertedU.js";
import { shapeFigureSvg } from "./shapeFigure.js";

const svg = (): string =>
  shapeFigureSvg({
    shape: invertedU,
    marks: invertedUMarks,
    box: invertedUBox,
    xTicks: invertedUTicks,
    xMax: maxEvents,
    xAxis: invertedUXAxis,
    yAxis: invertedUYAxis,
    alt: "test",
  });

describe("the inverted U shape", () => {
  it("ranks the three regions the way the study reports them", () => {
    // Some adversity above none, and none above a great deal.
    expect(invertedU(peakAt)).toBeGreaterThan(invertedU(0));
    expect(invertedU(0)).toBeGreaterThan(invertedU(1));
  });

  it("peaks left of centre, so the best point reads as some rather than a lot", () => {
    expect(peakAt).toBeLessThan(0.5);
    expect(peakAt).toBeGreaterThan(0.2);
  });

  it("marks the peak where the curve actually peaks", () => {
    for (const t of [0, 0.1, 0.25, 0.5, 0.75, 1]) {
      expect(invertedU(t)).toBeLessThanOrEqual(invertedU(peakAt));
    }
  });

  it("never touches the floor, because no adversity is still a life worth rating", () => {
    for (const t of [0, 0.25, 0.5, 0.75, 1]) expect(invertedU(t)).toBeGreaterThan(0.1);
  });

  it("stays in range for values outside the axis", () => {
    expect(invertedU(-1)).toBe(invertedU(0));
    expect(invertedU(2)).toBe(invertedU(1));
  });
});

describe("the inverted U figure", () => {
  it("counts in the unit the study counted in, up to where its sample thins out", () => {
    expect(maxEvents).toBe(20);
    expect(invertedUTicks.at(0)?.label).toBe("0");
    expect(invertedUTicks.at(-1)?.label).toBe("20+");
    expect(svg()).toContain(">20+</text>");
  });

  it("plots no mark, because the sample mean coincides with the drawn peak by accident", () => {
    expect(invertedUMarks).toHaveLength(0);
    expect(Math.abs(meanEvents / maxEvents - peakAt)).toBeLessThan(0.02);
    expect(svg()).not.toContain("figure-drop");
  });

  it("gives the y axis a direction and no scale, since the fitted values are not in hand", () => {
    const drawn = svg();
    expect(drawn).toContain("Life satisfaction →");
    expect(drawn).not.toContain("figure-grid");
    expect(drawn).not.toContain("figure-tick-y");
  });

  it("runs the rotated axis label up from the axis foot, not off the top", () => {
    // Anchoring the rotation at the top of the plot sent the label outside the
    // figure, over the running header, in both the site and the PDF.
    const curve = buildCurve({ shape: invertedU, box: invertedUBox, marks: invertedUMarks });
    expect(svg()).toContain(`transform="rotate(-90 ${curve.frame.left - 14} ${curve.frame.bottom})"`);
  });

  it("keeps every drawn coordinate inside the viewBox", () => {
    const drawn = svg();
    const coords = [...drawn.matchAll(/\s(?:x|y|x1|y1|x2|y2|cx|cy)="(-?[\d.]+)"/g)].map((m) => Number(m[1]));
    expect(coords.length).toBeGreaterThan(10);
    for (const value of coords) {
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(Math.max(invertedUBox.width, invertedUBox.height));
    }
  });
});
