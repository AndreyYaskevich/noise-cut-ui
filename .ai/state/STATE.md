# Project State

This is the canonical human-readable state file for v2 workflows. Root `.ai/STATE.md` may exist for v1 compatibility.

## Project Name

NoiseCut UI

## Project Type

React + TypeScript web app repository for NoiseCut's product insight experience.

## Current Objective

Complete the Reddit-first URL-only report flow while keeping YouTube on pasted evidence only for v0.

## Current Task

url-only-submission-mode-with-api-capability-metadata

## Current Phase

Phase 002: Product Signal Report API Contract

## Current Slice

Slice 011: Plan URL-Only Report Generation

## Completed Tasks

- `TASK-001-initialize-noisecut-ui-ai-context`
- `TASK-002-define-founder-report-contract-and-api-integration`
- `TASK-003-choose-vite-react-typescript-app-scaffold`
- `TASK-004-scaffold-vite-react-typescript-app`
- `TASK-005-add-api-readiness-and-metadata-client`
- `TASK-006-submit-founder-report-request`
- `TASK-007-plan-product-signal-report-result-projection`
- `TASK-009-consume-product-signal-report-projection`
- `TASK-010-add-markdown-export-for-structured-reports`
- `TASK-011-add-report-feedback-submission`

## Last Verified Commit

Unknown

## Architecture Decisions

- `noise-cut-ui/.ai` is canonical for committed work in this repository.
- The existing NoiseCut API remains the source of truth for report generation and public contracts.
- The existing extension remains supported and should evolve into a capture/handoff tool.
- `C:\Dev\NoiseCut\.ai` is archived workspace background only.
- Use Vite + React + TypeScript with npm for the NoiseCut Web App scaffold.
- The UI currently checks the existing API via `GET /ready` and `GET /api/meta`.
- The UI submits Founder-lens report requests through existing `POST /api/analysis-jobs` and polls `GET /api/analysis-jobs/{jobId}`.
- The full Product Signal Report sections should come from an additive API-owned report projection, not a UI-only transformation of verdict results.
- The UI now prefers the additive `report` projection and falls back to the existing verdict-style `result` field.
- Markdown export is assembled in the UI from structured `job.report` data and is available only for report-backed jobs.
- Report feedback goes through the existing API feedback endpoint and avoids sending raw discussion excerpts by default.
- The UI now supports a guarded URL-only submission mode and reads eligibility from API metadata capabilities.
- v0 keeps YouTube in scope only through pasted evidence, while YouTube URL-only stays out of scope until a dedicated platform-expansion task approves it.

## Known Constraints

- Runtime app scaffold exists with Vite, React, TypeScript, npm, Vitest, and React Testing Library.
- Pasted-evidence mode still blocks report submission when no evidence items are supplied.
- URL-only mode currently depends on API metadata advertising support and is enabled for Reddit only.
- The UI must preserve YouTube pasted-evidence submission and must not advertise YouTube URL-only unless the API metadata contract explicitly changes.
- Do not modify sibling API or extension repos from this repo unless a later task explicitly coordinates cross-repo work.
- Do not invent route names, billing, auth, or source-layout details that are not backed by checked-in files.
- Founder lens is the v0 priority.
- Raw page/comment content must not be logged or stored by default.

## Forbidden Changes

- Follow `.ai/guardrails.yaml` and the active task packet.

## Validation Commands

- `powershell -NoProfile -ExecutionPolicy Bypass -File C:\Dev\ai-delivery-kit\scripts\validate-ai-docs.ps1 . -Topology SingleRepo`
- `powershell -NoProfile -ExecutionPolicy Bypass -File C:\Dev\ai-delivery-kit\scripts\check-ai-guardrails.ps1 . -TaskPath .\.ai\tasks\TASK-012-plan-url-only-report-generation.json -Strict`

## Open Questions

- What safe error contract should the API return for extraction-failed Reddit URL-only requests?
- Will the v0 app need React Router, or can it remain a single-view tool?
- What evidence threshold should justify a future YouTube URL-only expansion task?

## Known Risks

- Planning artifacts can drift from runtime reality if future scaffold changes are not written back into `.ai`.
- API contract work may overreach if it is not kept additive and tied to existing backend patterns.
- Extension compatibility could be broken later if handoff work is not regression-checked explicitly.
- Markdown export remains unavailable for verdict-only fallback jobs.
- UI/API capability metadata can drift if later API changes are not reflected in the UI contract tests.
- YouTube URL-only could accidentally expand scope unless it is revisited only after clear demand, a stable extraction source, and acceptance in API and extension repo instructions.

## Last Task Summary

- Date: 2026-07-07
- Actor: Codex
- Task: url-only-mode-ux-fallback-and-guidance
- Summary: Added persistent submission-mode guidance and automatically switched back to pasted evidence when URL-only no longer matched the current source capability.
- Files changed: `src/App.tsx`, `src/App.test.tsx`, `.ai/STATE.md`, `.ai/state/STATE.md`, `.ai/state/snapshot.json`, `.ai/state/events.jsonl`.
- Validation: `npm run build` and `npm test -- --run`.
- Remaining risks: The UI depends on the API metadata capability contract remaining accurate, and future platform expansion still needs an explicit follow-up task.
