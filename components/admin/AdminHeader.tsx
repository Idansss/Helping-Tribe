'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Search, UserCircle2, ChevronDown, LayoutDashboard, GraduationCap, Users } from 'lucide-react'
import { NotificationBell } from '@/components/lms/NotificationBell'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'

interface AdminHeaderProps {
  title?: string
  description?: string
  /** Optional left slot (e.g. hamburger + logo for mentor layout) */
  leftSlot?: React.ReactNode
}

type UserRole = 'admin' | 'mentor' | 'learner'

interface RoleOption {
  id: UserRole
  label: string
  href: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  description: string
}

const ROLE_OPTIONS: RoleOption[] = [
  {
    id: 'admin',
    label: 'Admin',
    href: '/admin',
    icon: LayoutDashboard,
    description: 'Portal administration',
  },
  {
    id: 'mentor',
    label: 'Mentor',
    href: '/mentor',
    icon: GraduationCap,
    description: 'Mentor dashboard',
  },
  {
    id: 'learner',
    label: 'Learner',
    href: '/',
    icon: Users,
    description: 'My training',
  },
]

export function AdminHeader({
  title = 'Admin dashboard',
  description = 'Monitor your counseling training portal at a glance.',
  leftSlot,
}: AdminHeaderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { toast } = useToast()

  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isRoleSwitcherOpen, setIsRoleSwitcherOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [profileName, setProfileName] = useState<string | null>(null)
  const [profileAvatar, setProfileAvatar] = useState<string | null>(null)
  const [currentRole, setCurrentRole] = useState<UserRole>('admin')
  const [visibleRoleOptions, setVisibleRoleOptions] = useState<RoleOption[]>(ROLE_OPTIONS)

  // Determine current role from pathname so the header always matches the portal you're on
  useEffect(() => {
    if (pathname?.startsWith('/admin')) {
      setCurrentRole('admin')
    } else if (pathname?.startsWith('/mentor')) {
      setCurrentRole('mentor')
    } else if (pathname?.startsWith('/analytics')) {
      setCurrentRole('admin')
    } else if (
      pathname === '/' ||
      pathname?.startsWith('/dashboard') ||
      pathname?.startsWith('/profile') ||
      pathname?.startsWith('/assignments') ||
      pathname?.startsWith('/assessments') ||
      pathname?.startsWith('/discussions') ||
      pathname?.startsWith('/final-projects') ||
      pathname?.startsWith('/certificate') ||
      pathname?.startsWith('/tools') ||
      pathname?.startsWith('/catalog') ||
      pathname?.startsWith('/skills') ||
      pathname?.startsWith('/messages') ||
      pathname?.startsWith('/my-training')
    ) {
      setCurrentRole('learner')
    } else {
      try {
        const savedRole = localStorage.getItem('ht-current-role') as UserRole
        if (savedRole && ['admin', 'mentor', 'learner'].includes(savedRole)) {
          setCurrentRole(savedRole)
        }
      } catch {
        // ignore
      }
    }
  }, [pathname])

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle()

      const role = String(profile?.role ?? '').toLowerCase()
      const canAdmin = role === 'admin'
      const canMentor = canAdmin || role === 'mentor' || role === 'faculty'

      setVisibleRoleOptions(
        ROLE_OPTIONS.filter((r) => {
          if (r.id === 'learner') return true
          if (r.id === 'mentor') return canMentor
          if (r.id === 'admin') return canAdmin
          return false
        })
      )
    })
  }, [])

  const handleRoleSwitch = (role: UserRole, href: string) => {
    if (!visibleRoleOptions.some((r) => r.id === role)) {
      toast({
        variant: 'destructive',
        title: 'Access denied',
        description: 'Your account does not have access to that portal.',
      })
      setIsRoleSwitcherOpen(false)
      return
    }
    if (role === currentRole) {
      setIsRoleSwitcherOpen(false)
      return
    }
    setCurrentRole(role)
    localStorage.setItem('ht-current-role', role)
    const activeView = role === 'admin' ? 'administrator' : role === 'mentor' ? 'instructor' : 'learner'
    localStorage.setItem('ht-active-view', activeView)
    setIsRoleSwitcherOpen(false)
    router.push(href)
  }

  const currentRoleOption =
    visibleRoleOptions.find((r) => r.id === currentRole) || ROLE_OPTIONS[0]

  // Get role-specific title and description if not provided
  const getRoleTitle = () => {
    if (title !== 'Admin dashboard') return title
    if (currentRole === 'mentor') return 'Mentor Dashboard'
    if (currentRole === 'learner') return 'My Training'
    return 'Admin Dashboard'
  }

  const getRoleDescription = () => {
    if (description !== 'Monitor your counseling training portal at a glance.') return description
    if (currentRole === 'mentor') return 'Manage your students, courses, and mentoring sessions.'
    if (currentRole === 'learner') return 'Track your progress through the counseling training program.'
    return 'Monitor your counseling training portal at a glance.'
  }

  const adminQuickTargets = [
    { id: 'users', label: 'Users', description: 'Find or manage learners and mentors', href: '/admin/users' },
    { id: 'courses', label: 'Courses', description: 'Browse and edit counseling modules', href: '/admin/courses' },
    { id: 'groups', label: 'Groups', description: 'Peer circles and campus cohorts', href: '/admin/groups' },
    { id: 'branches', label: 'Branches', description: 'State or campus sub‑portals', href: '/admin/branches' },
    { id: 'reports', label: 'Reports', description: 'Progress, ethics and practicum reporting', href: '/admin/reports' },
  ]

  const mentorQuickTargets = [
    { id: 'courses', label: 'Courses', description: 'Manage your courses and content', href: '/mentor/courses' },
    { id: 'learning-paths', label: 'Learning paths', description: 'Learning paths and sequences', href: '/mentor/learning-paths' },
    { id: 'groups', label: 'Groups (Peer Circles)', description: 'Peer circles and cohorts', href: '/mentor/groups' },
    { id: 'grading', label: 'Grading Hub', description: 'Grade assignments and feedback', href: '/mentor/grading' },
    { id: 'reports', label: 'Reports', description: 'Progress and outcome reports', href: '/mentor/reports' },
    { id: 'calendar', label: 'Calendar', description: 'Events and sessions', href: '/mentor/calendar' },
    { id: 'messages', label: 'Messages', description: 'Conversations with learners', href: '/mentor/messages' },
  ]

  const learnerQuickTargets = [
    { id: 'dashboard', label: 'Dashboard', description: 'Your training home', href: '/dashboard' },
    { id: 'my-training', label: 'My Training', description: 'Your courses and progress', href: '/my-training' },
    { id: 'catalog', label: 'Catalog', description: 'Browse and enroll in courses', href: '/catalog' },
    { id: 'skills', label: 'Skills', description: 'Your skills and development', href: '/skills' },
    { id: 'discussions', label: 'Discussions', description: 'Peer discussions', href: '/discussions' },
    { id: 'messages', label: 'Messages', description: 'Your messages', href: '/messages' },
  ]

  const quickTargets =
    currentRole === 'mentor'
      ? mentorQuickTargets
      : currentRole === 'learner'
        ? learnerQuickTargets
        : adminQuickTargets

  const filteredTargets =
    searchQuery.trim().length === 0
      ? quickTargets
      : quickTargets.filter(target => {
          const q = searchQuery.toLowerCase()
          return (
            target.label.toLowerCase().includes(q) ||
            target.description.toLowerCase().includes(q)
          )
        })

  // Notifications: real data from NotificationBell component
  const _notificationsPlaceholder = [
    {
      id: '1',
      title: 'Placeholder',
      body: 'Replaced by NotificationBell.',
      time: '',
    },
    {
      id: '2',
      title: 'Practicum journal submitted',
      body: 'A learner uploaded a new reflection for supervision.',
      time: '45 min ago',
    },
    {
      id: '3',
      title: 'Course completion',
      body: 'Two learners just completed “Introduction to Ethical Practice”.',
      time: 'Today',
    },
  ]

  // Hydrate profile name/avatar from role-specific localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return
    const storageKey =
      currentRole === 'mentor'
        ? 'ht-mentor-profile'
        : currentRole === 'learner'
          ? 'ht-learner-profile'
          : 'ht-admin-profile'
    try {
      const raw = window.localStorage.getItem(storageKey)
      if (!raw) {
        if (currentRole === 'mentor' || currentRole === 'learner') {
          setProfileName(null)
          setProfileAvatar(null)
        }
        return
      }
      const parsed = JSON.parse(raw) as { name?: string; avatar?: string }
      if (parsed?.name && parsed.name.trim().length > 0) {
        setProfileName(parsed.name.trim())
      } else if (currentRole === 'mentor' || currentRole === 'learner') {
        setProfileName(null)
      }
      if (parsed?.avatar && parsed.avatar.trim().length > 0) {
        setProfileAvatar(parsed.avatar)
      } else if (currentRole === 'mentor' || currentRole === 'learner') {
        setProfileAvatar(null)
      }
    } catch {
      // ignore parse errors
    }
  }, [currentRole])

  // Close dropdowns when clicking/touching outside
  useEffect(() => {
    const handleOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('[data-dropdown]')) {
        setIsProfileOpen(false)
        setIsRoleSwitcherOpen(false)
        setShowSearchResults(false)
      }
    }

    document.addEventListener('mousedown', handleOutside)
    document.addEventListener('touchstart', handleOutside, { passive: true })
    return () => {
      document.removeEventListener('mousedown', handleOutside)
      document.removeEventListener('touchstart', handleOutside)
    }
  }, [])

  const searchPlaceholder =
    currentRole === 'mentor'
      ? 'Search courses, learners, resources...'
      : currentRole === 'learner'
        ? 'Search courses, resources...'
        : 'Search users, courses, branches...'

  const profileMenuProfileLink =
    currentRole === 'mentor'
      ? '/mentor'
      : currentRole === 'learner'
        ? '/profile'
        : '/admin/profile'
  const profileMenuSettingsLink =
    currentRole === 'mentor'
      ? '/mentor/settings'
      : currentRole === 'learner'
        ? '/profile'
        : '/admin/settings'
  const profileFallbackLabel =
    currentRole === 'mentor' ? 'Mentor' : currentRole === 'learner' ? 'Learner' : 'Admin'

  return (
    <header className="h-16 border-b bg-white/70 backdrop-blur-sm flex items-center justify-between px-6 md:px-8 gap-4 sticky top-0 z-20">
      <div className="flex items-center min-w-0 gap-6">
        {leftSlot}
        {leftSlot && (
          <div className="hidden sm:block w-px h-8 bg-slate-200 flex-shrink-0" aria-hidden />
        )}
        <div className="min-w-0">
          <h1 className="text-lg font-semibold text-slate-900 truncate">
            {getRoleTitle()}
          </h1>
          <p className="text-xs text-slate-500 truncate max-w-lg">
            {getRoleDescription()}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 min-w-0">
        <div className="hidden md:block relative w-64" data-dropdown>
          <div className="flex items-center gap-2 bg-slate-50 border rounded-md px-2 py-1.5">
            <Search className="h-4 w-4 text-slate-400" />
            <Input
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value)
                setShowSearchResults(true)
              }}
              onFocus={() => setShowSearchResults(true)}
              onKeyDown={e => {
                if (e.key === 'Enter' && filteredTargets[0]) {
                  router.push(filteredTargets[0].href)
                  setShowSearchResults(false)
                }
              }}
              className="border-0 bg-transparent h-6 px-0 text-xs focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>

          {showSearchResults && filteredTargets.length > 0 && (
            <div className="absolute mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg text-[11px] z-30">
              {filteredTargets.map(target => (
                <button
                  key={target.id}
                  type="button"
                  className="w-full text-left px-3 py-2 hover:bg-slate-50 flex flex-col"
                  onClick={() => {
                    router.push(target.href)
                    setShowSearchResults(false)
                  }}
                >
                  <span className="font-medium text-slate-900">
                    {target.label}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {target.description}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <NotificationBell className="relative rounded-full hover:bg-slate-100 p-2 text-slate-600" iconSize="sm" />

        {/* Role Switcher - avoid accidental switch on tap (e.g. same tap hitting Learner) */}
        <div className="relative" data-dropdown>
          <button
            type="button"
            className="flex items-center gap-2 rounded-full border border-slate-200 bg-white min-h-[44px] py-2.5 px-4 hover:bg-slate-50 transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[var(--talent-primary)] focus-visible:ring-offset-1 touch-manipulation"
            onClick={(e) => {
              e.stopPropagation()
              setIsRoleSwitcherOpen(open => !open)
              setIsProfileOpen(false)
            }}
            aria-label="Switch role"
          >
            <span className="pointer-events-none">
              <currentRoleOption.icon className="h-4 w-4 text-slate-700" />
            </span>
            <span className="hidden md:inline text-xs font-medium text-slate-800 pointer-events-none">
              {currentRoleOption.label}
            </span>
            <span className="pointer-events-none">
              <ChevronDown className="h-3 w-3 text-slate-500" />
            </span>
          </button>

          {isRoleSwitcherOpen && (
            <div className="absolute right-0 mt-3 sm:mt-2 w-56 rounded-xl border border-slate-200 bg-white shadow-lg text-[11px] z-30">
              <div className="px-3 py-2 border-b border-slate-100">
                <p className="font-semibold text-slate-900">Switch Role</p>
                <p className="text-[10px] text-slate-500">
                  View portal from different perspectives
                </p>
              </div>
              {visibleRoleOptions.map((role) => {
                const Icon = role.icon
                const isActive = role.id === currentRole
                return (
                  <button
                    key={role.id}
                    type="button"
                    className={`w-full text-left px-3 py-2.5 min-h-[44px] flex items-center gap-3 touch-manipulation ${
                      isActive ? 'bg-[var(--talent-primary)]/5 cursor-default' : 'hover:bg-slate-50'
                    }`}
                    onClick={(e) => {
                      e.stopPropagation()
                      if (isActive) {
                        setIsRoleSwitcherOpen(false)
                        return
                      }
                      handleRoleSwitch(role.id, role.href)
                    }}
                  >
                    <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-[var(--talent-primary)]' : 'text-slate-600'}`} />
                    <div className="flex-1 min-w-0 text-left">
                      <div className={`font-medium ${isActive ? 'text-[var(--talent-primary)]' : 'text-slate-900'}`}>
                        {role.label}
                      </div>
                      <div className="text-[10px] text-slate-500">{role.description}</div>
                    </div>
                    {isActive && (
                      <span className="h-2 w-2 rounded-full bg-[var(--talent-primary)] shrink-0" />
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Profile Menu */}
        <div className="relative" data-dropdown>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2 rounded-full border-slate-200 pl-1 pr-3"
            onClick={() => {
              setIsProfileOpen(open => !open)
              setIsRoleSwitcherOpen(false)
            }}
          >
            {profileAvatar ? (
              <span className="h-6 w-6 rounded-full overflow-hidden border border-slate-200 bg-slate-100">
                <img
                  src={profileAvatar}
                  alt={currentRole === 'mentor' ? 'Mentor avatar' : 'Admin avatar'}
                  className="h-full w-full object-cover"
                />
              </span>
            ) : (
              <UserCircle2 className="h-4 w-4 text-slate-700" />
            )}
            <span className="hidden md:inline text-xs font-medium text-slate-800">
              {profileName ?? profileFallbackLabel}
            </span>
          </Button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-xl border border-slate-200 bg-white shadow-lg text-[11px] z-30">
              <div className="px-3 py-2 border-b border-slate-100">
                <p className="font-semibold text-slate-900">
                  {profileName ?? profileFallbackLabel}
                </p>
                <p className="text-[10px] text-slate-500">
                  {currentRoleOption.label} • Counseling LMS
                </p>
              </div>
              <button
                type="button"
                className="w-full text-left px-3 py-2 hover:bg-slate-50"
                onClick={() => {
                  router.push(profileMenuProfileLink)
                  setIsProfileOpen(false)
                }}
              >
                Profile
              </button>
              <button
                type="button"
                className="w-full text-left px-3 py-2 hover:bg-slate-50"
                onClick={() => {
                  router.push(profileMenuSettingsLink)
                  setIsProfileOpen(false)
                }}
              >
                Account &amp; settings
              </button>
              <button
                type="button"
                className="w-full text-left px-3 py-2 hover:bg-slate-50 text-red-600"
                onClick={() => {
                  router.push('/logout')
                  setIsProfileOpen(false)
                }}
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

