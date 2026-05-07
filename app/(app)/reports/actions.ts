"use server"

import { createClient } from "@/lib/supabase/server"
import type { LeadStatus, InvoiceStatus } from "@/types"

interface LeadRow { id: string; status: LeadStatus; created_at: string; project_type: string | null; estimated_budget: number | null }
interface QuotationRow { id: string; status: string; grand_total: number; created_at: string }
interface InvoiceRow { id: string; status: InvoiceStatus; grand_total: number; paid_amount: number; issue_date: string; created_at: string }
interface FollowUpRow { id: string; completed: boolean; completed_at: string | null; scheduled_date: string; created_at: string }

export interface PeriodStats {
  newLeads: number
  quotationsCreated: number
  invoicesPaid: number
  revenuePaid: number
  followUpsCompleted: number
  followUpsPending: number
}

export interface ReportData {
  weekly: PeriodStats
  monthly: PeriodStats
  allTime: {
    totalRevenue: number
    totalLeads: number
    wonLeads: number
    conversionRate: number
    totalQuotations: number
    pendingRevenue: number
    overdueCount: number
    unpaidCount: number
  }
  pipeline: Array<{ label: string; count: number; color: string }>
  invoiceBreakdown: Array<{ status: string; label: string; count: number; amount: number; color: string }>
  topProjectTypes: Array<{ type: string; count: number }>
}

export async function getReportData(): Promise<ReportData> {
  const supabase = createClient()

  const now = new Date()
  const weekAgo = new Date(now)
  weekAgo.setDate(now.getDate() - 7)
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  const weekAgoStr = weekAgo.toISOString()
  const monthStartStr = monthStart.toISOString()

  try {
    const [leadsRes, quotationsRes, invoicesRes, followUpsRes] = await Promise.all([
      supabase.from("leads").select("id, status, created_at, project_type, estimated_budget"),
      supabase.from("quotations").select("id, status, grand_total, created_at"),
      supabase.from("invoices").select("id, status, grand_total, paid_amount, issue_date, created_at"),
      supabase.from("follow_ups").select("id, completed, completed_at, scheduled_date, created_at"),
    ])

    if (leadsRes.error) throw leadsRes.error
    if (quotationsRes.error) throw quotationsRes.error
    if (invoicesRes.error) throw invoicesRes.error
    if (followUpsRes.error) throw followUpsRes.error

    const leads: LeadRow[] = (leadsRes.data ?? []) as LeadRow[]
    const quotations: QuotationRow[] = (quotationsRes.data ?? []) as QuotationRow[]
    const invoices: InvoiceRow[] = (invoicesRes.data ?? []) as InvoiceRow[]
    const followUps: FollowUpRow[] = (followUpsRes.data ?? []) as FollowUpRow[]

    function periodStats(fromStr: string): PeriodStats {
      const newLeads = leads.filter(l => l.created_at >= fromStr).length
      const quotationsCreated = quotations.filter(q => q.created_at >= fromStr).length
      const paidInvoices = invoices.filter(i => i.status === "Paid" && i.issue_date >= fromStr.split("T")[0])
      const invoicesPaid = paidInvoices.length
      const revenuePaid = paidInvoices.reduce((sum, i) => sum + Number(i.grand_total), 0)
      const followUpsCompleted = followUps.filter(f => f.completed && f.completed_at && f.completed_at >= fromStr).length
      const followUpsPending = followUps.filter(f => !f.completed && f.scheduled_date >= fromStr.split("T")[0]).length
      return { newLeads, quotationsCreated, invoicesPaid, revenuePaid, followUpsCompleted, followUpsPending }
    }

    const wonLeads = leads.filter(l => l.status === "Won").length
    const totalRevenue = invoices.filter(i => i.status === "Paid").reduce((sum, i) => sum + Number(i.grand_total), 0)
    const pendingRevenue = invoices
      .filter(i => i.status !== "Paid")
      .reduce((sum, i) => sum + (Number(i.grand_total) - Number(i.paid_amount)), 0)
    const overdueCount = invoices.filter(i => i.status === "Overdue").length
    const unpaidCount = invoices.filter(i => ["Draft", "Sent", "Partial", "Overdue"].includes(i.status)).length

    const pipeline = [
      { label: "Baru", count: leads.filter(l => l.status === "New").length, color: "#CBD5E1" },
      { label: "Dihubungi", count: leads.filter(l => l.status === "Contacted").length, color: "#BFEAF3" },
      { label: "Penawaran", count: leads.filter(l => l.status === "Quoted").length, color: "#93C5FD" },
      { label: "Follow Up", count: leads.filter(l => l.status === "Follow Up").length, color: "#F6E57A" },
      { label: "Deals", count: wonLeads, color: "#DDEFCB" },
      { label: "Gagal", count: leads.filter(l => l.status === "Lost").length, color: "#FCA5A5" },
    ]

    const invoiceStatusMap = [
      { status: "Paid", label: "Lunas", color: "#DDEFCB" },
      { status: "Sent", label: "Terkirim", color: "#BFEAF3" },
      { status: "Partial", label: "Sebagian", color: "#FEF9C3" },
      { status: "Overdue", label: "Jatuh Tempo", color: "#FCA5A5" },
      { status: "Draft", label: "Draft", color: "#CBD5E1" },
    ]
    const invoiceBreakdown = invoiceStatusMap.map(({ status, label, color }) => {
      const group = invoices.filter(i => i.status === status)
      return {
        status,
        label,
        count: group.length,
        amount: group.reduce((sum, i) => sum + Number(i.grand_total), 0),
        color,
      }
    })

    const projectTypeCounts: Record<string, number> = {}
    leads.forEach(l => {
      const t = l.project_type ?? "Lainnya"
      projectTypeCounts[t] = (projectTypeCounts[t] ?? 0) + 1
    })
    const topProjectTypes = Object.entries(projectTypeCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([type, count]) => ({ type, count }))

    return {
      weekly: periodStats(weekAgoStr),
      monthly: periodStats(monthStartStr),
      allTime: {
        totalRevenue,
        totalLeads: leads.length,
        wonLeads,
        conversionRate: leads.length > 0 ? Math.round((wonLeads / leads.length) * 100) : 0,
        totalQuotations: quotations.length,
        pendingRevenue,
        overdueCount,
        unpaidCount,
      },
      pipeline,
      invoiceBreakdown,
      topProjectTypes,
    }
  } catch (error) {
    console.error("Error fetching report data:", error)
    const empty: PeriodStats = { newLeads: 0, quotationsCreated: 0, invoicesPaid: 0, revenuePaid: 0, followUpsCompleted: 0, followUpsPending: 0 }
    return {
      weekly: empty,
      monthly: empty,
      allTime: { totalRevenue: 0, totalLeads: 0, wonLeads: 0, conversionRate: 0, totalQuotations: 0, pendingRevenue: 0, overdueCount: 0, unpaidCount: 0 },
      pipeline: [],
      invoiceBreakdown: [],
      topProjectTypes: [],
    }
  }
}
