'use client'

import type { ReactNode } from 'react'
import { PortalShell } from '@/components/portal/PortalShell'

interface AdminLayoutProps {
  children: ReactNode
  title?: string
  description?: string
}

/** @deprecated Route titles are resolved centrally by PortalShell. */
export function AdminLayout({ children }: AdminLayoutProps) {
  return <PortalShell role="admin">{children}</PortalShell>
}

