import { notFound } from "next/navigation"
import QuotationDetailClient from "./QuotationDetailClient"
import { getQuotation } from "../actions"

export const dynamic = "force-dynamic"

export default async function QuotationDetailPage({ params }: { params: { id: string } }) {
  const quotation = await getQuotation(params.id)
  if (!quotation || !quotation.items) notFound()
  return <QuotationDetailClient quotation={quotation as any} />
}
