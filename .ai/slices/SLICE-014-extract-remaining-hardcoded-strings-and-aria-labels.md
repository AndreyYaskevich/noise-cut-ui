# Slice 014: Extract Remaining Hardcoded Strings And Aria Labels

## Status

Proposed

## Parent Phase

Phase 003: Localization Hardening

## Goal

Move every remaining hardcoded string outside the translation namespaces — the page heading, the Polish-only fallback `<h3>Rekomendacja</h3>`, diagnostics column headers, sample evidence copy, and all hardcoded `aria-label`s — into the namespaces so they respond to UI language.

## Scope

- Audit `src/App.tsx` view by view (dashboard, new-report form, history, settings, support-diagnostics panel) for strings and `aria-label`s not sourced from the translation namespaces.
- Move each into the appropriate namespace and replace the hardcoded literal with a translation lookup.
- Fix the Polish-only fallback heading so it responds to UI language instead of always rendering Polish.

## Non-Goals

- Do not change layout or component structure beyond replacing string literals.
- Do not touch the API error path (Slice 015) or formatting (Slice 016).

## Non-Scope

- Error translation layer, formatting, switcher, pluralization, test migration (Slices 015-019).

## Files Likely Involved

- `src/App.tsx`
- `src/locales/en/*.json`, `src/locales/pl/*.json`

## Required Reads

- `.ai/AI_CONTRACT.md`
- `.ai/STATE.md`
- `.ai/slices/SLICE-013-consolidate-duplicated-translation-dictionaries.md`
- `src/App.tsx`

## Implementation Rules

- Every user-visible string and every `aria-label` must resolve through the translation namespaces after this slice — no exceptions without a documented reason in verification.
- Preserve existing visual structure; this is a string-extraction pass, not a redesign.

## Allowed Dependencies

- None new.

## Acceptance Criteria

- No hardcoded English or Polish string literals remain in `src/App.tsx` JSX outside translation lookups (verified by manual audit, documented in verification).
- All `aria-label`s respond to the active UI language.
- `App.test.tsx` extended to assert key screens render translated text/aria-labels in both `en` and `pl`.
- Manual browser check confirms no obvious layout breakage from longer Polish strings.

## Validation Commands

- `npm run build`
- `npm test -- --run`
- Manual browser check in both languages.

## Required State Updates

- Update `.ai/STATE.md`, `.ai/state/STATE.md`, `.ai/state/snapshot.json`, append `.ai/state/events.jsonl`.
- Update this slice's Status to `Completed` when done.
- Create `.ai/verification/verification-014-extract-remaining-hardcoded-strings-and-aria-labels.md`.
