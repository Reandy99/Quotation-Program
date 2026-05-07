import NewQuotationClient from "./NewQuotationClient"
import { getLeads } from "../../leads/actions"
import { getPackagesSettings } from "../../settings/actions"

export const dynamic = "force-dynamic"

export default async function NewQuotationPage({
  searchParams,
}: {
  searchParams: { lead_id?: string; template?: string }
}) {
  const [leads, servicePackages] = await Promise.all([getLeads(), getPackagesSettings()])
  return (
    <NewQuotationClient
      leads={leads}
      servicePackages={servicePackages}
      defaultLeadId={searchParams.lead_id}
      templateId={searchParams.template}
    />
  )
}
