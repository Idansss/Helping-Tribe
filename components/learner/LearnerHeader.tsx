'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { ChevronDown, LayoutDashboard, GraduationCap, Users, Search, Menu } from 'lucide-react'
import { NotificationBell } from '@/components/lms/NotificationBell'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'

type UserRole = 'admin' | 'mentor' | 'learner'

interface RoleOption {
  id: UserRole
  label: string
  href: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  description: string
}

const ROLE_OPTIONS: RoleOption[] = [
  { id: 'admin', label: 'Admin', href: '/admin', icon: LayoutDashboard, description: 'Portal administration' },
  { id: 'mentor', label: 'Mentor', href: '/mentor', icon: GraduationCap, description: 'Mentor dashboard' },
  { id: 'learner', label: 'Learner', href: '/', icon: Users, description: 'My training' },
]

interface LearnerHeaderProps {
  onMenuClick?: () => void
}

export function LearnerHeader({ onMenuClick }: LearnerHeaderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { toast } = useToast()
  const [profileOpen, setProfileOpen] = useState(false)
  const [roleSwitcherOpen, setRoleSwitcherOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [profileName, setProfileName] = useState<string | null>(null)
  const [profileAvatar, setProfileAvatar] = useState<string | null>(null)
  const [currentRole, setCurrentRole] = useState<UserRole>('learner')
  const [visibleRoleOptions, setVisibleRoleOptions] = useState<RoleOption[]>(() =>
    ROLE_OPTIONS.filter((r) => r.id === 'learner')
  )

  const learnerQuickTargets = [
    { id: 'dashboard', label: 'Dashboard', description: 'Your training home', href: '/learner/dashboard' },
    { id: 'catalog', label: 'Catalog', description: 'Browse and enroll in courses', href: '/learner/catalog' },
    { id: 'course', label: 'My Course', description: 'Modules and progress', href: '/learner/course/modules' },
    { id: 'resources', label: 'Resources', description: 'Learning resources', href: '/learner/resources' },
    { id: 'discussions', label: 'Discussions', description: 'Peer discussions', href: '/learner/discussions' },
    { id: 'quizzes', label: 'Quizzes', description: 'Take quizzes', href: '/learner/quizzes' },
    { id: 'messages', label: 'Messages', description: 'Your messages', href: '/learner/messages' },
    { id: 'calendar', label: 'Calendar', description: 'Events and schedule', href: '/learner/calendar' },
    { id: 'cases', label: 'Case Studies', description: 'Case studies', href: '/learner/cases' },
    { id: 'backpack', label: 'My Backpack', description: 'Saved items', href: '/learner/backpack' },
  ]

  const filteredTargets =
    searchQuery.trim().length === 0
      ? learnerQuickTargets
      : learnerQuickTargets.filter(target => {
          const q = searchQuery.toLowerCase()
          return (
            target.label.toLowerCase().includes(q) ||
            target.description.toLowerCase().includes(q)
          )
        })

  useEffect(() => {
    if (pathname?.startsWith('/admin')) setCurrentRole('admin')
    else if (pathname?.startsWith('/mentor')) setCurrentRole('mentor')
    else setCurrentRole('learner')
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

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const raw = window.localStorage.getItem('ht-learner-profile')
      if (raw) {
        const parsed = JSON.parse(raw) as { name?: string; avatar?: string }
        if (parsed?.name?.trim()) setProfileName(parsed.name.trim())
        if (parsed?.avatar?.trim()) setProfileAvatar(parsed.avatar)
      }
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    const handleOutside = (e: MouseEvent | TouchEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('[data-dropdown]')) {
        setProfileOpen(false)
        setRoleSwitcherOpen(false)
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

  const handleRoleSwitch = (role: UserRole, href: string) => {
    if (!visibleRoleOptions.some((r) => r.id === role)) {
      toast({
        variant: 'destructive',
        title: 'Access denied',
        description: 'Your account does not have access to that portal.',
      })
      setRoleSwitcherOpen(false)
      return
    }
    if (role === currentRole) {
      setRoleSwitcherOpen(false)
      return
    }
    setCurrentRole(role)
    try {
      localStorage.setItem('ht-current-role', role)
      const activeView = role === 'admin' ? 'administrator' : role === 'mentor' ? 'instructor' : 'learner'
      localStorage.setItem('ht-active-view', activeView)
    } catch {
      // ignore
    }
    setRoleSwitcherOpen(false)
    router.push(href)
  }

  const currentRoleOption =
    visibleRoleOptions.find((r) => r.id === currentRole) || ROLE_OPTIONS[2]

  return (
    <header className="sticky top-0 z-30 flex h-14 sm:h-16 flex-shrink-0 items-center gap-2 sm:gap-4 border-b border-slate-200 bg-white px-3 sm:px-4 md:px-6">
      {/* Mobile menu button */}
      {onMenuClick && (
        <button
          type="button"
          onClick={onMenuClick}
          className="rounded-lg p-2.5 text-slate-600 hover:bg-slate-100 transition-colors touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center md:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      )}
      {/* Left: title */}
      <div className="min-w-0 hidden sm:block">
        <h1 className="text-lg font-bold text-slate-900 truncate">
          My Training
        </h1>
        <p className="text-xs text-slate-500 truncate">
          Track your progress...
        </p>
      </div>

      {/* Center: search bar (quick nav to pages) */}
      <div className="flex-1 min-w-0 max-w-xl mx-2 md:mx-4">
        <div className="hidden md:block relative w-full max-w-md" data-dropdown>
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-md px-2 py-1.5">
            <Search className="h-4 w-4 text-slate-400 flex-shrink-0" />
            <Input
              placeholder="Search courses, resources, discussions..."
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
      </div>

      {/* Right: Notifications + Role + Profile */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="relative" data-dropdown>
          <NotificationBell className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 transition-colors touch-manipulation" iconSize="md" />
        </div>

        {/* Role Switcher – avoid accidental switch on tap */}
        <div className="relative flex-shrink-0" data-dropdown>
          <button
            type="button"
            className="flex items-center gap-2 rounded-full border border-slate-200 bg-white min-h-[44px] py-2.5 px-3 md:px-4 hover:bg-slate-50 transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-1 touch-manipulation"
            onClick={(e) => {
              e.stopPropagation()
              setRoleSwitcherOpen((o) => !o)
              setProfileOpen(false)
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

          {roleSwitcherOpen && (
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
                      isActive ? 'bg-teal-500/5 cursor-default' : 'hover:bg-slate-50'
                    }`}
                    onClick={(e) => {
                      e.stopPropagation()
                      if (isActive) {
                        setRoleSwitcherOpen(false)
                        return
                      }
                      handleRoleSwitch(role.id, role.href)
                    }}
                  >
                    <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-teal-600' : 'text-slate-600'}`} />
                    <div className="flex-1 min-w-0 text-left">
                      <div className={`font-medium ${isActive ? 'text-teal-600' : 'text-slate-900'}`}>
                        {role.label}
                      </div>
                      <div className="text-[10px] text-slate-500">{role.description}</div>
                    </div>
                    {isActive && (
                      <span className="h-2 w-2 rounded-full bg-teal-500 shrink-0" />
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Profile menu – avatar + name */}
        <div className="relative flex-shrink-0" data-dropdown>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2 rounded-full border-slate-200 pl-1 pr-2 md:pr-3 min-h-[44px] touch-manipulation"
            onClick={() => {
              setProfileOpen((o) => !o)
              setRoleSwitcherOpen(false)
            }}
          >
            {profileAvatar ? (
              <span className="h-6 w-6 rounded-full overflow-hidden border border-slate-200 bg-slate-100">
                <img
                  src={profileAvatar}
                  alt="Learner avatar"
                  className="h-full w-full object-cover"
                />
              </span>
            ) : (
              <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#115e59] text-xs font-semibold text-white">
                {(profileName ?? 'L').charAt(0).toUpperCase()}
              </span>
            )}
            <span className="hidden md:inline text-xs font-medium text-slate-800 truncate max-w-[90px]">
              {profileName ?? 'Learner'}
            </span>
          </Button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-xl border border-slate-200 bg-white shadow-lg text-[11px] z-30">
              <div className="px-3 py-2 border-b border-slate-100">
                <p className="font-semibold text-slate-900">
                  {profileName ?? 'Learner'}
                </p>
                <p className="text-[10px] text-slate-500">
                  Learner • Counseling LMS
                </p>
              </div>
              <button
                type="button"
                className="w-full text-left px-3 py-2 hover:bg-slate-50"
                onClick={() => {
                  router.push('/learner/dashboard')
                  setProfileOpen(false)
                }}
              >
                Dashboard
              </button>
              <button
                type="button"
                className="w-full text-left px-3 py-2 hover:bg-slate-50"
                onClick={() => {
                  router.push('/profile')
                  setProfileOpen(false)
                }}
              >
                Profile
              </button>
              <button
                type="button"
                className="w-full text-left px-3 py-2 hover:bg-slate-50"
                onClick={() => {
                  router.push('/profile')
                  setProfileOpen(false)
                }}
              >
                Account &amp; settings
              </button>
              <button
                type="button"
                className="w-full text-left px-3 py-2 hover:bg-slate-50 text-red-600"
                onClick={() => {
                  router.push('/logout')
                  setProfileOpen(false)
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
