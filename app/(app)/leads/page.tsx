import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/shared/PageHeader"
import { EmptyState } from "@/components/shared/EmptyState"
import { Plus, Users } from "lucide-react"
import LeadsListClient from "@/components/leads/LeadsListClient"
import { getLeads } from "./actions"
import { getSubscription } from "@/lib/billing/actions"
import { canUseFeature } from "@/lib/billing/feature-gate"
import { UpgradeBanner } from "@/components/billing/UpgradeBanner"

export const dynamic = "force-dynamic"

export default async function LeadsPage() {
  const [leads, subscription] = await Promise.all([getLeads(), getSubscription()])
  const canCreate = canUseFeature(subscription?.status, "create_lead")

  return (
    <div>
      {!canCreate && <UpgradeBanner />}
      <PageHeader
        title="Leads"
        description="Manage your potential clients and projects"
        action={
          canCreate ? (
            <Link href="/leads/new" className="block w-full sm:w-auto">
              <Button className="w-full sm:w-auto"><Plus className="w-4 h-4 mr-1.5" />New Lead</Button>
            </Link>
          ) : null
        }
      />

      {!leads?.length ? (
        <EmptyState
          icon={Users}
          title="No leads yet"
          description="Add your first lead to start tracking potential clients and projects."
          action={
            canCreate ? (
              <Link href="/leads/new">
                <Button size="lg"><Plus className="w-4 h-4 mr-2" />Add Your First Lead</Button>
              </Link>
            ) : undefined
          }
        />
      ) : (
        <LeadsListClient leads={leads} />
      )}
    </div>
  )
}
