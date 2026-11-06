import { expect, it } from "bun:test";
import { mkdtemp, rm } from "node:fs/promises";
import { join } from "node:path";
import { $ } from "bun";

it("opens parts on the right with a blank only where needed", async () => {
  const directory = await mkdtemp(join(process.cwd(), "export/.test-print-layout-"));
  try {
    const source = join(directory, "book.typ");
    const pdf = join(directory, "book.pdf");
    const options = ["--root", ".", "--font-path", "export/fonts", "--ignore-system-fonts", "--input", "print=true"];
    await Bun.write(source, `
#import "/export/book-style.typ": book
#show: book.with(title: "Book", subtitle: "Proof", author: "Author", edition: "Print")

= Introduction
Opening text.

= Part 1: One
First part text.
#pagebreak()
More first part text.

= Part 2: Two
Second part text.

= Part 3: Three
Third part text.

#context [#metadata(query(heading.where(level: 1)).map(h => h.location().page())) <opening-pages>]
`);
    const pages = await $`typst eval ${options} --in ${source} 'query(<opening-pages>).first().value'`.json();
    expect(pages).toEqual([4, 5, 7, 9]);

    await $`typst compile ${options} ${source} ${pdf}`.quiet();
    const ink = await $`gs -q -dBATCH -dNOPAUSE -sDEVICE=inkcov -o - ${pdf}`.text();
    const blankPages = ink.trim().split("\n").flatMap((line, index) =>
      line.trim().startsWith("0.00000  0.00000  0.00000  0.00000") ? [index + 1] : [],
    );
    expect(blankPages).toEqual([8, 10]);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
