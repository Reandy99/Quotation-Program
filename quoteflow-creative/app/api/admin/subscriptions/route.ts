import { createAdminClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
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

    const { data, error } = await supabase
      .from("subscriptions")
      .select("*, plan:plans(*), profile:profiles(email, full_name)")
      .order("created_at", { ascending: false })
      .limit(50)

    if (error) {
      return NextResponse.json({
        error: error.message,
        details: error,
        env_check: {
          has_service_role_key: true,
          admin_emails: process.env.ADMIN_EMAILS || "not set",
        }
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      count: data?.length ?? 0,
      data: data ?? [],
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
