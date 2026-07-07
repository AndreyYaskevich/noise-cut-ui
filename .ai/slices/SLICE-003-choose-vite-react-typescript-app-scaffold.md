# Slice 003: Choose Vite React TypeScript App Scaffold

## Status

Completed

## Parent Phase

`.ai/phases/PHASE-002-product-signal-report-api-contract.md`

## Goal

Record the implementation-enabling scaffold decision for the NoiseCut Web App: Vite + React + TypeScript with npm, browser-safe API configuration, and a small client-side app structure that can consume the Founder Product Signal Report contract in a later implementation task.

## Scope

- Document Vite + React + TypeScript as the selected v0 scaffold.
- Document npm as the selected package manager.
- Define the future app source root as `src/`.
- Define browser-safe environment variable names for the future API client.
- Define the expected test stack for future implementation.
- Preserve the rule that no runtime app code is created in this slice.
- Prepare enough scope for one TASK-003 task packet.

## Non-Scope

- Creating `package.json`, lockfiles, Vite config, `src/`, tests, or runtime source files.
- Installing dependencies.
- Implementing React components.
- Implementing routing.
- Implementing API client code.
- Changing `noise-cut-api` or `noise-cut-extension`.
- Choosing deployment infrastructure, auth, billing, or backend-for-frontend behavior.

## Scaffold Decision

- Framework/build tool: Vite.
- UI runtime: React.
- Language: TypeScript.
- Package manager: npm.
- Runtime shape: client-side web app that calls the existing NoiseCut API directly.
- Source root: `src/`.
- Initial routing: no router required for v0 unless a later slice introduces multiple app views that need routeable URLs.
- Test stack: Vitest plus React Testing Library when runtime implementation begins.
- Styling: local CSS or CSS modules by default unless a later UI slice explicitly chooses a design system.

## Environment And Config Decision

- Future browser-safe API base URL variable: `VITE_NOISECUT_API_BASE_URL`.
- Future browser-safe API timeout variable: `VITE_NOISECUT_API_TIMEOUT_MS`.
- No browser-exposed secrets.
- No auth, billing, persistence, or deployment config in the scaffold decision.
- Future API client should use the existing readiness and metadata endpoints before report generation.

## Compatibility Constraints

- Product Signal Report generation remains API-owned.
- Runtime implementation must not break existing extension flows.
- Existing extension-facing API endpoints and deprecated wrappers remain out of scope for UI scaffold work.
- The future scaffold must leave room for the contract in `.ai/contracts/insight-report.contract.md` to become runtime TypeScript types later.

## Files Likely Involved

- `.ai/slices/SLICE-003-choose-vite-react-typescript-app-scaffold.md`
- Future task packet: `TASK-003-choose-vite-react-typescript-app-scaffold`
- Future ADR if TASK-003 implements it: a Vite React TypeScript scaffold decision record.

## Required Reads

- `.ai/AI_CONTRACT.md`
- `.ai/STATE.md`
- `.ai/CONTEXT_INDEX.md`
- `.ai/briefs/BRIEF-noisecut-ui-v0-product-signal-web-app.md`
- `.ai/phases/PHASE-002-product-signal-report-api-contract.md`
- `.ai/contracts/insight-report.contract.md`
- `.ai/slices/SLICE-003-choose-vite-react-typescript-app-scaffold.md`

## Implementation Rules

- Stay inside this slice.
- Keep TASK-003 planning-only unless the task explicitly allows creating an ADR.
- Do not scaffold the app in TASK-003.
- Do not create runtime files until a later scaffold implementation task.
- Do not add dependencies in TASK-003.
- Do not modify sibling repos.

## Allowed Dependencies

- None.

## Acceptance Criteria

- The selected scaffold is recorded as Vite + React + TypeScript.
- npm is recorded as the package manager.
- Future env var names are recorded as `VITE_NOISECUT_API_BASE_URL` and `VITE_NOISECUT_API_TIMEOUT_MS`.
- The slice is small enough to become one TASK-003 task packet.
- The slice clearly separates scaffold decision work from scaffold implementation.
- The slice is ready to lead into a later TASK-004 app scaffold implementation.

## Validation Commands

- `powershell -NoProfile -ExecutionPolicy Bypass -File C:\Dev\ai-delivery-kit\scripts\validate-ai-docs.ps1 . -Topology SingleRepo`
- `powershell -NoProfile -ExecutionPolicy Bypass -File C:\Dev\ai-delivery-kit\scripts\check-ai-guardrails.ps1 . -TaskPath .\.ai\tasks\TASK-003-choose-vite-react-typescript-app-scaffold.json -Strict`

## Risks

- The app may later need routing, server rendering, or backend-for-frontend behavior, but v0 requirements do not justify those choices yet.
- Env var names may need adjustment if a later deployment platform imposes naming conventions.
- Test setup details may change slightly when the scaffold is generated.
- The current parent phase is contract-oriented; a later roadmap cleanup may introduce a dedicated scaffold phase.

## What Not To Do

- Do not run `npm create vite`.
- Do not create `package.json`.
- Do not install dependencies.
- Do not create `src/`.
- Do not create React components or tests.
- Do not implement API calls.
- Do not edit API or extension repos.

## Required State Updates

- When TASK-003 is implemented, update `.ai/STATE.md` with the scaffold decision and validation results.
- If advanced state is in scope for TASK-003, update `.ai/state/STATE.md`, `.ai/state/snapshot.json`, and `.ai/state/events.jsonl`.
