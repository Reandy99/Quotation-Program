import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"
import { env } from "@/lib/env"

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isAuthPage = request.nextUrl.pathname.startsWith("/login") || 
                     request.nextUrl.pathname.startsWith("/signup")
  const isAppPage = request.nextUrl.pathname.startsWith("/dashboard") ||
                    request.nextUrl.pathname.startsWith("/leads") ||
                    request.nextUrl.pathname.startsWith("/clients") ||
                    request.nextUrl.pathname.startsWith("/quotations") ||
                    request.nextUrl.pathname.startsWith("/invoices") ||
                    request.nextUrl.pathname.startsWith("/follow-ups") ||
                    request.nextUrl.pathname.startsWith("/settings") ||
                    request.nextUrl.pathname.startsWith("/calendar") ||
                    request.nextUrl.pathname.startsWith("/reports")

  if (!user && isAppPage) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  if (user && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
