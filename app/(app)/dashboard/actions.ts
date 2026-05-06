"use server"

import { createClient } from "@/lib/supabase/server"
import type { Invoice, Lead, Quotation } from "@/types"

export async function getDashboardStats() {
  try {
    const supabase = createClient()

    const [leadsResult, quotationsResult, invoicesResult] = await Promise.all([
      supabase.from("leads").select("id, status, estimated_budget"),
      supabase.from("quotations").select("id, status, grand_total"),
      supabase.from("invoices").select("id, status, grand_total, paid_amount"),
    ])

    if (leadsResult.error) throw leadsResult.error
    if (quotationsResult.error) throw quotationsResult.error
    if (invoicesResult.error) throw invoicesResult.error

    const leads: Pick<Lead, "status" | "estimated_budget">[] = leadsResult.data || []
    const quotations: Pick<Quotation, "status" | "grand_total">[] = quotationsResult.data || []
    const invoices: Pick<Invoice, "status" | "grand_total" | "paid_amount">[] = invoicesResult.data || []

    return {
      totalLeads: leads.length,
      activeLeads: leads.filter((l) => !["Won", "Lost"].includes(l.status)).length,
      totalQuotations: quotations.length,
      pendingQuotations: quotations.filter((q) => q.status === "Sent").length,
      totalInvoices: invoices.length,
      unpaidInvoices: invoices.filter((i) => i.status !== "Paid").length,
      totalRevenue: invoices.filter((i) => i.status === "Paid").reduce((sum, i) => sum + Number(i.grand_total), 0),
      pendingRevenue: invoices.filter((i) => i.status !== "Paid").reduce((sum, i) => sum + (Number(i.grand_total) - Number(i.paid_amount)), 0),
      pipelineValue: quotations.filter((q) => ["Draft", "Sent"].includes(q.status)).reduce((sum, q) => sum + Number(q.grand_total), 0),
    }
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return {
      totalLeads: 0,
      activeLeads: 0,
      totalQuotations: 0,
      pendingQuotations: 0,
      totalInvoices: 0,
      unpaidInvoices: 0,
      totalRevenue: 0,
      pendingRevenue: 0,
      pipelineValue: 0,
    }
  }
}

export async function getRecentActivity() {
  try {
    const supabase = createClient()

    const [leadsResult, quotationsResult, invoicesResult] = await Promise.all([
      supabase.from("leads").select("*").order("created_at", { ascending: false }).limit(5),
      supabase.from("quotations").select("*").order("created_at", { ascending: false }).limit(5),
      supabase.from("invoices").select("*").order("created_at", { ascending: false }).limit(5),
    ])

    if (leadsResult.error) throw leadsResult.error
    if (quotationsResult.error) throw quotationsResult.error
    if (invoicesResult.error) throw invoicesResult.error

    return {
      recentLeads: leadsResult.data || [],
      recentQuotations: quotationsResult.data || [],
      recentInvoices: invoicesResult.data || [],
    }
  } catch (error) {
    console.error("Error fetching recent activity:", error)
    return {
      recentLeads: [],
      recentQuotations: [],
      recentInvoices: [],
    }
  }
}

export interface SessionReminder {
  id: string
  clientName: string
  phone: string | null
  projectType: string | null
  eventDate: string
}

export interface InvoiceReminder {
  id: string
  invoiceNumber: string
  clientName: string
  grandTotal: number
  dueDate: string
  phone: string | null
}

type LeadReminderRow = { id: string; client_name: string; phone: string | null; project_type: string | null; event_date: string }
type InvoiceReminderRow = { id: string; invoice_number: string; client_name: string; grand_total: number; due_date: string; quotation_id: string | null }
type QuotationReminderRow = { id: string; lead_id: string | null }
type LeadPhoneRow = { id: string; phone: string | null }

export async function getWAReminderData(): Promise<{
  sessionReminders: SessionReminder[]
  invoiceReminders: InvoiceReminder[]
}> {
  try {
    const supabase = createClient()

    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(today.getDate() + 1)
    const dayAfterTomorrow = new Date(today)
    dayAfterTomorrow.setDate(today.getDate() + 2)

    const tomorrowStr = tomorrow.toISOString().split("T")[0]
    const dayAfterTomorrowStr = dayAfterTomorrow.toISOString().split("T")[0]

    const [leadsRes, invoicesRes] = await Promise.all([
      supabase
        .from("leads")
        .select("id, client_name, phone, project_type, event_date")
        .eq("event_date", tomorrowStr)
        .neq("status", "Lost"),
      supabase
        .from("invoices")
        .select("id, invoice_number, client_name, grand_total, due_date, quotation_id")
        .eq("due_date", dayAfterTomorrowStr)
        .neq("status", "Paid"),
    ])

    if (leadsRes.error) throw leadsRes.error
    if (invoicesRes.error) throw invoicesRes.error

    const sessionReminders: SessionReminder[] = ((leadsRes.data ?? []) as LeadReminderRow[]).map((l) => ({
      id: l.id,
      clientName: l.client_name,
      phone: l.phone,
      projectType: l.project_type,
      eventDate: l.event_date,
    }))

    // Resolve phone via quotation_id → quotation → lead for invoices
    const invoices = (invoicesRes.data ?? []) as InvoiceReminderRow[]
    const quotationIds = invoices.map((i) => i.quotation_id).filter(Boolean) as string[]

    const phoneByQuotationId: Record<string, string | null> = {}
    if (quotationIds.length > 0) {
      const { data: quotations } = await supabase
        .from("quotations")
        .select("id, lead_id")
        .in("id", quotationIds)

      const leadIds = ((quotations ?? []) as QuotationReminderRow[]).map((q) => q.lead_id).filter(Boolean) as string[]
      if (leadIds.length > 0) {
        const { data: leads } = await supabase
          .from("leads")
          .select("id, phone")
          .in("id", leadIds)

        const leadPhoneMap: Record<string, string | null> = {}
        ;((leads ?? []) as LeadPhoneRow[]).forEach((l) => { leadPhoneMap[l.id] = l.phone })
        ;((quotations ?? []) as QuotationReminderRow[]).forEach((q) => {
          if (q.lead_id) phoneByQuotationId[q.id] = leadPhoneMap[q.lead_id] ?? null
        })
      }
    }

    const invoiceReminders: InvoiceReminder[] = invoices.map((i) => ({
      id: i.id,
      invoiceNumber: i.invoice_number,
      clientName: i.client_name,
      grandTotal: Number(i.grand_total),
      dueDate: i.due_date,
      phone: i.quotation_id ? (phoneByQuotationId[i.quotation_id] ?? null) : null,
    }))

    return { sessionReminders, invoiceReminders }
  } catch (error) {
    console.error("Error fetching WA reminder data:", error)
    return { sessionReminders: [], invoiceReminders: [] }
  }
}
