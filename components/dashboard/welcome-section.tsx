'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function WelcomeSection() {
  const [userName, setUserName] = useState('Student')
  const supabase = createClient()

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single()
        
        if (profile?.full_name) {
          setUserName(profile.full_name)
        }
      }
    }
    loadUser()
  }, [supabase])

  return (
    <div className="space-y-2">
      <h1 className="text-3xl font-bold">Welcome back, {userName}!</h1>
      <p className="text-muted-foreground">
        Continue your journey in the HELP Foundations Training
      </p>
    </div>
  )
}
