'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LogoutPage() {
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    async function logout() {
      await supabase.auth.signOut()
      router.push('/')
      router.refresh()
    }
    logout()
  }, [supabase, router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-muted-foreground">Signing out...</p>
    </div>
  )
}
