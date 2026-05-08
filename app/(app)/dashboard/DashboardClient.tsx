"use client"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { LeadStatusBadge, QuoteStatusBadge } from "@/components/leads/StatusBadge"
import { formatCurrency, formatDateShort } from "@/lib/utils/format"
import { useLanguage } from "@/hooks/useLanguage"
import DashboardHeader from "./DashboardHeader"
import { Users, FileText, DollarSign, Trophy, Bell, ArrowRight, Plus, TrendingUp, Calendar, AlertCircle, BarChart3, Clock, MapPin, MessageCircle } from "lucide-react"
import { buildWhatsAppUrl, buildSessionReminderMessage, buildInvoiceReminderMessage } from "@/lib/utils/whatsapp"
import type { SessionReminder, InvoiceReminder } from "./actions"
import type { FollowUp, Invoice, Lead, Quotation } from "@/types"

const COPY = {
  id: {
    invoiceStatusLabels: {
      Draft: "Draft",
      Sent: "Terkirim",
      Partial: "Sebagian",
      Paid: "Lunas",
      Overdue: "Jatuh Tempo",
    },
    pipelineStages: {
      New: "Baru",
      Contacted: "Dihubungi",
      Quoted: "Penawaran",
      "Follow Up": "Follow Up",
      Won: "Deals",
    },
    quickActions: {
      newLead: "Lead Baru",
      newQuotation: "Penawaran Baru",
      newInvoice: "Invoice Baru",
      followUps: "Follow-up",
      calendar: "Kalender",
      reports: "Laporan",
    },
    sections: {
      agenda: "Agenda Hari Ini",
      pipelineValue: "Nilai Pipeline",
      wonDeals: "Deals Menang",
      unpaidInvoices: "Invoice Belum Lunas",
      totalLeads: "Total Leads",
      quotations: "Penawaran",
      followUpsToday: "Follow-up Hari Ini",
      shootsThisWeek: "Sesi Minggu Ini",
      conversionRate: "Tingkat Konversi",
      overdue: "Jatuh Tempo",
      statusUpdate: "Status Update",
      recentLeads: "Lead Terbaru",
      recentQuotations: "Penawaran Terbaru",
      recentInvoices: "Invoice Terbaru",
      viewAll: "Lihat semua",
      noLeads: "Belum ada lead",
      noQuotations: "Belum ada penawaran",
      noInvoices: "Belum ada invoice",
      noWaNumber: "Nomor WA tidak ada",
      view: "Lihat",
      sendWaReminder: "Kirim Reminder WA",
    },
    subs: {
      activeOpportunities: "Peluang aktif",
      conversionRate: (value: number) => `${value}% tingkat konversi`,
      overdueCount: (value: number) => `${value} jatuh tempo`,
      unpaidAmount: (value: string) => `${value} belum dibayar`,
      sessionTomorrow: "Foto/Video",
      sendConfirmation: "Kirim konfirmasi",
      dueInTwoDays: "Jatuh tempo lusa",
    },
    agenda: {
      followUp: "Follow-up",
      sessionToday: "Sesi Hari Ini",
      invoiceDue: "Invoice Jatuh Tempo",
      sessionTomorrow: "Sesi Besok",
      invoiceInTwoDays: "Invoice Lusa",
    },
    emptyState: {
      unknownProject: "Foto/Video",
      none: "—",
    },
  },
  en: {
    invoiceStatusLabels: {
      Draft: "Draft",
      Sent: "Sent",
      Partial: "Partial",
      Paid: "Paid",
      Overdue: "Overdue",
    },
    pipelineStages: {
      New: "New",
      Contacted: "Contacted",
      Quoted: "Quoted",
      "Follow Up": "Follow Up",
      Won: "Won",
    },
    quickActions: {
      newLead: "New Lead",
      newQuotation: "New Quotation",
      newInvoice: "New Invoice",
      followUps: "Follow-ups",
      calendar: "Calendar",
      reports: "Reports",
    },
    sections: {
      agenda: "Today's Agenda",
      pipelineValue: "Pipeline Value",
      wonDeals: "Won Deals",
      unpaidInvoices: "Unpaid Invoices",
      totalLeads: "Total Leads",
      quotations: "Quotations",
      followUpsToday: "Follow-ups Today",
      shootsThisWeek: "Shoots This Week",
      conversionRate: "Conversion Rate",
      overdue: "Overdue",
      statusUpdate: "Pipeline Status",
      recentLeads: "Recent Leads",
      recentQuotations: "Recent Quotations",
      recentInvoices: "Recent Invoices",
      viewAll: "View all",
      noLeads: "No leads yet",
      noQuotations: "No quotations yet",
      noInvoices: "No invoices yet",
      noWaNumber: "No WhatsApp number",
      view: "View",
      sendWaReminder: "Send WA Reminder",
    },
    subs: {
      activeOpportunities: "Active opportunities",
      conversionRate: (value: number) => `${value}% conversion rate`,
      overdueCount: (value: number) => `${value} overdue`,
      unpaidAmount: (value: string) => `${value} unpaid`,
      sessionTomorrow: "Photo/Video",
      sendConfirmation: "Send confirmation",
      dueInTwoDays: "Due in two days",
    },
    agenda: {
      followUp: "Follow-up",
      sessionToday: "Today's Session",
      invoiceDue: "Invoice Due",
      sessionTomorrow: "Tomorrow's Session",
      invoiceInTwoDays: "Invoice in Two Days",
    },
    emptyState: {
      unknownProject: "Photo/Video",
      none: "—",
    },
  },
} as const

