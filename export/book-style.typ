// Sacred Struggle, PDF design.
// template.typ (the pandoc template) and cover.typ import this file. The
// exhibit functions at the bottom are called from the raw Typst blocks that
// export/components.ts writes for each manuscript component.

// ── Palette (taken from the cover) and fonts ────────────────
#let ink = rgb("#2a2520")
#let muted = rgb("#776d62")
#let navy = rgb("#1c2540")
#let deep = rgb("#131a2f")
#let night = rgb("#0a1020")
#let gold = rgb("#c9a574")
#let gold-ink = rgb("#94744a")
#let cream = rgb("#f0e6d0")
#let cream-dim = rgb("#d9c8a3")
#let wash = rgb("#f8f4ed")
#let hairline = rgb("#e3d9c9")

#let text-font = ("Literata 12pt",)
#let display-font = ("Lora",)
#let sans-font = ("IBM Plex Sans",)
#let mono-font = ("IBM Plex Mono",)

#let part-pattern = regex("^Part (\d+):\s*(.+)$")
#let number-words = ("One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine")

// ── Helpers ─────────────────────────────────────────────────

/// Flattens content to a string, for matching heading titles and PDF metadata.
#let plain(it) = {
  if it == none { "" } else if type(it) == str { it } else if it.has("text") { it.text } else if it.has("children") {
    it.children.map(plain).sum(default: "")
  } else if it.has("body") { plain(it.body) } else if it.func() == smartquote {
    if it.double { "”" } else { "’" }
  } else if it == [ ] { " " } else { "" }
}

#let eyebrow(body, fill: gold-ink, size: 6.4pt) = text(
  font: mono-font,
  size: size,
  tracking: 0.14em,
  fill: fill,
  number-type: "lining",
  upper(body),
)

#let rule(length: 2.4em, paint: gold) = line(length: length, stroke: 0.6pt + paint)

#let part-number(heading) = {
  let found = plain(heading.body).match(part-pattern)
  if found == none { none } else { number-words.at(int(found.captures.first()) - 1) }
}

#let part-title(heading) = {
  let title = plain(heading.body)
  let found = title.match(part-pattern)
  if found == none { title } else { found.captures.last() }
}

/// Breaks a phrase into two lines of similar length.
#let balance(phrase) = {
  let words = phrase.split(" ")
  if words.len() < 4 { return phrase }
  let split = range(1, words.len())
    .sorted(key: i => calc.abs(words.slice(0, i).join(" ").len() - words.slice(i).join(" ").len()))
    .first()
  [#words.slice(0, split).join(" ")\ #words.slice(split).join(" ")]
}

// ── Front matter ────────────────────────────────────────────

#let cover(title: "", subtitle: "", author: "") = page(
  width: 6in,
  height: 9in,
  margin: 0pt,
  header: none,
  footer: none,
  background: image(
    "/assets/illustrations/cover/sacred-struggle-cover.png",
    width: 100%,
    height: 100%,
    fit: "cover",
  ),
  {
    set text(font: display-font, fill: cream, number-type: "lining", hyphenate: false)
    set par(justify: false, first-line-indent: 0em)
    set align(center)
    place(top + center, dy: 0.98in, block(width: 90%, {
      set par(leading: 0.30em)
      text(size: 41pt, weight: 600, tracking: 0.005em, title.split(" ").join(linebreak()))
    }))
    place(top + center, dy: 2.56in, block(width: 84%, {
      set par(leading: 0.64em)
      text(size: 11.8pt, style: "italic", fill: cream-dim, balance(subtitle))
    }))
    place(bottom + center, dy: -0.42in, text(
      font: sans-font,
      size: 8pt,
      weight: 500,
      fill: gold,
      tracking: 0.22em,
      upper(author),
    ))
  },
)

