import { describe, expect, it } from "vitest"
import { formatProductSignalReportMarkdown } from "./reportMarkdown"

const structuredJob = {
  jobId: "job-123",
  contentHash: "hash-123",
  report: {
    summary: "Kupujacy widza wartosc, ale powtarza sie ryzyko slabej baterii.",
    riskScore: "medium",
    painPoints: [],
    featureRequests: [],
    complaints: [
      {
        title: "Powtarzajaca sie skarga 1",
        text: "Bateria trzyma krocej niz obiecuje opis.",
        explanation: "Ten problem moze zwiekszac zwroty.",
        evidenceCount: 3,
        confidence: "high",
        sourceReferences: ["https://allegro.pl/oferta/test"],
        evidenceSnippets: ["Bateria pada po 20 minutach"]
      }
    ],
    objections: [],
    competitorMentions: [],
    demandSignals: [],
    userLanguage: [],
    contentIdeas: [],
    productOpportunities: [],
    limitations: [],
    praisedFeatures: [
      {
        title: undefined,
        text: "Lekka konstrukcja jest doceniana.",
        explanation: "Kupujacy lubia wygode noszenia."
      }
    ],
    productRiskAreas: [],
    listingRecommendations: [],
    productRecommendations: [],
    listingCopyAngles: [],
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
      researchIntent: "sourcing"
    }
  }
}

describe("formatProductSignalReportMarkdown", () => {
  it("produces Markdown with Allegro metadata header and executive summary", () => {
    const markdown = formatProductSignalReportMarkdown(structuredJob)

    expect(markdown).toContain("# NoiseCut: Product Risk & Opportunity Report")
    expect(markdown).toContain("- Produkt/kategoria: odkurzacz pionowy")
    expect(markdown).toContain("- Marketplace: allegro")
    expect(markdown).toContain("- Risk score: medium")
    expect(markdown).toContain("## Executive summary")
    expect(markdown).toContain("Kupujacy widza wartosc, ale powtarza sie ryzyko slabej baterii.")
    expect(markdown).toContain("## Transparentnosc zrodel")
    expect(markdown).toContain("- Przeanalizowane sygnaly evidence: 3")
    expect(markdown).toContain("- Pewnosc raportu: high")
    expect(markdown).toContain("- Liczba referencji: 1")
    expect(markdown).toContain("Linki Allegro sa referencjami kontekstu")
  })

  it("includes non-empty Allegro sections and formats evidence metadata", () => {
    const markdown = formatProductSignalReportMarkdown(structuredJob)

    expect(markdown).toContain("## Powtarzajace sie skargi")
    expect(markdown).toContain("- **Powtarzajaca sie skarga 1** Bateria trzyma krocej niz obiecuje opis.")
    expect(markdown).toContain("  Wyjasnienie: Ten problem moze zwiekszac zwroty.")
    expect(markdown).toContain("  Evidence snippets:")
    expect(markdown).toContain("  - Bateria pada po 20 minutach")
    expect(markdown).toContain("  Liczba sygnalow: 3 | Pewnosc: high | Zrodla: https://allegro.pl/oferta/test")
    expect(markdown).toContain("## Chwalone cechy")
    expect(markdown).toContain("## Zrodla / referencje")
    expect(markdown).not.toContain("## Obiekcje kupujacych")
  })

  it("throws when structured report data is missing", () => {
    expect(() =>
      formatProductSignalReportMarkdown({
        jobId: "job-123",
        contentHash: "hash-123",
        report: null
      })
    ).toThrow("Structured report data is required for Markdown export.")
  })
})
