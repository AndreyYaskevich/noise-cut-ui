# Project State

This file is the minimum required handoff state for the project. Keep it current even when the project also uses `.ai/state/` for advanced event-sourced state.

## Project Name

NoiseCut UI

## Project Type

Single-repo React + TypeScript web app repository for NoiseCut's product insight experience.

## Current Objective

Complete the Reddit-first URL-only report flow while keeping YouTube on pasted evidence only for v0.

## Current Phase

Phase 002: Product Signal Report API Contract

## Current Slice

Slice 011: Plan URL-Only Report Generation

## Completed Slices

- Slice 1: Align AI-delivery-kit artifacts and define Web App v0.
- Slice 002: Define Founder Report Contract And API Integration.
- Slice 003: Choose Vite React TypeScript App Scaffold.
- Slice 004: Scaffold Vite React TypeScript App.
- Slice 005: Add API Readiness And Metadata Client.
- Slice 006: Submit Founder Report Request.
- Slice 007: Plan Product Signal Report Result Projection.
- Slice 008: Consume Product Signal Report Projection.
- Slice 009: Add Markdown Export For Structured Reports.
- Slice 010: Add Report Feedback Submission.

## Last Verified Commit

Unknown

## Architecture Decisions

- `noise-cut-ui/.ai` is canonical for committed work in this repository.
- The existing NoiseCut API remains the source of truth for report generation, public contracts, persistence, and telemetry behavior.
- The existing extension remains supported and should evolve into a capture/handoff tool rather than being replaced by this repo.
- `C:\Dev\NoiseCut\.ai` is archived workspace background only and is not canonical for new work.
- Use Vite + React + TypeScript with npm for the NoiseCut Web App scaffold.
- The UI currently checks the existing API via `GET /ready` and `GET /api/meta`.
- The UI submits Founder-lens report requests through existing `POST /api/analysis-jobs` and polls `GET /api/analysis-jobs/{jobId}`.
- The full Product Signal Report sections should come from an additive API-owned report projection, not a UI-only transformation of verdict results.
- The UI now prefers the additive `report` projection and falls back to the existing verdict-style `result` field.
- Markdown export is assembled in the UI from structured `job.report` data and is available only for report-backed jobs.
- Report feedback goes through the existing API feedback endpoint and avoids sending raw discussion excerpts by default.
- The UI now offers both pasted-evidence and URL-only submission modes.
- URL-only mode is enabled from API metadata capabilities rather than hardcoded UI source rules.
- v0 product scope is Reddit URL-only plus Reddit/YouTube pasted evidence; YouTube URL-only is out of scope until an explicit platform-expansion task approves it.

## Known Constraints

- Runtime UI scaffold exists with Vite, React, TypeScript, npm, Vitest, and React Testing Library.
- Pasted-evidence mode still blocks report submission when no evidence items are supplied.
- URL-only mode currently depends on API metadata advertising support and is enabled for Reddit only.
- The UI must keep `Paste evidence` working for YouTube and must not infer that YouTube URL-only exists unless the API metadata contract explicitly advertises it.
- Do not modify `C:\Dev\NoiseCut\noise-cut-api` or `C:\Dev\NoiseCut\noise-cut-extension` from this repo unless a later task explicitly coordinates cross-repo work.
- Do not invent API routes, auth behavior, billing behavior, storage policy, or source-layout details that are not backed by checked-in files.
- Founder lens is the v0 priority.
- Raw page/comment content must not be logged or stored by default.

## Forbidden Changes

- Do not introduce dependencies unless the active slice allows them.
- Do not change public contracts unless the active slice requires it.
- Do not perform broad refactors outside a refactor slice.
- Do not create runtime app code during docs-only AI alignment tasks.
- Runtime app code should stay inside scoped implementation tasks.

## Validation Commands

- `powershell -NoProfile -ExecutionPolicy Bypass -File C:\Dev\ai-delivery-kit\scripts\validate-ai-docs.ps1 . -Topology SingleRepo`
- `powershell -NoProfile -ExecutionPolicy Bypass -File C:\Dev\ai-delivery-kit\scripts\check-ai-guardrails.ps1 . -TaskPath .\.ai\tasks\TASK-012-plan-url-only-report-generation.json -Strict`

## Open Questions

- What safe error contract should the API return for extraction-failed Reddit URL-only requests?
- Will the v0 app need React Router, or can it remain a single-view tool?
- What evidence threshold should trigger a later decision to expand URL-only beyond Reddit?

## Known Risks

- Planning artifacts can drift from runtime reality if future scaffold changes are not reflected back into `.ai`.
- API contract work may overreach if it is not kept additive and tied to existing backend patterns.
- Extension compatibility could be broken later if handoff work is not regression-checked explicitly.
- Markdown export remains unavailable for verdict-only fallback jobs.
- UI/API capability metadata can drift if later API changes are not reflected in the UI contract tests.
- Future YouTube URL-only work could broaden scope prematurely unless it is gated behind explicit demand, a stable extraction source, and acceptance in API and extension repo instructions.

## Last Task Summary

- Date: 2026-07-07
- Actor: Codex
- Task: URL-only mode UX fallback and guidance
- Summary: Added always-visible submission-mode guidance and automatically returned the form to pasted-evidence mode when URL-only stopped being valid for the current source.
- Files changed: `src/App.tsx`, `src/App.test.tsx`, `.ai/STATE.md`, and `.ai/state/*`.
- Validation: `npm run build` and `npm test -- --run`.
- Remaining risks: The UI still depends on the API metadata capability contract remaining accurate, and later platform expansion could drift if not handled as an explicit follow-up task.
