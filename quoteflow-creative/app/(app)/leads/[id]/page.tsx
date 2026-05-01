import { notFound } from "next/navigation"
import LeadDetailClient from "./LeadDetailClient"
import { getLead } from "../actions"
import { getQuotations } from "../../quotations/actions"

export const dynamic = "force-dynamic"

export default async function LeadDetailPage({ params }: { params: { id: string } }) {
  const lead = await getLead(params.id)
  if (!lead) notFound()
  const allQuotations = await getQuotations()
  const quotations = allQuotations.filter(q => q.lead_id === lead.id)
  return <LeadDetailClient lead={lead} quotations={quotations} />
}
