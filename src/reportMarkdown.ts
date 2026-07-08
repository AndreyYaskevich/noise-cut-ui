import type { ProductSignalReportItem, ProductSignalReportResponse } from "./api/noiseCutApi"
import { normalizeLanguage, type Language } from "./i18n"

type MarkdownJob = {
  jobId: string
  contentHash: string
  report?: ProductSignalReportResponse | null
  result?: unknown
}

const markdownText = {
  en: {
    missing: "none",
    product: "Product/category",
    marketplace: "Marketplace",
    riskScore: "Risk score",
    researchIntent: "Research intent",
    jobId: "Job ID",
    contentHash: "Content hash",
    generated: "Generated",
    executiveSummary: "Executive summary",
    transparency: "Source transparency",
    analyzedEvidence: "Analyzed evidence signals",
    reportConfidence: "Report confidence",
    referenceCount: "Reference count",
    urlNote: "Allegro links are context references; NoiseCut does not automatically fetch or analyze Allegro page content in v0.1.",
    explanation: "Explanation",
    evidenceSnippets: "Evidence snippets",
    signals: "Signal count",
    confidence: "Confidence",
    sources: "Sources",
    references: "Sources / references",
    sections: {
      limitations: "Limitations and confidence",
      complaints: "Repeated complaints",
      praised: "Praised features",
      risks: "Product risk areas",
      objections: "Buyer objections",
      listing: "Allegro listing recommendations",
      product: "Product recommendations",
      competitors: "Competitor weaknesses",
      angles: "Listing copy angles"
    },
    intents: {
      listing_optimization: "listing optimization",
      competitor_review: "competitor analysis",
      launch: "product launch",
      sourcing: "sourcing"
    }
  },
  pl: {
    missing: "brak",
    product: "Produkt/kategoria",
    marketplace: "Marketplace",
    riskScore: "Risk score",
    researchIntent: "Intencja badania",
    jobId: "Job ID",
    contentHash: "Content hash",
    generated: "Wygenerowano",
    executiveSummary: "Executive summary",
    transparency: "Transparentnosc zrodel",
    analyzedEvidence: "Przeanalizowane sygnaly evidence",
    reportConfidence: "Pewnosc raportu",
    referenceCount: "Liczba referencji",
    urlNote: "Linki Allegro sa referencjami kontekstu; NoiseCut nie pobiera ani nie analizuje automatycznie tresci stron Allegro w v0.1.",
    explanation: "Wyjasnienie",
    evidenceSnippets: "Evidence snippets",
    signals: "Liczba sygnalow",
    confidence: "Pewnosc",
    sources: "Zrodla",
    references: "Zrodla / referencje",
    sections: {
      limitations: "Ograniczenia i pewnosc",
      complaints: "Powtarzajace sie skargi",
      praised: "Chwalone cechy",
      risks: "Obszary ryzyka produktu",
      objections: "Obiekcje kupujacych",
      listing: "Rekomendacje do oferty Allegro",
      product: "Rekomendacje produktowe",
      competitors: "Slabosci konkurencji",
      angles: "Katy komunikacji w opisie"
    },
    intents: {
      listing_optimization: "optymalizacja oferty",
      competitor_review: "analiza konkurencji",
      launch: "launch produktu",
      sourcing: "sourcing"
    }
  }
} as const

export function formatProductSignalReportMarkdown(job: MarkdownJob) {
  if (!job.report) {
    throw new Error("Structured report data is required for Markdown export.")
  }

  const report = job.report
  const language = getReportLanguage(report)
  const text = markdownText[language]
  const lines = [
    "# NoiseCut: Product Risk & Opportunity Report",
    "",
    `- ${text.product}: ${report.metadata.keyword ?? text.missing}`,
    `- ${text.marketplace}: ${report.metadata.sourceType}`,
    `- ${text.riskScore}: ${formatRiskScore(report.riskScore)}`,
    `- ${text.researchIntent}: ${formatResearchIntent(report.metadata.researchIntent, language)}`,
    `- ${text.jobId}: ${job.jobId}`,
    `- ${text.contentHash}: ${job.contentHash}`,
    `- ${text.generated}: ${report.metadata.generatedAt}`,
    "",
    `## ${text.executiveSummary}`,
    "",
    report.summary
  ]

  lines.push(
    "",
    `## ${text.transparency}`,
    "",
    `- ${text.analyzedEvidence}: ${getAnalyzedEvidenceCount(report)}`,
    `- ${text.reportConfidence}: ${getReportConfidence(report)}`,
    `- ${text.referenceCount}: ${getReferenceCount(report)}`,
    `- ${text.urlNote}`
  )

  for (const section of reportSections(report, language)) {
    if (section.items.length === 0) {
      continue
    }

    lines.push("", `## ${section.title}`, "")

    for (const item of section.items) {
      lines.push(formatPrimaryLine(item))
      lines.push(`  ${text.explanation}: ${item.explanation}`)

      const evidence = item.evidenceSnippets?.filter(Boolean) ?? []
      if (evidence.length > 0) {
        lines.push(`  ${text.evidenceSnippets}:`)
        evidence.forEach((snippet) => lines.push(`  - ${snippet}`))
      }

      const metadataLine = formatMetadataLine(item, language)
      if (metadataLine) {
        lines.push(`  ${metadataLine}`)
      }
    }
  }

  const urls = report.metadata.listingUrls?.filter(Boolean) ?? []
  if (urls.length > 0) {
    lines.push("", `## ${text.references}`, "")
    urls.forEach((url) => lines.push(`- ${url}`))
  }

  return `${lines.join("\n")}\n`
}

