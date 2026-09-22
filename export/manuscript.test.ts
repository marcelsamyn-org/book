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
  it("renders a part plate for Typst and EPUB without losing its alt text", () => {
    const markdown = toPandocMarkdown(
      '<PartPlate src="/images/book/part-1-machine-mind.png" alt="A torn seed husk repaired with gold." />',
    );

    expect(markdown).toContain(
      '#part-plate(src: "/public/images/book/part-1-machine-mind.png", alt: "A torn seed husk repaired with gold.")',
    );
    expect(markdown).toContain(
      '<figure class="part-plate"><img src="public/images/book/part-1-machine-mind.png" alt="A torn seed husk repaired with gold." /></figure>',
    );
  });

  it("refuses part plates outside the public book image directory", () => {
    for (const src of ["../private.png", "/images/book/../private.png", "/images/book/../../outside.png"]) {
      expect(() => toPandocMarkdown(`<PartPlate src="${src}" alt="Private." />`)).toThrow(
        "<PartPlate> src must be a PNG under /images/book/",
      );
    }
  });

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

describe("data figures", () => {
  const curve = [
    "<CapabilityCurve",
    "  points={[",
    '    { year: 2020, seconds: 6, label: "6 sec" },',
    '    { year: 2026, seconds: 43200, label: "12 hours", projected: true },',
    "  ]}",
    '  caption="Figures as given above."',
    '  alt="A rising line."',
    "/>",
  ].join("\n");

  it("gives the PDF resolved coordinates and the EPUB the same figure as SVG", () => {
    const markdown = toPandocMarkdown(curve);

    expect(markdown).toContain("#line-figure(");
    expect(markdown).toContain('dots: ((');
    expect(markdown).toContain('<svg xmlns="http://www.w3.org/2000/svg"');
    expect(markdown).toContain('class="figure-svg"');
    // The projection must be flagged in both outputs, not just one.
    expect(markdown).toContain('key: "Dashed: the book’s own projection, not a measurement"');
    expect(markdown).toContain("figure-line-projected");
  });

  it("refuses a capability curve it cannot plot", () => {
    const single = curve.replace('    { year: 2026, seconds: 43200, label: "12 hours", projected: true },\n', "");
    expect(() => toPandocMarkdown(single)).toThrow("<CapabilityCurve> needs at least two points");
  });

  it("keeps the break-up percentages and the average line in both outputs", () => {
    const source = [
      "<BreakupAdvice",
      "  responders={[",
      '    { name: "People on the forum", percent: 42, group: "people" },',
      '    { name: "GPT-5 Mini", percent: 5.7, group: "models" },',
      "  ]}",
      '  average={{ percent: 20, label: "All models, 20%" }}',
      '  caption="My own test."',
      '  alt="Bars."',
      "/>",
    ].join("\n");
    const markdown = toPandocMarkdown(source);

    expect(markdown).toContain("#bar-figure(");
    expect(markdown).toContain('"42%"');
    expect(markdown).toContain('"5.7%"');
    expect(markdown).toContain('"All models, 20%"');
    expect(markdown).toContain('class="figure-bar"');
    expect(markdown).toContain('class="figure-bar figure-bar-muted"');
  });

  it("requires the lineage row that holds every ingredient", () => {
    const source = [
      "<AttachmentLineage",
      '  eras={[{ when: "1966", what: "ELIZA", added: "Self-disclosure." }]}',
      '  ingredients={["Responsiveness"]}',
      "/>",
    ].join("\n");
    expect(() => toPandocMarkdown(source)).toThrow("needs one era marked holdsAll");
  });

  it("renders the ladder in the order the chapter argues it", () => {
    const source = [
      "<ScarcityLadder",
      "  rungs={[",
      '    { name: "Execution", note: "Cheap now.", abundant: true },',
      '    { name: "Responsibility", note: "You cannot sue a machine.", abundant: false },',
      "  ]}",
      "/>",
    ].join("\n");
    const markdown = toPandocMarkdown(source);

    expect(markdown.indexOf("Execution")).toBeLessThan(markdown.indexOf("Responsibility"));
    expect(markdown).toContain("abundant: false");
    expect(markdown).toContain('class="ladder-rung ladder-scarce"');
  });
});
