import FollowUpsClient from "./FollowUpsClient"
import { getLeads } from "../leads/actions"
import { getFollowUps } from "./actions"
import { getSubscription } from "@/lib/billing/actions"
import { canUseFeature } from "@/lib/billing/feature-gate"
import { UpgradeBanner } from "@/components/billing/UpgradeBanner"

export const dynamic = "force-dynamic"

export default async function FollowUpsPage() {
  const [leads, followUps, subscription] = await Promise.all([
    getLeads(),
    getFollowUps(),
    getSubscription(),
  ])
  const canCreate = canUseFeature(subscription?.status, "create_followup")

  return (
    <div>
      {!canCreate && <UpgradeBanner />}
      <FollowUpsClient leads={leads} followUps={followUps} canCreate={canCreate} />
    </div>
  )
}
