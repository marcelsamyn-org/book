import { describe, expect, it } from "bun:test";
import { mkdtemp, rm } from "node:fs/promises";
import { join, relative } from "node:path";

const original = await Bun.file("export/paperback/config.yaml").text();

interface RenderResult {
  readonly exitCode: number;
  readonly stderr: string;
  readonly svg: string;
}

const render = async (config: string, panel = "wrap"): Promise<RenderResult> => {
  const directory = await mkdtemp(join(process.cwd(), "export/paperback/.test-"));
  try {
    const configPath = join(directory, "config.yaml");
    const svgPath = join(directory, "wrap.svg");
    await Bun.write(configPath, config);
    const child = Bun.spawn([
      "typst", "compile", "--root", ".", "--font-path", "export/fonts", "--format", "svg",
      "--input", `config=/${relative(process.cwd(), configPath)}`,
      "--input", `panel=${panel}`,
      "export/paperback/wrap.typ", svgPath,
    ], { stdout: "pipe", stderr: "pipe" });
    const [exitCode, stderr] = await Promise.all([child.exited, new Response(child.stderr).text()]);
    return { exitCode, stderr, svg: exitCode === 0 ? await Bun.file(svgPath).text() : "" };
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
};

describe("paperback wrap", () => {
  it("compiles the default design without warnings", async () => {
    const result = await render(original);
    expect(result.exitCode).toBe(0);
    expect(result.stderr).toBe("");
    expect(result.svg).toContain('height="666pt"');
  });

  it("changes the spread width when the printer supplies a wider spine", async () => {
    const result = await render(original.replace("spine-width-mm: 10", "spine-width-mm: 16"));
    expect(result.exitCode).toBe(0);
    const width = result.svg.match(/width="([\d.]+)pt"/)?.[1];
    expect(Number(width)).toBeCloseTo((152.4 * 2 + 16 + 3.175 * 2) * 72 / 25.4, 5);
  });

  it("exports each panel at trim size with the configured spine width", async () => {
    for (const [panel, width] of [["back", 432], ["front", 432], ["spine", 16 * 72 / 25.4]] as const) {
      const result = await render(original.replace("spine-width-mm: 10", "spine-width-mm: 16"), panel);
      expect(result.exitCode).toBe(0);
      expect(result.stderr).toBe("");
      expect(Number(result.svg.match(/width="([\d.]+)pt"/)?.[1])).toBeCloseTo(width, 5);
      expect(result.svg).toContain('height="648pt"');
    }
  });

  it("reflows the design with a different trim and bleed", async () => {
    const result = await render(original
      .replace("trim-width-mm: 152.4", "trim-width-mm: 148")
      .replace("trim-height-mm: 228.6", "trim-height-mm: 210")
      .replace("bleed-mm: 3.175", "bleed-mm: 3"));
    expect(result.exitCode).toBe(0);
    const height = result.svg.match(/height="([\d.]+)pt"/)?.[1];
    expect(Number(height)).toBeCloseTo(216 * 72 / 25.4, 5);
  });

  it("rejects a spine with no safe text area", async () => {
    const result = await render(original.replace("spine-width-mm: 10", "spine-width-mm: 3"));
    expect(result.exitCode).not.toBe(0);
    expect(result.stderr).toContain("leaves no spine text area");
  });

  it("rejects a barcode outside the safe area", async () => {
    const result = await render(original.replace("right-mm: 12.7", "right-mm: 1"));
    expect(result.exitCode).not.toBe(0);
    expect(result.stderr).toContain("barcode must fit inside the back-cover safe area");
  });

  it("rejects copy that would overlap the next region", async () => {
    const result = await render(original.replace("What makes life meaningful when machines can do it all?", "A long headline. ".repeat(70)));
    expect(result.exitCode).not.toBe(0);
    expect(result.stderr).toContain("Cover text overflows its reserved area");
  });
});
