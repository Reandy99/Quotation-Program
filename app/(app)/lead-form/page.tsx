import { redirect } from "next/navigation"
import { getOrCreateLeadForm } from "./actions"
import LeadFormBuilderClient from "./LeadFormBuilderClient"

export const dynamic = "force-dynamic"

export default async function LeadFormPage() {
  const form = await getOrCreateLeadForm()
  if (!form) redirect("/login")

  return <LeadFormBuilderClient form={form} />
}
