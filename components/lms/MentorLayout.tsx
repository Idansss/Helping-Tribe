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
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { createClient } from '@/lib/supabase/client'
import { useMediaQuery } from '@/hooks/use-media-query'
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const isDesktop = useMediaQuery(768)

  useEffect(() => {
    const supabase = createClient()

    supabase.auth.getUser().then(async ({ data: { user } }) => {
      setUser(user)

      if (!user) {
        router.replace('/staff/login')
        return
      }

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      setProfile(data)

      if (data && data.role === 'student') {
        router.replace('/learner/dashboard')
      }
    })
  }, [router])

  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  const handleMenuClick = () => {
    if (isDesktop) {
      setSidebarOpen((open) => !open)
    } else {
      setMobileMenuOpen((open) => !open)
    }
  }

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

  const showSidebar = isDesktop ? sidebarOpen : mobileMenuOpen
  const mentorHeaderLeftSlot = (
    <button
      type="button"
      onClick={handleMenuClick}
      className="rounded-lg p-2.5 hover:bg-slate-100 transition-colors touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center"
      aria-label="Toggle menu"
      title="Toggle menu"
    >
      <Menu className="h-5 w-5 text-slate-600" />
    </button>
  )

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {!isDesktop && mobileMenuOpen && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <aside
        className={cn(
          'fixed left-0 top-0 h-full bg-gradient-to-b from-[var(--talent-primary-dark)] to-[var(--talent-primary)] text-white shadow-xl flex flex-col z-50',
          isDesktop
            ? 'transition-[width] duration-300'
            : 'w-72 max-w-[85vw] transition-[transform] duration-300 ease-out',
          isDesktop && (sidebarOpen ? 'w-56' : 'w-0 overflow-hidden'),
          !isDesktop && (mobileMenuOpen ? 'translate-x-0' : '-translate-x-full')
        )}
      >
        <div className={cn('h-14 flex-shrink-0 flex items-center px-3', !isDesktop && 'justify-between')}>
          <div className="flex items-center gap-2 min-w-0">
            <div className="h-8 w-8 rounded-xl bg-white/10 flex items-center justify-center overflow-hidden ring-1 ring-white/20 flex-shrink-0">
              <img src="/logo.png" alt="Helping Tribe" className="h-full w-full object-contain" />
            </div>
            {showSidebar && (
              <div className="leading-tight min-w-0">
                <div className="text-[13px] font-semibold text-white truncate">Helping Tribe</div>
                <div className="text-[11px] text-white/80 truncate">Mentor • Counseling LMS</div>
              </div>
            )}
          </div>
          {!isDesktop && (
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg p-2.5 text-white hover:bg-white/10 transition-colors touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        <nav className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden py-2 px-2 overscroll-contain">
          <ul className="space-y-0.5">
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
                    onClick={!isDesktop ? () => setMobileMenuOpen(false) : undefined}
                    className={cn(
                      'flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-colors min-h-[44px] touch-manipulation active:scale-[0.98]',
                      isActive
                        ? 'bg-white text-[var(--talent-primary-dark)]'
                        : 'text-teal-50 hover:bg-[color-mix(in_srgb,var(--talent-primary)_25%,transparent)]'
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {showSidebar && <span className="truncate">{item.label}</span>}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {showSidebar && (
          <div className="px-3 py-2 text-[11px] text-white/80 flex-shrink-0">
            <span>
              Powered by <span className="font-semibold text-white">Blakmoh Wellbeing</span> · Nigerian counseling training.
            </span>
          </div>
        )}
      </aside>

      <main
        className={cn(
          'min-h-screen w-full min-w-0 flex-1 transition-all duration-300',
          isDesktop && sidebarOpen ? 'ml-56' : 'ml-0'
        )}
      >
        <AdminHeader
          leftSlot={mentorHeaderLeftSlot}
          title="Mentor Dashboard"
          description="Monitor your learners, track course engagement, and quickly see where support is needed."
        />

        <div className="px-4 sm:px-6 md:px-8 py-4 sm:py-6">
          {children}
        </div>
      </main>
    </div>
  )
}

