import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"
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
  supportedSourceTypes: ["reddit", "youtube", "generic"],
  supportedAnalysisTypes: ["ProductVerdict"],
  capabilities: {
    urlOnly: {
      supported: true,
      supportedSourceTypes: ["reddit"]
    }
  }
}

const completedJob = {
  jobId: "job-123",
  status: "Completed",
  contentHash: "hash-123",
  error: null,
  report: {
    summary: "Founders are hearing repeated demand for cleaner comparison and synthesis.",
    painPoints: [
      {
        title: "Signal overload",
        text: "Users struggle to compare noisy discussion threads quickly.",
        explanation: "The discussion repeatedly frames comparison as tedious and messy.",
        evidenceCount: 3,
        confidence: "high",
        sourceReferences: ["reddit-thread-123"]
      }
    ],
    featureRequests: [],
    complaints: [
      {
        title: "Manual summarizing",
        text: "People dislike stitching together insights by hand.",
        explanation: "They describe the current workflow as fragmented.",
        evidenceCount: 2,
        confidence: "medium",
        sourceReferences: ["reddit-thread-123"]
      }
    ],
    objections: [],
    competitorMentions: [],
    demandSignals: [
      {
        title: "Willingness to use",
        text: "People actively ask for clearer synthesis.",
        explanation: "That request suggests direct demand for the product behavior.",
        evidenceCount: 2,
        confidence: "high",
        sourceReferences: ["reddit-thread-123"]
      }
    ],
    userLanguage: [],
    contentIdeas: [],
    productOpportunities: [
      {
        title: "Comparison workflow",
        text: "Build a faster comparison surface for founder research.",
        explanation: "The pain points point toward a focused workflow opportunity.",
        evidenceCount: 2,
        confidence: "high",
        sourceReferences: ["reddit-thread-123"]
      }
    ],
    limitations: [
      {
        title: "Small sample",
        text: "This report is based on a narrow set of pasted excerpts.",
        explanation: "The evidence is useful but not exhaustive.",
        evidenceCount: 1,
        confidence: "medium",
        sourceReferences: ["reddit-thread-123"]
      }
    ],
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
  result: {
    verdict: "Promising founder signal",
    summary: "Users repeatedly ask for faster comparison and clearer summaries.",
    confidence: "High",
    consensus: {
      recommendation: "Prioritize comparison workflows."
    },
    pros: ["Strong repeated pain around noisy discussions."],
    cons: ["Evidence is limited to one pasted sample."],
    risks: [
      {
        code: "SMALL_SAMPLE",
        severity: "medium",
        description: "The evidence set is small."
      }
    ],
    topics: [
      {
        name: "Comparison",
        sentiment: "positive"
      }
    ],
    source: {
      sourceType: "reddit",
      url: "https://www.reddit.com/r/example/comments/123/example/",
      externalId: null,
      title: "Example"
    },
    createdAt: "2026-07-05T12:00:00Z"
  }
}

describe("App", () => {
  afterEach(() => {
    vi.restoreAllMocks()
    copyTextToClipboardMock.mockReset()
  })

  it("renders the initial Product Signal Report workspace", () => {
    vi.stubGlobal(
      "fetch",
      vi.fn()
        .mockResolvedValueOnce({ ok: true, json: async () => healthyReadiness })
        .mockResolvedValueOnce({ ok: true, json: async () => metadata })
    )

    render(<App />)

    expect(screen.getByRole("heading", { name: "Product Signal Report" })).toBeInTheDocument()
    expect(screen.getByLabelText("Source URL")).toBeInTheDocument()
    expect(screen.getByLabelText("Lens")).toHaveValue("founder")
    expect(screen.getByRole("radio", { name: "Paste evidence" })).toBeChecked()
    expect(screen.getByRole("radio", { name: "Use URL only" })).toBeDisabled()
    expect(screen.getByLabelText("Discussion excerpts")).toBeInTheDocument()
    expect(screen.getByText("Paste evidence works for Reddit and YouTube. URL-only is currently Reddit-only.")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Generate report" })).toBeInTheDocument()
    expect(screen.getByText("Pain points")).toBeInTheDocument()
  })

  it("shows API readiness when the existing API advertises required support", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn()
        .mockResolvedValueOnce({ ok: true, json: async () => healthyReadiness })
        .mockResolvedValueOnce({ ok: true, json: async () => metadata })
    )

    render(<App />)

    expect(await screen.findByText("Ready (v1)")).toBeInTheDocument()
  })

  it("submits a founder report request through the existing analysis job endpoint", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => healthyReadiness })
      .mockResolvedValueOnce({ ok: true, json: async () => metadata })
      .mockResolvedValueOnce({ ok: true, json: async () => completedJob })
    vi.stubGlobal("fetch", fetchMock)

    const user = userEvent.setup()
    render(<App />)

    await screen.findByText("Ready (v1)")
    await user.type(screen.getByLabelText("Source URL"), "https://www.reddit.com/r/example/comments/123/example/")
    await user.type(screen.getByLabelText("Discussion excerpts"), "I need this to be easier to compare.")
    await user.click(screen.getByRole("button", { name: "Generate report" }))

    expect(await screen.findByText("Founder Product Signal Report")).toBeInTheDocument()
    expect(screen.getByText("Founders are hearing repeated demand for cleaner comparison and synthesis.")).toBeInTheDocument()
    expect(screen.getByText("Signal overload")).toBeInTheDocument()
    expect(screen.queryByRole("heading", { name: "Feature requests" })).not.toBeInTheDocument()
    expect(screen.queryByRole("heading", { name: "Objections" })).not.toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Copy as Markdown" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Useful" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Not useful" })).toBeInTheDocument()
    expect(fetchMock).toHaveBeenLastCalledWith(
      expect.stringContaining("/api/analysis-jobs"),
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining("\"sourceType\":\"reddit\"")
      })
    )
  })

  it("renders feature requests and objections when the API returns them", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => healthyReadiness })
      .mockResolvedValueOnce({ ok: true, json: async () => metadata })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ...completedJob,
          report: {
            ...completedJob.report,
            featureRequests: [
              {
                title: "Export workflow",
                text: "Needs bulk export for weekly reporting.",
                explanation: "Users explicitly ask for an export capability.",
                evidenceCount: 2,
                confidence: "high",
                sourceReferences: ["reddit-thread-123"]
              }
            ],
            objections: [
              {
                title: "Adoption blocker",
                text: "I wouldn't use it without SSO support.",
                explanation: "This comment describes a clear blocker to adoption.",
                evidenceCount: 1,
                confidence: "medium",
                sourceReferences: ["reddit-thread-123"]
              }
            ]
          }
        })
      })
    vi.stubGlobal("fetch", fetchMock)

    const user = userEvent.setup()
    render(<App />)

    await screen.findByText("Ready (v1)")
    await user.type(screen.getByLabelText("Source URL"), "https://www.reddit.com/r/example/comments/123/example/")
    await user.type(screen.getByLabelText("Discussion excerpts"), "I need this to be easier to compare.")
    await user.click(screen.getByRole("button", { name: "Generate report" }))

    expect(await screen.findByRole("heading", { name: "Feature requests" })).toBeInTheDocument()
    expect(screen.getByText("Needs bulk export for weekly reporting.")).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "Objections" })).toBeInTheDocument()
    expect(screen.getByText("I wouldn't use it without SSO support.")).toBeInTheDocument()
  })

  it("submits a Reddit URL-only request through the existing analysis job endpoint", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => healthyReadiness })
      .mockResolvedValueOnce({ ok: true, json: async () => metadata })
      .mockResolvedValueOnce({ ok: true, json: async () => completedJob })
    vi.stubGlobal("fetch", fetchMock)

    const user = userEvent.setup()
    render(<App />)

    await screen.findByText("Ready (v1)")
    await user.type(screen.getByLabelText("Source URL"), "https://www.reddit.com/r/example/comments/123/example/")
    await user.click(screen.getByRole("radio", { name: "Use URL only" }))

    expect(screen.queryByLabelText("Discussion excerpts")).not.toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "URL-only mode" })).toBeInTheDocument()
    expect(screen.getAllByText("The API will extract the discussion directly from the URL.")).toHaveLength(2)

    await user.click(screen.getByRole("button", { name: "Generate report" }))

    expect(await screen.findByText("Founder Product Signal Report")).toBeInTheDocument()
    expect(fetchMock).toHaveBeenLastCalledWith(
      expect.stringContaining("/api/analysis-jobs"),
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining("\"inputMode\":\"url-only\"")
      })
    )

    const body = JSON.parse(fetchMock.mock.calls.at(-1)?.[1]?.body as string)
    expect(body.items).toEqual([])
  })

  it("falls back to pasted evidence when URL-only stops being supported", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => healthyReadiness })
      .mockResolvedValueOnce({ ok: true, json: async () => metadata })
    vi.stubGlobal("fetch", fetchMock)

    const user = userEvent.setup()
    render(<App />)

    await screen.findByText("Ready (v1)")
    await user.type(screen.getByLabelText("Source URL"), "https://www.reddit.com/r/example/comments/123/example/")
    await user.click(screen.getByRole("radio", { name: "Use URL only" }))

    expect(screen.getByRole("radio", { name: "Use URL only" })).toBeChecked()
    expect(screen.queryByLabelText("Discussion excerpts")).not.toBeInTheDocument()

    await user.clear(screen.getByLabelText("Source URL"))
    await user.type(screen.getByLabelText("Source URL"), "https://www.youtube.com/watch?v=abc123")

    expect(screen.getByRole("radio", { name: "Paste evidence" })).toBeChecked()
    expect(screen.getByLabelText("Discussion excerpts")).toBeInTheDocument()
    expect(screen.getByText("Paste evidence is the supported mode for YouTube in v0.")).toBeInTheDocument()
  })

  it("keeps URL-only disabled for YouTube and shows the manual-evidence hint", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => healthyReadiness })
      .mockResolvedValueOnce({ ok: true, json: async () => metadata })
    vi.stubGlobal("fetch", fetchMock)

    const user = userEvent.setup()
    render(<App />)

    await screen.findByText("Ready (v1)")
    await user.type(screen.getByLabelText("Source URL"), "https://www.youtube.com/watch?v=abc123")

    expect(screen.getByRole("radio", { name: "Use URL only" })).toBeDisabled()
    expect(screen.getByText("Use Paste evidence for YouTube discussions.")).toBeInTheDocument()

    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it("keeps YouTube available through pasted evidence mode", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => healthyReadiness })
      .mockResolvedValueOnce({ ok: true, json: async () => metadata })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ...completedJob,
          result: {
            ...completedJob.result,
            source: {
              ...completedJob.result.source,
              sourceType: "youtube",
              url: "https://www.youtube.com/watch?v=abc123"
            }
          },
          report: {
            ...completedJob.report,
            metadata: {
              ...completedJob.report.metadata,
              sourceType: "youtube"
            }
          }
        })
      })
    vi.stubGlobal("fetch", fetchMock)

    const user = userEvent.setup()
    render(<App />)

    await screen.findByText("Ready (v1)")
    await user.type(screen.getByLabelText("Source URL"), "https://www.youtube.com/watch?v=abc123")
    await user.type(screen.getByLabelText("Discussion excerpts"), "I wish this had chapter-level highlights for long videos.")
    await user.click(screen.getByRole("button", { name: "Generate report" }))

    expect(await screen.findByText("Founder Product Signal Report")).toBeInTheDocument()

    const body = JSON.parse(fetchMock.mock.calls.at(-1)?.[1]?.body as string)
    expect(body.sourceType).toBe("youtube")
    expect(body.items).toEqual([{ id: "ui-1", text: "I wish this had chapter-level highlights for long videos." }])
    expect(body.metadata.inputMode).toBe("pasted-evidence")
  })

  it("falls back to the existing verdict-style result when report is missing", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => healthyReadiness })
      .mockResolvedValueOnce({ ok: true, json: async () => metadata })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ...completedJob,
          report: null
        })
      })
    vi.stubGlobal("fetch", fetchMock)

    const user = userEvent.setup()
    render(<App />)

    await screen.findByText("Ready (v1)")
    await user.type(screen.getByLabelText("Source URL"), "https://www.reddit.com/r/example/comments/123/example/")
    await user.type(screen.getByLabelText("Discussion excerpts"), "I need this to be easier to compare.")
    await user.click(screen.getByRole("button", { name: "Generate report" }))

    expect(await screen.findByText("Promising founder signal")).toBeInTheDocument()
    expect(screen.getByText("Users repeatedly ask for faster comparison and clearer summaries.")).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Copy as Markdown" })).not.toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Useful" })).toBeInTheDocument()
  })

  it("copies structured report Markdown to the clipboard", async () => {
    copyTextToClipboardMock.mockResolvedValue(undefined)

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => healthyReadiness })
      .mockResolvedValueOnce({ ok: true, json: async () => metadata })
      .mockResolvedValueOnce({ ok: true, json: async () => completedJob })
    vi.stubGlobal("fetch", fetchMock)

    const user = userEvent.setup()
    render(<App />)

    await screen.findByText("Ready (v1)")
    await user.type(screen.getByLabelText("Source URL"), "https://www.reddit.com/r/example/comments/123/example/")
    await user.type(screen.getByLabelText("Discussion excerpts"), "I need this to be easier to compare.")
    await user.click(screen.getByRole("button", { name: "Generate report" }))
    await screen.findByText("Founder Product Signal Report")

    await user.click(screen.getByRole("button", { name: "Copy as Markdown" }))

    expect(copyTextToClipboardMock).toHaveBeenCalledTimes(1)
    expect(copyTextToClipboardMock).toHaveBeenCalledWith(expect.stringContaining("# Product Signal Report"))
    expect(await screen.findByText("Markdown copied.")).toBeInTheDocument()
  })

  it("shows a user-safe message when clipboard copy fails", async () => {
    copyTextToClipboardMock.mockRejectedValue(new Error("clipboard unavailable"))

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => healthyReadiness })
      .mockResolvedValueOnce({ ok: true, json: async () => metadata })
      .mockResolvedValueOnce({ ok: true, json: async () => completedJob })
    vi.stubGlobal("fetch", fetchMock)

    const user = userEvent.setup()
    render(<App />)

    await screen.findByText("Ready (v1)")
    await user.type(screen.getByLabelText("Source URL"), "https://www.reddit.com/r/example/comments/123/example/")
    await user.type(screen.getByLabelText("Discussion excerpts"), "I need this to be easier to compare.")
    await user.click(screen.getByRole("button", { name: "Generate report" }))
    await screen.findByText("Founder Product Signal Report")

    await user.click(screen.getByRole("button", { name: "Copy as Markdown" }))

    expect(copyTextToClipboardMock).toHaveBeenCalledTimes(1)
    expect(await screen.findByText("Unable to copy Markdown.")).toBeInTheDocument()
  })

  it("submits useful feedback for the current report", async () => {
    copyTextToClipboardMock.mockResolvedValue(undefined)

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => healthyReadiness })
      .mockResolvedValueOnce({ ok: true, json: async () => metadata })
      .mockResolvedValueOnce({ ok: true, json: async () => completedJob })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          feedbackId: "feedback-123",
          status: "accepted",
          createdAt: "2026-07-06T12:00:00Z"
        })
      })
    vi.stubGlobal("fetch", fetchMock)

    const user = userEvent.setup()
    render(<App />)

    await screen.findByText("Ready (v1)")
    await user.type(screen.getByLabelText("Source URL"), "https://www.reddit.com/r/example/comments/123/example/")
    await user.type(screen.getByLabelText("Discussion excerpts"), "I need this to be easier to compare.")
    await user.click(screen.getByRole("button", { name: "Generate report" }))
    await screen.findByText("Founder Product Signal Report")

    await user.click(screen.getByRole("button", { name: "Useful" }))

    expect(await screen.findByText("Feedback submitted.")).toBeInTheDocument()
    expect(fetchMock).toHaveBeenLastCalledWith(
      expect.stringContaining("/api/feedback"),
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining("\"feedbackKind\":\"useful\"")
      })
    )
  })

  it("shows a user-safe message when feedback submission fails", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => healthyReadiness })
      .mockResolvedValueOnce({ ok: true, json: async () => metadata })
      .mockResolvedValueOnce({ ok: true, json: async () => completedJob })
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          code: "FEEDBACK_VALIDATION_ERROR",
          message: "Feedback kind is invalid."
        })
      })
    vi.stubGlobal("fetch", fetchMock)

    const user = userEvent.setup()
    render(<App />)

    await screen.findByText("Ready (v1)")
    await user.type(screen.getByLabelText("Source URL"), "https://www.reddit.com/r/example/comments/123/example/")
    await user.type(screen.getByLabelText("Discussion excerpts"), "I need this to be easier to compare.")
    await user.click(screen.getByRole("button", { name: "Generate report" }))
    await screen.findByText("Founder Product Signal Report")

    await user.click(screen.getByRole("button", { name: "Not useful" }))

    expect(await screen.findByText("Unable to submit feedback.")).toBeInTheDocument()
  })
})
