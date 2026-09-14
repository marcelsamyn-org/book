import { describe, expect, it } from "bun:test";
import { breakDownEliza, type ElizaProps } from "./eliza.js";

const doctor: ElizaProps = {
  input: "My boyfriend made me come here.",
  keyword: "my",
  pattern: "(0 MY 0)",
  fragment: "boyfriend made me come here",
  substitutions: [{ from: "me", to: "you" }],
  transformedFragment: "boyfriend made you come here",
  template: "Your $ ?",
  response: "Your boyfriend made you come here?",
};

describe("breakDownEliza", () => {
  it("matches the keyword regardless of case and keeps the user's casing", () => {
    const { input, template, response } = breakDownEliza(doctor);

    expect(input).toEqual({
      beforeKeyword: "",
      keyword: "My",
      betweenKeywordAndFragment: " ",
      fragment: "boyfriend made me come here",
      afterFragment: ".",
    });
    expect(template).toEqual({ left: "Your ", right: " ?" });
    expect(response).toEqual({ before: "Your ", fragment: "boyfriend made you come here", after: "?" });
  });

  it("uses the fragment unchanged when there are no pronoun flips", () => {
    const { substitutions, transformedFragment } = breakDownEliza({
      input: "I am sad about my job.",
      keyword: "my",
      pattern: "(0 MY 0)",
      fragment: "job",
      template: "Tell me more about your $.",
      response: "Tell me more about your job.",
    });

    expect(substitutions).toEqual([]);
    expect(transformedFragment).toBe("job");
  });

  it("rejects a template without exactly one placeholder", () => {
    expect(() => breakDownEliza({ ...doctor, template: "Your $ and $ ?" })).toThrow("exactly one");
    expect(() => breakDownEliza({ ...doctor, template: "Your boyfriend?" })).toThrow("exactly one");
  });

  it("rejects a keyword that only appears after the fragment", () => {
    expect(() => breakDownEliza({ ...doctor, input: "Boyfriend made me come here, my", fragment: "made me come here" })).toThrow(
      'keyword "my" not found ahead of fragment',
    );
  });
});
