# noise-cut-ui

React + TypeScript web app for NoiseCut's Product Signal Report experience.

## Local Development

```powershell
npm install
npm run dev
```

## Validation

```powershell
npm run build
npm test -- --run
```

## Configuration

Copy `.env.example` to `.env.local` when local overrides are needed.

- `VITE_NOISECUT_API_BASE_URL` points at the existing NoiseCut API.
- `VITE_NOISECUT_API_TIMEOUT_MS` controls future browser API request timeouts.

No browser-exposed secrets should be added to Vite environment variables.

## Current API Integration

The scaffold checks the existing NoiseCut API with:

- `GET /ready`
- `GET /api/meta`
- `POST /api/analysis-jobs`
- `GET /api/analysis-jobs/{jobId}`

The app can submit a Founder-lens `ProductVerdict` analysis job using a Reddit or YouTube URL plus pasted discussion excerpts. When the API returns the additive `report` projection, the UI renders the structured Product Signal Report sections, can copy a Markdown export assembled in the browser, and can submit lightweight report feedback through the existing `POST /api/feedback` endpoint. Older jobs and compatibility responses still fall back to the existing verdict-style `result` shape, and those fallback-only jobs do not offer Markdown export. Extension handoff is not implemented yet.
