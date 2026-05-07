"use client"

import { useState } from "react"
import { formatCurrency } from "@/lib/utils/format"
import { Users, FileText, DollarSign, Trophy, Bell, CheckCircle, AlertCircle, TrendingUp, BarChart3 } from "lucide-react"
import type { ReportData, PeriodStats } from "./actions"

interface Props {
  data: ReportData
}

function PeriodMetrics({ stats, period }: { stats: PeriodStats; period: "weekly" | "monthly" }) {
  const label = period === "weekly" ? "7 hari terakhir" : "bulan ini"
  const cards = [
    {
      label: "Lead Baru",
      value: stats.newLeads.toString(),
      sub: label,
      icon: Users,
      bg: "#BFEAF3",
      iconColor: "#0E4F63",
    },
    {
      label: "Penawaran Dibuat",
      value: stats.quotationsCreated.toString(),
      sub: label,
      icon: FileText,
      bg: "#CBD5E1",
      iconColor: "#334155",
    },
    {
      label: "Invoice Terbayar",
      value: stats.invoicesPaid.toString(),
      sub: label,
      icon: CheckCircle,
      bg: "#DDEFCB",
      iconColor: "#2D5016",
    },
    {
      label: "Pendapatan",
      value: formatCurrency(stats.revenuePaid),
      sub: label,
      icon: DollarSign,
      bg: "#F3E8FF",
      iconColor: "#6B21A8",
    },
  ]

  const totalFollowUps = stats.followUpsCompleted + stats.followUpsPending
  const completionRate = totalFollowUps > 0 ? Math.round((stats.followUpsCompleted / totalFollowUps) * 100) : 0

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        {cards.map(({ label, value, sub, icon: Icon, bg, iconColor }) => (
          <div
            key={label}
            className="rounded-[24px] p-5 flex flex-col gap-4"
            style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--border-color)" }}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: bg }}>
              <Icon className="w-5 h-5" style={{ color: iconColor }} />
            </div>
            <div>
              <div className="text-2xl font-semibold tabular-nums" style={{ color: "var(--text-primary)" }}>{value}</div>
              <div className="text-sm font-medium mt-0.5" style={{ color: "var(--text-primary)" }}>{label}</div>
              <div className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>{sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Follow-up completion */}
      <div
        className="rounded-[24px] p-5 mb-5"
        style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--border-color)" }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4" style={{ color: "var(--text-secondary)" }} />
            <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Penyelesaian Follow-up</span>
          </div>
          <span className="text-sm font-semibold tabular-nums" style={{ color: "var(--text-primary)" }}>{completionRate}%</span>
        </div>
        <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: "var(--border-color)" }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${completionRate}%`, backgroundColor: "#DDEFCB" }}
          />
        </div>
        <div className="flex gap-4 mt-2.5 text-xs" style={{ color: "var(--text-secondary)" }}>
          <span>{stats.followUpsCompleted} selesai</span>
          <span>{stats.followUpsPending} tertunda</span>
        </div>
      </div>
    </>
  )
}

export default function ReportsClient({ data }: Props) {
  const [period, setPeriod] = useState<"weekly" | "monthly">("weekly")
  const stats = period === "weekly" ? data.weekly : data.monthly
  const maxPipeline = Math.max(...data.pipeline.map(p => p.count), 1)
  const maxInvoiceCount = Math.max(...data.invoiceBreakdown.map(i => i.count), 1)
  const maxProjectCount = Math.max(...data.topProjectTypes.map(p => p.count), 1)

  return (
    <>
      {/* Period toggle */}
      <div className="flex gap-2 mb-6">
        {(["weekly", "monthly"] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className="px-4 py-2 rounded-full text-sm font-medium transition-all"
            style={
              period === p
                ? { backgroundColor: "var(--btn-dark)", color: "var(--text-inverse)" }
                : { backgroundColor: "var(--border-color)", color: "var(--text-secondary)" }
            }
          >
            {p === "weekly" ? "Minggu Ini" : "Bulan Ini"}
          </button>
        ))}
      </div>

      {/* Period metrics */}
      <PeriodMetrics stats={stats} period={period} />

      {/* All-time overview */}
      <div
        className="rounded-[30px] p-6 md:p-7 mb-5"
        style={{ background: "linear-gradient(135deg, #DDEFCB 0%, #BFEAF3 100%)", border: "1px solid rgba(17,24,39,0.08)" }}
      >
        <p className="text-sm font-medium text-[#35524A] mb-1">Total Pendapatan (Semua Waktu)</p>
        <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-[#14281D]">
          {formatCurrency(data.allTime.totalRevenue)}
        </h2>
        <p className="text-sm text-[#35524A] mt-1 mb-5">Dari invoice yang sudah lunas</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total Lead", value: data.allTime.totalLeads.toString() },
            { label: "Deals Menang", value: data.allTime.wonLeads.toString() },
            { label: "Konversi", value: `${data.allTime.conversionRate}%` },
            { label: "Belum Terbayar", value: formatCurrency(data.allTime.pendingRevenue) },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-2xl px-4 py-3 bg-white/65">
              <div className="text-xs uppercase tracking-wide text-[#4B5563]">{label}</div>
              <div className="text-lg font-semibold text-[#111827] mt-1 tabular-nums truncate">{value}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
        {/* Pipeline */}
        <div
          className="rounded-[28px] p-6 lg:col-span-1"
          style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--border-color)" }}
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#DDEFCB" }}>
              <BarChart3 className="w-4 h-4" style={{ color: "#2D5016" }} />
            </div>
            <div>
              <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Status Update</h2>
              <p className="text-xs" style={{ color: "var(--text-secondary)" }}>Status seluruh lead</p>
            </div>
          </div>
          <div className="space-y-3">
            {data.pipeline.map((item) => {
              const w = item.count === 0 ? 0 : Math.max((item.count / maxPipeline) * 100, 6)
              return (
                <div key={item.label}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="text-sm" style={{ color: "var(--text-primary)" }}>{item.label}</span>
                    </div>
                    <span className="text-sm tabular-nums font-medium" style={{ color: "var(--text-secondary)" }}>{item.count}</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: "var(--border-color)" }}>
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${w}%`, backgroundColor: item.color }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Invoice breakdown */}
        <div
          className="rounded-[28px] p-6 lg:col-span-1"
          style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--border-color)" }}
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#BFEAF3" }}>
              <FileText className="w-4 h-4" style={{ color: "#0E4F63" }} />
            </div>
            <div>
              <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Status Invoice</h2>
              <p className="text-xs" style={{ color: "var(--text-secondary)" }}>Semua invoice</p>
            </div>
          </div>
          <div className="space-y-3">
            {data.invoiceBreakdown.filter(i => i.count > 0).map((item) => {
              const w = Math.max((item.count / maxInvoiceCount) * 100, 6)
              return (
                <div key={item.status}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="text-sm" style={{ color: "var(--text-primary)" }}>{item.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs tabular-nums" style={{ color: "var(--text-secondary)" }}>{item.count}</span>
                      <span className="text-xs tabular-nums font-medium" style={{ color: "var(--text-primary)" }}>{formatCurrency(item.amount)}</span>
                    </div>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: "var(--border-color)" }}>
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${w}%`, backgroundColor: item.color }} />
                  </div>
                </div>
              )
            })}
            {data.invoiceBreakdown.every(i => i.count === 0) && (
              <p className="text-sm py-4 text-center" style={{ color: "var(--text-secondary)" }}>Belum ada invoice</p>
            )}
          </div>
        </div>

        {/* Top project types */}
        <div
          className="rounded-[28px] p-6 lg:col-span-1"
          style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--border-color)" }}
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#F3E8FF" }}>
              <Trophy className="w-4 h-4" style={{ color: "#6B21A8" }} />
            </div>
            <div>
              <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Jenis Proyek Terlaris</h2>
              <p className="text-xs" style={{ color: "var(--text-secondary)" }}>Berdasarkan jumlah lead</p>
            </div>
          </div>
          {data.topProjectTypes.length === 0 ? (
            <p className="text-sm py-4 text-center" style={{ color: "var(--text-secondary)" }}>Belum ada data</p>
          ) : (
            <div className="space-y-3">
              {data.topProjectTypes.map((item, idx) => {
                const w = Math.max((item.count / maxProjectCount) * 100, 6)
                return (
                  <div key={item.type}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono w-4 tabular-nums" style={{ color: "var(--text-secondary)" }}>{idx + 1}</span>
                        <span className="text-sm truncate" style={{ color: "var(--text-primary)" }}>{item.type}</span>
                      </div>
                      <span className="text-sm tabular-nums font-medium" style={{ color: "var(--text-secondary)" }}>{item.count}</span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: "var(--border-color)" }}>
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${w}%`, backgroundColor: "#C4B5FD" }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
