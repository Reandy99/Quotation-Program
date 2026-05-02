"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { CompanySettings } from "@/types"

export async function getCompanySettings(): Promise<CompanySettings | null> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from("company_settings")
    .select("*")
    .eq("user_id", user.id)
    .single()

  if (error) {
    // Create default settings if none exist
    const { data: newData } = await supabase
      .from("company_settings")
      .insert({ user_id: user.id })
      .select()
      .single()
    return newData
  }

  return data
}

export async function updateCompanySettings(settings: Partial<CompanySettings>) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "Unauthorized" }

    const cleanedSettings = Object.fromEntries(
      Object.entries(settings).map(([key, value]) => [
        key,
        value === "" ? null : value
      ])
    )

    const { error } = await supabase
      .from("company_settings")
      .upsert({
        user_id: user.id,
        ...cleanedSettings,
        updated_at: new Date().toISOString(),
      })

    if (error) {
      // If schema cache error for missing columns, retry with core fields only
      if (error.message.includes("schema cache") || error.message.includes("column")) {
        const coreFields = {
          user_id: user.id,
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
          .upsert(coreFields)

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
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const file = formData.get("logo") as File
  if (!file) throw new Error("No file provided")

  const ext = file.name.split(".").pop()
  const fileName = `${user.id}/logo-${Date.now()}.${ext}`

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
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const file = formData.get("signature") as File
  if (!file) throw new Error("No file provided")

  const ext = file.name.split(".").pop()
  const fileName = `${user.id}/signatures/signature-${Date.now()}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from("company-logos")
    .upload(fileName, file, { upsert: true })

  if (uploadError) throw new Error(uploadError.message)

  const { data: { publicUrl } } = supabase.storage
    .from("company-logos")
    .getPublicUrl(fileName)

  return publicUrl
}
