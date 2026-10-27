#import "/export/book-style.typ": plain

// Use the complete layout so the teaser keeps the full contents and page numbers.
#let last-page() = {
  let chapters = query(heading.where(level: 1))
  let introduction = chapters.position(it => plain(it.body) == "Introduction")
  assert(introduction != none, message: "Introduction heading not found")
  assert(introduction + 1 < chapters.len(), message: "No chapter follows the introduction")
  chapters.at(introduction + 1).location().page() - 1
}
