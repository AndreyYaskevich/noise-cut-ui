import { type ComponentType, type FormEvent, type ReactNode, useEffect, useRef, useState } from "react"
import {
  AudioWaveform,
  BookOpen,
  CheckCircle2,
  Copy,
  FileText,
  History,
  LayoutDashboard,
  RefreshCw,
  Search,
  Settings,
  Sparkles,
  Store,
  Wallet
} from "lucide-react"
import {
  checkApiConnection,
  createAllegroReport,
  getReport,
  listReports,
  requestBetaAccess,
  retryReport,
  submitFeedback,
  setApiLanguage,
  verifyBetaAccess,
  type AnalysisJobResponse,
  type ApiConnectionStatus,
  type BetaAccessResponse,
  type FeedbackKind,
  type ProductSignalReportItem,
  type ProductSignalReportResponse,
  type ReportListItemResponse
} from "./api/noiseCutApi"
import { copyTextToClipboard } from "./clipboard"
import { API_CONFIG, FORM_DEFAULTS } from "./config"
import {
  DEFAULT_REPORT_LANGUAGE_STORAGE_KEY,
  UI_LANGUAGE_STORAGE_KEY,
  detectInitialLanguage,
  getStrings,
  isSupportedLanguage,
  languageName,
  normalizeLanguage,
  type Language
} from "./i18n"
import { formatProductSignalReportMarkdown } from "./reportMarkdown"

const reportSections = [
  "Executive summary",
  "Powtarzajace sie skargi",
  "Chwalone cechy",
  "Obszary ryzyka produktu",
  "Obiekcje kupujacych",
  "Rekomendacje do oferty",
  "Rekomendacje produktowe",
  "Slabosci konkurencji",
  "Katy komunikacji",
  "Evidence i pewnosc"
]

const BETA_EMAIL_STORAGE_KEY = "noisecut.beta.email"
const BETA_ACCESS_CODE_STORAGE_KEY = "noisecut.beta.accessCode"

type AppView = "dashboard" | "new-report" | "history" | "settings" | "report-detail"

let activeUiLanguage: Language = "en"

function text() {
  return getStrings(activeUiLanguage)
}

const evidenceSamples = [
  {
    name: "odkurzacz pionowy",
    keyword: "odkurzacz pionowy",
    listingUrls: "https://allegro.pl/oferta/example-odkurzacz",
    competitors: "Konkurent A",
    targetMarketNotes: "Budzet 250-500 PLN, klienci oczekuja lekkiej konstrukcji i sensownej baterii.",
    pastedEvidence:
      "Bateria pada po 20 minutach.\nLekki i wygodny, ale pojemnik jest maly.\nOpis obiecuje moc, ktorej nie czuc na dywanie.",
    researchIntent: "sourcing"
  },
  {
    name: "fotel biurowy",
    keyword: "fotel biurowy",
    listingUrls: "https://allegro.pl/oferta/example-fotel",
    competitors: "Konkurent B\nKonkurent C",
    targetMarketNotes: "Klienci pracuja z domu i porownuja wygode, stabilnosc oraz reklamacje.",
    pastedEvidence:
      "Po miesiacu zaczyna skrzypiec.\nSiedzisko wygodne, ale material szybko sie przeciera.\nBrakuje jasnej informacji o maksymalnym wzroscie uzytkownika.",
    researchIntent: "listing_optimization"
  },
  {
    name: "sluchawki bezprzewodowe",
    keyword: "sluchawki bezprzewodowe",
    listingUrls: "https://allegro.pl/oferta/example-sluchawki",
    competitors: "Konkurent D",
    targetMarketNotes: "Segment tani i sredni; kupujacy porownuja mikrofon, baterie i stabilnosc Bluetooth.",
    pastedEvidence:
      "Mikrofon slaby do rozmow.\nBateria dobra jak na cene.\nParowanie z telefonem czasem sie zrywa.",
    researchIntent: "competitor_review"
  }
]

