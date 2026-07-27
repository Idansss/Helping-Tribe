'use client'

import type { ReactNode } from 'react'
import { PortalShell } from '@/components/portal/PortalShell'

interface LearnerLayoutProps {
  children: ReactNode
}

export function LearnerLayout({ children }: LearnerLayoutProps) {
  return <PortalShell role="learner">{children}</PortalShell>
}
