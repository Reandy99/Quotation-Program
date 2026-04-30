"use client"

import { PDFDownloadLink } from "@react-pdf/renderer"
import { QuotationPDF } from "./QuotationPDF"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import type { Quotation, CompanySettings } from "@/types"

interface Props {
  quotation: Quotation & { items: any[] }
  company: CompanySettings | null
}

export default function PDFDownloadButton({ quotation, company }: Props) {
  return (
    <PDFDownloadLink
      document={<QuotationPDF quotation={quotation} company={company} />}
      fileName={`${quotation.quote_number}.pdf`}
    >
      {(({ loading }: { loading: boolean }) => (
        <Button variant="outline" size="sm" disabled={loading}>
          <Download className="w-4 h-4 mr-1" />
          {loading ? "Generating..." : "Download PDF"}
        </Button>
      )) as any}
    </PDFDownloadLink>
  )
}
