"use server"

import { createClient } from "@/lib/supabase/server"
import { logAudit } from "@/lib/utils/audit"
import { revalidatePath } from "next/cache"
import type { Invoice, InvoiceStatus, Payment, PaymentMethod } from "@/types"
import { createXenditInvoice, getXenditInvoice } from "@/lib/xendit/client"

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
    revalidatePath("/dashboard")
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
    revalidatePath("/dashboard")
  } catch (error: any) {
    console.error("Error updating invoice status:", error)
    throw new Error(error.message || "Failed to update invoice status")
  }
}

export async function getInvoice(id: string): Promise<Invoice | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("invoices")
    .select(`
      *,
      quotation:quotations(
        event_date,
        location,
        project_type,
        terms,
        lead:leads(client_name, company_name, email, phone),
        items:quotation_items(*)
      )
    `)
    .eq("id", id)
    .single()

  if (error) return null

  const invoice = data as any
  if (invoice.quotation?.items?.length) {
    invoice.items = invoice.quotation.items.sort((a: any, b: any) => a.sort_order - b.sort_order)
  }
  return invoice
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
  revalidatePath("/dashboard")
}

export async function deleteInvoices(ids: string[]) {
  try {
    const supabase = createClient()
    const { error } = await supabase.from("invoices").delete().in("id", ids)

    if (error) throw new Error(error.message)

    await Promise.all(ids.map(id => logAudit("delete", "invoice", id))).catch(err => {
      console.error("Audit log failed:", err)
    })
    revalidatePath("/invoices")
    revalidatePath("/dashboard")
  } catch (error: any) {
    console.error("Error deleting invoices:", error)
    throw new Error(error.message || "Failed to delete invoices")
  }
}

export async function createPayment(
  invoiceId: string,
  payment: { amount: number; method: PaymentMethod; date: string; notes?: string | null }
): Promise<Payment> {
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new Error("Authentication required.")

  const { data, error } = await supabase
    .from("payments")
    .insert({ ...payment, invoice_id: invoiceId, user_id: user.id, notes: payment.notes || null })
    .select()
    .single()

  if (error) throw new Error(error.message)

  revalidatePath(`/invoices/${invoiceId}`)
  revalidatePath("/dashboard")
  return data
}

export async function getPayments(invoiceId: string): Promise<Payment[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .eq("invoice_id", invoiceId)
    .order("date", { ascending: false })

  if (error) return []
  return data || []
}

export async function deletePayment(id: string, invoiceId: string): Promise<void> {
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new Error("Authentication required.")

  const { error } = await supabase
    .from("payments")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)

  if (error) throw new Error(error.message)

  revalidatePath("/invoices")
  revalidatePath(`/invoices/${invoiceId}`)
  revalidatePath("/dashboard")
}

export async function getInvoicePaymentData(
  invoiceId: string
): Promise<{ orderId: string | null; paymentUrl: string | null }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("invoices")
    .select("payment_order_id, payment_url")
    .eq("id", invoiceId)
    .single()
  if (error) return { orderId: null, paymentUrl: null }
  const row = data as { payment_order_id: string | null; payment_url: string | null } | null
  return {
    orderId: row?.payment_order_id ?? null,
    paymentUrl: row?.payment_url ?? null,
  }
}

export async function createXenditPaymentLink(
  invoiceId: string
): Promise<{ paymentUrl: string }> {
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new Error("Authentication required.")

  const existing = await getInvoicePaymentData(invoiceId)
  if (existing.paymentUrl) return { paymentUrl: existing.paymentUrl }

  const invoice = await getInvoice(invoiceId)
  if (!invoice) throw new Error("Invoice tidak ditemukan.")
  if (invoice.status === "Paid") throw new Error("Invoice sudah lunas.")

  const remaining = invoice.grand_total - invoice.paid_amount
  const externalId = `QF-${invoiceId.slice(0, 8)}-${Date.now()}`

  const xenditInvoice = await createXenditInvoice({
    externalId,
    amount: remaining,
    payerEmail: null,
    description: invoice.project_title,
  })

  const { error: updateError } = await supabase
    .from("invoices")
    .update({ payment_order_id: xenditInvoice.id, payment_url: xenditInvoice.invoice_url } as Record<string, unknown>)
    .eq("id", invoiceId)
    .eq("user_id", user.id)
  if (updateError) throw new Error(`Gagal menyimpan payment link: ${updateError.message}`)

  revalidatePath(`/invoices/${invoiceId}`)
  return { paymentUrl: xenditInvoice.invoice_url }
}

export async function checkXenditStatus(
  invoiceId: string
): Promise<{ status: string; message: string }> {
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new Error("Authentication required.")

  const { orderId } = await getInvoicePaymentData(invoiceId)
  if (!orderId) return { status: "no_transaction", message: "Belum ada payment link." }

  const xenditInvoice = await getXenditInvoice(orderId)

  if (xenditInvoice.status === "PAID" || xenditInvoice.status === "SETTLED") {
    const invoice = await getInvoice(invoiceId)
    if (invoice && invoice.status !== "Paid") {
      const paidAmount = xenditInvoice.paid_amount ?? (invoice.grand_total - invoice.paid_amount)
      await updateInvoiceStatus(invoiceId, "Paid")
      await createPayment(invoiceId, {
        amount: paidAmount,
        method: "Transfer",
        date: new Date().toISOString().split("T")[0],
        notes: "Dibayar via Xendit",
      })
    }
    return { status: "paid", message: "Pembayaran berhasil dikonfirmasi." }
  }

  if (xenditInvoice.status === "PENDING") {
    return { status: "pending", message: "Menunggu pembayaran dari klien." }
  }

  return { status: xenditInvoice.status, message: `Status: ${xenditInvoice.status}` }
}
