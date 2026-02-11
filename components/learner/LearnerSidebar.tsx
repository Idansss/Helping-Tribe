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
  X,
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
  /** Mobile drawer mode: overlay from left, closed by default */
  mobileDrawer?: boolean
  drawerOpen?: boolean
  onClose?: () => void
}

export function LearnerSidebar({
  collapsed = false,
  onMenuClick,
  mobileDrawer = false,
  drawerOpen = false,
  onClose,
}: LearnerSidebarProps) {
  const pathname = usePathname()
  const showCollapsed = !mobileDrawer && collapsed
  const showExpanded = mobileDrawer || !collapsed

  const navLinkClass = cn(
    'flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-colors min-h-[44px] touch-manipulation',
    showCollapsed && 'justify-center px-2',
    'active:scale-[0.98]'
  )

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-50 h-screen flex flex-col bg-[#115e59] text-white shadow-xl',
        mobileDrawer
          ? 'w-72 max-w-[85vw] transition-[transform] duration-300 ease-out'
          : 'transition-[width] duration-200',
        mobileDrawer && (drawerOpen ? 'translate-x-0' : '-translate-x-full'),
        !mobileDrawer && (showCollapsed ? 'w-14' : 'w-56')
      )}
    >
      {/* Top: logo + toggle / close */}
      <div
        className={cn(
          'flex h-14 flex-shrink-0 items-center gap-2 px-3',
          showCollapsed && !mobileDrawer && 'justify-center px-0'
        )}
      >
        {mobileDrawer ? (
          <>
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white/10 ring-1 ring-white/20">
              <img src="/logo.png" alt="Helping Tribe" className="h-full w-full object-contain" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold text-white">Helping Tribe</div>
              <div className="truncate text-xs text-white/80">Learner Portal</div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2.5 text-white hover:bg-white/10 transition-colors touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={onMenuClick}
              className="rounded-lg p-2.5 text-white hover:bg-white/10 transition-colors shrink-0 touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Toggle menu"
            >
              <Menu className="h-4 w-4" />
            </button>
            {showExpanded && (
              <>
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white/10 ring-1 ring-white/20">
                  <img src="/logo.png" alt="Helping Tribe" className="h-full w-full object-contain" />
                </div>
                <div className="min-w-0">
                  <div className="truncate text-xs font-semibold text-white">Helping Tribe</div>
                  <div className="truncate text-[10px] text-white/80">Learner Portal</div>
                </div>
              </>
            )}
          </>
        )}
      </div>

      <nav className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden py-2 px-2 overscroll-contain">
        <ul className="space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const active = isActive(pathname, item.href)
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={mobileDrawer ? onClose : undefined}
                  className={cn(
                    navLinkClass,
                    active ? 'bg-white text-teal-900' : 'text-white/90 hover:bg-white/10 hover:text-white'
                  )}
                  title={showCollapsed ? item.label : undefined}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {showExpanded && <span className="truncate">{item.label}</span>}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </aside>
  )
}
