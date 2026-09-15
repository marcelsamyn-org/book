#let navy = rgb("#1c2540")
#let gold = rgb("#c9a574")
#let gold-ink = rgb("#94744a")
#let muted = rgb("#776d62")
#let display-font = ("Lora",)
#let mono-font = ("IBM Plex Mono",)

#set text(fill: navy)
#set par(justify: false)

#let eyebrow(body) = text(font: mono-font, size: 7.5pt, tracking: 0.14em, fill: gold-ink, upper(body))
#let rule = line(length: 3em, stroke: 0.6pt + gold)

#let study(path, label) = page(
  width: 6in,
  height: 9in,
  margin: (x: 0.8in, top: 0.75in, bottom: 0.75in),
  header: none,
  footer: none,
  {
  align(center, {
    v(0.55in)
    eyebrow("Part One")
    v(12pt)
    rule
    v(14pt)
    text(font: display-font, weight: 600, size: 28pt, [The Machine Mind])
    v(0.32in)
    image(path, width: 4.4in)
  })
  place(bottom + center, text(font: mono-font, size: 6pt, tracking: 0.08em, fill: muted, upper(label)))
})

#study("../../assets/illustrations/studies/01-mineral-fiber.png", "Study 01 · mineral pigment and fiber")
#study("../../assets/illustrations/studies/02-ceramic-sculpture.png", "Study 02 · ceramic sculpture")
#study("../../assets/illustrations/studies/03-paper-monotype.png", "Study 03 · torn-paper monotype")
