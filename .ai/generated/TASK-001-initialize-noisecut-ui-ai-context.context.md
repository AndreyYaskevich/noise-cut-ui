# Generated Task Context: TASK-001-initialize-noisecut-ui-ai-context

Task: Initialize NoiseCut UI repo-local AI context for Web App v0
Objective: Replace the generic AI Delivery Kit starter placeholders with NoiseCut UI-specific repo-local planning, state, and first workflow artifacts without creating runtime application code.

## .ai/index.json

```
{
  "version": "2.0",
  "project": {
    "name": "NoiseCut UI",
    "type": "react-typescript-web-app",
    "description": "Separate web app repository for turning Reddit threads and YouTube comments into product insight reports.",
    "topology": "single-repo"
  },
  "documents": [
    {
      "id": "ai_contract",
      "path": ".ai/AI_CONTRACT.md",
      "kind": "contract",
      "read_when": ["always"],
      "always_read": true,
      "max_tokens": 1200
    },
    {
      "id": "state_human",
      "path": ".ai/state/STATE.md",
      "kind": "state",
      "read_when": ["always"],
      "always_read": true,
      "max_tokens": 1200
    },
    {
      "id": "state_snapshot",
      "path": ".ai/state/snapshot.json",
      "kind": "state",
      "read_when": ["always"],
      "always_read": true,
      "max_tokens": 1000
    },
    {
      "id": "context_index",
      "path": ".ai/CONTEXT_INDEX.md",
      "kind": "context-guide",
      "read_when": ["planning", "context-selection"],
      "always_read": false,
      "max_tokens": 1200
    },
    {
      "id": "codebase_summary",
      "path": ".ai/summaries/codebase.summary.md",
      "kind": "summary",
      "read_when": ["source-inspection", "implementation", "review"],
      "always_read": false,
      "max_tokens": 1500
    },
    {
      "id": "noisecut_api_agents",
      "path": "../NoiseCut/noise-cut-api/AGENTS.md",
      "kind": "external-repo-instructions",
      "read_when": ["api-integration", "report-generation", "cross-repo"],
      "always_read": false,
      "max_tokens": 1200
    },
    {
      "id": "noisecut_api_state",
      "path": "../NoiseCut/noise-cut-api/.ai/STATE.md",
      "kind": "external-repo-state",
      "read_when": ["api-integration", "report-generation", "cross-repo"],
      "always_read": false,
      "max_tokens": 1800
    },
    {
      "id": "noisecut_extension_agents",
      "path": "../NoiseCut/noise-cut-extension/AGENTS.md",
      "kind": "external-repo-instructions",
      "read_when": ["extension-handoff", "cross-repo"],
      "always_read": false,
      "max_tokens": 1000
    }
  ],
  "areas": [
    {
      "id": "product-planning",
      "name": "Product planning",
      "source_roots": [".ai/briefs", ".ai/phases", ".ai/slices", ".ai/tasks"],
      "read_when": ["product-change", "planning", "delivery-setup"],
      "contracts": [],
      "summaries": ["codebase_summary"],
      "dependencies": []
    },
    {
      "id": "api-integration",
      "name": "Existing NoiseCut API dependency",
      "source_roots": ["../NoiseCut/noise-cut-api"],
      "read_when": ["api-integration", "report-generation", "privacy", "telemetry"],
      "contracts": [],
      "summaries": ["codebase_summary"],
      "dependencies": []
    },
    {
      "id": "extension-handoff",
      "name": "Existing NoiseCut extension dependency",
      "source_roots": ["../NoiseCut/noise-cut-extension"],
      "read_when": ["extension-handoff", "cross-repo"],
      "contracts": [],
      "summaries": ["codebase_summary"],
      "dependencies": []
    }
  ],
  "contracts": [
    {
      "id": "api_openapi",
      "path": ".ai/contracts/api.openapi.json",
      "kind": "openapi"
    },
    {
      "id": "database_schema",
      "path": ".ai/contracts/database.schema.json",
      "kind": "database-schema"
    },
    {
      "id": "events_schema",
      "path": ".ai/contracts/events.schema.json",
      "kind": "event-schema"
    },
    {
      "id": "config_schema",
      "path": ".ai/contracts/config.schema.json",
      "kind": "config-schema"
    }
  ],
  "summaries": [
    {
      "id": "codebase_summary",
      "path": ".ai/summaries/codebase.summary.md",
      "source_path": ".",
      "hash": "not-computed",
      "area": "repo",
      "last_verified": "2026-07-05",
      "status": "fresh"
    }
  ],
  "dependencies": [
    {
      "id": "runtime_dependencies",
      "path": ".ai/codemap/dependencies.json",
      "kind": "dependency-map"
    }
  ]
}
```

