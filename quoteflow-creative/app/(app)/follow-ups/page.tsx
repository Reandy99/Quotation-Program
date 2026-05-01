import FollowUpsClient from "./FollowUpsClient"
import { getLeads } from "../leads/actions"
import { getFollowUps } from "./actions"

export const dynamic = "force-dynamic"

export default async function FollowUpsPage() {
  const leads = await getLeads()
  const followUps = await getFollowUps()
  return <FollowUpsClient leads={leads} followUps={followUps} />
}
