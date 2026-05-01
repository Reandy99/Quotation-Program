"use server"

import { createClient } from "@/lib/supabase/server"

export async function getDashboardStats() {
  const supabase = createClient()

  const [leadsResult, quotationsResult, invoicesResult] = await Promise.all([
    supabase.from("leads").select("id, status, estimated_budget"),
    supabase.from("quotations").select("id, status, grand_total"),
    supabase.from("invoices").select("id, status, grand_total, paid_amount"),
  ])

  const leads = leadsResult.data || []
  const quotations = quotationsResult.data || []
  const invoices = invoicesResult.data || []

  return {
    totalLeads: leads.length,
    activeLeads: leads.filter(l => !["Won", "Lost"].includes(l.status)).length,
    totalQuotations: quotations.length,
    pendingQuotations: quotations.filter(q => q.status === "Sent").length,
    totalInvoices: invoices.length,
    unpaidInvoices: invoices.filter(i => i.status !== "Paid").length,
    totalRevenue: invoices.filter(i => i.status === "Paid").reduce((sum, i) => sum + Number(i.grand_total), 0),
    pendingRevenue: invoices.filter(i => i.status !== "Paid").reduce((sum, i) => sum + (Number(i.grand_total) - Number(i.paid_amount)), 0),
  }
}

export async function getRecentActivity() {
  const supabase = createClient()

  const [leadsResult, quotationsResult, invoicesResult] = await Promise.all([
    supabase.from("leads").select("*").order("created_at", { ascending: false }).limit(5),
    supabase.from("quotations").select("*").order("created_at", { ascending: false }).limit(5),
    supabase.from("invoices").select("*").order("created_at", { ascending: false }).limit(5),
  ])

  return {
    recentLeads: leadsResult.data || [],
    recentQuotations: quotationsResult.data || [],
    recentInvoices: invoicesResult.data || [],
  }
}
