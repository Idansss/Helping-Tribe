'use client'

import { ReactNode, useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Home,
  BookOpen,
  Layers3,
  Users,
  ClipboardList,
  Video,
  BarChart3,
  CalendarDays,
  Sparkles,
  MessageCircle,
  MessageSquare,
  Settings,
  Menu,
  FileText,
  Briefcase,
  FolderOpen,
  LayoutGrid,
  UserCircle,
  ListChecks,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { createClient } from '@/lib/supabase/client'
import { AdminHeader } from '@/components/admin/AdminHeader'

interface MentorLayoutProps {
  children: ReactNode
}

export function MentorLayout({ children }: MentorLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    supabase.auth.getUser().then(async ({ data: { user } }) => {
      setUser(user)

      if (!user) {
        // Not authenticated – send to login
        router.replace('/login')
        return
      }

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      setProfile(data)

      // Only admins and faculty should access mentor views
      if (data && data.role === 'student') {
        router.replace('/dashboard')
      }
    })
  }, [router])

  const navItems = [
    { href: '/mentor', label: 'Home', icon: Home },
    { href: '/mentor/courses', label: 'Courses', icon: BookOpen },
    { href: '/mentor/journals', label: 'Journals', icon: FileText },
    { href: '/mentor/learning-paths', label: 'Learning paths', icon: Layers3 },
    { href: '/mentor/groups', label: 'Groups (Peer Circles)', icon: Users },
    { href: '/mentor/case-studies', label: 'Case Studies', icon: Briefcase },
    { href: '/mentor/resources', label: 'Resources', icon: FolderOpen },
    { href: '/mentor/catalog', label: 'Catalog', icon: LayoutGrid },
    { href: '/mentor/grading', label: 'Grading Hub', icon: ClipboardList },
    { href: '/mentor/practice', label: 'Practice Client', icon: UserCircle },
    { href: '/mentor/conferences', label: 'Conferences', icon: Video },
    { href: '/mentor/reports', label: 'Reports', icon: BarChart3 },
    { href: '/mentor/calendar', label: 'Calendar', icon: CalendarDays },
    { href: '/mentor/skills', label: 'Skills', icon: Sparkles },
    { href: '/mentor/discussions', label: 'Discussions', icon: MessageSquare },
    { href: '/mentor/quizzes', label: 'Quizzes', icon: ListChecks },
    { href: '/mentor/messages', label: 'Messages', icon: MessageCircle },
    { href: '/mentor/settings', label: 'Settings', icon: Settings },
  ]

  const mentorHeaderLeftSlot = (
    <button
      onClick={() => setSidebarOpen(open => !open)}
      className="p-2.5 hover:bg-slate-100 rounded-lg transition-colors"
      aria-label="Toggle sidebar"
      title="Toggle sidebar"
    >
      <Menu className="h-5 w-5 text-slate-600" />
    </button>
  )

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar - same structure as admin: top bar then nav below */}
      <aside
        className={cn(
          'fixed left-0 top-0 h-full bg-gradient-to-b from-[var(--talent-primary-dark)] to-[var(--talent-primary)] text-white shadow-xl transition-all duration-300 z-30 flex flex-col',
          sidebarOpen ? 'w-56' : 'w-0 overflow-hidden'
        )}
      >
        {/* Top bar: compact */}
        <div className="h-12 flex-shrink-0 flex items-center px-3">
          <div className="flex items-center gap-2 min-w-0">
            <div className="h-8 w-8 rounded-xl bg-white/10 flex items-center justify-center overflow-hidden ring-1 ring-white/20 flex-shrink-0">
              <img
                src="/logo.png"
                alt="Helping Tribe"
                className="h-full w-full object-contain"
              />
            </div>
            {sidebarOpen && (
              <div className="leading-tight min-w-0">
                <div className="text-[13px] font-semibold text-white truncate">
                  Helping Tribe
                </div>
                <div className="text-[11px] text-white/80 truncate">
                  Mentor • Counseling LMS
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation - compact (same as Admin/Learner): text-[13px], py-2, gap-2.5, h-4 w-4, tighter padding */}
        <nav className="flex-1 min-h-0 overflow-y-auto py-1.5 px-2">
          <ul className="space-y-0.5 px-0">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive =
                item.href === '/mentor'
                  ? pathname === item.href
                  : pathname === item.href || pathname?.startsWith(item.href + '/')

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] font-medium transition-colors',
                      isActive
                        ? 'bg-white text-[var(--talent-primary-dark)]'
                        : 'text-teal-50 hover:bg-[color-mix(in_srgb,var(--talent-primary)_25%,transparent)]'
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {sidebarOpen && <span className="truncate">{item.label}</span>}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="px-3 py-2 text-[11px] text-white/80 flex-shrink-0">
          {sidebarOpen && (
            <span>
              Powered by <span className="font-semibold text-white">Blakmoh Wellbeing</span> · Nigerian counseling training.
            </span>
          )}
        </div>
      </aside>

      {/* Main content - fill remaining width */}
      <main
        className={cn(
          'min-h-screen w-full min-w-0 flex-1 transition-all duration-300',
          sidebarOpen ? 'ml-56' : 'ml-0'
        )}
      >
        <AdminHeader
          leftSlot={mentorHeaderLeftSlot}
          title="Mentor Dashboard"
          description="Monitor your learners, track course engagement, and quickly see where support is needed."
        />

        <div className="px-8 py-6">
          {children}
        </div>
      </main>
    </div>
  )
}

