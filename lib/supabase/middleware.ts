import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  // Check if Supabase credentials are available
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('[v0] Supabase environment variables not configured.')
    console.warn('[v0] NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓ set' : '✗ missing')
    console.warn('[v0] NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✓ set' : '✗ missing')
    return supabaseResponse
  }

  // Validate URL format
  if (!supabaseUrl.startsWith('https://') && !supabaseUrl.startsWith('http://')) {
    console.warn('[v0] Invalid NEXT_PUBLIC_SUPABASE_URL - must start with https:// or http://')
    return supabaseResponse
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  // Do not run code between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Protect dashboard routes - redirect to login if not authenticated
  if (
    request.nextUrl.pathname.startsWith('/dashboard') &&
    !user
  ) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    return NextResponse.redirect(url)
  }

  // Protect admin routes - redirect to login if not authenticated
  if (
    request.nextUrl.pathname.startsWith('/admin') &&
    !user
  ) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    return NextResponse.redirect(url)
  }

  // If authenticated user tries to access admin but is not admin, redirect to dashboard
  if (
    request.nextUrl.pathname.startsWith('/admin') &&
    user
  ) {
    const isAdmin = user.user_metadata?.role === 'admin'
    if (!isAdmin) {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }
  }

  // If authenticated user tries to access auth pages, redirect appropriately
  if (
    request.nextUrl.pathname.startsWith('/auth') &&
    user
  ) {
    const isAdmin = user.user_metadata?.role === 'admin'
    const url = request.nextUrl.clone()
    url.pathname = isAdmin ? '/admin' : '/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
