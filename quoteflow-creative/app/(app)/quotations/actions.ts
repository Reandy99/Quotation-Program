"use server"

import { createClient } from "@/lib/supabase/server"
import { logAudit } from "@/lib/utils/audit"
import { revalidatePath } from "next/cache"
import type { Quotation, QuotationItem, QuotationStatus } from "@/types"

export async function getQuotations(): Promise<Quotation[]> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("quotations")
      .select(`
        *,
        lead:leads(*),
        items:quotation_items(*)
      `)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching quotations:", error)
      return []
    }
    return data || []
  } catch (error) {
    console.error("Error in getQuotations:", error)
    return []
  }
}

export async function getQuotation(id: string): Promise<Quotation | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("quotations")
    .select(`
      *,
      lead:leads(*),
      items:quotation_items(*)
    `)
    .eq("id", id)
    .single()

  if (error) return null
  return data
}

export async function generateQuoteNumber(): Promise<string> {
  try {
    const supabase = createClient()
    const year = new Date().getFullYear()
    const prefix = `QF-${year}-`

    const { data } = await supabase
      .from("quotations")
      .select("quote_number")
      .like("quote_number", `${prefix}%`)
      .order("quote_number", { ascending: false })
      .limit(1)

    if (!data || data.length === 0) {
      return `${prefix}001`
    }

    const lastNumber = parseInt(data[0].quote_number.split("-")[2])
    const nextNumber = (lastNumber + 1).toString().padStart(3, "0")
    return `${prefix}${nextNumber}`
  } catch (error) {
    console.error("Error generating quote number:", error)
    // Fallback to timestamp-based number
    return `QF-${new Date().getFullYear()}-${Date.now().toString().slice(-3)}`
  }
}

export async function createQuotation(
  quotation: Omit<Quotation, "id" | "user_id" | "created_at" | "updated_at" | "items">,
  items: Omit<QuotationItem, "id" | "quotation_id" | "user_id" | "created_at" | "updated_at">[]
) {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      throw new Error("Authentication required. Please sign in.")
    }

    const { data: quotationData, error: quotationError } = await supabase
      .from("quotations")
      .insert({ ...quotation, user_id: user.id })
      .select()
      .single()

    if (quotationError) throw new Error(quotationError.message)

    if (items.length > 0) {
      const itemsToInsert = items.map((item, index) => ({
        ...item,
        quotation_id: quotationData.id,
        user_id: user.id,
        sort_order: index,
      }))

      const { error: itemsError } = await supabase
        .from("quotation_items")
        .insert(itemsToInsert)

      if (itemsError) throw new Error(itemsError.message)
    }

    await logAudit("create", "quotation", quotationData.id, { quote_number: quotation.quote_number }).catch(err => {
      console.error("Audit log failed:", err)
    })
    revalidatePath("/quotations")
    return quotationData
  } catch (error: any) {
    console.error("Error creating quotation:", error)
    throw new Error(error.message || "Failed to create quotation")
  }
}

export async function updateQuotationStatus(id: string, status: QuotationStatus) {
  try {
    const supabase = createClient()
    const { error } = await supabase
      .from("quotations")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id)

    if (error) throw new Error(error.message)

    await logAudit("update_status", "quotation", id, { status }).catch(err => {
      console.error("Audit log failed:", err)
    })
    revalidatePath("/quotations")
  } catch (error: any) {
    console.error("Error updating quotation status:", error)
    throw new Error(error.message || "Failed to update quotation status")
  }
}
