import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET() {
  return NextResponse.json({
    env_check: {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || "NOT SET",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "SET (hidden)" : "NOT SET",
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? "SET (hidden)" : "NOT SET",
      ADMIN_EMAILS: process.env.ADMIN_EMAILS || "NOT SET",
      NODE_ENV: process.env.NODE_ENV,
    }
  })
}
