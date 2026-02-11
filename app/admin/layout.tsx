import type { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { createClient } from '@/lib/supabase/server'
import { isAllowedAdmin, resolvePortalRole } from '@/lib/auth/admin'

export const dynamic = 'force-dynamic'

export default function AdminRootLayout({
  children,
}: {
  children: ReactNode
}) {
  return <AdminGate>{children}</AdminGate>
}

async function AdminGate({ children }: { children: ReactNode }) {
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

  if (!isAllowedAdmin(profile?.role, user.email)) {
    const fallbackRole = resolvePortalRole(profile?.role, user.email)
    if (fallbackRole === 'mentor') redirect('/mentor')
    redirect('/learner/dashboard')
  }

  return <AdminLayout>{children}</AdminLayout>
}

