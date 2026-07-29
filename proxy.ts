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
    // Next's generated metadata images (opengraph-image, twitter-image) have no
    // file extension, so they fell through to the auth gate and were redirected
    // to "/" — social crawlers got HTML instead of a preview card. They are
    // public assets and must not run session logic.
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|opengraph-image|twitter-image|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map)$).*)',
  ],
}
