import NewQuotationClient from "./NewQuotationClient"
import { getLeads } from "../../leads/actions"

export const dynamic = "force-dynamic"

export default async function NewQuotationPage({
  searchParams,
}: {
  searchParams: { lead_id?: string; template?: string }
}) {
  const leads = await getLeads()
  return (
    <NewQuotationClient
      leads={leads}
      defaultLeadId={searchParams.lead_id}
      templateId={searchParams.template}
    />
  )
}
