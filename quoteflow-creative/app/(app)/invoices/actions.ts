"use server"

import { createClient } from "@/lib/supabase/server"
import { logAudit } from "@/lib/utils/audit"
import { revalidatePath } from "next/cache"
import type { Invoice, InvoiceStatus } from "@/types"

export async function getInvoices(): Promise<Invoice[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("invoices")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) throw new Error(error.message)
  return data || []
}

export async function generateInvoiceNumber(): Promise<string> {
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
}

export async function createInvoice(invoice: Omit<Invoice, "id" | "user_id" | "created_at" | "updated_at">) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data, error } = await supabase
    .from("invoices")
    .insert({ ...invoice, user_id: user.id })
    .select()
    .single()

  if (error) throw new Error(error.message)

  await logAudit("create", "invoice", data.id, { invoice_number: invoice.invoice_number })
  revalidatePath("/invoices")
  return data
}

export async function updateInvoiceStatus(id: string, status: InvoiceStatus) {
  const supabase = createClient()
  const { error } = await supabase
    .from("invoices")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)

  if (error) throw new Error(error.message)

  await logAudit("update_status", "invoice", id, { status })
  revalidatePath("/invoices")
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
