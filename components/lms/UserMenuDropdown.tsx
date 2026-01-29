'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils/cn'
import {
  User,
  LogOut,
  Play,
  ArrowRight,
  ChevronDown,
  Mail,
} from 'lucide-react'
import Link from 'next/link'

type AppRole = 'student' | 'faculty' | 'admin'

interface UserMenuDropdownProps {
  displayName: string
  userRole: string
  currentRole?: AppRole | null
  userInitial: string
}

export function UserMenuDropdown({
  displayName,
  userRole,
  currentRole,
  userInitial,
}: UserMenuDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const pathname = usePathname()

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleRoleChange = (value: 'learner' | 'instructor' | 'administrator') => {
    setIsOpen(false)
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('ht-active-view', value)
    }
    if (value === 'learner') {
      if (!pathname.startsWith('/dashboard') && !pathname.startsWith('/')) {
        router.push('/')
      }
    } else if (value === 'instructor') {
      if (!pathname.startsWith('/mentor')) {
        router.push('/mentor')
      }
    } else if (value === 'administrator') {
      if (!pathname.startsWith('/admin') && !pathname.startsWith('/analytics')) {
        router.push('/admin')
      }
    }
  }

  const handleLogout = () => {
    setIsOpen(false)
    router.push('/logout')
  }

  const isAdmin = currentRole === 'admin'
  const isFaculty = currentRole === 'faculty'

  // Derive which option appears selected based on the current path
  const activeView: 'learner' | 'instructor' | 'administrator' =
    pathname.startsWith('/mentor')
      ? 'instructor'
      : pathname.startsWith('/admin') || pathname.startsWith('/analytics')
        ? 'administrator'
        : 'learner'

  return (
    <div className="relative" ref={dropdownRef}>
      {/* User Profile Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200',
          isOpen ? 'bg-purple-50' : 'hover:bg-gray-50'
        )}
      >
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center flex-shrink-0 shadow-sm">
          <span className="text-sm font-medium text-white">{userInitial}</span>
        </div>
        <div className="text-left hidden sm:block min-w-0">
          <p className="text-sm font-medium text-slate-900 leading-tight truncate">
            {displayName.charAt(0).toUpperCase() + displayName.slice(1).toLowerCase()}
          </p>
          <p className="text-xs text-slate-500 leading-tight mt-0.5">{userRole}</p>
        </div>
        <ChevronDown
          className={cn(
            'h-4 w-4 text-slate-400 transition-transform duration-200 flex-shrink-0',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-12 w-64 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
          {/* Switch role section */}
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-2.5">Switch role</p>
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => handleRoleChange('administrator')}
                disabled={!isAdmin}
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-all',
                  activeView === 'administrator'
                    ? 'bg-purple-50 text-purple-700 border border-purple-200'
                    : 'hover:bg-slate-50 text-slate-700',
                  !isAdmin && 'opacity-40 cursor-not-allowed'
                )}
              >
                <span
                  className={cn(
                    'h-3.5 w-3.5 rounded-full border-2 flex-shrink-0 transition-all',
                    activeView === 'administrator'
                      ? 'border-purple-600 bg-purple-600'
                      : 'border-slate-300'
                  )}
                />
                <span className="font-medium">Administrator</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleChange('instructor')}
                disabled={!(isAdmin || isFaculty)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-all',
                  activeView === 'instructor'
                    ? 'bg-purple-50 text-purple-700 border border-purple-200'
                    : 'hover:bg-slate-50 text-slate-700',
                  !(isAdmin || isFaculty) && 'opacity-40 cursor-not-allowed'
                )}
              >
                <span
                  className={cn(
                    'h-3.5 w-3.5 rounded-full border-2 flex-shrink-0 transition-all',
                    activeView === 'instructor'
                      ? 'border-purple-600 bg-purple-600'
                      : 'border-slate-300'
                  )}
                />
                <span className="font-medium">Instructor</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleChange('learner')}
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-all',
                  activeView === 'learner'
                    ? 'bg-purple-50 text-purple-700 border border-purple-200'
                    : 'hover:bg-slate-50 text-slate-700'
                )}
              >
                <span
                  className={cn(
                    'h-3.5 w-3.5 rounded-full border-2 flex-shrink-0 transition-all',
                    activeView === 'learner'
                      ? 'border-purple-600 bg-purple-600'
                      : 'border-slate-300'
                  )}
                />
                <span className="font-medium">Learner</span>
              </button>
            </div>
          </div>

          {/* Action items */}
          <div className="py-1.5">
            <Link
              href="/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <User className="h-4 w-4 text-slate-500" />
              <span className="font-medium">My profile</span>
            </Link>

            <div className="border-t border-gray-100 my-1" />

            <button
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors w-full text-left"
            >
              <ArrowRight className="h-4 w-4 text-slate-500" />
              <span className="font-medium">Go to legacy interface</span>
            </button>

            <div className="border-t border-gray-100 my-1" />

            <button
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors w-full text-left"
            >
              <Play className="h-4 w-4 text-slate-500" />
              <span className="font-medium">Watch demo</span>
            </button>

            <div className="border-t border-gray-100 my-1" />

            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left"
            >
              <LogOut className="h-4 w-4 text-red-500" />
              <span className="font-medium">Log out</span>
            </button>
          </div>
        </div>
        </>
      )}
    </div>
  )
}
