'use client'

import { ReactNode, useState } from 'react'
import { Menu } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { LearnerSidebar } from './LearnerSidebar'

interface LearnerLayoutProps {
  children: ReactNode
  /** Optional page title for header */
  title?: string
  /** Optional description below title */
  description?: string
}

export function LearnerLayout({
  children,
  title,
  description,
}: LearnerLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      <LearnerSidebar collapsed={!sidebarOpen} />

      {/* Main content area: offset by sidebar width so it doesn't sit under fixed sidebar */}
      <div
        className={cn(
          'flex flex-1 flex-col min-w-0 transition-[margin] duration-300',
          sidebarOpen ? 'ml-56' : 'ml-14'
        )}
      >
        {/* Top bar with menu toggle */}
        <header className="sticky top-0 z-30 flex h-14 flex-shrink-0 items-center gap-4 border-b border-slate-200 bg-white px-4 shadow-sm">
          <button
            type="button"
            onClick={() => setSidebarOpen((open) => !open)}
            className="rounded-lg p-2.5 text-slate-600 transition-colors hover:bg-slate-100"
            aria-label="Toggle sidebar"
            title="Toggle sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>
          {title && (
            <div className="min-w-0">
              <h1 className="truncate text-lg font-semibold text-slate-900">
                {title}
              </h1>
              {description && (
                <p className="truncate text-sm text-slate-500">{description}</p>
              )}
            </div>
          )}
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
