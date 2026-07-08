import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { App } from "./App"

const { copyTextToClipboardMock } = vi.hoisted(() => ({
  copyTextToClipboardMock: vi.fn()
}))

vi.mock("./clipboard", () => ({
  copyTextToClipboard: copyTextToClipboardMock
}))

const healthyReadiness = {
  status: "healthy",
  dependencies: []
}

const metadata = {
  apiVersion: "v1",
  contractVersion: "v1",
  minimumSupportedContractVersion: "v1",
  supportedSourceTypes: ["reddit", "youtube", "generic", "allegro", "manual"],
  supportedAnalysisTypes: ["ProductVerdict", "AllegroProductRiskReport"],
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

const betaEnabledMetadata = {
  ...metadata,
  capabilities: {
    ...metadata.capabilities,
    betaAccess: {
      enabled: true
    }
  }
}

const historyResponse = {
  items: [
    {
      jobId: "job-history",
      status: "Completed",
      keyword: "fotel biurowy",
      riskScore: "medium",
      summary: "Historia raportu",
      contentHash: "hash-history",
      createdAt: "2026-07-07T10:00:00Z",
      completedAt: "2026-07-07T10:01:00Z"
    }
  ]
}

const longSourceReference =
  "https://allegro.pl/produkt/odkurzacz-pionowy-xiaomi-g20-lite-215w-bialy-81603652-e957-4e6c-b750-a7f97e0df2ae#product-reviews"

const completedJob = {
  jobId: "job-123",
  status: "Completed",
  contentHash: "hash-123",
  error: null,
  diagnostics: {
    correlationId: "corr-123",
    aiProvider: "OpenAI",
    model: "gpt-5-mini",
    inputTokens: 1234,
    outputTokens: 456,
    estimatedCostUsd: 0.012345,
    processingDurationMs: 2345,
    retryCount: 0,
    maxRetryCount: 3,
    createdAt: "2026-07-07T11:59:00Z",
    startedAt: "2026-07-07T11:59:10Z",
    completedAt: "2026-07-07T12:00:00Z",
    failedAt: null,
    lastRetryAt: null
  },
  report: {
    summary: "Kupujacy widza wartosc, ale powtarza sie ryzyko slabej baterii i niejasnego opisu.",
    riskScore: "medium",
    complaints: [
      {
        title: "Powtarzajaca sie skarga 1",
        text: "Bateria trzyma krocej niz obiecuje opis.",
        explanation: "Ten problem pojawia sie w pasted evidence i moze zwiekszac zwroty.",
        evidenceCount: 2,
        confidence: "high",
        sourceReferences: [longSourceReference],
        evidenceSnippets: ["Bateria pada po 20 minutach"]
      }
    ],
    praisedFeatures: [
      {
        title: "Chwalona cecha 1",
        text: "Lekka konstrukcja jest doceniana.",
        explanation: "Kupujacy lubia wygode noszenia.",
        evidenceCount: 1,
        confidence: "medium",
        sourceReferences: ["https://allegro.pl/oferta/test"],
        evidenceSnippets: ["Lekki i wygodny"]
      }
    ],
    productRiskAreas: [],
    listingRecommendations: [
      {
        title: "Rekomendacja do oferty 1",
        text: "Doprecyzuj realny czas pracy baterii.",
        explanation: "To rozbraja najwazniejsza obiekcje przed zakupem.",
        evidenceCount: 2,
        confidence: "high",
        sourceReferences: ["https://allegro.pl/oferta/test"],
        evidenceSnippets: ["Bateria pada po 20 minutach"]
      }
    ],
    productRecommendations: [],
    listingCopyAngles: [],
    painPoints: [],
    featureRequests: [],
    objections: [],
    competitorMentions: [],
    demandSignals: [],
    userLanguage: [],
    contentIdeas: [],
    productOpportunities: [],
    limitations: [
      {
        title: "Ograniczenie 1",
        text: "Raport bazuje na malym zestawie sygnalow.",
        explanation: "Warto dolozyc wiecej opinii przed duzym zakupem inventory.",
        evidenceCount: 2,
        confidence: "medium",
        sourceReferences: ["https://allegro.pl/oferta/test"],
        evidenceSnippets: ["Bateria pada po 20 minutach"]
      }
    ],
    metadata: {
      sourceType: "allegro",
      lens: "allegro-seller",
      jobId: "job-123",
      contentHash: "hash-123",
      analysisType: "AllegroProductRiskReport",
      generatedAt: "2026-07-07T12:00:00Z",
      projectionVersion: "allegro-product-risk-report-v0",
      keyword: "odkurzacz pionowy",
      listingUrls: ["https://allegro.pl/oferta/test"],
      competitors: ["Konkurent A"],
      researchIntent: "sourcing",
      reportLanguage: "pl"
    }
  },
  result: null
}

const failedJob = {
  jobId: "job-failed",
  status: "Failed",
  contentHash: "hash-failed",
  diagnostics: {
    correlationId: "corr-failed",
    aiProvider: "OpenAI",
    model: "gpt-5-mini",
    inputTokens: null,
    outputTokens: null,
    estimatedCostUsd: null,
    processingDurationMs: null,
    retryCount: 3,
    maxRetryCount: 3,
    createdAt: "2026-07-07T11:58:00Z",
    startedAt: "2026-07-07T11:58:10Z",
    completedAt: null,
    failedAt: "2026-07-07T11:59:00Z",
    lastRetryAt: "2026-07-07T11:58:45Z"
  },
  error: {
    code: "AI_PROVIDER_ERROR",
    message: "Analysis failed. Please try again."
  },
  report: null,
  result: null
}

const pendingRetryJob = {
  jobId: "job-failed",
  status: "Pending",
  contentHash: "hash-failed",
  diagnostics: {
    correlationId: "corr-failed",
    aiProvider: null,
    model: null,
    inputTokens: null,
    outputTokens: null,
    estimatedCostUsd: null,
    processingDurationMs: null,
    retryCount: 0,
    maxRetryCount: 3,
    createdAt: "2026-07-07T11:58:00Z",
    startedAt: null,
    completedAt: null,
    failedAt: null,
    lastRetryAt: "2026-07-07T12:01:00Z"
  },
  error: null,
  report: null,
  result: null
}

async function waitForApiReady(label = "Gotowe (v1)") {
  expect((await screen.findAllByText(label)).length).toBeGreaterThan(0)
}

async function openNewReport(user: ReturnType<typeof userEvent.setup>) {
  await waitForApiReady()
  await user.click(screen.getAllByRole("button", { name: "Nowy raport" })[0])
  expect(await screen.findByLabelText("Produkt albo kategoria")).toBeInTheDocument()
}

describe("App", () => {
  beforeEach(() => {
    window.localStorage.setItem("noisecut.uiLanguage", "pl")
    window.localStorage.setItem("noisecut.defaultReportLanguage", "pl")
  })

  afterEach(() => {
    vi.restoreAllMocks()
    copyTextToClipboardMock.mockReset()
    window.localStorage.clear()
  })

  it("renders the Allegro report workspace and history", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn()
        .mockResolvedValueOnce({ ok: true, json: async () => healthyReadiness })
        .mockResolvedValueOnce({ ok: true, json: async () => metadata })
        .mockResolvedValueOnce({ ok: true, json: async () => historyResponse })
    )

    const user = userEvent.setup()
    render(<App />)

    expect(screen.getByRole("heading", { name: "Product Risk & Opportunity Report" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Dashboard" })).toBeInTheDocument()
    expect(screen.getAllByRole("button", { name: "Nowy raport" }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole("button", { name: "Historia" }).length).toBeGreaterThan(0)
    expect(screen.getByRole("button", { name: "Ustawienia" })).toBeInTheDocument()
    await user.click(screen.getAllByRole("button", { name: "Nowy raport" })[0])

    expect(screen.getByLabelText("Produkt albo kategoria")).toBeInTheDocument()
    expect(screen.getByLabelText("Linki Allegro")).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "Asystent evidence" })).toBeInTheDocument()
    expect(screen.getByText("Beta gate jest wylaczony w tym srodowisku. Raporty mozna generowac bez kodu dostepu.")).toBeInTheDocument()
    expect(screen.getByText("Quality: Too short")).toBeInTheDocument()
    expect(screen.getByText("NoiseCut analizuje tekst, ktory wkleisz. Linki Allegro sa tylko referencjami w v0.1 i nie sa automatycznie pobierane.")).toBeInTheDocument()
    expect(screen.getByText("Hipoteza ceny: 99 PLN za maly pakiet raportow. Platnosc manualna przed Stripe.")).toBeInTheDocument()
    await waitForApiReady()
    await user.click(screen.getByRole("button", { name: "Historia" }))
    expect(await screen.findByText("fotel biurowy")).toBeInTheDocument()
  })

  it("defaults to English UI and can switch to Polish while keeping report language selectable", async () => {
    window.localStorage.clear()
    vi.stubGlobal(
      "fetch",
      vi.fn()
        .mockResolvedValueOnce({ ok: true, json: async () => healthyReadiness })
        .mockResolvedValueOnce({ ok: true, json: async () => metadata })
        .mockResolvedValueOnce({ ok: true, json: async () => ({ items: [] }) })
    )

    const user = userEvent.setup()
    render(<App />)

    await waitForApiReady("Ready (v1)")
    await user.click(screen.getAllByRole("button", { name: "New report" })[0])
    expect(await screen.findByLabelText("Product or category")).toBeInTheDocument()
    expect(screen.getByLabelText("Report language")).toHaveValue("en")

    await user.selectOptions(screen.getByLabelText("UI language"), "pl")
    expect(await screen.findByLabelText("Produkt albo kategoria")).toBeInTheDocument()
    expect(screen.getByLabelText("Jezyk raportu")).toHaveValue("en")
  })

  it("verifies active beta access and sends beta headers on report creation", async () => {
    window.localStorage.setItem("noisecut.beta.email", "seller@example.com")
    window.localStorage.setItem("noisecut.beta.accessCode", "secret-code")
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => healthyReadiness })
      .mockResolvedValueOnce({ ok: true, json: async () => betaEnabledMetadata })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ items: [] }) })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          email: "seller@example.com",
          status: "active",
          plan: "beta",
          reportLimit: 5,
          reportsUsed: 0,
          reportsRemaining: 5
        })
      })
      .mockResolvedValueOnce({ ok: true, json: async () => completedJob })
      .mockResolvedValueOnce({ ok: true, json: async () => historyResponse })
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

    const user = userEvent.setup()
    render(<App />)

    await openNewReport(user)
    expect(await screen.findByText("Aktywny dostep. Pozostalo raportow: 5.")).toBeInTheDocument()
    await user.type(screen.getByLabelText("Produkt albo kategoria"), "odkurzacz pionowy")
    await user.type(screen.getByLabelText("Pasted evidence"), "Bateria pada po 20 minutach")
    await user.click(screen.getByRole("button", { name: "Generuj raport" }))

    expect(await screen.findByText("Risk score: medium")).toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/api/reports"),
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "X-NoiseCut-Beta-Email": "seller@example.com",
          "X-NoiseCut-Beta-Access-Code": "secret-code"
        })
      })
    )
    expect(await screen.findByText("4/5 raportow")).toBeInTheDocument()
  })

  it("blocks report generation when beta access has no reports remaining", async () => {
    window.localStorage.setItem("noisecut.beta.email", "seller@example.com")
    window.localStorage.setItem("noisecut.beta.accessCode", "secret-code")
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => healthyReadiness })
      .mockResolvedValueOnce({ ok: true, json: async () => betaEnabledMetadata })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ items: [] }) })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          email: "seller@example.com",
          status: "active",
          plan: "beta",
          reportLimit: 5,
          reportsUsed: 5,
          reportsRemaining: 0
        })
      })
    vi.stubGlobal("fetch", fetchMock)

    const user = userEvent.setup()
    render(<App />)

    await openNewReport(user)
    expect(await screen.findByText("Dostep aktywny, ale limit raportow zostal wykorzystany.")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Generuj raport" })).toBeDisabled()
  })

  it("does not repeatedly auto-verify invalid saved beta credentials", async () => {
    window.localStorage.setItem("noisecut.beta.email", "seller@example.com")
    window.localStorage.setItem("noisecut.beta.accessCode", "bad-code")
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => healthyReadiness })
      .mockResolvedValueOnce({ ok: true, json: async () => betaEnabledMetadata })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ items: [] }) })
      .mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => {
          throw new Error("No JSON body")
        }
      })
    vi.stubGlobal("fetch", fetchMock)

    const user = userEvent.setup()
    render(<App />)

    await openNewReport(user)
    expect(await screen.findByText("Nieprawidlowy email albo kod dostepu beta.")).toBeInTheDocument()
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(4))
    await new Promise((resolve) => window.setTimeout(resolve, 50))
    expect(fetchMock).toHaveBeenCalledTimes(4)
  })

  it("updates evidence quality and counters while the user types", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn()
        .mockResolvedValueOnce({ ok: true, json: async () => healthyReadiness })
        .mockResolvedValueOnce({ ok: true, json: async () => metadata })
        .mockResolvedValueOnce({ ok: true, json: async () => ({ items: [] }) })
    )

    const user = userEvent.setup()
    render(<App />)

    await openNewReport(user)
    const evidence = screen.getByLabelText("Pasted evidence")
    const links = screen.getByLabelText("Linki Allegro")

    expect(screen.getByText("Quality: Too short")).toBeInTheDocument()

    await user.type(evidence, "Bateria jest slaba")
    expect(screen.getByText("Quality: Basic")).toBeInTheDocument()

    await user.clear(evidence)
    await user.type(evidence, "Bateria jest slaba.\nPojemnik jest maly.\nOpis obiecuje za duzo.")
    expect(screen.getByText("Quality: Good")).toBeInTheDocument()

    await user.clear(evidence)
    await user.type(evidence, "Linia 1 z opinia.\nLinia 2 z opinia.\nLinia 3 z opinia.\nLinia 4 z opinia.\nLinia 5 z opinia.\nLinia 6 z opinia.")
    expect(screen.getByText("Quality: Strong")).toBeInTheDocument()

    await user.type(links, "https://allegro.pl/oferta/test")
    expect(screen.getByLabelText("Evidence counters")).toHaveTextContent("Linki Allegro1")
  })

  it("fills the form from a sample evidence block", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn()
        .mockResolvedValueOnce({ ok: true, json: async () => healthyReadiness })
        .mockResolvedValueOnce({ ok: true, json: async () => metadata })
        .mockResolvedValueOnce({ ok: true, json: async () => ({ items: [] }) })
    )

    const user = userEvent.setup()
    render(<App />)

    await openNewReport(user)
    await user.click(screen.getAllByRole("button", { name: "Uzyj probki" })[0])

    expect(screen.getByLabelText("Produkt albo kategoria")).toHaveValue("odkurzacz pionowy")
    expect(screen.getByLabelText("Linki Allegro")).toHaveValue("https://allegro.pl/oferta/example-odkurzacz")
    expect((screen.getByLabelText("Pasted evidence") as HTMLTextAreaElement).value).toContain("Bateria pada po 20 minutach.")
    expect(screen.getByText("Quality: Good")).toBeInTheDocument()
  })

  it("submits an Allegro report and renders structured sections", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => healthyReadiness })
      .mockResolvedValueOnce({ ok: true, json: async () => metadata })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ items: [] }) })
      .mockResolvedValueOnce({ ok: true, json: async () => completedJob })
      .mockResolvedValueOnce({ ok: true, json: async () => historyResponse })
    vi.stubGlobal("fetch", fetchMock)

    const user = userEvent.setup()
    render(<App />)

    await openNewReport(user)
    await user.type(screen.getByLabelText("Produkt albo kategoria"), "odkurzacz pionowy")
    await user.type(screen.getByLabelText("Linki Allegro"), "https://allegro.pl/oferta/test")
    await user.type(screen.getByLabelText("Pasted evidence"), "Bateria pada po 20 minutach")
    await user.click(screen.getByRole("button", { name: "Generuj raport" }))

    expect(await screen.findByText("Risk score: medium")).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "Dane do supportu" })).toBeInTheDocument()
    expect(screen.getByText("corr-123")).toBeInTheDocument()
    expect(screen.getByText("gpt-5-mini")).toBeInTheDocument()
    expect(screen.getByText("Transparentnosc zrodel")).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "Co zostalo przeanalizowane" })).toBeInTheDocument()
    expect(screen.getByText("URL-e Allegro: zapisane jako referencje, bez scrapingu i bez deklaracji analizy strony.")).toBeInTheDocument()
    expect(screen.getByLabelText("Source transparency metrics")).toHaveTextContent("Evidence2")
    expect(screen.getByLabelText("Source transparency metrics")).toHaveTextContent("Pewnoscmedium")
    expect(screen.getAllByText("Evidence snippets").length).toBeGreaterThan(0)
    expect(screen.getAllByText("pewnosc: high").length).toBeGreaterThan(0)
    expect(screen.getAllByText("2 sygnalow").length).toBeGreaterThan(0)
    expect(screen.getByTitle(longSourceReference)).toHaveTextContent("allegro.pl/produkt/")
    expect(screen.queryByText(longSourceReference)).not.toBeInTheDocument()
    expect(screen.getByText("Bateria trzyma krocej niz obiecuje opis.")).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "Rekomendacje do oferty Allegro" })).toBeInTheDocument()
    const sectionHeadings = screen.getAllByRole("heading", { level: 3 }).map((heading) => heading.textContent)
    expect(sectionHeadings.indexOf("Ograniczenia i pewnosc")).toBeLessThan(sectionHeadings.indexOf("Rekomendacje do oferty Allegro"))

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/api/reports"),
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining("\"keyword\":\"odkurzacz pionowy\"")
      })
    )
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/api/reports"),
      expect.objectContaining({
        body: expect.stringContaining("\"reportLanguage\":\"pl\"")
      })
    )
  })

  it("renders failed report state and retries the same job", async () => {
    const completedRetryJob = { ...completedJob, jobId: "job-failed", contentHash: "hash-failed" }
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => healthyReadiness })
      .mockResolvedValueOnce({ ok: true, json: async () => metadata })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ items: [] }) })
      .mockResolvedValueOnce({ ok: true, json: async () => failedJob })
      .mockResolvedValueOnce({ ok: true, json: async () => historyResponse })
      .mockResolvedValueOnce({ ok: true, json: async () => pendingRetryJob })
      .mockResolvedValueOnce({ ok: true, json: async () => completedRetryJob })
      .mockResolvedValueOnce({ ok: true, json: async () => historyResponse })
    vi.stubGlobal("fetch", fetchMock)

    const user = userEvent.setup()
    render(<App />)

    await openNewReport(user)
    await user.type(screen.getByLabelText("Produkt albo kategoria"), "odkurzacz pionowy")
    await user.type(screen.getByLabelText("Pasted evidence"), "Bateria pada po 20 minutach")
    await user.click(screen.getByRole("button", { name: "Generuj raport" }))

    expect(await screen.findByRole("heading", { name: "Raport nie zostal wygenerowany" })).toBeInTheDocument()
    expect(screen.getByText("AI nie wygenerowalo raportu. Sprobuj ponownie pozniej.")).toBeInTheDocument()
    expect(screen.getByText("Do kontaktu z supportem skopiuj diagnostyke widoczna powyzej.")).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Sprobuj ponownie" }))

    expect(await screen.findByText("Risk score: medium")).toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/api/reports/job-failed/retry"),
      expect.objectContaining({ method: "POST" })
    )
  })

  it("sends beta headers when retrying a failed report", async () => {
    window.localStorage.setItem("noisecut.beta.email", "seller@example.com")
    window.localStorage.setItem("noisecut.beta.accessCode", "secret-code")
    const completedRetryJob = { ...completedJob, jobId: "job-failed", contentHash: "hash-failed" }
    const activeBetaAccount = {
      email: "seller@example.com",
      status: "active",
      plan: "beta",
      reportLimit: 5,
      reportsUsed: 1,
      reportsRemaining: 4
    }
    const fetchMock = vi.fn(async (input, init) => {
      const url = String(input)
      const method = init?.method ?? "GET"

      if (url.endsWith("/ready")) {
        return { ok: true, json: async () => healthyReadiness }
      }

      if (url.endsWith("/api/meta")) {
        return { ok: true, json: async () => betaEnabledMetadata }
      }

      if (url.endsWith("/api/beta/access/verify")) {
        return { ok: true, json: async () => activeBetaAccount }
      }

      if (url.endsWith("/api/reports/job-failed/retry")) {
        return { ok: true, json: async () => pendingRetryJob }
      }

      if (url.endsWith("/api/reports/job-failed")) {
        return { ok: true, json: async () => completedRetryJob }
      }

      if (url.endsWith("/api/reports") && method === "POST") {
        return { ok: true, json: async () => failedJob }
      }

      if (url.endsWith("/api/reports") && method === "GET") {
        return { ok: true, json: async () => historyResponse }
      }

      throw new Error(`Unexpected request: ${method} ${url}`)
    })
    vi.stubGlobal("fetch", fetchMock)

    const user = userEvent.setup()
    render(<App />)

    await openNewReport(user)
    expect(await screen.findByText("Aktywny dostep. Pozostalo raportow: 4.")).toBeInTheDocument()
    await user.type(screen.getByLabelText("Produkt albo kategoria"), "odkurzacz pionowy")
    await user.type(screen.getByLabelText("Pasted evidence"), "Bateria pada po 20 minutach")
    await user.click(screen.getByRole("button", { name: "Generuj raport" }))
    await screen.findByRole("heading", { name: "Raport nie zostal wygenerowany" })
    await user.click(screen.getByRole("button", { name: "Sprobuj ponownie" }))

    expect(await screen.findByText("Risk score: medium")).toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/api/reports/job-failed/retry"),
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "X-NoiseCut-Beta-Email": "seller@example.com",
          "X-NoiseCut-Beta-Access-Code": "secret-code"
        })
      })
    )
  })

  it("shows a safe retry error when retry is rejected", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => healthyReadiness })
      .mockResolvedValueOnce({ ok: true, json: async () => metadata })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ items: [] }) })
      .mockResolvedValueOnce({ ok: true, json: async () => failedJob })
      .mockResolvedValueOnce({ ok: true, json: async () => historyResponse })
      .mockResolvedValueOnce({
        ok: false,
        status: 409,
        json: async () => ({
          error: {
            code: "VALIDATION_ERROR",
            message: "Only failed report jobs can be retried."
          }
        })
      })
    vi.stubGlobal("fetch", fetchMock)

    const user = userEvent.setup()
    render(<App />)

    await openNewReport(user)
    await user.type(screen.getByLabelText("Produkt albo kategoria"), "odkurzacz pionowy")
    await user.type(screen.getByLabelText("Pasted evidence"), "Bateria pada po 20 minutach")
    await user.click(screen.getByRole("button", { name: "Generuj raport" }))
    await screen.findByRole("heading", { name: "Raport nie zostal wygenerowany" })
    await user.click(screen.getByRole("button", { name: "Sprobuj ponownie" }))

    expect(await screen.findByText("Only failed report jobs can be retried.")).toBeInTheDocument()
  })

  it("validates non-Allegro listing URLs before submitting", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => healthyReadiness })
      .mockResolvedValueOnce({ ok: true, json: async () => metadata })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ items: [] }) })
    vi.stubGlobal("fetch", fetchMock)

    const user = userEvent.setup()
    render(<App />)

    await openNewReport(user)
    await user.type(screen.getByLabelText("Produkt albo kategoria"), "odkurzacz pionowy")
    await user.type(screen.getByLabelText("Linki Allegro"), "https://example.com/oferta")
    await user.type(screen.getByLabelText("Pasted evidence"), "Bateria jest slaba")
    await user.click(screen.getByRole("button", { name: "Generuj raport" }))

    expect(await screen.findByRole("alert")).toHaveTextContent("Ten link nie wyglada jak Allegro")
    expect(fetchMock).toHaveBeenCalledTimes(3)
  })

  it("requires pasted evidence because Allegro links are references only", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => healthyReadiness })
      .mockResolvedValueOnce({ ok: true, json: async () => metadata })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ items: [] }) })
    vi.stubGlobal("fetch", fetchMock)

    const user = userEvent.setup()
    render(<App />)

    await openNewReport(user)
    await user.type(screen.getByLabelText("Produkt albo kategoria"), "odkurzacz pionowy")
    await user.type(screen.getByLabelText("Linki Allegro"), "https://allegro.pl/oferta/test")
    await user.click(screen.getByRole("button", { name: "Generuj raport" }))

    expect(await screen.findByRole("alert")).toHaveTextContent("Link Allegro jest tylko referencja")
    expect(fetchMock).toHaveBeenCalledTimes(3)
  })

  it("submits a sample report through the existing report endpoint", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => healthyReadiness })
      .mockResolvedValueOnce({ ok: true, json: async () => metadata })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ items: [] }) })
      .mockResolvedValueOnce({ ok: true, json: async () => completedJob })
      .mockResolvedValueOnce({ ok: true, json: async () => historyResponse })
    vi.stubGlobal("fetch", fetchMock)

    const user = userEvent.setup()
    render(<App />)

    await openNewReport(user)
    await user.click(screen.getAllByRole("button", { name: "Uzyj probki" })[0])
    await user.click(screen.getByRole("button", { name: "Generuj raport" }))

    expect(await screen.findByText("Risk score: medium")).toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/api/reports"),
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining("\"listingUrls\":[\"https://allegro.pl/oferta/example-odkurzacz\"]")
      })
    )
  })

  it("copies report Markdown", async () => {
    copyTextToClipboardMock.mockResolvedValue(undefined)
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => healthyReadiness })
      .mockResolvedValueOnce({ ok: true, json: async () => metadata })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ items: [] }) })
      .mockResolvedValueOnce({ ok: true, json: async () => completedJob })
      .mockResolvedValueOnce({ ok: true, json: async () => historyResponse })
    vi.stubGlobal("fetch", fetchMock)

    const user = userEvent.setup()
    render(<App />)

    await openNewReport(user)
    await user.type(screen.getByLabelText("Produkt albo kategoria"), "odkurzacz pionowy")
    await user.type(screen.getByLabelText("Pasted evidence"), "Bateria pada po 20 minutach")
    await user.click(screen.getByRole("button", { name: "Generuj raport" }))
    await screen.findByText("Risk score: medium")
    await user.click(screen.getByRole("button", { name: "Kopiuj Markdown" }))

    expect(copyTextToClipboardMock).toHaveBeenCalledWith(expect.stringContaining("# NoiseCut: Product Risk & Opportunity Report"))
    expect(await screen.findByText("Markdown skopiowany.")).toBeInTheDocument()
  })

  it("copies support diagnostics", async () => {
    copyTextToClipboardMock.mockResolvedValue(undefined)
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => healthyReadiness })
      .mockResolvedValueOnce({ ok: true, json: async () => metadata })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ items: [] }) })
      .mockResolvedValueOnce({ ok: true, json: async () => completedJob })
      .mockResolvedValueOnce({ ok: true, json: async () => historyResponse })
    vi.stubGlobal("fetch", fetchMock)

    const user = userEvent.setup()
    render(<App />)

    await openNewReport(user)
    await user.type(screen.getByLabelText("Produkt albo kategoria"), "odkurzacz pionowy")
    await user.type(screen.getByLabelText("Pasted evidence"), "Bateria pada po 20 minutach")
    await user.click(screen.getByRole("button", { name: "Generuj raport" }))
    await screen.findByText("Risk score: medium")
    await user.click(screen.getByRole("button", { name: "Kopiuj diagnostyke" }))

    expect(copyTextToClipboardMock).toHaveBeenCalledWith(expect.stringContaining("Job ID: job-123"))
    expect(copyTextToClipboardMock).toHaveBeenCalledWith(expect.stringContaining("Content hash: hash-123"))
    expect(copyTextToClipboardMock).toHaveBeenCalledWith(expect.stringContaining("Correlation ID: corr-123"))
    expect(copyTextToClipboardMock).toHaveBeenCalledWith(expect.stringContaining("Model: gpt-5-mini"))
    expect(await screen.findByText("Diagnostyka skopiowana.")).toBeInTheDocument()
  })

  it("submits useful feedback", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => healthyReadiness })
      .mockResolvedValueOnce({ ok: true, json: async () => metadata })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ items: [] }) })
      .mockResolvedValueOnce({ ok: true, json: async () => completedJob })
      .mockResolvedValueOnce({ ok: true, json: async () => historyResponse })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ feedbackId: "feedback-1", status: "accepted", createdAt: "2026-07-07T12:00:00Z" }) })
    vi.stubGlobal("fetch", fetchMock)

    const user = userEvent.setup()
    render(<App />)

    await openNewReport(user)
    await user.type(screen.getByLabelText("Produkt albo kategoria"), "odkurzacz pionowy")
    await user.type(screen.getByLabelText("Pasted evidence"), "Bateria pada po 20 minutach")
    await user.click(screen.getByRole("button", { name: "Generuj raport" }))
    await screen.findByText("Risk score: medium")
    await user.click(screen.getByRole("button", { name: "Uzyteczny" }))

    expect(await screen.findByText("Feedback zapisany.")).toBeInTheDocument()
    expect(fetchMock).toHaveBeenLastCalledWith(
      expect.stringContaining("/api/feedback"),
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining("\"feedbackKind\":\"useful\"")
      })
    )
  })
})
