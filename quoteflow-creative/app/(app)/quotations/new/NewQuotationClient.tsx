"use client"

import { useRouter } from "next/navigation"
import { useMemo } from "react"
import Link from "next/link"
import { QuotationForm } from "@/components/quotations/QuotationForm"
import { PageHeader } from "@/components/shared/PageHeader"
import { Button } from "@/components/ui/button"
import type { QuotationFormData } from "@/lib/validations/quotation"
import type { Lead } from "@/types"
import { getTemplateById } from "@/lib/quotation-templates"
import { useLiveCompanySettings } from "@/lib/settings/useLiveSettings"
import { useToast } from "@/hooks/use-toast"
import { createQuotation, generateQuoteNumber } from "@/app/(app)/quotations/actions"

interface Props {
  leads: Lead[]
  defaultLeadId?: string
  templateId?: string
}

export default function NewQuotationClient({ leads, defaultLeadId, templateId }: Props) {
  const router = useRouter()
  const { toast } = useToast()
  const company = useLiveCompanySettings()

  const template = useMemo(() => {
    return templateId ? getTemplateById(templateId) : null
  }, [templateId])

  async function handleSubmit(data: QuotationFormData) {
    try {
      const quoteNumber = await generateQuoteNumber()
      const { items, ...quotationData } = data
      
      const subtotal = items.reduce((sum, item) => sum + item.total_price, 0)
      const discount = quotationData.discount_type === "percent" 
        ? subtotal * (quotationData.discount_value / 100) 
        : quotationData.discount_value
      const afterDiscount = subtotal - discount
      const tax = afterDiscount * (quotationData.tax_percent / 100)
      const grand_total = afterDiscount + tax
      
      const mappedItems = items.map(item => ({
        item_name: item.item_name,
        description: item.description ?? null,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
        sort_order: item.sort_order ?? 0
      }))
      
      await createQuotation({ 
        lead_id: quotationData.lead_id && quotationData.lead_id !== "" ? quotationData.lead_id : null,
        project_title: quotationData.project_title,
        project_type: quotationData.project_type ?? null,
        event_date: quotationData.event_date ?? null,
        location: quotationData.location ?? null,
        valid_until: quotationData.valid_until ?? null,
        discount_type: quotationData.discount_type,
        discount_value: quotationData.discount_value,
        tax_percent: quotationData.tax_percent,
        notes: quotationData.notes ?? null,
        terms: quotationData.terms ?? null,
        quote_number: quoteNumber, 
        status: quotationData.status,
        subtotal,
        grand_total
      }, mappedItems)
      toast({ variant: "success", title: "Quotation created", description: `${quoteNumber} created successfully.` })
      router.push("/quotations")
      router.refresh()
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: error instanceof Error ? error.message : "Failed to create quotation" })
    }
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
    : { lead_id: defaultLeadId, terms: company.default_terms }

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
