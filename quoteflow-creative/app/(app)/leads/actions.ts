"use server"

import { createClient } from "@/lib/supabase/server"
import { logAudit } from "@/lib/utils/audit"
import { revalidatePath } from "next/cache"
import type { Lead, LeadStatus } from "@/types"

export async function getLeads(): Promise<Lead[]> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching leads:", error)
      return []
    }
    return data || []
  } catch (error) {
    console.error("Error in getLeads:", error)
    return []
  }
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
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      throw new Error("Authentication required. Please sign in.")
    }

    const { data, error } = await supabase
      .from("leads")
      .insert({ ...lead, user_id: user.id })
      .select()
      .single()

    if (error) {
      console.error("Supabase error creating lead:", error)
      throw new Error(error.message || "Failed to create lead")
    }

    await logAudit("create", "lead", data.id, { client_name: lead.client_name }).catch(err => {
      console.error("Audit log failed:", err)
    })
    
    revalidatePath("/leads")
    return data
  } catch (error: any) {
    console.error("Error in createLead:", error)
    throw new Error(error.message || "Failed to create lead")
  }
}

export async function updateLeadStatus(id: string, status: LeadStatus) {
  try {
    const supabase = createClient()
    const { error } = await supabase
      .from("leads")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id)

    if (error) throw new Error(error.message)

    await logAudit("update_status", "lead", id, { status }).catch(err => {
      console.error("Audit log failed:", err)
    })
    revalidatePath("/leads")
  } catch (error: any) {
    console.error("Error updating lead status:", error)
    throw new Error(error.message || "Failed to update lead status")
  }
}

export async function updateLead(id: string, updates: Partial<Lead>) {
  try {
    const supabase = createClient()
    const { error } = await supabase
      .from("leads")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)

    if (error) throw new Error(error.message)

    await logAudit("update", "lead", id).catch(err => {
      console.error("Audit log failed:", err)
    })
    revalidatePath("/leads")
    revalidatePath(`/leads/${id}`)
  } catch (error: any) {
    console.error("Error updating lead:", error)
    throw new Error(error.message || "Failed to update lead")
  }
}

export async function deleteLead(id: string) {
  try {
    const supabase = createClient()
    const { error } = await supabase.from("leads").delete().eq("id", id)

    if (error) throw new Error(error.message)

    await logAudit("delete", "lead", id).catch(err => {
      console.error("Audit log failed:", err)
    })
    revalidatePath("/leads")
  } catch (error: any) {
    console.error("Error deleting lead:", error)
    throw new Error(error.message || "Failed to delete lead")
  }
}
