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
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { error } = await supabase
    .from("company_settings")
    .upsert({
      user_id: user.id,
      ...settings,
      updated_at: new Date().toISOString(),
    })

  if (error) throw new Error(error.message)

  revalidatePath("/settings")
}
