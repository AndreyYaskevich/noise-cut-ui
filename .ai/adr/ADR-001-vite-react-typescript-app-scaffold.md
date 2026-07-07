# ADR 001: Vite React TypeScript App Scaffold

## Status

Accepted

## Date

2026-07-05

## Context

`noise-cut-ui` will contain the new NoiseCut Web App for turning noisy online discussions into product insights. The repo currently has AI-delivery-kit planning artifacts and no runtime application scaffold.

The v0 app needs a focused client-side product workflow:

- Submit a Reddit or YouTube URL.
- Select the Founder lens by default.
- Optionally provide research context.
- Generate and view a Product Signal Report from the existing NoiseCut API.
- Copy report output as Markdown.
- Submit lightweight feedback.

The existing NoiseCut API remains the source of truth for report generation, public contracts, persistence, and telemetry. The existing browser extension must keep working. The UI repo should not introduce server routes, auth, billing, or backend-for-frontend behavior for v0.

## Decision

Use Vite + React + TypeScript with npm for the NoiseCut Web App scaffold.

Adopt these implementation defaults for the future scaffold task:

- Source root: `src/`.
- Package manager: npm.
- Runtime shape: browser client that calls the existing NoiseCut API directly.
- Initial routing: no router by default; add client routing only if a later slice introduces routeable multi-view behavior.
- Test stack: Vitest plus React Testing Library.
- Browser-safe API base URL config: `VITE_NOISECUT_API_BASE_URL`.
- Browser-safe API timeout config: `VITE_NOISECUT_API_TIMEOUT_MS`.
- No browser-exposed secrets.
- No auth, billing, backend routes, persistence layer, or deployment platform decision in the scaffold task.

## Alternatives Considered

- Next.js + React + TypeScript: deferred because v0 does not currently require server rendering, file-based routing, backend routes, auth middleware, or a backend-for-frontend layer.
- Hand-authored build setup: rejected for v0 because Vite gives a smaller, standard React TypeScript setup with less custom configuration.
- Extension-integrated UI: rejected because the web app must remain separate from the existing extension, and the extension should keep working as-is.

## Consequences

- The first runtime implementation task can scaffold a small client-side app without inventing source layout or package manager choices.
- API integration work should use Vite browser environment variables and must avoid secrets in exposed config.
- If future product requirements need routeable pages, React Router or another client-side router can be added in a later scoped task.
- If future requirements need server-side rendering, backend routes, auth, or billing, this ADR should be revisited before introducing those capabilities.
- Existing API and extension behavior remain untouched by this decision.

## Validation

- Delivery-kit validation must pass after recording this ADR.
- TASK-003 guardrails must pass with no runtime scaffold files created.
- Future scaffold implementation should verify that no forbidden runtime assumptions were made beyond this ADR.
