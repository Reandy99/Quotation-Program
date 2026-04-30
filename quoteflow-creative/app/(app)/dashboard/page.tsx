import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LeadStatusBadge, QuoteStatusBadge } from "@/components/leads/StatusBadge"
import { PageHeader } from "@/components/shared/PageHeader"
import { formatCurrency, formatDateShort } from "@/lib/utils/format"
import type { LeadStatus, QuotationStatus } from "@/types"
import { Users, FileText, DollarSign, Trophy, Bell, ArrowRight, Plus, TrendingUp, Calendar, AlertCircle, BarChart3, Clock, MapPin } from "lucide-react"
import Link from "next/link"
import { demoLeads, demoQuotations, demoInvoices } from "@/lib/demo/data"

const recentLeads: Array<{ id: string; client_name: string; project_type: string; status: LeadStatus; created_at: string }> = [
  { id: "1", client_name: "Budi Santoso", project_type: "Wedding Photography", status: "New", created_at: "2026-04-28T10:00:00Z" },
  { id: "2", client_name: "Sari Dewi", project_type: "Corporate Event", status: "Quoted", created_at: "2026-04-27T09:00:00Z" },
  { id: "3", client_name: "Andi Wijaya", project_type: "Product Photography", status: "Won", created_at: "2026-04-25T14:00:00Z" },
  { id: "4", client_name: "Rina Kusuma", project_type: "Prewedding", status: "Follow Up", created_at: "2026-04-24T11:00:00Z" },
  { id: "5", client_name: "Doni Pratama", project_type: "Birthday Party", status: "Lost", created_at: "2026-04-22T08:00:00Z" },
]

const recentQuotations: Array<{ id: string; project_title: string; quote_number: string; grand_total: number; status: QuotationStatus; created_at: string }> = [
  { id: "1", project_title: "Budi & Sinta Wedding", quote_number: "QF-2026-001", grand_total: 15000000, status: "Sent", created_at: "2026-04-28T10:00:00Z" },
  { id: "2", project_title: "PT Maju Bersama Annual Event", quote_number: "QF-2026-002", grand_total: 8500000, status: "Accepted", created_at: "2026-04-27T09:00:00Z" },
  { id: "3", project_title: "Andi Product Shoot", quote_number: "QF-2026-003", grand_total: 3200000, status: "Draft", created_at: "2026-04-25T14:00:00Z" },
]

// Calculate stats from demo data
const totalUnpaidInvoices = demoInvoices
  .filter(i => i.status !== "Paid")
  .reduce((sum, i) => sum + (i.grand_total - i.paid_amount), 0)

const overdueInvoices = demoInvoices.filter(i => i.status === "Overdue")

const today = new Date()
const nextWeek = new Date(today)
nextWeek.setDate(today.getDate() + 7)
const shootsThisWeek = [...demoLeads, ...demoQuotations].filter(item => {
  if (!item.event_date) return false
  const eventDate = new Date(item.event_date)
  return eventDate >= today && eventDate <= nextWeek
}).length

const wonLeads = demoLeads.filter(l => l.status === "Won").length
const totalLeads = demoLeads.length
const conversionRate = totalLeads > 0 ? Math.round((wonLeads / totalLeads) * 100) : 0

const stats = [
  { label: "Total Leads", value: "24", icon: Users, gradient: "from-indigo-500/20 to-purple-500/20", iconBg: "bg-indigo-500/10", iconColor: "text-indigo-400" },
  { label: "Quotations", value: "18", icon: FileText, gradient: "from-blue-500/20 to-indigo-500/20", iconBg: "bg-blue-500/10", iconColor: "text-blue-400" },
  { label: "Pipeline Value", value: formatCurrency(87500000), icon: DollarSign, gradient: "from-emerald-500/20 to-teal-500/20", iconBg: "bg-emerald-500/10", iconColor: "text-emerald-400" },
  { label: "Won Deals", value: "9", icon: Trophy, gradient: "from-amber-500/20 to-orange-500/20", iconBg: "bg-amber-500/10", iconColor: "text-amber-400" },
  { label: "Follow-ups Due", value: "3", icon: Bell, gradient: "from-rose-500/20 to-pink-500/20", iconBg: "bg-rose-500/10", iconColor: "text-rose-400" },
  { label: "Unpaid Invoices", value: formatCurrency(totalUnpaidInvoices), icon: AlertCircle, gradient: "from-red-500/20 to-rose-500/20", iconBg: "bg-red-500/10", iconColor: "text-red-400" },
  { label: "Shoots This Week", value: shootsThisWeek.toString(), icon: Calendar, gradient: "from-cyan-500/20 to-blue-500/20", iconBg: "bg-cyan-500/10", iconColor: "text-cyan-400" },
  { label: "Conversion Rate", value: `${conversionRate}%`, icon: TrendingUp, gradient: "from-purple-500/20 to-fuchsia-500/20", iconBg: "bg-purple-500/10", iconColor: "text-purple-400" },
  { label: "Overdue Invoices", value: overdueInvoices.length.toString(), icon: AlertCircle, gradient: "from-orange-500/20 to-amber-500/20", iconBg: "bg-orange-500/10", iconColor: "text-orange-400" },
]

