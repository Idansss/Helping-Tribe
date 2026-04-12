import type { Metadata } from 'next'
import { PublicHome } from '@/components/public/PublicHome'
import { PROGRAM_FULL_NAME } from '@/lib/brand/program'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = {
  title: `Apply | ${PROGRAM_FULL_NAME}`,
  description:
    'Start your application, save your progress securely, and return later with a secure resume link.',
  alternates: {
    canonical: '/apply',
  },
}

export default function ApplyPage() {
  return <PublicHome />
}
