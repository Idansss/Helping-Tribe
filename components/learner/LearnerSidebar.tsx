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
  Menu,
  ListChecks,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'

const NAV_ITEMS = [
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
  { label: 'Quizzes', href: '/learner/quizzes', icon: ListChecks },
  { label: 'Skills', href: '/learner/skills', icon: Sparkles },
  { label: 'Discussions', href: '/learner/discussions', icon: MessageSquare },
  { label: 'Messages', href: '/learner/messages', icon: Mail },
] as const

function isActive(pathname: string, href: string): boolean {
  if (pathname === href) return true
  if (href === '/learner/dashboard') return pathname === '/learner/dashboard'
  return pathname.startsWith(href)
}

interface LearnerSidebarProps {
  collapsed?: boolean
  onMenuClick?: () => void
}

export function LearnerSidebar({
  collapsed = false,
  onMenuClick,
}: LearnerSidebarProps) {
  const pathname = usePathname()

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen flex flex-col bg-[#115e59] text-white shadow-xl transition-[width] duration-200',
        collapsed ? 'w-14' : 'w-56'
      )}
    >
      {/* Top: compact */}
      <div className={cn('flex h-12 flex-shrink-0 items-center gap-2 px-3', collapsed && 'justify-center px-0')}>
        <button
          type="button"
          onClick={onMenuClick}
          className="rounded-md p-1.5 text-white hover:bg-white/10 transition-colors shrink-0"
          aria-label="Toggle menu"
        >
          <Menu className="h-4 w-4" />
        </button>
        {!collapsed && (
          <>
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white/10 ring-1 ring-white/20">
              <img
                src="/logo.png"
                alt="Helping Tribe"
                className="h-full w-full object-contain"
              />
            </div>
            <div className="min-w-0">
              <div className="truncate text-xs font-semibold text-white">
                Helping Tribe
              </div>
              <div className="truncate text-[10px] text-white/80">
                Learner Portal
              </div>
            </div>
          </>
        )}
      </div>

      <nav className="flex-1 min-h-0 h-full overflow-y-auto py-1.5 px-2">
        <ul className="space-y-0.5 px-0">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const active = isActive(pathname, item.href)
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] font-medium transition-colors',
                    collapsed && 'justify-center px-2',
                    active
                      ? 'bg-white text-teal-900'
                      : 'text-white/90 hover:bg-white/10 hover:text-white'
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </aside>
  )
}
