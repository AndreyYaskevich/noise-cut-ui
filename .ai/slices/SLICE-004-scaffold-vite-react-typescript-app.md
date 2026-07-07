# Slice 004: Scaffold Vite React TypeScript App

## Status

Completed

## Parent Phase

Runtime scaffold follow-up to `.ai/adr/ADR-001-vite-react-typescript-app-scaffold.md`.

## Goal

Create the initial Vite + React + TypeScript app scaffold with npm, keeping the first runtime app minimal and ready for later Product Signal Report implementation.

## Scope

- Add npm package metadata and lockfile.
- Add Vite, React, TypeScript, Vitest, and React Testing Library setup.
- Add `index.html`, `src/`, TypeScript configs, and Vite config.
- Add a minimal accessible app shell that names NoiseCut and the v0 report workflow without implementing API integration yet.
- Add browser-safe environment variable documentation through `.env.example`.
- Keep API calls, report generation, extension handoff, auth, billing, and routing out of scope.

## Non-Scope

- API client implementation.
- Product Signal Report form or report viewer.
- Backend/API changes.
- Extension changes.
- Auth, billing, persistence, telemetry exporters, or deployment setup.
- React Router or multi-page routing.

## Files Likely Involved

- `package.json`
- `package-lock.json`
- `index.html`
- `src/**`
- `tsconfig*.json`
- `vite.config.ts`
- `.env.example`
- `.gitignore`
- `README.md`

## Required Reads

- `.ai/AI_CONTRACT.md`
- `.ai/STATE.md`
- `.ai/CONTEXT_INDEX.md`
- `.ai/adr/ADR-001-vite-react-typescript-app-scaffold.md`
- `.ai/contracts/insight-report.contract.md`
- `.ai/slices/SLICE-004-scaffold-vite-react-typescript-app.md`

## Implementation Rules

- Stay inside the UI repo.
- Do not modify `noise-cut-api` or `noise-cut-extension`.
- Keep the app shell minimal and implementation-oriented, not a marketing landing page.
- Do not implement real API calls yet.
- Do not introduce routing unless a later slice requires it.
- Do not expose secrets in browser configuration.

## Allowed Dependencies

- `@vitejs/plugin-react`
- `vite`
- `typescript`
- `react`
- `react-dom`
- `vitest`
- `jsdom`
- `@testing-library/react`
- `@testing-library/jest-dom`
- `@testing-library/user-event`

## Acceptance Criteria

- `npm install` completes and creates `package-lock.json`.
- `npm run build` passes.
- `npm test -- --run` passes.
- The app shell renders a focused NoiseCut v0 work surface.
- No API, extension, auth, billing, or routing implementation is added.

## Validation Commands

- `npm install`
- `npm run build`
- `npm test -- --run`
- `powershell -NoProfile -ExecutionPolicy Bypass -File C:\Dev\ai-delivery-kit\scripts\validate-ai-docs.ps1 . -Topology SingleRepo`
- `powershell -NoProfile -ExecutionPolicy Bypass -File C:\Dev\ai-delivery-kit\scripts\check-ai-guardrails.ps1 . -TaskPath .\.ai\tasks\TASK-004-scaffold-vite-react-typescript-app.json -Strict`

## Required State Updates

- Update `.ai/STATE.md`.
- Update `.ai/state/STATE.md`, `.ai/state/snapshot.json`, and `.ai/state/events.jsonl`.
- Add verification evidence for TASK-004.
