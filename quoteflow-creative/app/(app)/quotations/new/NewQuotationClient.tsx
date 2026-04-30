"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import { QuotationForm } from "@/components/quotations/QuotationForm"
import { PageHeader } from "@/components/shared/PageHeader"
import { Button } from "@/components/ui/button"
import type { QuotationFormData } from "@/lib/validations/quotation"
import type { Lead } from "@/types"
import type { QuotationTemplate } from "@/lib/quotation-templates"

interface Props {
  leads: Lead[]
  defaultLeadId?: string
  defaultTerms?: string
}

export default function NewQuotationClient({ leads, defaultLeadId, defaultTerms }: Props) {
  const router = useRouter()
  const [template, setTemplate] = useState<QuotationTemplate | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem("selectedTemplate")
    if (stored) {
      try {
        setTemplate(JSON.parse(stored))
        localStorage.removeItem("selectedTemplate")
      } catch (e) {
        console.error("Failed to parse template", e)
      }
    }
  }, [])

  async function handleSubmit(_data: QuotationFormData) {
    alert("Demo mode: quotation not saved.")
    router.push("/quotations")
  }

  const defaultValues = template
    ? {
        lead_id: defaultLeadId,
        project_title: template.package_name,
        project_type: template.category,
        terms: template.payment_terms,
        notes: template.notes,
        discount_type: template.discount_type,
        discount_value: template.discount_value,
        tax_percent: template.tax_percent,
        items: template.items.map((item, idx) => ({
          item_name: item.item_name,
          description: item.description ?? "",
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.quantity * item.unit_price,
          sort_order: idx,
        })),
      }
    : { lead_id: defaultLeadId, terms: defaultTerms }

  return (
    <div>
      <PageHeader
        title={template ? `New Quotation — ${template.name}` : "New Quotation"}
        action={<Link href="/quotations"><Button variant="outline" className="dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">Cancel</Button></Link>}
      />
      <QuotationForm
        leads={leads}
        defaultValues={defaultValues}
        onSubmit={handleSubmit}
        loading={false}
      />
    </div>
  )
}
