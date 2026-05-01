import CalendarClient from "./CalendarClient"
import { getLeads } from "../leads/actions"
import { getQuotations } from "../quotations/actions"

export const dynamic = "force-dynamic"

export default async function CalendarPage() {
  const leads = await getLeads()
  const quotations = await getQuotations()
  return <CalendarClient leads={leads} quotations={quotations} />
}
