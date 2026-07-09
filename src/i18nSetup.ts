import i18next from "i18next"
import LanguageDetector from "i18next-browser-languagedetector"
import { initReactI18next } from "react-i18next"

import commonEn from "./locales/en/common.json"
import formsEn from "./locales/en/forms.json"
import errorsEn from "./locales/en/errors.json"
import reportEn from "./locales/en/report.json"
import diagnosticsEn from "./locales/en/diagnostics.json"
import commonPl from "./locales/pl/common.json"
import formsPl from "./locales/pl/forms.json"
import errorsPl from "./locales/pl/errors.json"
import reportPl from "./locales/pl/report.json"
import diagnosticsPl from "./locales/pl/diagnostics.json"

export const UI_LANGUAGE_STORAGE_KEY = "noisecut.uiLanguage"
export const SUPPORTED_LANGUAGES = ["en", "pl"] as const
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number]

void i18next
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        common: commonEn,
        forms: formsEn,
        errors: errorsEn,
        report: reportEn,
        diagnostics: diagnosticsEn
      },
      pl: {
        common: commonPl,
        forms: formsPl,
        errors: errorsPl,
        report: reportPl,
        diagnostics: diagnosticsPl
      }
    },
    supportedLngs: [...SUPPORTED_LANGUAGES],
    fallbackLng: "en",
    defaultNS: "common",
    ns: ["common", "forms", "errors", "report", "diagnostics"],
    detection: {
      order: ["localStorage", "navigator"],
      lookupLocalStorage: UI_LANGUAGE_STORAGE_KEY,
      caches: ["localStorage"]
    },
    interpolation: {
      escapeValue: false
    }
  })

export default i18next
