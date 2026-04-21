import { describe, expect, it } from "bun:test";
import { computeEffectiveDaysRemaining } from "./progress.js";

const on = (iso: string): Date => new Date(`${iso}T12:00:00`);

describe("computeEffectiveDaysRemaining", () => {
  it("returns calendar days unchanged when workRate is 1 and no holidays", () => {
    const result = computeEffectiveDaysRemaining(
      on("2026-02-01"),
      "2026-02-11",
      [],
      1,
    );
    expect(result).toBe(10);
  });

  it("scales calendar days by workRate when there are no holidays", () => {
    const result = computeEffectiveDaysRemaining(
      on("2026-02-01"),
      "2026-02-11",
      [],
      0.8,
    );
    expect(result).toBe(8);
  });

  it("subtracts future holiday days before scaling", () => {
    // 10 calendar days (Feb 1 → Feb 11 exclusive). Holiday Feb 3–5 = 3 days.
    const result = computeEffectiveDaysRemaining(
      on("2026-02-01"),
      "2026-02-11",
      [{ start: "2026-02-03", end: "2026-02-05" }],
      1,
    );
    expect(result).toBe(7);
  });

  it("ignores past holidays", () => {
    const result = computeEffectiveDaysRemaining(
      on("2026-02-10"),
      "2026-02-20",
      [{ start: "2026-02-03", end: "2026-02-05" }],
      1,
    );
    expect(result).toBe(10);
  });

  it("counts only the future portion when a holiday straddles now", () => {
    // now = Feb 4 (inside holiday). Remaining = Feb 4..Feb 19 = 16 days.
    // Holiday overlap with remaining = Feb 4..Feb 10 = 7 days.
    const result = computeEffectiveDaysRemaining(
      on("2026-02-04"),
      "2026-02-20",
      [{ start: "2026-02-03", end: "2026-02-10" }],
      1,
    );
    expect(result).toBe(16 - 7);
  });

  it("counts only the pre-deadline portion when a holiday straddles the deadline", () => {
    // now = Feb 4, deadline = Feb 10 → remaining = Feb 4..Feb 9 = 6 days.
    // Holiday Feb 8–15; overlap with remaining = Feb 8..Feb 9 = 2 days.
    const result = computeEffectiveDaysRemaining(
      on("2026-02-04"),
      "2026-02-10",
      [{ start: "2026-02-08", end: "2026-02-15" }],
      1,
    );
    expect(result).toBe(6 - 2);
  });

  it("returns 0 when the deadline has passed", () => {
    const result = computeEffectiveDaysRemaining(
      on("2026-09-20"),
      "2026-09-15",
      [{ start: "2026-07-20", end: "2026-08-09" }],
      0.8,
    );
    expect(result).toBe(0);
  });

  it("handles multiple holidays", () => {
    // Feb 1 → Feb 21 = 20 days. Holiday Feb 3–5 = 3 days; holiday Feb 18–20 = 3 days.
    const result = computeEffectiveDaysRemaining(
      on("2026-02-01"),
      "2026-02-21",
      [
        { start: "2026-02-03", end: "2026-02-05" },
        { start: "2026-02-18", end: "2026-02-20" },
      ],
      1,
    );
    expect(result).toBe(20 - 6);
  });

  it("clamps to 0 when holidays consume all remaining days", () => {
    const result = computeEffectiveDaysRemaining(
      on("2026-02-01"),
      "2026-02-06",
      [{ start: "2026-02-01", end: "2026-02-10" }],
      0.8,
    );
    expect(result).toBe(0);
  });

  it("rounds the scaled result", () => {
    // 3 days × 0.8 = 2.4 → 2
    const result = computeEffectiveDaysRemaining(
      on("2026-02-01"),
      "2026-02-04",
      [],
      0.8,
    );
    expect(result).toBe(2);
  });
});
