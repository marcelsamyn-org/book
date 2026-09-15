# Book imagery worklist

Status: complete

## Final part plates

- [x] Read each part and select one non-literal subject that carries its central tension.
- [x] Generate one 3:2, print-resolution plate for each part in the approved visual language.
- [x] Inspect each plate at full size and as a small part-opening image.

## Book integration

- [x] Reuse the existing export and site conventions where possible.
- [x] Insert all three part plates in `book.mdx` with short, literal alt text.
- [x] Style the plates consistently in the reading site, PDF, and EPUB.

## Proof and review

- [x] Export the complete PDF and EPUB.
- [x] Inspect all three PDF part openings and representative EPUB markup/assets.
- [x] Run the repository checks that cover the changed files.
- [x] Ask a fresh read-only reviewer to check the final diff and evidence.
- [x] Resolve material findings and record the final result.

## Verification record

- `bun test`: 57 passed, 0 failed.
- `bun run build:site`: passed.
- `bun run book:export`: passed; `epubcheck` reported no warnings or errors.
- PDF pages 9, 36, and 82 and their following pages were inspected at rendered size.
- EPUB media hashes match the three source PNG files, and all three alt descriptions are present.
- The fresh review found one path-traversal gap in `PartPlate`; strict file-name validation and regression cases now cover it.
