import { notFound } from "next/navigation"
import QuotationDetailClient from "./QuotationDetailClient"
import { getQuotation } from "../actions"
import { getCompanySettings } from "../../settings/actions"

export const dynamic = "force-dynamic"

export default async function QuotationDetailPage({ params }: { params: { id: string } }) {
  const [quotation, companyFromDB] = await Promise.all([
    getQuotation(params.id),
    getCompanySettings(),
  ])
  if (!quotation || !quotation.items) notFound()
  return <QuotationDetailClient quotation={quotation as any} companyFromDB={companyFromDB} />
}
