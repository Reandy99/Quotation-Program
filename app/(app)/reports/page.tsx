import { PageHeader } from "@/components/shared/PageHeader"
import { formatCurrency } from "@/lib/utils/format"
import { Users, FileText, DollarSign, TrendingUp, BarChart3 } from "lucide-react"
import { getReportStats } from "./actions"

export const dynamic = "force-dynamic"

export default async function ReportsPage() {
  const stats = await getReportStats()
  const maxPipelineCount = Math.max(...stats.pipeline.map((item) => item.count), 1)
  const activePipeline = stats.pipeline.filter((item) => item.count > 0)

  const metricCards = [
    { label: "Total Leads", value: stats.totalLeads.toString(), icon: Users, bg: "#BFEAF3", iconColor: "#0E4F63" },
    { label: "Total Quotations", value: stats.totalQuotations.toString(), icon: FileText, bg: "#CBD5E1", iconColor: "#334155" },
    { label: "Conversion Rate", value: `${stats.conversionRate}%`, icon: TrendingUp, bg: "#DDEFCB", iconColor: "#2D5016" },
  ]

  return (
    <div>
      <PageHeader
        title="Reports"
        description="A simple snapshot of your business performance."
      />

      <div className="grid grid-cols-1 xl:grid-cols-[1.5fr_1fr] gap-5 mb-5">
        <section
          className="rounded-[30px] p-6 md:p-7"
          style={{ background: "linear-gradient(135deg, #DDEFCB 0%, #BFEAF3 100%)", border: "1px solid rgba(17,24,39,0.08)" }}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-[#35524A]">Revenue Overview</p>
              <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-[#14281D] mt-2">
                {formatCurrency(stats.totalRevenue)}
              </h2>
              <p className="text-sm text-[#35524A] mt-2">Total revenue from paid invoices</p>
            </div>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-white/70 text-[#2D5016]">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
            <div className="rounded-2xl px-4 py-3 bg-white/65">
              <div className="text-xs uppercase tracking-wide text-[#4B5563]">Deals</div>
              <div className="text-lg font-semibold text-[#111827] mt-1">{stats.wonLeads}</div>
            </div>
            <div className="rounded-2xl px-4 py-3 bg-white/65">
              <div className="text-xs uppercase tracking-wide text-[#4B5563]">Lead Conversion</div>
              <div className="text-lg font-semibold text-[#111827] mt-1">{stats.conversionRate}%</div>
            </div>
          </div>
        </section>

        <section
          className="rounded-[30px] p-6"
          style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--border-color)" }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center bg-[#111827] text-white dark:bg-[#F8FAFC] dark:text-[#111827]">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>Pipeline Summary</h2>
              <p className="text-xs" style={{ color: "var(--text-secondary)" }}>Where your current leads are sitting</p>
            </div>
          </div>
          <div className="space-y-3">
            {activePipeline.length ? activePipeline.map((item) => (
              <div
                key={item.label}
                className="rounded-2xl px-4 py-3 flex items-center justify-between gap-3"
                style={{ backgroundColor: "var(--app-bg)", border: "1px solid var(--border-color)" }}
              >
                <div className="flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <p className="text-sm" style={{ color: "var(--text-primary)" }}>{item.label}</p>
                </div>
                <span className="text-sm font-semibold tabular-nums" style={{ color: "var(--text-primary)" }}>{item.count}</span>
              </div>
            )) : (
              <div
                className="rounded-2xl px-4 py-5"
                style={{ backgroundColor: "var(--app-bg)", border: "1px solid var(--border-color)" }}
              >
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Belum ada data pipeline untuk ditampilkan.</p>
              </div>
            )}
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        {metricCards.map(({ label, value, icon: Icon, bg, iconColor }) => (
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
              <div className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5">
        <section
          className="rounded-[30px] p-6"
          style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--border-color)" }}
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center bg-[#BFEAF3] text-[#0E4F63]">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>Pipeline Snapshot</h2>
              <p className="text-xs" style={{ color: "var(--text-secondary)" }}>Current lead distribution across stages</p>
            </div>
          </div>

          <div className="space-y-4">
            {stats.pipeline.map((item) => {
              const widthPercent = item.count === 0 ? 0 : Math.max((item.count / maxPipelineCount) * 100, 8)
              return (
                <div key={item.label}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{item.label}</span>
                    </div>
                    <span className="text-sm tabular-nums" style={{ color: "var(--text-secondary)" }}>{item.count}</span>
                  </div>
                  <div className="h-3 rounded-full overflow-hidden" style={{ backgroundColor: "var(--app-bg)" }}>
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${widthPercent}%`, backgroundColor: item.color }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      </div>
    </div>
  )
}
