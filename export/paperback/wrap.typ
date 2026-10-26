#import "/export/book-style.typ": balance, cream, cream-dim, gold, display-font, sans-font

#let config = yaml(sys.inputs.at("config", default: "/export/paperback/config.yaml"))
#let metadata = yaml("/export/metadata.yaml")
#let guides = sys.inputs.at("guides", default: "false") == "true"
#let positive(key) = {
  let value = config.at(key)
  assert(type(value) in (int, float) and value > 0, message: key + " must be a positive number in millimetres")
  value * 1mm
}
#let w = positive("trim-width-mm")
#let h = positive("trim-height-mm")
#let spine = positive("spine-width-mm")
#let bleed = positive("bleed-mm")
#let safe = positive("safe-inset-mm")
#let spine-safe = positive("spine-safe-inset-mm")
#let inset = positive("back-text-inset-mm")
#let barcode = config.barcode
#let barcode-length(key) = {
  let value = barcode.at(key)
  assert(type(value) in (int, float) and value > 0, message: "barcode." + key + " must be positive millimetres")
  value * 1mm
}
#let barcode-w = barcode-length("width-mm")
#let barcode-h = barcode-length("height-mm")
#let barcode-right = barcode-length("right-mm")
#let barcode-bottom = barcode-length("bottom-mm")
#assert(safe * 2 < calc.min(w, h), message: "safe-inset-mm leaves no panel area")
#assert(inset >= safe and inset * 2 < w, message: "back-text-inset-mm must leave a text column inside the safe area")
#assert(spine-safe * 2 < spine, message: "spine-safe-inset-mm leaves no spine text area")
#assert(barcode-right >= safe and barcode-bottom >= safe and barcode-right + barcode-w <= w - safe and barcode-bottom + barcode-h <= h - safe, message: "barcode must fit inside the back-cover safe area")
#assert(w - inset - barcode-right - barcode-w > 15mm, message: "barcode leaves no publisher text column")
#assert(barcode-bottom + barcode-h <= h * 0.24, message: "barcode overlaps the reserved back-copy area")

#let full-w = 2 * w + spine + 2 * bleed
#let full-h = h + 2 * bleed
#let scale = w / 6in
#let guide-pad = if guides { 12mm } else { 0mm }
#let front-x = bleed + w + spine
#let front-title-inset = calc.max(w * 0.05, safe)
#let front-subtitle-inset = calc.max(w * 0.08, safe)
#let navy = rgb("#1c2540")
#let guide-color = rgb("#f0749b")

#set document(title: "Sacred Struggle — paperback cover concept", author: metadata.author)
#set page(width: full-w + 2 * guide-pad, height: full-h + 2 * guide-pad, margin: 0pt, fill: if guides { rgb("#f8f4ed") } else { navy })
#set text(font: display-font, fill: cream, hyphenate: false, lang: "en")
#set par(justify: false, first-line-indent: 0pt)

#let panel-image(path, width, height) = box(width: width, height: height, clip: true, image(path, width: width, height: height, fit: "cover"))
#let cover-text(width, height, body) = context {
  let measured = measure(block(width: width, body))
  assert(measured.height <= height, message: "Cover text overflows its reserved area. Shorten the copy or adjust the layout.")
  block(width: width, body)
}

