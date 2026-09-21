import { describe, expect, it } from "bun:test";
import { barFigureSvg, ruleLabelGutter, wrapLabel } from "./barFigure.js";
import { adviceChartSpec, adviceFigureSvg, type AdviceResponder } from "./breakupAdvice.js";
import { buildBarChart } from "./figures.js";

/** The responders as the manuscript lists them. */
const responders: readonly AdviceResponder[] = [
  { name: "People on the forum", percent: 42, group: "people" },
  { name: "Gemini 3 Flash", percent: 33, group: "models" },
  { name: "Claude Opus 4.6", percent: 30, group: "models" },
  { name: "Claude Sonnet 4.6", percent: 21, group: "models" },
  { name: "GPT-5", percent: 15, group: "models" },
  { name: "GPT-5 Mini", percent: 5.7, group: "models" },
];

const average = { percent: 20, label: "All models, 20%" };

describe("the break-up advice figure", () => {
  const chart = buildBarChart(adviceChartSpec({ responders, average, alt: "test" }));

  it("draws the people bar tallest, which is the section's finding", () => {
    const people = chart.bars.find((bar) => bar.group === "people");
    const models = chart.bars.filter((bar) => bar.group === "models");
    expect(people).toBeDefined();
    for (const model of models) expect(model.height).toBeLessThan(people!.height);
  });

  it("sets the people bar apart by colour rather than a legend", () => {
    const svg = adviceFigureSvg({ responders, average, alt: "test" });
    const bars = svg.match(/class="figure-bar( figure-bar-muted)?"/g) ?? [];
    expect(bars.filter((bar) => !bar.includes("muted"))).toHaveLength(1);
    expect(bars.filter((bar) => bar.includes("muted"))).toHaveLength(5);
  });

  it("puts the average line between the models it averages", () => {
    const rule = chart.rules.at(0);
    const above = chart.bars.filter((bar) => bar.group === "models" && bar.y < rule!.y);
    const below = chart.bars.filter((bar) => bar.group === "models" && bar.y > rule!.y);
    expect(above.length).toBeGreaterThan(0);
    expect(below.length).toBeGreaterThan(0);
  });

  it("stops the average line short of its own label", () => {
    const svg = adviceFigureSvg({ responders, average, alt: "test" });
    const lineEnd = Number(svg.match(/x2="([\d.]+)" y2="[\d.]+" class="figure-rule"/)?.[1]);
    const labelX = Number(svg.match(/<text x="([\d.]+)"[^>]*class="figure-rule-label"/)?.[1]);
    expect(labelX - lineEnd).toBe(ruleLabelGutter);
  });

  it("omits the average line when the manuscript gives no average", () => {
    const svg = adviceFigureSvg({ responders, alt: "test" });
    expect(svg).not.toContain("figure-rule");
  });

  it("prints each percentage as the manuscript wrote it, decimals included", () => {
    expect(chart.bars.map((bar) => bar.valueLabel)).toEqual(["42%", "33%", "30%", "21%", "15%", "5.7%"]);
  });

  it("escapes label text so the EPUB stays well-formed XML", () => {
    const svg = barFigureSvg({
      alt: "a & b",
      ticks: [{ value: 1, label: "1" }],
      data: [{ key: "k", label: "Tom & Jerry", value: 1, valueLabel: "<1%", group: "g" }],
    });
    expect(svg).toContain("Tom &amp; Jerry");
    expect(svg).toContain("&lt;1%");
    expect(svg).not.toMatch(/&(?!(amp|lt|gt|quot|apos);)/);
  });
});

describe("bar name wrapping", () => {
  it("breaks a long name across lines without splitting words", () => {
    expect(wrapLabel("People on the forum")).toEqual(["People on", "the forum"]);
    expect(wrapLabel("Claude Sonnet 4.6")).toEqual(["Claude", "Sonnet 4.6"]);
  });

  it("leaves a short name on one line", () => {
    expect(wrapLabel("GPT-5")).toEqual(["GPT-5"]);
  });

  it("keeps a word longer than the line rather than cutting it", () => {
    expect(wrapLabel("Supercalifragilistic")).toEqual(["Supercalifragilistic"]);
  });
});
