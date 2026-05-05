"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { generalDefaults } from "@/lib/settings/storage"
import type { CompanySettings, GeneralSettings, ServicePackage } from "@/types"

const GENERAL_SETTINGS_COLUMNS = `
  workspace_name,
  timezone,
  language,
  date_format,
  currency_label,
  default_view,
  email_notifications,
  browser_notifications
`

const SETTINGS_MIGRATION_PATH = "supabase/migrations/20260505_add_general_and_package_settings.sql"

function formatMissingSettingsColumnsError(message: string) {
  if (message.includes("schema cache") || message.includes("Could not find the")) {
    return `Database belum punya kolom General Settings terbaru. Jalankan migration ${SETTINGS_MIGRATION_PATH} di Supabase SQL Editor, lalu coba save lagi.`
  }

  return message
}

async function getAuthenticatedUserId() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return { supabase, userId: user?.id ?? null }
}

export async function getCompanySettings(): Promise<CompanySettings | null> {
  const { supabase, userId } = await getAuthenticatedUserId()
  if (!userId) return null

  const { data, error } = await supabase
    .from("company_settings")
    .select("*")
    .eq("user_id", userId)
    .single()

  if (error) {
    const { data: newData } = await supabase
      .from("company_settings")
      .insert({ user_id: userId })
      .select()
      .single()
    return newData
  }

  return data
}

export async function getGeneralSettings(): Promise<GeneralSettings> {
  const { supabase, userId } = await getAuthenticatedUserId()
  if (!userId) return generalDefaults

  const { data, error } = await supabase
    .from("company_settings")
    .select(GENERAL_SETTINGS_COLUMNS)
    .eq("user_id", userId)
    .single()

  if (error || !data) {
    return generalDefaults
  }

  return {
    workspace_name: data.workspace_name ?? generalDefaults.workspace_name,
    timezone: data.timezone ?? generalDefaults.timezone,
    language: data.language ?? generalDefaults.language,
    date_format: data.date_format ?? generalDefaults.date_format,
    currency_label: data.currency_label ?? generalDefaults.currency_label,
    default_view: data.default_view ?? generalDefaults.default_view,
    email_notifications: data.email_notifications ?? generalDefaults.email_notifications,
    browser_notifications: data.browser_notifications ?? generalDefaults.browser_notifications,
  }
}

export async function updateGeneralSettings(settings: GeneralSettings) {
  try {
    const { supabase, userId } = await getAuthenticatedUserId()
    if (!userId) return { error: "Unauthorized" }

    const { error } = await supabase
      .from("company_settings")
      .upsert({
        user_id: userId,
        ...settings,
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" })

    if (error) return { error: formatMissingSettingsColumnsError(error.message) }

    revalidatePath("/settings")
    revalidatePath("/dashboard")
    return { success: true }
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to save general settings" }
  }
}

export async function getPackagesSettings(): Promise<ServicePackage[]> {
  const { supabase, userId } = await getAuthenticatedUserId()
  if (!userId) return []

  const { data } = await supabase
    .from("company_settings")
    .select("service_packages")
    .eq("user_id", userId)
    .single()

  return (data?.service_packages as ServicePackage[] | null) ?? []
}

export async function updatePackagesSettings(packages: ServicePackage[]) {
  try {
    const { supabase, userId } = await getAuthenticatedUserId()
    if (!userId) return { error: "Unauthorized" }

    const { error } = await supabase
      .from("company_settings")
      .upsert({
        user_id: userId,
        service_packages: packages,
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" })

    if (error) return { error: formatMissingSettingsColumnsError(error.message) }

    revalidatePath("/settings")
    return { success: true }
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to save packages" }
  }
}

export async function updateCompanySettings(settings: Partial<CompanySettings>) {
  try {
    const { supabase, userId } = await getAuthenticatedUserId()
    if (!userId) return { error: "Unauthorized" }

    const cleanedSettings = Object.fromEntries(
      Object.entries(settings).map(([key, value]) => [
        key,
        value === "" ? null : value
      ])
    )

    const { error } = await supabase
      .from("company_settings")
      .upsert({
        user_id: userId,
        ...cleanedSettings,
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" })

    if (error) {
      // If schema cache error for missing columns, retry with core fields only
      if (error.message.includes("schema cache") || error.message.includes("column")) {
        const coreFields = {
          user_id: userId,
          business_name: cleanedSettings.business_name,
          logo_url: cleanedSettings.logo_url,
          email: cleanedSettings.email,
          phone: cleanedSettings.phone,
          website: cleanedSettings.website,
          address: cleanedSettings.address,
          default_terms: cleanedSettings.default_terms,
          default_payment_terms: cleanedSettings.default_payment_terms,
          updated_at: new Date().toISOString(),
        }

        const { error: retryError } = await supabase
          .from("company_settings")
          .upsert(coreFields, { onConflict: "user_id" })

        if (retryError) return { error: retryError.message }

        revalidatePath("/settings")
        return { success: true, warning: "Saved core settings. Invoice branding fields require database migration." }
      }
      return { error: error.message }
    }

    revalidatePath("/settings")
    return { success: true }
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to save settings" }
  }
}

export async function uploadLogo(formData: FormData): Promise<string> {
  const { supabase, userId } = await getAuthenticatedUserId()
  if (!userId) throw new Error("Unauthorized")

  const file = formData.get("logo") as File
  if (!file) throw new Error("No file provided")

  const ext = file.name.split(".").pop()
  const fileName = `${userId}/logo-${Date.now()}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from("company-logos")
    .upload(fileName, file, { upsert: true })

  if (uploadError) throw new Error(uploadError.message)

  const { data: { publicUrl } } = supabase.storage
    .from("company-logos")
    .getPublicUrl(fileName)

  return publicUrl
}

export async function uploadSignature(formData: FormData): Promise<string> {
  const { supabase, userId } = await getAuthenticatedUserId()
  if (!userId) throw new Error("Unauthorized")

  const file = formData.get("signature") as File
  if (!file) throw new Error("No file provided")

  const ext = file.name.split(".").pop()
  const fileName = `${userId}/signatures/signature-${Date.now()}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from("company-logos")
    .upload(fileName, file, { upsert: true })

  if (uploadError) throw new Error(uploadError.message)

  const { data: { publicUrl } } = supabase.storage
    .from("company-logos")
    .getPublicUrl(fileName)

  return publicUrl
}
