import { notFound } from "next/navigation"
import { createAdminClient } from "@/lib/supabase/server"
import { sanitizeSlug } from "@/lib/lead-forms/validation"
import PublicLeadFormClient from "./PublicLeadFormClient"
import type { CompanySettings, LeadForm, ServicePackage } from "@/types"

export const dynamic = "force-dynamic"

interface Props {
  params: { slug: string }
}

type PublicForm = Pick<LeadForm, "slug" | "title" | "description" | "studio_intro" | "portfolio_items" | "highlight_items" | "button_text" | "thank_you_message">

export interface PublicBookingPageData {
  form: PublicForm
  company: Pick<CompanySettings, "business_name" | "logo_url" | "phone" | "website" | "address"> | null
  packages: ServicePackage[]
}

export default async function PublicLeadFormPage({ params }: Props) {
  const slug = sanitizeSlug(params.slug)
  if (!slug) notFound()

  const supabase = createAdminClient()
  const { data } = await supabase
    .from("lead_forms")
    .select("user_id,slug,title,description,studio_intro,portfolio_items,highlight_items,button_text,thank_you_message")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle()

  if (!data) notFound()

  const { data: company } = await supabase
    .from("company_settings")
    .select("business_name,logo_url,phone,website,address,service_packages")
    .eq("user_id", data.user_id)
    .maybeSingle()

  return (
    <PublicLeadFormClient
      page={{
        form: data as PublicForm,
        company: company ? {
          business_name: company.business_name,
          logo_url: company.logo_url,
          phone: company.phone,
          website: company.website,
          address: company.address,
        } : null,
        packages: (company?.service_packages as ServicePackage[] | null) ?? [],
      }}
    />
  )
}