#let title-page(title, subtitle, author, edition) = page(header: none, footer: none, {
  set align(center)
  set par(justify: false, first-line-indent: 0em)
  v(1.5in)
  block(text(font: display-font, weight: 600, size: 30pt, fill: navy, hyphenate: false, title))
  v(10pt)
  rule(length: 3em)
  v(12pt)
  block(width: 80%, text(font: display-font, style: "italic", size: 13pt, fill: muted, balance(plain(subtitle))))
  v(1fr)
  block(eyebrow(author, fill: ink, size: 8pt))
  v(4pt)
  block(eyebrow(edition))
  v(0.3in)
})

#let copyright-page(
  title: none,
  subtitle: none,
  rights: none,
  publisher: none,
  website: none,
  notice: none,
  version: none,
  colophon: none,
) = page(header: none, footer: none)[
  #set text(size: 7.8pt, fill: muted, number-type: "lining")
  #set par(justify: false, first-line-indent: 0em, leading: 0.62em, spacing: 1.2em)
  #v(1fr)
  #emph(title): #subtitle

  #rights

  #notice

  Version #version

  #publisher \
  #website

  #colophon
]

#let contents-page() = {
  pagebreak(weak: true)
  v(0.5in)
  align(center, text(font: display-font, weight: 600, size: 17pt, fill: navy)[Contents])
  v(0.28in)
  set par(justify: false, first-line-indent: 0em)
  show outline.entry: it => {
    let target = it.element.location()
    let page-number = text(size: 8.6pt, fill: muted, number-type: "lining", it.page())
    if it.level == 1 {
      block(above: 12pt, below: 0pt, link(
        target,
        text(font: display-font, weight: 600, size: 10.2pt, fill: navy, it.body()) + h(1fr) + page-number,
      ))
    } else {
      block(above: 5pt, below: 0pt, link(target, pad(
        left: 1.1em,
        text(size: 9.3pt, it.body())
          + box(width: 1fr, inset: (x: 4pt), repeat(gap: 2.6pt, text(size: 7pt, fill: gold)[.]))
          + page-number,
      )))
    }
  }
  outline(title: none, depth: 2)
  pagebreak(weak: true)
}

// ── Running heads and openers ───────────────────────────────

#let page-header = context {
  let current = here().page()
  let openers = query(heading.where(level: 1).or(heading.where(level: 2)))
  let before = openers.filter(h => h.location().page() < current)
  if before.len() > 0 and not openers.any(h => h.location().page() == current) {
    align(center, eyebrow(part-title(before.last()), fill: muted, size: 6pt))
  }
}

#let page-footer = context {
  let current = here().page()
  let on-part-page = query(heading.where(level: 1)).any(h => (
    h.location().page() == current and part-number(h) != none
  ))
  if not on-part-page {
    align(center, text(size: 8.4pt, fill: muted, number-type: "lining", counter(page).display()))
  }
}

#let part-page(it) = {
  pagebreak(weak: true)
  set par(justify: false, first-line-indent: 0em)
  v(0.55in)
  align(center, {
    block(eyebrow("Part " + part-number(it), size: 7.5pt))
    v(12pt)
    rule(length: 3em)
    v(14pt)
    block(text(font: display-font, weight: 600, size: 28pt, fill: navy, part-title(it)))
  })
}

#let part-plate(src: "", alt: "") = {
  v(0.38in)
  align(center, image(src, width: 3.8in, alt: alt))
  v(1fr)
  pagebreak()
}

#let chapter-opener(it) = {
  pagebreak(weak: true)
  set par(justify: false, first-line-indent: 0em)
  v(0.85in)
  align(center, {
    if it.level == 2 {
      context {
        let parts = query(heading.where(level: 1).before(here()))
        if parts.len() > 0 and part-number(parts.last()) != none {
          block(below: 12pt, eyebrow("Part " + part-number(parts.last())))
        }
      }
    }
    rule()
    v(12pt)
    block(width: 86%, text(font: display-font, weight: 600, size: 20pt, fill: navy, it.body))
  })
  v(0.38in)
}

