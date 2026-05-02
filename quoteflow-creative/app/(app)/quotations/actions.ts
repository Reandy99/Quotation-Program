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

export async function createInvoiceFromQuotation(quotationId: string): Promise<string> {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      throw new Error("Authentication required")
    }

    const quotation = await getQuotation(quotationId)
    if (!quotation) {
      throw new Error("Quotation not found")
    }

    const year = new Date().getFullYear()
    const prefix = `INV-${year}-`
    const { data: lastInvoice } = await supabase
      .from("invoices")
      .select("invoice_number")
      .like("invoice_number", `${prefix}%`)
      .order("invoice_number", { ascending: false })
      .limit(1)

    const invoiceNumber = !lastInvoice || lastInvoice.length === 0
      ? `${prefix}001`
      : `${prefix}${(parseInt(lastInvoice[0].invoice_number.split("-")[2]) + 1).toString().padStart(3, "0")}`

    const discount = quotation.discount_type === "percent"
      ? quotation.subtotal * (quotation.discount_value / 100)
      : quotation.discount_value
    const afterDiscount = quotation.subtotal - discount
    const tax = afterDiscount * (quotation.tax_percent / 100)

    const { data: invoice, error } = await supabase
      .from("invoices")
      .insert({
        user_id: user.id,
        quotation_id: quotationId,
        invoice_number: invoiceNumber,
        client_name: quotation.lead?.client_name || "Client",
        project_title: quotation.project_title,
        issue_date: new Date().toISOString().split("T")[0],
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        subtotal: quotation.subtotal,
        discount,
        tax,
        grand_total: quotation.grand_total,
        paid_amount: 0,
        status: "Draft",
        notes: quotation.notes,
      })
      .select()
      .single()

    if (error) throw new Error(error.message)

    await logAudit("create", "invoice", invoice.id, { invoice_number: invoiceNumber, from_quotation: quotationId }).catch(err => {
      console.error("Audit log failed:", err)
    })
    revalidatePath("/invoices")
    revalidatePath(`/quotations/${quotationId}`)
    return invoice.id
  } catch (error: any) {
    console.error("Error creating invoice from quotation:", error)
    throw new Error(error.message || "Failed to create invoice")
  }
}
