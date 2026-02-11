import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { isPublicPath, unauthenticatedRedirectTarget } from '@/lib/auth/gate'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  const pathname = request.nextUrl.pathname
  const isApiRoute = pathname.startsWith('/api/')
  const isPublic = isPublicPath(pathname)
  const isAnyLoginPage = pathname === '/student/login' || pathname === '/staff/login'

  const urlToApply = () => {
    const url = request.nextUrl.clone()
    url.pathname = unauthenticatedRedirectTarget()
    url.search = ''
    return url
  }

  // Hard gate rule: the root URL must always land on /apply.
  if (pathname === '/') {
    return NextResponse.redirect(urlToApply())
  }

  // Performance: if there are no Supabase auth cookies, we know there's no session.
  const hasAuthCookie = request.cookies.getAll().some((c) => c.name.startsWith('sb-'))

  if (!supabaseUrl || !supabaseAnonKey) {
    if (isPublic) return supabaseResponse

    if (isApiRoute) {
      return NextResponse.json(
        { error: 'Auth not configured' },
        { status: 500 }
      )
    }

    return NextResponse.redirect(urlToApply())
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
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it so that the
  // middleware and server-side code are using two different Supabase
  // clients!

  const user = hasAuthCookie ? (await supabase.auth.getUser()).data.user : null

  if (user && isAnyLoginPage) {
    const requestedRedirect = request.nextUrl.searchParams.get('redirectTo')
    let safeRedirect =
      requestedRedirect && requestedRedirect.startsWith('/') && !requestedRedirect.startsWith('//')
        ? requestedRedirect
        : ''

    if (!safeRedirect) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle()

      const role = String((profile as any)?.role ?? '').toLowerCase()
      if (role === 'admin') safeRedirect = '/admin'
      else if (role === 'mentor' || role === 'faculty') safeRedirect = '/mentor'
      else safeRedirect = '/learner/dashboard'
    }

    const url = request.nextUrl.clone()
    const [safePath, safeQuery] = safeRedirect.split('?')
    url.pathname = safePath
    url.search = safeQuery ? `?${safeQuery}` : ''

    const response = NextResponse.redirect(url)
    supabaseResponse.cookies.getAll().forEach((cookie) => response.cookies.set(cookie))
    return response
  }

  if (!user && !isPublic) {
    if (isApiRoute) {
      const response = NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      supabaseResponse.cookies.getAll().forEach((cookie) => response.cookies.set(cookie))
      return response
    }

    const response = NextResponse.redirect(urlToApply())
    supabaseResponse.cookies.getAll().forEach((cookie) => response.cookies.set(cookie))
    return response
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
  // creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse
}
