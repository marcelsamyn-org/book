import { OrgHeading } from "../org/types.js";

export interface FilterOptions {
  maxLevel: number;
}

export const filterHeadingByLevel = (
  heading: OrgHeading,
  options: FilterOptions,
): OrgHeading | null => {
  if (heading.level > options.maxLevel) {
    return null;
  }

  const filteredChildren = heading.children
    .map((child) => filterHeadingByLevel(child, options))
    .filter((child): child is OrgHeading => child !== null);

  return {
    ...heading,
    children: filteredChildren,
  };
};

export const filterOutlineByLevel = (
  headings: readonly OrgHeading[],
  options: FilterOptions,
): readonly OrgHeading[] => {
  return headings
    .map((heading) => filterHeadingByLevel(heading, options))
    .filter((heading): heading is OrgHeading => heading !== null);
};
