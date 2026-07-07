# Slice 009: Add Markdown Export For Structured Reports

## Status

Completed

## Parent Phase

`.ai/phases/PHASE-002-product-signal-report-api-contract.md`

## Goal

Add a UI-owned Markdown export path for structured Product Signal Reports without changing the existing API or extension integration behavior.

## Scope

- Add a deterministic Markdown formatter for `job.report`.
- Add a `Copy Markdown` action to the structured report result header.
- Show copy success and failure feedback in the UI.
- Keep verdict-style `job.result` fallback rendering unchanged and without export.
- Add focused formatter and UI tests.
- Update AI delivery state and verification records.

## Non-Goals

- Do not change the API repo.
- Do not change the extension repo.
- Do not add file download export.
- Do not add Markdown export for verdict-only fallback jobs.
- Do not add feedback submission, saved reports, or routing.

## Non-Scope

- API implementation.
- Extension handoff behavior.
- Saved reports, feedback workflows, invite code gating, or router work.
- File download export, PDFs, or share links.

## Required Reads

- `.ai/AI_CONTRACT.md`
- `.ai/STATE.md`
- `.ai/state/STATE.md`
- `.ai/state/snapshot.json`
- `.ai/contracts/insight-report.contract.md`
- `.ai/slices/SLICE-008-consume-product-signal-report-projection.md`
- `.ai/tasks/TASK-010-add-markdown-export-for-structured-reports.json`
- `src/App.tsx`
- `src/api/noiseCutApi.ts`

## Acceptance Criteria

- Structured report jobs show a `Copy Markdown` action.
- Verdict-only fallback jobs do not show Markdown export.
- Markdown output includes report metadata, executive summary, and only non-empty sections.
- Build and tests pass.
- No sibling repo files are changed.

## Validation Commands

- `npm run build`
- `npm test -- --run`
- `powershell -NoProfile -ExecutionPolicy Bypass -File C:\Dev\ai-delivery-kit\scripts\validate-ai-docs.ps1 . -Topology SingleRepo`
- `powershell -NoProfile -ExecutionPolicy Bypass -File C:\Dev\ai-delivery-kit\scripts\check-ai-guardrails.ps1 . -TaskPath .\.ai\tasks\TASK-010-add-markdown-export-for-structured-reports.json -Strict`

## Required State Updates

- Update `.ai/STATE.md`.
- Update `.ai/state/STATE.md`.
- Update `.ai/state/snapshot.json`.
- Append `.ai/state/events.jsonl`.
- Create `.ai/verification/verification-010-add-markdown-export-for-structured-reports.md`.
