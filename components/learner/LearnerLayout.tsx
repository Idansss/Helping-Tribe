'use client'

import { ReactNode, useState } from 'react'
import { cn } from '@/lib/utils/cn'
import { LearnerSidebar } from './LearnerSidebar'
import { LearnerHeader } from './LearnerHeader'

interface LearnerLayoutProps {
  children: ReactNode
}

export function LearnerLayout({ children }: LearnerLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      <LearnerSidebar
        collapsed={!sidebarOpen}
        onMenuClick={() => setSidebarOpen((o) => !o)}
      />

      <div
        className={cn(
          'flex flex-1 flex-col min-w-0 transition-[margin] duration-200',
          sidebarOpen ? 'ml-64' : 'ml-16'
        )}
      >
        <LearnerHeader />
        <main className="flex-1 overflow-y-auto p-6 bg-white">
          {children}
        </main>
      </div>
    </div>
  )
}
