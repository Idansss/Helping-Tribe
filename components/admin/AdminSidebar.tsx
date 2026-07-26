'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BarChart3, Bell, BookOpen, Briefcase, CalendarDays, FileText, FolderOpen,
  GraduationCap, LayoutDashboard, ListChecks, Mail, MessageCircle, MessageSquare,
  Settings2, Users, X,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'

const ADMIN_NAV_GROUPS = [
  { label: 'Operations', items: [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { label: 'Applicants', href: '/admin/applicants', icon: FileText },
    { label: 'Users', href: '/admin/users', icon: Users },
    { label: 'Reports', href: '/admin/reports', icon: BarChart3 },
  ] },
  { label: 'Learning', items: [
    { label: 'Courses', href: '/admin/courses', icon: BookOpen },
    { label: 'Quizzes', href: '/admin/quizzes', icon: ListChecks },
    { label: 'Journals', href: '/admin/journals', icon: FileText },
    { label: 'Case Studies', href: '/admin/case-studies', icon: Briefcase },
    { label: 'CPD Snippets', href: '/admin/cpd-snippets', icon: GraduationCap },
    { label: 'Resources', href: '/admin/resources', icon: FolderOpen },
  ] },
  { label: 'Community', items: [
    { label: 'Messages', href: '/admin/messages', icon: MessageCircle },
    { label: 'Discussions', href: '/admin/discussions', icon: MessageSquare },
    { label: 'Calendar', href: '/admin/calendar', icon: CalendarDays },
  ] },
  { label: 'System', items: [
    { label: 'Notifications', href: '/admin/notifications', icon: Bell },
    { label: 'Newsletter', href: '/admin/newsletter', icon: Mail },
    { label: 'Settings', href: '/admin/settings', icon: Settings2 },
  ] },
] as const

interface AdminSidebarProps { collapsed?: boolean; onToggleCollapse?: () => void; mobileDrawer?: boolean; drawerOpen?: boolean; onClose?: () => void }

export function AdminSidebar({ collapsed = false, mobileDrawer = false, drawerOpen = false, onClose }: AdminSidebarProps) {
  const pathname = usePathname()
  const showContent = mobileDrawer || !collapsed

  return (
    <aside className={cn('flex h-dvh flex-col border-r border-white/8 bg-[linear-gradient(180deg,#0d5e57_0%,#0b3f3b_58%,#0b252a_100%)] text-white shadow-xl', mobileDrawer ? 'fixed left-0 top-0 z-50 w-72 max-w-[88vw] transition-transform duration-300 ease-out' : 'sticky top-0 transition-[width] duration-300', mobileDrawer && (drawerOpen ? 'translate-x-0' : '-translate-x-full'), !mobileDrawer && (collapsed ? 'w-0 overflow-hidden' : 'w-64'))}>
      <div className="flex h-16 shrink-0 items-center gap-2 border-b border-white/8 px-3">
        <span className="relative size-9 shrink-0 overflow-hidden rounded-xl bg-white"><Image src="/logo.png" alt="" fill sizes="36px" className="object-contain" /></span>
        {showContent && <span className="min-w-0 flex-1"><strong className="block truncate text-sm">Helping Tribe</strong><span className="block truncate text-[11px] text-white/65">Administration</span></span>}
        {mobileDrawer && <button type="button" onClick={onClose} className="grid size-11 shrink-0 place-items-center rounded-xl hover:bg-white/10" aria-label="Close navigation"><X className="size-5" aria-hidden="true" /></button>}
      </div>
      <nav aria-label="Administrator navigation" className="min-h-0 flex-1 overflow-y-auto px-2 py-3 overscroll-contain">
        {ADMIN_NAV_GROUPS.map((group, groupIndex) => <section key={group.label} className={cn('pb-4', groupIndex > 0 && 'border-t border-white/8 pt-4')}>
          {showContent && <h2 className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-white/45">{group.label}</h2>}
          <ul className="space-y-1">{group.items.map((item) => {
            const Icon = item.icon
            const active = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(`${item.href}/`))
            return <li key={item.href}><Link href={item.href} onClick={mobileDrawer ? onClose : undefined} aria-current={active ? 'page' : undefined} className={cn('flex min-h-11 items-center gap-3 rounded-xl px-3 text-[13px] font-semibold transition-colors', active ? 'bg-white text-[#0d5e57]' : 'text-white/78 hover:bg-white/10 hover:text-white')}><Icon className="size-4 shrink-0" aria-hidden="true" />{showContent && <span className="truncate">{item.label}</span>}</Link></li>
          })}</ul>
        </section>)}
      </nav>
    </aside>
  )
}
