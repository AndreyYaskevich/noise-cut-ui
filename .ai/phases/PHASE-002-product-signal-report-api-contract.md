# Phase 002: Product Signal Report API Contract

## Status

Proposed

## Goal

Define the Founder-lens Product Signal Report request model, response model, and API integration approach for the future NoiseCut Web App before any React scaffold or runtime implementation begins.

## Purpose

This phase exists to keep the web app aligned with the existing NoiseCut API and browser extension. Report generation must remain API-owned, API changes must be thin and backward-compatible, and extension-facing flows must keep working while the web app is added as a separate product experience.

## Current API And Extension Constraints

- `C:\Dev\NoiseCut\noise-cut-api` is the source of truth for report generation behavior, public API contracts, persistence, and telemetry.
- The checked-in API contract currently documents these reusable endpoints: `GET /ready`, `GET /api/meta`, `POST /api/analysis-jobs`, `GET /api/analysis-jobs/{jobId}`, `POST /api/v1/product-insights/analyze`, `POST /api/v1/product-insights/verdict`, and `POST /api/feedback`.
- Deprecated compatibility wrappers `POST /api/v1/analyze`, `POST /api/analyze`, `POST /api/v1/analyze/verdict`, and `POST /api/analyze/verdict` still exist and must not be broken by this phase.
- The API already supports source metadata, supported source and analysis type discovery, background analysis jobs, content-hash reuse, job polling, feedback references, correlation IDs, structured telemetry, and privacy-safe logging defaults.
- `C:\Dev\NoiseCut\noise-cut-extension` depends on the existing API readiness, metadata compatibility, analysis-job, job-status, and feedback flows.
- The extension checks `GET /ready`, reads API metadata from `GET /api/meta`, creates background jobs through `POST /api/analysis-jobs`, polls `GET /api/analysis-jobs/{jobId}`, stores `jobId` and `contentHash`, and submits feedback to `POST /api/feedback`.
- The extension must not be required to adopt the web app report contract during this phase.

## Proposed Founder Product Signal Report Integration Approach

- Prefer a web-app integration based on the existing background-job model so report generation can reuse API-side queuing, content hashing, status polling, persistence, and retry behavior.
- Use existing product-insight/source-document concepts where possible instead of defining a disconnected UI-only report request.
- Treat the Founder lens as the only committed v0 lens. Creator and Marketing lenses remain deferred unless a later phase expands scope.
- Add only a thin API capability later if the existing `ProductVerdictResponse` or `AnalysisResultResponse` shapes cannot express the Product Signal Report sections.
- Any additive API behavior should be report-oriented, optional for existing clients, and compatible with current extension behavior.
- Do not choose a final endpoint name in this UI phase unless it is first verified against API repo source and accepted in an explicit API task.

## Existing API Behavior That Can Be Reused

- Readiness and dependency checks through `GET /ready`.
- API contract and capability discovery through `GET /api/meta`.
- Source document submission through `POST /api/analysis-jobs`.
- Background job status and result polling through `GET /api/analysis-jobs/{jobId}`.
- Existing product-insight analysis through `POST /api/v1/product-insights/analyze`.
- Existing quick verdict analysis through `POST /api/v1/product-insights/verdict`.
- Privacy-safe feedback submission through `POST /api/feedback`.
- Content-hash reuse for repeated analysis requests.
- `X-Correlation-ID` support for request tracing.
- Structured telemetry fields such as source type, analysis type, job status, outcome, error code, AI provider, and AI model.

## Thin Additive API Behavior That May Be Needed

- A report-oriented analysis type or result projection that returns structured Product Signal Report sections.
- Optional response fields for report metadata and Markdown rendering support.
- Optional feedback metadata that can distinguish web-app report feedback from extension feedback without changing the existing feedback endpoint contract.
- Optional API metadata additions that advertise report capability and supported lenses.
- Any additive behavior must preserve existing request and response contracts for the extension and deprecated compatibility wrappers.

## Required UI Request Model

The future web app should be able to send or derive a request with:

- URL submitted by the user.
- Source type inferred or user-confirmed as `reddit` or `youtube`.
- Selected lens, with `Founder` as the v0 default.
- Optional research context supplied by the user.
- Source metadata such as platform, canonical URL, external ID when known, title when known, adapter or extraction version when known, and request timestamp.
- Extracted or API-provided evidence items, depending on the final extraction responsibility.
- Privacy-safe client metadata such as UI surface, report mode, and non-content diagnostics.

The request model must not require the UI to log raw page, post, comment, or transcript content.

## Required UI Response Model

The future web app needs a response or completed job result with:

- `reportId` or `jobId`.
- `contentHash`.
- Status.
- Source metadata.
- Generated timestamp.
- Executive summary.
- Pain points.
- Feature requests.
- Complaints.
- Objections and frictions.
- Competitor mentions.
- Demand signals.
- User language.
- Content ideas.
- Product opportunities.
- Limitations.
- Metadata.
- Markdown export text or enough structured report data for the UI to render and copy Markdown.
- Standard API error envelope compatible with existing error handling.

## Backward Compatibility Rules

- Do not remove, rename, or change required behavior for `/api/analysis-jobs`, `/api/feedback`, `/ready`, `/api/meta`, product-insight endpoints, or deprecated analyze wrappers.
- Additive response fields must be optional for existing clients.
- Existing extension request payloads must remain accepted.
- Existing extension response parsing must not require new fields.
- Existing feedback kinds and modes must remain valid.
- Any new report analysis type must not change the semantics of existing `GeneralVerdict`, `ProductVerdict`, `MarketSentiment`, `RiskAnalysis`, or `CompetitorAnalysis` behavior.

