import { Badge } from "@/components/ui/badge"
import type { LeadStatus, QuotationStatus } from "@/types"

const leadStatusConfig: Record<LeadStatus, { variant: "default" | "secondary" | "destructive" | "outline" | "success" | "warning"; label: string }> = {
  New: { variant: "secondary", label: "New" },
  Contacted: { variant: "default", label: "Contacted" },
  Quoted: { variant: "warning", label: "Quoted" },
  "Follow Up": { variant: "warning", label: "Follow Up" },
  Won: { variant: "success", label: "Deals" },
  Lost: { variant: "destructive", label: "Lost" },
}

const quoteStatusConfig: Record<QuotationStatus, { variant: "default" | "secondary" | "destructive" | "outline" | "success" | "warning"; label: string }> = {
  Draft: { variant: "secondary", label: "Draft" },
  Sent: { variant: "default", label: "Sent" },
  Accepted: { variant: "success", label: "Accepted" },
  Rejected: { variant: "destructive", label: "Rejected" },
}

export function LeadStatusBadge({ status }: { status: LeadStatus }) {
  const config = leadStatusConfig[status] ?? { variant: "secondary" as const, label: String(status) }
  return <Badge variant={config.variant}>{config.label}</Badge>
}

export function QuoteStatusBadge({ status }: { status: QuotationStatus }) {
  const config = quoteStatusConfig[status] ?? { variant: "secondary" as const, label: String(status) }
  return <Badge variant={config.variant}>{config.label}</Badge>
}
