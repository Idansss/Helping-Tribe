'use client'

import Link from 'next/link'
import { Lock, Loader2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface ActivityGateProps {
  locked: boolean
  loading: boolean
  prerequisiteName: string
  prerequisiteHref: string
  children: React.ReactNode
}

/**
 * Wraps an activity page.
 * - While checking: shows a centered spinner (avoids blank-page flash)
 * - When locked:    shows a lock card pointing to the prerequisite
 * - When unlocked:  renders children normally
 */
export function ActivityGate({ locked, loading, prerequisiteName, prerequisiteHref, children }: ActivityGateProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-400">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  if (!locked) return <>{children}</>

  return (
    <Card className="border-slate-200">
      <CardContent className="py-16 text-center">
        <div className="mx-auto mb-4 h-14 w-14 rounded-full bg-slate-100 flex items-center justify-center">
          <Lock className="h-7 w-7 text-slate-400" />
        </div>
        <h3 className="font-semibold text-slate-900 text-lg">Complete this week&apos;s earlier activity first</h3>
        <p className="text-slate-500 mt-2 max-w-sm mx-auto text-sm">
          You need to finish{' '}
          <span className="font-medium text-slate-700">{prerequisiteName}</span>{' '}
          before this activity unlocks.
        </p>
        <Button asChild className="mt-6 bg-teal-600 hover:bg-teal-700 text-white">
          <Link href={prerequisiteHref}>Go to {prerequisiteName}</Link>
        </Button>
      </CardContent>
    </Card>
  )
}
