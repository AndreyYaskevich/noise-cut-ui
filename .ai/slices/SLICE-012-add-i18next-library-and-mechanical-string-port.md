# Slice 012: Add I18next Library And Mechanical String Port

## Status

Completed

## Parent Phase

Phase 003: Localization Hardening

## Goal

Add `react-i18next`/`i18next`, wrap the app in a provider, and mechanically port the existing `strings.en`/`strings.pl` from `src/i18n.ts` into namespaced JSON files, with zero visible behavior change.

## Scope

- Add `i18next`, `react-i18next`, `i18next-browser-languagedetector` to `package.json` (pinned to explicit versions per `ADR-003`, not `"latest"`).
- Create `src/locales/{en,pl}/{common,forms,errors,report,diagnostics}.json` and port `strings.en`/`strings.pl` keys verbatim into the namespace that best matches each key's current usage.
- Create `src/i18nSetup.ts` (i18next config + language detector) and wire `I18nextProvider` in `src/main.tsx`.
- Keep `src/i18n.ts` in place as a thin re-export shim during migration (removed in Slice 017) so existing call sites keep compiling unchanged in this slice.

## Non-Goals

- Do not change any component's rendered output in this slice.
- Do not remove or rewrite `getReportLabels`, `markdownText`, or `getKnownErrorMessage` yet (Slice 013).
- Do not touch aria-labels or extract new strings (Slice 014).

## Non-Scope

- Error-translation layer (Slice 015).
- Formatting (Slice 016).
- Switcher rebuild (Slice 017).
- Pluralization (Slice 018).
- Test migration (Slice 019).

## Files Likely Involved

- `package.json`, `package-lock.json`
- New `src/locales/en/*.json`, `src/locales/pl/*.json`
- New `src/i18nSetup.ts`
- `src/main.tsx`

## Required Reads

- `.ai/AI_CONTRACT.md`
- `.ai/STATE.md`
- `.ai/adr/ADR-003-adopt-react-i18next-for-ui-localization.md`
- `src/i18n.ts`

## Implementation Rules

- Every key currently in `strings.en`/`strings.pl` must have a byte-identical counterpart in the new JSON namespaces.
- No component file changes required in this slice — it is infrastructure-only.
- Pin new dependency versions explicitly.

## Allowed Dependencies

- `i18next`, `react-i18next`, `i18next-browser-languagedetector` (explicitly allowed by this slice per `ADR-003`).

## Acceptance Criteria

- The app builds and runs with the new provider wired in.
- Both locale bundles load and cover the same key set as the current `strings.en`/`strings.pl`.
- `App.test.tsx` passes unchanged (this slice is behavior-neutral).
- A new smoke test confirms both namespaces load without missing keys.

## Validation Commands

- `npm run build`
- `npm test -- --run`

## Required State Updates

- Update `.ai/STATE.md`, `.ai/state/STATE.md`, `.ai/state/snapshot.json`, append `.ai/state/events.jsonl`.
- Update this slice's Status to `Completed` when done.
- Create `.ai/verification/verification-012-add-i18next-library-and-mechanical-string-port.md`.
