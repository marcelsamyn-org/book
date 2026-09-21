/**
 * Draws a bar figure as SVG, shared by the site and the EPUB the same way
 * `lineFigure.ts` is. Bars carry a group so the figure can set one responder
 * apart from the rest without a legend.
 */

import { buildBarChart, type BarChartSpec, escapeXml, round } from "./figures.js";

/** Room kept clear at the right end of a reference line for its own label. */
export const ruleLabelGutter = 132;

export interface BarFigureSpec extends BarChartSpec {
  /** Describes the figure for readers who do not see it. */
  readonly alt: string;
  /** The group drawn in the accent colour; every other group is drawn muted. */
  readonly highlight?: string;
}

/** Splits a bar label so long names stack instead of overlapping their neighbours. */
export const wrapLabel = (label: string, perLine = 11): readonly string[] => {
  const lines: string[] = [];
  let line = "";
  for (const word of label.split(" ")) {
    if (line === "") line = word;
    else if (`${line} ${word}`.length <= perLine) line = `${line} ${word}`;
    else {
      lines.push(line);
      line = word;
    }
  }
  if (line !== "") lines.push(line);
  return lines;
};

export const barFigureSvg = (spec: BarFigureSpec): string => {
  const chart = buildBarChart(spec);
  const { frame, box } = chart;

  const parts: string[] = [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${box.width} ${box.height}" class="figure-svg" role="img" aria-label="${escapeXml(spec.alt)}">`,
  ];

  for (const tick of chart.ticks) {
    parts.push(
      `<line x1="${frame.left}" y1="${round(tick.y)}" x2="${frame.right}" y2="${round(tick.y)}" class="figure-grid" />`,
      `<text x="${frame.left - 8}" y="${round(tick.y) + 3}" class="figure-tick figure-tick-y">${escapeXml(tick.label)}</text>`,
    );
  }

  for (const rule of chart.rules) {
    parts.push(
      `<line x1="${frame.left}" y1="${round(rule.y)}" x2="${frame.right - ruleLabelGutter}" y2="${round(rule.y)}" class="figure-rule" />`,
      `<text x="${frame.right}" y="${round(rule.y) + 4}" class="figure-rule-label">${escapeXml(rule.label)}</text>`,
    );
  }

  for (const bar of chart.bars) {
    const muted = spec.highlight !== undefined && bar.group !== spec.highlight;
    parts.push(
      `<rect x="${round(bar.x)}" y="${round(bar.y)}" width="${round(bar.width)}" height="${round(bar.height)}" class="figure-bar${muted ? " figure-bar-muted" : ""}" />`,
      `<text x="${round(bar.x + bar.width / 2)}" y="${round(bar.y) - 7}" class="figure-value figure-value-middle">${escapeXml(bar.valueLabel)}</text>`,
    );
    wrapLabel(bar.label).forEach((line, row) => {
      parts.push(
        `<text x="${round(bar.x + bar.width / 2)}" y="${frame.bottom + 16 + row * 12}" class="figure-tick figure-tick-x">${escapeXml(line)}</text>`,
      );
    });
  }

  parts.push(
    `<line x1="${frame.left}" y1="${frame.bottom}" x2="${frame.right}" y2="${frame.bottom}" class="figure-axis" />`,
    "</svg>",
  );
  return parts.join("");
};
