import { API_CONFIG } from "../config"
import type { Language } from "../i18n"

export type ApiReadinessResponse = {
  status: "healthy" | "unhealthy"
  dependencies?: Array<{
    name: string
    status: "healthy" | "unhealthy" | "skipped"
    errorCode?: string | null
  }>
}

export type ApiMetadataResponse = {
  apiVersion: string
  contractVersion: string
  minimumSupportedContractVersion: string
  supportedSourceTypes: string[]
  supportedAnalysisTypes: string[]
  capabilities: {
    urlOnly: {
      supported: boolean
      supportedSourceTypes: string[]
    }
    betaAccess: {
      enabled: boolean
    }
  }
  localization?: {
    supportedUiLanguages: Language[]
    supportedReportLanguages: Language[]
    defaultUiLanguage: Language
    defaultReportLanguage: Language
  } | null
}

export type ApiConnectionStatus =
  | {
      state: "ready"
      readiness: ApiReadinessResponse
      metadata: ApiMetadataResponse
    }
  | {
      state: "unready"
      readiness: ApiReadinessResponse
      metadata?: ApiMetadataResponse
      message: string
    }
  | {
      state: "error"
      message: string
    }

export type AnalysisJobStatus = "Pending" | "Processing" | "Completed" | "Failed" | "Cancelled" | string

export type CreateAllegroReportRequest = {
  keyword: string
  listingUrls?: string[]
  competitors?: string[]
  targetMarketNotes?: string
  pastedEvidence?: string
  researchIntent?: string
  reportLanguage?: Language
}

export type ApiError = {
  code: string
  message: string
}

export type AnalysisJobDiagnosticsResponse = {
  correlationId?: string | null
  aiProvider?: string | null
  model?: string | null
  inputTokens?: number | null
  outputTokens?: number | null
  estimatedCostUsd?: number | null
  processingDurationMs?: number | null
  retryCount: number
  maxRetryCount: number
  createdAt: string
  startedAt?: string | null
  completedAt?: string | null
  failedAt?: string | null
  lastRetryAt?: string | null
}

export type FeedbackKind = "useful" | "not_useful" | "wrong_classification" | "restore_hidden_content"
export type FeedbackMode = "clean" | "summary" | "insight" | "general"

export type AnalysisResultResponse = {
  verdict: string
  summary: string
  confidence: string
  consensus: {
    recommendation: string
    agreementLevel?: string | null
  }
  pros: string[]
  cons: string[]
  risks: Array<{
    code: string
    severity: string
    description: string
  }>
  topics: Array<{
    name: string
    sentiment: string
  }>
  source: {
    sourceType: string
    url: string
    externalId?: string | null
    title?: string | null
  }
  createdAt: string
}

export type ProductSignalReportItem = {
  title?: string | null
  text: string
  explanation: string
  evidenceCount?: number | null
  confidence?: string | null
  sourceReferences?: string[] | null
  evidenceSnippets?: string[] | null
}

export type ProductSignalReportResponse = {
  summary: string
  painPoints: ProductSignalReportItem[]
  featureRequests: ProductSignalReportItem[]
  complaints: ProductSignalReportItem[]
  objections: ProductSignalReportItem[]
  competitorMentions: ProductSignalReportItem[]
  demandSignals: ProductSignalReportItem[]
  userLanguage: ProductSignalReportItem[]
  contentIdeas: ProductSignalReportItem[]
  productOpportunities: ProductSignalReportItem[]
  limitations: ProductSignalReportItem[]
  metadata: {
    sourceType: string
    lens?: string | null
    jobId: string
    contentHash: string
    analysisType: string
    generatedAt: string
    projectionVersion: string
    keyword?: string | null
    listingUrls?: string[] | null
    competitors?: string[] | null
    targetMarketNotes?: string | null
    researchIntent?: string | null
    reportLanguage?: string | null
  }
  riskScore?: "low" | "medium" | "high" | string | null
  praisedFeatures?: ProductSignalReportItem[] | null
  productRiskAreas?: ProductSignalReportItem[] | null
  listingRecommendations?: ProductSignalReportItem[] | null
  productRecommendations?: ProductSignalReportItem[] | null
  listingCopyAngles?: ProductSignalReportItem[] | null
}

export type AnalysisJobResponse = {
  jobId: string
  status: AnalysisJobStatus
  contentHash: string
  result?: AnalysisResultResponse | null
  report?: ProductSignalReportResponse | null
  error?: ApiError | null
  diagnostics?: AnalysisJobDiagnosticsResponse | null
}

export type ReportListItemResponse = {
  jobId: string
  status: AnalysisJobStatus
  keyword?: string | null
  riskScore?: string | null
  summary?: string | null
  contentHash: string
  createdAt: string
  completedAt?: string | null
  reportLanguage?: Language | null
}

