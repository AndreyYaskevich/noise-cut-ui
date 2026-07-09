import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { I18nextProvider } from "react-i18next"
import { App } from "./App"
import i18next from "./i18nSetup"
import "./styles.css"

createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <I18nextProvider i18n={i18next}>
      <App />
    </I18nextProvider>
  </StrictMode>
)
