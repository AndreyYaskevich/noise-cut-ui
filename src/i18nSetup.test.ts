import { describe, expect, it } from "vitest"

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

const NAMESPACES: Array<[string, Record<string, unknown>, Record<string, unknown>]> = [
  ["common", commonEn, commonPl],
  ["forms", formsEn, formsPl],
  ["errors", errorsEn, errorsPl],
  ["report", reportEn, reportPl],
  ["diagnostics", diagnosticsEn, diagnosticsPl]
]

describe("i18n locale bundles", () => {
  it.each(NAMESPACES)("en and pl %s namespaces share the same key set", (_name, en, pl) => {
    expect(Object.keys(pl).sort()).toEqual(Object.keys(en).sort())
  })

  it.each(NAMESPACES)("%s namespace has no empty string values", (_name, en, pl) => {
    for (const [key, value] of Object.entries(en)) {
      if (typeof value === "string") {
        expect(value.length, `en.${key}`).toBeGreaterThan(0)
      }
    }
    for (const [key, value] of Object.entries(pl)) {
      if (typeof value === "string") {
        expect(value.length, `pl.${key}`).toBeGreaterThan(0)
      }
    }
  })
})
