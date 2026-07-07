import { type FormEvent, useEffect, useState } from "react"
import {
  checkApiConnection,
  createAnalysisJob,
  getAnalysisJob,
  submitFeedback,
  type AnalysisJobResponse,
  type ApiConnectionStatus,
  type FeedbackKind,
  type ProductSignalReportItem,
  type ProductSignalReportResponse,
  type SourceType
} from "./api/noiseCutApi"
import { copyTextToClipboard } from "./clipboard"
import { API_CONFIG, FORM_DEFAULTS } from "./config"
import { formatProductSignalReportMarkdown } from "./reportMarkdown"

const reportSections = [
  "Executive summary",
  "Pain points",
  "Feature requests",
  "Complaints",
  "Objections",
  "Competitor mentions",
  "Demand signals",
  "User language",
  "Content ideas",
  "Product opportunities",
  "Limitations"
]

type SubmissionMode = "pasted-evidence" | "url-only"

export function App() {
  const [apiStatus, setApiStatus] = useState<ApiConnectionStatus>({ state: "error", message: "Checking API..." })
  const [sourceUrl, setSourceUrl] = useState("")
  const [researchContext, setResearchContext] = useState("")
  const [evidenceText, setEvidenceText] = useState("")
  const [submissionMode, setSubmissionMode] = useState<SubmissionMode>("pasted-evidence")
  const [reportJob, setReportJob] = useState<AnalysisJobResponse | null>(null)
  const [reportError, setReportError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function refreshApiStatus() {
    setApiStatus({ state: "error", message: "Checking API..." })
    setApiStatus(await checkApiConnection())
  }

  useEffect(() => {
    void refreshApiStatus()
  }, [])

  const inferredSourceType = inferSourceType(sourceUrl)
  const urlOnlySupport = getUrlOnlySupport(inferredSourceType, apiStatus)

  useEffect(() => {
    if (submissionMode === "url-only" && !urlOnlySupport.enabled) {
      setSubmissionMode("pasted-evidence")
    }
  }, [submissionMode, urlOnlySupport.enabled])

  async function submitReport(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const platform = inferredSourceType
    const items = parseEvidenceItems(evidenceText)

    if (!platform) {
      setReportError("Use a Reddit or YouTube URL.")
      return
    }

    if (submissionMode === "url-only" && !urlOnlySupport.enabled) {
      setReportError(urlOnlySupport.message)
      return
    }

    if (submissionMode === "pasted-evidence" && items.length === 0) {
      setReportError("Paste at least one discussion excerpt.")
      return
    }

    setIsSubmitting(true)
    setReportError(null)
    setReportJob(null)

    try {
      const createdJob = await createAnalysisJob({
        sourceType: platform,
        url: sourceUrl.trim(),
        title: sourceUrl.trim(),
        body: researchContext.trim() || undefined,
        items: submissionMode === "url-only" ? [] : items,
        metadata: {
          lens: FORM_DEFAULTS.lens,
          uiSurface: "noise-cut-ui",
          inputMode: submissionMode
        },
        extractedAt: new Date().toISOString(),
        analysisType: "ProductVerdict"
      })

      setReportJob(createdJob)

      if (!isTerminalJob(createdJob)) {
        setReportJob(await pollAnalysisJob(createdJob.jobId))
      }
    } catch (error) {
      setReportError(toDisplayError(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="app-shell">
      <section className="workspace" aria-labelledby="page-title">
        <div className="intro">
          <p className="eyebrow">NoiseCut Web App v0</p>
          <h1 id="page-title">Product Signal Report</h1>
          <p className="summary">
            Turn Reddit threads and YouTube discussions into structured founder insight.
          </p>
        </div>

        <form className="report-form" aria-label="New report" onSubmit={submitReport}>
          <label>
            Source URL
            <input
              type="url"
              placeholder="https://www.reddit.com/..."
              value={sourceUrl}
              onChange={(event) => setSourceUrl(event.target.value)}
              required
            />
          </label>

          <label>
            Lens
            <select defaultValue={FORM_DEFAULTS.lens} disabled>
              <option value="founder">Founder</option>
            </select>
          </label>

          <fieldset className="submission-mode-fieldset">
            <legend>Submission mode</legend>
            <div className="submission-mode-control" role="radiogroup" aria-label="Submission mode">
              <label className={`submission-mode-option${submissionMode === "pasted-evidence" ? " submission-mode-option-selected" : ""}`}>
                <input
                  type="radio"
                  name="submission-mode"
                  value="pasted-evidence"
                  checked={submissionMode === "pasted-evidence"}
                  onChange={() => setSubmissionMode("pasted-evidence")}
                />
                <span>Paste evidence</span>
              </label>
              <label
                className={`submission-mode-option${submissionMode === "url-only" ? " submission-mode-option-selected" : ""}${urlOnlySupport.enabled ? "" : " submission-mode-option-disabled"}`}
              >
                <input
                  type="radio"
                  name="submission-mode"
                  value="url-only"
                  checked={submissionMode === "url-only"}
                  onChange={() => setSubmissionMode("url-only")}
                  disabled={!urlOnlySupport.enabled}
                />
                <span>Use URL only</span>
              </label>
            </div>
            <p className="status-detail">{formatSubmissionModeHint(submissionMode, inferredSourceType, urlOnlySupport)}</p>
            {submissionMode === "pasted-evidence" && inferredSourceType === "youtube" ? (
              <p className="status-detail">Use Paste evidence for YouTube discussions.</p>
            ) : null}
          </fieldset>

          <label>
            Research context
            <textarea
              placeholder="Optional product, market, or customer context"
              rows={5}
              value={researchContext}
              onChange={(event) => setResearchContext(event.target.value)}
            />
          </label>

          {submissionMode === "pasted-evidence" ? (
            <label>
              Discussion excerpts
              <textarea
                placeholder="Paste representative comments, transcript lines, or discussion excerpts"
                rows={8}
                value={evidenceText}
                onChange={(event) => setEvidenceText(event.target.value)}
                required
              />
            </label>
          ) : (
            <section className="mode-status-card" aria-label="URL-only mode status">
              <h2>URL-only mode</h2>
              <p className="status-detail">{urlOnlySupport.message}</p>
            </section>
          )}

          {reportError ? (
            <p className="form-message form-message-error" role="alert">
              {reportError}
            </p>
          ) : null}

          <button type="submit" disabled={apiStatus.state !== "ready" || isSubmitting}>
            {isSubmitting ? "Generating..." : "Generate report"}
          </button>
        </form>

        {reportJob ? <ReportResult job={reportJob} sourceUrl={sourceUrl.trim()} /> : null}
      </section>

      <aside className="report-outline" aria-labelledby="outline-title">
        <section className="api-status" aria-live="polite">
          <div>
            <p className="status-label">API status</p>
            <p className={`status-value status-${apiStatus.state}`}>{formatApiStatus(apiStatus)}</p>
          </div>
          <p className="status-detail">{API_CONFIG.baseUrl}</p>
          <button className="secondary-button" type="button" onClick={refreshApiStatus}>
            Check again
          </button>
        </section>

        <h2 id="outline-title">Report sections</h2>
        <ul>
          {reportSections.map((section) => (
            <li key={section}>{section}</li>
          ))}
        </ul>
      </aside>
    </main>
  )
}

function formatApiStatus(status: ApiConnectionStatus) {
  if (status.state === "ready") {
    return `Ready (${status.metadata.contractVersion})`
  }

  return status.message
}

function ReportResult({ job, sourceUrl }: { job: AnalysisJobResponse; sourceUrl: string }) {
  const report = job.report
  const result = job.result
  const [copyState, setCopyState] = useState<"idle" | "success" | "error">("idle")
  const [isCopying, setIsCopying] = useState(false)
  const [feedbackState, setFeedbackState] = useState<"idle" | "success" | "error">("idle")
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false)

  const resolvedSourceUrl = result?.source.url ?? sourceUrl
  const resolvedSourceType = report?.metadata.sourceType ?? result?.source.sourceType ?? inferSourceType(sourceUrl) ?? "reddit"
  const externalId = result?.source.externalId ?? undefined

  async function copyMarkdown() {
    if (!report) {
      setCopyState("error")
      return
    }

    setCopyState("idle")
    setIsCopying(true)

    try {
      await copyTextToClipboard(formatProductSignalReportMarkdown(job))
      setCopyState("success")
    } catch {
      setCopyState("error")
    } finally {
      setIsCopying(false)
    }
  }

  async function sendFeedback(feedbackKind: FeedbackKind) {
    if (!resolvedSourceUrl) {
      setFeedbackState("error")
      return
    }

    setFeedbackState("idle")
    setIsSubmittingFeedback(true)

    try {
      await submitFeedback({
        jobId: job.jobId,
        contentHash: job.contentHash,
        sourceType: resolvedSourceType,
        sourceUrl: resolvedSourceUrl,
        externalId,
        feedbackKind,
        mode: "insight",
        metadata: {
          lens: report?.metadata.lens ?? "founder",
          uiSurface: "noise-cut-ui",
          reportFormat: report ? "structured" : "verdict-fallback"
        },
        createdAt: new Date().toISOString()
      })
      setFeedbackState("success")
    } catch {
      setFeedbackState("error")
    } finally {
      setIsSubmittingFeedback(false)
    }
  }

  return (
    <section className="result-panel" aria-labelledby="result-title">
      <div className="result-header">
        <div>
          <p className="eyebrow">Analysis job</p>
          <h2 id="result-title">Current result</h2>
        </div>
        <div className="result-actions">
          {report ? (
            <button className="secondary-button" type="button" onClick={copyMarkdown} disabled={isCopying}>
              {isCopying ? "Copying..." : "Copy as Markdown"}
            </button>
          ) : null}
          <p className={`job-status job-status-${job.status.toLowerCase()}`}>{job.status}</p>
        </div>
      </div>

      <dl className="job-meta">
        <div>
          <dt>Job ID</dt>
          <dd>{job.jobId}</dd>
        </div>
        <div>
          <dt>Content hash</dt>
          <dd>{job.contentHash}</dd>
        </div>
      </dl>

      {job.error ? (
        <p className="form-message form-message-error" role="alert">
          {job.error.message}
        </p>
      ) : null}

      {copyState === "success" ? <p className="form-message form-message-success">Markdown copied.</p> : null}
      {copyState === "error" ? (
        <p className="form-message form-message-error" role="alert">
          Unable to copy Markdown.
        </p>
      ) : null}

      {isTerminalJob(job) && !job.error ? (
        <section className="feedback-panel" aria-labelledby="feedback-title">
          <div className="feedback-header">
            <div>
              <h3 id="feedback-title">Report feedback</h3>
              <p className="status-detail">Was this report useful for founder research?</p>
            </div>
            <div className="feedback-actions">
              <button
                className="secondary-button"
                type="button"
                onClick={() => void sendFeedback("useful")}
                disabled={isSubmittingFeedback || feedbackState === "success"}
              >
                Useful
              </button>
              <button
                className="secondary-button"
                type="button"
                onClick={() => void sendFeedback("not_useful")}
                disabled={isSubmittingFeedback || feedbackState === "success"}
              >
                Not useful
              </button>
            </div>
          </div>

          {feedbackState === "success" ? (
            <p className="form-message form-message-success">Feedback submitted.</p>
          ) : null}
          {feedbackState === "error" ? (
            <p className="form-message form-message-error" role="alert">
              Unable to submit feedback.
            </p>
          ) : null}
        </section>
      ) : null}

      {report ? (
        <StructuredReport report={report} />
      ) : result ? (
        <div className="result-body">
          <p className="verdict">{result.verdict}</p>
          <p>{result.summary}</p>

          <div className="result-grid">
            <ResultList title="Pros" items={result.pros} />
            <ResultList title="Cons" items={result.cons} />
          </div>

          <section>
            <h3>Recommendation</h3>
            <p>{result.consensus.recommendation}</p>
          </section>

          {result.risks.length > 0 ? (
            <section>
              <h3>Risks</h3>
              <ul>
                {result.risks.map((risk) => (
                  <li key={`${risk.code}-${risk.description}`}>
                    <strong>{risk.severity}:</strong> {risk.description}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {result.topics.length > 0 ? (
            <section>
              <h3>Topics</h3>
              <ul className="topic-list">
                {result.topics.map((topic) => (
                  <li key={`${topic.name}-${topic.sentiment}`}>
                    {topic.name} <span>{topic.sentiment}</span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      ) : (
        <p className="status-detail">The API accepted the request. Waiting for the background job to finish.</p>
      )}
    </section>
  )
}

function StructuredReport({ report }: { report: ProductSignalReportResponse }) {
  const sections = [
    { title: "Pain points", items: report.painPoints, hideWhenEmpty: false },
    { title: "Feature requests", items: report.featureRequests, hideWhenEmpty: true },
    { title: "Complaints", items: report.complaints, hideWhenEmpty: false },
    { title: "Objections", items: report.objections, hideWhenEmpty: true },
    { title: "Competitor mentions", items: report.competitorMentions, hideWhenEmpty: false },
    { title: "Demand signals", items: report.demandSignals, hideWhenEmpty: false },
    { title: "User language", items: report.userLanguage, hideWhenEmpty: false },
    { title: "Content ideas", items: report.contentIdeas, hideWhenEmpty: false },
    { title: "Product opportunities", items: report.productOpportunities, hideWhenEmpty: false },
    { title: "Limitations", items: report.limitations, hideWhenEmpty: false }
  ].filter((section) => !(section.hideWhenEmpty && section.items.length === 0))

  return (
    <div className="result-body">
      <p className="verdict">Founder Product Signal Report</p>
      <p>{report.summary}</p>

      <dl className="report-meta">
        <div>
          <dt>Lens</dt>
          <dd>{report.metadata.lens ?? "founder"}</dd>
        </div>
        <div>
          <dt>Generated</dt>
          <dd>{formatTimestamp(report.metadata.generatedAt)}</dd>
        </div>
        <div>
          <dt>Projection</dt>
          <dd>{report.metadata.projectionVersion}</dd>
        </div>
      </dl>

      <div className="report-sections-grid">
        {sections.map((section) => (
          <section key={section.title} className="report-section-card">
            <h3>{section.title}</h3>
            {section.items.length > 0 ? (
              <ul className="report-item-list">
                {section.items.map((item, index) => (
                  <li key={`${section.title}-${item.title ?? item.text}-${index}`} className="report-item">
                    {item.title ? <p className="report-item-title">{item.title}</p> : null}
                    <p className="report-item-text">{item.text}</p>
                    <p className="report-item-explanation">{item.explanation}</p>
                    {item.evidenceCount || item.confidence || item.sourceReferences?.length ? (
                      <p className="report-item-meta">
                        {formatItemMeta(item)}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="status-detail">No signals returned.</p>
            )}
          </section>
        ))}
      </div>
    </div>
  )
}

function ResultList({ title, items }: { title: string; items: string[] }) {
  return (
    <section>
      <h3>{title}</h3>
      {items.length > 0 ? (
        <ul>
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : (
        <p className="status-detail">No items returned.</p>
      )}
    </section>
  )
}

function inferSourceType(url: string): SourceType | null {
  const normalized = url.toLowerCase()

  if (normalized.includes("reddit.com")) {
    return "reddit"
  }

  if (normalized.includes("youtube.com") || normalized.includes("youtu.be")) {
    return "youtube"
  }

  return null
}

function getUrlOnlySupport(sourceType: SourceType | null, apiStatus: ApiConnectionStatus) {
  if (apiStatus.state !== "ready" || !apiStatus.metadata.capabilities.urlOnly.supported) {
    return {
      enabled: false,
      message: "URL-only submission is not currently available from this API."
    }
  }

  const supportedSourceTypes = apiStatus.metadata.capabilities.urlOnly.supportedSourceTypes

  if (sourceType && supportedSourceTypes.includes(sourceType)) {
    return {
      enabled: true,
      message: "The API will extract the discussion directly from the URL."
    }
  }

  if (sourceType === "youtube") {
    return {
      enabled: false,
      message: "URL-only is currently available for Reddit URLs. Use Paste evidence for YouTube."
    }
  }

  return {
    enabled: false,
    message: "Enter a supported Reddit URL to use URL-only submission."
  }
}

function formatSubmissionModeHint(
  submissionMode: SubmissionMode,
  sourceType: SourceType | null,
  urlOnlySupport: { enabled: boolean; message: string }
) {
  if (submissionMode === "url-only") {
    return urlOnlySupport.message
  }

  if (sourceType === "reddit" && urlOnlySupport.enabled) {
    return "Paste evidence manually or switch to Use URL only for Reddit extraction."
  }

  if (sourceType === "youtube") {
    return "Paste evidence is the supported mode for YouTube in v0."
  }

  return "Paste evidence works for Reddit and YouTube. URL-only is currently Reddit-only."
}

function parseEvidenceItems(rawText: string) {
  return rawText
    .split(/\n{2,}|\r?\n/)
    .map((text, index) => ({ id: `ui-${index + 1}`, text: text.trim() }))
    .filter((item) => item.text.length > 0)
}

async function pollAnalysisJob(jobId: string) {
  let latestJob = await getAnalysisJob(jobId)

  for (let attempt = 0; attempt < 20 && !isTerminalJob(latestJob); attempt += 1) {
    await wait(1500)
    latestJob = await getAnalysisJob(jobId)
  }

  return latestJob
}

function isTerminalJob(job: AnalysisJobResponse) {
  const status = job.status.toLowerCase()
  return Boolean(job.result || job.error || status === "completed" || status === "failed" || status === "cancelled")
}

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}

function formatItemMeta(item: ProductSignalReportItem) {
  const parts = [
    item.evidenceCount ? `${item.evidenceCount} evidence item${item.evidenceCount === 1 ? "" : "s"}` : null,
    item.confidence ?? null,
    item.sourceReferences?.length ? item.sourceReferences.join(", ") : null
  ].filter(Boolean)

  return parts.join(" | ")
}

function formatTimestamp(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleString()
}

function toDisplayError(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message
  }

  return "Unable to generate the report."
}
