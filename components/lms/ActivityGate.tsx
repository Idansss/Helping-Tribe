'use client'

import Link from 'next/link'
import { AlertTriangle, Lock, Loader2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface ActivityGateProps {
  locked: boolean
  loading: boolean
  degraded?: boolean
  degradedMessage?: string
  prerequisiteName: string
  prerequisiteHref: string
  children: React.ReactNode
}

export function ActivityGate({ locked, loading, degraded, degradedMessage, prerequisiteName, prerequisiteHref, children }: ActivityGateProps) {
  if (loading) {
    return <div className="flex items-center justify-center py-20 text-muted-foreground"><Loader2 className="h-6 w-6 animate-spin" aria-label="Checking access" /></div>
  }

  if (!locked) {
    return (
      <>
        {degraded ? (
          <div role="status" className="mb-4 flex items-start gap-2 rounded-xl border border-warning/35 bg-warning/10 px-3 py-2.5 text-sm text-foreground">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden="true" />
            <span>{degradedMessage}</span>
          </div>
        ) : null}
        {children}
      </>
    )
  }

  return (
    <Card>
      <CardContent className="py-16 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted"><Lock className="h-7 w-7 text-muted-foreground" aria-hidden="true" /></div>
        <h3 className="text-lg font-semibold text-foreground">Complete this week&apos;s earlier activity first</h3>
        <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
          You need to finish <span className="font-medium text-foreground">{prerequisiteName}</span> before this activity unlocks.
        </p>
        <Button asChild className="mt-6"><Link href={prerequisiteHref}>Go to {prerequisiteName}</Link></Button>
      </CardContent>
    </Card>
  )
}
