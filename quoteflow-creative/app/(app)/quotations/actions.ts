"use server"

import { createClient } from "@/lib/supabase/server"
import { logAudit } from "@/lib/utils/audit"
import { revalidatePath } from "next/cache"
import type { Quotation, QuotationItem, QuotationStatus } from "@/types"

export async function getQuotations(): Promise<Quotation[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("quotations")
    .select(`
      *,
      lead:leads(*),
      items:quotation_items(*)
    `)
    .order("created_at", { ascending: false })

  if (error) throw new Error(error.message)
  return data || []
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
}

export async function createQuotation(
  quotation: Omit<Quotation, "id" | "user_id" | "created_at" | "updated_at" | "items">,
  items: Omit<QuotationItem, "id" | "quotation_id" | "user_id" | "created_at" | "updated_at">[]
) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

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

  await logAudit("create", "quotation", quotationData.id, { quote_number: quotation.quote_number })
  revalidatePath("/quotations")
  return quotationData
}

export async function updateQuotationStatus(id: string, status: QuotationStatus) {
  const supabase = createClient()
  const { error } = await supabase
    .from("quotations")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)

  if (error) throw new Error(error.message)

  await logAudit("update_status", "quotation", id, { status })
  revalidatePath("/quotations")
}
