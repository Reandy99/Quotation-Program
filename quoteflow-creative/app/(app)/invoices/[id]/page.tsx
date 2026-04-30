import { notFound } from "next/navigation"
import { findInvoiceById, getInvoicePayments, demoCompany } from "@/lib/demo/data"
import InvoiceDetailClient from "@/components/invoices/InvoiceDetailClient"

export default async function InvoiceDetailPage({ params }: { params: { id: string } }) {
  const invoice = findInvoiceById(params.id)
  if (!invoice) notFound()

  const payments = getInvoicePayments(invoice.id)

  return (
    <InvoiceDetailClient invoice={invoice} initialPayments={payments} company={demoCompany} />
  )
}
