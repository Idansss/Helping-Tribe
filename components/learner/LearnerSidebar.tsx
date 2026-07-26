'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { PORTAL_ICONS } from '@/components/navigation/portal-icons'
import { isPortalNavItemActive, LEARNER_NAV_GROUPS } from '@/lib/navigation/portal'
import { cn } from '@/lib/utils/cn'

interface LearnerSidebarProps {
  collapsed?: boolean
  onMenuClick?: () => void
  mobileDrawer?: boolean
  drawerOpen?: boolean
  onClose?: () => void
}

export function LearnerSidebar({ collapsed = false, onMenuClick, mobileDrawer = false, drawerOpen = false, onClose }: LearnerSidebarProps) {
  const pathname = usePathname()
  const showCollapsed = !mobileDrawer && collapsed
  const showExpanded = mobileDrawer || !collapsed

  return (
    <aside className={cn('fixed left-0 top-0 z-50 flex h-dvh flex-col border-r border-white/8 bg-[linear-gradient(180deg,#0d5e57_0%,#0b3f3b_58%,#0b252a_100%)] text-white shadow-xl', mobileDrawer ? 'w-72 max-w-[88vw] transition-transform duration-300 ease-out' : 'transition-[width] duration-200', mobileDrawer && (drawerOpen ? 'translate-x-0' : '-translate-x-full'), !mobileDrawer && (showCollapsed ? 'w-16' : 'w-64'))}>
      <div className={cn('flex h-16 shrink-0 items-center gap-2 border-b border-white/8 px-3', showCollapsed && !mobileDrawer && 'justify-center px-1')}>
        {!mobileDrawer && <button type="button" onClick={onMenuClick} className="grid size-11 shrink-0 place-items-center rounded-xl text-white hover:bg-white/10" aria-label={showCollapsed ? 'Expand navigation' : 'Collapse navigation'}><Menu className="size-4" aria-hidden="true" /></button>}
        {showExpanded && <><span className="relative size-9 shrink-0 overflow-hidden rounded-xl bg-white"><Image src="/logo.png" alt="" fill sizes="36px" className="object-contain" /></span><span className="min-w-0 flex-1"><strong className="block truncate text-sm">Helping Tribe</strong><span className="block truncate text-[11px] text-white/65">Learner workspace</span></span></>}
        {mobileDrawer && <button type="button" onClick={onClose} className="grid size-11 shrink-0 place-items-center rounded-xl text-white hover:bg-white/10" aria-label="Close navigation"><X className="size-5" aria-hidden="true" /></button>}
      </div>
      <nav aria-label="Learner navigation" className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-2 py-3 overscroll-contain">
        {LEARNER_NAV_GROUPS.map((group, groupIndex) => (
          <section key={group.label} className={cn('pb-4', groupIndex > 0 && 'border-t border-white/8 pt-4')}>
            {showExpanded && <h2 className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-white/45">{group.label}</h2>}
            <ul className="space-y-1">
              {group.items.map((item) => {
                const Icon = PORTAL_ICONS[item.icon]
                const active = isPortalNavItemActive(pathname, item.href)
                return <li key={item.href}><Link href={item.href} onClick={mobileDrawer ? onClose : undefined} aria-current={active ? 'page' : undefined} title={showCollapsed ? item.label : undefined} className={cn('flex min-h-11 items-center gap-3 rounded-xl px-3 text-[13px] font-semibold transition-colors', showCollapsed && 'justify-center px-2', active ? 'bg-white text-[#0d5e57] shadow-sm' : 'text-white/78 hover:bg-white/10 hover:text-white')}><Icon className="size-4 shrink-0" aria-hidden="true" />{showExpanded && <span className="truncate">{item.label}</span>}</Link></li>
              })}
            </ul>
          </section>
        ))}
      </nav>
    </aside>
  )
}
