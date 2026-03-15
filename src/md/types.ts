export interface Heading {
  readonly id: string;
  readonly title: string;
  readonly level: number;
  readonly startLine: number;
  readonly endLine?: number;
  readonly contentLines: readonly string[];
  readonly children: readonly Heading[];
}

export interface Outline {
  readonly headings: readonly Heading[];
}
