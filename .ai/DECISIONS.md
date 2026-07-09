# Decisions

Record durable project decisions here. Use ADRs in `.ai/adr/` for decisions that need context, alternatives, consequences, or validation.

| Date | Decision | Source | Status |
| --- | --- | --- | --- |
| 2026-07-05 | `noise-cut-ui` is a separate single-repo app with its own canonical `.ai` state. | NoiseCut UI initialization plan | Accepted |
| 2026-07-05 | The existing NoiseCut API remains the source of truth for report generation and public contracts. | NoiseCut UI initialization plan | Accepted |
| 2026-07-05 | The existing extension must remain working and should evolve into a capture/handoff tool rather than be replaced. | NoiseCut UI initialization plan | Accepted |
| 2026-07-05 | Use Vite + React + TypeScript with npm for the NoiseCut Web App scaffold. | `.ai/adr/ADR-001-vite-react-typescript-app-scaffold.md` | Accepted |
| 2026-07-08 | The actual v0.1 product is the Allegro seller Product Risk & Opportunity Report workspace, not the earlier Reddit/YouTube "Founder lens" narrative. Founder/Creator/Marketing lens language is superseded. | `.ai/adr/ADR-002-reconcile-allegro-mvp-product-state.md` | Accepted |
| 2026-07-08 | Adopt `react-i18next`/`i18next` to replace the hand-rolled `src/i18n.ts` dictionary, primarily for correct Polish pluralization (`Intl.PluralRules`-based, built in) and to consolidate four duplicated string dictionaries into one source of truth. | `.ai/adr/ADR-003-adopt-react-i18next-for-ui-localization.md` | Accepted |
| 2026-07-08 | The UI stops preferring the API's server-supplied `error.message` for localization; it translates client-side from `error.code` (+ future `params`), keeping `message` only as a last-resort fallback for unmapped codes. | `.ai/adr/ADR-003-adopt-react-i18next-for-ui-localization.md` | Accepted |
