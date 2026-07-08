export const FORM_DEFAULTS = {
  reportLanguage: "pl" as const,
  researchIntent: "sourcing"
} as const

export const API_CONFIG = {
  baseUrl: import.meta.env.VITE_NOISECUT_API_BASE_URL ?? "http://localhost:57528",
  timeoutMs: Number(import.meta.env.VITE_NOISECUT_API_TIMEOUT_MS ?? "45000")
} as const