#place(top + left, dx: guide-pad, dy: guide-pad, box(width: full-w, height: full-h, {
  // Extend backgrounds through the outer bleed; text is positioned from trim.
  place(top + left, panel-image(config.at("back-artwork"), w + bleed, full-h))
  place(top + left, dx: bleed + w, rect(width: spine, height: full-h, fill: navy, stroke: none))
  place(top + left, dx: front-x, panel-image(config.at("front-artwork"), w + bleed, full-h))

  place(top + left, dx: bleed + inset, dy: bleed + h * 0.105, cover-text(w - 2 * inset, h * 0.18, {
    set par(leading: 0.34em)
    text(size: 21.5pt * scale, weight: 600, config.back.headline)
  }))
  place(top + left, dx: bleed + inset, dy: bleed + h * 0.315, cover-text(w - 2 * inset, h * 0.32, {
    set text(size: 10.8pt * scale, fill: cream-dim)
    set par(leading: 0.62em, spacing: 1.05em)
    for paragraph in config.back.paragraphs { par(paragraph) }
  }))
  place(top + left, dx: bleed + inset, dy: bleed + h * 0.66, cover-text(w - 2 * inset, h * 0.10, {
    set par(leading: 0.45em)
    text(size: 14pt * scale, style: "italic", fill: cream, config.back.closing)
  }))

  place(top + left, dx: bleed + inset, dy: bleed + h - barcode-bottom - 7mm, block(width: w - inset - barcode-right - barcode-w - 4mm, {
    set text(font: sans-font, size: 6pt * scale, fill: cream-dim)
    set par(leading: 0.6em)
    text(tracking: 0.12em, upper(metadata.publisher))
    par(metadata.website)
  }))
  place(top + left, dx: bleed + w - barcode-right - barcode-w, dy: bleed + h - barcode-bottom - barcode-h, box(width: barcode-w, height: barcode-h, fill: white, {
    if barcode.artwork != none {
      image(barcode.artwork, width: 100%, height: 100%, fit: "contain")
    } else if guides {
      align(center + horizon, text(font: sans-font, size: 7pt, fill: navy)[ISBN / barcode\ Space reserved])
    }
  }))

  // Match the approved front-cover type, with positions relative to trim.
  place(top + left, dx: front-x + front-title-inset, dy: bleed + calc.max(h * (0.98 / 9), safe), block(width: w - 2 * front-title-inset, {
    set align(center)
    set par(leading: 0.30em)
    text(size: 41pt * scale, weight: 600, tracking: 0.005em, metadata.title.split(" ").join(linebreak()))
  }))
  place(top + left, dx: front-x + front-subtitle-inset, dy: bleed + calc.max(h * (2.56 / 9), safe), block(width: w - 2 * front-subtitle-inset, {
    set align(center)
    set par(leading: 0.64em)
    text(size: 11.8pt * scale, style: "italic", fill: cream-dim, balance(metadata.subtitle))
  }))
  place(top + left, dx: front-x, dy: bleed, box(width: w, height: h, {
    place(bottom + center, dy: -calc.max(h * (0.42 / 9), safe), text(font: sans-font, size: 8pt * scale, weight: 500, fill: gold, tracking: 0.22em, upper(metadata.author)))
  }))

  // Reflow after rotation so alignment uses the vertical text's real bounds.
  place(top + left, dx: bleed + w, dy: bleed, box(width: spine, height: h, {
    let title-size = calc.min(15pt * scale, (spine - 2 * spine-safe) * 0.8)
    let author-size = calc.min(7.5pt * scale, title-size * 0.62)
    place(top + center, dy: h * 0.13, rotate(90deg, reflow: true, text(size: title-size, weight: 600, metadata.title)))
    place(bottom + center, dy: -h * 0.13, rotate(90deg, reflow: true, text(font: sans-font, size: author-size, fill: gold, tracking: 0.12em, upper(metadata.author))))
  }))

  if guides {
    place(top + left, dx: bleed, dy: bleed, rect(width: 2 * w + spine, height: h, stroke: 0.5pt + guide-color, fill: none))
    for x in (bleed + w, front-x) {
      place(top + left, dx: x, dy: bleed, line(end: (0pt, h), stroke: (paint: guide-color, thickness: 0.5pt, dash: "dashed")))
    }
    for x in (bleed, front-x) {
      place(top + left, dx: x + safe, dy: bleed + safe, rect(width: w - 2 * safe, height: h - 2 * safe, stroke: (paint: guide-color, thickness: 0.4pt, dash: "dotted"), fill: none))
    }
    place(top + left, dx: bleed + w + spine-safe, dy: bleed + safe, rect(width: spine - 2 * spine-safe, height: h - 2 * safe, stroke: (paint: guide-color, thickness: 0.4pt, dash: "dotted"), fill: none))
  }
}))

#if guides {
  place(top + left, dx: guide-pad + bleed, dy: 4mm, text(font: sans-font, size: 7pt, fill: navy)[BACK  |  SPINE  |  FRONT])
  place(bottom + left, dx: guide-pad + bleed, dy: -4mm, text(font: sans-font, size: 7pt, fill: navy)[CONCEPT — provisional dimensions and copy. Solid: trim. Dashed: folds. Dotted: safe areas.])
}
