/**
 * Builds the editions of book.mdx: a PDF typeset with Typst, the same PDF as a
 * black-and-white print interior, and an EPUB. pandoc writes all of them from
 * the same Markdown and the same bibliography.
 * Run with `bun run book:export`; needs pandoc, typst, and epubcheck on PATH.
 */
import { $ } from "bun";
import { mkdir } from "node:fs/promises";
import { basename } from "node:path";
import sharp from "sharp";
import { EXPORT_IMAGE_DIR } from "./components.js";
import { toPandocMarkdown } from "./manuscript.js";

const OUT_DIR = "dist-book";
const NAME = "sacred-struggle";

/**
 * pandoc Markdown, minus the extensions the manuscript's CommonMark source
 * could trip, plus the line breaks Obsidian shows for single newlines.
 */
const READER = [
  "markdown",
  "-yaml_metadata_block",
  "-pandoc_title_block",
  "-tex_math_dollars",
  "-raw_tex",
  "-latex_macros",
  "-superscript",
  "-subscript",
  "-fancy_lists",
  "-example_lists",
  "-definition_lists",
  "-line_blocks",
  "-implicit_figures",
  "-implicit_header_references",
  "-blank_before_header",
  "-blank_before_blockquote",
  "+lists_without_preceding_blankline",
  "+hard_line_breaks",
].join("");

const isRecord = (value: unknown): value is Readonly<Record<string, unknown>> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/**
 * Chicago 18 prints social media posts in notes but never in the bibliography,
 * and citeproc warns about each one. Any other unprintable entry is an error.
 */
const readSocialPostIds = async (): Promise<ReadonlySet<string>> => {
  const bibliography: unknown = Bun.YAML.parse(await Bun.file("references.yaml").text());
  const entries = isRecord(bibliography) && Array.isArray(bibliography["references"]) ? bibliography["references"] : [];
  return new Set(
    entries.flatMap((entry: unknown) =>
      isRecord(entry) && entry["type"] === "post" && typeof entry["id"] === "string" ? [entry["id"]] : [],
    ),
  );
};

const socialPostIds = await readSocialPostIds();

const isExpectedWarning = (line: string): boolean => {
  const id = /Citeproc: Bibliography entry with no printed form: (\S+)/.exec(line)?.[1];
  return id !== undefined && socialPostIds.has(id);
};

const run = async (command: readonly string[]): Promise<void> => {
  const child = Bun.spawn([...command], { stdout: "pipe", stderr: "pipe" });
  const [exitCode, stdout, stderr] = await Promise.all([
    child.exited,
    new Response(child.stdout).text(),
    new Response(child.stderr).text(),
  ]);
  const warnings = stderr.split("\n").filter((line) => /warning/i.test(line) && !isExpectedWarning(line));
  if (exitCode !== 0 || warnings.length > 0) {
    throw new Error(`${command[0]} failed (exit ${exitCode}):\n${stdout}${stderr}`.trim());
  }
};

interface CoverText {
  readonly title: string;
  readonly subtitle: string;
  readonly author: string;
}

const readCoverText = async (): Promise<CoverText> => {
  const metadata: unknown = Bun.YAML.parse(await Bun.file("export/metadata.yaml").text());
  const field = (name: string): unknown => (isRecord(metadata) ? metadata[name] : undefined);
  const [title, subtitle, author] = [field("title"), field("subtitle"), field("author")];
  if (typeof title !== "string" || typeof subtitle !== "string" || typeof author !== "string") {
    throw new Error("export/metadata.yaml needs a string title, subtitle, and author");
  }
  return { title, subtitle, author };
};

/** Build date plus the git blob hash of book.mdx, so readers can quote the exact text they read. */
const readVersion = async (): Promise<string> => {
  const blob = (await $`git hash-object book.mdx`.text()).trim().slice(0, 7);
  return `${new Date().toISOString().slice(0, 10)} · ${blob}`;
};

/**
 * The source illustrations are lossless PNGs of about 4 MB each. 1600 px covers
 * the 6 in cover at its 267 ppi and the 3.8 in part plates at over 400 ppi.
 * The density writes an Exif header, without which pandoc cannot size the EPUB cover.
 */
const toJpeg = (source: string, target: string): Promise<sharp.OutputInfo> =>
  sharp(source)
    .resize({ width: 1600, withoutEnlargement: true })
    .flatten()
    .withMetadata({ density: 267 })
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(target);

