"use server"

import { createClient } from "@/lib/supabase/server"
import type { Invoice, Lead } from "@/types"

export async function getReportStats() {
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

    const leads: Pick<Lead, "status">[] = leadsResult.data || []
    const quotations = quotationsResult.data || []
    const invoices: Pick<Invoice, "status" | "grand_total" | "paid_amount">[] = invoicesResult.data || []

    const wonLeads = leads.filter((l) => l.status === "Won").length
    const totalRevenue = invoices.filter((i) => i.status === "Paid").reduce((sum, i) => sum + Number(i.grand_total), 0)
    const conversionRate = leads.length > 0 ? Math.round((wonLeads / leads.length) * 100) : 0

    const pipeline = [
      { label: "New", count: leads.filter((l) => l.status === "New").length, color: "#CBD5E1" },
      { label: "Contacted", count: leads.filter((l) => l.status === "Contacted").length, color: "#BFEAF3" },
      { label: "Quoted", count: leads.filter((l) => l.status === "Quoted").length, color: "#93C5FD" },
      { label: "Follow Up", count: leads.filter((l) => l.status === "Follow Up").length, color: "#F6E57A" },
      { label: "Deals", count: leads.filter((l) => l.status === "Won").length, color: "#DDEFCB" },
    ]

    return {
      totalLeads: leads.length,
      wonLeads,
      totalQuotations: quotations.length,
      totalInvoices: invoices.length,
      totalRevenue,
      conversionRate,
      pipeline,
    }
  } catch (error) {
    console.error("Error fetching report stats:", error)
    return {
      totalLeads: 0,
      wonLeads: 0,
      totalQuotations: 0,
      totalInvoices: 0,
      totalRevenue: 0,
      conversionRate: 0,
      pipeline: [
        { label: "New", count: 0, color: "#CBD5E1" },
        { label: "Contacted", count: 0, color: "#BFEAF3" },
        { label: "Quoted", count: 0, color: "#93C5FD" },
        { label: "Follow Up", count: 0, color: "#F6E57A" },
        { label: "Deals", count: 0, color: "#DDEFCB" },
      ],
    }
  }
}
