import { notFound } from "next/navigation"
import QuotationDetailClient from "./QuotationDetailClient"
import { findQuotationById } from "@/lib/demo/data"

export default async function QuotationDetailPage({ params }: { params: { id: string } }) {
  const quotation = findQuotationById(params.id)
  if (!quotation) notFound()
  return <QuotationDetailClient quotation={quotation} />
}
