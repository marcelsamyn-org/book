/**
 * The two-pole table for "AI as Infinite Creation": several traditions drawing
 * the same line between making and not-making. The rhetorical move is that the
 * traditions agree, which five consecutive paragraphs leave the reader to
 * assemble and two columns show at once.
 */

export interface Pole {
  readonly term: string;
  /** One line, as the tradition puts it. */
  readonly gloss: string;
}

export interface PoleRow {
  readonly tradition: string;
  readonly making: Pole;
  readonly unmade: Pole;
}

export interface TwoPolesSpec {
  readonly makingHeading: string;
  readonly unmadeHeading: string;
  readonly rows: readonly PoleRow[];
}
