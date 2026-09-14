// Renders the cover on its own, for the EPUB cover image.
#import "/export/book-style.typ": cover

#cover(title: sys.inputs.title, subtitle: sys.inputs.subtitle, author: sys.inputs.author)
