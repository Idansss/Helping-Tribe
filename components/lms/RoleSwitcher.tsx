'use client'

import { useRouter } from 'next/navigation'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils/cn'

type AppRole = 'student' | 'faculty' | 'admin'

interface RoleSwitcherProps {
  currentRole?: AppRole | null
}

export function RoleSwitcher({ currentRole }: RoleSwitcherProps) {
  const router = useRouter()
  const pathname = usePathname()

  // We treat the "view" as independent from the stored DB role.
  // Admins and faculty can still view the learner dashboard if they prefer.
  const handleChange = (value: 'learner' | 'instructor' | 'administrator') => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('ht-active-view', value)
    }
    if (value === 'learner') {
      // Student dashboard
      if (!pathname.startsWith('/dashboard')) {
        router.push('/dashboard')
      }
    } else if (value === 'instructor') {
      // Mentor portal
      if (!pathname.startsWith('/mentor')) {
        router.push('/mentor')
      }
    } else if (value === 'administrator') {
      // For now reuse analytics page as "admin home"
      if (!pathname.startsWith('/analytics')) {
        router.push('/analytics')
      }
    }
  }

  const isAdmin = currentRole === 'admin'
  const isFaculty = currentRole === 'faculty'

  // Derive which option appears selected based on the current path
  const activeView: 'learner' | 'instructor' | 'administrator' =
    pathname.startsWith('/mentor')
      ? 'instructor'
      : pathname.startsWith('/analytics')
        ? 'administrator'
        : 'learner'

  return (
    <div className="text-xs text-gray-700 space-y-2">
      <p className="font-semibold tracking-wide text-gray-900">Switch role</p>
      <div className="space-y-1">
        <button
          type="button"
          onClick={() => handleChange('administrator')}
          disabled={!isAdmin}
          className={cn(
            'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors',
            activeView === 'administrator'
              ? 'bg-purple-100 text-purple-700'
              : 'hover:bg-gray-100 text-gray-700',
            !isAdmin && 'opacity-40 cursor-not-allowed'
          )}
        >
          <span
            className={cn(
              'h-3 w-3 rounded-full border',
              activeView === 'administrator'
                ? 'border-purple-700 bg-purple-700'
                : 'border-gray-400'
            )}
          />
          <span className="font-medium">Administrator</span>
        </button>

        <button
          type="button"
          onClick={() => handleChange('instructor')}
          disabled={!(isAdmin || isFaculty)}
          className={cn(
            'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors',
            activeView === 'instructor'
              ? 'bg-purple-100 text-purple-700'
              : 'hover:bg-gray-100 text-gray-700',
            !(isAdmin || isFaculty) && 'opacity-40 cursor-not-allowed'
          )}
        >
          <span
            className={cn(
              'h-3 w-3 rounded-full border',
              activeView === 'instructor'
                ? 'border-purple-700 bg-purple-700'
                : 'border-gray-400'
            )}
          />
          <span className="font-medium">Instructor</span>
        </button>

        <button
          type="button"
          onClick={() => handleChange('learner')}
          className={cn(
            'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors',
            activeView === 'learner'
              ? 'bg-purple-100 text-purple-700'
              : 'hover:bg-gray-100 text-gray-700'
          )}
        >
          <span
            className={cn(
              'h-3 w-3 rounded-full border',
              activeView === 'learner'
                ? 'border-purple-700 bg-purple-700'
                : 'border-gray-400'
            )}
          />
          <span className="font-medium">Learner</span>
        </button>
      </div>
    </div>
  )
}

