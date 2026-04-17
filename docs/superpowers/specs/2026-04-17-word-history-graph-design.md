# Word History Graph — Design

## Goal

At build time, compute the writing history of `book.mdx` from git and render three bar charts (per-day, per-week, per-month) showing net words written in each period. The charts appear inside the existing "Updated" `<details>` section on the rendered site, below the commit list.

## Scope

- Strictly additive. No changes to existing progress / TOC / commit-history behavior.
- Reuses the current markdown-syntax-stripping word counter (`countWords` in `src/publish/progress.ts`) so the numbers match the "words" number already shown on the page.
- One file tracked: `book.mdx` (with git `--follow` to handle prior renames).

## Y-axis semantics

Each bar is the **net word delta for that period**: `words_at_end_of_period - words_at_end_of_previous_period_with_data`. Deletions produce negative bars drawn below a zero baseline. The first commit's bar equals its full word count (delta from 0).

## Data model

```ts
type PeriodKind = "day" | "week" | "month";

interface PeriodBucket {
  readonly key: string;       // "2026-03-16" | "2026-W11" | "2026-03"
  readonly startIso: string;  // ISO date for client-side Intl formatting
  readonly delta: number;     // net words written in this period
}

interface WordHistory {
  readonly day: readonly PeriodBucket[];
  readonly week: readonly PeriodBucket[];
  readonly month: readonly PeriodBucket[];
}
```

Period keys:

- Day: `YYYY-MM-DD` (local time), e.g. `2026-03-16`
- Week: ISO 8601 week (Monday-start, ISO week-year), formatted as `YYYY` + literal capital `W` + two-digit week, e.g. `2026-W11`
- Month: `YYYY-MM` (local time), e.g. `2026-03`

`startIso` is always the ISO 8601 date of the first day of the period (Monday for weeks, day 1 for months) at local midnight, serialized as `YYYY-MM-DD`. The client formats this with `Intl.DateTimeFormat` using browser defaults.

## Pipeline

New file: `src/publish/wordHistory.ts`.

1. **List commits for `book.mdx`.**
   `git log --follow --name-only --format="%H%x00%ct" -- book.mdx`
   Parse into `{ hash, unixSeconds, pathAtCommit }[]`, sorted ascending by time. `pathAtCommit` captures the filename at that commit (may differ from current if the file was renamed).

2. **Count words at each commit.**
   For each commit: `git show <hash>:<pathAtCommit>` → split on `\n` → `countWords(lines)`. Reuses existing syntax-stripping logic. If a commit returns empty (path didn't exist yet), skip.

3. **Compute per-commit deltas.**
   `delta[i] = words[i] - words[i-1]`, with `words[-1] = 0` so the first commit's delta equals its word count.

4. **Bucket into periods.**
   For each commit, compute its day/week/month key from `new Date(unixSeconds * 1000)` in local time. Sum deltas per key for each of the three granularities.

5. **Gap-fill.**
   For each kind, enumerate every period from the earliest to the latest key (inclusive), inserting `{ delta: 0 }` for missing periods. Day: one per calendar day. Week: one per ISO week. Month: one per calendar month.

6. **Return** the three ordered arrays.

## Rendering

New file: `src/components/WordHistoryGraph.astro`.

Props: `WordHistory`.

Layout:

- Three stacked sections, each ~50-60px tall, labeled "By day", "By week", "By month".
- Per section:
  - Inline SVG, `viewBox` set so bars fill the width. One `<rect>` per bucket.
  - Bar width = `100% / buckets.length` (no gaps; keeps dense day views legible).
  - Bar height scales to `max(|delta|)` within that section. Zero baseline drawn at the vertical midpoint when any negatives exist, otherwise at the bottom.
  - Positive bars use the existing ink color (Tailwind `fill-ink` or equivalent); negatives use a muted tone (`fill-ink-muted`) to visually distinguish deletions.
  - Each `<rect>` wraps a `<title>` child with fallback text: `${key}: +N words` (or `-N`). This gives native browser tooltips with zero JS.
  - Data attributes `data-period-start={startIso}` and `data-period-kind={kind}` so a small client script can replace the `<title>` text with an Intl-formatted date (e.g., "16 April 2026" for day, "Week of 16 Mar 2026" for week, "March 2026" for month).
- Caption below each section: `{bucketCount} {kind}s · {rangeStart} – {rangeEnd} · max {maxDelta}`. Dates here also format client-side via Intl.

## Placement

Edit `src/layouts/BookLayout.astro`:

- Add a new named slot `word-history` inside the existing "Updated" `<details>`, placed after the `<slot name="commits" />` block with a top rule separator.

Edit `src/pages/index.astro`:

- Import `computeWordHistory` from `src/publish/wordHistory.ts`.
- Call it with `"book.mdx"` during frontmatter.
- Pass the result to `<WordHistoryGraph>` inside the new `word-history` slot.

## Error handling

- If the git log is empty (e.g., file never committed under any name), `computeWordHistory` returns `{ day: [], week: [], month: [] }` and the component renders nothing (slot stays empty).
- Any unexpected git invocation failure throws and fails the build, matching the existing pattern in `src/publish/git.ts`.

## Testing

New file: `src/publish/wordHistory.test.ts` (mirrors the existing `src/md/updateResearchKeyPoints.test.ts` style).

Unit tests use a synthetic commit list (no git calls, no fixtures) fed through the bucketing+gap-filling core, which is split from the git-reading I/O:

- Bucketing groups commits on the same day / ISO week / month.
- Gap-filling inserts zero-delta buckets for missing days/weeks/months between the first and last commit.
- Negative deltas (deletions) survive bucketing.
- First commit's delta equals its word count.
- Empty input returns empty arrays for all three kinds.

No E2E test. The Astro component is rendered in `bun run build:site`, which already runs during normal development verification.

## Non-goals

- No interactive charts (pan/zoom/hover-crosshair).
- No sparkline library dependency. Plain SVG only.
- No caching of historical word counts between builds. At ~30 commits, the git-show loop is trivially fast; re-computing each build keeps the data source of truth in git.
- No per-chapter breakdown. One graph series per kind, total across the whole book.
- No build-time locale formatting. All date strings shown in the UI go through client-side `Intl.DateTimeFormat`.
