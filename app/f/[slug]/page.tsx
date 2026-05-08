import { notFound } from "next/navigation"
import { createAdminClient } from "@/lib/supabase/server"
import { sanitizeSlug } from "@/lib/lead-forms/validation"
import PublicLeadFormClient from "./PublicLeadFormClient"
import type { LeadForm } from "@/types"

export const dynamic = "force-dynamic"

interface Props {
  params: { slug: string }
}

type PublicForm = Pick<LeadForm, "slug" | "title" | "description" | "button_text" | "thank_you_message">

export default async function PublicLeadFormPage({ params }: Props) {
  const slug = sanitizeSlug(params.slug)
  if (!slug) notFound()

  const supabase = createAdminClient()
  const { data } = await supabase
    .from("lead_forms")
    .select("slug,title,description,button_text,thank_you_message")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle()

  if (!data) notFound()

  return <PublicLeadFormClient form={data as PublicForm} />
}
