import CompanySettingsClient from "./CompanySettingsClient"
import { getCompanySettings } from "../actions"

export const dynamic = "force-dynamic"

export default async function CompanySettingsPage() {
  const company = await getCompanySettings()
  return <CompanySettingsClient company={company} />
}
