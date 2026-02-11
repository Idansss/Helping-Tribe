import type { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { createClient } from '@/lib/supabase/server'

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

  if (profile?.role !== 'admin') {
    redirect('/')
  }

  return <AdminLayout>{children}</AdminLayout>
}

