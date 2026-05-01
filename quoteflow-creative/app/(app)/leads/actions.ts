"use server"

import { createClient } from "@/lib/supabase/server"
import { logAudit } from "@/lib/utils/audit"
import { revalidatePath } from "next/cache"
import type { Lead, LeadStatus } from "@/types"

export async function getLeads(): Promise<Lead[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) throw new Error(error.message)
  return data || []
}

export async function getLead(id: string): Promise<Lead | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .eq("id", id)
    .single()

  if (error) return null
  return data
}

export async function createLead(lead: Partial<Omit<Lead, "id" | "user_id" | "created_at" | "updated_at">> & { client_name: string; status: LeadStatus }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data, error } = await supabase
    .from("leads")
    .insert({ ...lead, user_id: user.id })
    .select()
    .single()

  if (error) throw new Error(error.message)

  await logAudit("create", "lead", data.id, { client_name: lead.client_name })
  revalidatePath("/leads")
  return data
}

export async function updateLeadStatus(id: string, status: LeadStatus) {
  const supabase = createClient()
  const { error } = await supabase
    .from("leads")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)

  if (error) throw new Error(error.message)

  await logAudit("update_status", "lead", id, { status })
  revalidatePath("/leads")
}

export async function updateLead(id: string, updates: Partial<Lead>) {
  const supabase = createClient()
  const { error } = await supabase
    .from("leads")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)

  if (error) throw new Error(error.message)

  await logAudit("update", "lead", id)
  revalidatePath("/leads")
  revalidatePath(`/leads/${id}`)
}

export async function deleteLead(id: string) {
  const supabase = createClient()
  const { error } = await supabase.from("leads").delete().eq("id", id)

  if (error) throw new Error(error.message)

  await logAudit("delete", "lead", id)
  revalidatePath("/leads")
}