/** The black-and-white print interior gets one-channel copies with no ICC profile, as IngramSpark asks. */
const toGrayJpeg = (source: string, target: string): Promise<sharp.OutputInfo> =>
  sharp(source)
    .resize({ width: 1600, withoutEnlargement: true })
    .flatten()
    .toColourspace("b-w")
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(target);

const compressImages = async (): Promise<void> => {
  const plates = await Array.fromAsync(new Bun.Glob("public/images/book/*.png").scan());
  const sources = ["assets/illustrations/cover/sacred-struggle-cover.png", ...plates];
  const target = (source: string, suffix = ""): string => `${EXPORT_IMAGE_DIR}/${basename(source, ".png")}${suffix}.jpg`;
  await Promise.all([
    ...sources.map((source) => toJpeg(source, target(source))),
    ...plates.map((source) => toGrayJpeg(source, target(source, "-gray"))),
  ]);
};

await mkdir(EXPORT_IMAGE_DIR, { recursive: true });
const [cover, version, manuscript, fonts] = await Promise.all([
  readCoverText(),
  readVersion(),
  Bun.file("book.mdx").text(),
  Array.fromAsync(new Bun.Glob("export/fonts/*.{ttf,otf}").scan()),
  compressImages(),
]);
await Bun.write(`${OUT_DIR}/book.md`, `${toPandocMarkdown(manuscript)}\n\n# Sources\n\n::: {#refs}\n:::\n`);

const typst = ["typst", "compile", "--root", ".", "--font-path", "export/fonts", "--ignore-system-fonts"];
const pandoc = [
  "pandoc",
  `${OUT_DIR}/book.md`,
  "--from",
  READER,
  "--metadata-file",
  "export/metadata.yaml",
  "--metadata",
  `version=${version}`,
  "--citeproc",
  "--bibliography",
  "references.yaml",
  "--csl",
  "export/chicago-notes.csl",
];

await run([
  ...typst,
  "--ppi",
  "267",
  ...["title", "subtitle", "author"].flatMap((key) => ["--input", `${key}=${cover[key as keyof CoverText]}`]),
  "export/cover.typ",
  `${OUT_DIR}/cover.png`,
]);
await toJpeg(`${OUT_DIR}/cover.png`, `${OUT_DIR}/cover.jpg`);

await Promise.all([
  (async () => {
    await run([...pandoc, "--to", "typst", "--template", "export/template.typ", "--output", `${OUT_DIR}/book.typ`]);
    await Promise.all([
      run([...typst, `${OUT_DIR}/book.typ`, `${OUT_DIR}/${NAME}.pdf`]),
      (async () => {
        await run([...typst, "--input", "print=true", `${OUT_DIR}/book.typ`, `${OUT_DIR}/interior-typst.pdf`]);
        // Typst tags every color with an ICC profile, which IngramSpark rejects in a black-and-white
        // interior. Ghostscript rewrites them as plain DeviceGray and keeps the JPEGs as they are.
        await run([
          "gs",
          "-q",
          "-dNOPAUSE",
          "-dBATCH",
          "-dSAFER",
          "-sDEVICE=pdfwrite",
          "-dCompatibilityLevel=1.4",
          "-sColorConversionStrategy=Gray",
          "-dProcessColorModel=/DeviceGray",
          "-dOverrideICC",
          "-dAutoFilterGrayImages=false",
          "-dGrayImageFilter=/FlateEncode",
          "-dDownsampleGrayImages=false",
          `-sOutputFile=${OUT_DIR}/${NAME}-interior.pdf`,
          `${OUT_DIR}/interior-typst.pdf`,
        ]);
      })(),
    ]);
  })(),
  (async () => {
    await run([
      ...pandoc,
      "--to",
      "epub3",
      "--template",
      "export/epub.html",
      "--css",
      "export/epub.css",
      "--epub-cover-image",
      `${OUT_DIR}/cover.jpg`,
      ...fonts.sort().flatMap((font) => ["--epub-embed-font", font]),
      "--split-level",
      "2",
      "--toc",
      "--toc-depth",
      "2",
      "--output",
      `${OUT_DIR}/${NAME}.epub`,
    ]);
    await run(["epubcheck", "--failonwarnings", `${OUT_DIR}/${NAME}.epub`]);
  })(),
]);

console.log(`Wrote ${OUT_DIR}/${NAME}.pdf, ${NAME}-interior.pdf (print, black and white), and ${NAME}.epub, version ${version}`);