function getReportLanguage(report: ProductSignalReportResponse): Language {
  return normalizeLanguage(report.metadata.reportLanguage, "pl")
}

function reportSections(report: ProductSignalReportResponse, language: Language) {
  const sections = markdownText[language].sections
  return [
    { title: sections.limitations, items: report.limitations },
    { title: sections.complaints, items: report.complaints.length > 0 ? report.complaints : report.painPoints },
    { title: sections.praised, items: report.praisedFeatures ?? report.demandSignals },
    { title: sections.risks, items: report.productRiskAreas ?? report.limitations },
    { title: sections.objections, items: report.objections },
    { title: sections.listing, items: report.listingRecommendations ?? report.contentIdeas },
    { title: sections.product, items: report.productRecommendations ?? report.productOpportunities },
    { title: sections.competitors, items: report.competitorMentions },
    { title: sections.angles, items: report.listingCopyAngles ?? [] }
  ]
}

function formatPrimaryLine(item: ProductSignalReportItem) {
  return item.title ? `- **${item.title}** ${item.text}` : `- ${item.text}`
}

function formatMetadataLine(item: ProductSignalReportItem, language: Language) {
  const text = markdownText[language]
  const parts = [
    item.evidenceCount ? `${text.signals}: ${item.evidenceCount}` : null,
    item.confidence ? `${text.confidence}: ${item.confidence}` : null,
    item.sourceReferences?.length ? `${text.sources}: ${item.sourceReferences.join(", ")}` : null
  ].filter(Boolean)

  return parts.join(" | ")
}

function getAnalyzedEvidenceCount(report: ProductSignalReportResponse) {
  return Math.max(0, ...collectEvidenceBearingItems(report).map((item) => item.evidenceCount ?? 0))
}

function getReferenceCount(report: ProductSignalReportResponse) {
  const references = new Set<string>()

  report.metadata.listingUrls?.filter(Boolean).forEach((reference) => references.add(reference))
  collectReportItems(report).forEach((item) => item.sourceReferences?.filter(Boolean).forEach((reference) => references.add(reference)))

  return references.size
}

function getReportConfidence(report: ProductSignalReportResponse) {
  const values = collectEvidenceBearingItems(report)
    .map((item) => item.confidence)
    .filter(Boolean)
    .map((value) => value!.toLowerCase())

  if (values.includes("low")) {
    return "low"
  }

  if (values.includes("medium")) {
    return "medium"
  }

  if (values.includes("high")) {
    return "high"
  }

  return "unknown"
}

function collectEvidenceBearingItems(report: ProductSignalReportResponse) {
  return collectReportItems(report).filter((item) => Boolean(item.evidenceCount || item.evidenceSnippets?.length))
}

function collectReportItems(report: ProductSignalReportResponse) {
  return [
    ...report.painPoints,
    ...report.featureRequests,
    ...report.complaints,
    ...report.objections,
    ...report.competitorMentions,
    ...report.demandSignals,
    ...report.userLanguage,
    ...report.contentIdeas,
    ...report.productOpportunities,
    ...report.limitations,
    ...(report.praisedFeatures ?? []),
    ...(report.productRiskAreas ?? []),
    ...(report.listingRecommendations ?? []),
    ...(report.productRecommendations ?? []),
    ...(report.listingCopyAngles ?? [])
  ]
}

function formatRiskScore(value?: string | null) {
  if (value === "low") {
    return "low"
  }

  if (value === "high") {
    return "high"
  }

  return "medium"
}

function formatResearchIntent(value: string | null | undefined, language: Language) {
  const intents = markdownText[language].intents
  if (value === "listing_optimization") {
    return intents.listing_optimization
  }

  if (value === "competitor_review") {
    return intents.competitor_review
  }

  if (value === "launch") {
    return intents.launch
  }

  return intents.sourcing
}
