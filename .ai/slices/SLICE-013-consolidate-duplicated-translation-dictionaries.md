# Slice 013: Consolidate Duplicated Translation Dictionaries

## Status

Proposed

## Parent Phase

Phase 003: Localization Hardening

## Goal

Replace `getReportLabels()` (`App.tsx`), `markdownText` (`reportMarkdown.ts`), and `getKnownErrorMessage` (`noiseCutApi.ts`) with lookups against the Slice 012 namespaces, and delete the stale unused `reportSections` array.

## Scope

- Diff-review all four existing dictionaries (`i18n.ts` strings, `reportMarkdown.ts` markdownText, `App.tsx` getReportLabels/getKnownApiErrorMessage, `noiseCutApi.ts` getKnownErrorMessage) key by key before merging, to catch wording drift between them.
- Replace each duplicated lookup with a call into the Slice 012 namespaces.
- Delete the unused `reportSections` dead-code array in `App.tsx`.

## Non-Goals

- Do not change any final rendered wording — this is a dedup, not a content rewrite. Where the four sources genuinely disagree, keep the version currently shown in the shipped UI (`App.tsx`'s copy) and note the discrepancy in the verification file.
- Do not extract new hardcoded strings not already in one of the four dictionaries (Slice 014).

## Non-Scope

- API error translation layer (Slice 015).
- Formatting, switcher, pluralization, test migration (Slices 016-019).

## Files Likely Involved

- `src/App.tsx`
- `src/reportMarkdown.ts`
- `src/api/noiseCutApi.ts`
- `src/locales/en/*.json`, `src/locales/pl/*.json`

## Required Reads

- `.ai/AI_CONTRACT.md`
- `.ai/STATE.md`
- `.ai/adr/ADR-003-adopt-react-i18next-for-ui-localization.md`
- `.ai/slices/SLICE-012-add-i18next-library-and-mechanical-string-port.md`
- `src/App.tsx`, `src/reportMarkdown.ts`, `src/api/noiseCutApi.ts`

## Implementation Rules

- Diff every merged key against all four sources before choosing a final value; document any discrepancy found.
- Report result view and Markdown export content must remain byte-identical to before, except where a genuine cross-dictionary discrepancy is deliberately resolved and documented.

## Allowed Dependencies

- None new.

## Acceptance Criteria

- `getReportLabels`, `markdownText`, and the duplicate `getKnownErrorMessage` in `noiseCutApi.ts` are removed in favor of the shared namespaces.
- `reportSections` dead code is deleted.
- `reportMarkdown.test.ts` and `App.test.tsx` content assertions still pass (wording unchanged, or documented if intentionally reconciled).

## Validation Commands

- `npm test -- --run`
- `npm run build`

## Required State Updates

- Update `.ai/STATE.md`, `.ai/state/STATE.md`, `.ai/state/snapshot.json`, append `.ai/state/events.jsonl`.
- Update this slice's Status to `Completed` when done.
- Create `.ai/verification/verification-013-consolidate-duplicated-translation-dictionaries.md`, listing any wording discrepancies found and how each was resolved.
