# Slice 018: Fix Polish Pluralization

## Status

Proposed

## Parent Phase

Phase 003: Localization Hardening

## Goal

Replace manual ternaries (e.g. `` `${count} signal${count === 1 ? "" : "s"}` ``, and the incorrect Polish `` `${count} sygnal${count === 1 ? "" : "ow"}` ``) with `i18next` `count`-based plural keys, correctly covering Polish's three plural forms (1 / 2-4 / 5+).

## Scope

- Identify every count-dependent string in `src/App.tsx` and the `report` namespace.
- Convert each to `i18next` plural key suffixes (`_one`/`_other` for English; `_one`/`_few`/`_many`/`_other` for Polish) and call `t(key, {count})`.

## Non-Goals

- Do not change non-plural strings.
- Do not touch the language switcher (Slice 017, precedes this) or test migration (Slice 019, follows).

## Non-Scope

- Everything outside plural-count string handling.

## Files Likely Involved

- `src/locales/en/report.json`, `src/locales/pl/report.json`
- `src/App.tsx` (call sites using manual ternaries)

## Required Reads

- `.ai/AI_CONTRACT.md`
- `.ai/STATE.md`
- `.ai/adr/ADR-003-adopt-react-i18next-for-ui-localization.md`
- `src/App.tsx` (plural call sites)

## Implementation Rules

- Use `i18next`'s built-in `Intl.PluralRules`-based pluralization — no manual suffix concatenation.
- Get a native Polish speaker to sanity-check `_few`/`_many` wording if available; otherwise use standard CLDR Polish plural category definitions (1 = one, 2-4 excluding 12-14 = few, else = many).

## Allowed Dependencies

- None new (built into `i18next`).

## Acceptance Criteria

- A parametrized test covers counts 1, 2, 5, 22 for Polish and 1, 2 for English, confirming correct plural form selection.
- No manual ternary-based pluralization remains in `src/App.tsx`.

## Validation Commands

- `npm test -- --run`

## Required State Updates

- Update `.ai/STATE.md`, `.ai/state/STATE.md`, `.ai/state/snapshot.json`, append `.ai/state/events.jsonl`.
- Update this slice's Status to `Completed` when done.
- Create `.ai/verification/verification-018-fix-polish-pluralization.md`.
