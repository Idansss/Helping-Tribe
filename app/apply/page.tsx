import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PublicHome } from '@/components/public/PublicHome'
import { resolvePortalRole } from '@/lib/auth/admin'

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

  const portalRole = resolvePortalRole(profile?.role, user.email)
  if (portalRole === 'admin') redirect('/admin')
  if (portalRole === 'mentor') redirect('/mentor')
  redirect('/learner/dashboard')
}
