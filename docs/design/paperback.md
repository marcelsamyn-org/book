# Sacred Struggle paperback wrap

Status: design concept. The author chose a paperback wrap. The back-cover wording, dimensions, and barcode space are provisional.

## Build and review

Run `bun run cover:proof` from the repository root. It needs the same `typst` installation and bundled fonts as `bun run book:export`. It does not rebuild or overwrite an edition's PDF, EPUB, or interior.

The command writes:

- `dist-book/paperback/wrap.pdf`: one flat spread, ordered back, spine, front, with outer bleed.
- `dist-book/paperback/wrap-guides.pdf`: the spread with an outer proof margin, trim lines, fold lines, and safe areas. This is a review file.
- `dist-book/paperback/wrap.png`: a preview of the clean spread at 160 ppi. Use the PDF for full-resolution inspection.
- `dist-book/paperback/back.png`, `spine.png`, and `front.png`: separate panels with artwork and text at 300 ppi. Each uses its configured trim size, without outer bleed or guides. They use the same layout as the wrap, so dimension and copy changes also update the images.

Open both PDFs after each layout or copy change. Check the back at physical size, read the spine, and inspect the barcode area. Text and fonts remain embedded in the PDF. A successful build proves that the configured text areas fit; it does not prove that a printer will accept the file.

## Change dimensions in one place

Edit `export/paperback/config.yaml`. All dimensions are in millimetres. The initial trim is 152.4 × 228.6 mm (6 × 9 inches), matching the current interior. The **10 mm spine is a visual assumption**, not a calculation from the current 172 pages. Paper stock and binding determine the final width.

| Field | Meaning |
| --- | --- |
| `trim-width-mm`, `trim-height-mm` | Finished size of one cover panel. |
| `spine-width-mm` | Distance between the two fold lines. |
| `bleed-mm` | Extra artwork outside the four outer trim edges. |
| `safe-inset-mm` | Minimum panel text distance from trim and folds, shown on the guided proof. |
| `spine-safe-inset-mm` | Text clearance from each spine fold. Spine type reduces as the usable width narrows. |
| `back-text-inset-mm` | Left and right margin of the back copy. |
| `barcode.width-mm`, `barcode.height-mm` | White area reserved for barcode artwork. |
| `barcode.right-mm`, `barcode.bottom-mm` | Barcode offset from the back panel's right and bottom trim edges. |

Spread width is `2 × trim width + spine width + 2 × bleed`. Spread height is `trim height + 2 × bleed`. The front panel, spine text, fold guides, and outer edge move from these values. Copy positions use fractions of panel height; type sizes scale from panel width. The layout is for a paperback; a hardback case or jacket needs a separate template.

For a temporary comparison, copy the YAML to another file inside the repository and pass it as the command's only argument:

```sh
bun run cover:proof export/paperback/config-comparison.yaml
```

The output names stay the same, so the last successful build is the current proof. Rebuild with the standard config afterwards. The compiler rejects invalid geometry and copy that exceeds its allocated area. If a much smaller trim fails, adjust the layout deliberately rather than reducing every font until it fits.

## Copy and artwork

`export/metadata.yaml` remains the source for title, subtitle, author, publisher, and website. The back headline, paragraphs, and closing sentence live under `back` in the cover config. They are proposed sales copy, independent from `book.mdx`.

`export/paperback/wrap.typ` controls composition. It imports the existing cover's palette, fonts, and subtitle-balancing helper from `export/book-style.typ`. The front repeats the approved cover's type sizes and offsets, scaled to the configured panel. Keep both layouts consistent if the approved front changes.

The front artwork is `assets/illustrations/cover/sacred-struggle-cover.png`. The new back is `assets/illustrations/cover/sacred-struggle-back.png`. The back uses a low smoke-blue fold and a fine gold repair beneath a quiet indigo text field. The plain indigo spine separates the two images; the artwork does not depend on a seam crossing both folds.

The built-in image-generation tool created the back using the front as a material reference. The final prompt was:

> Use case: style-transfer. Asset type: text-free BACK COVER artwork for a 6 x 9 inch literary nonfiction paperback titled Sacred Struggle. The attached image is the approved FRONT COVER and is a STYLE AND MATERIAL REFERENCE ONLY. Create a new, matching portrait BACK COVER background; do not alter or reproduce the front cover composition. Portrait 2:3, highest available resolution. Match the reference's deep midnight indigo fibrous paper, matte mineral pigment, tactile gold leaf and smoke-blue charcoal current exactly in material and mood. The back is much quieter: leave the upper 75 percent as low-detail, evenly dark indigo handmade paper for a large readable blurb. No bright marks, gold, circuits, folds or light areas behind this text region. Confine one low, wide smoke-blue mineral fold to the bottom 18 percent, entering from the lower left edge and tapering back into dark paper before the lower right corner, with one very fine irregular gold repair along its edge. One or two tiny connected geometric turns may emerge from that repair near the lower left, subtle on close view. The original front's gold seam is dominant; this new back is subordinate. Keep gold under 2 percent. Deep paper texture and darkness must continue to all four edges so the back works with bleed and next to a dark indigo spine. Calm, restrained, premium literary publishing, no gradient glow. No text, typography, letters, numbers, barcode, logos, mockup, book object, borders, frames, horizon, literal wave, scene, robot, chip, motherboard, separate icon or floating traces.

## When the printer details arrive

1. Get the template for the final trim, binding, paper stock, and final interior page count. Copy its spine, bleed, safe-area, and barcode values into the config. Do not infer spine width from page count alone.
2. Compare the guided proof with the template at 100% scale. Confirm the total size, fold positions, barcode placement, and spine reading direction. The initial bleed and margins are design assumptions, not verified printer specifications.
3. Place the supplied barcode artwork inside the repository. Set `barcode.artwork` to its repository-root-relative `/path`. The renderer preserves its aspect ratio inside the white reserve; inspect barcode scale and quiet zones against the printer's requirements. Do not invent an ISBN, price, or barcode. A null artwork value leaves the white reserve empty in the clean PDF and labels it in the guided proof.
4. Get author approval for the back-cover wording. Check title, author, publisher, website, and edition details.
5. Check required image resolution, color space, PDF standard, and printer marks. These proofs use RGB, process-color gold, and Typst's standard PDF output. They do not claim CMYK, PDF/X, foil, or printer preflight approval. The source images' native resolution may need an approved higher-resolution replacement.
6. Rebuild and inspect the PDFs. Prepare a separately named production file to the printer's exact specification. Never send `wrap-guides.pdf` or treat this concept proof as an approved print master.

Run `bun test export/paperback` to check changed dimensions and rejection of unsafe geometry or overflowing copy. Run `bun test` and `bun run build:site` when changing shared export code or fonts.
