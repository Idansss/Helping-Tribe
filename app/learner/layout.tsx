import type { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { LearnerLayout } from '@/components/learner/LearnerLayout'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default function LearnerRootLayout({
  children,
}: {
  children: ReactNode
}) {
  return <LearnerGate>{children}</LearnerGate>
}

async function LearnerGate({ children }: { children: ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/apply')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  const role = (profile?.role as any) ?? 'student'
  if (role === 'admin') redirect('/admin')
  if (role === 'faculty' || role === 'mentor') redirect('/mentor')

  return <LearnerLayout>{children}</LearnerLayout>
}
