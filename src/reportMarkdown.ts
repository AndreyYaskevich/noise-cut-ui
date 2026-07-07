import type { ProductSignalReportItem, ProductSignalReportResponse } from "./api/noiseCutApi"

type MarkdownJob = {
  jobId: string
  contentHash: string
  report?: ProductSignalReportResponse | null
  result?: {
    source?: {
      url?: string | null
    } | null
  } | null
}

export function formatProductSignalReportMarkdown(job: MarkdownJob) {
  if (!job.report) {
    throw new Error("Structured report data is required for Markdown export.")
  }

  const lines = [
    "# Product Signal Report",
    "",
    `- Platform: ${job.report.metadata.sourceType}`,
    ...(job.result?.source?.url ? [`- Source URL: ${job.result.source.url}`] : []),
    `- Lens: ${job.report.metadata.lens ?? "founder"}`,
    `- Job ID: ${job.jobId}`,
    `- Content hash: ${job.contentHash}`,
    `- Generated: ${job.report.metadata.generatedAt}`,
    "",
    "## Executive summary",
    "",
    job.report.summary
  ]

  for (const section of reportSections(job.report)) {
    if (section.items.length === 0) {
      continue
    }

    lines.push("", `## ${section.title}`, "")

    for (const item of section.items) {
      lines.push(formatPrimaryLine(item))
      lines.push(`  Explanation: ${item.explanation}`)

      const metadataLine = formatMetadataLine(item)
      if (metadataLine) {
        lines.push(`  ${metadataLine}`)
      }
    }
  }

  return `${lines.join("\n")}\n`
}

function reportSections(report: ProductSignalReportResponse) {
  return [
    { title: "Pain points", items: report.painPoints },
    { title: "Feature requests", items: report.featureRequests },
    { title: "Complaints", items: report.complaints },
    { title: "Objections", items: report.objections },
    { title: "Competitor mentions", items: report.competitorMentions },
    { title: "Demand signals", items: report.demandSignals },
    { title: "User language", items: report.userLanguage },
    { title: "Content ideas", items: report.contentIdeas },
    { title: "Product opportunities", items: report.productOpportunities },
    { title: "Limitations", items: report.limitations }
  ]
}

function formatPrimaryLine(item: ProductSignalReportItem) {
  return item.title ? `- **${item.title}** ${item.text}` : `- ${item.text}`
}

function formatMetadataLine(item: ProductSignalReportItem) {
  const parts = [
    item.evidenceCount ? `Evidence: ${item.evidenceCount}` : null,
    item.confidence ? `Confidence: ${item.confidence}` : null,
    item.sourceReferences?.length ? `Sources: ${item.sourceReferences.join(", ")}` : null
  ].filter(Boolean)

  return parts.join(" | ")
}
