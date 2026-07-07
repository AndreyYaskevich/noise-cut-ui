# Context Index

This is the minimum required human-readable context guide for `noise-cut-ui`.

Use the smallest useful set of files for a task. Always start with:

- `.ai/AI_CONTRACT.md`
- `.ai/STATE.md`
- `.ai/CONTEXT_INDEX.md`
- The active brief, phase, slice, or task packet for the work

If present, agents may also use:

- `.ai/index.json`
- `.ai/state/STATE.md`
- `.ai/state/snapshot.json`

Then read only the relevant files below.

## Product Planning And Delivery

- Relevant brief in `.ai/briefs/`
- Active phase in `.ai/phases/`
- Active slice in `.ai/slices/`
- Active task packet in `.ai/tasks/`
- `.ai/ROADMAP.md`
- `.ai/DECISIONS.md`

## Existing NoiseCut API Dependency

- `C:\Dev\NoiseCut\noise-cut-api\AGENTS.md`
- `C:\Dev\NoiseCut\noise-cut-api\.ai\STATE.md`
- `C:\Dev\NoiseCut\noise-cut-api\README.md`
- `C:\Dev\NoiseCut\noise-cut-api\.ai\contracts\api.openapi.json` when API contract details matter
- `C:\Dev\NoiseCut\noise-cut-api\.ai\contracts\config.schema.json` and `.ai\contracts\events.schema.json` when telemetry, config, or event behavior matters

## Existing NoiseCut Extension Dependency

- `C:\Dev\NoiseCut\noise-cut-extension\AGENTS.md`
- `C:\Dev\NoiseCut\noise-cut-extension\.ai\STATE.md`
- `C:\Dev\NoiseCut\noise-cut-extension\README.md` when present
- Relevant extension source files only when a task explicitly covers handoff or compatibility work

## Web App Runtime Implementation

- Read runtime files only after the app scaffold exists and the active slice names them explicitly.
- Expected future reads may include `package.json`, `tsconfig.json`, app entry files, route files, shared API client files, and tests once they exist.
- Do not assume a router, framework, or source layout until checked-in files prove it.

## API Contract And Report Model Design

- Active task packet or active slice
- `.ai/contracts/api.openapi.json`
- `.ai/contracts/config.schema.json`
- `.ai/contracts/events.schema.json`
- Sibling API contracts and README
- The active brief, phase, slice, and task packet that define the Founder-lens report work

## Summaries and Codemaps

- Read `.ai/summaries/codebase.summary.md` before broad source inspection.
- Read `.ai/codemap/files.json` for the current repo inventory.
- Read `.ai/codemap/symbols.json` only after runtime code exists.
- Read `.ai/codemap/dependencies.json` before dependency or module boundary changes.

This repo currently has no runtime app code. Treat the local AI artifacts and sibling API/extension references as the factual starting point until a scaffolded app exists.
