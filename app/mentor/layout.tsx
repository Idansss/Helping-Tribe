import type { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { MentorLayout as MentorLayoutComponent } from '@/components/lms/MentorLayout'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default function MentorRootLayout({
  children,
}: {
  children: ReactNode
}) {
  return <MentorGate>{children}</MentorGate>
}

async function MentorGate({ children }: { children: ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/apply')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  // Allow faculty to use mentor portal (legacy schema uses 'faculty' for mentors).
  if (
    profile?.role !== 'mentor' &&
    profile?.role !== 'faculty' &&
    profile?.role !== 'admin'
  ) {
    redirect('/')
  }

  return <MentorLayoutComponent>{children}</MentorLayoutComponent>
}
