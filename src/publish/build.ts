#!/usr/bin/env bun
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { parseOutline } from "../md/parseOutline.js";
import { filterOutlineByLevel } from "./filter.js";
import { renderHeadingToHtml, extractTocEntries } from "./render.js";
import { generateHtml } from "./htmlGenerator.js";
import { computeBookProgress } from "./progress.js";
import {
  getLastCommitMetadata,
  getRecentCommits,
  formatLineChanges,
} from "./git.js";

interface BuildOptions {
  mdPath: string;
  outputPath: string;
  maxHeadingLevel: number;
  templatePath: string | undefined;
}

const stripNotes = (content: string): string =>
  content.replace(/<!--\s*notes\s*-->[\s\S]*?<!--\s*\/notes\s*-->/g, "");

const parseBuildOptions = (): BuildOptions => {
  const mdPath = process.env["PUBLISH_MD_PATH"] ?? "book.md";
  const outputPath = process.env["PUBLISH_OUTPUT_PATH"] ?? "dist/index.html";
  const maxHeadingLevel = parseInt(
    process.env["PUBLISH_MAX_HEADING_LEVEL"] ?? "3",
    10,
  );
  const templatePath = process.env["PUBLISH_TEMPLATE"];

  if (isNaN(maxHeadingLevel) || maxHeadingLevel < 1 || maxHeadingLevel > 6) {
    throw new Error(
      "PUBLISH_MAX_HEADING_LEVEL must be between 1 and 6",
    );
  }

  return { mdPath, outputPath, maxHeadingLevel, templatePath };
};

const ensureOutputDirectory = async (outputPath: string): Promise<void> => {
  const dir = dirname(outputPath);
  await mkdir(dir, { recursive: true });
};

const buildSite = async (): Promise<void> => {
  console.log("🚀 Building site...");

  const options = parseBuildOptions();
  console.log(`   Markdown file: ${options.mdPath}`);
  console.log(`   Output: ${options.outputPath}`);
  console.log(`   Max heading level: ${options.maxHeadingLevel}`);

  const rawContent = await readFile(options.mdPath, "utf-8");
  console.log(`   Read ${rawContent.split("\n").length} lines from book`);

  const content = stripNotes(rawContent);
  const outline = parseOutline(content);
  console.log(`   Parsed ${outline.headings.length} top-level headings`);

  const progress = computeBookProgress(outline.headings);
  console.log(
    `   Progress: ${progress.totalWords.toLocaleString()} / ${progress.targetWords.toLocaleString()} words (${progress.percentage}%)`,
  );

  const filteredOutline = filterOutlineByLevel(outline.headings, {
    maxLevel: options.maxHeadingLevel,
  });
  console.log(
    `   Filtered to ${filteredOutline.length} headings (level ≤ ${options.maxHeadingLevel})`,
  );

  const contentHtml = filteredOutline
    .map((heading) => renderHeadingToHtml(heading))
    .join("\n\n");
  console.log(`   Generated HTML content`);

  const tocEntries = filteredOutline.flatMap(extractTocEntries);
  console.log(`   Generated ${tocEntries.length} TOC entries`);

  console.log(`   Extracting git metadata...`);
  const lastCommit = getLastCommitMetadata(options.mdPath);
  const lastUpdatedIso = lastCommit.date.toISOString();
  const lineChanges = formatLineChanges(lastCommit.lineChanges);
  console.log(`   Last updated: ${lastUpdatedIso} (${lineChanges})`);

  const recentCommits = getRecentCommits(options.mdPath, 10);
  console.log(`   Found ${recentCommits.length} recent commits`);

  const html = await generateHtml({
    contentHtml,
    tocEntries,
    lastUpdatedIso,
    lineChanges,
    commits: recentCommits,
    progress,
  });

  await ensureOutputDirectory(options.outputPath);
  await writeFile(options.outputPath, html, "utf-8");
  console.log(`   ✓ Wrote ${options.outputPath}`);

  console.log(`\n✨ Build complete!`);
  console.log(`   File: ${resolve(options.outputPath)}`);
  console.log(`   Size: ${(html.length / 1024).toFixed(2)} KB`);
};

buildSite().catch((error) => {
  console.error("❌ Build failed:", error.message);
  process.exit(1);
});
