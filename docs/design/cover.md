# Sacred Struggle cover

Status: approved and used by the PDF and EPUB exports.

## Design

The cover uses one dark material field. A smoke-blue current crosses the lower half and faintly recalls a coastline without becoming a seascape. Its irregular gold repair acts as a line of tension. The same gold gradually becomes precise circuit traces, so organic force and machine structure belong to one system.

The image contains no generated text. Typst places the title, subtitle, and author over the artwork. This keeps the text accurate and makes later editorial changes safe.

The production artwork is [`assets/illustrations/cover/sacred-struggle-cover.png`](../../assets/illustrations/cover/sacred-struggle-cover.png).

## Fixed rules

- Use a 2:3 portrait canvas at 2K or higher.
- Keep the upper 40 percent dark and quiet for the title.
- Use deep indigo fibrous paper with smoke-blue, charcoal, and warm metallic gold.
- Keep the lower form ambiguous: current, folded paper, eroded edge, or coastline seen indirectly.
- Use one rough gold repair as the main gesture.
- Let a small group of precise circuit traces grow from the repair and remain connected to it.
- Keep circuitry below the title and inside the trim.
- Keep gold below about 7 percent of the image.
- Do not add text, borders, frames, horizons, foam, a motherboard, a central chip, or a separate symbolic object.

## Typography

- Title: Lora Semibold, 41 pt, two centered lines, `0.30em` leading.
- Subtitle: Lora Italic, 11.8 pt, balanced over two centered lines.
- Author: IBM Plex Sans Medium, 8 pt, uppercase with wide tracking.
- Title top offset: 0.98 inches.
- Subtitle top offset: 2.56 inches.
- Author bottom offset: 0.42 inches.
- Title and subtitle: warm cream. Author: muted gold.

## Base generation prompt

Use Nano Banana Pro (`gemini-3-pro-image`) with a 2:3 aspect ratio and 2K output.

> Create a premium literary book-cover background, 2:3 portrait. Deep midnight indigo handmade paper fills the frame, with subtle fibers and pressure marks. Preserve the upper 40 percent as quiet low-detail darkness for typography. In the lower half, one broad smoke-blue and charcoal mineral wash crosses diagonally like a current seen only indirectly: layered translucent pigment, torn fibers, and compressed folds. It may faintly recall a coastline in an abstract map, but must not show a crest, foam, curl, horizon, or recognizable sea. Along one boundary of that current is a single raised, irregular warm-gold kintsugi repair: a tactile line of tension, broken and imperfect. Near the right third, the same gold gradually changes material behavior over a long smooth transition: the jagged repair narrows into three or four precise circuit traces with a few tiny pads and subtle branches. The traces follow the current's curve before becoming geometric, so organic force and machine structure visibly shape each other. Circuitry is clear on close view but remains subordinate at thumbnail size. Keep the gold sparse, below 7 percent; keep all circuitry inside the trim and close to the boundary. No object, separate circuit icon, floating traces, motherboard, tree, vessel, egg, portal, landscape, text, letters, numbers, or symbols.

## Refinement prompt

Use the previous result as the input image.

> Preserve the full composition, indigo fibrous-paper field, quiet upper area, ambiguous smoke-blue current, rough gold repair boundary, scale, palette, and mood. Add circuitry only around the existing repair-to-circuit transition. Extend the precise gold structure with two additional thin connected traces and three or four small pads or short branches. Let one trace follow the contour farther into the blue fold and let another return toward the rough seam, so the circuitry feels grown from the repair and shaped by the current. Keep every new trace connected to the existing gold transition and clustered close to the boundary. The rough kintsugi seam must remain the dominant gold gesture. Keep the circuitry below the title and inside the trim. Do not alter the background, create a broad network, add floating traces or a central chip, or introduce text, letters, symbols, a literal wave, horizon, landscape, motherboard, or separate object.

## Export check

Run `bun run book:export`. Inspect the PDF cover at full-page size and as a thumbnail. Confirm that the EPUB contains the same cover image and passes `epubcheck` without warnings.
