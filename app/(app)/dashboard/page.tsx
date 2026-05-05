import { LeadStatusBadge, QuoteStatusBadge } from "@/components/leads/StatusBadge"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatDateShort } from "@/lib/utils/format"
import { Users, FileText, DollarSign, Trophy, Bell, ArrowRight, Plus, TrendingUp, Calendar, AlertCircle, BarChart3, Clock, MapPin } from "lucide-react"
import Link from "next/link"
import DashboardHeader from "./DashboardHeader"
import { getDashboardStats, getRecentActivity } from "./actions"
import { getLeads } from "../leads/actions"
import { getInvoices } from "../invoices/actions"
import { getGeneralSettings } from "../settings/actions"
import { getFollowUps } from "../follow-ups/actions"
import type { FollowUp, Invoice, Lead, Quotation } from "@/types"

const INVOICE_STATUS_CLASSES: Record<Invoice["status"], string> = {
  Draft: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  Sent: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  Partial: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
  Paid: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  Overdue: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
}

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const [stats, { recentLeads, recentQuotations, recentInvoices }, allLeads, allInvoices, generalSettings, followUps] = await Promise.all([
    getDashboardStats(),
    getRecentActivity(),
    getLeads(),
    getInvoices(),
    getGeneralSettings(),
    getFollowUps(),
  ])

  const today = new Date()
  const nextWeek = new Date(today)
  nextWeek.setDate(today.getDate() + 7)
  const todayStr = today.toISOString().split("T")[0]

  const shootsThisWeek = allLeads.filter(lead => {
    if (!lead.event_date) return false
    const eventDate = new Date(lead.event_date)
    return eventDate >= today && eventDate <= nextWeek
  }).length

  const wonLeads = allLeads.filter(l => l.status === "Won").length
  const conversionRate = stats.totalLeads > 0 ? Math.round((wonLeads / stats.totalLeads) * 100) : 0

  const overdueInvoices = allInvoices.filter(i => i.status === "Overdue")

  const pipelineStages = [
    { stage: "New", count: allLeads.filter(l => l.status === "New").length, color: "#CBD5E1" },
    { stage: "Contacted", count: allLeads.filter(l => l.status === "Contacted").length, color: "#BFEAF3" },
    { stage: "Quoted", count: allLeads.filter(l => l.status === "Quoted").length, color: "#93C5FD" },
    { stage: "Follow Up", count: allLeads.filter(l => l.status === "Follow Up").length, color: "#F6E57A" },
    { stage: "Deals", count: allLeads.filter(l => l.status === "Won").length, color: "#DDEFCB" },
  ]

  const followUpsDueToday = followUps.filter((followUp) => followUp.scheduled_date === todayStr && followUp.lead)
  const shootsToday = allLeads.filter(lead => lead.event_date === todayStr)
  const invoicesDueToday = allInvoices.filter(i => i.due_date === todayStr || i.status === "Overdue")

  const heroStats = [
    {
      label: "Pipeline Value",
      value: formatCurrency(stats.pipelineValue),
      sub: "Active opportunities",
      icon: DollarSign,
      bg: "#BFEAF3",
      iconColor: "#0E4F63",
    },
    {
      label: "Deals",
      value: wonLeads.toString(),
      sub: `${conversionRate}% conversion rate`,
      icon: Trophy,
      bg: "#DDEFCB",
      iconColor: "#2D5016",
    },
    {
      label: "Unpaid Invoices",
      value: formatCurrency(stats.pendingRevenue),
      sub: `${overdueInvoices.length} overdue`,
      icon: AlertCircle,
      bg: "#FEF9C3",
      iconColor: "#713F12",
    },
  ]

  const metricStats = [
    { label: "Total Leads", value: stats.totalLeads.toString(), icon: Users },
    { label: "Quotations", value: stats.totalQuotations.toString(), icon: FileText },
    { label: "Follow-ups Due", value: followUpsDueToday.length.toString(), icon: Bell },
    { label: "Shoots This Week", value: shootsThisWeek.toString(), icon: Calendar },
    { label: "Conversion Rate", value: `${conversionRate}%`, icon: TrendingUp },
    { label: "Overdue", value: overdueInvoices.length.toString(), icon: AlertCircle },
  ]

  return (
    <div>
      <DashboardHeader initialWorkspaceName={generalSettings.workspace_name} />

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3 mb-8">
        <Link href="/leads/new">
          <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium text-white dark:text-black transition-opacity hover:opacity-80" style={{ backgroundColor: "var(--btn-dark)" }}>
            <Plus className="w-4 h-4" />New Lead
          </button>
        </Link>
        <Link href="/quotations/templates">
          <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-opacity hover:opacity-80 bg-[#BFEAF3] text-[#0E4F63] dark:bg-[#164E63] dark:text-[#7DD3FC]">
            <Plus className="w-4 h-4" />New Quotation
          </button>
        </Link>
        <Link href="/invoices/new">
          <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-opacity hover:opacity-80 bg-[#DDEFCB] text-[#2D5016] dark:bg-[#365314] dark:text-[#86EFAC]">
            <Plus className="w-4 h-4" />New Invoice
          </button>
        </Link>
      </div>

      {/* Today's Agenda */}
      {(followUpsDueToday.length > 0 || shootsToday.length > 0 || invoicesDueToday.length > 0) && (
        <div
          className="rounded-[28px] p-6 mb-6"
          style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--border-color)" }}
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#BFEAF3" }}>
              <Calendar className="w-4 h-4" style={{ color: "#0E4F63" }} />
            </div>
            <h2 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>Today&apos;s Agenda</h2>
          </div>
          <div className="space-y-2">
            {followUpsDueToday.map((followUp: FollowUp) => (
              <div key={followUp.id} className="flex items-center justify-between rounded-2xl px-4 py-3" style={{ backgroundColor: "var(--app-bg)", border: "1px solid var(--border-color)" }}>
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <Clock className="w-4 h-4 flex-shrink-0" style={{ color: "#0E4F63" }} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>Follow-up: {followUp.lead?.client_name}</p>
                    <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{followUp.lead?.project_type}</p>
                  </div>
                </div>
                <Link href={`/leads/${followUp.lead?.id}`}>
                  <button className="text-xs font-medium px-3 py-1.5 rounded-full transition-opacity hover:opacity-70 bg-[#BFEAF3] text-[#0E4F63] dark:bg-[#164E63] dark:text-[#7DD3FC]">View</button>
                </Link>
              </div>
            ))}
            {shootsToday.map((item: any) => (
              <div key={item.id} className="flex items-center gap-3 rounded-2xl px-4 py-3" style={{ backgroundColor: "var(--app-bg)", border: "1px solid var(--border-color)" }}>
                <MapPin className="w-4 h-4 flex-shrink-0" style={{ color: "#2D5016" }} />
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>Shoot Today: {item.client_name || item.project_title}</p>
                  <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{item.project_type || item.location}</p>
                </div>
              </div>
            ))}
            {invoicesDueToday.map(invoice => (
              <div key={invoice.id} className="flex items-center justify-between rounded-2xl px-4 py-3" style={{ backgroundColor: "var(--app-bg)", border: "1px solid var(--border-color)" }}>
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" style={{ color: "#713F12" }} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>Invoice Due: {invoice.client_name}</p>
                    <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{formatCurrency(invoice.grand_total - invoice.paid_amount)} outstanding</p>
                  </div>
                </div>
                <Link href={`/invoices/${invoice.id}`}>
                  <button className="text-xs font-medium px-3 py-1.5 rounded-full transition-opacity hover:opacity-70 bg-[#FEF9C3] text-[#713F12] dark:bg-[#422006] dark:text-[#FDE68A]">View</button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hero stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
        {heroStats.map(({ label, value, sub, icon: Icon, bg, iconColor }) => (
          <div
            key={label}
            className="rounded-[28px] p-6 flex flex-col gap-4"
            style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--border-color)" }}
          >
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ backgroundColor: bg }}>
              <Icon className="w-5 h-5" style={{ color: iconColor }} />
            </div>
            <div>
              <div className="text-2xl font-semibold tracking-tight tabular-nums" style={{ color: "var(--text-primary)" }}>{value}</div>
              <div className="text-sm font-medium mt-0.5" style={{ color: "var(--text-primary)" }}>{label}</div>
              <div className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>{sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {metricStats.map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="rounded-[20px] p-4 flex flex-col gap-3"
            style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--border-color)" }}
          >
            <Icon className="w-4 h-4" style={{ color: "var(--text-secondary)" }} />
            <div>
              <div className="text-xl font-semibold tabular-nums" style={{ color: "var(--text-primary)" }}>{value}</div>
              <div className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Pipeline + Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-5">
        {/* Pipeline Funnel */}
        <div
          className="rounded-[28px] p-6"
          style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--border-color)" }}
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#DDEFCB" }}>
              <BarChart3 className="w-4 h-4" style={{ color: "#2D5016" }} />
            </div>
            <h2 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>Sales Pipeline</h2>
          </div>
          <div className="space-y-4">
            {pipelineStages.map((stage, idx) => {
              const totalCount = pipelineStages.reduce((sum, s) => sum + s.count, 0)
              const maxCount = Math.max(...pipelineStages.map(s => s.count), 1)
              const widthPercent = totalCount === 0 ? 0 : (stage.count / maxCount) * 100
              const nextStage = pipelineStages[idx + 1]
              const conversionPercent = nextStage && stage.count > 0
                ? Math.round((nextStage.count / stage.count) * 100)
                : null
              return (
                <div key={stage.stage}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{stage.stage}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs tabular-nums" style={{ color: "var(--text-secondary)" }}>{stage.count}</span>
                      {conversionPercent !== null && (
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-[#DDEFCB] text-[#2D5016] dark:bg-[#365314] dark:text-[#86EFAC]">
                          {conversionPercent}%→
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: "var(--border-color)" }}>
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${widthPercent}%`, backgroundColor: stage.color }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Recent Leads */}
        <div
          className="rounded-[28px] p-6"
          style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--border-color)" }}
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>Recent Leads</h2>
            <Link href="/leads" className="flex items-center gap-1 text-xs font-medium transition-opacity hover:opacity-70" style={{ color: "var(--text-secondary)" }}>
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {!recentLeads.length ? (
            <p className="text-sm text-center py-8" style={{ color: "var(--text-secondary)" }}>No leads yet</p>
          ) : (
            <div className="space-y-1">
              {recentLeads.map((lead: Lead) => (
                <Link
                  key={lead.id}
                  href={`/leads/${lead.id}`}
                  className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-3 py-3 rounded-2xl transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>{lead.client_name}</p>
                    <p className="text-xs mt-0.5 leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                      {[lead.project_type || "—", formatDateShort(lead.created_at)].join(" · ")}
                    </p>
                  </div>
                  <div className="justify-self-end">
                    <LeadStatusBadge status={lead.status} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Quotations */}
        <div
          className="rounded-[28px] p-6"
          style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--border-color)" }}
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>Recent Quotations</h2>
            <Link href="/quotations" className="flex items-center gap-1 text-xs font-medium transition-opacity hover:opacity-70" style={{ color: "var(--text-secondary)" }}>
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {!recentQuotations.length ? (
            <p className="text-sm text-center py-8" style={{ color: "var(--text-secondary)" }}>No quotations yet</p>
          ) : (
            <div className="space-y-1">
              {recentQuotations.map((q: Quotation) => (
                <Link
                  key={q.id}
                  href={`/quotations/${q.id}`}
                  className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-3 py-3 rounded-2xl transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>{q.project_title}</p>
                    <p className="text-xs mt-0.5 leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                      <span className="font-mono">{q.quote_number}</span> · {formatCurrency(q.grand_total)}
                    </p>
                  </div>
                  <div className="justify-self-end">
                    <QuoteStatusBadge status={q.status} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Invoices */}
        <div
          className="rounded-[28px] p-6"
          style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--border-color)" }}
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>Recent Invoices</h2>
            <Link href="/invoices" className="flex items-center gap-1 text-xs font-medium transition-opacity hover:opacity-70" style={{ color: "var(--text-secondary)" }}>
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {!recentInvoices.length ? (
            <p className="text-sm text-center py-8" style={{ color: "var(--text-secondary)" }}>No invoices yet</p>
          ) : (
            <div className="space-y-1">
              {recentInvoices.map((invoice: Invoice) => (
                <Link
                  key={invoice.id}
                  href={`/invoices/${invoice.id}`}
                  className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-3 py-3 rounded-2xl transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>{invoice.project_title}</p>
                    <p className="text-xs mt-0.5 leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                      <span className="font-mono">{invoice.invoice_number}</span> · {formatCurrency(invoice.grand_total)}
                    </p>
                  </div>
                  <div className="justify-self-end">
                    <Badge className={INVOICE_STATUS_CLASSES[invoice.status]}>{invoice.status}</Badge>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