export type ReportListResponse = {
  items: ReportListItemResponse[]
}

export type SubmitFeedbackRequest = {
  jobId?: string
  contentHash: string
  sourceType: string
  sourceUrl: string
  externalId?: string
  feedbackKind: FeedbackKind
  mode: FeedbackMode
  metadata?: Record<string, string>
  createdAt?: string
}

export type SubmitFeedbackResponse = {
  feedbackId: string
  status: string
  createdAt: string
}

export type BetaAccessResponse = {
  email: string
  status: "pending_payment" | "active" | "disabled" | string
  plan: string
  reportLimit: number
  reportsUsed: number
  reportsRemaining: number
}

export type BetaCredentials = {
  email: string
  accessCode: string
}

const REQUIRED_ANALYSIS_TYPE = "AllegroProductRiskReport"
const REQUIRED_SOURCE = "allegro"
let activeApiLanguage: Language = "en"

export function setApiLanguage(language: Language) {
  activeApiLanguage = language
}

export async function getApiReadiness(signal?: AbortSignal): Promise<ApiReadinessResponse> {
  return getJson<ApiReadinessResponse>("/ready", signal)
}

export async function getApiMetadata(signal?: AbortSignal): Promise<ApiMetadataResponse> {
  return getJson<ApiMetadataResponse>("/api/meta", signal)
}

export async function createAllegroReport(
  request: CreateAllegroReportRequest,
  betaCredentials?: BetaCredentials,
  signal?: AbortSignal
): Promise<AnalysisJobResponse> {
  return requestJson<AnalysisJobResponse>("/api/reports", {
    body: request,
    method: "POST",
    headers: betaCredentials
      ? {
          "X-NoiseCut-Beta-Email": betaCredentials.email,
          "X-NoiseCut-Beta-Access-Code": betaCredentials.accessCode
        }
      : undefined,
    signal
  })
}

export async function requestBetaAccess(email: string, signal?: AbortSignal): Promise<BetaAccessResponse> {
  return requestJson<BetaAccessResponse>("/api/beta/access/request", {
    body: { email },
    method: "POST",
    signal
  })
}

export async function verifyBetaAccess(
  credentials: BetaCredentials,
  signal?: AbortSignal
): Promise<BetaAccessResponse> {
  return requestJson<BetaAccessResponse>("/api/beta/access/verify", {
    body: {
      email: credentials.email,
      accessCode: credentials.accessCode
    },
    method: "POST",
    signal
  })
}

export async function getReport(jobId: string, signal?: AbortSignal): Promise<AnalysisJobResponse> {
  return getJson<AnalysisJobResponse>(`/api/reports/${encodeURIComponent(jobId)}`, signal)
}

export async function retryReport(
  jobId: string,
  betaCredentials?: BetaCredentials,
  signal?: AbortSignal
): Promise<AnalysisJobResponse> {
  return requestJson<AnalysisJobResponse>(`/api/reports/${encodeURIComponent(jobId)}/retry`, {
    method: "POST",
    headers: betaCredentials
      ? {
          "X-NoiseCut-Beta-Email": betaCredentials.email,
          "X-NoiseCut-Beta-Access-Code": betaCredentials.accessCode
        }
      : undefined,
    signal
  })
}

export async function listReports(signal?: AbortSignal): Promise<ReportListResponse> {
  return getJson<ReportListResponse>("/api/reports", signal)
}

export async function submitFeedback(
  request: SubmitFeedbackRequest,
  signal?: AbortSignal
): Promise<SubmitFeedbackResponse> {
  return requestJson<SubmitFeedbackResponse>("/api/feedback", {
    body: request,
    method: "POST",
    signal
  })
}

export async function checkApiConnection(): Promise<ApiConnectionStatus> {
  const controller = new AbortController()
  const timeoutId = window.setTimeout(() => controller.abort(), API_CONFIG.timeoutMs)

  try {
    const readiness = await getApiReadiness(controller.signal)

    if (readiness.status !== "healthy") {
      return {
        state: "unready",
        readiness,
        message: activeApiLanguage === "pl" ? "Zaleznosci API nie sa gotowe." : "API dependencies are not ready."
      }
    }

    const metadata = await getApiMetadata(controller.signal)

    if (!metadata.supportedSourceTypes.includes(REQUIRED_SOURCE)) {
      return {
        state: "unready",
        readiness,
        metadata,
        message: activeApiLanguage === "pl" ? "API nie reklamuje obslugi zrodla Allegro." : "API does not advertise Allegro source support."
      }
    }

    if (!metadata.supportedAnalysisTypes.includes(REQUIRED_ANALYSIS_TYPE)) {
      return {
        state: "unready",
        readiness,
        metadata,
        message: activeApiLanguage === "pl" ? "API nie reklamuje raportow Allegro." : "API does not advertise Allegro reports."
      }
    }

    return { state: "ready", readiness, metadata }
  } catch (error) {
    return {
      state: "error",
      message: toSafeErrorMessage(error)
    }
  } finally {
    window.clearTimeout(timeoutId)
  }
}

