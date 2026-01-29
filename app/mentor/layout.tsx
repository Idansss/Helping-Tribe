'use client'

import type { ReactNode } from 'react'
import { MentorLayout as MentorLayoutComponent } from '@/components/lms/MentorLayout'

export default function MentorRootLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <MentorLayoutComponent>{children}</MentorLayoutComponent>
  )
}
