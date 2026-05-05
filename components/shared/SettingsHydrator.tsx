"use client"

import { useEffect } from "react"
import {
  COMPANY_KEY,
  GENERAL_KEY,
  PACKAGES_KEY,
  dispatchSettingsUpdated,
} from "@/lib/settings/storage"
import type { GeneralSettings, ServicePackage } from "@/types"

interface CompanySettingsCache {
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

interface Props {
  generalSettings: GeneralSettings
  companySettings: CompanySettingsCache
  packages: ServicePackage[]
}

function syncStorage(key: string, value: unknown) {
  const nextValue = JSON.stringify(value)
  if (localStorage.getItem(key) !== nextValue) {
    localStorage.setItem(key, nextValue)
  }
}

export default function SettingsHydrator({ generalSettings, companySettings, packages }: Props) {
  useEffect(() => {
    syncStorage(GENERAL_KEY, generalSettings)
    syncStorage(COMPANY_KEY, companySettings)
    syncStorage(PACKAGES_KEY, packages)
    dispatchSettingsUpdated()
  }, [generalSettings, companySettings, packages])

  return null
}
