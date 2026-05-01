"use server"

import { createClient } from "@/lib/supabase/server"

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
