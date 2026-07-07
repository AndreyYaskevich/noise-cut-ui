# Verification 006: Submit Founder Report Request

## Task

`TASK-006-submit-founder-report-request`

## Summary

Connected the UI to the existing NoiseCut API analysis-job flow. The app now accepts a Reddit or YouTube URL, optional research context, and pasted discussion excerpts, then submits `ProductVerdict` analysis through `POST /api/analysis-jobs`. If the API returns a pending or processing job, the UI polls `GET /api/analysis-jobs/{jobId}` with a bounded polling loop.

## Files Changed

- `src/api/noiseCutApi.ts`
- `src/api/noiseCutApi.test.ts`
- `src/App.tsx`
- `src/App.test.tsx`
- `src/styles.css`
- `README.md`
- `.ai/slices/SLICE-006-submit-founder-report-request.md`
- `.ai/tasks/TASK-006-submit-founder-report-request.json`
- `.ai/STATE.md`
- `.ai/state/STATE.md`
- `.ai/state/snapshot.json`
- `.ai/state/events.jsonl`
- `.ai/verification/verification-006-submit-founder-report-request.md`

## Validation Results

- `npm run build`: passed.
- `npm test -- --run`: passed with 2 test files and 8 tests.
- `validate-ai-docs.ps1 . -Topology SingleRepo`: passed with 0 warnings.
- `check-ai-guardrails.ps1 . -TaskPath .\.ai\tasks\TASK-006-submit-founder-report-request.json -Strict`: passed with 1 warning because the repo is mostly untracked, so git diff does not show tracked state-file changes.

## Notes

- No API repo files were changed.
- No extension repo files were changed.
- The UI still renders the existing verdict-style API result, not the final Product Signal Report section schema.
- Markdown copy, feedback submission, and extension handoff remain future slices.
