import { describe, expect, it } from "bun:test";
import {
  computeHistoryFromSamples,
  type CommitSample,
} from "./wordHistory.js";

const at = (iso: string): number => Math.floor(new Date(iso).getTime() / 1000);

describe("computeHistoryFromSamples", () => {
  it("returns empty buckets for empty input", () => {
    expect(computeHistoryFromSamples([])).toEqual({
      day: [],
      week: [],
      month: [],
    });
  });

  it("first commit delta equals its word count", () => {
    const samples: CommitSample[] = [
      { unixSeconds: at("2026-02-10T12:00:00"), words: 500 },
    ];
    const h = computeHistoryFromSamples(samples);
    expect(h.day).toHaveLength(1);
    expect(h.day[0]!.delta).toBe(500);
    expect(h.week).toHaveLength(1);
    expect(h.month).toHaveLength(1);
  });

  it("sums multiple commits in the same day into one bucket", () => {
    const samples: CommitSample[] = [
      { unixSeconds: at("2026-02-10T09:00:00"), words: 100 },
      { unixSeconds: at("2026-02-10T15:00:00"), words: 250 },
    ];
    const h = computeHistoryFromSamples(samples);
    expect(h.day).toHaveLength(1);
    expect(h.day[0]!.delta).toBe(250);
  });

  it("gap-fills missing days with zero delta", () => {
    const samples: CommitSample[] = [
      { unixSeconds: at("2026-02-10T12:00:00"), words: 100 },
      { unixSeconds: at("2026-02-13T12:00:00"), words: 400 },
    ];
    const h = computeHistoryFromSamples(samples);
    expect(h.day.map((b) => b.key)).toEqual([
      "2026-02-10",
      "2026-02-11",
      "2026-02-12",
      "2026-02-13",
    ]);
    expect(h.day.map((b) => b.delta)).toEqual([100, 0, 0, 300]);
  });

  it("preserves negative deltas (net deletions)", () => {
    const samples: CommitSample[] = [
      { unixSeconds: at("2026-02-10T12:00:00"), words: 1000 },
      { unixSeconds: at("2026-02-11T12:00:00"), words: 700 },
    ];
    const h = computeHistoryFromSamples(samples);
    expect(h.day.map((b) => b.delta)).toEqual([1000, -300]);
  });

  it("gap-fills missing months", () => {
    const samples: CommitSample[] = [
      { unixSeconds: at("2026-01-15T12:00:00"), words: 100 },
      { unixSeconds: at("2026-04-15T12:00:00"), words: 400 },
    ];
    const h = computeHistoryFromSamples(samples);
    expect(h.month.map((b) => b.key)).toEqual([
      "2026-01",
      "2026-02",
      "2026-03",
      "2026-04",
    ]);
    expect(h.month.map((b) => b.delta)).toEqual([100, 0, 0, 300]);
  });

  it("buckets ISO weeks with Monday-start and gap-fills", () => {
    // 2026-02-09 is Monday; 2026-02-16 is the following Monday.
    const samples: CommitSample[] = [
      { unixSeconds: at("2026-02-09T12:00:00"), words: 100 },
      { unixSeconds: at("2026-02-23T12:00:00"), words: 500 },
    ];
    const h = computeHistoryFromSamples(samples);
    expect(h.week.map((b) => b.key)).toEqual([
      "2026-W07",
      "2026-W08",
      "2026-W09",
    ]);
    expect(h.week.map((b) => b.delta)).toEqual([100, 0, 400]);
  });

  it("handles ISO week-year straddling year boundary", () => {
    // 2026-12-31 is Thursday → ISO week 53 of 2026.
    // 2027-01-01 (Friday) is still in ISO week 53 of 2026.
    // 2027-01-04 (Monday) starts ISO week 1 of 2027.
    const samples: CommitSample[] = [
      { unixSeconds: at("2026-12-31T12:00:00"), words: 100 },
      { unixSeconds: at("2027-01-01T12:00:00"), words: 200 },
      { unixSeconds: at("2027-01-04T12:00:00"), words: 500 },
    ];
    const h = computeHistoryFromSamples(samples);
    expect(h.week.map((b) => b.key)).toEqual(["2026-W53", "2027-W01"]);
    expect(h.week.map((b) => b.delta)).toEqual([200, 300]);
  });

  it("populates startIso as the period start (Monday for weeks, 1st for months)", () => {
    const samples: CommitSample[] = [
      { unixSeconds: at("2026-02-12T12:00:00"), words: 100 }, // Thu in ISO W07
    ];
    const h = computeHistoryFromSamples(samples);
    expect(h.day[0]!.startIso).toBe("2026-02-12");
    expect(h.week[0]!.startIso).toBe("2026-02-09"); // Monday of W07
    expect(h.month[0]!.startIso).toBe("2026-02-01");
  });
});
