"use client"

import { useRouter } from "next/navigation"
import { QuotationForm } from "@/components/quotations/QuotationForm"
import { PageHeader } from "@/components/shared/PageHeader"
import type { QuotationFormData } from "@/lib/validations/quotation"
import type { Lead, Quotation, QuotationItem } from "@/types"
import { useToast } from "@/hooks/use-toast"
import { updateQuotation } from "../../actions"

interface Props {
  quotation: Quotation & { items: QuotationItem[] }
  leads: Lead[]
}

export default function EditQuotationClient({ quotation, leads }: Props) {
  const router = useRouter()
  const { toast } = useToast()

  async function handleSubmit(data: QuotationFormData) {
    try {
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
        description: item.description || null,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
        sort_order: item.sort_order ?? 0
      }))
      
      await updateQuotation(quotation.id, { 
        lead_id: quotationData.lead_id || null,
        project_title: quotationData.project_title,
        project_type: quotationData.project_type || null,
        event_date: quotationData.event_date || null,
        location: quotationData.location || null,
        valid_until: quotationData.valid_until || null,
        discount_type: quotationData.discount_type,
        discount_value: quotationData.discount_value,
        tax_percent: quotationData.tax_percent,
        notes: quotationData.notes || null,
        terms: quotationData.terms || null,
        status: quotationData.status,
        subtotal,
        grand_total
      }, mappedItems)
      
      toast({ variant: "success", title: "Quotation updated", description: `${quotation.quote_number} updated successfully.` })
      router.push(`/quotations/${quotation.id}`)
      router.refresh()
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: error instanceof Error ? error.message : "Failed to update quotation" })
    }
  }

  const defaultValues = {
    lead_id: quotation.lead_id ?? "",
    project_title: quotation.project_title,
    project_type: quotation.project_type ?? "",
    event_date: quotation.event_date ?? "",
    location: quotation.location ?? "",
    valid_until: quotation.valid_until ?? "",
    discount_type: quotation.discount_type,
    discount_value: quotation.discount_value,
    tax_percent: quotation.tax_percent,
    notes: quotation.notes ?? "",
    terms: quotation.terms ?? "",
    status: quotation.status,
    items: quotation.items.map(item => ({
      item_name: item.item_name,
      description: item.description ?? "",
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.total_price,
      sort_order: item.sort_order
    }))
  }

  return (
    <>
      <PageHeader title={`Edit ${quotation.quote_number}`} />
      <QuotationForm
        defaultValues={defaultValues}
        leads={leads}
        onSubmit={handleSubmit}
      />
    </>
  )
}
