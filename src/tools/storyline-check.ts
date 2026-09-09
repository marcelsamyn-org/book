/**
 * Resolves the story line against the manuscript and prints one line per
 * thread plus the flags, or the list of broken anchors. Exits non-zero when
 * anchors are broken, which is the same failure the site build reports.
 *
 * Usage: bun run storyline:check
 */
import { readFile } from "node:fs/promises";
import { resolveStoryline, type ResolvedThread, type Storyline } from "../storyline/resolve.js";
import { threads } from "../storyline/threads.js";
import { stripObsidianComments } from "../utils/stripObsidianComments.js";

const content = stripObsidianComments(await readFile("book.mdx", "utf-8"));

const resolve = (): Storyline | null => {
  try {
    return resolveStoryline(content, threads);
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    return null;
  }
};

const storyline = resolve();
if (!storyline) process.exit(1);

const pct = (position: number): string =>
  `${Math.round((position / storyline.totalWords) * 100)}%`.padStart(4);
const at = (position: number | null): string => (position === null ? "   -" : pct(position));
const flagsOf = (thread: ResolvedThread): string =>
  [thread.owed ? "owed" : null, thread.coldOpen ? "cold" : null]
    .filter((flag): flag is string => flag !== null)
    .join(" ");

console.log("open  expl  pay   span  thread");
for (const thread of storyline.threads) {
  const flags = flagsOf(thread);
  console.log(
    `${pct(thread.start)}  ${at(thread.explainAt)}  ${at(thread.payoffAt)}  ${pct(thread.end - thread.start)}  ${thread.id}${flags ? `  [${flags}]` : ""}`,
  );
}

const early = storyline.threads.flatMap((thread) =>
  thread.mentions.filter((m) => m.early).map((m) => ({ thread, m })),
);
console.log(`\n${early.length} used before explained`);
for (const { thread, m } of early) {
  console.log(`  ${thread.id}: ${m.section.title} — "${m.quote}"`);
}

const owed = storyline.threads.filter((thread) => thread.owed);
console.log(`${owed.length} promised, never paid off${owed.length ? `: ${owed.map((t) => t.id).join(", ")}` : ""}`);
console.log(`${storyline.totalWords.toLocaleString("en-US")} words, ${storyline.threads.length} threads`);
