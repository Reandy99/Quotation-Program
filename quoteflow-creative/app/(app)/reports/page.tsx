import { PageHeader } from "@/components/shared/PageHeader"
import { formatCurrency } from "@/lib/utils/format"
import { Users, FileText, Receipt, DollarSign, TrendingUp } from "lucide-react"
import { getReportStats } from "./actions"

export const dynamic = "force-dynamic"

export default async function ReportsPage() {
  const stats = await getReportStats()

  const metrics = [
    { label: "Total Leads", value: stats.totalLeads.toString(), icon: Users, bg: "#BFEAF3", iconColor: "#0E4F63" },
    { label: "Total Quotations", value: stats.totalQuotations.toString(), icon: FileText, bg: "#CBD5E1", iconColor: "#334155" },
    { label: "Total Invoices", value: stats.totalInvoices.toString(), icon: Receipt, bg: "#FEF9C3", iconColor: "#713F12" },
    { label: "Total Revenue", value: formatCurrency(stats.totalRevenue), icon: DollarSign, bg: "#DDEFCB", iconColor: "#2D5016" },
    { label: "Conversion Rate", value: `${stats.conversionRate}%`, icon: TrendingUp, bg: "#E9D5FF", iconColor: "#6B21A8" },
  ]

  return (
    <div>
      <PageHeader
        title="Reports"
        description="Analytics and insights"
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {metrics.map(({ label, value, icon: Icon, bg, iconColor }) => (
          <div
            key={label}
            className="rounded-[20px] p-5 flex flex-col gap-3"
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
    </div>
  )
}
