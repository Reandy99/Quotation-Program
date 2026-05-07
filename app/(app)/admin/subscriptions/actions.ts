"use server"

import { createClient, createAdminClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function getAdminSubscriptions(search?: string) {
  try {
    const supabase = createAdminClient()

    // Get subscriptions with plan data
    let query = supabase
      .from("subscriptions")
      .select("*, plan:plans(*)")
      .order("created_at", { ascending: false })
      .limit(50)

    const { data, error } = await query
    if (error) {
      console.error("[getAdminSubscriptions] Query error:", error)
      return []
    }

    // Get all profiles to add user info
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, email, full_name")

    const profileMap = new Map(profiles?.map(p => [p.id, p]) ?? [])

    // Merge profiles into subscription data
    const merged = (data ?? []).map((sub: any) => ({
      ...sub,
      profile: profileMap.get(sub.user_id) ?? null
    }))

    if (search) {
      const q = search.toLowerCase()
      return merged.filter((s: any) =>
        s.profile?.email?.toLowerCase().includes(q) ||
        s.profile?.full_name?.toLowerCase().includes(q)
      )
    }

    return merged
  } catch (err) {
    console.error("[getAdminSubscriptions] Exception:", err)
    return []
  }
}

export async function adminUpdateSubscription(
  subscriptionId: string,
  updates: {
    status?: string
    plan_id?: string
    current_period_end?: string | null
    cancelled_at?: string | null
  }
) {
  const supabase = createClient()

  // Verify caller is admin (check email domain or a flag — for MVP, check a hardcoded admin list via env)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const adminEmails = (process.env.ADMIN_EMAILS ?? "").split(",").map(e => e.trim()).filter(Boolean)
  if (!adminEmails.length || !adminEmails.includes(user.email ?? "")) {
    throw new Error("Unauthorized")
  }

  const adminSupabase = createAdminClient()
  const { error } = await adminSupabase
    .from("subscriptions")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", subscriptionId)

  if (error) throw new Error(error.message)
  revalidatePath("/admin/subscriptions")
}
