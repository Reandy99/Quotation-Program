import { createAdminClient, createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    // Verify caller is an authenticated admin
    const supabaseUser = createClient()
    const { data: { user }, error: authError } = await supabaseUser.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const adminEmails = (process.env.ADMIN_EMAILS ?? "").split(",").map(e => e.trim()).filter(Boolean)
    if (!adminEmails.length || !adminEmails.includes(user.email ?? "")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Check if service role key exists
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!serviceRoleKey) {
      return NextResponse.json({
        error: "SUPABASE_SERVICE_ROLE_KEY not set",
        env_check: {
          has_service_role_key: false,
          admin_emails: process.env.ADMIN_EMAILS || "not set",
        }
      }, { status: 500 })
    }

    const supabase = createAdminClient()

    // Get subscriptions
    const { data: subs, error: subError } = await supabase
      .from("subscriptions")
      .select("*, plan:plans(*)")
      .order("created_at", { ascending: false })
      .limit(50)

    if (subError) {
      return NextResponse.json({
        error: subError.message,
        details: subError,
      }, { status: 500 })
    }

    // Get all profiles
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, email, full_name")

    const profileMap = new Map(profiles?.map((p: any) => [p.id, p]) ?? [])
    const merged = (subs ?? []).map((sub: any) => ({
      ...sub,
      profile: profileMap.get(sub.user_id) ?? null
    }))

    return NextResponse.json({
      success: true,
      count: merged.length,
      data: merged,
      env_check: {
        has_service_role_key: true,
        admin_emails: process.env.ADMIN_EMAILS || "not set",
      }
    })
  } catch (err: any) {
    return NextResponse.json({
      error: err.message,
      stack: err.stack,
      env_check: {
        has_service_role_key: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        admin_emails: process.env.ADMIN_EMAILS || "not set",
      }
    }, { status: 500 })
  }
}
