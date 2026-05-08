import DashboardClient from "./DashboardClient"
import { ensureSubscription, getDashboardStats, getRecentActivity, getWAReminderData } from "./actions"
import { getLeads } from "../leads/actions"
import { getInvoices } from "../invoices/actions"
import { getGeneralSettings, getCompanySettings } from "../settings/actions"
import { getFollowUps } from "../follow-ups/actions"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  await ensureSubscription()

  const [stats, recentActivity, allLeads, allInvoices, generalSettings, followUps, waReminders, companySettings] = await Promise.all([
    getDashboardStats(),
    getRecentActivity(),
    getLeads(),
    getInvoices(),
    getGeneralSettings(),
    getFollowUps(),
    getWAReminderData(),
    getCompanySettings(),
  ])

  return (
    <DashboardClient
      workspaceName={generalSettings.workspace_name}
      businessName={companySettings?.business_name ?? generalSettings.workspace_name ?? ""}
      stats={stats}
      recentLeads={recentActivity.recentLeads}
      recentQuotations={recentActivity.recentQuotations}
      recentInvoices={recentActivity.recentInvoices}
      allLeads={allLeads}
      allInvoices={allInvoices}
      followUps={followUps}
      waReminders={waReminders}
    />
  )
}
