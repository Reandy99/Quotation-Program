"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { leadFormSettingsSchema, sanitizeSlug, type LeadFormSettingsInput } from "@/lib/lead-forms/validation"
import type { LeadForm } from "@/types"

const DEFAULT_FORM = {
  title: "Request Event Documentation",
  description: "Tell us about your event and we will get back to you soon.",
  button_text: "Submit Inquiry",
  thank_you_message: "Thank you! Your inquiry has been received.",
  is_active: true,
}

function fallbackSlug(email?: string | null) {
  const base = sanitizeSlug((email || "frameflow-form").split("@")[0])
  return base || `form-${Math.random().toString(36).slice(2, 8)}`
}

async function uniqueSlug(supabase: ReturnType<typeof createClient>, desiredSlug: string, userId: string) {
  let slug = sanitizeSlug(desiredSlug) || `form-${Math.random().toString(36).slice(2, 8)}`

  for (let i = 0; i < 8; i++) {
    const candidate = i === 0 ? slug : `${slug}-${i + 1}`
    const { data } = await supabase
      .from("lead_forms")
      .select("id,user_id")
      .eq("slug", candidate)
      .maybeSingle()

    if (!data || data.user_id === userId) return candidate
  }

  return `${slug}-${Math.random().toString(36).slice(2, 7)}`
}

export async function getOrCreateLeadForm(): Promise<LeadForm | null> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from("lead_forms")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle()

  if (data) return data

  const slug = await uniqueSlug(supabase, fallbackSlug(user.email), user.id)
  const { data: created, error } = await supabase
    .from("lead_forms")
    .insert({
      user_id: user.id,
      slug,
      ...DEFAULT_FORM,
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating lead form:", error)
    return null
  }

  return created
}

export async function updateLeadForm(input: LeadFormSettingsInput) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const parsed = leadFormSettingsSchema.safeParse(input)
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message || "Invalid form settings")
  }

  const nextSlug = await uniqueSlug(supabase, parsed.data.slug, user.id)
  if (nextSlug !== parsed.data.slug) {
    throw new Error("This slug is already taken. Try another one.")
  }

  const { data: existing } = await supabase
    .from("lead_forms")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle()

  const payload = {
    user_id: user.id,
    ...parsed.data,
    updated_at: new Date().toISOString(),
  }

  const query = existing
    ? supabase.from("lead_forms").update(payload).eq("id", existing.id)
    : supabase.from("lead_forms").insert(payload)

  const { error } = await query
  if (error) throw new Error(error.message)

  revalidatePath("/lead-form")
  revalidatePath(`/f/${parsed.data.slug}`)
}
