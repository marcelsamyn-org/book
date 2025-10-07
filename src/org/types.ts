export interface OrgHeading {
  readonly id: string;
  readonly title: string;
  readonly level: number;
  readonly startLine: number;
  readonly endLine?: number;
  readonly contentLines: readonly string[];
  readonly children: readonly OrgHeading[];
}

export interface OrgOutline {
  readonly headings: readonly OrgHeading[];
}
