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

    // Step 4: Check Xendit key
    results.xendit_key_set = !!process.env.XENDIT_SECRET_KEY

  } catch (e: any) {
    results.exception = e.message
  }

  return NextResponse.json(results)
}
