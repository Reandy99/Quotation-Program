import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { env } from "@/lib/env"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"

export function createClient() {
  const cookieStore = cookies()
  return createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: Record<string, unknown> }>) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options as any)
            )
          } catch {}
        },
      },
    }
  )
}

export function createAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) {
    console.error("[createAdminClient] SUPABASE_SERVICE_ROLE_KEY not set")
    throw new Error("SUPABASE_SERVICE_ROLE_KEY not set")
  }
  
  const url = env.NEXT_PUBLIC_SUPABASE_URL
  console.log("[createAdminClient] Creating admin client with URL:", url)
  
  return createSupabaseClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}
