# Brief: NoiseCut UI v0 Product Signal Web App

## Status

Active

## Objective

Define the first practical version of a React + TypeScript web app that turns Reddit threads and YouTube comments into product insight reports while reusing the existing NoiseCut API and preserving the existing extension.

## Audience

- Founders
- Product builders
- Marketers
- Creators
- AI agents implementing the v0 product in scoped slices

## Problem

NoiseCut is being repositioned from a browser-extension comment cleaner into a product insight tool, but there is no dedicated web app yet for report creation, viewing, export, feedback, or beta validation.

## Required Behavior

- Create a separate React + TypeScript web app as the main product experience.
- Let users submit a Reddit or YouTube URL, choose a lens, add optional research context, and generate a structured Product Signal Report.
- Reuse the existing NoiseCut API as the source of truth for report generation.
- Keep the existing extension working and position it as a future capture/handoff tool.
- Prioritize the Founder lens for v0.

## Non-Goals

- No billing.
- No teams or organizations.
- No full auth unless existing backend reality clearly requires it.
- No broad multi-platform expansion beyond the existing Reddit and YouTube direction.
- No breaking changes to existing extension-facing API flows.

## Acceptance Criteria

- `noise-cut-ui` has real repo-local AI-delivery-kit artifacts instead of starter placeholders.
- A future implementation slice can build a separate web app that submits supported inputs and renders a Founder-lens Product Signal Report.
- Existing API and extension constraints are documented clearly enough to keep future work additive and backward-compatible.
- Privacy and telemetry expectations are explicit before runtime work starts.

## Constraints

- The existing NoiseCut API must remain the source of truth for report generation.
- The existing extension must remain working.
- API changes must be thin, additive, and backward-compatible by default.
- Raw page/comment content must not be logged or stored by default.
- Founder lens is the only committed v0 lens.

## Open Questions

- Which exact additive API route name should carry Product Signal Report generation?
- Which React + TypeScript scaffold should be used for the actual app shell?
- Should extension handoff use a short-lived persisted token/ID or another thin API-backed shape?
