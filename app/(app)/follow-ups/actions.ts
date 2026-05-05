"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { FollowUp, FollowUpType } from "@/types"

async function backfillFollowUpsFromLeads(supabase: ReturnType<typeof createClient>) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const [{ data: leads, error: leadsError }, { data: existingFollowUps, error: followUpsError }] = await Promise.all([
    supabase
      .from("leads")
      .select("id, follow_up_date")
      .eq("user_id", user.id)
      .not("follow_up_date", "is", null),
    supabase
      .from("follow_ups")
      .select("lead_id")
      .eq("user_id", user.id)
      .eq("completed", false),
  ])

  if (leadsError) throw new Error(leadsError.message)
  if (followUpsError) throw new Error(followUpsError.message)

  const existingLeadIds = new Set<string>(
    ((existingFollowUps || []) as Array<{ lead_id: string | null }>)
      .map((followUp) => followUp.lead_id)
      .filter(Boolean)
      .map((leadId) => leadId as string)
  )

  const missingFollowUps = ((leads || []) as Array<{ id: string; follow_up_date: string | null }>)
    .filter((lead) => lead.follow_up_date && !existingLeadIds.has(lead.id))
    .map((lead) => ({
      user_id: user.id,
      lead_id: lead.id,
      type: "other" as const,
      scheduled_date: lead.follow_up_date,
      notes: "Auto-migrated from legacy lead follow_up_date",
    }))

  if (!missingFollowUps.length) return

  const { error: insertError } = await supabase
    .from("follow_ups")
    .insert(missingFollowUps)

  if (insertError) throw new Error(insertError.message)
}

async function syncLeadFollowUpDate(supabase: ReturnType<typeof createClient>, leadId: string | null) {
  if (!leadId) return

  const { data: nextFollowUp } = await supabase
    .from("follow_ups")
    .select("scheduled_date")
    .eq("lead_id", leadId)
    .eq("completed", false)
    .order("scheduled_date", { ascending: true })
    .limit(1)
    .maybeSingle()

  await supabase
    .from("leads")
    .update({
      follow_up_date: nextFollowUp?.scheduled_date ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", leadId)
}

export async function getFollowUps(): Promise<FollowUp[]> {
  const supabase = createClient()
  await backfillFollowUpsFromLeads(supabase)
  const { data, error } = await supabase
    .from("follow_ups")
    .select(`
      *,
      lead:leads(*)
    `)
    .eq("completed", false)
    .order("scheduled_date", { ascending: true })

  if (error) throw new Error(error.message)
  return data || []
}

export async function createFollowUp(followUp: Omit<FollowUp, "id" | "user_id" | "created_at" | "updated_at" | "completed" | "completed_at" | "lead">) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data, error } = await supabase
    .from("follow_ups")
    .insert({ ...followUp, user_id: user.id })
    .select()
    .single()

  if (error) throw new Error(error.message)

  await syncLeadFollowUpDate(supabase, data.lead_id)
  revalidatePath("/follow-ups")
  revalidatePath("/leads")
  if (data.lead_id) revalidatePath(`/leads/${data.lead_id}`)
  revalidatePath("/dashboard")
  return data
}

export async function upsertLeadFollowUp(leadId: string, scheduledDate: string, type: FollowUpType = "other", notes: string | null = null) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: existing, error: lookupError } = await supabase
    .from("follow_ups")
    .select("id")
    .eq("lead_id", leadId)
    .eq("completed", false)
    .order("scheduled_date", { ascending: true })
    .limit(1)
    .maybeSingle()

  if (lookupError) throw new Error(lookupError.message)

  if (existing?.id) {
    const { error } = await supabase
      .from("follow_ups")
      .update({
        scheduled_date: scheduledDate,
        type,
        notes,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id)

    if (error) throw new Error(error.message)
  } else {
    const { error } = await supabase
      .from("follow_ups")
      .insert({
        user_id: user.id,
        lead_id: leadId,
        scheduled_date: scheduledDate,
        type,
        notes,
      })

    if (error) throw new Error(error.message)
  }

  await syncLeadFollowUpDate(supabase, leadId)
  revalidatePath("/follow-ups")
  revalidatePath("/leads")
  revalidatePath(`/leads/${leadId}`)
  revalidatePath("/dashboard")
}

export async function completeFollowUp(id: string) {
  const supabase = createClient()
  const { data: existing, error: lookupError } = await supabase
    .from("follow_ups")
    .select("lead_id")
    .eq("id", id)
    .maybeSingle()

  if (lookupError) throw new Error(lookupError.message)

  const { error } = await supabase
    .from("follow_ups")
    .update({ 
      completed: true, 
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString() 
    })
    .eq("id", id)

  if (error) throw new Error(error.message)

  await syncLeadFollowUpDate(supabase, existing?.lead_id ?? null)
  revalidatePath("/follow-ups")
  revalidatePath("/leads")
  if (existing?.lead_id) revalidatePath(`/leads/${existing.lead_id}`)
  revalidatePath("/dashboard")
}

export async function updateFollowUp(id: string, updates: Partial<Pick<FollowUp, "scheduled_date" | "type" | "notes">>) {
  const supabase = createClient()
  const { data: existing, error: lookupError } = await supabase
    .from("follow_ups")
    .select("lead_id")
    .eq("id", id)
    .maybeSingle()

  if (lookupError) throw new Error(lookupError.message)

  const { error } = await supabase
    .from("follow_ups")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)

  if (error) throw new Error(error.message)

  await syncLeadFollowUpDate(supabase, existing?.lead_id ?? null)
  revalidatePath("/follow-ups")
  revalidatePath("/leads")
  if (existing?.lead_id) revalidatePath(`/leads/${existing.lead_id}`)
  revalidatePath("/dashboard")
}

export async function deleteFollowUp(id: string) {
  const supabase = createClient()
  const { data: existing, error: lookupError } = await supabase
    .from("follow_ups")
    .select("lead_id")
    .eq("id", id)
    .maybeSingle()

  if (lookupError) throw new Error(lookupError.message)

  const { error } = await supabase.from("follow_ups").delete().eq("id", id)

  if (error) throw new Error(error.message)

  await syncLeadFollowUpDate(supabase, existing?.lead_id ?? null)
  revalidatePath("/follow-ups")
  revalidatePath("/leads")
  if (existing?.lead_id) revalidatePath(`/leads/${existing.lead_id}`)
  revalidatePath("/dashboard")
}
