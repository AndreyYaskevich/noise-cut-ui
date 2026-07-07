# Slice 002: Define Founder Report Contract And API Integration

## Status

Proposed

## Parent Phase

`.ai/phases/PHASE-002-product-signal-report-api-contract.md`

## Goal

Define the frontend-facing TypeScript contract and API integration assumptions for the Founder-lens Product Signal Report so the next task packet can prepare UI repo contract files without implementing React components, scaffolding the app, or changing the API.

## Scope

- Define the UI-side `InsightReportRequest`, `InsightReportResponse`, and shared report item shape needed by the future web app.
- Document how the UI contract maps conceptually to the existing NoiseCut API without choosing unverified new endpoint names.
- Define responsibilities for a future UI API client around readiness, metadata, report creation/status, correlation IDs, error handling, Markdown-ready report data, and feedback handoff.
- Define environment/config assumptions for a future web app API base URL, request timeout, and feature capability checks.
- Keep API and extension compatibility constraints explicit so future implementation work stays additive and backward-compatible.

## Non-Goals

- Do not implement React components.
- Do not scaffold the React + TypeScript app.
- Do not create runtime source files in this slice.
- Do not call, modify, or generate code in `C:\Dev\NoiseCut\noise-cut-api`.
- Do not call, modify, or generate code in `C:\Dev\NoiseCut\noise-cut-extension`.
- Do not add dependencies, package manifests, lockfiles, routes, build tools, or test frameworks.
- Do not decide final API endpoint names or backend DTO names.
- Do not change API or extension behavior.

## Non-Scope

- Runtime UI source files.
- API endpoint or DTO implementation.
- Extension handoff implementation.
- Sibling repo edits.
- Package, dependency, routing, framework, or build-tool decisions.
- Final backend endpoint naming.
- Auth, billing, deployment, persistence, or retention enforcement.

## Existing API Constraints

- The existing API is the source of truth for report generation, public contracts, persistence, and telemetry.
- Known reusable endpoints are `GET /ready`, `GET /api/meta`, `POST /api/analysis-jobs`, `GET /api/analysis-jobs/{jobId}`, `POST /api/v1/product-insights/analyze`, `POST /api/v1/product-insights/verdict`, and `POST /api/feedback`.
- Deprecated wrappers `POST /api/v1/analyze`, `POST /api/analyze`, `POST /api/v1/analyze/verdict`, and `POST /api/analyze/verdict` must remain compatible.
- Existing API behavior already includes readiness checks, metadata/capability discovery, background jobs, content-hash reuse, job polling, feedback references, `X-Correlation-ID`, structured telemetry, and privacy-safe logging defaults.
- Any report-specific API capability must be additive, optional for existing clients, and verified in the API repo before implementation.

## Existing Extension Compatibility Constraints

- The existing extension must continue to check `GET /ready`, read `GET /api/meta`, create jobs with `POST /api/analysis-jobs`, poll `GET /api/analysis-jobs/{jobId}`, store `jobId` and `contentHash`, and submit feedback to `POST /api/feedback`.
- The extension must not be required to adopt the web app report contract for this slice to succeed.
- No new auth requirement, direct AI-provider call, or changed feedback requirement may be introduced for the extension.
- Future extension handoff to the web app must be handled by a later explicit slice.

## UI-Side TypeScript Contract Needs

The future UI contract should define these frontend-facing shapes:

```ts
type InsightPlatform = "reddit" | "youtube"
type InsightLens = "founder" | "creator" | "marketing"

type InsightReportRequest = {
  platform: InsightPlatform
  url?: string
  lens: InsightLens
  researchContext?: string
  title?: string
  items?: InsightSourceItem[]
  comments?: InsightSourceItem[]
  metadata?: Record<string, string>
  correlationId?: string
}

type InsightSourceItem = {
  id?: string
  text: string
  author?: string
  score?: number
  depth?: number
  createdAt?: string
  metadata?: Record<string, string>
}

type InsightReportItem = {
  title?: string
  text: string
  explanation: string
  evidenceCount?: number
  confidence?: string
  sourceReferences?: string[]
}

type InsightReportResponse = {
  summary: string
  painPoints: InsightReportItem[]
  featureRequests: InsightReportItem[]
  complaints: InsightReportItem[]
  objections: InsightReportItem[]
  competitorMentions: InsightReportItem[]
  demandSignals: InsightReportItem[]
  userLanguage: InsightReportItem[]
  contentIdeas: InsightReportItem[]
  productOpportunities: InsightReportItem[]
  limitations: InsightReportItem[]
  metadata: Record<string, string>
}
```

Founder is the v0 priority, but the request contract may include `creator` and `marketing` as lens values only to avoid an immediate type churn when later lenses are intentionally enabled. UI behavior should still default to `founder` and may hide non-Founder lenses until later scope allows them.

## Proposed UI API Client Responsibilities

- Read API base URL and timeout from future web app configuration.
- Check API readiness before starting a report request.
- Read API metadata/capabilities before assuming source or report support.
- Create or request a report using an API-backed flow, preferably the existing background-job model if it can support the report contract.
- Poll report/job status when the API returns a job-style response.
- Preserve or generate a correlation ID and send it when supported.
- Normalize API errors into UI-safe messages without exposing raw content.
- Return structured report data that the UI can render and copy as Markdown.
- Keep feedback submission compatible with the existing API feedback model.

## Proposed Environment And Config Needs

