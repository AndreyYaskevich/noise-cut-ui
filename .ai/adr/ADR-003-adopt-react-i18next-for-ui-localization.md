# ADR: Adopt react-i18next For UI Localization

## Status

Accepted

## Date

2026-07-08

## Context

The shipped Allegro MVP UI already has hand-rolled en/pl localization (`src/i18n.ts`), but it has real architectural problems found during localization planning:

- Four separate, duplicated string dictionaries with drifting content: `src/i18n.ts` (`strings`), `src/reportMarkdown.ts` (`markdownText`), `src/App.tsx` (`getReportLabels`, `getKnownApiErrorMessage`), and `src/api/noiseCutApi.ts` (`getKnownErrorMessage`).
- UI language state lives in a module-level mutable variable (`activeUiLanguage` in `App.tsx`), not React context — fragile.
- Manual pluralization is incorrect for Polish, which has three plural forms (1 / 2-4 / 5+), e.g. `` `${count} sygnal${count === 1 ? "" : "ow"}` `` only ever produces two forms.
- The API client prefers the server-supplied `error.message` over any local code-based translation, making the UI dependent on backend text for localization — the architecture this project must avoid.
- Tests assert on exact literal translated strings, tightly coupling test code to wording.

## Decision

Adopt `react-i18next` + `i18next` (no additional plugin needed — modern `i18next` uses `Intl.PluralRules` internally, which handles Polish's three plural forms correctly). Migrate incrementally:

1. Mechanically port `strings.en`/`strings.pl` into namespaced JSON files with zero visible behavior change (Slice 012).
2. Consolidate the four duplicated dictionaries into those namespaces (Slice 013).
3. Extract remaining hardcoded strings/aria-labels (Slice 014).
4. Build a `translateApiError(code, params)` layer that stops preferring server `message` for known codes (Slice 015).
5. Add `Intl`-based date/number/currency formatting (Slice 016).
6. Rebuild the existing language switcher on the library, preserving its current `localStorage` persistence and no-full-reload behavior; keep the separate report-language selector distinct from UI-chrome language (Slice 017).
7. Fix Polish pluralization using `i18next` `count`-based keys (Slice 018).
8. Migrate the test suite off literal-string assertions where the test isn't specifically about translation content (Slice 019).

Pin `i18next`/`react-i18next` to explicit versions, deviating slightly from this repo's current "everything `latest`" `package.json` convention, given i18n libraries have had real breaking majors historically.

## Alternatives Considered

- **Keep the hand-rolled `src/i18n.ts` approach and just fix its inconsistencies in place.** Rejected as the primary path — it cannot correctly express Polish's three plural forms without reimplementing CLDR plural rules by hand, which `i18next` already provides. Patching duplication without fixing pluralization would leave a known-wrong behavior in the shipped product.
- **`react-intl`/FormatJS.** Viable alternative with similar capabilities; `react-i18next` chosen for a lighter setup footprint matching this app's small (~2 language, single-view) scope, and namespace-based JSON files fit the plan's target file structure directly.
- **Full framework-native i18n (e.g. Next.js i18n routing).** Not applicable — this app is a Vite SPA, not a Next.js app, and does not need routing-based locale switching.

## Consequences

- Adds two new runtime dependencies (`i18next`, `react-i18next`) plus `i18next-browser-languagedetector` for the switcher rebuild — the only dependency additions planned in the Localization Hardening phase.
- Existing tests asserting on literal translated strings will need updates across Slices 013-019; this is a real, budgeted cost, not incidental cleanup.
- The API error-translation layer (Slice 015) cannot fully switch away from server `message` until `noise-cut-api` ships its additive `Params` field (that repo's Slice 010) — sequenced accordingly in both repos' roadmaps.

## Validation

- `npm run build`
- `npm test -- --run`
- Manual check that both UI language and report language selectors behave identically to pre-migration behavior after Slice 017.
