"use client"

import { useEffect, useState } from "react"
import {
  loadCompanySettings,
  loadGeneralSettings,
  SETTINGS_UPDATED_EVENT,
  type CompanySettings,
  type GeneralSettings,
} from "./storage"

export function useLiveCompanySettings(): CompanySettings {
  const [settings, setSettings] = useState<CompanySettings>(loadCompanySettings)

  useEffect(() => {
    const refresh = () => setSettings(loadCompanySettings())
    window.addEventListener("storage", refresh)
    window.addEventListener(SETTINGS_UPDATED_EVENT, refresh)
    return () => {
      window.removeEventListener("storage", refresh)
      window.removeEventListener(SETTINGS_UPDATED_EVENT, refresh)
    }
  }, [])

  return settings
}

export function useLiveGeneralSettings(): GeneralSettings {
  const [settings, setSettings] = useState<GeneralSettings>(loadGeneralSettings)

  useEffect(() => {
    const refresh = () => setSettings(loadGeneralSettings())
    window.addEventListener("storage", refresh)
    window.addEventListener(SETTINGS_UPDATED_EVENT, refresh)
    return () => {
      window.removeEventListener("storage", refresh)
      window.removeEventListener(SETTINGS_UPDATED_EVENT, refresh)
    }
  }, [])

  return settings
}
