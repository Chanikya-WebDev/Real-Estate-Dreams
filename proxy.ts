// proxy.ts  ← root level (same location as middleware.ts was)
// ─────────────────────────────────────────────────────────
// Next.js 16 replacement for middleware.ts
// Runs at the edge BEFORE the page renders
// Handles: admin auth guard + session refresh
// ─────────────────────────────────────────────────────────
import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ── KEY FIX ─────────────────────────────────────────────
  // Forward pathname as request header so (admin)/layout.tsx
  // can read it via headers() and skip auth for /admin/login
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-pathname', pathname)
 
    let response = NextResponse.next({
    request: { headers: requestHeaders },  
  })

  // Create Supabase client that reads/writes edge cookies
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // Write cookies to both request and response
          // so the session is refreshed for the current request
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({
            request: { headers: requestHeaders }, 
          })
        },
      },
    }
  )

  // Refresh session — must use getUser() not getSession()
  // getSession() only reads cookie (can be faked)
  // getUser() validates with Supabase Auth server (safe)
  const { data: { user } } = await supabase.auth.getUser()

  // const { pathname } = request.nextUrl
  const isAdminRoute = pathname.startsWith('/admin')
  const isLoginPage = pathname === '/admin/login'

  // Not logged in + accessing admin → redirect to login
  if (!user && isAdminRoute && !isLoginPage) {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  // Already logged in + visiting login page → redirect to dashboard
  if (user && isLoginPage) {
    return NextResponse.redirect(new URL('/admin', request.url))
  }

  return response
}

// Only run proxy on admin routes
// Public pages are never intercepted = maximum performance
export const config = {
  matcher: ['/admin/:path*'],
}
