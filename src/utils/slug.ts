const nonSlugPattern = /[^a-z0-9]+/g;

export const slugify = (value: string): string => {
  const trimmed = value.trim().toLowerCase();
  const slug = trimmed.replace(nonSlugPattern, "-").replace(/^-+|-+$/g, "");
  return slug.length > 0 ? slug : "untitled";
};
