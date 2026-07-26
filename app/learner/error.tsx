'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default function LearnerError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Learner route error:', error)
  }, [error])

  return (
    <div className="mx-auto max-w-2xl p-6" role="alert">
      <Card className="shadow-md">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-950">
              <AlertCircle className="h-6 w-6 text-amber-700 dark:text-amber-300" aria-hidden="true" />
            </div>
            <div>
              <CardTitle className="text-lg">This page couldn’t load</CardTitle>
              <CardDescription>
                Something went wrong loading this page. Try again or go back to your dashboard.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {process.env.NODE_ENV === 'development' && (
            <pre className="max-h-28 overflow-auto rounded-lg bg-muted p-3 text-xs text-muted-foreground">
              {error.message}
            </pre>
          )}
          <div className="flex flex-wrap gap-2">
            <Button onClick={reset} size="sm">
              Try again
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/learner/dashboard">Dashboard</Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link href="/learner/catalog">Catalogue</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
