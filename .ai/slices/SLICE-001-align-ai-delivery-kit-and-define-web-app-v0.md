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
