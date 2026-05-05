"use client"

import { PDFDownloadLink } from "@react-pdf/renderer"
import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { InvoicePDF } from "./InvoicePDF"
import type { CompanySettings, Invoice, QuotationItem } from "@/types"

type InvoicePdfData = Invoice & {
  items?: QuotationItem[]
  quotation?: {
    event_date?: string | null
    location?: string | null
    project_type?: string | null
    terms?: string | null
    lead?: {
      company_name?: string | null
      email?: string | null
      phone?: string | null
    } | null
  } | null
}

interface Props {
  invoice: InvoicePdfData
  company: CompanySettings
}

export default function InvoicePDFDownloadButton({ invoice, company }: Props) {
  return (
    <PDFDownloadLink
      document={<InvoicePDF invoice={invoice} company={company} />}
      fileName={`${invoice.invoice_number}.pdf`}
    >
      {(({ loading }: { loading: boolean }) => (
        <Button variant="outline" size="sm" disabled={loading}>
          <Download className="w-4 h-4 mr-1" />
          {loading ? "Generating..." : "Convert to PDF"}
        </Button>
      )) as any}
    </PDFDownloadLink>
  )
}
