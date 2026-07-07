# Slice 010: Add Report Feedback Submission

## Status

Completed

## Parent Phase

`.ai/phases/PHASE-002-product-signal-report-api-contract.md`

## Goal

Add a thin UI feedback flow for generated Product Signal Reports using the existing NoiseCut API feedback endpoint without changing API or extension behavior.

## Scope

- Add UI API client support for the existing `POST /api/feedback` flow.
- Define a small feedback interaction on the report result surface.
- Attach feedback to the current job context when available.
- Keep feedback payloads privacy-safe and avoid sending raw discussion content unless already required by the API contract.
- Add focused UI and API-client tests.
- Update README and AI delivery state after implementation.

## Non-Goals

- Do not change the API repo.
- Do not change the extension repo.
- Do not add auth, accounts, saved history, or moderation flows.
- Do not redesign the report generation workflow.
- Do not add analytics pipelines beyond the existing API telemetry path.

## Non-Scope

- API implementation or API contract changes.
- Extension handoff behavior.
- Invite-code gating, routing, or report history.
- Rich survey UX, multi-question feedback, or file attachments.

## Required Reads

- `.ai/AI_CONTRACT.md`
- `.ai/STATE.md`
- `.ai/state/STATE.md`
- `.ai/state/snapshot.json`
- `.ai/contracts/insight-report.contract.md`
- `.ai/slices/SLICE-009-add-markdown-export-for-structured-reports.md`
- `src/App.tsx`
- `src/api/noiseCutApi.ts`

## Acceptance Criteria

- The UI can submit feedback for a generated report through the existing API endpoint.
- Feedback is linked to the current job context when available.
- Raw discussion excerpts are not included in the feedback request by default.
- Build and tests pass.
- No sibling repo files are changed.

## Validation Commands

- `npm run build`
- `npm test -- --run`
- `powershell -NoProfile -ExecutionPolicy Bypass -File C:\Dev\ai-delivery-kit\scripts\validate-ai-docs.ps1 . -Topology SingleRepo`
- `powershell -NoProfile -ExecutionPolicy Bypass -File C:\Dev\ai-delivery-kit\scripts\check-ai-guardrails.ps1 . -TaskPath .\.ai\tasks\TASK-011-add-report-feedback-submission.json -Strict`

## Required State Updates

- Update `.ai/STATE.md`.
- Update `.ai/state/STATE.md`.
- Update `.ai/state/snapshot.json`.
- Append `.ai/state/events.jsonl`.
- Create `.ai/verification/verification-011-add-report-feedback-submission.md`.
