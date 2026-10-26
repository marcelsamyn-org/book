import { describe, expect, it } from "bun:test";
import { mkdtemp, rm } from "node:fs/promises";
import { join } from "node:path";

const lastPage = async (body: string): Promise<{ exitCode: number; stdout: string; stderr: string }> => {
  const directory = await mkdtemp(join(process.cwd(), "export/.test-introduction-"));
  try {
    const source = join(directory, "book.typ");
    await Bun.write(source, `#set page(width: 6in, height: 9in)\n${body}`);
    const child = Bun.spawn([
      "typst", "eval", "--root", ".", "--in", source,
      '{ import "/export/introduction.typ": last-page; last-page() }',
    ], { stdout: "pipe", stderr: "pipe" });
    const [exitCode, stdout, stderr] = await Promise.all([
      child.exited, new Response(child.stdout).text(), new Response(child.stderr).text(),
    ]);
    return { exitCode, stdout, stderr };
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
};

describe("introduction teaser page range", () => {
  it("includes front matter and the whole introduction using physical pages", async () => {
    const result = await lastPage([
      "Front matter", "#pagebreak()", "#outline()", "#pagebreak()",
      "#counter(page).update(1)", "= Introduction", "Opening text.",
      "#pagebreak()", "End of the introduction.", "#pagebreak()",
      "= Part 1: The Machine Mind", "Later content.",
    ].join("\n\n"));
    expect(result.exitCode).toBe(0);
    expect(result.stderr).toBe("");
    expect(JSON.parse(result.stdout)).toBe(4);
  });

  it("rejects a manuscript without an Introduction heading", async () => {
    const result = await lastPage("= Part 1: The Machine Mind\n\nLater content.");
    expect(result.exitCode).not.toBe(0);
    expect(result.stderr).toContain("Introduction heading not found");
  });
});
