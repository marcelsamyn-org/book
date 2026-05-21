import { describe, expect, it } from "bun:test";
import { buildCompletionObservation } from "./reportProgress.js";

describe("buildCompletionObservation", () => {
  it("maps the percentage onto the manuscript_completion_percent metric", () => {
    const obs = buildCompletionObservation(42, new Date("2026-05-21T09:30:00.000Z"));
    expect(obs.metric.slug).toBe("manuscript_completion_percent");
    expect(obs.metric.unit).toBe("%");
    expect(obs.metric.aggregationHint).toBe("max");
    expect(obs.metric.validRangeMin).toBe(0);
    expect(obs.metric.validRangeMax).toBe(100);
    expect(obs.value).toBe(42);
  });

  it("emits an occurredAt timestamp petals accepts (ISO 8601, UTC, with seconds)", () => {
    const obs = buildCompletionObservation(7, new Date("2026-05-21T09:30:15.123Z"));
    // Petals requires a date-time ending in Z with at least HH:MM:SS.
    expect(obs.occurredAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    expect(obs.occurredAt).toBe("2026-05-21T09:30:15.123Z");
  });
});
