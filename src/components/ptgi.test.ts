import { describe, expect, it } from "bun:test";
import { interpretPtgiScore, ptgiBands, ptgiScale, ptgiSubscales } from "./ptgi.js";

describe("PTGI-X-SF data", () => {
  it("adds up to the 50-point total the questionnaire prints", () => {
    const itemCount = ptgiSubscales.flatMap((subscale) => subscale.items).length;
    const highestRating = Math.max(...ptgiScale.map((point) => point.value));

    expect(itemCount * highestRating).toBe(50);
    expect(ptgiBands.at(-1)?.max).toBe(50);
  });

  it("reads each score from the band it falls in, inclusive of the band's upper edge", () => {
    expect(interpretPtgiScore(0)).toStartWith("Early days.");
    expect(interpretPtgiScore(10)).toStartWith("Early days.");
    expect(interpretPtgiScore(11)).toStartWith("Some growth has taken root.");
    expect(interpretPtgiScore(40)).toStartWith("Substantial growth.");
    expect(interpretPtgiScore(41)).toStartWith("Profound transformation");
    expect(interpretPtgiScore(50)).toStartWith("Profound transformation");
  });

  it("rejects a score above the maximum", () => {
    expect(() => interpretPtgiScore(51)).toThrow(RangeError);
  });
});
