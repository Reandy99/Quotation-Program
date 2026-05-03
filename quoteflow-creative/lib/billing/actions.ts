"use server"

import { createClient } from "@/lib/supabase/server"
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
