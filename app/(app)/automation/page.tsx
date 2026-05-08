import { getQuotations } from "../quotations/actions"
import { getInvoices } from "../invoices/actions"
import { getFollowUps } from "../follow-ups/actions"
import { getCompanySettings, getGeneralSettings } from "../settings/actions"
import { generateAutomationSuggestions } from "@/lib/automation/suggestions"
import { getAutomationDismissalKeys } from "./actions"
import AutomationClient from "./AutomationClient"

export const dynamic = "force-dynamic"

export default async function AutomationPage() {
  const [quotations, invoices, followUps, companySettings, generalSettings, dismissedKeys] = await Promise.all([
    getQuotations(),
    getInvoices(),
    getFollowUps(),
    getCompanySettings(),
    getGeneralSettings(),
    getAutomationDismissalKeys(),
  ])

  const businessName = companySettings?.business_name ?? generalSettings.workspace_name ?? ""
  const suggestions = generateAutomationSuggestions({
    quotations,
    invoices,
    followUps,
    businessName,
    dismissedKeys,
  })

  return <AutomationClient suggestions={suggestions} />
}
