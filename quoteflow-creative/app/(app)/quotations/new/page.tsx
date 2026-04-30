import NewQuotationClient from "./NewQuotationClient"
import { demoLeads, demoCompany } from "@/lib/demo/data"

export default async function NewQuotationPage({
  searchParams,
}: {
  searchParams: { lead_id?: string }
}) {
  return (
    <NewQuotationClient
      leads={demoLeads}
      defaultLeadId={searchParams.lead_id}
      defaultTerms={demoCompany.default_terms ?? ""}
    />
  )
}
