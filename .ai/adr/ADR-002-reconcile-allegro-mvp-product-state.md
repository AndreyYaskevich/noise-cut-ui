# ADR: Reconcile AI Context With Shipped Allegro MVP

## Status

Accepted

## Date

2026-07-08

## Context

This repository's `.ai/STATE.md`, `AGENTS.md`, `CLAUDE.md`, and `.ai/ROADMAP.md` described a "Reddit/YouTube Product Signal Report, Founder lens" product, and `AGENTS.md` additionally claimed "no runtime app scaffold exists yet." Commit `bf6ac02` ("checking before switching to claude allegro status", 2026-07-08) shipped a materially different, actual v0.1 UI directly to the working tree, outside the AI slice/task workflow: a full Allegro (Polish marketplace) seller "Product Risk & Opportunity Report" workspace (`src/App.tsx`), beta-access gating (`BetaAccessPanel`), a hand-rolled en/pl localization layer (`src/i18n.ts`), and Markdown export (`src/reportMarkdown.ts`). This mirrors the same pivot documented in the sibling `noise-cut-api` repo's `ADR-001`. The product definition is `noise-cut-api/docs/noisecut-v0.1-product.md`.

## Decision

`.ai/STATE.md`, `AGENTS.md`, `CLAUDE.md`, and `.ai/ROADMAP.md` are corrected to describe the actual shipped Allegro product and the fact that a runtime scaffold exists. The Allegro MVP shipment is documented as a retroactive milestone (in `.ai/STATE.md` "Completed Slices" and `.ai/ROADMAP.md`), not reconstructed as fictitious historical slices — per this repo's own rule that facts must come from checked-in source. `SLICE-011` (Reddit/YouTube URL-only planning) and Roadmap Phases 1, 2, and 4 (Founder-lens-specific) are left in place but marked superseded.

## Alternatives Considered

- **Rewrite `.ai/STATE.md` history to fabricate slices for the Allegro pivot as if it had gone through the normal workflow.** Rejected — violates this repo's own `AI_CONTRACT.md` rule that facts must come from checked-in source; a retroactive milestone note is honest and sufficient.
- **Leave the stale narrative in place and just add new slices on top.** Rejected — future AI-assisted tasks would keep reading `.ai/STATE.md`'s "no runtime scaffold" and "Founder lens" claims as current fact, actively misleading planning.

## Consequences

- `.ai` planning artifacts now match shipped reality, so future AI-assisted tasks in this repo (including the Localization Hardening phase this ADR accompanies) read accurate context.
- Historical slice/task/roadmap-phase files remain on disk, marked superseded rather than deleted, preserving the audit trail.
- No runtime code changed as part of this ADR — it is a documentation-only reconciliation.

## Validation

- `powershell -NoProfile -ExecutionPolicy Bypass -File C:\Dev\ai-delivery-kit\scripts\validate-ai-docs.ps1 . -Topology SingleRepo`
- Manual review confirming `.ai/STATE.md`, `AGENTS.md`, `CLAUDE.md`, and `.ai/ROADMAP.md` no longer claim "no runtime scaffold" or describe Reddit/YouTube/Founder-lens as the current product.
