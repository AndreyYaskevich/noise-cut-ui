import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { checkApiConnection, createAllegroReport, getReport, listReports, requestBetaAccess, retryReport, setApiLanguage, submitFeedback, verifyBetaAccess } from "./noiseCutApi"

const healthyReadiness = {
  status: "healthy",
  dependencies: []
}

const metadata = {
  apiVersion: "v1",
  contractVersion: "v1",
  minimumSupportedContractVersion: "v1",
  supportedSourceTypes: ["reddit", "youtube", "generic", "allegro", "manual"],
  supportedAnalysisTypes: ["GeneralVerdict", "ProductVerdict", "AllegroProductRiskReport"],
  capabilities: {
    urlOnly: {
      supported: true,
      supportedSourceTypes: ["reddit"]
    },
    betaAccess: {
      enabled: false
    }
  }
}

describe("noiseCutApi", () => {
  beforeEach(() => {
    setApiLanguage("pl")
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("returns ready when readiness and metadata support Allegro reports", async () => {
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

  it("returns unready when Allegro report support is missing", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn()
        .mockResolvedValueOnce({ ok: true, json: async () => healthyReadiness })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            ...metadata,
            supportedAnalysisTypes: ["ProductVerdict"]
          })
        })
    )

    await expect(checkApiConnection()).resolves.toMatchObject({
      state: "unready",
      message: "API nie reklamuje raportow Allegro."
    })
  })

  it("creates an Allegro report through the report endpoint", async () => {
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
      createAllegroReport({
        keyword: "odkurzacz pionowy",
        listingUrls: ["https://allegro.pl/oferta/test"],
        pastedEvidence: "Kupujacy narzekaja na slaba baterie.",
        researchIntent: "sourcing",
        reportLanguage: "pl"
      })
    ).resolves.toMatchObject({ jobId: "job-123", status: "Pending" })

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/api/reports"),
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining("\"keyword\":\"odkurzacz pionowy\"")
      })
    )
  })

  it("creates an Allegro report with beta headers when credentials are provided", async () => {
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

    await createAllegroReport(
      {
        keyword: "odkurzacz pionowy",
        pastedEvidence: "Kupujacy narzekaja na slaba baterie.",
        reportLanguage: "pl"
      },
      {
        email: "seller@example.com",
        accessCode: "secret-code"
      }
    )

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/api/reports"),
      expect.objectContaining({
        headers: expect.objectContaining({
          "X-NoiseCut-Beta-Email": "seller@example.com",
          "X-NoiseCut-Beta-Access-Code": "secret-code"
        })
      })
    )
  })

  it("requests and verifies beta access", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          email: "seller@example.com",
          status: "pending_payment",
          plan: "beta",
          reportLimit: 5,
          reportsUsed: 0,
          reportsRemaining: 5
        })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          email: "seller@example.com",
          status: "active",
          plan: "beta",
          reportLimit: 5,
          reportsUsed: 1,
          reportsRemaining: 4
        })
      })
    vi.stubGlobal("fetch", fetchMock)

    await expect(requestBetaAccess("seller@example.com")).resolves.toMatchObject({ status: "pending_payment" })
    await expect(verifyBetaAccess({ email: "seller@example.com", accessCode: "secret-code" })).resolves.toMatchObject({
      status: "active",
      reportsRemaining: 4
    })

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining("/api/beta/access/request"),
      expect.objectContaining({ method: "POST" })
    )
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining("/api/beta/access/verify"),
      expect.objectContaining({ method: "POST" })
    )
  })

  it("reads a report by job id", async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        jobId: "job-123",
        status: "Completed",
        contentHash: "hash-123",
        report: { summary: "Raport", complaints: [], metadata: { keyword: "fotel", jobId: "job-123" } },
        result: null,
        error: null
      })
    })
    vi.stubGlobal("fetch", fetchMock)

    await expect(getReport("job-123")).resolves.toMatchObject({
      status: "Completed",
      report: { summary: "Raport" }
    })

    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("/api/reports/job-123"), expect.any(Object))
  })

  it("retries a failed report with beta headers when credentials are provided", async () => {
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

    await expect(retryReport("job-123", { email: "seller@example.com", accessCode: "secret-code" })).resolves.toMatchObject({
      jobId: "job-123",
      status: "Pending"
    })

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/api/reports/job-123/retry"),
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "X-NoiseCut-Beta-Email": "seller@example.com",
          "X-NoiseCut-Beta-Access-Code": "secret-code"
        })
      })
    )
  })

  it("lists report history", async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        items: [{ jobId: "job-123", status: "Completed", keyword: "fotel", contentHash: "hash", createdAt: "2026-07-07T10:00:00Z" }]
      })
    })
    vi.stubGlobal("fetch", fetchMock)

    await expect(listReports()).resolves.toMatchObject({
      items: [{ keyword: "fotel" }]
    })

    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("/api/reports"), expect.any(Object))
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
        sourceType: "allegro",
        sourceUrl: "https://allegro.pl/oferta/test",
        feedbackKind: "useful",
        mode: "insight",
        metadata: {
          lens: "allegro-seller",
          uiSurface: "noise-cut-ui"
        },
        createdAt: "2026-07-06T12:00:00Z"
      })
    ).resolves.toMatchObject({ feedbackId: "feedback-123", status: "accepted" })

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/api/feedback"),
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining("\"sourceType\":\"allegro\"")
      })
    )
  })
})
