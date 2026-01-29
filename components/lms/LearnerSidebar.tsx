'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  BookOpen,
  BookMarked,
  MessageCircle,
  Users,
  Briefcase,
  FolderOpen,
  Backpack,
  Calendar,
  LayoutGrid,
  Sparkles,
  MessageSquare,
  Mail,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'

export type LearnerNavItem = {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

/** Navigation config: direct links to functional pages (no landing pages). */
export const LEARNER_NAV_ITEMS: LearnerNavItem[] = [
  { label: 'Home', href: '/learner/dashboard', icon: Home },
  { label: 'My Course', href: '/learner/course/modules', icon: BookOpen },
  { label: 'Learning Journal', href: '/learner/journal/entries', icon: BookMarked },
  { label: 'Practice Client', href: '/learner/practice/chat', icon: MessageCircle },
  { label: 'Peer Circles', href: '/learner/circles', icon: Users },
  { label: 'Case Studies', href: '/learner/cases', icon: Briefcase },
  { label: 'Resources', href: '/learner/resources', icon: FolderOpen },
  { label: 'My Backpack', href: '/learner/backpack', icon: Backpack },
  { label: 'Calendar', href: '/learner/calendar', icon: Calendar },
  { label: 'Catalog', href: '/learner/catalog', icon: LayoutGrid },
  { label: 'Skills', href: '/learner/skills', icon: Sparkles },
  { label: 'Discussions', href: '/learner/discussions', icon: MessageSquare },
  { label: 'Messages', href: '/learner/messages', icon: Mail },
]

function isActive(pathname: string, href: string): boolean {
  if (pathname === href) return true
  if (href === '/learner/dashboard') return pathname === '/learner/dashboard'
  return pathname.startsWith(href)
}

interface LearnerSidebarProps {
  /** Collapsed = icon-only (narrow). Expanded = full width with labels. */
  collapsed?: boolean
}

export function LearnerSidebar({ collapsed = false }: LearnerSidebarProps) {
  const pathname = usePathname()

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen flex flex-col transition-all duration-300',
        'bg-[#0f5257] text-white shadow-xl',
        collapsed ? 'w-16' : 'w-[250px]'
      )}
    >
      {/* Brand / logo area */}
      <div className="flex h-16 flex-shrink-0 items-center px-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-white/20 text-sm font-bold text-white shadow-sm">
            HT
          </div>
          {!collapsed && (
            <div className="min-w-0 leading-tight">
              <div className="truncate text-sm font-semibold text-white">
                Helping Tribe
              </div>
              <div className="truncate text-[11px] text-white/80">
                Learner Portal
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Nav list */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-3">
          {LEARNER_NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const active = isActive(pathname, item.href)

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    active
                      ? 'bg-white text-[#0f5257]'
                      : 'text-white/90 hover:bg-white/10 hover:text-white'
                  )}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {!collapsed && (
        <div className="px-4 py-3 text-[11px] text-white/80">
          Powered by <span className="font-semibold text-white">Helping Tribe</span>
        </div>
      )}
    </aside>
  )
}
