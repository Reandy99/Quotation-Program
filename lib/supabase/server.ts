import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { env } from "@/lib/env"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"

// Preview mode detection
const isPreviewMode = env.NEXT_PUBLIC_SUPABASE_URL.includes('localhost')

export function createClient() {
  const cookieStore = cookies()
  
  // Return a mock client in preview mode to avoid slow timeouts
  if (isPreviewMode) {
    return {
      from: (table: string) => ({
        select: () => ({
          eq: () => ({ data: null, error: { message: 'Preview mode', code: 'PREVIEW' } }),
          single: () => ({ data: null, error: { message: 'Preview mode', code: 'PREVIEW' } }),
          order: () => ({ data: [], error: { message: 'Preview mode', code: 'PREVIEW' } }),
          limit: () => ({ data: [], error: { message: 'Preview mode', code: 'PREVIEW' } }),
          like: () => ({ 
            order: () => ({ 
              limit: () => ({ data: [], error: null })
            })
          }),
          data: [],
          error: { message: 'Preview mode', code: 'PREVIEW' }
        }),
        insert: () => ({
          select: () => ({
            single: () => ({ data: null, error: { message: 'Preview mode', code: 'PREVIEW' } }),
            data: null,
            error: { message: 'Preview mode', code: 'PREVIEW' }
          }),
          data: null,
          error: { message: 'Preview mode', code: 'PREVIEW' }
        }),
        update: () => ({
          eq: () => ({ data: null, error: { message: 'Preview mode', code: 'PREVIEW' } }),
          data: null,
          error: { message: 'Preview mode', code: 'PREVIEW' }
        }),
        delete: () => ({
          eq: () => ({ data: null, error: { message: 'Preview mode', code: 'PREVIEW' } }),
          data: null,
          error: { message: 'Preview mode', code: 'PREVIEW' }
        })
      }),
      auth: {
        getUser: async () => ({ data: { user: null }, error: null })
      },
      storage: {
        from: () => ({
          upload: () => ({ data: null, error: { message: 'Preview mode' } }),
          getPublicUrl: () => ({ data: { publicUrl: '' } })
        })
      }
    } as any
  }
  
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
