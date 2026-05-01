"use server"

import { createClient } from "@/lib/supabase/server"

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

    const leads = leadsResult.data || []
    const quotations = quotationsResult.data || []
    const invoices = invoicesResult.data || []

    const wonLeads = leads.filter(l => l.status === "Won").length
    const totalRevenue = invoices.filter(i => i.status === "Paid").reduce((sum, i) => sum + Number(i.grand_total), 0)
    const conversionRate = leads.length > 0 ? Math.round((wonLeads / leads.length) * 100) : 0

    return {
      totalLeads: leads.length,
      totalQuotations: quotations.length,
      totalInvoices: invoices.length,
      totalRevenue,
      conversionRate,
    }
  } catch (error) {
    console.error("Error fetching report stats:", error)
    return {
      totalLeads: 0,
      totalQuotations: 0,
      totalInvoices: 0,
      totalRevenue: 0,
      conversionRate: 0,
    }
  }
}
