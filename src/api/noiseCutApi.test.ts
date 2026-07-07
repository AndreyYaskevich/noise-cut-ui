import { afterEach, describe, expect, it, vi } from "vitest"
import { checkApiConnection, createAnalysisJob, getAnalysisJob, submitFeedback } from "./noiseCutApi"

const healthyReadiness = {
  status: "healthy",
  dependencies: []
}

const metadata = {
  apiVersion: "v1",
  contractVersion: "v1",
  minimumSupportedContractVersion: "v1",
  supportedSourceTypes: ["reddit", "youtube", "generic"],
  supportedAnalysisTypes: ["GeneralVerdict", "ProductVerdict"],
  capabilities: {
    urlOnly: {
      supported: true,
      supportedSourceTypes: ["reddit"]
    }
  }
}

describe("noiseCutApi", () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("returns ready when readiness and metadata support the v0 UI", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn()
        .mockResolvedValueOnce({ ok: true, json: async () => healthyReadiness })
        .mockResolvedValueOnce({ ok: true, json: async () => metadata })
    )

    await expect(checkApiConnection()).resolves.toMatchObject({
      state: "ready",
      metadata
    })
  })

  it("returns unready when the API reports unhealthy dependencies", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({ status: "unhealthy", dependencies: [{ name: "postgres", status: "unhealthy" }] })
      })
    )

    await expect(checkApiConnection()).resolves.toMatchObject({
      state: "unready",
      message: "API dependencies are not ready."
    })
  })

  it("returns error when the API cannot be reached", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValueOnce(new Error("Network error")))

    await expect(checkApiConnection()).resolves.toMatchObject({
      state: "error",
      message: "Network error"
    })
  })

  it("creates an analysis job through the existing API contract", async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        jobId: "job-123",
        status: "Pending",
        contentHash: "hash-123",
        report: null,
        result: null,
        error: null
      })
    })
    vi.stubGlobal("fetch", fetchMock)

    await expect(
      createAnalysisJob({
        sourceType: "reddit",
        url: "https://www.reddit.com/r/example/comments/123/example/",
        items: [{ id: "item-1", text: "I need this to be easier to compare." }],
        analysisType: "ProductVerdict",
        metadata: { lens: "founder" }
      })
    ).resolves.toMatchObject({ jobId: "job-123", status: "Pending" })

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/api/analysis-jobs"),
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining("\"analysisType\":\"ProductVerdict\"")
      })
    )
  })

  it("reads analysis job status by job id", async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        jobId: "job-123",
        status: "Completed",
        contentHash: "hash-123",
        report: {
          summary: "Founder summary",
          painPoints: [],
          featureRequests: [],
          complaints: [],
          objections: [],
          competitorMentions: [],
          demandSignals: [],
          userLanguage: [],
          contentIdeas: [],
          productOpportunities: [],
          limitations: [],
          metadata: {
            sourceType: "reddit",
            lens: "founder",
            jobId: "job-123",
            contentHash: "hash-123",
            analysisType: "ProductVerdict",
            generatedAt: "2026-07-05T12:00:00Z",
            projectionVersion: "product-signal-report-v0"
          }
        },
        result: null,
        error: null
      })
    })
    vi.stubGlobal("fetch", fetchMock)

    await expect(getAnalysisJob("job-123")).resolves.toMatchObject({
      status: "Completed",
      report: { summary: "Founder summary" }
    })

    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("/api/analysis-jobs/job-123"), expect.any(Object))
  })

  it("submits feedback through the existing feedback endpoint", async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        feedbackId: "feedback-123",
        status: "accepted",
        createdAt: "2026-07-06T12:00:00Z"
      })
    })
    vi.stubGlobal("fetch", fetchMock)

    await expect(
      submitFeedback({
        jobId: "job-123",
        contentHash: "hash-123",
        sourceType: "reddit",
        sourceUrl: "https://www.reddit.com/r/example/comments/123/example/",
        feedbackKind: "useful",
        mode: "insight",
        metadata: {
          lens: "founder",
          uiSurface: "noise-cut-ui"
        },
        createdAt: "2026-07-06T12:00:00Z"
      })
    ).resolves.toMatchObject({ feedbackId: "feedback-123", status: "accepted" })

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/api/feedback"),
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining("\"feedbackKind\":\"useful\"")
      })
    )
  })
})
