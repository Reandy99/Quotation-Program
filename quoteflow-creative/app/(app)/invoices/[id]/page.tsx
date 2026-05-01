import { notFound } from "next/navigation"
import InvoiceDetailClient from "@/components/invoices/InvoiceDetailClient"
import { getInvoice } from "../actions"
import { createClient } from "@/lib/supabase/server"
import type { CompanySettings } from "@/types"

export const dynamic = "force-dynamic"

export default async function InvoiceDetailPage({ params }: { params: { id: string } }) {
  const invoice = await getInvoice(params.id)
  if (!invoice) notFound()

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  let company: CompanySettings | null = null
  if (user) {
    const { data } = await supabase
      .from("company_settings")
      .select("*")
      .eq("user_id", user.id)
      .single()
    company = data
  }

  const defaultCompany: CompanySettings = {
    id: "",
    user_id: user?.id || "",
    business_name: null,
    logo_url: null,
    email: null,
    phone: null,
    website: null,
    address: null,
    default_terms: null,
    default_payment_terms: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  return (
    <InvoiceDetailClient invoice={invoice} initialPayments={[]} company={company || defaultCompany} />
  )
}
