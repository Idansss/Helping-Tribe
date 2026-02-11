'use client'

import { ReactNode, useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { Menu } from 'lucide-react'
import { useMediaQuery } from '@/hooks/use-media-query'
import { AdminSidebar } from './AdminSidebar'
import { AdminHeader } from './AdminHeader'

interface AdminLayoutProps {
  children: ReactNode
  title?: string
  description?: string
}

export function AdminLayout({
  children,
  title,
  description,
}: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const isDesktop = useMediaQuery(768)
  const pathname = usePathname()

  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  const handleMenuClick = () => {
    if (isDesktop) {
      setSidebarOpen((open) => !open)
    } else {
      setMobileMenuOpen((open) => !open)
    }
  }

  const adminHeaderLeftSlot = (
    <button
      type="button"
      onClick={handleMenuClick}
      className="rounded-lg p-2.5 hover:bg-slate-100 transition-colors touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center"
      aria-label="Toggle menu"
      title="Toggle menu"
    >
      <Menu className="h-5 w-5 text-slate-600" />
    </button>
  )

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex">
      {!isDesktop && mobileMenuOpen && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <AdminSidebar
        collapsed={!sidebarOpen}
        mobileDrawer={!isDesktop}
        drawerOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader
          leftSlot={adminHeaderLeftSlot}
          title={title}
          description={description}
        />

        <main className="flex-1 p-4 md:p-6 space-y-4 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}

