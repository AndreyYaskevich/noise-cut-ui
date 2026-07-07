# Slice 007: Plan Product Signal Report Result Projection

## Status

Completed

## Parent Phase

`.ai/phases/PHASE-002-product-signal-report-api-contract.md`

## Goal

Define the result projection boundary for the Founder Product Signal Report so future implementation can render the full report sections without inventing UI-only report data or breaking existing API and extension flows.

## Scope

- Document the gap between the current verdict-style `AnalysisResultResponse` and the desired Product Signal Report shape.
- Define the preferred integration direction: an additive API-owned report projection returned through the existing job/result flow when feasible.
- Define the minimum UI-facing wrapper the web app should expect around a completed report.
- Identify which fields must remain optional for backward compatibility.
- Define how future UI runtime work should consume the projection once the API supports it.
- Keep the work planning/spec-only.

## Non-Goals

- Do not implement API changes.
- Do not modify `C:\Dev\NoiseCut\noise-cut-api`.
- Do not modify `C:\Dev\NoiseCut\noise-cut-extension`.
- Do not change React runtime code in this slice.
- Do not fake the full Product Signal Report sections from the current verdict-style result.
- Do not add Markdown copy, feedback submission, saved reports, auth, billing, routing, or extension handoff.

## Non-Scope

- Backend DTOs, migrations, prompts, queues, storage, and telemetry exporters.
- Frontend components beyond future planning.
- Browser extension extraction or handoff behavior.
- Final API endpoint naming beyond reusing already-verified existing endpoints.

## Current State

- TASK-006 lets the UI submit requests to `POST /api/analysis-jobs`.
- TASK-006 lets the UI poll `GET /api/analysis-jobs/{jobId}`.
- The current API result shape is verdict-oriented: verdict, summary, confidence, consensus, pros, cons, risks, topics, source, and created timestamp.
- The target v0 UI needs Founder Product Signal Report sections: executive summary, pain points, feature requests, complaints, objections/frictions, competitor mentions, demand signals, user language, content ideas, product opportunities, limitations, and metadata.
- The UI should not transform a verdict result into these sections as if it were authoritative.

## Preferred Projection Boundary

The Product Signal Report should be generated or projected by the API and consumed by the UI as structured data. The preferred shape is an additive report projection attached to the existing analysis job result flow, for example as an optional field on a completed job response or as a clearly named additive result variant advertised through API metadata.

This keeps:

- The API as the source of truth for report generation.
- The extension-compatible job flow intact.
- Future saved reports and feedback anchored to `jobId` and `contentHash`.
- The UI focused on presentation, validation, copy/export, and feedback.

## Required UI Result Wrapper

Future UI runtime work should be able to consume a completed report with:

```ts
type InsightReportJobResponse = {
  jobId: string
  status: string
  contentHash: string
  report?: InsightReportResponse | null
  result?: AnalysisResultResponse | null
  error?: ApiError | null
}
```

`report` is the desired future structured Product Signal Report. `result` remains the current verdict-style compatibility result. Existing clients should not be required to read `report`.

## Required Report Sections

The future report projection must include:

- `summary`
- `painPoints`
- `featureRequests`
- `complaints`
- `objections`
- `competitorMentions`
- `demandSignals`
- `userLanguage`
- `contentIdeas`
- `productOpportunities`
- `limitations`
- `metadata`

Each section item should support:

- `title` or `text`
- `explanation`
- optional `evidenceCount`
- optional `confidence`
- optional `sourceReferences`

## Compatibility Rules

- Do not remove or change existing `result` fields on job responses.
- Additive report fields must be optional.
- Existing extension calls to `POST /api/analysis-jobs`, `GET /api/analysis-jobs/{jobId}`, and `POST /api/feedback` must keep working.
- Deprecated analyze wrappers must not be changed by this UI planning work.
- The UI may render the current verdict-style result as a fallback until the report projection exists, but it must label and treat that as the current API result, not the final Product Signal Report.

## Future Implementation Path

1. Create a coordinated API task to add an additive Product Signal Report projection or result variant.
2. Update API metadata to advertise report capability and supported lenses if needed.
3. Update the UI API types to include optional `report`.
4. Update the UI result view to prefer `report` when present and fall back to current `result`.
5. Add Markdown copy from structured `report` data.
6. Add feedback submission against `jobId` and `contentHash`.

## Privacy Constraints

- Do not log raw comments, transcripts, source excerpts, research context, prompts, or provider responses in UI code.
- Keep section evidence references lightweight.
- Let the API repo define raw-content retention and storage behavior.
- Avoid report payloads in query strings, local storage, and telemetry.

## Observability Constraints

- Preserve `jobId`, `contentHash`, status, source type, lens, and privacy-safe error codes.
- Do not add raw source content to UI telemetry.
- Align any future UI telemetry names with the API telemetry vocabulary where possible.

## Required Reads

- `.ai/AI_CONTRACT.md`
- `.ai/STATE.md`
- `.ai/state/STATE.md`
- `.ai/state/snapshot.json`
- `.ai/contracts/insight-report.contract.md`
- `.ai/phases/PHASE-002-product-signal-report-api-contract.md`
- `.ai/slices/SLICE-006-submit-founder-report-request.md`
- `.ai/tasks/TASK-006-submit-founder-report-request.json`

## Acceptance Criteria

- The slice clearly states that the full Product Signal Report should come from an API-owned additive projection.
- The slice defines the current verdict-result gap.
- The slice defines the future optional `report` wrapper shape for UI consumption.
- The slice preserves existing API and extension compatibility.
- The slice is small enough to become one planning task packet.
- No runtime code, API repo files, or extension repo files are changed.

## Validation

- AI docs validation passes.
- TASK-007 guardrails pass.
- No runtime build is required because this is planning-only.

## Validation Commands

- `powershell -NoProfile -ExecutionPolicy Bypass -File C:\Dev\ai-delivery-kit\scripts\validate-ai-docs.ps1 . -Topology SingleRepo`
- `powershell -NoProfile -ExecutionPolicy Bypass -File C:\Dev\ai-delivery-kit\scripts\check-ai-guardrails.ps1 . -TaskPath .\.ai\tasks\TASK-007-plan-product-signal-report-result-projection.json -Strict`

## Risks

- The UI can drift if it keeps rendering verdict results as if they were the final report.
- The API may choose a different additive shape after backend implementation work begins.
- Adding `report` without capability metadata could make the UI rely on trial-and-error response parsing.
- Markdown copy and feedback can become harder if the report projection does not include stable section identifiers or source references.

## What Not To Do

- Do not infer report sections from `pros`, `cons`, `risks`, or `topics`.
- Do not add a new endpoint name in the UI repo.
- Do not modify sibling repos.
- Do not make extension adoption mandatory.
- Do not store raw evidence in the browser.

## Required State Updates

- Update `.ai/STATE.md`.
- Update `.ai/state/STATE.md`.
- Update `.ai/state/snapshot.json`.
- Append `.ai/state/events.jsonl`.
- Create `.ai/verification/verification-007-product-signal-report-result-projection.md`.

