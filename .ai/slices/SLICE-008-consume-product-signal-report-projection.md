# Slice 008: Consume Product Signal Report Projection

## Status

Completed

## Parent Phase

`.ai/phases/PHASE-002-product-signal-report-api-contract.md`

## Goal

Update the UI to consume the API-owned Product Signal Report projection when available while preserving the existing verdict-style fallback for older or compatibility job results.

## Scope

- Add UI types for the additive `report` field on analysis-job responses.
- Add UI types for `ProductSignalReportResponse`, item, and metadata shapes.
- Render structured Founder report sections when `job.report` exists.
- Keep verdict-style `job.result` rendering as a fallback.
- Add tests for both report-first and result-fallback paths.
- Update AI delivery state and verification records.

## Non-Goals

- Do not change the API repo.
- Do not change the extension repo.
- Do not add Markdown copy, feedback submission, saved reports, or routing.
- Do not remove the existing verdict-style UI.

## Non-Scope

- API implementation.
- Extension handoff behavior.
- Saved reports, invite code gating, or router work.
- Markdown export and feedback workflows.

## Required Reads

- `.ai/AI_CONTRACT.md`
- `.ai/STATE.md`
- `.ai/state/STATE.md`
- `.ai/state/snapshot.json`
- `.ai/contracts/insight-report.contract.md`
- `.ai/slices/SLICE-007-plan-product-signal-report-result-projection.md`
- `src/api/noiseCutApi.ts`
- `src/App.tsx`

## Acceptance Criteria

- The UI prefers `job.report` over `job.result` when both are present.
- The UI still renders old `job.result` responses when `report` is missing.
- Build and tests pass.
- No sibling repo files are changed.

## Validation Commands

- `npm run build`
- `npm test -- --run`
- `powershell -NoProfile -ExecutionPolicy Bypass -File C:\Dev\ai-delivery-kit\scripts\validate-ai-docs.ps1 . -Topology SingleRepo`
- `powershell -NoProfile -ExecutionPolicy Bypass -File C:\Dev\ai-delivery-kit\scripts\check-ai-guardrails.ps1 . -TaskPath .\.ai\tasks\TASK-009-consume-product-signal-report-projection.json -Strict`

## Required State Updates

- Update `.ai/STATE.md`.
- Update `.ai/state/STATE.md`.
- Update `.ai/state/snapshot.json`.
- Append `.ai/state/events.jsonl`.
- Create `.ai/verification/verification-009-consume-product-signal-report-projection.md`.