#let horizontalrule = align(center, block(above: 1.6em, below: 1.6em, text(fill: gold)[· · ·]))
#let divider = horizontalrule

// ── The book ────────────────────────────────────────────────

#let book(
  title: none,
  subtitle: none,
  author: none,
  edition: none,
  version: none,
  rights: none,
  publisher: none,
  website: none,
  notice: none,
  colophon: none,
  body,
) = {
  set document(title: plain(title), author: plain(author))
  set page(width: 6in, height: 9in, margin: (x: 0.8in, top: 0.86in, bottom: 0.92in))
  set text(font: text-font, size: 10.2pt, fill: ink, lang: "en", region: "US", number-type: "old-style")
  set par(justify: true, leading: 0.72em, spacing: 0.72em, first-line-indent: (amount: 1.3em, all: false))
  show strong: set text(weight: 600)
  show heading: set text(hyphenate: false)

  set list(indent: 0.3em, body-indent: 0.7em, spacing: 0.55em, marker: text(fill: gold-ink)[•])
  set enum(
    indent: 0.1em,
    body-indent: 0.6em,
    spacing: 0.55em,
    numbering: (..numbers) => text(fill: gold-ink, number-type: "lining", numbers.pos().map(str).join(".") + "."),
  )
  show list: set block(above: 1.1em, below: 1.1em)
  show enum: set block(above: 1.1em, below: 1.1em)

  show quote.where(block: true): it => pad(left: 0.3em, block(
    above: 1.3em,
    below: 1.3em,
    inset: (left: 1em, y: 0.15em),
    stroke: (left: 0.6pt + gold),
    {
      set text(size: 0.95em)
      set par(first-line-indent: 0em)
      it.body
    },
  ))

  set footnote.entry(separator: line(length: 2.2em, stroke: 0.5pt + gold), clearance: 1.2em, gap: 0.6em, indent: 0em)
  show footnote.entry: set text(size: 7.6pt, number-type: "lining")
  show footnote.entry: set par(justify: false, leading: 0.55em, first-line-indent: 0em)
  show link: it => {
    show regex("[/.]"): separator => [#separator#sym.zws]
    it
  }

  show heading.where(level: 1): it => if part-number(it) != none { part-page(it) } else { chapter-opener(it) }
  show heading.where(level: 2): chapter-opener
  show heading.where(level: 3): it => block(above: 2em, below: 0.85em, sticky: true, text(
    font: display-font,
    weight: 600,
    size: 12.4pt,
    fill: navy,
    it.body,
  ))
  show heading.where(level: 4): set heading(bookmarked: false)
  show heading.where(level: 4): it => block(above: 1.6em, below: 0.7em, sticky: true, text(
    font: display-font,
    style: "italic",
    size: 11pt,
    fill: navy,
    it.body,
  ))

  show <refs>: it => {
    set par(hanging-indent: 1.4em, first-line-indent: 0em, justify: false, spacing: 0.8em)
    set text(size: 8.6pt, number-type: "lining")
    it
  }

  cover(title: plain(title), subtitle: plain(subtitle), author: plain(author))
  title-page(title, subtitle, author, edition)
  copyright-page(
    title: title,
    subtitle: subtitle,
    rights: rights,
    publisher: publisher,
    website: website,
    notice: notice,
    version: version,
    colophon: colophon,
  )
  contents-page()

  set page(header: page-header, footer: page-footer)
  counter(page).update(1)
  body
}

// ── Exhibits (manuscript components) ────────────────────────

#let exhibit(body, breakable: false) = block(
  width: 100%,
  breakable: breakable,
  above: 1.8em,
  below: 1.8em,
  fill: wash,
  radius: 2.5pt,
  inset: (x: 11pt, y: 10pt),
  stroke: 0.4pt + hairline,
  {
    set text(font: sans-font, size: 7.8pt, number-type: "lining", hyphenate: false, fill: ink)
    set par(justify: false, first-line-indent: 0em, leading: 0.52em, spacing: 0.75em)
    set list(indent: 0em, body-indent: 0.5em, spacing: 0.42em, marker: text(fill: gold-ink)[–])
    show list: set block(above: 5pt, below: 0pt)
    body
  },
)

