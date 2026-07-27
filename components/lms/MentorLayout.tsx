'use client'

import type { ReactNode } from 'react'
import { PortalShell } from '@/components/portal/PortalShell'

interface MentorLayoutProps {
  children: ReactNode
}

export function MentorLayout({ children }: MentorLayoutProps) {
  return <PortalShell role="mentor">{children}</PortalShell>
}

