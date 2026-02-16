import { createClient } from '@/lib/supabase/server'
import { resolvePortalRole } from '@/lib/auth/admin'
import { UnifiedHomepage } from '@/components/public/UnifiedHomepage'
import { PROGRAM_FULL_NAME } from '@/lib/brand/program'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: `${PROGRAM_FULL_NAME} | The Helping Tribe`,
}

export default async function HomePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let portalHref: string | null = null

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()

    const portalRole = resolvePortalRole(profile?.role, user.email)
    if (portalRole === 'admin') portalHref = '/admin'
    else if (portalRole === 'mentor') portalHref = '/mentor'
    else portalHref = '/learner/dashboard'
  }

  return <UnifiedHomepage portalHref={portalHref} />
}
