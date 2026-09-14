import { describe, expect, it } from "bun:test";
import { revealCitations, toPandocMarkdown } from "./manuscript.js";

describe("revealCitations", () => {
  it("keeps citation comments as pandoc citations and drops every other comment", () => {
    const source = [
      "That’s two standard deviations.%%[@bloom1984]%% That’s a lot.",
      "%%",
      "Bloom, B. S. (1984). The 2 Sigma Problem; doi:10.3102/0013189X013006004",
      "%%",
      "Next %%TODO: cite%%paragraph.%%[@kahneman2010, p. 16490; @baumeister2013]%%",
    ].join("\n");

    expect(revealCitations(source)).toBe(
      [
        "That’s two standard deviations.[@bloom1984] That’s a lot.",
        "",
        "",
        "",
        "Next paragraph.[@kahneman2010, p. 16490; @baumeister2013]",
      ].join("\n"),
    );
  });
});

describe("revealCitations guards", () => {
  it("accepts spaces around a citation comment", () => {
    expect(revealCitations("Claim.%% [@bloom1984] %% More.")).toBe("Claim.[@bloom1984] More.");
  });

  it("refuses a comment that mixes a citation with a note, instead of dropping the citation", () => {
    expect(() => revealCitations("Claim.\n%%[@bloom1984] check the page%%")).toThrow(
      "book.mdx line 2: a comment mixes a citation with other text",
    );
  });

  it("refuses an unclosed comment, which Obsidian hides but the ebook would print", () => {
    expect(() => revealCitations("Para one.\n\n%%\nprivate note: fix this chapter\n")).toThrow(
      "book.mdx line 3: %% opens a comment that never closes",
    );
  });
});

describe("toPandocMarkdown", () => {
  it("removes imports and renders a chat exhibit as escaped Typst and HTML", () => {
    const source = [
      "import ChatExhibit from './src/components/ChatExhibit.astro';",
      "",
      "Before.",
      "",
      `<ChatExhibit prompt="You're not allowed to use glue or <tape>.">`,
      `  <ChatResponse model="GPT-5.4">`,
      "    - **Towel** — non-slip, cushioning base",
      `    - **Pan** — the "heaviest" item, C:\\stack`,
      "  </ChatResponse>",
      "</ChatExhibit>",
      "",
      "After.",
    ].join("\n");

    const markdown = toPandocMarkdown(source);

    expect(markdown).not.toContain("import");
    expect(markdown.trim().startsWith("Before.")).toBe(true);
    expect(markdown.trim().endsWith("After.")).toBe(true);
    expect(markdown).toContain('prompt: "You’re not allowed to use glue or <tape>.",');
    expect(markdown).toContain('(strong(("Pan",).join()), " — the “heaviest” item, C:\\\\stack",).join()');
    expect(markdown).toContain("<p class=\"chat-prompt\">You’re not allowed to use glue or &lt;tape&gt;.</p>");
    expect(markdown).toContain("<li><strong>Pan</strong> — the “heaviest” item, C:\\stack</li>");
  });

  it("reads component props written as JavaScript literals", () => {
    const source = [
      "<ScreenplayWriter",
      '  sceneHeading="Int. A conversation — ongoing"',
      "  turns={[",
      '    { speaker: "human", text: "Should I?" },',
      "    { speaker: 'assistant', text: `You could.` },",
      "  ]}",
      '  ghostLine="You\'re right. Honestly, the struggle is the whole poi"',
      "/>",
    ].join("\n");

    const markdown = toPandocMarkdown(source);

    expect(markdown).toContain(
      'turns: ((speaker: "human", text: "Should I?"), (speaker: "assistant", text: "You could."),),',
    );
    expect(markdown).toContain('ghost: "You’re right. Honestly, the struggle is the whole poi",');
    expect(markdown).toContain('<p class="screenplay-scene">INT. A CONVERSATION — ONGOING</p>');
  });

  it("names the book.mdx line of an unsupported component, counting removed comments", () => {
    const source = ["%%", "notes", "%%", "", "<Chart data={[1, 2]} />"].join("\n");
    expect(() => toPandocMarkdown(source)).toThrow("book.mdx line 5: <Chart> has no ebook rendering");
  });

  it("rejects inline JSX instead of dropping it", () => {
    expect(() => toPandocMarkdown("A <Highlight>word</Highlight> here.")).toThrow("mdxJsxTextElement");
  });

  it("renders the ELIZA pronoun-flip step and renumbers the steps after it", () => {
    const source = [
      "<ElizaBreakdown",
      '  input="Well, my boyfriend made me come here."',
      '  keyword="my"',
      '  pattern="(0 MY 0)"',
      '  fragment="boyfriend made me come here"',
      '  substitutions={[{ from: "me", to: "you" }]}',
      '  transformedFragment="boyfriend made you come here"',
      '  template="Your $ ?"',
      '  response="Your boyfriend made you come here?"',
      "/>",
    ].join("\n");

    const markdown = toPandocMarkdown(source);

    expect(markdown).toContain('substitutions: ((from: "me", to: "you"),),');
    expect(markdown).toContain('input: (head: "Well, ", keyword: "my", middle: " ", fragment: "boyfriend made me come here", tail: "."),');
    expect(markdown).toContain('<p class="exhibit-label">03 · Flip pronouns</p>');
    expect(markdown).toContain('<p class="exhibit-label">04 · Reassemble</p>');
  });

  it("refuses citations inside a component, which would print as literal text", () => {
    const source = ['<ChatExhibit prompt="Stack these.">', '  <ChatResponse model="GPT-5.4">', "    - **Towel** — base%%[@bloom1984]%%", "  </ChatResponse>", "</ChatExhibit>"].join("\n");
    expect(() => toPandocMarkdown(source)).toThrow("book.mdx line 1: citations inside components are not supported");
  });

  it("refuses content and props that a renderer would drop", () => {
    expect(() => toPandocMarkdown("<PTGIQuestionnaire>\nA caption readers should see.\n</PTGIQuestionnaire>")).toThrow(
      "<PTGIQuestionnaire> has content the ebook would drop",
    );
    expect(() =>
      toPandocMarkdown('<ScreenplayWriter caption="Figure 3" sceneHeading="Int." turns={[]} ghostLine="Hi" />'),
    ).toThrow("<ScreenplayWriter> has props the ebook would drop: caption");
  });

  it("rejects props that would need code to run", () => {
    const source = '<ScreenplayWriter sceneHeading="Int." turns={makeTurns()} ghostLine="Hi" />';
    expect(() => toPandocMarkdown(source)).toThrow("CallExpression is not a literal");
  });
});
