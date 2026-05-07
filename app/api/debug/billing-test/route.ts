import { NextResponse } from "next/server"
import { createClient, createAdminClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export async function GET() {
  const results: Record<string, any> = {}

  try {
    const supabase = createClient()
    const adminSupabase = createAdminClient()

    // Step 1: Auth
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    results.auth = { userId: user?.id ?? null, error: authError?.message ?? null }
    if (!user) return NextResponse.json(results)

    // Step 2: Get pro plan
    const { data: plan, error: planError } = await supabase
      .from("plans")
      .select("id, name, slug, price_idr")
      .eq("slug", "pro")
      .single()
    results.plan = { data: plan, error: planError?.message ?? null }
    if (!plan) return NextResponse.json(results)

    // Step 3: Test billing_payments insert (dry run - kita rollback)
    const testId = `sub-test-${Date.now()}`
    const { data: payment, error: insertError } = await adminSupabase
      .from("billing_payments")
      .insert({
        user_id: user.id,
        plan_id: plan.id,
        amount_idr: plan.price_idr ?? 49000,
        status: "pending",
        gateway: "xendit",
        gateway_payment_id: testId,
      })
      .select("id")
      .single()

    results.insert = { data: payment, error: insertError?.message ?? null }

    // Cleanup test record
    if (payment) {
      await adminSupabase.from("billing_payments").delete().eq("id", payment.id)
      results.insert.cleaned_up = true
    }

    // Step 4: Check Xendit key + test API call
    const xenditKey = process.env.XENDIT_SECRET_KEY
    results.xendit_key_set = !!xenditKey
    results.xendit_key_length = xenditKey?.length ?? 0
    results.xendit_key_has_newline = xenditKey?.includes("\n") ?? false

    if (xenditKey) {
      const authHeader = "Basic " + Buffer.from(xenditKey.trim() + ":").toString("base64")
      const testRes = await fetch("https://api.xendit.co/v2/invoices", {
        method: "POST",
        headers: { Authorization: authHeader, "Content-Type": "application/json" },
        body: JSON.stringify({
          external_id: `debug-test-${Date.now()}`,
          amount: 10000,
          description: "Debug test - akan diabaikan",
          currency: "IDR",
        }),
      })
      const xenditBody = await testRes.json().catch(() => ({}))
      results.xendit_test = {
        status: testRes.status,
        ok: testRes.ok,
        body: xenditBody,
      }
    }

  } catch (e: any) {
    results.exception = e.message
  }

  return NextResponse.json(results)
}
