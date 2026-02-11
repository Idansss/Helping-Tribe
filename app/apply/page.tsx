import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PublicHome } from '@/components/public/PublicHome'

export const dynamic = 'force-dynamic'

export default async function ApplyPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return <PublicHome />
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  const role = (profile?.role as any) ?? 'student'
  if (role === 'admin') redirect('/admin')
  if (role === 'faculty' || role === 'mentor') redirect('/mentor')
  redirect('/learner/dashboard')
}

