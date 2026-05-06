import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"
import { verifyWebhookSignature } from "@/lib/midtrans/client"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      order_id,
      status_code,
      gross_amount,
      signature_key,
      transaction_status,
      payment_type,
    } = body as {
      order_id: string
      status_code: string
      gross_amount: string
      signature_key: string
      transaction_status: string
      payment_type: string
    }

    if (!order_id || !status_code || !gross_amount || !signature_key || !transaction_status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (!verifyWebhookSignature(order_id, status_code, gross_amount, signature_key)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    }

    if (transaction_status !== "settlement" && transaction_status !== "capture") {
      return NextResponse.json({ received: true })
    }

    const supabase = createAdminClient()

    const { data: invoice } = await supabase
      .from("invoices")
      .select("id, status, grand_total, paid_amount, user_id")
      .eq("midtrans_order_id", order_id)
      .single()

    if (!invoice || invoice.status === "Paid") {
      return NextResponse.json({ received: true })
    }

    const methodMap: Record<string, string> = {
      bank_transfer: "Transfer",
      qris: "QRIS",
      gopay: "QRIS",
      shopeepay: "QRIS",
      credit_card: "Transfer",
    }
    const method = methodMap[payment_type] ?? "Transfer"
    const remaining = Number(invoice.grand_total) - Number(invoice.paid_amount)

    const [invoiceUpdate, paymentInsert] = await Promise.all([
      supabase
        .from("invoices")
        .update({
          status: "Paid",
          paid_amount: invoice.grand_total,
          updated_at: new Date().toISOString(),
        })
        .eq("id", invoice.id),
      supabase.from("payments").insert({
        invoice_id: invoice.id,
        user_id: invoice.user_id,
        amount: remaining,
        method,
        date: new Date().toISOString().split("T")[0],
        notes: `Dibayar via Midtrans (${payment_type})`,
      }),
    ])

    if (invoiceUpdate.error) {
      console.error("[Midtrans Webhook] Failed to update invoice:", invoiceUpdate.error)
      throw new Error(invoiceUpdate.error.message)
    }
    if (paymentInsert.error) {
      console.error("[Midtrans Webhook] Failed to insert payment:", paymentInsert.error)
      throw new Error(paymentInsert.error.message)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("[Midtrans Webhook] Error:", error)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