#let chip(body) = box(
  fill: white,
  stroke: 0.4pt + hairline,
  radius: 2pt,
  inset: (x: 3.5pt, y: 2pt),
  outset: (y: 0.5pt),
  text(font: mono-font, size: 7.2pt, body),
)

#let chat-exhibit(prompt: "", responses: ()) = exhibit(breakable: true, {
  block(below: 5pt, eyebrow[Prompt])
  block(below: 4pt, inset: (left: 8pt, y: 1pt), stroke: (left: 0.8pt + gold), text(style: "italic", prompt))
  for response in responses {
    block(breakable: false, above: 11pt, below: 0pt, {
      eyebrow(response.model, fill: navy)
      list(..response.items)
    })
  }
})

#let screenplay(heading: "", turns: (), ghost: "") = exhibit({
  align(center, eyebrow[One writer · two characters])
  v(4pt)
  let bubble(tag, body, fill: white, stroke: 0.4pt + hairline, human: false) = align(
    if human { right } else { left },
    block(width: 90%, breakable: false, above: 5pt, below: 0pt, fill: fill, stroke: stroke, radius: 5pt, inset: (
      x: 7pt,
      y: 5.5pt,
    ), align(left)[#eyebrow(tag, fill: muted, size: 5.6pt)\ #body]),
  )
  grid(
    columns: (1fr, 1.12fr),
    column-gutter: 11pt,
    {
      eyebrow[What you see]
      for turn in turns {
        let human = turn.speaker == "human"
        bubble(
          if human { "You" } else { "Assistant" },
          turn.text,
          fill: if human { navy.lighten(92%) } else { white },
          human: human,
        )
      }
      bubble("You", text(fill: muted, style: "italic")[Reply…], fill: none, stroke: (
        paint: hairline.darken(10%),
        thickness: 0.5pt,
        dash: "dashed",
      ), human: true)
    },
    {
      eyebrow[What the model writes]
      block(width: 100%, above: 5pt, fill: white, stroke: 0.4pt + hairline, inset: (x: 9pt, y: 9pt), {
        set text(font: mono-font, size: 6.7pt)
        set par(leading: 0.5em, spacing: 0.5em)
        upper(heading)
        let cue(speaker) = block(above: 7pt, below: 2pt, width: 100%, align(center, upper(speaker)))
        for turn in turns {
          cue(turn.speaker)
          pad(x: 6pt, turn.text)
        }
        cue("human")
        pad(x: 6pt)[#text(fill: muted, ghost)#box(width: 3pt, height: 6.5pt, fill: gold, baseline: 0.5pt)]
        v(6pt)
        line(length: 100%, stroke: (paint: gold, thickness: 0.5pt, dash: "dashed"))
        v(3pt)
        text(
          font: sans-font,
          style: "italic",
          fill: muted,
        )[The model happily writes your next line too — the system stops it here and waits for the real you.]
      })
    },
  )
})

#let eliza(
  input: (:),
  keyword: "",
  pattern: "",
  substitutions: (),
  transformed: "",
  template: (:),
  response: (:),
) = exhibit({
  let mark-keyword(body) = highlight(fill: gold.transparentize(50%), extent: 1pt, body)
  let mark-fragment(body) = highlight(fill: navy.transparentize(87%), extent: 1pt, body)
  let message(tag, body, reply: false) = block(
    width: 100%,
    above: 8pt,
    below: 8pt,
    inset: (x: 8pt, y: 6pt),
    fill: white,
    radius: 3pt,
    stroke: if reply { (left: 1.2pt + gold, rest: 0.4pt + hairline) } else { 0.4pt + hairline },
  )[#eyebrow(tag, fill: muted, size: 5.6pt)\ #text(size: 8.8pt, body)]
  let row(tag, body) = block(above: 5pt, below: 0pt, grid(
    columns: (4.4em, 1fr),
    align: horizon,
    eyebrow(tag, fill: muted, size: 5.6pt), body,
  ))
  let step(number, title, body) = block(breakable: false, above: 10pt, below: 0pt, {
    block(below: 4pt, eyebrow(number + " · " + title))
    body
  })
  let reassemble = if substitutions.len() > 0 { "04" } else { "03" }

  eyebrow[ELIZA · DOCTOR script · 1966]
  message("User")[#input.head#mark-keyword(input.keyword)#input.middle#mark-fragment(input.fragment)#input.tail]
  step("01", "Detect")[Scan the input against a ranked list of keywords until one hits. First match: #chip(upper(keyword))]
  step("02", "Decompose")[
    Split the input around the keyword using the rule’s pattern. Each #chip[0] is a wildcard that swallows whatever sits beside the keyword.
    #row("Pattern", chip(pattern))
    #row("Captured", chip(mark-fragment(input.fragment)))
  ]
  if substitutions.len() > 0 {
    step("03", "Flip pronouns")[
      Run the captured fragment through a pronoun-flip table so the reply addresses the user instead of echoing them.
      #row("Flips", substitutions.map(sub => [#chip(sub.from) → #chip(sub.to)]).join(h(8pt)))
      #row("Result", chip(mark-fragment(transformed)))
    ]
  }
  step(reassemble, "Reassemble")[
    Slot the fragment into one of the rule’s reassembly templates. ELIZA cycles through them so it doesn’t repeat itself.
    #row("Template", chip[#template.left#box(width: 2.4em, stroke: (bottom: 0.5pt + muted))#template.right])
    #row("Filled", chip[#template.left#mark-fragment(transformed)#template.right])
  ]
  message("ELIZA", reply: true)[#response.head#mark-fragment(response.fragment)#response.tail]
})

#let ptgi(subscales: (), scale: (), bands: ()) = exhibit(breakable: true, {
  let dot(value) = box(width: 10.5pt, height: 10.5pt, stroke: 0.45pt + muted, radius: 50%, align(
    center + horizon,
    text(size: 5.6pt, fill: muted, str(value)),
  ))
  let blank(width) = box(width: width, stroke: (bottom: 0.5pt + muted))
  let max-score = subscales.map(sub => sub.items.len()).sum() * scale.last().value

  eyebrow[Self-assessment]
  block(above: 4pt, below: 6pt, text(font: display-font, weight: 600, size: 12pt, fill: navy)[PTGI‑X‑SF])
  [Bring to mind a difficult event you’ve moved through. For each statement, circle the degree to which you experienced this change #emph[as a result] of that crisis.]
  block(above: 8pt, below: 4pt, grid(
    columns: (1fr,) * scale.len(),
    column-gutter: 5pt,
    ..scale.map(point => grid(
      columns: (auto, 1fr),
      column-gutter: 3pt,
      align: horizon,
      dot(point.value), text(size: 6.2pt, fill: muted, point.label),
    )),
  ))
  for subscale in subscales {
    block(breakable: false, above: 11pt, below: 0pt, {
      grid(
        columns: (1fr, auto),
        align: bottom,
        eyebrow(subscale.label, fill: navy), text(size: 7pt, fill: muted)[#blank(1.8em) / #(subscale.items.len() * scale.last().value)],
      )
      if "note" in subscale { block(above: 3pt, below: 0pt, text(size: 6.6pt, style: "italic", fill: muted, subscale.note)) }
      block(above: 4pt, below: 0pt, line(length: 100%, stroke: 0.4pt + hairline))
      for item in subscale.items {
        block(above: 5pt, below: 0pt, grid(
          columns: (1.3em, 1fr, auto),
          column-gutter: 6pt,
          align: (right + top, left + top, right + horizon),
          text(fill: muted, str(item.n) + "."), item.text, stack(dir: ltr, spacing: 2.5pt, ..scale.map(point => dot(point.value))),
        ))
      }
    })
  }
  block(above: 13pt, below: 0pt, grid(
    columns: (1fr, auto),
    align: bottom,
    text(font: display-font, weight: 600, size: 10pt, fill: navy)[Total], text(size: 8.5pt)[#blank(2.4em) / #max-score],
  ))
  block(above: 12pt, below: 0pt, breakable: false, {
    eyebrow[Reading your score]
    for (index, band) in bands.enumerate() {
      let low = if index == 0 { 0 } else { bands.at(index - 1).max + 1 }
      block(above: 5pt, below: 0pt, grid(
        columns: (3.4em, 1fr),
        text(weight: 600)[#low–#band.max], band.reading,
      ))
    }
  })
})

// ── Data figures ────────────────────────────────────────────

// Draws a line figure from geometry the TypeScript renderer already resolved,
// in the same unit space the SVG uses, so the PDF and the EPUB plot the same
// shape. Coordinates arrive as (x, y) pairs measured from the top left.
#let line-figure(
  eyebrow-text: "",
  units: (640.0, 320.0),
  grid-lines: (),
  bands: (),
  axis: (0.0, 0.0, 0.0),
  xticks: (),
  measured: (),
  projected: (),
  dots: (),
  key: none,
  caption: "",
) = exhibit(breakable: false, {
  block(below: 7pt, eyebrow(eyebrow-text))
  layout(size => {
    let uw = units.at(0)
    let uh = units.at(1)
    let s = size.width / uw
    let X(v) = v * s
    let Y(v) = v * s

    // Centres a label on a point, since Typst places boxes by their left edge.
    let centred(x, y, width, body) = place(dx: X(x - width / 2), dy: Y(y), box(width: X(width), align(center, body)))
    let right-of(x, y, body) = place(dx: 0pt, dy: Y(y), box(width: X(x), align(right, body)))

    box(width: size.width, height: Y(uh), {
      set text(font: sans-font, size: 6.4pt, fill: muted)

      for g in grid-lines {
        place(dx: X(g.at(1)), dy: Y(g.at(0)), line(length: X(g.at(2) - g.at(1)), stroke: 0.35pt + hairline))
        right-of(g.at(1) - 8, g.at(0) - 4, text(font: mono-font, g.at(3)))
      }

      for b in bands {
        place(
          dx: X(b.at(1)),
          dy: Y(b.at(0)),
          line(length: X(b.at(2) - b.at(1)), stroke: (paint: hairline.darken(15%), thickness: 0.35pt, dash: "dashed")),
        )
        place(dx: X(b.at(2) + 8), dy: Y(b.at(0) - 4), text(font: mono-font, b.at(3)))
      }

      place(dx: X(axis.at(1)), dy: Y(axis.at(0)), line(length: X(axis.at(2) - axis.at(1)), stroke: 0.4pt + muted))

      for t in xticks {
        centred(t.at(0), t.at(1) + 6, 80, text(font: mono-font, t.at(2)))
      }

      let polyline(pts, dash) = {
        for i in range(pts.len() - 1) {
          let a = pts.at(i)
          let b = pts.at(i + 1)
          place(dx: X(a.at(0)), dy: Y(a.at(1)), line(
            start: (0pt, 0pt),
            end: (X(b.at(0) - a.at(0)), Y(b.at(1) - a.at(1))),
            stroke: (paint: gold, thickness: 1.3pt, cap: "round", dash: dash),
          ))
        }
      }
      polyline(measured, none)
      polyline(projected, "dashed")

      for d in dots {
        let r = 2.4pt
        place(dx: X(d.at(0)) - r, dy: Y(d.at(1)) - r, circle(
          radius: r,
          fill: if d.at(3) { white } else { gold },
          stroke: if d.at(3) { 0.8pt + gold } else { none },
        ))
        // The end labels hang inward so they clear the axis labels and the edge.
        let label = text(font: mono-font, weight: 500, fill: ink, d.at(2))
        let ly = d.at(1) - 17
        let w = 90
        if d.at(4) == "start" {
          place(dx: X(d.at(0)), dy: Y(ly), box(width: X(w), align(left, label)))
        } else if d.at(4) == "end" {
          place(dx: X(d.at(0) - w), dy: Y(ly), box(width: X(w), align(right, label)))
        } else {
          centred(d.at(0), ly, w, label)
        }
      }
    })
  })
  if key != none {
    block(above: 9pt, below: 0pt, {
      box(width: 14pt, baseline: -1.5pt, line(length: 14pt, stroke: (paint: gold, thickness: 1.1pt, dash: "dashed")))
      h(4pt)
      text(font: mono-font, size: 6pt, fill: muted, key)
    })
  }
  block(above: 10pt, below: 0pt, {
    line(length: 100%, stroke: 0.4pt + hairline)
    v(5pt)
    text(size: 6.6pt, fill: muted, style: "italic", caption)
  })
})

// Bars share the line figure's unit space and label conventions; the geometry
// again arrives already resolved so the PDF matches the SVG outputs.
#let bar-figure(
  eyebrow-text: "",
  units: (640.0, 330.0),
  grid-lines: (),
  rules: (),
  axis: (0.0, 0.0, 0.0),
  bars: (),
  caption: "",
) = exhibit(breakable: false, {
  block(below: 7pt, eyebrow(eyebrow-text))
  layout(size => {
    let uw = units.at(0)
    let uh = units.at(1)
    let s = size.width / uw
    let X(v) = v * s
    let Y(v) = v * s
    let centred(x, y, width, body) = place(dx: X(x - width / 2), dy: Y(y), box(width: X(width), align(center, body)))

    box(width: size.width, height: Y(uh), {
      set text(font: sans-font, size: 6.4pt, fill: muted)

      for g in grid-lines {
        place(dx: X(g.at(1)), dy: Y(g.at(0)), line(length: X(g.at(2) - g.at(1)), stroke: 0.35pt + hairline))
        place(dx: 0pt, dy: Y(g.at(0) - 4), box(width: X(g.at(1) - 8), align(right, text(font: mono-font, g.at(3)))))
      }

      // The rule stops short of its own label so the dashes never cross the text.
      for r in rules {
        place(
          dx: X(r.at(1)),
          dy: Y(r.at(0)),
          line(length: X(r.at(2) - r.at(1)), stroke: (paint: muted, thickness: 0.4pt, dash: "dashed")),
        )
        place(dx: 0pt, dy: Y(r.at(0) - 4), box(width: X(r.at(4)), align(right, text(font: mono-font, r.at(3)))))
      }

      for b in bars {
        // (x, y, width, height, value label, name lines, muted)
        place(dx: X(b.at(0)), dy: Y(b.at(1)), rect(
          width: X(b.at(2)),
          height: Y(b.at(3)),
          fill: if b.at(6) { hairline.darken(22%) } else { gold },
          stroke: none,
        ))
        centred(b.at(0) + b.at(2) / 2, b.at(1) - 15, 110, text(
          font: mono-font,
          weight: 500,
          fill: ink,
          b.at(4),
        ))
        for (row, name) in b.at(5).enumerate() {
          centred(b.at(0) + b.at(2) / 2, axis.at(0) + 6 + row * 11, 120, text(font: mono-font, name))
        }
      }

      place(dx: X(axis.at(1)), dy: Y(axis.at(0)), line(length: X(axis.at(2) - axis.at(1)), stroke: 0.4pt + muted))
    })
  })
  block(above: 10pt, below: 0pt, {
    line(length: 100%, stroke: 0.4pt + hairline)
    v(5pt)
    text(size: 6.6pt, fill: muted, style: "italic", caption)
  })
})
