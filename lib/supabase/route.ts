import { createServerClient } from '@supabase/ssr'
import type { NextRequest } from 'next/server'

type CookieToSet = { name: string; value: string; options: any }

export function createRouteClient(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY')
  }

  const cookiesToSet: CookieToSet[] = []

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookies) {
        cookies.forEach((c) => cookiesToSet.push(c))
      },
    },
  })

  return { supabase, cookiesToSet }
}