async function getJson<T>(path: string, signal?: AbortSignal): Promise<T> {
  return requestJson<T>(path, { method: "GET", signal })
}

async function requestJson<T>(
  path: string,
  options: {
    method: "GET" | "POST"
    body?: unknown
    headers?: Record<string, string>
    signal?: AbortSignal
  }
): Promise<T> {
  const response = await fetch(`${API_CONFIG.baseUrl}${path}`, {
    headers: {
      Accept: "application/json",
      "Accept-Language": activeApiLanguage,
      ...(options.body === undefined ? {} : { "Content-Type": "application/json" }),
      ...(options.headers ?? {})
    },
    method: options.method,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    signal: options.signal
  })

  if (!response.ok) {
    const errorMessage = await readErrorMessage(path, response)
    throw new Error(errorMessage ?? getFallbackErrorMessage(path, response.status))
  }

  return response.json() as Promise<T>
}

async function readErrorMessage(path: string, response: Response): Promise<string | undefined> {
  try {
    const body = (await response.json()) as { error?: ApiError } & Partial<ApiError>
    return body.error?.message || body.message || getFallbackErrorMessage(path, response.status, body.error?.code ?? body.code)
  } catch {
    return undefined
  }
}

function getFallbackErrorMessage(path: string, status: number, code?: string) {
  if (code) {
    const mapped = getKnownErrorMessage(code)
    if (mapped) {
      return mapped
    }
  }

  if (path === "/api/beta/access/verify" && status === 401) {
    return getKnownErrorMessage("BETA_ACCESS_INVALID")
  }

  return activeApiLanguage === "pl" ? `API zwrocilo blad ${status}.` : `API returned error ${status}.`
}

function getKnownErrorMessage(code: string) {
  const normalizedCode = code.toUpperCase()
  const messages: Record<string, string> = {
    BETA_ACCESS_INVALID: "Nieprawidlowy email albo kod dostepu beta.",
    BETA_ACCESS_INACTIVE: "Konto beta nie jest aktywne.",
    BETA_USAGE_LIMIT_REACHED: "Limit raportow beta zostal wykorzystany.",
    BETA_ACCESS_MISMATCH: "To konto beta nie moze ponowic tego raportu.",
    BETA_ADMIN_UNAUTHORIZED: "Nieprawidlowy token administratora beta.",
    VALIDATION_ERROR: "Nieprawidlowe dane requestu.",
    AI_PROVIDER_ERROR: "AI nie wygenerowalo raportu. Sprobuj ponownie pozniej.",
    AI_RESPONSE_INVALID: "AI zwrocilo nieprawidlowy format raportu.",
    ANALYSIS_JOB_FAILED: "Nie udalo sie wygenerowac raportu. Sprobuj ponownie.",
    REQUEST_TOO_LARGE: "Request jest za duzy.",
    NOT_FOUND: "Raport nie zostal znaleziony."
  }

  const englishMessages: Record<string, string> = {
    BETA_ACCESS_INVALID: "Invalid beta email or access code.",
    BETA_ACCESS_INACTIVE: "The beta account is not active.",
    BETA_USAGE_LIMIT_REACHED: "The beta report limit has been reached.",
    BETA_ACCESS_MISMATCH: "This beta account cannot retry that report.",
    BETA_ADMIN_UNAUTHORIZED: "Invalid beta admin token.",
    VALIDATION_ERROR: "The request data is invalid.",
    AI_PROVIDER_ERROR: "AI did not generate the report. Please try again later.",
    AI_RESPONSE_INVALID: "AI returned an invalid report format.",
    ANALYSIS_JOB_FAILED: "The report could not be generated. Please try again.",
    REQUEST_TOO_LARGE: "The request is too large.",
    NOT_FOUND: "Report was not found."
  }

  return (activeApiLanguage === "pl" ? messages : englishMessages)[normalizedCode]
}

function toSafeErrorMessage(error: unknown): string {
  if (error instanceof DOMException && error.name === "AbortError") {
    return activeApiLanguage === "pl" ? "API nie odpowiedzialo w czasie." : "API did not respond in time."
  }

  if (error instanceof Error && error.message) {
    return error.message
  }

  return activeApiLanguage === "pl" ? "Nie mozna polaczyc sie z API NoiseCut." : "Cannot connect to the NoiseCut API."
}
