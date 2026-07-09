# Slice 019: Migrate Test Suite Off Literal Translated Strings

## Status

Proposed

## Parent Phase

Phase 003: Localization Hardening

## Goal

Update test assertions that currently hardcode literal translated strings to instead assert via translation keys / `data-testid` where the test isn't specifically about translation content, reserving literal-string assertions for tests whose actual purpose is verifying a translation.

## Scope

- Audit `src/App.test.tsx`, `src/api/noiseCutApi.test.ts`, `src/reportMarkdown.test.ts` for assertions on exact literal translated strings.
- For assertions where translation content isn't the point of the test (e.g. "clicking submit calls the API"), switch to `data-testid`/role-based queries independent of wording.
- For assertions whose actual purpose is verifying translation correctness, keep literal-string assertions but consolidate them near the relevant Slice 012-018 tests rather than scattered through unrelated test files.

## Non-Goals

- Do not reduce test coverage — this is a refactor of *how* tests assert, not a removal of assertions.
- Do not change component behavior to make tests pass; if a test fails after this migration, investigate whether Slices 012-018 introduced a real regression first.

## Non-Scope

- Any new feature work.

## Files Likely Involved

- `src/App.test.tsx`
- `src/api/noiseCutApi.test.ts`
- `src/reportMarkdown.test.ts`

## Required Reads

- `.ai/AI_CONTRACT.md`
- `.ai/STATE.md`
- `src/App.test.tsx`, `src/api/noiseCutApi.test.ts`, `src/reportMarkdown.test.ts`

## Implementation Rules

- Do this incrementally alongside Slices 013-018 where practical rather than as one big-bang rewrite at the end — this slice exists to close out whatever wasn't already migrated inline with earlier slices.
- Budget this as the largest time sink in the phase; do not rush correctness for speed.

## Allowed Dependencies

- None new.

## Acceptance Criteria

- Tests not about translation content use `data-testid`/role-based queries.
- Tests about translation content keep literal-string assertions, consolidated near the relevant feature.
- Full test suite passes at the same or better coverage than before this slice.

## Validation Commands

- `npm test -- --run`
- `npm run build`

## Required State Updates

- Update `.ai/STATE.md`, `.ai/state/STATE.md`, `.ai/state/snapshot.json`, append `.ai/state/events.jsonl`.
- Update this slice's Status to `Completed` when done — this closes Phase 003.
- Create `.ai/verification/verification-019-migrate-test-suite-off-literal-strings.md`.
