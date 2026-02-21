'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Waypoints,
  Store,
  Layers3,
  GitBranch,
  Workflow,
  Bell,
  BarChart3,
  Sparkles,
  Settings2,
  Mail,
  FileText,
  Briefcase,
  FolderOpen,
  CalendarDays,
  MessageSquare,
  ListChecks,
  MessageCircle,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'

type AdminNavItem = {
  label: string
  href: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
}

const NAV_ITEMS: AdminNavItem[] = [
  { label: 'Home', href: '/admin', icon: LayoutDashboard },
  { label: 'Users', href: '/admin/users', icon: Users },
  { label: 'Applicants', href: '/admin/applicants', icon: FileText },
  { label: 'Messages', href: '/admin/messages', icon: MessageCircle },
  { label: 'Courses', href: '/admin/courses', icon: BookOpen },
  { label: 'Journals', href: '/admin/journals', icon: FileText },
  { label: 'Case Studies', href: '/admin/case-studies', icon: Briefcase },
  { label: 'Resources', href: '/admin/resources', icon: FolderOpen },
  { label: 'Calendar', href: '/admin/calendar', icon: CalendarDays },
  { label: 'Discussions', href: '/admin/discussions', icon: MessageSquare },
  { label: 'Quizzes', href: '/admin/quizzes', icon: ListChecks },
  { label: 'Learning paths', href: '/admin/learning-paths', icon: Waypoints },
  { label: 'Course store', href: '/admin/course-store', icon: Store },
  { label: 'Groups', href: '/admin/groups', icon: Layers3 },
  { label: 'Branches', href: '/admin/branches', icon: GitBranch },
  { label: 'Automations', href: '/admin/automations', icon: Workflow },
  { label: 'Notifications', href: '/admin/notifications', icon: Bell },
  { label: 'Newsletter', href: '/admin/newsletter', icon: Mail },
  { label: 'Reports', href: '/admin/reports', icon: BarChart3 },
  { label: 'Skills', href: '/admin/skills', icon: Sparkles },
  { label: 'Account & Settings', href: '/admin/settings', icon: Settings2 },
]

interface AdminSidebarProps {
  collapsed?: boolean
  onToggleCollapse?: () => void
  mobileDrawer?: boolean
  drawerOpen?: boolean
  onClose?: () => void
}

export function AdminSidebar({
  collapsed = false,
  mobileDrawer = false,
  drawerOpen = false,
  onClose,
}: AdminSidebarProps) {
  const pathname = usePathname()
  const showContent = mobileDrawer ? true : !collapsed

  return (
    <aside
      className={cn(
        'bg-gradient-to-b from-[var(--talent-primary-dark)] to-[var(--talent-primary)] text-white shadow-xl flex flex-col',
        mobileDrawer
          ? 'fixed left-0 top-0 z-50 h-screen w-72 max-w-[85vw] transition-[transform] duration-300 ease-out'
          : 'h-screen sticky top-0 transition-all duration-300',
        mobileDrawer && (drawerOpen ? 'translate-x-0' : '-translate-x-full'),
        !mobileDrawer && (collapsed ? 'w-0 overflow-hidden' : 'w-56')
      )}
    >
      <div
        className={cn(
          'h-14 flex-shrink-0 flex items-center px-3',
          mobileDrawer && 'justify-between'
        )}
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className="h-8 w-8 rounded-xl bg-white/10 flex items-center justify-center overflow-hidden ring-1 ring-white/20 flex-shrink-0">
            <img src="/logo.png" alt="Helping Tribe" className="h-full w-full object-contain" />
          </div>
          {showContent && (
            <div className="leading-tight min-w-0">
              <div className="text-[13px] font-semibold text-white truncate">Helping Tribe</div>
              <div className="text-[11px] text-white/80 truncate">Admin • Counseling LMS</div>
            </div>
          )}
        </div>
        {mobileDrawer && (
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2.5 text-white hover:bg-white/10 transition-colors touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden py-2 px-2 overscroll-contain">
        <ul className="space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const active =
              pathname === item.href ||
              (item.href !== '/admin' && pathname.startsWith(item.href + '/'))

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={mobileDrawer ? onClose : undefined}
                  className={cn(
                    'flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-colors min-h-[44px] touch-manipulation active:scale-[0.98]',
                    active
                      ? 'bg-white text-[var(--talent-primary-dark)]'
                      : 'text-teal-50 hover:bg-[color-mix(in_srgb,var(--talent-primary)_25%,transparent)]'
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {showContent && <span className="truncate">{item.label}</span>}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {showContent && (
        <div className="px-3 py-2 text-[11px] text-white/80 flex-shrink-0">
          <span>
            Powered by <span className="font-semibold text-white">Blakmoh Wellbeing</span> · Nigerian counseling training.
          </span>
        </div>
      )}
    </aside>
  )
}

