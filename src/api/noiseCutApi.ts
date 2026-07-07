import { API_CONFIG } from "../config"

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
  }
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

export type SourceType = "reddit" | "youtube"

export type AnalysisJobStatus = "Pending" | "Processing" | "Completed" | "Failed" | "Cancelled" | string

export type SourceItemRequest = {
  id?: string
  text: string
  score?: number
  depth?: number
  author?: string
  createdAt?: string
  metadata?: Record<string, string>
}

export type CreateAnalysisJobRequest = {
  sourceType: SourceType
  url: string
  externalId?: string
  title?: string
  body?: string
  items: SourceItemRequest[]
  metadata?: Record<string, string>
  extractedAt?: string
  analysisType: "ProductVerdict"
}

export type ApiError = {
  code: string
  message: string
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
  }
}

export type AnalysisJobResponse = {
  jobId: string
  status: AnalysisJobStatus
  contentHash: string
  result?: AnalysisResultResponse | null
  report?: ProductSignalReportResponse | null
  error?: ApiError | null
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

const REQUIRED_SOURCES = ["reddit", "youtube"]
const REQUIRED_ANALYSIS_TYPE = "ProductVerdict"

export async function getApiReadiness(signal?: AbortSignal): Promise<ApiReadinessResponse> {
  return getJson<ApiReadinessResponse>("/ready", signal)
}

export async function getApiMetadata(signal?: AbortSignal): Promise<ApiMetadataResponse> {
  return getJson<ApiMetadataResponse>("/api/meta", signal)
}

export async function createAnalysisJob(
  request: CreateAnalysisJobRequest,
  signal?: AbortSignal
): Promise<AnalysisJobResponse> {
  return requestJson<AnalysisJobResponse>("/api/analysis-jobs", {
    body: request,
    method: "POST",
    signal
  })
}

export async function getAnalysisJob(jobId: string, signal?: AbortSignal): Promise<AnalysisJobResponse> {
  return getJson<AnalysisJobResponse>(`/api/analysis-jobs/${encodeURIComponent(jobId)}`, signal)
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
        message: "API dependencies are not ready."
      }
    }

    const metadata = await getApiMetadata(controller.signal)
    const missingSource = REQUIRED_SOURCES.find((source) => !metadata.supportedSourceTypes.includes(source))

    if (missingSource) {
      return {
        state: "unready",
        readiness,
        metadata,
        message: `API does not advertise ${missingSource} support.`
      }
    }

    if (!metadata.supportedAnalysisTypes.includes(REQUIRED_ANALYSIS_TYPE)) {
      return {
        state: "unready",
        readiness,
        metadata,
        message: "API does not advertise product insight support."
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
    signal?: AbortSignal
  }
): Promise<T> {
  const response = await fetch(`${API_CONFIG.baseUrl}${path}`, {
    headers: {
      Accept: "application/json",
      ...(options.body === undefined ? {} : { "Content-Type": "application/json" })
    },
    method: options.method,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    signal: options.signal
  })

  if (!response.ok) {
    const errorMessage = await readErrorMessage(response)
    throw new Error(errorMessage ?? `API request failed with status ${response.status}.`)
  }

  return response.json() as Promise<T>
}

async function readErrorMessage(response: Response): Promise<string | undefined> {
  try {
    const body = (await response.json()) as Partial<ApiError>
    return body.message
  } catch {
    return undefined
  }
}

function toSafeErrorMessage(error: unknown): string {
  if (error instanceof DOMException && error.name === "AbortError") {
    return "API request timed out."
  }

  if (error instanceof Error && error.message) {
    return error.message
  }

  return "Unable to reach the NoiseCut API."
}
