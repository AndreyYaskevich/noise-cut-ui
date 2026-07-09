# Slice 017: Rebuild Language Switcher On I18next, Remove Shim

## Status

Proposed

## Parent Phase

Phase 003: Localization Hardening

## Goal

Rebuild the existing UI-language `<select>` to call `i18n.changeLanguage()` via `i18next-browser-languagedetector` (localStorage then `navigator.language`, matching current `detectInitialLanguage()` behavior), instead of the module-level mutable `activeUiLanguage` variable. Keep the separate report-language `<select>` as a plain request-parameter control. Remove the temporary `src/i18n.ts` shim from Slice 012.

## Scope

- Replace `activeUiLanguage` module-level state with `i18next`'s language state (via `useTranslation()`/`i18n.language`).
- Configure `i18next-browser-languagedetector` to check `localStorage` (`UI_LANGUAGE_STORAGE_KEY`) then `navigator.language`, matching current detection order exactly.
- Keep the report-language `<select>` unchanged in concept — it must not be merged into `i18n.language`; it stays a plain request-parameter control sent to the backend.
- Delete `src/i18n.ts`.

## Non-Goals

- Do not change the report-language selector's behavior or storage key.
- Do not add new switcher UI beyond what already exists.

## Non-Scope

- Pluralization, test migration (Slices 018-019).

## Files Likely Involved

- `src/App.tsx`
- `src/i18nSetup.ts`
- Deletion of `src/i18n.ts`

## Required Reads

- `.ai/AI_CONTRACT.md`
- `.ai/STATE.md`
- `.ai/adr/ADR-003-adopt-react-i18next-for-ui-localization.md`
- `src/App.tsx` (language switcher and `activeUiLanguage` usage)
- `src/i18n.ts`

## Implementation Rules

- This is the highest-value regression-test target in the phase — the fragile mutable-variable pattern is being replaced here. Test thoroughly before deleting `src/i18n.ts`.
- No full page reload on language switch (preserve current behavior).
- `localStorage` persistence must keep the same key/value shape so existing users' saved preference isn't lost.

## Allowed Dependencies

- `i18next-browser-languagedetector` (already added in Slice 012, used here).

## Acceptance Criteria

- Switcher test asserts no full page reload, `localStorage` persistence preserved, and the report-language selector is unaffected by UI-language changes.
- `src/i18n.ts` is deleted with no remaining references.
- All prior slices' functionality (namespaces, error translation, formatting) continues to work with the new language-state source.

## Validation Commands

- `npm run build`
- `npm test -- --run`
- Manual check: switch language, reload, confirm persistence; confirm report-language selector is independent.

## Required State Updates

- Update `.ai/STATE.md`, `.ai/state/STATE.md`, `.ai/state/snapshot.json`, append `.ai/state/events.jsonl`.
- Update this slice's Status to `Completed` when done.
- Create `.ai/verification/verification-017-rebuild-language-switcher-on-i18next.md`.
