import { notFound } from "next/navigation"
import LeadDetailClient from "./LeadDetailClient"
import { getLead } from "../actions"
import { getQuotationsByLeadId } from "../../quotations/actions"

export const dynamic = "force-dynamic"

export default async function LeadDetailPage({ params }: { params: { id: string } }) {
  const lead = await getLead(params.id)
  if (!lead) notFound()
  const quotations = await getQuotationsByLeadId(lead.id)
  return <LeadDetailClient lead={lead} quotations={quotations} />
}
