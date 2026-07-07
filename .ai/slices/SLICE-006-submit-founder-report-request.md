# Slice 006: Submit Founder Report Request

## Status

Completed

## Parent Phase

`.ai/phases/PHASE-002-product-signal-report-api-contract.md`

## Goal

Let the Vite UI submit a Founder-lens report request through the existing NoiseCut API background job contract and render the returned verdict-style job result.

## Scope

- Use the existing `POST /api/analysis-jobs` endpoint.
- Use the existing `GET /api/analysis-jobs/{jobId}` endpoint for polling when the initial response is not terminal.
- Keep the request mapped to the checked-in API `CreateAnalysisJobRequest` shape.
- Let users provide a Reddit or YouTube URL, optional research context, and pasted discussion excerpts.
- Render job status, `jobId`, `contentHash`, summary, verdict, recommendation, pros, cons, risks, and topics from the existing `AnalysisResultResponse`.
- Add tests for the API client and UI submission flow.
- Update delivery state and verification records.

## Non-Goals

- Do not implement the full Product Signal Report section schema yet.
- Do not add Markdown copy.
- Do not add feedback submission.
- Do not implement extension handoff.
- Do not add API routes, DTOs, migrations, or backend behavior.
- Do not modify `C:\Dev\NoiseCut\noise-cut-api`.
- Do not modify `C:\Dev\NoiseCut\noise-cut-extension`.

## Non-Scope

- API implementation.
- Extension behavior.
- Auth, billing, routing, persistence, saved reports, and deployment.
- Product Signal Report section generation beyond the existing verdict-style API result.

## Existing API Constraints

- `POST /api/analysis-jobs` accepts source type, URL, title, body, source items, metadata, extracted timestamp, and `analysisType`.
- `GET /api/analysis-jobs/{jobId}` returns job status, content hash, optional result, and optional error.
- Existing job statuses include `Pending`, `Processing`, `Completed`, `Failed`, and `Cancelled`.
- The API currently returns verdict-style `AnalysisResultResponse`, not the full Founder Product Signal Report sections.

## Required Reads

- `.ai/AI_CONTRACT.md`
- `.ai/STATE.md`
- `.ai/state/STATE.md`
- `.ai/state/snapshot.json`
- `.ai/contracts/insight-report.contract.md`
- `.ai/phases/PHASE-002-product-signal-report-api-contract.md`
- `.ai/slices/SLICE-005-add-api-readiness-and-metadata-client.md`
- Existing API contract facts already recorded in Phase 002 and TASK-006.

## Implementation Notes

- The UI sends `analysisType: "ProductVerdict"`.
- The UI sends `metadata.lens: "founder"` to preserve the product intent without requiring a new backend contract.
- Pasted discussion excerpts are split into source items client-side for this first working integration.
- Raw excerpts are sent only to the API request and are not stored in browser storage or logged by UI code.
- The submit button is disabled until readiness and metadata checks report the API is compatible.

## Acceptance Criteria

- The UI can submit a Reddit or YouTube report request through the existing analysis-job endpoint.
- The UI can render an immediate completed job response.
- The UI polls job status when a non-terminal job is returned.
- The implementation does not change API or extension repos.
- The implementation does not invent a new endpoint name.
- Build and tests pass.

## Validation

- Build passes.
- Tests pass.
- AI docs validation passes.
- TASK-006 guardrails pass.

## Validation Commands

- `npm run build`
- `npm test -- --run`
- `powershell -NoProfile -ExecutionPolicy Bypass -File C:\Dev\ai-delivery-kit\scripts\validate-ai-docs.ps1 . -Topology SingleRepo`
- `powershell -NoProfile -ExecutionPolicy Bypass -File C:\Dev\ai-delivery-kit\scripts\check-ai-guardrails.ps1 . -TaskPath .\.ai\tasks\TASK-006-submit-founder-report-request.json -Strict`

## Required State Updates

- Update `.ai/STATE.md`.
- Update `.ai/state/STATE.md`.
- Update `.ai/state/snapshot.json`.
- Append `.ai/state/events.jsonl`.
- Create `.ai/verification/verification-006-submit-founder-report-request.md`.
