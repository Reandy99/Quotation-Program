import CalendarClient from "./CalendarClient"
import { getLeads } from "../leads/actions"
import { getQuotations } from "../quotations/actions"
import { getFollowUps } from "../follow-ups/actions"
import { getInvoices } from "../invoices/actions"

export const dynamic = "force-dynamic"

export default async function CalendarPage() {
  const [leads, quotations, followUps, invoices] = await Promise.all([
    getLeads(),
    getQuotations(),
    getFollowUps(),
    getInvoices(),
  ])

  return (
    <CalendarClient
      leads={leads}
      quotations={quotations}
      followUps={followUps}
      invoices={invoices}
    />
  )
}
