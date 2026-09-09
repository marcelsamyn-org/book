import GithubSlugger from "github-slugger";
import type { Heading } from "../md/types.js";

/**
 * Astro derives heading ids by slugging every heading in the document with a
 * single slugger, so duplicate titles gain a numeric suffix. Any anchor we
 * generate ourselves must come from that same walk, or links break whenever a
 * title repeats at a level the table of contents does not show.
 */
export const buildAnchorMap = (
  headings: readonly Heading[],
): ReadonlyMap<string, string> => {
  const slugger = new GithubSlugger();
  const anchors = new Map<string, string>();

  const walk = (heading: Heading): void => {
    anchors.set(heading.id, slugger.slug(heading.title));
    heading.children.forEach(walk);
  };

  headings.forEach(walk);

  return anchors;
};
