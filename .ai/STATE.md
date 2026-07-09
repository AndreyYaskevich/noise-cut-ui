# Project State

This file is the minimum required handoff state for the project. Keep it current even when the project also uses `.ai/state/` for advanced event-sourced state.

## Project Name

NoiseCut UI

## Project Type

Single-repo React + TypeScript + Vite web app for NoiseCut's Allegro seller Product Risk & Opportunity Report workspace.

## Current Objective

Formalize the existing hand-rolled en/pl localization (consolidate duplicated string dictionaries, adopt a real i18n library, stop trusting backend-translated error text) without breaking the shipped Allegro MVP 0.1 or the sibling `noise-cut-extension` handoff.

## Current Phase

Phase 003: Localization Hardening

## Current Slice

Slice 013: Consolidate Duplicated Translation Dictionaries

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
- **Superseded**: Slice 011 ("Plan URL-Only Report Generation", Reddit/YouTube-focused) targeted a product direction the shipped code no longer follows. Left in place as historical record.
- **Slice 012 (Completed 2026-07-09)**: Added `i18next@26.3.5`/`react-i18next@17.0.8`/`i18next-browser-languagedetector@8.2.1` (pinned per ADR-003), wired `I18nextProvider` into `main.tsx`, and mechanically ported all ~140 keys from `src/i18n.ts` into 5 namespace JSON files (`common`, `forms`, `errors`, `report`, `diagnostics`) under `src/locales/{en,pl}/`. `src/i18n.ts` untouched — zero visible behavior change. `npm run build` and `npm test -- --run` (39/39) passed. See `.ai/verification/verification-012-add-i18next-library-and-mechanical-string-port.md`.
- **Allegro MVP 0.1 (retroactive entry)**: commit `bf6ac02` ("checking before switching to claude allegro status", 2026-07-08) shipped the actual v0.1 UI directly to the working tree, outside the AI slice/task workflow: the full Allegro report workspace (`src/App.tsx`, dashboard/new-report/history/settings views, `BetaAccessPanel`), a hand-rolled en/pl localization layer (`src/i18n.ts`), API client error handling (`src/api/noiseCutApi.ts`), and Markdown export (`src/reportMarkdown.ts`). This is documented here and in `ADR-002` rather than reconstructed as fictitious historical slices, per this repo's own rule that facts must come from checked-in source.

## Last Verified Commit

`bf6ac02` ("checking before switching to claude allegro status", 2026-07-08) — working tree was clean at time of this reconciliation.

## Architecture Decisions

- `noise-cut-ui/.ai` is canonical for committed work in this repository.
- The existing NoiseCut API remains the source of truth for report generation, public contracts, persistence, and telemetry behavior.
- The existing extension remains supported and should evolve into a capture/handoff tool rather than being replaced by this repo.
- `C:\Dev\NoiseCut\.ai` is archived workspace background only and is not canonical for new work.
- Use Vite + React + TypeScript with npm for the NoiseCut Web App scaffold.
- **The actual v0.1 UI is the Allegro Product Risk & Opportunity Report workspace** (dashboard, new-report form, history, settings, beta-access gating) — not the Reddit/YouTube "Founder lens" narrative this file previously described. `docs/noisecut-v0.1-product.md` in `noise-cut-api` is the authoritative product definition.
- A functioning UI-language switcher and a separate report-language selector already exist and persist to `localStorage` — must be preserved (not reinvented) through the i18n migration.
- Localization already exists (`src/i18n.ts`) but is duplicated across four separate string dictionaries (`src/i18n.ts`, `src/reportMarkdown.ts`, `src/App.tsx`, `src/api/noiseCutApi.ts`) and bypassed entirely by several hardcoded strings and aria-labels. Correcting this is the goal of the current Localization Hardening phase (see `.ai/slices/SLICE-012..019`).
- The UI currently prefers the API's server-supplied `error.message` over local code-based translation — this must change so the UI translates from `error.code` (+ future `params`), matching the target architecture where the backend never localizes UI-facing text.
- Adopt `react-i18next`/`i18next` for the migration (Slice 012) — its built-in `Intl.PluralRules`-based pluralization handles Polish's three plural forms correctly, which manual string concatenation in the current code does not (see `ADR-003`).
- **Cross-repo update (2026-07-09)**: `noise-cut-api` confirmed and corrected its error contract so `ApiError.Message` is now always English, never varying by `Accept-Language` (see `noise-cut-api/.ai/adr/ADR-001-*.md` Decision 6). This simplifies Slice 015's fallback story here — when a `code` is unmapped, falling back to server `message` will always show English text, which is expected/acceptable degraded behavior, not a language-consistency bug.

