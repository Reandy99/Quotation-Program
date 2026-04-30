import { notFound } from "next/navigation"
import LeadDetailClient from "./LeadDetailClient"
import { findLeadById, getLeadQuotations } from "@/lib/demo/data"

export default async function LeadDetailPage({ params }: { params: { id: string } }) {
  const lead = findLeadById(params.id)
  if (!lead) notFound()
  const quotations = getLeadQuotations(lead.id)
  return <LeadDetailClient lead={lead} quotations={quotations} />
}