export function App() {
  const [uiLanguage, setUiLanguageState] = useState<Language>(() => detectInitialLanguage())
  activeUiLanguage = uiLanguage
  const t = text()
  const [apiStatus, setApiStatus] = useState<ApiConnectionStatus>({ state: "error", message: t.readyChecking })
  const [currentView, setCurrentView] = useState<AppView>("dashboard")
  const [keyword, setKeyword] = useState("")
  const [listingUrls, setListingUrls] = useState("")
  const [competitors, setCompetitors] = useState("")
  const [targetMarketNotes, setTargetMarketNotes] = useState("")
  const [pastedEvidence, setPastedEvidence] = useState("")
  const [researchIntent, setResearchIntent] = useState<string>(FORM_DEFAULTS.researchIntent)
  const [reportLanguage, setReportLanguageState] = useState<Language>(() => {
    const stored = window.localStorage.getItem(DEFAULT_REPORT_LANGUAGE_STORAGE_KEY)
    return isSupportedLanguage(stored) ? stored : uiLanguage
  })
  const [reportJob, setReportJob] = useState<AnalysisJobResponse | null>(null)
  const [reportHistory, setReportHistory] = useState<ReportListItemResponse[]>([])
  const [reportError, setReportError] = useState<string | null>(null)
  const [retryError, setRetryError] = useState<string | null>(null)
  const [historyError, setHistoryError] = useState<string | null>(null)
  const [betaEmail, setBetaEmail] = useState(() => window.localStorage.getItem(BETA_EMAIL_STORAGE_KEY) ?? "")
  const [betaAccessCode, setBetaAccessCode] = useState(() => window.localStorage.getItem(BETA_ACCESS_CODE_STORAGE_KEY) ?? "")
  const [betaAccount, setBetaAccount] = useState<BetaAccessResponse | null>(null)
  const [betaError, setBetaError] = useState<string | null>(null)
  const [isRequestingBetaAccess, setIsRequestingBetaAccess] = useState(false)
  const [isVerifyingBetaAccess, setIsVerifyingBetaAccess] = useState(false)
  const lastAutoVerifyAttemptRef = useRef<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  const evidenceMetrics = getEvidenceMetrics(pastedEvidence, listingUrls)
  const betaAccessEnabled = apiStatus.state === "ready" && apiStatus.metadata.capabilities.betaAccess.enabled
  const betaCanGenerate = !betaAccessEnabled || (betaAccount?.status === "active" && betaAccount.reportsRemaining > 0)
  const betaCanRetry = !betaAccessEnabled || betaAccount?.status === "active"

  function setUiLanguage(language: Language) {
    activeUiLanguage = language
    setApiLanguage(language)
    window.localStorage.setItem(UI_LANGUAGE_STORAGE_KEY, language)
    setUiLanguageState(language)
  }

  function setReportLanguage(language: Language) {
    window.localStorage.setItem(DEFAULT_REPORT_LANGUAGE_STORAGE_KEY, language)
    setReportLanguageState(language)
  }

  async function refreshApiStatus() {
    setApiStatus({ state: "error", message: text().readyChecking })
    setApiStatus(await checkApiConnection())
  }

  async function refreshHistory() {
    setIsLoadingHistory(true)
    setHistoryError(null)

    try {
      const response = await listReports()
      setReportHistory(response.items)
    } catch (error) {
      setHistoryError(toDisplayError(error))
    } finally {
      setIsLoadingHistory(false)
    }
  }

  useEffect(() => {
    setApiLanguage(uiLanguage)
    void refreshApiStatus()
  }, [uiLanguage])

  useEffect(() => {
    if (apiStatus.state === "ready") {
      void refreshHistory()
    }
  }, [apiStatus.state])

  useEffect(() => {
    const autoVerifyKey = getBetaCredentialsKey(betaEmail, betaAccessCode)
    if (
      betaAccessEnabled &&
      autoVerifyKey &&
      !betaAccount &&
      !isVerifyingBetaAccess &&
      lastAutoVerifyAttemptRef.current !== autoVerifyKey
    ) {
      lastAutoVerifyAttemptRef.current = autoVerifyKey
      void verifyBetaCredentials()
    }
  }, [betaAccessEnabled, betaEmail, betaAccessCode, betaAccount, isVerifyingBetaAccess])

  async function submitReport(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const urls = parseLines(listingUrls)
    const competitorList = parseLines(competitors)
    const trimmedKeyword = keyword.trim()
    const trimmedNotes = targetMarketNotes.trim()
    const trimmedEvidence = pastedEvidence.trim()
    const t = text()

    if (!trimmedKeyword) {
      setReportError(t.keywordRequired)
      return
    }

    if (!trimmedEvidence) {
      setReportError(t.evidenceRequired)
      return
    }

    if (trimmedEvidence.length < 15) {
      setReportError(t.evidenceTooShort)
      return
    }

    if (!betaCanGenerate) {
      setReportError(t.betaRequired)
      return
    }

    const invalidUrl = urls.find((url) => !isAllegroUrl(url))
    if (invalidUrl) {
      setReportError(t.invalidAllegroUrl(invalidUrl))
      return
    }

    setIsSubmitting(true)
    setReportError(null)
    setRetryError(null)
    setReportJob(null)

    try {
      const createdJob = await createAllegroReport({
        keyword: trimmedKeyword,
        listingUrls: urls,
        competitors: competitorList,
        targetMarketNotes: trimmedNotes || undefined,
        pastedEvidence: trimmedEvidence || undefined,
        researchIntent,
        reportLanguage
      }, betaAccessEnabled ? { email: betaEmail.trim(), accessCode: betaAccessCode } : undefined)

      setReportJob(createdJob)
      setCurrentView("report-detail")

      if (!isTerminalJob(createdJob)) {
        setReportJob(await pollReport(createdJob.jobId))
      }

      await refreshHistory()
      if (betaAccessEnabled) {
        await verifyBetaCredentials()
      }
    } catch (error) {
      setReportError(toDisplayError(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  async function loadHistoryItem(jobId: string) {
    setReportError(null)
    setRetryError(null)
    setReportJob(null)

    try {
      setReportJob(await getReport(jobId))
      setCurrentView("report-detail")
    } catch (error) {
      setReportError(toDisplayError(error))
    }
  }

  async function retryCurrentReport(jobId: string) {
    if (!betaCanRetry) {
      setRetryError(text().betaRetryRequired)
      return
    }

    setIsSubmitting(true)
    setRetryError(null)

    try {
      const retryJob = await retryReport(
        jobId,
        betaAccessEnabled ? { email: betaEmail.trim(), accessCode: betaAccessCode.trim() } : undefined
      )
      setReportJob(retryJob)
      setCurrentView("report-detail")

      if (!isTerminalJob(retryJob)) {
        setReportJob(await pollReport(retryJob.jobId))
      }

      await refreshHistory()
      if (betaAccessEnabled) {
        await verifyBetaCredentials()
      }
    } catch (error) {
      setRetryError(toDisplayError(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  function useSample(sample: (typeof evidenceSamples)[number]) {
    setKeyword(sample.keyword)
    setListingUrls(sample.listingUrls)
    setCompetitors(sample.competitors)
    setTargetMarketNotes(sample.targetMarketNotes)
    setPastedEvidence(sample.pastedEvidence)
    setResearchIntent(sample.researchIntent)
    setReportError(null)
  }

  async function copySample(sample: (typeof evidenceSamples)[number]) {
    try {
      await copyTextToClipboard(sample.pastedEvidence)
    } catch {
      setReportError(text().sampleCopyFailed)
    }
  }

  async function requestBetaAccessForEmail() {
    if (!betaEmail.trim()) {
      setBetaError(text().betaEmailRequired)
      return
    }

    setIsRequestingBetaAccess(true)
    setBetaError(null)

    try {
      const response = await requestBetaAccess(betaEmail.trim())
      const responseEmail = response.email || betaEmail.trim()
      setBetaAccount(response)
      setBetaAccessCode("")
      window.localStorage.removeItem(BETA_ACCESS_CODE_STORAGE_KEY)
      lastAutoVerifyAttemptRef.current = null
      window.localStorage.setItem(BETA_EMAIL_STORAGE_KEY, responseEmail)
      setBetaEmail(responseEmail)
    } catch (error) {
      setBetaError(toDisplayError(error))
    } finally {
      setIsRequestingBetaAccess(false)
    }
  }

  async function verifyBetaCredentials() {
    if (!betaEmail.trim() || !betaAccessCode.trim()) {
      setBetaError(text().betaCredentialsRequired)
      return
    }

    const credentialsKey = getBetaCredentialsKey(betaEmail, betaAccessCode)
    lastAutoVerifyAttemptRef.current = credentialsKey
    setIsVerifyingBetaAccess(true)
    setBetaError(null)

    try {
      const response = await verifyBetaAccess({ email: betaEmail.trim(), accessCode: betaAccessCode.trim() })
      const responseEmail = response.email || betaEmail.trim()
      setBetaAccount(response)
      window.localStorage.setItem(BETA_EMAIL_STORAGE_KEY, responseEmail)
      window.localStorage.setItem(BETA_ACCESS_CODE_STORAGE_KEY, betaAccessCode.trim())
      setBetaEmail(responseEmail)
      setBetaAccessCode(betaAccessCode.trim())
    } catch (error) {
      setBetaAccount(null)
      setBetaError(toDisplayError(error))
    } finally {
      setIsVerifyingBetaAccess(false)
    }
  }

  const betaPanel = (
    <BetaAccessPanel
      enabled={betaAccessEnabled}
      email={betaEmail}
      accessCode={betaAccessCode}
      account={betaAccount}
      error={betaError}
      isRequesting={isRequestingBetaAccess}
      isVerifying={isVerifyingBetaAccess}
      onEmailChange={(value) => {
        setBetaEmail(value)
        setBetaAccount(null)
        setBetaError(null)
        window.localStorage.setItem(BETA_EMAIL_STORAGE_KEY, value)
      }}
      onAccessCodeChange={(value) => {
        setBetaAccessCode(value)
        setBetaAccount(null)
        setBetaError(null)
        window.localStorage.setItem(BETA_ACCESS_CODE_STORAGE_KEY, value)
      }}
      onRequestAccess={() => void requestBetaAccessForEmail()}
      onVerify={() => void verifyBetaCredentials()}
    />
  )

  return (
    <div className="product-shell">
      <aside className="sidebar" aria-label={t.sidebarLabel}>
        <div className="brand-lockup">
          <span className="brand-mark" aria-hidden="true">
            <AudioWaveform size={20} />
          </span>
          <span>NoiseCut</span>
        </div>

        <nav className="sidebar-nav" aria-label={t.appMenu}>
          <NavButton icon={LayoutDashboard} label={t.dashboard} active={currentView === "dashboard"} onClick={() => setCurrentView("dashboard")} />
          <NavButton icon={Sparkles} label={t.newReport} active={currentView === "new-report"} onClick={() => setCurrentView("new-report")} />
          <NavButton icon={History} label={t.history} active={currentView === "history"} onClick={() => setCurrentView("history")} />
          <NavButton icon={Settings} label={t.settings} active={currentView === "settings"} onClick={() => setCurrentView("settings")} />
        </nav>

        <div className="sidebar-card">
          <p className="status-label">{t.marketplace}</p>
          <p className="sidebar-card-title">Allegro · PL</p>
          <p className="status-detail">{t.marketplaceNote}</p>
        </div>
      </aside>

      <div className="product-main">
        <header className="topbar">
          <div>
            <p className="eyebrow">Allegro · PL</p>
            <p className="topbar-title">{t.viewTitles[currentView]}</p>
          </div>
          <div className="topbar-actions">
            <span className={`status-pill status-${apiStatus.state}`}>{formatApiStatus(apiStatus)}</span>
            <span className="status-pill">{formatBetaTopline(betaAccessEnabled, betaAccount)}</span>
            <label className="compact-select-label">
              {t.uiLanguage}
              <select value={uiLanguage} onChange={(event) => setUiLanguage(normalizeLanguage(event.target.value, "en"))}>
                <option value="en">English</option>
                <option value="pl">Polski</option>
              </select>
            </label>
            <button className="primary-button" type="button" onClick={() => setCurrentView("new-report")}>
              <Sparkles size={16} />
              {t.newReport}
            </button>
          </div>
        </header>

        <main className="view-surface">
          {currentView === "dashboard" ? (
            <DashboardView
              apiStatus={apiStatus}
              betaAccessEnabled={betaAccessEnabled}
              betaAccount={betaAccount}
              reportHistory={reportHistory}
              latestJob={reportJob}
              isLoadingHistory={isLoadingHistory}
              onNewReport={() => setCurrentView("new-report")}
              onHistory={() => setCurrentView("history")}
              onRefreshApi={() => void refreshApiStatus()}
            />
          ) : null}

          {currentView === "new-report" ? (
            <NewReportView
              betaPanel={betaPanel}
              keyword={keyword}
              listingUrls={listingUrls}
              competitors={competitors}
              targetMarketNotes={targetMarketNotes}
              pastedEvidence={pastedEvidence}
              researchIntent={researchIntent}
              reportLanguage={reportLanguage}
              evidenceMetrics={evidenceMetrics}
              reportError={reportError}
              isSubmitting={isSubmitting}
              apiReady={apiStatus.state === "ready"}
              betaCanGenerate={betaCanGenerate}
              onSubmit={submitReport}
              onKeywordChange={setKeyword}
              onListingUrlsChange={setListingUrls}
              onCompetitorsChange={setCompetitors}
              onTargetMarketNotesChange={setTargetMarketNotes}
              onPastedEvidenceChange={setPastedEvidence}
              onResearchIntentChange={setResearchIntent}
              onReportLanguageChange={setReportLanguage}
              onUseSample={useSample}
              onCopySample={(sample) => void copySample(sample)}
            />
          ) : null}

          {currentView === "history" ? (
            <HistoryView
              items={reportHistory}
              error={historyError}
              isLoading={isLoadingHistory}
              onRefresh={() => void refreshHistory()}
              onOpen={(jobId) => void loadHistoryItem(jobId)}
            />
          ) : null}

          {currentView === "settings" ? (
            <SettingsView
              apiStatus={apiStatus}
              betaAccessEnabled={betaAccessEnabled}
              betaAccount={betaAccount}
              onRefreshApi={() => void refreshApiStatus()}
              betaPanel={betaPanel}
            />
          ) : null}

          {currentView === "report-detail" ? (
            reportJob ? (
              <ReportResult
                job={reportJob}
                onRetry={(jobId) => void retryCurrentReport(jobId)}
                retryError={retryError}
                isRetrying={isSubmitting && isFailedJob(reportJob)}
                canRetry={betaCanRetry}
                onBackToForm={() => setCurrentView("new-report")}
              />
            ) : (
              <EmptyDetail onNewReport={() => setCurrentView("new-report")} />
            )
          ) : null}
        </main>
      </div>
    </div>
  )
}

function NavButton({
  icon: Icon,
  label,
  active,
  onClick
}: {
  icon: ComponentType<{ size?: number }>
  label: string
  active: boolean
  onClick: () => void
}) {
  const t = text()
  return (
    <button className={`nav-button ${active ? "nav-button-active" : ""}`} type="button" onClick={onClick}>
      <Icon size={16} />
      <span>{label}</span>
    </button>
  )
}

function DashboardView({
  apiStatus,
  betaAccessEnabled,
  betaAccount,
  reportHistory,
  latestJob,
  isLoadingHistory,
  onNewReport,
  onHistory,
  onRefreshApi
}: {
  apiStatus: ApiConnectionStatus
  betaAccessEnabled: boolean
  betaAccount: BetaAccessResponse | null
  reportHistory: ReportListItemResponse[]
  latestJob: AnalysisJobResponse | null
  isLoadingHistory: boolean
  onNewReport: () => void
  onHistory: () => void
  onRefreshApi: () => void
}) {
  const completedCount = reportHistory.filter((item) => item.status.toLowerCase() === "completed").length
  const latestHistoryItem = reportHistory[0]
  const t = text()

  return (
    <section className="dashboard-view" aria-labelledby="dashboard-title">
      <div className="page-heading">
        <div>
          <p className="eyebrow">NoiseCut v0.1</p>
          <h1 id="dashboard-title">{t.dashboardTitle}</h1>
          <p className="summary">{t.dashboardSummary}</p>
        </div>
        <button className="primary-button" type="button" onClick={onNewReport}>
          <Sparkles size={16} />
          {t.createReport}
        </button>
      </div>

      <section className="metric-grid" aria-label="Podsumowanie workspace">
        <MetricCard icon={FileText} label={t.reportsInHistory} value={String(reportHistory.length)} detail={isLoadingHistory ? t.loading : t.completed(completedCount)} />
        <MetricCard icon={Wallet} label={t.beta} value={formatBetaMetric(betaAccessEnabled, betaAccount)} detail={formatBetaTopline(betaAccessEnabled, betaAccount)} />
        <MetricCard icon={Store} label="Marketplace" value="Allegro · PL" detail="URL-e sa tylko referencjami" />
        <MetricCard icon={CheckCircle2} label={t.api} value={apiStatus.state === "ready" ? t.ready : t.needsAttention} detail={formatApiStatus(apiStatus)} />
      </section>

      <section className="dashboard-grid">
        <div className="panel-card panel-card-large">
          <div className="panel-header">
            <div>
              <p className="status-label">{t.latestReport}</p>
              <h2>{latestJob?.report?.metadata.keyword ?? latestHistoryItem?.keyword ?? t.noReportYet}</h2>
            </div>
            <span className={`status-pill status-${latestJob ? latestJob.status.toLowerCase() : "neutral"}`}>
              {latestJob?.status ?? latestHistoryItem?.status ?? "Idle"}
            </span>
          </div>
          <p className="status-detail">
            {latestJob?.report?.summary ?? latestHistoryItem?.summary ?? t.noReportYet}
          </p>
          <div className="inline-actions">
            <button className="primary-button" type="button" onClick={onNewReport}>
              <Search size={16} />
              {t.createReport}
            </button>
            <button className="secondary-button" type="button" onClick={onHistory}>
              <History size={16} />
              {t.history}
            </button>
          </div>
        </div>

        <div className="panel-card">
          <div className="panel-header">
            <div>
              <p className="status-label">{t.api}</p>
              <h2>{formatApiStatus(apiStatus)}</h2>
            </div>
            <button className="icon-button" type="button" onClick={onRefreshApi} aria-label={t.refreshApi}>
              <RefreshCw size={16} />
            </button>
          </div>
          <p className="status-detail">{API_CONFIG.baseUrl}</p>
        </div>
      </section>
    </section>
  )
}

function MetricCard({
  icon: Icon,
  label,
  value,
  detail
}: {
  icon: ComponentType<{ size?: number }>
  label: string
  value: string
  detail: string
}) {
  return (
    <div className="metric-card">
      <span className="metric-icon" aria-hidden="true">
        <Icon size={18} />
      </span>
      <p className="status-label">{label}</p>
      <p className="metric-value">{value}</p>
      <p className="status-detail">{detail}</p>
    </div>
  )
}

function NewReportView({
  betaPanel,
  keyword,
  listingUrls,
  competitors,
  targetMarketNotes,
  pastedEvidence,
  researchIntent,
  reportLanguage,
  evidenceMetrics,
  reportError,
  isSubmitting,
  apiReady,
  betaCanGenerate,
  onSubmit,
  onKeywordChange,
  onListingUrlsChange,
  onCompetitorsChange,
  onTargetMarketNotesChange,
  onPastedEvidenceChange,
  onResearchIntentChange,
  onReportLanguageChange,
  onUseSample,
  onCopySample
}: {
  betaPanel: ReactNode
  keyword: string
  listingUrls: string
  competitors: string
  targetMarketNotes: string
  pastedEvidence: string
  researchIntent: string
  reportLanguage: Language
  evidenceMetrics: EvidenceMetrics
  reportError: string | null
  isSubmitting: boolean
  apiReady: boolean
  betaCanGenerate: boolean
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onKeywordChange: (value: string) => void
  onListingUrlsChange: (value: string) => void
  onCompetitorsChange: (value: string) => void
  onTargetMarketNotesChange: (value: string) => void
  onPastedEvidenceChange: (value: string) => void
  onResearchIntentChange: (value: string) => void
  onReportLanguageChange: (value: Language) => void
  onUseSample: (sample: (typeof evidenceSamples)[number]) => void
  onCopySample: (sample: (typeof evidenceSamples)[number]) => void
}) {
  const t = text()
  return (
    <section className="new-report-view" aria-labelledby="page-title">
      <div className="page-heading">
        <div>
          <p className="eyebrow">{t.newReportEyebrow}</p>
          <h1 id="page-title">Product Risk & Opportunity Report</h1>
          <p className="summary">{t.dashboardSummary}</p>
        </div>
      </div>

      <section className="pricing-strip" aria-label="Beta pricing">
        <div>
          <p className="status-label">{t.betaValidation}</p>
          <p className="pricing-copy">{t.pricingCopy}</p>
        </div>
        <a className="text-link" href="mailto:hello@noisecut.local?subject=NoiseCut beta">{t.requestAccessCta}</a>
      </section>

      {betaPanel}

      <form className="report-form" aria-label={t.newReport} onSubmit={onSubmit}>
        <div className="form-grid">
          <label>
            {t.productOrCategory}
            <input
              placeholder={t.productPlaceholder}
              value={keyword}
              onChange={(event) => onKeywordChange(event.target.value)}
              required
            />
          </label>

          <label>
            {t.researchIntent}
            <select value={researchIntent} onChange={(event) => onResearchIntentChange(event.target.value)}>
              <option value="sourcing">{t.intentSourcing}</option>
              <option value="launch">{t.intentLaunch}</option>
              <option value="listing_optimization">{t.intentListing}</option>
              <option value="competitor_review">{t.intentCompetitor}</option>
            </select>
          </label>

          <label>
            {t.reportLanguage}
            <select value={reportLanguage} onChange={(event) => onReportLanguageChange(normalizeLanguage(event.target.value, "pl"))}>
              <option value="pl">{languageName("pl", activeUiLanguage)}</option>
              <option value="en">{languageName("en", activeUiLanguage)}</option>
            </select>
          </label>
        </div>

        <label>
          {t.allegroLinks}
          <textarea
            className="listing-urls-textarea"
            placeholder={t.allegroLinksPlaceholder}
            rows={4}
            value={listingUrls}
            onChange={(event) => onListingUrlsChange(event.target.value)}
          />
        </label>

        <div className="form-grid">
          <label>
            {t.competitors}
            <textarea
              className="competitors-textarea"
              placeholder={t.competitorsPlaceholder}
              rows={3}
              value={competitors}
              onChange={(event) => onCompetitorsChange(event.target.value)}
            />
          </label>

          <label>
            {t.targetNotes}
            <textarea
              className="target-notes-textarea"
              placeholder={t.targetNotesPlaceholder}
              rows={3}
              value={targetMarketNotes}
              onChange={(event) => onTargetMarketNotesChange(event.target.value)}
            />
          </label>
        </div>

        <label>
          {t.pastedEvidence}
          <textarea
            className="pasted-evidence-textarea"
            placeholder={t.pastedEvidencePlaceholder}
            rows={9}
            value={pastedEvidence}
            onChange={(event) => onPastedEvidenceChange(event.target.value)}
          />
        </label>

        <EvidenceHelper
          metrics={evidenceMetrics}
          samples={evidenceSamples}
          onUseSample={onUseSample}
          onCopySample={onCopySample}
        />

        {reportError ? (
          <p className="form-message form-message-error" role="alert">
            {reportError}
          </p>
        ) : null}

        <button className="primary-button" type="submit" disabled={!apiReady || isSubmitting || !betaCanGenerate}>
          <Sparkles size={16} />
          {isSubmitting ? t.generating : t.generateReport}
        </button>
      </form>
    </section>
  )
}

function HistoryView({
  items,
  error,
  isLoading,
  onRefresh,
  onOpen
}: {
  items: ReportListItemResponse[]
  error: string | null
  isLoading: boolean
  onRefresh: () => void
  onOpen: (jobId: string) => void
}) {
  const t = text()
  return (
    <section className="history-view" aria-labelledby="history-title">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Allegro seller</p>
          <h1 id="history-title">{t.historyTitle}</h1>
          <p className="summary">{t.historySummary}</p>
        </div>
        <button className="secondary-button" type="button" onClick={onRefresh} disabled={isLoading}>
          <RefreshCw size={16} />
          {isLoading ? t.refreshing : t.refresh}
        </button>
      </div>

      {error ? <p className="form-message form-message-error" role="alert">{error}</p> : null}

      {items.length === 0 ? (
        <div className="empty-state">
          <BookOpen size={22} />
          <h2>{isLoading ? t.loadingHistory : t.noHistory}</h2>
          <p className="status-detail">{t.noHistoryDetail}</p>
        </div>
      ) : (
        <ul className="history-list history-list-redesign">
          {items.map((item) => (
            <li key={item.jobId}>
              <button className="history-row" type="button" onClick={() => onOpen(item.jobId)}>
                <span className="history-row-main">
                  <span className="history-row-title">{item.keyword ?? t.defaultReportTitle}</span>
                  <span className="status-detail">{item.summary ?? item.contentHash}</span>
                </span>
                <span className={`status-pill job-status-${item.status.toLowerCase()}`}>{item.status}</span>
                {item.reportLanguage ? <span className="status-pill">{item.reportLanguage.toUpperCase()}</span> : null}
                <span className={`risk-chip risk-${item.riskScore ?? "medium"}`}>{t.riskPrefix}: {formatRiskScore(item.riskScore)}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function SettingsView({
  apiStatus,
  betaAccessEnabled,
  betaAccount,
  onRefreshApi,
  betaPanel
}: {
  apiStatus: ApiConnectionStatus
  betaAccessEnabled: boolean
  betaAccount: BetaAccessResponse | null
  onRefreshApi: () => void
  betaPanel: ReactNode
}) {
  const t = text()
  return (
    <section className="settings-view" aria-labelledby="settings-title">
      <div className="page-heading">
        <div>
          <p className="eyebrow">{t.settingsEyebrow}</p>
          <h1 id="settings-title">{t.settingsHeading}</h1>
          <p className="summary">{t.settingsSummary}</p>
        </div>
      </div>

      <div className="settings-grid">
        <section className="panel-card">
          <div className="panel-header">
            <div>
              <p className="status-label">Marketplace</p>
              <h2>{t.topbarMarketplace}</h2>
            </div>
            <Store size={18} />
          </div>
          <p className="status-detail">{t.marketplaceWorkflowDetail}</p>
        </section>

        <section className="panel-card">
          <div className="panel-header">
            <div>
              <p className="status-label">API</p>
              <h2>{formatApiStatus(apiStatus)}</h2>
            </div>
            <button className="icon-button" type="button" onClick={onRefreshApi} aria-label={t.checkApiAgain}>
              <RefreshCw size={16} />
            </button>
          </div>
          <p className="status-detail">{API_CONFIG.baseUrl}</p>
        </section>

        <section className="panel-card">
          <div className="panel-header">
            <div>
              <p className="status-label">{t.betaGate}</p>
              <h2>{betaAccessEnabled ? t.enabled : t.disabledLocally}</h2>
            </div>
            <Wallet size={18} />
          </div>
          <p className="status-detail">{formatBetaTopline(betaAccessEnabled, betaAccount)}</p>
        </section>
      </div>

      {betaPanel}
    </section>
  )
}

function EmptyDetail({ onNewReport }: { onNewReport: () => void }) {
  const t = text()
  return (
    <section className="empty-state" aria-labelledby="empty-detail-title">
      <FileText size={24} />
      <h1 id="empty-detail-title">{t.noDetail}</h1>
      <p className="status-detail">{t.emptyDetailHelp}</p>
      <button className="primary-button" type="button" onClick={onNewReport}>
        <Sparkles size={16} />
        {t.newReport}
      </button>
    </section>
  )
}

function EvidenceHelper({
  metrics,
  samples,
  onUseSample,
  onCopySample
}: {
  metrics: EvidenceMetrics
  samples: typeof evidenceSamples
  onUseSample: (sample: (typeof evidenceSamples)[number]) => void
  onCopySample: (sample: (typeof evidenceSamples)[number]) => void
}) {
  const t = text()
  return (
    <section className="evidence-helper" aria-labelledby="evidence-helper-title">
      <div className="evidence-helper-header">
        <div>
          <h2 id="evidence-helper-title">{t.evidenceAssistant}</h2>
          <p className="status-detail">{t.evidenceGuidance}</p>
        </div>
        <p className={`quality-badge quality-${metrics.qualityClass}`}>{t.quality}: {metrics.qualityLabel}</p>
      </div>

      <dl className="evidence-metrics" aria-label="Evidence counters">
        <div>
          <dt>{t.chars}</dt>
          <dd>{metrics.characterCount}</dd>
        </div>
        <div>
          <dt>{t.lines}</dt>
          <dd>{metrics.lineCount}</dd>
        </div>
        <div>
          <dt>{t.allegroLinkCount}</dt>
          <dd>{metrics.allegroReferenceCount}</dd>
        </div>
      </dl>

      <div className="evidence-guidance">
        <p>{t.evidenceBest}</p>
        <p>{metrics.guidance}</p>
      </div>

      <div className="evidence-samples" aria-label="Sample evidence">
        {samples.map((sample) => (
          <section key={sample.name} className="sample-card">
            <div>
              <h3>{sample.name}</h3>
              <p>{sample.pastedEvidence}</p>
            </div>
            <div className="sample-actions">
              <button className="secondary-button" type="button" onClick={() => onUseSample(sample)}>
                <Sparkles size={14} />
                {t.useSample}
              </button>
              <button className="secondary-button" type="button" onClick={() => onCopySample(sample)}>
                <Copy size={14} />
                {t.copySample}
              </button>
            </div>
          </section>
        ))}
      </div>
    </section>
  )
}

function BetaAccessPanel({
  enabled,
  email,
  accessCode,
  account,
  error,
  isRequesting,
  isVerifying,
  onEmailChange,
  onAccessCodeChange,
  onRequestAccess,
  onVerify
}: {
  enabled: boolean
  email: string
  accessCode: string
  account: BetaAccessResponse | null
  error: string | null
  isRequesting: boolean
  isVerifying: boolean
  onEmailChange: (value: string) => void
  onAccessCodeChange: (value: string) => void
  onRequestAccess: () => void
  onVerify: () => void
}) {
  const t = text()
  if (!enabled) {
    return (
      <section className="beta-access-panel beta-access-panel-disabled" aria-label="Beta access">
        <div>
          <p className="status-label">{t.beta}</p>
          <p className="status-detail">{t.betaDisabled}</p>
        </div>
      </section>
    )
  }

  const status = formatBetaStatus(account)

  return (
    <section className="beta-access-panel" aria-label="Beta access">
      <div className="beta-access-header">
        <div>
          <p className="status-label">{t.beta}</p>
          <h2>{t.betaAccessTitle}</h2>
          <p className="status-detail">{status}</p>
        </div>
        {account ? <p className={`quality-badge beta-status-${account.status}`}>{account.status}</p> : null}
      </div>

      <div className="beta-access-fields">
        <label>
          {t.email}
          <input
            type="email"
            placeholder="seller@example.com"
            value={email}
            onChange={(event) => onEmailChange(event.target.value)}
          />
        </label>
        <label>
          {t.accessCode}
          <input
            type="password"
            placeholder={t.betaCodePlaceholder}
            value={accessCode}
            onChange={(event) => onAccessCodeChange(event.target.value)}
          />
        </label>
      </div>

      <div className="beta-access-actions">
        <button className="secondary-button" type="button" onClick={onRequestAccess} disabled={isRequesting}>
          {isRequesting ? t.loading : t.requestAccess}
        </button>
        <button className="secondary-button" type="button" onClick={onVerify} disabled={isVerifying || !email || !accessCode}>
          {isVerifying ? t.loading : t.verifyAccess}
        </button>
      </div>

      {account ? (
        <dl className="beta-access-metrics" aria-label="Beta usage">
          <div>
            <dt>Plan</dt>
            <dd>{account.plan}</dd>
          </div>
          <div>
            <dt>{activeUiLanguage === "pl" ? "Raporty" : "Reports"}</dt>
            <dd>
              {account.reportsRemaining}/{account.reportLimit}
            </dd>
          </div>
          <div>
            <dt>{activeUiLanguage === "pl" ? "Uzyte" : "Used"}</dt>
            <dd>{account.reportsUsed}</dd>
          </div>
        </dl>
      ) : null}

      {error ? (
        <p className="form-message form-message-error" role="alert">
          {error}
        </p>
      ) : null}
    </section>
  )
}

function formatBetaStatus(account: BetaAccessResponse | null) {
  const t = text()
  if (!account) {
    return t.betaAccessPrompt
  }

  if (account.status === "active" && account.reportsRemaining > 0) {
    return t.activeAccess(account.reportsRemaining)
  }

  if (account.status === "active") {
    return t.limitUsed
  }

  if (account.status === "pending_payment") {
    return t.betaPendingDetail
  }

  if (account.status === "disabled") {
    return t.betaDisabledDetail
  }

  return t.betaNeedsActivation
}

function getBetaCredentialsKey(email: string, accessCode: string) {
  const normalizedEmail = email.trim().toLowerCase()
  const normalizedAccessCode = accessCode.trim()

  if (!normalizedEmail || !normalizedAccessCode) {
    return null
  }

  return `${normalizedEmail}:${normalizedAccessCode}`
}

function formatApiStatus(status: ApiConnectionStatus) {
  if (status.state === "ready") {
    return `${text().ready} (${status.metadata.contractVersion})`
  }

  return status.message
}

function getViewTitle(view: AppView) {
  return text().viewTitles[view]
}

function formatBetaTopline(enabled: boolean, account: BetaAccessResponse | null) {
  if (!enabled) {
    return activeUiLanguage === "pl" ? "Beta gate wylaczony" : "Beta gate off"
  }

  if (!account) {
    return activeUiLanguage === "pl" ? "Beta niezweryfikowana" : "Beta unverified"
  }

  if (account.status === "active") {
    return text().reportCount(account.reportsRemaining, account.reportLimit)
  }

  return account.status
}

function formatBetaMetric(enabled: boolean, account: BetaAccessResponse | null) {
  if (!enabled) {
    return "Dev"
  }

  if (!account) {
    return activeUiLanguage === "pl" ? "Brak" : "None"
  }

  if (account.status === "active") {
    return `${account.reportsRemaining}`
  }

  return account.status
}

function ReportResult({
  job,
  onRetry,
  retryError,
  isRetrying,
  canRetry,
  onBackToForm
}: {
  job: AnalysisJobResponse
  onRetry: (jobId: string) => void
  retryError: string | null
  isRetrying: boolean
  canRetry: boolean
  onBackToForm: () => void
}) {
  const t = text()
  const report = job.report
  const result = job.result
  const [copyState, setCopyState] = useState<"idle" | "success" | "error">("idle")
  const [isCopying, setIsCopying] = useState(false)
  const [diagnosticsCopyState, setDiagnosticsCopyState] = useState<"idle" | "success" | "error">("idle")
  const [isCopyingDiagnostics, setIsCopyingDiagnostics] = useState(false)
  const [feedbackState, setFeedbackState] = useState<"idle" | "success" | "error">("idle")
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false)

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

  async function copyDiagnostics() {
    setDiagnosticsCopyState("idle")
    setIsCopyingDiagnostics(true)

    try {
      await copyTextToClipboard(formatSupportDiagnostics(job))
      setDiagnosticsCopyState("success")
    } catch {
      setDiagnosticsCopyState("error")
    } finally {
      setIsCopyingDiagnostics(false)
    }
  }

  async function sendFeedback(feedbackKind: FeedbackKind) {
    const sourceUrl = report?.metadata.listingUrls?.[0] ?? result?.source.url ?? `noisecut://report/${job.jobId}`

    setFeedbackState("idle")
    setIsSubmittingFeedback(true)

    try {
      await submitFeedback({
        jobId: job.jobId,
        contentHash: job.contentHash,
        sourceType: report?.metadata.sourceType ?? result?.source.sourceType ?? "allegro",
        sourceUrl,
        externalId: result?.source.externalId ?? undefined,
        feedbackKind,
        mode: "insight",
        metadata: {
          lens: report?.metadata.lens ?? "allegro-seller",
          keyword: report?.metadata.keyword ?? "",
          uiSurface: "noise-cut-ui",
          reportFormat: report ? "allegro-report" : "verdict-fallback"
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
          <p className="eyebrow">Product Risk & Opportunity Report</p>
          <h2 id="result-title">{report?.metadata.keyword ?? result?.source.title ?? "Biezacy wynik"}</h2>
        </div>
        <div className="result-actions">
          <button className="secondary-button" type="button" onClick={onBackToForm}>
            <Sparkles size={16} />
            {t.newReport}
          </button>
          {report ? (
            <button className="secondary-button" type="button" onClick={copyMarkdown} disabled={isCopying}>
              <Copy size={16} />
              {isCopying ? t.copying : t.copyMarkdown}
            </button>
          ) : null}
          <p className={`status-pill job-status-${job.status.toLowerCase()}`}>{job.status}</p>
        </div>
      </div>

      <SupportDiagnostics
        job={job}
        copyState={diagnosticsCopyState}
        isCopying={isCopyingDiagnostics}
        onCopy={() => void copyDiagnostics()}
      />

      {job.error ? (
        <section className="failed-report-panel" aria-labelledby="failed-report-title">
          <div>
            <h3 id="failed-report-title">{t.failedReportTitle}</h3>
            <p className="form-message form-message-error" role="alert">
              {toApiMessage(job.error)}
            </p>
            <p className="status-detail">{t.failedReportHelp}</p>
          </div>
          {isFailedJob(job) ? (
            <button className="secondary-button" type="button" onClick={() => onRetry(job.jobId)} disabled={isRetrying || !canRetry}>
              {isRetrying ? t.retrying : t.retry}
            </button>
          ) : null}
        </section>
      ) : null}

      {retryError ? (
        <p className="form-message form-message-error" role="alert">
          {retryError}
        </p>
      ) : null}

      {copyState === "success" ? <p className="form-message form-message-success">{t.markdownCopied}</p> : null}
      {copyState === "error" ? (
        <p className="form-message form-message-error" role="alert">
          {t.markdownCopyFailed}
        </p>
      ) : null}

      {isTerminalJob(job) && !job.error ? (
        <section className="feedback-panel" aria-labelledby="feedback-title">
          <div className="feedback-header">
            <div>
              <h3 id="feedback-title">{t.feedbackTitle}</h3>
              <p className="status-detail">{t.feedbackQuestion}</p>
            </div>
            <div className="feedback-actions">
              <button
                className="secondary-button"
                type="button"
                onClick={() => void sendFeedback("useful")}
                disabled={isSubmittingFeedback || feedbackState === "success"}
              >
                {t.useful}
              </button>
              <button
                className="secondary-button"
                type="button"
                onClick={() => void sendFeedback("not_useful")}
                disabled={isSubmittingFeedback || feedbackState === "success"}
              >
                {t.weak}
              </button>
            </div>
          </div>

          {feedbackState === "success" ? <p className="form-message form-message-success">{t.feedbackSaved}</p> : null}
          {feedbackState === "error" ? (
            <p className="form-message form-message-error" role="alert">
              {t.feedbackFailed}
            </p>
          ) : null}
        </section>
      ) : null}

      {report ? (
        <StructuredReport report={report} />
      ) : result ? (
        <FallbackResult result={result} />
      ) : (
        <p className="status-detail">{t.acceptedWaiting}</p>
      )}
    </section>
  )
}

function SupportDiagnostics({
  job,
  copyState,
  isCopying,
  onCopy
}: {
  job: AnalysisJobResponse
  copyState: "idle" | "success" | "error"
  isCopying: boolean
  onCopy: () => void
}) {
  const t = text()
  const diagnostics = job.diagnostics
  const rows = [
    ["Job ID", job.jobId],
    ["Content hash", job.contentHash],
    ["Status", job.status],
    ["Correlation ID", diagnostics?.correlationId],
    ["Retry", diagnostics ? `${diagnostics.retryCount}/${diagnostics.maxRetryCount}` : null],
    ["Model", diagnostics?.model],
    ["Provider", diagnostics?.aiProvider],
    ["Duration", diagnostics?.processingDurationMs == null ? null : `${diagnostics.processingDurationMs} ms`],
    ["Tokens", formatTokenUsage(diagnostics?.inputTokens, diagnostics?.outputTokens)],
    ["Cost", diagnostics?.estimatedCostUsd == null ? null : `$${diagnostics.estimatedCostUsd.toFixed(6)}`],
    ["Created", diagnostics?.createdAt ? formatTimestamp(diagnostics.createdAt) : null],
    ["Last retry", diagnostics?.lastRetryAt ? formatTimestamp(diagnostics.lastRetryAt) : null]
  ].filter(([, value]) => Boolean(value))

  return (
    <section className="support-diagnostics" aria-labelledby="support-diagnostics-title">
      <div className="panel-header">
        <div>
          <p className="status-label">{t.supportDiagnostics}</p>
          <h3 id="support-diagnostics-title">{t.supportData}</h3>
          <p className="status-detail">{t.supportDescription}</p>
        </div>
        <button className="secondary-button" type="button" onClick={onCopy} disabled={isCopying}>
          <Copy size={16} />
          {isCopying ? t.copying : t.copyDiagnostics}
        </button>
      </div>

      <dl className="job-meta">
        {rows.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>

      {copyState === "success" ? <p className="form-message form-message-success">{t.diagnosticsCopied}</p> : null}
      {copyState === "error" ? (
        <p className="form-message form-message-error" role="alert">
          {t.diagnosticsCopyFailed}
        </p>
      ) : null}
    </section>
  )
}

function StructuredReport({ report }: { report: ProductSignalReportResponse }) {
  const language = getReportLanguage(report)
  const labels = getReportLabels(language)
  const sections = [
    { title: labels.sections.limitations, items: report.limitations },
    { title: labels.sections.complaints, items: report.complaints },
    { title: labels.sections.praised, items: report.praisedFeatures ?? report.demandSignals },
    { title: labels.sections.risks, items: report.productRiskAreas ?? report.limitations },
    { title: labels.sections.objections, items: report.objections },
    { title: labels.sections.listing, items: report.listingRecommendations ?? report.contentIdeas },
    { title: labels.sections.product, items: report.productRecommendations ?? report.productOpportunities },
    { title: labels.sections.competitors, items: report.competitorMentions },
    { title: labels.sections.angles, items: report.listingCopyAngles ?? [] }
  ].filter((section) => section.items.length > 0)

  return (
    <div className="result-body">
      <p className={`verdict risk-${report.riskScore ?? "medium"}`}>{labels.riskScore}: {formatRiskScore(report.riskScore)}</p>
      <p>{report.summary}</p>

      <dl className="report-meta">
        <div>
          <dt>{labels.product}</dt>
          <dd>{report.metadata.keyword ?? labels.missing}</dd>
        </div>
        <div>
          <dt>{labels.goal}</dt>
          <dd>{formatResearchIntent(report.metadata.researchIntent, language)}</dd>
        </div>
        <div>
          <dt>{labels.generated}</dt>
          <dd>{formatTimestamp(report.metadata.generatedAt, language)}</dd>
        </div>
      </dl>

      <SourceTransparency report={report} />

      <div className="report-sections-grid">
        {sections.map((section) => (
          <section key={section.title} className="report-section-card">
            <h3>{section.title}</h3>
            <ReportItemList items={section.items} language={language} />
          </section>
        ))}
      </div>
    </div>
  )
}

function SourceTransparency({ report }: { report: ProductSignalReportResponse }) {
  const labels = getReportLabels(getReportLanguage(report))
  const evidenceCount = getAnalyzedEvidenceCount(report)
  const confidence = getReportConfidence(report)
  const referenceCount = getReferenceCount(report)
  const hasAllegroReferences = (report.metadata.listingUrls?.filter(Boolean).length ?? 0) > 0

  return (
    <section className="source-transparency" aria-labelledby="source-transparency-title">
      <div>
        <p className="status-label">{labels.sourceTransparency}</p>
        <h3 id="source-transparency-title">{labels.analyzed}</h3>
        <p className="status-detail">{labels.transparencyBody}</p>
      </div>
      <dl className="transparency-metrics" aria-label="Source transparency metrics">
        <div>
          <dt>{labels.evidence}</dt>
          <dd>{evidenceCount}</dd>
        </div>
        <div>
          <dt>{labels.confidence}</dt>
          <dd>{confidence}</dd>
        </div>
        <div>
          <dt>{labels.references}</dt>
          <dd>{referenceCount}</dd>
        </div>
      </dl>
      {hasAllegroReferences ? (
        <p className="source-transparency-note">{labels.transparencyUrlNote}</p>
      ) : null}
    </section>
  )
}

function ReportItemList({ items, language }: { items: ProductSignalReportItem[]; language: Language }) {
  const labels = getReportLabels(language)
  return (
    <ul className="report-item-list">
      {items.map((item, index) => (
        <li key={`${item.title ?? item.text}-${index}`} className="report-item">
          {item.title ? <p className="report-item-title">{item.title}</p> : null}
          <p className="report-item-text">{item.text}</p>
          <p className="report-item-explanation">{item.explanation}</p>
          {item.evidenceSnippets?.length ? (
            <div className="report-item-evidence">
              <p>{labels.evidenceSnippets}</p>
              <ul>
                {item.evidenceSnippets.map((snippet, snippetIndex) => (
                  <li key={`${snippet}-${snippetIndex}`}>{snippet}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {item.evidenceCount || item.confidence || item.sourceReferences?.length ? (
            <div className="report-item-meta" aria-label="Item confidence and sources">
              {formatItemMeta(item, language).map((part) => (
                <span className={part.kind === "source" ? "source-reference-chip" : undefined} key={`${part.kind}-${part.fullValue ?? part.label}`} title={part.fullValue}>
                  {part.label}
                </span>
              ))}
            </div>
          ) : null}
        </li>
      ))}
    </ul>
  )
}

function FallbackResult({ result }: { result: NonNullable<AnalysisJobResponse["result"]> }) {
  return (
    <div className="result-body">
      <p className="verdict">{result.verdict}</p>
      <p>{result.summary}</p>
      <section>
        <h3>Rekomendacja</h3>
        <p>{result.consensus.recommendation}</p>
      </section>
    </div>
  )
}

function parseLines(value: string) {
  return value
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean)
}

type EvidenceMetrics = {
  characterCount: number
  lineCount: number
  allegroReferenceCount: number
  qualityLabel: "Too short" | "Basic" | "Good" | "Strong"
  qualityClass: "too-short" | "basic" | "good" | "strong"
  guidance: string
}

function getEvidenceMetrics(evidence: string, listingUrls: string): EvidenceMetrics {
  const language = activeUiLanguage
  const normalizedEvidence = evidence.trim()
  const characterCount = normalizedEvidence.length
  const lineCount = parseLines(evidence).length
  const allegroReferenceCount = parseLines(listingUrls).filter(isAllegroUrl).length

  if (characterCount < 15 || lineCount === 0) {
    return {
      characterCount,
      lineCount,
      allegroReferenceCount,
      qualityLabel: "Too short",
      qualityClass: "too-short",
      guidance: language === "pl" ? "Dodaj przynajmniej jeden konkretny fragment tekstu. Sam link Allegro nie wystarczy." : "Add at least one concrete text fragment. An Allegro link alone is not enough."
    }
  }

  if (characterCount >= 500 || lineCount >= 6) {
    return {
      characterCount,
      lineCount,
      allegroReferenceCount,
      qualityLabel: "Strong",
      qualityClass: "strong",
      guidance: language === "pl" ? "Mocny zestaw evidence. Raport powinien miec lepsze podstawy do oceny ryzyka i szans." : "Strong evidence set. The report should have a better basis for risk and opportunity assessment."
    }
  }

  if (characterCount >= 150 || lineCount >= 3) {
    return {
      characterCount,
      lineCount,
      allegroReferenceCount,
      qualityLabel: "Good",
      qualityClass: "good",
      guidance: language === "pl" ? "Dobry zestaw startowy. Jesli mozesz, dodaj jeszcze kilka opinii albo pytan kupujacych." : "Good starting set. Add a few more reviews or buyer questions if you can."
    }
  }

  return {
    characterCount,
    lineCount,
    allegroReferenceCount,
    qualityLabel: "Basic",
    qualityClass: "basic",
    guidance: language === "pl" ? "To wystarczy technicznie, ale raport bedzie ostrozny. Dodaj wiecej cytatow, aby zwiekszyc pewnosc." : "This is technically enough, but the report will be cautious. Add more quotes to improve confidence."
  }
}

function isAllegroUrl(value: string) {
  try {
    const url = new URL(value)
    return url.hostname === "allegro.pl" || url.hostname.endsWith(".allegro.pl")
  } catch {
    return false
  }
}

async function pollReport(jobId: string) {
  let latestJob = await getReport(jobId)

  for (let attempt = 0; attempt < 20 && !isTerminalJob(latestJob); attempt += 1) {
    await wait(1500)
    latestJob = await getReport(jobId)
  }

  return latestJob
}

function isTerminalJob(job: AnalysisJobResponse) {
  const status = job.status.toLowerCase()
  return Boolean(job.result || job.error || status === "completed" || status === "failed" || status === "cancelled")
}

function isFailedJob(job: AnalysisJobResponse) {
  return job.status.toLowerCase() === "failed"
}

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}

type ReportItemMetaPart = {
  kind: "evidence" | "confidence" | "source"
  label: string
  fullValue?: string
}

function formatItemMeta(item: ProductSignalReportItem, language: Language): ReportItemMetaPart[] {
  const labels = getReportLabels(language)
  const parts: ReportItemMetaPart[] = []

  if (item.evidenceCount) {
    parts.push({
      kind: "evidence",
      label: labels.signal(item.evidenceCount)
    })
  }

  if (item.confidence) {
    parts.push({
      kind: "confidence",
      label: labels.confidenceLabel(item.confidence)
    })
  }

  item.sourceReferences?.filter(Boolean).forEach((reference) => {
    parts.push({
      kind: "source",
      label: formatSourceReferenceLabel(reference),
      fullValue: reference
    })
  })

  return parts
}

function formatSourceReferenceLabel(reference: string) {
  try {
    const url = new URL(reference)
    const path = `${url.pathname}${url.hash}` || "/"
    const compactPath = path.length > 34 ? `${path.slice(0, 31)}...` : path
    return `${url.hostname}${compactPath}`
  } catch {
    return reference.length > 48 ? `${reference.slice(0, 45)}...` : reference
  }
}

function formatSupportDiagnostics(job: AnalysisJobResponse) {
  const diagnostics = job.diagnostics
  const lines = [
    "NoiseCut support diagnostics",
    `Job ID: ${job.jobId}`,
    `Content hash: ${job.contentHash}`,
    `Status: ${job.status}`,
    diagnostics?.correlationId ? `Correlation ID: ${diagnostics.correlationId}` : null,
    diagnostics ? `Retry: ${diagnostics.retryCount}/${diagnostics.maxRetryCount}` : null,
    diagnostics?.model ? `Model: ${diagnostics.model}` : null,
    diagnostics?.aiProvider ? `Provider: ${diagnostics.aiProvider}` : null,
    diagnostics?.processingDurationMs == null ? null : `Duration: ${diagnostics.processingDurationMs} ms`,
    formatTokenUsage(diagnostics?.inputTokens, diagnostics?.outputTokens)
      ? `Tokens: ${formatTokenUsage(diagnostics?.inputTokens, diagnostics?.outputTokens)}`
      : null,
    diagnostics?.estimatedCostUsd == null ? null : `Estimated cost USD: ${diagnostics.estimatedCostUsd.toFixed(6)}`,
    diagnostics?.createdAt ? `Created: ${diagnostics.createdAt}` : null,
    diagnostics?.startedAt ? `Started: ${diagnostics.startedAt}` : null,
    diagnostics?.completedAt ? `Completed: ${diagnostics.completedAt}` : null,
    diagnostics?.failedAt ? `Failed: ${diagnostics.failedAt}` : null,
    diagnostics?.lastRetryAt ? `Last retry: ${diagnostics.lastRetryAt}` : null,
    job.error ? `Error code: ${job.error.code}` : null,
    job.error ? `Error message: ${toApiMessage(job.error)}` : null
  ].filter(Boolean)

  return lines.join("\n")
}

function formatTokenUsage(inputTokens?: number | null, outputTokens?: number | null) {
  if (inputTokens == null && outputTokens == null) {
    return null
  }

  return `${inputTokens ?? 0} in / ${outputTokens ?? 0} out`
}

function toApiMessage(error: { code?: string | null; message?: string | null }) {
  const mapped = error.code ? getKnownApiErrorMessage(error.code) : null
  return mapped || error.message || text().unknownFailure
}

function getKnownApiErrorMessage(code: string) {
  const plMessages: Record<string, string> = {
    BETA_ACCESS_INVALID: "Nieprawidlowy email albo kod dostepu beta.",
    BETA_ACCESS_INACTIVE: "Konto beta nie jest aktywne.",
    BETA_USAGE_LIMIT_REACHED: "Limit raportow beta zostal wykorzystany.",
    BETA_ACCESS_MISMATCH: "To konto beta nie moze ponowic tego raportu.",
    BETA_ADMIN_UNAUTHORIZED: "Nieprawidlowy token administratora beta.",
    VALIDATION_ERROR: "Nieprawidlowe dane requestu.",
    AI_PROVIDER_ERROR: "AI nie wygenerowalo raportu. Sprobuj ponownie pozniej.",
    AI_RESPONSE_INVALID: "AI zwrocilo nieprawidlowy format raportu.",
    ANALYSIS_JOB_FAILED: "Nie udalo sie wygenerowac raportu. Sprobuj ponownie.",
    REQUEST_TOO_LARGE: "Request jest za duzy.",
    NOT_FOUND: "Raport nie zostal znaleziony."
  }

  const enMessages: Record<string, string> = {
    BETA_ACCESS_INVALID: "Invalid beta email or access code.",
    BETA_ACCESS_INACTIVE: "The beta account is not active.",
    BETA_USAGE_LIMIT_REACHED: "The beta report limit has been reached.",
    BETA_ACCESS_MISMATCH: "This beta account cannot retry that report.",
    BETA_ADMIN_UNAUTHORIZED: "Invalid beta admin token.",
    VALIDATION_ERROR: "The request data is invalid.",
    AI_PROVIDER_ERROR: "AI did not generate the report. Please try again later.",
    AI_RESPONSE_INVALID: "AI returned an invalid report format.",
    ANALYSIS_JOB_FAILED: "The report could not be generated. Please try again.",
    REQUEST_TOO_LARGE: "The request is too large.",
    NOT_FOUND: "Report was not found."
  }

  return (activeUiLanguage === "pl" ? plMessages : enMessages)[code.toUpperCase()]
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

function getReportLanguage(report: ProductSignalReportResponse): Language {
  return normalizeLanguage(report.metadata.reportLanguage, "pl")
}

function getReportLabels(language: Language) {
  const english = {
    missing: "none",
    sourceTransparency: "Source transparency",
    analyzed: "What was analyzed",
    transparencyBody: "The report analyzes pasted evidence and notes. Allegro links are context references, not automatically fetched page content.",
    transparencyUrlNote: "Allegro URLs: saved as references, without scraping or claims of page analysis.",
    evidence: "Evidence",
    confidence: "Confidence",
    references: "References",
    riskScore: "Risk score",
    product: "Product",
    goal: "Goal",
    generated: "Generated",
    evidenceSnippets: "Evidence snippets",
    signal: (count: number) => `${count} signal${count === 1 ? "" : "s"}`,
    confidenceLabel: (value: string) => `confidence: ${value}`,
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
    }
  }

  if (language === "en") {
    return english
  }

  return {
    missing: "brak",
    sourceTransparency: "Transparentnosc zrodel",
    analyzed: "Co zostalo przeanalizowane",
    transparencyBody: "Raport analizuje wklejone evidence i notatki. Linki Allegro sa referencjami kontekstu, nie automatycznie pobrana trescia strony.",
    transparencyUrlNote: "URL-e Allegro: zapisane jako referencje, bez scrapingu i bez deklaracji analizy strony.",
    evidence: "Evidence",
    confidence: "Pewnosc",
    references: "Referencje",
    riskScore: "Risk score",
    product: "Produkt",
    goal: "Cel",
    generated: "Wygenerowano",
    evidenceSnippets: "Evidence snippets",
    signal: (count: number) => `${count} sygnal${count === 1 ? "" : "ow"}`,
    confidenceLabel: (value: string) => `pewnosc: ${value}`,
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
    }
  }
}

function formatTimestamp(value: string, language: Language = activeUiLanguage) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleString(language === "pl" ? "pl-PL" : "en-US")
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

function formatResearchIntent(value?: string | null, language: Language = activeUiLanguage) {
  const isPolish = language === "pl"
  if (value === "listing_optimization") {
    return isPolish ? "optymalizacja oferty" : "listing optimization"
  }

  if (value === "competitor_review") {
    return isPolish ? "analiza konkurencji" : "competitor analysis"
  }

  if (value === "launch") {
    return isPolish ? "launch produktu" : "product launch"
  }

  return "sourcing"
}

function toDisplayError(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message
  }

  return text().unknownFailure
}
