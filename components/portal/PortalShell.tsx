'use client'

import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { MobileBottomNav } from '@/components/navigation/mobile-bottom-nav'
import { GroundingSupportLauncher } from '@/components/lms/GroundingSupportLauncher'
import { cn } from '@/lib/utils/cn'
import { PortalHeader } from './PortalHeader'
import { PortalSidebar } from './PortalSidebar'
import type { PortalRole } from './portal-config'

const SIDEBAR_PREFERENCE_KEY = 'ht-portal-sidebar-collapsed'

/** Routes that own the full viewport beneath the portal header (no document scroll). */
const FULL_VIEWPORT_ROUTES = new Set(['/learner/practice/chat'])

type PortalShellProps = {
  role: PortalRole
  children: ReactNode
}

export function PortalShell({ role, children }: PortalShellProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [transitionsReady, setTransitionsReady] = useState(false)
  const isFullViewport = FULL_VIEWPORT_ROUTES.has(pathname)

  useEffect(() => {
    try {
      setCollapsed(window.localStorage.getItem(SIDEBAR_PREFERENCE_KEY) === 'true')
    } catch {
      setCollapsed(false)
    }
    const frame = window.requestAnimationFrame(() => setTransitionsReady(true))
    return () => window.cancelAnimationFrame(frame)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  function updateCollapsed(next: boolean) {
    setCollapsed(next)
    try {
      window.localStorage.setItem(SIDEBAR_PREFERENCE_KEY, String(next))
    } catch {
      // The preference is optional when storage is unavailable.
    }
  }

  return (
    <div
      className={cn(
        'portal-shell flex bg-background text-foreground',
        isFullViewport ? 'h-dvh max-h-dvh overflow-hidden' : 'min-h-dvh'
      )}
    >
      <PortalSidebar
        role={role}
        collapsed={collapsed}
        onCollapsedChange={updateCollapsed}
        mobileOpen={mobileOpen}
        onMobileOpenChange={setMobileOpen}
        transitionsReady={transitionsReady}
      />
      <div
        className={cn(
          'flex min-w-0 flex-1 flex-col',
          isFullViewport ? 'h-dvh max-h-dvh overflow-hidden' : 'min-h-dvh'
        )}
      >
        <PortalHeader
          role={role}
          collapsed={collapsed}
          onToggleCollapsed={() => updateCollapsed(!collapsed)}
          onOpenMobileNavigation={() => setMobileOpen(true)}
        />
        <main
          id="main-content"
          className={cn(
            'portal-main min-w-0 flex-1 bg-background',
            isFullViewport
              ? 'flex min-h-0 flex-col overflow-hidden p-0'
              : 'px-4 py-5 pb-[calc(6rem+env(safe-area-inset-bottom))] sm:px-6 sm:py-6 lg:px-8 lg:pb-8'
          )}
        >
          <div
            className={cn(
              'portal-content w-full',
              isFullViewport
                ? 'flex min-h-0 flex-1 flex-col'
                : 'mx-auto max-w-[100rem] animate-in fade-in duration-[var(--motion-page)] motion-reduce:animate-none'
            )}
          >
            {children}
          </div>
        </main>
      </div>
      {role === 'learner' ? (
        <>
          <MobileBottomNav />
          {!isFullViewport ? <GroundingSupportLauncher /> : null}
        </>
      ) : null}
    </div>
  )
}

