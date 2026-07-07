import { describe, expect, it } from "vitest"
import { formatProductSignalReportMarkdown } from "./reportMarkdown"

const structuredJob = {
  jobId: "job-123",
  contentHash: "hash-123",
  result: {
    source: {
      url: "https://www.reddit.com/r/example/comments/123/example/"
    }
  },
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
    complaints: [],
    objections: [],
    competitorMentions: [],
    demandSignals: [
      {
        title: undefined,
        text: "People actively ask for clearer synthesis.",
        explanation: "That request suggests direct demand for the product behavior."
      }
    ],
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
  }
}

describe("formatProductSignalReportMarkdown", () => {
  it("produces Markdown with metadata header and executive summary", () => {
    const markdown = formatProductSignalReportMarkdown(structuredJob)

    expect(markdown).toContain("# Product Signal Report")
    expect(markdown).toContain("- Platform: reddit")
    expect(markdown).toContain("- Source URL: https://www.reddit.com/r/example/comments/123/example/")
    expect(markdown).toContain("## Executive summary")
    expect(markdown).toContain("Founders are hearing repeated demand for cleaner comparison and synthesis.")
  })

  it("includes only non-empty sections and formats item metadata consistently", () => {
    const markdown = formatProductSignalReportMarkdown(structuredJob)

    expect(markdown).toContain("## Pain points")
    expect(markdown).toContain("- **Signal overload** Users struggle to compare noisy discussion threads quickly.")
    expect(markdown).toContain("  Explanation: The discussion repeatedly frames comparison as tedious and messy.")
    expect(markdown).toContain("  Evidence: 3 | Confidence: high | Sources: reddit-thread-123")
    expect(markdown).toContain("## Demand signals")
    expect(markdown).not.toContain("## Feature requests")
    expect(markdown).not.toContain("No signals returned.")
  })

  it("throws when structured report data is missing", () => {
    expect(() =>
      formatProductSignalReportMarkdown({
        jobId: "job-123",
        contentHash: "hash-123",
        report: null,
        result: null
      })
    ).toThrow("Structured report data is required for Markdown export.")
  })
})
