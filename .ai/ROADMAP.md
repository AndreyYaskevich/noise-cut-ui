# Roadmap

This roadmap tracks the staged delivery of the NoiseCut Web App, corrected to reflect the actually-shipped Allegro product.

| Phase | Goal | Status | Notes |
| --- | --- | --- | --- |
| Phase 0 | Align AI-delivery-kit artifacts and initialize repo-local planning workflow. | Completed | Docs/state/task setup only. |
| Phase 1 | Define Founder-lens Product Signal Report contracts and additive API integration shape. | **Superseded** | Targeted a Reddit/YouTube product direction the shipped code no longer follows. Left as historical record. |
| Phase 2 | Add Founder-lens report generation through the existing API. | **Superseded** | Superseded by the shipped Allegro report workspace (see Allegro MVP 0.1 milestone below). |
| Phase 3 | Scaffold the React + TypeScript web app shell. | Completed | Vite + React + TypeScript + npm, per `ADR-001`. |
| Phase 4 | Build the New Report and Report Result experience. | **Superseded / Shipped-as-Allegro** | Shipped as the Allegro report workspace (`src/App.tsx`), not the originally-planned Founder-lens experience. |
| Phase 5 | Add extension handoff into the web app experience. | Proposed | Not yet started; avoid large payloads in query strings. |
| Phase 6 | Add report feedback and privacy-safe telemetry. | Completed | Shipped as part of Allegro MVP 0.1 report feedback flow. |
| Phase 7 | Add private beta access controls and beta-readiness docs. | Completed | Shipped as `BetaAccessPanel` / beta-access gating in Allegro MVP 0.1. |
| Phase 8 | Capture paid-validation signals without building full billing. | Completed | Shipped as PLN pricing-hypothesis copy and manual beta-access activation. |
| **Phase 003** | **Localization Hardening** — formalize the existing en/pl localization (consolidate duplicated string dictionaries, adopt `react-i18next`, stop trusting backend-translated error text). | **Active** | See `.ai/phases/PHASE-003-localization-hardening.md` and Slices 012-019. |

## Allegro MVP 0.1 (retroactive milestone)

Commit `bf6ac02` ("checking before switching to claude allegro status", 2026-07-08) shipped the actual v0.1 UI — the full Allegro report workspace, beta-access gating, hand-rolled en/pl localization, and Markdown export — directly to the working tree, outside the AI slice/task workflow. Product definition: `C:\Dev\NoiseCut\noise-cut-api\docs\noisecut-v0.1-product.md`. Retroactively documented in `.ai/STATE.md` and `ADR-002` rather than reconstructed as fictitious historical slices.
