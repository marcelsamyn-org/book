/**
 * The lineage for "Why We Get Attached To Machines": each technology added one
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