// Pipeline funnel data
const pipelineStages = [
  { stage: "New", count: demoLeads.filter(l => l.status === "New").length, color: "bg-gray-400" },
  { stage: "Contacted", count: demoLeads.filter(l => l.status === "Contacted").length, color: "bg-blue-400" },
  { stage: "Quoted", count: demoLeads.filter(l => l.status === "Quoted").length, color: "bg-indigo-400" },
  { stage: "Follow Up", count: demoLeads.filter(l => l.status === "Follow Up").length, color: "bg-purple-400" },
  { stage: "Won", count: demoLeads.filter(l => l.status === "Won").length, color: "bg-green-400" },
]

// Today's agenda
const todayStr = today.toISOString().split("T")[0]
const followUpsDueToday = demoLeads.filter(l => l.follow_up_date === todayStr)
const shootsToday = [...demoLeads, ...demoQuotations].filter(item => item.event_date === todayStr)
const invoicesDueToday = demoInvoices.filter(i => i.due_date === todayStr || i.status === "Overdue")

export default async function DashboardPage() {
  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Welcome back. Here's your business overview."
      />

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3 mb-8">
        <Link href="/leads/new">
          <Button size="sm" className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white border-0 shadow-lg shadow-indigo-500/20 transition-all hover:shadow-xl hover:shadow-indigo-500/30 hover:-translate-y-0.5">
            <Plus className="w-4 h-4 mr-1.5" />New Lead
          </Button>
        </Link>
        <Link href="/quotations/templates">
          <Button size="sm" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0 shadow-lg shadow-blue-500/20 transition-all hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5">
            <Plus className="w-4 h-4 mr-1.5" />New Quotation
          </Button>
        </Link>
        <Link href="/invoices">
          <Button size="sm" className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white border-0 shadow-lg shadow-emerald-500/20 transition-all hover:shadow-xl hover:shadow-emerald-500/30 hover:-translate-y-0.5">
            <Plus className="w-4 h-4 mr-1.5" />New Invoice
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, gradient, iconBg, iconColor }) => (
          <div 
            key={label} 
            className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${gradient} backdrop-blur-xl border border-white/10 p-5 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-indigo-500/10 cursor-pointer`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl" />
            <div className="relative z-10">
              <div className={`w-12 h-12 rounded-xl ${iconBg} backdrop-blur-sm flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                <Icon className={`w-6 h-6 ${iconColor}`} />
              </div>
              <div className="text-3xl font-bold text-white mb-1.5 tabular-nums tracking-tight">{value}</div>
              <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Today's Agenda */}
      {(followUpsDueToday.length > 0 || shootsToday.length > 0 || invoicesDueToday.length > 0) && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl border border-white/10 mb-8 shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10" />
          <div className="relative z-10 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 backdrop-blur-sm flex items-center justify-center">
                <Calendar className="w-5 h-5 text-indigo-400" />
              </div>
              <h2 className="text-lg font-semibold text-white">Today's Agenda</h2>
            </div>
            <div className="space-y-3">
              {followUpsDueToday.map(lead => (
                <div key={lead.id} className="group relative overflow-hidden rounded-xl bg-blue-500/10 backdrop-blur-sm border border-blue-500/20 p-4 transition-all hover:bg-blue-500/20 hover:border-blue-500/30">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-400 to-blue-600" />
                  <div className="flex items-center justify-between pl-3">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Clock className="w-4 h-4 text-blue-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-white mb-1">Follow-up: {lead.client_name}</p>
                        <p className="text-xs text-slate-400">{lead.project_type}</p>
                      </div>
                    </div>
                    <Link href={`/leads/${lead.id}`}>
                      <Button size="sm" variant="outline" className="border-blue-500/30 text-blue-400 hover:bg-blue-500/20 hover:border-blue-500/50 transition-all">View</Button>
                    </Link>
                  </div>
                </div>
              ))}
              {shootsToday.map((item: any) => (
                <div key={item.id} className="group relative overflow-hidden rounded-xl bg-emerald-500/10 backdrop-blur-sm border border-emerald-500/20 p-4 transition-all hover:bg-emerald-500/20 hover:border-emerald-500/30">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-emerald-400 to-emerald-600" />
                  <div className="flex items-start gap-3 pl-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <MapPin className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-white mb-1">Shoot Today: {item.client_name || item.project_title}</p>
                      <p className="text-xs text-slate-400">{item.project_type || item.location}</p>
                    </div>
                  </div>
                </div>
              ))}
              {invoicesDueToday.map(invoice => (
                <div key={invoice.id} className="group relative overflow-hidden rounded-xl bg-orange-500/10 backdrop-blur-sm border border-orange-500/20 p-4 transition-all hover:bg-orange-500/20 hover:border-orange-500/30">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-orange-400 to-orange-600" />
                  <div className="flex items-center justify-between pl-3">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <AlertCircle className="w-4 h-4 text-orange-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-white mb-1">Invoice Due: {invoice.client_name}</p>
                        <p className="text-xs text-slate-400">{formatCurrency(invoice.grand_total - invoice.paid_amount)} outstanding</p>
                      </div>
                    </div>
                    <Link href={`/invoices/${invoice.id}`}>
                      <Button size="sm" variant="outline" className="border-orange-500/30 text-orange-400 hover:bg-orange-500/20 hover:border-orange-500/50 transition-all">View</Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Pipeline Funnel */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl border border-white/10 mb-8 shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10" />
        <div className="relative z-10 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 backdrop-blur-sm flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-purple-400" />
            </div>
            <h2 className="text-lg font-semibold text-white">Sales Pipeline</h2>
          </div>
          <div className="space-y-4">
            {pipelineStages.map((stage, idx) => {
              const maxCount = Math.max(...pipelineStages.map(s => s.count))
              const widthPercent = maxCount > 0 ? (stage.count / maxCount) * 100 : 0
              const nextStage = pipelineStages[idx + 1]
              const conversionPercent = nextStage && stage.count > 0 
                ? Math.round((nextStage.count / stage.count) * 100) 
                : null
              
              return (
                <div key={stage.stage}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-white">{stage.stage}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-slate-400 tabular-nums">{stage.count} leads</span>
                      {conversionPercent !== null && (
                        <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full">
                          {conversionPercent}% →
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="relative w-full bg-slate-800/50 rounded-full h-3 overflow-hidden backdrop-blur-sm border border-white/5">
                    <div 
                      className={`absolute inset-y-0 left-0 ${stage.color} rounded-full transition-all duration-500 ease-out shadow-lg`}
                      style={{ width: `${widthPercent}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl border border-white/10 shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5" />
          <div className="relative z-10 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white">Recent Leads</h2>
              <Link href="/leads" className="flex items-center gap-1.5 text-xs text-indigo-400 font-medium hover:text-indigo-300 transition-colors group">
                View all <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
            {!recentLeads.length ? (
              <p className="text-sm text-slate-500 text-center py-8">No leads yet</p>
            ) : (
              <div className="space-y-2">
                {recentLeads.map(lead => (
                  <Link
                    key={lead.id}
                    href={`/leads/${lead.id}`}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-all group border border-transparent hover:border-white/10"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-white truncate group-hover:text-indigo-400 transition-colors">{lead.client_name}</p>
                      <p className="text-xs text-slate-400 mt-1">{lead.project_type || "—"} · {formatDateShort(lead.created_at)}</p>
                    </div>
                    <LeadStatusBadge status={lead.status} />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl border border-white/10 shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5" />
          <div className="relative z-10 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white">Recent Quotations</h2>
              <Link href="/quotations" className="flex items-center gap-1.5 text-xs text-indigo-400 font-medium hover:text-indigo-300 transition-colors group">
                View all <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
            {!recentQuotations.length ? (
              <p className="text-sm text-slate-500 text-center py-8">No quotations yet</p>
            ) : (
              <div className="space-y-2">
                {recentQuotations.map(q => (
                  <Link
                    key={q.id}
                    href={`/quotations/${q.id}`}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-all group border border-transparent hover:border-white/10"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-white truncate group-hover:text-indigo-400 transition-colors">{q.project_title}</p>
                      <p className="text-xs text-slate-400 mt-1">
                        <span className="font-mono">{q.quote_number}</span> · {formatCurrency(q.grand_total)}
                      </p>
                    </div>
                    <QuoteStatusBadge status={q.status} />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
