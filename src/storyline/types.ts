/**
 * A story line maps the book's major ideas to the places they appear, so the
 * author can see how tension builds and whether each promise gets paid off.
 *
 * Each thread is one idea, image, or question the reader carries. Each
 * mention is anchored to an exact quote from `book.mdx`, because line numbers
 * drift while the author edits; the resolver turns quotes into word positions.
 */

/**
 * - `plant`: the idea is hinted or promised; the reader does not yet need to
 *   understand it.
 * - `use`: the idea is relied upon as if the reader already understands it.
 * - `explain`: the idea is introduced or defined properly.
 * - `payoff`: the promise is kept; the reader now has the full picture.
 *
 * A `use` that comes before the `explain` is a reading-order problem and is
 * shown in red.
 */
export type MentionKind = "plant" | "use" | "explain" | "payoff";

export interface Mention {
  /** Exact, unique substring of the comment-stripped book. */
  readonly quote: string;
  readonly kind: MentionKind;
  /** What happens to the idea at this spot, shown on hover. */
  readonly note: string;
}

export interface Thread {
  readonly id: string;
  readonly title: string;
  /** The open question the reader carries until the payoff. */
  readonly question: string;
  readonly mentions: readonly Mention[];
}
