import { getAdminSubscriptions } from "./actions"
import AdminSubscriptionsClient from "./AdminSubscriptionsClient"
import { PageHeader } from "@/components/shared/PageHeader"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function AdminSubscriptionsPage() {
  // Guard: only admin emails
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const adminEmails = (process.env.ADMIN_EMAILS ?? "").split(",").map(e => e.trim()).filter(Boolean)
  if (adminEmails.length > 0 && !adminEmails.includes(user.email ?? "")) {
    redirect("/dashboard")
  }

  const subscriptions = await getAdminSubscriptions()

  return (
    <div>
      <PageHeader
        title="Admin: Subscriptions"
        description="View and manage all user subscriptions"
      />
      <AdminSubscriptionsClient initialData={subscriptions as any} />
    </div>
  )
}
