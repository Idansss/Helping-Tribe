'use client'

import { ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  PlusCircle,
  Settings2,
  Users,
  BookOpen,
  FileBarChart2,
} from 'lucide-react'

interface QuickAction {
  label: string
  icon: ReactNode
  href: string
}

const ACTIONS: QuickAction[] = [
  {
    label: 'Add user',
    icon: <Users className="h-4 w-4" />,
    href: '/admin/users',
  },
  {
    label: 'Add course',
    icon: <BookOpen className="h-4 w-4" />,
    href: '/admin/courses',
  },
  {
    label: 'Portal settings',
    icon: <Settings2 className="h-4 w-4" />,
    href: '/admin/settings',
  },
  {
    label: 'Add group',
    icon: <PlusCircle className="h-4 w-4" />,
    href: '/admin/groups',
  },
  {
    label: 'Custom reports',
    icon: <FileBarChart2 className="h-4 w-4" />,
    href: '/admin/reports',
  },
]

export function QuickActions() {
  const router = useRouter()

  return (
    <div className="rounded-xl border bg-white/80 backdrop-blur-sm p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-slate-900">
          Quick actions
        </h2>
        <span className="text-[11px] text-slate-500">
          9-week counseling program admin
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {ACTIONS.map(action => (
          <Button
            key={action.label}
            variant="outline"
            size="sm"
            className="w-full justify-start gap-2 text-xs border-slate-200 text-slate-800 hover:bg-slate-100"
            onClick={() => router.push(action.href)}
          >
            {action.icon}
            <span className="truncate">{action.label}</span>
          </Button>
        ))}
      </div>
    </div>
  )
}

