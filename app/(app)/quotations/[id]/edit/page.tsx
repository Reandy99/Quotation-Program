import { notFound } from "next/navigation"
import EditQuotationClient from "./EditQuotationClient"
import { getQuotation } from "../../actions"
import { getLeads } from "@/app/(app)/leads/actions"

export const dynamic = "force-dynamic"

export default async function EditQuotationPage({ params }: { params: { id: string } }) {
  const [quotation, leads] = await Promise.all([
    getQuotation(params.id),
    getLeads()
  ])

  if (!quotation || !quotation.items) notFound()

  return <EditQuotationClient quotation={quotation as any} leads={leads} />
}