## Extension Safety Rules

- Do not require extension code changes to complete this phase.
- Do not require new authentication for extension flows.
- Do not introduce direct AI-provider calls from the extension.
- Do not replace the extension's current readiness, metadata, background job, polling, local saved job state, or feedback flows.
- Treat future extension handoff to the web app as a later explicit slice, not part of this phase's implementation.

## Data And Privacy Rules

- Product Signal Report generation belongs in the API, not in this UI repo.
- Raw page, post, comment, or transcript content must not be logged by the UI.
- API retention and storage behavior must come from the API repo's checked-in policy and contracts.
- Feedback should remain reference-based and lightweight unless a later privacy-reviewed task expands the contract.
- Any future handoff mechanism should avoid large raw-content payloads in query strings.

## Observability Expectations

- The web app should propagate a correlation ID when supported or preserve the API-generated correlation ID from responses.
- Observability should follow existing API telemetry patterns.
- Useful dimensions include source type, analysis type, lens, job status, outcome, error code, and UI surface.
- Logs and telemetry must not include raw page, post, comment, transcript, prompt, or provider-response content by default.

## Open Questions

- What exact additive API shape, if any, should carry the Product Signal Report?
- Should v0 report generation use only the background job flow, a synchronous product-insight endpoint, or a hybrid?
- What exact analysis type name should represent the Founder Product Signal Report?
- Should the API extract Reddit and YouTube URL content itself, or should the UI and extension supply extracted evidence?
- Should Markdown be generated by the API or assembled by the web app from structured report sections?
- Which report metadata fields are required for saved reports, feedback, and later extension handoff?
- What retention or cleanup policy applies to raw extracted evidence used for report generation?

## Risks

- UI planning can drift from API reality if future slices invent endpoint names or response fields without API repo verification.
- Extension compatibility can break if new API behavior changes existing analysis-job, metadata, readiness, or feedback semantics.
- The report schema can become too large before the API proves which sections are reliably generated.
- Raw extracted content retention remains a privacy risk until API storage and cleanup rules are explicit.
- Existing validation command examples in UI state may use stale `C:\Dev\noise-cut-ui` paths instead of `C:\Dev\NoiseCut\noise-cut-ui`.

## Slices

| Slice | Goal | Status |
| --- | --- | --- |
| `SLICE-002-document-existing-api-and-extension-contracts-for-web-app.md` | Summarize reusable API and extension behavior for web-app planning. | Proposed |
| `SLICE-003-define-founder-product-signal-report-contract.md` | Define the Founder-lens request model, response model, report sections, and Markdown needs. | Proposed |
| `SLICE-004-plan-additive-api-report-integration.md` | Decide whether existing analysis jobs are sufficient or a thin additive API capability is required. | Proposed |
| `SLICE-005-plan-ui-api-client-and-feedback-contract.md` | Define how the future UI will call readiness, metadata, report generation/status, Markdown copy support, and feedback. | Proposed |

## Acceptance Criteria

- The phase defines a Founder-lens Product Signal Report integration shape that future slices can turn into task packets.
- The phase names only API endpoints and extension flows discovered from checked-in sibling repo artifacts.
- The phase defines the required report sections: executive summary, pain points, feature requests, complaints, objections/frictions, competitor mentions, demand signals, user language, content ideas, product opportunities, limitations, and metadata.
- The phase explicitly forbids API implementation, React scaffolding, sibling repo modification, and runtime code changes.
- The phase keeps all API changes additive and backward-compatible by default.
- The phase documents open questions and risks instead of inventing unresolved API, extraction, retention, auth, billing, or handoff behavior.

## Non-Goals

- Do not implement API changes.
- Do not scaffold or implement the React + TypeScript web app.
- Do not modify `C:\Dev\NoiseCut\noise-cut-api`.
- Do not modify `C:\Dev\NoiseCut\noise-cut-extension`.
- Do not create task packets or slice files in this step.
- Do not choose final endpoint names, auth behavior, billing behavior, storage policy, or deployment details.

## Required Context

- `.ai/AI_CONTRACT.md`
- `.ai/STATE.md`
- `.ai/CONTEXT_INDEX.md`
- `.ai/briefs/BRIEF-noisecut-ui-v0-product-signal-web-app.md`
- `C:\Dev\NoiseCut\noise-cut-api\AGENTS.md`
- `C:\Dev\NoiseCut\noise-cut-api\.ai\STATE.md`
- `C:\Dev\NoiseCut\noise-cut-api\.ai\contracts\api.openapi.json`
- `C:\Dev\NoiseCut\noise-cut-api\README.md`
- `C:\Dev\NoiseCut\noise-cut-api\docs\contract-v1.md`
- `C:\Dev\NoiseCut\noise-cut-extension\AGENTS.md`
- `C:\Dev\NoiseCut\noise-cut-extension\.ai\STATE.md`
- `C:\Dev\NoiseCut\noise-cut-extension\README.md`

## Validation

- `powershell -NoProfile -ExecutionPolicy Bypass -File C:\Dev\ai-delivery-kit\scripts\validate-ai-docs.ps1 C:\Dev\NoiseCut\noise-cut-ui -Topology SingleRepo`

## Rollback Strategy

- Delete this phase file if the Product Signal Report contract planning needs to be reworked from a different brief or coordinated multi-repo workflow.
