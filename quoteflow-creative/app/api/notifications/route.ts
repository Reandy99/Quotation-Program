import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

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
      .from("leads")
      .select("id, client_name, follow_up_date")
      .eq("user_id", user.id)
      .not("follow_up_date", "is", null)
      .gte("follow_up_date", now.split("T")[0])
      .lte("follow_up_date", twoDaysFromNow.split("T")[0])
      .order("follow_up_date", { ascending: true })
      .limit(5)

    const notifications: any[] = []

    // Add invoice notifications
    if (overdueInvoices) {
      overdueInvoices.forEach((inv) => {
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
      expiringQuotes.forEach((quote) => {
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
      upcomingFollowUps.forEach((lead) => {
        const isToday = lead.follow_up_date === now.split("T")[0]
        notifications.push({
          id: `followup-${lead.id}`,
          title: isToday ? "Follow-up Due Today" : "Follow-up Due Soon",
          message: lead.client_name,
          date: lead.follow_up_date,
          read: false,
          type: "follow-up",
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
