/**
 * The ladder for "New World, New Scarcity": each thing AI got good at became
 * abundant and pushed the value up to the next one — until responsibility,
 * which is not a matter of getting good at anything. The figure has to show
 * that break in kind, because it is the chapter's point and the hardest part
 * to hold in prose.
 */

export interface Rung {
  readonly name: string;
  /** One line on what became abundant, or why this one is different. */
  readonly note: string;
  /** False for the rung that AI cannot make abundant by improving. */
  readonly abundant: boolean;
}

export interface ScarcityLadderSpec {
  readonly rungs: readonly Rung[];
}

export const topDown = (rungs: readonly Rung[]): readonly Rung[] => [...rungs];
