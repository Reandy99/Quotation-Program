import { createClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import EditInvoiceClient from "./EditInvoiceClient"

export default async function EditInvoicePage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data, error } = await supabase
    .from("invoices")
    .select("*")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single()

  if (error || !data) notFound()

  return <EditInvoiceClient invoice={data} />
}
