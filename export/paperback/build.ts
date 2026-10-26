import { mkdir } from "node:fs/promises";
import { isAbsolute, relative, resolve, sep } from "node:path";

const output = "dist-book/paperback";
const config = relative(process.cwd(), resolve(process.argv[2] ?? "export/paperback/config.yaml"));

const run = async (command: readonly string[]): Promise<void> => {
  const child = Bun.spawn([...command], { stdout: "inherit", stderr: "pipe" });
  const [exitCode, stderr] = await Promise.all([child.exited, new Response(child.stderr).text()]);
  if (exitCode !== 0 || /warning/i.test(stderr)) {
    throw new Error(`${command[0]} failed (exit ${exitCode}):\n${stderr}`);
  }
};

if (
  process.argv.length > 3 || isAbsolute(config) || config === ".." || config.startsWith(`..${sep}`) ||
  !config.endsWith(".yaml") || !(await Bun.file(config).exists())
) {
  throw new Error("Usage: bun run cover:proof [path/to/config.yaml]");
}

await mkdir(output, { recursive: true });
const compile = ["typst", "compile", "--root", ".", "--font-path", "export/fonts", "--input", `config=/${config}`];
await run([...compile, "export/paperback/wrap.typ", `${output}/wrap.pdf`]);
await run([...compile, "--input", "guides=true", "export/paperback/wrap.typ", `${output}/wrap-guides.pdf`]);
await run([...compile, "--ppi", "160", "export/paperback/wrap.typ", `${output}/wrap.png`]);
console.log(`Paperback concept: ${output}/wrap.pdf, wrap-guides.pdf, wrap.png`);
console.log("Dimensions and copy are provisional. Match the printer template before production.");
