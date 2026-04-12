import { type NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function proxy(request: NextRequest) {
  const canonicalBase = (process.env.BASE_URL || '').trim().replace(/\/$/, '')
  const host =
    request.headers.get('x-forwarded-host')?.split(',')[0]?.trim() ||
    request.headers.get('host')?.split(',')[0]?.trim() ||
    ''

  if (
    canonicalBase &&
    host &&
    /\.vercel\.app$/i.test(host)
  ) {
    const redirectUrl = new URL(request.nextUrl.pathname + request.nextUrl.search, canonicalBase)
    return NextResponse.redirect(redirectUrl, 308)
  }

  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map)$).*)',
  ],
}
