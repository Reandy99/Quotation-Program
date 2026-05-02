export const SETTINGS_UPDATED_EVENT = "quoteflow:settings-updated"

export interface GeneralSettings {
  workspace_name: string
  timezone: string
  language: string
  date_format: string
  currency_label: string
  default_view: string
  email_notifications: boolean
  browser_notifications: boolean
}

export interface CompanySettings {
  business_name: string
  email: string
  phone: string
  website: string
  address: string
  default_terms: string
  default_payment_terms: string
  logo_url?: string
  signer_name?: string
  signer_title?: string
  signature_url?: string
  google_review_url?: string
}

const GENERAL_KEY = "quoteflow_general_settings"
const COMPANY_KEY = "quoteflow_company_settings"

const generalDefaults: GeneralSettings = {
  workspace_name: "QuoteFlow",
  timezone: "Asia/Jakarta",
  language: "en",
  date_format: "DD/MM/YYYY",
  currency_label: "Indonesian Rupiah (IDR)",
  default_view: "/dashboard",
  email_notifications: true,
  browser_notifications: false,
}

const companyDefaults: CompanySettings = {
  business_name: "Creative Studio",
  email: "",
  phone: "",
  website: "",
  address: "",
  default_terms: "",
  default_payment_terms: "",
  logo_url: "",
  signer_name: "",
  signer_title: "",
  signature_url: "",
  google_review_url: "",
}

export function loadGeneralSettings(): GeneralSettings {
  if (typeof window === "undefined") return generalDefaults
  try {
    const stored = localStorage.getItem(GENERAL_KEY)
    if (stored) return { ...generalDefaults, ...JSON.parse(stored) }
  } catch {}
  return generalDefaults
}

export function loadCompanySettings(): CompanySettings {
  if (typeof window === "undefined") return companyDefaults
  try {
    const stored = localStorage.getItem(COMPANY_KEY)
    if (stored) return { ...companyDefaults, ...JSON.parse(stored) }
  } catch {}
  return companyDefaults
}

export function dispatchSettingsUpdated() {
  window.dispatchEvent(new Event(SETTINGS_UPDATED_EVENT))
}
