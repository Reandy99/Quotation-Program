import type { GeneralSettings as GeneralSettingsType, ServicePackage } from "@/types"

export const SETTINGS_UPDATED_EVENT = "quoteflow:settings-updated"

export type GeneralSettings = GeneralSettingsType

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

export const GENERAL_KEY = "quoteflow_general_settings"
export const COMPANY_KEY = "quoteflow_company_settings"
export const PACKAGES_KEY = "quoteflow_packages"

export const generalDefaults: GeneralSettings = {
  workspace_name: "QuoteFlow",
  timezone: "Asia/Jakarta",
  language: "en",
  date_format: "DD/MM/YYYY",
  currency_label: "Indonesian Rupiah (IDR)",
  default_view: "/dashboard",
  email_notifications: true,
  browser_notifications: false,
}

export const companyDefaults: CompanySettings = {
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

export function loadGeneralSettings(fallback: GeneralSettings = generalDefaults): GeneralSettings {
  if (typeof window === "undefined") return fallback
  try {
    const stored = localStorage.getItem(GENERAL_KEY)
    if (stored) return { ...fallback, ...JSON.parse(stored) }
  } catch {}
  return fallback
}

export function loadCompanySettings(fallback: CompanySettings = companyDefaults): CompanySettings {
  if (typeof window === "undefined") return fallback
  try {
    const stored = localStorage.getItem(COMPANY_KEY)
    if (stored) return { ...fallback, ...JSON.parse(stored) }
  } catch {}
  return fallback
}

export function loadPackages(): ServicePackage[] {
  if (typeof window === "undefined") return []
  try {
    const stored = localStorage.getItem(PACKAGES_KEY)
    if (stored) return JSON.parse(stored)
  } catch {}
  return []
}

export function dispatchSettingsUpdated() {
  window.dispatchEvent(new Event(SETTINGS_UPDATED_EVENT))
}