## .ai/AI_CONTRACT.md

```
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
```

## .ai/state/STATE.md

```
# Project State

This is the canonical human-readable state file for v2 workflows. Root `.ai/STATE.md` may exist for v1 compatibility.

## Project Name

NoiseCut UI

## Project Type

React + TypeScript web app repository for NoiseCut's product insight experience.

## Current Objective

Establish repo-local AI delivery artifacts for NoiseCut UI and capture the first product-oriented implementation workflow without changing runtime application code.

## Current Task

TASK-001-initialize-noisecut-ui-ai-context

## Current Phase

Phase 0: AI-delivery-kit alignment and repo initialization

## Current Slice

Slice 1: Align AI-delivery-kit artifacts and define Web App v0

## Completed Tasks

- `TASK-001-initialize-noisecut-ui-ai-context`

## Last Verified Commit

Unknown

## Architecture Decisions

- `noise-cut-ui/.ai` is canonical for committed work in this repository.
- The existing NoiseCut API remains the source of truth for report generation and public contracts.
- The existing extension remains supported and should evolve into a capture/handoff tool.
- `C:\Dev\NoiseCut\.ai` is archived workspace background only.

## Known Constraints

- No runtime app scaffold exists yet; this repo currently contains AI-delivery-kit artifacts only.
- Do not modify sibling API or extension repos from this repo unless a later task explicitly coordinates cross-repo work.
- Do not invent route names, billing, auth, or source-layout details that are not backed by checked-in files.
- Founder lens is the v0 priority.
- Raw page/comment content must not be logged or stored by default.

## Forbidden Changes

- Follow `.ai/guardrails.yaml` and the active task packet.

## Validation Commands

- `powershell -NoProfile -ExecutionPolicy Bypass -File C:\Dev\ai-delivery-kit\scripts\validate-ai-docs.ps1 C:\Dev\noise-cut-ui -Topology SingleRepo`
- `powershell -NoProfile -ExecutionPolicy Bypass -File C:\Dev\ai-delivery-kit\scripts\validate-ai-docs.ps1 C:\Dev\noise-cut-ui -Strict`
- `powershell -NoProfile -ExecutionPolicy Bypass -File C:\Dev\ai-delivery-kit\scripts\check-ai-guardrails.ps1 C:\Dev\noise-cut-ui -Strict`

## Open Questions

- Which React + TypeScript scaffold should be used for the actual app shell?
- What exact additive API route name should carry Product Signal Report generation?
- Should extension handoff use a short-lived persisted handoff token or another thin API-backed handoff shape?
- How should invite-code gating be implemented without becoming full auth?

## Known Risks

- Planning artifacts can drift from future runtime reality if scaffold choices are not written back into `.ai`.
- API contract work may overreach if it is not kept additive and tied to existing backend patterns.
- Extension compatibility could be broken later if handoff work is not regression-checked explicitly.

## Last Task Summary

- Date: 2026-07-05
- Actor: Codex
- Task: TASK-001-initialize-noisecut-ui-ai-context
- Summary: Replaced the starter AI Delivery Kit artifacts with NoiseCut UI-specific repo-local contract, state, roadmap, and first workflow records for Web App v0 planning.
- Files changed: `AGENTS.md`, `CLAUDE.md`, `.ai/AI_CONTRACT.md`, `.ai/STATE.md`, `.ai/CONTEXT_INDEX.md`, `.ai/ROADMAP.md`, `.ai/DECISIONS.md`, `.ai/index.json`, `.ai/state/*`, `.ai/summaries/codebase.summary.md`, `.ai/codemap/*`, and the first brief/phase/slice/task/verification records.
- Validation: Pending this turn's repo-local AI-doc validation, strict validation, generated task-context rebuild, and guardrail check.
- Remaining risks: The repo still has no runtime app scaffold; API contract naming and extension handoff shape remain open for later slices.
```

## .ai/state/snapshot.json

```
{
  "version": "2.0",
  "project": {
    "name": "NoiseCut UI",
    "type": "react-typescript-web-app"
  },
  "current": {
    "objective": "Establish repo-local AI delivery artifacts for NoiseCut UI and capture the first product-oriented implementation workflow without changing runtime application code.",
    "phase": "Phase 0: AI-delivery-kit alignment and repo initialization",
    "slice": "Slice 1: Align AI-delivery-kit artifacts and define Web App v0",
    "task_id": "TASK-001-initialize-noisecut-ui-ai-context"
  },
  "completed_tasks": [
    "TASK-001-initialize-noisecut-ui-ai-context"
  ],
  "last_verified_commit": "unknown",
  "decisions": [
    "noise-cut-ui/.ai is canonical for committed work in this repository.",
    "The existing NoiseCut API remains the source of truth for report generation and public contracts.",
    "The existing extension remains supported and should evolve into a capture/handoff tool."
  ],
  "constraints": [
    "No runtime app scaffold exists yet; this repo currently contains AI-delivery-kit artifacts only.",
    "Do not modify sibling API or extension repos from this repo unless a later task explicitly coordinates cross-repo work.",
    "Do not invent route names, billing, auth, or source-layout details that are not backed by checked-in files.",
    "Founder lens is the v0 priority.",
    "Raw page/comment content must not be logged or stored by default."
  ],
  "forbidden_changes": [
    "Do not create runtime app code during docs-only AI alignment tasks.",
    "Do not change public contracts unless the active slice explicitly requires it.",
    "Do not introduce dependencies unless the active slice explicitly allows them."
  ],
  "validation_commands": [
    "powershell -NoProfile -ExecutionPolicy Bypass -File C:\\Dev\\ai-delivery-kit\\scripts\\validate-ai-docs.ps1 C:\\Dev\\noise-cut-ui -Topology SingleRepo",
    "powershell -NoProfile -ExecutionPolicy Bypass -File C:\\Dev\\ai-delivery-kit\\scripts\\validate-ai-docs.ps1 C:\\Dev\\noise-cut-ui -Strict",
    "powershell -NoProfile -ExecutionPolicy Bypass -File C:\\Dev\\ai-delivery-kit\\scripts\\check-ai-guardrails.ps1 C:\\Dev\\noise-cut-ui -Strict"
  ],
  "open_questions": [
    "Which React + TypeScript scaffold should be used for the actual app shell?",
    "What exact additive API route name should carry Product Signal Report generation?",
    "Should extension handoff use a short-lived persisted handoff token or another thin API-backed handoff shape?",
    "How should invite-code gating be implemented without becoming full auth?"
  ],
  "known_risks": [
    "Planning artifacts can drift from future runtime reality if scaffold choices are not written back into .ai.",
    "API contract work may overreach if it is not kept additive and tied to existing backend patterns.",
    "Extension compatibility could be broken later if handoff work is not regression-checked explicitly."
  ],
  "last_task_summary": {
    "date": "2026-07-05",
    "actor": "Codex",
    "task_id": "TASK-001-initialize-noisecut-ui-ai-context",
    "summary": "Replaced the starter AI Delivery Kit artifacts with NoiseCut UI-specific repo-local contract, state, roadmap, and first workflow records for Web App v0 planning.",
    "files_changed": [
      "AGENTS.md",
      "CLAUDE.md",
      ".ai/AI_CONTRACT.md",
      ".ai/STATE.md",
      ".ai/CONTEXT_INDEX.md",
      ".ai/ROADMAP.md",
      ".ai/DECISIONS.md",
      ".ai/index.json",
      ".ai/state/STATE.md",
      ".ai/state/snapshot.json",
      ".ai/state/events.jsonl",
      ".ai/summaries/codebase.summary.md",
      ".ai/codemap/*",
      ".ai/briefs/*",
      ".ai/phases/*",
      ".ai/slices/*",
      ".ai/tasks/*",
      ".ai/verification/*"
    ],
    "validation": "Pending this turn's repo-local AI-doc validation, strict validation, generated task-context rebuild, and guardrail check.",
    "remaining_risks": [
      "The repo still has no runtime app scaffold.",
      "API contract naming and extension handoff shape remain open for later slices."
    ]
  }
}
```

## AGENTS.md

```
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
```

## .ai/STATE.md

```
# Project State

This file is the minimum required handoff state for the project. Keep it current even when the project also uses `.ai/state/` for advanced event-sourced state.

## Project Name

NoiseCut UI

## Project Type

Single-repo React + TypeScript web app repository for NoiseCut's product insight experience.

## Current Objective

Establish repo-local AI delivery artifacts for the new NoiseCut UI and capture the first product-oriented implementation workflow without changing runtime application code.

## Current Phase

Phase 0: AI-delivery-kit alignment and repo initialization

## Current Slice

Slice 1: Align AI-delivery-kit artifacts and define Web App v0

## Completed Slices

- Slice 1: Align AI-delivery-kit artifacts and define Web App v0.

## Last Verified Commit

Unknown

## Architecture Decisions

- `noise-cut-ui/.ai` is canonical for committed work in this repository.
- The existing NoiseCut API remains the source of truth for report generation, public contracts, persistence, and telemetry behavior.
- The existing extension remains supported and should evolve into a capture/handoff tool rather than being replaced by this repo.
- `C:\Dev\NoiseCut\.ai` is archived workspace background only and is not canonical for new work.

## Known Constraints

- No runtime UI scaffold exists yet; this repo currently contains AI-delivery-kit artifacts only.
- Do not modify `C:\Dev\NoiseCut\noise-cut-api` or `C:\Dev\NoiseCut\noise-cut-extension` from this repo unless a later task explicitly coordinates cross-repo work.
- Do not invent API routes, auth behavior, billing behavior, storage policy, or source-layout details that are not backed by checked-in files.
- Founder lens is the v0 priority.
- Raw page/comment content must not be logged or stored by default.

## Forbidden Changes

- Do not introduce dependencies unless the active slice allows them.
- Do not change public contracts unless the active slice requires it.
- Do not perform broad refactors outside a refactor slice.
- Do not create runtime app code during docs-only AI alignment tasks.

## Validation Commands

- `powershell -NoProfile -ExecutionPolicy Bypass -File C:\Dev\ai-delivery-kit\scripts\validate-ai-docs.ps1 C:\Dev\noise-cut-ui -Topology SingleRepo`
- `powershell -NoProfile -ExecutionPolicy Bypass -File C:\Dev\ai-delivery-kit\scripts\validate-ai-docs.ps1 C:\Dev\noise-cut-ui -Strict`
- `powershell -NoProfile -ExecutionPolicy Bypass -File C:\Dev\ai-delivery-kit\scripts\check-ai-guardrails.ps1 C:\Dev\noise-cut-ui -Strict`

## Open Questions

- Which React + TypeScript scaffold should be used for the actual app shell?
- What exact additive API route name should carry Product Signal Report generation?
- Should extension handoff use a short-lived persisted handoff token or another thin API-backed handoff shape?
- How should invite-code gating be implemented in v0 without becoming full auth?

## Known Risks

- Planning artifacts can drift from future runtime reality if the eventual scaffold is not reflected back into `.ai`.
- API contract work may overreach if it is not kept additive and tied to existing backend patterns.
- Extension compatibility could be broken later if handoff work is not regression-checked explicitly.

## Last Task Summary

- Date: 2026-07-05
- Actor: Codex
- Summary: Replaced the generic AI Delivery Kit starter artifacts with NoiseCut UI-specific repo-local contract, state, roadmap, and first workflow artifacts for Web App v0 planning.
- Files changed: `AGENTS.md`, `CLAUDE.md`, `.ai/AI_CONTRACT.md`, `.ai/STATE.md`, `.ai/CONTEXT_INDEX.md`, `.ai/ROADMAP.md`, `.ai/DECISIONS.md`, `.ai/index.json`, `.ai/state/*`, `.ai/summaries/codebase.summary.md`, `.ai/codemap/*`, and the first brief/phase/slice/task/verification records.
- Validation: Pending this turn's repo-local AI-doc validation, strict validation, task-context generation, and guardrail checks.
- Remaining risks: The repo still has no runtime app scaffold; API contract naming and extension handoff shape remain open decisions for later slices.
```

## .ai/CONTEXT_INDEX.md

```
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
```

## .ai/briefs/BRIEF-noisecut-ui-v0-product-signal-web-app.md

```
# Brief: NoiseCut UI v0 Product Signal Web App

## Status

Active

## Objective

Define the first practical version of a React + TypeScript web app that turns Reddit threads and YouTube comments into product insight reports while reusing the existing NoiseCut API and preserving the existing extension.

## Audience

- Founders
- Product builders
- Marketers
- Creators
- AI agents implementing the v0 product in scoped slices

## Problem

NoiseCut is being repositioned from a browser-extension comment cleaner into a product insight tool, but there is no dedicated web app yet for report creation, viewing, export, feedback, or beta validation.

## Required Behavior

- Create a separate React + TypeScript web app as the main product experience.
- Let users submit a Reddit or YouTube URL, choose a lens, add optional research context, and generate a structured Product Signal Report.
- Reuse the existing NoiseCut API as the source of truth for report generation.
- Keep the existing extension working and position it as a future capture/handoff tool.
- Prioritize the Founder lens for v0.

## Non-Goals

- No billing.
- No teams or organizations.
- No full auth unless existing backend reality clearly requires it.
- No broad multi-platform expansion beyond the existing Reddit and YouTube direction.
- No breaking changes to existing extension-facing API flows.

## Acceptance Criteria

- `noise-cut-ui` has real repo-local AI-delivery-kit artifacts instead of starter placeholders.
- A future implementation slice can build a separate web app that submits supported inputs and renders a Founder-lens Product Signal Report.
- Existing API and extension constraints are documented clearly enough to keep future work additive and backward-compatible.
- Privacy and telemetry expectations are explicit before runtime work starts.

## Constraints

- The existing NoiseCut API must remain the source of truth for report generation.
- The existing extension must remain working.
- API changes must be thin, additive, and backward-compatible by default.
- Raw page/comment content must not be logged or stored by default.
- Founder lens is the only committed v0 lens.

## Open Questions

- Which exact additive API route name should carry Product Signal Report generation?
- Which React + TypeScript scaffold should be used for the actual app shell?
- Should extension handoff use a short-lived persisted token/ID or another thin API-backed shape?
```

## .ai/phases/PHASE-001-noisecut-ui-ai-context-and-v0-planning.md

```
# Phase 001: NoiseCut UI AI Context And V0 Planning

## Status

Completed

## Goal

Replace the generic starter artifacts with NoiseCut UI-specific AI delivery context and leave the repo ready for the first real product-contract and integration slices.

## Non-Goals

- No runtime code changes.
- No new app scaffold.
- No dependency updates.

## Required Context

- `.ai/AI_CONTRACT.md`
- `.ai/STATE.md`
- `.ai/CONTEXT_INDEX.md`
- `.ai/briefs/BRIEF-noisecut-ui-v0-product-signal-web-app.md`
- `C:\Dev\NoiseCut\noise-cut-api\AGENTS.md`
- `C:\Dev\NoiseCut\noise-cut-api\.ai\STATE.md`
- `C:\Dev\NoiseCut\noise-cut-extension\AGENTS.md`
- `C:\Users\user\.codex\attachments\108f25c9-a9c7-4381-b73c-506141d747b6\pasted-text.txt`

## Slices

| Slice | Goal | Status |
| --- | --- | --- |
| `.ai/slices/SLICE-001-align-ai-delivery-kit-and-define-web-app-v0.md` | Replace starter repo-local AI context with NoiseCut UI-specific planning artifacts. | Completed |

## Acceptance Criteria

- Core AI contract/state/context files contain real NoiseCut UI facts.
- The repo has one real brief, phase, slice, task packet, and verification record.
- Validation commands are documented and runnable from the framework repo.
- No runtime app code or sibling repo code is changed.

## Risks

- Product-planning artifacts can overstate runtime architecture before the app scaffold exists.
- Cross-repo constraints can be missed if sibling API and extension docs are not read explicitly.

## Rollback Strategy

- Restore the starter artifacts if the repo needs to be reset to a generic template state.
```

## .ai/slices/SLICE-001-align-ai-delivery-kit-and-define-web-app-v0.md

```
# Slice 001: Align AI-Delivery-Kit And Define Web App v0

## Status

Completed

## Parent Phase

`.ai/phases/PHASE-001-noisecut-ui-ai-context-and-v0-planning.md`

## Goal

Turn `noise-cut-ui` from a generic AI Delivery Kit starter into a real NoiseCut UI planning repo for the future React + TypeScript product experience.

## Scope

- Replace starter placeholders in the core AI contract/state/context files.
- Define the first real brief, roadmap, phase, slice, task packet, and verification record.
- Align advanced state, index, summary, and codemap files with current repo reality.
- Keep the work documentation-only and repo-local to `noise-cut-ui`.

## Non-Scope

- Runtime behavior changes.
- Dependency changes.
- App scaffold creation.
- API or extension code changes.

## Files Likely Involved

- `AGENTS.md`
- `CLAUDE.md`
- `.ai/**`

## Required Reads

- `.ai/AI_CONTRACT.md`
- `.ai/STATE.md`
- `.ai/CONTEXT_INDEX.md`
- `C:\Dev\NoiseCut\noise-cut-api\AGENTS.md`
- `C:\Dev\NoiseCut\noise-cut-api\.ai\STATE.md`
- `C:\Dev\NoiseCut\noise-cut-extension\AGENTS.md`
- `.ai/briefs/BRIEF-noisecut-ui-v0-product-signal-web-app.md`

## Implementation Rules

- Stay inside this slice.
- Use factual constraints from sibling NoiseCut repos when defining UI planning artifacts.
- Do not invent runtime source layout, package-manager choice, router choice, or endpoint names that are not yet backed by checked-in files.

## Allowed Dependencies

- None.

## Acceptance Criteria

- No `TBD` placeholders remain in the core AI contract/state/context files.
- The first real NoiseCut UI workflow chain exists and references product-specific work.
- Repo-local validation passes.

## Validation Commands

- `powershell -NoProfile -ExecutionPolicy Bypass -File C:\Dev\ai-delivery-kit\scripts\validate-ai-docs.ps1 C:\Dev\noise-cut-ui -Topology SingleRepo`
- `powershell -NoProfile -ExecutionPolicy Bypass -File C:\Dev\ai-delivery-kit\scripts\validate-ai-docs.ps1 C:\Dev\noise-cut-ui -Strict`
- `powershell -NoProfile -ExecutionPolicy Bypass -File C:\Dev\ai-delivery-kit\scripts\check-ai-guardrails.ps1 C:\Dev\noise-cut-ui -Strict`

## Required State Updates

- Update `.ai/STATE.md`, `.ai/state/STATE.md`, `.ai/state/snapshot.json`, and `.ai/state/events.jsonl` with the completed initialization facts and remaining open questions.
```

## .ai/summaries/codebase.summary.md

```
# Codebase Summary

## Metadata

- Source path: `.`
- Hash: `not-computed`
- Area: `repo`
- Last verified timestamp: `2026-07-05`
- Status: `fresh`

## Summary

`noise-cut-ui` currently contains only repo-local AI Delivery Kit artifacts and no runtime React application scaffold yet.

The repo's current purpose is to hold the canonical planning, state, and task records for the new NoiseCut web app, which will:

- reuse the existing NoiseCut API as the source of truth for report generation
- preserve the existing extension as a working product surface
- position the new web app as the main product insight/report experience
- prioritize the Founder lens in v0

## Important Files

- `AGENTS.md`
- `.ai/AI_CONTRACT.md`
- `.ai/STATE.md`
- `.ai/CONTEXT_INDEX.md`
- `.ai/ROADMAP.md`
- `.ai/briefs/BRIEF-noisecut-ui-v0-product-signal-web-app.md`
- `.ai/phases/PHASE-001-noisecut-ui-ai-context-and-v0-planning.md`
- `.ai/slices/SLICE-001-align-ai-delivery-kit-and-define-web-app-v0.md`
- `.ai/tasks/TASK-001-initialize-noisecut-ui-ai-context.json`

## When To Read Source Files

- Read source files when the active task names them directly.
- Read source files when a runtime app scaffold exists and the active task covers implementation.
- Read source files when behavior, contracts, or tests are ambiguous.
```

## .ai/contracts/api.openapi.json

```
{
  "openapi": "3.1.0",
  "info": {
    "title": "TBD API",
    "version": "0.0.0"
  },
  "paths": {}
}
```

## .ai/contracts/database.schema.json

```
{
  "version": "2.0",
  "schemas": [],
  "tables": [],
  "relationships": []
}
```

## .ai/contracts/events.schema.json

```
{
  "version": "2.0",
  "events": []
}
```

## .ai/contracts/config.schema.json

```
{
  "version": "2.0",
  "environment": [],
  "configuration": []
}
```


