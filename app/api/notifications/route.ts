import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import type { FollowUp, Invoice, Quotation } from "@/types"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json([])
    }

    const now = new Date().toISOString()
    const twoDaysFromNow = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString()
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

    // Get overdue invoices
    const { data: overdueInvoices } = await supabase
      .from("invoices")
      .select("id, invoice_number, due_date, client_name")
      .eq("user_id", user.id)
      .in("status", ["Sent", "Partial"])
      .lt("due_date", now)
      .order("due_date", { ascending: true })
      .limit(5)

    // Get expiring quotations
    const { data: expiringQuotes } = await supabase
      .from("quotations")
      .select("id, quote_number, valid_until, project_title")
      .eq("user_id", user.id)
      .eq("status", "Sent")
      .not("valid_until", "is", null)
      .gte("valid_until", now)
      .lte("valid_until", twoDaysFromNow)
      .order("valid_until", { ascending: true })
      .limit(5)

    // Get upcoming follow-ups (today and tomorrow)
    const { data: upcomingFollowUps } = await supabase
      .from("follow_ups")
      .select("id, scheduled_date, lead:leads(id, client_name)")
      .eq("user_id", user.id)
      .eq("completed", false)
      .gte("scheduled_date", now.split("T")[0])
      .lte("scheduled_date", twoDaysFromNow.split("T")[0])
      .order("scheduled_date", { ascending: true })
      .limit(5)

    const { data: publicLeads } = await supabase
      .from("leads")
      .select("id,client_name,event_name,project_type,created_at")
      .eq("user_id", user.id)
      .eq("lead_source", "Public Form")
      .gte("created_at", sevenDaysAgo)
      .order("created_at", { ascending: false })
      .limit(5)

    const notifications: any[] = []

    // Add invoice notifications
    if (overdueInvoices) {
      ;(overdueInvoices as Pick<Invoice, "id" | "invoice_number" | "due_date" | "client_name">[]).forEach((inv) => {
        notifications.push({
          id: `invoice-${inv.id}`,
          title: "Invoice Overdue",
          message: `${inv.invoice_number} - ${inv.client_name}`,
          date: inv.due_date,
          read: false,
          type: "invoice-overdue",
          link: `/invoices/${inv.id}`,
        })
      })
    }

    // Add quotation notifications
    if (expiringQuotes) {
      ;(expiringQuotes as Pick<Quotation, "id" | "quote_number" | "valid_until">[]).forEach((quote) => {
        const daysUntil = Math.ceil(
          (new Date(quote.valid_until!).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        )
        notifications.push({
          id: `quote-${quote.id}`,
          title: "Quotation Expiring Soon",
          message: `${quote.quote_number} expires in ${daysUntil} day${daysUntil !== 1 ? "s" : ""}`,
          date: quote.valid_until,
          read: false,
          type: "quote-expiring",
          link: `/quotations/${quote.id}`,
        })
      })
    }

    // Add follow-up notifications
    if (upcomingFollowUps) {
      ;(upcomingFollowUps as Array<Pick<FollowUp, "id" | "scheduled_date"> & { lead: { id: string; client_name: string } | null }>).forEach((followUp) => {
        if (!followUp.lead) return
        const isToday = followUp.scheduled_date === now.split("T")[0]
        notifications.push({
          id: `followup-${followUp.id}`,
          title: isToday ? "Follow-up Due Today" : "Follow-up Due Soon",
          message: followUp.lead.client_name,
          date: followUp.scheduled_date,
          read: false,
          type: "follow-up",
          link: `/leads/${followUp.lead.id}`,
        })
      })
    }

    if (publicLeads) {
      ;(publicLeads as Array<{ id: string; client_name: string; event_name: string | null; project_type: string | null; created_at: string }>).forEach((lead) => {
        notifications.push({
          id: `public-lead-${lead.id}`,
          title: "New Public Lead",
          message: `${lead.client_name}${lead.event_name || lead.project_type ? ` - ${lead.event_name || lead.project_type}` : ""}`,
          date: lead.created_at,
          read: false,
          type: "public-lead",
          link: `/leads/${lead.id}`,
        })
      })
    }

    // Sort by date (most urgent first)
    notifications.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    return NextResponse.json(notifications.slice(0, 10))
  } catch (error) {
    console.error("Error fetching notifications:", error)
    return NextResponse.json([])
  }
}
