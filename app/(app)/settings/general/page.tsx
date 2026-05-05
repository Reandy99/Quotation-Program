import GeneralSettingsClient from "./GeneralSettingsClient"
import { getGeneralSettings } from "../actions"

export const dynamic = "force-dynamic"

export default async function GeneralSettingsPage() {
  const settings = await getGeneralSettings()
  return <GeneralSettingsClient initialSettings={settings} />
}