- `NOISECUT_API_BASE_URL` or the eventual framework-specific public equivalent for browser-side API calls.
- `NOISECUT_API_TIMEOUT_MS` or equivalent request timeout setting.
- Optional feature/capability flag for Product Signal Report availability if the API exposes it through metadata.
- No secrets in browser-exposed configuration.
- No auth, billing, or deployment configuration until a later scoped phase approves it.

## Privacy Constraints

- Do not log raw page, post, comment, transcript, prompt, or provider-response content in the UI.
- Do not store raw extracted content in browser storage by default.
- Treat `researchContext`, `items`, and `comments` as sensitive user-provided or extracted content.
- Keep feedback lightweight and reference-based unless a later privacy-reviewed task expands the contract.
- Let API repo policy define retention and storage rules for any submitted raw evidence.

## Observability Constraints

- Capture only privacy-safe dimensions such as platform, lens, UI surface, request status, job status, outcome, error code, and latency bucket.
- Propagate `correlationId` where supported.
- Do not emit raw URLs if later telemetry policy treats them as sensitive; prefer source type and hashed or server-issued identifiers when available.
- Align with API telemetry fields rather than inventing unrelated observability names.

## Files Likely Involved

- `.ai/slices/SLICE-002-define-founder-report-contract-and-api-integration.md`
- Future task packet: `TASK-002-define-founder-report-contract-and-api-integration`
- Future contract file if approved by TASK-002: an insight-report contract document or a checked-in TypeScript contract file after app scaffold decisions exist.

## Required Reads

- `.ai/AI_CONTRACT.md`
- `.ai/STATE.md`
- `.ai/CONTEXT_INDEX.md`
- `.ai/briefs/BRIEF-noisecut-ui-v0-product-signal-web-app.md`
- `.ai/phases/PHASE-002-product-signal-report-api-contract.md`
- `C:\Dev\NoiseCut\noise-cut-api\AGENTS.md`
- `C:\Dev\NoiseCut\noise-cut-api\.ai\STATE.md`
- `C:\Dev\NoiseCut\noise-cut-api\.ai\contracts\api.openapi.json`
- `C:\Dev\NoiseCut\noise-cut-api\README.md`
- `C:\Dev\NoiseCut\noise-cut-api\docs\contract-v1.md`
- `C:\Dev\NoiseCut\noise-cut-extension\AGENTS.md`
- `C:\Dev\NoiseCut\noise-cut-extension\.ai\STATE.md`
- `C:\Dev\NoiseCut\noise-cut-extension\README.md`

## Implementation Rules

- Stay inside this slice.
- Keep the work planning/spec-only until a task packet explicitly allows implementation.
- Do not change public API contracts unless a later cross-repo API task explicitly requires it.
- Do not introduce runtime app layout, router, framework, package manager, or dependency assumptions.
- Document unresolved API, extraction, retention, and handoff questions instead of filling them in.

## Allowed Dependencies

- None.

## Acceptance Criteria

- The slice is small enough to become one `TASK-002` task packet.
- The slice clearly separates UI contract work from API implementation work.
- The slice preserves existing API and extension compatibility.
- The slice defines the required UI request, response, and report item shapes.
- The slice defines future UI API client responsibilities without choosing unverified endpoint names.
- The slice includes privacy and observability constraints that block raw-content logging by default.
- The slice is ready to become `TASK-002`.

## Validation Checklist

- Confirm this slice references Phase 002 as its parent.
- Confirm no runtime app files, API repo files, or extension repo files are changed.
- Confirm the request contract includes `platform`, optional `url`, `lens`, optional `researchContext`, optional `title`, optional `items/comments`, optional `metadata`, and optional `correlationId`.
- Confirm the response contract includes `summary`, `painPoints`, `featureRequests`, `complaints`, `objections`, `competitorMentions`, `demandSignals`, `userLanguage`, `contentIdeas`, `productOpportunities`, `limitations`, and `metadata`.
- Confirm each report item supports title/text, explanation, optional evidence count, optional confidence, and optional source references.
- Run `powershell -NoProfile -ExecutionPolicy Bypass -File C:\Dev\ai-delivery-kit\scripts\validate-ai-docs.ps1 C:\Dev\NoiseCut\noise-cut-ui -Topology SingleRepo`.

## Validation Commands

- `powershell -NoProfile -ExecutionPolicy Bypass -File C:\Dev\ai-delivery-kit\scripts\validate-ai-docs.ps1 C:\Dev\NoiseCut\noise-cut-ui -Topology SingleRepo`

## Risks

- The UI contract may drift from actual API DTOs if implemented before the API report shape is approved.
- Allowing `creator` and `marketing` in the type may imply product support before UI behavior actually enables those lenses.
- A future API implementation may choose a job result envelope that requires a wrapper around `InsightReportResponse`.
- URL-only report generation may require API-side extraction that is not yet specified.
- Extension handoff payload shape remains unresolved and must not be guessed in this slice.

## What Not To Do

- Do not scaffold the React app.
- Do not create UI components.
- Do not create an API client implementation.
- Do not create or edit backend endpoints.
- Do not edit extension extraction, popup, or API client code.
- Do not add auth, billing, storage, telemetry exporters, or new dependencies.
- Do not send raw content to logs, telemetry, query strings, or local storage.
- Do not claim the API already supports the full Product Signal Report response until verified by a dedicated API task.

## Required State Updates

- When this slice is implemented through a task packet, update `.ai/STATE.md` with the completed planning/spec work, validation results, remaining risks, and next task.
- If advanced state is in scope for that task packet, also update `.ai/state/STATE.md`, `.ai/state/snapshot.json`, and `.ai/state/events.jsonl`.
