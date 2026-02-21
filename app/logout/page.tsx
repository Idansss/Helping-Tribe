'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LogoutPage() {
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    async function logout() {
      await supabase.auth.signOut()
      router.push('/apply')
      router.refresh()
    }
    logout()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-muted-foreground">Signing out...</p>
    </div>
  )
}
