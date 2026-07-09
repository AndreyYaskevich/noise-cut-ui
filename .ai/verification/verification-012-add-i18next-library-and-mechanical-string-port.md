# Verification 012: Add I18next Library And Mechanical String Port

## Slice

`.ai/slices/SLICE-012-add-i18next-library-and-mechanical-string-port.md`

## Summary

Added `i18next@26.3.5`, `react-i18next@17.0.8`, `i18next-browser-languagedetector@8.2.1` (pinned to explicit versions per `ADR-003`, deviating deliberately from this repo's "everything latest" convention). Created `src/i18nSetup.ts` (i18next config + language detector matching the existing `localStorage` -> `navigator.language` detection order) and wired `I18nextProvider` into `src/main.tsx`.

Mechanically ported all ~140 keys from `src/i18n.ts`'s `strings.en`/`strings.pl` into five namespace JSON files under `src/locales/{en,pl}/`: `common`, `forms`, `errors`, `report`, `diagnostics`. Function-valued entries (interpolated/pluralized strings) were converted to `i18next` interpolation syntax (`{{param}}`) and, for the one pluralized key (`signal`), to `_one`/`_other` plural suffixes — deliberately preserving the *current* (Slice 018 will note: incorrect for Polish, which needs `_few`/`_many` too) two-way behavior rather than fixing the bug now, since fixing it is explicitly Slice 018's scope, not this one.

`src/i18n.ts` was **not modified** — `App.tsx` and all existing components continue to use it exactly as before. This slice is infrastructure-only, additive, with zero visible behavior change, as scoped.

## Files Changed

- `package.json`, `package-lock.json`
- `src/locales/en/{common,forms,errors,report,diagnostics}.json` (new)
- `src/locales/pl/{common,forms,errors,report,diagnostics}.json` (new)
- `src/i18nSetup.ts` (new)
- `src/i18nSetup.test.ts` (new)
- `src/main.tsx`

## Validation

- `npm run build` — passed (`tsc -b && vite build`, 0 errors).
- `npm test -- --run` — passed, 39/39 (29 pre-existing tests unchanged + 10 new: key-parity and non-empty-value checks across all 5 namespace pairs).

## Acceptance Criteria Check

- [x] The app builds and runs with the new provider wired in.
- [x] Both locale bundles load and cover the same key set as the current `strings.en`/`strings.pl` (verified both by manual cross-check during authoring and by the new `i18nSetup.test.ts` key-parity tests).
- [x] `App.test.tsx` passes unchanged (29/29, behavior-neutral).
- [x] A new smoke test confirms both namespaces load without missing keys.

## Remaining Risks

- The `signal` plural key intentionally still encodes the current (Polish-incorrect) two-way plural behavior; Slice 018 must add `_few`/`_many` for Polish, not this slice.
- The namespace-to-key categorization (common/forms/errors/report/diagnostics) is a judgment call made ahead of any component actually consuming these namespaces (Slice 013+); a future slice may find a key better belongs elsewhere, which is a low-cost fix at that point since nothing depends on the current placement yet.
