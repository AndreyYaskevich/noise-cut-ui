# Claude Instructions

This file is optional. Keep it only for tools that read `CLAUDE.md`. `AGENTS.md` remains the canonical root entrypoint for `noise-cut-ui`.

`noise-cut-ui` is a separate single-repo React + TypeScript web app for NoiseCut's product insight experience. Its local `.ai/` is canonical for committed work in this repository.

Before starting any task in this project:

1. Read `.ai/AI_CONTRACT.md`.
2. Read `.ai/STATE.md`.
3. Read `.ai/CONTEXT_INDEX.md`.
4. Read the active brief, phase, slice, or task packet for the work you are doing.
5. If the task touches API integration or extension handoff, read the relevant sibling repo docs in `C:\Dev\NoiseCut\noise-cut-api` or `C:\Dev\NoiseCut\noise-cut-extension` before making assumptions.
6. If present, use advanced workflow files such as `.ai/index.json`, `.ai/state/STATE.md`, and `.ai/state/snapshot.json` to narrow context further.

Task rules:

- Keep this file under 200 lines.
- Treat `AGENTS.md`, `.ai/AI_CONTRACT.md`, `.ai/STATE.md`, and `.ai/CONTEXT_INDEX.md` as the minimum required contract.
- Do not read unrelated files.
- Never invent missing requirements, APIs, schemas, business rules, or dependencies.
- Do not implement outside the active brief, slice, or task scope.
- Do not add dependencies unless the active scope explicitly allows them.
- Do not change public contracts unless the active scope explicitly requires it.
- Do not modify the sibling API or extension repos from this repo unless the active task explicitly coordinates cross-repo work.
- Do not store or log raw page/comment content by default.
- Update `.ai/STATE.md` after every completed task.
- When this project uses advanced v2 state, also update `.ai/state/snapshot.json`, `.ai/state/STATE.md`, and `.ai/state/events.jsonl`.
- Report changed files, validation commands, validation results, and remaining risks.

Detailed workflows live in `.ai` files. The current state is planning-only: runtime app files do not exist yet, so treat repo-local AI artifacts and sibling repo references as the factual starting point.
