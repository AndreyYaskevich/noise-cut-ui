# AI Contract

This file defines the minimum durable AI rules for `noise-cut-ui`.

`noise-cut-ui` is a separate single-repo React + TypeScript web app for NoiseCut's product insight experience. The code and canonical `.ai/` state live together in this repository.

## Minimum Contract Responsibilities

- Define source-of-truth rules for UI work in this repo.
- Define how scope is established when this repo uses briefs, phases, slices, or task packets.
- Define how unknowns, risky assumptions, dependency changes, and cross-repo contract changes must be handled.
- Define what validation must happen before work is reported complete.

## Source of Truth

- `AGENTS.md` points agents to the right `.ai` files for each task.
- `.ai/STATE.md` is the minimum canonical handoff state.
- `.ai/CONTEXT_INDEX.md` is the minimum human-readable context guide.
- Facts about UI work must come from this repository's files or `.ai` files.
- Facts about report generation, public API behavior, persistence, and telemetry must come from checked-in files in `C:\Dev\NoiseCut\noise-cut-api`.
- Facts about current extension behavior and handoff constraints must come from checked-in files in `C:\Dev\NoiseCut\noise-cut-extension`.
- `C:\Dev\NoiseCut\.ai` is archived workspace background only and must not be treated as canonical for new work.
- Chat instructions may set the current task, but durable project facts must be written back to `.ai` files.
- If a requirement is missing, mark it as unknown instead of inventing it.
- If present, `.ai/index.json` may be used as the first-read machine-readable context manifest.
- If present, task packets in `.ai/tasks/` may define implementation scope and budgets more precisely.

## Requirements

- The new web app must remain separate from the existing extension UI.
- Product Signal Report generation belongs in the API, not in this UI repo.
- The existing extension must remain working throughout v0 work.
- API changes must be thin, additive, and backward-compatible unless a later task explicitly approves a compatibility break.
- Founder lens is the v0 priority. Creator and Marketing lenses remain deferred or lightweight variants until a later scope expands them.
- Business rules must not be invented.
- Public contracts must not be silently changed.
- New dependencies require explicit permission in the active scope.
- Broad refactoring is forbidden unless the active scope is explicitly a refactor scope.
- Implementation must stay inside the active brief, phase, slice, or task packet.
- Cross-repo changes require an explicit coordinated task that names the affected repos and allowed file areas.
- Raw page/comment content must not be stored or logged by default unless a later privacy-reviewed task explicitly allows it.
- Every completed task must update `.ai/STATE.md`.
- If advanced v2 state is present, keep `.ai/state/snapshot.json`, `.ai/state/STATE.md`, and `.ai/state/events.jsonl` aligned with `.ai/STATE.md`.
- Agents must not exceed explicit task budgets without human approval.

## Unknowns

When blocked by missing information:

- Record the unknown in `.ai/STATE.md`.
- If advanced v2 state is present, mirror important unknowns into `.ai/state/STATE.md`.
- Add the question to the active brief, phase, slice, or task packet when relevant.
- Use reversible assumptions only when the active scope allows them and the risk is documented.
- Treat missing app scaffold details such as package manager, router, and source layout as unknown until those files exist.

## Validation

- Run the validation commands listed in the active scope.
- Minimum validation for repo-local AI docs is `powershell -NoProfile -ExecutionPolicy Bypass -File C:\Dev\ai-delivery-kit\scripts\validate-ai-docs.ps1 C:\Dev\noise-cut-ui -Topology SingleRepo`.
- Use strict validation and task guardrails when the task packet or advanced workflow requires them.
- If validation cannot run, record why in `.ai/STATE.md`.
- Do not claim completion without reporting validation status.
