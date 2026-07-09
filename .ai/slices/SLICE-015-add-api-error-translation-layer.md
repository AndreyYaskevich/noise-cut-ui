# Slice 015: Add API Error Translation Layer

## Status

Proposed

## Parent Phase

Phase 003: Localization Hardening

## Goal

Build one reusable `translateApiError(code, params)` used everywhere an API error is displayed, so the UI stops preferring the server-supplied `error.message` and instead translates from `error.code` (+ `params`) client-side, falling back to server `message` only for genuinely unmapped codes.

## Scope

- Add `src/i18n/translateApiError.ts` consuming the `errors` namespace with interpolation support.
- Update `src/api/noiseCutApi.ts` (`readErrorMessage`) to surface `{code, params}` up to the UI instead of preferring server `message`.
- Remove `getKnownApiErrorMessage` from `src/App.tsx`, replaced by the shared helper.

## Non-Goals

- Do not change the API contract from this repo (that is `noise-cut-api` Slice 010, a separate repo/task).
- Do not add new error-handling UI beyond swapping the message source.

## Non-Scope

- Formatting, switcher, pluralization, test migration (Slices 016-019).

## Files Likely Involved

- New `src/i18n/translateApiError.ts`
- `src/api/noiseCutApi.ts`
- `src/App.tsx`
- `src/locales/en/errors.json`, `src/locales/pl/errors.json`

## Required Reads

- `.ai/AI_CONTRACT.md`
- `.ai/STATE.md`
- `.ai/adr/ADR-003-adopt-react-i18next-for-ui-localization.md`
- `src/api/noiseCutApi.ts`
- `C:\Dev\NoiseCut\noise-cut-api\.ai\slices\SLICE-010-add-structured-params-to-error-contract.md` (cross-repo read-only, confirms the `Params` field this slice consumes)

## Implementation Rules

- **Blocked until `noise-cut-api` Slice 010 ships** the additive `ApiError.Params` field — do not start implementation before confirming that field exists in a running API, or `params` interpolation will have no data to consume.
- Server `message` remains the fallback for any `code` not present in the `errors` namespace (forward compatibility with future backend codes).
- Do not modify `noise-cut-api` from this repo.

## Allowed Dependencies

- None new (uses the i18next setup from Slice 012).

## Acceptance Criteria

- A table-driven test covers every known error code x both locales -> expected translated string.
- One test asserts graceful fallback for an unknown code (uses server `message` or a generic translated "operation failed" string if `message` is also absent).
- No component calls `getKnownApiErrorMessage` or the old `noiseCutApi.ts` duplicate map anymore.

## Validation Commands

- `npm test -- --run`
- `npm run build`

## Required State Updates

- Update `.ai/STATE.md`, `.ai/state/STATE.md`, `.ai/state/snapshot.json`, append `.ai/state/events.jsonl`.
- Update this slice's Status to `Completed` when done.
- Create `.ai/verification/verification-015-add-api-error-translation-layer.md`.
