'use client'

import { ReactNode, useState } from 'react'
import { Menu } from 'lucide-react'
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

  const adminHeaderLeftSlot = (
    <button
      onClick={() => setSidebarOpen((open) => !open)}
      className="p-2.5 hover:bg-slate-100 rounded-lg transition-colors"
      aria-label="Toggle sidebar"
      title="Toggle sidebar"
    >
      <Menu className="h-5 w-5 text-slate-600" />
    </button>
  )

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex">
      <AdminSidebar collapsed={!sidebarOpen} />

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

