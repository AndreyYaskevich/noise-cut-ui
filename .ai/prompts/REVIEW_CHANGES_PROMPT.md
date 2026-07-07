# Prompt: Review Changes

Purpose: review current uncommitted changes before merge or handoff.

## Instructions

1. Read `.ai/AI_CONTRACT.md`, `.ai/STATE.md`, `.ai/CONTEXT_INDEX.md`, and the active slice.
2. Inspect the current changes.
3. Check for scope creep outside the active slice.
4. Check for broken architecture rules or ADR violations.
5. Check for missing or weak tests.
6. Check that `.ai/STATE.md` and slice status were updated.
7. Check for unsafe assumptions.
8. Check for hallucinated files, contracts, APIs, environment variables, or dependencies.

## Output

- Findings ordered by severity.
- Missing validation or tests.
- Required state updates.
- Open questions.
- Recommendation: accept, revise, or stop.
