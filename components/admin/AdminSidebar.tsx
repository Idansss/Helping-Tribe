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
}

export function AdminSidebar({ collapsed = false }: AdminSidebarProps) {
  const pathname = usePathname()

  return (
    <aside
      className={cn(
        'h-screen bg-gradient-to-b from-[var(--talent-primary-dark)] to-[var(--talent-primary)] text-white shadow-xl flex flex-col sticky top-0 transition-all duration-300',
        collapsed ? 'w-0 overflow-hidden' : 'w-56'
      )}
    >
      <div className="h-12 flex-shrink-0 flex items-center px-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className="h-8 w-8 rounded-xl bg-white/10 flex items-center justify-center overflow-hidden ring-1 ring-white/20 flex-shrink-0">
            <img
              src="/logo.png"
              alt="Helping Tribe"
              className="h-full w-full object-contain"
            />
          </div>
          {!collapsed && (
            <div className="leading-tight min-w-0">
              <div className="text-[13px] font-semibold text-white truncate">
                Helping Tribe
              </div>
              <div className="text-[11px] text-white/80 truncate">
                Admin • Counseling LMS
              </div>
            </div>
          )}
        </div>
      </div>

      <nav className="flex-1 min-h-0 h-full overflow-y-auto py-1.5 px-2">
        <ul className="space-y-0.5 px-0">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const active =
              pathname === item.href ||
              (item.href !== '/admin' && pathname.startsWith(item.href))

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] font-medium transition-colors',
                    active
                      ? 'bg-white text-[var(--talent-primary-dark)]'
                      : 'text-teal-50 hover:bg-[color-mix(in_srgb,var(--talent-primary)_25%,transparent)]'
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="px-3 py-2 text-[11px] text-white/80 flex-shrink-0">
        {!collapsed && (
          <span>
            Powered by <span className="font-semibold text-white">Blakmoh Wellbeing</span> · Nigerian counseling training.
          </span>
        )}
      </div>
    </aside>
  )
}

