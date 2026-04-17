import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import tailwindcss from "@tailwindcss/vite";
import type { Plugin } from "vite";
import { stripObsidianComments } from "./src/utils/stripObsidianComments.js";

const obsidianCommentsPlugin = (): Plugin => ({
  name: "strip-obsidian-comments",
  enforce: "pre",
  transform(code, id) {
    if (!id.endsWith(".mdx") && !id.endsWith(".md")) return null;
    return { code: stripObsidianComments(code), map: null };
  },
});

export default defineConfig({
  integrations: [mdx()],
  vite: {
    plugins: [obsidianCommentsPlugin(), tailwindcss()],
  },
  outDir: "dist",
});