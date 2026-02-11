'use client'

import { ReactNode, useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils/cn'
import { useMediaQuery } from '@/hooks/use-media-query'
import { LearnerSidebar } from './LearnerSidebar'
import { LearnerHeader } from './LearnerHeader'

interface LearnerLayoutProps {
  children: ReactNode
}

export function LearnerLayout({ children }: LearnerLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const isDesktop = useMediaQuery(768)
  const pathname = usePathname()

  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      {/* Mobile drawer backdrop */}
      {!isDesktop && mobileMenuOpen && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <LearnerSidebar
        collapsed={!sidebarOpen}
        onMenuClick={isDesktop ? () => setSidebarOpen((o) => !o) : undefined}
        mobileDrawer={!isDesktop}
        drawerOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      <div
        className={cn(
          'flex flex-1 flex-col min-w-0 transition-[margin] duration-200',
          isDesktop ? (sidebarOpen ? 'ml-64' : 'ml-16') : 'ml-0'
        )}
      >
        <LearnerHeader
          onMenuClick={!isDesktop ? () => setMobileMenuOpen(true) : undefined}
        />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-white">
          {children}
        </main>
      </div>
    </div>
  )
}
