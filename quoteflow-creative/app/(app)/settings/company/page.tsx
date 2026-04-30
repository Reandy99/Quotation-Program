import CompanySettingsClient from "./CompanySettingsClient"
import { demoCompany } from "@/lib/demo/data"

export default async function CompanySettingsPage() {
  return <CompanySettingsClient company={demoCompany} userId="demo" />
}
