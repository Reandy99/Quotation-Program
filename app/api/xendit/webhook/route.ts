import { NextResponse, type NextRequest } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"
import { verifyXenditWebhook } from "@/lib/xendit/client"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  const callbackToken = request.headers.get("x-callback-token") ?? ""
  if (!verifyXenditWebhook(callbackToken)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  if (!body || !body.external_id || !body.status) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
  }

  const { external_id, status, paid_amount, payment_method } = body

  if (status !== "PAID" && status !== "SETTLED") {
    return NextResponse.json({ received: true, action: "ignored" })
  }

  const supabase = createAdminClient()

  // Subscription payment (external_id dimulai dengan "sub-")
  if (external_id.startsWith("sub-")) {
    const { data: billingPayment } = await supabase
      .from("billing_payments")
      .select("id, user_id, plan_id, period_start, period_end, status")
      .eq("gateway_payment_id", external_id)
      .single()

    if (!billingPayment || billingPayment.status === "paid") {
      return NextResponse.json({ received: true, action: "ignored" })
    }

    const now = new Date().toISOString()
    const periodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()

    await Promise.all([
      supabase
        .from("billing_payments")
        .update({ status: "paid", paid_at: now })
        .eq("id", billingPayment.id),
      supabase
        .from("subscriptions")
        .update({
          plan_id: billingPayment.plan_id,
          status: "active",
          current_period_start: now,
          current_period_end: periodEnd,
          updated_at: now,
        })
        .eq("user_id", billingPayment.user_id),
    ])

    return NextResponse.json({ received: true, action: "subscription_activated" })
  }

  // Invoice payment (existing logic)
  const { data: invoice, error: fetchError } = await supabase
    .from("invoices")
    .select("id, grand_total, status")
    .eq("payment_order_id", external_id)
    .single()

  if (fetchError || !invoice) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 })
  }

  if (invoice.status === "Paid") {
    return NextResponse.json({ received: true, action: "already_paid" })
  }

  const paidAmount = Number(paid_amount) || Number(invoice.grand_total)

  const [updateResult, insertResult] = await Promise.all([
    supabase
      .from("invoices")
      .update({ status: "Paid", paid_amount: paidAmount } as Record<string, unknown>)
      .eq("id", invoice.id),
    supabase.from("payments").insert({
      invoice_id: invoice.id,
      amount: paidAmount,
      payment_method: payment_method ?? "Xendit",
      payment_date: new Date().toISOString().split("T")[0],
      notes: `Dibayar via Xendit`,
    }),
  ])

  if (updateResult.error) {
    console.error("Xendit webhook update error:", updateResult.error)
    return NextResponse.json({ error: "DB update failed" }, { status: 500 })
  }

  if (insertResult.error) {
    console.error("Xendit webhook payment insert error:", insertResult.error)
  }

  return NextResponse.json({ received: true, action: "invoice_paid" })
}
