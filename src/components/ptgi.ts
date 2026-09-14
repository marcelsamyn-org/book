/**
 * The PTGI-X-SF questionnaire as the book reproduces it. The site's interactive
 * form and the ebook export's printable form both render from this data.
 */

export interface PtgiItem {
  readonly n: number;
  readonly text: string;
}

export interface PtgiSubscale {
  readonly key: string;
  readonly label: string;
  readonly note?: string;
  readonly items: readonly PtgiItem[];
}

export interface PtgiScalePoint {
  readonly value: number;
  readonly label: string;
}

export interface PtgiBand {
  /** Highest total score that falls in this band. */
  readonly max: number;
  readonly reading: string;
}

export const ptgiSubscales: readonly PtgiSubscale[] = [
  {
    key: "personal-strength",
    label: "Personal strength",
    items: [
      { n: 1, text: "I know better that I can handle difficulties." },
      { n: 2, text: "I discovered that I'm stronger than I thought I was." },
    ],
  },
  {
    key: "new-possibilities",
    label: "New possibilities",
    items: [
      { n: 3, text: "New opportunities are available which wouldn't have been otherwise." },
      { n: 4, text: "I established a new path for my life." },
    ],
  },
  {
    key: "relating-to-others",
    label: "Relating to others",
    items: [
      { n: 5, text: "I have a greater sense of closeness with others." },
      { n: 6, text: "I more clearly see that I can count on people in times of trouble." },
    ],
  },
  {
    key: "appreciation-of-life",
    label: "Appreciation of life",
    items: [
      { n: 7, text: "I have a greater appreciation for the value of my own life." },
      { n: 8, text: "I can better appreciate each day." },
    ],
  },
  {
    key: "existential-spiritual",
    label: "Existential / spiritual change",
    note: "These items replace the older religion-loaded set in PTGI-SF.",
    items: [
      { n: 9, text: "I feel more connected with all of existence." },
      { n: 10, text: "I have a greater sense of harmony with the world." },
    ],
  },
];

export const ptgiScale: readonly PtgiScalePoint[] = [
  { value: 0, label: "Not at all" },
  { value: 1, label: "Very small degree" },
  { value: 2, label: "Small degree" },
  { value: 3, label: "Moderate degree" },
  { value: 4, label: "Great degree" },
  { value: 5, label: "Very great degree" },
];

export const ptgiBands: readonly PtgiBand[] = [
  { max: 10, reading: "Early days. Growth often unfolds across months and years of meaning-making." },
  { max: 25, reading: "Some growth has taken root. Notice which domains scored highest — those are your seams." },
  { max: 40, reading: "Substantial growth. The crisis has been integrated into who you're becoming." },
  { max: 50, reading: "Profound transformation across most domains." },
];

export const interpretPtgiScore = (score: number): string => {
  const band = ptgiBands.find((candidate) => score <= candidate.max);
  if (band === undefined) throw new RangeError(`PTGI score ${score} is out of range.`);
  return band.reading;
};
