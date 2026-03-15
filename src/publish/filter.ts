import { Heading } from "../md/types.js";

export interface FilterOptions {
  maxLevel: number;
}

export const filterHeadingByLevel = (
  heading: Heading,
  options: FilterOptions,
): Heading | null => {
  if (heading.level > options.maxLevel) {
    return null;
  }

  const filteredChildren = heading.children
    .map((child) => filterHeadingByLevel(child, options))
    .filter((child): child is Heading => child !== null);

  return {
    ...heading,
    children: filteredChildren,
  };
};

export const filterOutlineByLevel = (
  headings: readonly Heading[],
  options: FilterOptions,
): readonly Heading[] => {
  return headings
    .map((heading) => filterHeadingByLevel(heading, options))
    .filter((heading): heading is Heading => heading !== null);
};