## Known Constraints

- Runtime UI scaffold exists with Vite, React, TypeScript, npm, Vitest, and React Testing Library.
- The Allegro report form still blocks submission when required evidence/keyword fields are empty or too short.
- Do not modify `C:\Dev\NoiseCut\noise-cut-api` or `C:\Dev\NoiseCut\noise-cut-extension` from this repo unless a later task explicitly coordinates cross-repo work.
- Do not invent API routes, auth behavior, billing behavior, storage policy, or source-layout details that are not backed by checked-in files.
- Raw page/comment/evidence content must not be logged or stored by default.
- The API error-translation layer (Slice 016) depends on the backend's additive `ApiError.Params` field (`noise-cut-api` Slice 010) — sequence after that ships.

## Forbidden Changes

- Do not introduce dependencies beyond what an active slice allows (Slice 012 explicitly allows `i18next`/`react-i18next`/`i18next-browser-languagedetector`).
- Do not change public contracts unless the active slice requires it.
- Do not perform broad refactors outside a refactor slice.
- Do not modify `noise-cut-api` or `noise-cut-extension` from this repo.

## Validation Commands

- `powershell -NoProfile -ExecutionPolicy Bypass -File C:\Dev\ai-delivery-kit\scripts\validate-ai-docs.ps1 . -Topology SingleRepo`
- `npm run build`
- `npm test -- --run`

## Open Questions

- What safe error contract should the API return for extraction-failed requests (carried over, still relevant)?
- Should `i18next`/`react-i18next` be pinned to explicit versions given `package.json` currently pins everything to `"latest"`?
- Should the frontend read `SUPPORTED_LANGUAGES` from `GET /api/meta` at boot instead of hardcoding its own copy, or is that premature given both lists are `["en","pl"]` today?

## Known Risks

- Planning artifacts can drift from runtime reality if future scaffold changes are not reflected back into `.ai` — this reconciliation exists because that already happened once.
- The four existing duplicated string dictionaries have already drifted from each other; consolidating them (Slice 013) risks introducing wording regressions if not diff-reviewed carefully.
- Existing tests assert on exact literal translated strings; migrating to `i18next` requires nontrivial test rework (Slice 019).
- Extension compatibility could be broken later if handoff work is not regression-checked explicitly (carried over).
- The API error-translation layer (Slice 016) is blocked on `noise-cut-api` shipping the additive `Params` field first.

## Last Task Summary

- Date: 2026-07-09
- Actor: Claude
- Task: add-i18next-library-and-mechanical-string-port (Slice 012)
- Summary: Added `i18next`/`react-i18next`/`i18next-browser-languagedetector` (pinned versions), wired `I18nextProvider`, and mechanically ported all `strings.en`/`strings.pl` keys from `src/i18n.ts` into 5 namespace JSON files. `src/i18n.ts` untouched; zero visible behavior change. Also recorded that `noise-cut-api` confirmed `ApiError.Message` is now always English (cross-repo fact relevant to Slice 015).
- Files changed: `package.json`, `package-lock.json`, `src/locales/{en,pl}/{common,forms,errors,report,diagnostics}.json`, `src/i18nSetup.ts`, `src/i18nSetup.test.ts`, `src/main.tsx`, `.ai/slices/SLICE-012-*.md`, `.ai/tasks/TASK-013-*.json`, `.ai/verification/verification-012-*.md`, `.ai/STATE.md`, `.ai/state/STATE.md`, `.ai/state/snapshot.json`, `.ai/state/events.jsonl`.
- Validation: `npm run build` passed; `npm test -- --run` passed 39/39.
- Remaining risks: consolidating the four duplicated string dictionaries (Slice 013) risks wording drift; test-suite migration cost is nontrivial and not yet budgeted into a specific timeframe.

Prior task (2026-07-08, reconcile-ai-context-with-shipped-allegro-mvp): corrected `.ai/STATE.md`, `AGENTS.md`, `CLAUDE.md`, `.ai/ROADMAP.md`, and `.ai/DECISIONS.md` to reflect the actually-shipped Allegro Product Risk & Opportunity Report UI (commit `bf6ac02`); added `ADR-002`/`ADR-003`; opened Phase 003 (Localization Hardening) with Slices 012-019.