const INVOICE_STATUS_CLASSES: Record<Invoice["status"], string> = {
  Draft: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  Sent: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  Partial: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
  Paid: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  Overdue: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
}

interface Props {
  workspaceName: string
  businessName: string
  stats: {
    totalLeads: number
    activeLeads: number
    totalQuotations: number
    pendingRevenue: number
    pipelineValue: number
  }
  recentLeads: Lead[]
  recentQuotations: Quotation[]
  recentInvoices: Invoice[]
  allLeads: Lead[]
  allInvoices: Invoice[]
  followUps: FollowUp[]
  waReminders: {
    sessionReminders: SessionReminder[]
    invoiceReminders: InvoiceReminder[]
  }
}

export default function DashboardClient({
  workspaceName,
  businessName,
  stats,
  recentLeads,
  recentQuotations,
  recentInvoices,
  allLeads,
  allInvoices,
  followUps,
  waReminders,
}: Props) {
  const [lang] = useLanguage()
  const tx = COPY[lang]

  const today = new Date()
  const nextWeek = new Date(today)
  nextWeek.setDate(today.getDate() + 7)
  const todayStr = today.toISOString().split("T")[0]

  const shootsThisWeek = allLeads.filter((lead) => {
    if (!lead.event_date) return false
    const eventDate = new Date(lead.event_date)
    return eventDate >= today && eventDate <= nextWeek
  }).length

  const wonLeads = allLeads.filter((l) => l.status === "Won").length
  const conversionRate = stats.totalLeads > 0 ? Math.round((wonLeads / stats.totalLeads) * 100) : 0
  const overdueInvoices = allInvoices.filter((i) => i.status === "Overdue")

  const pipelineStages = [
    { stage: tx.pipelineStages.New, count: allLeads.filter((l) => l.status === "New").length, color: "#CBD5E1" },
    { stage: tx.pipelineStages.Contacted, count: allLeads.filter((l) => l.status === "Contacted").length, color: "#BFEAF3" },
    { stage: tx.pipelineStages.Quoted, count: allLeads.filter((l) => l.status === "Quoted").length, color: "#93C5FD" },
    { stage: tx.pipelineStages["Follow Up"], count: allLeads.filter((l) => l.status === "Follow Up").length, color: "#F6E57A" },
    { stage: tx.pipelineStages.Won, count: wonLeads, color: "#DDEFCB" },
  ]

  const followUpsDueToday = followUps.filter((followUp) => followUp.scheduled_date === todayStr && followUp.lead)
  const shootsToday = allLeads.filter((lead) => lead.event_date === todayStr)
  const invoicesDueToday = allInvoices.filter((i) => i.due_date === todayStr || i.status === "Overdue")

  const heroStats = [
    {
      label: tx.sections.pipelineValue,
      value: formatCurrency(stats.pipelineValue),
      sub: tx.subs.activeOpportunities,
      icon: DollarSign,
      bg: "#BFEAF3",
      iconColor: "#0E4F63",
    },
    {
      label: tx.sections.wonDeals,
      value: wonLeads.toString(),
      sub: tx.subs.conversionRate(conversionRate),
      icon: Trophy,
      bg: "#DDEFCB",
      iconColor: "#2D5016",
    },
    {
      label: tx.sections.unpaidInvoices,
      value: formatCurrency(stats.pendingRevenue),
      sub: tx.subs.overdueCount(overdueInvoices.length),
      icon: AlertCircle,
      bg: "#FEF9C3",
      iconColor: "#713F12",
    },
  ]

  const metricStats = [
    { label: tx.sections.totalLeads, value: stats.totalLeads.toString(), icon: Users },
    { label: tx.sections.quotations, value: stats.totalQuotations.toString(), icon: FileText },
    { label: tx.sections.followUpsToday, value: followUpsDueToday.length.toString(), icon: Bell },
    { label: tx.sections.shootsThisWeek, value: shootsThisWeek.toString(), icon: Calendar },
    { label: tx.sections.conversionRate, value: `${conversionRate}%`, icon: TrendingUp },
    { label: tx.sections.overdue, value: overdueInvoices.length.toString(), icon: AlertCircle },
  ]

  return (
    <div>
      <DashboardHeader initialWorkspaceName={workspaceName} />

      <div className="flex flex-wrap gap-3 mb-8">
        <Link href="/leads/new">
          <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium text-white dark:text-black transition-opacity hover:opacity-80" style={{ backgroundColor: "var(--btn-dark)" }}>
            <Plus className="w-4 h-4" />{tx.quickActions.newLead}
          </button>
        </Link>
        <Link href="/quotations/new">
          <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-opacity hover:opacity-80 bg-[#BFEAF3] text-[#0E4F63] dark:bg-[#164E63] dark:text-[#7DD3FC]">
            <Plus className="w-4 h-4" />{tx.quickActions.newQuotation}
          </button>
        </Link>
        <Link href="/invoices/new">
          <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-opacity hover:opacity-80 bg-[#DDEFCB] text-[#2D5016] dark:bg-[#365314] dark:text-[#86EFAC]">
            <Plus className="w-4 h-4" />{tx.quickActions.newInvoice}
          </button>
        </Link>
        <Link href="/follow-ups">
          <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-opacity hover:opacity-80 bg-[#FEF9C3] text-[#713F12] dark:bg-[#422006] dark:text-[#FDE68A]">
            <Bell className="w-4 h-4" />{tx.quickActions.followUps}
          </button>
        </Link>
        <Link href="/calendar">
          <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-opacity hover:opacity-80" style={{ backgroundColor: "var(--border-color)", color: "var(--text-primary)" }}>
            <Calendar className="w-4 h-4" />{tx.quickActions.calendar}
          </button>
        </Link>
        <Link href="/reports">
          <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-opacity hover:opacity-80" style={{ backgroundColor: "var(--border-color)", color: "var(--text-primary)" }}>
            <BarChart3 className="w-4 h-4" />{tx.quickActions.reports}
          </button>
        </Link>
      </div>

      {(followUpsDueToday.length > 0 || shootsToday.length > 0 || invoicesDueToday.length > 0 || waReminders.sessionReminders.length > 0 || waReminders.invoiceReminders.length > 0) && (
        <div className="rounded-[28px] p-4 sm:p-6 mb-6" style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--border-color)" }}>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#BFEAF3" }}>
              <Calendar className="w-4 h-4" style={{ color: "#0E4F63" }} />
            </div>
            <h2 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>{tx.sections.agenda}</h2>
          </div>
          <div className="space-y-2">
            {followUpsDueToday.map((followUp) => (
              <div key={followUp.id} className="flex flex-col items-stretch gap-3 rounded-2xl px-4 py-3 sm:flex-row sm:items-center sm:justify-between" style={{ backgroundColor: "var(--app-bg)", border: "1px solid var(--border-color)" }}>
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <Clock className="w-4 h-4 flex-shrink-0" style={{ color: "#0E4F63" }} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>{tx.agenda.followUp}: {followUp.lead?.client_name}</p>
                    <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{followUp.lead?.project_type}</p>
                  </div>
                </div>
                <Link href={`/leads/${followUp.lead?.id}`}>
                  <button className="w-full sm:w-auto text-xs font-medium px-3 py-1.5 rounded-full transition-opacity hover:opacity-70 bg-[#BFEAF3] text-[#0E4F63] dark:bg-[#164E63] dark:text-[#7DD3FC]">{tx.sections.view}</button>
                </Link>
              </div>
            ))}
            {shootsToday.map((item) => (
              <div key={item.id} className="flex items-center gap-3 rounded-2xl px-4 py-3" style={{ backgroundColor: "var(--app-bg)", border: "1px solid var(--border-color)" }}>
                <MapPin className="w-4 h-4 flex-shrink-0" style={{ color: "#2D5016" }} />
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>{tx.agenda.sessionToday}: {item.client_name}</p>
                  <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{item.project_type ?? item.location}</p>
                </div>
              </div>
            ))}
            {invoicesDueToday.map((invoice) => (
              <div key={invoice.id} className="flex flex-col items-stretch gap-3 rounded-2xl px-4 py-3 sm:flex-row sm:items-center sm:justify-between" style={{ backgroundColor: "var(--app-bg)", border: "1px solid var(--border-color)" }}>
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" style={{ color: "#713F12" }} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>{tx.agenda.invoiceDue}: {invoice.client_name}</p>
                    <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{tx.subs.unpaidAmount(formatCurrency(invoice.grand_total - invoice.paid_amount))}</p>
                  </div>
                </div>
                <Link href={`/invoices/${invoice.id}`}>
                  <button className="w-full sm:w-auto text-xs font-medium px-3 py-1.5 rounded-full transition-opacity hover:opacity-70 bg-[#FEF9C3] text-[#713F12] dark:bg-[#422006] dark:text-[#FDE68A]">{tx.sections.view}</button>
                </Link>
              </div>
            ))}
            {waReminders.sessionReminders.map((reminder) => {
              const waUrl = buildWhatsAppUrl(reminder.phone, buildSessionReminderMessage({
                clientName: reminder.clientName,
                projectType: reminder.projectType,
                eventDate: reminder.eventDate,
                businessName,
              }))

              return (
                <div key={`session-reminder-${reminder.id}`} className="flex flex-col items-stretch gap-3 rounded-2xl px-4 py-3 sm:flex-row sm:items-center sm:justify-between" style={{ backgroundColor: "#F0FDF4", border: "1px solid #BBF7D0" }}>
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <MessageCircle className="w-4 h-4 flex-shrink-0 text-green-600" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>{tx.agenda.sessionTomorrow}: {reminder.clientName}</p>
                      <p className="text-xs text-green-700">{reminder.projectType ?? tx.emptyState.unknownProject} · {tx.subs.sendConfirmation}</p>
                    </div>
                  </div>
                  {waUrl ? (
                    <a href={waUrl} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto text-center text-xs font-medium px-3 py-1.5 rounded-full whitespace-nowrap bg-green-500 text-white hover:bg-green-600 transition-colors">
                      {tx.sections.sendWaReminder}
                    </a>
                  ) : (
                    <span className="text-xs px-3 py-1.5 rounded-full bg-gray-100 text-gray-400">{tx.sections.noWaNumber}</span>
                  )}
                </div>
              )
            })}
            {waReminders.invoiceReminders.map((reminder) => {
              const waUrl = buildWhatsAppUrl(reminder.phone, buildInvoiceReminderMessage({
                clientName: reminder.clientName,
                invoiceNumber: reminder.invoiceNumber,
                grandTotal: reminder.grandTotal,
                dueDate: reminder.dueDate,
                businessName,
              }))

              return (
                <div key={`invoice-reminder-${reminder.id}`} className="flex flex-col items-stretch gap-3 rounded-2xl px-4 py-3 sm:flex-row sm:items-center sm:justify-between" style={{ backgroundColor: "#FFF7ED", border: "1px solid #FED7AA" }}>
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <MessageCircle className="w-4 h-4 flex-shrink-0 text-orange-500" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>{tx.agenda.invoiceInTwoDays}: {reminder.clientName}</p>
                      <p className="text-xs text-orange-700">{reminder.invoiceNumber} · {tx.subs.dueInTwoDays}</p>
                    </div>
                  </div>
                  {waUrl ? (
                    <a href={waUrl} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto text-center text-xs font-medium px-3 py-1.5 rounded-full whitespace-nowrap bg-orange-500 text-white hover:bg-orange-600 transition-colors">
                      {tx.sections.sendWaReminder}
                    </a>
                  ) : (
                    <span className="text-xs px-3 py-1.5 rounded-full bg-gray-100 text-gray-400">{tx.sections.noWaNumber}</span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
        {heroStats.map(({ label, value, sub, icon: Icon, bg, iconColor }) => (
          <div key={label} className="rounded-[28px] p-6 flex flex-col gap-4" style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--border-color)" }}>
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

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {metricStats.map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-[20px] p-4 flex flex-col gap-3" style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--border-color)" }}>
            <Icon className="w-4 h-4" style={{ color: "var(--text-secondary)" }} />
            <div>
              <div className="text-xl font-semibold tabular-nums" style={{ color: "var(--text-primary)" }}>{value}</div>
              <div className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-5">
        <div className="rounded-[28px] p-6" style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--border-color)" }}>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#DDEFCB" }}>
              <BarChart3 className="w-4 h-4" style={{ color: "#2D5016" }} />
            </div>
            <h2 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>{tx.sections.statusUpdate}</h2>
          </div>
          <div className="space-y-4">
            {pipelineStages.map((stage, idx) => {
              const maxCount = Math.max(...pipelineStages.map((s) => s.count), 1)
              const widthPercent = (stage.count / maxCount) * 100
              const nextStage = pipelineStages[idx + 1]
              const conversionPercent = nextStage && stage.count > 0 ? Math.round((nextStage.count / stage.count) * 100) : null

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
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${widthPercent}%`, backgroundColor: stage.color }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="rounded-[28px] p-6" style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--border-color)" }}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>{tx.sections.recentLeads}</h2>
            <Link href="/leads" className="flex items-center gap-1 text-xs font-medium transition-opacity hover:opacity-70" style={{ color: "var(--text-secondary)" }}>
              {tx.sections.viewAll} <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {!recentLeads.length ? (
            <p className="text-sm text-center py-8" style={{ color: "var(--text-secondary)" }}>{tx.sections.noLeads}</p>
          ) : (
            <div className="space-y-1">
              {recentLeads.map((lead) => (
                <Link key={lead.id} href={`/leads/${lead.id}`} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-3 py-3 rounded-2xl transition-colors hover:bg-black/5 dark:hover:bg-white/5">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>{lead.client_name}</p>
                    <p className="text-xs mt-0.5 leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                      {[lead.project_type ?? tx.emptyState.none, formatDateShort(lead.created_at)].join(" · ")}
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

        <div className="rounded-[28px] p-6" style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--border-color)" }}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>{tx.sections.recentQuotations}</h2>
            <Link href="/quotations" className="flex items-center gap-1 text-xs font-medium transition-opacity hover:opacity-70" style={{ color: "var(--text-secondary)" }}>
              {tx.sections.viewAll} <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {!recentQuotations.length ? (
            <p className="text-sm text-center py-8" style={{ color: "var(--text-secondary)" }}>{tx.sections.noQuotations}</p>
          ) : (
            <div className="space-y-1">
              {recentQuotations.map((q) => (
                <Link key={q.id} href={`/quotations/${q.id}`} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-3 py-3 rounded-2xl transition-colors hover:bg-black/5 dark:hover:bg-white/5">
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

        <div className="rounded-[28px] p-6" style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--border-color)" }}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>{tx.sections.recentInvoices}</h2>
            <Link href="/invoices" className="flex items-center gap-1 text-xs font-medium transition-opacity hover:opacity-70" style={{ color: "var(--text-secondary)" }}>
              {tx.sections.viewAll} <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {!recentInvoices.length ? (
            <p className="text-sm text-center py-8" style={{ color: "var(--text-secondary)" }}>{tx.sections.noInvoices}</p>
          ) : (
            <div className="space-y-1">
              {recentInvoices.map((invoice) => (
                <Link key={invoice.id} href={`/invoices/${invoice.id}`} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-3 py-3 rounded-2xl transition-colors hover:bg-black/5 dark:hover:bg-white/5">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>{invoice.project_title}</p>
                    <p className="text-xs mt-0.5 leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                      <span className="font-mono">{invoice.invoice_number}</span> · {formatCurrency(invoice.grand_total)}
                    </p>
                  </div>
                  <div className="justify-self-end">
                    <Badge className={INVOICE_STATUS_CLASSES[invoice.status]}>
                      {tx.invoiceStatusLabels[invoice.status]}
                    </Badge>
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
