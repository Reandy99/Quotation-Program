"use server"

import { createClient, createAdminClient } from "@/lib/supabase/server"
import { createXenditInvoice } from "@/lib/xendit/client"
import type { Subscription, BillingPayment, Plan } from "@/types"

export async function getSubscription(): Promise<Subscription | null> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from("subscriptions")
    .select("*, plan:plans(*)")
    .eq("user_id", user.id)
    .single()

  return data ?? null
}

export async function getPaymentHistory(): Promise<BillingPayment[]> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from("billing_payments")
    .select("*, plan:plans(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20)

  return data ?? []
}

export async function getPlans(): Promise<Plan[]> {
  const supabase = createClient()
  const { data } = await supabase
    .from("plans")
    .select("*")
    .eq("is_active", true)
    .order("price_idr", { ascending: true })

  return data ?? []
}

export async function createSubscriptionPaymentLink(): Promise<{ paymentUrl?: string; error?: string }> {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return { error: "Authentication required" }

    // Cek apakah sudah active
    const { data: existing } = await supabase
      .from("subscriptions")
      .select("status")
      .eq("user_id", user.id)
      .single()
    if (existing?.status === "active") return { error: "Kamu sudah berlangganan Pro." }

    // Ambil Pro plan
    const { data: plan, error: planError } = await supabase
      .from("plans")
      .select("id, price_idr, name")
      .eq("slug", "pro")
      .single()
    if (planError || !plan) return { error: "Pro plan tidak ditemukan di database." }

    const externalId = `sub-${user.id.slice(0, 8)}-${Date.now()}`
    const amount = plan.price_idr ?? 99000
    const periodStart = new Date().toISOString()
    const periodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()

    const adminSupabase = createAdminClient()

    // Buat Xendit invoice dulu — baru simpan ke DB kalau berhasil
    let xenditInvoice
    try {
      xenditInvoice = await createXenditInvoice({
        externalId,
        amount,
        payerEmail: user.email,
        description: `FrameFlow Pro - 1 bulan (${user.email})`,
      })
    } catch (xenditError: any) {
      console.error("[createSubscriptionPaymentLink] Xendit error:", xenditError?.message)
      return { error: `Gagal menghubungi payment gateway: ${xenditError.message}` }
    }

    // Xendit berhasil — simpan payment record
    const { error: insertError } = await adminSupabase
      .from("billing_payments")
      .insert({
        user_id: user.id,
        plan_id: plan.id,
        amount_idr: amount,
        status: "pending",
        gateway: "xendit",
        gateway_payment_id: externalId,
        gateway_invoice_url: xenditInvoice.invoice_url,
        period_start: periodStart,
        period_end: periodEnd,
      })
      .select("id")
      .single()

    if (insertError) {
      console.error("[createSubscriptionPaymentLink] Insert error:", insertError.message)
      return { error: "Gagal menyimpan data pembayaran. Coba lagi." }
    }

    return { paymentUrl: xenditInvoice.invoice_url }
  } catch (error: any) {
    console.error("[createSubscriptionPaymentLink]", error?.message ?? error)
    return { error: error.message || "Terjadi kesalahan tidak terduga." }
  }
}
