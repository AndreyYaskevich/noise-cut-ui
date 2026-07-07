# Verification 009: Consume Product Signal Report Projection

## Task

`TASK-009-consume-product-signal-report-projection`

## Summary

Updated the UI to consume the additive API-owned Product Signal Report projection. The app now prefers `job.report` when present and falls back to the existing verdict-style `job.result` for older completed jobs or compatibility responses.

## Files Changed

- `src/api/noiseCutApi.ts`
- `src/api/noiseCutApi.test.ts`
- `src/App.tsx`
- `src/App.test.tsx`
- `src/styles.css`
- `README.md`
- `.ai/slices/SLICE-008-consume-product-signal-report-projection.md`
- `.ai/tasks/TASK-009-consume-product-signal-report-projection.json`
- `.ai/verification/verification-009-consume-product-signal-report-projection.md`
- `.ai/STATE.md`
- `.ai/state/STATE.md`
- `.ai/state/snapshot.json`
- `.ai/state/events.jsonl`

## Validation Results

- `npm run build`: passed.
- `npm test -- --run`: passed with 2 test files and 9 tests.
- `validate-ai-docs.ps1 . -Topology SingleRepo`: passed with 0 warnings.
- `check-ai-guardrails.ps1 . -TaskPath .\.ai\tasks\TASK-009-consume-product-signal-report-projection.json -Strict`: passed with 1 warning because the repo is mostly untracked, so git diff does not show tracked state-file changes.

## Notes

- No API repo files were changed.
- No extension repo files were changed.
- Structured Product Signal Report sections render only when the API returns `report`.
- Existing verdict-style rendering remains in place for compatibility.
