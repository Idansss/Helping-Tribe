'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Menu, ChevronDown } from 'lucide-react'
import { Input } from '@/components/ui/input'

export function Header() {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  const handleRoleClick = (role: 'administrator' | 'instructor' | 'learner') => {
    setOpen(false)
    if (role === 'administrator') {
      router.push('/analytics')
    } else if (role === 'instructor') {
      router.push('/mentor')
    } else {
      router.push('/dashboard')
    }
  }

  const handleProfile = () => {
    setOpen(false)
    router.push('/profile')
  }

  const handleLogout = () => {
    setOpen(false)
    router.push('/logout')
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6">
      {/* LEFT: Logo & Menu Toggle */}
      <div className="flex items-center gap-4 w-64">
        <button
          className="p-2 hover:bg-gray-100 rounded-full lg:hidden"
          aria-label="Toggle navigation"
        >
          <Menu className="h-6 w-6 text-gray-600" />
        </button>
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg flex items-center justify-center text-white font-semibold text-sm bg-gradient-to-br from-purple-600 to-purple-700 shadow-sm">
            HT
          </div>
          <span className="text-base font-semibold text-purple-700 tracking-tight hidden md:block">
            Helping Tribe
          </span>
        </div>
      </div>

      {/* CENTER: Search Bar */}
      <div className="flex-1 max-w-2xl px-4 md:px-8 hidden md:block">
        <div className="relative">
          <Input
            type="text"
            placeholder="Search"
            className="w-full bg-gray-100 border-transparent focus:bg-white focus:border-gray-300 italic pl-4 pr-10 h-10 rounded-md text-sm"
          />
          <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
      </div>

      {/* RIGHT: User Profile & Dropdown */}
      <div className="relative flex items-center gap-4">
        <button
          onClick={() => setOpen((prev) => !prev)}
          className="flex items-center gap-3 hover:bg-gray-50 p-2 rounded-lg transition-colors outline-none"
        >
          <div className="text-right hidden md:block">
            <p className="text-sm font-semibold text-gray-900 leading-none">
              A. Ibrahim
            </p>
            <p className="text-xs text-gray-500 mt-1">Administrator</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-[#4c1d95] text-white flex items-center justify-center font-medium">
            A
          </div>
          <ChevronDown className="h-4 w-4 text-gray-500" />
        </button>

        {open && (
          <div className="absolute right-0 top-11 w-56 bg-white border rounded-md shadow-lg py-1 text-sm">
            <div className="px-3 py-2 text-xs font-semibold text-gray-500">
              Switch role
            </div>
            <button
              onClick={() => handleRoleClick('administrator')}
              className="w-full text-left px-3 py-2 hover:bg-gray-100 font-medium"
            >
              Administrator
            </button>
            <button
              onClick={() => handleRoleClick('instructor')}
              className="w-full text-left px-3 py-2 hover:bg-gray-100"
            >
              Instructor
            </button>
            <button
              onClick={() => handleRoleClick('learner')}
              className="w-full text-left px-3 py-2 hover:bg-gray-100"
            >
              Learner
            </button>
            <div className="my-1 border-t" />
            <button
              onClick={handleProfile}
              className="w-full text-left px-3 py-2 hover:bg-gray-100"
            >
              Profile
            </button>
            <button
              onClick={handleLogout}
              className="w-full text-left px-3 py-2 hover:bg-red-50 text-red-600"
            >
              Log out
            </button>
          </div>
        )}
      </div>
    </header>
  )
}

