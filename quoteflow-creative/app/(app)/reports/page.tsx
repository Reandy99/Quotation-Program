"use client"

import { useState, useMemo } from "react"
import { PageHeader } from "@/components/shared/PageHeader"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils/format"
import { demoLeads, demoQuotations, demoInvoices } from "@/lib/demo/data"
import { TrendingUp, DollarSign, Target, Award, Download } from "lucide-react"

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
]

function getMonthOptions() {
  const options = []
  for (let m = 0; m < 12; m++) {
    options.push({ label: `${MONTHS[m]} 2026`, value: `2026-${String(m + 1).padStart(2, "0")}` })
  }
  return options
}

function inRange(dateStr: string | null | undefined, from: string, to: string) {
  if (!dateStr) return false
  const d = dateStr.slice(0, 7) // "YYYY-MM"
  return d >= from && d <= to
}

export default function ReportsPage() {
  const monthOptions = getMonthOptions()
  const [fromMonth, setFromMonth] = useState("2026-01")
  const [toMonth, setToMonth] = useState("2026-04")

  const filteredLeads = useMemo(
    () => demoLeads.filter(l => inRange(l.created_at, fromMonth, toMonth)),
    [fromMonth, toMonth]
  )

  const filteredQuotations = useMemo(
    () => demoQuotations.filter(q => inRange(q.created_at, fromMonth, toMonth)),
    [fromMonth, toMonth]
  )

  const filteredInvoices = useMemo(
    () => demoInvoices.filter(inv => inRange(inv.issue_date, fromMonth, toMonth)),
    [fromMonth, toMonth]
  )

  const totalRevenue = filteredInvoices.reduce((sum, inv) => sum + inv.paid_amount, 0)
  const totalQuoted = filteredQuotations.reduce((sum, q) => sum + q.grand_total, 0)
  const wonLeads = filteredLeads.filter(l => l.status === "Won").length
  const winRate = filteredLeads.length > 0 ? Math.round((wonLeads / filteredLeads.length) * 100) : 0

  const projectTypes = filteredLeads.reduce((acc, lead) => {
    const type = lead.project_type || "Other"
    acc[type] = (acc[type] || 0) + (lead.estimated_budget || 0)
    return acc
  }, {} as Record<string, number>)

  const topClients = [
    { name: "Budi Santoso", revenue: 28000000, projects: 2 },
    { name: "Maya Putri", revenue: 32000000, projects: 4 },
    { name: "Sari Dewi", revenue: 25000000, projects: 3 },
  ].sort((a, b) => b.revenue - a.revenue)

  function exportCSV() {
    const rows = [
      ["Quote Number", "Project Title", "Client", "Status", "Grand Total", "Created At"],
      ...filteredQuotations.map(q => [
        q.quote_number,
        q.project_title,
        q.lead?.client_name ?? "",
        q.status,
        q.grand_total,
        q.created_at.slice(0, 10),
      ]),
    ]
    const csv = rows.map(r => r.map(v => `"${v}"`).join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `quotations-${fromMonth}-to-${toMonth}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      <PageHeader
        title="Reports & Analytics"
        description="Track your business performance"
        action={
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        }
      />

      {/* Date range filter */}
      <div className="flex flex-wrap items-center gap-3 mb-6 p-4 rounded-lg bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700">
        <span className="text-sm font-medium text-gray-700 dark:text-slate-300">Date range:</span>
        <div className="flex items-center gap-2">
          <select
            value={fromMonth}
            onChange={e => setFromMonth(e.target.value)}
            className="text-sm rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {monthOptions.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <span className="text-sm text-gray-500 dark:text-slate-400">to</span>
          <select
            value={toMonth}
            onChange={e => setToMonth(e.target.value)}
            className="text-sm rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {monthOptions.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <span className="text-xs text-gray-400 dark:text-slate-500">
          {filteredLeads.length} leads · {filteredQuotations.length} quotes
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-slate-400">Total Revenue</p>
                <p className="text-lg font-bold text-gray-900 dark:text-slate-100">{formatCurrency(totalRevenue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-slate-400">Total Quoted</p>
                <p className="text-lg font-bold text-gray-900 dark:text-slate-100">{formatCurrency(totalQuoted)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <Target className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-slate-400">Win Rate</p>
                <p className="text-lg font-bold text-gray-900 dark:text-slate-100">{winRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                <Award className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-slate-400">Won Deals</p>
                <p className="text-lg font-bold text-gray-900 dark:text-slate-100">{wonLeads}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Monthly Revenue Trend */}
        <Card className="lg:col-span-2 dark:bg-slate-800 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="text-base dark:text-slate-100">Monthly Revenue Trend (Last 6 Months)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {(() => {
                const monthlyRevenue: Record<string, number> = {}
                const last6Months = []
                const now = new Date()
                for (let i = 5; i >= 0; i--) {
                  const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
                  const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
                  last6Months.push({ key, label: MONTHS[d.getMonth()] })
                  monthlyRevenue[key] = 0
                }
                
                demoInvoices.forEach(inv => {
                  const month = inv.issue_date.slice(0, 7)
                  if (monthlyRevenue.hasOwnProperty(month)) {
                    monthlyRevenue[month] += inv.paid_amount
                  }
                })

                const maxRevenue = Math.max(...Object.values(monthlyRevenue), 1)

                return (
                  <div className="flex items-end justify-between gap-2 h-48">
                    {last6Months.map(({ key, label }) => {
                      const amount = monthlyRevenue[key]
                      const heightPercent = (amount / maxRevenue) * 100
                      return (
                        <div key={key} className="flex-1 flex flex-col items-center gap-2">
                          <div className="w-full flex flex-col justify-end h-40">
                            <div 
                              className="w-full bg-gradient-to-t from-indigo-500 to-purple-500 rounded-t-lg transition-all duration-500 hover:from-indigo-600 hover:to-purple-600 relative group"
                              style={{ height: `${heightPercent}%` }}
                            >
                              <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 dark:bg-slate-700 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                                {formatCurrency(amount)}
                              </div>
                            </div>
                          </div>
                          <span className="text-xs text-gray-600 dark:text-slate-400 font-medium">{label}</span>
                        </div>
                      )
                    })}
                  </div>
                )
              })()}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="text-base dark:text-slate-100">Revenue by Project Type</CardTitle>
          </CardHeader>
          <CardContent>
            {Object.keys(projectTypes).length === 0 ? (
              <p className="text-sm text-gray-400 dark:text-slate-500">No data for selected range.</p>
            ) : (
              <div className="space-y-3">
                {Object.entries(projectTypes).sort(([, a], [, b]) => b - a).map(([type, amount]) => {
                  const maxAmount = Math.max(...Object.values(projectTypes))
                  const widthPercent = maxAmount > 0 ? (amount / maxAmount) * 100 : 0
                  return (
                    <div key={type}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-700 dark:text-slate-300">{type}</span>
                        <span className="text-sm font-semibold text-gray-900 dark:text-slate-100">{formatCurrency(amount)}</span>
                      </div>
                      <div className="w-full bg-gray-100 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                          style={{ width: `${widthPercent}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="text-base dark:text-slate-100">Top Clients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topClients.map((client, idx) => (
                <div key={client.name} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-xs font-semibold text-indigo-700 dark:text-indigo-300">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-slate-100">{client.name}</p>
                    <p className="text-xs text-gray-500 dark:text-slate-400">{client.projects} projects</p>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 dark:text-slate-100">{formatCurrency(client.revenue)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
