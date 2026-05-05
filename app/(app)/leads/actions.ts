"use server"

import { createClient } from "@/lib/supabase/server"
import { logAudit } from "@/lib/utils/audit"
import { revalidatePath } from "next/cache"
import type { Lead, LeadStatus } from "@/types"
import { upsertLeadFollowUp } from "@/app/(app)/follow-ups/actions"

function normalizeLeadUpdates(updates: Partial<Lead>) {
  const cleanUpdates: Record<string, unknown> = {
    ...updates,
    updated_at: new Date().toISOString(),
  }

  const nullableFields: Array<keyof Lead> = [
    "company_name",
    "email",
    "phone",
    "project_type",
    "event_date",
    "location",
    "estimated_budget",
    "notes",
    "follow_up_date",
  ]

  for (const field of nullableFields) {
    if (field in updates) {
      const value = updates[field]
      cleanUpdates[field] = value === "" || value === undefined ? null : value
    }
  }

  return cleanUpdates
}

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

    // Convert empty strings to null for date/numeric fields
    const cleanInsert = {
      client_name: lead.client_name,
      company_name: lead.company_name === "" || lead.company_name === undefined ? null : lead.company_name,
      email: lead.email === "" || lead.email === undefined ? null : lead.email,
      phone: lead.phone === "" || lead.phone === undefined ? null : lead.phone,
      project_type: lead.project_type === "" || lead.project_type === undefined ? null : lead.project_type,
      event_date: lead.event_date === "" || lead.event_date === undefined ? null : lead.event_date,
      location: lead.location === "" || lead.location === undefined ? null : lead.location,
      estimated_budget: lead.estimated_budget === undefined ? null : lead.estimated_budget,
      notes: lead.notes === "" || lead.notes === undefined ? null : lead.notes,
      status: lead.status,
      follow_up_date: lead.follow_up_date === "" || lead.follow_up_date === undefined ? null : lead.follow_up_date,
      user_id: user.id,
    }

    const { data, error } = await supabase
      .from("leads")
      .insert(cleanInsert)
      .select()
      .single()

    if (error) {
      console.error("Supabase error creating lead:", error)
      throw new Error(error.message || "Failed to create lead")
    }

    await logAudit("create", "lead", data.id, { client_name: lead.client_name }).catch(err => {
      console.error("Audit log failed:", err)
    })

    if (cleanInsert.follow_up_date) {
      await upsertLeadFollowUp(data.id, cleanInsert.follow_up_date, "other", null)
    }
    
    revalidatePath("/leads")
    revalidatePath("/dashboard")
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

    if (status === "Won" || status === "Lost") {
      const { error: deleteFollowUpError } = await supabase
        .from("follow_ups")
        .delete()
        .eq("lead_id", id)
        .eq("completed", false)

      if (deleteFollowUpError) throw new Error(deleteFollowUpError.message)

      const { error: clearDateError } = await supabase
        .from("leads")
        .update({ follow_up_date: null, updated_at: new Date().toISOString() })
        .eq("id", id)

      if (clearDateError) throw new Error(clearDateError.message)
    }

    revalidatePath("/leads")
    revalidatePath(`/leads/${id}`)
    revalidatePath("/follow-ups")
    revalidatePath("/dashboard")
  } catch (error: any) {
    console.error("Error updating lead status:", error)
    throw new Error(error.message || "Failed to update lead status")
  }
}

export async function updateLead(id: string, updates: Partial<Lead>) {
  try {
    const supabase = createClient()
    const cleanUpdates = normalizeLeadUpdates(updates)
    
    const { error } = await supabase
      .from("leads")
      .update(cleanUpdates)
      .eq("id", id)

    if (error) throw new Error(error.message)

    await logAudit("update", "lead", id).catch(err => {
      console.error("Audit log failed:", err)
    })

    if ("follow_up_date" in updates) {
      if (updates.follow_up_date) {
        await upsertLeadFollowUp(id, updates.follow_up_date, "other", null)
      } else {
        const { error: deleteFollowUpError } = await supabase
          .from("follow_ups")
          .delete()
          .eq("lead_id", id)
          .eq("completed", false)

        if (deleteFollowUpError) {
          throw new Error(deleteFollowUpError.message)
        }
      }
    }

    revalidatePath("/leads")
    revalidatePath("/follow-ups")
    revalidatePath("/dashboard")
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
    revalidatePath("/dashboard")
  } catch (error: any) {
    console.error("Error deleting lead:", error)
    throw new Error(error.message || "Failed to delete lead")
  }
}

export async function deleteLeads(ids: string[]) {
  try {
    const supabase = createClient()
    const { error } = await supabase.from("leads").delete().in("id", ids)

    if (error) throw new Error(error.message)

    await Promise.all(ids.map(id => logAudit("delete", "lead", id))).catch(err => {
      console.error("Audit log failed:", err)
    })
    revalidatePath("/leads")
    revalidatePath("/dashboard")
  } catch (error: any) {
    console.error("Error deleting leads:", error)
    throw new Error(error.message || "Failed to delete leads")
  }
}
