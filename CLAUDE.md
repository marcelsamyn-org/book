# Sacred Struggle — notes for Claude Code

`book.mdx` is the manuscript. The Astro site in `src/` renders it with the author's editorial tooling: a progress tracker, the endgame checklist, and the story line diagram.

## Site

- View the site with `bun run dev:site` (or `bun run build:site` then `bun run preview`). Never open `dist/index.html` directly; asset paths are server-relative and the page renders unstyled.
- `bun test` runs the unit tests. `bun run build:site` is the check that the site still builds.

## Editorial checklist

- `docs/editorial/2026-08-09-status-and-plan.md` is the tracked todo list. The site's progress panel parses its `- [ ]` and `- [x]` lines under `##` headings at build time. The bold lead-in on the checkbox line is the item title, so keep it there.
- Each open item carries *What* (the move), *Why* (the reasoning), and *Your call* (the open question) as indented sub-bullets. The parser ignores sub-bullets. The author writes the book; items hand him a question, they do not dictate prose.
- Locate passages by quotes that can be found with grep, not line numbers. Line numbers drift.

## Story line diagram

The `/storyline` page maps the book's ideas to the exact quotes where each is planted, used, explained, and paid off. Files:

- `src/storyline/threads.ts` is the data: one thread per idea, each mention anchored to a quote from `book.mdx`.
- `src/storyline/resolve.ts` turns quotes into word positions and sections and derives the flags. Tests in `resolve.test.ts`.
- `src/components/StorylineDiagram.astro` draws it; `src/pages/storyline.astro` is the page.
- `docs/editorial/2026-09-09-storyline.md` explains how to read the diagram and what it says about the book's shape. The flagged items are tracked in the status doc under "Story line".

### After the author edits the manuscript

1. Run `bun run storyline:check`. It prints one line per thread with the flags, or the list of anchors that no longer match. The site build fails on the same anchors.
2. Fix each broken anchor in `threads.ts` by copying the passage's new wording. Do not edit the book to match an anchor. If the passage was deleted, delete the mention. If the idea moved, anchor it where it now lives.
3. If the edit added a plant, an explanation, or a payoff (for example, one of the status-doc items), add a mention with that kind. The flags recompute on the next build: a `use` before the `explain` is red, a thread with a `plant` and no `payoff` is owed.
4. Run `bun test src/storyline` and `bun run build:site`, then look at `/storyline` with `bun run dev:site`.

### Writing anchors and threads

- Copy a quote from `book.mdx` exactly, including curly quotes and `*italic*` markers. It must occur once in the comment-stripped book; `%% … %%` blocks are removed before matching.
- Use about 5 to 12 words: long enough to be unique, short enough to survive small edits. Do not span a sentence the author is likely to rework.
- Kinds. `plant`: the idea is hinted, or the sentence explains itself in place. `use`: the sentence relies on the reader already knowing the mechanism. `explain`: the book defines the idea. `payoff`: the question the thread opened is answered. One `explain` and one `payoff` per thread; further mentions after the payoff are callbacks and take the kind `use`.
- A new thread needs a title (the idea), a question (what the reader carries until the payoff), and at least one mention. Add it when the reader has to hold something across chapters; a point made and finished inside one section does not need a row.
- Do not redo the analysis from scratch. Read the storyline doc for the shape and the status doc for the open items, then update what the edit changed.

## Sources and citations

- Cite a source with an Obsidian comment directly after the punctuation that ends the claim: `…by two standard deviations.%%[@bloom1984]%%`. Several sources: `%%[@pentina2023; @skjuve2021]%%`. A page: `%%[@kahneman2011, p. 20]%%`. The site and the storyline anchors strip these comments like any other.
- Every key is an entry in `references.yaml` (CSL YAML, sorted by id). Keys are the first author's family name plus year (`kahneman2010`), or an organization slug when there is no person (`reuters2025sensual`). Take metadata from the DOI (`curl -sL -H "Accept: application/vnd.citationstyles.csl+json" https://doi.org/<doi>`) or the live page, never from memory.
- Research notes can stay in ordinary `%%` blocks. Only `%%[@key]%%` comments reach readers.

## Ebook export

- `bun run book:export` writes `dist-book/sacred-struggle.pdf` and `dist-book/sacred-struggle.epub` in about five seconds. It needs `pandoc`, `typst`, and `epubcheck` (`brew install pandoc typst epubcheck`). It stops on any unexpected warning, including an unknown citation key or an EPUBCheck warning.
- `export/manuscript.ts` prepares `book.mdx` for pandoc: comments are dropped, citation comments become citations, and each component becomes a raw Typst block and a raw XHTML block from `export/components.ts`. A component without a renderer, or JSX inside a paragraph, stops the build with the `book.mdx` line number.
- Citations render with `export/chicago-notes.csl` (Chicago 18, notes and bibliography): footnotes in the PDF, notes at the end of each chapter in the EPUB, and a Sources list in both.
- The PDF design is `export/book-style.typ` (page layout, cover, and the exhibit functions); the EPUB design is `export/epub.css`. Title, subtitle, rights, and edition text are in `export/metadata.yaml`. Fonts are static OFL instances in `export/fonts/`.
- A new component needs a renderer in `export/components.ts` and a matching Typst function in `export/book-style.typ`. Put data or logic that the site component also needs in a module under `src/components/`, as `eliza.ts` and `ptgi.ts` do.
- The version line on the copyright page is the build date plus the git blob hash of `book.mdx`, so a reader's report can be traced to the exact text.
