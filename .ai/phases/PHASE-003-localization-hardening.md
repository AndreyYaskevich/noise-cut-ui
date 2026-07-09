# Phase: Localization Hardening

## Status

Active

## Goal

Formalize the existing hand-rolled en/pl localization into a real i18n library: consolidate four duplicated string dictionaries into one source of truth, translate API errors from stable codes instead of trusting backend text, add locale-aware formatting, fix Polish pluralization, and preserve the existing language-switcher UX — without breaking the shipped Allegro MVP 0.1 or `noise-cut-extension` handoff.

## Non-Goals

- Do not add locales beyond `en`/`pl`.
- Do not add routing/framework-native i18n — this stays a Vite SPA.
- Do not redesign the report/form UX beyond what's needed to extract strings.
- Do not modify `noise-cut-api` or `noise-cut-extension` from this repo.

## Required Context

- `.ai/AI_CONTRACT.md`
- `.ai/STATE.md`
- `.ai/CONTEXT_INDEX.md`
- `.ai/adr/ADR-002-reconcile-allegro-mvp-product-state.md`
- `.ai/adr/ADR-003-adopt-react-i18next-for-ui-localization.md`
- `C:\Dev\NoiseCut\noise-cut-api\docs\noisecut-v0.1-product.md`

## Slices

| Slice | Goal | Status |
| --- | --- | --- |
| SLICE-012 | Add `react-i18next`, mechanically port existing strings (no visible behavior change) | Proposed |
| SLICE-013 | Consolidate the 4 duplicated string dictionaries, remove dead code | Proposed |
| SLICE-014 | Extract remaining hardcoded strings and aria-labels | Proposed |
| SLICE-015 | Add API error translation layer (code + params, not server message) | Proposed |
| SLICE-016 | Add locale-aware date/number/currency formatting | Proposed |
| SLICE-017 | Rebuild language switcher on `i18next`, remove temporary shim | Proposed |
| SLICE-018 | Fix Polish pluralization | Proposed |
| SLICE-019 | Migrate test suite off literal-string assertions | Proposed |

## Acceptance Criteria

- One source of truth per translation key — no duplicated dictionaries remain.
- Every hardcoded string and aria-label responds to the active UI language.
- The UI translates known API error codes client-side; server `message` is a fallback only.
- Dates/numbers/currency render via `Intl.*` at the correct locale tag.
- The UI-language switcher and report-language selector behave identically to pre-migration behavior (persistence, no full reload, independence from each other).
- Polish plural forms (1 / 2-4 / 5+) render correctly.
- `npm run build` and `npm test -- --run` stay green throughout.

## Risks

- Slice 015 is blocked on `noise-cut-api` Slice 010 (additive `Params` field) shipping first.
- The four existing dictionaries have already drifted from each other — Slice 013 must diff-review merges carefully.
- Test-suite migration (Slice 019) is the largest time sink in this phase; do incrementally alongside 013-018, not as one big-bang rewrite at the end.

## Rollback Strategy

- Each slice is additive/backward-compatible on its own and can be reverted independently via its own commit; Slice 012's mechanical port has zero visible behavior change, making it the safest rollback point if later slices need to be re-sequenced.
