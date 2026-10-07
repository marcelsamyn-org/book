/**
 * The lineage for "Why we get attached to machines": each technology added one
 * ingredient of attachment, and language models are the first to hold every
 * one at once.
 *
 * Each row carries only what the book itself says that technology added, so
 * the figure makes no claim the prose does not. The last row is the one that
 * holds all of them.
 */

export interface LineageEra {
  readonly when: string;
  readonly what: string;
  /** The ingredient this one introduced, in the book's own words. */
  readonly added: string;
  /** True for the row that holds every ingredient at once. */
  readonly holdsAll?: boolean;
}

export interface AttachmentLineageSpec {
  readonly eras: readonly LineageEra[];
  /** The full set, listed on the row that holds them all. */
  readonly ingredients: readonly string[];
}

/**
 * A small line drawing for each technology, keyed by its `what`. Strokes only,
 * on a 32-unit square, so one source serves the site, the PDF, and the EPUB.
 */
const drawings: Readonly<Record<string, string>> = {
  "Radio and television": [
    `<rect x="4" y="11" width="24" height="17" rx="2.5"/>`,
    `<rect x="7" y="14" width="14" height="11" rx="1.5"/>`,
    `<circle cx="24.5" cy="16.5" r="1"/>`,
    `<circle cx="24.5" cy="21.5" r="1"/>`,
    `<path d="M16 11 11 4M16 11l5-7"/>`,
  ].join(""),
  ELIZA: [
    `<rect x="4" y="5" width="24" height="17" rx="2"/>`,
    `<path d="M9 10.5l3 2.5-3 2.5M14 16h5"/>`,
    `<path d="M16 22v4M11 27h10"/>`,
  ].join(""),
  Tamagotchi: [
    `<path d="M16 3C9 3 5 11 5 18c0 7 5 11 11 11s11-4 11-11C27 11 23 3 16 3z"/>`,
    `<rect x="10" y="10" width="12" height="9" rx="1.5"/>`,
    `<circle cx="16" cy="14.5" r="2"/>`,
    `<circle cx="11" cy="23.5" r="1.2"/>`,
    `<circle cx="16" cy="24.5" r="1.2"/>`,
    `<circle cx="21" cy="23.5" r="1.2"/>`,
  ].join(""),
  "AIBO and Paro": [
    `<rect x="5" y="14" width="17" height="7" rx="3.5"/>`,
    `<rect x="18" y="7" width="11" height="7" rx="2.5"/>`,
    `<path d="M21 8.5c-2 0-3.5 1.5-3.5 4.5M25 10h.01"/>`,
    `<path d="M8.5 21v6h1.5M18.5 21v6h1.5M5.5 16 3 12"/>`,
  ].join(""),
  "AI companions": [
    `<path d="M7 6h18a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H14l-6 5v-5H7a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z"/>`,
    `<path d="M16 18c-5-3.5-4.5-7.5-2-7.5 1 0 1.7.7 2 1.5.3-.8 1-1.5 2-1.5 2.5 0 3 4-2 7.5z"/>`,
  ].join(""),
};

/** The drawing for one era, as a standalone SVG decorated for screen readers to skip. */
export const lineageDrawingSvg = (what: string, stroke = "currentColor"): string => {
  const shapes = drawings[what];
  if (shapes === undefined) {
    throw new Error(`No lineage drawing for "${what}"; add one in src/components/attachmentLineage.ts`);
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32" fill="none" stroke="${stroke}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="lineage-drawing">${shapes}</svg>`;
};
