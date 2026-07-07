# Slice 011: Plan URL-Only Report Generation

## Status

Planned

## Parent Phase

`.ai/phases/PHASE-002-product-signal-report-api-contract.md`

## Goal

Define the next cross-repo delivery unit for URL-only Product Signal Report generation, with planning anchored in `noise-cut-ui` and additive API support delivered before UI enablement.

## Scope

- Document the current UI and API constraints that block true URL-only submission today.
- Define the additive API-first contract direction for supported Reddit and YouTube URL-only job creation.
- Define the future guarded UI mode toggle and fallback manual-evidence behavior.
- Preserve extension compatibility and the existing `items[]` job flow.
- Update AI delivery state for the next coordinated slice.

## Non-Goals

- Do not implement URL-only support in the UI repo.
- Do not modify the API repo from this task.
- Do not modify the extension repo from this task.
- Do not redesign the report output, Markdown export, or feedback workflows.
- Do not invent a new endpoint unless later API inspection proves it necessary.

## Non-Scope

- Runtime implementation in `noise-cut-ui`.
- Runtime implementation in `noise-cut-api`.
- Extension handoff implementation.
- Routing, auth, invite-code gating, or saved reports.

## Required Reads

- `.ai/AI_CONTRACT.md`
- `.ai/STATE.md`
- `.ai/state/STATE.md`
- `.ai/state/snapshot.json`
- `.ai/contracts/insight-report.contract.md`
- `.ai/slices/SLICE-010-add-report-feedback-submission.md`
- `src/App.tsx`
- `src/api/noiseCutApi.ts`
- `C:\Dev\NoiseCut\noise-cut-api\Endpoints\AnalysisJobEndpoints.cs`
- `C:\Dev\NoiseCut\noise-cut-api\Services\Sources\SourceDocumentPreprocessor.cs`

## Current-State Constraints

- `noise-cut-ui` currently blocks submission when parsed evidence items are empty.
- `noise-cut-api` currently rejects `POST /api/analysis-jobs` requests that omit usable `items[]`.
- `noise-cut-api` preprocessing still depends on supplied source items and returns validation failures when no usable items remain.
- True URL-only Product Signal Report generation is not currently supported.
- Enabling URL-only therefore requires additive API behavior, not just a UI form change.

## Target Architecture And Delivery Order

1. API-first additive capability:
   - Extend the existing `POST /api/analysis-jobs` contract to support URL-only requests for supported `sourceType` values.
   - Keep existing evidence-driven requests valid and unchanged.
   - Preserve extension compatibility and backward compatibility for existing clients.
2. UI follow-up:
   - Add an explicit mode toggle:
     - `Paste evidence`
     - `Use URL only`
   - Keep `Paste evidence` working exactly as today.
   - Keep `Use URL only` visible but gated until API support exists.
   - Enable URL-only submission through the same job flow only after additive API support lands.

## Intended Contract Direction

- Existing endpoint remains `POST /api/analysis-jobs`.
- Existing request shape remains backward-compatible.
- API gains additive support for URL-only requests for supported `sourceType` values.
- `items` become optional only for supported URL-extraction flows.
- Unsupported or extraction-failed URL-only requests return safe validation or capability errors.
- Extension-style extracted-content submission remains unchanged.

## UI Behavior To Lock In

- Add a submission mode control:
  - `Paste evidence`
  - `Use URL only`
- Default mode is `Paste evidence`.
- Before API support exists:
  - `Use URL only` remains visible but unavailable, with explanatory copy.
- After API support exists:
  - `Use URL only` disables the excerpts requirement.
  - `Paste evidence` remains available as a manual fallback mode.
- Report rendering, Markdown export, and feedback remain unchanged after job completion.

## Acceptance Criteria

- The planning artifact clearly states that URL-only is a cross-repo capability with API-first delivery.
- It documents the current repo-backed constraints in both UI and API.
- It locks in the future UI mode toggle and additive API direction without inventing a new endpoint.
- It preserves backward compatibility for the existing API and extension flow.
- It is ready to become the source of truth for later API and UI implementation tasks.

## Validation Commands

- `powershell -NoProfile -ExecutionPolicy Bypass -File C:\Dev\ai-delivery-kit\scripts\validate-ai-docs.ps1 . -Topology SingleRepo`
- `powershell -NoProfile -ExecutionPolicy Bypass -File C:\Dev\ai-delivery-kit\scripts\check-ai-guardrails.ps1 . -TaskPath .\.ai\tasks\TASK-012-plan-url-only-report-generation.json -Strict`

## Required State Updates

- Update `.ai/STATE.md`.
- Update `.ai/state/STATE.md`.
- Update `.ai/state/snapshot.json`.
- Append `.ai/state/events.jsonl`.
- Create `.ai/verification/verification-012-plan-url-only-report-generation.md`.
