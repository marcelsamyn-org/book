#!/usr/bin/env bun
import { watch } from "node:fs";
import { resolve, dirname } from "node:path";
import { spawn, type Subprocess } from "bun";

const DIST_DIR = "dist";
const WATCH_PATHS = [
  "src/publish/templates/template.html",
  "src/publish",
  "book.org",
];

const runBuild = async (): Promise<boolean> => {
  const proc = spawn(["bun", "run", "src/publish/build.ts"], {
    stdout: "inherit",
    stderr: "inherit",
  });
  const exitCode = await proc.exited;
  return exitCode === 0;
};

const startServer = (): Subprocess => {
  console.log("\n🌐 Starting server on http://localhost:3000\n");
  return spawn(["bunx", "serve", DIST_DIR, "-l", "3000"], {
    stdout: "inherit",
    stderr: "inherit",
  });
};

const startTailwind = (): Subprocess => {
  console.log("🎨 Starting Tailwind CSS watcher...\n");
  return spawn(
    [
      "bunx",
      "tailwindcss",
      "-i",
      "./src/publish/templates/input.css",
      "-o",
      "./dist/styles.css",
      "--watch",
    ],
    {
      stdout: "inherit",
      stderr: "inherit",
    },
  );
};

const debounce = <T extends (...args: unknown[]) => void>(
  fn: T,
  ms: number,
): ((...args: Parameters<T>) => void) => {
  let timeout: Timer | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), ms);
  };
};

const main = async (): Promise<void> => {
  console.log("🔧 Dev server starting...\n");

  const success = await runBuild();
  if (!success) {
    console.error("❌ Initial build failed");
    process.exit(1);
  }

  const server = startServer();
  const tailwind = startTailwind();

  const rebuild = debounce(async () => {
    console.log("\n♻️  Rebuilding...\n");
    await runBuild();
    console.log("\n✅ Ready - refresh your browser\n");
  }, 100);

  const watchers = WATCH_PATHS.map((watchPath) => {
    const resolved = resolve(watchPath);
    console.log(`👁️  Watching: ${watchPath}`);
    return watch(resolved, { recursive: true }, (_event, filename) => {
      if (filename?.endsWith(".ts") || filename?.endsWith(".html") || filename?.endsWith(".org") || !filename) {
        rebuild();
      }
    });
  });

  console.log("\nPress Ctrl+C to stop\n");

  process.on("SIGINT", () => {
    console.log("\n\n👋 Shutting down...");
    watchers.forEach((w) => w.close());
    server.kill();
    tailwind.kill();
    process.exit(0);
  });

  await new Promise(() => {});
};

main();
