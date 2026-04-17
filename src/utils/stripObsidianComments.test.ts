import { describe, expect, it } from "bun:test";
import { stripObsidianComments } from "./stripObsidianComments.js";

describe("stripObsidianComments", () => {
  it("removes inline %%...%% comments", () => {
    expect(stripObsidianComments("before %%hidden%% after")).toBe(
      "before  after",
    );
  });

  it("removes block %%...%% comments spanning multiple lines", () => {
    const input = ["keep", "%%", "### hidden heading", "hidden body", "%%", "keep too"].join("\n");
    expect(stripObsidianComments(input)).toBe(["keep", "", "keep too"].join("\n"));
  });

  it("removes multiple comments in a single document", () => {
    const input = "a %%one%% b %%two%% c";
    expect(stripObsidianComments(input)).toBe("a  b  c");
  });

  it("leaves an unmatched lone %% untouched", () => {
    expect(stripObsidianComments("no close here %%")).toBe("no close here %%");
  });

  it("returns identical content when no comments present", () => {
    const input = "plain paragraph\n\n## heading";
    expect(stripObsidianComments(input)).toBe(input);
  });
});
