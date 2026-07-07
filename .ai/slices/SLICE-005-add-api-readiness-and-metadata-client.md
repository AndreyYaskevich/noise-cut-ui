# Slice 005: Add API Readiness And Metadata Client

## Status

Completed

## Parent Phase

Follow-up to `.ai/contracts/insight-report.contract.md` and the Vite scaffold.

## Goal

Add the first UI runtime integration with the existing NoiseCut API by checking readiness and metadata only, without implementing report generation, feedback, or extension handoff.

## Scope

- Add a small browser API client for `GET /ready` and `GET /api/meta`.
- Use existing Vite environment config for API base URL and timeout.
- Display API connection, readiness, and capability state in the scaffold UI.
- Add tests for the API client and UI states.
- Keep report generation button non-functional for now.

## Non-Scope

- `POST /api/analysis-jobs`.
- `GET /api/analysis-jobs/{jobId}`.
- Product Signal Report generation.
- Markdown copy.
- Feedback submission.
- Extension handoff.
- API or extension repo changes.

## Files Likely Involved

- `src/api/**`
- `src/App.tsx`
- `src/App.test.tsx`
- `src/config.ts`
- `src/**/*.test.ts`
- `.ai/**`

## Required Reads

- `.ai/AI_CONTRACT.md`
- `.ai/STATE.md`
- `.ai/CONTEXT_INDEX.md`
- `.ai/contracts/insight-report.contract.md`
- `.ai/slices/SLICE-005-add-api-readiness-and-metadata-client.md`

## Implementation Rules

- Do not invent report endpoints.
- Do not send raw source content.
- Do not add dependencies.
- Keep API errors UI-safe.
- Preserve extension compatibility by not touching sibling repos.

## Allowed Dependencies

- None.

## Acceptance Criteria

- UI can call `/ready` and `/api/meta` using configured API base URL.
- UI renders reachable, ready, unsupported, and error states safely.
- Tests cover client success/failure and UI rendering.
- `npm run build` and `npm test -- --run` pass.

## Validation Commands

- `npm run build`
- `npm test -- --run`
- `powershell -NoProfile -ExecutionPolicy Bypass -File C:\Dev\ai-delivery-kit\scripts\validate-ai-docs.ps1 . -Topology SingleRepo`
- `powershell -NoProfile -ExecutionPolicy Bypass -File C:\Dev\ai-delivery-kit\scripts\check-ai-guardrails.ps1 . -TaskPath .\.ai\tasks\TASK-005-add-api-readiness-and-metadata-client.json -Strict`

## Required State Updates

- Update `.ai/STATE.md`.
- Update `.ai/state/STATE.md`, `.ai/state/snapshot.json`, and `.ai/state/events.jsonl`.
- Add verification evidence for TASK-005.
