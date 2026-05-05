import PackagesSettingsClient from "./PackagesSettingsClient"
import { getPackagesSettings } from "../actions"

export const dynamic = "force-dynamic"

export default async function PackagesSettingsPage() {
  const packages = await getPackagesSettings()
  return <PackagesSettingsClient initialPackages={packages} />
}
