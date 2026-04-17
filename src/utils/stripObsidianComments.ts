/**
 * Strip Obsidian-style `%%...%%` comments, matching the way Obsidian hides
 * them from rendered output. Both inline (`%%foo%%`) and block
 * (`%%\nfoo\n%%`) forms are supported. Non-greedy: pairs the nearest `%%`.
 *
 * Limitations: does not preserve `%%` inside fenced code blocks — add fence
 * awareness if code examples that contain `%%` are introduced.
 */
export const stripObsidianComments = (content: string): string =>
  content.replace(/%%[\s\S]*?%%/g, "");
