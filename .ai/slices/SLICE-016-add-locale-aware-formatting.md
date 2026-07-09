# Slice 016: Add Locale-Aware Formatting

## Status

Proposed

## Parent Phase

Phase 003: Localization Hardening

## Goal

Add `src/i18n/format.ts` with `formatDate`/`formatNumber`/`formatCurrency` wrapping `Intl.DateTimeFormat`/`Intl.NumberFormat`, replacing the ad hoc `toLocaleString` call and the manual `$${cost.toFixed(6)}` diagnostics string.

## Scope

- Add `src/i18n/format.ts` keyed off the existing `en -> en-US`, `pl -> pl-PL` mapping already used for timestamps (`App.tsx` `formatTimestamp`).
- Replace `formatTimestamp`'s inline `toLocaleString` call with the new helper.
- Replace the manual `$${cost.toFixed(6)}` diagnostics cost string with `Intl.NumberFormat(locale, {style:'currency', currency:'USD'})` — this stays USD (developer-facing OpenAI billing figure), not a locale bug.

## Non-Goals

- Do not change the currency shown for customer-facing pricing copy (stays PLN, hardcoded pricing-hypothesis text, out of scope).
- Do not touch the language switcher (Slice 017).

## Non-Scope

- Error translation layer (Slice 015, precedes this).
- Switcher, pluralization, test migration (Slices 017-019).

## Files Likely Involved

- New `src/i18n/format.ts`
- `src/App.tsx` (`formatTimestamp`, diagnostics cost display)

## Required Reads

- `.ai/AI_CONTRACT.md`
- `.ai/STATE.md`
- `src/App.tsx` (`formatTimestamp` and diagnostics section)

## Implementation Rules

- Keep the `en -> en-US`/`pl -> pl-PL` mapping consistent with what's already used, per `ADR` note in `noise-cut-api`/`noise-cut-ui` STATE files on locale-code conventions.
- Isolated, additive helpers — do not change unrelated formatting call sites.

## Allowed Dependencies

- None new (native `Intl`).

## Acceptance Criteria

- Unit tests for each formatter at both locales with representative values (large numbers, decimals, dates).
- `formatTimestamp` and the diagnostics cost display use the new helpers.
- No visible change to displayed values beyond consistent grouping/decimal rules from `Intl.NumberFormat`.

## Validation Commands

- `npm test -- --run`

## Required State Updates

- Update `.ai/STATE.md`, `.ai/state/STATE.md`, `.ai/state/snapshot.json`, append `.ai/state/events.jsonl`.
- Update this slice's Status to `Completed` when done.
- Create `.ai/verification/verification-016-add-locale-aware-formatting.md`.
