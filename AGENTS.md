# Agent Instructions

This file is the root entrypoint for AI work in `noise-cut-ui`.

`noise-cut-ui` is a separate single-repo React + TypeScript web app for NoiseCut's product insight experience. Its local `.ai/` is canonical for committed work in this repository.

This repo depends on existing sibling repositories:

- `C:\Dev\NoiseCut\noise-cut-api` is the source of truth for report-generation behavior, public API contracts, persistence, and telemetry behavior.
- `C:\Dev\NoiseCut\noise-cut-extension` is the source of truth for existing extension flows and future extension handoff behavior.
- `C:\Dev\NoiseCut\.ai` is archived workspace background only and is not canonical for new work.

Before starting any task in this project:

1. Read `.ai/AI_CONTRACT.md`.
2. Read `.ai/STATE.md`.
3. Read `.ai/CONTEXT_INDEX.md`.
4. Read the active brief, phase, slice, or task packet for the work you are doing.
5. If the task touches API integration or extension handoff, read the relevant sibling repo `AGENTS.md`, `.ai/STATE.md`, and checked-in docs before making assumptions.
6. If present, use advanced workflow files such as `.ai/index.json`, `.ai/state/STATE.md`, and `.ai/state/snapshot.json` to narrow context further.

Task rules:

- Keep this file under 150 lines.
- Treat `AGENTS.md`, `.ai/AI_CONTRACT.md`, `.ai/STATE.md`, and `.ai/CONTEXT_INDEX.md` as the minimum required contract.
- Do not read unrelated files.
- Never assume missing requirements. Document unknowns in state or the active scope file.
- Do not invent API routes, request/response contracts, extension behavior, auth, billing, or data-retention rules.
- Never implement outside the active brief, slice, or task scope.
- Do not add dependencies unless the active scope explicitly allows them.
- Do not change public contracts unless the active scope explicitly requires it.
- Do not modify `noise-cut-api` or `noise-cut-extension` from this repo unless the active task is an explicit cross-repo coordination task.
- Keep the Founder lens as the v0 priority unless a later task explicitly expands scope.
- Prefer additive API integration such as a new report endpoint over breaking existing extension-facing flows.
- Do not store or log raw page/comment content by default.
- Update `.ai/STATE.md` after every completed task.
- When this project uses advanced v2 state, also update `.ai/state/snapshot.json`, `.ai/state/STATE.md`, and `.ai/state/events.jsonl`.
- Report changed files, validation commands, validation results, and remaining risks.

The current workflow starts with AI-context alignment and product-planning artifacts only. No runtime app scaffold exists yet, so tasks must not claim package, routing, or source-layout facts until those files exist.
