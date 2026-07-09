# Project State

This is the canonical human-readable state file for v2 workflows. Root `.ai/STATE.md` may exist for v1 compatibility.

## Project Name

NoiseCut UI

## Project Type

React + TypeScript + Vite web app for NoiseCut's Allegro seller Product Risk & Opportunity Report workspace.

## Current Objective

Formalize the existing hand-rolled en/pl localization (consolidate duplicated string dictionaries, adopt `react-i18next`, stop trusting backend-translated error text) without breaking the shipped Allegro MVP 0.1 or `noise-cut-extension`.

## Current Task

consolidate-duplicated-translation-dictionaries (Slice 013)

## Current Phase

Phase 003: Localization Hardening

## Current Slice

Slice 013: Consolidate Duplicated Translation Dictionaries

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
- `allegro-mvp-0.1-direct-commit-bf6ac02` (retroactive, outside AI slice/task workflow)
- `reconcile-ai-context-with-shipped-allegro-mvp`

## Superseded Tasks

- `TASK-012-plan-url-only-report-generation`

## Last Verified Commit

`bf6ac02`

## Architecture Decisions

- `noise-cut-ui/.ai` is canonical for committed work in this repository.
- The existing NoiseCut API remains the source of truth for report generation and public contracts.
- The existing extension remains supported and should evolve into a capture/handoff tool.
- **The actual v0.1 UI is the Allegro Product Risk & Opportunity Report workspace**, not the earlier Reddit/YouTube "Founder lens" narrative.
- A runtime scaffold exists (Vite, React, TypeScript, npm, Vitest, RTL) — do not claim otherwise.
- Adopt `react-i18next`/`i18next` to replace the hand-rolled `src/i18n.ts`, primarily for correct Polish pluralization and to consolidate four duplicated string dictionaries.
- The UI stops preferring server-supplied `error.message`; it translates client-side from `error.code` (+ future `params`).

## Known Constraints

- Runtime app scaffold exists with Vite, React, TypeScript, npm, Vitest, and React Testing Library.
- Do not modify sibling API or extension repos from this repo unless a later task explicitly coordinates cross-repo work.
- Do not invent route names, billing, auth, or API behavior that is not backed by checked-in files.
- Raw page/comment/evidence content must not be logged or stored by default.
- Slice 015 (API error translation layer) is blocked on `noise-cut-api` Slice 010 shipping the additive `Params` field first.

## Forbidden Changes

- Follow `.ai/guardrails.yaml` and the active task packet.
- Do not modify `noise-cut-api` or `noise-cut-extension` from this repo.

## Validation Commands

- `powershell -NoProfile -ExecutionPolicy Bypass -File C:\Dev\ai-delivery-kit\scripts\validate-ai-docs.ps1 . -Topology SingleRepo`
- `npm run build`
- `npm test -- --run`

## Open Questions

- Should `i18next`/`react-i18next` be pinned to explicit versions given `package.json` currently pins everything to `"latest"`?
- Should the frontend read `SUPPORTED_LANGUAGES` from `GET /api/meta` at boot instead of hardcoding its own copy?

## Known Risks

- The four existing duplicated string dictionaries have already drifted from each other.
- Existing tests assert on exact literal translated strings; migration requires nontrivial rework.
- Slice 015 is blocked on a cross-repo dependency (`noise-cut-api` Slice 010).

## Last Task Summary

- Date: 2026-07-09
- Actor: Claude
- Task: add-i18next-library-and-mechanical-string-port (Slice 012)
- Summary: Added i18next/react-i18next/i18next-browser-languagedetector (pinned versions), wired I18nextProvider, mechanically ported all i18n.ts keys into 5 namespace JSON files. Zero visible behavior change.
- Files changed: `package.json`, `src/locales/{en,pl}/*.json`, `src/i18nSetup.ts`, `src/i18nSetup.test.ts`, `src/main.tsx`, `.ai/slices/SLICE-012-*.md`, `.ai/tasks/TASK-013-*.json`, `.ai/verification/verification-012-*.md`, `.ai/state/STATE.md`, `.ai/state/snapshot.json`, `.ai/state/events.jsonl`.
- Validation: `npm run build` passed; `npm test -- --run` passed 39/39.
- Remaining risks: consolidating the four duplicated string dictionaries (Slice 013) risks wording drift; Slice 015 remains cross-repo dependent on `noise-cut-api` Slice 010's `Params` field.

Prior task (2026-07-08, reconcile-ai-context-with-shipped-allegro-mvp): corrected minimum and advanced AI state to describe the shipped Allegro MVP 0.1 UI instead of the stale Reddit/YouTube narrative and the false "no runtime scaffold" claim; opened Phase 003 (Localization Hardening) with Slices 012-019.
