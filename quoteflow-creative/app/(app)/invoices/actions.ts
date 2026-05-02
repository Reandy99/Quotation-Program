"use server"

import { createClient } from "@/lib/supabase/server"
import { logAudit } from "@/lib/utils/audit"
import { revalidatePath } from "next/cache"
import type { Invoice, InvoiceStatus } from "@/types"

export async function getInvoices(): Promise<Invoice[]> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("invoices")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching invoices:", error)
      return []
    }
    return data || []
  } catch (error) {
    console.error("Error in getInvoices:", error)
    return []
  }
}

export async function generateInvoiceNumber(): Promise<string> {
  try {
    const supabase = createClient()
    const year = new Date().getFullYear()
    const prefix = `INV-${year}-`

    const { data } = await supabase
      .from("invoices")
      .select("invoice_number")
      .like("invoice_number", `${prefix}%`)
      .order("invoice_number", { ascending: false })
      .limit(1)

    if (!data || data.length === 0) {
      return `${prefix}001`
    }

    const lastNumber = parseInt(data[0].invoice_number.split("-")[2])
    const nextNumber = (lastNumber + 1).toString().padStart(3, "0")
    return `${prefix}${nextNumber}`
  } catch (error) {
    console.error("Error generating invoice number:", error)
    // Fallback to timestamp-based number
    return `INV-${new Date().getFullYear()}-${Date.now().toString().slice(-3)}`
  }
}

export async function createInvoice(invoice: Omit<Invoice, "id" | "user_id" | "created_at" | "updated_at">) {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      throw new Error("Authentication required. Please sign in.")
    }

    // Convert empty strings to null for date/numeric fields
    const cleanInvoice = {
      quotation_id: invoice.quotation_id || null,
      invoice_number: invoice.invoice_number,
      client_name: invoice.client_name,
      project_title: invoice.project_title,
      issue_date: invoice.issue_date || null,
      due_date: invoice.due_date || null,
      subtotal: invoice.subtotal,
      discount: invoice.discount,
      tax: invoice.tax,
      grand_total: invoice.grand_total,
      paid_amount: invoice.paid_amount,
      status: invoice.status,
      notes: invoice.notes || null,
      user_id: user.id,
    }

    const { data, error } = await supabase
      .from("invoices")
      .insert(cleanInvoice)
      .select()
      .single()

    if (error) throw new Error(error.message)

    await logAudit("create", "invoice", data.id, { invoice_number: invoice.invoice_number }).catch(err => {
      console.error("Audit log failed:", err)
    })
    revalidatePath("/invoices")
    return data
  } catch (error: any) {
    console.error("Error creating invoice:", error)
    throw new Error(error.message || "Failed to create invoice")
  }
}

export async function updateInvoiceStatus(id: string, status: InvoiceStatus) {
  try {
    const supabase = createClient()
    const { error } = await supabase
      .from("invoices")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id)

    if (error) throw new Error(error.message)

    await logAudit("update_status", "invoice", id, { status }).catch(err => {
      console.error("Audit log failed:", err)
    })
    revalidatePath("/invoices")
  } catch (error: any) {
    console.error("Error updating invoice status:", error)
    throw new Error(error.message || "Failed to update invoice status")
  }
}

export async function getInvoice(id: string): Promise<Invoice | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("invoices")
    .select("*")
    .eq("id", id)
    .single()

  if (error) return null
  return data
}

export async function updateInvoice(
  id: string,
  updates: Partial<Omit<Invoice, "id" | "user_id" | "created_at" | "updated_at">>
) {
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new Error("Authentication required.")

  const cleanUpdates = {
    ...updates,
    issue_date: updates.issue_date || null,
    due_date: updates.due_date || null,
    quotation_id: updates.quotation_id || null,
    notes: updates.notes || null,
    updated_at: new Date().toISOString()
  }

  const { error } = await supabase
    .from("invoices")
    .update(cleanUpdates)
    .eq("id", id)
    .eq("user_id", user.id)

  if (error) throw new Error(error.message)

  await logAudit("update", "invoice", id, {}).catch(() => {})
  revalidatePath("/invoices")
  revalidatePath(`/invoices/${id}`)
}
