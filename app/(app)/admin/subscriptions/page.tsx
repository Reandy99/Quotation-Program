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

  let subscriptions: any[] = []
  let error: string | null = null

  try {
    subscriptions = await getAdminSubscriptions()
  } catch (e: any) {
    error = e.message
    console.error("[AdminSubscriptionsPage] Error:", e)
  }

  return (
    <div>
      <PageHeader
        title="Admin: Subscriptions"
        description="View and manage all user subscriptions"
      />
      {error && (
        <div className="mb-4 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          <strong>Error:</strong> {error}
        </div>
      )}
      {!error && subscriptions.length === 0 && (
        <div className="mb-4 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-sm">
          <strong>Debug:</strong> No subscriptions returned. Check server logs for details.
        </div>
      )}
      <AdminSubscriptionsClient initialData={subscriptions as any} />
    </div>
  )
}
