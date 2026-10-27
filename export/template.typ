#import "/export/book-style.typ": *

#show: book.with(
  title: [$title$],
  subtitle: [$subtitle$],
  author: [$for(author)$$author$$sep$, $endfor$],
  edition: [$edition$],
  version: [$version$],
  rights: [$rights$],
  publisher: [$publisher$],
  website: [$website$],
  notice: [$notice$],
  colophon: [$colophon$],
  print-isbn: [$print-isbn$],
  legal-deposit: [$legal-deposit$],
)

$body$
